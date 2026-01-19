/**
 * BAEL - LORD OF ALL
 * Keyboard Shortcuts Overlay - Interactive cheat sheet
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelShortcuts {
    constructor() {
      this.overlay = null;
      this.shortcuts = this.defineShortcuts();
      this.init();
    }

    init() {
      this.addStyles();
      this.createOverlay();
      this.bindEvents();
      console.log("⌨️ Bael Shortcuts initialized");
    }

    defineShortcuts() {
      return {
        Navigation: [
          {
            keys: ["Ctrl", "K"],
            description: "Command Palette",
            system: "command-palette",
          },
          {
            keys: ["Ctrl", "Space"],
            description: "Quick Actions Radial",
            system: "quick-actions",
          },
          { keys: ["Ctrl", "B"], description: "File Tree", system: "filetree" },
          {
            keys: ["Ctrl", "F"],
            description: "Chat Search",
            system: "chat-search",
          },
          { keys: ["Ctrl", "`"], description: "Terminal", system: "terminal" },
        ],
        "Panels & Views": [
          {
            keys: ["Ctrl", "Shift", "F"],
            description: "Focus Mode",
            system: "focus-mode",
          },
          {
            keys: ["Ctrl", "Shift", "N"],
            description: "Notes Panel",
            system: "notes-panel",
          },
          {
            keys: ["Ctrl", "Shift", "P"],
            description: "Prompt Library",
            system: "prompt-library",
          },
          {
            keys: ["Ctrl", "Shift", "M"],
            description: "Markdown Preview",
            system: "markdown-preview",
          },
          {
            keys: ["Ctrl", "Shift", "T"],
            description: "Timeline",
            system: "timeline",
          },
          {
            keys: ["Ctrl", "Shift", "E"],
            description: "Code Playground",
            system: "playground",
          },
          {
            keys: ["Ctrl", "Shift", "D"],
            description: "Dashboard",
            system: "dashboard",
          },
          {
            keys: ["Ctrl", "Alt", "S"],
            description: "Split View",
            system: "split-view",
          },
        ],
        Tools: [
          {
            keys: ["Ctrl", "Shift", "V"],
            description: "Voice Commands",
            system: "voice-commands",
          },
          {
            keys: ["Ctrl", "Alt", "P"],
            description: "AI Personas",
            system: "personas",
          },
          {
            keys: ["Ctrl", "Shift", "B"],
            description: "Bookmarks",
            system: "bookmarks",
          },
          {
            keys: ["Ctrl", "T"],
            description: "Quick Templates",
            system: "templates",
          },
          {
            keys: ["Ctrl", "Shift", "S"],
            description: "Snippets Library",
            system: "snippets",
          },
          {
            keys: ["Ctrl", "Alt", "D"],
            description: "Diff Viewer",
            system: "diff-viewer",
          },
          {
            keys: ["Ctrl", "Shift", "A"],
            description: "Analytics",
            system: "analytics",
          },
        ],
        Editing: [
          { keys: ["Ctrl", "Z"], description: "Undo", system: "history" },
          { keys: ["Ctrl", "Y"], description: "Redo", system: "history" },
          {
            keys: ["Ctrl", "Shift", "H"],
            description: "History Panel",
            system: "history",
          },
          {
            keys: ["Ctrl", "Shift", "R"],
            description: "Draft Recovery",
            system: "auto-save",
          },
          {
            keys: ["Ctrl", "Shift", "B"],
            description: "Branch Manager",
            system: "branching",
          },
        ],
        Collaboration: [
          {
            keys: ["Ctrl", "Shift", "C"],
            description: "Collaboration Mode",
            system: "collaboration",
          },
        ],
        Accessibility: [
          {
            keys: ["Alt", "A"],
            description: "Accessibility Menu",
            system: "accessibility",
          },
        ],
        Data: [
          { keys: ["Ctrl", "E"], description: "Export Chat", system: "export" },
        ],
        System: [
          {
            keys: ["?"],
            description: "Show This Overlay",
            system: "shortcuts",
          },
          { keys: ["Esc"], description: "Close Current Panel", system: "core" },
        ],
      };
    }

    addStyles() {
      const styles = document.createElement("style");
      styles.id = "bael-shortcuts-styles";
      styles.textContent = `
                /* Shortcuts Overlay */
                .bael-shortcuts-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.85);
                    z-index: 100100;
                    display: none;
                    align-items: center;
                    justify-content: center;
                    backdrop-filter: blur(8px);
                    padding: 40px;
                    overflow: auto;
                }

                .bael-shortcuts-overlay.visible {
                    display: flex;
                    animation: overlayFadeIn 0.2s ease;
                }

                @keyframes overlayFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .shortcuts-container {
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 20px;
                    max-width: 900px;
                    width: 100%;
                    max-height: 80vh;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    animation: containerAppear 0.3s ease;
                }

                @keyframes containerAppear {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }

                /* Header */
                .shortcuts-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 20px 24px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .shortcuts-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .shortcuts-title h2 {
                    font-size: 18px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                    margin: 0;
                }

                .shortcuts-title-icon {
                    font-size: 24px;
                }

                .shortcuts-search {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 14px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    width: 250px;
                }

                .shortcuts-search input {
                    flex: 1;
                    background: transparent;
                    border: none;
                    color: var(--bael-text-primary, #fff);
                    font-size: 13px;
                    outline: none;
                }

                .shortcuts-search input::placeholder {
                    color: var(--bael-text-muted, #666);
                }

                .shortcuts-search-icon {
                    color: var(--bael-text-muted, #666);
                    font-size: 14px;
                }

                .shortcuts-close {
                    width: 36px;
                    height: 36px;
                    background: transparent;
                    border: none;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    border-radius: 8px;
                    font-size: 20px;
                }

                .shortcuts-close:hover {
                    background: rgba(255, 51, 102, 0.2);
                    color: var(--bael-accent, #ff3366);
                }

                /* Content */
                .shortcuts-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px;
                }

                .shortcuts-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 24px;
                }

                /* Category */
                .shortcuts-category {
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 12px;
                    overflow: hidden;
                }

                .category-header {
                    padding: 12px 16px;
                    background: var(--bael-bg-tertiary, #181820);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .category-title {
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--bael-accent, #ff3366);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .category-shortcuts {
                    padding: 8px;
                }

                /* Shortcut Item */
                .shortcut-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 12px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .shortcut-item:hover {
                    background: var(--bael-bg-tertiary, #181820);
                }

                .shortcut-item.hidden {
                    display: none;
                }

                .shortcut-description {
                    font-size: 13px;
                    color: var(--bael-text-primary, #fff);
                }

                .shortcut-keys {
                    display: flex;
                    gap: 4px;
                }

                .key {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 24px;
                    height: 24px;
                    padding: 0 8px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 500;
                    color: var(--bael-text-primary, #fff);
                    font-family: -apple-system, BlinkMacSystemFont, 'SF Mono', Monaco, monospace;
                    box-shadow: 0 2px 0 var(--bael-border, #2a2a3a);
                }

                .key-separator {
                    color: var(--bael-text-muted, #666);
                    font-size: 10px;
                    align-self: center;
                }

                /* Footer */
                .shortcuts-footer {
                    padding: 16px 24px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .footer-tip {
                    font-size: 12px;
                    color: var(--bael-text-muted, #666);
                }

                .footer-tip kbd {
                    padding: 2px 6px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 4px;
                    font-size: 11px;
                    font-family: monospace;
                }

                .bael-logo {
                    font-size: 12px;
                    color: var(--bael-accent, #ff3366);
                    font-weight: 600;
                }

                /* Responsive */
                @media (max-width: 600px) {
                    .shortcuts-grid {
                        grid-template-columns: 1fr;
                    }

                    .shortcuts-header {
                        flex-wrap: wrap;
                        gap: 12px;
                    }

                    .shortcuts-search {
                        width: 100%;
                        order: 1;
                    }
                }
            `;
      document.head.appendChild(styles);
    }

    createOverlay() {
      const overlay = document.createElement("div");
      overlay.className = "bael-shortcuts-overlay";
      overlay.innerHTML = this.renderOverlay();
      document.body.appendChild(overlay);
      this.overlay = overlay;

      this.bindOverlayEvents();
    }

    renderOverlay() {
      return `
                <div class="shortcuts-container">
                    <div class="shortcuts-header">
                        <div class="shortcuts-title">
                            <span class="shortcuts-title-icon">⌨️</span>
                            <h2>Keyboard Shortcuts</h2>
                        </div>
                        <div class="shortcuts-search">
                            <span class="shortcuts-search-icon">🔍</span>
                            <input type="text" placeholder="Search shortcuts..." id="shortcuts-search-input">
                        </div>
                        <button class="shortcuts-close">×</button>
                    </div>

                    <div class="shortcuts-content">
                        <div class="shortcuts-grid">
                            ${Object.entries(this.shortcuts)
                              .map(
                                ([category, items]) => `
                                <div class="shortcuts-category">
                                    <div class="category-header">
                                        <div class="category-title">${category}</div>
                                    </div>
                                    <div class="category-shortcuts">
                                        ${items
                                          .map(
                                            (item) => `
                                            <div class="shortcut-item" data-description="${item.description.toLowerCase()}" data-keys="${item.keys.join(" ").toLowerCase()}">
                                                <span class="shortcut-description">${item.description}</span>
                                                <div class="shortcut-keys">
                                                    ${item.keys
                                                      .map(
                                                        (key, i) => `
                                                        <span class="key">${this.formatKey(key)}</span>
                                                        ${i < item.keys.length - 1 ? '<span class="key-separator">+</span>' : ""}
                                                    `,
                                                      )
                                                      .join("")}
                                                </div>
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
                    </div>

                    <div class="shortcuts-footer">
                        <div class="footer-tip">
                            Press <kbd>?</kbd> anytime to toggle this overlay • <kbd>Esc</kbd> to close
                        </div>
                        <div class="bael-logo">BAEL - LORD OF ALL</div>
                    </div>
                </div>
            `;
    }

    formatKey(key) {
      const keyMap = {
        Ctrl: "⌃",
        Shift: "⇧",
        Alt: "⌥",
        Meta: "⌘",
        Space: "␣",
        Enter: "↵",
        Esc: "⎋",
        Tab: "⇥",
      };

      // On Mac, use symbols; on Windows/Linux, use text
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      if (isMac && keyMap[key]) {
        return keyMap[key];
      }
      return key;
    }

    bindOverlayEvents() {
      // Close button
      this.overlay
        .querySelector(".shortcuts-close")
        .addEventListener("click", () => this.hide());

      // Click outside to close
      this.overlay.addEventListener("click", (e) => {
        if (e.target === this.overlay) {
          this.hide();
        }
      });

      // Search functionality
      const searchInput = this.overlay.querySelector("#shortcuts-search-input");
      searchInput.addEventListener("input", (e) => {
        this.filterShortcuts(e.target.value);
      });

      // Shortcut items - click to trigger
      this.overlay.querySelectorAll(".shortcut-item").forEach((item) => {
        item.addEventListener("click", () => {
          this.hide();
          // Could trigger the actual shortcut here if needed
        });
      });
    }

    filterShortcuts(query) {
      const lowerQuery = query.toLowerCase();
      this.overlay.querySelectorAll(".shortcut-item").forEach((item) => {
        const description = item.dataset.description || "";
        const keys = item.dataset.keys || "";
        const matches =
          description.includes(lowerQuery) || keys.includes(lowerQuery);
        item.classList.toggle("hidden", !matches && query.length > 0);
      });

      // Hide empty categories
      this.overlay
        .querySelectorAll(".shortcuts-category")
        .forEach((category) => {
          const visibleItems = category.querySelectorAll(
            ".shortcut-item:not(.hidden)",
          ).length;
          category.style.display =
            visibleItems === 0 && query.length > 0 ? "none" : "block";
        });
    }

    bindEvents() {
      document.addEventListener("keydown", (e) => {
        // ? key to show overlay (without modifiers or just shift)
        if (e.key === "?" && !e.ctrlKey && !e.altKey && !e.metaKey) {
          // Don't trigger if typing in an input
          if (
            e.target.tagName === "INPUT" ||
            e.target.tagName === "TEXTAREA" ||
            e.target.contentEditable === "true"
          ) {
            return;
          }
          e.preventDefault();
          this.toggle();
        }

        // Escape to close
        if (e.key === "Escape" && this.overlay.classList.contains("visible")) {
          e.preventDefault();
          this.hide();
        }
      });
    }

    show() {
      this.overlay.classList.add("visible");
      this.overlay.querySelector("#shortcuts-search-input").focus();
    }

    hide() {
      this.overlay.classList.remove("visible");
      this.overlay.querySelector("#shortcuts-search-input").value = "";
      this.filterShortcuts("");
    }

    toggle() {
      if (this.overlay.classList.contains("visible")) {
        this.hide();
      } else {
        this.show();
      }
    }
  }

  // Initialize
  window.BaelShortcuts = new BaelShortcuts();
})();
