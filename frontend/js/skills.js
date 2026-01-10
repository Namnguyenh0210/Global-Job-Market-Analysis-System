// ============================================================================
// SKILLS PAGE JAVASCRIPT - Full Functionality with Real Data Analysis
// ============================================================================

const SKILL_ICONS = {
    'python': '🐍',
    'sql': '🗄️',
    'aws': '☁️',
    'excel': '📊',
    'english': '🗣️'
};

const SKILL_COLORS = {
    'python': '#8b5cf6',
    'sql': '#06b6d4',
    'aws': '#f59e0b',
    'excel': '#10b981',
    'english': '#f43f5e'
};

let skillsChart = null;

document.addEventListener('DOMContentLoaded', async () => {
    await Promise.all([
        loadSkillsOverview(),
        loadSkillsChart(),
        loadSkillsByCategory(),
        loadSkillCombinations()
    ]);
});

/**
 * Load skills overview cards
 */
async function loadSkillsOverview() {
    const data = await fetchTopSkills();

    if (!data || !data.data) {
        showError('Không thể tải dữ liệu kỹ năng');
        return;
    }

    const grid = document.getElementById('skills-grid');

    grid.innerHTML = data.data.map((skill, index) => {
        const icon = SKILL_ICONS[skill.skill.toLowerCase()] || '🎯';
        const color = SKILL_COLORS[skill.skill.toLowerCase()] || '#8b5cf6';

        return `
            <div class="skill-card animate-on-scroll" style="--skill-color: ${color}">
                <div class="skill-rank">#${index + 1}</div>
                <div class="skill-icon">${icon}</div>
                <div class="skill-name">${skill.skill}</div>
                <div class="skill-percentage">${skill.percentage.toFixed(1)}%</div>
                <div class="skill-label">của tổng số việc làm</div>
                <div class="skill-bar">
                    <div class="skill-bar-fill" style="width: ${skill.percentage}%; background: ${color}"></div>
                </div>
                <button class="btn btn-small skill-btn" onclick="navigateToSkillJobs('${skill.skill}')">
                    Xem việc làm
                </button>
            </div>
        `;
    }).join('');
}

/**
 * Load skills demand chart
 */
async function loadSkillsChart() {
    const data = await fetchTopSkills();

    if (!data || !data.data) return;

    const labels = data.data.map(s => s.skill);
    const values = data.data.map(s => s.percentage);
    const colors = data.data.map(s => SKILL_COLORS[s.skill.toLowerCase()] || '#8b5cf6');

    const ctx = document.getElementById('chart-skills');

    if (skillsChart) {
        skillsChart.destroy();
    }

    skillsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Tỷ lệ yêu cầu (%)',
                data: values,
                backgroundColor: colors.map(c => c + '80'),
                borderColor: colors,
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
                            return `${context.parsed.x.toFixed(1)}% việc làm yêu cầu`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    max: Math.max(...values) * 1.2,
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
                        color: '#94a3b8',
                        font: {
                            size: 14,
                            weight: '600'
                        }
                    }
                }
            }
        }
    });
}

/**
 * Load skills by job category
 */
async function loadSkillsByCategory() {
    const jobsData = await fetchJobs({ limit: 500 });

    if (!jobsData || !jobsData.jobs) return;

    const skillsByCategory = {
        'Data Analyst': { python: 0, sql: 0, aws: 0, excel: 0, english: 0 },
        'Data Engineer': { python: 0, sql: 0, aws: 0, excel: 0, english: 0 },
        'Software Engineer': { python: 0, sql: 0, aws: 0, excel: 0, english: 0 }
    };

    const categoryTotals = {
        'Data Analyst': 0,
        'Data Engineer': 0,
        'Software Engineer': 0
    };

    jobsData.jobs.forEach(job => {
        const category = job.category || 'Unknown';
        if (!skillsByCategory[category]) return;

        categoryTotals[category]++;

        const description = (job.job_description || '').toLowerCase();

        if (description.includes('python')) skillsByCategory[category].python++;
        if (description.includes('sql')) skillsByCategory[category].sql++;
        if (description.includes('aws')) skillsByCategory[category].aws++;
        if (description.includes('excel')) skillsByCategory[category].excel++;
        if (description.includes('english')) skillsByCategory[category].english++;
    });

    const categoryEl = document.getElementById('category-skills');

    let html = '';
    Object.keys(skillsByCategory).forEach(category => {
        const skills = skillsByCategory[category];
        const total = categoryTotals[category];

        if (total === 0) return;

        html += `
            <div class="category-skill-card">
                <h4>📂 ${category}</h4>
                <div class="category-skill-list">
                    ${Object.entries(skills).map(([skill, count]) => {
            const percentage = ((count / total) * 100).toFixed(1);
            const color = SKILL_COLORS[skill] || '#8b5cf6';
            const icon = SKILL_ICONS[skill] || '🎯';

            return `
                            <div class="category-skill-item">
                                <span class="skill-icon-small">${icon}</span>
                                <span class="skill-name-small">${skill}</span>
                                <div class="skill-mini-bar">
                                    <div class="skill-mini-fill" style="width: ${percentage}%; background: ${color}"></div>
                                </div>
                                <span class="skill-percentage-small">${percentage}%</span>
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
        `;
    });

    categoryEl.innerHTML = html;
}

/**
 * Load common skill combinations
 */
async function loadSkillCombinations() {
    const jobsData = await fetchJobs({ limit: 500 });

    if (!jobsData || !jobsData.jobs) return;

    const combos = {};
    const SKILLS = ['python', 'sql', 'aws', 'excel', 'english'];

    jobsData.jobs.forEach(job => {
        const description = (job.job_description || '').toLowerCase();
        const foundSkills = SKILLS.filter(skill => description.includes(skill));

        if (foundSkills.length >= 2) {
            // Create combinations
            for (let i = 0; i < foundSkills.length; i++) {
                for (let j = i + 1; j < foundSkills.length; j++) {
                    const combo = [foundSkills[i], foundSkills[j]].sort().join(' + ');
                    combos[combo] = (combos[combo] || 0) + 1;
                }
            }
        }
    });

    const topCombos = Object.entries(combos)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);

    const combosEl = document.getElementById('skill-combos');

    combosEl.innerHTML = topCombos.map(([combo, count], index) => {
        const skills = combo.split(' + ');
        const icons = skills.map(s => SKILL_ICONS[s] || '🎯');

        return `
            <div class="combo-card" onclick="navigateToComboJobs('${skills[0]}', '${skills[1]}')" style="cursor: pointer;">
                <div class="combo-rank">#${index + 1}</div>
                <div class="combo-skills">
                    <span class="combo-skill">${icons[0]} ${skills[0]}</span>
                    <span class="combo-plus">+</span>
                    <span class="combo-skill">${icons[1]} ${skills[1]}</span>
                </div>
                <div class="combo-count">${count} việc làm</div>
            </div>
        `;
    }).join('');
}

/**
 * Navigate to Jobs page filtered by skill combination
 */
function navigateToComboJobs(skill1, skill2) {
    // Navigate to jobs page with keyword containing both skills
    window.location.href = `jobs.html?keyword=${skill1}+${skill2}`;
}

/**
 * Navigate to Jobs filtered by skill
 */
function navigateToSkillJobs(skill) {
    window.location.href = `jobs.html?keyword=${skill}`;
}

/**
 * Download chart
 */
function downloadChart() {
    if (!skillsChart) return;

    const canvas = document.getElementById('chart-skills');
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'skills_demand.png';
    link.href = url;
    link.click();

    showSuccess('Đã tải xuống biểu đồ!');
}
