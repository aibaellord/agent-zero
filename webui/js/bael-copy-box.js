/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █   ██████╗ ██████╗ ██████╗ ██╗   ██╗    ██████╗  ██████╗ ██╗  ██╗        █
 * █  ██╔════╝██╔═══██╗██╔══██╗╚██╗ ██╔╝    ██╔══██╗██╔═══██╗╚██╗██╔╝        █
 * █  ██║     ██║   ██║██████╔╝ ╚████╔╝     ██████╔╝██║   ██║ ╚███╔╝         █
 * █  ██║     ██║   ██║██╔═══╝   ╚██╔╝      ██╔══██╗██║   ██║ ██╔██╗         █
 * █  ╚██████╗╚██████╔╝██║        ██║       ██████╔╝╚██████╔╝██╔╝ ██╗        █
 * █   ╚═════╝ ╚═════╝ ╚═╝        ╚═╝       ╚═════╝  ╚═════╝ ╚═╝  ╚═╝        █
 * █                                                                          █
 * █   BAEL COPY BOX - Smart Copy/Paste with History and Templates           █
 * █   Advanced clipboard manager with formatting and quick access           █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  class BaelCopyBox {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
      this.container = null;

      this.history = this.loadHistory();
      this.templates = this.loadTemplates();
      this.maxHistory = 50;
    }

    async initialize() {
      console.log("📋 Bael Copy Box initializing...");

      this.injectStyles();
      this.createContainer();
      this.setupShortcuts();
      this.observeCopyEvents();

      this.initialized = true;
      console.log("✅ BAEL COPY BOX READY (Ctrl+Shift+V)");

      return this;
    }

    injectStyles() {
      if (document.getElementById("bael-copybox-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-copybox-styles";
      styles.textContent = `
                .bael-copybox-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(4px);
                    z-index: 9850;
                    display: none;
                    justify-content: center;
                    align-items: center;
                }

                .bael-copybox-overlay.visible {
                    display: flex;
                    animation: overlayIn 0.2s ease;
                }

                @keyframes overlayIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .bael-copybox {
                    width: 500px;
                    max-width: 90vw;
                    max-height: 70vh;
                    background: #12121a;
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    animation: boxIn 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                }

                @keyframes boxIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }

                .copybox-header {
                    display: flex;
                    align-items: center;
                    padding: 16px 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .copybox-title {
                    flex: 1;
                    font-size: 16px;
                    font-weight: 600;
                    color: #fff;
                }

                .copybox-tabs {
                    display: flex;
                    gap: 4px;
                }

                .copybox-tab {
                    padding: 6px 14px;
                    border-radius: 6px;
                    border: none;
                    background: transparent;
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .copybox-tab:hover {
                    background: rgba(255, 255, 255, 0.05);
                    color: rgba(255, 255, 255, 0.8);
                }

                .copybox-tab.active {
                    background: rgba(99, 102, 241, 0.2);
                    color: #818cf8;
                }

                .copybox-close {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    border: none;
                    background: transparent;
                    color: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    font-size: 18px;
                    margin-left: 8px;
                }

                .copybox-close:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                }

                .copybox-search {
                    padding: 12px 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .copybox-search input {
                    width: 100%;
                    padding: 10px 14px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 8px;
                    color: #fff;
                    font-size: 13px;
                    outline: none;
                }

                .copybox-search input:focus {
                    border-color: rgba(99, 102, 241, 0.5);
                }

                .copybox-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 12px;
                }

                .copy-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding: 12px;
                    border-radius: 10px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    background: rgba(255, 255, 255, 0.02);
                    margin-bottom: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .copy-item:hover {
                    background: rgba(99, 102, 241, 0.1);
                    border-color: rgba(99, 102, 241, 0.3);
                }

                .copy-item.selected {
                    background: rgba(99, 102, 241, 0.15);
                    border-color: rgba(99, 102, 241, 0.4);
                }

                .copy-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    background: rgba(255, 255, 255, 0.05);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    flex-shrink: 0;
                }

                .copy-content {
                    flex: 1;
                    min-width: 0;
                }

                .copy-preview {
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.8);
                    line-height: 1.4;
                    max-height: 60px;
                    overflow: hidden;
                    word-break: break-word;
                }

                .copy-preview code {
                    font-family: 'SF Mono', monospace;
                    font-size: 12px;
                    background: rgba(0, 0, 0, 0.3);
                    padding: 2px 4px;
                    border-radius: 3px;
                }

                .copy-meta {
                    display: flex;
                    gap: 10px;
                    margin-top: 6px;
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.4);
                }

                .copy-actions {
                    display: flex;
                    gap: 4px;
                    flex-shrink: 0;
                }

                .copy-action {
                    width: 28px;
                    height: 28px;
                    border-radius: 6px;
                    border: none;
                    background: transparent;
                    color: rgba(255, 255, 255, 0.4);
                    cursor: pointer;
                    font-size: 12px;
                }

                .copy-action:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                }

                /* Template form */
                .template-form {
                    padding: 16px;
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                }

                .template-form input {
                    width: 100%;
                    padding: 10px 14px;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    color: #fff;
                    font-size: 13px;
                    outline: none;
                    margin-bottom: 8px;
                }

                .template-form button {
                    width: 100%;
                    padding: 10px;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    border: none;
                    border-radius: 8px;
                    color: #fff;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                }

                .template-form button:hover {
                    opacity: 0.9;
                }

                .empty-state {
                    text-align: center;
                    padding: 40px;
                    color: rgba(255, 255, 255, 0.4);
                }

                .empty-icon {
                    font-size: 40px;
                    margin-bottom: 12px;
                }

                /* Toast notification */
                .copybox-toast {
                    position: fixed;
                    bottom: 80px;
                    left: 50%;
                    transform: translateX(-50%) translateY(20px);
                    background: rgba(16, 185, 129, 0.9);
                    color: #fff;
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-size: 13px;
                    z-index: 9999;
                    opacity: 0;
                    pointer-events: none;
                    transition: all 0.3s;
                }

                .copybox-toast.visible {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            `;
      document.head.appendChild(styles);
    }

    createContainer() {
      this.container = document.createElement("div");
      this.container.id = "bael-copybox-overlay";
      this.container.className = "bael-copybox-overlay";
      this.container.onclick = (e) => {
        if (e.target === this.container) this.hide();
      };

      this.render();
      document.body.appendChild(this.container);

      // Toast element
      this.toast = document.createElement("div");
      this.toast.className = "copybox-toast";
      document.body.appendChild(this.toast);
    }

    render(tab = "history") {
      const items = tab === "history" ? this.history : this.templates;

      this.container.innerHTML = `
                <div class="bael-copybox">
                    <div class="copybox-header">
                        <div class="copybox-title">📋 Copy Box</div>
                        <div class="copybox-tabs">
                            <button class="copybox-tab ${tab === "history" ? "active" : ""}" onclick="BaelCopyBox.switchTab('history')">
                                History
                            </button>
                            <button class="copybox-tab ${tab === "templates" ? "active" : ""}" onclick="BaelCopyBox.switchTab('templates')">
                                Templates
                            </button>
                        </div>
                        <button class="copybox-close" onclick="BaelCopyBox.hide()">✕</button>
                    </div>

                    <div class="copybox-search">
                        <input type="text"
                               placeholder="Search ${tab}..."
                               oninput="BaelCopyBox.filter(this.value)"
                               id="copybox-search">
                    </div>

                    <div class="copybox-content" id="copybox-items">
                        ${
                          items.length === 0
                            ? `
                            <div class="empty-state">
                                <div class="empty-icon">${tab === "history" ? "📋" : "📝"}</div>
                                <div>No ${tab} items yet</div>
                            </div>
                        `
                            : items
                                .map((item, i) => this.renderItem(item, i, tab))
                                .join("")
                        }
                    </div>

                    ${
                      tab === "templates"
                        ? `
                        <div class="template-form">
                            <input type="text" placeholder="Template name..." id="template-name">
                            <input type="text" placeholder="Template content..." id="template-content">
                            <button onclick="BaelCopyBox.addTemplate()">+ Add Template</button>
                        </div>
                    `
                        : ""
                    }
                </div>
            `;

      this.currentTab = tab;
    }

    renderItem(item, index, tab) {
      const preview = this.truncate(item.content || item.text, 150);
      const icon = this.getIcon(item.type || "text");
      const timeAgo = item.timestamp ? this.timeAgo(item.timestamp) : "";

      return `
                <div class="copy-item" onclick="BaelCopyBox.paste(${index})">
                    <div class="copy-icon">${icon}</div>
                    <div class="copy-content">
                        ${item.name ? `<div style="font-weight:600;margin-bottom:4px;color:#fff">${item.name}</div>` : ""}
                        <div class="copy-preview">${this.escapeHtml(preview)}</div>
                        <div class="copy-meta">
                            ${timeAgo ? `<span>${timeAgo}</span>` : ""}
                            <span>${(item.content || item.text || "").length} chars</span>
                        </div>
                    </div>
                    <div class="copy-actions">
                        <button class="copy-action" onclick="event.stopPropagation();BaelCopyBox.copyItem(${index})" title="Copy">
                            📋
                        </button>
                        ${
                          tab === "templates"
                            ? `
                            <button class="copy-action" onclick="event.stopPropagation();BaelCopyBox.deleteTemplate(${index})" title="Delete">
                                🗑️
                            </button>
                        `
                            : ""
                        }
                    </div>
                </div>
            `;
    }

    getIcon(type) {
      const icons = {
        text: "📝",
        code: "💻",
        url: "🔗",
        json: "📊",
        markdown: "📖",
        html: "🌐",
      };
      return icons[type] || "📋";
    }

    detectType(text) {
      if (text.startsWith("http://") || text.startsWith("https://"))
        return "url";
      if (text.startsWith("{") || text.startsWith("[")) {
        try {
          JSON.parse(text);
          return "json";
        } catch {}
      }
      if (
        text.includes("function") ||
        text.includes("const ") ||
        text.includes("let ")
      )
        return "code";
      if (text.includes("# ") || text.includes("**")) return "markdown";
      if (text.includes("<") && text.includes(">")) return "html";
      return "text";
    }

    truncate(text, maxLength) {
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength) + "...";
    }

    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }

    timeAgo(timestamp) {
      const seconds = Math.floor((Date.now() - timestamp) / 1000);

      if (seconds < 60) return "just now";
      if (seconds < 3600) return Math.floor(seconds / 60) + "m ago";
      if (seconds < 86400) return Math.floor(seconds / 3600) + "h ago";
      return Math.floor(seconds / 86400) + "d ago";
    }

    observeCopyEvents() {
      document.addEventListener("copy", (e) => {
        setTimeout(() => {
          navigator.clipboard
            .readText()
            .then((text) => {
              if (text) this.addToHistory(text);
            })
            .catch(() => {});
        }, 100);
      });
    }

    addToHistory(text) {
      // Avoid duplicates
      if (this.history.length > 0 && this.history[0].content === text) return;

      this.history.unshift({
        content: text,
        type: this.detectType(text),
        timestamp: Date.now(),
      });

      if (this.history.length > this.maxHistory) {
        this.history = this.history.slice(0, this.maxHistory);
      }

      this.saveHistory();
    }

    paste(index) {
      const items =
        this.currentTab === "history" ? this.history : this.templates;
      const item = items[index];
      const text = item.content || item.text;

      navigator.clipboard.writeText(text).then(() => {
        this.showToast("Copied to clipboard!");
        this.hide();

        // Try to paste into active input
        const active = document.activeElement;
        if (
          active &&
          (active.tagName === "INPUT" || active.tagName === "TEXTAREA")
        ) {
          const start = active.selectionStart;
          const end = active.selectionEnd;
          const before = active.value.substring(0, start);
          const after = active.value.substring(end);
          active.value = before + text + after;
          active.selectionStart = active.selectionEnd = start + text.length;
        }
      });
    }

    copyItem(index) {
      const items =
        this.currentTab === "history" ? this.history : this.templates;
      const item = items[index];
      const text = item.content || item.text;

      navigator.clipboard.writeText(text).then(() => {
        this.showToast("Copied!");
      });
    }

    filter(query) {
      const items =
        this.currentTab === "history" ? this.history : this.templates;
      const filtered = items.filter(
        (item) =>
          (item.content || item.text || "")
            .toLowerCase()
            .includes(query.toLowerCase()) ||
          (item.name || "").toLowerCase().includes(query.toLowerCase()),
      );

      const container = document.getElementById("copybox-items");
      if (container) {
        container.innerHTML =
          filtered.length === 0
            ? `<div class="empty-state"><div>No matching items</div></div>`
            : filtered
                .map((item, i) =>
                  this.renderItem(item, items.indexOf(item), this.currentTab),
                )
                .join("");
      }
    }

    switchTab(tab) {
      this.render(tab);
    }

    addTemplate() {
      const nameInput = document.getElementById("template-name");
      const contentInput = document.getElementById("template-content");

      if (!nameInput.value || !contentInput.value) {
        this.showToast("Please fill in both fields", "warning");
        return;
      }

      this.templates.unshift({
        name: nameInput.value,
        text: contentInput.value,
        type: this.detectType(contentInput.value),
        timestamp: Date.now(),
      });

      this.saveTemplates();
      this.render("templates");
      this.showToast("Template added!");
    }

    deleteTemplate(index) {
      this.templates.splice(index, 1);
      this.saveTemplates();
      this.render("templates");
      this.showToast("Template deleted");
    }

    showToast(message, type = "success") {
      this.toast.textContent = message;
      this.toast.style.background =
        type === "warning"
          ? "rgba(245, 158, 11, 0.9)"
          : "rgba(16, 185, 129, 0.9)";
      this.toast.classList.add("visible");

      setTimeout(() => {
        this.toast.classList.remove("visible");
      }, 2000);
    }

    loadHistory() {
      try {
        return JSON.parse(localStorage.getItem("bael_copybox_history") || "[]");
      } catch {
        return [];
      }
    }

    saveHistory() {
      localStorage.setItem(
        "bael_copybox_history",
        JSON.stringify(this.history),
      );
    }

    loadTemplates() {
      try {
        return JSON.parse(
          localStorage.getItem("bael_copybox_templates") || "[]",
        );
      } catch {
        return [];
      }
    }

    saveTemplates() {
      localStorage.setItem(
        "bael_copybox_templates",
        JSON.stringify(this.templates),
      );
    }

    setupShortcuts() {
      document.addEventListener("keydown", (e) => {
        // Ctrl+Shift+V to open
        if (e.ctrlKey && e.shiftKey && e.key === "V") {
          e.preventDefault();
          this.toggle();
        }

        // Escape to close
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
      this.render("history");
      this.container.classList.add("visible");
      setTimeout(() => {
        document.getElementById("copybox-search")?.focus();
      }, 50);
    }

    hide() {
      this.visible = false;
      this.container.classList.remove("visible");
    }

    // Clear all history
    clearHistory() {
      this.history = [];
      this.saveHistory();
      this.render("history");
      this.showToast("History cleared");
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  window.BaelCopyBox = new BaelCopyBox();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelCopyBox.initialize();
    });
  } else {
    window.BaelCopyBox.initialize();
  }

  console.log("📋 Bael Copy Box loaded");
})();
