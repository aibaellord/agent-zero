/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █   ██╗  ██╗ ██████╗ ████████╗██╗  ██╗███████╗██╗   ██╗███████╗           █
 * █   ██║  ██║██╔═══██╗╚══██╔══╝██║ ██╔╝██╔════╝╚██╗ ██╔╝██╔════╝           █
 * █   ███████║██║   ██║   ██║   █████╔╝ █████╗   ╚████╔╝ ███████╗           █
 * █   ██╔══██║██║   ██║   ██║   ██╔═██╗ ██╔══╝    ╚██╔╝  ╚════██║           █
 * █   ██║  ██║╚██████╔╝   ██║   ██║  ██╗███████╗   ██║   ███████║           █
 * █   ╚═╝  ╚═╝ ╚═════╝    ╚═╝   ╚═╝  ╚═╝╚══════╝   ╚═╝   ╚══════╝           █
 * █                                                                          █
 * █   BAEL HOTKEY REFERENCE - Visual Keyboard Shortcut Overlay              █
 * █   See all shortcuts at a glance - Press ? or Ctrl+Shift+?               █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  class BaelHotkeyReference {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
      this.container = null;

      // All registered shortcuts organized by category
      this.shortcuts = {
        navigation: {
          label: "🧭 Navigation",
          items: [
            { keys: ["Ctrl", "N"], desc: "New Chat" },
            { keys: ["Ctrl", "O"], desc: "Open Chat" },
            { keys: ["Ctrl", "W"], desc: "Close Chat" },
            { keys: ["Ctrl", "Tab"], desc: "Next Chat" },
            { keys: ["Ctrl", "Shift", "Tab"], desc: "Previous Chat" },
            { keys: ["Ctrl", ","], desc: "Open Settings" },
            { keys: ["Escape"], desc: "Close Modal/Dialog" },
          ],
        },
        search: {
          label: "🔍 Search",
          items: [
            { keys: ["Ctrl", "/"], desc: "Unified Search" },
            { keys: ["Ctrl", "K"], desc: "Command Center" },
            { keys: ["Ctrl", "Shift", "F"], desc: "Search in Files" },
            { keys: ["Ctrl", "F"], desc: "Find in Page" },
            { keys: ["Ctrl", "G"], desc: "Go to Line" },
          ],
        },
        dashboards: {
          label: "📊 Dashboards",
          items: [
            { keys: ["Ctrl", "Shift", "M"], desc: "Memory Dashboard" },
            { keys: ["Ctrl", "Shift", "A"], desc: "Agent Console" },
            { keys: ["Ctrl", "Shift", "H"], desc: "Heisenberg Control" },
            { keys: ["Ctrl", "Shift", "P"], desc: "Performance Dashboard" },
            { keys: ["Ctrl", "Shift", "T"], desc: "Template Library" },
            { keys: ["?"], desc: "This Hotkey Reference" },
          ],
        },
        chat: {
          label: "💬 Chat",
          items: [
            { keys: ["Enter"], desc: "Send Message" },
            { keys: ["Shift", "Enter"], desc: "New Line" },
            { keys: ["Ctrl", "Enter"], desc: "Send & Stay" },
            { keys: ["↑"], desc: "Edit Last Message" },
            { keys: ["Ctrl", "R"], desc: "Regenerate Response" },
            { keys: ["Ctrl", "C"], desc: "Copy Selected" },
            { keys: ["Ctrl", "Shift", "C"], desc: "Copy Code Block" },
          ],
        },
        editing: {
          label: "✏️ Editing",
          items: [
            { keys: ["Ctrl", "Z"], desc: "Undo" },
            { keys: ["Ctrl", "Shift", "Z"], desc: "Redo" },
            { keys: ["Ctrl", "A"], desc: "Select All" },
            { keys: ["Ctrl", "X"], desc: "Cut" },
            { keys: ["Ctrl", "V"], desc: "Paste" },
            { keys: ["Ctrl", "B"], desc: "Bold" },
            { keys: ["Ctrl", "I"], desc: "Italic" },
          ],
        },
        system: {
          label: "⚙️ System",
          items: [
            { keys: ["Ctrl", "Shift", "R"], desc: "Restart Framework" },
            { keys: ["Ctrl", "Shift", "D"], desc: "Toggle Dark Mode" },
            { keys: ["Ctrl", "Shift", "I"], desc: "Developer Tools" },
            { keys: ["F11"], desc: "Toggle Fullscreen" },
            { keys: ["Ctrl", "Shift", "L"], desc: "Clear Chat" },
            { keys: ["Ctrl", "S"], desc: "Save/Export" },
          ],
        },
        agent: {
          label: "🤖 Agent Control",
          items: [
            { keys: ["Ctrl", "Space"], desc: "Pause/Resume Agent" },
            { keys: ["Ctrl", "Shift", "N"], desc: "Nudge Agent" },
            { keys: ["Ctrl", "Shift", "X"], desc: "Stop Execution" },
            { keys: ["Ctrl", "Shift", "E"], desc: "Execute Code" },
            { keys: ["Ctrl", "Shift", "V"], desc: "Voice Input" },
          ],
        },
        power: {
          label: "⚡ Power Systems",
          items: [
            { keys: ["Ctrl", "Alt", "S"], desc: "Supremacy Panel" },
            { keys: ["Ctrl", "Alt", "D"], desc: "Domination Control" },
            { keys: ["Ctrl", "Alt", "O"], desc: "Omniscient View" },
            { keys: ["Ctrl", "Alt", "E"], desc: "Exploit Engine" },
          ],
        },
      };
    }

    async initialize() {
      console.log("⌨️ Bael Hotkey Reference initializing...");

      this.injectStyles();
      this.createContainer();
      this.setupShortcuts();

      this.initialized = true;
      console.log("✅ BAEL HOTKEY REFERENCE READY");

      return this;
    }

    injectStyles() {
      if (document.getElementById("bael-hotkey-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-hotkey-styles";
      styles.textContent = `
                .bael-hotkey-reference {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 10006;
                    background: rgba(0, 0, 0, 0.85);
                    backdrop-filter: blur(10px);
                    align-items: center;
                    justify-content: center;
                    padding: 40px;
                    overflow-y: auto;
                }

                .bael-hotkey-reference.visible { display: flex; }

                .hotkey-dialog {
                    width: 100%;
                    max-width: 1100px;
                    background: #12121a;
                    border-radius: 20px;
                    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5);
                    border: 1px solid #2a2a4a;
                    overflow: hidden;
                }

                .hotkey-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 24px 32px;
                    border-bottom: 1px solid #2a2a4a;
                    background: linear-gradient(135deg, #1a1a2e 0%, #12121a 100%);
                }

                .hotkey-header h2 {
                    margin: 0;
                    font-size: 24px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-weight: 600;
                }

                .hotkey-header h2 span {
                    opacity: 0.7;
                    font-weight: 400;
                    font-size: 14px;
                }

                .hotkey-close {
                    padding: 10px;
                    border: none;
                    background: rgba(255,255,255,0.05);
                    color: #888;
                    cursor: pointer;
                    font-size: 20px;
                    border-radius: 8px;
                    transition: all 0.15s;
                }

                .hotkey-close:hover { background: #ef4444; color: #fff; }

                .hotkey-body {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
                    gap: 24px;
                    padding: 32px;
                    max-height: 70vh;
                    overflow-y: auto;
                }

                .hotkey-category {
                    background: #1a1a2e;
                    border-radius: 12px;
                    padding: 20px;
                    border: 1px solid #2a2a4a;
                }

                .category-title {
                    font-size: 14px;
                    font-weight: 600;
                    margin-bottom: 16px;
                    padding-bottom: 12px;
                    border-bottom: 1px solid #2a2a4a;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .shortcut-list {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .shortcut-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 12px;
                }

                .shortcut-keys {
                    display: flex;
                    gap: 4px;
                    flex-shrink: 0;
                }

                .key {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 28px;
                    height: 28px;
                    padding: 0 8px;
                    background: linear-gradient(180deg, #2a2a4a 0%, #1a1a2e 100%);
                    border: 1px solid #3a3a5a;
                    border-radius: 6px;
                    font-size: 11px;
                    font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
                    font-weight: 500;
                    color: #e0e0e0;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }

                .key-plus {
                    color: #666;
                    font-size: 10px;
                    margin: 0 -2px;
                }

                .shortcut-desc {
                    font-size: 13px;
                    color: #aaa;
                    text-align: right;
                }

                .hotkey-footer {
                    padding: 16px 32px;
                    border-top: 1px solid #2a2a4a;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 12px;
                    color: #666;
                    background: #0a0a0f;
                }

                .hotkey-tip {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .search-shortcuts {
                    padding: 12px 16px;
                    border: 1px solid #2a2a4a;
                    border-radius: 8px;
                    background: #0a0a0f;
                    color: #e0e0e0;
                    font-size: 14px;
                    width: 250px;
                }

                .search-shortcuts::placeholder { color: #666; }

                .hotkey-category.dimmed { opacity: 0.3; }
                .shortcut-item.dimmed { opacity: 0.3; }
                .shortcut-item.highlighted .key {
                    background: linear-gradient(180deg, #6366f1 0%, #4f46e5 100%);
                    border-color: #818cf8;
                }
                .shortcut-item.highlighted .shortcut-desc { color: #a5b4fc; }

                @media (max-width: 768px) {
                    .hotkey-body {
                        grid-template-columns: 1fr;
                    }
                }
            `;
      document.head.appendChild(styles);
    }

    createContainer() {
      this.container = document.createElement("div");
      this.container.id = "bael-hotkey-reference";
      this.container.className = "bael-hotkey-reference";

      this.container.innerHTML = this.getTemplate();
      document.body.appendChild(this.container);

      this.bindEvents();
    }

    getTemplate() {
      return `
                <div class="hotkey-dialog">
                    <div class="hotkey-header">
                        <h2>⌨️ Keyboard Shortcuts <span>— Bael Power Reference</span></h2>
                        <button class="hotkey-close" id="hotkey-close">✕</button>
                    </div>

                    <div class="hotkey-body" id="hotkey-body">
                        ${Object.entries(this.shortcuts)
                          .map(
                            ([key, cat]) => `
                            <div class="hotkey-category" data-category="${key}">
                                <div class="category-title">${cat.label}</div>
                                <div class="shortcut-list">
                                    ${cat.items
                                      .map(
                                        (item) => `
                                        <div class="shortcut-item" data-search="${item.desc.toLowerCase()} ${item.keys.join(" ").toLowerCase()}">
                                            <div class="shortcut-keys">
                                                ${item.keys
                                                  .map(
                                                    (k, i) => `
                                                    <span class="key">${this.formatKey(k)}</span>
                                                    ${i < item.keys.length - 1 ? '<span class="key-plus">+</span>' : ""}
                                                `,
                                                  )
                                                  .join("")}
                                            </div>
                                            <div class="shortcut-desc">${item.desc}</div>
                                        </div>
                                    `,
                                      )
                                      .join("")}
                                </div>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>

                    <div class="hotkey-footer">
                        <div class="hotkey-tip">
                            💡 Press <span class="key">?</span> or <span class="key">Ctrl</span><span class="key-plus">+</span><span class="key">Shift</span><span class="key-plus">+</span><span class="key">/</span> to toggle this panel
                        </div>
                        <input type="text" class="search-shortcuts" id="search-shortcuts" placeholder="Search shortcuts...">
                    </div>
                </div>
            `;
    }

    formatKey(key) {
      const keyMap = {
        Ctrl: "⌃",
        Shift: "⇧",
        Alt: "⌥",
        Cmd: "⌘",
        Enter: "↵",
        Escape: "Esc",
        Tab: "⇥",
        Backspace: "⌫",
        Delete: "⌦",
        Space: "␣",
        ArrowUp: "↑",
        ArrowDown: "↓",
        ArrowLeft: "←",
        ArrowRight: "→",
      };

      // Use symbols on Mac, text on others
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;

      if (isMac) {
        return keyMap[key] || key;
      }
      return key;
    }

    bindEvents() {
      // Close
      this.container
        .querySelector("#hotkey-close")
        .addEventListener("click", () => this.hide());
      this.container.addEventListener("click", (e) => {
        if (e.target === this.container) this.hide();
      });

      // Search
      const searchInput = this.container.querySelector("#search-shortcuts");
      searchInput.addEventListener("input", (e) => {
        this.filterShortcuts(e.target.value);
      });
    }

    setupShortcuts() {
      document.addEventListener("keydown", (e) => {
        // ? key (without modifiers, or Shift for ?)
        if (e.key === "?" || (e.shiftKey && e.key === "/")) {
          // Don't trigger if in input
          if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName))
            return;
          e.preventDefault();
          this.toggle();
        }

        // Ctrl+Shift+/
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "/") {
          e.preventDefault();
          this.toggle();
        }

        if (this.visible && e.key === "Escape") {
          this.hide();
        }
      });
    }

    filterShortcuts(query) {
      const q = query.toLowerCase().trim();
      const items = this.container.querySelectorAll(".shortcut-item");
      const categories = this.container.querySelectorAll(".hotkey-category");

      if (!q) {
        items.forEach((item) => item.classList.remove("dimmed", "highlighted"));
        categories.forEach((cat) => cat.classList.remove("dimmed"));
        return;
      }

      const categoryHasMatch = {};

      items.forEach((item) => {
        const searchText = item.dataset.search;
        const matches = searchText.includes(q);

        item.classList.toggle("dimmed", !matches);
        item.classList.toggle("highlighted", matches);

        if (matches) {
          const cat = item.closest(".hotkey-category");
          if (cat) categoryHasMatch[cat.dataset.category] = true;
        }
      });

      categories.forEach((cat) => {
        cat.classList.toggle("dimmed", !categoryHasMatch[cat.dataset.category]);
      });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════════════

    registerShortcut(category, keys, description) {
      if (!this.shortcuts[category]) {
        this.shortcuts[category] = { label: category, items: [] };
      }

      this.shortcuts[category].items.push({
        keys: Array.isArray(keys) ? keys : [keys],
        desc: description,
      });

      // Re-render if visible
      if (this.visible) {
        this.container.querySelector("#hotkey-body").innerHTML =
          this.getTemplate().match(
            /<div class="hotkey-body"[^>]*>([\s\S]*?)<\/div>\s*<div class="hotkey-footer">/,
          )?.[1] || "";
      }
    }

    show() {
      this.container.classList.add("visible");
      this.visible = true;

      // Focus search
      setTimeout(() => {
        this.container.querySelector("#search-shortcuts")?.focus();
      }, 100);
    }

    hide() {
      this.container.classList.remove("visible");
      this.visible = false;

      // Clear search
      const search = this.container.querySelector("#search-shortcuts");
      if (search) {
        search.value = "";
        this.filterShortcuts("");
      }
    }

    toggle() {
      if (this.visible) this.hide();
      else this.show();
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  window.BaelHotkeyReference = new BaelHotkeyReference();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelHotkeyReference.initialize();
    });
  } else {
    window.BaelHotkeyReference.initialize();
  }

  console.log("⌨️ Bael Hotkey Reference loaded");
})();
