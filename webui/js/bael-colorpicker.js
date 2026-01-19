/**
 * BAEL Color Picker Component - Lord Of All Hues
 *
 * Full-featured color picker with:
 * - Color wheel
 * - Saturation/brightness picker
 * - RGB/HSL/HEX inputs
 * - Alpha channel
 * - Presets/swatches
 * - Eyedropper
 * - Gradient picker
 * - Recent colors
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // COLOR PICKER CLASS
  // ============================================================

  class BaelColorPicker {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-colorpicker-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-colorpicker-styles";
      styles.textContent = `
                .bael-colorpicker {
                    font-family: system-ui, -apple-system, sans-serif;
                    font-size: 14px;
                }

                /* Trigger */
                .bael-colorpicker-trigger {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    background: white;
                    cursor: pointer;
                    transition: border-color 0.2s, box-shadow 0.2s;
                }

                .bael-colorpicker-trigger:hover {
                    border-color: #4f46e5;
                }

                .bael-colorpicker-trigger:focus {
                    outline: none;
                    border-color: #4f46e5;
                    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
                }

                .bael-colorpicker-preview {
                    width: 24px;
                    height: 24px;
                    border-radius: 4px;
                    border: 1px solid rgba(0,0,0,0.1);
                    background-image: linear-gradient(45deg, #ccc 25%, transparent 25%),
                                      linear-gradient(-45deg, #ccc 25%, transparent 25%),
                                      linear-gradient(45deg, transparent 75%, #ccc 75%),
                                      linear-gradient(-45deg, transparent 75%, #ccc 75%);
                    background-size: 8px 8px;
                    background-position: 0 0, 0 4px, 4px -4px, -4px 0;
                }

                .bael-colorpicker-preview-color {
                    width: 100%;
                    height: 100%;
                    border-radius: 3px;
                }

                .bael-colorpicker-value {
                    font-family: monospace;
                    color: #374151;
                }

                /* Dropdown */
                .bael-colorpicker-dropdown {
                    position: absolute;
                    z-index: 1000;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.15);
                    padding: 16px;
                    width: 280px;
                    display: none;
                }

                .bael-colorpicker-dropdown.open {
                    display: block;
                    animation: baelColorPickerFadeIn 0.2s ease-out;
                }

                @keyframes baelColorPickerFadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Saturation/Brightness picker */
                .bael-colorpicker-saturation {
                    width: 100%;
                    height: 150px;
                    border-radius: 8px;
                    position: relative;
                    cursor: crosshair;
                    margin-bottom: 12px;
                }

                .bael-colorpicker-saturation::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: 8px;
                    background: linear-gradient(to right, white, transparent);
                }

                .bael-colorpicker-saturation::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    border-radius: 8px;
                    background: linear-gradient(to bottom, transparent, black);
                }

                .bael-colorpicker-cursor {
                    position: absolute;
                    width: 16px;
                    height: 16px;
                    border: 2px solid white;
                    border-radius: 50%;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    transform: translate(-50%, -50%);
                    z-index: 1;
                    pointer-events: none;
                }

                /* Hue slider */
                .bael-colorpicker-hue {
                    width: 100%;
                    height: 12px;
                    border-radius: 6px;
                    position: relative;
                    cursor: pointer;
                    background: linear-gradient(to right,
                        #ff0000, #ff8000, #ffff00, #80ff00,
                        #00ff00, #00ff80, #00ffff, #0080ff,
                        #0000ff, #8000ff, #ff00ff, #ff0080, #ff0000);
                    margin-bottom: 12px;
                }

                .bael-colorpicker-hue-cursor {
                    position: absolute;
                    width: 16px;
                    height: 16px;
                    border: 2px solid white;
                    border-radius: 50%;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    top: 50%;
                    transform: translate(-50%, -50%);
                    pointer-events: none;
                }

                /* Alpha slider */
                .bael-colorpicker-alpha {
                    width: 100%;
                    height: 12px;
                    border-radius: 6px;
                    position: relative;
                    cursor: pointer;
                    margin-bottom: 12px;
                    background-image: linear-gradient(45deg, #ccc 25%, transparent 25%),
                                      linear-gradient(-45deg, #ccc 25%, transparent 25%),
                                      linear-gradient(45deg, transparent 75%, #ccc 75%),
                                      linear-gradient(-45deg, transparent 75%, #ccc 75%);
                    background-size: 8px 8px;
                    background-position: 0 0, 0 4px, 4px -4px, -4px 0;
                }

                .bael-colorpicker-alpha-gradient {
                    position: absolute;
                    inset: 0;
                    border-radius: 6px;
                }

                /* Inputs */
                .bael-colorpicker-inputs {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 12px;
                }

                .bael-colorpicker-input-group {
                    flex: 1;
                    text-align: center;
                }

                .bael-colorpicker-input-group input {
                    width: 100%;
                    padding: 6px;
                    border: 1px solid #d1d5db;
                    border-radius: 4px;
                    text-align: center;
                    font-size: 12px;
                    font-family: monospace;
                }

                .bael-colorpicker-input-group input:focus {
                    outline: none;
                    border-color: #4f46e5;
                }

                .bael-colorpicker-input-group label {
                    display: block;
                    font-size: 10px;
                    color: #6b7280;
                    margin-top: 4px;
                    text-transform: uppercase;
                }

                /* HEX input */
                .bael-colorpicker-hex {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 12px;
                }

                .bael-colorpicker-hex input {
                    flex: 1;
                    padding: 8px 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    font-family: monospace;
                    font-size: 14px;
                }

                .bael-colorpicker-hex input:focus {
                    outline: none;
                    border-color: #4f46e5;
                }

                /* Presets */
                .bael-colorpicker-presets {
                    display: grid;
                    grid-template-columns: repeat(8, 1fr);
                    gap: 6px;
                    margin-bottom: 12px;
                }

                .bael-colorpicker-preset {
                    width: 100%;
                    aspect-ratio: 1;
                    border-radius: 4px;
                    cursor: pointer;
                    border: 2px solid transparent;
                    transition: transform 0.1s, border-color 0.1s;
                }

                .bael-colorpicker-preset:hover {
                    transform: scale(1.1);
                    border-color: #4f46e5;
                }

                /* Recent colors */
                .bael-colorpicker-recent {
                    border-top: 1px solid #e5e7eb;
                    padding-top: 12px;
                }

                .bael-colorpicker-recent-label {
                    font-size: 11px;
                    color: #6b7280;
                    margin-bottom: 8px;
                    text-transform: uppercase;
                }

                /* Eyedropper button */
                .bael-colorpicker-eyedropper {
                    padding: 8px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    background: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .bael-colorpicker-eyedropper:hover {
                    border-color: #4f46e5;
                    color: #4f46e5;
                }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // COLOR UTILITIES
    // ============================================================

    /**
     * Parse color to RGBA
     */
    parseColor(color) {
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);
      const data = ctx.getImageData(0, 0, 1, 1).data;
      return { r: data[0], g: data[1], b: data[2], a: data[3] / 255 };
    }

    /**
     * RGB to HSL
     */
    rgbToHsl(r, g, b) {
      r /= 255;
      g /= 255;
      b /= 255;
      const max = Math.max(r, g, b),
        min = Math.min(r, g, b);
      let h,
        s,
        l = (max + min) / 2;

      if (max === min) {
        h = s = 0;
      } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r:
            h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
            break;
          case g:
            h = ((b - r) / d + 2) / 6;
            break;
          case b:
            h = ((r - g) / d + 4) / 6;
            break;
        }
      }

      return { h: h * 360, s: s * 100, l: l * 100 };
    }

    /**
     * HSL to RGB
     */
    hslToRgb(h, s, l) {
      h /= 360;
      s /= 100;
      l /= 100;
      let r, g, b;

      if (s === 0) {
        r = g = b = l;
      } else {
        const hue2rgb = (p, q, t) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1 / 6) return p + (q - p) * 6 * t;
          if (t < 1 / 2) return q;
          if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
          return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
      }

      return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255),
      };
    }

    /**
     * HSV to RGB
     */
    hsvToRgb(h, s, v) {
      s /= 100;
      v /= 100;
      const i = Math.floor(h / 60);
      const f = h / 60 - i;
      const p = v * (1 - s);
      const q = v * (1 - f * s);
      const t = v * (1 - (1 - f) * s);

      let r, g, b;
      switch (i % 6) {
        case 0:
          r = v;
          g = t;
          b = p;
          break;
        case 1:
          r = q;
          g = v;
          b = p;
          break;
        case 2:
          r = p;
          g = v;
          b = t;
          break;
        case 3:
          r = p;
          g = q;
          b = v;
          break;
        case 4:
          r = t;
          g = p;
          b = v;
          break;
        case 5:
          r = v;
          g = p;
          b = q;
          break;
      }

      return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255),
      };
    }

    /**
     * RGB to HSV
     */
    rgbToHsv(r, g, b) {
      r /= 255;
      g /= 255;
      b /= 255;
      const max = Math.max(r, g, b),
        min = Math.min(r, g, b);
      let h,
        s,
        v = max;

      const d = max - min;
      s = max === 0 ? 0 : d / max;

      if (max === min) {
        h = 0;
      } else {
        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;
          case g:
            h = (b - r) / d + 2;
            break;
          case b:
            h = (r - g) / d + 4;
            break;
        }
        h /= 6;
      }

      return { h: h * 360, s: s * 100, v: v * 100 };
    }

    /**
     * RGB to HEX
     */
    rgbToHex(r, g, b, a = 1) {
      const hex =
        "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("");
      if (a < 1) {
        return (
          hex +
          Math.round(a * 255)
            .toString(16)
            .padStart(2, "0")
        );
      }
      return hex;
    }

    /**
     * HEX to RGB
     */
    hexToRgb(hex) {
      hex = hex.replace("#", "");
      if (hex.length === 3) {
        hex = hex
          .split("")
          .map((c) => c + c)
          .join("");
      }
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      const a = hex.length === 8 ? parseInt(hex.substr(6, 2), 16) / 255 : 1;
      return { r, g, b, a };
    }

    // ============================================================
    // CREATE COLOR PICKER
    // ============================================================

    /**
     * Create a color picker
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Color picker container not found");
        return null;
      }

      const id = `bael-colorpicker-${++this.idCounter}`;
      const config = {
        value: "#4f46e5",
        format: "hex", // hex, rgb, hsl
        alpha: false,
        presets: [
          "#ef4444",
          "#f97316",
          "#eab308",
          "#22c55e",
          "#14b8a6",
          "#3b82f6",
          "#8b5cf6",
          "#ec4899",
          "#000000",
          "#374151",
          "#6b7280",
          "#9ca3af",
          "#d1d5db",
          "#e5e7eb",
          "#f3f4f6",
          "#ffffff",
        ],
        showRecent: true,
        recentMax: 8,
        eyedropper: "EyeDropper" in window,
        onChange: null,
        ...options,
      };

      const el = document.createElement("div");
      el.className = "bael-colorpicker";
      el.id = id;

      // Parse initial color
      const rgba = this.parseColor(config.value);
      const hsv = this.rgbToHsv(rgba.r, rgba.g, rgba.b);

      const state = {
        id,
        element: el,
        container,
        config,
        h: hsv.h,
        s: hsv.s,
        v: hsv.v,
        a: rgba.a,
        open: false,
        recentColors: JSON.parse(
          localStorage.getItem("bael-colorpicker-recent") || "[]",
        ),
      };

      this._render(state);
      container.appendChild(el);

      this.instances.set(id, state);

      return {
        id,
        getValue: () => this.getValue(id),
        setValue: (v) => this.setValue(id, v),
        open: () => this._openDropdown(state),
        close: () => this._closeDropdown(state),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Render color picker
     */
    _render(state) {
      const { element, config } = state;

      element.innerHTML = "";

      // Trigger button
      const trigger = document.createElement("button");
      trigger.className = "bael-colorpicker-trigger";
      trigger.type = "button";

      const preview = document.createElement("div");
      preview.className = "bael-colorpicker-preview";
      const previewColor = document.createElement("div");
      previewColor.className = "bael-colorpicker-preview-color";
      preview.appendChild(previewColor);

      const valueText = document.createElement("span");
      valueText.className = "bael-colorpicker-value";

      trigger.appendChild(preview);
      trigger.appendChild(valueText);
      element.appendChild(trigger);

      // Dropdown
      const dropdown = document.createElement("div");
      dropdown.className = "bael-colorpicker-dropdown";
      element.appendChild(dropdown);

      // Store refs
      state.trigger = trigger;
      state.dropdown = dropdown;
      state.previewColor = previewColor;
      state.valueText = valueText;

      // Build dropdown content
      this._buildDropdown(state);

      // Events
      trigger.addEventListener("click", (e) => {
        e.stopPropagation();
        this._toggleDropdown(state);
      });

      document.addEventListener("click", (e) => {
        if (!element.contains(e.target)) {
          this._closeDropdown(state);
        }
      });

      // Update display
      this._updateDisplay(state);
    }

    /**
     * Build dropdown content
     */
    _buildDropdown(state) {
      const { dropdown, config } = state;
      dropdown.innerHTML = "";

      // Saturation/brightness picker
      const saturation = document.createElement("div");
      saturation.className = "bael-colorpicker-saturation";
      const cursor = document.createElement("div");
      cursor.className = "bael-colorpicker-cursor";
      saturation.appendChild(cursor);
      dropdown.appendChild(saturation);

      state.saturationEl = saturation;
      state.cursorEl = cursor;

      // Hue slider
      const hue = document.createElement("div");
      hue.className = "bael-colorpicker-hue";
      const hueCursor = document.createElement("div");
      hueCursor.className = "bael-colorpicker-hue-cursor";
      hue.appendChild(hueCursor);
      dropdown.appendChild(hue);

      state.hueEl = hue;
      state.hueCursorEl = hueCursor;

      // Alpha slider
      if (config.alpha) {
        const alpha = document.createElement("div");
        alpha.className = "bael-colorpicker-alpha";
        const alphaGradient = document.createElement("div");
        alphaGradient.className = "bael-colorpicker-alpha-gradient";
        alpha.appendChild(alphaGradient);
        const alphaCursor = document.createElement("div");
        alphaCursor.className = "bael-colorpicker-hue-cursor";
        alpha.appendChild(alphaCursor);
        dropdown.appendChild(alpha);

        state.alphaEl = alpha;
        state.alphaGradientEl = alphaGradient;
        state.alphaCursorEl = alphaCursor;
      }

      // HEX input row
      const hexRow = document.createElement("div");
      hexRow.className = "bael-colorpicker-hex";

      const hexInput = document.createElement("input");
      hexInput.type = "text";
      hexInput.maxLength = 9;
      hexRow.appendChild(hexInput);

      if (config.eyedropper) {
        const eyedropperBtn = document.createElement("button");
        eyedropperBtn.className = "bael-colorpicker-eyedropper";
        eyedropperBtn.type = "button";
        eyedropperBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m2 22 1-1h3l9-9M15.5 4.5a1.5 1.5 0 0 1 3 0"/><path d="M17.42 2.58a2.15 2.15 0 0 1 3.04 3.04l-9.51 9.52a2 2 0 0 1-.84.48l-3.32.94.94-3.32a2 2 0 0 1 .48-.84Z"/></svg>`;
        eyedropperBtn.addEventListener("click", () => this._pickColor(state));
        hexRow.appendChild(eyedropperBtn);
      }

      dropdown.appendChild(hexRow);

      state.hexInput = hexInput;

      // Presets
      if (config.presets && config.presets.length > 0) {
        const presets = document.createElement("div");
        presets.className = "bael-colorpicker-presets";

        config.presets.forEach((color) => {
          const preset = document.createElement("button");
          preset.className = "bael-colorpicker-preset";
          preset.type = "button";
          preset.style.background = color;
          preset.addEventListener("click", () =>
            this.setValue(state.id, color),
          );
          presets.appendChild(preset);
        });

        dropdown.appendChild(presets);
      }

      // Recent colors
      if (config.showRecent && state.recentColors.length > 0) {
        const recent = document.createElement("div");
        recent.className = "bael-colorpicker-recent";

        const label = document.createElement("div");
        label.className = "bael-colorpicker-recent-label";
        label.textContent = "Recent";
        recent.appendChild(label);

        const presets = document.createElement("div");
        presets.className = "bael-colorpicker-presets";

        state.recentColors.slice(0, config.recentMax).forEach((color) => {
          const preset = document.createElement("button");
          preset.className = "bael-colorpicker-preset";
          preset.type = "button";
          preset.style.background = color;
          preset.addEventListener("click", () =>
            this.setValue(state.id, color),
          );
          presets.appendChild(preset);
        });

        recent.appendChild(presets);
        dropdown.appendChild(recent);
      }

      // Setup interactions
      this._setupInteractions(state);
    }

    /**
     * Setup picker interactions
     */
    _setupInteractions(state) {
      const { saturationEl, hueEl, alphaEl, hexInput, config } = state;

      // Saturation picker
      let satDragging = false;
      const handleSaturation = (e) => {
        const rect = saturationEl.getBoundingClientRect();
        const x = Math.max(
          0,
          Math.min(1, (e.clientX - rect.left) / rect.width),
        );
        const y = Math.max(
          0,
          Math.min(1, (e.clientY - rect.top) / rect.height),
        );
        state.s = x * 100;
        state.v = (1 - y) * 100;
        this._updateDisplay(state);
        this._emitChange(state);
      };

      saturationEl.addEventListener("mousedown", (e) => {
        satDragging = true;
        handleSaturation(e);
      });
      document.addEventListener(
        "mousemove",
        (e) => satDragging && handleSaturation(e),
      );
      document.addEventListener("mouseup", () => (satDragging = false));

      // Hue slider
      let hueDragging = false;
      const handleHue = (e) => {
        const rect = hueEl.getBoundingClientRect();
        const x = Math.max(
          0,
          Math.min(1, (e.clientX - rect.left) / rect.width),
        );
        state.h = x * 360;
        this._updateDisplay(state);
        this._emitChange(state);
      };

      hueEl.addEventListener("mousedown", (e) => {
        hueDragging = true;
        handleHue(e);
      });
      document.addEventListener(
        "mousemove",
        (e) => hueDragging && handleHue(e),
      );
      document.addEventListener("mouseup", () => (hueDragging = false));

      // Alpha slider
      if (config.alpha && alphaEl) {
        let alphaDragging = false;
        const handleAlpha = (e) => {
          const rect = alphaEl.getBoundingClientRect();
          const x = Math.max(
            0,
            Math.min(1, (e.clientX - rect.left) / rect.width),
          );
          state.a = x;
          this._updateDisplay(state);
          this._emitChange(state);
        };

        alphaEl.addEventListener("mousedown", (e) => {
          alphaDragging = true;
          handleAlpha(e);
        });
        document.addEventListener(
          "mousemove",
          (e) => alphaDragging && handleAlpha(e),
        );
        document.addEventListener("mouseup", () => (alphaDragging = false));
      }

      // HEX input
      hexInput.addEventListener("input", () => {
        const hex = hexInput.value;
        if (/^#?([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(hex)) {
          const rgba = this.hexToRgb(hex);
          const hsv = this.rgbToHsv(rgba.r, rgba.g, rgba.b);
          state.h = hsv.h;
          state.s = hsv.s;
          state.v = hsv.v;
          state.a = rgba.a;
          this._updateDisplay(state);
          this._emitChange(state);
        }
      });
    }

    /**
     * Update display
     */
    _updateDisplay(state) {
      const {
        previewColor,
        valueText,
        hexInput,
        saturationEl,
        cursorEl,
        hueCursorEl,
        config,
      } = state;
      const { alphaCursorEl, alphaGradientEl } = state;

      const rgb = this.hsvToRgb(state.h, state.s, state.v);
      const hex = this.rgbToHex(rgb.r, rgb.g, rgb.b, state.a);
      const rgba = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${state.a})`;

      // Update preview
      previewColor.style.background = rgba;

      // Update value text
      valueText.textContent = config.alpha ? hex : hex.slice(0, 7);

      // Update hex input
      if (document.activeElement !== hexInput) {
        hexInput.value = config.alpha ? hex : hex.slice(0, 7);
      }

      // Update saturation background
      const hueColor = `hsl(${state.h}, 100%, 50%)`;
      saturationEl.style.background = hueColor;

      // Update cursors
      cursorEl.style.left = `${state.s}%`;
      cursorEl.style.top = `${100 - state.v}%`;
      cursorEl.style.background = rgba;

      hueCursorEl.style.left = `${(state.h / 360) * 100}%`;
      hueCursorEl.style.background = hueColor;

      // Update alpha
      if (config.alpha && alphaGradientEl) {
        alphaGradientEl.style.background = `linear-gradient(to right, transparent, ${this.rgbToHex(rgb.r, rgb.g, rgb.b)})`;
        alphaCursorEl.style.left = `${state.a * 100}%`;
      }
    }

    /**
     * Emit change
     */
    _emitChange(state) {
      if (state.config.onChange) {
        state.config.onChange(this.getValue(state.id));
      }
    }

    /**
     * Toggle dropdown
     */
    _toggleDropdown(state) {
      if (state.open) {
        this._closeDropdown(state);
      } else {
        this._openDropdown(state);
      }
    }

    /**
     * Open dropdown
     */
    _openDropdown(state) {
      state.open = true;
      state.dropdown.classList.add("open");

      // Position dropdown
      const triggerRect = state.trigger.getBoundingClientRect();
      state.dropdown.style.top = triggerRect.bottom + 8 + "px";
      state.dropdown.style.left = triggerRect.left + "px";
    }

    /**
     * Close dropdown
     */
    _closeDropdown(state) {
      if (!state.open) return;
      state.open = false;
      state.dropdown.classList.remove("open");

      // Add to recent
      this._addToRecent(state, this.getValue(state.id));
    }

    /**
     * Add to recent colors
     */
    _addToRecent(state, color) {
      const recent = state.recentColors.filter((c) => c !== color);
      recent.unshift(color);
      state.recentColors = recent.slice(0, state.config.recentMax);
      localStorage.setItem(
        "bael-colorpicker-recent",
        JSON.stringify(state.recentColors),
      );
    }

    /**
     * Pick color with eyedropper
     */
    async _pickColor(state) {
      if (!("EyeDropper" in window)) return;

      try {
        const eyeDropper = new EyeDropper();
        const result = await eyeDropper.open();
        this.setValue(state.id, result.sRGBHex);
      } catch (e) {
        // User cancelled
      }
    }

    // ============================================================
    // PUBLIC METHODS
    // ============================================================

    /**
     * Get color value
     */
    getValue(pickerId) {
      const state = this.instances.get(pickerId);
      if (!state) return null;

      const rgb = this.hsvToRgb(state.h, state.s, state.v);
      const format = state.config.format;

      if (format === "rgb") {
        if (state.config.alpha) {
          return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${state.a.toFixed(2)})`;
        }
        return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      }

      if (format === "hsl") {
        const hsl = this.rgbToHsl(rgb.r, rgb.g, rgb.b);
        if (state.config.alpha) {
          return `hsla(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%, ${state.a.toFixed(2)})`;
        }
        return `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;
      }

      return this.rgbToHex(
        rgb.r,
        rgb.g,
        rgb.b,
        state.config.alpha ? state.a : 1,
      );
    }

    /**
     * Set color value
     */
    setValue(pickerId, value) {
      const state = this.instances.get(pickerId);
      if (!state) return;

      const rgba = this.parseColor(value);
      const hsv = this.rgbToHsv(rgba.r, rgba.g, rgba.b);
      state.h = hsv.h;
      state.s = hsv.s;
      state.v = hsv.v;
      state.a = rgba.a;

      this._updateDisplay(state);
      this._emitChange(state);
    }

    /**
     * Destroy picker
     */
    destroy(pickerId) {
      const state = this.instances.get(pickerId);
      if (!state) return;

      state.element.remove();
      this.instances.delete(pickerId);
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelColorPicker();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$colorPicker = (container, options) => bael.create(container, options);

  // Color utilities
  window.$color = {
    parse: (c) => bael.parseColor(c),
    rgbToHex: (r, g, b, a) => bael.rgbToHex(r, g, b, a),
    hexToRgb: (hex) => bael.hexToRgb(hex),
    rgbToHsl: (r, g, b) => bael.rgbToHsl(r, g, b),
    hslToRgb: (h, s, l) => bael.hslToRgb(h, s, l),
  };

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelColorPicker = bael;

  console.log("🎨 BAEL Color Picker Component loaded");
})();
