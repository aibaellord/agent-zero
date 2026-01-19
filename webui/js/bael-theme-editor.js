/**
 * BAEL - LORD OF ALL
 * Theme Editor
 * ============
 * Visual theme customization with live preview
 */

class BaelThemeEditor {
  constructor() {
    this.customTheme = JSON.parse(
      localStorage.getItem("bael_custom_theme") || "{}",
    );
    this.isOpen = false;

    this.colorVars = [
      { name: "Primary", var: "--color-primary", default: "#DC143C" },
      {
        name: "Primary Hover",
        var: "--color-primary-hover",
        default: "#FF4500",
      },
      { name: "Background", var: "--color-background", default: "#0a0a0a" },
      { name: "Panel", var: "--color-panel", default: "#1a1a1a" },
      { name: "Surface", var: "--color-surface", default: "#1e1e1e" },
      { name: "Text", var: "--color-text", default: "#e0e0e0" },
      {
        name: "Text Secondary",
        var: "--color-text-secondary",
        default: "#888888",
      },
      { name: "Border", var: "--color-border", default: "#333333" },
      { name: "Success", var: "--color-success", default: "#22c55e" },
      { name: "Warning", var: "--color-warning", default: "#eab308" },
      { name: "Error", var: "--color-error", default: "#ef4444" },
      { name: "Info", var: "--color-info", default: "#3b82f6" },
    ];

    this.init();
  }

  init() {
    this.createEditor();
    this.applyCustomTheme();
    console.log("🎨 Bael Theme Editor initialized");
  }

  createEditor() {
    const editor = document.createElement("div");
    editor.id = "bael-theme-editor";
    editor.className = "bael-theme-editor hidden";
    editor.innerHTML = `
            <div class="bte-overlay" onclick="baelThemeEditor.close()"></div>
            <div class="bte-modal">
                <div class="bte-header">
                    <h2>🎨 Theme Editor</h2>
                    <div class="bte-header-actions">
                        <button class="bte-btn" onclick="baelThemeEditor.reset()">↻ Reset</button>
                        <button class="bte-btn primary" onclick="baelThemeEditor.save()">💾 Save</button>
                        <button class="bte-btn-icon" onclick="baelThemeEditor.close()">✕</button>
                    </div>
                </div>
                <div class="bte-content">
                    <div class="bte-sidebar">
                        <h3>Presets</h3>
                        <div class="bte-presets">
                            <button class="bte-preset" onclick="baelThemeEditor.loadPreset('bael-dark')" data-theme="bael-dark">
                                <span class="bte-preset-preview" style="background: linear-gradient(135deg, #8B0000, #DC143C)"></span>
                                <span>Bael Dark</span>
                            </button>
                            <button class="bte-preset" onclick="baelThemeEditor.loadPreset('bael-crimson')" data-theme="bael-crimson">
                                <span class="bte-preset-preview" style="background: linear-gradient(135deg, #CC0033, #FF0040)"></span>
                                <span>Crimson</span>
                            </button>
                            <button class="bte-preset" onclick="baelThemeEditor.loadPreset('bael-abyss')" data-theme="bael-abyss">
                                <span class="bte-preset-preview" style="background: linear-gradient(135deg, #5B21B6, #7C3AED)"></span>
                                <span>Abyss</span>
                            </button>
                            <button class="bte-preset" onclick="baelThemeEditor.loadPreset('bael-inferno')" data-theme="bael-inferno">
                                <span class="bte-preset-preview" style="background: linear-gradient(135deg, #CC5500, #FFD700)"></span>
                                <span>Inferno</span>
                            </button>
                            <button class="bte-preset" onclick="baelThemeEditor.loadPreset('bael-void')" data-theme="bael-void">
                                <span class="bte-preset-preview" style="background: linear-gradient(135deg, #00ACC7, #00FF88)"></span>
                                <span>Void</span>
                            </button>
                            <button class="bte-preset" onclick="baelThemeEditor.loadPreset('bael-light')" data-theme="bael-light">
                                <span class="bte-preset-preview" style="background: linear-gradient(135deg, #f5f5f5, #ffffff)"></span>
                                <span>Light</span>
                            </button>
                        </div>

                        <h3>Import/Export</h3>
                        <div class="bte-io">
                            <button class="bte-btn full" onclick="baelThemeEditor.exportTheme()">📤 Export Theme</button>
                            <button class="bte-btn full" onclick="baelThemeEditor.importTheme()">📥 Import Theme</button>
                        </div>
                    </div>

                    <div class="bte-main">
                        <h3>Colors</h3>
                        <div class="bte-colors" id="bte-colors"></div>

                        <h3>Preview</h3>
                        <div class="bte-preview">
                            <div class="bte-preview-card">
                                <div class="bte-preview-header">Sample Card</div>
                                <div class="bte-preview-text">This is how text looks with your theme.</div>
                                <div class="bte-preview-muted">Secondary text color example.</div>
                                <div class="bte-preview-buttons">
                                    <button class="bte-preview-btn primary">Primary</button>
                                    <button class="bte-preview-btn">Secondary</button>
                                </div>
                            </div>
                            <div class="bte-preview-statuses">
                                <span class="bte-status success">Success</span>
                                <span class="bte-status warning">Warning</span>
                                <span class="bte-status error">Error</span>
                                <span class="bte-status info">Info</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

    const style = document.createElement("style");
    style.textContent = `
            .bael-theme-editor {
                position: fixed;
                inset: 0;
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .bael-theme-editor.hidden {
                display: none;
            }

            .bte-overlay {
                position: absolute;
                inset: 0;
                background: rgba(0, 0, 0, 0.8);
                backdrop-filter: blur(4px);
            }

            .bte-modal {
                position: relative;
                width: 90%;
                max-width: 800px;
                max-height: 80vh;
                background: var(--color-panel);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-xl);
                box-shadow: var(--shadow-lg);
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }

            .bte-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid var(--color-border);
            }

