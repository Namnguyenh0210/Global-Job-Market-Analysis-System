// ============================================================================
// JOBS PAGE JAVASCRIPT - Fully Functional with Real Backend Connection
// ============================================================================

const COUNTRIES = {
  'SG': { name: 'Singapore', flag: '🇸🇬' },
  'US': { name: 'Hoa Kỳ', flag: '🇺🇸' },
  'GB': { name: 'Anh', flag: '🇬🇧' },
  'DE': { name: 'Đức', flag: '🇩🇪' },
  'IN': { name: 'Ấn Độ', flag: '🇮🇳' },
  'IT': { name: 'Ý', flag: '🇮🇹' },
  'NL': { name: 'Hà Lan', flag: '🇳🇱' },
  'NZ': { name: 'New Zealand', flag: '🇳🇿' }
};

let currentPage = 1;
const ITEMS_PER_PAGE = 10;
let totalJobs = 0;
let currentFilters = {};

// Debounce timer
let filterTimer;

document.addEventListener('DOMContentLoaded', async () => {
  await loadJobs();
});

/**
 * Load jobs from backend with filters
 */
async function loadJobs(page = 1) {
  currentPage = page;
  const skip = (page - 1) * ITEMS_PER_PAGE;

  // Build params from filters
  const params = {
    skip,
    limit: ITEMS_PER_PAGE
  };

  if (currentFilters.keyword) params.keyword = currentFilters.keyword;
  if (currentFilters.category) params.category = currentFilters.category;
  if (currentFilters.country) params.country = currentFilters.country;

  // Fetch from backend
  const data = await fetchJobs(params);

  if (!data || !data.jobs) {
    showError('Không thể tải dữ liệu việc làm');
    return;
  }

  totalJobs = data.total;

  // Filter has_salary on frontend (backend doesn't support this yet)
  let jobs = data.jobs;
  if (currentFilters.has_salary) {
    jobs = jobs.filter(job => job.salary_min || job.salary_max);
  }

  renderJobs(jobs);
  renderPagination();
  updateResultsCount(currentFilters.has_salary ? jobs.length : totalJobs);
}

/**
 * Handle filter changes with debounce
 */
function handleFilterChange() {
  clearTimeout(filterTimer);
  filterTimer = setTimeout(() => {
    applyFilters();
  }, 500);
}

/**
 * Apply all filters
 */
function applyFilters() {
  currentFilters = {
    keyword: document.getElementById('filter-keyword').value.trim(),
    category: document.getElementById('filter-category').value,
    country: document.getElementById('filter-country').value,
    has_salary: document.getElementById('filter-has-salary').checked
  };

  currentPage = 1;
  loadJobs(1);
}

/**
 * Clear all filters
 */
function clearAllFilters() {
  document.getElementById('filter-keyword').value = '';
  document.getElementById('filter-category').value = '';
  document.getElementById('filter-country').value = '';
  document.getElementById('filter-has-salary').checked = false;

  currentFilters = {};
  loadJobs(1);
}

/**
 * Render jobs table
 */
