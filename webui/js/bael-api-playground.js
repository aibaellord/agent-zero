/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █   █████╗ ██████╗ ██╗    ██████╗ ██╗      █████╗ ██╗   ██╗                █
 * █  ██╔══██╗██╔══██╗██║    ██╔══██╗██║     ██╔══██╗╚██╗ ██╔╝                █
 * █  ███████║██████╔╝██║    ██████╔╝██║     ███████║ ╚████╔╝                 █
 * █  ██╔══██║██╔═══╝ ██║    ██╔═══╝ ██║     ██╔══██║  ╚██╔╝                  █
 * █  ██║  ██║██║     ██║    ██║     ███████╗██║  ██║   ██║                   █
 * █  ╚═╝  ╚═╝╚═╝     ╚═╝    ╚═╝     ╚══════╝╚═╝  ╚═╝   ╚═╝                   █
 * █                                                                          █
 * █   BAEL API PLAYGROUND - Interactive API Testing Interface               █
 * █   Test API endpoints directly from the UI (Ctrl+Shift+A)                █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function() {
    'use strict';

    class BaelAPIPlayground {
        constructor() {
            this.version = '1.0.0';
            this.initialized = false;
            this.visible = false;
            this.container = null;
            this.history = [];
            this.savedRequests = [];
        }

        async initialize() {
            console.log('🧪 Bael API Playground initializing...');
            
            this.loadHistory();
            this.injectStyles();
            this.createContainer();
            this.setupShortcuts();
            
            this.initialized = true;
            console.log('✅ BAEL API PLAYGROUND READY');
            
            return this;
        }

        injectStyles() {
            if (document.getElementById('bael-api-playground-styles')) return;
            
            const styles = document.createElement('style');
            styles.id = 'bael-api-playground-styles';
            styles.textContent = `
                .bael-api-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(8px);
                    z-index: 9900;
                    opacity: 0;
                    transition: opacity 0.25s ease;
                    pointer-events: none;
                }
                
                .bael-api-overlay.visible {
                    opacity: 1;
                    pointer-events: auto;
                }
                
                .bael-api-modal {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0.95);
                    width: 95vw;
                    max-width: 1200px;
                    height: 90vh;
                    max-height: 850px;
                    background: #12121a;
                    border-radius: 16px;
                    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    z-index: 9901;
                    opacity: 0;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .bael-api-overlay.visible .bael-api-modal {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }
                
                .api-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 20px;
                    background: rgba(255, 255, 255, 0.03);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }
                
                .api-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                
                .api-title h2 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                    color: #fff;
                }
                
                .api-close {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    border: none;
                    background: rgba(255, 255, 255, 0.08);
                    color: rgba(255, 255, 255, 0.6);
                    cursor: pointer;
                    font-size: 18px;
                    transition: all 0.2s;
                }
                
                .api-close:hover {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }
                
                .api-content {
                    flex: 1;
                    display: grid;
                    grid-template-columns: 280px 1fr;
                    overflow: hidden;
                }
                
                .api-sidebar {
                    background: rgba(255, 255, 255, 0.02);
                    border-right: 1px solid rgba(255, 255, 255, 0.06);
                    overflow-y: auto;
                    padding: 16px;
                }
                
                .api-sidebar-section {
                    margin-bottom: 20px;
                }
                
                .api-sidebar-title {
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: rgba(255, 255, 255, 0.4);
                    margin-bottom: 10px;
                }
                
                .endpoint-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 12px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                    margin-bottom: 4px;
                }
                
                .endpoint-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                }
                
                .endpoint-item.active {
                    background: rgba(99, 102, 241, 0.2);
                }
                
                .method-badge {
                    padding: 3px 8px;
                    border-radius: 4px;
                    font-size: 10px;
                    font-weight: 700;
                    min-width: 42px;
                    text-align: center;
                }
                
                .method-badge.GET { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
                .method-badge.POST { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
                .method-badge.PUT { background: rgba(245, 158, 11, 0.2); color: #f59e0b; }
                .method-badge.DELETE { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
                
                .endpoint-path {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.8);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                
                .api-main {
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }
                
                .request-section {
                    padding: 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
                }
                
                .request-url-bar {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 16px;
                }
                
                .method-select {
                    padding: 12px 16px;
                    border-radius: 8px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    background: rgba(255, 255, 255, 0.05);
                    color: #fff;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                }
                
                .url-input {
                    flex: 1;
                    padding: 12px 16px;
                    border-radius: 8px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    background: rgba(255, 255, 255, 0.05);
                    color: #fff;
                    font-size: 13px;
                    font-family: 'JetBrains Mono', monospace;
                    outline: none;
                    transition: border-color 0.2s;
                }
                
                .url-input:focus {
                    border-color: #6366f1;
                }
                
                .send-btn {
                    padding: 12px 24px;
                    border-radius: 8px;
                    border: none;
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                    color: #fff;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .send-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
                }
                
                .send-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                }
                
                .request-tabs {
                    display: flex;
                    gap: 4px;
                    margin-bottom: 12px;
                }
                
                .request-tab {
                    padding: 8px 16px;
                    border-radius: 6px;
                    border: none;
                    background: transparent;
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .request-tab:hover {
                    color: rgba(255, 255, 255, 0.8);
                }
                
                .request-tab.active {
                    background: rgba(99, 102, 241, 0.15);
                    color: #6366f1;
                }
                
                .request-body-editor {
                    width: 100%;
                    min-height: 150px;
                    padding: 12px;
                    border-radius: 8px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    background: rgba(0, 0, 0, 0.3);
                    color: #e4e4e7;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 12px;
                    line-height: 1.5;
                    resize: vertical;
                    outline: none;
                }
                
                .request-body-editor:focus {
                    border-color: #6366f1;
                }
                
                .response-section {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    padding: 20px;
                }
                
                .response-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 12px;
                }
                
                .response-status {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                
                .status-code {
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 13px;
                    font-weight: 600;
                }
                
                .status-code.success { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
                .status-code.error { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
                
                .response-meta {
                    display: flex;
                    gap: 16px;
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.5);
                }
                
                .response-body {
                    flex: 1;
                    overflow: auto;
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 8px;
                    padding: 16px;
                }
                
                .response-body pre {
                    margin: 0;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 12px;
                    line-height: 1.5;
                    color: #e4e4e7;
                    white-space: pre-wrap;
                }
                
                .loading-spinner {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    color: rgba(255, 255, 255, 0.5);
                }
                
                .empty-response {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    color: rgba(255, 255, 255, 0.4);
                    text-align: center;
                }
                
                .empty-response .icon {
                    font-size: 48px;
                    margin-bottom: 12px;
                }
            `;
            document.head.appendChild(styles);
        }

        createContainer() {
            this.container = document.createElement('div');
            this.container.id = 'bael-api-playground';
            this.container.className = 'bael-api-overlay';
            
            this.container.innerHTML = `
                <div class="bael-api-modal">
                    <div class="api-header">
                        <div class="api-title">
                            <span style="font-size: 22px;">🧪</span>
                            <h2>API Playground</h2>
                        </div>
                        <button class="api-close" onclick="BaelAPIPlayground.hide()">✕</button>
                    </div>
                    <div class="api-content">
                        <div class="api-sidebar">
                            <div class="api-sidebar-section">
                                <div class="api-sidebar-title">📡 Common Endpoints</div>
                                <div class="endpoints-list"></div>
                            </div>
                            <div class="api-sidebar-section">
                                <div class="api-sidebar-title">📜 History</div>
                                <div class="history-list"></div>
                            </div>
                        </div>
                        <div class="api-main">
                            <div class="request-section">
                                <div class="request-url-bar">
                                    <select class="method-select">
                                        <option value="GET">GET</option>
                                        <option value="POST">POST</option>
                                        <option value="PUT">PUT</option>
                                        <option value="DELETE">DELETE</option>
                                    </select>
                                    <input class="url-input" type="text" placeholder="/api/..." value="/api/status">
                                    <button class="send-btn" onclick="BaelAPIPlayground.sendRequest()">
                                        🚀 Send
                                    </button>
                                </div>
                                <div class="request-tabs">
                                    <button class="request-tab active" data-tab="body">Body</button>
                                    <button class="request-tab" data-tab="headers">Headers</button>
                                    <button class="request-tab" data-tab="params">Query Params</button>
                                </div>
                                <textarea class="request-body-editor" placeholder='{"key": "value"}'></textarea>
                            </div>
                            <div class="response-section">
                                <div class="response-header">
                                    <div class="response-status">
                                        <span class="status-code" style="display: none;"></span>
                                        <span class="status-text"></span>
                                    </div>
                                    <div class="response-meta">
                                        <span class="response-time"></span>
                                        <span class="response-size"></span>
                                    </div>
                                </div>
                                <div class="response-body">
                                    <div class="empty-response">
                                        <span class="icon">📨</span>
                                        <p>Send a request to see the response</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            document.body.appendChild(this.container);
            
            // Close on overlay click
            this.container.addEventListener('click', (e) => {
                if (e.target === this.container) {
                    this.hide();
                }
            });
            
            // Populate endpoints
            this.renderEndpoints();
        }

        setupShortcuts() {
            document.addEventListener('keydown', (e) => {
                // Ctrl+Shift+A to toggle API playground
                if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'A') {
                    e.preventDefault();
                    if (this.visible) {
                        this.hide();
                    } else {
                        this.show();
                    }
                }
                
                // Ctrl+Enter to send request when visible
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && this.visible) {
                    e.preventDefault();
                    this.sendRequest();
                }
            });
        }

        loadHistory() {
            try {
                const stored = localStorage.getItem('bael_api_history');
                this.history = stored ? JSON.parse(stored) : [];
            } catch (e) {
                this.history = [];
            }
        }

        saveHistory() {
            localStorage.setItem('bael_api_history', JSON.stringify(this.history.slice(-50)));
        }

        getCommonEndpoints() {
            return [
                { method: 'GET', path: '/api/status', desc: 'System status' },
                { method: 'GET', path: '/api/chats', desc: 'List chats' },
                { method: 'POST', path: '/api/message', desc: 'Send message' },
                { method: 'GET', path: '/api/settings', desc: 'Get settings' },
                { method: 'POST', path: '/api/settings', desc: 'Update settings' },
                { method: 'GET', path: '/api/memory', desc: 'Get memory' },
                { method: 'POST', path: '/api/memory', desc: 'Add memory' },
                { method: 'GET', path: '/api/files', desc: 'List files' },
                { method: 'POST', path: '/api/restart', desc: 'Restart framework' },
                { method: 'GET', path: '/api/agents', desc: 'List agents' }
            ];
        }

        renderEndpoints() {
            const endpointsList = this.container.querySelector('.endpoints-list');
            const endpoints = this.getCommonEndpoints();
            
            endpointsList.innerHTML = endpoints.map(ep => `
                <div class="endpoint-item" onclick="BaelAPIPlayground.loadEndpoint('${ep.method}', '${ep.path}')">
                    <span class="method-badge ${ep.method}">${ep.method}</span>
                    <span class="endpoint-path">${ep.path}</span>
                </div>
            `).join('');
            
            this.renderHistory();
        }

        renderHistory() {
            const historyList = this.container.querySelector('.history-list');
            
            if (this.history.length === 0) {
                historyList.innerHTML = '<div style="color: rgba(255,255,255,0.3); font-size: 12px; padding: 10px;">No requests yet</div>';
                return;
            }
            
            historyList.innerHTML = this.history.slice(-10).reverse().map(req => `
                <div class="endpoint-item" onclick="BaelAPIPlayground.loadEndpoint('${req.method}', '${req.path}')">
                    <span class="method-badge ${req.method}">${req.method}</span>
                    <span class="endpoint-path">${req.path}</span>
                </div>
            `).join('');
        }

        // ═══════════════════════════════════════════════════════════════════════
        // ACTIONS
        // ═══════════════════════════════════════════════════════════════════════

        show() {
            this.visible = true;
            this.container.classList.add('visible');
        }

        hide() {
            this.visible = false;
            this.container.classList.remove('visible');
        }

        loadEndpoint(method, path) {
            this.container.querySelector('.method-select').value = method;
            this.container.querySelector('.url-input').value = path;
        }

        async sendRequest() {
            const method = this.container.querySelector('.method-select').value;
            const url = this.container.querySelector('.url-input').value;
            const bodyText = this.container.querySelector('.request-body-editor').value;
            
            const responseBody = this.container.querySelector('.response-body');
            const statusCode = this.container.querySelector('.status-code');
            const statusText = this.container.querySelector('.status-text');
            const responseTime = this.container.querySelector('.response-time');
            const responseSize = this.container.querySelector('.response-size');
            
            // Show loading
            responseBody.innerHTML = '<div class="loading-spinner">⏳ Loading...</div>';
            
            const startTime = performance.now();
            
            try {
                const options = {
                    method,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
                
                if (method !== 'GET' && bodyText.trim()) {
                    options.body = bodyText;
                }
                
                const response = await fetch(url, options);
                const endTime = performance.now();
                
                let data;
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    data = await response.json();
                } else {
                    data = await response.text();
                }
                
                // Update status
                statusCode.style.display = 'inline-block';
                statusCode.textContent = response.status;
                statusCode.className = `status-code ${response.ok ? 'success' : 'error'}`;
                statusText.textContent = response.statusText;
                
                // Update meta
                responseTime.textContent = `${Math.round(endTime - startTime)}ms`;
                const size = JSON.stringify(data).length;
                responseSize.textContent = this.formatSize(size);
                
                // Show response
                const formatted = typeof data === 'object' ? JSON.stringify(data, null, 2) : data;
                responseBody.innerHTML = `<pre>${this.escapeHtml(formatted)}</pre>`;
                
                // Add to history
                this.history.push({
                    method,
                    path: url,
                    status: response.status,
                    time: new Date().toISOString()
                });
                this.saveHistory();
                this.renderHistory();
                
            } catch (error) {
                statusCode.style.display = 'inline-block';
                statusCode.textContent = 'ERR';
                statusCode.className = 'status-code error';
                statusText.textContent = error.message;
                
                responseBody.innerHTML = `<pre style="color: #ef4444;">${this.escapeHtml(error.stack || error.message)}</pre>`;
            }
        }

        formatSize(bytes) {
            if (bytes < 1024) return `${bytes}B`;
            if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
            return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
        }

        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════

    window.BaelAPIPlayground = new BaelAPIPlayground();
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.BaelAPIPlayground.initialize();
        });
    } else {
        window.BaelAPIPlayground.initialize();
    }

    console.log('🧪 Bael API Playground loaded');
})();
