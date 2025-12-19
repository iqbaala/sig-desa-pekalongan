/**
 * 🎨 LABTANAM Animation Controller
 * Manages page animations, scroll effects, and micro-interactions
 */

class AnimationController {
    constructor() {
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.scrollElements = [];
        this.init();
    }

    init() {
        this.setupIntersectionObserver();
        this.setupScrollAnimations();
        this.setupButtonAnimations();
        this.setupLoadingStates();
        this.setupMobileOptimizations();
        
        // Initialize on DOM load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initPageAnimations());
        } else {
            this.initPageAnimations();
        }
    }

    /**
     * Initialize page-specific animations
     */
    initPageAnimations() {
        // Stagger animations for elements with .fade-in-up
        this.staggerElements('.fade-in-up', 100);
        
        // Initialize text reveal animations
        this.initTextReveal();
        
        // Setup card hover effects
        this.setupCardAnimations();
        
        // Initialize mobile menu animations
        this.setupMobileMenu();
    }

    /**
     * Setup Intersection Observer for scroll-triggered animations
     */
    setupIntersectionObserver() {
        if (this.isReducedMotion) return;

        const options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    const animationClass = element.dataset.animation || 'fade-in-up';
                    const delay = element.dataset.delay || 0;
                    
                    setTimeout(() => {
                        element.classList.add(animationClass);
                        element.classList.add('animate');
                    }, delay);
                    
                    this.observer.unobserve(element);
                }
            });
        }, options);

        // Observe elements with data-animation attribute
        document.querySelectorAll('[data-animation]').forEach(el => {
            el.style.opacity = '0';
            this.observer.observe(el);
        });
    }

    /**
     * Stagger animation for multiple elements
     */
    staggerElements(selector, delay = 100) {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el, index) => {
            if (!this.isReducedMotion) {
                el.style.animationDelay = `${index * delay}ms`;
            }
        });
    }

    /**
     * Initialize text reveal animations
     */
    initTextReveal() {
        const textElements = document.querySelectorAll('.text-reveal');
        
        textElements.forEach(element => {
            const text = element.textContent;
            const chars = text.split('').map((char, index) => {
                const span = document.createElement('span');
                span.className = 'char';
                span.textContent = char === ' ' ? '\u00A0' : char;
                span.style.animationDelay = `${index * 50}ms`;
                return span;
            });
            
            element.innerHTML = '';
            chars.forEach(char => element.appendChild(char));
        });
    }

    /**
     * Setup button animations and interactions
     */
    setupButtonAnimations() {
        // Add ripple effect to buttons
        document.querySelectorAll('.btn-animate, button, .button').forEach(btn => {
            btn.addEventListener('click', this.createRippleEffect.bind(this));
        });

        // Add loading states to form buttons
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', this.handleFormSubmit.bind(this));
        });
    }

    /**
     * Create ripple effect on button click
     */
    createRippleEffect(e) {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const ripple = document.createElement('span');
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            transform: scale(0);
            animation: ripple 0.6s ease-out;
            pointer-events: none;
        `;

        // Ensure button has relative positioning
        if (getComputedStyle(button).position === 'static') {
            button.style.position = 'relative';
        }
        button.style.overflow = 'hidden';

        button.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    /**
     * Setup card hover animations
     */
    setupCardAnimations() {
        const cards = document.querySelectorAll('.card, .feature-card, .stats-card');
        
        cards.forEach(card => {
            card.classList.add('card-hover');
            
            // Add subtle parallax effect on mobile
            if (window.innerWidth <= 768) {
                card.addEventListener('touchstart', (e) => {
                    card.style.transform = 'scale(0.98)';
                });
                
                card.addEventListener('touchend', (e) => {
                    card.style.transform = 'scale(1)';
                });
            }
        });
    }

    /**
     * Setup mobile menu animations
     */
    setupMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                const isOpen = mobileMenu.classList.contains('show');
                
                if (isOpen) {
                    mobileMenu.classList.remove('show');
                    mobileMenu.classList.add('slide-out-up');
                    setTimeout(() => {
                        mobileMenu.classList.remove('slide-out-up');
                    }, 300);
                } else {
                    mobileMenu.classList.add('show', 'slide-in-down');
                    setTimeout(() => {
                        mobileMenu.classList.remove('slide-in-down');
                    }, 300);
                }
                
                // Animate hamburger icon
                mobileMenuBtn.classList.toggle('active');
            });
        }
    }

    /**
     * Setup scroll-based animations
     */
    setupScrollAnimations() {
        let ticking = false;
        
        const updateScrollAnimations = () => {
            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;
            
            // Parallax effect for hero sections
            const heroElements = document.querySelectorAll('.hero-bg, .hero-content');
            heroElements.forEach(el => {
                const speed = el.dataset.speed || 0.5;
                el.style.transform = `translateY(${scrollY * speed}px)`;
            });
            
            // Show/hide scroll-to-top button
            const scrollTopBtn = document.querySelector('.scroll-to-top');
            if (scrollTopBtn) {
                if (scrollY > windowHeight) {
                    scrollTopBtn.classList.add('show');
                } else {
                    scrollTopBtn.classList.remove('show');
                }
            }
            
            ticking = false;
        };
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateScrollAnimations);
                ticking = true;
            }
        });
    }

    /**
     * Setup loading states for forms and buttons
     */
    setupLoadingStates() {
        // Add loading state to buttons with data-loading attribute
        document.querySelectorAll('[data-loading]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.setLoadingState(btn, true);
                
                // Auto-remove loading state after 3 seconds (fallback)
                setTimeout(() => {
                    this.setLoadingState(btn, false);
                }, 3000);
            });
        });
    }

    /**
     * Set loading state for an element
     */
    setLoadingState(element, isLoading) {
        if (isLoading) {
            element.classList.add('loading');
            element.disabled = true;
            
            const originalText = element.textContent;
            element.dataset.originalText = originalText;
            element.innerHTML = `
                <span class="loading-spinner"></span>
                <span class="loading-text">Loading<span class="loading-dots"></span></span>
            `;
        } else {
            element.classList.remove('loading');
            element.disabled = false;
            element.textContent = element.dataset.originalText || 'Submit';
        }
    }

    /**
     * Handle form submission with loading states
     */
    handleFormSubmit(e) {
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
        
        if (submitBtn) {
            this.setLoadingState(submitBtn, true);
        }
    }

    /**
     * Setup mobile-specific optimizations
     */
    setupMobileOptimizations() {
        // Reduce animations on low-end devices
        if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
            document.documentElement.style.setProperty('--anim-normal', '0.2s');
            document.documentElement.style.setProperty('--anim-slow', '0.3s');
        }
        
        // Touch feedback for mobile
        if ('ontouchstart' in window) {
            document.addEventListener('touchstart', (e) => {
                if (e.target.matches('button, .btn-animate, .card-hover')) {
                    e.target.style.transform = 'scale(0.98)';
                }
            });
            
            document.addEventListener('touchend', (e) => {
                if (e.target.matches('button, .btn-animate, .card-hover')) {
                    setTimeout(() => {
                        e.target.style.transform = '';
                    }, 100);
                }
            });
        }
    }

    /**
     * Utility: Add CSS for ripple animation
     */
    static addRippleCSS() {
        if (document.querySelector('#ripple-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'ripple-styles';
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(2);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Add ripple CSS and initialize when DOM is ready
AnimationController.addRippleCSS();

// Initialize animation controller
const animationController = new AnimationController();

// Export for use in other scripts
window.AnimationController = AnimationController;
window.animationController = animationController;