/**
 * BAEL Network Monitor - Connection Status & Quality
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete network monitoring with:
 * - Online/offline detection
 * - Connection quality
 * - Bandwidth estimation
 * - Latency measurement
 * - Reconnection handling
 * - Network type detection
 */

(function () {
  "use strict";

  class BaelNetworkMonitor {
    constructor() {
      this.isOnline = navigator.onLine;
      this.quality = "unknown";
      this.type = "unknown";
      this.latency = null;
      this.bandwidth = null;
      this.lastCheck = null;
      this.callbacks = {
        online: [],
        offline: [],
        change: [],
      };
      this.checkInterval = null;
      this.init();
    }

    init() {
      this.detectConnectionInfo();
      this.bindEvents();
      this.startMonitoring();
      this.createIndicator();
      console.log("📡 Bael Network Monitor initialized");
    }

    // Detect connection info
    detectConnectionInfo() {
      const connection =
        navigator.connection ||
        navigator.mozConnection ||
        navigator.webkitConnection;

      if (connection) {
        this.type = connection.effectiveType || connection.type || "unknown";
        this.bandwidth = connection.downlink || null; // Mbps
        this.updateQuality();

        connection.addEventListener?.("change", () => {
          this.type = connection.effectiveType || connection.type || "unknown";
          this.bandwidth = connection.downlink || null;
          this.updateQuality();
          this.notify("change", this.getStatus());
        });
      }
    }

    // Update connection quality assessment
    updateQuality() {
      if (this.type === "4g" && this.bandwidth > 10) {
        this.quality = "excellent";
      } else if (
        this.type === "4g" ||
        (this.type === "3g" && this.bandwidth > 1.5)
      ) {
        this.quality = "good";
      } else if (this.type === "3g" || this.type === "wifi") {
        this.quality = "moderate";
      } else if (this.type === "2g" || this.type === "slow-2g") {
        this.quality = "poor";
      } else {
        this.quality = "unknown";
      }
    }

    // Bind network events
    bindEvents() {
      window.addEventListener("online", () => {
        this.isOnline = true;
        this.notify("online");
        this.notify("change", this.getStatus());
        this.showNotification("Connected", "success");
        this.updateIndicator();
      });

      window.addEventListener("offline", () => {
        this.isOnline = false;
        this.notify("offline");
        this.notify("change", this.getStatus());
        this.showNotification("No internet connection", "error");
        this.updateIndicator();
      });
    }

    // Start monitoring
    startMonitoring() {
      // Check latency every 30 seconds
      this.checkInterval = setInterval(() => {
        this.measureLatency();
      }, 30000);

      // Initial check
      this.measureLatency();
    }

    // Stop monitoring
    stopMonitoring() {
      if (this.checkInterval) {
        clearInterval(this.checkInterval);
        this.checkInterval = null;
      }
    }

    // Measure latency
    async measureLatency() {
      if (!this.isOnline) {
        this.latency = null;
        return;
      }

      try {
        const start = performance.now();
        await fetch("/favicon.ico", {
          method: "HEAD",
          cache: "no-store",
          mode: "no-cors",
        });
        this.latency = Math.round(performance.now() - start);
        this.lastCheck = new Date();

        // Update quality based on latency too
        if (this.latency < 50) {
          this.quality = "excellent";
        } else if (this.latency < 100) {
          this.quality = "good";
        } else if (this.latency < 300) {
          this.quality = "moderate";
        } else {
          this.quality = "poor";
        }

        this.updateIndicator();
      } catch (e) {
        this.latency = null;
      }
    }

    // Subscribe to events
    on(event, callback) {
      if (this.callbacks[event]) {
        this.callbacks[event].push(callback);
      }
      return () => {
        const index = this.callbacks[event]?.indexOf(callback);
        if (index > -1) {
          this.callbacks[event].splice(index, 1);
        }
      };
    }

    // Notify subscribers
    notify(event, data) {
      this.callbacks[event]?.forEach((cb) => {
        try {
          cb(data || this.getStatus());
        } catch (e) {
          console.error("Network callback error:", e);
        }
      });
    }

    // Get current status
    getStatus() {
      return {
        online: this.isOnline,
        quality: this.quality,
        type: this.type,
        latency: this.latency,
        bandwidth: this.bandwidth,
        lastCheck: this.lastCheck,
      };
    }

    // Show notification
    showNotification(message, type) {
      if (window.BaelToast) {
        window.BaelToast[type]?.(message, { duration: 3000 });
      }
    }

    // Create status indicator
    createIndicator() {
      this.indicator = document.createElement("div");
      this.indicator.id = "bael-network-indicator";
      this.indicator.innerHTML = `
                <span class="network-icon">📡</span>
                <span class="network-status"></span>
            `;

      // Initially hidden
      this.indicator.style.display = "none";

      document.body.appendChild(this.indicator);
      this.addStyles();
      this.updateIndicator();
    }

    // Update indicator
    updateIndicator() {
      if (!this.indicator) return;

      const statusEl = this.indicator.querySelector(".network-status");

      if (!this.isOnline) {
        this.indicator.classList.add("offline");
        this.indicator.classList.remove("online");
        this.indicator.style.display = "flex";
        statusEl.textContent = "Offline";
      } else {
        this.indicator.classList.remove("offline");
        this.indicator.classList.add("online");

        // Hide indicator when online with good connection
        if (this.quality === "excellent" || this.quality === "good") {
          setTimeout(() => {
            if (this.isOnline) {
              this.indicator.style.display = "none";
            }
          }, 2000);
        }

        statusEl.textContent = this.latency ? `${this.latency}ms` : "Online";
      }

      this.indicator.setAttribute("data-quality", this.quality);
    }

    // Add styles
    addStyles() {
      const style = document.createElement("style");
      style.textContent = `
                #bael-network-indicator {
                    position: fixed;
                    bottom: 20px;
                    left: 20px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 14px;
                    background: var(--bael-surface, #252525);
                    border-radius: 20px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    z-index: 99999;
                    font-size: 12px;
                    transition: all 0.3s;
                }

                #bael-network-indicator.offline {
                    background: #e74c3c;
                    color: white;
                }

                #bael-network-indicator.online {
                    background: var(--bael-surface, #252525);
                    color: var(--bael-text, #fff);
                }

                #bael-network-indicator[data-quality="excellent"] .network-icon { color: #2ecc71; }
                #bael-network-indicator[data-quality="good"] .network-icon { color: #27ae60; }
                #bael-network-indicator[data-quality="moderate"] .network-icon { color: #f39c12; }
                #bael-network-indicator[data-quality="poor"] .network-icon { color: #e74c3c; }

                .network-icon {
                    font-size: 14px;
                }

                .network-status {
                    font-weight: 500;
                }
            `;
      document.head.appendChild(style);
    }

    // Show indicator
    show() {
      if (this.indicator) {
        this.indicator.style.display = "flex";
      }
    }

    // Hide indicator
    hide() {
      if (this.indicator) {
        this.indicator.style.display = "none";
      }
    }

    // Check if online
    checkOnline() {
      return this.isOnline;
    }

    // Wait for online
    waitForOnline(timeout = 30000) {
      return new Promise((resolve, reject) => {
        if (this.isOnline) {
          resolve(true);
          return;
        }

        const timeoutId = setTimeout(() => {
          cleanup();
          reject(new Error("Network timeout"));
        }, timeout);

        const cleanup = this.on("online", () => {
          clearTimeout(timeoutId);
          cleanup();
          resolve(true);
        });
      });
    }

    // Retry with network awareness
    async retryWhenOnline(fn, options = {}) {
      const { maxRetries = 3, retryDelay = 1000 } = options;

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          if (!this.isOnline) {
            await this.waitForOnline();
          }
          return await fn();
        } catch (error) {
          if (attempt < maxRetries - 1) {
            await new Promise((r) =>
              setTimeout(r, retryDelay * Math.pow(2, attempt)),
            );
          } else {
            throw error;
          }
        }
      }
    }
  }

  // Initialize
  window.BaelNetwork = new BaelNetworkMonitor();
})();
