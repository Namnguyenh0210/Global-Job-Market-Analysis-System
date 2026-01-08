"""
FastAPI Backend - Global Job Market Analysis API
REST API server để frontend lấy dữ liệu phân tích
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
from pathlib import Path
from typing import List, Dict, Optional

# ============================================================================
# KHỞI TẠO APP
# ============================================================================
app = FastAPI(
    title="Global Job Market Analysis API",
    description="API để phân tích thị trường việc làm toàn cầu",
    version="1.0.0"
)

# Enable CORS để frontend có thể gọi API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Cho phép tất cả origins (chỉ dùng development)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# LOAD DATA
# ============================================================================
DATA_FILE = Path(__file__).parent.parent / 'data' / 'clean_jobs.csv'

def load_data():
    """Load dữ liệu từ CSV"""
    try:
        if not DATA_FILE.exists():
            print(f"❌ Không tìm thấy file: {DATA_FILE}")
            print("⚠️  Vui lòng chạy transform_jobs.py trước!")
            return None
        
        df = pd.read_csv(DATA_FILE)
        print(f"✅ Đã load {len(df)} jobs từ {DATA_FILE.name}")
        return df
    except Exception as e:
        print(f"❌ Lỗi khi load data: {e}")
        return None

# Load data khi khởi động
df_jobs = load_data()


# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def check_data_loaded():
    """Kiểm tra data đã được load chưa"""
    if df_jobs is None:
        raise HTTPException(
            status_code=503,
            detail="Dữ liệu chưa sẵn sàng. Vui lòng chạy transform_jobs.py trước!"
        )


# ============================================================================
# API ENDPOINTS
# ============================================================================

@app.get("/")
def root():
    """Root endpoint"""
    return {
        "message": "Global Job Market Analysis API",
        "version": "1.0.0",
        "status": "running" if df_jobs is not None else "data not loaded",
        "endpoints": [
            "/api/kpi",
            "/api/jobs",
            "/api/jobs-by-country",
            "/api/jobs-by-region",
            "/api/salary-by-role",
            "/api/top-skills"
        ]
    }


@app.get("/api/kpi")
def get_kpi():
    """
    Endpoint: KPI tổng quan
    Returns: Các chỉ số chính (total jobs, countries, companies, salary %)
    """
    check_data_loaded()
    
    total_jobs = len(df_jobs)
    total_countries = df_jobs['country'].nunique()
    total_companies = df_jobs['company'].nunique()
    
    # Jobs có salary
    jobs_with_salary = df_jobs['has_salary'].sum() if 'has_salary' in df_jobs.columns else 0
    salary_percentage = (jobs_with_salary / total_jobs * 100) if total_jobs > 0 else 0
    
    return {
        "total_jobs": int(total_jobs),
        "total_countries": int(total_countries),
        "total_companies": int(total_companies),
        "jobs_with_salary": int(jobs_with_salary),
        "salary_percentage": round(salary_percentage, 1)
    }


@app.get("/api/jobs")
def get_jobs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    country: Optional[str] = None,
    keyword: Optional[str] = None
):
    """
    Endpoint: Danh sách jobs
    Params:
        - skip: Số jobs bỏ qua (pagination)
        - limit: Số jobs trả về tối đa
        - country: Filter theo quốc gia (optional)
        - keyword: Tìm kiếm trong job_title (optional)
    """
    check_data_loaded()
    
    df = df_jobs.copy()
    
    # Filter theo country
    if country:
        df = df[df['country'].str.lower() == country.lower()]
    
    # Filter theo keyword
    if keyword:
        df = df[df['job_title'].str.contains(keyword, case=False, na=False)]
    
    total = len(df)
    
    # Pagination
    df = df.iloc[skip:skip+limit]
    
    # Convert to dict
    jobs = df.to_dict('records')
    
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "count": len(jobs),
        "jobs": jobs
    }


@app.get("/api/jobs-by-country")
def get_jobs_by_country():
    """
    Endpoint: Số lượng jobs theo quốc gia
    Returns: List {country, count} để vẽ chart
    """
    check_data_loaded()
    
    # Group by country
    country_counts = df_jobs['country'].value_counts().reset_index()
    country_counts.columns = ['country', 'count']
    
    # Convert to list of dicts
    result = country_counts.to_dict('records')
    
    return {
        "data": result
    }


@app.get("/api/jobs-by-region")
def get_jobs_by_region():
    """
    Endpoint: Số lượng jobs theo khu vực
    Returns: List {region, count} để vẽ chart
    """
    check_data_loaded()
    
    if 'region' not in df_jobs.columns:
        return {"data": []}
    
    # Group by region
    region_counts = df_jobs['region'].value_counts().reset_index()
    region_counts.columns = ['region', 'count']
    
    # Convert to list of dicts
    result = region_counts.to_dict('records')
    
    return {
        "data": result
    }


@app.get("/api/salary-by-role")
def get_salary_by_role():
    """
    Endpoint: Lương trung bình theo nghề nghiệp
    Returns: List {role, avg_salary_min, avg_salary_max}
    """
    check_data_loaded()
    
    # Lọc jobs có salary
    df_with_salary = df_jobs[df_jobs['salary_min'].notna() | df_jobs['salary_max'].notna()].copy()
    
    if len(df_with_salary) == 0:
        return {"data": []}
    
    # Extract role từ job_title (đơn giản hóa: lấy 2 từ đầu)
    df_with_salary['role'] = df_with_salary['job_title'].str.split().str[:2].str.join(' ')
    
    # Group by role, tính mean salary
    role_salary = df_with_salary.groupby('role').agg({
        'salary_min': 'mean',
        'salary_max': 'mean',
        'job_title': 'count'
    }).reset_index()
    
    role_salary.columns = ['role', 'avg_salary_min', 'avg_salary_max', 'count']
    
    # Chỉ lấy roles có >= 3 jobs
    role_salary = role_salary[role_salary['count'] >= 3]
    
    # Sort by count giảm dần, lấy top 10
    role_salary = role_salary.sort_values('count', ascending=False).head(10)
    
    # Convert to list
    result = role_salary.to_dict('records')
    
    return {
        "data": result
    }


@app.get("/api/top-skills")
def get_top_skills():
    """
    Endpoint: Top kỹ năng được yêu cầu nhiều nhất
    Returns: List {skill, count, percentage}
    """
    check_data_loaded()
    
    skills = ['Python', 'SQL', 'AWS', 'Excel', 'English']
    result = []
    
    total_jobs = len(df_jobs)
    
    for skill in skills:
        col_name = f'skill_{skill.lower()}'
        if col_name in df_jobs.columns:
            count = df_jobs[col_name].sum()
            percentage = (count / total_jobs * 100) if total_jobs > 0 else 0
            
            result.append({
                'skill': skill,
                'count': int(count),
                'percentage': round(percentage, 1)
            })
    
    # Sort by count giảm dần
    result = sorted(result, key=lambda x: x['count'], reverse=True)
    
    return {
        "data": result
    }


# ============================================================================
# STARTUP & SHUTDOWN
# ============================================================================

@app.on_event("startup")
def startup_event():
    """Event khi app khởi động"""
    print("\n" + "="*70)
    print("🚀 FastAPI Server Started!")
    print("="*70)
    if df_jobs is not None:
        print(f"✅ Data loaded: {len(df_jobs)} jobs")
    else:
        print("⚠️  Data not loaded! Run transform_jobs.py first.")
    print("\n📚 API Documentation: http://localhost:8000/docs")
    print("="*70 + "\n")


@app.on_event("shutdown")
def shutdown_event():
    """Event khi app shutdown"""
    print("\n👋 FastAPI Server Stopped\n")


# ============================================================================
# MAIN (cho việc chạy trực tiếp)
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
