/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █  ███╗   ███╗███████╗████████╗██████╗ ██╗ ██████╗███████╗                 █
 * █  ████╗ ████║██╔════╝╚══██╔══╝██╔══██╗██║██╔════╝██╔════╝                 █
 * █  ██╔████╔██║█████╗     ██║   ██████╔╝██║██║     ███████╗                 █
 * █  ██║╚██╔╝██║██╔══╝     ██║   ██╔══██╗██║██║     ╚════██║                 █
 * █  ██║ ╚═╝ ██║███████╗   ██║   ██║  ██║██║╚██████╗███████║                 █
 * █  ╚═╝     ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝ ╚═════╝╚══════╝                 █
 * █                                                                          █
 * █   BAEL METRICS DASHBOARD - Real-time Usage Analytics                     █
 * █   Track usage patterns, performance, and system metrics                  █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function() {
    'use strict';

    class BaelMetricsDashboard {
        constructor() {
            this.version = '1.0.0';
            this.initialized = false;
            this.visible = false;
            this.container = null;
            
            this.metrics = {
                sessions: { today: 0, total: 0 },
                messages: { today: 0, total: 0 },
                tokensUsed: { today: 0, total: 0 },
                avgResponseTime: 0,
                peakHour: 0,
                favoriteAgent: null,
                uptime: 0,
                startTime: null,
                hourlyActivity: Array(24).fill(0),
                dailyActivity: Array(7).fill(0)
            };
            
            this.tracking = true;
        }

        async initialize() {
            console.log('📊 Bael Metrics Dashboard initializing...');
            
            this.loadMetrics();
            this.injectStyles();
            this.createContainer();
            this.setupShortcuts();
            this.startTracking();
            
            this.initialized = true;
            console.log('✅ BAEL METRICS DASHBOARD READY');
            
            return this;
        }

        loadMetrics() {
            try {
                const saved = localStorage.getItem('bael-metrics');
                if (saved) {
                    this.metrics = { ...this.metrics, ...JSON.parse(saved) };
                }
            } catch (e) {}
            
            this.metrics.startTime = Date.now();
            
            // Reset daily metrics if new day
            const lastDate = localStorage.getItem('bael-metrics-date');
            const today = new Date().toDateString();
            if (lastDate !== today) {
                this.metrics.sessions.today = 0;
                this.metrics.messages.today = 0;
                this.metrics.tokensUsed.today = 0;
                localStorage.setItem('bael-metrics-date', today);
            }
            
            // Increment session
            this.metrics.sessions.today++;
            this.metrics.sessions.total++;
            this.saveMetrics();
        }

        saveMetrics() {
            try {
                localStorage.setItem('bael-metrics', JSON.stringify(this.metrics));
            } catch (e) {}
        }

        injectStyles() {
            if (document.getElementById('bael-metrics-styles')) return;
            
            const styles = document.createElement('style');
            styles.id = 'bael-metrics-styles';
            styles.textContent = `
                .bael-metrics-container {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0.95);
                    width: 90%;
                    max-width: 900px;
                    max-height: 85vh;
                    background: #12121a;
                    border-radius: 20px;
                    box-shadow: 0 30px 100px rgba(0, 0, 0, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    z-index: 9850;
                    opacity: 0;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    pointer-events: none;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }
                
                .bael-metrics-container.visible {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                    pointer-events: auto;
                }
                
                .bael-metrics-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    z-index: 9849;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    pointer-events: none;
                }
                
                .bael-metrics-backdrop.visible {
                    opacity: 1;
                    pointer-events: auto;
                }
                
                .metrics-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 20px 24px;
                    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }
                
                .metrics-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 18px;
                    font-weight: 600;
                    color: #fff;
                }
                
                .metrics-live {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    color: #10b981;
                }
                
                .metrics-live-dot {
                    width: 8px;
                    height: 8px;
                    background: #10b981;
                    border-radius: 50%;
                    animation: pulse 2s infinite;
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
                
                .metrics-close {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    border: none;
                    background: rgba(255, 255, 255, 0.08);
                    color: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    font-size: 16px;
                    transition: all 0.2s;
                }
                
                .metrics-close:hover {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }
                
                .metrics-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px;
                }
                
                .metrics-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                    margin-bottom: 24px;
                }
                
                .metric-card {
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 16px;
                    padding: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    text-align: center;
                }
                
                .metric-icon {
                    font-size: 28px;
                    margin-bottom: 12px;
                }
                
                .metric-value {
                    font-size: 28px;
                    font-weight: 700;
                    color: #fff;
                    margin-bottom: 4px;
                }
                
                .metric-label {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.4);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                
                .metric-change {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 11px;
                    margin-top: 8px;
                    padding: 3px 8px;
                    border-radius: 8px;
                }
                
                .metric-change.positive {
                    background: rgba(34, 197, 94, 0.15);
                    color: #22c55e;
                }
                
                .metric-change.negative {
                    background: rgba(239, 68, 68, 0.15);
                    color: #ef4444;
                }
                
                .charts-row {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                    margin-bottom: 24px;
                }
                
                .chart-card {
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 16px;
                    padding: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.06);
                }
                
                .chart-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: #fff;
                    margin-bottom: 16px;
                }
                
                .bar-chart {
                    display: flex;
                    align-items: flex-end;
                    height: 120px;
                    gap: 4px;
                }
                
                .bar {
                    flex: 1;
                    background: linear-gradient(180deg, #10b981 0%, #059669 100%);
                    border-radius: 4px 4px 0 0;
                    min-height: 4px;
                    transition: height 0.3s ease;
                    position: relative;
                }
                
                .bar:hover {
                    opacity: 0.8;
                }
                
                .bar-label {
                    position: absolute;
                    bottom: -20px;
                    left: 50%;
                    transform: translateX(-50%);
                    font-size: 9px;
                    color: rgba(255, 255, 255, 0.3);
                    white-space: nowrap;
                }
                
                .activity-grid {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 4px;
                }
                
                .activity-cell {
                    aspect-ratio: 1;
                    border-radius: 4px;
                    background: rgba(16, 185, 129, 0.1);
                    transition: all 0.2s;
                }
                
                .activity-cell.level-1 { background: rgba(16, 185, 129, 0.2); }
                .activity-cell.level-2 { background: rgba(16, 185, 129, 0.4); }
                .activity-cell.level-3 { background: rgba(16, 185, 129, 0.6); }
                .activity-cell.level-4 { background: rgba(16, 185, 129, 0.8); }
                .activity-cell.level-5 { background: #10b981; }
                
                .insights-section {
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 16px;
                    padding: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.06);
                }
                
                .insights-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: #fff;
                    margin-bottom: 16px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .insight-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                
                .insight-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 10px;
                }
                
                .insight-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    background: rgba(16, 185, 129, 0.15);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                }
                
                .insight-text {
                    flex: 1;
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.7);
                }
                
                .insight-value {
                    font-size: 14px;
                    font-weight: 600;
                    color: #10b981;
                }
            `;
            document.head.appendChild(styles);
        }

        createContainer() {
            // Create backdrop
            this.backdrop = document.createElement('div');
            this.backdrop.className = 'bael-metrics-backdrop';
            this.backdrop.onclick = () => this.hide();
            document.body.appendChild(this.backdrop);
            
            // Create main container
            this.container = document.createElement('div');
            this.container.id = 'bael-metrics-dashboard';
            this.container.className = 'bael-metrics-container';
            
            this.renderContainer();
            
            document.body.appendChild(this.container);
        }

        renderContainer() {
            const uptime = this.formatUptime(Date.now() - this.metrics.startTime);
            
            this.container.innerHTML = `
                <div class="metrics-header">
                    <div class="metrics-title">
                        <span>📊</span> Metrics Dashboard
                    </div>
                    <div class="metrics-live">
                        <span class="metrics-live-dot"></span>
                        Live • Uptime: ${uptime}
                    </div>
                    <button class="metrics-close" onclick="BaelMetricsDashboard.hide()">✕</button>
                </div>
                <div class="metrics-content">
                    <div class="metrics-grid">
                        <div class="metric-card">
                            <div class="metric-icon">💬</div>
                            <div class="metric-value">${this.metrics.messages.today}</div>
                            <div class="metric-label">Messages Today</div>
                            <div class="metric-change positive">↑ ${this.metrics.messages.total} total</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-icon">🚀</div>
                            <div class="metric-value">${this.metrics.sessions.today}</div>
                            <div class="metric-label">Sessions Today</div>
                            <div class="metric-change positive">↑ ${this.metrics.sessions.total} total</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-icon">⚡</div>
                            <div class="metric-value">${this.formatNumber(this.metrics.tokensUsed.today)}</div>
                            <div class="metric-label">Tokens Used</div>
                            <div class="metric-change positive">${this.formatNumber(this.metrics.tokensUsed.total)} total</div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-icon">⏱️</div>
                            <div class="metric-value">${this.metrics.avgResponseTime}ms</div>
                            <div class="metric-label">Avg Response</div>
                            <div class="metric-change ${this.metrics.avgResponseTime < 2000 ? 'positive' : 'negative'}">
                                ${this.metrics.avgResponseTime < 2000 ? '✓ Fast' : '⚠ Slow'}
                            </div>
                        </div>
                    </div>
                    
                    <div class="charts-row">
                        <div class="chart-card">
                            <div class="chart-title">📈 Hourly Activity</div>
                            <div class="bar-chart">
                                ${this.metrics.hourlyActivity.map((val, i) => `
                                    <div class="bar" style="height: ${Math.max(4, (val / Math.max(...this.metrics.hourlyActivity, 1)) * 100)}%">
                                        <span class="bar-label">${i}h</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        <div class="chart-card">
                            <div class="chart-title">📅 Weekly Activity</div>
                            <div class="bar-chart">
                                ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => `
                                    <div class="bar" style="height: ${Math.max(4, (this.metrics.dailyActivity[i] / Math.max(...this.metrics.dailyActivity, 1)) * 100)}%">
                                        <span class="bar-label">${day}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <div class="insights-section">
                        <div class="insights-title">
                            💡 Insights
                        </div>
                        <div class="insight-list">
                            <div class="insight-item">
                                <div class="insight-icon">🕐</div>
                                <div class="insight-text">Peak productivity hour</div>
                                <div class="insight-value">${this.getPeakHour()}</div>
                            </div>
                            <div class="insight-item">
                                <div class="insight-icon">📊</div>
                                <div class="insight-text">Average messages per session</div>
                                <div class="insight-value">${this.getAvgMessagesPerSession()}</div>
                            </div>
                            <div class="insight-item">
                                <div class="insight-icon">🔥</div>
                                <div class="insight-text">Most active day this week</div>
                                <div class="insight-value">${this.getMostActiveDay()}</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        setupShortcuts() {
            document.addEventListener('keydown', (e) => {
                // Ctrl+Shift+D for dashboard
                if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'D') {
                    e.preventDefault();
                    if (this.visible) {
                        this.hide();
                    } else {
                        this.show();
                    }
                }
                
                // Escape to close
                if (e.key === 'Escape' && this.visible) {
                    this.hide();
                }
            });
        }

        startTracking() {
            // Track message events
            window.addEventListener('bael:message', (e) => {
                this.trackMessage(e.detail);
            });
            
            // Track periodic stats
            setInterval(() => {
                if (this.visible) {
                    this.renderContainer();
                }
            }, 10000);
            
            // Track hourly
            const hour = new Date().getHours();
            this.metrics.hourlyActivity[hour]++;
            
            // Track daily
            const day = new Date().getDay();
            this.metrics.dailyActivity[day]++;
            
            this.saveMetrics();
        }

        trackMessage(detail) {
            this.metrics.messages.today++;
            this.metrics.messages.total++;
            
            if (detail?.tokens) {
                this.metrics.tokensUsed.today += detail.tokens;
                this.metrics.tokensUsed.total += detail.tokens;
            }
            
            if (detail?.responseTime) {
                // Running average
                const total = this.metrics.messages.total;
                this.metrics.avgResponseTime = Math.round(
                    (this.metrics.avgResponseTime * (total - 1) + detail.responseTime) / total
                );
            }
            
            // Track hourly
            const hour = new Date().getHours();
            this.metrics.hourlyActivity[hour]++;
            
            // Track daily
            const day = new Date().getDay();
            this.metrics.dailyActivity[day]++;
            
            this.saveMetrics();
        }

        show() {
            this.visible = true;
            this.backdrop.classList.add('visible');
            this.container.classList.add('visible');
            this.renderContainer();
        }

        hide() {
            this.visible = false;
            this.backdrop.classList.remove('visible');
            this.container.classList.remove('visible');
        }

        formatUptime(ms) {
            const seconds = Math.floor(ms / 1000);
            const minutes = Math.floor(seconds / 60);
            const hours = Math.floor(minutes / 60);
            
            if (hours > 0) return `${hours}h ${minutes % 60}m`;
            if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
            return `${seconds}s`;
        }

        formatNumber(num) {
            if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
            if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
            return num.toString();
        }

        getPeakHour() {
            const max = Math.max(...this.metrics.hourlyActivity);
            const hour = this.metrics.hourlyActivity.indexOf(max);
            return `${hour}:00 - ${hour + 1}:00`;
        }

        getAvgMessagesPerSession() {
            if (this.metrics.sessions.total === 0) return '0';
            return (this.metrics.messages.total / this.metrics.sessions.total).toFixed(1);
        }

        getMostActiveDay() {
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            const max = Math.max(...this.metrics.dailyActivity);
            const dayIndex = this.metrics.dailyActivity.indexOf(max);
            return days[dayIndex];
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════

    window.BaelMetricsDashboard = new BaelMetricsDashboard();
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.BaelMetricsDashboard.initialize();
        });
    } else {
        window.BaelMetricsDashboard.initialize();
    }

    console.log('📊 Bael Metrics Dashboard loaded');
})();
