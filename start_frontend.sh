#!/bin/bash

# ============================================================================
# START FRONTEND SERVER
# Script khởi động web server cho frontend
# ============================================================================

echo "🌐 Đang khởi động Frontend Server..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

cd frontend

echo ""
echo "✅ Frontend đang chạy tại: http://localhost:8080"
echo ""
echo "📄 Các trang có sẵn:"
echo "   • Trang chủ:    http://localhost:8080/index.html"
echo "   • Dashboard:    http://localhost:8080/pages/dashboard.html"
echo "   • Jobs:         http://localhost:8080/pages/jobs.html"
echo "   • Countries:    http://localhost:8080/pages/countries.html"
echo "   • Skills:       http://localhost:8080/pages/skills.html"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⏸  Nhấn Ctrl+C để dừng server"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start Python HTTP Server
python3 -m http.server 8080
