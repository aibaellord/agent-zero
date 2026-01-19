/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BAEL - LORD OF ALL
 * BACKUP & RESTORE SYSTEM - Data Protection
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Comprehensive data backup and restore:
 * - Full system backups
 * - Selective data export
 * - Import/restore
 * - Cloud sync support
 * - Automatic backups
 *
 * @version 1.0.0
 */

(function () {
  "use strict";

  class BaelBackupSystem {
    constructor() {
      this.backups = [];
      this.autoBackupEnabled = false;
      this.autoBackupInterval = null;
      this.panel = null;
      this.isVisible = false;

      this.init();
    }

    init() {
      this.loadBackupHistory();
      this.createUI();
      this.addStyles();
      this.bindEvents();
      this.startAutoBackup();
      console.log("💾 Bael Backup System initialized");
    }

    // ═════════════════════════════════════════════════════════════════
    // BACKUP OPERATIONS
    // ═════════════════════════════════════════════════════════════════

    async createBackup(options = {}) {
      const backup = {
        id: "backup_" + Date.now().toString(36),
        name: options.name || `Backup ${new Date().toLocaleString()}`,
        createdAt: new Date(),
        size: 0,
        categories: options.categories || ["all"],
        data: {},
      };

      try {
        // Collect data based on categories
        if (this.shouldInclude(backup.categories, "settings")) {
          backup.data.settings = this.collectSettings();
        }

        if (this.shouldInclude(backup.categories, "chats")) {
          backup.data.chats = this.collectChats();
        }

        if (this.shouldInclude(backup.categories, "memory")) {
          backup.data.memory = this.collectMemory();
        }

        if (this.shouldInclude(backup.categories, "themes")) {
          backup.data.themes = this.collectThemes();
        }

        if (this.shouldInclude(backup.categories, "plugins")) {
          backup.data.plugins = this.collectPlugins();
        }

        if (this.shouldInclude(backup.categories, "workflows")) {
          backup.data.workflows = this.collectWorkflows();
        }

        if (this.shouldInclude(backup.categories, "apikeys")) {
          backup.data.apikeys = this.collectAPIKeys();
        }

        // Calculate size
        backup.size = new Blob([JSON.stringify(backup.data)]).size;

        // Add to history
        this.backups.unshift({
          id: backup.id,
          name: backup.name,
          createdAt: backup.createdAt,
          size: backup.size,
          categories: backup.categories,
        });

        // Keep only last 20 backups in history
        if (this.backups.length > 20) {
          this.backups = this.backups.slice(0, 20);
        }

        this.saveBackupHistory();
        this.updateUI();
        this.emit("backup-created", backup);

        return backup;
      } catch (error) {
        console.error("Backup failed:", error);
        this.emit("backup-failed", { error: error.message });
        return null;
      }
    }

    shouldInclude(categories, category) {
      return categories.includes("all") || categories.includes(category);
    }

    collectSettings() {
      const settings = {};
      const keys = Object.keys(localStorage).filter(
        (k) => k.startsWith("bael_") || k.startsWith("agent_"),
      );
      keys.forEach((k) => {
        settings[k] = localStorage.getItem(k);
      });
      return settings;
    }

    collectChats() {
      return localStorage.getItem("bael_chat_history") || "[]";
    }

    collectMemory() {
      const memory = {};
      const keys = Object.keys(localStorage).filter((k) =>
        k.includes("memory"),
      );
      keys.forEach((k) => {
        memory[k] = localStorage.getItem(k);
      });
      return memory;
    }

    collectThemes() {
      return localStorage.getItem("bael_themes") || "{}";
    }

    collectPlugins() {
      return {
        installed: localStorage.getItem("bael_installed_plugins") || "[]",
        enabled: localStorage.getItem("bael_enabled_plugins") || "[]",
      };
    }

    collectWorkflows() {
      return localStorage.getItem("bael_workflows") || "{}";
    }

    collectAPIKeys() {
      return localStorage.getItem("bael_api_keys") || "{}";
    }

    // ═════════════════════════════════════════════════════════════════
    // EXPORT
    // ═════════════════════════════════════════════════════════════════

    async exportBackup(backup) {
      const json = JSON.stringify(backup.data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `bael-backup-${backup.id}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.emit("backup-exported", backup);
    }

    async exportToFile(options = {}) {
      const backup = await this.createBackup(options);
      if (backup) {
        await this.exportBackup(backup);
        return backup;
      }
      return null;
    }

    // ═════════════════════════════════════════════════════════════════
    // RESTORE
    // ═════════════════════════════════════════════════════════════════

    async restoreFromFile(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const data = JSON.parse(e.target.result);
            await this.restore(data);
            resolve({ success: true });
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsText(file);
      });
    }

    async restore(data, options = {}) {
      const categories = options.categories || ["all"];
      const merge = options.merge || false;

      try {
        if (this.shouldInclude(categories, "settings") && data.settings) {
          this.restoreSettings(data.settings, merge);
        }

        if (this.shouldInclude(categories, "chats") && data.chats) {
          this.restoreChats(data.chats, merge);
        }

        if (this.shouldInclude(categories, "memory") && data.memory) {
          this.restoreMemory(data.memory, merge);
        }

        if (this.shouldInclude(categories, "themes") && data.themes) {
          this.restoreThemes(data.themes, merge);
        }

        if (this.shouldInclude(categories, "plugins") && data.plugins) {
          this.restorePlugins(data.plugins, merge);
        }

        if (this.shouldInclude(categories, "workflows") && data.workflows) {
          this.restoreWorkflows(data.workflows, merge);
        }

        if (this.shouldInclude(categories, "apikeys") && data.apikeys) {
          this.restoreAPIKeys(data.apikeys, merge);
        }

        this.emit("restore-completed", { categories });
        return { success: true };
      } catch (error) {
        console.error("Restore failed:", error);
        this.emit("restore-failed", { error: error.message });
        return { success: false, error: error.message };
      }
    }

    restoreSettings(settings, merge) {
      if (!merge) {
        Object.keys(localStorage)
          .filter((k) => k.startsWith("bael_") || k.startsWith("agent_"))
          .forEach((k) => localStorage.removeItem(k));
      }
      Object.entries(settings).forEach(([k, v]) => {
        localStorage.setItem(k, v);
      });
    }

    restoreChats(chats, merge) {
      if (merge) {
        try {
          const existing = JSON.parse(
            localStorage.getItem("bael_chat_history") || "[]",
          );
          const imported = JSON.parse(chats);
          const merged = [...existing, ...imported];
          localStorage.setItem("bael_chat_history", JSON.stringify(merged));
        } catch (e) {
          localStorage.setItem("bael_chat_history", chats);
        }
      } else {
        localStorage.setItem("bael_chat_history", chats);
      }
    }

    restoreMemory(memory, merge) {
      Object.entries(memory).forEach(([k, v]) => {
        localStorage.setItem(k, v);
      });
    }

    restoreThemes(themes, merge) {
      localStorage.setItem("bael_themes", themes);
    }

    restorePlugins(plugins, merge) {
      localStorage.setItem("bael_installed_plugins", plugins.installed);
      localStorage.setItem("bael_enabled_plugins", plugins.enabled);
    }

    restoreWorkflows(workflows, merge) {
      localStorage.setItem("bael_workflows", workflows);
    }

    restoreAPIKeys(apikeys, merge) {
      localStorage.setItem("bael_api_keys", apikeys);
    }

    // ═════════════════════════════════════════════════════════════════
    // AUTO BACKUP
    // ═════════════════════════════════════════════════════════════════

    startAutoBackup() {
      const settings = this.getAutoBackupSettings();
      this.autoBackupEnabled = settings.enabled;

      if (this.autoBackupEnabled) {
        const intervalMs = settings.intervalHours * 60 * 60 * 1000;
        this.autoBackupInterval = setInterval(() => {
          this.createBackup({ name: "Auto Backup" });
        }, intervalMs);
      }
    }

    stopAutoBackup() {
      if (this.autoBackupInterval) {
        clearInterval(this.autoBackupInterval);
        this.autoBackupInterval = null;
      }
    }

    setAutoBackup(enabled, intervalHours = 24) {
      this.autoBackupEnabled = enabled;
      localStorage.setItem(
        "bael_autobackup",
        JSON.stringify({ enabled, intervalHours }),
      );

      this.stopAutoBackup();
      if (enabled) {
        this.startAutoBackup();
      }
    }

    getAutoBackupSettings() {
      try {
        return JSON.parse(localStorage.getItem("bael_autobackup") || "{}");
      } catch (e) {
        return { enabled: false, intervalHours: 24 };
      }
    }

    // ═════════════════════════════════════════════════════════════════
    // PERSISTENCE
    // ═════════════════════════════════════════════════════════════════

    loadBackupHistory() {
      try {
        const saved = JSON.parse(
          localStorage.getItem("bael_backup_history") || "[]",
        );
        this.backups = saved.map((b) => ({
          ...b,
          createdAt: new Date(b.createdAt),
        }));
      } catch (e) {
        console.warn("Failed to load backup history:", e);
      }
    }

    saveBackupHistory() {
      localStorage.setItem("bael_backup_history", JSON.stringify(this.backups));
    }

    // ═════════════════════════════════════════════════════════════════
    // UI
    // ═════════════════════════════════════════════════════════════════

    createUI() {
      const panel = document.createElement("div");
      panel.id = "bael-backup-panel";
      panel.className = "bael-backup-panel";
      panel.innerHTML = this.renderPanel();
      document.body.appendChild(panel);
      this.panel = panel;
    }

    renderPanel() {
      const autoSettings = this.getAutoBackupSettings();

      return `
                <div class="backup-header">
                    <div class="backup-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        <span>Backup & Restore</span>
                    </div>
                    <button class="backup-close" id="backup-close">×</button>
                </div>

                <div class="backup-content">
                    <div class="backup-section">
                        <h4>Create Backup</h4>
                        <div class="backup-categories">
                            <label class="backup-cat">
                                <input type="checkbox" value="all" checked/> All Data
                            </label>
                            <label class="backup-cat">
                                <input type="checkbox" value="settings"/> Settings
                            </label>
                            <label class="backup-cat">
                                <input type="checkbox" value="chats"/> Chat History
                            </label>
                            <label class="backup-cat">
                                <input type="checkbox" value="memory"/> Memory
                            </label>
                            <label class="backup-cat">
                                <input type="checkbox" value="themes"/> Themes
                            </label>
                            <label class="backup-cat">
                                <input type="checkbox" value="workflows"/> Workflows
                            </label>
                            <label class="backup-cat">
                                <input type="checkbox" value="apikeys"/> API Keys
                            </label>
                        </div>
                        <button class="backup-btn primary" id="backup-create">
                            💾 Create Backup
                        </button>
                    </div>

                    <div class="backup-section">
                        <h4>Restore</h4>
                        <div class="backup-restore-area">
                            <input type="file" id="backup-file" accept=".json" hidden/>
                            <button class="backup-btn" id="backup-import">
                                📥 Import Backup File
                            </button>
                            <p class="backup-hint">Select a .json backup file to restore</p>
                        </div>
                    </div>

                    <div class="backup-section">
                        <h4>Auto Backup</h4>
                        <div class="backup-auto">
                            <label class="backup-toggle-row">
                                <span>Enable automatic backups</span>
                                <label class="backup-toggle">
                                    <input type="checkbox" id="backup-auto-toggle" ${autoSettings.enabled ? "checked" : ""}/>
                                    <span class="backup-toggle-slider"></span>
                                </label>
                            </label>
                            <div class="backup-auto-interval">
                                <span>Backup every</span>
                                <select id="backup-auto-interval">
                                    <option value="1" ${autoSettings.intervalHours === 1 ? "selected" : ""}>1 hour</option>
                                    <option value="6" ${autoSettings.intervalHours === 6 ? "selected" : ""}>6 hours</option>
                                    <option value="12" ${autoSettings.intervalHours === 12 ? "selected" : ""}>12 hours</option>
                                    <option value="24" ${autoSettings.intervalHours === 24 ? "selected" : ""}>24 hours</option>
                                    <option value="168" ${autoSettings.intervalHours === 168 ? "selected" : ""}>Weekly</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="backup-section">
                        <h4>Backup History</h4>
                        <div class="backup-history">
                            ${
                              this.backups.length === 0
                                ? `
                                <p class="backup-empty">No backups yet</p>
                            `
                                : `
                                ${this.backups
                                  .map(
                                    (b) => `
                                    <div class="backup-item">
                                        <div class="backup-item-info">
                                            <span class="backup-item-name">${b.name}</span>
                                            <span class="backup-item-meta">
                                                ${this.formatDate(b.createdAt)} • ${this.formatSize(b.size)}
                                            </span>
                                        </div>
                                        <div class="backup-item-actions">
                                            <button class="backup-item-export" data-id="${b.id}" title="Export">📤</button>
                                        </div>
                                    </div>
                                `,
                                  )
                                  .join("")}
                            `
                            }
                        </div>
                    </div>
                </div>
            `;
    }

    formatDate(date) {
      return new Date(date).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    formatSize(bytes) {
      if (bytes < 1024) return bytes + " B";
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
      return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    }

    updateUI() {
      if (!this.panel) return;
      this.panel.innerHTML = this.renderPanel();
      this.bindPanelEvents();
    }

    addStyles() {
      if (document.getElementById("bael-backup-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-backup-styles";
      styles.textContent = `
                .bael-backup-panel {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 90vw;
                    max-width: 550px;
                    max-height: 85vh;
                    background: var(--color-panel, #0f0f17);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 20px;
                    z-index: 100085;
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: 0 40px 120px rgba(0,0,0,0.7);
                }

                .bael-backup-panel.visible {
                    display: flex;
                    animation: backupIn 0.3s ease;
                }

                @keyframes backupIn {
                    from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }

                .backup-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 24px;
                    border-bottom: 1px solid var(--color-border, #252535);
                }

                .backup-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 17px;
                    font-weight: 700;
                    color: var(--color-text, #fff);
                }

                .backup-title svg {
                    width: 22px;
                    height: 22px;
                    color: var(--color-primary, #ff3366);
                }

                .backup-close {
                    width: 36px;
                    height: 36px;
                    background: transparent;
                    border: none;
                    color: var(--color-text-muted, #666);
                    font-size: 24px;
                    cursor: pointer;
                }

                .backup-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                }

                .backup-section {
                    margin-bottom: 24px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid var(--color-border, #252535);
                }

                .backup-section:last-child {
                    border-bottom: none;
                    margin-bottom: 0;
                }

                .backup-section h4 {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--color-text, #fff);
                    margin-bottom: 12px;
                }

                .backup-categories {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    margin-bottom: 16px;
                }

                .backup-cat {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 8px 12px;
                    background: var(--color-surface, #181820);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 8px;
                    font-size: 12px;
                    color: var(--color-text, #fff);
                    cursor: pointer;
                }

                .backup-cat input {
                    accent-color: var(--color-primary, #ff3366);
                }

                .backup-btn {
                    padding: 12px 24px;
                    background: var(--color-surface, #181820);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 10px;
                    color: var(--color-text, #fff);
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .backup-btn.primary {
                    background: var(--color-primary, #ff3366);
                    border-color: transparent;
                }

                .backup-btn:hover {
                    transform: translateY(-1px);
                }

                .backup-restore-area {
                    text-align: center;
                    padding: 20px;
                    background: var(--color-surface, #181820);
                    border: 2px dashed var(--color-border, #333);
                    border-radius: 12px;
                }

                .backup-hint {
                    font-size: 11px;
                    color: var(--color-text-muted, #666);
                    margin-top: 10px;
                }

                .backup-auto {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .backup-toggle-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 16px;
                    background: var(--color-surface, #181820);
                    border-radius: 10px;
                    font-size: 13px;
                    color: var(--color-text, #fff);
                }

                .backup-toggle {
                    position: relative;
                    width: 40px;
                    height: 22px;
                }

                .backup-toggle input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }

                .backup-toggle-slider {
                    position: absolute;
                    inset: 0;
                    background: var(--color-border, #333);
                    border-radius: 22px;
                    cursor: pointer;
                    transition: 0.2s;
                }

                .backup-toggle-slider::before {
                    content: '';
                    position: absolute;
                    width: 16px;
                    height: 16px;
                    left: 3px;
                    top: 3px;
                    background: #fff;
                    border-radius: 50%;
                    transition: 0.2s;
                }

                .backup-toggle input:checked + .backup-toggle-slider {
                    background: var(--color-primary, #ff3366);
                }

                .backup-toggle input:checked + .backup-toggle-slider::before {
                    transform: translateX(18px);
                }

                .backup-auto-interval {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 16px;
                    background: var(--color-surface, #181820);
                    border-radius: 10px;
                    font-size: 13px;
                    color: var(--color-text, #fff);
                }

                .backup-auto-interval select {
                    padding: 8px 12px;
                    background: var(--color-panel, #12121a);
                    border: 1px solid var(--color-border, #333);
                    border-radius: 6px;
                    color: var(--color-text, #fff);
                    font-size: 12px;
                }

                .backup-history {
                    max-height: 200px;
                    overflow-y: auto;
                }

                .backup-empty {
                    text-align: center;
                    padding: 20px;
                    color: var(--color-text-muted, #666);
                    font-size: 13px;
                }

                .backup-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px;
                    background: var(--color-surface, #181820);
                    border-radius: 8px;
                    margin-bottom: 8px;
                }

                .backup-item-name {
                    font-size: 13px;
                    font-weight: 500;
                    color: var(--color-text, #fff);
                }

                .backup-item-meta {
                    font-size: 11px;
                    color: var(--color-text-muted, #666);
                    display: block;
                    margin-top: 2px;
                }

                .backup-item-actions button {
                    width: 32px;
                    height: 32px;
                    background: transparent;
                    border: none;
                    font-size: 14px;
                    cursor: pointer;
                    opacity: 0.6;
                }

                .backup-item-actions button:hover {
                    opacity: 1;
                }
            `;
      document.head.appendChild(styles);
    }

    // ═════════════════════════════════════════════════════════════════
    // EVENT BINDING
    // ═════════════════════════════════════════════════════════════════

    bindEvents() {
      this.bindPanelEvents();

      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "B") {
          e.preventDefault();
          this.toggle();
        }
      });
    }

    bindPanelEvents() {
      if (!this.panel) return;

      this.panel
        .querySelector("#backup-close")
        ?.addEventListener("click", () => this.close());

      this.panel
        .querySelector("#backup-create")
        ?.addEventListener("click", async () => {
          const checkboxes = this.panel.querySelectorAll(
            ".backup-categories input:checked",
          );
          const categories = Array.from(checkboxes).map((cb) => cb.value);

          const backup = await this.exportToFile({ categories });
          if (backup) {
            window.BaelNotifications?.show(
              "Backup created and downloaded",
              "success",
            );
          }
        });

      this.panel
        .querySelector("#backup-import")
        ?.addEventListener("click", () => {
          this.panel.querySelector("#backup-file").click();
        });

      this.panel
        .querySelector("#backup-file")
        ?.addEventListener("change", async (e) => {
          const file = e.target.files[0];
          if (file) {
            try {
              await this.restoreFromFile(file);
              window.BaelNotifications?.show(
                "Backup restored successfully",
                "success",
              );
              setTimeout(() => location.reload(), 1000);
            } catch (error) {
              window.BaelNotifications?.show(
                "Failed to restore: " + error.message,
                "error",
              );
            }
          }
        });

      this.panel
        .querySelector("#backup-auto-toggle")
        ?.addEventListener("change", (e) => {
          const interval = parseInt(
            this.panel.querySelector("#backup-auto-interval").value,
          );
          this.setAutoBackup(e.target.checked, interval);
        });

      this.panel
        .querySelector("#backup-auto-interval")
        ?.addEventListener("change", (e) => {
          if (this.autoBackupEnabled) {
            this.setAutoBackup(true, parseInt(e.target.value));
          }
        });

      this.panel.querySelectorAll(".backup-item-export").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const backupInfo = this.backups.find((b) => b.id === btn.dataset.id);
          if (backupInfo) {
            // Recreate backup with same settings
            const backup = await this.createBackup({
              name: backupInfo.name,
              categories: backupInfo.categories,
            });
            if (backup) {
              await this.exportBackup(backup);
            }
          }
        });
      });
    }

    emit(event, data) {
      window.dispatchEvent(
        new CustomEvent(`bael:backup:${event}`, { detail: data }),
      );
    }

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

  window.BaelBackupSystem = new BaelBackupSystem();
})();
