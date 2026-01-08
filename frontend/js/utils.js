// ============================================================================
// SHARED UTILITIES & API CALLS
// Hàm tiện ích dùng chung cho tất cả pages
// ============================================================================

// API Base URL
const API_BASE_URL = 'http://localhost:8000';

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Fetch dữ liệu từ API endpoint
 * @param {string} endpoint - API endpoint (ví dụ: '/api/kpi')
 * @returns {Promise<any>} - Response data
 */
async function fetchAPI(endpoint) {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}${endpoint}`);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        hideLoading();
        return data;
    } catch (error) {
        hideLoading();
        showError(`Lỗi khi gọi API: ${error.message}`);
        console.error('API Error:', error);
        return null;
    }
}

/**
 * Fetch KPI data
 */
async function fetchKPI() {
    return await fetchAPI('/api/kpi');
}

/**
 * Fetch danh sách jobs
 * @param {Object} params - Query parameters { skip, limit, country, keyword }
 */
async function fetchJobs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/api/jobs${queryString ? '?' + queryString : ''}`;
    return await fetchAPI(endpoint);
}

/**
 * Fetch jobs by country
 */
async function fetchJobsByCountry() {
    return await fetchAPI('/api/jobs-by-country');
}

/**
 * Fetch jobs by region
 */
async function fetchJobsByRegion() {
    return await fetchAPI('/api/jobs-by-region');
}

/**
 * Fetch salary by role
 */
async function fetchSalaryByRole() {
    return await fetchAPI('/api/salary-by-role');
}

/**
 * Fetch top skills
 */
async function fetchTopSkills() {
    return await fetchAPI('/api/top-skills');
}

// ============================================================================
// FORMATTING FUNCTIONS
// ============================================================================

/**
 * Format số với dấu phẩy phân cách hàng nghìn
 * @param {number} num
 * @returns {string}
 */
function formatNumber(num) {
    if (num === null || num === undefined) return '0';
    return num.toLocaleString('en-US');
}

/**
 * Format currency
 * @param {number} amount
 * @param {string} currency - Currency code (USD, VND, etc.)
 * @returns {string}
 */
function formatCurrency(amount, currency = 'USD') {
    if (amount === null || amount === undefined) return 'N/A';

    const formatted = formatNumber(Math.round(amount));

    switch (currency.toUpperCase()) {
        case 'USD':
            return `$${formatted}`;
        case 'VND':
            return `${formatted}₫`;
        case 'EUR':
            return `€${formatted}`;
        case 'GBP':
            return `£${formatted}`;
        default:
            return `${formatted} ${currency}`;
    }
}

/**
 * Format percentage
 * @param {number} value
 * @param {number} decimals
 * @returns {string}
 */
function formatPercentage(value, decimals = 1) {
    if (value === null || value === undefined) return '0%';
    return `${value.toFixed(decimals)}%`;
}

/**
 * Truncate text
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
function truncateText(text, maxLength = 100) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Format date
 * @param {string} dateString
 * @returns {string}
 */
function formatDate(dateString) {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// ============================================================================
// LOADING & ERROR STATES
// ============================================================================

let loadingCount = 0;

/**
 * Show loading indicator
 */
function showLoading() {
    loadingCount++;
    const loader = document.getElementById('global-loader');
    if (loader) {
        loader.style.display = 'flex';
    }
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    loadingCount--;
    if (loadingCount <= 0) {
        loadingCount = 0;
        const loader = document.getElementById('global-loader');
        if (loader) {
            setTimeout(() => {
                loader.style.display = 'none';
            }, 200);
        }
    }
}

/**
 * Show error message
 * @param {string} message
 */
function showError(message) {
    console.error(message);

    // Tạo toast notification
    const toast = document.createElement('div');
    toast.className = 'toast toast-error';
    toast.innerHTML = `
    <span>❌ ${message}</span>
  `;

    document.body.appendChild(toast);

    // Auto remove sau 5s
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

/**
 * Show success message
 * @param {string} message
 */
function showSuccess(message) {
    const toast = document.createElement('div');
    toast.className = 'toast toast-success';
    toast.innerHTML = `
    <span>✅ ${message}</span>
  `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================================================
// ANIMATION UTILITIES
// ============================================================================

/**
 * Animate number counting up
 * @param {HTMLElement} element
 * @param {number} target
 * @param {number} duration
 */
function animateNumber(element, target, duration = 1000) {
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (ease-out)
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (target - start) * easeOut);

        element.textContent = formatNumber(current);

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = formatNumber(target);
        }
    }

    requestAnimationFrame(update);
}

/**
 * Intersection Observer for scroll animations
 */
function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, {
        threshold: 0.1
    });

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

// ============================================================================
// CHART UTILITIES
// ============================================================================

/**
 * Get Chart.js color scheme
 */
function getChartColors() {
    return {
        primary: '#8b5cf6',
        secondary: '#06b6d4',
        accent: '#f43f5e',
        success: '#10b981',
        warning: '#f59e0b',
        gradient: {
            primary: ['#667eea', '#764ba2'],
            secondary: ['#06b6d4', '#3b82f6'],
            accent: ['#f43f5e', '#fb7185']
        }
    };
}

/**
 * Default Chart.js options
 */
function getDefaultChartOptions(title) {
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: '#cbd5e1',
                    font: {
                        family: 'Inter',
                        size: 12
                    }
                }
            },
            title: {
                display: !!title,
                text: title,
                color: '#f1f5f9',
                font: {
                    family: 'Inter',
                    size: 16,
                    weight: 600
                }
            }
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)'
                },
                ticks: {
                    color: '#94a3b8'
                }
            },
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.05)'
                },
                ticks: {
                    color: '#94a3b8'
                }
            }
        }
    };
}

// ============================================================================
// DOM READY
// ============================================================================

// Add toast styles dynamically
const toastStyles = document.createElement('style');
toastStyles.textContent = `
  .toast {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: var(--bg-secondary);
    color: var(--text-primary);
    padding: 1rem 1.5rem;
    border-radius: var(--border-radius-lg);
    border: 1px solid var(--border-color);
    box-shadow: var(--shadow-xl);
    z-index: 9999;
    opacity: 1;
    transition: opacity 0.3s ease;
    max-width: 400px;
  }
  
  .toast-error {
    border-left: 4px solid var(--color-error);
  }
  
  .toast-success {
    border-left: 4px solid var(--color-success);
  }
  
  #global-loader {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(10, 14, 26, 0.8);
    backdrop-filter: blur(5px);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 9998;
  }
`;
document.head.appendChild(toastStyles);

// Add global loader
document.addEventListener('DOMContentLoaded', () => {
    const loader = document.createElement('div');
    loader.id = 'global-loader';
    loader.innerHTML = '<div class="loading"></div>';
    document.body.appendChild(loader);

    // Initialize scroll animations
    initScrollAnimations();
});
