/**
 * BAEL - LORD OF ALL
 * File Tree - Workspace file explorer with tree view
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelFileTree {
    constructor() {
      this.panel = null;
      this.trigger = null;
      this.currentPath = "/";
      this.expandedFolders = new Set(["/"]);
      this.selectedFile = null;
      this.init();
    }

    init() {
      this.addStyles();
      this.createUI();
      this.bindEvents();
      console.log("📁 Bael File Tree initialized");
    }

    addStyles() {
      const styles = document.createElement("style");
      styles.id = "bael-filetree-styles";
      styles.textContent = `
                /* File Tree Trigger */
                .bael-filetree-trigger {
                    position: fixed;
                    bottom: 690px;
                    right: 20px;
                    width: 48px;
                    height: 48px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9978;
                    transition: all 0.3s ease;
                    font-size: 20px;
                }

                .bael-filetree-trigger:hover {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                    transform: scale(1.1);
                }

                /* File Tree Panel */
                .bael-filetree-panel {
                    position: fixed;
                    top: 80px;
                    left: 20px;
                    width: 320px;
                    height: calc(100vh - 160px);
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 16px;
                    z-index: 100023;
                    display: none;
                    flex-direction: column;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
                    overflow: hidden;
                }

                .bael-filetree-panel.visible {
                    display: flex;
                    animation: filetreeSlide 0.2s ease;
                }

                @keyframes filetreeSlide {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }

                /* Header */
                .filetree-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px 16px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .filetree-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .filetree-actions {
                    display: flex;
                    gap: 6px;
                }

                .filetree-action {
                    width: 28px;
                    height: 28px;
                    background: transparent;
                    border: 1px solid transparent;
                    border-radius: 6px;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                }

                .filetree-action:hover {
                    background: var(--bael-bg-tertiary, #181820);
                    border-color: var(--bael-border, #2a2a3a);
                    color: var(--bael-text-primary, #fff);
                }

                .filetree-close {
                    color: var(--bael-text-muted, #666);
                }

                .filetree-close:hover {
                    background: rgba(255, 51, 102, 0.2);
                    color: var(--bael-accent, #ff3366);
                }

                /* Search */
                .filetree-search {
                    padding: 10px 14px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .filetree-search input {
                    width: 100%;
                    padding: 8px 12px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 12px;
                    outline: none;
                }

                .filetree-search input:focus {
                    border-color: var(--bael-accent, #ff3366);
                }

                /* Tree Content */
                .filetree-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 8px 0;
                }

                /* Tree Item */
                .tree-item {
                    display: flex;
                    align-items: center;
                    padding: 6px 12px;
                    cursor: pointer;
                    user-select: none;
                    transition: background 0.1s ease;
                }

                .tree-item:hover {
                    background: var(--bael-bg-secondary, #12121a);
                }

                .tree-item.selected {
                    background: var(--bael-bg-tertiary, #181820);
                    border-left: 2px solid var(--bael-accent, #ff3366);
                }

                .tree-indent {
                    width: 16px;
                    height: 16px;
                    flex-shrink: 0;
                }

                .tree-arrow {
                    width: 16px;
                    height: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--bael-text-muted, #666);
                    font-size: 10px;
                    transition: transform 0.1s ease;
                }

                .tree-arrow.expanded {
                    transform: rotate(90deg);
                }

                .tree-arrow.hidden {
                    visibility: hidden;
                }

                .tree-icon {
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    margin-right: 8px;
                }

                .tree-name {
                    flex: 1;
                    font-size: 13px;
                    color: var(--bael-text-primary, #fff);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .tree-item.folder .tree-name {
                    color: var(--bael-text-primary, #fff);
                }

                .tree-item.file .tree-name {
                    color: var(--bael-text-secondary, #ccc);
                }

                /* File Type Colors */
                .tree-icon.python { color: #3776ab; }
                .tree-icon.javascript { color: #f7df1e; }
                .tree-icon.typescript { color: #3178c6; }
                .tree-icon.json { color: #cbcb41; }
                .tree-icon.html { color: #e34c26; }
                .tree-icon.css { color: #264de4; }
                .tree-icon.markdown { color: #519aba; }
                .tree-icon.folder { color: #f0a30a; }
                .tree-icon.image { color: #4ade80; }
                .tree-icon.config { color: #6b7280; }

                /* Context Menu */
                .filetree-context {
                    position: fixed;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    padding: 6px 0;
                    z-index: 100030;
                    min-width: 180px;
                    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.4);
                    display: none;
                }

                .filetree-context.visible {
                    display: block;
                }

                .context-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 14px;
                    cursor: pointer;
                    font-size: 12px;
                    color: var(--bael-text-primary, #fff);
                }

                .context-item:hover {
                    background: var(--bael-bg-secondary, #12121a);
                }

                .context-item.danger {
                    color: #f87171;
                }

                .context-separator {
                    height: 1px;
                    background: var(--bael-border, #2a2a3a);
                    margin: 6px 0;
                }

                /* Footer */
                .filetree-footer {
                    padding: 10px 14px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                }

                .filetree-path {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
            `;
      document.head.appendChild(styles);
    }

    createUI() {
      // Trigger
      const trigger = document.createElement("button");
      trigger.className = "bael-filetree-trigger";
      trigger.title = "File Tree (Ctrl+B)";
      trigger.innerHTML = "📁";
      document.body.appendChild(trigger);
      this.trigger = trigger;

      // Panel
      const panel = document.createElement("div");
      panel.className = "bael-filetree-panel";
      panel.innerHTML = `
                <div class="filetree-header">
                    <div class="filetree-title">
                        <span>📁</span>
                        <span>Explorer</span>
                    </div>
                    <div class="filetree-actions">
                        <button class="filetree-action" title="New File" id="new-file">📄</button>
                        <button class="filetree-action" title="New Folder" id="new-folder">📁</button>
                        <button class="filetree-action" title="Refresh" id="refresh-tree">🔄</button>
                        <button class="filetree-action filetree-close" title="Close">×</button>
                    </div>
                </div>

                <div class="filetree-search">
                    <input type="text" id="file-search" placeholder="Search files...">
                </div>

                <div class="filetree-content" id="file-tree">
                    ${this.renderDemoTree()}
                </div>

                <div class="filetree-footer">
                    <div class="filetree-path" id="current-path">/work_dir</div>
                </div>
            `;
      document.body.appendChild(panel);
      this.panel = panel;

      // Context Menu
      const contextMenu = document.createElement("div");
      contextMenu.className = "filetree-context";
      contextMenu.innerHTML = `
                <div class="context-item" data-action="open">📂 Open</div>
                <div class="context-item" data-action="copy-path">📋 Copy Path</div>
                <div class="context-item" data-action="rename">✏️ Rename</div>
                <div class="context-separator"></div>
                <div class="context-item" data-action="duplicate">📑 Duplicate</div>
                <div class="context-item" data-action="download">⬇️ Download</div>
                <div class="context-separator"></div>
                <div class="context-item danger" data-action="delete">🗑️ Delete</div>
            `;
      document.body.appendChild(contextMenu);
      this.contextMenu = contextMenu;

      this.bindPanelEvents();
    }

    renderDemoTree() {
      // Demo file structure
      const structure = [
        {
          type: "folder",
          name: "work_dir",
          expanded: true,
          children: [
            {
              type: "folder",
              name: "prompts",
              expanded: false,
              children: [
                { type: "file", name: "agent.system.main.md", ext: "md" },
                { type: "file", name: "agent.system.tools.md", ext: "md" },
              ],
            },
            {
              type: "folder",
              name: "python",
              expanded: false,
              children: [
                { type: "file", name: "agent.py", ext: "py" },
                { type: "file", name: "models.py", ext: "py" },
                { type: "file", name: "__init__.py", ext: "py" },
              ],
            },
            {
              type: "folder",
              name: "webui",
              expanded: true,
              children: [
                {
                  type: "folder",
                  name: "js",
                  expanded: false,
                  children: [
                    { type: "file", name: "bael-core.js", ext: "js" },
                    { type: "file", name: "bael-audio.js", ext: "js" },
                  ],
                },
                { type: "file", name: "index.html", ext: "html" },
                { type: "file", name: "styles.css", ext: "css" },
              ],
            },
            { type: "file", name: "requirements.txt", ext: "txt" },
            { type: "file", name: "README.md", ext: "md" },
            { type: "file", name: ".env", ext: "config" },
          ],
        },
      ];

      return this.renderTree(structure, 0);
    }

    renderTree(items, depth) {
      return items
        .map((item) => {
          const indent = depth * 16;
          const isFolder = item.type === "folder";
          const icon = this.getFileIcon(item);
          const iconClass = this.getIconClass(item);

          if (isFolder) {
            const isExpanded = item.expanded;
            return `
                        <div class="tree-item folder" data-path="${item.name}" data-type="folder" style="padding-left: ${indent + 12}px">
                            <span class="tree-arrow ${isExpanded ? "expanded" : ""}">▶</span>
                            <span class="tree-icon folder">${icon}</span>
                            <span class="tree-name">${item.name}</span>
                        </div>
                        <div class="tree-children" style="display: ${isExpanded ? "block" : "none"}">
                            ${item.children ? this.renderTree(item.children, depth + 1) : ""}
                        </div>
                    `;
          } else {
            return `
                        <div class="tree-item file" data-path="${item.name}" data-type="file" style="padding-left: ${indent + 28}px">
                            <span class="tree-icon ${iconClass}">${icon}</span>
                            <span class="tree-name">${item.name}</span>
                        </div>
                    `;
          }
        })
        .join("");
    }

    getFileIcon(item) {
      if (item.type === "folder") return "📁";

      const ext = item.ext || item.name.split(".").pop().toLowerCase();
      const icons = {
        py: "🐍",
        js: "📜",
        ts: "📘",
        json: "📋",
        html: "🌐",
        css: "🎨",
        md: "📝",
        txt: "📄",
        yml: "⚙️",
        yaml: "⚙️",
        env: "🔐",
        config: "⚙️",
        png: "🖼️",
        jpg: "🖼️",
        jpeg: "🖼️",
        gif: "🖼️",
        svg: "🎭",
        sh: "💻",
        bash: "💻",
        sql: "🗃️",
      };
      return icons[ext] || "📄";
    }

    getIconClass(item) {
      if (item.type === "folder") return "folder";

      const ext = item.ext || item.name.split(".").pop().toLowerCase();
      const classes = {
        py: "python",
        js: "javascript",
        ts: "typescript",
        json: "json",
        html: "html",
        css: "css",
        md: "markdown",
        png: "image",
        jpg: "image",
        jpeg: "image",
        gif: "image",
        svg: "image",
        env: "config",
        yml: "config",
        yaml: "config",
      };
      return classes[ext] || "";
    }

    bindEvents() {
      this.trigger.addEventListener("click", () => this.toggle());

      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.key === "b") {
          e.preventDefault();
          this.toggle();
        }
        if (e.key === "Escape" && this.panel.classList.contains("visible")) {
          this.close();
        }
      });

      // Close context menu on click outside
      document.addEventListener("click", () => {
        this.contextMenu.classList.remove("visible");
      });
    }

    bindPanelEvents() {
      this.panel
        .querySelector(".filetree-close")
        .addEventListener("click", () => this.close());
      this.panel
        .querySelector("#refresh-tree")
        .addEventListener("click", () => this.refresh());

      // Tree item clicks
      this.panel.querySelector("#file-tree").addEventListener("click", (e) => {
        const item = e.target.closest(".tree-item");
        if (!item) return;

        const type = item.dataset.type;

        if (type === "folder") {
          // Toggle folder
          const arrow = item.querySelector(".tree-arrow");
          const children = item.nextElementSibling;
          if (children && children.classList.contains("tree-children")) {
            const isExpanded = children.style.display !== "none";
            children.style.display = isExpanded ? "none" : "block";
            arrow.classList.toggle("expanded", !isExpanded);
          }
        } else {
          // Select file
          this.panel
            .querySelectorAll(".tree-item")
            .forEach((i) => i.classList.remove("selected"));
          item.classList.add("selected");
          this.selectedFile = item.dataset.path;
          this.panel.querySelector("#current-path").textContent =
            "/work_dir/" + this.selectedFile;
        }
      });

      // Context menu
      this.panel
        .querySelector("#file-tree")
        .addEventListener("contextmenu", (e) => {
          e.preventDefault();
          const item = e.target.closest(".tree-item");
          if (!item) return;

          this.selectedFile = item.dataset.path;
          this.contextMenu.style.left = e.clientX + "px";
          this.contextMenu.style.top = e.clientY + "px";
          this.contextMenu.classList.add("visible");
        });

      // Context menu actions
      this.contextMenu.querySelectorAll(".context-item").forEach((menuItem) => {
        menuItem.addEventListener("click", () => {
          const action = menuItem.dataset.action;
          this.handleContextAction(action);
          this.contextMenu.classList.remove("visible");
        });
      });

      // Search
      this.panel
        .querySelector("#file-search")
        .addEventListener("input", (e) => {
          // Simple highlight matching
          const term = e.target.value.toLowerCase();
          this.panel.querySelectorAll(".tree-item").forEach((item) => {
            const name = item
              .querySelector(".tree-name")
              .textContent.toLowerCase();
            item.style.display =
              term === "" || name.includes(term) ? "flex" : "none";
          });
        });
    }

    handleContextAction(action) {
      switch (action) {
        case "open":
          if (window.BaelNotifications) {
            window.BaelNotifications.info(`Opening: ${this.selectedFile}`);
          }
          break;
        case "copy-path":
          navigator.clipboard.writeText("/work_dir/" + this.selectedFile);
          if (window.BaelNotifications) {
            window.BaelNotifications.success("Path copied to clipboard");
          }
          break;
        case "rename":
          const newName = prompt("New name:", this.selectedFile);
          if (newName && window.BaelNotifications) {
            window.BaelNotifications.info(`Renaming to: ${newName}`);
          }
          break;
        case "duplicate":
          if (window.BaelNotifications) {
            window.BaelNotifications.info(`Duplicating: ${this.selectedFile}`);
          }
          break;
        case "download":
          if (window.BaelNotifications) {
            window.BaelNotifications.info(`Downloading: ${this.selectedFile}`);
          }
          break;
        case "delete":
          if (confirm(`Delete ${this.selectedFile}?`)) {
            if (window.BaelNotifications) {
              window.BaelNotifications.info(`Deleted: ${this.selectedFile}`);
            }
          }
          break;
      }
    }

    toggle() {
      if (this.panel.classList.contains("visible")) {
        this.close();
      } else {
        this.open();
      }
    }

    open() {
      this.panel.classList.add("visible");
    }

    close() {
      this.panel.classList.remove("visible");
      this.contextMenu.classList.remove("visible");
    }

    refresh() {
      // Reload tree
      if (window.BaelNotifications) {
        window.BaelNotifications.info("File tree refreshed");
      }
    }
  }

  // Initialize
  window.BaelFileTree = new BaelFileTree();
})();
