/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █  ██╗  ██╗██╗███████╗████████╗ ██████╗ ██████╗ ██╗   ██╗                  █
 * █  ██║  ██║██║██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗╚██╗ ██╔╝                  █
 * █  ███████║██║███████╗   ██║   ██║   ██║██████╔╝ ╚████╔╝                   █
 * █  ██╔══██║██║╚════██║   ██║   ██║   ██║██╔══██╗  ╚██╔╝                    █
 * █  ██║  ██║██║███████║   ██║   ╚██████╔╝██║  ██║   ██║                     █
 * █  ╚═╝  ╚═╝╚═╝╚══════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝   ╚═╝                     █
 * █                                                                          █
 * █   BAEL COMMAND HISTORY - Terminal & Chat Command History                 █
 * █   Search and re-execute previous commands and prompts                    █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function() {
    'use strict';

    class BaelCommandHistory {
        constructor() {
            this.version = '1.0.0';
            this.initialized = false;
            this.visible = false;
            this.container = null;
            
            this.commands = [];
            this.maxHistory = 200;
            this.searchQuery = '';
            this.selectedIndex = -1;
        }

        async initialize() {
            console.log('📜 Bael Command History initializing...');
            
            this.loadHistory();
            this.injectStyles();
            this.createContainer();
            this.setupShortcuts();
            this.interceptInputs();
            
            this.initialized = true;
            console.log('✅ BAEL COMMAND HISTORY READY');
            
            return this;
        }

        loadHistory() {
            try {
                const saved = localStorage.getItem('bael-command-history');
                if (saved) {
                    this.commands = JSON.parse(saved);
                }
            } catch (e) {}
        }

        saveHistory() {
            try {
                localStorage.setItem('bael-command-history', JSON.stringify(this.commands.slice(0, this.maxHistory)));
            } catch (e) {}
        }

        addCommand(text, type = 'prompt') {
            if (!text?.trim()) return;
            
            // Avoid duplicates at the top
            if (this.commands[0]?.text === text) return;
            
            this.commands.unshift({
                id: Date.now(),
                text: text.trim(),
                type,
                timestamp: new Date().toISOString()
            });
            
            if (this.commands.length > this.maxHistory) {
                this.commands.pop();
            }
            
            this.saveHistory();
        }

        interceptInputs() {
            // Listen for sent messages
            window.addEventListener('bael:message-sent', (e) => {
                this.addCommand(e.detail?.text, 'prompt');
            });
            
            // Also try to intercept form submissions
            document.addEventListener('submit', (e) => {
                const input = e.target?.querySelector('input, textarea');
                if (input?.value) {
                    this.addCommand(input.value, 'prompt');
                }
            });
        }

        injectStyles() {
            if (document.getElementById('bael-cmdhistory-styles')) return;
            
            const styles = document.createElement('style');
            styles.id = 'bael-cmdhistory-styles';
            styles.textContent = `
                .bael-cmdhistory-container {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0.95);
                    width: 600px;
                    max-height: 500px;
                    background: #12121a;
                    border-radius: 16px;
                    box-shadow: 0 30px 100px rgba(0, 0, 0, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    z-index: 9890;
                    opacity: 0;
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    pointer-events: none;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }
                
                .bael-cmdhistory-container.visible {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                    pointer-events: auto;
                }
                
                .bael-cmdhistory-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    z-index: 9889;
                    opacity: 0;
                    transition: opacity 0.2s ease;
                    pointer-events: none;
                }
                
                .bael-cmdhistory-backdrop.visible {
                    opacity: 1;
                    pointer-events: auto;
                }
                
                .cmdhistory-search {
                    display: flex;
                    align-items: center;
                    padding: 16px 20px;
                    gap: 12px;
                    background: linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }
                
                .cmdhistory-icon {
                    font-size: 22px;
                }
                
                .cmdhistory-input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    outline: none;
                    color: #fff;
                    font-size: 16px;
                    font-family: inherit;
                }
                
                .cmdhistory-input::placeholder {
                    color: rgba(255, 255, 255, 0.3);
                }
                
                .cmdhistory-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 8px 0;
                }
                
                .cmdhistory-item {
                    display: flex;
                    align-items: flex-start;
                    padding: 12px 20px;
                    cursor: pointer;
                    transition: all 0.15s;
                    gap: 12px;
                }
                
                .cmdhistory-item:hover,
                .cmdhistory-item.selected {
                    background: rgba(168, 85, 247, 0.1);
                }
                
                .cmdhistory-item.selected {
                    border-left: 3px solid #a855f7;
                    padding-left: 17px;
                }
                
                .cmdhistory-item-icon {
                    font-size: 16px;
                    margin-top: 2px;
                }
                
                .cmdhistory-item-content {
                    flex: 1;
                    overflow: hidden;
                }
                
                .cmdhistory-item-text {
                    color: #fff;
                    font-size: 14px;
                    line-height: 1.4;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                
                .cmdhistory-item-meta {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.3);
                    margin-top: 4px;
                }
                
                .cmdhistory-item-action {
                    opacity: 0;
                    transition: opacity 0.2s;
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.4);
                    padding: 4px 8px;
                    background: rgba(255, 255, 255, 0.08);
                    border-radius: 4px;
                }
                
                .cmdhistory-item:hover .cmdhistory-item-action {
                    opacity: 1;
                }
                
                .cmdhistory-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 20px;
                    background: rgba(255, 255, 255, 0.02);
                    border-top: 1px solid rgba(255, 255, 255, 0.06);
                }
                
                .cmdhistory-hint {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.3);
                    display: flex;
                    gap: 16px;
                }
                
                .cmdhistory-hint kbd {
                    background: rgba(255, 255, 255, 0.1);
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-size: 10px;
                }
                
                .cmdhistory-clear {
                    padding: 6px 12px;
                    border-radius: 6px;
                    border: none;
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                    font-size: 11px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .cmdhistory-clear:hover {
                    background: rgba(239, 68, 68, 0.2);
                }
                
                .cmdhistory-empty {
                    text-align: center;
                    padding: 60px 20px;
                    color: rgba(255, 255, 255, 0.3);
                }
                
                .cmdhistory-empty-icon {
                    font-size: 40px;
                    margin-bottom: 12px;
                }
            `;
            document.head.appendChild(styles);
        }

        createContainer() {
            // Create backdrop
            this.backdrop = document.createElement('div');
            this.backdrop.className = 'bael-cmdhistory-backdrop';
            this.backdrop.onclick = () => this.hide();
            document.body.appendChild(this.backdrop);
            
            // Create main container
            this.container = document.createElement('div');
            this.container.id = 'bael-command-history';
            this.container.className = 'bael-cmdhistory-container';
            
            this.renderContainer();
            
            document.body.appendChild(this.container);
        }

        renderContainer() {
            this.container.innerHTML = `
                <div class="cmdhistory-search">
                    <span class="cmdhistory-icon">📜</span>
                    <input type="text" class="cmdhistory-input" 
                           placeholder="Search command history..."
                           value="${this.searchQuery}"
                           oninput="BaelCommandHistory.search(this.value)">
                </div>
                <div class="cmdhistory-list" id="cmdhistory-list">
                    ${this.renderList()}
                </div>
                <div class="cmdhistory-footer">
                    <div class="cmdhistory-hint">
                        <span><kbd>↑↓</kbd> Navigate</span>
                        <span><kbd>Enter</kbd> Use</span>
                        <span><kbd>Esc</kbd> Close</span>
                    </div>
                    <button class="cmdhistory-clear" onclick="BaelCommandHistory.clearHistory()">
                        Clear History
                    </button>
                </div>
            `;
        }

        renderList() {
            let filtered = this.commands;
            
            if (this.searchQuery) {
                const query = this.searchQuery.toLowerCase();
                filtered = filtered.filter(cmd => 
                    cmd.text.toLowerCase().includes(query)
                );
            }
            
            if (filtered.length === 0) {
                return `
                    <div class="cmdhistory-empty">
                        <div class="cmdhistory-empty-icon">📜</div>
                        <div>${this.searchQuery ? 'No matching commands' : 'No command history'}</div>
                    </div>
                `;
            }
            
            return filtered.map((cmd, index) => `
                <div class="cmdhistory-item ${index === this.selectedIndex ? 'selected' : ''}"
                     data-index="${index}"
                     onclick="BaelCommandHistory.useCommand(${index})">
                    <span class="cmdhistory-item-icon">${cmd.type === 'prompt' ? '💬' : '⌨️'}</span>
                    <div class="cmdhistory-item-content">
                        <div class="cmdhistory-item-text">${this.escapeHtml(cmd.text)}</div>
                        <div class="cmdhistory-item-meta">${this.formatTime(cmd.timestamp)}</div>
                    </div>
                    <span class="cmdhistory-item-action">Use</span>
                </div>
            `).join('');
        }

        escapeHtml(str) {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        }

        formatTime(timestamp) {
            const date = new Date(timestamp);
            const now = new Date();
            const diff = now - date;
            
            if (diff < 60000) return 'Just now';
            if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
            if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
            
            return date.toLocaleDateString();
        }

        setupShortcuts() {
            document.addEventListener('keydown', (e) => {
                // Ctrl+R for history (like terminal)
                if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
                    e.preventDefault();
                    if (this.visible) {
                        this.hide();
                    } else {
                        this.show();
                    }
                }
                
                if (!this.visible) return;
                
                // Navigate with arrow keys
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    this.navigate(1);
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    this.navigate(-1);
                }
                
                // Enter to use
                if (e.key === 'Enter' && this.selectedIndex >= 0) {
                    e.preventDefault();
                    this.useCommand(this.selectedIndex);
                }
                
                // Escape to close
                if (e.key === 'Escape') {
                    this.hide();
                }
            });
        }

        show() {
            this.visible = true;
            this.selectedIndex = -1;
            this.backdrop.classList.add('visible');
            this.container.classList.add('visible');
            this.renderContainer();
            
            setTimeout(() => {
                this.container.querySelector('.cmdhistory-input')?.focus();
            }, 100);
        }

        hide() {
            this.visible = false;
            this.searchQuery = '';
            this.selectedIndex = -1;
            this.backdrop.classList.remove('visible');
            this.container.classList.remove('visible');
        }

        search(query) {
            this.searchQuery = query;
            this.selectedIndex = -1;
            
            const list = this.container.querySelector('#cmdhistory-list');
            if (list) {
                list.innerHTML = this.renderList();
            }
        }

        navigate(direction) {
            const filtered = this.getFilteredCommands();
            const maxIndex = filtered.length - 1;
            
            this.selectedIndex += direction;
            
            if (this.selectedIndex < 0) this.selectedIndex = maxIndex;
            if (this.selectedIndex > maxIndex) this.selectedIndex = 0;
            
            const list = this.container.querySelector('#cmdhistory-list');
            if (list) {
                list.innerHTML = this.renderList();
                
                // Scroll selected into view
                const selected = list.querySelector('.cmdhistory-item.selected');
                if (selected) {
                    selected.scrollIntoView({ block: 'nearest' });
                }
            }
        }

        getFilteredCommands() {
            if (!this.searchQuery) return this.commands;
            
            const query = this.searchQuery.toLowerCase();
            return this.commands.filter(cmd => 
                cmd.text.toLowerCase().includes(query)
            );
        }

        useCommand(index) {
            const filtered = this.getFilteredCommands();
            const cmd = filtered[index];
            
            if (!cmd) return;
            
            // Find the chat input and set the value
            const input = document.querySelector('textarea[name="message"], textarea.chat-input, textarea');
            if (input) {
                input.value = cmd.text;
                input.focus();
                
                // Trigger input event
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }
            
            this.hide();
            
            window.dispatchEvent(new CustomEvent('bael:toast', {
                detail: { message: 'Command loaded', type: 'success' }
            }));
        }

        clearHistory() {
            if (confirm('Clear all command history?')) {
                this.commands = [];
                this.saveHistory();
                this.renderContainer();
                
                window.dispatchEvent(new CustomEvent('bael:toast', {
                    detail: { message: 'History cleared', type: 'info' }
                }));
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════

    window.BaelCommandHistory = new BaelCommandHistory();
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.BaelCommandHistory.initialize();
        });
    } else {
        window.BaelCommandHistory.initialize();
    }

    console.log('📜 Bael Command History loaded');
})();
