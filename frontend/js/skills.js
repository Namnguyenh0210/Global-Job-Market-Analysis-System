// Skills Page JavaScript
document.addEventListener('DOMContentLoaded', async () => {
    await loadSkillsChart();
    await loadSkillsSummary();
});

async function loadSkillsChart() {
    const data = await fetchTopSkills();
    if (!data || !data.data) return;

    const skillsData = data.data;
    const labels = skillsData.map(s => s.skill);
    const values = skillsData.map(s => s.count);

    const ctx = document.getElementById('chart-skills');

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Number of Jobs',
                data: values,
                backgroundColor: '#8b5cf680',
                borderColor: '#8b5cf6',
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: {
            ...getDefaultChartOptions(),
            indexAxis: 'y',
            plugins: { legend: { display: false } }
        }
    });
}

async function loadSkillsSummary() {
    const data = await fetchTopSkills();
    if (!data || !data.data) return;

    const top = data.data[0];
    const summary = `
    <p><strong>🏆 Kỹ năng hàng đầu:</strong> <strong>${top.skill}</strong> xuất hiện trong 
    <strong>${formatNumber(top.count)}</strong> jobs (<strong>${formatPercentage(top.percentage)}</strong>).</p>
    ${data.data.map(s => `
      <p><strong>${s.skill}:</strong> ${formatNumber(s.count)} jobs (${formatPercentage(s.percentage)})</p>
    `).join('')}
  `;
    document.getElementById('skills-summary').innerHTML = summary;
}
