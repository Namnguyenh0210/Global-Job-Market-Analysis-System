// ============================================================================
// HOME PAGE JAVASCRIPT
// ============================================================================

document.addEventListener('DOMContentLoaded', async () => {
    await loadStatsPreview();
});

/**
 * Load và hiển thị preview statistics
 */
async function loadStatsPreview() {
    try {
        const kpiData = await fetchKPI();

        if (kpiData) {
            // Animate numbers
            animateNumber(
                document.getElementById('stat-jobs'),
                kpiData.total_jobs
            );

            animateNumber(
                document.getElementById('stat-countries'),
                kpiData.total_countries
            );

            animateNumber(
                document.getElementById('stat-companies'),
                kpiData.total_companies
            );

            // Salary percentage
            const salaryEl = document.getElementById('stat-salary');
            animateNumber(
                salaryEl,
                Math.round(kpiData.salary_percentage)
            );
            // Add % suffix sau khi animate xong
            setTimeout(() => {
                salaryEl.textContent = formatPercentage(kpiData.salary_percentage);
            }, 1000);
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}
