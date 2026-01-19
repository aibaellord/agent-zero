/**
 * BAEL Network - Network Status System
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete network system:
 * - Online/offline detection
 * - Connection quality
 * - Network information
 * - Retry strategies
 * - Sync queue
 */

(function () {
  "use strict";

  class BaelNetwork {
    constructor() {
      this.listeners = new Set();
      this.syncQueue = [];
      this.isProcessingQueue = false;

      this._initEvents();
      console.log("🌐 Bael Network initialized");
    }

    _initEvents() {
      window.addEventListener("online", () => {
        this._notify({ online: true, event: "online" });
        this._processQueue();
      });

      window.addEventListener("offline", () => {
        this._notify({ online: false, event: "offline" });
      });

      // Connection change
      if (navigator.connection) {
        navigator.connection.addEventListener("change", () => {
          this._notify({
            online: this.isOnline(),
            event: "change",
            connection: this.getConnectionInfo(),
          });
        });
      }
    }

    _notify(data) {
      for (const listener of this.listeners) {
        listener(data);
      }
    }

    // ═══════════════════════════════════════════════════════════
    // STATUS QUERIES
    // ═══════════════════════════════════════════════════════════

    isOnline() {
      return navigator.onLine;
    }

    isOffline() {
      return !navigator.onLine;
    }

    getConnectionInfo() {
      const conn =
        navigator.connection ||
        navigator.mozConnection ||
        navigator.webkitConnection;

      if (!conn) {
        return {
          supported: false,
          type: "unknown",
          effectiveType: "unknown",
        };
      }

      return {
        supported: true,
        type: conn.type || "unknown",
        effectiveType: conn.effectiveType || "unknown",
        downlink: conn.downlink,
        downlinkMax: conn.downlinkMax,
        rtt: conn.rtt,
        saveData: conn.saveData || false,
      };
    }

    getEffectiveType() {
      const info = this.getConnectionInfo();
      return info.effectiveType;
    }

    isSlow() {
      const type = this.getEffectiveType();
      return ["slow-2g", "2g"].includes(type);
    }

    isFast() {
      const type = this.getEffectiveType();
      return ["4g"].includes(type);
    }

    isSaveData() {
      const info = this.getConnectionInfo();
      return info.saveData;
    }

    // ═══════════════════════════════════════════════════════════
    // EVENT HANDLING
    // ═══════════════════════════════════════════════════════════

    onChange(callback) {
      this.listeners.add(callback);
      return () => this.listeners.delete(callback);
    }

    onOnline(callback) {
      const handler = (data) => {
        if (data.online) callback(data);
      };
      return this.onChange(handler);
    }

    onOffline(callback) {
      const handler = (data) => {
        if (!data.online) callback(data);
      };
      return this.onChange(handler);
    }

    // Wait for online
    waitForOnline(timeout = 30000) {
      return new Promise((resolve, reject) => {
        if (this.isOnline()) {
          resolve();
          return;
        }

        let timeoutId;
        const unsubscribe = this.onOnline(() => {
          clearTimeout(timeoutId);
          unsubscribe();
          resolve();
        });

        if (timeout > 0) {
          timeoutId = setTimeout(() => {
            unsubscribe();
            reject(new Error("Timeout waiting for online"));
          }, timeout);
        }
      });
    }

    // ═══════════════════════════════════════════════════════════
    // CONNECTIVITY TEST
    // ═══════════════════════════════════════════════════════════

    async ping(url = "/favicon.ico", timeout = 5000) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const start = performance.now();

      try {
        const response = await fetch(url, {
          method: "HEAD",
          mode: "no-cors",
          cache: "no-store",
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const latency = performance.now() - start;

        return {
          online: true,
          latency: Math.round(latency),
          timestamp: Date.now(),
        };
      } catch (error) {
        clearTimeout(timeoutId);
        return {
          online: false,
          error: error.message,
          timestamp: Date.now(),
        };
      }
    }

    async testConnection(options = {}) {
      const url = options.url || "https://www.google.com/generate_204";
      const timeout = options.timeout || 5000;

      const result = await this.ping(url, timeout);

      return {
        ...result,
        quality: this._estimateQuality(result.latency),
      };
    }

    _estimateQuality(latency) {
      if (!latency) return "offline";
      if (latency < 100) return "excellent";
      if (latency < 300) return "good";
      if (latency < 600) return "fair";
      return "poor";
    }

    // ═══════════════════════════════════════════════════════════
    // RETRY STRATEGIES
    // ═══════════════════════════════════════════════════════════

    async retry(fn, options = {}) {
      const maxRetries = options.maxRetries || 3;
      const baseDelay = options.baseDelay || 1000;
      const maxDelay = options.maxDelay || 30000;
      const exponential = options.exponential !== false;
      const retryOnOffline = options.retryOnOffline !== false;

      let lastError;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        // Wait for online if offline
        if (retryOnOffline && this.isOffline()) {
          await this.waitForOnline();
        }

        try {
          return await fn(attempt);
        } catch (error) {
          lastError = error;

          if (attempt < maxRetries) {
            // Calculate delay
            let delay = exponential
              ? baseDelay * Math.pow(2, attempt)
              : baseDelay;

            delay = Math.min(delay, maxDelay);

            // Add jitter
            if (options.jitter) {
              delay += Math.random() * delay * 0.1;
            }

            if (options.onRetry) {
              options.onRetry(attempt + 1, error, delay);
            }

            await this._delay(delay);
          }
        }
      }

      throw lastError;
    }

    _delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    // ═══════════════════════════════════════════════════════════
    // OFFLINE QUEUE
    // ═══════════════════════════════════════════════════════════

    queue(operation, options = {}) {
      const item = {
        id: this._generateId(),
        operation,
        options,
        timestamp: Date.now(),
        retries: 0,
      };

      this.syncQueue.push(item);
      this._saveQueue();

      // Try to process immediately if online
      if (this.isOnline()) {
        this._processQueue();
      }

      return item.id;
    }

    async _processQueue() {
      if (this.isProcessingQueue || this.isOffline()) return;

      this.isProcessingQueue = true;

      while (this.syncQueue.length > 0 && this.isOnline()) {
        const item = this.syncQueue[0];

        try {
          await item.operation();
          this.syncQueue.shift();
          this._saveQueue();
        } catch (error) {
          item.retries++;

          if (item.retries >= (item.options.maxRetries || 3)) {
            // Move to dead letter
            this.syncQueue.shift();
            this._saveQueue();

            if (item.options.onFail) {
              item.options.onFail(error, item);
            }
          } else {
            // Retry later
            await this._delay(1000 * item.retries);
          }
        }
      }

      this.isProcessingQueue = false;
    }

    _saveQueue() {
      // Save to localStorage for persistence
      try {
        const serializable = this.syncQueue.map((item) => ({
          id: item.id,
          timestamp: item.timestamp,
          retries: item.retries,
        }));
        localStorage.setItem(
          "bael-network-queue",
          JSON.stringify(serializable),
        );
      } catch (e) {}
    }

    getQueueLength() {
      return this.syncQueue.length;
    }

    clearQueue() {
      this.syncQueue = [];
      this._saveQueue();
    }

    // ═══════════════════════════════════════════════════════════
    // BANDWIDTH ESTIMATION
    // ═══════════════════════════════════════════════════════════

    async measureBandwidth(options = {}) {
      const testUrl = options.url || "/favicon.ico";
      const iterations = options.iterations || 3;
      const results = [];

      for (let i = 0; i < iterations; i++) {
        const start = performance.now();

        try {
          const response = await fetch(`${testUrl}?t=${Date.now()}`, {
            cache: "no-store",
          });

          const blob = await response.blob();
          const end = performance.now();

          const duration = (end - start) / 1000; // seconds
          const bytes = blob.size;
          const bitsPerSecond = (bytes * 8) / duration;

          results.push(bitsPerSecond);
        } catch (error) {
          results.push(0);
        }
      }

      const validResults = results.filter((r) => r > 0);

      if (validResults.length === 0) {
        return { bandwidth: 0, quality: "offline" };
      }

      const avgBandwidth =
        validResults.reduce((a, b) => a + b, 0) / validResults.length;

      return {
        bandwidth: Math.round(avgBandwidth),
        bandwidthMbps: (avgBandwidth / 1000000).toFixed(2),
        quality: this._bandwidthQuality(avgBandwidth),
      };
    }

    _bandwidthQuality(bps) {
      const mbps = bps / 1000000;
      if (mbps > 10) return "excellent";
      if (mbps > 5) return "good";
      if (mbps > 1) return "fair";
      if (mbps > 0) return "poor";
      return "offline";
    }

    // ═══════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════

    _generateId() {
      return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Execute only when online
    async whenOnline(fn) {
      if (this.isOffline()) {
        await this.waitForOnline();
      }
      return fn();
    }

    // Debounce network requests
    debounce(fn, delay = 300) {
      let timeoutId;
      let pendingPromise;

      return (...args) => {
        if (pendingPromise) {
          return pendingPromise;
        }

        clearTimeout(timeoutId);

        pendingPromise = new Promise((resolve, reject) => {
          timeoutId = setTimeout(async () => {
            try {
              const result = await fn(...args);
              resolve(result);
            } catch (error) {
              reject(error);
            } finally {
              pendingPromise = null;
            }
          }, delay);
        });

        return pendingPromise;
      };
    }
  }

  // Initialize
  window.BaelNetwork = new BaelNetwork();

  // Global shortcuts
  window.$network = window.BaelNetwork;
  window.$isOnline = () => window.BaelNetwork.isOnline();
  window.$isOffline = () => window.BaelNetwork.isOffline();

  console.log("🌐 Bael Network ready");
})();
