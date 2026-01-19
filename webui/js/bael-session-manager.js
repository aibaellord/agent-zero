/**
 * BAEL - LORD OF ALL
 * Session Manager - Save, load, and share conversation sessions
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelSessionManager {
    constructor() {
      this.panel = null;
      this.sessions = [];
      this.currentSession = null;
      this.storageKey = "bael-sessions";
      this.init();
    }

    init() {
      this.addStyles();
      this.loadSessions();
      this.createUI();
      this.bindEvents();
      console.log("💾 Bael Session Manager initialized");
    }

    addStyles() {
      const styles = document.createElement("style");
      styles.id = "bael-session-styles";
      styles.textContent = `
                /* Session Panel */
                .bael-session-panel {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 700px;
                    max-height: 80vh;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 16px;
                    z-index: 100040;
                    display: none;
                    flex-direction: column;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
                    overflow: hidden;
                }

                .bael-session-panel.visible {
                    display: flex;
                    animation: sessionFadeIn 0.2s ease;
                }

                @keyframes sessionFadeIn {
                    from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }

                .bael-session-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.6);
                    z-index: 100039;
                    display: none;
                    backdrop-filter: blur(4px);
                }

                .bael-session-overlay.visible {
                    display: block;
                }

                /* Header */
                .session-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 20px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .session-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .session-actions {
                    display: flex;
                    gap: 8px;
                }

                .session-btn {
                    padding: 8px 14px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 12px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    transition: all 0.2s ease;
                }

                .session-btn:hover {
                    border-color: var(--bael-accent, #ff3366);
                }

                .session-btn.primary {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                }

                .session-close {
                    width: 32px;
                    height: 32px;
                    background: transparent;
                    border: none;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    border-radius: 6px;
                    font-size: 18px;
                }

                .session-close:hover {
                    background: rgba(255, 51, 102, 0.2);
                    color: var(--bael-accent, #ff3366);
                }

                /* Tabs */
                .session-tabs {
                    display: flex;
                    gap: 0;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .session-tab {
                    padding: 12px 20px;
                    background: transparent;
                    border: none;
                    color: var(--bael-text-muted, #666);
                    font-size: 13px;
                    cursor: pointer;
                    position: relative;
                    transition: all 0.2s ease;
                }

                .session-tab:hover {
                    color: var(--bael-text-primary, #fff);
                }

                .session-tab.active {
                    color: var(--bael-accent, #ff3366);
                }

                .session-tab.active::after {
                    content: '';
                    position: absolute;
                    bottom: -1px;
                    left: 0;
                    right: 0;
                    height: 2px;
                    background: var(--bael-accent, #ff3366);
                }

                .session-tab-badge {
                    margin-left: 6px;
                    padding: 2px 6px;
                    background: var(--bael-bg-tertiary, #181820);
                    border-radius: 10px;
                    font-size: 10px;
                }

                /* Content */
                .session-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px;
                }

                .session-content-tab {
                    display: none;
                }

                .session-content-tab.active {
                    display: block;
                }

                /* Session List */
                .session-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .session-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 14px;
                    padding: 14px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .session-item:hover {
                    border-color: var(--bael-accent, #ff3366);
                }

                .session-item.current {
                    border-color: #4ade80;
                    background: rgba(74, 222, 128, 0.05);
                }

                .session-icon {
                    width: 40px;
                    height: 40px;
                    background: var(--bael-bg-tertiary, #181820);
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    flex-shrink: 0;
                }

                .session-info {
                    flex: 1;
                    min-width: 0;
                }

                .session-name {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                    margin-bottom: 4px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .session-current-badge {
                    font-size: 9px;
                    font-weight: 600;
                    padding: 2px 6px;
                    background: #4ade80;
                    color: #000;
                    border-radius: 4px;
                    text-transform: uppercase;
                }

                .session-meta {
                    display: flex;
                    gap: 12px;
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                    margin-bottom: 6px;
                }

                .session-preview {
                    font-size: 12px;
                    color: var(--bael-text-muted, #888);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .session-item-actions {
                    display: flex;
                    gap: 6px;
                    opacity: 0;
                    transition: opacity 0.2s ease;
                }

                .session-item:hover .session-item-actions {
                    opacity: 1;
                }

                .session-item-btn {
                    width: 30px;
                    height: 30px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                }

                .session-item-btn:hover {
                    border-color: var(--bael-accent, #ff3366);
                    color: var(--bael-text-primary, #fff);
                }

                .session-item-btn.delete:hover {
                    background: rgba(239, 68, 68, 0.2);
                    border-color: #ef4444;
                    color: #ef4444;
                }

                /* Save Form */
                .session-save-form {
                    padding: 20px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-radius: 12px;
                }

                .form-group {
                    margin-bottom: 16px;
                }

                .form-label {
                    display: block;
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--bael-text-muted, #666);
                    margin-bottom: 6px;
                }

                .form-input {
                    width: 100%;
                    padding: 10px 14px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 13px;
                }

                .form-input:focus {
                    outline: none;
                    border-color: var(--bael-accent, #ff3366);
                }

                .form-textarea {
                    min-height: 80px;
                    resize: vertical;
                }

                .form-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                    margin-top: 8px;
                }

                .form-tag {
                    padding: 4px 10px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 20px;
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .form-tag:hover,
                .form-tag.selected {
                    border-color: var(--bael-accent, #ff3366);
                    color: var(--bael-accent, #ff3366);
                }

                /* Import/Export */
                .session-import-zone {
                    border: 2px dashed var(--bael-border, #2a2a3a);
                    border-radius: 12px;
                    padding: 40px;
                    text-align: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .session-import-zone:hover {
                    border-color: var(--bael-accent, #ff3366);
                    background: rgba(255, 51, 102, 0.05);
                }

                .import-icon {
                    font-size: 40px;
                    margin-bottom: 12px;
                }

                .import-text {
                    font-size: 14px;
                    color: var(--bael-text-primary, #fff);
                    margin-bottom: 6px;
                }

                .import-hint {
                    font-size: 12px;
                    color: var(--bael-text-muted, #666);
                }

                /* Empty State */
                .session-empty {
                    text-align: center;
                    padding: 40px;
                }

                .empty-icon {
                    font-size: 48px;
                    margin-bottom: 16px;
                    opacity: 0.5;
                }

                .empty-text {
                    font-size: 14px;
                    color: var(--bael-text-muted, #666);
                    margin-bottom: 16px;
                }

                /* Share Modal */
                .share-link-box {
                    display: flex;
                    gap: 8px;
                    margin-top: 16px;
                }

                .share-link-input {
                    flex: 1;
                    padding: 10px 14px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 12px;
                    font-family: monospace;
                }

                /* Floating button */
                .bael-session-btn {
                    position: fixed;
                    bottom: 420px;
                    right: 20px;
                    width: 44px;
                    height: 44px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    z-index: 100005;
                    transition: all 0.3s ease;
                }

                .bael-session-btn:hover {
                    border-color: var(--bael-accent, #ff3366);
                    transform: scale(1.1);
                }
            `;
      document.head.appendChild(styles);
    }

    loadSessions() {
      try {
        this.sessions = JSON.parse(
          localStorage.getItem(this.storageKey) || "[]",
        );
      } catch {
        this.sessions = [];
      }
    }

    saveSessions() {
      localStorage.setItem(this.storageKey, JSON.stringify(this.sessions));
    }

    createUI() {
      // Floating button
      const button = document.createElement("button");
      button.className = "bael-session-btn";
      button.innerHTML = "💾";
      button.title = "Session Manager (Ctrl+Shift+S)";
      button.addEventListener("click", () => this.togglePanel());
      document.body.appendChild(button);

      // Overlay
      const overlay = document.createElement("div");
      overlay.className = "bael-session-overlay";
      overlay.addEventListener("click", () => this.closePanel());
      document.body.appendChild(overlay);
      this.overlay = overlay;

      // Panel
      const panel = document.createElement("div");
      panel.className = "bael-session-panel";
      panel.innerHTML = this.renderPanel();
      document.body.appendChild(panel);
      this.panel = panel;

      this.bindPanelEvents();
    }

    renderPanel() {
      return `
                <div class="session-header">
                    <div class="session-title">
                        <span>💾</span>
                        <span>Session Manager</span>
                    </div>
                    <div class="session-actions">
                        <button class="session-btn primary" id="save-current">
                            <span>💾</span> Save Current
                        </button>
                        <button class="session-close">×</button>
                    </div>
                </div>

                <div class="session-tabs">
                    <button class="session-tab active" data-tab="sessions">
                        Sessions <span class="session-tab-badge" id="session-count">${this.sessions.length}</span>
                    </button>
                    <button class="session-tab" data-tab="save">Save</button>
                    <button class="session-tab" data-tab="import">Import/Export</button>
                </div>

                <div class="session-content">
                    <div class="session-content-tab active" data-tab="sessions">
                        ${this.renderSessionsList()}
                    </div>
                    <div class="session-content-tab" data-tab="save">
                        ${this.renderSaveForm()}
                    </div>
                    <div class="session-content-tab" data-tab="import">
                        ${this.renderImportExport()}
                    </div>
                </div>
            `;
    }

    renderSessionsList() {
      if (this.sessions.length === 0) {
        return `
                    <div class="session-empty">
                        <div class="empty-icon">📁</div>
                        <div class="empty-text">No saved sessions yet</div>
                        <button class="session-btn primary" id="save-first">Save Current Session</button>
                    </div>
                `;
      }

      return `
                <div class="session-list">
                    ${this.sessions.map((session, i) => this.renderSessionItem(session, i)).join("")}
                </div>
            `;
    }

    renderSessionItem(session, index) {
      const isCurrent = session.id === this.currentSession;
      const date = new Date(session.savedAt);

      return `
                <div class="session-item ${isCurrent ? "current" : ""}" data-index="${index}">
                    <div class="session-icon">${session.icon || "💬"}</div>
                    <div class="session-info">
                        <div class="session-name">
                            ${this.escapeHtml(session.name)}
                            ${isCurrent ? '<span class="session-current-badge">Current</span>' : ""}
                        </div>
                        <div class="session-meta">
                            <span>📅 ${date.toLocaleDateString()}</span>
                            <span>💬 ${session.messageCount || 0} messages</span>
                            <span>📊 ${this.formatSize(session.size || 0)}</span>
                        </div>
                        <div class="session-preview">${this.escapeHtml(session.preview || "")}</div>
                    </div>
                    <div class="session-item-actions">
                        <button class="session-item-btn" title="Load" data-action="load">📂</button>
                        <button class="session-item-btn" title="Share" data-action="share">🔗</button>
                        <button class="session-item-btn" title="Export" data-action="export">📤</button>
                        <button class="session-item-btn delete" title="Delete" data-action="delete">🗑️</button>
                    </div>
                </div>
            `;
    }

    renderSaveForm() {
      return `
                <div class="session-save-form">
                    <div class="form-group">
                        <label class="form-label">Session Name</label>
                        <input type="text" class="form-input" id="session-name"
                               placeholder="e.g., Python Project Discussion"
                               value="${this.generateSessionName()}">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Description (optional)</label>
                        <textarea class="form-input form-textarea" id="session-desc"
                                  placeholder="Brief description of this session..."></textarea>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Icon</label>
                        <div class="form-tags" id="icon-selector">
                            ${[
                              "💬",
                              "🚀",
                              "💻",
                              "📚",
                              "🎨",
                              "🔧",
                              "🧪",
                              "📊",
                              "🎯",
                              "⭐",
                            ]
                              .map(
                                (icon) =>
                                  `<span class="form-tag ${icon === "💬" ? "selected" : ""}" data-icon="${icon}">${icon}</span>`,
                              )
                              .join("")}
                        </div>
                    </div>
                    <button class="session-btn primary" id="confirm-save" style="width: 100%; margin-top: 10px;">
                        Save Session
                    </button>
                </div>
            `;
    }

    renderImportExport() {
      return `
                <div class="session-import-zone" id="import-zone">
                    <div class="import-icon">📥</div>
                    <div class="import-text">Drop a session file here or click to import</div>
                    <div class="import-hint">Supports .json session files</div>
                    <input type="file" id="import-file" accept=".json" style="display: none;">
                </div>

                <div style="margin-top: 20px;">
                    <button class="session-btn" id="export-all" style="width: 100%;">
                        <span>📤</span> Export All Sessions
                    </button>
                </div>
            `;
    }

    bindPanelEvents() {
      // Close button
      this.panel
        .querySelector(".session-close")
        .addEventListener("click", () => this.closePanel());

      // Tabs
      this.panel.querySelectorAll(".session-tab").forEach((tab) => {
        tab.addEventListener("click", () => this.switchTab(tab.dataset.tab));
      });

      // Save current button
      this.panel
        .querySelector("#save-current")
        .addEventListener("click", () => {
          this.switchTab("save");
        });

      // Confirm save
      this.panel
        .querySelector("#confirm-save")
        .addEventListener("click", () => this.saveCurrentSession());

      // Icon selector
      this.panel
        .querySelector("#icon-selector")
        .addEventListener("click", (e) => {
          const tag = e.target.closest(".form-tag");
          if (tag) {
            this.panel
              .querySelectorAll("#icon-selector .form-tag")
              .forEach((t) => t.classList.remove("selected"));
            tag.classList.add("selected");
          }
        });

      // Session item clicks
      this.panel
        .querySelector(".session-content")
        .addEventListener("click", (e) => {
          const btn = e.target.closest(".session-item-btn");
          const item = e.target.closest(".session-item");

          if (btn && item) {
            const index = parseInt(item.dataset.index);
            const action = btn.dataset.action;
            this.handleSessionAction(action, index);
            e.stopPropagation();
          } else if (item) {
            const index = parseInt(item.dataset.index);
            this.loadSession(index);
          }
        });

      // Import zone
      const importZone = this.panel.querySelector("#import-zone");
      const importFile = this.panel.querySelector("#import-file");

      importZone.addEventListener("click", () => importFile.click());
      importZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        importZone.style.borderColor = "var(--bael-accent, #ff3366)";
      });
      importZone.addEventListener("dragleave", () => {
        importZone.style.borderColor = "";
      });
      importZone.addEventListener("drop", (e) => {
        e.preventDefault();
        importZone.style.borderColor = "";
        const file = e.dataTransfer.files[0];
        if (file) this.importSession(file);
      });
      importFile.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) this.importSession(file);
      });

      // Export all
      this.panel
        .querySelector("#export-all")
        .addEventListener("click", () => this.exportAllSessions());
    }

    bindEvents() {
      document.addEventListener("keydown", (e) => {
        // Ctrl+Shift+S - Open session manager (override browser save)
        if (e.ctrlKey && e.shiftKey && e.key === "S") {
          e.preventDefault();
          this.togglePanel();
        }
      });
    }

    switchTab(tabId) {
      this.panel
        .querySelectorAll(".session-tab")
        .forEach((t) => t.classList.toggle("active", t.dataset.tab === tabId));
      this.panel
        .querySelectorAll(".session-content-tab")
        .forEach((c) => c.classList.toggle("active", c.dataset.tab === tabId));
    }

    generateSessionName() {
      const now = new Date();
      return `Session ${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }

    getCurrentConversation() {
      // Try to get conversation from Alpine.js data or DOM
      const messages = [];
      const chatEl = document.querySelector("[x-data]");

      if (chatEl && chatEl.__x) {
        const data = chatEl.__x.$data;
        if (data.messages) {
          return data.messages;
        }
      }

      // Fallback: parse from DOM
      document
        .querySelectorAll('.message, [class*="message"]')
        .forEach((el) => {
          const role = el.classList.contains("user") ? "user" : "assistant";
          const content = el.textContent;
          if (content) {
            messages.push({ role, content: content.substring(0, 500) });
          }
        });

      return messages;
    }

    saveCurrentSession() {
      const name =
        this.panel.querySelector("#session-name").value ||
        this.generateSessionName();
      const description = this.panel.querySelector("#session-desc").value;
      const icon =
        this.panel.querySelector("#icon-selector .form-tag.selected")?.dataset
          .icon || "💬";
      const messages = this.getCurrentConversation();

      const session = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        name,
        description,
        icon,
        messages,
        messageCount: messages.length,
        preview:
          messages[messages.length - 1]?.content?.substring(0, 100) || "",
        savedAt: new Date().toISOString(),
        size: JSON.stringify(messages).length,
      };

      this.sessions.unshift(session);
      this.saveSessions();
      this.currentSession = session.id;

      this.refreshList();
      this.switchTab("sessions");

      if (window.BaelNotifications) {
        window.BaelNotifications.success("Session saved!");
      }
    }

    loadSession(index) {
      const session = this.sessions[index];
      if (!session) return;

      // In production, this would restore the conversation
      this.currentSession = session.id;

      if (window.BaelNotifications) {
        window.BaelNotifications.info(`Loaded: ${session.name}`);
      }

      this.refreshList();
      this.closePanel();
    }

    handleSessionAction(action, index) {
      const session = this.sessions[index];
      if (!session) return;

      switch (action) {
        case "load":
          this.loadSession(index);
          break;
        case "share":
          this.shareSession(session);
          break;
        case "export":
          this.exportSession(session);
          break;
        case "delete":
          this.deleteSession(index);
          break;
      }
    }

    shareSession(session) {
      // Generate a shareable link (in production, this would upload to a server)
      const data = btoa(JSON.stringify(session));
      const link = `${location.origin}${location.pathname}#session=${data.substring(0, 50)}...`;

      // Copy to clipboard
      navigator.clipboard.writeText(link).then(() => {
        if (window.BaelNotifications) {
          window.BaelNotifications.success("Share link copied!");
        }
      });
    }

    exportSession(session) {
      const blob = new Blob([JSON.stringify(session, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bael-session-${session.id}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }

    exportAllSessions() {
      const blob = new Blob([JSON.stringify(this.sessions, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bael-all-sessions-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      if (window.BaelNotifications) {
        window.BaelNotifications.success(
          `Exported ${this.sessions.length} sessions`,
        );
      }
    }

    importSession(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);

          if (Array.isArray(data)) {
            // Multiple sessions
            data.forEach((s) => {
              s.id =
                Date.now().toString(36) + Math.random().toString(36).substr(2);
              this.sessions.unshift(s);
            });
            if (window.BaelNotifications) {
              window.BaelNotifications.success(
                `Imported ${data.length} sessions`,
              );
            }
          } else {
            // Single session
            data.id =
              Date.now().toString(36) + Math.random().toString(36).substr(2);
            this.sessions.unshift(data);
            if (window.BaelNotifications) {
              window.BaelNotifications.success("Session imported!");
            }
          }

          this.saveSessions();
          this.refreshList();
          this.switchTab("sessions");
        } catch (err) {
          if (window.BaelNotifications) {
            window.BaelNotifications.error("Invalid session file");
          }
        }
      };
      reader.readAsText(file);
    }

    deleteSession(index) {
      const session = this.sessions[index];
      if (confirm(`Delete "${session.name}"?`)) {
        this.sessions.splice(index, 1);
        this.saveSessions();
        this.refreshList();

        if (window.BaelNotifications) {
          window.BaelNotifications.info("Session deleted");
        }
      }
    }

    refreshList() {
      const listContainer = this.panel.querySelector('[data-tab="sessions"]');
      listContainer.innerHTML = this.renderSessionsList();
      this.panel.querySelector("#session-count").textContent =
        this.sessions.length;
    }

    togglePanel() {
      if (this.panel.classList.contains("visible")) {
        this.closePanel();
      } else {
        this.openPanel();
      }
    }

    openPanel() {
      this.refreshList();
      this.panel.classList.add("visible");
      this.overlay.classList.add("visible");
    }

    closePanel() {
      this.panel.classList.remove("visible");
      this.overlay.classList.remove("visible");
    }

    formatSize(bytes) {
      if (bytes < 1024) return bytes + " B";
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
      return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    }

    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }
  }

  // Initialize
  window.BaelSessionManager = new BaelSessionManager();
})();
