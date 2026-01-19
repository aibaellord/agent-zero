/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █   ██████╗ ███╗   ██╗██████╗  ██████╗  █████╗ ██████╗ ██████╗             █
 * █   ██╔═══██╗████╗  ██║██╔══██╗██╔═══██╗██╔══██╗██╔══██╗██╔══██╗           █
 * █   ██║   ██║██╔██╗ ██║██████╔╝██║   ██║███████║██████╔╝██║  ██║           █
 * █   ██║   ██║██║╚██╗██║██╔══██╗██║   ██║██╔══██║██╔══██╗██║  ██║           █
 * █   ╚██████╔╝██║ ╚████║██████╔╝╚██████╔╝██║  ██║██║  ██║██████╔╝           █
 * █    ╚═════╝ ╚═╝  ╚═══╝╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝            █
 * █                                                                          █
 * █   BAEL ONBOARDING TOUR - Interactive Feature Discovery                  █
 * █   First-run experience and guided feature tours                         █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function() {
    'use strict';

    class BaelOnboardingTour {
        constructor() {
            this.version = '1.0.0';
            this.initialized = false;
            this.currentTour = null;
            this.currentStep = 0;
            this.overlay = null;
            this.spotlight = null;
            this.tooltip = null;
        }

        async initialize() {
            console.log('🎓 Bael Onboarding Tour initializing...');
            
            this.injectStyles();
            this.createElements();
            this.bindEvents();
            this.checkFirstRun();
            
            this.initialized = true;
            console.log('✅ BAEL ONBOARDING TOUR READY');
            
            return this;
        }

        injectStyles() {
            if (document.getElementById('bael-onboarding-styles')) return;
            
            const styles = document.createElement('style');
            styles.id = 'bael-onboarding-styles';
            styles.textContent = `
                .bael-tour-overlay {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 10100;
                    pointer-events: none;
                }
                
                .bael-tour-overlay.active { display: block; }
                
                .bael-tour-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.75);
                    transition: opacity 0.3s ease;
                    pointer-events: auto;
                }
                
                .bael-tour-spotlight {
                    position: fixed;
                    border-radius: 8px;
                    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.75),
                                0 0 30px rgba(99, 102, 241, 0.4);
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    z-index: 10101;
                    pointer-events: none;
                }
                
                .bael-tour-tooltip {
                    position: fixed;
                    z-index: 10102;
                    width: 380px;
                    max-width: 90vw;
                    background: linear-gradient(135deg, #1e1e2e 0%, #2a2a3e 100%);
                    border-radius: 16px;
                    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6),
                                0 0 0 1px rgba(255, 255, 255, 0.1);
                    padding: 24px;
                    pointer-events: auto;
                    animation: tooltipEnter 0.3s ease;
                }
                
                @keyframes tooltipEnter {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .tooltip-arrow {
                    position: absolute;
                    width: 16px;
                    height: 16px;
                    background: #1e1e2e;
                    transform: rotate(45deg);
                }
                
                .tooltip-arrow.top { top: -8px; left: 50%; margin-left: -8px; }
                .tooltip-arrow.bottom { bottom: -8px; left: 50%; margin-left: -8px; }
                .tooltip-arrow.left { left: -8px; top: 50%; margin-top: -8px; }
                .tooltip-arrow.right { right: -8px; top: 50%; margin-top: -8px; }
                
                .tooltip-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 14px;
                }
                
                .tooltip-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    background: rgba(99, 102, 241, 0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                }
                
                .tooltip-title {
                    flex: 1;
                }
                
                .tooltip-title h3 {
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 2px;
                }
                
                .tooltip-step {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.4);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                
                .tooltip-content {
                    font-size: 14px;
                    line-height: 1.6;
                    color: rgba(255, 255, 255, 0.8);
                    margin-bottom: 20px;
                }
                
                .tooltip-highlight {
                    display: inline-block;
                    padding: 2px 8px;
                    background: rgba(99, 102, 241, 0.2);
                    border-radius: 4px;
                    font-family: 'SF Mono', monospace;
                    font-size: 12px;
                    color: #a5b4fc;
                }
                
                .tooltip-actions {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .tooltip-progress {
                    display: flex;
                    gap: 6px;
                }
                
                .progress-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.2);
                    transition: all 0.2s;
                }
                
                .progress-dot.active {
                    background: #6366f1;
                    transform: scale(1.2);
                }
                
                .progress-dot.completed {
                    background: #22c55e;
                }
                
                .tooltip-buttons {
                    display: flex;
                    gap: 10px;
                }
                
                .tour-btn {
                    padding: 10px 18px;
                    border-radius: 8px;
                    border: none;
                    font-size: 13px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    transition: all 0.2s;
                }
                
                .tour-btn.secondary {
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                }
                
                .tour-btn.secondary:hover {
                    background: rgba(255, 255, 255, 0.15);
                }
                
                .tour-btn.primary {
                    background: #6366f1;
                    color: #fff;
                }
                
                .tour-btn.primary:hover {
                    background: #4f46e5;
                }
                
                .tour-btn.skip {
                    background: transparent;
                    color: rgba(255, 255, 255, 0.5);
                }
                
                .tour-btn.skip:hover {
                    color: rgba(255, 255, 255, 0.8);
                }
                
                /* Welcome Modal */
                .bael-welcome-modal {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 10150;
                    background: rgba(0, 0, 0, 0.85);
                    backdrop-filter: blur(10px);
                    align-items: center;
                    justify-content: center;
                }
                
                .bael-welcome-modal.visible { display: flex; }
                
                .welcome-dialog {
                    width: 500px;
                    max-width: 95vw;
                    background: linear-gradient(135deg, #1a1a2e 0%, #252538 100%);
                    border-radius: 20px;
                    padding: 40px;
                    text-align: center;
                    box-shadow: 0 30px 100px rgba(0, 0, 0, 0.6);
                    animation: welcomeEnter 0.5s ease;
                }
                
                @keyframes welcomeEnter {
                    from {
                        opacity: 0;
                        transform: scale(0.9) translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
                
                .welcome-logo {
                    font-size: 64px;
                    margin-bottom: 20px;
                }
                
                .welcome-title {
                    font-size: 28px;
                    font-weight: 700;
                    margin-bottom: 12px;
                    background: linear-gradient(135deg, #fff 0%, #a5b4fc 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                
                .welcome-subtitle {
                    font-size: 15px;
                    color: rgba(255, 255, 255, 0.6);
                    margin-bottom: 30px;
                    line-height: 1.6;
                }
                
                .welcome-features {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                    margin-bottom: 30px;
                }
                
                .welcome-feature {
                    padding: 14px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                    text-align: left;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .feature-icon {
                    font-size: 20px;
                }
                
                .feature-text {
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.8);
                }
                
                .welcome-buttons {
                    display: flex;
                    gap: 12px;
                    justify-content: center;
                }
                
                .welcome-btn {
                    padding: 14px 28px;
                    border-radius: 10px;
                    border: none;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .welcome-btn.primary {
                    background: #6366f1;
                    color: #fff;
                }
                
                .welcome-btn.primary:hover {
                    background: #4f46e5;
                    transform: translateY(-2px);
                }
                
                .welcome-btn.secondary {
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                }
                
                .welcome-btn.secondary:hover {
                    background: rgba(255, 255, 255, 0.15);
                }
            `;
            document.head.appendChild(styles);
        }

        createElements() {
            // Overlay
            this.overlay = document.createElement('div');
            this.overlay.className = 'bael-tour-overlay';
            this.overlay.innerHTML = `
                <div class="bael-tour-backdrop"></div>
                <div class="bael-tour-spotlight"></div>
                <div class="bael-tour-tooltip"></div>
            `;
            document.body.appendChild(this.overlay);
            
            this.spotlight = this.overlay.querySelector('.bael-tour-spotlight');
            this.tooltip = this.overlay.querySelector('.bael-tour-tooltip');
            
            // Welcome Modal
            this.welcomeModal = document.createElement('div');
            this.welcomeModal.className = 'bael-welcome-modal';
            this.welcomeModal.innerHTML = `
                <div class="welcome-dialog">
                    <div class="welcome-logo">👑</div>
                    <h1 class="welcome-title">Welcome to Bael</h1>
                    <p class="welcome-subtitle">
                        Your supreme AI agent framework with 270+ powerful modules.
                        Let's take a quick tour to unlock your potential.
                    </p>
                    <div class="welcome-features">
                        <div class="welcome-feature">
                            <span class="feature-icon">🚀</span>
                            <span class="feature-text">Quick Launcher</span>
                        </div>
                        <div class="welcome-feature">
                            <span class="feature-icon">🔍</span>
                            <span class="feature-text">Universal Search</span>
                        </div>
                        <div class="welcome-feature">
                            <span class="feature-icon">📊</span>
                            <span class="feature-text">Performance Analytics</span>
                        </div>
                        <div class="welcome-feature">
                            <span class="feature-icon">🧠</span>
                            <span class="feature-text">AI-Powered Insights</span>
                        </div>
                    </div>
                    <div class="welcome-buttons">
                        <button class="welcome-btn secondary" onclick="BaelOnboardingTour.skipWelcome()">
                            Skip for now
                        </button>
                        <button class="welcome-btn primary" onclick="BaelOnboardingTour.startQuickTour()">
                            🎓 Take the Tour
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(this.welcomeModal);
        }

        bindEvents() {
            // Keyboard navigation
            document.addEventListener('keydown', (e) => {
                if (!this.currentTour) return;
                
                if (e.key === 'Escape') {
                    this.endTour();
                } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
                    this.nextStep();
                } else if (e.key === 'ArrowLeft') {
                    this.prevStep();
                }
            });
            
            // Tour menu shortcut: Ctrl+Shift+?
            document.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === '?') {
                    e.preventDefault();
                    this.showTourMenu();
                }
            });
        }

        checkFirstRun() {
            const hasSeenWelcome = localStorage.getItem('bael_welcome_seen');
            if (!hasSeenWelcome) {
                setTimeout(() => this.showWelcome(), 1500);
            }
        }

        // ═══════════════════════════════════════════════════════════════════════
        // TOURS DEFINITION
        // ═══════════════════════════════════════════════════════════════════════

        getTours() {
            return {
                quick: {
                    name: 'Quick Start',
                    steps: [
                        {
                            target: '#chat-input',
                            title: 'Chat Input',
                            icon: '💬',
                            content: 'This is where you communicate with your AI agent. Type your message and press Enter to send.',
                            position: 'top'
                        },
                        {
                            target: '.sidebar',
                            title: 'Sidebar Navigation',
                            icon: '📁',
                            content: 'Access settings, chat history, scheduled tasks, and more from the sidebar.',
                            position: 'right'
                        },
                        {
                            target: null,
                            title: 'Quick Launcher',
                            icon: '🚀',
                            content: 'Double-tap <span class="tooltip-highlight">Ctrl</span> to open the Quick Launcher. Access any feature instantly!',
                            position: 'center',
                            action: () => window.BaelQuickLauncher?.show?.()
                        },
                        {
                            target: null,
                            title: 'Universal Search',
                            icon: '🔍',
                            content: 'Press <span class="tooltip-highlight">Ctrl+/</span> to search across everything - memory, files, chats, and commands.',
                            position: 'center'
                        },
                        {
                            target: null,
                            title: 'Command Center',
                            icon: '🎯',
                            content: 'Press <span class="tooltip-highlight">Ctrl+K</span> to open the Command Center. Execute any action with ease.',
                            position: 'center'
                        },
                        {
                            target: null,
                            title: 'Keyboard Shortcuts',
                            icon: '⌨️',
                            content: 'Press <span class="tooltip-highlight">?</span> anytime to see all available keyboard shortcuts.',
                            position: 'center'
                        }
                    ]
                },
                power: {
                    name: 'Power Features',
                    steps: [
                        {
                            target: null,
                            title: 'Memory Dashboard',
                            icon: '🧠',
                            content: 'Press <span class="tooltip-highlight">Ctrl+Shift+M</span> to manage your knowledge base and memories.',
                            position: 'center'
                        },
                        {
                            target: null,
                            title: 'Agent Console',
                            icon: '📊',
                            content: 'Press <span class="tooltip-highlight">Ctrl+Shift+A</span> to monitor agent activity in real-time.',
                            position: 'center'
                        },
                        {
                            target: null,
                            title: 'Performance Dashboard',
                            icon: '📈',
                            content: 'Press <span class="tooltip-highlight">Ctrl+Shift+P</span> to track token usage, costs, and optimize performance.',
                            position: 'center'
                        },
                        {
                            target: null,
                            title: 'AI Insights',
                            icon: '🔮',
                            content: 'Press <span class="tooltip-highlight">Ctrl+Shift+I</span> for AI-powered recommendations to improve your workflow.',
                            position: 'center'
                        },
                        {
                            target: null,
                            title: 'Template Library',
                            icon: '📋',
                            content: 'Press <span class="tooltip-highlight">Ctrl+Shift+T</span> to access and create prompt templates.',
                            position: 'center'
                        }
                    ]
                },
                advanced: {
                    name: 'Advanced Features',
                    steps: [
                        {
                            target: null,
                            title: 'Heisenberg Control',
                            icon: '⚛️',
                            content: 'Press <span class="tooltip-highlight">Ctrl+Shift+H</span> to visualize AI reasoning and decision-making.',
                            position: 'center'
                        },
                        {
                            target: null,
                            title: 'Favorites Hub',
                            icon: '⭐',
                            content: 'Press <span class="tooltip-highlight">Ctrl+Shift+B</span> to access your bookmarked items.',
                            position: 'center'
                        },
                        {
                            target: null,
                            title: 'System Status',
                            icon: '📡',
                            content: 'Press <span class="tooltip-highlight">Ctrl+Shift+S</span> to monitor system health and module status.',
                            position: 'center'
                        },
                        {
                            target: null,
                            title: 'Session Manager',
                            icon: '💾',
                            content: 'Press <span class="tooltip-highlight">Ctrl+Shift+W</span> to save and restore your workspace sessions.',
                            position: 'center'
                        }
                    ]
                }
            };
        }

        // ═══════════════════════════════════════════════════════════════════════
        // WELCOME MODAL
        // ═══════════════════════════════════════════════════════════════════════

        showWelcome() {
            this.welcomeModal.classList.add('visible');
        }

        hideWelcome() {
            this.welcomeModal.classList.remove('visible');
        }

        skipWelcome() {
            localStorage.setItem('bael_welcome_seen', 'true');
            this.hideWelcome();
        }

        startQuickTour() {
            localStorage.setItem('bael_welcome_seen', 'true');
            this.hideWelcome();
            setTimeout(() => this.startTour('quick'), 300);
        }

        // ═══════════════════════════════════════════════════════════════════════
        // TOUR CONTROL
        // ═══════════════════════════════════════════════════════════════════════

        startTour(tourId) {
            const tours = this.getTours();
            if (!tours[tourId]) return;
            
            this.currentTour = tours[tourId];
            this.currentStep = 0;
            this.overlay.classList.add('active');
            
            this.showStep();
        }

        endTour() {
            this.overlay.classList.remove('active');
            this.currentTour = null;
            this.currentStep = 0;
            
            window.dispatchEvent(new CustomEvent('bael:tour-ended'));
        }

        nextStep() {
            if (!this.currentTour) return;
            
            if (this.currentStep < this.currentTour.steps.length - 1) {
                this.currentStep++;
                this.showStep();
            } else {
                this.endTour();
            }
        }

        prevStep() {
            if (!this.currentTour || this.currentStep <= 0) return;
            
            this.currentStep--;
            this.showStep();
        }

        showStep() {
            const step = this.currentTour.steps[this.currentStep];
            if (!step) return;
            
            // Execute action if present
            if (step.action) {
                step.action();
            }
            
            // Position spotlight
            if (step.target) {
                const target = document.querySelector(step.target);
                if (target) {
                    const rect = target.getBoundingClientRect();
                    this.spotlight.style.display = 'block';
                    this.spotlight.style.top = `${rect.top - 8}px`;
                    this.spotlight.style.left = `${rect.left - 8}px`;
                    this.spotlight.style.width = `${rect.width + 16}px`;
                    this.spotlight.style.height = `${rect.height + 16}px`;
                } else {
                    this.spotlight.style.display = 'none';
                }
            } else {
                this.spotlight.style.display = 'none';
            }
            
            // Render tooltip
            this.renderTooltip(step);
        }

        renderTooltip(step) {
            const totalSteps = this.currentTour.steps.length;
            
            // Generate progress dots
            let progressDots = '';
            for (let i = 0; i < totalSteps; i++) {
                const state = i < this.currentStep ? 'completed' : i === this.currentStep ? 'active' : '';
                progressDots += `<div class="progress-dot ${state}"></div>`;
            }
            
            this.tooltip.innerHTML = `
                <div class="tooltip-arrow ${this.getArrowPosition(step.position)}"></div>
                <div class="tooltip-header">
                    <div class="tooltip-icon">${step.icon}</div>
                    <div class="tooltip-title">
                        <h3>${step.title}</h3>
                        <div class="tooltip-step">Step ${this.currentStep + 1} of ${totalSteps}</div>
                    </div>
                </div>
                <div class="tooltip-content">${step.content}</div>
                <div class="tooltip-actions">
                    <div class="tooltip-progress">${progressDots}</div>
                    <div class="tooltip-buttons">
                        <button class="tour-btn skip" onclick="BaelOnboardingTour.endTour()">Skip</button>
                        ${this.currentStep > 0 ? 
                            `<button class="tour-btn secondary" onclick="BaelOnboardingTour.prevStep()">← Back</button>` : ''}
                        <button class="tour-btn primary" onclick="BaelOnboardingTour.nextStep()">
                            ${this.currentStep < totalSteps - 1 ? 'Next →' : 'Finish ✓'}
                        </button>
                    </div>
                </div>
            `;
            
            // Position tooltip
            this.positionTooltip(step);
        }

        getArrowPosition(position) {
            switch (position) {
                case 'top': return 'bottom';
                case 'bottom': return 'top';
                case 'left': return 'right';
                case 'right': return 'left';
                default: return 'none';
            }
        }

        positionTooltip(step) {
            const padding = 20;
            
            if (step.position === 'center' || !step.target) {
                // Center in viewport
                this.tooltip.style.top = '50%';
                this.tooltip.style.left = '50%';
                this.tooltip.style.transform = 'translate(-50%, -50%)';
                this.tooltip.querySelector('.tooltip-arrow').style.display = 'none';
                return;
            }
            
            const target = document.querySelector(step.target);
            if (!target) return;
            
            const targetRect = target.getBoundingClientRect();
            const tooltipRect = this.tooltip.getBoundingClientRect();
            
            let top, left;
            
            switch (step.position) {
                case 'top':
                    top = targetRect.top - tooltipRect.height - padding;
                    left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
                    break;
                case 'bottom':
                    top = targetRect.bottom + padding;
                    left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
                    break;
                case 'left':
                    top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
                    left = targetRect.left - tooltipRect.width - padding;
                    break;
                case 'right':
                    top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
                    left = targetRect.right + padding;
                    break;
            }
            
            // Keep in viewport
            left = Math.max(padding, Math.min(left, window.innerWidth - tooltipRect.width - padding));
            top = Math.max(padding, Math.min(top, window.innerHeight - tooltipRect.height - padding));
            
            this.tooltip.style.top = `${top}px`;
            this.tooltip.style.left = `${left}px`;
            this.tooltip.style.transform = 'none';
        }

        showTourMenu() {
            // Could show a modal with tour options
            const tours = this.getTours();
            const choice = prompt('Available tours:\n1. Quick Start\n2. Power Features\n3. Advanced Features\n\nEnter number:');
            
            switch (choice) {
                case '1': this.startTour('quick'); break;
                case '2': this.startTour('power'); break;
                case '3': this.startTour('advanced'); break;
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════

    window.BaelOnboardingTour = new BaelOnboardingTour();
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.BaelOnboardingTour.initialize();
        });
    } else {
        window.BaelOnboardingTour.initialize();
    }

    console.log('🎓 Bael Onboarding Tour loaded');
})();
