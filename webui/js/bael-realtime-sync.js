/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BAEL - LORD OF ALL
 * REAL-TIME SYNC SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Cross-device synchronization:
 * - Cloud storage integration
 * - Device management
 * - Conflict resolution
 * - Sync history
 * - Offline queue
 *
 * @version 1.0.0
 */

(function () {
  "use strict";

  class BaelRealTimeSync {
    constructor() {
      // Sync state
      this.isEnabled = false;
      this.syncStatus = "idle"; // idle, syncing, error
      this.lastSync = null;
      this.devices = new Map();
      this.currentDevice = null;

      // Sync configuration
      this.config = {
        autoSync: true,
        syncInterval: 30000, // 30 seconds
        conflictResolution: "latest", // latest, manual, merge
        syncCategories: ["settings", "chats", "memory", "themes", "workflows"],
      };

      // Sync queue for offline changes
      this.pendingChanges = [];
      this.syncHistory = [];

      // WebSocket simulation
      this.ws = null;
      this.reconnectAttempts = 0;

      // UI
      this.panel = null;
      this.isVisible = false;
      this.statusIndicator = null;

      // Timer
      this.syncTimer = null;

      this.init();
    }

    init() {
      this.loadConfig();
      this.detectCurrentDevice();
      this.createUI();
      this.createStatusIndicator();
      this.addStyles();
      this.bindEvents();
      this.startAutoSync();
      console.log("🔄 Bael Real-Time Sync initialized");
    }

    // ═════════════════════════════════════════════════════════════════
    // DEVICE MANAGEMENT
    // ═════════════════════════════════════════════════════════════════

    detectCurrentDevice() {
      const ua = navigator.userAgent;
      let deviceType = "desktop";
      let deviceName = "Unknown Device";

      if (/Mobile|Android|iPhone|iPad/.test(ua)) {
        deviceType = /iPad/.test(ua) ? "tablet" : "mobile";
      }

      if (/Windows/.test(ua)) deviceName = "Windows PC";
      else if (/Mac/.test(ua)) deviceName = "Mac";
      else if (/Linux/.test(ua)) deviceName = "Linux";
      else if (/iPhone/.test(ua)) deviceName = "iPhone";
      else if (/iPad/.test(ua)) deviceName = "iPad";
      else if (/Android/.test(ua)) deviceName = "Android Device";

      const saved = localStorage.getItem("bael_device_id");
      const deviceId = saved || "dev_" + Date.now().toString(36);

      if (!saved) {
        localStorage.setItem("bael_device_id", deviceId);
      }

      this.currentDevice = {
        id: deviceId,
        name: deviceName,
        type: deviceType,
        browser: this.detectBrowser(),
        lastActive: new Date(),
        isOnline: navigator.onLine,
      };

      this.devices.set(deviceId, this.currentDevice);
      this.saveDevices();
    }

    detectBrowser() {
      const ua = navigator.userAgent;
      if (/Chrome/.test(ua) && !/Edge/.test(ua)) return "Chrome";
      if (/Firefox/.test(ua)) return "Firefox";
      if (/Safari/.test(ua) && !/Chrome/.test(ua)) return "Safari";
      if (/Edge/.test(ua)) return "Edge";
      return "Unknown";
    }

    renameDevice(deviceId, newName) {
      const device = this.devices.get(deviceId);
      if (device) {
        device.name = newName;
        this.saveDevices();
        this.updateUI();
      }
    }

    removeDevice(deviceId) {
      if (deviceId === this.currentDevice.id) {
        window.BaelNotifications?.show(
          "Cannot remove current device",
          "warning",
        );
        return;
      }
      this.devices.delete(deviceId);
      this.saveDevices();
      this.updateUI();
    }

    getDeviceIcon(type) {
      const icons = {
        desktop: "🖥️",
        mobile: "📱",
        tablet: "📲",
      };
      return icons[type] || "💻";
    }

    loadDevices() {
      try {
        const saved = JSON.parse(
          localStorage.getItem("bael_sync_devices") || "{}",
        );
        Object.entries(saved).forEach(([id, device]) => {
          device.lastActive = new Date(device.lastActive);
          this.devices.set(id, device);
        });
      } catch (e) {
        console.warn("Failed to load devices:", e);
      }
    }

    saveDevices() {
      localStorage.setItem(
        "bael_sync_devices",
        JSON.stringify(Object.fromEntries(this.devices)),
      );
    }

    // ═════════════════════════════════════════════════════════════════
    // SYNC ENGINE
    // ═════════════════════════════════════════════════════════════════

    async sync(force = false) {
      if (this.syncStatus === "syncing" && !force) return;

      this.syncStatus = "syncing";
      this.updateStatusIndicator();
      this.emit("sync-started");

      try {
        // Collect local changes
        const localData = this.collectLocalData();

        // Get remote data (simulated)
        const remoteData = await this.fetchRemoteData();

        // Resolve conflicts
        const mergedData = this.resolveConflicts(localData, remoteData);

        // Apply merged data
        this.applyData(mergedData);

        // Push changes (simulated)
        await this.pushChanges(mergedData);

        // Update sync state
        this.lastSync = new Date();
        this.syncStatus = "idle";
        this.pendingChanges = [];

        // Record in history
        this.addToHistory("sync", "Full sync completed");

        this.updateStatusIndicator();
        this.updateUI();
        this.emit("sync-completed", { timestamp: this.lastSync });

        window.BaelNotifications?.show("Sync completed", "success");
      } catch (error) {
        this.syncStatus = "error";
        this.addToHistory("error", error.message);
        this.updateStatusIndicator();
        window.BaelNotifications?.show(
          "Sync failed: " + error.message,
          "error",
        );
      }
    }

    collectLocalData() {
      const data = {};

      this.config.syncCategories.forEach((category) => {
        switch (category) {
          case "settings":
            data.settings = this.collectSettings();
            break;
          case "chats":
            data.chats = this.collectChats();
            break;
          case "memory":
            data.memory = this.collectMemory();
            break;
          case "themes":
            data.themes = this.collectThemes();
            break;
          case "workflows":
            data.workflows = this.collectWorkflows();
            break;
        }
      });

      data._meta = {
        deviceId: this.currentDevice.id,
        timestamp: new Date(),
        version: "1.0.0",
      };

      return data;
    }

    collectSettings() {
      const settings = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith("bael_") && !key.includes("sync")) {
          settings[key] = localStorage.getItem(key);
        }
      }
      return settings;
    }

    collectChats() {
      return JSON.parse(localStorage.getItem("bael_chat_history") || "[]");
    }

    collectMemory() {
      return JSON.parse(localStorage.getItem("bael_memory") || "{}");
    }

    collectThemes() {
      return JSON.parse(localStorage.getItem("bael_custom_themes") || "{}");
    }

    collectWorkflows() {
      return JSON.parse(localStorage.getItem("bael_workflows") || "{}");
    }

    async fetchRemoteData() {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // In production, this would fetch from cloud storage
      const cached = localStorage.getItem("bael_remote_cache");
      return cached ? JSON.parse(cached) : {};
    }

    resolveConflicts(localData, remoteData) {
      if (!remoteData || Object.keys(remoteData).length === 0) {
        return localData;
      }

      const merged = {};

      switch (this.config.conflictResolution) {
        case "latest":
          // Use most recent timestamp
          const localTime = localData._meta?.timestamp || 0;
          const remoteTime = remoteData._meta?.timestamp || 0;
          return new Date(localTime) > new Date(remoteTime)
            ? localData
            : remoteData;

        case "merge":
          // Deep merge
          Object.keys({ ...localData, ...remoteData }).forEach((key) => {
            if (key === "_meta") {
              merged[key] = localData[key];
            } else if (
              typeof localData[key] === "object" &&
              typeof remoteData[key] === "object"
            ) {
              merged[key] = { ...remoteData[key], ...localData[key] };
            } else {
              merged[key] = localData[key] ?? remoteData[key];
            }
          });
          return merged;

        case "manual":
        default:
          // For now, prefer local
          return localData;
      }
    }

    applyData(data) {
      if (data.settings) {
        Object.entries(data.settings).forEach(([key, value]) => {
          localStorage.setItem(key, value);
        });
      }

      if (data.chats) {
        localStorage.setItem("bael_chat_history", JSON.stringify(data.chats));
      }

      if (data.memory) {
        localStorage.setItem("bael_memory", JSON.stringify(data.memory));
      }

      if (data.themes) {
        localStorage.setItem("bael_custom_themes", JSON.stringify(data.themes));
      }

      if (data.workflows) {
        localStorage.setItem("bael_workflows", JSON.stringify(data.workflows));
      }
    }

    async pushChanges(data) {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      // In production, this would push to cloud storage
      localStorage.setItem("bael_remote_cache", JSON.stringify(data));
    }

    queueChange(category, data) {
      this.pendingChanges.push({
        id: Date.now().toString(36),
        category,
        data,
        timestamp: new Date(),
        deviceId: this.currentDevice.id,
      });

      this.saveQueue();
      this.updateStatusIndicator();
    }

    addToHistory(type, message) {
      this.syncHistory.unshift({
        id: Date.now().toString(36),
        type,
        message,
        timestamp: new Date(),
        deviceId: this.currentDevice.id,
      });

      // Keep last 50 entries
      if (this.syncHistory.length > 50) {
        this.syncHistory = this.syncHistory.slice(0, 50);
      }

      this.saveSyncHistory();
    }

    // ═════════════════════════════════════════════════════════════════
    // AUTO SYNC
    // ═════════════════════════════════════════════════════════════════

    startAutoSync() {
      if (!this.config.autoSync) return;

      this.stopAutoSync();
      this.syncTimer = setInterval(() => {
        if (navigator.onLine && this.pendingChanges.length > 0) {
          this.sync();
        }
      }, this.config.syncInterval);
    }

    stopAutoSync() {
      if (this.syncTimer) {
        clearInterval(this.syncTimer);
        this.syncTimer = null;
      }
    }

    // ═════════════════════════════════════════════════════════════════
    // UI
    // ═════════════════════════════════════════════════════════════════

    createUI() {
      const panel = document.createElement("div");
      panel.id = "bael-sync-panel";
      panel.className = "bael-sync-panel";
      panel.innerHTML = this.renderPanel();
      document.body.appendChild(panel);
      this.panel = panel;
    }

    createStatusIndicator() {
      const indicator = document.createElement("div");
      indicator.id = "bael-sync-status";
      indicator.className = "bael-sync-status";
      indicator.innerHTML = `
                <span class="sync-icon">🔄</span>
                <span class="sync-text">Synced</span>
            `;
      indicator.addEventListener("click", () => this.toggle());
      document.body.appendChild(indicator);
      this.statusIndicator = indicator;
    }

    renderPanel() {
      const devicesList = Array.from(this.devices.values());

      return `
                <div class="sync-header">
                    <div class="sync-title">
                        <span class="sync-title-icon">🔄</span>
                        <span>Real-Time Sync</span>
                    </div>
                    <button class="sync-close" id="sync-close">×</button>
                </div>

                <div class="sync-content">
                    <div class="sync-section">
                        <div class="sync-main-status ${this.syncStatus}">
                            <div class="sync-status-icon">
                                ${
                                  this.syncStatus === "syncing"
                                    ? "⏳"
                                    : this.syncStatus === "error"
                                      ? "❌"
                                      : "✅"
                                }
                            </div>
                            <div class="sync-status-info">
                                <span class="sync-status-text">
                                    ${
                                      this.syncStatus === "syncing"
                                        ? "Syncing..."
                                        : this.syncStatus === "error"
                                          ? "Sync Error"
                                          : "Synced"
                                    }
                                </span>
                                ${
                                  this.lastSync
                                    ? `
                                    <span class="sync-last">
                                        Last: ${new Date(this.lastSync).toLocaleString()}
                                    </span>
                                `
                                    : ""
                                }
                            </div>
                            <button class="sync-btn primary" id="sync-now"
                                    ${this.syncStatus === "syncing" ? "disabled" : ""}>
                                Sync Now
                            </button>
                        </div>

                        ${
                          this.pendingChanges.length > 0
                            ? `
                            <div class="sync-pending">
                                <span class="sync-pending-icon">📤</span>
                                ${this.pendingChanges.length} pending change(s)
                            </div>
                        `
                            : ""
                        }
                    </div>

                    <div class="sync-section">
                        <h4>This Device</h4>
                        <div class="sync-device current">
                            <span class="device-icon">${this.getDeviceIcon(this.currentDevice.type)}</span>
                            <div class="device-info">
                                <input type="text" class="device-name-input"
                                       value="${this.currentDevice.name}"
                                       data-id="${this.currentDevice.id}">
                                <span class="device-meta">
                                    ${this.currentDevice.browser} • ${this.currentDevice.isOnline ? "Online" : "Offline"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="sync-section">
                        <h4>Other Devices (${devicesList.length - 1})</h4>
                        <div class="sync-devices">
                            ${
                              devicesList
                                .filter((d) => d.id !== this.currentDevice.id)
                                .map(
                                  (device) => `
                                <div class="sync-device" data-id="${device.id}">
                                    <span class="device-icon">${this.getDeviceIcon(device.type)}</span>
                                    <div class="device-info">
                                        <span class="device-name">${device.name}</span>
                                        <span class="device-meta">
                                            Last active: ${new Date(device.lastActive).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <button class="device-remove" data-id="${device.id}">🗑️</button>
                                </div>
                            `,
                                )
                                .join("") ||
                              '<p class="sync-empty">No other devices linked</p>'
                            }
                        </div>
                    </div>

                    <div class="sync-section">
                        <h4>Sync Settings</h4>
                        <div class="sync-settings">
                            <label class="sync-toggle">
                                <input type="checkbox" id="sync-auto"
                                       ${this.config.autoSync ? "checked" : ""}>
                                <span>Auto-sync enabled</span>
                            </label>

                            <div class="sync-option">
                                <span>Sync interval</span>
                                <select id="sync-interval">
                                    <option value="10000" ${this.config.syncInterval === 10000 ? "selected" : ""}>10 seconds</option>
                                    <option value="30000" ${this.config.syncInterval === 30000 ? "selected" : ""}>30 seconds</option>
                                    <option value="60000" ${this.config.syncInterval === 60000 ? "selected" : ""}>1 minute</option>
                                    <option value="300000" ${this.config.syncInterval === 300000 ? "selected" : ""}>5 minutes</option>
                                </select>
                            </div>

                            <div class="sync-option">
                                <span>Conflict resolution</span>
                                <select id="sync-conflict">
                                    <option value="latest" ${this.config.conflictResolution === "latest" ? "selected" : ""}>Use latest</option>
                                    <option value="merge" ${this.config.conflictResolution === "merge" ? "selected" : ""}>Merge changes</option>
                                    <option value="manual" ${this.config.conflictResolution === "manual" ? "selected" : ""}>Ask me</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="sync-section">
                        <h4>Sync Categories</h4>
                        <div class="sync-categories">
                            ${[
                              "settings",
                              "chats",
                              "memory",
                              "themes",
                              "workflows",
                            ]
                              .map(
                                (cat) => `
                                <label class="sync-category">
                                    <input type="checkbox" data-category="${cat}"
                                           ${this.config.syncCategories.includes(cat) ? "checked" : ""}>
                                    <span>${cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                                </label>
                            `,
                              )
                              .join("")}
                        </div>
                    </div>

                    <div class="sync-section">
                        <h4>Sync History</h4>
                        <div class="sync-history">
                            ${
                              this.syncHistory
                                .slice(0, 10)
                                .map(
                                  (entry) => `
                                <div class="sync-history-item ${entry.type}">
                                    <span class="history-time">${new Date(entry.timestamp).toLocaleTimeString()}</span>
                                    <span class="history-msg">${entry.message}</span>
                                </div>
                            `,
                                )
                                .join("") ||
                              '<p class="sync-empty">No sync history</p>'
                            }
                        </div>
                    </div>
                </div>
            `;
    }

    updateUI() {
      if (!this.panel) return;
      this.panel.innerHTML = this.renderPanel();
      this.bindPanelEvents();
    }

    updateStatusIndicator() {
      if (!this.statusIndicator) return;

      const icons = {
        idle: "✅",
        syncing: "⏳",
        error: "❌",
      };

      const texts = {
        idle:
          this.pendingChanges.length > 0
            ? `${this.pendingChanges.length} pending`
            : "Synced",
        syncing: "Syncing...",
        error: "Error",
      };

      this.statusIndicator.className = `bael-sync-status ${this.syncStatus}`;
      this.statusIndicator.innerHTML = `
                <span class="sync-icon">${icons[this.syncStatus]}</span>
                <span class="sync-text">${texts[this.syncStatus]}</span>
            `;
    }

    addStyles() {
      if (document.getElementById("bael-sync-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-sync-styles";
      styles.textContent = `
                .bael-sync-panel {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 90vw;
                    max-width: 500px;
                    max-height: 80vh;
                    background: var(--color-panel, #0f0f17);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 20px;
                    z-index: 100073;
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: 0 40px 120px rgba(0,0,0,0.7);
                }

                .bael-sync-panel.visible {
                    display: flex;
                    animation: syncIn 0.3s ease;
                }

                @keyframes syncIn {
                    from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }

                .sync-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 24px;
                    border-bottom: 1px solid var(--color-border, #252535);
                }

                .sync-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 17px;
                    font-weight: 700;
                    color: var(--color-text, #fff);
                }

                .sync-title-icon { font-size: 22px; }

                .sync-close {
                    width: 36px;
                    height: 36px;
                    background: transparent;
                    border: none;
                    color: var(--color-text-muted, #666);
                    font-size: 24px;
                    cursor: pointer;
                }

                .sync-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px 24px;
                }

                .sync-section {
                    margin-bottom: 24px;
                }

                .sync-section h4 {
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--color-text-muted, #888);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 12px;
                }

                .sync-main-status {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px;
                    background: var(--color-surface, #181820);
                    border-radius: 12px;
                }

                .sync-status-icon { font-size: 28px; }

                .sync-status-info {
                    flex: 1;
                }

                .sync-status-text {
                    font-size: 15px;
                    font-weight: 600;
                    color: var(--color-text, #fff);
                    display: block;
                }

                .sync-last {
                    font-size: 11px;
                    color: var(--color-text-muted, #666);
                }

                .sync-main-status.syncing {
                    border: 1px solid #f59e0b;
                }

                .sync-main-status.error {
                    border: 1px solid #ef4444;
                }

                .sync-pending {
                    margin-top: 10px;
                    padding: 10px 14px;
                    background: rgba(255,51,102,0.1);
                    border-radius: 8px;
                    font-size: 12px;
                    color: var(--color-primary, #ff3366);
                }

                .sync-btn {
                    padding: 10px 16px;
                    background: var(--color-surface, #181820);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 8px;
                    color: var(--color-text, #fff);
                    font-size: 12px;
                    cursor: pointer;
                }

                .sync-btn.primary {
                    background: var(--color-primary, #ff3366);
                    border-color: transparent;
                }

                .sync-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .sync-device {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: var(--color-surface, #181820);
                    border-radius: 10px;
                    margin-bottom: 8px;
                }

                .sync-device.current {
                    border: 1px solid var(--color-primary, #ff3366);
                }

                .device-icon { font-size: 24px; }

                .device-info { flex: 1; }

                .device-name, .device-name-input {
                    font-size: 13px;
                    font-weight: 500;
                    color: var(--color-text, #fff);
                    display: block;
                }

                .device-name-input {
                    background: transparent;
                    border: none;
                    width: 100%;
                    padding: 0;
                }

                .device-meta {
                    font-size: 11px;
                    color: var(--color-text-muted, #666);
                }

                .device-remove {
                    background: transparent;
                    border: none;
                    font-size: 14px;
                    cursor: pointer;
                    opacity: 0.6;
                }

                .device-remove:hover { opacity: 1; }

                .sync-empty {
                    text-align: center;
                    padding: 20px;
                    color: var(--color-text-muted, #555);
                    font-size: 12px;
                }

                .sync-settings { display: flex; flex-direction: column; gap: 12px; }

                .sync-toggle {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 13px;
                    color: var(--color-text, #fff);
                }

                .sync-option {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .sync-option span {
                    font-size: 13px;
                    color: var(--color-text, #fff);
                }

                .sync-option select {
                    padding: 6px 10px;
                    background: var(--color-surface, #181820);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 6px;
                    color: var(--color-text, #fff);
                    font-size: 12px;
                }

                .sync-categories {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                }

                .sync-category {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 12px;
                    background: var(--color-surface, #181820);
                    border-radius: 8px;
                    font-size: 12px;
                    color: var(--color-text, #fff);
                }

                .sync-history {
                    max-height: 150px;
                    overflow-y: auto;
                }

                .sync-history-item {
                    display: flex;
                    gap: 10px;
                    padding: 8px 0;
                    border-bottom: 1px solid var(--color-border, #252535);
                    font-size: 11px;
                }

                .history-time {
                    color: var(--color-text-muted, #666);
                    min-width: 70px;
                }

                .history-msg {
                    color: var(--color-text, #fff);
                }

                .sync-history-item.error .history-msg {
                    color: #ef4444;
                }

                /* Status Indicator */
                .bael-sync-status {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 16px;
                    background: var(--color-surface, #181820);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 30px;
                    z-index: 100060;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .bael-sync-status:hover {
                    background: var(--color-border, #252535);
                }

                .bael-sync-status.syncing {
                    border-color: #f59e0b;
                }

                .bael-sync-status.syncing .sync-icon {
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .bael-sync-status.error {
                    border-color: #ef4444;
                }

                .sync-text {
                    font-size: 12px;
                    color: var(--color-text, #fff);
                }
            `;
      document.head.appendChild(styles);
    }

    // ═════════════════════════════════════════════════════════════════
    // EVENT BINDING
    // ═════════════════════════════════════════════════════════════════

    bindEvents() {
      this.loadDevices();
      this.loadQueue();
      this.loadSyncHistory();
      this.bindPanelEvents();

      // Online/offline events
      window.addEventListener("online", () => {
        this.currentDevice.isOnline = true;
        if (this.pendingChanges.length > 0) {
          this.sync();
        }
        this.updateUI();
      });

      window.addEventListener("offline", () => {
        this.currentDevice.isOnline = false;
        this.updateUI();
      });

      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "S") {
          e.preventDefault();
          this.toggle();
        }
      });
    }

    bindPanelEvents() {
      if (!this.panel) return;

      // Close
      this.panel
        .querySelector("#sync-close")
        ?.addEventListener("click", () => this.close());

      // Sync now
      this.panel
        .querySelector("#sync-now")
        ?.addEventListener("click", () => this.sync(true));

      // Device name change
      this.panel.querySelectorAll(".device-name-input").forEach((input) => {
        input.addEventListener("change", (e) => {
          this.renameDevice(e.target.dataset.id, e.target.value);
        });
      });

      // Remove device
      this.panel.querySelectorAll(".device-remove").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (confirm("Remove this device?")) {
            this.removeDevice(btn.dataset.id);
          }
        });
      });

      // Auto-sync toggle
      this.panel
        .querySelector("#sync-auto")
        ?.addEventListener("change", (e) => {
          this.config.autoSync = e.target.checked;
          this.saveConfig();
          if (e.target.checked) {
            this.startAutoSync();
          } else {
            this.stopAutoSync();
          }
        });

      // Sync interval
      this.panel
        .querySelector("#sync-interval")
        ?.addEventListener("change", (e) => {
          this.config.syncInterval = parseInt(e.target.value);
          this.saveConfig();
          this.startAutoSync();
        });

      // Conflict resolution
      this.panel
        .querySelector("#sync-conflict")
        ?.addEventListener("change", (e) => {
          this.config.conflictResolution = e.target.value;
          this.saveConfig();
        });

      // Categories
      this.panel.querySelectorAll(".sync-category input").forEach((input) => {
        input.addEventListener("change", (e) => {
          const category = e.target.dataset.category;
          if (e.target.checked) {
            if (!this.config.syncCategories.includes(category)) {
              this.config.syncCategories.push(category);
            }
          } else {
            this.config.syncCategories = this.config.syncCategories.filter(
              (c) => c !== category,
            );
          }
          this.saveConfig();
        });
      });
    }

    emit(event, data = {}) {
      window.dispatchEvent(
        new CustomEvent(`bael:sync:${event}`, { detail: data }),
      );
    }

    // ═════════════════════════════════════════════════════════════════
    // PERSISTENCE
    // ═════════════════════════════════════════════════════════════════

    loadConfig() {
      try {
        const saved = JSON.parse(
          localStorage.getItem("bael_sync_config") || "{}",
        );
        this.config = { ...this.config, ...saved };
        this.lastSync = localStorage.getItem("bael_last_sync");
      } catch (e) {
        console.warn("Failed to load sync config:", e);
      }
    }

    saveConfig() {
      localStorage.setItem("bael_sync_config", JSON.stringify(this.config));
    }

    loadQueue() {
      try {
        this.pendingChanges = JSON.parse(
          localStorage.getItem("bael_sync_queue") || "[]",
        );
      } catch (e) {
        this.pendingChanges = [];
      }
    }

    saveQueue() {
      localStorage.setItem(
        "bael_sync_queue",
        JSON.stringify(this.pendingChanges),
      );
    }

    loadSyncHistory() {
      try {
        this.syncHistory = JSON.parse(
          localStorage.getItem("bael_sync_history") || "[]",
        );
      } catch (e) {
        this.syncHistory = [];
      }
    }

    saveSyncHistory() {
      localStorage.setItem(
        "bael_sync_history",
        JSON.stringify(this.syncHistory),
      );
    }

    // ═════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═════════════════════════════════════════════════════════════════

    open() {
      this.isVisible = true;
      this.updateUI();
      this.panel.classList.add("visible");
    }

    close() {
      this.isVisible = false;
      this.panel.classList.remove("visible");
    }

    toggle() {
      this.isVisible ? this.close() : this.open();
    }
  }

  window.BaelRealTimeSync = new BaelRealTimeSync();
})();
