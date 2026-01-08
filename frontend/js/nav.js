// ============================================================================
// NAVIGATION LOGIC
// Shared navigation functionality cho tất cả pages
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
});

/**
 * Initialize navigation
 */
function initNavigation() {
    highlightActivePage();
    setupMobileMenu();
    setupScrollBehavior();
}

/**
 * Highlight active page trong navigation
 */
function highlightActivePage() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.navbar-link');

    navLinks.forEach(link => {
        const linkPath = link.getAttribute('href');

        // Check if current page matches
        if (currentPath.endsWith(linkPath) ||
            (linkPath === 'index.html' && currentPath.endsWith('/'))) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

/**
 * Setup mobile menu toggle
 */
function setupMobileMenu() {
    const toggle = document.querySelector('.navbar-toggle');
    const menu = document.querySelector('.navbar-menu');

    if (toggle && menu) {
        toggle.addEventListener('click', () => {
            menu.classList.toggle('active');

            // Change icon
            const icon = toggle.textContent;
            toggle.textContent = icon === '☰' ? '✕' : '☰';
        });

        // Close menu when clicking a link
        const navLinks = menu.querySelectorAll('.navbar-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.remove('active');
                toggle.textContent = '☰';
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!toggle.contains(e.target) && !menu.contains(e.target)) {
                menu.classList.remove('active');
                toggle.textContent = '☰';
            }
        });
    }
}

/**
 * Setup scroll behavior (navbar transparency)
 */
function setupScrollBehavior() {
    const navbar = document.querySelector('.navbar');

    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.style.background = 'rgba(10, 14, 26, 0.95)';
            } else {
                navbar.style.background = 'rgba(10, 14, 26, 0.8)';
            }
        });
    }
}

/**
 * Smooth scroll to top
 */
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Export cho global use
window.scrollToTop = scrollToTop;
