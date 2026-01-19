/**
 * BAEL - LORD OF ALL
 * Accessibility Features - Screen reader, high contrast, and accessibility tools
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelAccessibility {
    constructor() {
      this.settings = {
        highContrast: false,
        largeText: false,
        reducedMotion: false,
        screenReader: false,
        focusHighlight: false,
        dyslexiaFont: false,
        colorBlindMode: "none", // none, protanopia, deuteranopia, tritanopia
      };
      this.announcer = null;
      this.init();
    }

    init() {
      this.loadSettings();
      this.createAnnouncer();
      this.addStyles();
      this.applySettings();
      this.bindEvents();
      this.createAccessibilityPanel();
      console.log("♿ Bael Accessibility initialized");
    }

    loadSettings() {
      try {
        const saved = JSON.parse(
          localStorage.getItem("bael_accessibility") || "{}",
        );
        this.settings = { ...this.settings, ...saved };
      } catch (e) {}
    }

    saveSettings() {
      localStorage.setItem("bael_accessibility", JSON.stringify(this.settings));
    }

    createAnnouncer() {
      // Screen reader live region
      this.announcer = document.createElement("div");
      this.announcer.setAttribute("aria-live", "polite");
      this.announcer.setAttribute("aria-atomic", "true");
      this.announcer.className = "sr-only bael-announcer";
      document.body.appendChild(this.announcer);
    }

    announce(message, priority = "polite") {
      this.announcer.setAttribute("aria-live", priority);
      this.announcer.textContent = "";
      setTimeout(() => {
        this.announcer.textContent = message;
      }, 50);
    }

    addStyles() {
      const styles = document.createElement("style");
      styles.id = "bael-accessibility-styles";
      styles.textContent = `
                /* Screen Reader Only */
                .sr-only {
                    position: absolute;
                    width: 1px;
                    height: 1px;
                    padding: 0;
                    margin: -1px;
                    overflow: hidden;
                    clip: rect(0, 0, 0, 0);
                    white-space: nowrap;
                    border: 0;
                }

                /* High Contrast Mode */
                [data-high-contrast="true"] {
                    --bael-bg-primary: #000000;
                    --bael-bg-secondary: #1a1a1a;
                    --bael-bg-tertiary: #2a2a2a;
                    --bael-text-primary: #ffffff;
                    --bael-text-secondary: #ffff00;
                    --bael-text-muted: #ffffff;
                    --bael-border: #ffffff;
                    --bael-accent: #00ffff;
                }

                [data-high-contrast="true"] * {
                    border-color: #ffffff !important;
                }

                [data-high-contrast="true"] a,
                [data-high-contrast="true"] button {
                    text-decoration: underline;
                }

                /* Large Text Mode */
                [data-large-text="true"] {
                    font-size: 120%;
                }

                [data-large-text="true"] input,
                [data-large-text="true"] textarea,
                [data-large-text="true"] button {
                    font-size: 1.1em;
                    padding: 0.7em;
                }

                /* Reduced Motion */
                [data-reduced-motion="true"],
                [data-reduced-motion="true"] * {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }

                /* Focus Highlight */
                [data-focus-highlight="true"] *:focus {
                    outline: 3px solid #ff3366 !important;
                    outline-offset: 2px !important;
                }

                /* Dyslexia-Friendly Font */
                [data-dyslexia-font="true"] {
                    font-family: 'OpenDyslexic', 'Comic Sans MS', sans-serif !important;
                    letter-spacing: 0.05em;
                    word-spacing: 0.1em;
                    line-height: 1.8;
                }

                /* Color Blind Modes */
                [data-colorblind="protanopia"] {
                    filter: url('#protanopia-filter');
                }

                [data-colorblind="deuteranopia"] {
                    filter: url('#deuteranopia-filter');
                }

                [data-colorblind="tritanopia"] {
                    filter: url('#tritanopia-filter');
                }

                /* Accessibility Panel */
                .bael-a11y-trigger {
                    position: fixed;
                    bottom: 390px;
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
                    z-index: 9983;
                    transition: all 0.3s ease;
                    font-size: 22px;
                }

                .bael-a11y-trigger:hover {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                    transform: scale(1.1);
                }

                .bael-a11y-panel {
                    position: fixed;
                    bottom: 450px;
                    right: 20px;
                    width: 320px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 16px;
                    z-index: 100025;
                    display: none;
                    flex-direction: column;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
                    overflow: hidden;
                }

                .bael-a11y-panel.visible {
                    display: flex;
                    animation: a11ySlide 0.2s ease;
                }

                @keyframes a11ySlide {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .a11y-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px 16px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .a11y-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .a11y-close {
                    width: 28px;
                    height: 28px;
                    border: none;
                    background: transparent;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .a11y-close:hover {
                    background: rgba(255, 51, 102, 0.2);
                    color: var(--bael-accent, #ff3366);
                }

                .a11y-content {
                    padding: 16px;
                    max-height: 400px;
                    overflow-y: auto;
                }

                .a11y-option {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 10px;
                    margin-bottom: 10px;
                }

                .a11y-option-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .a11y-option-icon {
                    font-size: 20px;
                }

                .a11y-option-text {
                    font-size: 13px;
                    color: var(--bael-text-primary, #fff);
                }

                .a11y-option-desc {
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                    margin-top: 2px;
                }

                .a11y-toggle {
                    position: relative;
                    width: 44px;
                    height: 24px;
                    background: var(--bael-bg-tertiary, #181820);
                    border-radius: 12px;
                    cursor: pointer;
                    transition: background 0.2s ease;
                }

                .a11y-toggle.active {
                    background: var(--bael-accent, #ff3366);
                }

                .a11y-toggle::after {
                    content: '';
                    position: absolute;
                    top: 2px;
                    left: 2px;
                    width: 20px;
                    height: 20px;
                    background: #fff;
                    border-radius: 50%;
                    transition: transform 0.2s ease;
                }

                .a11y-toggle.active::after {
                    transform: translateX(20px);
                }

                .a11y-select {
                    padding: 8px 12px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 12px;
                    cursor: pointer;
                }

                .a11y-footer {
                    padding: 12px 16px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                }

                .a11y-reset {
                    width: 100%;
                    padding: 10px;
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--bael-text-muted, #666);
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .a11y-reset:hover {
                    border-color: var(--bael-accent, #ff3366);
                    color: var(--bael-accent, #ff3366);
                }
            `;
      document.head.appendChild(styles);

      // Add color blindness SVG filters
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("style", "position: absolute; width: 0; height: 0;");
      svg.innerHTML = `
                <defs>
                    <filter id="protanopia-filter">
                        <feColorMatrix type="matrix" values="
                            0.567, 0.433, 0, 0, 0
                            0.558, 0.442, 0, 0, 0
                            0, 0.242, 0.758, 0, 0
                            0, 0, 0, 1, 0"/>
                    </filter>
                    <filter id="deuteranopia-filter">
                        <feColorMatrix type="matrix" values="
                            0.625, 0.375, 0, 0, 0
                            0.7, 0.3, 0, 0, 0
                            0, 0.3, 0.7, 0, 0
                            0, 0, 0, 1, 0"/>
                    </filter>
                    <filter id="tritanopia-filter">
                        <feColorMatrix type="matrix" values="
                            0.95, 0.05, 0, 0, 0
                            0, 0.433, 0.567, 0, 0
                            0, 0.475, 0.525, 0, 0
                            0, 0, 0, 1, 0"/>
                    </filter>
                </defs>
            `;
      document.body.appendChild(svg);
    }

    createAccessibilityPanel() {
      // Create trigger button
      const trigger = document.createElement("button");
      trigger.className = "bael-a11y-trigger";
      trigger.setAttribute("aria-label", "Accessibility settings");
      trigger.title = "Accessibility (Alt+A)";
      trigger.innerHTML = "♿";
      document.body.appendChild(trigger);

      // Create panel
      const panel = document.createElement("div");
      panel.className = "bael-a11y-panel";
      panel.setAttribute("role", "dialog");
      panel.setAttribute("aria-label", "Accessibility settings");
      panel.innerHTML = `
                <div class="a11y-header">
                    <div class="a11y-title">
                        <span>♿</span>
                        <span>Accessibility</span>
                    </div>
                    <button class="a11y-close" aria-label="Close">×</button>
                </div>

                <div class="a11y-content">
                    <div class="a11y-option" data-setting="highContrast">
                        <div class="a11y-option-info">
                            <span class="a11y-option-icon">🎨</span>
                            <div>
                                <div class="a11y-option-text">High Contrast</div>
                                <div class="a11y-option-desc">Increase contrast for better visibility</div>
                            </div>
                        </div>
                        <div class="a11y-toggle ${this.settings.highContrast ? "active" : ""}"></div>
                    </div>

                    <div class="a11y-option" data-setting="largeText">
                        <div class="a11y-option-info">
                            <span class="a11y-option-icon">🔤</span>
                            <div>
                                <div class="a11y-option-text">Large Text</div>
                                <div class="a11y-option-desc">Increase text size by 20%</div>
                            </div>
                        </div>
                        <div class="a11y-toggle ${this.settings.largeText ? "active" : ""}"></div>
                    </div>

                    <div class="a11y-option" data-setting="reducedMotion">
                        <div class="a11y-option-info">
                            <span class="a11y-option-icon">🎬</span>
                            <div>
                                <div class="a11y-option-text">Reduced Motion</div>
                                <div class="a11y-option-desc">Minimize animations</div>
                            </div>
                        </div>
                        <div class="a11y-toggle ${this.settings.reducedMotion ? "active" : ""}"></div>
                    </div>

                    <div class="a11y-option" data-setting="focusHighlight">
                        <div class="a11y-option-info">
                            <span class="a11y-option-icon">🎯</span>
                            <div>
                                <div class="a11y-option-text">Focus Highlight</div>
                                <div class="a11y-option-desc">Enhanced focus indicators</div>
                            </div>
                        </div>
                        <div class="a11y-toggle ${this.settings.focusHighlight ? "active" : ""}"></div>
                    </div>

                    <div class="a11y-option" data-setting="dyslexiaFont">
                        <div class="a11y-option-info">
                            <span class="a11y-option-icon">📖</span>
                            <div>
                                <div class="a11y-option-text">Dyslexia Font</div>
                                <div class="a11y-option-desc">Use dyslexia-friendly typeface</div>
                            </div>
                        </div>
                        <div class="a11y-toggle ${this.settings.dyslexiaFont ? "active" : ""}"></div>
                    </div>

                    <div class="a11y-option" data-setting="screenReader">
                        <div class="a11y-option-info">
                            <span class="a11y-option-icon">🔊</span>
                            <div>
                                <div class="a11y-option-text">Screen Reader Mode</div>
                                <div class="a11y-option-desc">Optimize for screen readers</div>
                            </div>
                        </div>
                        <div class="a11y-toggle ${this.settings.screenReader ? "active" : ""}"></div>
                    </div>

                    <div class="a11y-option">
                        <div class="a11y-option-info">
                            <span class="a11y-option-icon">👁️</span>
                            <div>
                                <div class="a11y-option-text">Color Blind Mode</div>
                                <div class="a11y-option-desc">Adjust colors for color blindness</div>
                            </div>
                        </div>
                        <select class="a11y-select" id="colorblind-select">
                            <option value="none" ${this.settings.colorBlindMode === "none" ? "selected" : ""}>None</option>
                            <option value="protanopia" ${this.settings.colorBlindMode === "protanopia" ? "selected" : ""}>Protanopia</option>
                            <option value="deuteranopia" ${this.settings.colorBlindMode === "deuteranopia" ? "selected" : ""}>Deuteranopia</option>
                            <option value="tritanopia" ${this.settings.colorBlindMode === "tritanopia" ? "selected" : ""}>Tritanopia</option>
                        </select>
                    </div>
                </div>

                <div class="a11y-footer">
                    <button class="a11y-reset">Reset to Defaults</button>
                </div>
            `;
      document.body.appendChild(panel);

      this.panel = panel;
      this.trigger = trigger;

      // Bind panel events
      trigger.addEventListener("click", () => this.togglePanel());
      panel
        .querySelector(".a11y-close")
        .addEventListener("click", () => this.closePanel());

      panel.querySelectorAll(".a11y-toggle").forEach((toggle) => {
        toggle.addEventListener("click", () => {
          const setting = toggle.closest(".a11y-option").dataset.setting;
          if (setting) {
            this.settings[setting] = !this.settings[setting];
            toggle.classList.toggle("active", this.settings[setting]);
            this.saveSettings();
            this.applySettings();
            this.announce(
              `${setting.replace(/([A-Z])/g, " $1")} ${this.settings[setting] ? "enabled" : "disabled"}`,
            );
          }
        });
      });

      panel
        .querySelector("#colorblind-select")
        .addEventListener("change", (e) => {
          this.settings.colorBlindMode = e.target.value;
          this.saveSettings();
          this.applySettings();
          this.announce(`Color blind mode set to ${e.target.value}`);
        });

      panel.querySelector(".a11y-reset").addEventListener("click", () => {
        this.resetSettings();
      });
    }

    applySettings() {
      const html = document.documentElement;

      html.setAttribute("data-high-contrast", this.settings.highContrast);
      html.setAttribute("data-large-text", this.settings.largeText);
      html.setAttribute("data-reduced-motion", this.settings.reducedMotion);
      html.setAttribute("data-focus-highlight", this.settings.focusHighlight);
      html.setAttribute("data-dyslexia-font", this.settings.dyslexiaFont);
      html.setAttribute("data-colorblind", this.settings.colorBlindMode);

      if (this.settings.screenReader) {
        this.enhanceForScreenReaders();
      }
    }

    enhanceForScreenReaders() {
      // Add ARIA labels to common elements
      document.querySelectorAll("button:not([aria-label])").forEach((btn) => {
        const text = btn.textContent.trim() || btn.title;
        if (text) btn.setAttribute("aria-label", text);
      });

      // Mark decorative images
      document.querySelectorAll("img:not([alt])").forEach((img) => {
        img.setAttribute("alt", "");
        img.setAttribute("role", "presentation");
      });
    }

    resetSettings() {
      this.settings = {
        highContrast: false,
        largeText: false,
        reducedMotion: false,
        screenReader: false,
        focusHighlight: false,
        dyslexiaFont: false,
        colorBlindMode: "none",
      };
      this.saveSettings();
      this.applySettings();

      // Update UI
      this.panel.querySelectorAll(".a11y-toggle").forEach((toggle) => {
        toggle.classList.remove("active");
      });
      this.panel.querySelector("#colorblind-select").value = "none";

      this.announce("Accessibility settings reset to defaults");

      if (window.BaelNotifications) {
        window.BaelNotifications.info("Accessibility settings reset");
      }
    }

    bindEvents() {
      // Keyboard shortcut
      document.addEventListener("keydown", (e) => {
        if (e.altKey && e.key === "a") {
          e.preventDefault();
          this.togglePanel();
        }
        if (e.key === "Escape" && this.panel?.classList.contains("visible")) {
          this.closePanel();
        }
      });

      // Detect system preferences
      if (window.matchMedia) {
        window
          .matchMedia("(prefers-reduced-motion: reduce)")
          .addEventListener("change", (e) => {
            if (e.matches && !this.settings.reducedMotion) {
              this.settings.reducedMotion = true;
              this.saveSettings();
              this.applySettings();
            }
          });

        window
          .matchMedia("(prefers-contrast: more)")
          .addEventListener("change", (e) => {
            if (e.matches && !this.settings.highContrast) {
              this.settings.highContrast = true;
              this.saveSettings();
              this.applySettings();
            }
          });
      }
    }

    togglePanel() {
      this.panel.classList.toggle("visible");
    }

    closePanel() {
      this.panel.classList.remove("visible");
    }
  }

  // Initialize
  window.BaelAccessibility = new BaelAccessibility();
})();
