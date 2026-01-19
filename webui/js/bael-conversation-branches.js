/**
 * BAEL - LORD OF ALL
 * Conversation Branches - Fork and manage parallel conversation paths
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelConversationBranches {
    constructor() {
      this.isVisible = false;
      this.branches = this.loadBranches();
      this.currentBranch = "main";
      this.branchHistory = {};
      this.init();
    }

    loadBranches() {
      const saved = localStorage.getItem("bael-branches");
      return saved
        ? JSON.parse(saved)
        : {
            main: {
              id: "main",
              name: "Main Conversation",
              color: "#ff3366",
              createdAt: Date.now(),
              messageCount: 0,
              parentBranch: null,
              forkPoint: null,
            },
          };
    }

    saveBranches() {
      localStorage.setItem("bael-branches", JSON.stringify(this.branches));
    }

    init() {
      this.createUI();
      this.bindEvents();
      console.log("🌿 Bael Conversation Branches initialized");
    }

    createUI() {
      const styles = document.createElement("style");
      styles.id = "bael-branches-styles";
      styles.textContent = `
                .bael-branches-panel {
                    position: fixed;
                    top: 60px;
                    left: 20px;
                    width: 280px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 14px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
                    z-index: 7500;
                    overflow: hidden;
                    transform: translateX(-320px);
                    opacity: 0;
                    transition: all 0.3s ease;
                }

                .bael-branches-panel.visible {
                    transform: translateX(0);
                    opacity: 1;
                }

                .bael-branches-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px 16px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .bael-branches-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .bael-branches-close {
                    width: 28px;
                    height: 28px;
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    font-size: 14px;
                }

                .bael-branches-close:hover {
                    background: #ff4444;
                    color: #fff;
                    border-color: #ff4444;
                }

                .bael-branches-actions {
                    padding: 12px;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .bael-new-branch-btn {
                    width: 100%;
                    padding: 10px;
                    background: transparent;
                    border: 2px dashed var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--bael-text-muted, #888);
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                }

                .bael-new-branch-btn:hover {
                    border-color: var(--bael-accent, #ff3366);
                    color: var(--bael-text-primary, #fff);
                    background: rgba(255, 51, 102, 0.05);
                }

                .bael-branches-list {
                    max-height: 400px;
                    overflow-y: auto;
                    padding: 12px;
                }

                .bael-branch-item {
                    padding: 12px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 2px solid var(--bael-border, #2a2a3a);
                    border-radius: 10px;
                    margin-bottom: 10px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    position: relative;
                }

                .bael-branch-item:hover {
                    border-color: rgba(255, 51, 102, 0.3);
                }

                .bael-branch-item.active {
                    border-color: var(--bael-accent, #ff3366);
                    background: rgba(255, 51, 102, 0.05);
                }

                .bael-branch-item.active::before {
                    content: '';
                    position: absolute;
                    left: 0;
                    top: 0;
                    bottom: 0;
                    width: 4px;
                    background: var(--bael-accent, #ff3366);
                    border-radius: 10px 0 0 10px;
                }

                .bael-branch-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 8px;
                }

                .bael-branch-color {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }

                .bael-branch-name {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                    flex: 1;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .bael-branch-badge {
                    padding: 2px 6px;
                    background: var(--bael-accent, #ff3366);
                    border-radius: 8px;
                    font-size: 9px;
                    font-weight: 700;
                    color: #fff;
                }

                .bael-branch-meta {
                    display: flex;
                    gap: 12px;
                    font-size: 10px;
                    color: var(--bael-text-muted, #666);
                }

                .bael-branch-meta span {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .bael-branch-actions {
                    display: flex;
                    gap: 6px;
                    margin-top: 10px;
                    padding-top: 10px;
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                }

                .bael-branch-action {
                    flex: 1;
                    padding: 6px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-muted, #888);
                    font-size: 10px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .bael-branch-action:hover {
                    border-color: var(--bael-accent, #ff3366);
                    color: var(--bael-text-primary, #fff);
                }

                .bael-branch-action.delete:hover {
                    border-color: #ff4444;
                    color: #ff4444;
                }

                .bael-branches-trigger {
                    position: fixed;
                    top: 60px;
                    left: 20px;
                    width: 44px;
                    height: 44px;
                    background: linear-gradient(135deg, #22c55e 0%, #4ade80 100%);
                    border: none;
                    border-radius: 12px;
                    color: #fff;
                    font-size: 20px;
                    cursor: pointer;
                    box-shadow: 0 4px 16px rgba(34, 197, 94, 0.4);
                    z-index: 7499;
                    transition: all 0.3s ease;
                }

                .bael-branches-trigger:hover {
                    transform: scale(1.08);
                    box-shadow: 0 6px 24px rgba(34, 197, 94, 0.5);
                }

                .bael-branches-trigger.hidden {
                    opacity: 0;
                    pointer-events: none;
                }

                .bael-branches-trigger .count {
                    position: absolute;
                    top: -4px;
                    right: -4px;
                    background: var(--bael-accent, #ff3366);
                    color: #fff;
                    font-size: 10px;
                    font-weight: 700;
                    padding: 2px 6px;
                    border-radius: 10px;
                    min-width: 16px;
                    text-align: center;
                }

                /* Current branch indicator in header */
                .bael-current-branch-indicator {
                    position: fixed;
                    top: 10px;
                    left: 70px;
                    padding: 6px 14px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    color: var(--bael-text-primary, #fff);
                    z-index: 5000;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .bael-current-branch-indicator:hover {
                    border-color: var(--bael-accent, #ff3366);
                }

                .bael-current-branch-indicator .dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                }

                /* Branch tree visualization */
                .bael-branch-tree {
                    padding: 16px 12px;
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                    font-family: monospace;
                    font-size: 11px;
                    color: var(--bael-text-muted, #888);
                    max-height: 150px;
                    overflow-y: auto;
                }

                .bael-tree-node {
                    margin-left: 16px;
                    position: relative;
                }

                .bael-tree-node::before {
                    content: '├─';
                    position: absolute;
                    left: -16px;
                    color: var(--bael-border, #2a2a3a);
                }

                .bael-tree-node:last-child::before {
                    content: '└─';
                }

                .bael-tree-label {
                    padding: 2px 6px;
                    border-radius: 4px;
                    cursor: pointer;
                }

                .bael-tree-label:hover {
                    background: rgba(255, 51, 102, 0.1);
                }

                .bael-tree-label.active {
                    background: var(--bael-accent, #ff3366);
                    color: #fff;
                }

                /* Create branch modal */
                .bael-create-branch-modal {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 360px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 14px;
                    padding: 20px;
                    z-index: 10100;
                    display: none;
                }

                .bael-create-branch-modal.visible {
                    display: block;
                }

                .bael-create-branch-modal h3 {
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                    margin: 0 0 16px 0;
                }

                .bael-branch-colors {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                    margin-top: 8px;
                }

                .bael-color-option {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    border: 2px solid transparent;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .bael-color-option:hover {
                    transform: scale(1.1);
                }

                .bael-color-option.selected {
                    border-color: #fff;
                    box-shadow: 0 0 10px currentColor;
                }
            `;
      document.head.appendChild(styles);

      // Panel
      this.panel = document.createElement("div");
      this.panel.className = "bael-branches-panel";
      this.panel.innerHTML = this.renderPanel();
      document.body.appendChild(this.panel);

      // Create modal
      this.modal = document.createElement("div");
      this.modal.className = "bael-create-branch-modal";
      this.modal.innerHTML = this.renderModal();
      document.body.appendChild(this.modal);

      // Trigger
      this.trigger = document.createElement("button");
      this.trigger.className = "bael-branches-trigger";
      const branchCount = Object.keys(this.branches).length;
      this.trigger.innerHTML = `🌿<span class="count">${branchCount}</span>`;
      this.trigger.title = "Conversation Branches";
      document.body.appendChild(this.trigger);

      // Current branch indicator
      this.indicator = document.createElement("div");
      this.indicator.className = "bael-current-branch-indicator";
      this.updateIndicator();
      document.body.appendChild(this.indicator);
    }

    renderPanel() {
      return `
                <div class="bael-branches-header">
                    <div class="bael-branches-title">
                        <span>🌿</span>
                        <span>Branches</span>
                    </div>
                    <button class="bael-branches-close">✕</button>
                </div>
                <div class="bael-branches-actions">
                    <button class="bael-new-branch-btn">
                        <span>+</span>
                        <span>Fork Conversation</span>
                    </button>
                </div>
                <div class="bael-branches-list" id="branches-list">
                    ${this.renderBranchList()}
                </div>
                <div class="bael-branch-tree" id="branch-tree">
                    ${this.renderTree()}
                </div>
            `;
    }

    renderBranchList() {
      return Object.values(this.branches)
        .map(
          (branch) => `
                <div class="bael-branch-item ${branch.id === this.currentBranch ? "active" : ""}" data-branch="${branch.id}">
                    <div class="bael-branch-header">
                        <div class="bael-branch-color" style="background: ${branch.color}"></div>
                        <div class="bael-branch-name">${branch.name}</div>
                        ${branch.id === this.currentBranch ? '<span class="bael-branch-badge">ACTIVE</span>' : ""}
                    </div>
                    <div class="bael-branch-meta">
                        <span>💬 ${branch.messageCount} msgs</span>
                        <span>🕐 ${this.formatTime(branch.createdAt)}</span>
                    </div>
                    <div class="bael-branch-actions">
                        <button class="bael-branch-action switch" data-branch="${branch.id}">
                            ${branch.id === this.currentBranch ? "✓ Active" : "⤵ Switch"}
                        </button>
                        <button class="bael-branch-action fork" data-branch="${branch.id}">🔀 Fork</button>
                        ${branch.id !== "main" ? `<button class="bael-branch-action delete" data-branch="${branch.id}">🗑️</button>` : ""}
                    </div>
                </div>
            `,
        )
        .join("");
    }

    renderTree() {
      let tree = '<span class="bael-tree-label active">main</span>\n';

      const children = Object.values(this.branches).filter(
        (b) => b.parentBranch === "main" && b.id !== "main",
      );
      children.forEach((child) => {
        tree += `<div class="bael-tree-node"><span class="bael-tree-label">${child.name}</span></div>`;
      });

      return tree;
    }

    renderModal() {
      const colors = [
        "#ff3366",
        "#22c55e",
        "#3b82f6",
        "#8b5cf6",
        "#f97316",
        "#06b6d4",
        "#eab308",
        "#ec4899",
      ];

      return `
                <h3>🌿 Create New Branch</h3>
                <div class="bael-form-group">
                    <label class="bael-form-label">Branch Name</label>
                    <input type="text" class="bael-form-input" id="branch-name" placeholder="e.g., Alternative approach">
                </div>
                <div class="bael-form-group">
                    <label class="bael-form-label">Color</label>
                    <div class="bael-branch-colors" id="branch-colors">
                        ${colors.map((c, i) => `<button class="bael-color-option ${i === 0 ? "selected" : ""}" data-color="${c}" style="background: ${c}"></button>`).join("")}
                    </div>
                </div>
                <div class="bael-form-actions">
                    <button class="bael-form-btn secondary" id="cancel-branch">Cancel</button>
                    <button class="bael-form-btn primary" id="create-branch">Create Branch</button>
                </div>
            `;
    }

    bindEvents() {
      // Trigger
      this.trigger.addEventListener("click", () => this.toggle());
      this.indicator.addEventListener("click", () => this.toggle());

      // Close
      this.panel
        .querySelector(".bael-branches-close")
        .addEventListener("click", () => this.hide());

      // New branch
      this.panel
        .querySelector(".bael-new-branch-btn")
        .addEventListener("click", () => {
          this.modal.classList.add("visible");
        });

      this.modal
        .querySelector("#cancel-branch")
        .addEventListener("click", () => {
          this.modal.classList.remove("visible");
        });

      this.modal
        .querySelector("#create-branch")
        .addEventListener("click", () => {
          this.createBranch();
        });

      // Color selection
      this.modal
        .querySelector("#branch-colors")
        .addEventListener("click", (e) => {
          if (e.target.classList.contains("bael-color-option")) {
            this.modal
              .querySelectorAll(".bael-color-option")
              .forEach((o) => o.classList.remove("selected"));
            e.target.classList.add("selected");
          }
        });

      // Branch actions
      this.panel
        .querySelector("#branches-list")
        .addEventListener("click", (e) => {
          const btn = e.target.closest(".bael-branch-action");
          if (!btn) return;

          const branchId = btn.dataset.branch;
          if (btn.classList.contains("switch")) this.switchBranch(branchId);
          else if (btn.classList.contains("fork")) this.forkBranch(branchId);
          else if (btn.classList.contains("delete"))
            this.deleteBranch(branchId);
        });

      // Click branch item to switch
      this.panel
        .querySelector("#branches-list")
        .addEventListener("click", (e) => {
          const item = e.target.closest(".bael-branch-item");
          if (item && !e.target.closest(".bael-branch-action")) {
            this.switchBranch(item.dataset.branch);
          }
        });

      // Keyboard
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "B") {
          e.preventDefault();
          this.toggle();
        }
        if (e.key === "Escape") {
          this.modal.classList.remove("visible");
          if (this.isVisible) this.hide();
        }
      });
    }

    toggle() {
      if (this.isVisible) {
        this.hide();
      } else {
        this.show();
      }
    }

    show() {
      this.isVisible = true;
      this.panel.classList.add("visible");
      this.trigger.classList.add("hidden");
      this.refreshList();
    }

    hide() {
      this.isVisible = false;
      this.panel.classList.remove("visible");
      this.trigger.classList.remove("hidden");
    }

    refreshList() {
      this.panel.querySelector("#branches-list").innerHTML =
        this.renderBranchList();
      this.panel.querySelector("#branch-tree").innerHTML = this.renderTree();
      this.updateTrigger();
    }

    updateTrigger() {
      const count = Object.keys(this.branches).length;
      this.trigger.querySelector(".count").textContent = count;
    }

    updateIndicator() {
      const branch = this.branches[this.currentBranch];
      if (branch) {
        this.indicator.innerHTML = `
                    <span class="dot" style="background: ${branch.color}"></span>
                    <span>${branch.name}</span>
                `;
      }
    }

    createBranch() {
      const name = this.modal.querySelector("#branch-name").value.trim();
      const color =
        this.modal.querySelector(".bael-color-option.selected")?.dataset
          .color || "#ff3366";

      if (!name) {
        if (window.BaelNotifications) {
          window.BaelNotifications.error("Branch name is required");
        }
        return;
      }

      const id = `branch-${Date.now()}`;
      this.branches[id] = {
        id,
        name,
        color,
        createdAt: Date.now(),
        messageCount: 0,
        parentBranch: this.currentBranch,
        forkPoint: Date.now(),
      };

      this.saveBranches();
      this.switchBranch(id);

      this.modal.querySelector("#branch-name").value = "";
      this.modal.classList.remove("visible");

      if (window.BaelNotifications) {
        window.BaelNotifications.success(`Branch "${name}" created!`);
      }
    }

    switchBranch(branchId) {
      if (!this.branches[branchId]) return;

      this.currentBranch = branchId;
      this.refreshList();
      this.updateIndicator();

      // Emit event for the chat to respond
      document.dispatchEvent(
        new CustomEvent("bael-branch-switched", {
          detail: { branch: this.branches[branchId] },
        }),
      );

      if (window.BaelNotifications) {
        window.BaelNotifications.info(
          `Switched to "${this.branches[branchId].name}"`,
        );
      }
    }

    forkBranch(branchId) {
      this.modal.classList.add("visible");
      // Pre-fill with fork name
      this.modal.querySelector("#branch-name").value =
        `Fork of ${this.branches[branchId].name}`;
    }

    deleteBranch(branchId) {
      if (branchId === "main") return;

      const branch = this.branches[branchId];
      if (confirm(`Delete branch "${branch.name}"?`)) {
        delete this.branches[branchId];

        if (this.currentBranch === branchId) {
          this.currentBranch = "main";
        }

        this.saveBranches();
        this.refreshList();
        this.updateIndicator();

        if (window.BaelNotifications) {
          window.BaelNotifications.info("Branch deleted");
        }
      }
    }

    formatTime(timestamp) {
      const diff = Date.now() - timestamp;
      const mins = Math.floor(diff / 60000);
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `${hours}h ago`;
      return `${Math.floor(hours / 24)}d ago`;
    }

    // Public API
    getCurrentBranch() {
      return this.branches[this.currentBranch];
    }

    incrementMessageCount() {
      if (this.branches[this.currentBranch]) {
        this.branches[this.currentBranch].messageCount++;
        this.saveBranches();
      }
    }
  }

  // Initialize
  window.BaelConversationBranches = new BaelConversationBranches();
})();
