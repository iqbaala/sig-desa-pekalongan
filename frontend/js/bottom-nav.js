/**
 * 🚀 LABTANAM Bottom Navigation Controller
 * Manages bottom navigation state, active indicators, and page transitions
 */

class BottomNavController {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.navItems = [];
        this.init();
    }
    
    /**
     * Get current page name from URL
     */
    getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';
        const pageName = filename.replace('.html', '') || 'index';
        
        // Handle different page names
        const pageMap = {
            'index': 'index',
            'beranda': 'index',
            'home': 'index',
            'edukasi': 'edukasi',
            'education': 'edukasi',
            'monitoring': 'monitoring',
            'monitor': 'monitoring',
            'chatbot': 'chatbot',
            'ai': 'chatbot',
            'komunitas': 'komunitas',
            'community': 'komunitas'
        };
        
        return pageMap[pageName] || pageName;
    }
    
    /**
     * Initialize bottom navigation
     */
    init() {
        this.cacheNavItems();
        this.setActiveNavItem();
        this.setupEventListeners();
        this.setupPageVisibilityHandler();
        this.addAccessibilityFeatures();
    }
    
    /**
     * Cache navigation items for better performance
     */
    cacheNavItems() {
        this.navItems = Array.from(document.querySelectorAll('.bottom-nav-item'));
    }
    
    /**
     * Set active navigation item based on current page
     */
    setActiveNavItem() {
        // Remove active class from all items
        this.navItems.forEach(item => {
            item.classList.remove('active');
            item.setAttribute('aria-current', 'false');
        });
        
        // Add active class to current page
        const currentNavItem = document.querySelector(`[data-page="${this.currentPage}"]`);
        if (currentNavItem) {
            currentNavItem.classList.add('active');
            currentNavItem.setAttribute('aria-current', 'page');
            
            // Announce to screen readers
            this.announcePageChange(currentNavItem);
        }
    }
    
    /**
     * Setup event listeners for navigation items
     */
    setupEventListeners() {
        this.navItems.forEach(item => {
            // Click handler
            item.addEventListener('click', (e) => this.handleNavClick(e, item));
            
            // Touch handlers for better mobile experience
            item.addEventListener('touchstart', (e) => this.handleTouchStart(e, item));
            item.addEventListener('touchend', (e) => this.handleTouchEnd(e, item));
            
            // Keyboard navigation
            item.addEventListener('keydown', (e) => this.handleKeyDown(e, item));
        });
    }
    
    /**
     * Handle navigation item click
     */
    handleNavClick(event, item) {
        // Prevent default if we're already on this page
        const targetPage = item.getAttribute('data-page');
        if (targetPage === this.currentPage) {
            event.preventDefault();
            this.scrollToTop();
            return;
        }
        
        // Add loading state
        this.addLoadingState(item);
        
        // Update active state immediately for better UX
        this.updateActiveState(item);
        
        // Add haptic feedback if available
        this.addHapticFeedback();
    }
    
    /**
     * Handle touch start for mobile
     */
    handleTouchStart(event, item) {
        item.classList.add('touch-active');
    }
    
    /**
     * Handle touch end for mobile
     */
    handleTouchEnd(event, item) {
        setTimeout(() => {
            item.classList.remove('touch-active');
        }, 150);
    }
    
    /**
     * Handle keyboard navigation
     */
    handleKeyDown(event, item) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            item.click();
        }
    }
    
    /**
     * Update active state for immediate feedback
     */
    updateActiveState(item) {
        this.navItems.forEach(navItem => {
            navItem.classList.remove('active');
            navItem.setAttribute('aria-current', 'false');
        });
        
        item.classList.add('active');
        item.setAttribute('aria-current', 'page');
    }
    
    /**
     * Add loading state to navigation item
     */
    addLoadingState(item) {
        const icon = item.querySelector('i');
        if (!icon) return;
        
        const originalClass = icon.className;
        
        // Store original class for restoration
        item.setAttribute('data-original-icon', originalClass);
        
        // Show loading spinner
        icon.className = 'fas fa-spinner fa-spin text-xl';
        
        // Restore original icon after navigation or timeout
        const restoreIcon = () => {
            const storedClass = item.getAttribute('data-original-icon');
            if (storedClass) {
                icon.className = storedClass;
                item.removeAttribute('data-original-icon');
            }
        };
        
        // Restore after page load or timeout
        window.addEventListener('load', restoreIcon, { once: true });
        setTimeout(restoreIcon, 3000); // Fallback timeout
    }
    
    /**
     * Setup page visibility handler for browser navigation
     */
    setupPageVisibilityHandler() {
        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.currentPage = this.getCurrentPage();
                this.setActiveNavItem();
            }
        });
        
        // Handle browser back/forward buttons
        window.addEventListener('popstate', () => {
            this.currentPage = this.getCurrentPage();
            this.setActiveNavItem();
        });
        
        // Handle page load
        window.addEventListener('load', () => {
            this.currentPage = this.getCurrentPage();
            this.setActiveNavItem();
        });
    }
    
    /**
     * Add accessibility features
     */
    addAccessibilityFeatures() {
        // Add ARIA labels if not present
        this.navItems.forEach(item => {
            if (!item.getAttribute('aria-label')) {
                const label = item.querySelector('.bottom-nav-label');
                if (label) {
                    item.setAttribute('aria-label', `Navigate to ${label.textContent}`);
                }
            }
            
            // Add role if not present
            if (!item.getAttribute('role')) {
                item.setAttribute('role', 'tab');
            }
        });
        
        // Add navigation role to container
        const navContainer = document.getElementById('bottom-nav');
        if (navContainer && !navContainer.getAttribute('role')) {
            navContainer.setAttribute('role', 'tablist');
            navContainer.setAttribute('aria-label', 'Main navigation');
        }
    }
    
    /**
     * Announce page change to screen readers
     */
    announcePageChange(item) {
        const label = item.querySelector('.bottom-nav-label');
        if (label) {
            const announcement = `Navigated to ${label.textContent} page`;
            this.announceToScreenReader(announcement);
        }
    }
    
    /**
     * Announce message to screen readers
     */
    announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        // Remove after announcement
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }
    
    /**
     * Scroll to top of page
     */
    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
    
    /**
     * Add haptic feedback for supported devices
     */
    addHapticFeedback() {
        if ('vibrate' in navigator) {
            navigator.vibrate(50); // Light vibration
        }
    }
    
    /**
     * Update navigation for new page (called from other pages)
     */
    updateForPage(pageName) {
        this.currentPage = pageName;
        this.setActiveNavItem();
    }
}

// Initialize bottom navigation when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if bottom nav exists
    if (document.getElementById('bottom-nav')) {
        window.bottomNavController = new BottomNavController();
    }
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BottomNavController;
}