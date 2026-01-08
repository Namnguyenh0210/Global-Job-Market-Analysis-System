// ============================================================================
// DASHBOARD PAGE JAVASCRIPT
// ============================================================================

document.addEventListener('DOMContentLoaded', async () => {
    await loadDashboard();
});

/**
 * Load tất cả dữ liệu cho dashboard
 */
async function loadDashboard() {
    await Promise.all([
        loadKPIs(),
        loadRegionChart(),
        loadCountryChart(),
        loadSummary()
    ]);
}

/**
 * Load và hiển thị KPIs
 */
async function loadKPIs() {
    const kpiData = await fetchKPI();

    if (kpiData) {
        animateNumber(document.getElementById('kpi-total-jobs'), kpiData.total_jobs);
        animateNumber(document.getElementById('kpi-countries'), kpiData.total_countries);
        animateNumber(document.getElementById('kpi-companies'), kpiData.total_companies);

        const salaryEl = document.getElementById('kpi-salary');
        animateNumber(salaryEl, Math.round(kpiData.salary_percentage));
        setTimeout(() => {
            salaryEl.textContent = formatPercentage(kpiData.salary_percentage);
        }, 1000);
    }
}

/**
 * Load và vẽ Jobs by Region chart
 */
async function loadRegionChart() {
    const data = await fetchJobsByRegion();

    if (!data || !data.data) return;

    const chartData = data.data;
    const labels = chartData.map(item => item.region);
    const values = chartData.map(item => item.count);

    const ctx = document.getElementById('chart-region');
    const colors = getChartColors();

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Number of Jobs',
                data: values,
                backgroundColor: [
                    colors.primary + '80',
                    colors.secondary + '80',
                    colors.accent + '80'
                ],
                borderColor: [
                    colors.primary,
                    colors.secondary,
                    colors.accent
                ],
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            ...getDefaultChartOptions(),
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#94a3b8'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#94a3b8'
                    }
                }
            }
        }
    });
}

/**
 * Load và vẽ Jobs by Country chart
 */
async function loadCountryChart() {
    const data = await fetchJobsByCountry();

    if (!data || !data.data) return;

    // Lấy top 7 countries
    const chartData = data.data.slice(0, 7);
    const labels = chartData.map(item => item.country);
    const values = chartData.map(item => item.count);

    const ctx = document.getElementById('chart-country');

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    '#8b5cf6',
                    '#06b6d4',
                    '#f43f5e',
                    '#10b981',
                    '#f59e0b',
                    '#3b82f6',
                    '#ec4899'
                ],
                borderColor: '#1a2234',
                borderWidth: 3
            }]
        },
        options: {
            ...getDefaultChartOptions(),
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#cbd5e1',
                        padding: 15,
                        font: {
                            size: 12,
                            family: 'Inter'
                        }
                    }
                }
            }
        }
    });
}

/**
 * Load và hiển thị summary insights
 */
async function loadSummary() {
    const [kpiData, regionData, countryData] = await Promise.all([
        fetchKPI(),
        fetchJobsByRegion(),
        fetchJobsByCountry()
    ]);

    if (!kpiData || !regionData || !countryData) return;

    // Tìm region có nhiều jobs nhất
    const topRegion = regionData.data.sort((a, b) => b.count - a.count)[0];

    // Tìm country có nhiều jobs nhất
    const topCountry = countryData.data.sort((a, b) => b.count - a.count)[0];

    const summaryHTML = `
    <p>
      <strong>🎯 Thống kê chính:</strong> 
      Hệ thống đã thu thập được <strong>${formatNumber(kpiData.total_jobs)}</strong> công việc 
      từ <strong>${kpiData.total_countries}</strong> quốc gia, 
      bao gồm <strong>${formatNumber(kpiData.total_companies)}</strong> công ty khác nhau.
    </p>
    <p>
      <strong>📍 Khu vực:</strong> 
      <strong>${topRegion.region}</strong> dẫn đầu với <strong>${formatNumber(topRegion.count)}</strong> công việc, 
      chiếm khoảng <strong>${Math.round(topRegion.count / kpiData.total_jobs * 100)}%</strong> tổng số việc làm.
    </p>
    <p>
      <strong>🌏 Quốc gia:</strong> 
      <strong>${topCountry.country.toUpperCase()}</strong> có số lượng công việc nhiều nhất với 
      <strong>${formatNumber(topCountry.count)}</strong> jobs.
    </p>
    <p>
      <strong>💰 Mức lương:</strong> 
      Có <strong>${formatPercentage(kpiData.salary_percentage)}</strong> công việc cung cấp thông tin về mức lương,
      giúp ứng viên có cái nhìn rõ hơn về thu nhập tiềm năng.
    </p>
  `;

    document.getElementById('summary-content').innerHTML = summaryHTML;
}
