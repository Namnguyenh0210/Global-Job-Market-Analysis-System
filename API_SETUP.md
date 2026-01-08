# 🔐 Cấu hình API Keys

Hướng dẫn cấu hình API keys an toàn cho dự án

---

## ⚙️ Cách Setup

### Bước 1: Copy file template

```bash
cp .env.example .env
```

### Bước 2: Đăng ký Adzuna API

1. Truy cập: https://developer.adzuna.com/
2. Click "Sign up" và tạo tài khoản
3. Verify email
4. Đăng nhập → Vào "My Account"
5. Copy **APP_ID** và **APP_KEY**

### Bước 3: Điền vào file .env

Mở file `.env` và thay thế:

```bash
ADZUNA_APP_ID=paste_your_app_id_here
ADZUNA_APP_KEY=paste_your_app_key_here
```

### Bước 4: Cài đặt dependency mới

```bash
cd backend
pip install python-dotenv
```

Hoặc:

```bash
pip install -r requirements.txt
```

---

## ✅ Xác nhận Setup thành công

Chạy thử extract:

```bash
cd backend/etl
python3 extract_jobs.py
```

Nếu thành công, bạn sẽ thấy:
```
✅ Output directory sẵn sàng
🌍 Quốc gia: Vietnam (VN)
```

Nếu lỗi:
```
❌ LỖI: Chưa cấu hình API keys!
```
→ Quay lại Bước 3 và kiểm tra file `.env`

---

## 🔒 Bảo mật

- ✅ File `.env` đã được thêm vào `.gitignore`
- ✅ API keys KHÔNG bao giờ commit lên Git
- ✅ Chia sẻ file `.env.example` thay vì `.env`
- ⚠️ KHÔNG share API keys với người khác

---

## 📝 Lưu ý

- File `.env` chỉ tồn tại trên máy local của bạn
- Mỗi người cần tạo `.env` riêng từ `.env.example`
- API keys miễn phí của Adzuna có giới hạn requests/tháng
