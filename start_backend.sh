#!/bin/bash

# ============================================================================
# START BACKEND ONLY - Chỉ khởi động Backend API (không chạy ETL)
# Sử dụng khi đã có dữ liệu clean_jobs.csv
# ============================================================================

echo ""
echo "🚀 Khởi động Backend API Server..."
echo ""

# Lấy thư mục root của project
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_ROOT/backend"

# Kiểm tra file dữ liệu
if [ ! -f "data/clean_jobs.csv" ]; then
    echo "❌ Không tìm thấy file dữ liệu: backend/data/clean_jobs.csv"
    echo ""
    echo "Bạn cần chạy ETL pipeline trước:"
    echo "   ./run_all.sh"
    echo ""
    exit 1
fi

echo "✅ Tìm thấy dữ liệu: data/clean_jobs.csv"
echo ""
echo "📡 Backend API đang chạy tại: http://localhost:8000"
echo "📚 API Documentation: http://localhost:8000/docs"
echo ""
echo "⚠️  Nhấn Ctrl+C để dừng server"
echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo ""

# Start FastAPI
uvicorn api.main:app --reload
