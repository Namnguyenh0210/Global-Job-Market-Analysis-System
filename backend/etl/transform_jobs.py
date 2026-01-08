"""
ETL Script - Transform & Clean Jobs Data
Xử lý dữ liệu từ raw JSON thành dataset sạch để phân tích
"""

import json
import pandas as pd
from pathlib import Path
import re
from datetime import datetime

# ============================================================================
# CẤU HÌNH
# ============================================================================
RAW_DATA_DIR = Path(__file__).parent.parent / 'data' / 'raw_jobs'
OUTPUT_DIR = Path(__file__).parent.parent / 'data'

# Mapping quốc gia -> khu vực
COUNTRY_TO_REGION = {
    'sg': 'Southeast Asia',
    'us': 'North America',
    'gb': 'Europe',
    'de': 'Europe',
    'in': 'Asia',
    'it': 'Europe',
    'nl': 'Europe',
    'nz': 'Oceania'
}

# Danh sách kỹ năng cần phân tích
SKILLS_TO_TRACK = ['Python', 'SQL', 'AWS', 'Excel', 'English']


# ============================================================================
# HÀM XỬ LÝ DỮ LIỆU
# ============================================================================

def load_raw_json_files():
    """Đọc tất cả file JSON từ thư mục raw_jobs"""
    print("\n📂 Đang đọc raw JSON files...")
    
    all_jobs = []
    json_files = list(RAW_DATA_DIR.glob('*.json'))
    
    if not json_files:
        print(f"❌ Không tìm thấy file JSON nào trong {RAW_DATA_DIR}")
        print("⚠️  Vui lòng chạy extract_jobs.py trước!")
        return []
    
    for json_file in json_files:
        print(f"   📄 Đọc: {json_file.name}")
        with open(json_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            jobs = data.get('jobs', [])
            country_code = data.get('country_code', '')
            
            # Thêm country_code vào mỗi job
            for job in jobs:
                job['_country_code'] = country_code
            
            all_jobs.extend(jobs)
    
    print(f"✅ Đã load {len(all_jobs)} jobs từ {len(json_files)} files\n")
    return all_jobs


def extract_fields(job):
    """
    Trích xuất các trường cần thiết từ raw job data
    
    Args:
        job: Dict chứa thông tin job từ API
        
    Returns:
        Dict với các trường đã chuẩn hóa
    """
    # Trích xuất salary info
    salary_min = job.get('salary_min')
    salary_max = job.get('salary_max')
    
    # Location
    location = job.get('location', {})
    city = location.get('display_name', '') if isinstance(location, dict) else str(location)
    
    # Company
    company = job.get('company', {})
    company_name = company.get('display_name', 'Unknown') if isinstance(company, dict) else str(company)
    
    return {
        'job_title': job.get('title', ''),
        'company': company_name,
        'country': job.get('_country_code', '').upper(),
        'city': city,
        'salary_min': salary_min,
        'salary_max': salary_max,
        'salary_currency': 'USD',  # Adzuna trả về USD mặc định
        'salary_period': 'year',
        'job_description': job.get('description', ''),
        'date_posted': job.get('created', ''),
        'source': 'Adzuna'
    }


def clean_data(df):
    """
    Làm sạch dữ liệu
    
    Args:
        df: DataFrame cần làm sạch
        
    Returns:
        DataFrame đã được làm sạch
    """
    print("🧹 Đang làm sạch dữ liệu...")
    
    initial_count = len(df)
    
    # 1. Xóa duplicates (dựa trên job_title + company)
    df = df.drop_duplicates(subset=['job_title', 'company'], keep='first')
    print(f"   ✅ Xóa {initial_count - len(df)} jobs trùng lặp")
    
    # 2. Gán region dựa trên country
    df['region'] = df['country'].str.lower().map(COUNTRY_TO_REGION)
    df['region'] = df['region'].fillna('Other')
    print(f"   ✅ Đã gán region cho tất cả jobs")
    
    # 3. Xử lý missing values
    df['city'] = df['city'].fillna('Unknown')
    df['company'] = df['company'].fillna('Unknown Company')
    df['job_description'] = df['job_description'].fillna('')
    
    # Clean HTML tags từ description
    df['job_description'] = df['job_description'].apply(clean_html)
    
    # 4. Chuẩn hóa salary
    # Nếu có salary_min hoặc salary_max, đánh dấu has_salary = True
    df['has_salary'] = (df['salary_min'].notna()) | (df['salary_max'].notna())
    
    print(f"   ✅ Đã xử lý missing values\n")
    
    return df


def clean_html(text):
    """Xóa HTML tags khỏi text"""
    if not isinstance(text, str):
        return ''
    # Remove HTML tags
    clean_text = re.sub(r'<[^>]+>', '', text)
    # Remove extra whitespace
    clean_text = ' '.join(clean_text.split())
    return clean_text


def analyze_skills(df):
    """
    Phân tích kỹ năng được yêu cầu trong job descriptions
    
    Args:
        df: DataFrame chứa jobs
        
    Returns:
        DataFrame với các cột skill mới (True/False)
    """
    print("🔍 Đang phân tích kỹ năng...")
    
    for skill in SKILLS_TO_TRACK:
        # Tìm skill trong job_description (case-insensitive)
        pattern = r'\b' + re.escape(skill) + r'\b'
        df[f'skill_{skill.lower()}'] = df['job_description'].str.contains(
            pattern, case=False, regex=True, na=False
        )
        
        count = df[f'skill_{skill.lower()}'].sum()
        percentage = (count / len(df) * 100) if len(df) > 0 else 0
        print(f"   {skill}: {count} jobs ({percentage:.1f}%)")
    
    print()
    return df


def calculate_kpis(df):
    """Tính toán các KPIs"""
    print("📊 KPI Tổng quan:")
    print(f"   • Tổng số jobs: {len(df)}")
    print(f"   • Số quốc gia: {df['country'].nunique()}")
    print(f"   • Số công ty: {df['company'].nunique()}")
    
    salary_percentage = (df['has_salary'].sum() / len(df) * 100) if len(df) > 0 else 0
    print(f"   • Jobs có lương: {df['has_salary'].sum()} ({salary_percentage:.1f}%)")
    print()


def save_output(df):
    """Lưu kết quả ra CSV và Excel"""
    print("💾 Đang lưu kết quả...")
    
    # Ensure output directory exists
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # Save CSV
    csv_file = OUTPUT_DIR / 'clean_jobs.csv'
    df.to_csv(csv_file, index=False, encoding='utf-8')
    print(f"   ✅ Đã lưu CSV: {csv_file.name}")
    
    # Save Excel
    excel_file = OUTPUT_DIR / 'clean_jobs.xlsx'
    df.to_excel(excel_file, index=False, engine='openpyxl')
    print(f"   ✅ Đã lưu Excel: {excel_file.name}")
    
    print(f"\n📁 Output tại: {OUTPUT_DIR}")


def main():
    """Hàm main - Transform & Clean data"""
    print("\n" + "="*70)
    print("🚀 BẮT ĐẦU TRANSFORM & CLEAN DATA")
    print("="*70)
    
    # 1. Load raw JSON
    all_jobs = load_raw_json_files()
    
    if not all_jobs:
        print("❌ Không có dữ liệu để xử lý!")
        return
    
    # 2. Extract fields
    print("📋 Đang trích xuất các trường dữ liệu...")
    extracted_data = [extract_fields(job) for job in all_jobs]
    df = pd.DataFrame(extracted_data)
    print(f"✅ Đã trích xuất {len(df)} jobs\n")
    
    # 3. Clean data
    df = clean_data(df)
    
    # 4. Analyze skills
    df = analyze_skills(df)
    
    # 5. Calculate KPIs
    calculate_kpis(df)
    
    # 6. Save output
    save_output(df)
    
    print("\n" + "="*70)
    print("✅ HOÀN THÀNH TRANSFORM & CLEAN!")
    print("="*70)
    print("\n🎯 Bước tiếp theo: Chạy FastAPI backend")
    print("   cd backend")
    print("   uvicorn api.main:app --reload")


if __name__ == "__main__":
    main()
