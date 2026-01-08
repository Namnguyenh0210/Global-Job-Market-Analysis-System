// Jobs Explorer JavaScript
let allJobs = [];
let filteredJobs = [];
let currentPage = 1;
const jobsPerPage = 10;

document.addEventListener('DOMContentLoaded', async () => {
  await loadJobs();
});

async function loadJobs() {
  const data = await fetchJobs({ limit: 500 });
  if (data && data.jobs) {
    allJobs = data.jobs;
    filteredJobs = allJobs;
    renderJobs();
  }
}

function applyFilters() {
  const country = document.getElementById('filter-country').value;
  const keyword = document.getElementById('filter-keyword').value.toLowerCase();

  filteredJobs = allJobs.filter(job => {
    const matchCountry = !country || job.country.toUpperCase() === country;
    const matchKeyword = !keyword || job.job_title.toLowerCase().includes(keyword);
    return matchCountry && matchKeyword;
  });

  currentPage = 1;
  renderJobs();
}

function renderJobs() {
  const start = (currentPage - 1) * jobsPerPage;
  const end = start + jobsPerPage;
  const jobsToShow = filteredJobs.slice(start, end);

  const tbody = document.getElementById('jobs-tbody');

  if (jobsToShow.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">Không tìm thấy jobs</td></tr>';
    return;
  }


  tbody.innerHTML = jobsToShow.map(job => `
    <tr onclick="showJobDetail(${JSON.stringify(job).replace(/"/g, '&quot;')})">
      <td><strong>${truncateText(job.job_title, 50)}</strong></td>
      <td>${job.company}</td>
      <td><span class="badge badge-primary">${formatCountryName(job.country)}</span></td>
      <td>${job.salary_min ? formatCurrency(job.salary_min) : 'N/A'}</td>
      <td><button class="btn btn-sm btn-secondary">Xem</button></td>
    </tr>
  `).join('');

  renderPagination();
}

function renderPagination() {
  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  const paginationEl = document.getElementById('pagination');

  paginationEl.innerHTML = `
    <button ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">← Prev</button>
    <span style="padding: 0 var(--space-4); color: var(--text-secondary);">
      Page ${currentPage} / ${totalPages}
    </span>
    <button ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">Next →</button>
  `;
}

function changePage(page) {
  currentPage = page;
  renderJobs();
  scrollToTop();
}

function showJobDetail(job) {
  const modal = document.getElementById('job-modal');
  document.getElementById('modal-title').textContent = job.job_title;
  document.getElementById('modal-body').innerHTML = `
    <p><strong>Company:</strong> ${job.company}</p>
    <p><strong>Country:</strong> ${formatCountryName(job.country)} | <strong>City:</strong> ${job.city}</p>
    <p><strong>Salary:</strong> ${job.salary_min ? formatCurrency(job.salary_min) + ' - ' + formatCurrency(job.salary_max || job.salary_min) : 'N/A'}</p>
    <p><strong>Description:</strong></p>
    <p style="max-height: 300px; overflow-y: auto; padding: var(--space-4); background: var(--bg-tertiary); border-radius: var(--border-radius-md);">
      ${job.job_description || 'Không có mô tả'}
    </p>
  `;
  modal.classList.add('active');
}

function closeModal() {
  document.getElementById('job-modal').classList.remove('active');
}
