/**
 * BAEL - LORD OF ALL
 * Chat Branching - Fork conversations into parallel timelines
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelBranching {
    constructor() {
      this.branches = new Map();
      this.currentBranch = "main";
      this.panel = null;
      this.init();
    }

    init() {
      this.loadBranches();
      this.addStyles();
      this.createUI();
      this.bindEvents();
      console.log("🌿 Bael Branching initialized");
    }

    loadBranches() {
      try {
        const saved = JSON.parse(localStorage.getItem("bael_branches") || "{}");
        this.branches = new Map(Object.entries(saved));
        this.currentBranch =
          localStorage.getItem("bael_current_branch") || "main";
      } catch (e) {
        this.branches = new Map();
        this.currentBranch = "main";
      }

      // Ensure main branch exists
      if (!this.branches.has("main")) {
        this.branches.set("main", {
          id: "main",
          name: "Main",
          created: Date.now(),
          parent: null,
          forkPoint: null,
          messages: [],
        });
      }
    }

    saveBranches() {
      const obj = Object.fromEntries(this.branches);
      localStorage.setItem("bael_branches", JSON.stringify(obj));
      localStorage.setItem("bael_current_branch", this.currentBranch);
    }

    addStyles() {
      const styles = document.createElement("style");
      styles.id = "bael-branching-styles";
      styles.textContent = `
                /* Branch Indicator */
                .bael-branch-indicator {
                    position: fixed;
                    top: 60px;
                    left: 50%;
                    transform: translateX(-50%);
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 20px;
                    padding: 6px 14px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    color: var(--bael-text-primary, #fff);
                    z-index: 100008;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .bael-branch-indicator:hover {
                    border-color: var(--bael-accent, #ff3366);
                }

                .branch-icon {
                    font-size: 14px;
                }

                .branch-name {
                    font-weight: 500;
                }

                .branch-dropdown {
                    font-size: 10px;
                    color: var(--bael-text-muted, #666);
                }

                /* Branch Panel */
                .bael-branch-panel {
                    position: fixed;
                    top: 100px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 400px;
                    max-height: 500px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 16px;
                    z-index: 100020;
                    display: none;
                    flex-direction: column;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
                    overflow: hidden;
                }

                .bael-branch-panel.visible {
                    display: flex;
                    animation: branchAppear 0.2s ease;
                }

                @keyframes branchAppear {
                    from { opacity: 0; transform: translateX(-50%) translateY(-10px); }
                    to { opacity: 1; transform: translateX(-50%) translateY(0); }
                }

                /* Header */
                .branch-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px 16px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .branch-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .branch-close {
                    width: 28px;
                    height: 28px;
                    background: transparent;
                    border: none;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    border-radius: 6px;
                    font-size: 16px;
                }

                .branch-close:hover {
                    background: rgba(255, 51, 102, 0.2);
                    color: var(--bael-accent, #ff3366);
                }

                /* Branch List */
                .branch-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 12px;
                }

                .branch-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 10px;
                    margin-bottom: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .branch-item:hover {
                    border-color: var(--bael-accent, #ff3366);
                }

                .branch-item.active {
                    border-color: var(--bael-accent, #ff3366);
                    background: var(--bael-bg-tertiary, #181820);
                }

                .branch-marker {
                    width: 32px;
                    height: 32px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 2px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    flex-shrink: 0;
                }

                .branch-item.active .branch-marker {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                }

                .branch-info {
                    flex: 1;
                    min-width: 0;
                }

                .branch-item-name {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                    margin-bottom: 4px;
                }

                .branch-meta {
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                }

                .branch-actions {
                    display: flex;
                    gap: 6px;
                    opacity: 0;
                    transition: opacity 0.2s ease;
                }

                .branch-item:hover .branch-actions {
                    opacity: 1;
                }

                .branch-action-btn {
                    width: 26px;
                    height: 26px;
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    font-size: 11px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .branch-action-btn:hover {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                    color: white;
                }

                .branch-action-btn.delete:hover {
                    background: #f87171;
                    border-color: #f87171;
                }

                /* Tree Visualization */
                .branch-tree {
                    padding: 12px;
                    background: var(--bael-bg-tertiary, #181820);
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                }

                .tree-title {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--bael-text-muted, #666);
                    margin-bottom: 10px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .tree-container {
                    font-family: monospace;
                    font-size: 11px;
                    color: var(--bael-text-primary, #fff);
                    line-height: 1.6;
                }

                .tree-node {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .tree-node.current {
                    color: var(--bael-accent, #ff3366);
                }

                /* Footer */
                .branch-footer {
                    padding: 12px 16px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                }

                .branch-create-btn {
                    width: 100%;
                    padding: 10px;
                    background: var(--bael-accent, #ff3366);
                    border: none;
                    border-radius: 8px;
                    color: white;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .branch-create-btn:hover {
                    filter: brightness(1.1);
                }

                /* Fork Button (appears on messages) */
                .bael-fork-btn {
                    position: absolute;
                    right: 10px;
                    bottom: 10px;
                    width: 28px;
                    height: 28px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    font-size: 12px;
                    opacity: 0;
                    transition: all 0.2s ease;
                }

                .message:hover .bael-fork-btn {
                    opacity: 1;
                }

                .bael-fork-btn:hover {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                    color: white;
                }

                /* Rename Modal */
                .branch-rename-modal {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.7);
                    z-index: 100030;
                    display: none;
                    align-items: center;
                    justify-content: center;
                }

                .branch-rename-modal.visible {
                    display: flex;
                }

                .rename-dialog {
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 12px;
                    padding: 20px;
                    width: 300px;
                }

                .rename-input {
                    width: 100%;
                    padding: 10px 12px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 14px;
                    margin-bottom: 12px;
                }

                .rename-actions {
                    display: flex;
                    gap: 10px;
                    justify-content: flex-end;
                }

                .rename-btn {
                    padding: 8px 16px;
                    border-radius: 6px;
                    font-size: 12px;
                    cursor: pointer;
                }

                .rename-btn.cancel {
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    color: var(--bael-text-muted, #666);
                }

                .rename-btn.save {
                    background: var(--bael-accent, #ff3366);
                    border: none;
                    color: white;
                }
            `;
      document.head.appendChild(styles);
    }

    createUI() {
      // Branch Indicator
      const indicator = document.createElement("div");
      indicator.className = "bael-branch-indicator";
      indicator.innerHTML = `
                <span class="branch-icon">🌿</span>
                <span class="branch-name" id="current-branch-name">${this.getCurrentBranchName()}</span>
                <span class="branch-dropdown">▾</span>
            `;
      document.body.appendChild(indicator);
      this.indicator = indicator;

      // Branch Panel
      const panel = document.createElement("div");
      panel.className = "bael-branch-panel";
      panel.innerHTML = this.renderPanel();
      document.body.appendChild(panel);
      this.panel = panel;

      this.bindIndicatorEvents();
      this.bindPanelEvents();
    }

    renderPanel() {
      const branchesArray = [...this.branches.values()];

      return `
                <div class="branch-header">
                    <div class="branch-title">
                        <span>🌿</span>
                        <span>Conversation Branches</span>
                    </div>
                    <button class="branch-close">×</button>
                </div>

                <div class="branch-list">
                    ${branchesArray.map((branch) => this.renderBranchItem(branch)).join("")}
                </div>

                <div class="branch-tree">
                    <div class="tree-title">Branch Tree</div>
                    <div class="tree-container">
                        ${this.renderTree()}
                    </div>
                </div>

                <div class="branch-footer">
                    <button class="branch-create-btn" id="create-branch">
                        ➕ Fork from Current Message
                    </button>
                </div>
            `;
    }

    renderBranchItem(branch) {
      const isActive = branch.id === this.currentBranch;
      const isMain = branch.id === "main";
      const messageCount = branch.messages?.length || 0;
      const created = new Date(branch.created).toLocaleDateString();

      return `
                <div class="branch-item ${isActive ? "active" : ""}" data-id="${branch.id}">
                    <div class="branch-marker">${isActive ? "●" : "○"}</div>
                    <div class="branch-info">
                        <div class="branch-item-name">${this.escapeHtml(branch.name)}</div>
                        <div class="branch-meta">
                            ${messageCount} message${messageCount !== 1 ? "s" : ""} • Created ${created}
                            ${branch.parent ? ` • Forked from ${branch.parent}` : ""}
                        </div>
                    </div>
                    <div class="branch-actions">
                        <button class="branch-action-btn rename" title="Rename">✏️</button>
                        ${!isMain ? `<button class="branch-action-btn merge" title="Merge">🔀</button>` : ""}
                        ${!isMain ? `<button class="branch-action-btn delete" title="Delete">🗑️</button>` : ""}
                    </div>
                </div>
            `;
    }

    renderTree() {
      const tree = this.buildTree();
      return this.renderTreeNode(tree, "", true);
    }

    buildTree() {
      // Build tree structure
      const nodes = new Map();

      this.branches.forEach((branch, id) => {
        nodes.set(id, { ...branch, children: [] });
      });

      // Link children to parents
      nodes.forEach((node, id) => {
        if (node.parent && nodes.has(node.parent)) {
          nodes.get(node.parent).children.push(node);
        }
      });

      return nodes.get("main") || { name: "main", children: [] };
    }

    renderTreeNode(node, prefix = "", isLast = true) {
      if (!node) return "";

      const isCurrent = node.id === this.currentBranch;
      const connector = isLast ? "└── " : "├── ";
      const childPrefix = prefix + (isLast ? "    " : "│   ");

      let html = `<div class="tree-node ${isCurrent ? "current" : ""}">${prefix}${connector}${node.name}${isCurrent ? " ←" : ""}</div>`;

      if (node.children && node.children.length > 0) {
        node.children.forEach((child, index) => {
          const isChildLast = index === node.children.length - 1;
          html += this.renderTreeNode(child, childPrefix, isChildLast);
        });
      }

      return html;
    }

    bindIndicatorEvents() {
      this.indicator.addEventListener("click", () => this.togglePanel());
    }

    bindPanelEvents() {
      this.panel
        .querySelector(".branch-close")
        .addEventListener("click", () => this.closePanel());
      this.panel
        .querySelector("#create-branch")
        .addEventListener("click", () => this.createBranch());

      // Branch item clicks
      this.panel.querySelectorAll(".branch-item").forEach((item) => {
        item.addEventListener("click", (e) => {
          if (e.target.closest(".branch-actions")) return;
          const id = item.dataset.id;
          this.switchBranch(id);
        });

        // Action buttons
        const renameBtn = item.querySelector(".rename");
        const mergeBtn = item.querySelector(".merge");
        const deleteBtn = item.querySelector(".delete");

        renameBtn?.addEventListener("click", (e) => {
          e.stopPropagation();
          this.showRenameDialog(item.dataset.id);
        });

        mergeBtn?.addEventListener("click", (e) => {
          e.stopPropagation();
          this.mergeBranch(item.dataset.id);
        });

        deleteBtn?.addEventListener("click", (e) => {
          e.stopPropagation();
          this.deleteBranch(item.dataset.id);
        });
      });
    }

    bindEvents() {
      // Keyboard shortcut
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "B") {
          e.preventDefault();
          this.togglePanel();
        }
      });

      // Add fork buttons to messages
      this.observeMessages();
    }

    observeMessages() {
      const observer = new MutationObserver(() => {
        // Add fork buttons to new messages
        document
          .querySelectorAll(".message:not([data-fork-btn])")
          .forEach((msg) => {
            msg.setAttribute("data-fork-btn", "true");
            msg.style.position = "relative";

            const btn = document.createElement("button");
            btn.className = "bael-fork-btn";
            btn.innerHTML = "🌿";
            btn.title = "Fork from this message";
            btn.addEventListener("click", (e) => {
              e.stopPropagation();
              this.forkFromMessage(msg);
            });
            msg.appendChild(btn);
          });
      });

      observer.observe(document.body, { childList: true, subtree: true });
    }

    togglePanel() {
      this.panel.classList.toggle("visible");
      if (this.panel.classList.contains("visible")) {
        this.refreshPanel();
      }
    }

    closePanel() {
      this.panel.classList.remove("visible");
    }

    refreshPanel() {
      this.panel.innerHTML = this.renderPanel();
      this.bindPanelEvents();
    }

    createBranch(forkPoint = null) {
      const id = "branch_" + Date.now();
      const name = "Branch " + this.branches.size;

      const branch = {
        id: id,
        name: name,
        created: Date.now(),
        parent: this.currentBranch,
        forkPoint: forkPoint,
        messages: [],
      };

      // Copy messages up to fork point from current branch
      const currentBranch = this.branches.get(this.currentBranch);
      if (currentBranch && currentBranch.messages) {
        branch.messages = [...currentBranch.messages];
      }

      this.branches.set(id, branch);
      this.saveBranches();
      this.switchBranch(id);

      if (window.BaelNotifications) {
        window.BaelNotifications.success(`Created branch "${name}"`);
      }
    }

    forkFromMessage(messageElement) {
      const messageIndex = Array.from(
        messageElement.parentElement?.children || [],
      ).indexOf(messageElement);
      this.createBranch(messageIndex);
    }

    switchBranch(id) {
      if (!this.branches.has(id)) return;

      this.currentBranch = id;
      this.saveBranches();
      this.updateIndicator();
      this.refreshPanel();

      // Dispatch event for other systems
      window.dispatchEvent(
        new CustomEvent("bael-branch-switch", {
          detail: { branch: this.branches.get(id) },
        }),
      );

      if (window.BaelNotifications) {
        window.BaelNotifications.info(
          `Switched to "${this.getCurrentBranchName()}"`,
        );
      }
    }

    showRenameDialog(id) {
      const branch = this.branches.get(id);
      if (!branch) return;

      const modal = document.createElement("div");
      modal.className = "branch-rename-modal visible";
      modal.innerHTML = `
                <div class="rename-dialog">
                    <input type="text" class="rename-input" value="${this.escapeHtml(branch.name)}" placeholder="Branch name">
                    <div class="rename-actions">
                        <button class="rename-btn cancel">Cancel</button>
                        <button class="rename-btn save">Save</button>
                    </div>
                </div>
            `;

      const input = modal.querySelector(".rename-input");
      const cancelBtn = modal.querySelector(".cancel");
      const saveBtn = modal.querySelector(".save");

      cancelBtn.addEventListener("click", () => modal.remove());
      saveBtn.addEventListener("click", () => {
        branch.name = input.value.trim() || branch.name;
        this.saveBranches();
        this.updateIndicator();
        this.refreshPanel();
        modal.remove();
      });

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") saveBtn.click();
        if (e.key === "Escape") modal.remove();
      });

      document.body.appendChild(modal);
      input.focus();
      input.select();
    }

    mergeBranch(id) {
      const branch = this.branches.get(id);
      if (!branch || id === "main") return;

      if (
        !confirm(
          `Merge "${branch.name}" into "${this.getCurrentBranchName()}"?`,
        )
      )
        return;

      const currentBranch = this.branches.get(this.currentBranch);
      if (currentBranch && branch.messages) {
        currentBranch.messages = [
          ...currentBranch.messages,
          ...branch.messages,
        ];
      }

      this.saveBranches();
      this.refreshPanel();

      if (window.BaelNotifications) {
        window.BaelNotifications.success(`Merged "${branch.name}"`);
      }
    }

    deleteBranch(id) {
      if (id === "main") return;
      const branch = this.branches.get(id);
      if (!branch) return;

      if (!confirm(`Delete branch "${branch.name}"?`)) return;

      // Switch to main if deleting current branch
      if (this.currentBranch === id) {
        this.currentBranch = "main";
      }

      this.branches.delete(id);
      this.saveBranches();
      this.updateIndicator();
      this.refreshPanel();

      if (window.BaelNotifications) {
        window.BaelNotifications.info(`Deleted branch "${branch.name}"`);
      }
    }

    getCurrentBranchName() {
      const branch = this.branches.get(this.currentBranch);
      return branch ? branch.name : "Main";
    }

    updateIndicator() {
      this.indicator.querySelector("#current-branch-name").textContent =
        this.getCurrentBranchName();
    }

    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }
  }

  // Initialize
  window.BaelBranching = new BaelBranching();
})();
