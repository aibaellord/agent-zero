/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █    █████╗ ███╗   ██╗ █████╗ ██╗  ██╗   ██╗████████╗██╗ ██████╗███████╗  █
 * █   ██╔══██╗████╗  ██║██╔══██╗██║  ╚██╗ ██╔╝╚══██╔══╝██║██╔════╝██╔════╝  █
 * █   ███████║██╔██╗ ██║███████║██║   ╚████╔╝    ██║   ██║██║     ███████╗  █
 * █   ██╔══██║██║╚██╗██║██╔══██║██║    ╚██╔╝     ██║   ██║██║     ╚════██║  █
 * █   ██║  ██║██║ ╚████║██║  ██║███████╗██║      ██║   ██║╚██████╗███████║  █
 * █   ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝╚═╝      ╚═╝   ╚═╝ ╚═════╝╚══════╝  █
 * █                                                                          █
 * █   BAEL USAGE ANALYTICS - Comprehensive Usage Tracking & Reports         █
 * █   Deep insights into how you use Agent Zero                             █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function() {
    'use strict';

    class BaelUsageAnalytics {
        constructor() {
            this.version = '1.0.0';
            this.initialized = false;
            this.visible = false;
            this.container = null;
            
            this.analytics = {
                sessions: [],
                messages: [],
                commands: [],
                features: {},
                errors: [],
                performance: []
            };
            
            this.currentSession = null;
        }

        async initialize() {
            console.log('📊 Bael Usage Analytics initializing...');
            
            this.loadAnalytics();
            this.startSession();
            this.injectStyles();
            this.createContainer();
            this.setupTracking();
            this.setupShortcuts();
            
            this.initialized = true;
            console.log('✅ BAEL USAGE ANALYTICS READY');
            
            return this;
        }

        injectStyles() {
            if (document.getElementById('bael-usage-analytics-styles')) return;
            
            const styles = document.createElement('style');
            styles.id = 'bael-usage-analytics-styles';
            styles.textContent = `
                .bael-usage-analytics {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 10008;
                    background: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(8px);
                    overflow-y: auto;
                }
                
                .bael-usage-analytics.visible { display: block; }
                
                .analytics-container {
                    max-width: 1200px;
                    margin: 40px auto;
                    padding: 0 24px;
                }
                
                .analytics-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 30px;
                }
                
                .analytics-header h1 {
                    font-size: 24px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                
                .analytics-close {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    border: none;
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                }
                
                .analytics-close:hover {
                    background: rgba(239, 68, 68, 0.3);
                }
                
                .analytics-period {
                    display: flex;
                    gap: 8px;
                }
                
                .period-btn {
                    padding: 8px 16px;
                    border-radius: 8px;
                    border: none;
                    background: rgba(255, 255, 255, 0.08);
                    color: rgba(255, 255, 255, 0.7);
                    cursor: pointer;
                    font-size: 13px;
                    transition: all 0.2s;
                }
                
                .period-btn:hover {
                    background: rgba(255, 255, 255, 0.12);
                }
                
                .period-btn.active {
                    background: #6366f1;
                    color: #fff;
                }
                
                .stats-overview {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 20px;
                    margin-bottom: 30px;
                }
                
                .stat-card {
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%);
                    border-radius: 16px;
                    padding: 24px;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                }
                
                .stat-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    margin-bottom: 16px;
                }
                
                .stat-icon.sessions { background: rgba(99, 102, 241, 0.2); }
                .stat-icon.messages { background: rgba(34, 197, 94, 0.2); }
                .stat-icon.tokens { background: rgba(245, 158, 11, 0.2); }
                .stat-icon.time { background: rgba(14, 165, 233, 0.2); }
                .stat-icon.commands { background: rgba(168, 85, 247, 0.2); }
                
                .stat-value {
                    font-size: 32px;
                    font-weight: 700;
                    margin-bottom: 4px;
                }
                
                .stat-label {
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.5);
                }
                
                .stat-trend {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 12px;
                    margin-top: 8px;
                }
                
                .stat-trend.up { color: #22c55e; }
                .stat-trend.down { color: #ef4444; }
                .stat-trend.neutral { color: rgba(255, 255, 255, 0.4); }
                
                .charts-section {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 20px;
                    margin-bottom: 30px;
                }
                
                .chart-card {
                    background: rgba(255, 255, 255, 0.04);
                    border-radius: 16px;
                    padding: 24px;
                }
                
                .chart-title {
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .activity-chart {
                    height: 200px;
                    display: flex;
                    align-items: flex-end;
                    gap: 6px;
                    padding-top: 20px;
                }
                
                .activity-bar {
                    flex: 1;
                    background: linear-gradient(to top, #6366f1 0%, #a5b4fc 100%);
                    border-radius: 4px 4px 0 0;
                    min-height: 4px;
                    transition: all 0.3s;
                    position: relative;
                }
                
                .activity-bar:hover {
                    background: linear-gradient(to top, #4f46e5 0%, #818cf8 100%);
                }
                
                .activity-bar::after {
                    content: attr(data-value);
                    position: absolute;
                    bottom: calc(100% + 4px);
                    left: 50%;
                    transform: translateX(-50%);
                    font-size: 10px;
                    color: rgba(255, 255, 255, 0.6);
                    opacity: 0;
                    transition: opacity 0.2s;
                }
                
                .activity-bar:hover::after {
                    opacity: 1;
                }
                
                .chart-labels {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 10px;
                    font-size: 10px;
                    color: rgba(255, 255, 255, 0.4);
                }
                
                .pie-chart {
                    width: 160px;
                    height: 160px;
                    border-radius: 50%;
                    background: conic-gradient(
                        #6366f1 0% 40%,
                        #22c55e 40% 65%,
                        #f59e0b 65% 85%,
                        #ef4444 85% 100%
                    );
                    margin: 0 auto 20px;
                    position: relative;
                }
                
                .pie-center {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 80px;
                    height: 80px;
                    background: #1a1a2e;
                    border-radius: 50%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                }
                
                .pie-value {
                    font-size: 20px;
                    font-weight: 700;
                }
                
                .pie-label {
                    font-size: 10px;
                    color: rgba(255, 255, 255, 0.5);
                }
                
                .pie-legend {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                    justify-content: center;
                }
                
                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                }
                
                .legend-color {
                    width: 12px;
                    height: 12px;
                    border-radius: 3px;
                }
                
                .features-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                
                .feature-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                
                .feature-name {
                    flex: 1;
                    font-size: 13px;
                }
                
                .feature-bar-container {
                    flex: 2;
                    height: 8px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                    overflow: hidden;
                }
                
                .feature-bar {
                    height: 100%;
                    background: linear-gradient(90deg, #6366f1 0%, #a5b4fc 100%);
                    border-radius: 4px;
                    transition: width 0.3s;
                }
                
                .feature-count {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.5);
                    min-width: 40px;
                    text-align: right;
                }
                
                .timeline-section {
                    background: rgba(255, 255, 255, 0.04);
                    border-radius: 16px;
                    padding: 24px;
                }
                
                .timeline-list {
                    max-height: 300px;
                    overflow-y: auto;
                }
                
                .timeline-item {
                    display: flex;
                    gap: 16px;
                    padding: 12px 0;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
                }
                
                .timeline-time {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.4);
                    min-width: 80px;
                }
                
                .timeline-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background: rgba(99, 102, 241, 0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                }
                
                .timeline-content {
                    flex: 1;
                }
                
                .timeline-title {
                    font-size: 13px;
                    margin-bottom: 2px;
                }
                
                .timeline-meta {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.4);
                }
                
                .export-section {
                    display: flex;
                    justify-content: center;
                    gap: 12px;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                }
                
                .export-btn {
                    padding: 12px 24px;
                    border-radius: 10px;
                    border: none;
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                    cursor: pointer;
                    font-size: 13px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.2s;
                }
                
                .export-btn:hover {
                    background: rgba(255, 255, 255, 0.15);
                }
                
                .export-btn.primary {
                    background: #6366f1;
                }
                
                .export-btn.primary:hover {
                    background: #4f46e5;
                }
            `;
            document.head.appendChild(styles);
        }

        createContainer() {
            this.container = document.createElement('div');
            this.container.id = 'bael-usage-analytics';
            this.container.className = 'bael-usage-analytics';
            
            document.body.appendChild(this.container);
            this.render();
        }

        setupTracking() {
            // Track messages
            window.addEventListener('bael:message-sent', (e) => {
                this.trackMessage('sent', e.detail);
            });
            
            window.addEventListener('bael:message-received', (e) => {
                this.trackMessage('received', e.detail);
            });
            
            // Track commands
            window.addEventListener('bael:command-executed', (e) => {
                this.trackCommand(e.detail);
            });
            
            // Track feature usage
            window.addEventListener('bael:feature-used', (e) => {
                this.trackFeature(e.detail.feature);
            });
            
            // Track errors
            window.addEventListener('error', (e) => {
                this.trackError(e);
            });
            
            // Track panel opens
            ['memory-dashboard', 'agent-console', 'performance-dashboard', 
             'command-center', 'template-library', 'system-status', 
             'unified-search', 'favorites-hub', 'ai-insights'].forEach(panel => {
                window.addEventListener(`bael:${panel}-opened`, () => {
                    this.trackFeature(panel);
                });
            });
            
            // Save analytics periodically
            setInterval(() => this.saveAnalytics(), 60000);
            
            // Save on unload
            window.addEventListener('beforeunload', () => {
                this.endSession();
                this.saveAnalytics();
            });
        }

        setupShortcuts() {
            document.addEventListener('keydown', (e) => {
                // Ctrl+Shift+U for analytics
                if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'U') {
                    e.preventDefault();
                    this.toggle();
                }
            });
        }

        // ═══════════════════════════════════════════════════════════════════════
        // SESSION TRACKING
        // ═══════════════════════════════════════════════════════════════════════

        startSession() {
            this.currentSession = {
                id: Date.now().toString(),
                startTime: Date.now(),
                endTime: null,
                messageCount: 0,
                commandCount: 0
            };
            
            this.analytics.sessions.push(this.currentSession);
        }

        endSession() {
            if (this.currentSession) {
                this.currentSession.endTime = Date.now();
                this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime;
            }
        }

        trackMessage(type, data) {
            const message = {
                timestamp: Date.now(),
                type: type,
                sessionId: this.currentSession?.id,
                tokenCount: data?.tokenCount || 0
            };
            
            this.analytics.messages.push(message);
            
            if (this.currentSession) {
                this.currentSession.messageCount++;
            }
            
            // Keep last 1000 messages
            if (this.analytics.messages.length > 1000) {
                this.analytics.messages = this.analytics.messages.slice(-1000);
            }
        }

        trackCommand(data) {
            const command = {
                timestamp: Date.now(),
                command: data?.command || 'unknown',
                sessionId: this.currentSession?.id
            };
            
            this.analytics.commands.push(command);
            
            if (this.currentSession) {
                this.currentSession.commandCount++;
            }
            
            // Keep last 500 commands
            if (this.analytics.commands.length > 500) {
                this.analytics.commands = this.analytics.commands.slice(-500);
            }
        }

        trackFeature(feature) {
            if (!this.analytics.features[feature]) {
                this.analytics.features[feature] = 0;
            }
            this.analytics.features[feature]++;
        }

        trackError(error) {
            this.analytics.errors.push({
                timestamp: Date.now(),
                message: error.message,
                sessionId: this.currentSession?.id
            });
            
            // Keep last 100 errors
            if (this.analytics.errors.length > 100) {
                this.analytics.errors = this.analytics.errors.slice(-100);
            }
        }

        // ═══════════════════════════════════════════════════════════════════════
        // ANALYTICS PERSISTENCE
        // ═══════════════════════════════════════════════════════════════════════

        loadAnalytics() {
            try {
                const stored = localStorage.getItem('bael_usage_analytics');
                if (stored) {
                    this.analytics = JSON.parse(stored);
                }
            } catch (e) {
                console.error('Failed to load analytics:', e);
            }
        }

        saveAnalytics() {
            try {
                localStorage.setItem('bael_usage_analytics', JSON.stringify(this.analytics));
            } catch (e) {
                console.error('Failed to save analytics:', e);
            }
        }

        // ═══════════════════════════════════════════════════════════════════════
        // COMPUTED STATS
        // ═══════════════════════════════════════════════════════════════════════

        getStats(period = 'week') {
            const now = Date.now();
            const periods = {
                day: 86400000,
                week: 604800000,
                month: 2592000000,
                all: Infinity
            };
            
            const cutoff = now - (periods[period] || periods.week);
            
            const sessions = this.analytics.sessions.filter(s => s.startTime >= cutoff);
            const messages = this.analytics.messages.filter(m => m.timestamp >= cutoff);
            const commands = this.analytics.commands.filter(c => c.timestamp >= cutoff);
            
            const totalTime = sessions.reduce((sum, s) => {
                const duration = (s.endTime || now) - s.startTime;
                return sum + duration;
            }, 0);
            
            const totalTokens = messages.reduce((sum, m) => sum + (m.tokenCount || 0), 0);
            
            return {
                sessionCount: sessions.length,
                messageCount: messages.length,
                commandCount: commands.length,
                totalTime: totalTime,
                totalTokens: totalTokens,
                avgSessionLength: sessions.length > 0 ? totalTime / sessions.length : 0,
                messagesPerSession: sessions.length > 0 ? messages.length / sessions.length : 0
            };
        }

        getActivityData(days = 14) {
            const data = [];
            const now = new Date();
            
            for (let i = days - 1; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                date.setHours(0, 0, 0, 0);
                
                const nextDay = new Date(date);
                nextDay.setDate(nextDay.getDate() + 1);
                
                const count = this.analytics.messages.filter(m => 
                    m.timestamp >= date.getTime() && m.timestamp < nextDay.getTime()
                ).length;
                
                data.push({
                    date: date,
                    count: count,
                    label: date.toLocaleDateString('en-US', { weekday: 'short' })
                });
            }
            
            return data;
        }

        getTopFeatures(limit = 10) {
            return Object.entries(this.analytics.features)
                .sort((a, b) => b[1] - a[1])
                .slice(0, limit)
                .map(([name, count]) => ({ name, count }));
        }

        // ═══════════════════════════════════════════════════════════════════════
        // RENDERING
        // ═══════════════════════════════════════════════════════════════════════

        render(period = 'week') {
            const stats = this.getStats(period);
            const activity = this.getActivityData();
            const topFeatures = this.getTopFeatures();
            const maxActivity = Math.max(...activity.map(d => d.count), 1);
            const maxFeature = Math.max(...topFeatures.map(f => f.count), 1);
            
            this.container.innerHTML = `
                <div class="analytics-container">
                    <div class="analytics-header">
                        <h1>📊 Usage Analytics</h1>
                        <div class="analytics-period">
                            <button class="period-btn ${period === 'day' ? 'active' : ''}" data-period="day">Today</button>
                            <button class="period-btn ${period === 'week' ? 'active' : ''}" data-period="week">Week</button>
                            <button class="period-btn ${period === 'month' ? 'active' : ''}" data-period="month">Month</button>
                            <button class="period-btn ${period === 'all' ? 'active' : ''}" data-period="all">All Time</button>
                        </div>
                        <button class="analytics-close" onclick="BaelUsageAnalytics.hide()">×</button>
                    </div>
                    
                    <div class="stats-overview">
                        <div class="stat-card">
                            <div class="stat-icon sessions">📅</div>
                            <div class="stat-value">${stats.sessionCount}</div>
                            <div class="stat-label">Sessions</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon messages">💬</div>
                            <div class="stat-value">${stats.messageCount}</div>
                            <div class="stat-label">Messages</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon commands">⚡</div>
                            <div class="stat-value">${stats.commandCount}</div>
                            <div class="stat-label">Commands</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon time">⏱️</div>
                            <div class="stat-value">${this.formatDuration(stats.totalTime)}</div>
                            <div class="stat-label">Total Time</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-icon tokens">🎫</div>
                            <div class="stat-value">${this.formatNumber(stats.totalTokens)}</div>
                            <div class="stat-label">Tokens Used</div>
                        </div>
                    </div>
                    
                    <div class="charts-section">
                        <div class="chart-card">
                            <div class="chart-title">📈 Activity (Last 14 Days)</div>
                            <div class="activity-chart">
                                ${activity.map(d => `
                                    <div class="activity-bar" 
                                         style="height: ${(d.count / maxActivity) * 100}%"
                                         data-value="${d.count}"
                                         title="${d.date.toLocaleDateString()}: ${d.count} messages"></div>
                                `).join('')}
                            </div>
                            <div class="chart-labels">
                                ${activity.filter((_, i) => i % 2 === 0).map(d => 
                                    `<span>${d.label}</span>`
                                ).join('')}
                            </div>
                        </div>
                        
                        <div class="chart-card">
                            <div class="chart-title">🎯 Top Features</div>
                            <div class="features-list">
                                ${topFeatures.length > 0 ? topFeatures.map(f => `
                                    <div class="feature-item">
                                        <span class="feature-name">${this.formatFeatureName(f.name)}</span>
                                        <div class="feature-bar-container">
                                            <div class="feature-bar" style="width: ${(f.count / maxFeature) * 100}%"></div>
                                        </div>
                                        <span class="feature-count">${f.count}</span>
                                    </div>
                                `).join('') : '<div style="color: rgba(255,255,255,0.4)">No feature usage tracked yet</div>'}
                            </div>
                        </div>
                    </div>
                    
                    <div class="export-section">
                        <button class="export-btn" onclick="BaelUsageAnalytics.exportData('json')">
                            📄 Export JSON
                        </button>
                        <button class="export-btn" onclick="BaelUsageAnalytics.exportData('csv')">
                            📊 Export CSV
                        </button>
                        <button class="export-btn primary" onclick="BaelUsageAnalytics.clearData()">
                            🗑️ Clear Data
                        </button>
                    </div>
                </div>
            `;
            
            // Bind period buttons
            this.container.querySelectorAll('.period-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.render(btn.dataset.period);
                });
            });
        }

        formatDuration(ms) {
            const hours = Math.floor(ms / 3600000);
            const minutes = Math.floor((ms % 3600000) / 60000);
            
            if (hours > 0) {
                return `${hours}h ${minutes}m`;
            }
            return `${minutes}m`;
        }

        formatNumber(num) {
            if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
            if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
            return num.toString();
        }

        formatFeatureName(name) {
            return name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        }

        exportData(format) {
            if (format === 'json') {
                const data = JSON.stringify(this.analytics, null, 2);
                this.downloadFile(data, 'bael-analytics.json', 'application/json');
            } else if (format === 'csv') {
                // Export messages as CSV
                const headers = ['timestamp', 'type', 'sessionId', 'tokenCount'];
                const rows = this.analytics.messages.map(m => 
                    headers.map(h => m[h] || '').join(',')
                );
                const csv = [headers.join(','), ...rows].join('\n');
                this.downloadFile(csv, 'bael-analytics.csv', 'text/csv');
            }
        }

        downloadFile(content, filename, type) {
            const blob = new Blob([content], { type });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
        }

        clearData() {
            if (confirm('Are you sure you want to clear all analytics data?')) {
                this.analytics = {
                    sessions: [],
                    messages: [],
                    commands: [],
                    features: {},
                    errors: [],
                    performance: []
                };
                this.saveAnalytics();
                this.startSession();
                this.render();
            }
        }

        // ═══════════════════════════════════════════════════════════════════════
        // VISIBILITY
        // ═══════════════════════════════════════════════════════════════════════

        show() {
            this.render();
            this.container.classList.add('visible');
            this.visible = true;
        }

        hide() {
            this.container.classList.remove('visible');
            this.visible = false;
        }

        toggle() {
            if (this.visible) this.hide();
            else this.show();
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════

    window.BaelUsageAnalytics = new BaelUsageAnalytics();
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.BaelUsageAnalytics.initialize();
        });
    } else {
        window.BaelUsageAnalytics.initialize();
    }

    console.log('📊 Bael Usage Analytics loaded');
})();
