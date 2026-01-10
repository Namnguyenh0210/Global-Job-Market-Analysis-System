// ============================================================================
// COUNTRIES PAGE JAVASCRIPT - Full Functionality with Real Data
// ============================================================================

const COUNTRIES = {
    'SG': { name: 'Singapore', flag: '🇸🇬', region: 'Asia' },
    'US': { name: 'Hoa Kỳ', flag: '🇺🇸', region: 'North America' },
    'GB': { name: 'Anh', flag: '🇬🇧', region: 'Europe' },
    'DE': { name: 'Đức', flag: '🇩🇪', region: 'Europe' },
    'IN': { name: 'Ấn Độ', flag: '🇮🇳', region: 'Asia' },
    'IT': { name: 'Ý', flag: '🇮🇹', region: 'Europe' },
    'NL': { name: 'Hà Lan', flag: '🇳🇱', region: 'Europe' },
    'NZ': { name: 'New Zealand', flag: '🇳🇿', region: 'Oceania' }
};

let countriesChart = null;

document.addEventListener('DOMContentLoaded', async () => {
    await Promise.all([
        loadCountryCards(),
        loadCountriesChart(),
        loadRegionalStats(),
        loadTopCompaniesByCountry()
    ]);
});

/**
 * Load country cards with job counts
 */
async function loadCountryCards() {
    const data = await fetchJobsByCountry();

    if (!data || !data.data) {
        showError('Không thể tải dữ liệu quốc gia');
        return;
    }

    const grid = document.getElementById('countries-grid');

    // Calculate total for percentage
    const total = data.data.reduce((sum, c) => sum + c.count, 0);

    grid.innerHTML = data.data.map(country => {
        const info = COUNTRIES[country.country.toUpperCase()];
        const percentage = ((country.count / total) * 100).toFixed(1);

        return `
            <div class="country-card animate-on-scroll" onclick="navigateToCountryJobs('${country.country}')">
                <div class="country-flag">${info?.flag || '🌏'}</div>
                <div class="country-name">${info?.name || country.country}</div>
                <div class="country-jobs">${formatNumber(country.count)}</div>
                <div class="country-label">việc làm</div>
                <div class="country-percentage">${percentage}% tổng số</div>
                <div class="country-region">
                    <span class="region-badge">${info?.region || 'Other'}</span>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Load comparison chart
 */
async function loadCountriesChart() {
    const data = await fetchJobsByCountry();

    if (!data || !data.data) return;

    const labels = data.data.map(c => {
        const info = COUNTRIES[c.country.toUpperCase()];
        return info?.name || c.country;
    });

    const values = data.data.map(c => c.count);

    const ctx = document.getElementById('chart-countries');

    if (countriesChart) {
        countriesChart.destroy();
    }

    countriesChart = new Chart(ctx, {
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
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(59, 130, 246, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                    'rgba(168, 85, 247, 0.8)'
                ],
                borderColor: [
                    '#8b5cf6',
                    '#06b6d4',
                    '#f43f5e',
                    '#10b981',
                    '#f59e0b',
                    '#3b82f6',
                    '#ec4899',
                    '#a855f7'
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
                    const countryCode = data.data[index].country;
                    navigateToCountryJobs(countryCode);
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
                    displayColors: false,
                    callbacks: {
                        label: function (context) {
                            return `${formatNumber(context.parsed.y)} việc làm`;
                        }
                    }
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
 * Load regional statistics
 */
async function loadRegionalStats() {
    const data = await fetchJobsByRegion();

    if (!data || !data.data) return;

    const statsEl = document.getElementById('region-stats');

    const total = data.data.reduce((sum, r) => sum + r.count, 0);

    statsEl.innerHTML = data.data.map(region => {
        const percentage = ((region.count / total) * 100).toFixed(1);

        return `
            <div class="region-stat-card">
                <div class="region-stat-header">
                    <h4>${region.region}</h4>
                    <span class="region-stat-count">${formatNumber(region.count)}</span>
                </div>
                <div class="region-stat-bar">
                    <div class="region-stat-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="region-stat-percentage">${percentage}% tổng số việc làm</div>
            </div>
        `;
    }).join('');
}

/**
 * Load top companies grouped by country
 */
async function loadTopCompaniesByCountry() {
    // Fetch jobs and group by country and company
    const jobsData = await fetchJobs({ limit: 500 });

    if (!jobsData || !jobsData.jobs) return;

    const companiesByCountry = {};

    jobsData.jobs.forEach(job => {
        const country = job.country.toUpperCase();
        if (!companiesByCountry[country]) {
            companiesByCountry[country] = {};
        }

        const company = job.company || 'Unknown';
        companiesByCountry[country][company] = (companiesByCountry[country][company] || 0) + 1;
    });

    const topCompaniesEl = document.getElementById('top-companies');

    let html = '';
    Object.keys(companiesByCountry).forEach(countryCode => {
        const info = COUNTRIES[countryCode];
        const companies = companiesByCountry[countryCode];

        // Get top 3 companies
        const topCompanies = Object.entries(companies)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

        if (topCompanies.length > 0) {
            html += `
                <div class="country-companies-card">
                    <h4>${info?.flag || ''} ${info?.name || countryCode}</h4>
                    <div class="companies-list">
                        ${topCompanies.map(([company, count], index) => `
                            <div class="company-item">
                                <span class="company-rank">#${index + 1}</span>
                                <span class="company-name">${truncateText(company, 25)}</span>
                                <span class="company-count">${count} jobs</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    });

    topCompaniesEl.innerHTML = html;
}

/**
 * Navigate to Jobs page filtered by country
 */
function navigateToCountryJobs(countryCode) {
    window.location.href = `jobs.html?country=${countryCode}`;
}

/**
 * Download chart as image
 */
function downloadChart() {
    if (!countriesChart) return;

    const canvas = document.getElementById('chart-countries');
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'countries_comparison.png';
    link.href = url;
    link.click();

    showSuccess('Đã tải xuống biểu đồ!');
}
