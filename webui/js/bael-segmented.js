/**
 * BAEL Segmented Control Component - Lord Of All Segments
 *
 * iOS-style segmented control / button group:
 * - Single selection
 * - Sliding indicator
 * - Icon + label options
 * - Size variants
 * - Color themes
 * - Keyboard navigation
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // SEGMENTED CONTROL CLASS
  // ============================================================

  class BaelSegmentedControl {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-segmented-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-segmented-styles";
      styles.textContent = `
                .bael-segmented {
                    display: inline-flex;
                    position: relative;
                    background: rgba(255,255,255,0.05);
                    border-radius: 10px;
                    padding: 4px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }

                .bael-segmented.disabled {
                    opacity: 0.5;
                    pointer-events: none;
                }

                /* Sliding indicator */
                .bael-segmented-indicator {
                    position: absolute;
                    top: 4px;
                    left: 4px;
                    height: calc(100% - 8px);
                    background: rgba(59, 130, 246, 0.2);
                    border: 1px solid rgba(59, 130, 246, 0.3);
                    border-radius: 6px;
                    transition: transform 0.2s ease, width 0.2s ease;
                    pointer-events: none;
                    z-index: 0;
                }

                /* Color variants */
                .bael-segmented.green .bael-segmented-indicator {
                    background: rgba(34, 197, 94, 0.2);
                    border-color: rgba(34, 197, 94, 0.3);
                }

                .bael-segmented.purple .bael-segmented-indicator {
                    background: rgba(139, 92, 246, 0.2);
                    border-color: rgba(139, 92, 246, 0.3);
                }

                .bael-segmented.orange .bael-segmented-indicator {
                    background: rgba(249, 115, 22, 0.2);
                    border-color: rgba(249, 115, 22, 0.3);
                }

                .bael-segmented.red .bael-segmented-indicator {
                    background: rgba(239, 68, 68, 0.2);
                    border-color: rgba(239, 68, 68, 0.3);
                }

                /* Segments */
                .bael-segment {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    padding: 8px 16px;
                    background: none;
                    border: none;
                    font-size: 13px;
                    font-weight: 500;
                    color: #888;
                    cursor: pointer;
                    transition: color 0.15s;
                    z-index: 1;
                    white-space: nowrap;
                }

                .bael-segment:focus {
                    outline: none;
                }

                .bael-segment:focus-visible {
                    outline: 2px solid rgba(59, 130, 246, 0.5);
                    outline-offset: 2px;
                    border-radius: 4px;
                }

                .bael-segment:hover {
                    color: #bbb;
                }

                .bael-segment.active {
                    color: #fff;
                }

                .bael-segmented.green .bael-segment.active { color: #22c55e; }
                .bael-segmented.purple .bael-segment.active { color: #8b5cf6; }
                .bael-segmented.orange .bael-segment.active { color: #f97316; }
                .bael-segmented.red .bael-segment.active { color: #ef4444; }

                /* Segment icon */
                .bael-segment-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .bael-segment-icon svg {
                    width: 16px;
                    height: 16px;
                }

                /* Size: Small */
                .bael-segmented.small {
                    padding: 3px;
                    border-radius: 8px;
                }

                .bael-segmented.small .bael-segmented-indicator {
                    top: 3px;
                    left: 3px;
                    height: calc(100% - 6px);
                }

                .bael-segmented.small .bael-segment {
                    padding: 5px 10px;
                    font-size: 11px;
                    gap: 4px;
                }

                .bael-segmented.small .bael-segment-icon svg {
                    width: 12px;
                    height: 12px;
                }

                /* Size: Large */
                .bael-segmented.large {
                    padding: 5px;
                    border-radius: 12px;
                }

                .bael-segmented.large .bael-segmented-indicator {
                    top: 5px;
                    left: 5px;
                    height: calc(100% - 10px);
                    border-radius: 8px;
                }

                .bael-segmented.large .bael-segment {
                    padding: 12px 24px;
                    font-size: 15px;
                    gap: 8px;
                }

                .bael-segmented.large .bael-segment-icon svg {
                    width: 20px;
                    height: 20px;
                }

                /* Pill variant */
                .bael-segmented.pill {
                    border-radius: 999px;
                }

                .bael-segmented.pill .bael-segmented-indicator {
                    border-radius: 999px;
                }

                /* Block variant (full width) */
                .bael-segmented.block {
                    width: 100%;
                }

                .bael-segmented.block .bael-segment {
                    flex: 1;
                }

                /* Vertical variant */
                .bael-segmented.vertical {
                    flex-direction: column;
                }

                .bael-segmented.vertical .bael-segmented-indicator {
                    width: calc(100% - 8px) !important;
                }

                /* Outlined variant */
                .bael-segmented.outlined {
                    background: transparent;
                    border: 1px solid rgba(255,255,255,0.12);
                }

                /* Icon only */
                .bael-segment.icon-only {
                    padding: 8px 12px;
                }

                .bael-segmented.small .bael-segment.icon-only {
                    padding: 5px 8px;
                }

                .bael-segmented.large .bael-segment.icon-only {
                    padding: 12px 16px;
                }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // CREATE SEGMENTED CONTROL
    // ============================================================

    /**
     * Create segmented control
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Segmented control container not found");
        return null;
      }

      const id = `bael-segmented-${++this.idCounter}`;
      const config = {
        segments: [], // [{ value: 'x', label: 'X', icon: '' }]
        value: null,
        disabled: false,
        size: "default", // small, default, large
        color: "blue", // blue, green, purple, orange, red
        variant: "default", // default, pill, outlined
        block: false, // Full width
        vertical: false,
        onChange: null,
        ...options,
      };

      // Set default value
      if (config.value === null && config.segments.length > 0) {
        config.value = config.segments[0].value;
      }

      const el = document.createElement("div");
      el.className = "bael-segmented";
      if (config.size !== "default") el.classList.add(config.size);
      if (config.color !== "blue") el.classList.add(config.color);
      if (config.variant !== "default") el.classList.add(config.variant);
      if (config.block) el.classList.add("block");
      if (config.vertical) el.classList.add("vertical");
      if (config.disabled) el.classList.add("disabled");
      el.id = id;
      el.setAttribute("role", "tablist");

      const state = {
        id,
        element: el,
        container,
        config,
        value: config.value,
        indicator: null,
        segmentEls: [],
      };

      this._render(state);
      this._bindEvents(state);
      container.appendChild(el);

      // Position indicator after DOM insertion
      requestAnimationFrame(() => {
        this._updateIndicator(state);
      });

      this.instances.set(id, state);

      return {
        id,
        getValue: () => state.value,
        setValue: (v) => this._setValue(state, v),
        setDisabled: (d) => this._setDisabled(state, d),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Render segmented control
     */
    _render(state) {
      const { element, config } = state;

      // Create indicator
      const indicator = document.createElement("div");
      indicator.className = "bael-segmented-indicator";
      state.indicator = indicator;
      element.appendChild(indicator);

      // Create segments
      config.segments.forEach((seg, i) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "bael-segment";
        if (seg.value === state.value) btn.classList.add("active");
        if (seg.icon && !seg.label) btn.classList.add("icon-only");
        btn.setAttribute("role", "tab");
        btn.setAttribute("aria-selected", seg.value === state.value);
        btn.setAttribute("tabindex", seg.value === state.value ? "0" : "-1");
        btn.dataset.value = seg.value;

        // Icon
        if (seg.icon) {
          const iconEl = document.createElement("span");
          iconEl.className = "bael-segment-icon";
          iconEl.innerHTML = seg.icon;
          btn.appendChild(iconEl);
        }

        // Label
        if (seg.label) {
          const labelEl = document.createElement("span");
          labelEl.className = "bael-segment-label";
          labelEl.textContent = seg.label;
          btn.appendChild(labelEl);
        }

        state.segmentEls.push(btn);
        element.appendChild(btn);
      });
    }

    /**
     * Update indicator position
     */
    _updateIndicator(state) {
      const { indicator, segmentEls, config, value } = state;

      const activeIndex = config.segments.findIndex((s) => s.value === value);
      if (activeIndex < 0) {
        indicator.style.display = "none";
        return;
      }

      indicator.style.display = "block";
      const activeBtn = segmentEls[activeIndex];

      if (config.vertical) {
        // Vertical positioning
        const offsetTop = activeBtn.offsetTop - 4;
        indicator.style.width = `calc(100% - 8px)`;
        indicator.style.height = `${activeBtn.offsetHeight}px`;
        indicator.style.transform = `translateY(${offsetTop}px)`;
      } else {
        // Horizontal positioning
        const offsetLeft = activeBtn.offsetLeft - 4;
        indicator.style.width = `${activeBtn.offsetWidth}px`;
        indicator.style.transform = `translateX(${offsetLeft}px)`;
      }
    }

    /**
     * Set value
     */
    _setValue(state, value) {
      const { config, segmentEls } = state;

      const index = config.segments.findIndex((s) => s.value === value);
      if (index < 0) return;

      const changed = state.value !== value;
      state.value = value;

      // Update active states
      segmentEls.forEach((btn, i) => {
        const isActive = i === index;
        btn.classList.toggle("active", isActive);
        btn.setAttribute("aria-selected", isActive);
        btn.setAttribute("tabindex", isActive ? "0" : "-1");
      });

      this._updateIndicator(state);

      if (changed && config.onChange) {
        config.onChange(value);
      }
    }

    /**
     * Set disabled state
     */
    _setDisabled(state, disabled) {
      state.config.disabled = disabled;
      state.element.classList.toggle("disabled", disabled);
      state.segmentEls.forEach((btn) => {
        btn.disabled = disabled;
      });
    }

    /**
     * Bind events
     */
    _bindEvents(state) {
      const { segmentEls, config } = state;

      segmentEls.forEach((btn, i) => {
        btn.addEventListener("click", () => {
          this._setValue(state, config.segments[i].value);
        });

        btn.addEventListener("keydown", (e) => {
          let newIndex = -1;

          if (config.vertical) {
            if (e.key === "ArrowDown") {
              newIndex = (i + 1) % segmentEls.length;
            } else if (e.key === "ArrowUp") {
              newIndex = (i - 1 + segmentEls.length) % segmentEls.length;
            }
          } else {
            if (e.key === "ArrowRight") {
              newIndex = (i + 1) % segmentEls.length;
            } else if (e.key === "ArrowLeft") {
              newIndex = (i - 1 + segmentEls.length) % segmentEls.length;
            }
          }

          if (e.key === "Home") {
            newIndex = 0;
          } else if (e.key === "End") {
            newIndex = segmentEls.length - 1;
          }

          if (newIndex >= 0) {
            e.preventDefault();
            this._setValue(state, config.segments[newIndex].value);
            segmentEls[newIndex].focus();
          }
        });
      });

      // Handle resize for indicator recalculation
      const resizeObserver = new ResizeObserver(() => {
        this._updateIndicator(state);
      });
      resizeObserver.observe(state.element);
    }

    /**
     * Destroy instance
     */
    destroy(id) {
      const state = this.instances.get(id);
      if (!state) return;

      state.element.remove();
      this.instances.delete(id);
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelSegmentedControl();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$segmented = (container, options) => bael.create(container, options);
  window.$buttonGroup = (container, options) => bael.create(container, options);

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelSegmentedControl = bael;

  console.log("🎛️ BAEL Segmented Control loaded");
})();
