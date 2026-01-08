#!/bin/bash

# ============================================================================
# RUN ALL - Chạy toàn bộ dự án: ETL Pipeline + Backend API
# Chạy từ root của project
# ============================================================================

echo ""
echo "🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍"
echo "    GLOBAL JOB MARKET ANALYSIS - FULL AUTOMATION"
echo "🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍🌍"
echo ""

# Lấy thư mục root của project
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_ROOT"

# Kiểm tra Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 không được cài đặt!"
    exit 1
fi

echo "✅ Python version: $(python3 --version)"
echo "📁 Project root: $PROJECT_ROOT"
echo ""

# ============================================================================
# BƯỚC 1: EXTRACT - Thu thập dữ liệu từ Adzuna API
# ============================================================================

echo "═══════════════════════════════════════════════════════════════════════"
echo "🚀 BƯỚC 1: EXTRACT - Thu thập dữ liệu từ Adzuna API"
echo "═══════════════════════════════════════════════════════════════════════"
echo ""

cd "$PROJECT_ROOT/backend/etl"

python3 extract_jobs.py

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Extract thất bại! Kiểm tra API keys trong extract_jobs.py"
    exit 1
fi

echo ""
echo "✅ Extract hoàn thành!"
echo ""

# ============================================================================
# BƯỚC 2: TRANSFORM - Xử lý và phân tích dữ liệu
# ============================================================================

echo "═══════════════════════════════════════════════════════════════════════"
echo "🚀 BƯỚC 2: TRANSFORM - Xử lý và phân tích dữ liệu"
echo "═══════════════════════════════════════════════════════════════════════"
echo ""

python3 transform_jobs.py

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Transform thất bại!"
    exit 1
fi

echo ""
echo "✅ Transform hoàn thành!"
echo ""

# ============================================================================
# BƯỚC 3: START BACKEND API
# ============================================================================

echo "═══════════════════════════════════════════════════════════════════════"
echo "🚀 BƯỚC 3: KHỞI ĐỘNG BACKEND API SERVER"
echo "═══════════════════════════════════════════════════════════════════════"
echo ""

cd "$PROJECT_ROOT/backend"

echo "📡 Backend API đang chạy tại: http://localhost:8000"
echo "📚 API Documentation: http://localhost:8000/docs"
echo ""
echo "⚠️  Nhấn Ctrl+C để dừng server"
echo ""
echo "🌐 Sau khi API chạy, mở frontend/index.html bằng Live Server"
echo ""

uvicorn api.main:app --reload
