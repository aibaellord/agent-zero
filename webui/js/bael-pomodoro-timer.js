/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █  ████████╗██╗███╗   ███╗███████╗██████╗                                  █
 * █  ╚══██╔══╝██║████╗ ████║██╔════╝██╔══██╗                                 █
 * █     ██║   ██║██╔████╔██║█████╗  ██████╔╝                                 █
 * █     ██║   ██║██║╚██╔╝██║██╔══╝  ██╔══██╗                                 █
 * █     ██║   ██║██║ ╚═╝ ██║███████╗██║  ██║                                 █
 * █     ╚═╝   ╚═╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═╝                                 █
 * █                                                                          █
 * █   BAEL POMODORO TIMER - Productivity Timer (Ctrl+Shift+P)               █
 * █   Focus sessions with breaks using the Pomodoro technique               █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function() {
    'use strict';

    class BaelPomodoroTimer {
        constructor() {
            this.version = '1.0.0';
            this.initialized = false;
            this.visible = false;
            this.container = null;
            this.settings = {
                focusDuration: 25 * 60, // 25 minutes
                shortBreak: 5 * 60,     // 5 minutes
                longBreak: 15 * 60,     // 15 minutes
                longBreakInterval: 4,   // After 4 focus sessions
                autoStart: false,
                notifications: true,
                sound: true
            };
            this.state = {
                mode: 'focus', // 'focus', 'short-break', 'long-break'
                timeRemaining: 25 * 60,
                isRunning: false,
                sessionsCompleted: 0,
                totalFocusTime: 0
            };
            this.timerInterval = null;
        }

        async initialize() {
            console.log('🍅 Bael Pomodoro Timer initializing...');
            
            this.loadSettings();
            this.loadStats();
            this.injectStyles();
            this.createContainer();
            this.setupShortcuts();
            
            this.initialized = true;
            console.log('✅ BAEL POMODORO TIMER READY');
            
            return this;
        }

        loadSettings() {
            try {
                const saved = localStorage.getItem('bael-pomodoro-settings');
                if (saved) {
                    this.settings = { ...this.settings, ...JSON.parse(saved) };
                }
            } catch (e) {}
        }

        loadStats() {
            try {
                const saved = localStorage.getItem('bael-pomodoro-stats');
                if (saved) {
                    const stats = JSON.parse(saved);
                    this.state.sessionsCompleted = stats.sessionsCompleted || 0;
                    this.state.totalFocusTime = stats.totalFocusTime || 0;
                }
            } catch (e) {}
        }

        saveStats() {
            try {
                localStorage.setItem('bael-pomodoro-stats', JSON.stringify({
                    sessionsCompleted: this.state.sessionsCompleted,
                    totalFocusTime: this.state.totalFocusTime
                }));
            } catch (e) {}
        }

        injectStyles() {
            if (document.getElementById('bael-pomodoro-styles')) return;
            
            const styles = document.createElement('style');
            styles.id = 'bael-pomodoro-styles';
            styles.textContent = `
                .bael-pomodoro-container {
                    position: fixed;
                    bottom: 80px;
                    right: 20px;
                    width: 320px;
                    background: #12121a;
                    border-radius: 20px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    z-index: 9800;
                    opacity: 0;
                    transform: translateY(20px) scale(0.95);
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    pointer-events: none;
                    overflow: hidden;
                }
                
                .bael-pomodoro-container.visible {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                    pointer-events: auto;
                }
                
                .pomodoro-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 20px;
                    background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(249, 115, 22, 0.1) 100%);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }
                
                .pomodoro-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 16px;
                    font-weight: 600;
                    color: #fff;
                }
                
                .pomodoro-close {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    border: none;
                    background: rgba(255, 255, 255, 0.08);
                    color: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    font-size: 16px;
                    transition: all 0.2s;
                }
                
                .pomodoro-close:hover {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }
                
                .pomodoro-mode-tabs {
                    display: flex;
                    gap: 8px;
                    padding: 16px 20px;
                    background: rgba(255, 255, 255, 0.02);
                }
                
                .mode-tab {
                    flex: 1;
                    padding: 10px;
                    border-radius: 10px;
                    border: none;
                    background: rgba(255, 255, 255, 0.04);
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 11px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .mode-tab:hover {
                    background: rgba(255, 255, 255, 0.08);
                }
                
                .mode-tab.active {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }
                
                .mode-tab.active.break {
                    background: rgba(34, 197, 94, 0.2);
                    color: #22c55e;
                }
                
                .pomodoro-display {
                    padding: 30px 20px;
                    text-align: center;
                }
                
                .timer-circle {
                    width: 180px;
                    height: 180px;
                    margin: 0 auto 24px;
                    position: relative;
                }
                
                .timer-circle svg {
                    width: 100%;
                    height: 100%;
                    transform: rotate(-90deg);
                }
                
                .timer-circle-bg {
                    fill: none;
                    stroke: rgba(255, 255, 255, 0.08);
                    stroke-width: 8;
                }
                
                .timer-circle-progress {
                    fill: none;
                    stroke: #ef4444;
                    stroke-width: 8;
                    stroke-linecap: round;
                    stroke-dasharray: 502;
                    stroke-dashoffset: 0;
                    transition: stroke-dashoffset 0.5s ease;
                }
                
                .timer-circle-progress.break {
                    stroke: #22c55e;
                }
                
                .timer-time {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 42px;
                    font-weight: 700;
                    font-family: 'Consolas', 'Monaco', monospace;
                    color: #fff;
                    letter-spacing: 2px;
                }
                
                .timer-label {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.4);
                    text-transform: uppercase;
                    letter-spacing: 2px;
                }
                
                .pomodoro-controls {
                    display: flex;
                    justify-content: center;
                    gap: 12px;
                    padding: 0 20px 20px;
                }
                
                .control-btn {
                    width: 56px;
                    height: 56px;
                    border-radius: 50%;
                    border: none;
                    cursor: pointer;
                    font-size: 24px;
                    transition: all 0.2s;
                }
                
                .control-btn.primary {
                    background: linear-gradient(135deg, #ef4444 0%, #f97316 100%);
                    color: #fff;
                    box-shadow: 0 6px 20px rgba(239, 68, 68, 0.3);
                }
                
                .control-btn.primary:hover {
                    transform: scale(1.1);
                    box-shadow: 0 8px 30px rgba(239, 68, 68, 0.4);
                }
                
                .control-btn.secondary {
                    background: rgba(255, 255, 255, 0.08);
                    color: rgba(255, 255, 255, 0.6);
                }
                
                .control-btn.secondary:hover {
                    background: rgba(255, 255, 255, 0.12);
                    color: #fff;
                }
                
                .pomodoro-stats {
                    display: flex;
                    justify-content: space-around;
                    padding: 16px 20px;
                    background: rgba(255, 255, 255, 0.02);
                    border-top: 1px solid rgba(255, 255, 255, 0.06);
                }
                
                .stat-item {
                    text-align: center;
                }
                
                .stat-value {
                    font-size: 20px;
                    font-weight: 600;
                    color: #fff;
                }
                
                .stat-label {
                    font-size: 10px;
                    color: rgba(255, 255, 255, 0.4);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
            `;
            document.head.appendChild(styles);
        }

        createContainer() {
            this.container = document.createElement('div');
            this.container.id = 'bael-pomodoro';
            this.container.className = 'bael-pomodoro-container';
            
            this.container.innerHTML = `
                <div class="pomodoro-header">
                    <div class="pomodoro-title">
                        <span>🍅</span> Pomodoro Timer
                    </div>
                    <button class="pomodoro-close" onclick="BaelPomodoroTimer.hide()">✕</button>
                </div>
                <div class="pomodoro-mode-tabs">
                    <button class="mode-tab active" data-mode="focus" onclick="BaelPomodoroTimer.setMode('focus')">Focus</button>
                    <button class="mode-tab" data-mode="short-break" onclick="BaelPomodoroTimer.setMode('short-break')">Short Break</button>
                    <button class="mode-tab" data-mode="long-break" onclick="BaelPomodoroTimer.setMode('long-break')">Long Break</button>
                </div>
                <div class="pomodoro-display">
                    <div class="timer-circle">
                        <svg viewBox="0 0 180 180">
                            <circle class="timer-circle-bg" cx="90" cy="90" r="80"/>
                            <circle class="timer-circle-progress" cx="90" cy="90" r="80"/>
                        </svg>
                        <div class="timer-time">25:00</div>
                    </div>
                    <div class="timer-label">Focus Session</div>
                </div>
                <div class="pomodoro-controls">
                    <button class="control-btn secondary" onclick="BaelPomodoroTimer.reset()" title="Reset">↺</button>
                    <button class="control-btn primary" onclick="BaelPomodoroTimer.toggleTimer()" title="Start/Pause">▶</button>
                    <button class="control-btn secondary" onclick="BaelPomodoroTimer.skip()" title="Skip">⏭</button>
                </div>
                <div class="pomodoro-stats">
                    <div class="stat-item">
                        <div class="stat-value" id="sessions-count">0</div>
                        <div class="stat-label">Sessions</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value" id="focus-time">0h 0m</div>
                        <div class="stat-label">Focus Time</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value" id="streak">0</div>
                        <div class="stat-label">Streak</div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(this.container);
            this.updateDisplay();
        }

        setupShortcuts() {
            document.addEventListener('keydown', (e) => {
                // Ctrl+Shift+P for pomodoro timer
                if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
                    e.preventDefault();
                    if (this.visible) {
                        this.hide();
                    } else {
                        this.show();
                    }
                }
            });
        }

        show() {
            this.visible = true;
            this.container.classList.add('visible');
            this.updateDisplay();
        }

        hide() {
            this.visible = false;
            this.container.classList.remove('visible');
        }

        setMode(mode) {
            this.state.mode = mode;
            this.state.isRunning = false;
            
            switch (mode) {
                case 'focus':
                    this.state.timeRemaining = this.settings.focusDuration;
                    break;
                case 'short-break':
                    this.state.timeRemaining = this.settings.shortBreak;
                    break;
                case 'long-break':
                    this.state.timeRemaining = this.settings.longBreak;
                    break;
            }
            
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
            }
            
            // Update tab styling
            this.container.querySelectorAll('.mode-tab').forEach(tab => {
                const isActive = tab.dataset.mode === mode;
                tab.classList.toggle('active', isActive);
                tab.classList.toggle('break', isActive && mode !== 'focus');
            });
            
            this.updateDisplay();
        }

        toggleTimer() {
            if (this.state.isRunning) {
                this.pause();
            } else {
                this.start();
            }
        }

        start() {
            if (this.state.timeRemaining <= 0) {
                this.reset();
            }
            
            this.state.isRunning = true;
            this.updateDisplay();
            
            this.timerInterval = setInterval(() => {
                this.state.timeRemaining--;
                
                if (this.state.mode === 'focus') {
                    this.state.totalFocusTime++;
                }
                
                this.updateDisplay();
                
                if (this.state.timeRemaining <= 0) {
                    this.complete();
                }
            }, 1000);
        }

        pause() {
            this.state.isRunning = false;
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
            }
            this.updateDisplay();
        }

        reset() {
            this.pause();
            this.setMode(this.state.mode);
        }

        skip() {
            this.complete();
        }

        complete() {
            this.pause();
            
            if (this.state.mode === 'focus') {
                this.state.sessionsCompleted++;
                this.saveStats();
                
                // Notify
                if (this.settings.notifications && 'Notification' in window) {
                    if (Notification.permission === 'granted') {
                        new Notification('🍅 Focus Session Complete!', {
                            body: 'Great work! Time for a break.',
                            icon: '🍅'
                        });
                    }
                }
                
                this.toast('Focus session complete! 🎉', 'success');
                
                // Auto-switch to break
                if (this.state.sessionsCompleted % this.settings.longBreakInterval === 0) {
                    this.setMode('long-break');
                } else {
                    this.setMode('short-break');
                }
            } else {
                this.toast('Break complete! Ready to focus?', 'info');
                this.setMode('focus');
            }
            
            if (this.settings.autoStart) {
                setTimeout(() => this.start(), 1000);
            }
        }

        updateDisplay() {
            const minutes = Math.floor(this.state.timeRemaining / 60);
            const seconds = this.state.timeRemaining % 60;
            
            // Update time
            this.container.querySelector('.timer-time').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            
            // Update progress circle
            const progress = this.container.querySelector('.timer-circle-progress');
            const totalDuration = this.state.mode === 'focus' 
                ? this.settings.focusDuration 
                : (this.state.mode === 'short-break' ? this.settings.shortBreak : this.settings.longBreak);
            const percentage = this.state.timeRemaining / totalDuration;
            const dashOffset = 502 * (1 - percentage);
            progress.style.strokeDashoffset = dashOffset;
            progress.classList.toggle('break', this.state.mode !== 'focus');
            
            // Update label
            const labels = {
                'focus': 'Focus Session',
                'short-break': 'Short Break',
                'long-break': 'Long Break'
            };
            this.container.querySelector('.timer-label').textContent = labels[this.state.mode];
            
            // Update play/pause button
            const playBtn = this.container.querySelector('.control-btn.primary');
            playBtn.textContent = this.state.isRunning ? '⏸' : '▶';
            
            // Update stats
            this.container.querySelector('#sessions-count').textContent = this.state.sessionsCompleted;
            this.container.querySelector('#focus-time').textContent = this.formatTime(this.state.totalFocusTime);
            this.container.querySelector('#streak').textContent = 
                Math.floor(this.state.sessionsCompleted / this.settings.longBreakInterval);
        }

        formatTime(seconds) {
            const hours = Math.floor(seconds / 3600);
            const mins = Math.floor((seconds % 3600) / 60);
            return `${hours}h ${mins}m`;
        }

        toast(message, type = 'info') {
            window.dispatchEvent(new CustomEvent('bael:toast', {
                detail: { message, type }
            }));
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════

    window.BaelPomodoroTimer = new BaelPomodoroTimer();
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.BaelPomodoroTimer.initialize();
        });
    } else {
        window.BaelPomodoroTimer.initialize();
    }

    console.log('🍅 Bael Pomodoro Timer loaded');
})();
