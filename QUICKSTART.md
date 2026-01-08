# 🚀 QUICK START GUIDE

Hướng dẫn nhanh chạy dự án Global Job Market Analysis

---

## 📋 Các Scripts có sẵn

### 1. `./run_all.sh` - Chạy toàn bộ (ETL + Backend)
**Khi nào dùng:** Lần đầu chạy hoặc muốn cập nhật dữ liệu mới

```bash
./run_all.sh
```

**Làm gì:**
- ✅ Extract: Thu thập dữ liệu từ Adzuna API
- ✅ Transform: Xử lý và phân tích dữ liệu
- ✅ Start Backend API tại http://localhost:8000

---

### 2. `./start_backend.sh` - Chỉ chạy Backend
**Khi nào dùng:** Đã có dữ liệu, chỉ cần start API server

```bash
./start_backend.sh
```

**Làm gì:**
- ✅ Kiểm tra file clean_jobs.csv có tồn tại
- ✅ Start Backend API tại http://localhost:8000

---

## 🌐 Frontend

**Cách 1: VS Code Live Server (Recommended)**
1. Cài extension "Live Server" trong VS Code
2. Right-click `frontend/index.html`
3. Chọn "Open with Live Server"
4. Browser tự động mở http://127.0.0.1:5500

**Cách 2: Mở trực tiếp**
```bash
open frontend/index.html
```

---

## ⚡ Workflow Thông thường

**Lần đầu tiên:**
```bash
# 1. Cập nhật API keys vào backend/etl/extract_jobs.py
# 2. Chạy full pipeline
./run_all.sh

# 3. Mở frontend/index.html bằng Live Server
```

**Các lần sau:**
```bash
# Terminal 1: Backend
./start_backend.sh

# Terminal 2 (hoặc VS Code): Frontend
# Open with Live Server
```

---

## 🔧 Troubleshooting

**Backend không chạy:**
```bash
cd backend
pip install -r requirements.txt
```

**Data not found:**
```bash
./run_all.sh  # Chạy lại full pipeline
```

**CORS error:**
- Dùng Live Server thay vì mở file trực tiếp

---

## 📁 URLs

- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs
- Frontend: http://127.0.0.1:5500 (nếu dùng Live Server)

---

Vui lòng xem `README.md` để biết chi tiết đầy đủ!
