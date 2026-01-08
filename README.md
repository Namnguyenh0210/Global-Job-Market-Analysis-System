# 🌍 Global Job Market Analysis System

> Hệ thống phân tích thị trường việc làm toàn cầu với dữ liệu realtime từ Adzuna API

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green.svg)](https://fastapi.tiangolo.com/)
[![HTML/CSS/JS](https://img.shields.io/badge/Frontend-HTML%2FCSS%2FJS-orange.svg)]()

---

## 📖 Giới thiệu

Dự án phân tích xu hướng thị trường việc làm toàn cầu, thu thập và phân tích dữ liệu từ **7 quốc gia** (Việt Nam, Singapore, Thailand, Indonesia, Mỹ, Anh, Đức) và **3 nghề nghiệp IT** (Data Analyst, Data Engineer, Software Engineer).

### ✨ Tính năng nổi bật

- 🎨 **Multi-page Web Application** với 5 trang chuyên nghiệp
- 📊 **Dashboard trực quan** với KPI cards và interactive charts
- 🔍 **Jobs Explorer** với advanced filters và pagination
- 🌏 **Country Analysis** so sánh thị trường giữa các quốc gia
- 🎯 **Skills Analysis** phân tích top kỹ năng được yêu cầu
- 🌙 **Dark Mode** với glassmorphism design
- 📱 **Responsive** - hoạt động mượt mà trên mọi thiết bị

---

## 🏗️ Kiến trúc

```
Adzuna API → Python (Extract) → Raw JSON
                ↓
         Python (Transform) → Clean CSV/Excel
                ↓
           FastAPI Backend → 6 REST APIs
                ↓
      HTML/CSS/JS Frontend → 5 Pages Dashboard
```

---

## 📁 Cấu trúc Thư mục

```
global-job-analysis/
│
├── backend/
│   ├── etl/
│   │   ├── extract_jobs.py      # Thu thập dữ liệu từ API
│   │   └── transform_jobs.py    # Xử lý & phân tích dữ liệu
│   ├── data/
│   │   ├── raw_jobs/            # Raw JSON data
│   │   ├── clean_jobs.csv       # Clean dataset
│   │   └── clean_jobs.xlsx      # Excel export
│   ├── api/
│   │   └── main.py              # FastAPI server
│   └── requirements.txt
│
├── frontend/
│   ├── index.html               # 🏠 Home/Landing page
│   ├── pages/
│   │   ├── dashboard.html       # 📊 Dashboard overview
│   │   ├── jobs.html            # 💼 Jobs explorer
│   │   ├── countries.html       # 🌍 Country analysis
│   │   └── skills.html          # 🎯 Skills trends
│   ├── css/                     # Styles
│   └── js/                      # JavaScript
│
└── README.md
```

---

## 🚀 Hướng dẫn Cài đặt & Chạy

### 📋 Yêu cầu hệ thống

- Python 3.8+
- pip
- Browser hiện đại (Chrome, Firefox, Safari)

### 1️⃣ Đăng ký Adzuna API Keys

1. Truy cập: https://developer.adzuna.com/
2. Đăng ký tài khoản miễn phí
3. Lấy **APP_ID** và **APP_KEY**

### 2️⃣ Cài đặt Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 3️⃣ Cấu hình API Keys

**Cách 1: Sử dụng file .env (Khuyến nghị)**

```bash
# Sao chép file mẫu
cp .env.example .env

# Mở file .env và điền API keys của bạn
# ADZUNA_APP_ID=your_app_id_here
# ADZUNA_APP_KEY=your_app_key_here
```

**Cách 2: Chỉnh sửa trực tiếp trong extract_jobs.py**

Mở file `backend/etl/extract_jobs.py` và cập nhật:

```python
ADZUNA_APP_ID = "your_app_id_here"      # Thay bằng APP_ID của bạn
ADZUNA_APP_KEY = "your_app_key_here"    # Thay bằng APP_KEY của bạn
```

> **💡 Lưu ý:** Sử dụng file `.env` để bảo mật API keys tốt hơn và tránh commit keys lên Git


### 4️⃣ Chạy ETL Pipeline

**Bước 1: Extract (Thu thập dữ liệu)**

```bash
cd backend/etl
python extract_jobs.py
```

⏱️ Thời gian: ~5-10 phút (21 API calls với rate limiting)

**Bước 2: Transform (Xử lý dữ liệu)**

```bash
python transform_jobs.py
```

✅ Output: `backend/data/clean_jobs.csv` và `clean_jobs.xlsx`

### 5️⃣ Khởi động Backend API

```bash
cd backend
uvicorn api.main:app --reload
```

🔗 API sẽ chạy tại: **http://localhost:8000**

📚 API Docs: **http://localhost:8000/docs**

### 6️⃣ Mở Frontend

Mở file `frontend/index.html` bằng:

- **VS Code Live Server** (recommended)
- Hoặc mở trực tiếp trong browser

🎉 **Hoàn thành!** Bắt đầu khám phá dashboard

---

## 🌐 API Endpoints

| Endpoint | Mục đích |
|----------|----------|
| `GET /api/kpi` | KPI tổng quan (total jobs, countries, companies, salary %) |
| `GET /api/jobs` | Danh sách jobs (có pagination & filters) |
| `GET /api/jobs-by-country` | Distribution theo quốc gia |
| `GET /api/jobs-by-region` | Distribution theo khu vực |
| `GET /api/salary-by-role` | Lương trung bình theo nghề |
| `GET /api/top-skills` | Top 5 kỹ năng phổ biến |

---

## 🎨 Tech Stack

### Backend
- **Python 3.8+**
- **FastAPI** - Modern REST API framework
- **Pandas** - Data processing
- **Requests** - HTTP client
- **OpenPyXL** - Excel export

### Frontend
- **HTML5**
- **CSS3** (Custom design system, no frameworks)
- **Vanilla JavaScript**
- **Chart.js** - Data visualization

### Data Source
- **Adzuna Job Search API** (Official)

---

## 📊 Screenshots

### 🏠 Home Page
Landing page với hero section, preview statistics và features showcase

### 📊 Dashboard
KPI cards + Region bar chart + Country doughnut chart

### 💼 Jobs Explorer
Table với filters, pagination và job details modal

### 🌍 Country Analysis
Country cards với flags và comparison chart

### 🎯 Skills & Trends
Horizontal bar chart và skills insights

---

## 🛠️ Troubleshooting

### ❌ Lỗi: "Data not loaded"

**Nguyên nhân:** Chưa chạy `transform_jobs.py`

**Giải pháp:**
```bash
cd backend/etl
python transform_jobs.py
```

### ❌ Lỗi: CORS trong browser console

**Nguyên nhân:** Backend chưa chạy hoặc URL sai

**Giải pháp:**
- Kiểm tra backend đang chạy tại `localhost:8000`
- Kiểm tra `API_BASE_URL` trong `frontend/js/utils.js`

### ❌ Lỗi: "API Error: 401" khi extract

**Nguyên nhân:** API keys không đúng

**Giải pháp:**
- Kiểm tra lại APP_ID và APP_KEY
- Đảm bảo đã đăng ký thành công trên adzuna.com

### ❌ Charts không hiển thị

**Nguyên nhân:** Chart.js CDN chưa load

**Giải pháp:**
- Kiểm tra internet connection
- Mở Developer Tools > Console để xem lỗi

---

## 📝 Portfolio Highlights

Dự án này phù hợp cho:

✅ **Sinh viên CNTT** - Đồ án tốt nghiệp, đồ án môn học

✅ **Data Analyst/Engineer** - Portfolio project thực tế

✅ **Web Developer** - Showcase full-stack skills

### 💡 Điểm mạnh khi nộp CV:

- ✨ **Realtime data** từ API chính thức (không crawl/scrape)
- 📊 **End-to-end pipeline**: ETL → API → Dashboard
- 🎨 **Professional UI**: Dark mode, glassmorphism, responsive
- 🌍 **Global scope**: 7 quốc gia, 3 regions
- 📈 **Data insights**: KPIs, charts, skills analysis

---

## 👨‍💻 Tác giả

Dự án được xây dựng theo kịch bản **Global Job Market Analysis System** với hướng dẫn chi tiết từ A-Z.

---

## 📜 License

Dự án sử dụng dữ liệu từ **Adzuna API** - Tuân thủ [Adzuna Terms of Use](https://www.adzuna.com/terms.html)

---

## 🙏 Acknowledgments

- **Adzuna** - Cung cấp job data API miễn phí
- **Chart.js** - Library visualization mạnh mẽ
- **FastAPI** - Modern Python web framework

---

**⭐ Nếu dự án này hữu ích, hãy star repo và chia sẻ với bạn bè! ⭐**
