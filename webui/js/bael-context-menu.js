/**
 * BAEL - LORD OF ALL
 * Context Menu System - Enhanced right-click menus
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelContextMenu {
    constructor() {
      this.menu = null;
      this.isOpen = false;
      this.currentContext = null;
      this.menuItems = [];
      this.subMenus = new Map();
      this.init();
    }

    init() {
      this.createMenuElement();
      this.registerDefaultContexts();
      this.bindEvents();
      console.log("⚡ Bael Context Menu initialized");
    }

    createMenuElement() {
      const menu = document.createElement("div");
      menu.id = "bael-context-menu";
      menu.className = "bael-context-menu";
      menu.innerHTML = `
                <div class="context-menu-content"></div>
            `;
      document.body.appendChild(menu);
      this.menu = menu;
      this.addStyles();
    }

    addStyles() {
      if (document.getElementById("bael-context-menu-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-context-menu-styles";
      styles.textContent = `
                .bael-context-menu {
                    position: fixed;
                    z-index: 100000;
                    min-width: 200px;
                    max-width: 300px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 12px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5),
                                0 0 0 1px rgba(255, 255, 255, 0.05);
                    padding: 6px;
                    display: none;
                    animation: contextMenuIn 0.15s ease;
                }

                @keyframes contextMenuIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95) translateY(-5px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }

                .bael-context-menu.open {
                    display: block;
                }

                .context-menu-content {
                    display: flex;
                    flex-direction: column;
                }

                .context-menu-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 14px;
                    border: none;
                    background: transparent;
                    color: var(--bael-text-primary, #fff);
                    font-size: 13px;
                    cursor: pointer;
                    border-radius: 8px;
                    transition: all 0.15s ease;
                    position: relative;
                    text-align: left;
                    width: 100%;
                }

                .context-menu-item:hover {
                    background: var(--bael-accent-dim, rgba(255, 51, 102, 0.15));
                }

                .context-menu-item:active {
                    background: var(--bael-accent, #ff3366);
                }

                .context-menu-item.disabled {
                    opacity: 0.4;
                    pointer-events: none;
                }

                .context-menu-item.destructive:hover {
                    background: rgba(255, 68, 68, 0.2);
                    color: #ff4444;
                }

                .context-menu-icon {
                    width: 16px;
                    height: 16px;
                    color: var(--bael-text-secondary, #888);
                    flex-shrink: 0;
                }

                .context-menu-item:hover .context-menu-icon {
                    color: var(--bael-accent, #ff3366);
                }

                .context-menu-label {
                    flex: 1;
                }

                .context-menu-shortcut {
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                    font-family: monospace;
                }

                .context-menu-arrow {
                    width: 12px;
                    height: 12px;
                    color: var(--bael-text-muted, #666);
                }

                .context-menu-separator {
                    height: 1px;
                    background: var(--bael-border, #2a2a3a);
                    margin: 6px 8px;
                }

                .context-menu-header {
                    padding: 8px 14px;
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: var(--bael-text-muted, #666);
                }

                /* Submenu */
                .context-submenu {
                    position: absolute;
                    left: 100%;
                    top: 0;
                    min-width: 180px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 12px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                    padding: 6px;
                    display: none;
                    margin-left: 4px;
                }

                .context-menu-item:hover > .context-submenu {
                    display: block;
                }

                /* Color swatches for theme items */
                .context-color-swatch {
                    width: 16px;
                    height: 16px;
                    border-radius: 4px;
                    border: 2px solid rgba(255, 255, 255, 0.1);
                }

                /* Checkbox items */
                .context-menu-item.checkbox {
                    padding-left: 36px;
                }

                .context-menu-item.checkbox::before {
                    content: '';
                    position: absolute;
                    left: 12px;
                    width: 16px;
                    height: 16px;
                    border: 2px solid var(--bael-border, #2a2a3a);
                    border-radius: 4px;
                    transition: all 0.15s ease;
                }

                .context-menu-item.checkbox.checked::before {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                }

                .context-menu-item.checkbox.checked::after {
                    content: '';
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    width: 8px;
                    height: 4px;
                    border-left: 2px solid #fff;
                    border-bottom: 2px solid #fff;
                    transform: translateY(-60%) rotate(-45deg);
                }
            `;
      document.head.appendChild(styles);
    }

    registerDefaultContexts() {
      // Message context menu
      this.registerContext("message", (target) => {
        const isUserMessage = target
          .closest(".message")
          ?.classList.contains("user");
        const messageContent = target
          .closest(".message")
          ?.querySelector(".message-content")?.textContent;

        return [
          {
            id: "copy",
            label: "Copy",
            icon: this.icons.copy,
            shortcut: "Ctrl+C",
            handler: () => this.copyText(messageContent),
          },
          {
            id: "copy-code",
            label: "Copy Code Blocks",
            icon: this.icons.code,
            handler: () => this.copyCodeBlocks(target.closest(".message")),
          },
          { type: "separator" },
          {
            id: "favorite",
            label: "Add to Favorites",
            icon: this.icons.star,
            handler: () => this.addToFavorites(target.closest(".message")),
          },
          {
            id: "export-message",
            label: "Export Message",
            icon: this.icons.download,
            children: [
              {
                id: "export-md",
                label: "As Markdown",
                handler: () => this.exportMessage("md", messageContent),
              },
              {
                id: "export-txt",
                label: "As Plain Text",
                handler: () => this.exportMessage("txt", messageContent),
              },
              {
                id: "export-html",
                label: "As HTML",
                handler: () => this.exportMessage("html", messageContent),
              },
            ],
          },
          { type: "separator" },
          {
            id: "regenerate",
            label: "Regenerate Response",
            icon: this.icons.refresh,
            disabled: isUserMessage,
          },
          {
            id: "edit",
            label: "Edit Message",
            icon: this.icons.edit,
            disabled: !isUserMessage,
          },
          { type: "separator" },
          {
            id: "delete",
            label: "Delete Message",
            icon: this.icons.trash,
            destructive: true,
            handler: () => this.deleteMessage(target.closest(".message")),
          },
        ];
      });

      // Chat list context menu
      this.registerContext("chat-item", (target) => {
        const chatId = target.closest("[data-chat-id]")?.dataset.chatId;

        return [
          {
            id: "open",
            label: "Open Chat",
            icon: this.icons.chat,
            handler: () => this.openChat(chatId),
          },
          {
            id: "open-split",
            label: "Open in Split View",
            icon: this.icons.split,
            handler: () => this.openInSplit(chatId),
          },
          { type: "separator" },
          {
            id: "rename",
            label: "Rename",
            icon: this.icons.edit,
            handler: () => this.renameChat(chatId),
          },
          {
            id: "duplicate",
            label: "Duplicate",
            icon: this.icons.duplicate,
            handler: () => this.duplicateChat(chatId),
          },
          {
            id: "export",
            label: "Export",
            icon: this.icons.download,
            handler: () => window.BaelExport?.open(chatId),
          },
          { type: "separator" },
          {
            id: "archive",
            label: "Archive",
            icon: this.icons.archive,
          },
          {
            id: "delete-chat",
            label: "Delete Chat",
            icon: this.icons.trash,
            destructive: true,
            handler: () => this.deleteChat(chatId),
          },
        ];
      });

      // Input area context menu
      this.registerContext("input", (target) => {
        const hasSelection = window.getSelection().toString().length > 0;

        return [
          {
            id: "cut",
            label: "Cut",
            icon: this.icons.cut,
            shortcut: "Ctrl+X",
            disabled: !hasSelection,
            handler: () => document.execCommand("cut"),
          },
          {
            id: "copy",
            label: "Copy",
            icon: this.icons.copy,
            shortcut: "Ctrl+C",
            disabled: !hasSelection,
            handler: () => document.execCommand("copy"),
          },
          {
            id: "paste",
            label: "Paste",
            icon: this.icons.paste,
            shortcut: "Ctrl+V",
            handler: () => document.execCommand("paste"),
          },
          { type: "separator" },
          {
            id: "select-all",
            label: "Select All",
            shortcut: "Ctrl+A",
            handler: () => document.execCommand("selectAll"),
          },
          { type: "separator" },
          {
            id: "prompt-library",
            label: "Insert from Prompt Library",
            icon: this.icons.book,
            handler: () => window.BaelPromptLibrary?.toggle(),
          },
          {
            id: "clear-input",
            label: "Clear",
            icon: this.icons.clear,
            handler: () => {
              if (target.value !== undefined) target.value = "";
              else target.textContent = "";
            },
          },
        ];
      });

      // Default context menu (anywhere)
      this.registerContext("default", () => {
        return [
          {
            id: "new-chat",
            label: "New Chat",
            icon: this.icons.plus,
            shortcut: "Ctrl+N",
            handler: () => this.newChat(),
          },
          { type: "separator" },
          {
            id: "command-palette",
            label: "Command Palette",
            icon: this.icons.command,
            shortcut: "Ctrl+K",
            handler: () => window.BaelCommandPalette?.toggle(),
          },
          {
            id: "search",
            label: "Search Messages",
            icon: this.icons.search,
            shortcut: "Ctrl+F",
            handler: () => window.BaelChatSearch?.toggle(),
          },
          { type: "separator" },
          {
            id: "theme",
            label: "Theme",
            icon: this.icons.theme,
            children: this.getThemeItems(),
          },
          {
            id: "settings",
            label: "Settings",
            icon: this.icons.settings,
            handler: () => this.openSettings(),
          },
        ];
      });
    }

    icons = {
      copy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
      code: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
      star: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
      download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
      refresh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`,
      edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
      trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
      chat: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
      split: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="18" rx="1"/></svg>`,
      duplicate: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="8" y="8" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
      archive: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>`,
      cut: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>`,
      paste: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>`,
      book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
      clear: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
      plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
      command: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3H6a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3V6a3 3 0 0 0-3-3 3 3 0 0 0-3 3 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/></svg>`,
      search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
      theme: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg>`,
      settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
    };

    getThemeItems() {
      const themes = [
        { id: "bael-dark", name: "Bael Dark", color: "#ff3366" },
        { id: "bael-crimson", name: "Crimson", color: "#dc143c" },
        { id: "bael-abyss", name: "Abyss", color: "#1a1a2e" },
        { id: "bael-inferno", name: "Inferno", color: "#ff4500" },
        { id: "bael-void", name: "Void", color: "#0a0a0f" },
        { id: "bael-light", name: "Light", color: "#f5f5f5" },
      ];

      const currentTheme = document.documentElement.getAttribute("data-theme");

      return themes.map((theme) => ({
        id: `theme-${theme.id}`,
        label: theme.name,
        checkbox: true,
        checked: currentTheme === theme.id,
        icon: `<div class="context-color-swatch" style="background: ${theme.color}"></div>`,
        handler: () => {
          document.documentElement.setAttribute("data-theme", theme.id);
          localStorage.setItem("bael_theme", theme.id);
        },
      }));
    }

    registerContext(contextName, itemsProvider) {
      this.menuItems[contextName] = itemsProvider;
    }

    bindEvents() {
      // Right-click handler
      document.addEventListener("contextmenu", (e) => {
        // Allow normal context menu in input fields if Ctrl is held
        if (e.ctrlKey) return;

        e.preventDefault();
        this.show(e);
      });

      // Close on click outside
      document.addEventListener("click", (e) => {
        if (!this.menu.contains(e.target)) {
          this.hide();
        }
      });

      // Close on escape
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.isOpen) {
          this.hide();
        }
      });

      // Close on scroll
      document.addEventListener(
        "scroll",
        () => {
          if (this.isOpen) this.hide();
        },
        true,
      );
    }

    show(event) {
      const target = event.target;
      let contextName = "default";
      let items = [];

      // Determine context based on target
      if (target.closest(".message")) {
        contextName = "message";
      } else if (target.closest("[data-chat-id]")) {
        contextName = "chat-item";
      } else if (target.matches("input, textarea, [contenteditable]")) {
        contextName = "input";
      }

      const itemsProvider = this.menuItems[contextName];
      if (itemsProvider) {
        items = itemsProvider(target);
      }

      if (items.length === 0) {
        items = this.menuItems["default"]?.(target) || [];
      }

      this.currentContext = { name: contextName, target };
      this.renderItems(items);
      this.position(event.clientX, event.clientY);

      this.menu.classList.add("open");
      this.isOpen = true;

      // Emit event
      window.dispatchEvent(
        new CustomEvent("bael:contextmenu:show", {
          detail: { context: contextName, target },
        }),
      );
    }

    hide() {
      this.menu.classList.remove("open");
      this.isOpen = false;
      this.currentContext = null;
    }

    position(x, y) {
      const menuRect = this.menu.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Adjust if menu would go off screen
      let posX = x;
      let posY = y;

      if (x + menuRect.width > viewportWidth) {
        posX = x - menuRect.width;
      }

      if (y + menuRect.height > viewportHeight) {
        posY = y - menuRect.height;
      }

      this.menu.style.left = `${Math.max(0, posX)}px`;
      this.menu.style.top = `${Math.max(0, posY)}px`;
    }

    renderItems(items) {
      const content = this.menu.querySelector(".context-menu-content");
      content.innerHTML = items.map((item) => this.renderItem(item)).join("");

      // Bind click handlers
      content.querySelectorAll(".context-menu-item").forEach((el, index) => {
        const item = items.filter((i) => i.type !== "separator")[index];
        if (item && item.handler && !item.disabled) {
          el.addEventListener("click", (e) => {
            e.stopPropagation();
            item.handler();
            this.hide();
          });
        }
      });
    }

    renderItem(item) {
      if (item.type === "separator") {
        return '<div class="context-menu-separator"></div>';
      }

      if (item.type === "header") {
        return `<div class="context-menu-header">${item.label}</div>`;
      }

      const classes = ["context-menu-item"];
      if (item.disabled) classes.push("disabled");
      if (item.destructive) classes.push("destructive");
      if (item.checkbox) classes.push("checkbox");
      if (item.checked) classes.push("checked");

      const hasChildren = item.children && item.children.length > 0;

      return `
                <button class="${classes.join(" ")}">
                    ${item.icon ? `<span class="context-menu-icon">${item.icon}</span>` : ""}
                    <span class="context-menu-label">${item.label}</span>
                    ${item.shortcut ? `<span class="context-menu-shortcut">${item.shortcut}</span>` : ""}
                    ${hasChildren ? `<span class="context-menu-arrow">▶</span>` : ""}
                    ${
                      hasChildren
                        ? `
                        <div class="context-submenu">
                            ${item.children.map((child) => this.renderItem(child)).join("")}
                        </div>
                    `
                        : ""
                    }
                </button>
            `;
    }

    // Utility methods
    copyText(text) {
      navigator.clipboard.writeText(text || "");
      if (window.Bael?.notifications) {
        window.Bael.notifications.success("Copied to clipboard");
      }
    }

    copyCodeBlocks(messageEl) {
      const codeBlocks = messageEl?.querySelectorAll("pre code");
      if (codeBlocks?.length) {
        const code = Array.from(codeBlocks)
          .map((el) => el.textContent)
          .join("\n\n");
        this.copyText(code);
      }
    }

    exportMessage(format, content) {
      const blob = new Blob([content], { type: "text/plain" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `message.${format}`;
      link.click();
    }

    newChat() {
      try {
        Alpine.store("chats")?.create();
      } catch (e) {}
    }

    openSettings() {
      // Try to open settings
      try {
        Alpine.store("tabs")?.select("settings");
      } catch (e) {}
    }
  }

  // Initialize
  window.BaelContextMenu = new BaelContextMenu();
})();
