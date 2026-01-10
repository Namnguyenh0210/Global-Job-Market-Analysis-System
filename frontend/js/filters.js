// ============================================================================
// FILTER SYSTEM - Hệ thống bộ lọc nâng cao
// ============================================================================

// Trạng thái bộ lọc toàn cục
let filterState = {
    countries: [], // Mảng các mã quốc gia đã chọn
    category: '',  // Danh mục công việc
    keyword: '',   // Từ khóa tìm kiếm
    salaryMin: 0,
    salaryMax: 500000,
    skills: [],    // Mảng kỹ năng
    hasSalary: false,
    recency: 'all' // all, 24h, 7d, 30d
};

// Danh sách quốc gia với cờ
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

// Danh mục công việc
const CATEGORIES = [
    'Data Analyst',
    'Data Engineer',
    'Software Engineer'
];

// Kỹ năng
const SKILLS = ['Python', 'SQL', 'AWS', 'Excel', 'English'];

/**
 * Khởi tạo bộ lọc
 */
function initFilters() {
    const filterPanel = document.getElementById('filter-panel');
    if (!filterPanel) return;

    filterPanel.innerHTML = `
        <div class="filter-header">
            <h3>🎯 Bộ lọc nâng cao</h3>
            <button class="btn-toggle-filter" onclick="toggleFilterPanel()">
                <span class="filter-icon">▼</span>
            </button>
        </div>
        
        <div class="filter-body" id="filter-body">
            <div class="filter-grid">
                <!-- Category Filter -->
                <div class="filter-group">
                    <label class="filter-label">📂 Danh mục công việc</label>
                    <select id="filter-category" class="filter-select" onchange="updateFilters()">
                        <option value="">Tất cả</option>
                        ${CATEGORIES.map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                    </select>
                </div>

                <!-- Keyword Search -->
                <div class="filter-group">
                    <label class="filter-label">🔍 Tìm kiếm từ khóa</label>
                    <input type="text" 
                           id="filter-keyword" 
                           class="filter-input" 
                           placeholder="Nhập từ khóa..."
                           oninput="debounceFilter()">
                </div>

                <!-- Country Multi-Select -->
                <div class="filter-group filter-group-full">
                    <label class="filter-label">🌍 Quốc gia</label>
                    <div class="filter-checkboxes" id="country-checkboxes">
                        ${Object.entries(COUNTRIES).map(([code, info]) => `
                            <label class="checkbox-label">
                                <input type="checkbox" 
                                       value="${code}" 
                                       onchange="updateFilters()"
                                       class="filter-checkbox">
                                <span>${info.flag} ${info.name}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>

                <!-- Salary Range -->
                <div class="filter-group filter-group-full">
                    <label class="filter-label">💰 Mức lương (USD/năm)</label>
                    <div class="salary-range-container">
                        <div class="salary-values">
                            <span id="salary-min-value">$0</span>
                            <span id="salary-max-value">$500,000</span>
                        </div>
                        <div class="range-slider">
                            <input type="range" 
                                   id="salary-min" 
                                   class="range-input"
                                   min="0" 
                                   max="500000" 
                                   step="5000"
                                   value="0"
                                   oninput="updateSalaryRange()">
                            <input type="range" 
                                   id="salary-max" 
                                   class="range-input"
                                   min="0" 
                                   max="500000" 
                                   step="5000"
                                   value="500000"
                                   oninput="updateSalaryRange()">
                        </div>
                    </div>
                </div>

                <!-- Skills -->
                <div class="filter-group filter-group-full">
                    <label class="filter-label">🎯 Kỹ năng</label>
                    <div class="filter-skills">
                        ${SKILLS.map(skill => `
                            <label class="skill-chip">
                                <input type="checkbox" 
                                       value="${skill.toLowerCase()}" 
                                       onchange="updateFilters()"
                                       class="skill-checkbox">
                                <span>${skill}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>

                <!-- Recency -->
                <div class="filter-group">
                    <label class="filter-label">⏰ Độ mới</label>
                    <select id="filter-recency" class="filter-select" onchange="updateFilters()">
                        <option value="all">Tất cả</option>
                        <option value="24h">24 giờ qua</option>
                        <option value="7d">7 ngày qua</option>
                        <option value="30d">30 ngày qua</option>
                    </select>
                </div>

                <!-- Has Salary Toggle -->
                <div class="filter-group">
                    <label class="filter-label toggle-label">
                        <input type="checkbox" 
                               id="filter-has-salary" 
                               class="toggle-checkbox"
                               onchange="updateFilters()">
                        <span class="toggle-text">💵 Chỉ hiển thị có lương</span>
                    </label>
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="filter-actions">
                <button class="btn btn-primary" onclick="applyFilters()">
                    ✓ Áp dụng bộ lọc
                </button>
                <button class="btn btn-secondary" onclick="clearFilters()">
                    ✕ Xóa tất cả
                </button>
                <span class="filter-count" id="filter-count">0 bộ lọc đang hoạt động</span>
            </div>
        </div>
    `;
}

/**
 * Toggle filter panel
 */
function toggleFilterPanel() {
    const body = document.getElementById('filter-body');
    const icon = document.querySelector('.filter-icon');

    if (body.style.display === 'none') {
        body.style.display = 'block';
        icon.textContent = '▼';
    } else {
        body.style.display = 'none';
        icon.textContent = '▶';
    }
}

/**
 * Update salary range display
 */
function updateSalaryRange() {
    const minInput = document.getElementById('salary-min');
    const maxInput = document.getElementById('salary-max');
    const minValue = document.getElementById('salary-min-value');
    const maxValue = document.getElementById('salary-max-value');

    let min = parseInt(minInput.value);
    let max = parseInt(maxInput.value);

    // Đảm bảo min không lớn hơn max
    if (min > max) {
        [min, max] = [max, min];
        minInput.value = min;
        maxInput.value = max;
    }

    minValue.textContent = '$' + formatNumber(min);
    maxValue.textContent = '$' + formatNumber(max);

    filterState.salaryMin = min;
    filterState.salaryMax = max;
}

/**
 * Debounce cho keyword search
 */
let keywordTimer;
function debounceFilter() {
    clearTimeout(keywordTimer);
    keywordTimer = setTimeout(() => {
        updateFilters();
    }, 500);
}

/**
 * Cập nhật trạng thái bộ lọc
 */
function updateFilters() {
    // Category
    filterState.category = document.getElementById('filter-category')?.value || '';

    // Keyword
    filterState.keyword = document.getElementById('filter-keyword')?.value || '';

    // Countries
    const countryCheckboxes = document.querySelectorAll('#country-checkboxes input[type="checkbox"]:checked');
    filterState.countries = Array.from(countryCheckboxes).map(cb => cb.value);

    // Skills
    const skillCheckboxes = document.querySelectorAll('.skill-checkbox:checked');
    filterState.skills = Array.from(skillCheckboxes).map(cb => cb.value);

    // Recency
    filterState.recency = document.getElementById('filter-recency')?.value || 'all';

    // Has Salary
    filterState.hasSalary = document.getElementById('filter-has-salary')?.checked || false;

    // Update filter count
    updateFilterCount();
}

/**
 * Cập nhật số lượng bộ lọc đang hoạt động
 */
function updateFilterCount() {
    let count = 0;

    if (filterState.category) count++;
    if (filterState.keyword) count++;
    if (filterState.countries.length > 0) count++;
    if (filterState.salaryMin > 0 || filterState.salaryMax < 500000) count++;
    if (filterState.skills.length > 0) count++;
    if (filterState.recency !== 'all') count++;
    if (filterState.hasSalary) count++;

    const countEl = document.getElementById('filter-count');
    if (countEl) {
        countEl.textContent = `${count} bộ lọc đang hoạt động`;
    }
}

/**
 * Áp dụng bộ lọc
 */
function applyFilters() {
    // Trigger custom event để các component khác biết
    const filterEvent = new CustomEvent('filtersChanged', {
        detail: filterState
    });
    document.dispatchEvent(filterEvent);

    showSuccess('Đã áp dụng bộ lọc!');
}

/**
 * Xóa tất cả bộ lọc
 */
function clearFilters() {
    // Reset form
    document.getElementById('filter-category').value = '';
    document.getElementById('filter-keyword').value = '';
    document.getElementById('filter-recency').value = 'all';
    document.getElementById('filter-has-salary').checked = false;

    // Uncheck all checkboxes
    document.querySelectorAll('#country-checkboxes input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });
    document.querySelectorAll('.skill-checkbox').forEach(cb => {
        cb.checked = false;
    });

    // Reset salary range
    document.getElementById('salary-min').value = 0;
    document.getElementById('salary-max').value = 500000;
    updateSalaryRange();

    // Reset state
    filterState = {
        countries: [],
        category: '',
        keyword: '',
        salaryMin: 0,
        salaryMax: 500000,
        skills: [],
        hasSalary: false,
        recency: 'all'
    };

    updateFilterCount();
    applyFilters();
}

/**
 * Build query params từ filter state
 */
function buildFilterParams() {
    const params = new URLSearchParams();

    if (filterState.keyword) {
        params.append('keyword', filterState.keyword);
    }

    if (filterState.category) {
        params.append('category', filterState.category);
    }

    if (filterState.countries.length > 0) {
        params.append('countries', filterState.countries.join(','));
    }

    if (filterState.hasSalary) {
        params.append('has_salary', 'true');
    }

    if (filterState.salaryMin > 0) {
        params.append('salary_min', filterState.salaryMin);
    }

    if (filterState.salaryMax < 500000) {
        params.append('salary_max', filterState.salaryMax);
    }

    if (filterState.skills.length > 0) {
        params.append('skills', filterState.skills.join(','));
    }

    if (filterState.recency !== 'all') {
        params.append('recency', filterState.recency);
    }

    return params.toString();
}

// Export để sử dụng ở các file khác
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { filterState, buildFilterParams, initFilters };
}
