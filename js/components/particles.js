// Assignment Checker - Particle System

class ParticleSystem {
    constructor(container, options = {}) {
        this.container = container;
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.animationId = null;
        this.isRunning = false;
        
        // Default options
        this.options = {
            particleCount: 100,
            particleSize: { min: 1, max: 3 },
            particleSpeed: { min: 0.1, max: 0.5 },
            particleColor: '#ffffff',
            particleOpacity: { min: 0.1, max: 0.8 },
            connectionDistance: 100,
            connectionOpacity: 0.2,
            connectionColor: '#ffffff',
            enableConnections: true,
            enableMouse: true,
            mouseRadius: 150,
            backgroundGradient: false,
            ...options
        };

        this.mouse = {
            x: 0,
            y: 0,
            radius: this.options.mouseRadius
        };

        this.init();
    }

    init() {
        this.createCanvas();
        this.createParticles();
        this.bindEvents();
        
        // Check if animations are enabled
        const settings = StorageUtils.getSettings();
        if (settings.showAnimations !== false) {
            this.start();
        }
    }

    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'particle-canvas';
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '-1';
        
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);
        
        this.resize();
    }

    createParticles() {
        this.particles = [];
        
        for (let i = 0; i < this.options.particleCount; i++) {
            this.particles.push(this.createParticle());
        }
    }

    createParticle() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            vx: (Math.random() - 0.5) * (this.options.particleSpeed.max - this.options.particleSpeed.min) + this.options.particleSpeed.min,
            vy: (Math.random() - 0.5) * (this.options.particleSpeed.max - this.options.particleSpeed.min) + this.options.particleSpeed.min,
            size: Math.random() * (this.options.particleSize.max - this.options.particleSize.min) + this.options.particleSize.min,
            opacity: Math.random() * (this.options.particleOpacity.max - this.options.particleOpacity.min) + this.options.particleOpacity.min,
            originalOpacity: 0,
            life: Math.random() * 100,
            decay: Math.random() * 0.02 + 0.005
        };
    }

    bindEvents() {
        // Mouse events
        if (this.options.enableMouse) {
            this.container.addEventListener('mousemove', (e) => {
                const rect = this.container.getBoundingClientRect();
                this.mouse.x = e.clientX - rect.left;
                this.mouse.y = e.clientY - rect.top;
            });

            this.container.addEventListener('mouseleave', () => {
                this.mouse.x = -this.mouse.radius;
                this.mouse.y = -this.mouse.radius;
            });
        }

        // Resize event
        window.addEventListener('resize', () => this.resize());
        
        // Visibility change event
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pause();
            } else if (this.shouldRun()) {
                this.start();
            }
        });
    }

    resize() {
        const rect = this.container.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        // Reposition particles that are outside the new bounds
        this.particles.forEach(particle => {
            if (particle.x > this.canvas.width) particle.x = this.canvas.width;
            if (particle.y > this.canvas.height) particle.y = this.canvas.height;
        });
    }

    shouldRun() {
        const settings = StorageUtils.getSettings();
        return settings.showAnimations !== false && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    start() {
        if (this.isRunning || !this.shouldRun()) return;
        
        this.isRunning = true;
        this.animate();
    }

    pause() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    stop() {
        this.pause();
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    animate() {
        if (!this.isRunning) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background gradient if enabled
        if (this.options.backgroundGradient) {
            this.drawBackground();
        }
        
        // Update and draw particles
        this.updateParticles();
        this.drawParticles();
        
        // Draw connections
        if (this.options.enableConnections) {
            this.drawConnections();
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    drawBackground() {
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, Math.max(this.canvas.width, this.canvas.height) / 2
        );
        
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.02)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    updateParticles() {
        this.particles.forEach(particle => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Bounce off walls
            if (particle.x <= 0 || particle.x >= this.canvas.width) {
                particle.vx *= -1;
                particle.x = Math.max(0, Math.min(this.canvas.width, particle.x));
            }
            
            if (particle.y <= 0 || particle.y >= this.canvas.height) {
                particle.vy *= -1;
                particle.y = Math.max(0, Math.min(this.canvas.height, particle.y));
            }
            
            // Mouse interaction
            if (this.options.enableMouse) {
                const dx = this.mouse.x - particle.x;
                const dy = this.mouse.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.mouse.radius) {
                    const force = (this.mouse.radius - distance) / this.mouse.radius;
                    const angle = Math.atan2(dy, dx);
                    particle.vx -= Math.cos(angle) * force * 0.01;
                    particle.vy -= Math.sin(angle) * force * 0.01;
                    
                    // Increase opacity near mouse
                    particle.opacity = Math.min(1, particle.originalOpacity + force * 0.5);
                } else {
                    particle.opacity = particle.originalOpacity;
                }
            }
            
            // Life cycle
            particle.life += particle.decay;
            if (particle.life >= 100) {
                particle.life = 0;
                particle.x = Math.random() * this.canvas.width;
                particle.y = Math.random() * this.canvas.height;
            }
            
            // Store original opacity if not set
            if (particle.originalOpacity === 0) {
                particle.originalOpacity = particle.opacity;
            }
        });
    }

    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.opacity;
            this.ctx.fillStyle = this.options.particleColor;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }

    drawConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const particle1 = this.particles[i];
                const particle2 = this.particles[j];
                
                const dx = particle1.x - particle2.x;
                const dy = particle1.y - particle2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < this.options.connectionDistance) {
                    const opacity = (1 - distance / this.options.connectionDistance) * this.options.connectionOpacity;
                    
                    this.ctx.save();
                    this.ctx.globalAlpha = opacity;
                    this.ctx.strokeStyle = this.options.connectionColor;
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle1.x, particle1.y);
                    this.ctx.lineTo(particle2.x, particle2.y);
                    this.ctx.stroke();
                    this.ctx.restore();
                }
            }
        }
    }

    // Public methods for controlling the system
    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
        
        // Recreate particles if count changed
        if (newOptions.particleCount && newOptions.particleCount !== this.particles.length) {
            this.createParticles();
        }
        
        // Update mouse radius
        if (newOptions.mouseRadius) {
            this.mouse.radius = newOptions.mouseRadius;
        }
    }

    setParticleCount(count) {
        this.options.particleCount = count;
        this.createParticles();
    }

    setColors(particleColor, connectionColor) {
        this.options.particleColor = particleColor;
        this.options.connectionColor = connectionColor;
    }

    addParticle(x, y) {
        const particle = this.createParticle();
        if (x !== undefined) particle.x = x;
        if (y !== undefined) particle.y = y;
        this.particles.push(particle);
    }

    removeParticle() {
        this.particles.pop();
    }

    explode(x, y, intensity = 1) {
        const explosionRadius = 100 * intensity;
        
        this.particles.forEach(particle => {
            const dx = particle.x - x;
            const dy = particle.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < explosionRadius) {
                const force = (explosionRadius - distance) / explosionRadius * intensity;
                const angle = Math.atan2(dy, dx);
                particle.vx += Math.cos(angle) * force * 0.1;
                particle.vy += Math.sin(angle) * force * 0.1;
            }
        });
    }

    destroy() {
        this.stop();
        window.removeEventListener('resize', () => this.resize());
        
        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
        }
        
        this.particles = [];
        this.canvas = null;
        this.ctx = null;
    }
}

// Particle System Manager for multiple instances
class ParticleManager {
    constructor() {
        this.systems = new Map();
    }

    create(containerId, options = {}) {
        const container = document.getElementById(containerId) || document.querySelector(containerId);
        if (!container) {
            console.error('Particle container not found:', containerId);
            return null;
        }

        const system = new ParticleSystem(container, options);
        this.systems.set(containerId, system);
        return system;
    }

    get(containerId) {
        return this.systems.get(containerId);
    }

    destroy(containerId) {
        const system = this.systems.get(containerId);
        if (system) {
            system.destroy();
            this.systems.delete(containerId);
        }
    }

    destroyAll() {
        this.systems.forEach((system, id) => {
            system.destroy();
        });
        this.systems.clear();
    }

    pauseAll() {
        this.systems.forEach(system => system.pause());
    }

    startAll() {
        this.systems.forEach(system => system.start());
    }

    updateAllOptions(options) {
        this.systems.forEach(system => system.updateOptions(options));
    }
}

// Global particle manager instance
const particleManager = new ParticleManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ParticleSystem, ParticleManager, particleManager };
}
