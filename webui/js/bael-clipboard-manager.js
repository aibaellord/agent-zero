/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █   ██████╗██╗     ██╗██████╗ ██████╗  ██████╗  █████╗ ██████╗ ██████╗     █
 * █  ██╔════╝██║     ██║██╔══██╗██╔══██╗██╔═══██╗██╔══██╗██╔══██╗██╔══██╗    █
 * █  ██║     ██║     ██║██████╔╝██████╔╝██║   ██║███████║██████╔╝██║  ██║    █
 * █  ██║     ██║     ██║██╔═══╝ ██╔══██╗██║   ██║██╔══██║██╔══██╗██║  ██║    █
 * █  ╚██████╗███████╗██║██║     ██████╔╝╚██████╔╝██║  ██║██║  ██║██████╔╝    █
 * █   ╚═════╝╚══════╝╚═╝╚═╝     ╚═════╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝     █
 * █                                                                          █
 * █   BAEL CLIPBOARD MANAGER - Advanced Clipboard History & Management      █
 * █   Intelligent clipboard tracking and management (Ctrl+Shift+C)          █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function() {
    'use strict';

    class BaelClipboardManager {
        constructor() {
            this.version = '1.0.0';
            this.initialized = false;
            this.visible = false;
            this.container = null;
            this.history = [];
            this.maxHistory = 50;
            this.categories = ['all', 'text', 'code', 'url', 'other'];
            this.activeCategory = 'all';
            this.pinnedItems = [];
        }

        async initialize() {
            console.log('📋 Bael Clipboard Manager initializing...');
            
            this.loadFromStorage();
            this.injectStyles();
            this.createContainer();
            this.setupShortcuts();
            this.setupClipboardMonitor();
            
            this.initialized = true;
            console.log('✅ BAEL CLIPBOARD MANAGER READY');
            
            return this;
        }

        loadFromStorage() {
            try {
                const saved = localStorage.getItem('bael-clipboard-history');
                if (saved) {
                    this.history = JSON.parse(saved);
                }
                const pinned = localStorage.getItem('bael-clipboard-pinned');
                if (pinned) {
                    this.pinnedItems = JSON.parse(pinned);
                }
            } catch (e) {
                console.error('Failed to load clipboard history:', e);
            }
        }

        saveToStorage() {
            try {
                localStorage.setItem('bael-clipboard-history', JSON.stringify(this.history.slice(0, this.maxHistory)));
                localStorage.setItem('bael-clipboard-pinned', JSON.stringify(this.pinnedItems));
            } catch (e) {
                console.error('Failed to save clipboard history:', e);
            }
        }

        injectStyles() {
            if (document.getElementById('bael-clipboard-styles')) return;
            
            const styles = document.createElement('style');
            styles.id = 'bael-clipboard-styles';
            styles.textContent = `
                .bael-clipboard-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(8px);
                    z-index: 9900;
                    opacity: 0;
                    transition: opacity 0.25s ease;
                    pointer-events: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .bael-clipboard-overlay.visible {
                    opacity: 1;
                    pointer-events: auto;
                }
                
                .bael-clipboard-modal {
                    width: 90vw;
                    max-width: 800px;
                    max-height: 80vh;
                    background: #12121a;
                    border-radius: 16px;
                    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    transform: scale(0.95);
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .bael-clipboard-overlay.visible .bael-clipboard-modal {
                    transform: scale(1);
                }
                
                .clipboard-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 20px;
                    background: rgba(255, 255, 255, 0.03);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }
                
                .clipboard-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .clipboard-title h2 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                    color: #fff;
                }
                
                .clipboard-search {
                    flex: 1;
                    max-width: 300px;
                    margin: 0 20px;
                }
                
                .clipboard-search input {
                    width: 100%;
                    padding: 10px 14px;
                    padding-left: 36px;
                    border-radius: 10px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    background: rgba(255, 255, 255, 0.05);
                    color: #fff;
                    font-size: 13px;
                    outline: none;
                }
                
                .clipboard-search input:focus {
                    border-color: #6366f1;
                }
                
                .clipboard-close {
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
                
                .clipboard-close:hover {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }
                
                .clipboard-tabs {
                    display: flex;
                    gap: 8px;
                    padding: 12px 20px;
                    background: rgba(255, 255, 255, 0.02);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
                }
                
                .clipboard-tab {
                    padding: 8px 16px;
                    border-radius: 8px;
                    border: none;
                    background: transparent;
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .clipboard-tab:hover {
                    background: rgba(255, 255, 255, 0.06);
                    color: rgba(255, 255, 255, 0.8);
                }
                
                .clipboard-tab.active {
                    background: rgba(99, 102, 241, 0.2);
                    color: #6366f1;
                }
                
                .clipboard-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px 20px;
                }
                
                .clipboard-empty {
                    text-align: center;
                    padding: 60px 20px;
                    color: rgba(255, 255, 255, 0.4);
                }
                
                .clipboard-empty-icon {
                    font-size: 48px;
                    margin-bottom: 16px;
                }
                
                .clipboard-item {
                    background: rgba(255, 255, 255, 0.04);
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    margin-bottom: 10px;
                    overflow: hidden;
                    transition: all 0.2s;
                }
                
                .clipboard-item:hover {
                    border-color: rgba(99, 102, 241, 0.3);
                }
                
                .clipboard-item.pinned {
                    border-color: rgba(251, 191, 36, 0.4);
                    background: rgba(251, 191, 36, 0.05);
                }
                
                .clipboard-item-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 14px;
                    background: rgba(255, 255, 255, 0.02);
                }
                
                .clipboard-item-meta {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .clipboard-item-type {
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-size: 10px;
                    font-weight: 600;
                    text-transform: uppercase;
                }
                
                .clipboard-item-type.text { background: rgba(99, 102, 241, 0.2); color: #6366f1; }
                .clipboard-item-type.code { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
                .clipboard-item-type.url { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
                .clipboard-item-type.other { background: rgba(156, 163, 175, 0.2); color: #9ca3af; }
                
                .clipboard-item-time {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.4);
                }
                
                .clipboard-item-actions {
                    display: flex;
                    gap: 6px;
                }
                
                .clipboard-action {
                    width: 30px;
                    height: 30px;
                    border-radius: 6px;
                    border: none;
                    background: rgba(255, 255, 255, 0.06);
                    color: rgba(255, 255, 255, 0.6);
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.2s;
                }
                
                .clipboard-action:hover {
                    background: rgba(99, 102, 241, 0.2);
                    color: #6366f1;
                }
                
                .clipboard-action.delete:hover {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }
                
                .clipboard-action.pin.active {
                    background: rgba(251, 191, 36, 0.2);
                    color: #fbbf24;
                }
                
                .clipboard-item-content {
                    padding: 12px 14px;
                    max-height: 150px;
                    overflow: hidden;
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.8);
                    font-family: 'Consolas', 'Monaco', monospace;
                    white-space: pre-wrap;
                    word-break: break-all;
                    line-height: 1.5;
                    cursor: pointer;
                }
                
                .clipboard-item-content:hover {
                    background: rgba(255, 255, 255, 0.02);
                }
                
                .clipboard-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 20px;
                    background: rgba(255, 255, 255, 0.03);
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                }
                
                .clipboard-stats {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.5);
                }
                
                .clipboard-clear {
                    padding: 8px 16px;
                    border-radius: 8px;
                    border: none;
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .clipboard-clear:hover {
                    background: rgba(239, 68, 68, 0.3);
                }
            `;
            document.head.appendChild(styles);
        }

        createContainer() {
            this.container = document.createElement('div');
            this.container.id = 'bael-clipboard-manager';
            this.container.className = 'bael-clipboard-overlay';
            
            this.container.innerHTML = `
                <div class="bael-clipboard-modal">
                    <div class="clipboard-header">
                        <div class="clipboard-title">
                            <span style="font-size: 20px;">📋</span>
                            <h2>Clipboard History</h2>
                        </div>
                        <div class="clipboard-search">
                            <input type="text" placeholder="Search clipboard..." id="clipboard-search-input">
                        </div>
                        <button class="clipboard-close" onclick="BaelClipboardManager.hide()">✕</button>
                    </div>
                    <div class="clipboard-tabs">
                        ${this.categories.map(cat => `
                            <button class="clipboard-tab ${cat === 'all' ? 'active' : ''}" 
                                    onclick="BaelClipboardManager.setCategory('${cat}')">
                                ${this.getCategoryLabel(cat)}
                            </button>
                        `).join('')}
                    </div>
                    <div class="clipboard-content">
                        <div class="clipboard-list"></div>
                    </div>
                    <div class="clipboard-footer">
                        <span class="clipboard-stats">0 items</span>
                        <button class="clipboard-clear" onclick="BaelClipboardManager.clearHistory()">
                            🗑️ Clear All
                        </button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(this.container);
            
            // Search functionality
            const searchInput = this.container.querySelector('#clipboard-search-input');
            searchInput.addEventListener('input', () => this.render());
            
            // Close on overlay click
            this.container.addEventListener('click', (e) => {
                if (e.target === this.container) {
                    this.hide();
                }
            });
        }

        setupShortcuts() {
            document.addEventListener('keydown', (e) => {
                // Ctrl+Shift+C for clipboard manager (when not in input)
                if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C' && 
                    !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
                    e.preventDefault();
                    if (this.visible) {
                        this.hide();
                    } else {
                        this.show();
                    }
                }
            });
        }

        setupClipboardMonitor() {
            // Listen for copy events
            document.addEventListener('copy', () => {
                setTimeout(() => {
                    navigator.clipboard.readText().then(text => {
                        if (text && text.trim()) {
                            this.addToHistory(text);
                        }
                    }).catch(() => {});
                }, 100);
            });
            
            // Listen for paste events to track usage
            document.addEventListener('paste', (e) => {
                const text = e.clipboardData?.getData('text');
                if (text) {
                    this.markAsUsed(text);
                }
            });
        }

        addToHistory(text) {
            // Don't add duplicates at the top
            if (this.history.length > 0 && this.history[0].content === text) {
                return;
            }
            
            // Remove if already exists
            this.history = this.history.filter(item => item.content !== text);
            
            // Add new item
            const item = {
                id: Date.now().toString(),
                content: text,
                type: this.detectType(text),
                timestamp: Date.now(),
                used: 0
            };
            
            this.history.unshift(item);
            
            // Limit history
            this.history = this.history.slice(0, this.maxHistory);
            
            this.saveToStorage();
            
            if (this.visible) {
                this.render();
            }
        }

        detectType(text) {
            const trimmed = text.trim();
            
            // URL detection
            if (/^https?:\/\//i.test(trimmed) || /^www\./i.test(trimmed)) {
                return 'url';
            }
            
            // Code detection
            if (/^(function|const|let|var|class|import|export|if|for|while|def|async|await)/m.test(trimmed) ||
                /[{}\[\]();]/.test(trimmed) ||
                /^\s*(#|\/\/|\/\*|\*)/m.test(trimmed)) {
                return 'code';
            }
            
            return 'text';
        }

        markAsUsed(text) {
            const item = this.history.find(i => i.content === text);
            if (item) {
                item.used = (item.used || 0) + 1;
                this.saveToStorage();
            }
        }

        getCategoryLabel(cat) {
            const labels = {
                all: '📋 All',
                text: '📝 Text',
                code: '💻 Code',
                url: '🔗 URLs',
                other: '📦 Other'
            };
            return labels[cat] || cat;
        }

        setCategory(category) {
            this.activeCategory = category;
            
            // Update tabs
            this.container.querySelectorAll('.clipboard-tab').forEach(tab => {
                tab.classList.toggle('active', tab.textContent.includes(this.getCategoryLabel(category)));
            });
            
            this.render();
        }

        render() {
            const list = this.container.querySelector('.clipboard-list');
            const searchInput = this.container.querySelector('#clipboard-search-input');
            const searchQuery = searchInput.value.toLowerCase();
            
            // Filter items
            let items = [...this.history];
            
            // Apply search
            if (searchQuery) {
                items = items.filter(item => 
                    item.content.toLowerCase().includes(searchQuery)
                );
            }
            
            // Apply category filter
            if (this.activeCategory !== 'all') {
                items = items.filter(item => item.type === this.activeCategory);
            }
            
            // Sort: pinned first, then by timestamp
            items.sort((a, b) => {
                const aPinned = this.pinnedItems.includes(a.id);
                const bPinned = this.pinnedItems.includes(b.id);
                if (aPinned && !bPinned) return -1;
                if (!aPinned && bPinned) return 1;
                return b.timestamp - a.timestamp;
            });
            
            if (items.length === 0) {
                list.innerHTML = `
                    <div class="clipboard-empty">
                        <div class="clipboard-empty-icon">📋</div>
                        <p>No clipboard items found</p>
                    </div>
                `;
            } else {
                list.innerHTML = items.map(item => {
                    const isPinned = this.pinnedItems.includes(item.id);
                    const timeAgo = this.timeAgo(item.timestamp);
                    const preview = item.content.length > 300 
                        ? item.content.substring(0, 300) + '...' 
                        : item.content;
                    
                    return `
                        <div class="clipboard-item ${isPinned ? 'pinned' : ''}" data-id="${item.id}">
                            <div class="clipboard-item-header">
                                <div class="clipboard-item-meta">
                                    <span class="clipboard-item-type ${item.type}">${item.type}</span>
                                    <span class="clipboard-item-time">${timeAgo}</span>
                                </div>
                                <div class="clipboard-item-actions">
                                    <button class="clipboard-action pin ${isPinned ? 'active' : ''}" 
                                            onclick="BaelClipboardManager.togglePin('${item.id}')" title="Pin">
                                        📌
                                    </button>
                                    <button class="clipboard-action" 
                                            onclick="BaelClipboardManager.copyToClipboard('${item.id}')" title="Copy">
                                        📋
                                    </button>
                                    <button class="clipboard-action" 
                                            onclick="BaelClipboardManager.insertToChat('${item.id}')" title="Insert to chat">
                                        💬
                                    </button>
                                    <button class="clipboard-action delete" 
                                            onclick="BaelClipboardManager.deleteItem('${item.id}')" title="Delete">
                                        🗑️
                                    </button>
                                </div>
                            </div>
                            <div class="clipboard-item-content" 
                                 onclick="BaelClipboardManager.copyToClipboard('${item.id}')">${this.escapeHtml(preview)}</div>
                        </div>
                    `;
                }).join('');
            }
            
            // Update stats
            this.container.querySelector('.clipboard-stats').textContent = 
                `${items.length} of ${this.history.length} items`;
        }

        timeAgo(timestamp) {
            const seconds = Math.floor((Date.now() - timestamp) / 1000);
            
            if (seconds < 60) return 'Just now';
            if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
            if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
            return `${Math.floor(seconds / 86400)}d ago`;
        }

        escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        show() {
            this.visible = true;
            this.container.classList.add('visible');
            this.render();
            
            // Focus search
            setTimeout(() => {
                this.container.querySelector('#clipboard-search-input').focus();
            }, 100);
        }

        hide() {
            this.visible = false;
            this.container.classList.remove('visible');
        }

        togglePin(itemId) {
            if (this.pinnedItems.includes(itemId)) {
                this.pinnedItems = this.pinnedItems.filter(id => id !== itemId);
            } else {
                this.pinnedItems.push(itemId);
            }
            this.saveToStorage();
            this.render();
        }

        async copyToClipboard(itemId) {
            const item = this.history.find(i => i.id === itemId);
            if (!item) return;
            
            try {
                await navigator.clipboard.writeText(item.content);
                this.toast('Copied to clipboard!', 'success');
            } catch (e) {
                this.toast('Failed to copy', 'error');
            }
        }

        insertToChat(itemId) {
            const item = this.history.find(i => i.id === itemId);
            if (!item) return;
            
            // Try to insert into chat input
            const chatInput = document.querySelector('#msg-input, textarea[name="message"]');
            if (chatInput) {
                chatInput.value += item.content;
                chatInput.dispatchEvent(new Event('input', { bubbles: true }));
                this.hide();
                chatInput.focus();
            }
        }

        deleteItem(itemId) {
            this.history = this.history.filter(i => i.id !== itemId);
            this.pinnedItems = this.pinnedItems.filter(id => id !== itemId);
            this.saveToStorage();
            this.render();
        }

        clearHistory() {
            if (!confirm('Clear all clipboard history?')) return;
            
            this.history = [];
            this.pinnedItems = [];
            this.saveToStorage();
            this.render();
            this.toast('Clipboard history cleared', 'success');
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

    window.BaelClipboardManager = new BaelClipboardManager();
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.BaelClipboardManager.initialize();
        });
    } else {
        window.BaelClipboardManager.initialize();
    }

    console.log('📋 Bael Clipboard Manager loaded');
})();
