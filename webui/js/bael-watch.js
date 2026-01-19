/**
 * BAEL - LORD OF ALL
 * Watch System - Observe changes and trigger effects
 * ═══════════════════════════════════════════════════════════════
 */

(function() {
    'use strict';

    class BaelWatch {
        constructor() {
            this.watchers = new Map();
            this.watcherId = 0;
            console.log('👁️ Bael Watch System initialized');
        }

        /**
         * Watch a reactive source for changes
         */
        watch(source, callback, options = {}) {
            const {
                immediate = false,
                deep = false,
                flush = 'sync', // 'sync' | 'post' | 'pre'
                once = false
            } = options;

            const id = ++this.watcherId;
            let oldValue = this.getValue(source, deep);
            let cleanup = null;

            const onCleanup = (fn) => {
                cleanup = fn;
            };

            const run = () => {
                if (cleanup) {
                    cleanup();
                    cleanup = null;
                }

                const newValue = this.getValue(source, deep);
                
                if (this.hasChanged(oldValue, newValue, deep)) {
                    const runCallback = () => {
                        callback(newValue, oldValue, onCleanup);
                        oldValue = this.cloneValue(newValue, deep);
                        
                        if (once) {
                            this.unwatch(id);
                        }
                    };

                    if (flush === 'sync') {
                        runCallback();
                    } else if (flush === 'post') {
                        queueMicrotask(runCallback);
                    } else if (flush === 'pre') {
                        Promise.resolve().then(runCallback);
                    }
                }
            };

            // Subscribe to source
            const unsubscribers = [];
            
            if (Array.isArray(source)) {
                source.forEach(s => {
                    if (s.__subscribers) {
                        s.__subscribers.add(run);
                        unsubscribers.push(() => s.__subscribers.delete(run));
                    }
                });
            } else if (source.__subscribers) {
                source.__subscribers.add(run);
                unsubscribers.push(() => source.__subscribers.delete(run));
            } else if (typeof source === 'function') {
                // Watch a getter function
                const effect = () => run();
                if (window.BaelReactive) {
                    window.BaelReactive.effect(() => {
                        source();
                        effect();
                    });
                }
            }

            const watcher = {
                id,
                source,
                callback,
                options,
                run,
                stop: () => {
                    unsubscribers.forEach(unsub => unsub());
                    if (cleanup) cleanup();
                    this.watchers.delete(id);
                }
            };

            this.watchers.set(id, watcher);

            if (immediate) {
                callback(oldValue, undefined, onCleanup);
            }

            return watcher.stop;
        }

        /**
         * Watch multiple sources
         */
        watchMultiple(sources, callback, options = {}) {
            let oldValues = sources.map(s => this.getValue(s, options.deep));

            const run = () => {
                const newValues = sources.map(s => this.getValue(s, options.deep));
                const changed = newValues.some((v, i) => 
                    this.hasChanged(oldValues[i], v, options.deep)
                );
                
                if (changed) {
                    callback(newValues, oldValues);
                    oldValues = newValues.map(v => this.cloneValue(v, options.deep));
                }
            };

            const unsubscribers = sources.map(source => {
                if (source.__subscribers) {
                    source.__subscribers.add(run);
                    return () => source.__subscribers.delete(run);
                }
                return () => {};
            });

            if (options.immediate) {
                callback(oldValues, undefined);
            }

            return () => unsubscribers.forEach(unsub => unsub());
        }

        /**
         * Watch with debounce
         */
        watchDebounced(source, callback, delay = 300, options = {}) {
            let timeoutId = null;
            
            return this.watch(source, (newValue, oldValue, onCleanup) => {
                if (timeoutId) clearTimeout(timeoutId);
                
                timeoutId = setTimeout(() => {
                    callback(newValue, oldValue, onCleanup);
                }, delay);
                
                onCleanup(() => {
                    if (timeoutId) clearTimeout(timeoutId);
                });
            }, options);
        }

        /**
         * Watch with throttle
         */
        watchThrottled(source, callback, limit = 300, options = {}) {
            let lastRun = 0;
            let timeoutId = null;
            
            return this.watch(source, (newValue, oldValue, onCleanup) => {
                const now = Date.now();
                
                if (now - lastRun >= limit) {
                    callback(newValue, oldValue, onCleanup);
                    lastRun = now;
                } else {
                    if (timeoutId) clearTimeout(timeoutId);
                    timeoutId = setTimeout(() => {
                        callback(newValue, oldValue, onCleanup);
                        lastRun = Date.now();
                    }, limit - (now - lastRun));
                }
                
                onCleanup(() => {
                    if (timeoutId) clearTimeout(timeoutId);
                });
            }, options);
        }

        /**
         * Watch until condition is met
         */
        watchUntil(source, condition, callback, options = {}) {
            const stop = this.watch(source, (newValue, oldValue, onCleanup) => {
                if (condition(newValue, oldValue)) {
                    callback(newValue, oldValue, onCleanup);
                    stop();
                }
            }, options);
            
            return stop;
        }

        /**
         * Watch for specific value
         */
        watchFor(source, targetValue, callback, options = {}) {
            return this.watchUntil(
                source,
                (value) => this.isEqual(value, targetValue),
                callback,
                options
            );
        }

        /**
         * Watch object property
         */
        watchProperty(obj, prop, callback, options = {}) {
            let value = obj[prop];
            
            Object.defineProperty(obj, prop, {
                get: () => value,
                set: (newValue) => {
                    const oldValue = value;
                    value = newValue;
                    if (oldValue !== newValue) {
                        callback(newValue, oldValue);
                    }
                },
                configurable: true
            });

            return () => {
                Object.defineProperty(obj, prop, {
                    value,
                    writable: true,
                    configurable: true
                });
            };
        }

        /**
         * Watch DOM attribute
         */
        watchAttribute(element, attribute, callback) {
            let value = element.getAttribute(attribute);
            
            const observer = new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    if (mutation.attributeName === attribute) {
                        const newValue = element.getAttribute(attribute);
                        if (newValue !== value) {
                            callback(newValue, value);
                            value = newValue;
                        }
                    }
                });
            });
            
            observer.observe(element, { attributes: true, attributeFilter: [attribute] });
            
            return () => observer.disconnect();
        }

        /**
         * Watch localStorage key
         */
        watchStorage(key, callback, storage = localStorage) {
            let value = storage.getItem(key);
            
            const handler = (e) => {
                if (e.key === key || e.key === null) {
                    const newValue = storage.getItem(key);
                    if (newValue !== value) {
                        callback(newValue, value);
                        value = newValue;
                    }
                }
            };
            
            window.addEventListener('storage', handler);
            
            // Also poll for changes in same tab
            const interval = setInterval(() => {
                const newValue = storage.getItem(key);
                if (newValue !== value) {
                    callback(newValue, value);
                    value = newValue;
                }
            }, 100);
            
            return () => {
                window.removeEventListener('storage', handler);
                clearInterval(interval);
            };
        }

        /**
         * Unwatch by ID
         */
        unwatch(id) {
            const watcher = this.watchers.get(id);
            if (watcher) {
                watcher.stop();
            }
        }

        /**
         * Stop all watchers
         */
        stopAll() {
            this.watchers.forEach(watcher => watcher.stop());
            this.watchers.clear();
        }

        /**
         * Get value from source
         */
        getValue(source, deep = false) {
            if (source === null || source === undefined) return source;
            if (source.value !== undefined) return source.value;
            if (source.__raw) return source.__raw();
            if (typeof source === 'function') return source();
            return source;
        }

        /**
         * Clone value
         */
        cloneValue(value, deep = false) {
            if (!deep || value === null || typeof value !== 'object') {
                return value;
            }
            
            if (Array.isArray(value)) {
                return value.map(v => this.cloneValue(v, true));
            }
            
            if (value instanceof Date) return new Date(value);
            if (value instanceof RegExp) return new RegExp(value);
            
            const cloned = {};
            for (const key in value) {
                if (value.hasOwnProperty(key)) {
                    cloned[key] = this.cloneValue(value[key], true);
                }
            }
            return cloned;
        }

        /**
         * Check if values have changed
         */
        hasChanged(oldValue, newValue, deep = false) {
            if (oldValue === newValue) return false;
            if (!deep) return true;
            
            return JSON.stringify(oldValue) !== JSON.stringify(newValue);
        }

        /**
         * Deep equality check
         */
        isEqual(a, b) {
            if (a === b) return true;
            if (typeof a !== typeof b) return false;
            if (typeof a !== 'object') return false;
            if (a === null || b === null) return false;
            
            const keysA = Object.keys(a);
            const keysB = Object.keys(b);
            
            if (keysA.length !== keysB.length) return false;
            
            return keysA.every(key => this.isEqual(a[key], b[key]));
        }
    }

    // Initialize
    window.BaelWatch = new BaelWatch();
})();
