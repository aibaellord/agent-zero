/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █  ██╗    ██╗ ██████╗ ██████╗ ██╗  ██╗███████╗██████╗  █████╗  ██████╗███████╗█
 * █  ██║    ██║██╔═══██╗██╔══██╗██║ ██╔╝██╔════╝██╔══██╗██╔══██╗██╔════╝██╔════╝█
 * █  ██║ █╗ ██║██║   ██║██████╔╝█████╔╝ ███████╗██████╔╝███████║██║     █████╗  █
 * █  ██║███╗██║██║   ██║██╔══██╗██╔═██╗ ╚════██║██╔═══╝ ██╔══██║██║     ██╔══╝  █
 * █  ╚███╔███╔╝╚██████╔╝██║  ██║██║  ██╗███████║██║     ██║  ██║╚██████╗███████╗█
 * █   ╚══╝╚══╝  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝  ╚═╝ ╚═════╝╚══════╝█
 * █                                                                          █
 * █   BAEL WORKSPACE LAYOUTS - Save & Restore UI Layouts                    █
 * █   Manage multiple workspace configurations (Ctrl+Shift+L)               █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  class BaelWorkspaceLayouts {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
      this.container = null;
      this.layouts = [];
      this.currentLayout = null;
    }

    async initialize() {
      console.log("📐 Bael Workspace Layouts initializing...");

      this.loadLayouts();
      this.injectStyles();
      this.createContainer();
      this.setupShortcuts();

      // Apply last used layout
      this.applyLastLayout();

      this.initialized = true;
      console.log("✅ BAEL WORKSPACE LAYOUTS READY");

      return this;
    }

    injectStyles() {
      if (document.getElementById("bael-workspace-layouts-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-workspace-layouts-styles";
      styles.textContent = `
                .bael-layouts-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(8px);
                    z-index: 9900;
                    opacity: 0;
                    transition: opacity 0.25s ease;
                    pointer-events: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .bael-layouts-overlay.visible {
                    opacity: 1;
                    pointer-events: auto;
                }

                .bael-layouts-modal {
                    width: 90vw;
                    max-width: 900px;
                    max-height: 80vh;
                    background: #12121a;
                    border-radius: 16px;
                    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    transform: scale(0.95);
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .bael-layouts-overlay.visible .bael-layouts-modal {
                    transform: scale(1);
                }

                .layouts-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 20px 24px;
                    background: rgba(255, 255, 255, 0.03);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .layouts-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .layouts-title h2 {
                    margin: 0;
                    font-size: 20px;
                    font-weight: 600;
                    color: #fff;
                }

                .layouts-header-actions {
                    display: flex;
                    gap: 10px;
                }

                .layout-btn {
                    padding: 10px 18px;
                    border-radius: 8px;
                    border: none;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .layout-btn.primary {
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                    color: #fff;
                }

                .layout-btn.primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
                }

                .layout-btn.secondary {
                    background: rgba(255, 255, 255, 0.08);
                    color: rgba(255, 255, 255, 0.8);
                }

                .layout-btn.secondary:hover {
                    background: rgba(255, 255, 255, 0.12);
                }

                .layouts-close {
                    width: 40px;
                    height: 40px;
                    border-radius: 8px;
                    border: none;
                    background: rgba(255, 255, 255, 0.08);
                    color: rgba(255, 255, 255, 0.6);
                    cursor: pointer;
                    font-size: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }

                .layouts-close:hover {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }

                .layouts-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px 24px;
                }

                .layouts-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 16px;
                }

                .layout-card {
                    background: rgba(255, 255, 255, 0.04);
                    border-radius: 12px;
                    border: 2px solid rgba(255, 255, 255, 0.06);
                    overflow: hidden;
                    transition: all 0.2s;
                    cursor: pointer;
                }

                .layout-card:hover {
                    border-color: rgba(99, 102, 241, 0.3);
                    transform: translateY(-3px);
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
                }

                .layout-card.active {
                    border-color: #6366f1;
                }

                .layout-preview {
                    height: 120px;
                    background: rgba(0, 0, 0, 0.3);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }

                .layout-preview-grid {
                    width: 90%;
                    height: 80%;
                    display: grid;
                    gap: 4px;
                    padding: 8px;
                }

                .layout-preview-panel {
                    background: rgba(99, 102, 241, 0.2);
                    border-radius: 4px;
                }

                .layout-info {
                    padding: 14px;
                }

                .layout-info h4 {
                    margin: 0 0 6px;
                    font-size: 14px;
                    font-weight: 600;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .layout-info p {
                    margin: 0;
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.5);
                }

                .layout-badge {
                    padding: 2px 8px;
                    border-radius: 4px;
                    background: rgba(99, 102, 241, 0.2);
                    color: #6366f1;
                    font-size: 10px;
                    font-weight: 500;
                }

                .layout-actions {
                    display: flex;
                    gap: 8px;
                    margin-top: 10px;
                }

                .layout-action-btn {
                    flex: 1;
                    padding: 8px;
                    border-radius: 6px;
                    border: none;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .layout-action-btn.apply {
                    background: rgba(34, 197, 94, 0.2);
                    color: #22c55e;
                }

                .layout-action-btn.apply:hover {
                    background: rgba(34, 197, 94, 0.3);
                }

                .layout-action-btn.delete {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }

                .layout-action-btn.delete:hover {
                    background: rgba(239, 68, 68, 0.3);
                }

                .preset-layouts {
                    margin-bottom: 24px;
                }

                .preset-layouts h3 {
                    font-size: 14px;
                    color: rgba(255, 255, 255, 0.6);
                    margin: 0 0 12px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .custom-layouts {
                    margin-top: 24px;
                }

                .empty-state {
                    text-align: center;
                    padding: 40px;
                    color: rgba(255, 255, 255, 0.5);
                }

                .empty-state .icon {
                    font-size: 48px;
                    margin-bottom: 12px;
                }
            `;
      document.head.appendChild(styles);
    }

    createContainer() {
      this.container = document.createElement("div");
      this.container.id = "bael-workspace-layouts";
      this.container.className = "bael-layouts-overlay";

      this.container.innerHTML = `
                <div class="bael-layouts-modal">
                    <div class="layouts-header">
                        <div class="layouts-title">
                            <span style="font-size: 24px;">📐</span>
                            <h2>Workspace Layouts</h2>
                        </div>
                        <div class="layouts-header-actions">
                            <button class="layout-btn primary" onclick="BaelWorkspaceLayouts.saveCurrentLayout()">
                                💾 Save Current Layout
                            </button>
                            <button class="layouts-close" onclick="BaelWorkspaceLayouts.hide()">✕</button>
                        </div>
                    </div>
                    <div class="layouts-content">
                        <div class="preset-layouts">
                            <h3>📋 Preset Layouts</h3>
                            <div class="layouts-grid preset-grid"></div>
                        </div>
                        <div class="custom-layouts">
                            <h3>⭐ Your Layouts</h3>
                            <div class="layouts-grid custom-grid"></div>
                        </div>
                    </div>
                </div>
            `;

      document.body.appendChild(this.container);

      // Close on overlay click
      this.container.addEventListener("click", (e) => {
        if (e.target === this.container) {
          this.hide();
        }
      });
    }

    setupShortcuts() {
      document.addEventListener("keydown", (e) => {
        // Ctrl+Shift+L to show layouts
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "L") {
          e.preventDefault();
          if (this.visible) {
            this.hide();
          } else {
            this.show();
          }
        }

        // Quick layout switching with Ctrl+Alt+1-5
        if (
          (e.ctrlKey || e.metaKey) &&
          e.altKey &&
          e.key >= "1" &&
          e.key <= "5"
        ) {
          e.preventDefault();
          const idx = parseInt(e.key) - 1;
          const presets = this.getPresetLayouts();
          if (presets[idx]) {
            this.applyLayout(presets[idx]);
          }
        }
      });
    }

    loadLayouts() {
      try {
        const stored = localStorage.getItem("bael_workspace_layouts");
        this.layouts = stored ? JSON.parse(stored) : [];
      } catch (e) {
        this.layouts = [];
      }
    }

    saveLayouts() {
      localStorage.setItem(
        "bael_workspace_layouts",
        JSON.stringify(this.layouts),
      );
    }

    getPresetLayouts() {
      return [
        {
          id: "preset_default",
          name: "Default",
          description: "Standard single-panel layout",
          preset: true,
          gridTemplate: "1fr",
          panels: ["chat"],
          config: {
            sidebarCollapsed: false,
            powerBarVisible: true,
            chatPanelWidth: "100%",
          },
        },
        {
          id: "preset_split",
          name: "Split View",
          description: "Chat with side panel",
          preset: true,
          gridTemplate: "2fr 1fr",
          panels: ["chat", "files"],
          config: {
            sidebarCollapsed: true,
            powerBarVisible: true,
            chatPanelWidth: "65%",
          },
        },
        {
          id: "preset_focus",
          name: "Focus Mode",
          description: "Distraction-free chat",
          preset: true,
          gridTemplate: "1fr",
          panels: ["chat"],
          config: {
            sidebarCollapsed: true,
            powerBarVisible: false,
            chatPanelWidth: "100%",
          },
        },
        {
          id: "preset_developer",
          name: "Developer",
          description: "Chat with code & debug",
          preset: true,
          gridTemplate: "1fr 1fr",
          panels: ["chat", "code"],
          config: {
            sidebarCollapsed: true,
            powerBarVisible: true,
            debugConsoleVisible: true,
          },
        },
        {
          id: "preset_research",
          name: "Research",
          description: "Chat with memory & knowledge",
          preset: true,
          gridTemplate: "2fr 1fr",
          panels: ["chat", "memory"],
          config: {
            sidebarCollapsed: false,
            powerBarVisible: true,
          },
        },
      ];
    }

    getLayoutPreviewStyle(layout) {
      // Generate a visual representation based on grid template
      const panels = layout.panels || ["chat"];
      const cols = layout.gridTemplate?.split(" ").length || 1;

      return {
        gridTemplateColumns: layout.gridTemplate || "1fr",
        gridTemplateRows: panels.length > cols ? "repeat(2, 1fr)" : "1fr",
      };
    }

    render() {
      const presetGrid = this.container.querySelector(".preset-grid");
      const customGrid = this.container.querySelector(".custom-grid");

      const presets = this.getPresetLayouts();

      // Render presets
      presetGrid.innerHTML = presets
        .map((layout) => this.renderLayoutCard(layout))
        .join("");

      // Render custom layouts
      if (this.layouts.length === 0) {
        customGrid.innerHTML = `
                    <div class="empty-state" style="grid-column: 1 / -1;">
                        <span class="icon">📭</span>
                        <p>No custom layouts saved yet.<br>Click "Save Current Layout" to create one.</p>
                    </div>
                `;
      } else {
        customGrid.innerHTML = this.layouts
          .map((layout) => this.renderLayoutCard(layout, true))
          .join("");
      }
    }

    renderLayoutCard(layout, showDelete = false) {
      const style = this.getLayoutPreviewStyle(layout);
      const isActive = this.currentLayout === layout.id;

      return `
                <div class="layout-card ${isActive ? "active" : ""}" data-id="${layout.id}">
                    <div class="layout-preview">
                        <div class="layout-preview-grid" style="grid-template-columns: ${style.gridTemplateColumns}; grid-template-rows: ${style.gridTemplateRows};">
                            ${(layout.panels || ["chat"]).map(() => '<div class="layout-preview-panel"></div>').join("")}
                        </div>
                    </div>
                    <div class="layout-info">
                        <h4>
                            ${layout.name}
                            ${isActive ? '<span class="layout-badge">Active</span>' : ""}
                        </h4>
                        <p>${layout.description || "Custom layout"}</p>
                        <div class="layout-actions">
                            <button class="layout-action-btn apply" onclick="BaelWorkspaceLayouts.applyLayout('${layout.id}')">
                                Apply
                            </button>
                            ${
                              showDelete
                                ? `
                                <button class="layout-action-btn delete" onclick="BaelWorkspaceLayouts.deleteLayout('${layout.id}')">
                                    Delete
                                </button>
                            `
                                : ""
                            }
                        </div>
                    </div>
                </div>
            `;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ACTIONS
    // ═══════════════════════════════════════════════════════════════════════

    show() {
      this.visible = true;
      this.container.classList.add("visible");
      this.render();
    }

    hide() {
      this.visible = false;
      this.container.classList.remove("visible");
    }

    captureCurrentLayout() {
      // Capture current UI state
      const config = {
        sidebarCollapsed:
          document.querySelector(".sidebar")?.classList.contains("collapsed") ||
          false,
        powerBarVisible: window.BaelPowerBar?.visible ?? true,
        debugConsoleVisible: window.BaelDebugConsole?.visible ?? false,
        // Add more UI state captures as needed
      };

      return config;
    }

    saveCurrentLayout() {
      const name = prompt("Layout name:");
      if (!name) return;

      const description = prompt("Description (optional):") || "";

      const layout = {
        id: "layout_" + Date.now(),
        name,
        description,
        preset: false,
        gridTemplate: "1fr",
        panels: ["chat"],
        config: this.captureCurrentLayout(),
        created: new Date().toISOString(),
      };

      this.layouts.push(layout);
      this.saveLayouts();
      this.render();
      this.toast("Layout saved!", "success");
    }

    applyLayout(layoutId) {
      // Find the layout
      const presets = this.getPresetLayouts();
      let layout = presets.find((l) => l.id === layoutId);
      if (!layout) {
        layout = this.layouts.find((l) => l.id === layoutId);
      }

      if (!layout) return;

      this.currentLayout = layout.id;
      localStorage.setItem("bael_current_layout", layout.id);

      // Apply configuration
      const config = layout.config || {};

      // Apply sidebar state
      const sidebar = document.querySelector('.sidebar, [x-data*="sidebar"]');
      if (sidebar && config.sidebarCollapsed !== undefined) {
        sidebar.classList.toggle("collapsed", config.sidebarCollapsed);
      }

      // Apply power bar visibility
      if (window.BaelPowerBar && config.powerBarVisible !== undefined) {
        if (config.powerBarVisible) {
          window.BaelPowerBar.show?.();
        } else {
          window.BaelPowerBar.hide?.();
        }
      }

      // Apply debug console
      if (window.BaelDebugConsole && config.debugConsoleVisible) {
        window.BaelDebugConsole.show?.();
      }

      // Dispatch event for other modules
      window.dispatchEvent(
        new CustomEvent("bael:layout-changed", {
          detail: { layout },
        }),
      );

      this.toast(`Applied: ${layout.name}`, "success");
      this.hide();
    }

    deleteLayout(layoutId) {
      if (!confirm("Delete this layout?")) return;

      this.layouts = this.layouts.filter((l) => l.id !== layoutId);
      this.saveLayouts();
      this.render();
      this.toast("Layout deleted", "success");
    }

    applyLastLayout() {
      const lastLayoutId = localStorage.getItem("bael_current_layout");
      if (lastLayoutId) {
        // Delay to ensure UI is ready
        setTimeout(() => {
          this.applyLayout(lastLayoutId);
        }, 500);
      }
    }

    toast(message, type = "info") {
      window.dispatchEvent(
        new CustomEvent("bael:toast", {
          detail: { message, type },
        }),
      );
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  window.BaelWorkspaceLayouts = new BaelWorkspaceLayouts();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelWorkspaceLayouts.initialize();
    });
  } else {
    window.BaelWorkspaceLayouts.initialize();
  }

  console.log("📐 Bael Workspace Layouts loaded");
})();