            .bte-header h2 {
                margin: 0;
                color: var(--color-text);
            }

            .bte-header-actions {
                display: flex;
                gap: 8px;
            }

            .bte-btn {
                padding: 8px 16px;
                background: var(--color-surface);
                border: 1px solid var(--color-border);
                color: var(--color-text);
                border-radius: var(--radius-md);
                cursor: pointer;
                font-size: 13px;
                transition: all 0.2s;
            }

            .bte-btn:hover {
                background: var(--color-surface-elevated);
                border-color: var(--color-primary);
            }

            .bte-btn.primary {
                background: var(--gradient-primary);
                border: none;
                color: white;
            }

            .bte-btn.full {
                width: 100%;
            }

            .bte-btn-icon {
                width: 36px;
                height: 36px;
                background: var(--color-surface);
                border: 1px solid var(--color-border);
                color: var(--color-text);
                border-radius: var(--radius-md);
                cursor: pointer;
                font-size: 16px;
                transition: all 0.2s;
            }

            .bte-btn-icon:hover {
                background: var(--color-primary);
                border-color: var(--color-primary);
            }

            .bte-content {
                display: flex;
                flex: 1;
                overflow: hidden;
            }

            .bte-sidebar {
                width: 200px;
                padding: 20px;
                border-right: 1px solid var(--color-border);
                overflow-y: auto;
            }

            .bte-sidebar h3 {
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: var(--color-text-muted);
                margin: 0 0 12px;
            }

            .bte-presets {
                display: flex;
                flex-direction: column;
                gap: 8px;
                margin-bottom: 24px;
            }

            .bte-preset {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 8px 12px;
                background: var(--color-surface);
                border: 1px solid var(--color-border);
                color: var(--color-text);
                border-radius: var(--radius-md);
                cursor: pointer;
                text-align: left;
                transition: all 0.2s;
            }

