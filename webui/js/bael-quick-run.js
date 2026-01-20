/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █  ██████╗ ██╗   ██╗██╗ ██████╗██╗  ██╗    ██████╗ ██╗   ██╗███╗   ██╗     █
 * █  ██╔═══██╗██║   ██║██║██╔════╝██║ ██╔╝    ██╔══██╗██║   ██║████╗  ██║     █
 * █  ██║   ██║██║   ██║██║██║     █████╔╝     ██████╔╝██║   ██║██╔██╗ ██║     █
 * █  ██║▄▄ ██║██║   ██║██║██║     ██╔═██╗     ██╔══██╗██║   ██║██║╚██╗██║     █
 * █  ╚██████╔╝╚██████╔╝██║╚██████╗██║  ██╗    ██║  ██║╚██████╔╝██║ ╚████║     █
 * █   ╚══▀▀═╝  ╚═════╝ ╚═╝ ╚═════╝╚═╝  ╚═╝    ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝     █
 * █                                                                          █
 * █   BAEL QUICK RUN - One-Click Script & Command Execution                 █
 * █   Save and run frequently used commands, scripts, and snippets          █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  class BaelQuickRun {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
      this.scripts = [];
      this.storageKey = "bael-quick-run";

      // Default scripts
      this.defaultScripts = [
        {
          id: "def-1",
          name: "List Files",
          icon: "📁",
          command: "ls -la",
          type: "bash",
          category: "system",
        },
        {
          id: "def-2",
          name: "Git Status",
          icon: "📊",
          command: "git status",
          type: "bash",
          category: "git",
        },
        {
          id: "def-3",
          name: "Git Pull",
          icon: "⬇️",
          command: "git pull",
          type: "bash",
          category: "git",
        },
        {
          id: "def-4",
          name: "Python Version",
          icon: "🐍",
          command: "python --version",
          type: "bash",
          category: "python",
        },
        {
          id: "def-5",
          name: "Node Version",
          icon: "💚",
          command: "node --version",
          type: "bash",
          category: "node",
        },
        {
          id: "def-6",
          name: "Disk Usage",
          icon: "💾",
          command: "df -h",
          type: "bash",
          category: "system",
        },
        {
          id: "def-7",
          name: "Memory Info",
          icon: "🧠",
          command: "free -h || vm_stat",
          type: "bash",
          category: "system",
        },
        {
          id: "def-8",
          name: "Process List",
          icon: "⚙️",
          command: "ps aux | head -20",
          type: "bash",
          category: "system",
        },
      ];
    }

    async initialize() {
      console.log("🚀 Bael Quick Run initializing...");

      this.loadFromStorage();
      this.injectStyles();
      this.createPanel();
      this.createFAB();
      this.setupShortcuts();

      this.initialized = true;
      console.log("✅ BAEL QUICK RUN READY (Ctrl+Shift+R)");

      return this;
    }

    injectStyles() {
      if (document.getElementById("bael-quickrun-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-quickrun-styles";
      styles.textContent = `
                /* FAB */
                .bael-quickrun-fab {
                    position: fixed;
                    right: 20px;
                    bottom: 180px;
                    width: 44px;
                    height: 44px;
                    border-radius: 12px;
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                    border: none;
                    color: #fff;
                    font-size: 18px;
                    cursor: pointer;
                    z-index: 9300;
                    box-shadow: 0 4px 15px rgba(245, 158, 11, 0.4);
                    transition: all 0.3s;
                }

                .bael-quickrun-fab:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 20px rgba(245, 158, 11, 0.5);
                }

                /* Panel */
                .bael-quickrun-panel {
                    position: fixed;
                    right: 20px;
                    bottom: 230px;
                    width: 340px;
                    max-height: 500px;
                    background: #12121a;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    z-index: 9400;
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
                }

                .bael-quickrun-panel.visible {
                    display: flex;
                    animation: quickrunIn 0.25s ease-out;
                }

                @keyframes quickrunIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }

                .quickrun-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px 16px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .quickrun-title {
                    font-size: 15px;
                    font-weight: 700;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .quickrun-actions {
                    display: flex;
                    gap: 4px;
                }

                .quickrun-action {
                    width: 28px;
                    height: 28px;
                    border-radius: 8px;
                    border: none;
                    background: transparent;
                    color: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    font-size: 14px;
                }

                .quickrun-action:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                }

                /* Tabs */
                .quickrun-tabs {
                    display: flex;
                    padding: 8px 12px;
                    gap: 4px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .quickrun-tab {
                    flex: 1;
                    padding: 8px;
                    border-radius: 8px;
                    border: none;
                    background: transparent;
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .quickrun-tab:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: rgba(255, 255, 255, 0.8);
                }

                .quickrun-tab.active {
                    background: rgba(245, 158, 11, 0.15);
                    color: #f59e0b;
                }

                /* Script List */
                .quickrun-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 8px;
                    max-height: 350px;
                }

                .quickrun-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 12px;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s;
                    margin-bottom: 4px;
                }

                .quickrun-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                }

                .quickrun-item-icon {
                    font-size: 18px;
                    width: 32px;
                    height: 32px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 8px;
                }

                .quickrun-item-info {
                    flex: 1;
                    min-width: 0;
                }

                .quickrun-item-name {
                    font-size: 13px;
                    font-weight: 600;
                    color: #fff;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .quickrun-item-command {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.4);
                    font-family: monospace;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .quickrun-item-run {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    border: none;
                    background: rgba(245, 158, 11, 0.15);
                    color: #f59e0b;
                    cursor: pointer;
                    font-size: 14px;
                    opacity: 0;
                    transition: all 0.2s;
                }

                .quickrun-item:hover .quickrun-item-run {
                    opacity: 1;
                }

                .quickrun-item-run:hover {
                    background: #f59e0b;
                    color: #000;
                }

                /* Add Form */
                .quickrun-add {
                    padding: 12px;
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                }

                .quickrun-add-toggle {
                    width: 100%;
                    padding: 10px;
                    border-radius: 8px;
                    border: 2px dashed rgba(255, 255, 255, 0.1);
                    background: transparent;
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .quickrun-add-toggle:hover {
                    border-color: rgba(245, 158, 11, 0.3);
                    color: #f59e0b;
                }

                .quickrun-add-form {
                    display: none;
                }

                .quickrun-add-form.visible {
                    display: block;
                    animation: formIn 0.2s ease-out;
                }

                @keyframes formIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .quickrun-add-row {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 8px;
                }

                .quickrun-add-input {
                    flex: 1;
                    padding: 8px 10px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 8px;
                    color: #fff;
                    font-size: 12px;
                    outline: none;
                }

                .quickrun-add-input:focus {
                    border-color: rgba(245, 158, 11, 0.5);
                }

                .quickrun-add-input.small {
                    width: 50px;
                    flex: none;
                    text-align: center;
                }

                .quickrun-add-btn {
                    padding: 8px 16px;
                    border-radius: 8px;
                    border: none;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                }

                .quickrun-add-btn.primary {
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                    color: #fff;
                }

                .quickrun-add-btn.secondary {
                    background: rgba(255, 255, 255, 0.05);
                    color: rgba(255, 255, 255, 0.6);
                }

                .quickrun-empty {
                    text-align: center;
                    padding: 30px;
                    color: rgba(255, 255, 255, 0.4);
                    font-size: 13px;
                }

                .quickrun-empty-icon {
                    font-size: 32px;
                    opacity: 0.5;
                    margin-bottom: 8px;
                }

                /* Category Badge */
                .quickrun-badge {
                    font-size: 9px;
                    padding: 2px 6px;
                    border-radius: 4px;
                    background: rgba(255, 255, 255, 0.08);
                    color: rgba(255, 255, 255, 0.5);
                    margin-left: 8px;
                    text-transform: uppercase;
                }
            `;
      document.head.appendChild(styles);
    }

    createFAB() {
      this.fab = document.createElement("button");
      this.fab.className = "bael-quickrun-fab";
      this.fab.innerHTML = "⚡";
      this.fab.title = "Quick Run (Ctrl+Shift+R)";
      this.fab.onclick = () => this.toggle();
      document.body.appendChild(this.fab);
    }

    createPanel() {
      this.panel = document.createElement("div");
      this.panel.className = "bael-quickrun-panel";
      this.renderPanel();
      document.body.appendChild(this.panel);
    }

    renderPanel() {
      const allScripts = [...this.defaultScripts, ...this.scripts];
      const categories = [
        ...new Set(allScripts.map((s) => s.category || "other")),
      ];

      this.panel.innerHTML = `
                <div class="quickrun-header">
                    <div class="quickrun-title">
                        <span>⚡</span>
                        Quick Run
                    </div>
                    <div class="quickrun-actions">
                        <button class="quickrun-action" onclick="BaelQuickRun.toggleAddForm()" title="Add Script">➕</button>
                        <button class="quickrun-action" onclick="BaelQuickRun.hide()" title="Close">✕</button>
                    </div>
                </div>

                <div class="quickrun-tabs" id="quickrun-tabs">
                    <button class="quickrun-tab active" data-category="all" onclick="BaelQuickRun.filterCategory('all')">All</button>
                    ${categories
                      .slice(0, 4)
                      .map(
                        (cat) => `
                        <button class="quickrun-tab" data-category="${cat}" onclick="BaelQuickRun.filterCategory('${cat}')">${cat}</button>
                    `,
                      )
                      .join("")}
                </div>

                <div class="quickrun-list" id="quickrun-list">
                    ${this.renderScriptList(allScripts)}
                </div>

                <div class="quickrun-add">
                    <button class="quickrun-add-toggle" id="quickrun-add-toggle" onclick="BaelQuickRun.toggleAddForm()">
                        ➕ Add Custom Script
                    </button>
                    <div class="quickrun-add-form" id="quickrun-add-form">
                        <div class="quickrun-add-row">
                            <input type="text" class="quickrun-add-input small" id="add-icon" placeholder="🔧" maxlength="4">
                            <input type="text" class="quickrun-add-input" id="add-name" placeholder="Script name...">
                        </div>
                        <div class="quickrun-add-row">
                            <input type="text" class="quickrun-add-input" id="add-command" placeholder="Command or script...">
                        </div>
                        <div class="quickrun-add-row">
                            <input type="text" class="quickrun-add-input" id="add-category" placeholder="Category (optional)">
                            <button class="quickrun-add-btn secondary" onclick="BaelQuickRun.toggleAddForm()">Cancel</button>
                            <button class="quickrun-add-btn primary" onclick="BaelQuickRun.addScript()">Add</button>
                        </div>
                    </div>
                </div>
            `;
    }

    renderScriptList(scripts) {
      if (scripts.length === 0) {
        return `
                    <div class="quickrun-empty">
                        <div class="quickrun-empty-icon">⚡</div>
                        <div>No scripts found</div>
                    </div>
                `;
      }

      return scripts
        .map(
          (script) => `
                <div class="quickrun-item" data-category="${script.category || "other"}">
                    <div class="quickrun-item-icon">${script.icon || "⚡"}</div>
                    <div class="quickrun-item-info">
                        <div class="quickrun-item-name">
                            ${this.escapeHtml(script.name)}
                            ${script.category ? `<span class="quickrun-badge">${script.category}</span>` : ""}
                        </div>
                        <div class="quickrun-item-command">${this.escapeHtml(script.command)}</div>
                    </div>
                    <button class="quickrun-item-run" onclick="BaelQuickRun.runScript('${script.id}')" title="Run">▶</button>
                </div>
            `,
        )
        .join("");
    }

    filterCategory(category) {
      // Update tabs
      document.querySelectorAll(".quickrun-tab").forEach((tab) => {
        tab.classList.toggle("active", tab.dataset.category === category);
      });

      // Filter items
      const items = document.querySelectorAll(".quickrun-item");
      items.forEach((item) => {
        if (category === "all") {
          item.style.display = "flex";
        } else {
          item.style.display =
            item.dataset.category === category ? "flex" : "none";
        }
      });
    }

    toggleAddForm() {
      const form = document.getElementById("quickrun-add-form");
      const toggle = document.getElementById("quickrun-add-toggle");

      if (form.classList.contains("visible")) {
        form.classList.remove("visible");
        toggle.style.display = "block";
      } else {
        form.classList.add("visible");
        toggle.style.display = "none";
        document.getElementById("add-icon").focus();
      }
    }

    addScript() {
      const icon = document.getElementById("add-icon")?.value.trim() || "⚡";
      const name = document.getElementById("add-name")?.value.trim();
      const command = document.getElementById("add-command")?.value.trim();
      const category =
        document.getElementById("add-category")?.value.trim() || "custom";

      if (!name || !command) {
        this.showToast("Please fill in name and command");
        return;
      }

      this.scripts.push({
        id: "script-" + Date.now(),
        icon,
        name,
        command,
        category,
        type: "bash",
        createdAt: Date.now(),
      });

      this.saveToStorage();
      this.renderPanel();
      this.showToast("Script added!");
    }

    runScript(id) {
      const allScripts = [...this.defaultScripts, ...this.scripts];
      const script = allScripts.find((s) => s.id === id);

      if (!script) return;

      // Insert into chat input
      const chatInput = document.querySelector(
        'textarea[placeholder*="message"], #chat-input, [contenteditable="true"]',
      );
      if (chatInput) {
        const prompt = `Run this command: \`${script.command}\``;

        if (chatInput.tagName === "TEXTAREA" || chatInput.tagName === "INPUT") {
          chatInput.value = prompt;
          chatInput.dispatchEvent(new Event("input", { bubbles: true }));
        } else {
          chatInput.innerText = prompt;
        }

        chatInput.focus();
        this.showToast(`Ready to run: ${script.name}`);
        this.hide();
      }
    }

    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }

    showToast(message) {
      const toast = document.createElement("div");
      toast.style.cssText = `
                position: fixed;
                bottom: 80px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(245, 158, 11, 0.9);
                color: #000;
                padding: 10px 20px;
                border-radius: 8px;
                font-size: 13px;
                font-weight: 500;
                z-index: 9999;
            `;
      toast.textContent = message;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
    }

    saveToStorage() {
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.scripts));
      } catch (e) {
        console.error("Failed to save scripts:", e);
      }
    }

    loadFromStorage() {
      try {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          this.scripts = JSON.parse(saved);
        }
      } catch (e) {
        console.error("Failed to load scripts:", e);
      }
    }

    setupShortcuts() {
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "R") {
          e.preventDefault();
          this.toggle();
        }

        if (e.key === "Escape" && this.visible) {
          this.hide();
        }
      });
    }

    toggle() {
      if (this.visible) {
        this.hide();
      } else {
        this.show();
      }
    }

    show() {
      this.visible = true;
      this.renderPanel();
      this.panel.classList.add("visible");
    }

    hide() {
      this.visible = false;
      this.panel.classList.remove("visible");
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  window.BaelQuickRun = new BaelQuickRun();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelQuickRun.initialize();
    });
  } else {
    window.BaelQuickRun.initialize();
  }

  console.log("⚡ Bael Quick Run loaded");
})();
