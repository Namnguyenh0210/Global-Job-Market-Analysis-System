// ============================================================================
// DASHBOARD PAGE JAVASCRIPT - Enhanced with Filters
// ============================================================================

let dashboardCharts = {};
let currentPage = 1;
const ITEMS_PER_PAGE = 10;

document.addEventListener('DOMContentLoaded', async () => {
    // Load dashboard
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
        loadCategoryChart(),
        loadSkillsChart(),
        loadJobsTable(1),
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
        animateNumber(document.getElementById('kpi-companies'), kpiData.total_countries);

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

    // Destroy old chart if exists
    if (dashboardCharts['region']) {
        dashboardCharts['region'].destroy();
    }

    dashboardCharts['region'] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Số lượng việc làm',
                data: values,
                backgroundColor: [
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(6, 182, 212, 0.8)',
                    'rgba(244, 63, 94, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)'
                ],
                borderColor: [
                    '#8b5cf6',
                    '#06b6d4',
                    '#f43f5e',
                    '#10b981',
                    '#f59e0b'
                ],
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            ...getDefaultChartOptions(),
            onClick: (event, elements) => {
                if (elements.length > 0) {
                    const index = elements[0].index;
                    const region = labels[index];
                    console.log('Clicked region:', region);
                    // TODO: Filter by region
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#f1f5f9',
                    bodyColor: '#cbd5e1',
                    borderColor: 'rgba(139, 92, 246, 0.3)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false
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

    const chartData = data.data.slice(0, 8);
    const labels = chartData.map(item => formatCountryName(item.country));
    const values = chartData.map(item => item.count);

    const ctx = document.getElementById('chart-country');

    if (dashboardCharts['country']) {
        dashboardCharts['country'].destroy();
    }

    dashboardCharts['country'] = new Chart(ctx, {
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
                    '#ec4899',
                    '#a855f7'
                ],
                borderColor: '#0f172a',
                borderWidth: 3
            }]
        },
        options: {
            ...getDefaultChartOptions(),
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#ffffff',
                        padding: 12,
                        font: {
                            size: 12,
                            family: 'Inter'
                        },
                        generateLabels: function (chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                return data.labels.map((label, i) => {
                                    const value = data.datasets[0].data[i];
                                    const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return {
                                        text: `${label}: ${percentage}%`,
                                        fillStyle: data.datasets[0].backgroundColor[i],
                                        hidden: false,
                                        index: i
                                    };
                                });
                            }
                            return [];
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleColor: '#f1f5f9',
                    bodyColor: '#cbd5e1',
                    borderColor: 'rgba(139, 92, 246, 0.3)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        label: function (context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const dataset = context.dataset;
                            const total = dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${formatNumber(value)} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Load và vẽ Jobs by Category chart
 */
async function loadCategoryChart(filters = null) {
    // Fetch jobs data and group by category
    const jobsData = await fetchJobs({ limit: 500 });

    if (!jobsData || !jobsData.jobs) return;

    const categoryCount = {};
    jobsData.jobs.forEach(job => {
        const category = job.category || 'Unknown';
        categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    const labels = Object.keys(categoryCount);
    const values = Object.values(categoryCount);

    const ctx = document.getElementById('chart-category');

    if (dashboardCharts['category']) {
        dashboardCharts['category'].destroy();
    }

    dashboardCharts['category'] = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: values,
                backgroundColor: [
                    '#8b5cf6',
                    '#06b6d4',
                    '#10b981'
                ],
                borderColor: '#0f172a',
                borderWidth: 3
            }]
        },
        options: {
            ...getDefaultChartOptions(),
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#cbd5e1',
                        padding: 15,
                        font: {
                            size: 13,
                            family: 'Inter'
                        }
                    }
                }
            }
        }
    });
}

/**
 * Load và vẽ Top Skills chart
 */