            .bte-preset:hover {
                border-color: var(--color-primary);
            }

            .bte-preset.active {
                border-color: var(--color-primary);
                background: var(--color-primary);
            }

            .bte-preset-preview {
                width: 24px;
                height: 24px;
                border-radius: var(--radius-sm);
            }

            .bte-io {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .bte-main {
                flex: 1;
                padding: 20px;
                overflow-y: auto;
            }

            .bte-main h3 {
                font-size: 14px;
                color: var(--color-text);
                margin: 0 0 16px;
            }

            .bte-colors {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                gap: 12px;
                margin-bottom: 24px;
            }

            .bte-color-input {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 8px 12px;
                background: var(--color-surface);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-md);
            }

            .bte-color-input input[type="color"] {
                width: 32px;
                height: 32px;
                border: none;
                border-radius: var(--radius-sm);
                cursor: pointer;
                background: none;
                padding: 0;
            }

            .bte-color-input input[type="color"]::-webkit-color-swatch-wrapper {
                padding: 0;
            }

            .bte-color-input input[type="color"]::-webkit-color-swatch {
                border: 1px solid var(--color-border);
                border-radius: var(--radius-sm);
            }

            .bte-color-info {
                flex: 1;
            }

            .bte-color-name {
                font-size: 12px;
                color: var(--color-text);
            }

            .bte-color-value {
                font-size: 10px;
                font-family: var(--font-mono);
                color: var(--color-text-muted);
            }

