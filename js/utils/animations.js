// Assignment Checker - Animation Utilities

class AnimationUtils {
    static animationSettings = {
        enabled: true,
        duration: {
            fast: 200,
            normal: 300,
            slow: 500
        },
        easing: {
            ease: 'ease',
            easeIn: 'ease-in',
            easeOut: 'ease-out',
            easeInOut: 'ease-in-out',
            bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
            smooth: 'cubic-bezier(0.4, 0, 0.2, 1)'
        }
    };

    // Initialize animations based on user preferences
    static init() {
        const settings = StorageUtils.getSettings();
        this.animationSettings.enabled = settings.showAnimations !== false;
        
        // Add reduced motion support
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.animationSettings.enabled = false;
        }
    }

    // Fade animations
    static fadeIn(element, duration = 'normal', delay = 0) {
        if (!this.animationSettings.enabled) {
            element.style.opacity = '1';
            return Promise.resolve();
        }

        return new Promise(resolve => {
            const durationMs = this.animationSettings.duration[duration] || duration;
            
            setTimeout(() => {
                element.style.transition = `opacity ${durationMs}ms ${this.animationSettings.easing.smooth}`;
                element.style.opacity = '0';
                element.style.display = element.dataset.originalDisplay || 'block';
                
                requestAnimationFrame(() => {
                    element.style.opacity = '1';
                    setTimeout(resolve, durationMs);
                });
            }, delay);
        });
    }

    static fadeOut(element, duration = 'normal', delay = 0) {
        if (!this.animationSettings.enabled) {
            element.style.display = 'none';
            return Promise.resolve();
        }

        return new Promise(resolve => {
            const durationMs = this.animationSettings.duration[duration] || duration;
            
            setTimeout(() => {
                element.style.transition = `opacity ${durationMs}ms ${this.animationSettings.easing.smooth}`;
                element.style.opacity = '0';
                
                setTimeout(() => {
                    element.style.display = 'none';
                    resolve();
                }, durationMs);
            }, delay);
        });
    }

    static fadeToggle(element, duration = 'normal') {
        const isVisible = window.getComputedStyle(element).display !== 'none';
        return isVisible ? this.fadeOut(element, duration) : this.fadeIn(element, duration);
    }

    // Slide animations
    static slideDown(element, duration = 'normal') {
        if (!this.animationSettings.enabled) {
            element.style.display = 'block';
            return Promise.resolve();
        }

        return new Promise(resolve => {
            const durationMs = this.animationSettings.duration[duration] || duration;
            element.style.display = 'block';
            const height = element.scrollHeight;
            
            element.style.height = '0';
            element.style.overflow = 'hidden';
            element.style.transition = `height ${durationMs}ms ${this.animationSettings.easing.smooth}`;
            
            requestAnimationFrame(() => {
                element.style.height = height + 'px';
                
                setTimeout(() => {
                    element.style.height = '';
                    element.style.overflow = '';
                    element.style.transition = '';
                    resolve();
                }, durationMs);
            });
        });
    }

    static slideUp(element, duration = 'normal') {
        if (!this.animationSettings.enabled) {
            element.style.display = 'none';
            return Promise.resolve();
        }

        return new Promise(resolve => {
            const durationMs = this.animationSettings.duration[duration] || duration;
            const height = element.scrollHeight;
            
            element.style.height = height + 'px';
            element.style.overflow = 'hidden';
            element.style.transition = `height ${durationMs}ms ${this.animationSettings.easing.smooth}`;
            
            requestAnimationFrame(() => {
                element.style.height = '0';
                
                setTimeout(() => {
                    element.style.display = 'none';
                    element.style.height = '';
                    element.style.overflow = '';
                    element.style.transition = '';
                    resolve();
                }, durationMs);
            });
        });
    }

    // Scale animations
    static scaleIn(element, duration = 'normal') {
        if (!this.animationSettings.enabled) {
            element.style.transform = 'scale(1)';
            return Promise.resolve();
        }

        return new Promise(resolve => {
            const durationMs = this.animationSettings.duration[duration] || duration;
            
            element.style.transform = 'scale(0)';
            element.style.transition = `transform ${durationMs}ms ${this.animationSettings.easing.bounce}`;
            
            requestAnimationFrame(() => {
                element.style.transform = 'scale(1)';
                setTimeout(resolve, durationMs);
            });
        });
    }

    static scaleOut(element, duration = 'normal') {
        if (!this.animationSettings.enabled) {
            element.style.transform = 'scale(0)';
            return Promise.resolve();
        }

        return new Promise(resolve => {
            const durationMs = this.animationSettings.duration[duration] || duration;
            
            element.style.transition = `transform ${durationMs}ms ${this.animationSettings.easing.smooth}`;
            element.style.transform = 'scale(0)';
            
            setTimeout(resolve, durationMs);
        });
    }

    // Bounce animation
    static bounce(element, intensity = 1) {
        if (!this.animationSettings.enabled) return Promise.resolve();

        return new Promise(resolve => {
            element.style.animation = `bounce 0.6s ${this.animationSettings.easing.bounce}`;
            element.style.animationIterationCount = intensity;
            
            element.addEventListener('animationend', () => {
                element.style.animation = '';
                resolve();
            }, { once: true });
        });
    }

    // Shake animation
    static shake(element, intensity = 1) {
        if (!this.animationSettings.enabled) return Promise.resolve();

        return new Promise(resolve => {
            element.style.animation = `shake 0.5s ease-in-out`;
            element.style.animationIterationCount = intensity;
            
            element.addEventListener('animationend', () => {
                element.style.animation = '';
                resolve();
            }, { once: true });
        });
    }

    // Pulse animation
    static pulse(element, duration = 1000) {
        if (!this.animationSettings.enabled) return Promise.resolve();

        return new Promise(resolve => {
            element.style.animation = `pulse ${duration}ms ease-in-out infinite`;
            
            setTimeout(() => {
                element.style.animation = '';
                resolve();
            }, duration * 3); // Run for 3 cycles
        });
    }

    // Typing animation
    static typeWriter(element, text, speed = 50) {
        if (!this.animationSettings.enabled) {
            element.textContent = text;
            return Promise.resolve();
        }

        return new Promise(resolve => {
            element.textContent = '';
            let i = 0;
            
            const timer = setInterval(() => {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                } else {
                    clearInterval(timer);
                    resolve();
                }
            }, speed);
        });
    }

    // Progress bar animation
    static animateProgress(element, targetPercent, duration = 1000) {
        if (!this.animationSettings.enabled) {
            element.style.width = targetPercent + '%';
            return Promise.resolve();
        }

        return new Promise(resolve => {
            const start = performance.now();
            const startPercent = parseFloat(element.style.width) || 0;
            const change = targetPercent - startPercent;
            
            const animate = (currentTime) => {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                const currentPercent = startPercent + (change * easeOutQuart);
                
                element.style.width = currentPercent + '%';
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            
            requestAnimationFrame(animate);
        });
    }

    // Number counting animation
    static countUp(element, targetNumber, duration = 1000, decimals = 0) {
        if (!this.animationSettings.enabled) {
            element.textContent = targetNumber.toFixed(decimals);
            return Promise.resolve();
        }

        return new Promise(resolve => {
            const start = performance.now();
            const startNumber = parseFloat(element.textContent) || 0;
            const change = targetNumber - startNumber;
            
            const animate = (currentTime) => {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                const currentNumber = startNumber + (change * easeOutQuart);
                
                element.textContent = currentNumber.toFixed(decimals);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    element.textContent = targetNumber.toFixed(decimals);
                    resolve();
                }
            };
            
            requestAnimationFrame(animate);
        });
    }

    // Stagger animations for lists
    static staggerIn(elements, delay = 100) {
        if (!this.animationSettings.enabled) {
            elements.forEach(el => el.style.opacity = '1');
            return Promise.resolve();
        }

        const promises = Array.from(elements).map((element, index) => {
            return this.fadeIn(element, 'fast', index * delay);
        });
        
        return Promise.all(promises);
    }

    // Smooth scroll
    static smoothScrollTo(target, duration = 500, offset = 0) {
        const targetElement = typeof target === 'string' ? document.querySelector(target) : target;
        
        if (!targetElement) return Promise.resolve();

        const start = window.pageYOffset;
        const targetPosition = targetElement.offsetTop + offset;
        const distance = targetPosition - start;
        
        if (!this.animationSettings.enabled) {
            window.scrollTo(0, targetPosition);
            return Promise.resolve();
        }

        return new Promise(resolve => {
            const startTime = performance.now();
            
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                const easeInOutQuart = progress < 0.5 
                    ? 8 * progress * progress * progress * progress
                    : 1 - 8 * (--progress) * progress * progress * progress;
                
                window.scrollTo(0, start + distance * easeInOutQuart);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    resolve();
                }
            };
            
            requestAnimationFrame(animate);
        });
    }

    // CSS class-based animations
    static addAnimationClass(element, className, duration = null) {
        return new Promise(resolve => {
            element.classList.add(className);
            
            if (duration) {
                setTimeout(() => {
                    element.classList.remove(className);
                    resolve();
                }, duration);
            } else {
                element.addEventListener('animationend', () => {
                    element.classList.remove(className);
                    resolve();
                }, { once: true });
            }
        });
    }

    // Page transition effects
    static pageTransition(fromPage, toPage, type = 'fade') {
        if (!this.animationSettings.enabled) {
            fromPage.style.display = 'none';
            toPage.style.display = 'block';
            return Promise.resolve();
        }

        switch (type) {
            case 'slide':
                return this.slidePageTransition(fromPage, toPage);
            case 'scale':
                return this.scalePageTransition(fromPage, toPage);
            default:
                return this.fadePageTransition(fromPage, toPage);
        }
    }

    static fadePageTransition(fromPage, toPage) {
        return new Promise(async resolve => {
            await this.fadeOut(fromPage, 'fast');
            toPage.style.display = 'block';
            await this.fadeIn(toPage, 'fast');
            resolve();
        });
    }

    static slidePageTransition(fromPage, toPage) {
        return new Promise(async resolve => {
            fromPage.style.transform = 'translateX(0)';
            fromPage.style.transition = `transform ${this.animationSettings.duration.normal}ms ${this.animationSettings.easing.smooth}`;
            
            toPage.style.display = 'block';
            toPage.style.transform = 'translateX(100%)';
            toPage.style.transition = `transform ${this.animationSettings.duration.normal}ms ${this.animationSettings.easing.smooth}`;
            
            requestAnimationFrame(() => {
                fromPage.style.transform = 'translateX(-100%)';
                toPage.style.transform = 'translateX(0)';
                
                setTimeout(() => {
                    fromPage.style.display = 'none';
                    fromPage.style.transform = '';
                    fromPage.style.transition = '';
                    toPage.style.transform = '';
                    toPage.style.transition = '';
                    resolve();
                }, this.animationSettings.duration.normal);
            });
        });
    }

    static scalePageTransition(fromPage, toPage) {
        return new Promise(async resolve => {
            await this.scaleOut(fromPage, 'fast');
            fromPage.style.display = 'none';
            toPage.style.display = 'block';
            await this.scaleIn(toPage, 'fast');
            resolve();
        });
    }

    // Loading animations
    static showLoading(element, type = 'spinner') {
        if (element.querySelector('.loading-overlay')) return;

        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        
        let content = '';
        switch (type) {
            case 'dots':
                content = '<div class="loading-dots"><span></span><span></span><span></span></div>';
                break;
            case 'pulse':
                content = '<div class="loading-pulse"></div>';
                break;
            default:
                content = '<div class="loading-spinner"></div>';
        }
        
        overlay.innerHTML = content;
        element.appendChild(overlay);
        
        if (this.animationSettings.enabled) {
            this.fadeIn(overlay, 'fast');
        }
    }

    static hideLoading(element) {
        const overlay = element.querySelector('.loading-overlay');
        if (!overlay) return Promise.resolve();

        if (this.animationSettings.enabled) {
            return this.fadeOut(overlay, 'fast').then(() => {
                overlay.remove();
            });
        } else {
            overlay.remove();
            return Promise.resolve();
        }
    }

    // Utility methods
    static setAnimationsEnabled(enabled) {
        this.animationSettings.enabled = enabled;
    }

    static isAnimationsEnabled() {
        return this.animationSettings.enabled;
    }

    static getDuration(speed) {
        return this.animationSettings.duration[speed] || speed;
    }

    static getEasing(type) {
        return this.animationSettings.easing[type] || type;
    }
}

// Initialize animations on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AnimationUtils.init());
} else {
    AnimationUtils.init();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimationUtils;
}
