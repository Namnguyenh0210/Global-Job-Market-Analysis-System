// ============================================================================
// INTERACTIVE WORLD MAP - Job Distribution Visualization
// ============================================================================

const REGIONS = {
    'North America': {
        countries: ['US', 'CA'],
        color: '#10b981',
        position: { x: 150, y: 100 }
    },
    'Europe': {
        countries: ['GB', 'DE', 'NL'],
        color: '#06b6d4',
        position: { x: 500, y: 120 }
    },
    'Asia Pacific': {
        countries: ['AU', 'SG', 'NZ'],
        color: '#8b5cf6',
        position: { x: 750, y: 250 }
    }
};

let jobsByRegion = {};
let totalJobs = 0;
let selectedRegion = null;

document.addEventListener('DOMContentLoaded', async () => {
    await loadMapData();
    renderWorldMap();
});

/**
 * Load job data by region
 */
async function loadMapData() {
    try {
        const [jobsData, regionData] = await Promise.all([
            fetchKPI(),
            fetchJobsByRegion()
        ]);

        totalJobs = jobsData.total_jobs || 0;
        document.getElementById('total-jobs').textContent = formatNumber(totalJobs);

        // Group jobs by region
        if (regionData && regionData.data) {
            regionData.data.forEach(item => {
                jobsByRegion[item.region] = item.count;
            });
        }
    } catch (error) {
        console.error('Error loading map data:', error);
    }
}

/**
 * Render interactive world map
 */
function renderWorldMap() {
    const mapContainer = document.getElementById('world-map');

    const svg = `
        <svg viewBox="0 0 1000 500" class="world-map-svg">
            <!-- Background -->
            <rect width="1000" height="500" fill="rgba(15, 23, 42, 0.5)" rx="16"/>
            
            <!-- Grid lines -->
            <g class="grid" opacity="0.1">
                ${Array.from({ length: 10 }, (_, i) => `
                    <line x1="${i * 100}" y1="0" x2="${i * 100}" y2="500" stroke="white" stroke-width="1"/>
                    <line x1="0" y1="${i * 50}" x2="1000" y2="${i * 50}" stroke="white" stroke-width="1"/>
                `).join('')}
            </g>
            
            <!-- Regions -->
            ${Object.entries(REGIONS).map(([region, data]) => {
        const jobs = jobsByRegion[region] || 0;
        const radius = Math.max(30, Math.min(80, jobs / 10));

        return `
                    <g class="region-marker" data-region="${region}" onclick="selectRegion('${region}')" style="cursor: pointer;">
                        <circle 
                            cx="${data.position.x}" 
                            cy="${data.position.y}" 
                            r="${radius}" 
                            fill="${data.color}" 
                            opacity="0.3"
                            class="region-circle"
                        />
                        <circle 
                            cx="${data.position.x}" 
                            cy="${data.position.y}" 
                            r="${radius * 0.6}" 
                            fill="${data.color}" 
                            opacity="0.6"
                            class="region-circle-inner"
                        />
                        <text 
                            x="${data.position.x}" 
                            y="${data.position.y - radius - 10}" 
                            text-anchor="middle" 
                            fill="white" 
                            font-size="14" 
                            font-weight="700"
                            class="region-label"
                        >
                            ${region}
                        </text>
                        <text 
                            x="${data.position.x}" 
                            y="${data.position.y + 5}" 
                            text-anchor="middle" 
                            fill="white" 
                            font-size="20" 
                            font-weight="700"
                            class="region-count"
                        >
                            ${formatNumber(jobs)}
                        </text>
                        <text 
                            x="${data.position.x}" 
                            y="${data.position.y + 25}" 
                            text-anchor="middle" 
                            fill="rgba(255,255,255,0.7)" 
                            font-size="12"
                        >
                            việc làm
                        </text>
                    </g>
                `;
    }).join('')}
            
            <!-- Connection lines -->
            <g class="connections" opacity="0.2">
                <line x1="150" y1="100" x2="500" y2="120" stroke="#667eea" stroke-width="2" stroke-dasharray="5,5"/>
                <line x1="500" y1="120" x2="750" y2="250" stroke="#667eea" stroke-width="2" stroke-dasharray="5,5"/>
            </g>
        </svg>
    `;

    mapContainer.innerHTML = svg;
}

/**
 * Select a region
 */
function selectRegion(regionName) {
    selectedRegion = regionName;
    const region = REGIONS[regionName];
    const jobs = jobsByRegion[regionName] || 0;
    const percentage = totalJobs > 0 ? ((jobs / totalJobs) * 100).toFixed(1) : 0;

    // Update selected region display
    document.getElementById('selected-region').textContent = regionName;

    // Show region details
    const detailsCard = document.getElementById('region-details');
    detailsCard.style.display = 'block';

    document.getElementById('region-name').textContent = `📍 ${regionName}`;
    document.getElementById('region-jobs').textContent = formatNumber(jobs);
    document.getElementById('region-countries').textContent = region.countries.length;
    document.getElementById('region-percentage').textContent = `${percentage}%`;

    // Highlight selected region
    document.querySelectorAll('.region-marker').forEach(marker => {
        marker.classList.remove('selected');
    });
    document.querySelector(`[data-region="${regionName}"]`).classList.add('selected');

    // Scroll to details
    detailsCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * View jobs for selected region
 */
function viewRegionJobs() {
    if (!selectedRegion) return;

    const region = REGIONS[selectedRegion];
    const countries = region.countries.join(',');

    window.location.href = `jobs.html?country=${countries}`;
}
