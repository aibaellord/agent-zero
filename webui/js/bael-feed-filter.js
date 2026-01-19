/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █  ███████╗███████╗███████╗██████╗     ███████╗██╗██╗     ████████╗███████╗█
 * █  ██╔════╝██╔════╝██╔════╝██╔══██╗    ██╔════╝██║██║     ╚══██╔══╝██╔════╝█
 * █  █████╗  █████╗  █████╗  ██║  ██║    █████╗  ██║██║        ██║   █████╗  █
 * █  ██╔══╝  ██╔══╝  ██╔══╝  ██║  ██║    ██╔══╝  ██║██║        ██║   ██╔══╝  █
 * █  ██║     ███████╗███████╗██████╔╝    ██║     ██║███████╗   ██║   ███████╗█
 * █  ╚═╝     ╚══════╝╚══════╝╚═════╝     ╚═╝     ╚═╝╚══════╝   ╚═╝   ╚══════╝█
 * █                                                                          █
 * █   BAEL FEED FILTER - Intelligent Message Feed Filtering & Organization  █
 * █   Filter, sort, tag and organize chat messages with AI-powered insights █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function() {
    'use strict';

    class BaelFeedFilter {
        constructor() {
            this.version = '1.0.0';
            this.initialized = false;
            this.visible = false;
            this.container = null;
            
            this.filters = {
                type: 'all',      // all, user, agent, code, error
                timeRange: 'all', // all, today, week, month
                hasCode: false,
                hasError: false,
                hasLink: false,
                search: ''
            };
            
            this.tags = this.loadTags();
            this.savedFilters = this.loadSavedFilters();
        }

        async initialize() {
            console.log('🔖 Bael Feed Filter initializing...');
            
            this.injectStyles();
            this.createFloatingButton();
            this.createContainer();
            this.setupShortcuts();
            
            this.initialized = true;
            console.log('✅ BAEL FEED FILTER READY (Ctrl+Shift+Y)');
            
            return this;
        }

        injectStyles() {
            if (document.getElementById('bael-feedfilter-styles')) return;
            
            const styles = document.createElement('style');
            styles.id = 'bael-feedfilter-styles';
            styles.textContent = `
                /* Floating button */
                .bael-filter-fab {
                    position: fixed;
                    bottom: 140px;
                    right: 20px;
                    width: 48px;
                    height: 48px;
                    border-radius: 14px;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    border: none;
                    color: #fff;
                    font-size: 20px;
                    cursor: pointer;
                    box-shadow: 0 8px 25px rgba(99, 102, 241, 0.4);
                    z-index: 8000;
                    transition: all 0.3s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .bael-filter-fab:hover {
                    transform: scale(1.05);
                    box-shadow: 0 12px 35px rgba(99, 102, 241, 0.5);
                }
                
                .bael-filter-fab.has-filters {
                    background: linear-gradient(135deg, #10b981, #14b8a6);
                    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
                }
                
                .filter-badge {
                    position: absolute;
                    top: -4px;
                    right: -4px;
                    width: 18px;
                    height: 18px;
                    background: #ef4444;
                    border-radius: 50%;
                    font-size: 10px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    display: none;
                }
                
                .bael-filter-fab.has-filters .filter-badge {
                    display: flex;
                }
                
                /* Filter panel */
                .bael-feedfilter-panel {
                    position: fixed;
                    bottom: 200px;
                    right: 20px;
                    width: 340px;
                    max-height: 70vh;
                    background: #12121a;
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5);
                    z-index: 9600;
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                }
                
                .bael-feedfilter-panel.visible {
                    display: flex;
                    animation: filterPanelIn 0.3s ease;
                }
                
                @keyframes filterPanelIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .filter-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }
                
                .filter-title {
                    font-size: 15px;
                    font-weight: 600;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .filter-close {
                    width: 28px;
                    height: 28px;
                    border-radius: 6px;
                    border: none;
                    background: transparent;
                    color: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    font-size: 16px;
                }
                
                .filter-close:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                }
                
                .filter-content {
                    flex: 1;
                    padding: 16px;
                    overflow-y: auto;
                }
                
                .filter-section {
                    margin-bottom: 18px;
                }
                
                .filter-section-title {
                    font-size: 11px;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.4);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 10px;
                }
                
                /* Search input */
                .filter-search {
                    width: 100%;
                    padding: 10px 14px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 10px;
                    color: #fff;
                    font-size: 13px;
                    outline: none;
                }
                
                .filter-search:focus {
                    border-color: rgba(99, 102, 241, 0.5);
                }
                
                /* Filter chips */
                .filter-chips {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                }
                
                .filter-chip {
                    padding: 6px 12px;
                    border-radius: 20px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .filter-chip:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
                
                .filter-chip.active {
                    background: rgba(99, 102, 241, 0.2);
                    border-color: rgba(99, 102, 241, 0.4);
                    color: #a5b4fc;
                }
                
                /* Toggle options */
                .filter-toggles {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }
                
                .filter-toggle {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 12px;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 8px;
                    cursor: pointer;
                }
                
                .filter-toggle:hover {
                    background: rgba(255, 255, 255, 0.06);
                }
                
                .toggle-label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.8);
                }
                
                .toggle-switch {
                    width: 36px;
                    height: 20px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                    position: relative;
                    transition: all 0.2s;
                }
                
                .toggle-switch.active {
                    background: rgba(99, 102, 241, 0.6);
                }
                
                .toggle-switch::after {
                    content: '';
                    position: absolute;
                    top: 2px;
                    left: 2px;
                    width: 16px;
                    height: 16px;
                    background: #fff;
                    border-radius: 50%;
                    transition: all 0.2s;
                }
                
                .toggle-switch.active::after {
                    left: 18px;
                }
                
                /* Saved filters */
                .saved-filter {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 12px;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 8px;
                    margin-bottom: 6px;
                    cursor: pointer;
                }
                
                .saved-filter:hover {
                    background: rgba(99, 102, 241, 0.1);
                }
                
                .saved-filter-name {
                    font-size: 13px;
                    color: #fff;
                }
                
                .saved-filter-delete {
                    width: 24px;
                    height: 24px;
                    border-radius: 4px;
                    border: none;
                    background: transparent;
                    color: rgba(255, 255, 255, 0.3);
                    cursor: pointer;
                    font-size: 12px;
                }
                
                .saved-filter-delete:hover {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }
                
                /* Actions */
                .filter-actions {
                    display: flex;
                    gap: 8px;
                    padding: 12px 16px;
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                }
                
                .filter-btn {
                    flex: 1;
                    padding: 10px;
                    border-radius: 8px;
                    border: none;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .filter-btn.primary {
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    color: #fff;
                }
                
                .filter-btn.primary:hover {
                    opacity: 0.9;
                }
                
                .filter-btn.secondary {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: #fff;
                }
                
                .filter-btn.secondary:hover {
                    background: rgba(255, 255, 255, 0.1);
                }
                
                /* Filtered message highlight */
                .message-filtered-out {
                    opacity: 0.3 !important;
                    transform: scale(0.98) !important;
                    filter: grayscale(50%) !important;
                }
                
                .message-matched {
                    border-left: 3px solid #10b981 !important;
                    background: rgba(16, 185, 129, 0.05) !important;
                }
                
                /* Stats bar */
                .filter-stats {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 8px 16px;
                    background: rgba(99, 102, 241, 0.1);
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.6);
                }
                
                .stats-count {
                    font-weight: 600;
                    color: #a5b4fc;
                }
            `;
            document.head.appendChild(styles);
        }

        createFloatingButton() {
            this.fab = document.createElement('button');
            this.fab.id = 'bael-filter-fab';
            this.fab.className = 'bael-filter-fab';
            this.fab.onclick = () => this.toggle();
            this.fab.innerHTML = `
                🔖
                <span class="filter-badge" id="filter-badge">0</span>
            `;
            document.body.appendChild(this.fab);
        }

        createContainer() {
            this.container = document.createElement('div');
            this.container.id = 'bael-feedfilter-panel';
            this.container.className = 'bael-feedfilter-panel';
            
            this.render();
            document.body.appendChild(this.container);
        }

        render() {
            const activeFilters = this.countActiveFilters();
            
            this.container.innerHTML = `
                <div class="filter-header">
                    <div class="filter-title">
                        <span>🔖</span>
                        Feed Filter
                    </div>
                    <button class="filter-close" onclick="BaelFeedFilter.hide()">✕</button>
                </div>
                
                <div class="filter-stats">
                    <span><span class="stats-count">${activeFilters}</span> filters active</span>
                    <span onclick="BaelFeedFilter.clearFilters()" style="cursor:pointer;color:#818cf8">Clear all</span>
                </div>
                
                <div class="filter-content">
                    <div class="filter-section">
                        <div class="filter-section-title">Search Messages</div>
                        <input type="text" 
                               class="filter-search" 
                               placeholder="Type to search..."
                               value="${this.filters.search}"
                               oninput="BaelFeedFilter.setFilter('search', this.value)"
                               id="filter-search-input">
                    </div>
                    
                    <div class="filter-section">
                        <div class="filter-section-title">Message Type</div>
                        <div class="filter-chips">
                            <div class="filter-chip ${this.filters.type === 'all' ? 'active' : ''}" 
                                 onclick="BaelFeedFilter.setFilter('type', 'all')">All</div>
                            <div class="filter-chip ${this.filters.type === 'user' ? 'active' : ''}" 
                                 onclick="BaelFeedFilter.setFilter('type', 'user')">👤 User</div>
                            <div class="filter-chip ${this.filters.type === 'agent' ? 'active' : ''}" 
                                 onclick="BaelFeedFilter.setFilter('type', 'agent')">🤖 Agent</div>
                            <div class="filter-chip ${this.filters.type === 'code' ? 'active' : ''}" 
                                 onclick="BaelFeedFilter.setFilter('type', 'code')">💻 Code</div>
                            <div class="filter-chip ${this.filters.type === 'error' ? 'active' : ''}" 
                                 onclick="BaelFeedFilter.setFilter('type', 'error')">⚠️ Error</div>
                        </div>
                    </div>
                    
                    <div class="filter-section">
                        <div class="filter-section-title">Time Range</div>
                        <div class="filter-chips">
                            <div class="filter-chip ${this.filters.timeRange === 'all' ? 'active' : ''}" 
                                 onclick="BaelFeedFilter.setFilter('timeRange', 'all')">All Time</div>
                            <div class="filter-chip ${this.filters.timeRange === 'today' ? 'active' : ''}" 
                                 onclick="BaelFeedFilter.setFilter('timeRange', 'today')">Today</div>
                            <div class="filter-chip ${this.filters.timeRange === 'week' ? 'active' : ''}" 
                                 onclick="BaelFeedFilter.setFilter('timeRange', 'week')">This Week</div>
                            <div class="filter-chip ${this.filters.timeRange === 'month' ? 'active' : ''}" 
                                 onclick="BaelFeedFilter.setFilter('timeRange', 'month')">This Month</div>
                        </div>
                    </div>
                    
                    <div class="filter-section">
                        <div class="filter-section-title">Contains</div>
                        <div class="filter-toggles">
                            <div class="filter-toggle" onclick="BaelFeedFilter.toggleFilter('hasCode')">
                                <span class="toggle-label">💻 Contains Code</span>
                                <div class="toggle-switch ${this.filters.hasCode ? 'active' : ''}"></div>
                            </div>
                            <div class="filter-toggle" onclick="BaelFeedFilter.toggleFilter('hasError')">
                                <span class="toggle-label">⚠️ Contains Error</span>
                                <div class="toggle-switch ${this.filters.hasError ? 'active' : ''}"></div>
                            </div>
                            <div class="filter-toggle" onclick="BaelFeedFilter.toggleFilter('hasLink')">
                                <span class="toggle-label">🔗 Contains Link</span>
                                <div class="toggle-switch ${this.filters.hasLink ? 'active' : ''}"></div>
                            </div>
                        </div>
                    </div>
                    
                    ${this.savedFilters.length > 0 ? `
                        <div class="filter-section">
                            <div class="filter-section-title">Saved Filters</div>
                            ${this.savedFilters.map((f, i) => `
                                <div class="saved-filter" onclick="BaelFeedFilter.loadSavedFilter(${i})">
                                    <span class="saved-filter-name">${f.name}</span>
                                    <button class="saved-filter-delete" onclick="event.stopPropagation();BaelFeedFilter.deleteSavedFilter(${i})">🗑️</button>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
                
                <div class="filter-actions">
                    <button class="filter-btn secondary" onclick="BaelFeedFilter.saveCurrentFilter()">
                        💾 Save Filter
                    </button>
                    <button class="filter-btn primary" onclick="BaelFeedFilter.applyFilters()">
                        ✅ Apply Filters
                    </button>
                </div>
            `;
        }

        setFilter(key, value) {
            this.filters[key] = value;
            this.render();
            this.updateFAB();
        }

        toggleFilter(key) {
            this.filters[key] = !this.filters[key];
            this.render();
            this.updateFAB();
        }

        countActiveFilters() {
            let count = 0;
            if (this.filters.type !== 'all') count++;
            if (this.filters.timeRange !== 'all') count++;
            if (this.filters.hasCode) count++;
            if (this.filters.hasError) count++;
            if (this.filters.hasLink) count++;
            if (this.filters.search) count++;
            return count;
        }

        updateFAB() {
            const count = this.countActiveFilters();
            this.fab.classList.toggle('has-filters', count > 0);
            document.getElementById('filter-badge').textContent = count;
        }

        applyFilters() {
            const messages = document.querySelectorAll('[class*="message"], .chat-message, .msg');
            let matchCount = 0;
            
            messages.forEach(msg => {
                const text = msg.textContent || '';
                const isMatch = this.matchesFilters(msg, text);
                
                msg.classList.toggle('message-filtered-out', !isMatch);
                msg.classList.toggle('message-matched', isMatch && this.countActiveFilters() > 0);
                
                if (isMatch) matchCount++;
            });
            
            this.showToast(`${matchCount} messages match your filters`);
        }

        matchesFilters(element, text) {
            const lowerText = text.toLowerCase();
            
            // Search filter
            if (this.filters.search && !lowerText.includes(this.filters.search.toLowerCase())) {
                return false;
            }
            
            // Type filter
            if (this.filters.type !== 'all') {
                const classes = element.className || '';
                switch(this.filters.type) {
                    case 'user':
                        if (!classes.includes('user') && !classes.includes('human')) return false;
                        break;
                    case 'agent':
                        if (!classes.includes('agent') && !classes.includes('assistant')) return false;
                        break;
                    case 'code':
                        if (!text.includes('```') && !element.querySelector('code, pre')) return false;
                        break;
                    case 'error':
                        if (!lowerText.includes('error') && !lowerText.includes('exception')) return false;
                        break;
                }
            }
            
            // Content filters
            if (this.filters.hasCode && !text.includes('```') && !element.querySelector('code, pre')) {
                return false;
            }
            
            if (this.filters.hasError && !lowerText.includes('error') && !lowerText.includes('exception')) {
                return false;
            }
            
            if (this.filters.hasLink && !text.includes('http://') && !text.includes('https://')) {
                return false;
            }
            
            return true;
        }

        clearFilters() {
            this.filters = {
                type: 'all',
                timeRange: 'all',
                hasCode: false,
                hasError: false,
                hasLink: false,
                search: ''
            };
            
            // Remove filter classes from messages
            document.querySelectorAll('.message-filtered-out, .message-matched').forEach(el => {
                el.classList.remove('message-filtered-out', 'message-matched');
            });
            
            this.render();
            this.updateFAB();
        }

        saveCurrentFilter() {
            const name = prompt('Enter filter name:');
            if (!name) return;
            
            this.savedFilters.push({
                name,
                filters: { ...this.filters }
            });
            
            this.saveSavedFilters();
            this.render();
            this.showToast('Filter saved!');
        }

        loadSavedFilter(index) {
            const saved = this.savedFilters[index];
            if (saved) {
                this.filters = { ...saved.filters };
                this.render();
                this.updateFAB();
                this.applyFilters();
            }
        }

        deleteSavedFilter(index) {
            this.savedFilters.splice(index, 1);
            this.saveSavedFilters();
            this.render();
        }

        loadSavedFilters() {
            try {
                return JSON.parse(localStorage.getItem('bael_feedfilter_saved') || '[]');
            } catch {
                return [];
            }
        }

        saveSavedFilters() {
            localStorage.setItem('bael_feedfilter_saved', JSON.stringify(this.savedFilters));
        }

        loadTags() {
            try {
                return JSON.parse(localStorage.getItem('bael_feedfilter_tags') || '{}');
            } catch {
                return {};
            }
        }

        showToast(message) {
            const toast = document.createElement('div');
            toast.style.cssText = `
                position: fixed;
                bottom: 80px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(16, 185, 129, 0.9);
                color: #fff;
                padding: 10px 20px;
                border-radius: 8px;
                font-size: 13px;
                z-index: 9999;
            `;
            toast.textContent = message;
            document.body.appendChild(toast);
            
            setTimeout(() => toast.remove(), 2000);
        }

        setupShortcuts() {
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.shiftKey && e.key === 'Y') {
                    e.preventDefault();
                    this.toggle();
                }
                
                if (e.key === 'Escape' && this.visible) {
                    this.hide();
                }
            });
        }

        toggle() {
            if (this.visible) {
                this.hide();
            } else {
                this.show();
            }
        }

        show() {
            this.visible = true;
            this.render();
            this.container.classList.add('visible');
            setTimeout(() => {
                document.getElementById('filter-search-input')?.focus();
            }, 50);
        }

        hide() {
            this.visible = false;
            this.container.classList.remove('visible');
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════

    window.BaelFeedFilter = new BaelFeedFilter();
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.BaelFeedFilter.initialize();
        });
    } else {
        window.BaelFeedFilter.initialize();
    }

    console.log('🔖 Bael Feed Filter loaded');
})();
