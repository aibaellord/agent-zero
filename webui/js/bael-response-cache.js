/**
 * BAEL - LORD OF ALL
 * Response Caching - Intelligent AI response caching for speed
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelResponseCache {
    constructor() {
      this.cache = new Map();
      this.cacheIndex = [];
      this.maxCacheSize = 100;
      this.maxAge = 24 * 60 * 60 * 1000; // 24 hours
      this.hitCount = 0;
      this.missCount = 0;
      this.storageKey = "bael-response-cache";
      this.enabled = true;
      this.init();
    }

    init() {
      this.addStyles();
      this.loadCache();
      this.createUI();
      this.bindEvents();
      this.hookIntoRequests();
      console.log("💨 Bael Response Cache initialized");
    }

    loadCache() {
      try {
        const saved = JSON.parse(localStorage.getItem(this.storageKey) || "{}");
        if (saved.entries) {
          saved.entries.forEach((entry) => {
            if (Date.now() - entry.timestamp < this.maxAge) {
              this.cache.set(entry.key, entry);
              this.cacheIndex.push(entry.key);
            }
          });
        }
        this.hitCount = saved.hitCount || 0;
        this.missCount = saved.missCount || 0;
      } catch {
        this.cache.clear();
        this.cacheIndex = [];
      }
    }

    saveCache() {
      const entries = Array.from(this.cache.values());
      localStorage.setItem(
        this.storageKey,
        JSON.stringify({
          entries,
          hitCount: this.hitCount,
          missCount: this.missCount,
        }),
      );
    }

    addStyles() {
      const styles = document.createElement("style");
      styles.id = "bael-cache-styles";
      styles.textContent = `
                /* Cache Indicator */
                .bael-cache-indicator {
                    position: fixed;
                    bottom: 180px;
                    left: 20px;
                    padding: 8px 14px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 20px;
                    font-size: 12px;
                    color: var(--bael-text-primary, #fff);
                    z-index: 100005;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .bael-cache-indicator:hover {
                    border-color: var(--bael-accent, #ff3366);
                }

                .cache-status {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #4ade80;
                }

                .cache-status.disabled {
                    background: #ef4444;
                }

                .cache-hit-badge {
                    font-size: 10px;
                    padding: 2px 6px;
                    background: rgba(74, 222, 128, 0.2);
                    color: #4ade80;
                    border-radius: 10px;
                    animation: cachePulse 0.5s ease;
                }

                @keyframes cachePulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }

                /* Cache Panel */
                .bael-cache-panel {
                    position: fixed;
                    bottom: 220px;
                    left: 20px;
                    width: 350px;
                    max-height: 400px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 14px;
                    z-index: 100025;
                    display: none;
                    flex-direction: column;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    box-shadow: 0 8px 40px rgba(0, 0, 0, 0.4);
                    overflow: hidden;
                }

                .bael-cache-panel.visible {
                    display: flex;
                    animation: cachePanelIn 0.2s ease;
                }

                @keyframes cachePanelIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Panel Header */
                .cache-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .cache-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .cache-toggle {
                    position: relative;
                    width: 40px;
                    height: 22px;
                    background: var(--bael-bg-tertiary, #181820);
                    border-radius: 20px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .cache-toggle.active {
                    background: var(--bael-accent, #ff3366);
                }

                .cache-toggle::after {
                    content: '';
                    position: absolute;
                    top: 3px;
                    left: 3px;
                    width: 16px;
                    height: 16px;
                    background: #fff;
                    border-radius: 50%;
                    transition: all 0.3s ease;
                }

                .cache-toggle.active::after {
                    left: 21px;
                }

                /* Stats */
                .cache-stats {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 8px;
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .cache-stat {
                    text-align: center;
                    padding: 10px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-radius: 8px;
                }

                .cache-stat-value {
                    font-size: 18px;
                    font-weight: 700;
                    color: var(--bael-text-primary, #fff);
                }

                .cache-stat-label {
                    font-size: 10px;
                    color: var(--bael-text-muted, #666);
                    text-transform: uppercase;
                    margin-top: 2px;
                }

                .cache-stat.hits .cache-stat-value {
                    color: #4ade80;
                }

                .cache-stat.misses .cache-stat-value {
                    color: #f87171;
                }

                /* Cache List */
                .cache-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 8px;
                }

                .cache-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    padding: 10px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    margin-bottom: 6px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .cache-item:hover {
                    border-color: var(--bael-accent, #ff3366);
                }

                .cache-item-icon {
                    width: 32px;
                    height: 32px;
                    background: var(--bael-bg-tertiary, #181820);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    flex-shrink: 0;
                }

                .cache-item-content {
                    flex: 1;
                    min-width: 0;
                }

                .cache-item-query {
                    font-size: 12px;
                    color: var(--bael-text-primary, #fff);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .cache-item-meta {
                    display: flex;
                    gap: 8px;
                    font-size: 10px;
                    color: var(--bael-text-muted, #666);
                    margin-top: 4px;
                }

                .cache-item-delete {
                    width: 24px;
                    height: 24px;
                    background: transparent;
                    border: none;
                    color: var(--bael-text-muted, #555);
                    cursor: pointer;
                    border-radius: 4px;
                    font-size: 12px;
                    opacity: 0;
                }

                .cache-item:hover .cache-item-delete {
                    opacity: 1;
                }

                .cache-item-delete:hover {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }

                /* Actions */
                .cache-actions {
                    padding: 12px 16px;
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                    display: flex;
                    gap: 8px;
                }

                .cache-action {
                    flex: 1;
                    padding: 8px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-muted, #666);
                    font-size: 11px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .cache-action:hover {
                    border-color: var(--bael-accent, #ff3366);
                    color: var(--bael-text-primary, #fff);
                }

                /* Empty State */
                .cache-empty {
                    text-align: center;
                    padding: 30px 20px;
                    color: var(--bael-text-muted, #666);
                }

                .cache-empty-icon {
                    font-size: 32px;
                    margin-bottom: 8px;
                    opacity: 0.5;
                }

                /* Hit Animation */
                .cache-hit-flash {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    padding: 12px 24px;
                    background: rgba(74, 222, 128, 0.2);
                    border: 1px solid #4ade80;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    color: #4ade80;
                    z-index: 100050;
                    animation: hitFlash 1s ease forwards;
                    pointer-events: none;
                }

                @keyframes hitFlash {
                    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                    20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    80% { opacity: 1; }
                    100% { opacity: 0; transform: translate(-50%, -50%) scale(1.1); }
                }
            `;
      document.head.appendChild(styles);
    }

    createUI() {
      // Indicator
      const indicator = document.createElement("div");
      indicator.className = "bael-cache-indicator";
      indicator.innerHTML = `
                <div class="cache-status ${this.enabled ? "" : "disabled"}"></div>
                <span>Cache</span>
                <span class="cache-hit-badge" style="display: none">HIT!</span>
            `;
      indicator.addEventListener("click", () => this.togglePanel());
      document.body.appendChild(indicator);
      this.indicator = indicator;

      // Panel
      const panel = document.createElement("div");
      panel.className = "bael-cache-panel";
      panel.innerHTML = this.renderPanel();
      document.body.appendChild(panel);
      this.panel = panel;

      this.bindPanelEvents();
    }

    renderPanel() {
      const hitRate =
        this.hitCount + this.missCount > 0
          ? Math.round((this.hitCount / (this.hitCount + this.missCount)) * 100)
          : 0;

      return `
                <div class="cache-header">
                    <div class="cache-title">
                        <span>💨</span>
                        <span>Response Cache</span>
                    </div>
                    <div class="cache-toggle ${this.enabled ? "active" : ""}" id="cache-toggle"></div>
                </div>

                <div class="cache-stats">
                    <div class="cache-stat hits">
                        <div class="cache-stat-value" id="hit-count">${this.hitCount}</div>
                        <div class="cache-stat-label">Hits</div>
                    </div>
                    <div class="cache-stat misses">
                        <div class="cache-stat-value" id="miss-count">${this.missCount}</div>
                        <div class="cache-stat-label">Misses</div>
                    </div>
                    <div class="cache-stat">
                        <div class="cache-stat-value" id="hit-rate">${hitRate}%</div>
                        <div class="cache-stat-label">Hit Rate</div>
                    </div>
                </div>

                <div class="cache-list" id="cache-list">
                    ${this.renderCacheList()}
                </div>

                <div class="cache-actions">
                    <button class="cache-action" id="clear-cache">🗑️ Clear Cache</button>
                    <button class="cache-action" id="export-cache">📤 Export</button>
                </div>
            `;
    }

    renderCacheList() {
      if (this.cache.size === 0) {
        return `
                    <div class="cache-empty">
                        <div class="cache-empty-icon">📦</div>
                        <div>Cache is empty</div>
                    </div>
                `;
      }

      const entries = Array.from(this.cache.values())
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 20);

      return entries
        .map(
          (entry) => `
                <div class="cache-item" data-key="${entry.key}">
                    <div class="cache-item-icon">💬</div>
                    <div class="cache-item-content">
                        <div class="cache-item-query">${this.escapeHtml(entry.query.substring(0, 50))}</div>
                        <div class="cache-item-meta">
                            <span>${this.formatSize(entry.size)} bytes</span>
                            <span>Used ${entry.hits || 1}x</span>
                            <span>${this.formatAge(entry.timestamp)}</span>
                        </div>
                    </div>
                    <button class="cache-item-delete">×</button>
                </div>
            `,
        )
        .join("");
    }

    bindPanelEvents() {
      // Toggle
      this.panel
        .querySelector("#cache-toggle")
        .addEventListener("click", () => {
          this.enabled = !this.enabled;
          this.panel
            .querySelector("#cache-toggle")
            .classList.toggle("active", this.enabled);
          this.indicator
            .querySelector(".cache-status")
            .classList.toggle("disabled", !this.enabled);
        });

      // Clear cache
      this.panel.querySelector("#clear-cache").addEventListener("click", () => {
        if (confirm("Clear all cached responses?")) {
          this.clearCache();
        }
      });

      // Export
      this.panel
        .querySelector("#export-cache")
        .addEventListener("click", () => {
          this.exportCache();
        });

      // Item clicks
      this.panel.querySelector("#cache-list").addEventListener("click", (e) => {
        const deleteBtn = e.target.closest(".cache-item-delete");
        const item = e.target.closest(".cache-item");

        if (deleteBtn && item) {
          e.stopPropagation();
          this.deleteEntry(item.dataset.key);
        } else if (item) {
          this.previewEntry(item.dataset.key);
        }
      });
    }

    bindEvents() {
      // Click outside to close
      document.addEventListener("click", (e) => {
        if (
          !this.panel.contains(e.target) &&
          !this.indicator.contains(e.target)
        ) {
          this.closePanel();
        }
      });
    }

    hookIntoRequests() {
      // Store reference to original fetch
      const originalFetch = window.fetch;
      const self = this;

      // Override fetch to intercept API calls
      window.fetch = async function (...args) {
        const [url, options] = args;

        // Only cache certain endpoints
        if (self.enabled && self.isCacheable(url, options)) {
          const cacheKey = self.generateCacheKey(url, options);
          const cached = self.get(cacheKey);

          if (cached) {
            self.showCacheHit();
            return new Response(JSON.stringify(cached.response), {
              status: 200,
              headers: { "Content-Type": "application/json" },
            });
          }

          // Make actual request
          const response = await originalFetch.apply(this, args);
          const clone = response.clone();

          // Cache the response
          try {
            const data = await clone.json();
            self.set(cacheKey, url, options, data);
          } catch {}

          return response;
        }

        return originalFetch.apply(this, args);
      };
    }

    isCacheable(url, options) {
      // Cache GET requests to certain endpoints
      if (typeof url !== "string") return false;
      if (
        options?.method &&
        options.method !== "GET" &&
        options.method !== "POST"
      )
        return false;

      // Don't cache streaming endpoints or certain URLs
      if (url.includes("/stream") || url.includes("/chat")) return false;

      return url.includes("/api/") || url.includes("/model");
    }

    generateCacheKey(url, options) {
      const body = options?.body ? JSON.stringify(options.body) : "";
      const key = `${url}:${body}`;
      return btoa(key).substring(0, 32);
    }

    get(key) {
      const entry = this.cache.get(key);
      if (!entry) {
        this.missCount++;
        return null;
      }

      // Check if expired
      if (Date.now() - entry.timestamp > this.maxAge) {
        this.cache.delete(key);
        this.missCount++;
        return null;
      }

      // Update hit count
      entry.hits = (entry.hits || 0) + 1;
      this.hitCount++;
      this.saveCache();
      this.updateStats();

      return entry;
    }

    set(key, url, options, response) {
      const query = options?.body
        ? JSON.parse(options.body).message || url
        : url;

      const entry = {
        key,
        query,
        response,
        timestamp: Date.now(),
        size: JSON.stringify(response).length,
        hits: 0,
      };

      // Enforce max size (LRU eviction)
      while (
        this.cache.size >= this.maxCacheSize &&
        this.cacheIndex.length > 0
      ) {
        const oldestKey = this.cacheIndex.shift();
        this.cache.delete(oldestKey);
      }

      this.cache.set(key, entry);
      this.cacheIndex.push(key);
      this.saveCache();
      this.refreshList();
    }

    deleteEntry(key) {
      this.cache.delete(key);
      this.cacheIndex = this.cacheIndex.filter((k) => k !== key);
      this.saveCache();
      this.refreshList();
    }

    clearCache() {
      this.cache.clear();
      this.cacheIndex = [];
      this.hitCount = 0;
      this.missCount = 0;
      this.saveCache();
      this.refreshList();
      this.updateStats();

      if (window.BaelNotifications) {
        window.BaelNotifications.info("Cache cleared");
      }
    }

    exportCache() {
      const data = {
        entries: Array.from(this.cache.values()),
        hitCount: this.hitCount,
        missCount: this.missCount,
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bael-cache-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }

    previewEntry(key) {
      const entry = this.cache.get(key);
      if (!entry) return;

      console.log("Cache Entry:", entry);
      if (window.BaelNotifications) {
        window.BaelNotifications.info("Entry logged to console");
      }
    }

    showCacheHit() {
      // Flash the badge
      const badge = this.indicator.querySelector(".cache-hit-badge");
      badge.style.display = "block";
      setTimeout(() => (badge.style.display = "none"), 1000);

      // Flash notification
      const flash = document.createElement("div");
      flash.className = "cache-hit-flash";
      flash.textContent = "⚡ Cache Hit!";
      document.body.appendChild(flash);
      setTimeout(() => flash.remove(), 1000);

      this.updateStats();
    }

    updateStats() {
      const hitEl = this.panel.querySelector("#hit-count");
      const missEl = this.panel.querySelector("#miss-count");
      const rateEl = this.panel.querySelector("#hit-rate");

      if (hitEl) hitEl.textContent = this.hitCount;
      if (missEl) missEl.textContent = this.missCount;

      const rate =
        this.hitCount + this.missCount > 0
          ? Math.round((this.hitCount / (this.hitCount + this.missCount)) * 100)
          : 0;
      if (rateEl) rateEl.textContent = `${rate}%`;
    }

    refreshList() {
      const list = this.panel.querySelector("#cache-list");
      if (list) {
        list.innerHTML = this.renderCacheList();
      }
    }

    togglePanel() {
      this.panel.classList.toggle("visible");
    }

    closePanel() {
      this.panel.classList.remove("visible");
    }

    formatSize(bytes) {
      if (bytes < 1024) return bytes;
      return (bytes / 1024).toFixed(1) + "K";
    }

    formatAge(timestamp) {
      const diff = Date.now() - timestamp;
      const minutes = Math.floor(diff / 60000);
      const hours = Math.floor(diff / 3600000);

      if (minutes < 1) return "Just now";
      if (minutes < 60) return `${minutes}m ago`;
      if (hours < 24) return `${hours}h ago`;
      return new Date(timestamp).toLocaleDateString();
    }

    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }
  }

  // Initialize
  window.BaelResponseCache = new BaelResponseCache();
})();
