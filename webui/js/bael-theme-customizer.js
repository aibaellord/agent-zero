/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █  ████████╗██╗  ██╗███████╗███╗   ███╗███████╗                            █
 * █  ╚══██╔══╝██║  ██║██╔════╝████╗ ████║██╔════╝                            █
 * █     ██║   ███████║█████╗  ██╔████╔██║█████╗                              █
 * █     ██║   ██╔══██║██╔══╝  ██║╚██╔╝██║██╔══╝                              █
 * █     ██║   ██║  ██║███████╗██║ ╚═╝ ██║███████╗                            █
 * █     ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝╚══════╝                            █
 * █                                                                          █
 * █   BAEL THEME CUSTOMIZER - Custom Theme Builder (Ctrl+Shift+Y)            █
 * █   Create, save, and apply custom UI themes with live preview             █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  class BaelThemeCustomizer {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
      this.container = null;
      this.themes = [];
      this.currentTheme = null;
      this.previewStyles = null;

      this.defaultTheme = {
        name: "Bael Dark",
        id: "default",
        colors: {
          "bg-primary": "#12121a",
          "bg-secondary": "#1a1a2e",
          "bg-tertiary": "#252540",
          accent: "#6366f1",
          "accent-secondary": "#8b5cf6",
          "text-primary": "#ffffff",
          "text-secondary": "rgba(255, 255, 255, 0.7)",
          "text-muted": "rgba(255, 255, 255, 0.4)",
          border: "rgba(255, 255, 255, 0.1)",
          success: "#22c55e",
          warning: "#f59e0b",
          error: "#ef4444",
          info: "#3b82f6",
        },
        font: "Inter, system-ui, sans-serif",
        borderRadius: "12px",
        isDefault: true,
      };
    }

    async initialize() {
      console.log("🎨 Bael Theme Customizer initializing...");

      this.loadThemes();
      this.loadCurrentTheme();
      this.injectStyles();
      this.createContainer();
      this.setupShortcuts();
      this.applyTheme(this.currentTheme);

      this.initialized = true;
      console.log("✅ BAEL THEME CUSTOMIZER READY");

      return this;
    }

    loadThemes() {
      try {
        const saved = localStorage.getItem("bael-custom-themes");
        if (saved) {
          this.themes = JSON.parse(saved);
        }
      } catch (e) {
        this.themes = [];
      }

      // Always include default theme
      if (!this.themes.find((t) => t.id === "default")) {
        this.themes.unshift(this.defaultTheme);
      }
    }

    loadCurrentTheme() {
      try {
        const saved = localStorage.getItem("bael-current-theme");
        if (saved) {
          const themeId = saved;
          this.currentTheme =
            this.themes.find((t) => t.id === themeId) || this.defaultTheme;
        } else {
          this.currentTheme = this.defaultTheme;
        }
      } catch (e) {
        this.currentTheme = this.defaultTheme;
      }
    }

    saveThemes() {
      try {
        localStorage.setItem("bael-custom-themes", JSON.stringify(this.themes));
      } catch (e) {}
    }

    saveCurrentTheme() {
      try {
        localStorage.setItem("bael-current-theme", this.currentTheme.id);
      } catch (e) {}
    }

    injectStyles() {
      if (document.getElementById("bael-theme-customizer-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-theme-customizer-styles";
      styles.textContent = `
                .bael-theme-container {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0.95);
                    width: 700px;
                    max-height: 85vh;
                    background: #12121a;
                    border-radius: 20px;
                    box-shadow: 0 30px 100px rgba(0, 0, 0, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    z-index: 9850;
                    opacity: 0;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    pointer-events: none;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                .bael-theme-container.visible {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                    pointer-events: auto;
                }

                .bael-theme-backdrop {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    z-index: 9849;
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    pointer-events: none;
                }

                .bael-theme-backdrop.visible {
                    opacity: 1;
                    pointer-events: auto;
                }

                .theme-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 20px 24px;
                    background: linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(236, 72, 153, 0.1) 100%);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .theme-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 18px;
                    font-weight: 600;
                    color: #fff;
                }

                .theme-actions {
                    display: flex;
                    gap: 10px;
                }

                .theme-btn {
                    padding: 8px 14px;
                    border-radius: 8px;
                    border: none;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .theme-btn.primary {
                    background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
                    color: #fff;
                }

                .theme-btn.primary:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
                }

                .theme-btn.secondary {
                    background: rgba(255, 255, 255, 0.08);
                    color: rgba(255, 255, 255, 0.7);
                }

                .theme-btn.secondary:hover {
                    background: rgba(255, 255, 255, 0.12);
                    color: #fff;
                }

                .theme-close {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    border: none;
                    background: rgba(255, 255, 255, 0.08);
                    color: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    font-size: 16px;
                    transition: all 0.2s;
                }

                .theme-close:hover {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }

                .theme-body {
                    display: flex;
                    flex: 1;
                    overflow: hidden;
                }

                .theme-sidebar {
                    width: 200px;
                    background: rgba(255, 255, 255, 0.02);
                    border-right: 1px solid rgba(255, 255, 255, 0.06);
                    padding: 16px;
                    overflow-y: auto;
                }

                .theme-list-title {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.4);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 12px;
                }

                .theme-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .theme-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 12px;
                    border-radius: 8px;
                    cursor: pointer;
                    transition: all 0.2s;
                    border: 1px solid transparent;
                }

                .theme-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                }

                .theme-item.active {
                    background: rgba(139, 92, 246, 0.15);
                    border-color: rgba(139, 92, 246, 0.3);
                }

                .theme-preview-colors {
                    display: flex;
                    gap: 2px;
                }

                .theme-preview-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 2px;
                }

                .theme-item-name {
                    flex: 1;
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.8);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .new-theme-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    width: 100%;
                    padding: 10px;
                    margin-top: 12px;
                    border-radius: 8px;
                    border: 1px dashed rgba(255, 255, 255, 0.15);
                    background: transparent;
                    color: rgba(255, 255, 255, 0.4);
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .new-theme-btn:hover {
                    border-color: rgba(139, 92, 246, 0.4);
                    color: #8b5cf6;
                }

                .theme-editor {
                    flex: 1;
                    padding: 20px;
                    overflow-y: auto;
                }

                .editor-section {
                    margin-bottom: 24px;
                }

                .editor-section-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: #fff;
                    margin-bottom: 16px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .color-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                }

                .color-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 12px;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 10px;
                    border: 1px solid rgba(255, 255, 255, 0.06);
                }

                .color-input-wrapper {
                    position: relative;
                    width: 36px;
                    height: 36px;
                }

                .color-input {
                    width: 100%;
                    height: 100%;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    -webkit-appearance: none;
                    padding: 0;
                    overflow: hidden;
                }

                .color-input::-webkit-color-swatch-wrapper {
                    padding: 0;
                }

                .color-input::-webkit-color-swatch {
                    border: none;
                    border-radius: 8px;
                }

                .color-info {
                    flex: 1;
                }

                .color-label {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.7);
                }

                .color-value {
                    font-size: 10px;
                    color: rgba(255, 255, 255, 0.4);
                    font-family: monospace;
                    margin-top: 2px;
                }

                .option-row {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 12px;
                }

                .option-item {
                    flex: 1;
                }

                .option-label {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.5);
                    margin-bottom: 6px;
                }

                .option-input {
                    width: 100%;
                    padding: 10px 12px;
                    background: rgba(255, 255, 255, 0.06);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 8px;
                    color: #fff;
                    font-size: 13px;
                    outline: none;
                }

                .option-input:focus {
                    border-color: rgba(139, 92, 246, 0.5);
                }

                .theme-preview {
                    padding: 16px 20px;
                    background: rgba(255, 255, 255, 0.02);
                    border-top: 1px solid rgba(255, 255, 255, 0.06);
                }

                .preview-title {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.4);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 12px;
                }

                .preview-box {
                    padding: 16px;
                    border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    display: flex;
                    gap: 12px;
                    align-items: center;
                }

                .preview-elements {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                }

                .preview-element {
                    padding: 8px 14px;
                    border-radius: 6px;
                    font-size: 12px;
                }
            `;
      document.head.appendChild(styles);
    }

    createContainer() {
      // Create backdrop
      this.backdrop = document.createElement("div");
      this.backdrop.className = "bael-theme-backdrop";
      this.backdrop.onclick = () => this.hide();
      document.body.appendChild(this.backdrop);

      // Create main container
      this.container = document.createElement("div");
      this.container.id = "bael-theme-customizer";
      this.container.className = "bael-theme-container";

      // Create preview styles element
      this.previewStyles = document.createElement("style");
      this.previewStyles.id = "bael-theme-preview";
      document.head.appendChild(this.previewStyles);

      this.renderContainer();

      document.body.appendChild(this.container);
    }

    renderContainer() {
      const theme = this.currentTheme;

      this.container.innerHTML = `
                <div class="theme-header">
                    <div class="theme-title">
                        <span>🎨</span> Theme Customizer
                    </div>
                    <div class="theme-actions">
                        <button class="theme-btn secondary" onclick="BaelThemeCustomizer.resetTheme()">Reset</button>
                        <button class="theme-btn primary" onclick="BaelThemeCustomizer.saveTheme()">
                            💾 Save Theme
                        </button>
                        <button class="theme-close" onclick="BaelThemeCustomizer.hide()">✕</button>
                    </div>
                </div>
                <div class="theme-body">
                    <div class="theme-sidebar">
                        <div class="theme-list-title">Themes</div>
                        <div class="theme-list">
                            ${this.themes
                              .map(
                                (t) => `
                                <div class="theme-item ${t.id === theme.id ? "active" : ""}"
                                     onclick="BaelThemeCustomizer.selectTheme('${t.id}')">
                                    <div class="theme-preview-colors">
                                        <div class="theme-preview-dot" style="background: ${t.colors["bg-primary"]}"></div>
                                        <div class="theme-preview-dot" style="background: ${t.colors["accent"]}"></div>
                                        <div class="theme-preview-dot" style="background: ${t.colors["success"]}"></div>
                                    </div>
                                    <span class="theme-item-name">${t.name}</span>
                                </div>
                            `,
                              )
                              .join("")}
                        </div>
                        <button class="new-theme-btn" onclick="BaelThemeCustomizer.createNewTheme()">
                            + New Theme
                        </button>
                    </div>
                    <div class="theme-editor">
                        <div class="editor-section">
                            <div class="editor-section-title">📝 Theme Name</div>
                            <div class="option-row">
                                <div class="option-item">
                                    <input type="text" class="option-input" id="theme-name"
                                           value="${theme.name}"
                                           ${theme.isDefault ? "disabled" : ""}
                                           oninput="BaelThemeCustomizer.updateName(this.value)">
                                </div>
                            </div>
                        </div>

                        <div class="editor-section">
                            <div class="editor-section-title">🎨 Background Colors</div>
                            <div class="color-grid">
                                ${this.renderColorInput("bg-primary", "Primary BG", theme.colors["bg-primary"])}
                                ${this.renderColorInput("bg-secondary", "Secondary BG", theme.colors["bg-secondary"])}
                                ${this.renderColorInput("bg-tertiary", "Tertiary BG", theme.colors["bg-tertiary"])}
                                ${this.renderColorInput("border", "Borders", theme.colors["border"])}
                            </div>
                        </div>

                        <div class="editor-section">
                            <div class="editor-section-title">✨ Accent Colors</div>
                            <div class="color-grid">
                                ${this.renderColorInput("accent", "Primary Accent", theme.colors["accent"])}
                                ${this.renderColorInput("accent-secondary", "Secondary Accent", theme.colors["accent-secondary"])}
                            </div>
                        </div>

                        <div class="editor-section">
                            <div class="editor-section-title">📊 Status Colors</div>
                            <div class="color-grid">
                                ${this.renderColorInput("success", "Success", theme.colors["success"])}
                                ${this.renderColorInput("warning", "Warning", theme.colors["warning"])}
                                ${this.renderColorInput("error", "Error", theme.colors["error"])}
                                ${this.renderColorInput("info", "Info", theme.colors["info"])}
                            </div>
                        </div>

                        <div class="editor-section">
                            <div class="editor-section-title">📝 Typography</div>
                            <div class="option-row">
                                <div class="option-item">
                                    <div class="option-label">Font Family</div>
                                    <input type="text" class="option-input" id="theme-font"
                                           value="${theme.font}"
                                           oninput="BaelThemeCustomizer.updateFont(this.value)">
                                </div>
                                <div class="option-item">
                                    <div class="option-label">Border Radius</div>
                                    <input type="text" class="option-input" id="theme-radius"
                                           value="${theme.borderRadius}"
                                           oninput="BaelThemeCustomizer.updateRadius(this.value)">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="theme-preview">
                    <div class="preview-title">Live Preview</div>
                    <div class="preview-box" id="theme-preview-box">
                        <div class="preview-elements">
                            <div class="preview-element" style="background: var(--bael-accent); color: #fff;">Primary Button</div>
                            <div class="preview-element" style="background: var(--bael-success); color: #fff;">Success</div>
                            <div class="preview-element" style="background: var(--bael-error); color: #fff;">Error</div>
                            <div class="preview-element" style="background: var(--bael-bg-secondary); color: var(--bael-text-primary); border: 1px solid var(--bael-border);">Card</div>
                        </div>
                    </div>
                </div>
            `;

      this.updatePreviewBox();
    }

    renderColorInput(key, label, value) {
      // Convert rgba to hex for color input
      let hexValue = value;
      if (value.startsWith("rgba")) {
        const match = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
          hexValue =
            "#" +
            [match[1], match[2], match[3]]
              .map((x) => parseInt(x).toString(16).padStart(2, "0"))
              .join("");
        }
      }

      return `
                <div class="color-item">
                    <div class="color-input-wrapper">
                        <input type="color" class="color-input"
                               value="${hexValue}"
                               onchange="BaelThemeCustomizer.updateColor('${key}', this.value)">
                    </div>
                    <div class="color-info">
                        <div class="color-label">${label}</div>
                        <div class="color-value">${value}</div>
                    </div>
                </div>
            `;
    }

    setupShortcuts() {
      document.addEventListener("keydown", (e) => {
        // Ctrl+Shift+Y for theme customizer
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "Y") {
          e.preventDefault();
          if (this.visible) {
            this.hide();
          } else {
            this.show();
          }
        }

        // Escape to close
        if (e.key === "Escape" && this.visible) {
          this.hide();
        }
      });
    }

    show() {
      this.visible = true;
      this.backdrop.classList.add("visible");
      this.container.classList.add("visible");
      this.renderContainer();
    }

    hide() {
      this.visible = false;
      this.backdrop.classList.remove("visible");
      this.container.classList.remove("visible");
    }

    selectTheme(id) {
      this.currentTheme =
        this.themes.find((t) => t.id === id) || this.defaultTheme;
      this.saveCurrentTheme();
      this.applyTheme(this.currentTheme);
      this.renderContainer();
    }

    createNewTheme() {
      const name = prompt("Theme name:");
      if (!name?.trim()) return;

      const newTheme = {
        ...JSON.parse(JSON.stringify(this.defaultTheme)),
        id: Date.now().toString(),
        name: name.trim(),
        isDefault: false,
      };

      this.themes.push(newTheme);
      this.currentTheme = newTheme;
      this.saveThemes();
      this.saveCurrentTheme();
      this.renderContainer();
    }

    updateName(name) {
      if (this.currentTheme.isDefault) return;
      this.currentTheme.name = name;
    }

    updateColor(key, value) {
      this.currentTheme.colors[key] = value;
      this.applyTheme(this.currentTheme);
      this.updatePreviewBox();

      // Update color value display
      const colorItem = this.container
        .querySelector(`[onchange*="'${key}'"]`)
        ?.closest(".color-item");
      if (colorItem) {
        colorItem.querySelector(".color-value").textContent = value;
      }
    }

    updateFont(font) {
      this.currentTheme.font = font;
      this.applyTheme(this.currentTheme);
    }

    updateRadius(radius) {
      this.currentTheme.borderRadius = radius;
      this.applyTheme(this.currentTheme);
    }

    applyTheme(theme) {
      const css = `
                :root {
                    --bael-bg-primary: ${theme.colors["bg-primary"]};
                    --bael-bg-secondary: ${theme.colors["bg-secondary"]};
                    --bael-bg-tertiary: ${theme.colors["bg-tertiary"]};
                    --bael-accent: ${theme.colors["accent"]};
                    --bael-accent-secondary: ${theme.colors["accent-secondary"]};
                    --bael-text-primary: ${theme.colors["text-primary"]};
                    --bael-text-secondary: ${theme.colors["text-secondary"]};
                    --bael-text-muted: ${theme.colors["text-muted"]};
                    --bael-border: ${theme.colors["border"]};
                    --bael-success: ${theme.colors["success"]};
                    --bael-warning: ${theme.colors["warning"]};
                    --bael-error: ${theme.colors["error"]};
                    --bael-info: ${theme.colors["info"]};
                    --bael-font: ${theme.font};
                    --bael-radius: ${theme.borderRadius};
                }
            `;

      this.previewStyles.textContent = css;
    }

    updatePreviewBox() {
      const box = this.container?.querySelector("#theme-preview-box");
      if (box) {
        box.style.background = this.currentTheme.colors["bg-secondary"];
        box.style.borderColor = this.currentTheme.colors["border"];
      }
    }

    saveTheme() {
      if (!this.currentTheme.isDefault) {
        const idx = this.themes.findIndex((t) => t.id === this.currentTheme.id);
        if (idx >= 0) {
          this.themes[idx] = { ...this.currentTheme };
        }
      }
      this.saveThemes();
      this.saveCurrentTheme();

      window.dispatchEvent(
        new CustomEvent("bael:toast", {
          detail: { message: "Theme saved!", type: "success" },
        }),
      );
    }

    resetTheme() {
      this.currentTheme = JSON.parse(JSON.stringify(this.defaultTheme));
      this.applyTheme(this.currentTheme);
      this.renderContainer();
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  window.BaelThemeCustomizer = new BaelThemeCustomizer();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelThemeCustomizer.initialize();
    });
  } else {
    window.BaelThemeCustomizer.initialize();
  }

  console.log("🎨 Bael Theme Customizer loaded");
})();
