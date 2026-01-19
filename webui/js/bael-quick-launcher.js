/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █   ██╗      █████╗ ██╗   ██╗███╗   ██╗ ██████╗██╗  ██╗███████╗██████╗    █
 * █   ██║     ██╔══██╗██║   ██║████╗  ██║██╔════╝██║  ██║██╔════╝██╔══██╗   █
 * █   ██║     ███████║██║   ██║██╔██╗ ██║██║     ███████║█████╗  ██████╔╝   █
 * █   ██║     ██╔══██║██║   ██║██║╚██╗██║██║     ██╔══██║██╔══╝  ██╔══██╗   █
 * █   ███████╗██║  ██║╚██████╔╝██║ ╚████║╚██████╗██║  ██║███████╗██║  ██║   █
 * █   ╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝   █
 * █                                                                          █
 * █   BAEL QUICK LAUNCHER - Spotlight-style Universal Launcher              █
 * █   Double-tap Ctrl/Cmd to launch anything instantly                      █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function() {
    'use strict';

    class BaelQuickLauncher {
        constructor() {
            this.version = '1.0.0';
            this.initialized = false;
            this.visible = false;
            this.container = null;
            
            this.query = '';
            this.selectedIndex = 0;
            this.results = [];
            this.lastCtrlPress = 0;
            
            // All launchable items
            this.items = [];
        }

        async initialize() {
            console.log('🚀 Bael Quick Launcher initializing...');
            
            this.injectStyles();
            this.createContainer();
            this.buildItemList();
            this.setupShortcuts();
            
            this.initialized = true;
            console.log('✅ BAEL QUICK LAUNCHER READY');
            
            return this;
        }

        injectStyles() {
            if (document.getElementById('bael-quick-launcher-styles')) return;
            
            const styles = document.createElement('style');
            styles.id = 'bael-quick-launcher-styles';
            styles.textContent = `
                .bael-quick-launcher {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 10010;
                    background: rgba(0, 0, 0, 0.75);
                    backdrop-filter: blur(12px);
                    align-items: flex-start;
                    justify-content: center;
                    padding-top: 15vh;
                }
                
                .bael-quick-launcher.visible { display: flex; }
                
                .launcher-dialog {
                    width: 600px;
                    max-width: 95vw;
                    background: #18181f;
                    border-radius: 20px;
                    box-shadow: 0 30px 100px rgba(0, 0, 0, 0.7), 
                                0 0 0 1px rgba(255, 255, 255, 0.1);
                    overflow: hidden;
                }
                
                .launcher-input-container {
                    padding: 20px 24px;
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }
                
                .launcher-icon {
                    font-size: 28px;
                    opacity: 0.7;
                }
                
                .launcher-input {
                    flex: 1;
                    padding: 8px 0;
                    border: none;
                    background: transparent;
                    color: #fff;
                    font-size: 24px;
                    font-weight: 300;
                    outline: none;
                    letter-spacing: 0.5px;
                }
                
                .launcher-input::placeholder {
                    color: rgba(255, 255, 255, 0.3);
                }
                
                .launcher-results {
                    max-height: 400px;
                    overflow-y: auto;
                    padding: 8px 0;
                }
                
                .launcher-category {
                    padding: 10px 24px 6px;
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 1.5px;
                    color: rgba(255, 255, 255, 0.35);
                    font-weight: 600;
                }
                
                .launcher-item {
                    display: flex;
                    align-items: center;
                    padding: 14px 24px;
                    cursor: pointer;
                    gap: 16px;
                    transition: all 0.1s ease;
                    border-left: 3px solid transparent;
                }
                
                .launcher-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                }
                
                .launcher-item.selected {
                    background: rgba(99, 102, 241, 0.15);
                    border-left-color: #6366f1;
                }
                
                .item-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 22px;
                    background: rgba(255, 255, 255, 0.06);
                    flex-shrink: 0;
                }
                
                .item-icon.dashboards { background: rgba(99, 102, 241, 0.2); }
                .item-icon.tools { background: rgba(34, 197, 94, 0.2); }
                .item-icon.actions { background: rgba(245, 158, 11, 0.2); }
                .item-icon.settings { background: rgba(14, 165, 233, 0.2); }
                .item-icon.power { background: rgba(168, 85, 247, 0.2); }
                
                .item-content {
                    flex: 1;
                    min-width: 0;
                }
                
                .item-title {
                    font-size: 15px;
                    font-weight: 500;
                    margin-bottom: 2px;
                }
                
                .item-title .highlight {
                    background: rgba(234, 179, 8, 0.25);
                    color: #fbbf24;
                    border-radius: 2px;
                    padding: 0 2px;
                }
                
                .item-subtitle {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.4);
                }
                
                .item-shortcut {
                    display: flex;
                    gap: 4px;
                }
                
                .shortcut-key {
                    padding: 4px 8px;
                    background: rgba(255, 255, 255, 0.08);
                    border-radius: 6px;
                    font-size: 11px;
                    font-family: 'SF Mono', 'Monaco', monospace;
                    color: rgba(255, 255, 255, 0.5);
                }
                
                .launcher-footer {
                    padding: 12px 24px;
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                    display: flex;
                    justify-content: space-between;
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.35);
                }
                
                .footer-hint {
                    display: flex;
                    gap: 16px;
                }
                
                .hint-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                
                .hint-key {
                    padding: 2px 6px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                    font-family: 'SF Mono', 'Monaco', monospace;
                }
                
                .no-results {
                    padding: 40px 24px;
                    text-align: center;
                    color: rgba(255, 255, 255, 0.4);
                }
                
                .no-results-icon {
                    font-size: 40px;
                    opacity: 0.4;
                    margin-bottom: 12px;
                }
            `;
            document.head.appendChild(styles);
        }

        createContainer() {
            this.container = document.createElement('div');
            this.container.id = 'bael-quick-launcher';
            this.container.className = 'bael-quick-launcher';
            
            this.container.innerHTML = this.getTemplate();
            document.body.appendChild(this.container);
            
            this.bindEvents();
        }

        getTemplate() {
            return `
                <div class="launcher-dialog">
                    <div class="launcher-input-container">
                        <span class="launcher-icon">🚀</span>
                        <input type="text" 
                               class="launcher-input" 
                               id="launcher-input"
                               placeholder="What would you like to do?"
                               autocomplete="off">
                    </div>
                    <div class="launcher-results" id="launcher-results"></div>
                    <div class="launcher-footer">
                        <div class="footer-hint">
                            <span class="hint-item">
                                <span class="hint-key">↑↓</span> Navigate
                            </span>
                            <span class="hint-item">
                                <span class="hint-key">↵</span> Launch
                            </span>
                            <span class="hint-item">
                                <span class="hint-key">Esc</span> Close
                            </span>
                        </div>
                        <span>Double-tap Ctrl to open</span>
                    </div>
                </div>
            `;
        }

        buildItemList() {
            this.items = [
                // Dashboards
                { category: 'dashboards', icon: '🧠', title: 'Memory Dashboard', subtitle: 'Manage knowledge and memory', action: () => window.BaelMemoryDashboard?.show?.(), shortcut: 'Ctrl+Shift+M' },
                { category: 'dashboards', icon: '📊', title: 'Agent Console', subtitle: 'Monitor agent activity', action: () => window.BaelAgentConsole?.show?.(), shortcut: 'Ctrl+Shift+A' },
                { category: 'dashboards', icon: '⚛️', title: 'Heisenberg Control', subtitle: 'AI reasoning visualization', action: () => window.BaelHeisenbergControl?.show?.(), shortcut: 'Ctrl+Shift+H' },
                { category: 'dashboards', icon: '📈', title: 'Performance Dashboard', subtitle: 'Token usage and costs', action: () => window.BaelPerformanceDashboard?.show?.(), shortcut: 'Ctrl+Shift+P' },
                { category: 'dashboards', icon: '📡', title: 'System Status', subtitle: 'Health monitoring', action: () => window.BaelSystemStatus?.show?.(), shortcut: 'Ctrl+Shift+S' },
                { category: 'dashboards', icon: '🧠', title: 'AI Insights', subtitle: 'Usage recommendations', action: () => window.BaelAIInsights?.show?.(), shortcut: 'Ctrl+Shift+I' },
                
                // Tools
                { category: 'tools', icon: '🔍', title: 'Unified Search', subtitle: 'Search everything', action: () => window.BaelUnifiedSearch?.show?.(), shortcut: 'Ctrl+/' },
                { category: 'tools', icon: '🎯', title: 'Command Center', subtitle: 'All commands in one place', action: () => window.BaelCommandCenter?.show?.(), shortcut: 'Ctrl+K' },
                { category: 'tools', icon: '📋', title: 'Template Library', subtitle: 'Prompt templates', action: () => window.BaelTemplateLibrary?.show?.(), shortcut: 'Ctrl+Shift+T' },
                { category: 'tools', icon: '⭐', title: 'Favorites Hub', subtitle: 'Your bookmarked items', action: () => window.BaelFavoritesHub?.show?.(), shortcut: 'Ctrl+Shift+B' },
                { category: 'tools', icon: '⌨️', title: 'Hotkey Reference', subtitle: 'All keyboard shortcuts', action: () => window.BaelHotkeyReference?.show?.(), shortcut: '?' },
                
                // Actions
                { category: 'actions', icon: '💬', title: 'New Chat', subtitle: 'Start a fresh conversation', action: () => window.dispatchEvent(new CustomEvent('bael:new-chat')), shortcut: 'Ctrl+N' },
                { category: 'actions', icon: '📁', title: 'File Browser', subtitle: 'Browse and manage files', action: () => window.dispatchEvent(new CustomEvent('bael:open-file-browser')) },
                { category: 'actions', icon: '📅', title: 'Scheduler', subtitle: 'Manage scheduled tasks', action: () => window.dispatchEvent(new CustomEvent('bael:open-scheduler')) },
                { category: 'actions', icon: '🔄', title: 'Restart Framework', subtitle: 'Restart Agent Zero', action: () => window.dispatchEvent(new CustomEvent('bael:restart')) },
                
                // Settings
                { category: 'settings', icon: '⚙️', title: 'Settings', subtitle: 'Configure Agent Zero', action: () => window.dispatchEvent(new CustomEvent('bael:open-settings')), shortcut: 'Ctrl+,' },
                { category: 'settings', icon: '🤖', title: 'Model Settings', subtitle: 'Configure AI models', action: () => window.dispatchEvent(new CustomEvent('bael:open-settings', { detail: { section: 'model' } })) },
                { category: 'settings', icon: '🔑', title: 'API Keys', subtitle: 'Manage API credentials', action: () => window.dispatchEvent(new CustomEvent('bael:open-settings', { detail: { section: 'api' } })) },
                
                // Power Systems
                { category: 'power', icon: '👑', title: 'Supremacy Panel', subtitle: 'Master integration hub', action: () => window.dispatchEvent(new CustomEvent('bael:open-supremacy')), shortcut: 'Ctrl+Alt+S' },
                { category: 'power', icon: '⚔️', title: 'Domination Control', subtitle: 'Agent control system', action: () => window.dispatchEvent(new CustomEvent('bael:open-domination')), shortcut: 'Ctrl+Alt+D' },
                { category: 'power', icon: '👁️', title: 'Omniscient View', subtitle: 'All-seeing intelligence', action: () => window.dispatchEvent(new CustomEvent('bael:open-omniscient')), shortcut: 'Ctrl+Alt+O' },
                { category: 'power', icon: '💥', title: 'Exploit Engine', subtitle: 'Maximum advantage extraction', action: () => window.dispatchEvent(new CustomEvent('bael:open-exploit')), shortcut: 'Ctrl+Alt+E' }
            ];
        }

        bindEvents() {
            const input = this.container.querySelector('#launcher-input');
            
            // Close on backdrop click
            this.container.addEventListener('click', (e) => {
                if (e.target === this.container) this.hide();
            });
            
            // Input handling
            input.addEventListener('input', (e) => {
                this.query = e.target.value;
                this.selectedIndex = 0;
                this.renderResults();
            });
            
            // Keyboard navigation
            input.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    this.selectNext();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    this.selectPrev();
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    this.launchSelected();
                } else if (e.key === 'Escape') {
                    this.hide();
                }
            });
        }

        setupShortcuts() {
            // Double-tap Ctrl to open
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Control' || e.key === 'Meta') {
                    const now = Date.now();
                    if (now - this.lastCtrlPress < 400) {
                        e.preventDefault();
                        this.toggle();
                        this.lastCtrlPress = 0;
                    } else {
                        this.lastCtrlPress = now;
                    }
                }
                
                // Also Ctrl+Space
                if ((e.ctrlKey || e.metaKey) && e.key === ' ') {
                    e.preventDefault();
                    this.toggle();
                }
            });
        }

        // ═══════════════════════════════════════════════════════════════════════
        // RENDERING
        // ═══════════════════════════════════════════════════════════════════════

        renderResults() {
            const resultsEl = this.container.querySelector('#launcher-results');
            
            // Filter items
            const q = this.query.toLowerCase().trim();
            let filtered = this.items;
            
            if (q) {
                filtered = this.items.filter(item => 
                    item.title.toLowerCase().includes(q) ||
                    item.subtitle.toLowerCase().includes(q) ||
                    item.category.includes(q)
                );
            }
            
            this.results = filtered;
            
            if (filtered.length === 0) {
                resultsEl.innerHTML = `
                    <div class="no-results">
                        <div class="no-results-icon">🔍</div>
                        <div>No results for "${this.query}"</div>
                    </div>
                `;
                return;
            }
            
            // Group by category
            const groups = {};
            filtered.forEach(item => {
                if (!groups[item.category]) groups[item.category] = [];
                groups[item.category].push(item);
            });
            
            const categoryLabels = {
                dashboards: '📊 Dashboards',
                tools: '🔧 Tools',
                actions: '⚡ Actions',
                settings: '⚙️ Settings',
                power: '⚡ Power Systems'
            };
            
            let html = '';
            let globalIndex = 0;
            
            for (const [cat, items] of Object.entries(groups)) {
                html += `<div class="launcher-category">${categoryLabels[cat] || cat}</div>`;
                
                items.forEach(item => {
                    const index = globalIndex++;
                    html += `
                        <div class="launcher-item ${index === this.selectedIndex ? 'selected' : ''}" 
                             data-index="${index}">
                            <div class="item-icon ${cat}">${item.icon}</div>
                            <div class="item-content">
                                <div class="item-title">${this.highlightMatch(item.title, this.query)}</div>
                                <div class="item-subtitle">${item.subtitle}</div>
                            </div>
                            ${item.shortcut ? `
                                <div class="item-shortcut">
                                    ${item.shortcut.split('+').map(k => `<span class="shortcut-key">${k}</span>`).join('')}
                                </div>
                            ` : ''}
                        </div>
                    `;
                });
            }
            
            resultsEl.innerHTML = html;
            
            // Bind click handlers
            resultsEl.querySelectorAll('.launcher-item').forEach(item => {
                item.addEventListener('click', () => {
                    this.selectedIndex = parseInt(item.dataset.index);
                    this.launchSelected();
                });
            });
        }

        highlightMatch(text, query) {
            if (!query) return text;
            const regex = new RegExp(`(${query})`, 'gi');
            return text.replace(regex, '<span class="highlight">$1</span>');
        }

        // ═══════════════════════════════════════════════════════════════════════
        // NAVIGATION
        // ═══════════════════════════════════════════════════════════════════════

        selectNext() {
            if (this.results.length === 0) return;
            this.selectedIndex = (this.selectedIndex + 1) % this.results.length;
            this.updateSelection();
        }

        selectPrev() {
            if (this.results.length === 0) return;
            this.selectedIndex = (this.selectedIndex - 1 + this.results.length) % this.results.length;
            this.updateSelection();
        }

        updateSelection() {
            const items = this.container.querySelectorAll('.launcher-item');
            items.forEach((item, i) => {
                item.classList.toggle('selected', i === this.selectedIndex);
            });
            
            // Scroll into view
            const selected = this.container.querySelector('.launcher-item.selected');
            selected?.scrollIntoView({ block: 'nearest' });
        }

        launchSelected() {
            const item = this.results[this.selectedIndex];
            if (!item) return;
            
            this.hide();
            
            if (typeof item.action === 'function') {
                item.action();
            }
        }

        // ═══════════════════════════════════════════════════════════════════════
        // VISIBILITY
        // ═══════════════════════════════════════════════════════════════════════

        show() {
            this.container.classList.add('visible');
            this.visible = true;
            this.query = '';
            this.selectedIndex = 0;
            
            const input = this.container.querySelector('#launcher-input');
            input.value = '';
            input.focus();
            
            this.renderResults();
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

    window.BaelQuickLauncher = new BaelQuickLauncher();
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.BaelQuickLauncher.initialize();
        });
    } else {
        window.BaelQuickLauncher.initialize();
    }

    console.log('🚀 Bael Quick Launcher loaded');
})();
