/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █   ███████╗██╗   ██╗███████╗████████╗███████╗███╗   ███╗                  █
 * █   ██╔════╝╚██╗ ██╔╝██╔════╝╚══██╔══╝██╔════╝████╗ ████║                  █
 * █   ███████╗ ╚████╔╝ ███████╗   ██║   █████╗  ██╔████╔██║                  █
 * █   ╚════██║  ╚██╔╝  ╚════██║   ██║   ██╔══╝  ██║╚██╔╝██║                  █
 * █   ███████║   ██║   ███████║   ██║   ███████╗██║ ╚═╝ ██║                  █
 * █   ╚══════╝   ╚═╝   ╚══════╝   ╚═╝   ╚══════╝╚═╝     ╚═╝                  █
 * █                                                                          █
 * █   BAEL SYSTEM STATUS - Real-time Health Monitoring Dashboard            █
 * █   API status, memory usage, connection health, performance metrics      █
 * █   Keyboard Shortcut: Ctrl+Shift+S                                       █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function() {
    'use strict';

    class BaelSystemStatus {
        constructor() {
            this.version = '1.0.0';
            this.initialized = false;
            this.visible = false;
            this.container = null;
            this.refreshInterval = null;
            this.isPaused = false;
            
            // Status data
            this.status = {
                framework: { status: 'unknown', uptime: 0 },
                api: { status: 'unknown', latency: 0 },
                docker: { status: 'unknown', containers: 0 },
                memory: { used: 0, total: 0, percent: 0 },
                models: { connected: false, provider: '' },
                websocket: { connected: false, messages: 0 },
                modules: { loaded: 0, errors: 0 }
            };
            
            this.history = {
                latency: [],
                memory: [],
                errors: []
            };
        }

        async initialize() {
            console.log('📡 Bael System Status initializing...');
            
            this.injectStyles();
            this.createContainer();
            this.setupShortcuts();
            this.countModules();
            
            this.initialized = true;
            console.log('✅ BAEL SYSTEM STATUS READY');
            
            return this;
        }

        injectStyles() {
            if (document.getElementById('bael-system-status-styles')) return;
            
            const styles = document.createElement('style');
            styles.id = 'bael-system-status-styles';
            styles.textContent = `
                .bael-system-status {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 10004;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(4px);
                    align-items: center;
                    justify-content: center;
                }
                
                .bael-system-status.visible { display: flex; }
                
                .status-dialog {
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
                
                .status-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 24px;
                    border-bottom: 1px solid #2a2a4a;
                    background: linear-gradient(135deg, #1a1a2e 0%, #12121a 100%);
                }
                
                .status-header h2 {
                    margin: 0;
                    font-size: 18px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .status-indicator {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    animation: pulse 2s infinite;
                }
                
                .status-indicator.healthy { background: #22c55e; }
                .status-indicator.warning { background: #f59e0b; }
                .status-indicator.error { background: #ef4444; }
                .status-indicator.unknown { background: #666; }
                
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                
                .status-actions {
                    display: flex;
                    gap: 8px;
                }
                
                .status-btn {
                    padding: 8px 14px;
                    border: none;
                    border-radius: 6px;
                    background: #1a1a2e;
                    color: #e0e0e0;
                    cursor: pointer;
                    font-size: 13px;
                    transition: all 0.15s;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                
                .status-btn:hover { background: #252538; }
                .status-btn.active { background: #6366f1; }
                .status-btn-close:hover { background: #ef4444; }
                
                .status-body {
                    flex: 1;
                    padding: 24px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }
                
                .status-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                }
                
                .status-card {
                    background: #1a1a2e;
                    border-radius: 12px;
                    padding: 16px;
                    border: 1px solid #2a2a4a;
                }
                
                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                }
                
                .card-title {
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: #888;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                
                .card-status {
                    padding: 3px 8px;
                    border-radius: 10px;
                    font-size: 11px;
                    font-weight: 500;
                }
                
                .card-status.healthy { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
                .card-status.warning { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
                .card-status.error { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
                .card-status.unknown { background: rgba(102, 102, 102, 0.2); color: #888; }
                
                .card-value {
                    font-size: 28px;
                    font-weight: 700;
                    margin-bottom: 4px;
                }
                
                .card-value.healthy { color: #22c55e; }
                .card-value.warning { color: #f59e0b; }
                .card-value.error { color: #ef4444; }
                
                .card-label {
                    font-size: 12px;
                    color: #666;
                }
                
                .progress-bar {
                    height: 8px;
                    background: #2a2a4a;
                    border-radius: 4px;
                    overflow: hidden;
                    margin-top: 12px;
                }
                
                .progress-fill {
                    height: 100%;
                    border-radius: 4px;
                    transition: width 0.3s ease;
                }
                
                .progress-fill.healthy { background: linear-gradient(90deg, #22c55e, #16a34a); }
                .progress-fill.warning { background: linear-gradient(90deg, #f59e0b, #d97706); }
                .progress-fill.error { background: linear-gradient(90deg, #ef4444, #dc2626); }
                
                .module-list {
                    background: #0a0a0f;
                    border-radius: 8px;
                    padding: 12px;
                    max-height: 200px;
                    overflow-y: auto;
                    font-family: 'Monaco', 'Consolas', monospace;
                    font-size: 12px;
                }
                
                .module-item {
                    display: flex;
                    justify-content: space-between;
                    padding: 6px 0;
                    border-bottom: 1px solid #1a1a2e;
                }
                
                .module-item:last-child { border-bottom: none; }
                
                .module-name { color: #a5b4fc; }
                .module-status { color: #22c55e; }
                .module-status.error { color: #ef4444; }
                
                .status-section-title {
                    font-size: 14px;
                    font-weight: 600;
                    margin-bottom: 12px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .mini-chart {
                    height: 60px;
                    display: flex;
                    align-items: flex-end;
                    gap: 2px;
                }
                
                .chart-bar {
                    flex: 1;
                    background: #6366f1;
                    border-radius: 2px 2px 0 0;
                    min-width: 4px;
                    transition: height 0.3s ease;
                }
                
                .status-footer {
                    padding: 12px 24px;
                    border-top: 1px solid #2a2a4a;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 12px;
                    color: #666;
                }
                
                .last-updated {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
            `;
            document.head.appendChild(styles);
        }

        createContainer() {
            this.container = document.createElement('div');
            this.container.id = 'bael-system-status';
            this.container.className = 'bael-system-status';
            
            this.render();
            document.body.appendChild(this.container);
            
            this.bindEvents();
        }

        render() {
            const overallHealth = this.getOverallHealth();
            
            this.container.innerHTML = `
                <div class="status-dialog">
                    <div class="status-header">
                        <h2>
                            <span class="status-indicator ${overallHealth}"></span>
                            📡 System Status
                        </h2>
                        <div class="status-actions">
                            <button class="status-btn ${this.isPaused ? '' : 'active'}" id="status-toggle-refresh">
                                ${this.isPaused ? '▶️ Resume' : '⏸️ Pause'}
                            </button>
                            <button class="status-btn" id="status-refresh">🔄 Refresh</button>
                            <button class="status-btn status-btn-close" id="status-close">✕</button>
                        </div>
                    </div>
                    
                    <div class="status-body">
                        <div class="status-grid">
                            ${this.renderStatusCard('Framework', 'framework', '🖥️')}
                            ${this.renderStatusCard('API', 'api', '🔌')}
                            ${this.renderStatusCard('Docker', 'docker', '🐳')}
                            ${this.renderStatusCard('Models', 'models', '🤖')}
                        </div>
                        
                        <div class="status-section">
                            <div class="status-section-title">💾 Memory Usage</div>
                            <div class="status-card">
                                <div class="card-header">
                                    <span class="card-title">Browser Memory</span>
                                    <span class="card-status ${this.getMemoryStatus()}">${this.status.memory.percent}%</span>
                                </div>
                                <div class="progress-bar">
                                    <div class="progress-fill ${this.getMemoryStatus()}" 
                                         style="width: ${this.status.memory.percent}%"></div>
                                </div>
                                <div style="margin-top: 8px; font-size: 12px; color: #888;">
                                    ${this.formatBytes(this.status.memory.used)} / ${this.formatBytes(this.status.memory.total)}
                                </div>
                            </div>
                        </div>
                        
                        <div class="status-section">
                            <div class="status-section-title">📊 API Latency History</div>
                            <div class="status-card">
                                <div class="mini-chart" id="latency-chart">
                                    ${this.renderMiniChart(this.history.latency)}
                                </div>
                                <div style="margin-top: 8px; font-size: 12px; color: #888; display: flex; justify-content: space-between;">
                                    <span>Avg: ${this.getAverageLatency()}ms</span>
                                    <span>Last: ${this.status.api.latency}ms</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="status-section">
                            <div class="status-section-title">📦 Bael Modules (${this.status.modules.loaded})</div>
                            <div class="module-list" id="module-list">
                                ${this.renderModuleList()}
                            </div>
                        </div>
                    </div>
                    
                    <div class="status-footer">
                        <div class="last-updated">
                            🕐 Last updated: <span id="last-update-time">Just now</span>
                        </div>
                        <div>
                            Press <kbd style="background:#2a2a4a;padding:2px 6px;border-radius:4px;">Ctrl+Shift+S</kbd> to toggle
                        </div>
                    </div>
                </div>
            `;
        }

        renderStatusCard(title, key, icon) {
            const data = this.status[key];
            const status = this.getComponentStatus(key);
            let value = '—';
            let label = '';
            
            switch (key) {
                case 'framework':
                    value = status === 'healthy' ? '✓' : '✗';
                    label = this.formatUptime(data.uptime);
                    break;
                case 'api':
                    value = data.latency ? `${data.latency}ms` : '—';
                    label = status === 'healthy' ? 'Connected' : 'Disconnected';
                    break;
                case 'docker':
                    value = data.containers || 0;
                    label = 'Containers';
                    break;
                case 'models':
                    value = data.connected ? '✓' : '✗';
                    label = data.provider || 'Not configured';
                    break;
            }
            
            return `
                <div class="status-card">
                    <div class="card-header">
                        <span class="card-title">${icon} ${title}</span>
                        <span class="card-status ${status}">${status}</span>
                    </div>
                    <div class="card-value ${status}">${value}</div>
                    <div class="card-label">${label}</div>
                </div>
            `;
        }

        renderMiniChart(data) {
            if (data.length === 0) {
                return '<div style="color:#666;text-align:center;width:100%;">No data yet</div>';
            }
            
            const max = Math.max(...data, 1);
            return data.slice(-30).map(v => {
                const height = Math.max((v / max) * 100, 5);
                return `<div class="chart-bar" style="height: ${height}%"></div>`;
            }).join('');
        }

        renderModuleList() {
            const modules = this.getLoadedModules();
            if (modules.length === 0) {
                return '<div style="color:#666;">No modules detected</div>';
            }
            
            return modules.slice(0, 20).map(m => `
                <div class="module-item">
                    <span class="module-name">${m.name}</span>
                    <span class="module-status ${m.error ? 'error' : ''}">${m.error ? '✗' : '✓'}</span>
                </div>
            `).join('') + (modules.length > 20 ? `<div style="color:#666;">...and ${modules.length - 20} more</div>` : '');
        }

        bindEvents() {
            this.container.querySelector('#status-close').addEventListener('click', () => this.hide());
            this.container.querySelector('#status-refresh').addEventListener('click', () => this.refresh());
            this.container.querySelector('#status-toggle-refresh').addEventListener('click', () => this.toggleAutoRefresh());
            
            this.container.addEventListener('click', (e) => {
                if (e.target === this.container) this.hide();
            });
        }

        setupShortcuts() {
            document.addEventListener('keydown', (e) => {
                if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
                    e.preventDefault();
                    this.toggle();
                }
                
                if (this.visible && e.key === 'Escape') {
                    this.hide();
                }
            });
        }

        // ═══════════════════════════════════════════════════════════════════════
        // DATA COLLECTION
        // ═══════════════════════════════════════════════════════════════════════

        async refresh() {
            try {
                // Check API
                const apiStart = performance.now();
                const response = await fetch('/get_settings');
                const apiLatency = Math.round(performance.now() - apiStart);
                
                this.status.api.status = response.ok ? 'connected' : 'error';
                this.status.api.latency = apiLatency;
                this.history.latency.push(apiLatency);
                if (this.history.latency.length > 60) this.history.latency.shift();
                
                // Get framework status
                if (response.ok) {
                    const settings = await response.json();
                    this.status.framework.status = 'running';
                    this.status.models.provider = settings.chat_model || '';
                    this.status.models.connected = !!settings.chat_model;
                }
                
                // Check Docker
                try {
                    const dockerRes = await fetch('/docker_status');
                    if (dockerRes.ok) {
                        const dockerData = await dockerRes.json();
                        this.status.docker.status = 'running';
                        this.status.docker.containers = dockerData.containers || 1;
                    }
                } catch {
                    this.status.docker.status = 'unknown';
                }
                
                // Memory usage
                if (performance.memory) {
                    this.status.memory.used = performance.memory.usedJSHeapSize;
                    this.status.memory.total = performance.memory.jsHeapSizeLimit;
                    this.status.memory.percent = Math.round((this.status.memory.used / this.status.memory.total) * 100);
                }
                
                // Count modules
                this.countModules();
                
            } catch (error) {
                this.status.api.status = 'error';
                this.status.framework.status = 'error';
            }
            
            this.render();
            this.bindEvents();
            
            // Update timestamp
            const timeEl = this.container.querySelector('#last-update-time');
            if (timeEl) timeEl.textContent = new Date().toLocaleTimeString();
        }

        countModules() {
            let loaded = 0;
            let errors = 0;
            
            // Count all Bael* globals
            for (const key in window) {
                if (key.startsWith('Bael')) {
                    loaded++;
                    if (window[key]?.error) errors++;
                }
            }
            
            this.status.modules.loaded = loaded;
            this.status.modules.errors = errors;
        }

        getLoadedModules() {
            const modules = [];
            for (const key in window) {
                if (key.startsWith('Bael')) {
                    modules.push({
                        name: key,
                        error: window[key]?.error || false
                    });
                }
            }
            return modules.sort((a, b) => a.name.localeCompare(b.name));
        }

        // ═══════════════════════════════════════════════════════════════════════
        // STATUS HELPERS
        // ═══════════════════════════════════════════════════════════════════════

        getOverallHealth() {
            const statuses = [
                this.getComponentStatus('framework'),
                this.getComponentStatus('api'),
                this.getComponentStatus('models')
            ];
            
            if (statuses.includes('error')) return 'error';
            if (statuses.includes('warning')) return 'warning';
            if (statuses.includes('unknown')) return 'unknown';
            return 'healthy';
        }

        getComponentStatus(key) {
            const data = this.status[key];
            
            switch (key) {
                case 'framework':
                    return data.status === 'running' ? 'healthy' : data.status === 'error' ? 'error' : 'unknown';
                case 'api':
                    if (data.status === 'error') return 'error';
                    if (data.latency > 1000) return 'warning';
                    return data.status === 'connected' ? 'healthy' : 'unknown';
                case 'docker':
                    return data.status === 'running' ? 'healthy' : 'unknown';
                case 'models':
                    return data.connected ? 'healthy' : 'warning';
                default:
                    return 'unknown';
            }
        }

        getMemoryStatus() {
            if (this.status.memory.percent > 90) return 'error';
            if (this.status.memory.percent > 70) return 'warning';
            return 'healthy';
        }

        getAverageLatency() {
            if (this.history.latency.length === 0) return 0;
            const sum = this.history.latency.reduce((a, b) => a + b, 0);
            return Math.round(sum / this.history.latency.length);
        }

        formatUptime(seconds) {
            if (!seconds) return 'Unknown';
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            return `Uptime: ${h}h ${m}m`;
        }

        formatBytes(bytes) {
            if (!bytes) return '0 B';
            const units = ['B', 'KB', 'MB', 'GB'];
            let i = 0;
            while (bytes >= 1024 && i < units.length - 1) {
                bytes /= 1024;
                i++;
            }
            return bytes.toFixed(1) + ' ' + units[i];
        }

        // ═══════════════════════════════════════════════════════════════════════
        // VISIBILITY
        // ═══════════════════════════════════════════════════════════════════════

        toggleAutoRefresh() {
            this.isPaused = !this.isPaused;
            
            if (this.isPaused) {
                clearInterval(this.refreshInterval);
                this.refreshInterval = null;
            } else {
                this.startAutoRefresh();
            }
            
            this.render();
            this.bindEvents();
        }

        startAutoRefresh() {
            if (this.refreshInterval) return;
            this.refreshInterval = setInterval(() => this.refresh(), 3000);
        }

        show() {
            this.container.classList.add('visible');
            this.visible = true;
            this.refresh();
            if (!this.isPaused) this.startAutoRefresh();
        }

        hide() {
            this.container.classList.remove('visible');
            this.visible = false;
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }

        toggle() {
            if (this.visible) this.hide();
            else this.show();
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════

    window.BaelSystemStatus = new BaelSystemStatus();
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.BaelSystemStatus.initialize();
        });
    } else {
        window.BaelSystemStatus.initialize();
    }

    console.log('📡 Bael System Status loaded');
})();
