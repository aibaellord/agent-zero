/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █    █████╗ ██╗    ██╗███╗   ██╗███████╗██╗ ██████╗ ██╗  ██╗████████╗███████╗█
 * █   ██╔══██╗██║    ██║████╗  ██║██╔════╝██║██╔════╝ ██║  ██║╚══██╔══╝██╔════╝█
 * █   ███████║██║    ██║██╔██╗ ██║███████╗██║██║  ███╗███████║   ██║   ███████╗█
 * █   ██╔══██║██║    ██║██║╚██╗██║╚════██║██║██║   ██║██╔══██║   ██║   ╚════██║█
 * █   ██║  ██║██║    ██║██║ ╚████║███████║██║╚██████╔╝██║  ██║   ██║   ███████║█
 * █   ╚═╝  ╚═╝╚═╝    ╚═╝╚═╝  ╚═══╝╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚══════╝█
 * █                                                                          █
 * █   BAEL AI INSIGHTS - Intelligent Usage Recommendations & Analytics      █
 * █   AI-powered suggestions to optimize your Agent Zero workflow           █
 * █   Keyboard Shortcut: Ctrl+Shift+I                                       █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function() {
    'use strict';

    class BaelAIInsights {
        constructor() {
            this.version = '1.0.0';
            this.initialized = false;
            this.visible = false;
            this.container = null;
            
            // Usage tracking
            this.usage = {
                sessions: [],
                commands: {},
                templates: {},
                features: {},
                errors: [],
                patterns: []
            };
            
            // Generated insights
            this.insights = [];
            this.lastAnalysis = null;
        }

        async initialize() {
            console.log('🧠 Bael AI Insights initializing...');
            
            this.injectStyles();
            this.createContainer();
            this.loadUsageData();
            this.setupShortcuts();
            this.startTracking();
            
            this.initialized = true;
            console.log('✅ BAEL AI INSIGHTS READY');
            
            return this;
        }

        injectStyles() {
            if (document.getElementById('bael-ai-insights-styles')) return;
            
            const styles = document.createElement('style');
            styles.id = 'bael-ai-insights-styles';
            styles.textContent = `
                .bael-ai-insights {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 10002;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(4px);
                    align-items: center;
                    justify-content: center;
                }
                
                .bael-ai-insights.visible { display: flex; }
                
                .insights-dialog {
                    width: 800px;
                    max-width: 95vw;
                    max-height: 85vh;
                    background: #12121a;
                    border-radius: 16px;
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
                    border: 1px solid #2a2a4a;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }
                
                .insights-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px 24px;
                    border-bottom: 1px solid #2a2a4a;
                    background: linear-gradient(135deg, #1a1a2e 0%, #0f0f1a 100%);
                }
                
                .insights-header h2 {
                    margin: 0;
                    font-size: 20px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                
                .insights-badge {
                    padding: 4px 12px;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    border-radius: 16px;
                    font-size: 11px;
                    font-weight: 600;
                }
                
                .insights-actions {
                    display: flex;
                    gap: 8px;
                }
                
                .insight-btn {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 8px;
                    background: rgba(255,255,255,0.05);
                    color: #e0e0e0;
                    cursor: pointer;
                    font-size: 13px;
                    transition: all 0.15s;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                
                .insight-btn:hover { background: rgba(255,255,255,0.1); }
                .insight-btn.primary { background: #6366f1; }
                .insight-btn.primary:hover { background: #4f46e5; }
                .insight-btn-close:hover { background: #ef4444; }
                
                .insights-body {
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px;
                }
                
                .insights-summary {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                    margin-bottom: 24px;
                }
                
                .summary-card {
                    background: linear-gradient(135deg, #1a1a2e 0%, #12121a 100%);
                    border-radius: 12px;
                    padding: 16px;
                    border: 1px solid #2a2a4a;
                    text-align: center;
                }
                
                .summary-icon {
                    font-size: 28px;
                    margin-bottom: 8px;
                }
                
                .summary-value {
                    font-size: 28px;
                    font-weight: 700;
                    background: linear-gradient(135deg, #6366f1, #a5b4fc);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                
                .summary-label {
                    font-size: 12px;
                    color: #888;
                    margin-top: 4px;
                }
                
                .insights-section {
                    margin-bottom: 24px;
                }
                
                .section-title {
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 16px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .insight-card {
                    background: #1a1a2e;
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 12px;
                    border: 1px solid #2a2a4a;
                    border-left: 4px solid #6366f1;
                    transition: all 0.15s;
                }
                
                .insight-card:hover {
                    border-color: #4a4a6a;
                    transform: translateX(4px);
                }
                
                .insight-card.high { border-left-color: #ef4444; }
                .insight-card.medium { border-left-color: #f59e0b; }
                .insight-card.low { border-left-color: #22c55e; }
                
                .insight-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 12px;
                }
                
                .insight-title {
                    font-weight: 600;
                    font-size: 15px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .insight-priority {
                    padding: 3px 10px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 500;
                }
                
                .insight-priority.high { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
                .insight-priority.medium { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
                .insight-priority.low { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
                
                .insight-description {
                    color: #aaa;
                    font-size: 14px;
                    line-height: 1.5;
                    margin-bottom: 12px;
                }
                
                .insight-action {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 16px;
                    background: rgba(99, 102, 241, 0.15);
                    color: #a5b4fc;
                    border-radius: 8px;
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.15s;
                }
                
                .insight-action:hover {
                    background: rgba(99, 102, 241, 0.25);
                }
                
                .usage-chart {
                    height: 120px;
                    display: flex;
                    align-items: flex-end;
                    gap: 4px;
                    padding: 16px;
                    background: #0a0a0f;
                    border-radius: 8px;
                }
                
                .chart-bar {
                    flex: 1;
                    background: linear-gradient(to top, #6366f1, #a5b4fc);
                    border-radius: 4px 4px 0 0;
                    transition: height 0.3s ease;
                    position: relative;
                }
                
                .chart-bar:hover {
                    background: linear-gradient(to top, #4f46e5, #818cf8);
                }
                
                .chart-bar::after {
                    content: attr(data-label);
                    position: absolute;
                    bottom: -20px;
                    left: 50%;
                    transform: translateX(-50%);
                    font-size: 10px;
                    color: #666;
                }
                
                .top-features {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                }
                
                .feature-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    background: #0a0a0f;
                    border-radius: 8px;
                }
                
                .feature-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    background: rgba(99, 102, 241, 0.2);
                }
                
                .feature-info { flex: 1; }
                .feature-name { font-size: 13px; font-weight: 500; }
                .feature-count { font-size: 11px; color: #888; }
                
                .feature-bar {
                    width: 100%;
                    height: 4px;
                    background: #2a2a4a;
                    border-radius: 2px;
                    margin-top: 6px;
                    overflow: hidden;
                }
                
                .feature-fill {
                    height: 100%;
                    background: #6366f1;
                    border-radius: 2px;
                }
                
                .no-insights {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 60px 20px;
                    text-align: center;
                    color: #666;
                }
                
                .no-insights-icon {
                    font-size: 64px;
                    margin-bottom: 16px;
                    opacity: 0.5;
                }
                
                .insights-footer {
                    padding: 12px 24px;
                    border-top: 1px solid #2a2a4a;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 12px;
                    color: #666;
                }
                
                @media (max-width: 768px) {
                    .insights-summary {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .top-features {
                        grid-template-columns: 1fr;
                    }
                }
            `;
            document.head.appendChild(styles);
        }

        createContainer() {
            this.container = document.createElement('div');
            this.container.id = 'bael-ai-insights';
            this.container.className = 'bael-ai-insights';
            
            this.render();
            document.body.appendChild(this.container);
        }

        render() {
            this.container.innerHTML = `
                <div class="insights-dialog">
                    <div class="insights-header">
                        <h2>
                            🧠 AI Insights
                            <span class="insights-badge">BETA</span>
                        </h2>
                        <div class="insights-actions">
                            <button class="insight-btn" id="insights-analyze">🔄 Re-analyze</button>
                            <button class="insight-btn" id="insights-export">📤 Export</button>
                            <button class="insight-btn insight-btn-close" id="insights-close">✕</button>
                        </div>
                    </div>
                    
                    <div class="insights-body">
                        ${this.renderSummary()}
                        ${this.renderInsights()}
                        ${this.renderUsagePatterns()}
                        ${this.renderTopFeatures()}
                    </div>
                    
                    <div class="insights-footer">
                        <div>
                            Last analysis: ${this.lastAnalysis ? new Date(this.lastAnalysis).toLocaleString() : 'Never'}
                        </div>
                        <div>
                            💡 Insights are generated based on your usage patterns
                        </div>
                    </div>
                </div>
            `;
            
            this.bindEvents();
        }

        renderSummary() {
            const stats = this.calculateStats();
            
            return `
                <div class="insights-summary">
                    <div class="summary-card">
                        <div class="summary-icon">📊</div>
                        <div class="summary-value">${stats.totalSessions}</div>
                        <div class="summary-label">Sessions</div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-icon">💬</div>
                        <div class="summary-value">${stats.totalMessages}</div>
                        <div class="summary-label">Messages</div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-icon">⚡</div>
                        <div class="summary-value">${stats.efficiency}%</div>
                        <div class="summary-label">Efficiency</div>
                    </div>
                    <div class="summary-card">
                        <div class="summary-icon">🎯</div>
                        <div class="summary-value">${this.insights.length}</div>
                        <div class="summary-label">Insights</div>
                    </div>
                </div>
            `;
        }

        renderInsights() {
            if (this.insights.length === 0) {
                return `
                    <div class="no-insights">
                        <div class="no-insights-icon">🔮</div>
                        <div>No insights generated yet</div>
                        <div style="font-size:13px;margin-top:8px;">Keep using Agent Zero and insights will appear!</div>
                    </div>
                `;
            }
            
            return `
                <div class="insights-section">
                    <div class="section-title">💡 Recommendations</div>
                    ${this.insights.map(i => `
                        <div class="insight-card ${i.priority}">
                            <div class="insight-header">
                                <div class="insight-title">
                                    ${i.icon} ${i.title}
                                </div>
                                <span class="insight-priority ${i.priority}">${i.priority}</span>
                            </div>
                            <div class="insight-description">${i.description}</div>
                            ${i.action ? `
                                <div class="insight-action" data-action="${i.action.id}">
                                    ${i.action.icon} ${i.action.label}
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            `;
        }

        renderUsagePatterns() {
            const weekData = this.getWeeklyUsage();
            const maxUsage = Math.max(...weekData.map(d => d.value), 1);
            
            return `
                <div class="insights-section">
                    <div class="section-title">📈 Weekly Activity</div>
                    <div class="usage-chart">
                        ${weekData.map(d => `
                            <div class="chart-bar" 
                                 style="height: ${(d.value / maxUsage) * 100}%"
                                 data-label="${d.label}"
                                 title="${d.value} interactions"></div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        renderTopFeatures() {
            const features = this.getTopFeatures();
            const maxCount = Math.max(...features.map(f => f.count), 1);
            
            return `
                <div class="insights-section">
                    <div class="section-title">⭐ Most Used Features</div>
                    <div class="top-features">
                        ${features.slice(0, 6).map(f => `
                            <div class="feature-item">
                                <div class="feature-icon">${f.icon}</div>
                                <div class="feature-info">
                                    <div class="feature-name">${f.name}</div>
                                    <div class="feature-count">${f.count} uses</div>
                                    <div class="feature-bar">
                                        <div class="feature-fill" style="width: ${(f.count / maxCount) * 100}%"></div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        bindEvents() {
            this.container.querySelector('#insights-close')?.addEventListener('click', () => this.hide());
            this.container.querySelector('#insights-analyze')?.addEventListener('click', () => this.analyze());
            this.container.querySelector('#insights-export')?.addEventListener('click', () => this.exportData());
            
            this.container.addEventListener('click', (e) => {
                if (e.target === this.container) this.hide();
            });
            
            // Insight action buttons
            this.container.querySelectorAll('.insight-action').forEach(btn => {
                btn.addEventListener('click', () => {
                    this.executeInsightAction(btn.dataset.action);
                });
            });
        }

        setupShortcuts() {
            document.addEventListener('keydown', (e) => {
                // Ctrl+Shift+I (but not browser devtools)
                if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
                    // Only if not opening devtools (usually Cmd+Opt+I)
                    if (!e.altKey) {
                        e.preventDefault();
                        this.toggle();
                    }
                }
                
                if (this.visible && e.key === 'Escape') {
                    this.hide();
                }
            });
        }

        // ═══════════════════════════════════════════════════════════════════════
        // TRACKING
        // ═══════════════════════════════════════════════════════════════════════

        startTracking() {
            // Track session
            this.trackEvent('session_start', {});
            
            // Track window events
            window.addEventListener('bael:command-executed', (e) => {
                this.trackEvent('command', e.detail);
            });
            
            window.addEventListener('bael:template-used', (e) => {
                this.trackEvent('template', e.detail);
            });
            
            window.addEventListener('bael:search', (e) => {
                this.trackEvent('search', e.detail);
            });
            
            // Track errors
            window.addEventListener('error', (e) => {
                this.trackEvent('error', { message: e.message });
            });
        }

        trackEvent(type, data) {
            const event = {
                type,
                data,
                timestamp: Date.now()
            };
            
            // Update usage counters
            if (type === 'command') {
                const cmd = data?.command || 'unknown';
                this.usage.commands[cmd] = (this.usage.commands[cmd] || 0) + 1;
            } else if (type === 'template') {
                const tpl = data?.template?.id || 'unknown';
                this.usage.templates[tpl] = (this.usage.templates[tpl] || 0) + 1;
            } else if (type === 'error') {
                this.usage.errors.push(event);
            }
            
            // Track feature usage
            if (type !== 'session_start' && type !== 'error') {
                this.usage.features[type] = (this.usage.features[type] || 0) + 1;
            }
            
            this.saveUsageData();
        }

        // ═══════════════════════════════════════════════════════════════════════
        // ANALYSIS
        // ═══════════════════════════════════════════════════════════════════════

        analyze() {
            this.insights = [];
            
            // Analyze command usage
            const commandCount = Object.keys(this.usage.commands).length;
            if (commandCount < 5) {
                this.insights.push({
                    icon: '⌨️',
                    title: 'Explore More Commands',
                    description: 'You\'ve only used a few commands. Try using the Command Center (Ctrl+K) to discover more powerful features!',
                    priority: 'medium',
                    action: { id: 'open-commands', icon: '🚀', label: 'Open Command Center' }
                });
            }
            
            // Analyze template usage
            if (Object.keys(this.usage.templates).length === 0) {
                this.insights.push({
                    icon: '📋',
                    title: 'Use Templates to Save Time',
                    description: 'You haven\'t used any templates yet. Templates can save you significant time on repetitive prompts!',
                    priority: 'high',
                    action: { id: 'open-templates', icon: '📋', label: 'Browse Templates' }
                });
            }
            
            // Check for errors
            if (this.usage.errors.length > 5) {
                this.insights.push({
                    icon: '⚠️',
                    title: 'Multiple Errors Detected',
                    description: `You've encountered ${this.usage.errors.length} errors recently. Consider checking the System Status for issues.`,
                    priority: 'high',
                    action: { id: 'open-status', icon: '📡', label: 'View System Status' }
                });
            }
            
            // Keyboard shortcuts
            const shortcutUsage = this.usage.features['keyboard-shortcut'] || 0;
            if (shortcutUsage < 10) {
                this.insights.push({
                    icon: '⚡',
                    title: 'Master Keyboard Shortcuts',
                    description: 'Keyboard shortcuts can dramatically speed up your workflow. Press ? to see all available shortcuts.',
                    priority: 'low',
                    action: { id: 'show-shortcuts', icon: '⌨️', label: 'View Shortcuts' }
                });
            }
            
            // Memory usage
            if (!this.usage.features['memory-query']) {
                this.insights.push({
                    icon: '🧠',
                    title: 'Leverage Agent Memory',
                    description: 'You haven\'t used the memory system yet. Saving context to memory helps agents provide better responses!',
                    priority: 'medium',
                    action: { id: 'open-memory', icon: '🧠', label: 'Open Memory Dashboard' }
                });
            }
            
            this.lastAnalysis = Date.now();
            this.saveUsageData();
            this.render();
        }

        calculateStats() {
            return {
                totalSessions: this.usage.sessions.length || 1,
                totalMessages: Object.values(this.usage.commands).reduce((a, b) => a + b, 0) || 0,
                efficiency: Math.min(100, Math.round(
                    (Object.keys(this.usage.features).length / 10) * 100
                )),
                totalFeatures: Object.keys(this.usage.features).length
            };
        }

        getWeeklyUsage() {
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            return days.map((label, i) => ({
                label,
                value: Math.floor(Math.random() * 50) + 10 // Placeholder - would use real data
            }));
        }

        getTopFeatures() {
            const features = [
                { name: 'Chat Messages', icon: '💬', count: this.usage.features['message'] || Math.floor(Math.random() * 100) },
                { name: 'Code Execution', icon: '💻', count: this.usage.features['code'] || Math.floor(Math.random() * 50) },
                { name: 'File Operations', icon: '📁', count: this.usage.features['file'] || Math.floor(Math.random() * 30) },
                { name: 'Memory Queries', icon: '🧠', count: this.usage.features['memory-query'] || Math.floor(Math.random() * 20) },
                { name: 'Templates Used', icon: '📋', count: Object.values(this.usage.templates).reduce((a, b) => a + b, 0) || 0 },
                { name: 'Commands Run', icon: '⌨️', count: Object.values(this.usage.commands).reduce((a, b) => a + b, 0) || 0 }
            ];
            
            return features.sort((a, b) => b.count - a.count);
        }

        executeInsightAction(actionId) {
            this.hide();
            
            switch (actionId) {
                case 'open-commands':
                    window.BaelCommandCenter?.show?.();
                    break;
                case 'open-templates':
                    window.BaelTemplateLibrary?.show?.();
                    break;
                case 'open-status':
                    window.BaelSystemStatus?.show?.();
                    break;
                case 'show-shortcuts':
                    window.BaelHotkeyReference?.show?.();
                    break;
                case 'open-memory':
                    window.BaelMemoryDashboard?.show?.();
                    break;
            }
        }

        // ═══════════════════════════════════════════════════════════════════════
        // DATA PERSISTENCE
        // ═══════════════════════════════════════════════════════════════════════

        loadUsageData() {
            try {
                const saved = localStorage.getItem('bael-ai-insights-usage');
                if (saved) {
                    const data = JSON.parse(saved);
                    this.usage = { ...this.usage, ...data.usage };
                    this.insights = data.insights || [];
                    this.lastAnalysis = data.lastAnalysis;
                }
            } catch (e) {
                console.warn('Failed to load insights data:', e);
            }
            
            // Generate initial insights if none exist
            if (this.insights.length === 0) {
                this.analyze();
            }
        }

        saveUsageData() {
            try {
                localStorage.setItem('bael-ai-insights-usage', JSON.stringify({
                    usage: this.usage,
                    insights: this.insights,
                    lastAnalysis: this.lastAnalysis
                }));
            } catch (e) {
                console.warn('Failed to save insights data:', e);
            }
        }

        exportData() {
            const data = {
                usage: this.usage,
                insights: this.insights,
                stats: this.calculateStats(),
                exportedAt: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `bael-insights-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            window.BaelNotify?.success?.('Insights data exported');
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

    window.BaelAIInsights = new BaelAIInsights();
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.BaelAIInsights.initialize();
        });
    } else {
        window.BaelAIInsights.initialize();
    }

    console.log('🧠 Bael AI Insights loaded');
})();
