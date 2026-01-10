#!/bin/bash

# ============================================================================
# QUICK RUN - Chỉ chạy Backend (bỏ qua ETL nếu đã có data)
# Sử dụng khi bạn chỉ muốn khởi động server nhanh
# ============================================================================

clear
echo ""
echo "⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡"
echo "    GLOBAL JOB MARKET - QUICK START (Backend + Frontend)"
echo "⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡⚡"
echo ""

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_ROOT"

# Kiểm tra data
if [ ! -f "backend/data/clean_jobs.csv" ]; then
    echo "❌ Không tìm thấy dữ liệu! Vui lòng chạy ./run_all.sh trước"
    echo ""
    exit 1
fi

echo "✅ Tìm thấy dữ liệu"
echo ""

# Hỏi user muốn chạy gì
echo "Bạn muốn chạy gì?"
echo "  [1] Backend + Frontend (mặc định)"
echo "  [2] Chỉ Backend"
echo "  [3] Chỉ Frontend"
echo ""
read -p "Lựa chọn (1-3) [1]: " choice
choice=${choice:-1}

echo ""

case $choice in
    1)
        echo "🚀 Đang khởi động Backend + Frontend..."
        echo ""
        
        # Start Backend in background
        echo "📡 Starting Backend..."
        cd backend
        uvicorn api.main:app --reload > /dev/null 2>&1 &
        BACKEND_PID=$!
        cd ..
        
        sleep 2
        
        # Start Frontend in foreground
        echo "🌐 Starting Frontend..."
        echo ""
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo "✅ Backend:  http://localhost:8000"
        echo "✅ Frontend: http://localhost:8080"
        echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
        echo ""
        echo "⏸  Nhấn Ctrl+C để dừng cả 2 servers"
        echo ""
        
        cd frontend
        python3 -m http.server 8080
        
        # Cleanup backend on exit
        kill $BACKEND_PID 2>/dev/null
        ;;
        
    2)
        echo "📡 Khởi động Backend..."
        cd backend
        uvicorn api.main:app --reload
        ;;
        
    3)
        echo "🌐 Khởi động Frontend..."
        cd frontend
        python3 -m http.server 8080
        ;;
        
    *)
        echo "❌ Lựa chọn không hợp lệ!"
        exit 1
        ;;
esac
