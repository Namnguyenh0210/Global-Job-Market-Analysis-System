"""
ETL Script - Extract Jobs Data from Adzuna API
Thu thập dữ liệu việc làm từ 7 quốc gia và 3 nghề nghiệp
"""

import requests
import json
import time
import os
from pathlib import Path
from dotenv import load_dotenv

# ============================================================================
# LOAD ENVIRONMENT VARIABLES
# ============================================================================
# Load API keys từ file .env
load_dotenv()

# ============================================================================
# CẤU HÌNH API
# ============================================================================
# Đọc API keys từ environment variables
ADZUNA_APP_ID = os.getenv('ADZUNA_APP_ID')
ADZUNA_APP_KEY = os.getenv('ADZUNA_APP_KEY')

# ============================================================================
# CẤU HÌNH THU THẬP DỮ LIỆU
# ============================================================================
# Danh sách quốc gia (country code)
COUNTRIES = {
    'sg': 'Singapore',
    'us': 'United States',
    'gb': 'United Kingdom',
    'de': 'Germany',
    'in': 'India',
    'it': 'Italy',
    'nl': 'Netherlands',
    'nz': 'New Zealand'
}

# Danh sách nghề nghiệp
JOB_KEYWORDS = [
    'Data Analyst',
    'Data Engineer',
    'Software Engineer'
]

# Số kết quả mỗi request
RESULTS_PER_PAGE = 50
MAX_PAGES = 2  # Tối đa 2 trang (100 jobs) mỗi keyword

# Output directory
OUTPUT_DIR = Path(__file__).parent.parent / 'data' / 'raw_jobs'


# ============================================================================
# HÀM CHÍNH
# ============================================================================

def create_output_directory():
    """Tạo thư mục output nếu chưa tồn tại"""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    print(f"✅ Output directory sẵn sàng: {OUTPUT_DIR}")


def fetch_jobs_for_country_keyword(country_code, keyword, page=1):
    """
    Gọi Adzuna API để lấy jobs cho quốc gia và keyword cụ thể
    
    Args:
        country_code: Mã quốc gia (vn, sg, us...)
        keyword: Từ khóa nghề nghiệp
        page: Số trang (bắt đầu từ 1)
    
    Returns:
        dict: Response từ API hoặc None nếu lỗi
    """
    # Build API URL
    base_url = f"https://api.adzuna.com/v1/api/jobs/{country_code}/search/{page}"
    
    params = {
        'app_id': ADZUNA_APP_ID,
        'app_key': ADZUNA_APP_KEY,
        'what': keyword,
        'results_per_page': RESULTS_PER_PAGE,
        'content-type': 'application/json'
    }
    
    try:
        print(f"   📡 Đang gọi API: {country_code} - {keyword} (trang {page})")
        response = requests.get(base_url, params=params, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            count = data.get('count', 0)
            results = len(data.get('results', []))
            print(f"   ✅ Thành công! Tìm thấy {results} jobs (tổng: {count})")
            return data
        else:
            print(f"   ❌ Lỗi {response.status_code}: {response.text[:100]}")
            return None
            
    except Exception as e:
        print(f"   ❌ Exception: {str(e)}")
        return None


def extract_jobs_for_country(country_code, country_name):
    """
    Thu thập tất cả jobs cho một quốc gia (tất cả keywords)
    
    Args:
        country_code: Mã quốc gia
        country_name: Tên quốc gia
    """
    print(f"\n{'='*70}")
    print(f"🌍 Quốc gia: {country_name} ({country_code.upper()})")
    print(f"{'='*70}")
    
    all_jobs = []
    
    for keyword in JOB_KEYWORDS:
        print(f"\n🔍 Keyword: '{keyword}'")
        
        for page in range(1, MAX_PAGES + 1):
            # Gọi API
            data = fetch_jobs_for_country_keyword(country_code, keyword, page)
            
            if data and 'results' in data:
                jobs = data['results']
                # Tag mỗi job với category (keyword)
                for job in jobs:
                    job['_category'] = keyword
                all_jobs.extend(jobs)
                
                # Nếu không còn jobs, dừng pagination
                if len(jobs) == 0:
                    print(f"   ℹ️  Không còn jobs, dừng pagination")
                    break
            else:
                print(f"   ⚠️  API call thất bại, skip trang này")
                break
            
            # Sleep để tránh rate limit (chỉ sleep nếu chưa phải page cuối)
            if page < MAX_PAGES:
                time.sleep(2)
        
        # Sleep giữa các keywords
        time.sleep(2)
    
    # Lưu vào file JSON
    output_file = OUTPUT_DIR / f"{country_code}.json"
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump({
            'country_code': country_code,
            'country_name': country_name,
            'total_jobs': len(all_jobs),
            'keywords': JOB_KEYWORDS,
            'jobs': all_jobs
        }, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Đã lưu {len(all_jobs)} jobs vào: {output_file.name}")


def main():
    """Hàm main - Thu thập dữ liệu cho tất cả quốc gia"""
    print("\n" + "="*70)
    print("🚀 BẮT ĐẦU THU THẬP DỮ LIỆU TỪ ADZUNA API")
    print("="*70)
    
    # Kiểm tra API keys
    if not ADZUNA_APP_ID or not ADZUNA_APP_KEY:
        print("\n❌ LỖI: Chưa cấu hình API keys!")
        print("\n📝 HƯỚNG DẪN:")
        print("1. Copy file .env.example thành .env:")
        print("   cp .env.example .env")
        print("\n2. Mở file .env và điền API keys:")
        print("   ADZUNA_APP_ID=your_actual_app_id")
        print("   ADZUNA_APP_KEY=your_actual_app_key")
        print("\n3. Đăng ký API keys miễn phí tại: https://developer.adzuna.com/")
        return
    
    # Tạo thư mục output
    create_output_directory()
    
    # Thu thập dữ liệu từng quốc gia
    for country_code, country_name in COUNTRIES.items():
        extract_jobs_for_country(country_code, country_name)
        
        # Sleep giữa các quốc gia
        print("\n⏸️  Sleep 3 giây trước khi chuyển quốc gia...\n")
        time.sleep(3)
    
    print("\n" + "="*70)
    print("✅ HOÀN THÀNH THU THẬP DỮ LIỆU!")
    print("="*70)
    print(f"📁 Dữ liệu được lưu tại: {OUTPUT_DIR}")
    print(f"📊 Tổng số file: {len(COUNTRIES)}")
    print("\n🎯 Bước tiếp theo: Chạy transform_jobs.py để xử lý dữ liệu")


if __name__ == "__main__":
    main()
