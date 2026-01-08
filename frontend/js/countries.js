// Countries Page JavaScript
const countryFlags = {
    'VN': '🇻🇳', 'SG': '🇸🇬', 'TH': '🇹🇭', 'ID': '🇮🇩',
    'US': '🇺🇸', 'GB': '🇬🇧', 'DE': '🇩🇪'
};

const countryNames = {
    'VN': 'Vietnam', 'SG': 'Singapore', 'TH': 'Thailand', 'ID': 'Indonesia',
    'US': 'United States', 'GB': 'United Kingdom', 'DE': 'Germany'
};

document.addEventListener('DOMContentLoaded', async () => {
    await loadCountryCards();
    await loadCountriesChart();
});

async function loadCountryCards() {
    const data = await fetchJobsByCountry();
    if (!data || !data.data) return;

    const grid = document.getElementById('countries-grid');
    grid.innerHTML = data.data.map(c => `
    <div class="country-card">
      <div class="country-flag">${countryFlags[c.country] || '🌏'}</div>
      <div class="country-name">${countryNames[c.country] || c.country}</div>
      <div class="country-jobs">${formatNumber(c.count)}</div>
      <div style="color: var(--text-muted); font-size: var(--text-sm);">jobs</div>
    </div>
  `).join('');
}

async function loadCountriesChart() {
    const data = await fetchJobsByCountry();
    if (!data || !data.data) return;

    const labels = data.data.map(c => countryNames[c.country] || c.country);
    const values = data.data.map(c => c.count);

    new Chart(document.getElementById('chart-countries'), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Jobs',
                data: values,
                backgroundColor: '#06b6d480',
                borderColor: '#06b6d4',
                borderWidth: 2,
                borderRadius: 8
            }]
        },
        options: getDefaultChartOptions()
    });
}
