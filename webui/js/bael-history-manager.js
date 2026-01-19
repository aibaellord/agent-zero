/**
 * BAEL - LORD OF ALL
 * History Manager - Browser history and navigation management
 * ═══════════════════════════════════════════════════════════════
 */

(function() {
    'use strict';

    class BaelHistoryManager {
        constructor() {
            this.history = [];
            this.currentIndex = -1;
            this.maxEntries = 50;
            this.listeners = new Map();
            this.beforeNavigate = [];
            this.init();
        }

        init() {
            this.bindEvents();
            this.captureInitialState();
            console.log('📜 Bael History Manager initialized');
        }

        bindEvents() {
            // Listen for browser back/forward
            window.addEventListener('popstate', (e) => {
                this.handlePopState(e);
            });

            // Intercept link clicks
            document.addEventListener('click', (e) => {
                const link = e.target.closest('a[href]');
                if (link && this.shouldIntercept(link)) {
                    e.preventDefault();
                    this.navigate(link.href);
                }
            });

            // Handle hash changes
            window.addEventListener('hashchange', (e) => {
                this.emit('hashchange', {
                    oldHash: new URL(e.oldURL).hash,
                    newHash: new URL(e.newURL).hash
                });
            });
        }

        captureInitialState() {
            this.history.push({
                url: window.location.href,
                title: document.title,
                state: history.state || {},
                timestamp: Date.now(),
                scrollPosition: { x: window.scrollX, y: window.scrollY }
            });
            this.currentIndex = 0;
        }

        shouldIntercept(link) {
            // Don't intercept external links, downloads, or special links
            const href = link.getAttribute('href');
            if (!href) return false;
            if (href.startsWith('#')) return false;
            if (link.target === '_blank') return false;
            if (link.hasAttribute('download')) return false;
            if (link.dataset.noHistory === 'true') return false;
            
            try {
                const url = new URL(href, window.location.origin);
                return url.origin === window.location.origin;
            } catch {
                return false;
            }
        }

        /**
         * Navigate to a new URL
         */
        async navigate(url, options = {}) {
            const {
                replace = false,
                state = {},
                title = document.title,
                trigger = true,
                scroll = true
            } = options;

            // Run before navigate hooks
            for (const hook of this.beforeNavigate) {
                const result = await hook(url, this.getCurrentEntry());
                if (result === false) return false;
            }

            const entry = {
                url,
                title,
                state,
                timestamp: Date.now(),
                scrollPosition: { x: 0, y: 0 }
            };

            if (replace) {
                history.replaceState(state, title, url);
                this.history[this.currentIndex] = entry;
            } else {
                history.pushState(state, title, url);
                // Remove forward history
                this.history = this.history.slice(0, this.currentIndex + 1);
                this.history.push(entry);
                this.currentIndex++;
                
                // Limit history size
                if (this.history.length > this.maxEntries) {
                    this.history.shift();
                    this.currentIndex--;
                }
            }

            document.title = title;

            if (scroll) {
                window.scrollTo(0, 0);
            }

            if (trigger) {
                this.emit('navigate', entry);
            }

            return true;
        }

        /**
         * Go back in history
         */
        back() {
            if (this.canGoBack()) {
                history.back();
                return true;
            }
            return false;
        }

        /**
         * Go forward in history
         */
        forward() {
            if (this.canGoForward()) {
                history.forward();
                return true;
            }
            return false;
        }

        /**
         * Go to specific index in history
         */
        go(delta) {
            history.go(delta);
        }

        /**
         * Check if can go back
         */
        canGoBack() {
            return this.currentIndex > 0;
        }

        /**
         * Check if can go forward
         */
        canGoForward() {
            return this.currentIndex < this.history.length - 1;
        }

        /**
         * Get current history entry
         */
        getCurrentEntry() {
            return this.history[this.currentIndex];
        }

        /**
         * Get all history entries
         */
        getHistory() {
            return [...this.history];
        }

        /**
         * Update current entry state
         */
        updateState(state, merge = true) {
            const current = this.getCurrentEntry();
            const newState = merge ? { ...current.state, ...state } : state;
            
            history.replaceState(newState, current.title, current.url);
            current.state = newState;
        }

        /**
         * Save scroll position
         */
        saveScrollPosition() {
            const current = this.getCurrentEntry();
            if (current) {
                current.scrollPosition = {
                    x: window.scrollX,
                    y: window.scrollY
                };
            }
        }

        /**
         * Restore scroll position
         */
        restoreScrollPosition() {
            const current = this.getCurrentEntry();
            if (current?.scrollPosition) {
                window.scrollTo(current.scrollPosition.x, current.scrollPosition.y);
            }
        }

        /**
         * Handle popstate event
         */
        handlePopState(e) {
            this.saveScrollPosition();
            
            // Find the entry that matches
            const url = window.location.href;
            const index = this.history.findIndex(entry => entry.url === url);
            
            if (index !== -1) {
                const direction = index < this.currentIndex ? 'back' : 'forward';
                this.currentIndex = index;
                
                this.emit('popstate', {
                    entry: this.getCurrentEntry(),
                    direction,
                    state: e.state
                });
                
                // Restore scroll after a tick
                setTimeout(() => this.restoreScrollPosition(), 0);
            }
        }

        /**
         * Register before navigate hook
         */
        onBeforeNavigate(callback) {
            this.beforeNavigate.push(callback);
            return () => {
                const index = this.beforeNavigate.indexOf(callback);
                if (index > -1) this.beforeNavigate.splice(index, 1);
            };
        }

        /**
         * Event listener
         */
        on(event, callback) {
            if (!this.listeners.has(event)) {
                this.listeners.set(event, []);
            }
            this.listeners.get(event).push(callback);
            
            return () => this.off(event, callback);
        }

        /**
         * Remove event listener
         */
        off(event, callback) {
            const listeners = this.listeners.get(event);
            if (listeners) {
                const index = listeners.indexOf(callback);
                if (index > -1) listeners.splice(index, 1);
            }
        }

        /**
         * Emit event
         */
        emit(event, data) {
            const listeners = this.listeners.get(event);
            if (listeners) {
                listeners.forEach(callback => callback(data));
            }
            
            document.dispatchEvent(new CustomEvent(`bael-history-${event}`, {
                detail: data
            }));
        }

        /**
         * Clear history
         */
        clear() {
            this.history = [this.getCurrentEntry()];
            this.currentIndex = 0;
        }

        /**
         * Get state object
         */
        getState() {
            return {
                currentIndex: this.currentIndex,
                length: this.history.length,
                canGoBack: this.canGoBack(),
                canGoForward: this.canGoForward(),
                current: this.getCurrentEntry()
            };
        }

        /**
         * Create a hash-based router
         */
        createHashRouter(routes) {
            const handleRoute = () => {
                const hash = window.location.hash.slice(1) || '/';
                
                for (const [pattern, handler] of Object.entries(routes)) {
                    const regex = new RegExp('^' + pattern.replace(/:\w+/g, '([^/]+)') + '$');
                    const match = hash.match(regex);
                    
                    if (match) {
                        const params = {};
                        const paramNames = pattern.match(/:\w+/g) || [];
                        paramNames.forEach((name, i) => {
                            params[name.slice(1)] = match[i + 1];
                        });
                        
                        handler({ hash, params, match });
                        return;
                    }
                }
                
                // 404 handler
                if (routes['*']) {
                    routes['*']({ hash, params: {}, match: null });
                }
            };

            window.addEventListener('hashchange', handleRoute);
            handleRoute(); // Initial route

            return {
                navigate: (hash) => {
                    window.location.hash = hash;
                },
                destroy: () => {
                    window.removeEventListener('hashchange', handleRoute);
                }
            };
        }
    }

    // Initialize
    window.BaelHistoryManager = new BaelHistoryManager();
})();