async function loadSkillsChart(filters = null) {
    const data = await fetchTopSkills();

    if (!data || !data.data) return;

    const chartData = data.data;
    const labels = chartData.map(item => item.skill);
    const values = chartData.map(item => item.percentage);

    const ctx = document.getElementById('chart-skills');

    if (dashboardCharts['skills']) {
        dashboardCharts['skills'].destroy();
    }

    dashboardCharts['skills'] = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Tỷ lệ yêu cầu (%)',
                data: values,
                backgroundColor: 'rgba(139, 92, 246, 0.8)',
                borderColor: '#8b5cf6',
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            ...getDefaultChartOptions(),
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: '#94a3b8',
                        callback: function (value) {
                            return value + '%';
                        }
                    }
                },
                y: {
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
 * Load jobs table
 */
async function loadJobsTable(filters = null, page = 1) {
    currentPage = page;
    const skip = (page - 1) * ITEMS_PER_PAGE;

    const params = filters ? buildFilterParams() : '';
    const jobsData = await fetchJobs({
        skip,
        limit: ITEMS_PER_PAGE,
        ...Object.fromEntries(new URLSearchParams(params))
    });

    if (!jobsData || !jobsData.jobs) return;

    const tbody = document.getElementById('jobs-table-body');

    if (jobsData.jobs.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    Không tìm thấy việc làm nào phù hợp với bộ lọc
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = jobsData.jobs.map(job => {
        const salary = job.salary_min && job.salary_max
            ? `$${formatNumber(job.salary_min)} - $${formatNumber(job.salary_max)}`
            : 'N/A';

        const countryInfo = COUNTRIES[job.country.toUpperCase()];
        const countryDisplay = countryInfo
            ? `${countryInfo.flag} ${countryInfo.name}`
            : job.country;

        return `
            <tr class="table-row-hover">
                <td class="job-title-cell">
                    <strong>${job.job_title || 'Untitled'}</strong>
                </td>
                <td>
                    <span class="category-badge">${job.category || 'N/A'}</span>
                </td>
                <td>${job.company || 'Unknown'}</td>
                <td>${countryDisplay}</td>
                <td class="salary-cell">${salary}</td>
                <td>
                    <button class="btn btn-small" onclick='showJobModal(${JSON.stringify(job)})'>
                        👁️ Xem
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    // Render pagination
    renderPagination(jobsData.total, page);
}

/**
 * Render pagination
 */
function renderPagination(total, currentPage) {
    const totalPages = Math.ceil(total / ITEMS_PER_PAGE);
    const pagination = document.getElementById('table-pagination');

    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let paginationHTML = '<div class="pagination">';

    // Previous button
    if (currentPage > 1) {
        paginationHTML += `<button class="btn-pagination" onclick="loadJobsTable(null, ${currentPage - 1})">← Trước</button>`;
    }

    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
        const activeClass = i === currentPage ? 'active' : '';
        paginationHTML += `<button class="btn-pagination ${activeClass}" onclick="loadJobsTable(null, ${i})">${i}</button>`;
    }

    // Next button
    if (currentPage < totalPages) {
        paginationHTML += `<button class="btn-pagination" onclick="loadJobsTable(null, ${currentPage + 1})">Sau →</button>`;
    }

    paginationHTML += `<span class="pagination-info">Trang ${currentPage} / ${totalPages} (${formatNumber(total)} việc làm)</span>`;
    paginationHTML += '</div>';

    pagination.innerHTML = paginationHTML;
}

/**
 * Load và hiển thị summary insights
 */
async function loadSummary(filters = null) {
    const [kpiData, regionData, countryData] = await Promise.all([
        fetchKPI(),
        fetchJobsByRegion(),
        fetchJobsByCountry()
    ]);

    if (!kpiData || !regionData || !countryData) return;

    const topRegion = regionData.data.sort((a, b) => b.count - a.count)[0];
    const topCountry = countryData.data.sort((a, b) => b.count - a.count)[0];

    const summaryHTML = `
        <div class="insight-card">
            <div class="insight-icon">🎯</div>
            <div class="insight-content">
                <h4>Thống kê tổng quan</h4>
                <p>Hệ thống đã thu thập <strong>${formatNumber(kpiData.total_jobs)}</strong> công việc 
                từ <strong>${kpiData.total_countries}</strong> quốc gia với
                <strong>${formatNumber(kpiData.total_companies)}</strong> công ty.</p>
            </div>
        </div>
        
        <div class="insight-card">
            <div class="insight-icon">📍</div>
            <div class="insight-content">
                <h4>Khu vực hàng đầu</h4>
                <p><strong>${topRegion.region}</strong> dẫn đầu với 
                <strong>${formatNumber(topRegion.count)}</strong> việc làm 
                (~${Math.round(topRegion.count / kpiData.total_jobs * 100)}%).</p>
            </div>
        </div>
        
        <div class="insight-card">
            <div class="insight-icon">🌏</div>
            <div class="insight-content">
                <h4>Quốc gia hàng đầu</h4>
                <p><strong>${formatCountryName(topCountry.country)}</strong> có nhiều cơ hội nhất với 
                <strong>${formatNumber(topCountry.count)}</strong> jobs.</p>
            </div>
        </div>
        
        <div class="insight-card">
            <div class="insight-icon">💰</div>
            <div class="insight-content">
                <h4>Minh bạch lương</h4>
                <p><strong>${formatPercentage(kpiData.salary_percentage)}</strong> việc làm 
                công khai mức lương, giúp ứng viên đưa ra quyết định tốt hơn.</p>
            </div>
        </div>
    `;

    document.getElementById('summary-content').innerHTML = summaryHTML;
}

/**
 * Show job modal với chi tiết
 */
function showJobModal(job) {
    const modal = document.getElementById('job-modal');
    const modalBody = document.getElementById('modal-body');

    const salary = job.salary_min && job.salary_max
        ? `$${formatNumber(job.salary_min)} - $${formatNumber(job.salary_max)}`
        : 'Không công khai';

    const countryInfo = COUNTRIES[job.country.toUpperCase()];
    const countryDisplay = countryInfo
        ? `${countryInfo.flag} ${countryInfo.name}`
        : job.country;

    modalBody.innerHTML = `
        <h2>${job.job_title}</h2>
        <div class="job-meta">
            <span class="job-meta-item">🏢 ${job.company}</span>
            <span class="job-meta-item">📍 ${countryDisplay}, ${job.city}</span>
            <span class="job-meta-item">💰 ${salary}</span>
            <span class="job-meta-item">📂 ${job.category || 'N/A'}</span>
        </div>
        <div class="job-description">
            <h3>Mô tả công việc:</h3>
            <p>${job.job_description || 'Không có mô tả'}</p>
        </div>
    `;

    modal.style.display = 'flex';
}

/**
 * Close job modal
 */
function closeJobModal() {
    document.getElementById('job-modal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('job-modal');
    if (event.target === modal) {
        closeJobModal();
    }
};

/**
 * Download chart as image
 */
function downloadChart(chartId) {
    const canvas = document.getElementById(chartId);
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${chartId}.png`;
    link.href = url;
    link.click();
    showSuccess('Đã tải xuống biểu đồ!');
}

/**
 * Export table data to CSV
 */
async function exportTableData() {
    const jobsData = await fetchJobs({ limit: 500 });

    if (!jobsData || !jobsData.jobs) return;

    const csv = convertToCSV(jobsData.jobs);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'jobs_data.csv';
    link.href = url;
    link.click();
    showSuccess(`Đã xuất ${jobsData.jobs.length} việc làm ra CSV!`);
}

/**
 * Convert jobs to CSV
 */
function convertToCSV(jobs) {
    const headers = ['Job Title', 'Category', 'Company', 'Country', 'City', 'Salary Min', 'Salary Max'];
    const rows = jobs.map(job => [
        job.job_title,
        job.category,
        job.company,
        job.country,
        job.city,
        job.salary_min || '',
        job.salary_max || ''
    ]);

    return [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
}

/**
 * Sort table by column
 */
let sortDirection = {};
function sortTable(columnIndex) {
    // TODO: Implement table sorting
    console.log('Sort by column:', columnIndex);
}
