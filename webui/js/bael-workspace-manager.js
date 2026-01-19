/**
 * BAEL - LORD OF ALL
 * Workspace Manager - Multi-workspace management system
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelWorkspaceManager {
    constructor() {
      this.workspaces = [];
      this.activeWorkspace = null;
      this.panel = null;
      this.storageKey = "bael-workspaces";
      this.init();
    }

    init() {
      this.addStyles();
      this.loadWorkspaces();
      this.createUI();
      this.bindEvents();
      console.log("🏢 Bael Workspace Manager initialized");
    }

    loadWorkspaces() {
      try {
        const saved = JSON.parse(localStorage.getItem(this.storageKey) || "{}");
        this.workspaces = saved.workspaces || [];
        this.activeWorkspace = saved.active || null;
      } catch {
        this.workspaces = [];
      }

      // Create default workspace if none exist
      if (this.workspaces.length === 0) {
        this.workspaces.push({
          id: "default",
          name: "Default Workspace",
          icon: "🏠",
          color: "#ff3366",
          description: "Your main workspace",
          createdAt: new Date().toISOString(),
          settings: {},
          contexts: [],
          pinnedFiles: [],
        });
        this.activeWorkspace = "default";
        this.saveWorkspaces();
      }
    }

    saveWorkspaces() {
      localStorage.setItem(
        this.storageKey,
        JSON.stringify({
          workspaces: this.workspaces,
          active: this.activeWorkspace,
        }),
      );
    }

    addStyles() {
      const styles = document.createElement("style");
      styles.id = "bael-workspace-styles";
      styles.textContent = `
                /* Workspace Switcher */
                .bael-workspace-switcher {
                    position: fixed;
                    top: 20px;
                    left: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 8px 14px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 25px;
                    z-index: 100010;
                    cursor: pointer;
                    transition: all 0.3s ease;
                }

                .bael-workspace-switcher:hover {
                    border-color: var(--bael-accent, #ff3366);
                }

                .workspace-indicator {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: var(--ws-color, #ff3366);
                }

                .workspace-name {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                    max-width: 150px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .workspace-dropdown-icon {
                    font-size: 10px;
                    color: var(--bael-text-muted, #666);
                }

                /* Workspace Panel */
                .bael-workspace-panel {
                    position: fixed;
                    top: 65px;
                    left: 20px;
                    width: 380px;
                    max-height: 500px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 14px;
                    z-index: 100030;
                    display: none;
                    flex-direction: column;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
                    overflow: hidden;
                }

                .bael-workspace-panel.visible {
                    display: flex;
                    animation: wsPanelIn 0.2s ease;
                }

                @keyframes wsPanelIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Panel Header */
                .ws-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px 16px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .ws-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .ws-header-actions {
                    display: flex;
                    gap: 6px;
                }

                .ws-header-btn {
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
                    font-size: 14px;
                    transition: all 0.2s ease;
                }

                .ws-header-btn:hover {
                    border-color: var(--bael-accent, #ff3366);
                    color: var(--bael-text-primary, #fff);
                }

                /* Search */
                .ws-search {
                    padding: 10px 16px;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .ws-search input {
                    width: 100%;
                    padding: 8px 12px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 12px;
                }

                .ws-search input:focus {
                    outline: none;
                    border-color: var(--bael-accent, #ff3366);
                }

                /* Workspace List */
                .ws-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 8px;
                }

                .ws-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 10px;
                    margin-bottom: 6px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .ws-item:hover {
                    border-color: var(--bael-accent, #ff3366);
                }

                .ws-item.active {
                    border-color: var(--ws-active-color, #ff3366);
                    background: rgba(255, 51, 102, 0.1);
                }

                .ws-item-indicator {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    flex-shrink: 0;
                }

                .ws-item-content {
                    flex: 1;
                    min-width: 0;
                }

                .ws-item-name {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                    margin-bottom: 2px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .ws-active-badge {
                    font-size: 9px;
                    padding: 2px 6px;
                    background: #4ade80;
                    color: #000;
                    border-radius: 4px;
                    font-weight: 600;
                }

                .ws-item-desc {
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .ws-item-meta {
                    font-size: 10px;
                    color: var(--bael-text-muted, #555);
                    margin-top: 4px;
                }

                .ws-item-actions {
                    display: flex;
                    gap: 4px;
                    opacity: 0;
                    transition: opacity 0.2s ease;
                }

                .ws-item:hover .ws-item-actions {
                    opacity: 1;
                }

                .ws-item-btn {
                    width: 28px;
                    height: 28px;
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

                .ws-item-btn:hover {
                    border-color: var(--bael-accent, #ff3366);
                    color: var(--bael-text-primary, #fff);
                }

                .ws-item-btn.delete:hover {
                    border-color: #ef4444;
                    color: #ef4444;
                }

                /* Create Form */
                .ws-create-form {
                    padding: 16px;
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                    display: none;
                }

                .ws-create-form.visible {
                    display: block;
                }

                .ws-form-row {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 10px;
                }

                .ws-form-group {
                    flex: 1;
                }

                .ws-form-label {
                    display: block;
                    font-size: 10px;
                    font-weight: 600;
                    color: var(--bael-text-muted, #666);
                    margin-bottom: 4px;
                }

                .ws-form-input {
                    width: 100%;
                    padding: 8px 10px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 12px;
                }

                .ws-form-input:focus {
                    outline: none;
                    border-color: var(--bael-accent, #ff3366);
                }

                .ws-emoji-picker {
                    display: flex;
                    gap: 4px;
                    flex-wrap: wrap;
                }

                .ws-emoji {
                    width: 30px;
                    height: 30px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    transition: all 0.2s ease;
                }

                .ws-emoji:hover,
                .ws-emoji.selected {
                    border-color: var(--bael-accent, #ff3366);
                }

                .ws-color-picker {
                    display: flex;
                    gap: 4px;
                }

                .ws-color {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    cursor: pointer;
                    border: 2px solid transparent;
                    transition: all 0.2s ease;
                }

                .ws-color:hover,
                .ws-color.selected {
                    transform: scale(1.15);
                    border-color: #fff;
                }

                .ws-form-actions {
                    display: flex;
                    gap: 8px;
                    margin-top: 12px;
                }

                .ws-form-btn {
                    flex: 1;
                    padding: 10px;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .ws-form-btn.cancel {
                    background: var(--bael-bg-tertiary, #181820);
                    color: var(--bael-text-muted, #666);
                }

                .ws-form-btn.create {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                    color: #fff;
                }

                /* Quick Actions */
                .ws-quick-actions {
                    padding: 12px 16px;
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                    display: flex;
                    gap: 8px;
                }

                .ws-quick-btn {
                    flex: 1;
                    padding: 8px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-muted, #666);
                    font-size: 11px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 4px;
                    transition: all 0.2s ease;
                }

                .ws-quick-btn:hover {
                    border-color: var(--bael-accent, #ff3366);
                    color: var(--bael-text-primary, #fff);
                }
            `;
      document.head.appendChild(styles);
    }

    createUI() {
      const active = this.getActiveWorkspace();

      // Switcher
      const switcher = document.createElement("div");
      switcher.className = "bael-workspace-switcher";
      switcher.innerHTML = `
                <div class="workspace-indicator" style="--ws-color: ${active?.color || "#ff3366"}"></div>
                <span class="workspace-name">${active?.name || "Workspace"}</span>
                <span class="workspace-dropdown-icon">▼</span>
            `;
      switcher.addEventListener("click", () => this.togglePanel());
      document.body.appendChild(switcher);
      this.switcher = switcher;

      // Panel
      const panel = document.createElement("div");
      panel.className = "bael-workspace-panel";
      panel.innerHTML = this.renderPanel();
      document.body.appendChild(panel);
      this.panel = panel;

      this.bindPanelEvents();
    }

    renderPanel() {
      return `
                <div class="ws-header">
                    <div class="ws-title">
                        <span>🏢</span>
                        <span>Workspaces</span>
                    </div>
                    <div class="ws-header-actions">
                        <button class="ws-header-btn" id="ws-add" title="New Workspace">+</button>
                    </div>
                </div>

                <div class="ws-search">
                    <input type="text" placeholder="Search workspaces..." id="ws-search">
                </div>

                <div class="ws-list" id="ws-list">
                    ${this.renderWorkspaceList()}
                </div>

                <div class="ws-create-form" id="ws-create-form">
                    ${this.renderCreateForm()}
                </div>

                <div class="ws-quick-actions">
                    <button class="ws-quick-btn" id="ws-export">📤 Export</button>
                    <button class="ws-quick-btn" id="ws-import">📥 Import</button>
                </div>
            `;
    }

    renderWorkspaceList(search = "") {
      let filtered = this.workspaces;

      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (ws) =>
            ws.name.toLowerCase().includes(q) ||
            ws.description?.toLowerCase().includes(q),
        );
      }

      return filtered
        .map(
          (ws) => `
                <div class="ws-item ${ws.id === this.activeWorkspace ? "active" : ""}"
                     data-id="${ws.id}"
                     style="--ws-active-color: ${ws.color}">
                    <div class="ws-item-indicator" style="background: ${ws.color}20; color: ${ws.color}">
                        ${ws.icon}
                    </div>
                    <div class="ws-item-content">
                        <div class="ws-item-name">
                            ${this.escapeHtml(ws.name)}
                            ${ws.id === this.activeWorkspace ? '<span class="ws-active-badge">ACTIVE</span>' : ""}
                        </div>
                        <div class="ws-item-desc">${this.escapeHtml(ws.description || "No description")}</div>
                        <div class="ws-item-meta">Created ${new Date(ws.createdAt).toLocaleDateString()}</div>
                    </div>
                    <div class="ws-item-actions">
                        <button class="ws-item-btn" title="Edit" data-action="edit">✏️</button>
                        ${ws.id !== "default" ? '<button class="ws-item-btn delete" title="Delete" data-action="delete">🗑️</button>' : ""}
                    </div>
                </div>
            `,
        )
        .join("");
    }

    renderCreateForm() {
      const emojis = [
        "🏠",
        "💼",
        "🚀",
        "🎨",
        "📚",
        "🔬",
        "💻",
        "🎮",
        "🌍",
        "⭐",
      ];
      const colors = [
        "#ff3366",
        "#6366f1",
        "#4ade80",
        "#fbbf24",
        "#f472b6",
        "#8b5cf6",
        "#22d3d8",
        "#f97316",
      ];

      return `
                <div class="ws-form-row">
                    <div class="ws-form-group">
                        <label class="ws-form-label">Name</label>
                        <input type="text" class="ws-form-input" id="new-ws-name" placeholder="Workspace name">
                    </div>
                </div>
                <div class="ws-form-row">
                    <div class="ws-form-group">
                        <label class="ws-form-label">Description</label>
                        <input type="text" class="ws-form-input" id="new-ws-desc" placeholder="Brief description">
                    </div>
                </div>
                <div class="ws-form-row">
                    <div class="ws-form-group">
                        <label class="ws-form-label">Icon</label>
                        <div class="ws-emoji-picker" id="emoji-picker">
                            ${emojis.map((e, i) => `<button class="ws-emoji ${i === 0 ? "selected" : ""}" data-emoji="${e}">${e}</button>`).join("")}
                        </div>
                    </div>
                </div>
                <div class="ws-form-row">
                    <div class="ws-form-group">
                        <label class="ws-form-label">Color</label>
                        <div class="ws-color-picker" id="color-picker">
                            ${colors.map((c, i) => `<button class="ws-color ${i === 0 ? "selected" : ""}" data-color="${c}" style="background: ${c}"></button>`).join("")}
                        </div>
                    </div>
                </div>
                <div class="ws-form-actions">
                    <button class="ws-form-btn cancel" id="cancel-create">Cancel</button>
                    <button class="ws-form-btn create" id="confirm-create">Create Workspace</button>
                </div>
            `;
    }

    bindPanelEvents() {
      // Add workspace
      this.panel.querySelector("#ws-add").addEventListener("click", () => {
        this.showCreateForm();
      });

      // Search
      this.panel.querySelector("#ws-search").addEventListener("input", (e) => {
        this.refreshList(e.target.value);
      });

      // Workspace items
      this.panel.querySelector("#ws-list").addEventListener("click", (e) => {
        const btn = e.target.closest(".ws-item-btn");
        const item = e.target.closest(".ws-item");

        if (btn && item) {
          const action = btn.dataset.action;
          const id = item.dataset.id;

          if (action === "edit") this.editWorkspace(id);
          else if (action === "delete") this.deleteWorkspace(id);

          e.stopPropagation();
        } else if (item) {
          this.switchWorkspace(item.dataset.id);
        }
      });

      // Create form
      this.panel
        .querySelector("#cancel-create")
        .addEventListener("click", () => {
          this.hideCreateForm();
        });

      this.panel
        .querySelector("#confirm-create")
        .addEventListener("click", () => {
          this.createWorkspace();
        });

      // Emoji picker
      this.panel
        .querySelector("#emoji-picker")
        .addEventListener("click", (e) => {
          const emoji = e.target.closest(".ws-emoji");
          if (emoji) {
            this.panel
              .querySelectorAll(".ws-emoji")
              .forEach((el) => el.classList.remove("selected"));
            emoji.classList.add("selected");
          }
        });

      // Color picker
      this.panel
        .querySelector("#color-picker")
        .addEventListener("click", (e) => {
          const color = e.target.closest(".ws-color");
          if (color) {
            this.panel
              .querySelectorAll(".ws-color")
              .forEach((el) => el.classList.remove("selected"));
            color.classList.add("selected");
          }
        });

      // Export/Import
      this.panel
        .querySelector("#ws-export")
        .addEventListener("click", () => this.exportWorkspaces());
      this.panel
        .querySelector("#ws-import")
        .addEventListener("click", () => this.importWorkspaces());
    }

    bindEvents() {
      // Click outside
      document.addEventListener("click", (e) => {
        if (
          !this.panel.contains(e.target) &&
          !this.switcher.contains(e.target)
        ) {
          this.closePanel();
        }
      });

      // Keyboard shortcuts
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "W") {
          e.preventDefault();
          this.togglePanel();
        }
      });
    }

    getActiveWorkspace() {
      return this.workspaces.find((ws) => ws.id === this.activeWorkspace);
    }

    switchWorkspace(id) {
      const workspace = this.workspaces.find((ws) => ws.id === id);
      if (!workspace) return;

      this.activeWorkspace = id;
      this.saveWorkspaces();
      this.updateSwitcher();
      this.refreshList();
      this.closePanel();

      if (window.BaelNotifications) {
        window.BaelNotifications.success(`Switched to ${workspace.name}`);
      }
    }

    createWorkspace() {
      const name = this.panel.querySelector("#new-ws-name").value.trim();
      const description = this.panel.querySelector("#new-ws-desc").value.trim();
      const icon =
        this.panel.querySelector(".ws-emoji.selected")?.dataset.emoji || "📁";
      const color =
        this.panel.querySelector(".ws-color.selected")?.dataset.color ||
        "#ff3366";

      if (!name) {
        if (window.BaelNotifications) {
          window.BaelNotifications.error("Please enter a workspace name");
        }
        return;
      }

      const workspace = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        name,
        description,
        icon,
        color,
        createdAt: new Date().toISOString(),
        settings: {},
        contexts: [],
        pinnedFiles: [],
      };

      this.workspaces.push(workspace);
      this.saveWorkspaces();
      this.hideCreateForm();
      this.refreshList();

      if (window.BaelNotifications) {
        window.BaelNotifications.success(`Created workspace: ${name}`);
      }
    }

    deleteWorkspace(id) {
      if (id === "default") return;

      const ws = this.workspaces.find((w) => w.id === id);
      if (!ws) return;

      if (confirm(`Delete "${ws.name}"? This cannot be undone.`)) {
        this.workspaces = this.workspaces.filter((w) => w.id !== id);

        if (this.activeWorkspace === id) {
          this.activeWorkspace = "default";
        }

        this.saveWorkspaces();
        this.updateSwitcher();
        this.refreshList();

        if (window.BaelNotifications) {
          window.BaelNotifications.info("Workspace deleted");
        }
      }
    }

    editWorkspace(id) {
      // For simplicity, just show notification
      if (window.BaelNotifications) {
        window.BaelNotifications.info("Edit workspace: Coming soon");
      }
    }

    exportWorkspaces() {
      const data = {
        workspaces: this.workspaces,
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bael-workspaces-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }

    importWorkspaces() {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const data = JSON.parse(ev.target.result);
            if (data.workspaces) {
              data.workspaces.forEach((ws) => {
                ws.id =
                  Date.now().toString(36) +
                  Math.random().toString(36).substr(2);
                this.workspaces.push(ws);
              });
              this.saveWorkspaces();
              this.refreshList();

              if (window.BaelNotifications) {
                window.BaelNotifications.success(
                  `Imported ${data.workspaces.length} workspaces`,
                );
              }
            }
          } catch {
            if (window.BaelNotifications) {
              window.BaelNotifications.error("Invalid workspace file");
            }
          }
        };
        reader.readAsText(file);
      };
      input.click();
    }

    showCreateForm() {
      this.panel.querySelector("#ws-create-form").classList.add("visible");
    }

    hideCreateForm() {
      this.panel.querySelector("#ws-create-form").classList.remove("visible");
      this.panel.querySelector("#new-ws-name").value = "";
      this.panel.querySelector("#new-ws-desc").value = "";
    }

    updateSwitcher() {
      const active = this.getActiveWorkspace();
      this.switcher
        .querySelector(".workspace-indicator")
        .style.setProperty("--ws-color", active?.color || "#ff3366");
      this.switcher.querySelector(".workspace-name").textContent =
        active?.name || "Workspace";
    }

    refreshList(search = "") {
      this.panel.querySelector("#ws-list").innerHTML =
        this.renderWorkspaceList(search);
    }

    togglePanel() {
      this.panel.classList.toggle("visible");
    }

    closePanel() {
      this.panel.classList.remove("visible");
      this.hideCreateForm();
    }

    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }
  }

  // Initialize
  window.BaelWorkspaceManager = new BaelWorkspaceManager();
})();
