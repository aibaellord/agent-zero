/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █  ██████╗ ███████╗██████╗ ███████╗ ██████╗ ██████╗ ███╗   ███╗            █
 * █  ██╔══██╗██╔════╝██╔══██╗██╔════╝██╔═══██╗██╔══██╗████╗ ████║            █
 * █  ██████╔╝█████╗  ██████╔╝█████╗  ██║   ██║██████╔╝██╔████╔██║            █
 * █  ██╔═══╝ ██╔══╝  ██╔══██╗██╔══╝  ██║   ██║██╔══██╗██║╚██╔╝██║            █
 * █  ██║     ███████╗██║  ██║██║     ╚██████╔╝██║  ██║██║ ╚═╝ ██║            █
 * █  ╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝      ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝            █
 * █                                                                          █
 * █   BAEL PERFORMANCE DASHBOARD - Token, Cost & Latency Analytics          █
 * █   Complete performance monitoring with optimization recommendations     █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function() {
    'use strict';

    class BaelPerformanceDashboard {
        constructor() {
            this.version = '1.0.0';
            this.initialized = false;
            this.visible = false;
            this.container = null;
            
            // Metrics storage
            this.metrics = {
                tokens: {
                    total: 0,
                    input: 0,
                    output: 0,
                    cached: 0,
                    history: []
                },
                costs: {
                    total: 0,
                    today: 0,
                    thisWeek: 0,
                    thisMonth: 0,
                    history: []
                },
                latency: {
                    avg: 0,
                    min: Infinity,
                    max: 0,
                    p50: 0,
                    p95: 0,
                    p99: 0,
                    history: []
                },
                requests: {
                    total: 0,
                    success: 0,
                    errors: 0,
                    cached: 0,
                    history: []
                },
                cache: {
                    hits: 0,
                    misses: 0,
                    ratio: 0,
                    size: 0
                }
            };
            
            // Refresh
            this.refreshInterval = null;
            this.refreshRate = 5000;
            
            // Model pricing (per 1K tokens)
            this.modelPricing = {
                'gpt-4': { input: 0.03, output: 0.06 },
                'gpt-4-turbo': { input: 0.01, output: 0.03 },
                'gpt-4o': { input: 0.005, output: 0.015 },
                'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
                'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
                'claude-3-opus': { input: 0.015, output: 0.075 },
                'claude-3-sonnet': { input: 0.003, output: 0.015 },
                'claude-3-haiku': { input: 0.00025, output: 0.00125 },
                'claude-3.5-sonnet': { input: 0.003, output: 0.015 },
                'default': { input: 0.001, output: 0.002 }
            };
        }

        async initialize() {
            console.log('📊 Bael Performance Dashboard initializing...');
            
            this.injectStyles();
            this.createContainer();
            this.setupShortcuts();
            this.loadStoredMetrics();
            this.setupEventListeners();
            
            this.initialized = true;
            console.log('✅ BAEL PERFORMANCE DASHBOARD READY');
            
            return this;
        }

        injectStyles() {
            if (document.getElementById('bael-perf-dashboard-styles')) return;
            
            const styles = document.createElement('style');
            styles.id = 'bael-perf-dashboard-styles';
            styles.textContent = `
                .bael-perf-dashboard {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 10001;
                    background: linear-gradient(135deg, #0a0a0f 0%, #12121a 100%);
                    color: #e0e0e0;
                    font-family: system-ui, -apple-system, sans-serif;
                    overflow: hidden;
                }
                
                .bael-perf-dashboard.visible { display: flex; flex-direction: column; }
                
                .perf-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 24px;
                    background: #0a0a0f;
                    border-bottom: 1px solid #2a2a3a;
                }
                
                .perf-header h1 {
                    margin: 0;
                    font-size: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .perf-tabs {
                    display: flex;
                    gap: 4px;
                }
                
                .perf-tab {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 6px;
                    background: transparent;
                    color: #888;
                    cursor: pointer;
                    font-size: 13px;
                    transition: all 0.2s;
                }
                
                .perf-tab:hover { background: #1a1a2e; color: #e0e0e0; }
                .perf-tab.active { background: #6366f1; color: white; }
                
                .perf-actions {
                    display: flex;
                    gap: 8px;
                }
                
                .perf-btn {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 6px;
                    background: #1a1a2e;
                    color: #e0e0e0;
                    cursor: pointer;
                    font-size: 13px;
                    transition: all 0.2s;
                }
                
                .perf-btn:hover { background: #252538; }
                .perf-btn-close:hover { background: #ef4444; }
                
                .perf-main {
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px;
                }
                
                .perf-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                    gap: 20px;
                    margin-bottom: 24px;
                }
                
                .perf-card {
                    background: #12121a;
                    border-radius: 12px;
                    padding: 20px;
                    border: 1px solid #2a2a3a;
                }
                
                .perf-card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }
                
                .perf-card-title {
                    font-size: 14px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    opacity: 0.7;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .perf-card-value {
                    font-size: 32px;
                    font-weight: 700;
                    margin-bottom: 8px;
                }
                
                .perf-card-subtext {
                    font-size: 13px;
                    opacity: 0.6;
                }
                
                .perf-card-trend {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 13px;
                }
                
                .trend-up { color: #22c55e; }
                .trend-down { color: #ef4444; }
                .trend-neutral { color: #eab308; }
                
                /* Charts */
                .chart-container {
                    background: #12121a;
                    border-radius: 12px;
                    padding: 20px;
                    border: 1px solid #2a2a3a;
                    margin-bottom: 24px;
                }
                
                .chart-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }
                
                .chart-title {
                    font-size: 16px;
                    font-weight: 600;
                }
                
                .chart-canvas {
                    width: 100%;
                    height: 200px;
                    background: rgba(26, 26, 46, 0.5);
                    border-radius: 8px;
                }
                
                /* Token Breakdown */
                .token-breakdown {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                    margin-top: 16px;
                }
                
                .token-item {
                    text-align: center;
                    padding: 12px;
                    background: rgba(26, 26, 46, 0.5);
                    border-radius: 8px;
                }
                
                .token-item-value {
                    font-size: 20px;
                    font-weight: 600;
                    margin-bottom: 4px;
                }
                
                .token-item-label {
                    font-size: 11px;
                    text-transform: uppercase;
                    opacity: 0.6;
                }
                
                .token-input { color: #6366f1; }
                .token-output { color: #22c55e; }
                .token-cached { color: #eab308; }
                
                /* Latency Percentiles */
                .latency-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 12px;
                    margin-top: 16px;
                }
                
                .latency-item {
                    text-align: center;
                    padding: 16px;
                    background: rgba(26, 26, 46, 0.5);
                    border-radius: 8px;
                }
                
                .latency-value {
                    font-size: 24px;
                    font-weight: 700;
                    margin-bottom: 4px;
                }
                
                .latency-label {
                    font-size: 12px;
                    opacity: 0.6;
                }
                
                /* Cache Stats */
                .cache-stats {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }
                
                .cache-ratio {
                    position: relative;
                    width: 100px;
                    height: 100px;
                }
                
                .cache-ring {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    background: conic-gradient(
                        #22c55e 0% var(--ratio),
                        #2a2a3a var(--ratio) 100%
                    );
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .cache-ring-inner {
                    width: 70px;
                    height: 70px;
                    background: #12121a;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    font-weight: 700;
                }
                
                .cache-details {
                    flex: 1;
                }
                
                .cache-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    border-bottom: 1px solid #2a2a3a;
                }
                
                .cache-row:last-child { border-bottom: none; }
                
                /* Recommendations */
                .recommendations {
                    background: #12121a;
                    border-radius: 12px;
                    padding: 20px;
                    border: 1px solid #2a2a3a;
                }
                
                .recommendation-item {
                    display: flex;
                    gap: 12px;
                    padding: 12px;
                    background: rgba(26, 26, 46, 0.5);
                    border-radius: 8px;
                    margin-bottom: 8px;
                }
                
                .recommendation-item:last-child { margin-bottom: 0; }
                
                .rec-icon {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    flex-shrink: 0;
                }
                
                .rec-icon.high { background: rgba(239, 68, 68, 0.2); }
                .rec-icon.medium { background: rgba(234, 179, 8, 0.2); }
                .rec-icon.low { background: rgba(34, 197, 94, 0.2); }
                
                .rec-content { flex: 1; }
                
                .rec-title {
                    font-weight: 600;
                    margin-bottom: 4px;
                }
                
                .rec-desc {
                    font-size: 13px;
                    opacity: 0.7;
                    line-height: 1.4;
                }
                
                .rec-impact {
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: 600;
                    align-self: center;
                }
                
                .rec-impact.high { background: rgba(239, 68, 68, 0.2); color: #f87171; }
                .rec-impact.medium { background: rgba(234, 179, 8, 0.2); color: #facc15; }
                .rec-impact.low { background: rgba(34, 197, 94, 0.2); color: #4ade80; }
                
                /* Cost Breakdown Table */
                .cost-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                
                .cost-table th,
                .cost-table td {
                    text-align: left;
                    padding: 12px;
                    border-bottom: 1px solid #2a2a3a;
                }
                
                .cost-table th {
                    font-size: 12px;
                    text-transform: uppercase;
                    opacity: 0.6;
                }
                
                .cost-table tr:last-child td { border-bottom: none; }
                
                /* Empty State */
                .empty-state {
                    text-align: center;
                    padding: 60px 20px;
                    opacity: 0.5;
                }
                
                .empty-icon {
                    font-size: 64px;
                    margin-bottom: 16px;
                }
            `;
            document.head.appendChild(styles);
        }

        createContainer() {
            this.container = document.createElement('div');
            this.container.id = 'bael-perf-dashboard';
            this.container.className = 'bael-perf-dashboard';
            
            this.container.innerHTML = this.getTemplate();
            document.body.appendChild(this.container);
            
            this.bindEvents();
        }

        getTemplate() {
            return `
                <div class="perf-header">
                    <h1>📊 Performance Dashboard</h1>
                    <div class="perf-tabs">
                        <button class="perf-tab active" data-tab="overview">Overview</button>
                        <button class="perf-tab" data-tab="tokens">Tokens</button>
                        <button class="perf-tab" data-tab="costs">Costs</button>
                        <button class="perf-tab" data-tab="latency">Latency</button>
                        <button class="perf-tab" data-tab="cache">Cache</button>
                    </div>
                    <div class="perf-actions">
                        <button class="perf-btn" id="perf-refresh">🔄 Refresh</button>
                        <button class="perf-btn" id="perf-export">📤 Export</button>
                        <button class="perf-btn" id="perf-reset">🗑️ Reset</button>
                        <button class="perf-btn perf-btn-close" id="perf-close">✕</button>
                    </div>
                </div>
                
                <div class="perf-main">
                    <!-- Overview Tab -->
                    <div class="tab-content" id="tab-overview">
                        <div class="perf-grid">
                            <div class="perf-card">
                                <div class="perf-card-header">
                                    <span class="perf-card-title">🪙 Total Tokens</span>
                                    <span class="perf-card-trend trend-neutral">—</span>
                                </div>
                                <div class="perf-card-value" id="total-tokens">0</div>
                                <div class="perf-card-subtext">Across all conversations</div>
                            </div>
                            
                            <div class="perf-card">
                                <div class="perf-card-header">
                                    <span class="perf-card-title">💰 Total Cost</span>
                                    <span class="perf-card-trend trend-neutral">—</span>
                                </div>
                                <div class="perf-card-value" id="total-cost">$0.00</div>
                                <div class="perf-card-subtext">Estimated API costs</div>
                            </div>
                            
                            <div class="perf-card">
                                <div class="perf-card-header">
                                    <span class="perf-card-title">⚡ Avg Latency</span>
                                    <span class="perf-card-trend trend-neutral">—</span>
                                </div>
                                <div class="perf-card-value" id="avg-latency">0ms</div>
                                <div class="perf-card-subtext">Response time</div>
                            </div>
                            
                            <div class="perf-card">
                                <div class="perf-card-header">
                                    <span class="perf-card-title">📦 Cache Hit Rate</span>
                                    <span class="perf-card-trend trend-neutral">—</span>
                                </div>
                                <div class="perf-card-value" id="cache-rate">0%</div>
                                <div class="perf-card-subtext">Requests served from cache</div>
                            </div>
                        </div>
                        
                        <div class="chart-container">
                            <div class="chart-header">
                                <span class="chart-title">📈 Usage Over Time</span>
                            </div>
                            <canvas class="chart-canvas" id="usage-chart"></canvas>
                        </div>
                        
                        <div class="recommendations" id="recommendations">
                            <div class="chart-header">
                                <span class="chart-title">💡 Optimization Recommendations</span>
                            </div>
                            <div id="rec-list">
                                <!-- Dynamic content -->
                            </div>
                        </div>
                    </div>
                    
                    <!-- Tokens Tab -->
                    <div class="tab-content" id="tab-tokens" style="display: none;">
                        <div class="perf-grid">
                            <div class="perf-card" style="grid-column: span 2;">
                                <div class="perf-card-title">🪙 Token Usage Breakdown</div>
                                <div class="token-breakdown">
                                    <div class="token-item">
                                        <div class="token-item-value token-input" id="input-tokens">0</div>
                                        <div class="token-item-label">Input Tokens</div>
                                    </div>
                                    <div class="token-item">
                                        <div class="token-item-value token-output" id="output-tokens">0</div>
                                        <div class="token-item-label">Output Tokens</div>
                                    </div>
                                    <div class="token-item">
                                        <div class="token-item-value token-cached" id="cached-tokens">0</div>
                                        <div class="token-item-label">Cached Tokens</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="chart-container">
                            <div class="chart-header">
                                <span class="chart-title">📊 Token History</span>
                            </div>
                            <canvas class="chart-canvas" id="token-chart"></canvas>
                        </div>
                    </div>
                    
                    <!-- Costs Tab -->
                    <div class="tab-content" id="tab-costs" style="display: none;">
                        <div class="perf-grid">
                            <div class="perf-card">
                                <div class="perf-card-title">💰 Today</div>
                                <div class="perf-card-value" id="cost-today">$0.00</div>
                            </div>
                            <div class="perf-card">
                                <div class="perf-card-title">📅 This Week</div>
                                <div class="perf-card-value" id="cost-week">$0.00</div>
                            </div>
                            <div class="perf-card">
                                <div class="perf-card-title">📆 This Month</div>
                                <div class="perf-card-value" id="cost-month">$0.00</div>
                            </div>
                        </div>
                        
                        <div class="perf-card">
                            <div class="perf-card-title">📋 Cost Breakdown by Model</div>
                            <table class="cost-table" id="cost-table">
                                <thead>
                                    <tr>
                                        <th>Model</th>
                                        <th>Requests</th>
                                        <th>Tokens</th>
                                        <th>Cost</th>
                                    </tr>
                                </thead>
                                <tbody id="cost-table-body">
                                    <tr>
                                        <td colspan="4" style="text-align: center; opacity: 0.5;">No data yet</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <!-- Latency Tab -->
                    <div class="tab-content" id="tab-latency" style="display: none;">
                        <div class="perf-card">
                            <div class="perf-card-title">⚡ Latency Percentiles</div>
                            <div class="latency-grid">
                                <div class="latency-item">
                                    <div class="latency-value" id="lat-min">0ms</div>
                                    <div class="latency-label">Minimum</div>
                                </div>
                                <div class="latency-item">
                                    <div class="latency-value" id="lat-p50">0ms</div>
                                    <div class="latency-label">P50 (Median)</div>
                                </div>
                                <div class="latency-item">
                                    <div class="latency-value" id="lat-avg">0ms</div>
                                    <div class="latency-label">Average</div>
                                </div>
                                <div class="latency-item">
                                    <div class="latency-value" id="lat-p95">0ms</div>
                                    <div class="latency-label">P95</div>
                                </div>
                                <div class="latency-item">
                                    <div class="latency-value" id="lat-p99">0ms</div>
                                    <div class="latency-label">P99</div>
                                </div>
                                <div class="latency-item">
                                    <div class="latency-value" id="lat-max">0ms</div>
                                    <div class="latency-label">Maximum</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="chart-container">
                            <div class="chart-header">
                                <span class="chart-title">📉 Latency Distribution</span>
                            </div>
                            <canvas class="chart-canvas" id="latency-chart"></canvas>
                        </div>
                    </div>
                    
                    <!-- Cache Tab -->
                    <div class="tab-content" id="tab-cache" style="display: none;">
                        <div class="perf-card">
                            <div class="perf-card-title">📦 Cache Performance</div>
                            <div class="cache-stats">
                                <div class="cache-ratio">
                                    <div class="cache-ring" style="--ratio: 0%;">
                                        <div class="cache-ring-inner" id="cache-ratio-value">0%</div>
                                    </div>
                                </div>
                                <div class="cache-details">
                                    <div class="cache-row">
                                        <span>Cache Hits</span>
                                        <span id="cache-hits">0</span>
                                    </div>
                                    <div class="cache-row">
                                        <span>Cache Misses</span>
                                        <span id="cache-misses">0</span>
                                    </div>
                                    <div class="cache-row">
                                        <span>Cache Size</span>
                                        <span id="cache-size">0 KB</span>
                                    </div>
                                    <div class="cache-row">
                                        <span>Tokens Saved</span>
                                        <span id="tokens-saved">0</span>
                                    </div>
                                    <div class="cache-row">
                                        <span>Cost Saved</span>
                                        <span id="cost-saved">$0.00</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="perf-actions" style="margin-top: 20px;">
                            <button class="perf-btn" id="clear-cache">🗑️ Clear Cache</button>
                        </div>
                    </div>
                </div>
            `;
        }

        bindEvents() {
            // Close
            this.container.querySelector('#perf-close').addEventListener('click', () => this.hide());
            
            // Actions
            this.container.querySelector('#perf-refresh').addEventListener('click', () => this.refresh());
            this.container.querySelector('#perf-export').addEventListener('click', () => this.exportData());
            this.container.querySelector('#perf-reset').addEventListener('click', () => this.resetMetrics());
            
            // Tabs
            this.container.querySelectorAll('.perf-tab').forEach(tab => {
                tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
            });
            
            // Cache clear
            this.container.querySelector('#clear-cache')?.addEventListener('click', () => this.clearCache());
        }

        setupShortcuts() {
            document.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'P') {
                    e.preventDefault();
                    this.toggle();
                }
                
                if (this.visible && e.key === 'Escape') {
                    this.hide();
                }
            });
        }

        setupEventListeners() {
            // Listen for API calls to track metrics
            window.addEventListener('bael:api-response', (e) => {
                this.trackRequest(e.detail);
            });
            
            // Integration with BaelExploit
            if (window.BaelExploit) {
                // Get cache stats
                const efficiency = window.BaelExploit.cacheExploit?.getEfficiency?.();
                if (efficiency) {
                    this.metrics.cache.hits = efficiency.hits || 0;
                    this.metrics.cache.misses = efficiency.misses || 0;
                    this.metrics.cache.ratio = efficiency.ratio || 0;
                }
            }
        }

        // ═══════════════════════════════════════════════════════════════════════
        // METRICS TRACKING
        // ═══════════════════════════════════════════════════════════════════════

        trackRequest(data) {
            const now = Date.now();
            
            // Track tokens
            if (data.tokens) {
                this.metrics.tokens.total += data.tokens.total || 0;
                this.metrics.tokens.input += data.tokens.input || 0;
                this.metrics.tokens.output += data.tokens.output || 0;
                this.metrics.tokens.history.push({
                    timestamp: now,
                    input: data.tokens.input || 0,
                    output: data.tokens.output || 0
                });
            }
            
            // Track latency
            if (data.latency) {
                const latency = data.latency;
                this.metrics.latency.history.push({ timestamp: now, value: latency });
                this.metrics.latency.min = Math.min(this.metrics.latency.min, latency);
                this.metrics.latency.max = Math.max(this.metrics.latency.max, latency);
                this.calculatePercentiles();
            }
            
            // Track requests
            this.metrics.requests.total++;
            if (data.success) {
                this.metrics.requests.success++;
            } else if (data.error) {
                this.metrics.requests.errors++;
            }
            if (data.cached) {
                this.metrics.requests.cached++;
                this.metrics.cache.hits++;
            } else {
                this.metrics.cache.misses++;
            }
            
            // Calculate costs
            this.calculateCosts(data);
            
            // Update cache ratio
            const total = this.metrics.cache.hits + this.metrics.cache.misses;
            this.metrics.cache.ratio = total > 0 ? (this.metrics.cache.hits / total * 100) : 0;
            
            // Persist metrics
            this.saveMetrics();
            
            // Update UI if visible
            if (this.visible) {
                this.updateUI();
            }
        }

        calculateCosts(data) {
            const model = data.model || 'default';
            const pricing = this.modelPricing[model] || this.modelPricing.default;
            
            const inputCost = ((data.tokens?.input || 0) / 1000) * pricing.input;
            const outputCost = ((data.tokens?.output || 0) / 1000) * pricing.output;
            const totalCost = inputCost + outputCost;
            
            this.metrics.costs.total += totalCost;
            
            const now = new Date();
            const today = now.toDateString();
            const week = this.getWeekNumber(now);
            const month = now.getMonth();
            
            this.metrics.costs.history.push({
                timestamp: now.getTime(),
                cost: totalCost,
                model
            });
            
            // Calculate period costs from history
            this.metrics.costs.today = this.metrics.costs.history
                .filter(h => new Date(h.timestamp).toDateString() === today)
                .reduce((sum, h) => sum + h.cost, 0);
        }

        calculatePercentiles() {
            const values = this.metrics.latency.history.map(h => h.value).sort((a, b) => a - b);
            const len = values.length;
            
            if (len > 0) {
                this.metrics.latency.avg = values.reduce((a, b) => a + b, 0) / len;
                this.metrics.latency.p50 = values[Math.floor(len * 0.5)];
                this.metrics.latency.p95 = values[Math.floor(len * 0.95)];
                this.metrics.latency.p99 = values[Math.floor(len * 0.99)];
            }
        }

        getWeekNumber(date) {
            const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
            const dayNum = d.getUTCDay() || 7;
            d.setUTCDate(d.getUTCDate() + 4 - dayNum);
            const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
            return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        }

        // ═══════════════════════════════════════════════════════════════════════
        // UI UPDATES
        // ═══════════════════════════════════════════════════════════════════════

        switchTab(tabId) {
            // Update tab buttons
            this.container.querySelectorAll('.perf-tab').forEach(tab => {
                tab.classList.toggle('active', tab.dataset.tab === tabId);
            });
            
            // Update tab content
            this.container.querySelectorAll('.tab-content').forEach(content => {
                content.style.display = content.id === `tab-${tabId}` ? 'block' : 'none';
            });
        }

        updateUI() {
            // Overview
            this.container.querySelector('#total-tokens').textContent = 
                this.formatNumber(this.metrics.tokens.total);
            this.container.querySelector('#total-cost').textContent = 
                '$' + this.metrics.costs.total.toFixed(4);
            this.container.querySelector('#avg-latency').textContent = 
                Math.round(this.metrics.latency.avg) + 'ms';
            this.container.querySelector('#cache-rate').textContent = 
                Math.round(this.metrics.cache.ratio) + '%';
            
            // Tokens tab
            this.container.querySelector('#input-tokens').textContent = 
                this.formatNumber(this.metrics.tokens.input);
            this.container.querySelector('#output-tokens').textContent = 
                this.formatNumber(this.metrics.tokens.output);
            this.container.querySelector('#cached-tokens').textContent = 
                this.formatNumber(this.metrics.tokens.cached);
            
            // Costs tab
            this.container.querySelector('#cost-today').textContent = 
                '$' + this.metrics.costs.today.toFixed(4);
            
            // Latency tab
            this.container.querySelector('#lat-min').textContent = 
                (this.metrics.latency.min === Infinity ? 0 : Math.round(this.metrics.latency.min)) + 'ms';
            this.container.querySelector('#lat-avg').textContent = 
                Math.round(this.metrics.latency.avg) + 'ms';
            this.container.querySelector('#lat-p50').textContent = 
                Math.round(this.metrics.latency.p50) + 'ms';
            this.container.querySelector('#lat-p95').textContent = 
                Math.round(this.metrics.latency.p95) + 'ms';
            this.container.querySelector('#lat-p99').textContent = 
                Math.round(this.metrics.latency.p99) + 'ms';
            this.container.querySelector('#lat-max').textContent = 
                Math.round(this.metrics.latency.max) + 'ms';
            
            // Cache tab
            this.container.querySelector('#cache-ratio-value').textContent = 
                Math.round(this.metrics.cache.ratio) + '%';
            this.container.querySelector('.cache-ring').style.setProperty(
                '--ratio', this.metrics.cache.ratio + '%'
            );
            this.container.querySelector('#cache-hits').textContent = 
                this.formatNumber(this.metrics.cache.hits);
            this.container.querySelector('#cache-misses').textContent = 
                this.formatNumber(this.metrics.cache.misses);
            
            // Recommendations
            this.updateRecommendations();
        }

        updateRecommendations() {
            const recs = [];
            
            // Check cache hit rate
            if (this.metrics.cache.ratio < 50 && this.metrics.requests.total > 10) {
                recs.push({
                    priority: 'high',
                    icon: '📦',
                    title: 'Low Cache Hit Rate',
                    desc: 'Consider enabling more aggressive caching via BaelExploit to reduce API calls.',
                    impact: 'Save up to $' + (this.metrics.costs.total * 0.3).toFixed(2)
                });
            }
            
            // Check latency
            if (this.metrics.latency.avg > 5000) {
                recs.push({
                    priority: 'medium',
                    icon: '⚡',
                    title: 'High Average Latency',
                    desc: 'Response times are above 5 seconds. Consider using a faster model or optimizing prompts.',
                    impact: '50% faster responses'
                });
            }
            
            // Check token usage
            if (this.metrics.tokens.input > this.metrics.tokens.output * 5) {
                recs.push({
                    priority: 'low',
                    icon: '🪙',
                    title: 'High Input/Output Ratio',
                    desc: 'You\'re sending many more tokens than receiving. Consider summarizing context or using BaelExploit.contextExploit.',
                    impact: 'Save 40% on token costs'
                });
            }
            
            // Default recommendation
            if (recs.length === 0) {
                recs.push({
                    priority: 'low',
                    icon: '✅',
                    title: 'Performance Looking Good',
                    desc: 'No immediate optimization recommendations. Keep monitoring for trends.',
                    impact: 'N/A'
                });
            }
            
            const list = this.container.querySelector('#rec-list');
            list.innerHTML = recs.map(rec => `
                <div class="recommendation-item">
                    <div class="rec-icon ${rec.priority}">${rec.icon}</div>
                    <div class="rec-content">
                        <div class="rec-title">${rec.title}</div>
                        <div class="rec-desc">${rec.desc}</div>
                    </div>
                    <div class="rec-impact ${rec.priority}">${rec.impact}</div>
                </div>
            `).join('');
        }

        // ═══════════════════════════════════════════════════════════════════════
        // DATA MANAGEMENT
        // ═══════════════════════════════════════════════════════════════════════

        async refresh() {
            // Pull latest from BaelExploit if available
            if (window.BaelExploit?.cacheExploit) {
                const efficiency = window.BaelExploit.cacheExploit.getEfficiency?.();
                if (efficiency) {
                    this.metrics.cache.hits = efficiency.hits || this.metrics.cache.hits;
                    this.metrics.cache.misses = efficiency.misses || this.metrics.cache.misses;
                }
            }
            
            // Pull from BaelGUIUnifier if available
            if (window.BaelGUIUnifier?.metrics) {
                const m = window.BaelGUIUnifier.metrics;
                // Merge metrics
            }
            
            this.updateUI();
            window.BaelNotify?.success('Metrics refreshed');
        }

        loadStoredMetrics() {
            try {
                const stored = localStorage.getItem('bael-performance-metrics');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    this.metrics = { ...this.metrics, ...parsed };
                }
            } catch (e) {
                console.warn('Failed to load stored metrics:', e);
            }
        }

        saveMetrics() {
            try {
                // Keep only last 1000 history entries
                const trimmed = { ...this.metrics };
                trimmed.tokens.history = trimmed.tokens.history.slice(-1000);
                trimmed.latency.history = trimmed.latency.history.slice(-1000);
                trimmed.costs.history = trimmed.costs.history.slice(-1000);
                
                localStorage.setItem('bael-performance-metrics', JSON.stringify(trimmed));
            } catch (e) {
                console.warn('Failed to save metrics:', e);
            }
        }

        resetMetrics() {
            if (!confirm('Reset all performance metrics? This cannot be undone.')) return;
            
            this.metrics = {
                tokens: { total: 0, input: 0, output: 0, cached: 0, history: [] },
                costs: { total: 0, today: 0, thisWeek: 0, thisMonth: 0, history: [] },
                latency: { avg: 0, min: Infinity, max: 0, p50: 0, p95: 0, p99: 0, history: [] },
                requests: { total: 0, success: 0, errors: 0, cached: 0, history: [] },
                cache: { hits: 0, misses: 0, ratio: 0, size: 0 }
            };
            
            localStorage.removeItem('bael-performance-metrics');
            this.updateUI();
            window.BaelNotify?.success('Metrics reset');
        }

        clearCache() {
            if (window.BaelExploit?.cacheExploit?.clear) {
                window.BaelExploit.cacheExploit.clear();
            }
            
            this.metrics.cache = { hits: 0, misses: 0, ratio: 0, size: 0 };
            this.updateUI();
            window.BaelNotify?.success('Cache cleared');
        }

        exportData() {
            const data = {
                exportedAt: new Date().toISOString(),
                metrics: this.metrics
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `bael-performance-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            window.BaelNotify?.success('Performance data exported');
        }

        // ═══════════════════════════════════════════════════════════════════════
        // VISIBILITY
        // ═══════════════════════════════════════════════════════════════════════

        show() {
            this.container.classList.add('visible');
            this.visible = true;
            this.updateUI();
            
            this.refreshInterval = setInterval(() => this.updateUI(), this.refreshRate);
        }

        hide() {
            this.container.classList.remove('visible');
            this.visible = false;
            
            if (this.refreshInterval) {
                clearInterval(this.refreshInterval);
                this.refreshInterval = null;
            }
        }

        toggle() {
            if (this.visible) this.hide();
            else this.show();
        }

        // ═══════════════════════════════════════════════════════════════════════
        // UTILITIES
        // ═══════════════════════════════════════════════════════════════════════

        formatNumber(num) {
            if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
            if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
            return num.toLocaleString();
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════

    window.BaelPerformanceDashboard = new BaelPerformanceDashboard();
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.BaelPerformanceDashboard.initialize();
        });
    } else {
        window.BaelPerformanceDashboard.initialize();
    }

    console.log('📊 Bael Performance Dashboard loaded');
})();
