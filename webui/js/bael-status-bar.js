/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █  ███████╗████████╗ █████╗ ████████╗███████╗                              █
 * █  ██╔════╝╚══██╔══╝██╔══██╗╚══██╔══╝██╔════╝                              █
 * █  ███████╗   ██║   ███████║   ██║   ███████╗                              █
 * █  ╚════██║   ██║   ██╔══██║   ██║   ╚════██║                              █
 * █  ███████║   ██║   ██║  ██║   ██║   ███████║                              █
 * █  ╚══════╝   ╚═╝   ╚═╝  ╚═╝   ╚═╝   ╚══════╝                              █
 * █                                                                          █
 * █   BAEL STATUS BAR - System Status & Info Bar                             █
 * █   Persistent status bar with system info and quick stats                 █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  class BaelStatusBar {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = true;
      this.bar = null;

      this.stats = {
        messages: 0,
        tokens: 0,
        time: new Date(),
      };

      this.position = "bottom"; // 'top' or 'bottom'
    }

    async initialize() {
      console.log("📊 Bael Status Bar initializing...");

      this.loadStats();
      this.injectStyles();
      this.createBar();
      this.startUpdates();
      this.setupListeners();

      this.initialized = true;
      console.log("✅ BAEL STATUS BAR READY");

      return this;
    }

    loadStats() {
      try {
        const saved = localStorage.getItem("bael-statusbar-stats");
        if (saved) {
          this.stats = { ...this.stats, ...JSON.parse(saved) };
        }
      } catch (e) {}
    }

    saveStats() {
      try {
        localStorage.setItem(
          "bael-statusbar-stats",
          JSON.stringify(this.stats),
        );
      } catch (e) {}
    }

    injectStyles() {
      if (document.getElementById("bael-statusbar-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-statusbar-styles";
      styles.textContent = `
                .bael-statusbar {
                    position: fixed;
                    left: 0;
                    right: 0;
                    height: 28px;
                    background: #0a0a12;
                    border-top: 1px solid rgba(255, 255, 255, 0.06);
                    z-index: 9500;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 0 16px;
                    font-size: 11px;
                    font-family: 'JetBrains Mono', 'Fira Code', monospace;
                    transition: all 0.3s ease;
                }

                .bael-statusbar.bottom {
                    bottom: 0;
                }

                .bael-statusbar.top {
                    top: 0;
                    border-top: none;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
                }

                .bael-statusbar.hidden {
                    transform: translateY(100%);
                }

                .bael-statusbar.top.hidden {
                    transform: translateY(-100%);
                }

                .statusbar-section {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .statusbar-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    color: rgba(255, 255, 255, 0.5);
                    cursor: default;
                    padding: 2px 8px;
                    border-radius: 4px;
                    transition: all 0.2s;
                }

                .statusbar-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: rgba(255, 255, 255, 0.8);
                }

                .statusbar-item.clickable {
                    cursor: pointer;
                }

                .statusbar-item.active {
                    color: #22c55e;
                }

                .statusbar-item.warning {
                    color: #f59e0b;
                }

                .statusbar-item.error {
                    color: #ef4444;
                }

                .statusbar-icon {
                    font-size: 12px;
                }

                .statusbar-label {
                    font-size: 11px;
                }

                .statusbar-divider {
                    width: 1px;
                    height: 14px;
                    background: rgba(255, 255, 255, 0.1);
                }

                .statusbar-pill {
                    padding: 2px 8px;
                    border-radius: 10px;
                    background: rgba(139, 92, 246, 0.2);
                    color: #a78bfa;
                    font-size: 10px;
                    font-weight: 500;
                }

                body.has-statusbar {
                    padding-bottom: 28px;
                }

                body.has-statusbar-top {
                    padding-top: 28px;
                }
            `;
      document.head.appendChild(styles);
    }

    createBar() {
      this.bar = document.createElement("div");
      this.bar.className = `bael-statusbar ${this.position}`;
      this.bar.id = "bael-status-bar";

      this.renderBar();

      document.body.appendChild(this.bar);
      document.body.classList.add("has-statusbar");
    }

    renderBar() {
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      this.bar.innerHTML = `
                <div class="statusbar-section">
                    <div class="statusbar-item active" title="Bael Status">
                        <span class="statusbar-icon">🔮</span>
                        <span class="statusbar-label">Bael</span>
                        <span class="statusbar-pill">v${this.version}</span>
                    </div>
                    <div class="statusbar-divider"></div>
                    <div class="statusbar-item clickable" onclick="BaelStatusBar.showMetrics()" title="Messages Today">
                        <span class="statusbar-icon">💬</span>
                        <span class="statusbar-label">${this.stats.messages} msgs</span>
                    </div>
                    <div class="statusbar-item" title="Active Modules">
                        <span class="statusbar-icon">📦</span>
                        <span class="statusbar-label">${this.getModuleCount()} modules</span>
                    </div>
                </div>
                <div class="statusbar-section">
                    <div class="statusbar-item clickable" onclick="BaelStatusBar.showShortcuts()" title="Keyboard Shortcuts">
                        <span class="statusbar-icon">⌨️</span>
                        <span class="statusbar-label">Shortcuts</span>
                    </div>
                    <div class="statusbar-divider"></div>
                    <div class="statusbar-item ${this.getConnectionStatus()}" title="Connection Status">
                        <span class="statusbar-icon">${this.getConnectionIcon()}</span>
                        <span class="statusbar-label">${this.getConnectionLabel()}</span>
                    </div>
                    <div class="statusbar-divider"></div>
                    <div class="statusbar-item" title="Current Time">
                        <span class="statusbar-icon">🕐</span>
                        <span class="statusbar-label">${timeStr}</span>
                    </div>
                </div>
            `;
    }

    getModuleCount() {
      return Object.keys(window).filter((k) => k.startsWith("Bael")).length;
    }

    getConnectionStatus() {
      return navigator.onLine ? "active" : "error";
    }

    getConnectionIcon() {
      return navigator.onLine ? "🟢" : "🔴";
    }

    getConnectionLabel() {
      return navigator.onLine ? "Online" : "Offline";
    }

    startUpdates() {
      // Update every minute
      setInterval(() => {
        this.renderBar();
      }, 60000);

      // Listen for online/offline
      window.addEventListener("online", () => this.renderBar());
      window.addEventListener("offline", () => this.renderBar());
    }

    setupListeners() {
      // Count messages
      window.addEventListener("bael:message-sent", () => {
        this.stats.messages++;
        this.saveStats();
        this.renderBar();
      });

      // Reset daily
      const lastReset = localStorage.getItem("bael-statusbar-reset");
      const today = new Date().toDateString();
      if (lastReset !== today) {
        this.stats.messages = 0;
        localStorage.setItem("bael-statusbar-reset", today);
        this.saveStats();
      }
    }

    toggle() {
      this.visible = !this.visible;
      this.bar.classList.toggle("hidden", !this.visible);
    }

    setPosition(position) {
      this.position = position;
      this.bar.classList.remove("top", "bottom");
      this.bar.classList.add(position);

      document.body.classList.toggle("has-statusbar", position === "bottom");
      document.body.classList.toggle("has-statusbar-top", position === "top");
    }

    showMetrics() {
      if (window.BaelMetricsDashboard) {
        window.BaelMetricsDashboard.show();
      }
    }

    showShortcuts() {
      if (window.BaelHotkeyReference) {
        window.BaelHotkeyReference.show();
      }
    }

    updateStat(key, value) {
      this.stats[key] = value;
      this.saveStats();
      this.renderBar();
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  window.BaelStatusBar = new BaelStatusBar();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelStatusBar.initialize();
    });
  } else {
    window.BaelStatusBar.initialize();
  }

  console.log("📊 Bael Status Bar loaded");
})();
