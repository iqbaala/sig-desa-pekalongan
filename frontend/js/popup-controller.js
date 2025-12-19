/**
 * 🎯 LABTANAM Pop-up Controller
 * Advanced pop-up animations and interactions
 */

class PopupController {
    constructor() {
        this.activePopups = new Set();
        this.popupQueue = [];
        this.isInitialized = false;
        
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        this.setupEventListeners();
        this.createPopupContainer();
        this.isInitialized = true;
        
        console.log('🎭 PopupController initialized');
    }

    /**
     * Create popup container if not exists
     */
    createPopupContainer() {
        if (!document.getElementById('popup-container')) {
            const container = document.createElement('div');
            container.id = 'popup-container';
            container.style.position = 'fixed';
            container.style.top = '0';
            container.style.left = '0';
            container.style.width = '100%';
            container.style.height = '100%';
            container.style.pointerEvents = 'none';
            container.style.zIndex = '9990';
            document.body.appendChild(container);
        }
    }

    /**
     * Setup global event listeners
     */
    setupEventListeners() {
        // Close popup on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeTopPopup();
            }
        });

        // Setup button click handlers
        document.addEventListener('click', (e) => {
            const button = e.target.closest('[data-popup]');
            if (button) {
                e.preventDefault();
                this.handleButtonClick(button);
            }

            // Close popup when clicking backdrop
            if (e.target.classList.contains('popup-backdrop')) {
                this.closePopup(e.target.nextElementSibling?.id);
            }

            // Close popup when clicking close button
            if (e.target.classList.contains('popup-close') || e.target.closest('.popup-close')) {
                const popup = e.target.closest('.popup');
                if (popup) {
                    this.closePopup(popup.id);
                }
            }
        });

        // Handle form submissions in popups
        document.addEventListener('submit', (e) => {
            const form = e.target;
            if (form.closest('.popup')) {
                this.handleFormSubmit(e, form);
            }
        });
    }

    /**
     * Handle button click with popup trigger
     */
    handleButtonClick(button) {
        const popupId = button.dataset.popup;
        const popupType = button.dataset.popupType || 'bounce';
        const popupSize = button.dataset.popupSize || 'medium';
        
        // Add loading state to button
        this.setButtonLoading(button, true);
        
        // Simulate async operation
        setTimeout(() => {
            this.setButtonLoading(button, false);
            
            if (popupId === 'dynamic') {
                this.createDynamicPopup(button);
            } else {
                this.showPopup(popupId, popupType);
            }
        }, 300);
    }

    /**
     * Create dynamic popup from button data
     */
    createDynamicPopup(button) {
        const title = button.dataset.popupTitle || 'Information';
        const content = button.dataset.popupContent || 'Dynamic popup content';
        const type = button.dataset.popupType || 'bounce';
        const size = button.dataset.popupSize || 'medium';
        
        const popupId = 'dynamic-popup-' + Date.now();
        
        const popup = this.createPopupElement({
            id: popupId,
            title: title,
            content: content,
            type: type,
            size: size,
            buttons: [
                { text: 'Close', class: 'btn btn-secondary', action: 'close' }
            ]
        });
        
        document.getElementById('popup-container').appendChild(popup.backdrop);
        document.getElementById('popup-container').appendChild(popup.popup);
        
        this.showPopup(popupId, type);
    }

    /**
     * Create popup element
     */
    createPopupElement(config) {
        const {
            id,
            title,
            content,
            type = 'bounce',
            size = 'medium',
            buttons = []
        } = config;

        // Create backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'popup-backdrop';
        backdrop.id = `${id}-backdrop`;

        // Create popup
        const popup = document.createElement('div');
        popup.className = `popup popup-${type} popup-${size}`;
        popup.id = id;
        popup.style.pointerEvents = 'auto';

        // Popup header
        const header = document.createElement('div');
        header.className = 'popup-header';
        header.innerHTML = `
            <h3 class="popup-title">${title}</h3>
            <button class="popup-close" type="button">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Popup body
        const body = document.createElement('div');
        body.className = 'popup-body';
        body.innerHTML = content;

        // Popup footer
        const footer = document.createElement('div');
        footer.className = 'popup-footer';
        
        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.className = btn.class || 'btn btn-primary';
            button.textContent = btn.text;
            button.onclick = () => {
                if (btn.action === 'close') {
                    this.closePopup(id);
                } else if (btn.onclick) {
                    btn.onclick();
                }
            };
            footer.appendChild(button);
        });

        popup.appendChild(header);
        popup.appendChild(body);
        if (buttons.length > 0) {
            popup.appendChild(footer);
        }

        return { backdrop, popup };
    }

    /**
     * Show popup with animation
     */
    showPopup(popupId, animationType = 'bounce') {
        const popup = document.getElementById(popupId);
        const backdrop = document.getElementById(`${popupId}-backdrop`);
        
        if (!popup || !backdrop) {
            console.warn(`Popup ${popupId} not found`);
            return;
        }

        // Add to active popups
        this.activePopups.add(popupId);
        
        // Disable body scroll
        if (this.activePopups.size === 1) {
            document.body.style.overflow = 'hidden';
        }

        // Show backdrop
        backdrop.classList.add('show');
        
        // Show popup with animation
        setTimeout(() => {
            popup.classList.add('show');
            popup.classList.add(`popup-${animationType}`);
        }, 50);

        // Focus management
        this.manageFocus(popup);
        
        // Trigger custom event
        this.triggerEvent('popupShow', { popupId, animationType });
    }

    /**
     * Close popup
     */
    closePopup(popupId) {
        if (!popupId) return;
        
        const popup = document.getElementById(popupId);
        const backdrop = document.getElementById(`${popupId}-backdrop`);
        
        if (!popup || !backdrop) return;

        // Remove from active popups
        this.activePopups.delete(popupId);
        
        // Hide popup
        popup.classList.remove('show');
        backdrop.classList.remove('show');
        
        // Re-enable body scroll if no popups
        if (this.activePopups.size === 0) {
            document.body.style.overflow = '';
        }

        // Remove popup after animation
        setTimeout(() => {
            if (popup.id.includes('dynamic-popup')) {
                popup.remove();
                backdrop.remove();
            }
        }, 400);
        
        // Trigger custom event
        this.triggerEvent('popupClose', { popupId });
    }

    /**
     * Close top popup
     */
    closeTopPopup() {
        const popupIds = Array.from(this.activePopups);
        if (popupIds.length > 0) {
            this.closePopup(popupIds[popupIds.length - 1]);
        }
    }

    /**
     * Set button loading state
     */
    setButtonLoading(button, isLoading) {
        if (isLoading) {
            button.classList.add('btn-loading');
            button.disabled = true;
        } else {
            button.classList.remove('btn-loading');
            button.disabled = false;
        }
    }

    /**
     * Handle form submission in popup
     */
    handleFormSubmit(e, form) {
        e.preventDefault();
        
        const submitButton = form.querySelector('button[type="submit"]');
        if (submitButton) {
            this.setButtonLoading(submitButton, true);
        }

        // Simulate form processing
        setTimeout(() => {
            if (submitButton) {
                this.setButtonLoading(submitButton, false);
            }
            
            // Show success message
            this.showNotification('Form submitted successfully!', 'success');
            
            // Close popup
            const popup = form.closest('.popup');
            if (popup) {
                this.closePopup(popup.id);
            }
        }, 1000);
    }

    /**
     * Show notification popup
     */
    showNotification(message, type = 'info', duration = 3000) {
        const notificationId = 'notification-' + Date.now();
        
        const notification = this.createPopupElement({
            id: notificationId,
            title: this.getNotificationTitle(type),
            content: `<p>${message}</p>`,
            type: 'fade-scale',
            size: 'small',
            buttons: []
        });

        // Style notification
        notification.popup.classList.add(`notification-${type}`);
        
        document.getElementById('popup-container').appendChild(notification.backdrop);
        document.getElementById('popup-container').appendChild(notification.popup);
        
        this.showPopup(notificationId, 'fade-scale');
        
        // Auto close
        setTimeout(() => {
            this.closePopup(notificationId);
        }, duration);
    }

    /**
     * Get notification title based on type
     */
    getNotificationTitle(type) {
        const titles = {
            success: '✅ Success',
            error: '❌ Error',
            warning: '⚠️ Warning',
            info: 'ℹ️ Information'
        };
        return titles[type] || titles.info;
    }

    /**
     * Manage focus for accessibility
     */
    manageFocus(popup) {
        const focusableElements = popup.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }

        // Trap focus within popup
        popup.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey && document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                } else if (!e.shiftKey && document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        });
    }

    /**
     * Trigger custom event
     */
    triggerEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }

    /**
     * Utility method to create confirmation popup
     */
    confirm(message, title = 'Confirm Action') {
        return new Promise((resolve) => {
            const popupId = 'confirm-popup-' + Date.now();
            
            const popup = this.createPopupElement({
                id: popupId,
                title: title,
                content: `<p>${message}</p>`,
                type: 'bounce',
                size: 'small',
                buttons: [
                    { 
                        text: 'Cancel', 
                        class: 'btn btn-secondary',
                        action: 'close',
                        onclick: () => resolve(false)
                    },
                    { 
                        text: 'Confirm', 
                        class: 'btn btn-primary',
                        onclick: () => {
                            resolve(true);
                            this.closePopup(popupId);
                        }
                    }
                ]
            });
            
            document.getElementById('popup-container').appendChild(popup.backdrop);
            document.getElementById('popup-container').appendChild(popup.popup);
            
            this.showPopup(popupId, 'bounce');
        });
    }

    /**
     * Utility method to create alert popup
     */
    alert(message, title = 'Alert', type = 'info') {
        const popupId = 'alert-popup-' + Date.now();
        
        const popup = this.createPopupElement({
            id: popupId,
            title: title,
            content: `<p>${message}</p>`,
            type: 'bounce',
            size: 'small',
            buttons: [
                { 
                    text: 'OK', 
                    class: `btn btn-${type === 'error' ? 'danger' : 'primary'}`,
                    action: 'close'
                }
            ]
        });
        
        document.getElementById('popup-container').appendChild(popup.backdrop);
        document.getElementById('popup-container').appendChild(popup.popup);
        
        this.showPopup(popupId, 'bounce');
    }

    /**
     * Add button animations
     */
    static addButtonAnimations() {
        // Add ripple effect to buttons
        document.addEventListener('click', (e) => {
            const button = e.target.closest('.btn-ripple');
            if (!button) return;
            
            const rect = button.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.style.position = 'absolute';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.style.width = '0';
            ripple.style.height = '0';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(255, 255, 255, 0.5)';
            ripple.style.transform = 'translate(-50%, -50%)';
            ripple.style.animation = 'ripple 0.6s linear';
            
            button.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });

        // Add CSS for ripple animation
        if (!document.getElementById('ripple-animation')) {
            const style = document.createElement('style');
            style.id = 'ripple-animation';
            style.textContent = `
                @keyframes ripple {
                    to {
                        width: 200px;
                        height: 200px;
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Initialize for all pages
     */
    static init() {
        // Initialize popup controller
        if (!window.popupController) {
            window.popupController = new PopupController();
        }
        
        // Add button animations
        PopupController.addButtonAnimations();
        
        // Add global utility methods
        window.showPopup = (id, type) => window.popupController.showPopup(id, type);
        window.closePopup = (id) => window.popupController.closePopup(id);
        window.showNotification = (msg, type, duration) => window.popupController.showNotification(msg, type, duration);
        window.confirmAction = (msg, title) => window.popupController.confirm(msg, title);
        window.alertMessage = (msg, title, type) => window.popupController.alert(msg, title, type);
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', PopupController.init);
} else {
    PopupController.init();
}

// Export for manual initialization
window.PopupController = PopupController;