/**
 * BAEL - LORD OF ALL
 * Split View Mode - Compare multiple conversations side by side
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelSplitView {
    constructor() {
      this.isActive = false;
      this.panels = [];
      this.maxPanels = 4;
      this.layout = "horizontal"; // horizontal, vertical, grid
      this.container = null;
      this.originalContent = null;
      this.init();
    }

    init() {
      this.createSplitViewContainer();
      this.registerShortcuts();
      this.registerCommands();
      console.log("⚡ Bael Split View initialized");
    }

    createSplitViewContainer() {
      // Create main split view overlay
      const container = document.createElement("div");
      container.id = "bael-split-view";
      container.className = "bael-split-view";
      container.innerHTML = `
                <div class="split-view-header">
                    <div class="split-view-title">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="7" height="18" rx="1"/>
                            <rect x="14" y="3" width="7" height="18" rx="1"/>
                        </svg>
                        <span>Split View</span>
                    </div>
                    <div class="split-view-controls">
                        <button class="split-btn" data-action="add-panel" title="Add Panel">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="12" y1="5" x2="12" y2="19"/>
                                <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                        </button>
                        <button class="split-btn" data-action="layout-horizontal" title="Horizontal Layout">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="7" height="18" rx="1"/>
                                <rect x="14" y="3" width="7" height="18" rx="1"/>
                            </svg>
                        </button>
                        <button class="split-btn" data-action="layout-vertical" title="Vertical Layout">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="18" height="7" rx="1"/>
                                <rect x="3" y="14" width="18" height="7" rx="1"/>
                            </svg>
                        </button>
                        <button class="split-btn" data-action="layout-grid" title="Grid Layout">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="7" height="7" rx="1"/>
                                <rect x="14" y="3" width="7" height="7" rx="1"/>
                                <rect x="3" y="14" width="7" height="7" rx="1"/>
                                <rect x="14" y="14" width="7" height="7" rx="1"/>
                            </svg>
                        </button>
                        <button class="split-btn split-close" data-action="close" title="Close Split View (Escape)">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="split-view-body">
                    <div class="split-panels" data-layout="horizontal">
                        <!-- Panels will be inserted here -->
                    </div>
                </div>
                <div class="split-view-footer">
                    <span class="split-info">Drag chats from history to compare</span>
                    <span class="split-stats">0 / ${this.maxPanels} panels</span>
                </div>
            `;

      document.body.appendChild(container);
      this.container = container;

      // Add event listeners
      this.container.addEventListener("click", (e) => {
        const action = e.target.closest("[data-action]")?.dataset.action;
        if (action) this.handleAction(action, e);
      });

      // Add styles
      this.addStyles();
    }

    addStyles() {
      if (document.getElementById("bael-split-view-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-split-view-styles";
      styles.textContent = `
                .bael-split-view {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: var(--bael-bg-primary, #0a0a0f);
                    z-index: 10000;
                    display: none;
                    flex-direction: column;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .bael-split-view.active {
                    display: flex;
                    opacity: 1;
                }

                .split-view-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 20px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .split-view-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .split-view-controls {
                    display: flex;
                    gap: 8px;
                }

                .split-btn {
                    width: 36px;
                    height: 36px;
                    border: none;
                    border-radius: 8px;
                    background: var(--bael-bg-tertiary, #1a1a25);
                    color: var(--bael-text-secondary, #888);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }

                .split-btn:hover {
                    background: var(--bael-accent, #ff3366);
                    color: #fff;
                    transform: translateY(-1px);
                }

                .split-btn.active {
                    background: var(--bael-accent, #ff3366);
                    color: #fff;
                }

                .split-close:hover {
                    background: #ff4444;
                }

                .split-view-body {
                    flex: 1;
                    padding: 16px;
                    overflow: hidden;
                }

                .split-panels {
                    display: flex;
                    gap: 16px;
                    height: 100%;
                    width: 100%;
                }

                .split-panels[data-layout="horizontal"] {
                    flex-direction: row;
                }

                .split-panels[data-layout="vertical"] {
                    flex-direction: column;
                }

                .split-panels[data-layout="grid"] {
                    flex-wrap: wrap;
                }

                .split-panels[data-layout="grid"] .split-panel {
                    flex: 1 1 calc(50% - 8px);
                    max-width: calc(50% - 8px);
                    max-height: calc(50% - 8px);
                }

                .split-panel {
                    flex: 1;
                    background: var(--bael-bg-secondary, #12121a);
                    border-radius: 12px;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    min-width: 300px;
                    min-height: 200px;
                    transition: all 0.3s ease;
                }

                .split-panel.drop-target {
                    border-color: var(--bael-accent, #ff3366);
                    box-shadow: 0 0 20px rgba(255, 51, 102, 0.3);
                }

                .split-panel-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 16px;
                    background: var(--bael-bg-tertiary, #1a1a25);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .split-panel-title {
                    font-size: 13px;
                    font-weight: 500;
                    color: var(--bael-text-primary, #fff);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .split-panel-actions {
                    display: flex;
                    gap: 4px;
                }

                .panel-action-btn {
                    width: 28px;
                    height: 28px;
                    border: none;
                    border-radius: 6px;
                    background: transparent;
                    color: var(--bael-text-secondary, #888);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }

                .panel-action-btn:hover {
                    background: var(--bael-bg-primary, #0a0a0f);
                    color: var(--bael-text-primary, #fff);
                }

                .split-panel-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px;
                }

                .split-panel-empty {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    color: var(--bael-text-muted, #666);
                    text-align: center;
                    gap: 12px;
                }

                .split-panel-empty svg {
                    opacity: 0.5;
                }

                .split-panel-empty span {
                    font-size: 13px;
                }

                .chat-select-dropdown {
                    margin-top: 12px;
                    padding: 8px 16px;
                    border-radius: 8px;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    background: var(--bael-bg-tertiary, #1a1a25);
                    color: var(--bael-text-primary, #fff);
                    font-size: 13px;
                    cursor: pointer;
                    min-width: 200px;
                }

                .split-view-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 20px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                    font-size: 12px;
                    color: var(--bael-text-muted, #666);
                }

                .split-message {
                    padding: 12px;
                    margin-bottom: 12px;
                    border-radius: 8px;
                    background: var(--bael-bg-tertiary, #1a1a25);
                }

                .split-message.user {
                    background: var(--bael-accent-dim, rgba(255, 51, 102, 0.1));
                    border-left: 3px solid var(--bael-accent, #ff3366);
                }

                .split-message.assistant {
                    background: var(--bael-bg-tertiary, #1a1a25);
                    border-left: 3px solid var(--bael-secondary, #00ffcc);
                }

                .split-message-role {
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                    margin-bottom: 6px;
                    color: var(--bael-text-secondary, #888);
                }

                .split-message-content {
                    font-size: 13px;
                    line-height: 1.6;
                    color: var(--bael-text-primary, #fff);
                }

                .resizer {
                    width: 8px;
                    cursor: col-resize;
                    background: transparent;
                    transition: background 0.2s ease;
                    flex-shrink: 0;
                }

                .split-panels[data-layout="vertical"] .resizer {
                    width: 100%;
                    height: 8px;
                    cursor: row-resize;
                }

                .resizer:hover {
                    background: var(--bael-accent, #ff3366);
                }

                @keyframes splitPanelIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                .split-panel {
                    animation: splitPanelIn 0.3s ease;
                }
            `;
      document.head.appendChild(styles);
    }

    handleAction(action, event) {
      switch (action) {
        case "add-panel":
          this.addPanel();
          break;
        case "layout-horizontal":
          this.setLayout("horizontal");
          break;
        case "layout-vertical":
          this.setLayout("vertical");
          break;
        case "layout-grid":
          this.setLayout("grid");
          break;
        case "close":
          this.close();
          break;
        case "remove-panel":
          this.removePanel(event.target.closest(".split-panel"));
          break;
        case "maximize-panel":
          this.maximizePanel(event.target.closest(".split-panel"));
          break;
      }
    }

    toggle() {
      if (this.isActive) {
        this.close();
      } else {
        this.open();
      }
    }

    open() {
      this.isActive = true;
      this.container.classList.add("active");

      // Add initial panels if empty
      if (this.panels.length === 0) {
        this.addPanel();
        this.addPanel();
      }

      // Emit event
      window.dispatchEvent(new CustomEvent("bael:splitview:opened"));

      // Escape to close
      document.addEventListener("keydown", this.escapeHandler);
    }

    close() {
      this.isActive = false;
      this.container.classList.remove("active");
      document.removeEventListener("keydown", this.escapeHandler);
      window.dispatchEvent(new CustomEvent("bael:splitview:closed"));
    }

    escapeHandler = (e) => {
      if (e.key === "Escape") {
        this.close();
      }
    };

    addPanel() {
      if (this.panels.length >= this.maxPanels) {
        if (window.Bael?.notifications) {
          window.Bael.notifications.warning(
            `Maximum ${this.maxPanels} panels allowed`,
          );
        }
        return;
      }

      const panelId = `split-panel-${Date.now()}`;
      const panelEl = document.createElement("div");
      panelEl.className = "split-panel";
      panelEl.id = panelId;
      panelEl.dataset.panelIndex = this.panels.length;

      panelEl.innerHTML = `
                <div class="split-panel-header">
                    <div class="split-panel-title">
                        <span>Panel ${this.panels.length + 1}</span>
                    </div>
                    <div class="split-panel-actions">
                        <button class="panel-action-btn" data-action="maximize-panel" title="Maximize">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="15 3 21 3 21 9"/>
                                <polyline points="9 21 3 21 3 15"/>
                                <line x1="21" y1="3" x2="14" y2="10"/>
                                <line x1="3" y1="21" x2="10" y2="14"/>
                            </svg>
                        </button>
                        <button class="panel-action-btn" data-action="remove-panel" title="Remove">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"/>
                                <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="split-panel-content">
                    <div class="split-panel-empty">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                        <span>Select a conversation to display</span>
                        <select class="chat-select-dropdown" onchange="window.BaelSplitView.loadChatInPanel('${panelId}', this.value)">
                            <option value="">Choose a chat...</option>
                            ${this.getChatOptions()}
                        </select>
                    </div>
                </div>
            `;

      // Add resizer if not first panel
      const panelsContainer = this.container.querySelector(".split-panels");
      if (this.panels.length > 0) {
        const resizer = document.createElement("div");
        resizer.className = "resizer";
        resizer.dataset.resizeFor = panelId;
        this.addResizeHandlers(resizer);
        panelsContainer.appendChild(resizer);
      }

      panelsContainer.appendChild(panelEl);
      this.panels.push({ id: panelId, element: panelEl, chatId: null });

      // Setup drag and drop
      this.setupDragDrop(panelEl);

      // Update stats
      this.updateStats();
    }

    getChatOptions() {
      // Try to get chats from Alpine store
      let options = "";
      try {
        const chats = Alpine.store("chats")?.all || [];
        chats.forEach((chat) => {
          const title = chat.title || `Chat ${chat.id}`;
          options += `<option value="${chat.id}">${title}</option>`;
        });
      } catch (e) {
        options = '<option value="" disabled>No chats available</option>';
      }
      return options;
    }

    async loadChatInPanel(panelId, chatId) {
      if (!chatId) return;

      const panel = this.panels.find((p) => p.id === panelId);
      if (!panel) return;

      const contentEl = panel.element.querySelector(".split-panel-content");
      contentEl.innerHTML =
        '<div class="split-panel-empty"><span>Loading...</span></div>';

      try {
        // Try to fetch chat messages
        const response = await fetch(`/get_chat_messages?chat_id=${chatId}`);
        if (!response.ok) throw new Error("Failed to load chat");

        const data = await response.json();
        const messages = data.messages || [];

        // Get chat title
        let chatTitle = `Chat ${chatId}`;
        try {
          const chat = Alpine.store("chats")?.all?.find((c) => c.id === chatId);
          if (chat?.title) chatTitle = chat.title;
        } catch (e) {}

        // Update panel title
        panel.element.querySelector(".split-panel-title span").textContent =
          chatTitle;
        panel.chatId = chatId;

        // Render messages
        if (messages.length === 0) {
          contentEl.innerHTML =
            '<div class="split-panel-empty"><span>No messages in this chat</span></div>';
        } else {
          contentEl.innerHTML = messages
            .map(
              (msg) => `
                        <div class="split-message ${msg.role}">
                            <div class="split-message-role">${msg.role}</div>
                            <div class="split-message-content">${this.escapeHtml(msg.content)}</div>
                        </div>
                    `,
            )
            .join("");
        }
      } catch (e) {
        console.error("Error loading chat:", e);
        contentEl.innerHTML = `<div class="split-panel-empty"><span>Error loading chat: ${e.message}</span></div>`;
      }
    }

    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }

    removePanel(panelEl) {
      if (!panelEl || this.panels.length <= 1) {
        if (window.Bael?.notifications) {
          window.Bael.notifications.warning("Cannot remove the last panel");
        }
        return;
      }

      const panelId = panelEl.id;
      const index = this.panels.findIndex((p) => p.id === panelId);

      if (index !== -1) {
        // Remove resizer
        const resizer = this.container.querySelector(
          `[data-resize-for="${panelId}"]`,
        );
        if (resizer) resizer.remove();

        // Remove panel
        panelEl.remove();
        this.panels.splice(index, 1);

        // Renumber remaining panels
        this.panels.forEach((p, i) => {
          p.element.querySelector(".split-panel-title span").textContent =
            p.chatId
              ? p.element.querySelector(".split-panel-title span").textContent
              : `Panel ${i + 1}`;
        });

        this.updateStats();
      }
    }

    maximizePanel(panelEl) {
      // Toggle maximize
      if (panelEl.classList.contains("maximized")) {
        panelEl.style.cssText = "";
        panelEl.classList.remove("maximized");
        this.panels.forEach((p) => {
          if (p.element !== panelEl) {
            p.element.style.display = "";
          }
        });
      } else {
        this.panels.forEach((p) => {
          if (p.element !== panelEl) {
            p.element.style.display = "none";
          }
        });
        panelEl.classList.add("maximized");
        panelEl.style.flex = "1";
        panelEl.style.maxWidth = "100%";
        panelEl.style.maxHeight = "100%";
      }
    }

    setLayout(layout) {
      this.layout = layout;
      const panelsContainer = this.container.querySelector(".split-panels");
      panelsContainer.dataset.layout = layout;

      // Update active button
      this.container
        .querySelectorAll('[data-action^="layout-"]')
        .forEach((btn) => {
          btn.classList.toggle(
            "active",
            btn.dataset.action === `layout-${layout}`,
          );
        });
    }

    setupDragDrop(panelEl) {
      panelEl.addEventListener("dragover", (e) => {
        e.preventDefault();
        panelEl.classList.add("drop-target");
      });

      panelEl.addEventListener("dragleave", () => {
        panelEl.classList.remove("drop-target");
      });

      panelEl.addEventListener("drop", (e) => {
        e.preventDefault();
        panelEl.classList.remove("drop-target");

        const chatId = e.dataTransfer.getData("text/plain");
        if (chatId) {
          this.loadChatInPanel(panelEl.id, chatId);
        }
      });
    }

    addResizeHandlers(resizer) {
      let startX, startY, startWidth, startHeight, prevPanel, nextPanel;

      const startResize = (e) => {
        e.preventDefault();

        const panelId = resizer.dataset.resizeFor;
        nextPanel = document.getElementById(panelId);
        prevPanel = resizer.previousElementSibling;

        if (!prevPanel || !nextPanel) return;

        startX = e.clientX;
        startY = e.clientY;
        startWidth = prevPanel.offsetWidth;
        startHeight = prevPanel.offsetHeight;

        document.addEventListener("mousemove", doResize);
        document.addEventListener("mouseup", stopResize);
      };

      const doResize = (e) => {
        if (this.layout === "vertical") {
          const deltaY = e.clientY - startY;
          prevPanel.style.flex = "none";
          prevPanel.style.height = `${startHeight + deltaY}px`;
        } else {
          const deltaX = e.clientX - startX;
          prevPanel.style.flex = "none";
          prevPanel.style.width = `${startWidth + deltaX}px`;
        }
      };

      const stopResize = () => {
        document.removeEventListener("mousemove", doResize);
        document.removeEventListener("mouseup", stopResize);
      };

      resizer.addEventListener("mousedown", startResize);
    }

    updateStats() {
      const statsEl = this.container.querySelector(".split-stats");
      if (statsEl) {
        statsEl.textContent = `${this.panels.length} / ${this.maxPanels} panels`;
      }
    }

    registerShortcuts() {
      document.addEventListener("keydown", (e) => {
        // Ctrl/Cmd + Alt + S = Toggle Split View
        if (
          (e.ctrlKey || e.metaKey) &&
          e.altKey &&
          e.key.toLowerCase() === "s"
        ) {
          e.preventDefault();
          this.toggle();
        }
      });
    }

    registerCommands() {
      // Register with Bael command palette if available
      if (window.BaelCommandPalette) {
        window.BaelCommandPalette.registerCommand({
          id: "split-view:toggle",
          title: "Toggle Split View",
          category: "View",
          shortcut: "Ctrl+Alt+S",
          handler: () => this.toggle(),
        });

        window.BaelCommandPalette.registerCommand({
          id: "split-view:add-panel",
          title: "Add Split Panel",
          category: "View",
          handler: () => {
            if (!this.isActive) this.open();
            this.addPanel();
          },
        });
      }
    }
  }

  // Initialize
  window.BaelSplitView = new BaelSplitView();
})();
