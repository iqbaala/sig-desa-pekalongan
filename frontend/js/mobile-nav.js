/**
 * 📱 LABTANAM Mobile Bottom Navigation Controller
 * Modern app-like navigation with smooth animations and interactions
 */

class MobileNavController {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.lastScrollY = window.scrollY;
        this.isScrolling = false;
        this.hideTimeout = null;
        
        this.init();
    }

    init() {
        this.createBottomNav();
        this.setupEventListeners();
        this.setActivePage();
        this.handleScrollBehavior();
        
        // Debug: Log current page detection
        console.log('🔍 Mobile Nav Debug:', {
            currentPage: this.currentPage,
            pathname: window.location.pathname,
            bodyClasses: document.body.className
        });
    }

    /**
     * Get current page from URL or body class
     */
    getCurrentPage() {
        // First check body classes (most reliable)
        const bodyClasses = document.body.className;
        if (bodyClasses.includes('page-edukasi')) return 'edukasi';
        if (bodyClasses.includes('page-monitoring')) return 'monitoring';
        if (bodyClasses.includes('page-chatbot')) return 'chatbot';
        if (bodyClasses.includes('page-komunitas')) return 'komunitas';
        if (bodyClasses.includes('page-home')) return 'home';
        
        // Fallback to URL detection
        const path = window.location.pathname;
        const fileName = path.split('/').pop() || 'index.html';
        
        if (fileName === 'edukasi.html' || path.includes('edukasi')) return 'edukasi';
        if (fileName === 'monitoring.html' || path.includes('monitoring')) return 'monitoring';
        if (fileName === 'chatbot.html' || path.includes('chatbot')) return 'chatbot';
        if (fileName === 'komunitas.html' || path.includes('komunitas')) return 'komunitas';
        if (fileName === 'index.html' || fileName === '' || path === '/' || path.endsWith('/')) return 'home';
        
        return 'home';
    }

    /**
     * Create bottom navigation HTML
     */
    createBottomNav() {
        const bottomNavHTML = `
            <nav class="bottom-nav bottom-nav-slide-up" id="bottom-nav">
                <div class="bottom-nav-items">
                    <a href="index.html" class="bottom-nav-item" data-page="home">
                        <i class="fas fa-home nav-icon"></i>
                        <span class="nav-label">Beranda</span>
                    </a>
                    <a href="edukasi.html" class="bottom-nav-item" data-page="edukasi">
                        <i class="fas fa-graduation-cap nav-icon"></i>
                        <span class="nav-label">Edukasi</span>
                    </a>
                    <a href="monitoring.html" class="bottom-nav-item" data-page="monitoring">
                        <i class="fas fa-chart-line nav-icon"></i>
                        <span class="nav-label">Monitor</span>
                    </a>
                    <a href="chatbot.html" class="bottom-nav-item" data-page="chatbot">
                        <i class="fas fa-robot nav-icon"></i>
                        <span class="nav-label">AI Chat</span>
                        <span class="nav-badge" id="chat-badge">1</span>
                    </a>
                    <a href="komunitas.html" class="bottom-nav-item" data-page="komunitas">
                        <i class="fas fa-users nav-icon"></i>
                        <span class="nav-label">Komunitas</span>
                    </a>
                </div>
            </nav>
        `;

        // Add to body
        document.body.insertAdjacentHTML('beforeend', bottomNavHTML);
        
        // Add page class to body for CSS targeting
        document.body.classList.add(`page-${this.currentPage}`);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const navItems = document.querySelectorAll('.bottom-nav-item');
        
        navItems.forEach(item => {
            // Click handler with loading state
            item.addEventListener('click', (e) => {
                this.handleNavClick(e, item);
            });

            // Touch feedback
            item.addEventListener('touchstart', (e) => {
                this.addTouchFeedback(item);
            });

            item.addEventListener('touchend', (e) => {
                this.removeTouchFeedback(item);
            });
        });

        // Handle scroll behavior
        let scrollTimer = null;
        window.addEventListener('scroll', () => {
            if (scrollTimer) {
                clearTimeout(scrollTimer);
            }
            
            this.handleScroll();
            
            scrollTimer = setTimeout(() => {
                this.isScrolling = false;
            }, 150);
        });

        // Handle page visibility
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseAnimations();
            } else {
                this.resumeAnimations();
            }
        });
    }

    /**
     * Handle navigation click with loading state
     */
    handleNavClick(e, item) {
        const targetPage = item.dataset.page;
        
        // Don't navigate if already on the same page
        if (targetPage === this.currentPage) {
            e.preventDefault();
            this.animateCurrentPageIndicator(item);
            return;
        }

        // Add loading state
        this.setLoadingState(item, true);
        
        // Remove loading state after navigation (fallback)
        setTimeout(() => {
            this.setLoadingState(item, false);
        }, 2000);
    }

    /**
     * Set active page indicator
     */
    setActivePage() {
        const navItems = document.querySelectorAll('.bottom-nav-item');
        
        navItems.forEach(item => {
            const itemPage = item.dataset.page;
            if (itemPage === this.currentPage) {
                item.classList.add('active');
                this.animateActiveIndicator(item);
                
                // Debug: Log active item
                console.log('✅ Active nav item:', itemPage);
            } else {
                item.classList.remove('active');
            }
        });
        
        // Force re-detection if no active item found
        const activeItems = document.querySelectorAll('.bottom-nav-item.active');
        if (activeItems.length === 0) {
            console.log('⚠️ No active nav item found, re-detecting...');
            this.currentPage = this.getCurrentPage();
            this.setActivePage();
        }
    }

    /**
     * Animate active indicator
     */
    animateActiveIndicator(item) {
        const icon = item.querySelector('.nav-icon');
        const label = item.querySelector('.nav-label');
        
        // Bounce animation for icon
        icon.style.animation = 'none';
        setTimeout(() => {
            icon.style.animation = 'navIconBounce 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        }, 10);
        
        // Fade in label
        label.style.opacity = '0';
        setTimeout(() => {
            label.style.opacity = '1';
        }, 200);
    }

    /**
     * Animate current page indicator when tapped again
     */
    animateCurrentPageIndicator(item) {
        const icon = item.querySelector('.nav-icon');
        
        // Pulse animation
        icon.style.animation = 'navIconPulse 0.4s ease-in-out';
        
        setTimeout(() => {
            icon.style.animation = '';
        }, 400);
    }

    /**
     * Set loading state for navigation item
     */
    setLoadingState(item, isLoading) {
        if (isLoading) {
            item.classList.add('loading');
            const icon = item.querySelector('.nav-icon');
            const originalClass = icon.className;
            icon.dataset.originalClass = originalClass;
            icon.className = 'fas fa-spinner nav-icon';
        } else {
            item.classList.remove('loading');
            const icon = item.querySelector('.nav-icon');
            if (icon.dataset.originalClass) {
                icon.className = icon.dataset.originalClass;
                delete icon.dataset.originalClass;
            }
        }
    }

    /**
     * Add touch feedback
     */
    addTouchFeedback(item) {
        item.style.transform = 'scale(0.95)';
        item.style.background = 'rgba(22, 163, 74, 0.15)';
    }

    /**
     * Remove touch feedback
     */
    removeTouchFeedback(item) {
        setTimeout(() => {
            item.style.transform = '';
            item.style.background = '';
        }, 100);
    }

    /**
     * Handle scroll behavior - hide/show nav
     */
    handleScroll() {
        const currentScrollY = window.scrollY;
        const bottomNav = document.getElementById('bottom-nav');
        
        if (!bottomNav) return;

        // Hide nav when scrolling down, show when scrolling up
        if (currentScrollY > this.lastScrollY && currentScrollY > 100) {
            // Scrolling down
            bottomNav.classList.add('bottom-nav-hidden');
        } else {
            // Scrolling up or at top
            bottomNav.classList.remove('bottom-nav-hidden');
        }

        this.lastScrollY = currentScrollY;
        this.isScrolling = true;
    }

    /**
     * Handle scroll behavior for better UX
     */
    handleScrollBehavior() {
        let ticking = false;
        
        const updateNavVisibility = () => {
            const bottomNav = document.getElementById('bottom-nav');
            if (!bottomNav) return;
            
            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;
            
            // Show nav when near bottom of page
            if (scrollY + windowHeight >= documentHeight - 100) {
                bottomNav.classList.remove('bottom-nav-hidden');
            }
            
            ticking = false;
        };
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateNavVisibility);
                ticking = true;
            }
        });
    }

    /**
     * Show notification badge
     */
    showBadge(page, count = '') {
        const navItem = document.querySelector(`[data-page="${page}"]`);
        if (!navItem) return;
        
        const badge = navItem.querySelector('.nav-badge');
        if (badge) {
            badge.textContent = count;
            badge.classList.add('show');
        }
    }

    /**
     * Hide notification badge
     */
    hideBadge(page) {
        const navItem = document.querySelector(`[data-page="${page}"]`);
        if (!navItem) return;
        
        const badge = navItem.querySelector('.nav-badge');
        if (badge) {
            badge.classList.remove('show');
        }
    }

    /**
     * Pause animations when page is hidden
     */
    pauseAnimations() {
        const bottomNav = document.getElementById('bottom-nav');
        if (bottomNav) {
            bottomNav.style.animationPlayState = 'paused';
        }
    }

    /**
     * Resume animations when page is visible
     */
    resumeAnimations() {
        const bottomNav = document.getElementById('bottom-nav');
        if (bottomNav) {
            bottomNav.style.animationPlayState = 'running';
        }
    }

    /**
     * Update active page (for SPA-like behavior)
     */
    updateActivePage(newPage) {
        // Remove old page class
        document.body.classList.remove(`page-${this.currentPage}`);
        
        // Set new page
        this.currentPage = newPage;
        document.body.classList.add(`page-${this.currentPage}`);
        
        // Update active states
        this.setActivePage();
    }

    /**
     * Add custom animations
     */
    static addCustomAnimations() {
        if (document.querySelector('#mobile-nav-animations')) return;
        
        const style = document.createElement('style');
        style.id = 'mobile-nav-animations';
        style.textContent = `
            @keyframes navIconBounce {
                0% { transform: translateY(0) scale(1); }
                50% { transform: translateY(-4px) scale(1.2); }
                100% { transform: translateY(-2px) scale(1.1); }
            }
            
            @keyframes navIconPulse {
                0% { transform: translateY(-2px) scale(1.1); }
                50% { transform: translateY(-4px) scale(1.3); }
                100% { transform: translateY(-2px) scale(1.1); }
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Initialize for all pages
     */
    static init() {
        // Only initialize on mobile
        if (window.innerWidth <= 768) {
            MobileNavController.addCustomAnimations();
            new MobileNavController();
        }
        
        // Re-initialize on resize
        window.addEventListener('resize', () => {
            const isMobile = window.innerWidth <= 768;
            const hasBottomNav = document.getElementById('bottom-nav');
            
            if (isMobile && !hasBottomNav) {
                MobileNavController.addCustomAnimations();
                new MobileNavController();
            } else if (!isMobile && hasBottomNav) {
                hasBottomNav.remove();
                document.body.classList.remove('page-home', 'page-edukasi', 'page-monitoring', 'page-chatbot', 'page-komunitas');
            }
        });
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', MobileNavController.init);
} else {
    MobileNavController.init();
}

// Export for manual initialization
window.MobileNavController = MobileNavController;