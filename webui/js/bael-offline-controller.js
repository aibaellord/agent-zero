/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BAEL - LORD OF ALL
 * OFFLINE CONTROLLER - PWA & Offline Mode Management
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Client-side offline mode management:
 * - Service worker registration
 * - Offline detection & UI
 * - Cache management
 * - Background sync queue
 * - Install prompt
 *
 * @version 1.0.0
 */

(function () {
  "use strict";

  class BaelOfflineController {
    constructor() {
      // State
      this.isOnline = navigator.onLine;
      this.isInstalled = false;
      this.deferredPrompt = null;
      this.swRegistration = null;

      // Sync queue
      this.syncQueue = [];

      // Cache info
      this.cacheSize = 0;

      // UI
      this.banner = null;
      this.installPrompt = null;

      this.init();
    }

    async init() {
      await this.registerServiceWorker();
      this.detectInstallState();
      this.setupEventListeners();
      this.createUI();
      this.addStyles();
      this.updateOnlineStatus();
      console.log("📡 Bael Offline Controller initialized");
    }

    // ═════════════════════════════════════════════════════════════════
    // SERVICE WORKER
    // ═════════════════════════════════════════════════════════════════

    async registerServiceWorker() {
      if (!("serviceWorker" in navigator)) {
        console.warn("Service Worker not supported");
        return;
      }

      try {
        this.swRegistration = await navigator.serviceWorker.register(
          "/js/bael-service-worker.js",
          { scope: "/" },
        );

        console.log("Service Worker registered:", this.swRegistration.scope);

        // Check for updates
        this.swRegistration.addEventListener("updatefound", () => {
          const newWorker = this.swRegistration.installing;
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              this.showUpdateAvailable();
            }
          });
        });

        // Listen for messages from SW
        navigator.serviceWorker.addEventListener("message", (e) => {
          this.handleSWMessage(e.data);
        });
      } catch (error) {
        console.error("Service Worker registration failed:", error);
      }
    }

    handleSWMessage(data) {
      switch (data.type) {
        case "SYNC_COMPLETE":
          this.showNotification(
            "Sync complete! All pending messages have been sent.",
          );
          this.syncQueue = [];
          break;

        case "CACHE_SIZE":
          this.cacheSize = data.size;
          this.updateCacheSizeDisplay();
          break;

        case "NOTIFICATION_CLICK":
          // Handle notification click
          if (data.data?.chatId) {
            window.location.hash = `#chat/${data.data.chatId}`;
          }
          break;
      }
    }

    showUpdateAvailable() {
      const banner = document.createElement("div");
      banner.className = "bael-update-banner";
      banner.innerHTML = `
                <span>🆕 A new version of Bael is available!</span>
                <button id="update-now-btn">Update Now</button>
                <button id="update-later-btn">Later</button>
            `;
      document.body.appendChild(banner);

      banner.querySelector("#update-now-btn").addEventListener("click", () => {
        if (this.swRegistration?.waiting) {
          this.swRegistration.waiting.postMessage({ type: "SKIP_WAITING" });
        }
        window.location.reload();
      });

      banner
        .querySelector("#update-later-btn")
        .addEventListener("click", () => {
          banner.remove();
        });
    }

    // ═════════════════════════════════════════════════════════════════
    // ONLINE/OFFLINE DETECTION
    // ═════════════════════════════════════════════════════════════════

    setupEventListeners() {
      window.addEventListener("online", () => this.handleOnline());
      window.addEventListener("offline", () => this.handleOffline());

      // Install prompt
      window.addEventListener("beforeinstallprompt", (e) => {
        e.preventDefault();
        this.deferredPrompt = e;
        this.showInstallPrompt();
      });

      // App installed
      window.addEventListener("appinstalled", () => {
        this.isInstalled = true;
        this.deferredPrompt = null;
        this.hideInstallPrompt();
        this.showNotification("Bael has been installed! 🎉");
      });
    }

    handleOnline() {
      this.isOnline = true;
      this.updateOnlineStatus();
      this.showNotification("Back online! Syncing pending data...");
      this.triggerSync();
    }

    handleOffline() {
      this.isOnline = false;
      this.updateOnlineStatus();
      this.showNotification(
        "You are offline. Changes will sync when reconnected.",
        "warning",
      );
    }

    updateOnlineStatus() {
      document.body.classList.toggle("is-offline", !this.isOnline);

      if (this.banner) {
        if (this.isOnline) {
          this.banner.classList.remove("visible");
        } else {
          this.banner.classList.add("visible");
        }
      }

      this.emit("status-change", { online: this.isOnline });
    }

    // ═════════════════════════════════════════════════════════════════
    // SYNC QUEUE
    // ═════════════════════════════════════════════════════════════════

    queueForSync(type, data) {
      const item = {
        id: Date.now() + "_" + Math.random().toString(36).substr(2, 9),
        type,
        data,
        timestamp: new Date(),
        retries: 0,
      };

      this.syncQueue.push(item);
      this.saveSyncQueue();

      // Store in IndexedDB for service worker
      this.storeInIndexedDB("pending-messages", item);

      if (this.isOnline) {
        this.triggerSync();
      }

      return item.id;
    }

    async triggerSync() {
      if (!this.swRegistration) return;

      try {
        await this.swRegistration.sync.register("sync-messages");
      } catch (e) {
        // Background sync not supported, do manual sync
        this.manualSync();
      }
    }

    async manualSync() {
      if (!this.isOnline || this.syncQueue.length === 0) return;

      for (const item of [...this.syncQueue]) {
        try {
          await this.processQueueItem(item);
          this.syncQueue = this.syncQueue.filter((i) => i.id !== item.id);
        } catch (e) {
          item.retries++;
          if (item.retries >= 3) {
            this.syncQueue = this.syncQueue.filter((i) => i.id !== item.id);
            this.emit("sync-failed", item);
          }
        }
      }

      this.saveSyncQueue();
    }

    async processQueueItem(item) {
      switch (item.type) {
        case "message":
          await fetch("/api/message", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(item.data),
          });
          break;
        // Add more types as needed
      }
    }

    saveSyncQueue() {
      localStorage.setItem("bael_sync_queue", JSON.stringify(this.syncQueue));
    }

    loadSyncQueue() {
      try {
        this.syncQueue = JSON.parse(
          localStorage.getItem("bael_sync_queue") || "[]",
        );
      } catch (e) {
        this.syncQueue = [];
      }
    }

    async storeInIndexedDB(store, data) {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open("bael-offline", 1);

        request.onerror = () => reject(request.error);

        request.onsuccess = () => {
          const db = request.result;
          const tx = db.transaction(store, "readwrite");
          tx.objectStore(store).put(data);
          tx.oncomplete = () => resolve();
          tx.onerror = () => reject(tx.error);
        };

        request.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains("pending-messages")) {
            db.createObjectStore("pending-messages", { keyPath: "id" });
          }
        };
      });
    }

    // ═════════════════════════════════════════════════════════════════
    // INSTALL PROMPT
    // ═════════════════════════════════════════════════════════════════

    detectInstallState() {
      // Check if running as installed PWA
      if (
        window.matchMedia("(display-mode: standalone)").matches ||
        window.navigator.standalone
      ) {
        this.isInstalled = true;
      }
    }

    showInstallPrompt() {
      if (this.isInstalled || !this.deferredPrompt) return;

      // Don't show immediately, wait for user engagement
      const showDelay = parseInt(
        localStorage.getItem("bael_install_delay") || "3",
      );
      const visits = parseInt(localStorage.getItem("bael_visits") || "0") + 1;
      localStorage.setItem("bael_visits", visits.toString());

      if (visits < showDelay) return;
      if (localStorage.getItem("bael_install_dismissed")) return;

      this.createInstallPrompt();
      setTimeout(() => {
        if (this.installPrompt) {
          this.installPrompt.classList.add("visible");
        }
      }, 5000);
    }

    createInstallPrompt() {
      if (document.getElementById("bael-install-prompt")) return;

      const prompt = document.createElement("div");
      prompt.id = "bael-install-prompt";
      prompt.className = "bael-install-prompt";
      prompt.innerHTML = `
                <div class="install-icon">🔥</div>
                <div class="install-content">
                    <h4>Install Bael</h4>
                    <p>Install for faster access and offline support</p>
                </div>
                <div class="install-actions">
                    <button class="install-btn" id="install-accept">Install</button>
                    <button class="install-dismiss" id="install-dismiss">Not Now</button>
                </div>
            `;
      document.body.appendChild(prompt);
      this.installPrompt = prompt;

      prompt
        .querySelector("#install-accept")
        .addEventListener("click", () => this.installApp());
      prompt
        .querySelector("#install-dismiss")
        .addEventListener("click", () => this.dismissInstall());
    }

    async installApp() {
      if (!this.deferredPrompt) return;

      this.deferredPrompt.prompt();
      const result = await this.deferredPrompt.userChoice;

      if (result.outcome === "accepted") {
        console.log("PWA installed");
      }

      this.deferredPrompt = null;
      this.hideInstallPrompt();
    }

    dismissInstall() {
      localStorage.setItem("bael_install_dismissed", "true");
      this.hideInstallPrompt();
    }

    hideInstallPrompt() {
      if (this.installPrompt) {
        this.installPrompt.classList.remove("visible");
        setTimeout(() => {
          this.installPrompt?.remove();
          this.installPrompt = null;
        }, 300);
      }
    }

    // ═════════════════════════════════════════════════════════════════
    // CACHE MANAGEMENT
    // ═════════════════════════════════════════════════════════════════

    async getCacheSize() {
      if (this.swRegistration?.active) {
        this.swRegistration.active.postMessage({ type: "GET_CACHE_SIZE" });
      }
    }

    updateCacheSizeDisplay() {
      const el = document.getElementById("cache-size-display");
      if (el) {
        el.textContent = this.formatBytes(this.cacheSize);
      }
    }

    async clearCache() {
      if (this.swRegistration?.active) {
        this.swRegistration.active.postMessage({ type: "CLEAR_CACHE" });
        this.showNotification("Cache cleared");
      }
    }

    async precacheUrls(urls) {
      if (this.swRegistration?.active) {
        this.swRegistration.active.postMessage({ type: "CACHE_URLS", urls });
      }
    }

    // ═════════════════════════════════════════════════════════════════
    // UI
    // ═════════════════════════════════════════════════════════════════

    createUI() {
      // Offline banner
      const banner = document.createElement("div");
      banner.id = "bael-offline-banner";
      banner.className = "bael-offline-banner";
      banner.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 1l22 22M16.72 11.06A10.94 10.94 0 0119 12.55M5 12.55a10.94 10.94 0 015.17-2.39"/>
                    <path d="M10.71 5.05A16 16 0 0122.58 9M1.42 9a15.91 15.91 0 014.7-2.88"/>
                    <path d="M8.53 16.11a6 6 0 016.95 0M12 20h.01"/>
                </svg>
                <span>You are offline</span>
                <button id="offline-retry-btn">Retry</button>
            `;
      document.body.appendChild(banner);
      this.banner = banner;

      banner
        .querySelector("#offline-retry-btn")
        .addEventListener("click", () => {
          if (navigator.onLine) {
            this.handleOnline();
          } else {
            this.showNotification(
              "Still offline. Please check your connection.",
              "warning",
            );
          }
        });
    }

    addStyles() {
      if (document.getElementById("bael-offline-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-offline-styles";
      styles.textContent = `
                /* Offline Banner */
                .bael-offline-banner {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 40px;
                    background: linear-gradient(90deg, #ef4444, #dc2626);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    z-index: 100100;
                    transform: translateY(-100%);
                    transition: transform 0.3s ease;
                    font-size: 13px;
                }

                .bael-offline-banner.visible {
                    transform: translateY(0);
                }

                .bael-offline-banner svg {
                    width: 18px;
                    height: 18px;
                }

                .bael-offline-banner button {
                    padding: 4px 12px;
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    border-radius: 4px;
                    color: white;
                    cursor: pointer;
                    font-size: 12px;
                    margin-left: 10px;
                }

                .bael-offline-banner button:hover {
                    background: rgba(255, 255, 255, 0.3);
                }

                /* Body offset when offline */
                body.is-offline {
                    padding-top: 40px;
                }

                /* Install Prompt */
                .bael-install-prompt {
                    position: fixed;
                    bottom: 20px;
                    left: 50%;
                    transform: translateX(-50%) translateY(120%);
                    background: var(--color-panel, #12121a);
                    border: 1px solid var(--color-border, #2a2a3a);
                    border-radius: 16px;
                    padding: 16px 24px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    z-index: 100050;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                }

                .bael-install-prompt.visible {
                    transform: translateX(-50%) translateY(0);
                }

                .install-icon {
                    font-size: 32px;
                }

                .install-content h4 {
                    margin: 0 0 4px 0;
                    font-size: 15px;
                    color: var(--color-text, #fff);
                }

                .install-content p {
                    margin: 0;
                    font-size: 12px;
                    color: var(--color-text-muted, #666);
                }

                .install-actions {
                    display: flex;
                    gap: 8px;
                }

                .install-btn {
                    padding: 8px 20px;
                    background: var(--color-primary, #ff3366);
                    border: none;
                    border-radius: 8px;
                    color: white;
                    font-size: 13px;
                    cursor: pointer;
                }

                .install-dismiss {
                    padding: 8px 16px;
                    background: transparent;
                    border: 1px solid var(--color-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--color-text-muted, #666);
                    font-size: 13px;
                    cursor: pointer;
                }

                /* Update Banner */
                .bael-update-banner {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    height: 50px;
                    background: linear-gradient(90deg, #3b82f6, #8b5cf6);
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 16px;
                    z-index: 100100;
                    animation: slideUp 0.3s ease;
                }

                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }

                .bael-update-banner button {
                    padding: 6px 16px;
                    border: none;
                    border-radius: 6px;
                    font-size: 12px;
                    cursor: pointer;
                }

                .bael-update-banner button:first-of-type {
                    background: white;
                    color: #3b82f6;
                }

                .bael-update-banner button:last-of-type {
                    background: rgba(255, 255, 255, 0.2);
                    color: white;
                }

                /* Offline indicators */
                .is-offline .requires-online {
                    opacity: 0.5;
                    pointer-events: none;
                }

                .is-offline .requires-online::after {
                    content: 'Requires internet';
                    position: absolute;
                    font-size: 10px;
                    color: #ef4444;
                }
            `;
      document.head.appendChild(styles);
    }

    // ═════════════════════════════════════════════════════════════════
    // UTILITIES
    // ═════════════════════════════════════════════════════════════════

    formatBytes(bytes) {
      if (bytes === 0) return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    }

    showNotification(message, type = "info") {
      if (window.BaelNotifications) {
        window.BaelNotifications.show(message, type);
      } else {
        console.log(`[${type}] ${message}`);
      }
    }

    emit(event, data) {
      window.dispatchEvent(
        new CustomEvent(`bael:offline:${event}`, { detail: data }),
      );
    }

    // ═════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═════════════════════════════════════════════════════════════════

    get online() {
      return this.isOnline;
    }

    get installed() {
      return this.isInstalled;
    }

    get pendingSync() {
      return this.syncQueue.length;
    }

    async prefetch(urls) {
      await this.precacheUrls(urls);
    }
  }

  // Initialize
  window.BaelOffline = new BaelOfflineController();
})();