            /* Preview Section */
            .bte-preview {
                background: var(--color-background);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-lg);
                padding: 20px;
            }

            .bte-preview-card {
                background: var(--color-panel);
                border: 1px solid var(--color-border);
                border-radius: var(--radius-md);
                padding: 16px;
                margin-bottom: 16px;
            }

            .bte-preview-header {
                font-weight: 600;
                color: var(--color-text);
                margin-bottom: 8px;
            }

            .bte-preview-text {
                color: var(--color-text);
                font-size: 14px;
                margin-bottom: 4px;
            }

            .bte-preview-muted {
                color: var(--color-text-secondary);
                font-size: 12px;
                margin-bottom: 12px;
            }

            .bte-preview-buttons {
                display: flex;
                gap: 8px;
            }

            .bte-preview-btn {
                padding: 8px 16px;
                background: var(--color-surface);
                border: 1px solid var(--color-border);
                color: var(--color-text);
                border-radius: var(--radius-md);
                cursor: pointer;
            }

            .bte-preview-btn.primary {
                background: var(--color-primary);
                border-color: var(--color-primary);
                color: white;
            }

            .bte-preview-statuses {
                display: flex;
                gap: 8px;
            }

            .bte-status {
                padding: 4px 12px;
                border-radius: var(--radius-full);
                font-size: 12px;
            }

            .bte-status.success {
                background: var(--color-success-bg);
                color: var(--color-success);
            }

            .bte-status.warning {
                background: var(--color-warning-bg);
                color: var(--color-warning);
            }

            .bte-status.error {
                background: var(--color-error-bg);
                color: var(--color-error);
            }

            .bte-status.info {
                background: var(--color-info-bg);
                color: var(--color-info);
            }
        `;

    document.head.appendChild(style);
    document.body.appendChild(editor);

    this.editor = editor;
    this.renderColorInputs();
  }

  renderColorInputs() {
    const container = document.getElementById("bte-colors");

    container.innerHTML = this.colorVars
      .map((color) => {
        const currentValue =
          this.customTheme[color.var] ||
          getComputedStyle(document.documentElement)
            .getPropertyValue(color.var)
            .trim() ||
          color.default;

        return `
                <div class="bte-color-input">
                    <input type="color"
                           value="${currentValue}"
                           data-var="${color.var}"
                           onchange="baelThemeEditor.updateColor('${color.var}', this.value)">
                    <div class="bte-color-info">
                        <div class="bte-color-name">${color.name}</div>
                        <div class="bte-color-value">${currentValue}</div>
                    </div>
                </div>
            `;
      })
      .join("");
  }

  updateColor(varName, value) {
    document.documentElement.style.setProperty(varName, value);
    this.customTheme[varName] = value;

    // Update RGB version if it's the primary color
    if (varName === "--color-primary") {
      const rgb = this.hexToRgb(value);
      if (rgb) {
        document.documentElement.style.setProperty(
          "--color-primary-rgb",
          `${rgb.r}, ${rgb.g}, ${rgb.b}`,
        );
        this.customTheme["--color-primary-rgb"] =
          `${rgb.r}, ${rgb.g}, ${rgb.b}`;
      }
    }

    // Update value display
    const input = document.querySelector(`input[data-var="${varName}"]`);
    if (input) {
      const valueDisplay = input
        .closest(".bte-color-input")
        .querySelector(".bte-color-value");
      if (valueDisplay) valueDisplay.textContent = value;
    }
  }

  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  loadPreset(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("bael_theme", theme);

    // Clear custom overrides
    this.colorVars.forEach((color) => {
      document.documentElement.style.removeProperty(color.var);
    });

    this.customTheme = {};
    localStorage.removeItem("bael_custom_theme");

    // Update active preset
    document.querySelectorAll(".bte-preset").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.theme === theme);
    });

    // Re-render color inputs with new values
    setTimeout(() => this.renderColorInputs(), 100);
  }

  applyCustomTheme() {
    Object.entries(this.customTheme).forEach(([varName, value]) => {
      document.documentElement.style.setProperty(varName, value);
    });
  }

  save() {
    localStorage.setItem("bael_custom_theme", JSON.stringify(this.customTheme));
    this.showToast("Theme saved!");
    this.close();
  }

  reset() {
    if (confirm("Reset all custom colors to preset defaults?")) {
      this.colorVars.forEach((color) => {
        document.documentElement.style.removeProperty(color.var);
      });

      this.customTheme = {};
      localStorage.removeItem("bael_custom_theme");
      this.renderColorInputs();
    }
  }

  exportTheme() {
    const theme = {
      name: "Custom Bael Theme",
      version: "1.0",
      created: new Date().toISOString(),
      colors: this.customTheme,
    };

    const blob = new Blob([JSON.stringify(theme, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bael-theme-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importTheme() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const text = await file.text();
        const theme = JSON.parse(text);

        if (theme.colors && typeof theme.colors === "object") {
          this.customTheme = theme.colors;
          this.applyCustomTheme();
          this.renderColorInputs();
          localStorage.setItem(
            "bael_custom_theme",
            JSON.stringify(this.customTheme),
          );
          this.showToast("Theme imported!");
        } else {
          throw new Error("Invalid theme format");
        }
      } catch (err) {
        alert("Failed to import theme: " + err.message);
      }
    };
    input.click();
  }

  open() {
    this.isOpen = true;
    this.editor.classList.remove("hidden");
  }

  close() {
    this.isOpen = false;
    this.editor.classList.add("hidden");
  }

  toggle() {
    this.isOpen ? this.close() : this.open();
  }

  showToast(message) {
    if (window.showToast) {
      window.showToast(message);
    } else {
      console.log("🎨", message);
    }
  }
}

// Initialize
let baelThemeEditor;
document.addEventListener("DOMContentLoaded", () => {
  baelThemeEditor = new BaelThemeEditor();
  window.baelThemeEditor = baelThemeEditor;

  // Register with command palette
  if (window.baelPalette) {
    window.baelPalette.register({
      id: "theme.editor",
      title: "Open Theme Editor",
      description: "Customize theme colors",
      icon: "🎨",
      category: "theme",
      action: () => baelThemeEditor.open(),
    });
  }
});