function renderJobs(jobs) {
  const tbody = document.getElementById('jobs-tbody');

  if (!jobs || jobs.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-state">
                    <div class="empty-icon">😕</div>
                    <div class="empty-text">Không tìm thấy việc làm phù hợp</div>
                    <button class="btn btn-secondary" onclick="clearAllFilters()">Xóa bộ lọc</button>
                </td>
            </tr>
        `;
    return;
  }

  tbody.innerHTML = jobs.map(job => {
    const salary = job.salary_min && job.salary_max
      ? `$${formatNumber(job.salary_min)} - $${formatNumber(job.salary_max)}`
      : job.salary_min
        ? `$${formatNumber(job.salary_min)}+`
        : 'Không công khai';

    const countryInfo = COUNTRIES[job.country.toUpperCase()];
    const countryDisplay = countryInfo
      ? `${countryInfo.flag} ${countryInfo.name}`
      : job.country;

    // Infer category from job title if not available
    const category = job.category || inferCategoryFromTitle(job.job_title) || 'IT General';

    // Escape quotes for JSON
    const jobJson = JSON.stringify(job).replace(/"/g, '&quot;');

    return `
            <tr class="table-row-hover">
                <td class="job-title-cell">
                    <strong>${truncateText(job.job_title || 'Untitled', 60)}</strong>
                </td>
                <td>
                    <span class="category-badge">${category}</span>
                </td>
                <td>${truncateText(job.company || 'Unknown', 30)}</td>
                <td>${countryDisplay}</td>
                <td class="salary-cell">${salary}</td>
                <td>
                    <button class="btn btn-small" onclick='showJobDetail(${jobJson})'>
                        👁️ Xem
                    </button>
                </td>
            </tr>
        `;
  }).join('');
}

/**
 * Infer job category from title
 */
function inferCategoryFromTitle(title) {
  if (!title) return null;

  const titleLower = title.toLowerCase();

  const categoryKeywords = {
    'Data Science': ['data scientist', 'data analyst', 'machine learning', 'ml engineer', 'ai engineer', 'analytics'],
    'Software Engineering': ['software engineer', 'developer', 'programmer', 'full stack', 'backend', 'frontend'],
    'DevOps': ['devops', 'sre', 'site reliability', 'cloud engineer', 'infrastructure'],
    'Security': ['security', 'cybersecurity', 'infosec', 'penetration test', 'ethical hacker'],
    'Product Management': ['product manager', 'product owner', 'pm'],
    'Design': ['designer', 'ux', 'ui', 'graphics', 'visual'],
    'QA/Testing': ['qa', 'tester', 'quality assurance', 'test engineer'],
    'Mobile Development': ['ios', 'android', 'mobile', 'flutter', 'react native'],
    'Database': ['database', 'dba', 'sql'],
    'Network': ['network', 'networking', 'cisco'],
    'Support': ['support', 'helpdesk', 'technical support'],
    'Management': ['manager', 'director', 'lead', 'head of', 'cto', 'cio']
  };

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(keyword => titleLower.includes(keyword))) {
      return category;
    }
  }

  return null;
}

/**
 * Render pagination
 */
function renderPagination() {
  const totalPages = Math.ceil(totalJobs / ITEMS_PER_PAGE);
  const pagination = document.getElementById('pagination');

  if (totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }

  let html = '<div class="pagination">';

  // Previous button
  if (currentPage > 1) {
    html += `<button class="btn-pagination" onclick="loadJobs(${currentPage - 1})">← Trước</button>`;
  }

  // Page numbers (show 5 pages max)
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);

  if (startPage > 1) {
    html += `<button class="btn-pagination" onclick="loadJobs(1)">1</button>`;
    if (startPage > 2) html += `<span class="pagination-dots">...</span>`;
  }

  for (let i = startPage; i <= endPage; i++) {
    const activeClass = i === currentPage ? 'active' : '';
    html += `<button class="btn-pagination ${activeClass}" onclick="loadJobs(${i})">${i}</button>`;
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) html += `<span class="pagination-dots">...</span>`;
    html += `<button class="btn-pagination" onclick="loadJobs(${totalPages})">${totalPages}</button>`;
  }

  // Next button
  if (currentPage < totalPages) {
    html += `<button class="btn-pagination" onclick="loadJobs(${currentPage + 1})">Sau →</button>`;
  }

  html += `<span class="pagination-info">Trang ${currentPage} / ${totalPages}</span>`;
  html += '</div>';

  pagination.innerHTML = html;
}

/**
 * Update results count
 */
function updateResultsCount(count) {
  const el = document.getElementById('results-count');
  if (el) {
    el.textContent = `Tìm thấy ${formatNumber(count)} việc làm`;
  }
}

/**
 * Show job detail modal
 */
function showJobDetail(job) {
  const modal = document.getElementById('job-modal');
  const modalBody = document.getElementById('modal-body');

  const salary = job.salary_min && job.salary_max
    ? `$${formatNumber(job.salary_min)} - $${formatNumber(job.salary_max)}`
    : job.salary_min
      ? `$${formatNumber(job.salary_min)}+`
      : 'Không công khai';

  const countryInfo = COUNTRIES[job.country.toUpperCase()];
  const countryDisplay = countryInfo
    ? `${countryInfo.flag} ${countryInfo.name}`
    : job.country;

  modalBody.innerHTML = `
        <h2>${job.job_title || 'Untitled'}</h2>
        <div class="job-meta">
            <span class="job-meta-item">🏢 ${job.company || 'Unknown'}</span>
            <span class="job-meta-item">📍 ${countryDisplay}, ${job.city || 'N/A'}</span>
            <span class="job-meta-item">💰 ${salary}</span>
            <span class="job-meta-item">📂 ${job.category || 'N/A'}</span>
        </div>
        <div class="job-description">
            <h3>Mô tả công việc:</h3>
            <p>${job.job_description || 'Không có mô tả chi tiết'}</p>
        </div>
        ${job.date_posted ? `<div class="job-footer"><small>Đăng ngày: ${formatDate(job.date_posted)}</small></div>` : ''}
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
 * Export jobs to CSV
 */
async function exportJobs() {
  showLoading();

  // Fetch maximum allowed (500)
  const params = { limit: 500 };
  if (currentFilters.keyword) params.keyword = currentFilters.keyword;
  if (currentFilters.category) params.category = currentFilters.category;
  if (currentFilters.country) params.country = currentFilters.country;

  const data = await fetchJobs(params);

  hideLoading();

  if (!data || !data.jobs) {
    showError('Không thể xuất dữ liệu');
    return;
  }

  let jobs = data.jobs;
  if (currentFilters.has_salary) {
    jobs = jobs.filter(job => job.salary_min || job.salary_max);
  }

  const csv = convertJobsToCSV(jobs);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = `jobs_export_${new Date().toISOString().slice(0, 10)}.csv`;
  link.href = url;
  link.click();

  showSuccess(`Đã xuất ${jobs.length} việc làm ra file CSV!`);
}

/**
 * Convert jobs array to CSV
 */
function convertJobsToCSV(jobs) {
  const headers = ['Chức danh', 'Danh mục', 'Công ty', 'Quốc gia', 'Thành phố', 'Lương tối thiểu', 'Lương tối đa', 'Ngày đăng'];

  const rows = jobs.map(job => [
    job.job_title || '',
    job.category || '',
    job.company || '',
    job.country || '',
    job.city || '',
    job.salary_min || '',
    job.salary_max || '',
    job.date_posted || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  return '\uFEFF' + csvContent; // Add BOM for Excel UTF-8 support
}

/**
 * Scroll to top
 */
function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
