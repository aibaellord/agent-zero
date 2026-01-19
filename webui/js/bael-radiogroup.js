/**
 * BAEL Radio Group Component - Lord Of All Options
 *
 * Radio button group with custom styling:
 * - Custom radio indicators
 * - Horizontal/vertical layout
 * - Card style variant
 * - Disabled states
 * - Icon support
 * - Descriptions
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // RADIO GROUP CLASS
  // ============================================================

  class BaelRadioGroup {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-radiogroup-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-radiogroup-styles";
      styles.textContent = `
                .bael-radiogroup {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }

                .bael-radiogroup.horizontal {
                    flex-direction: row;
                    flex-wrap: wrap;
                    gap: 16px;
                }

                .bael-radiogroup.disabled {
                    opacity: 0.5;
                    pointer-events: none;
                }

                /* Radio item */
                .bael-radio-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    cursor: pointer;
                }

                .bael-radio-item.disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                /* Hidden native input */
                .bael-radio-input {
                    position: absolute;
                    opacity: 0;
                    pointer-events: none;
                }

                /* Custom radio indicator */
                .bael-radio-indicator {
                    position: relative;
                    flex-shrink: 0;
                    width: 20px;
                    height: 20px;
                    background: rgba(0,0,0,0.3);
                    border: 2px solid rgba(255,255,255,0.2);
                    border-radius: 50%;
                    transition: all 0.15s;
                    margin-top: 1px;
                }

                .bael-radio-indicator::after {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 8px;
                    height: 8px;
                    background: #3b82f6;
                    border-radius: 50%;
                    transform: translate(-50%, -50%) scale(0);
                    transition: transform 0.15s ease;
                }

                .bael-radio-item:hover .bael-radio-indicator {
                    border-color: rgba(255,255,255,0.35);
                }

                .bael-radio-item.checked .bael-radio-indicator {
                    border-color: #3b82f6;
                }

                .bael-radio-item.checked .bael-radio-indicator::after {
                    transform: translate(-50%, -50%) scale(1);
                }

                .bael-radio-input:focus + .bael-radio-indicator {
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
                }

                /* Colors */
                .bael-radiogroup.green .bael-radio-item.checked .bael-radio-indicator { border-color: #22c55e; }
                .bael-radiogroup.green .bael-radio-indicator::after { background: #22c55e; }

                .bael-radiogroup.purple .bael-radio-item.checked .bael-radio-indicator { border-color: #8b5cf6; }
                .bael-radiogroup.purple .bael-radio-indicator::after { background: #8b5cf6; }

                .bael-radiogroup.orange .bael-radio-item.checked .bael-radio-indicator { border-color: #f97316; }
                .bael-radiogroup.orange .bael-radio-indicator::after { background: #f97316; }

                .bael-radiogroup.red .bael-radio-item.checked .bael-radio-indicator { border-color: #ef4444; }
                .bael-radiogroup.red .bael-radio-indicator::after { background: #ef4444; }

                /* Content */
                .bael-radio-content {
                    flex: 1;
                    min-width: 0;
                }

                .bael-radio-label {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 14px;
                    color: #ddd;
                    line-height: 1.4;
                }

                .bael-radio-icon {
                    display: flex;
                    align-items: center;
                }

                .bael-radio-icon svg {
                    width: 16px;
                    height: 16px;
                }

                .bael-radio-description {
                    font-size: 12px;
                    color: #888;
                    margin-top: 2px;
                    line-height: 1.4;
                }

                /* Size: Small */
                .bael-radiogroup.small .bael-radio-indicator {
                    width: 16px;
                    height: 16px;
                }

                .bael-radiogroup.small .bael-radio-indicator::after {
                    width: 6px;
                    height: 6px;
                }

                .bael-radiogroup.small .bael-radio-label {
                    font-size: 12px;
                }

                .bael-radiogroup.small .bael-radio-description {
                    font-size: 11px;
                }

                /* Size: Large */
                .bael-radiogroup.large .bael-radio-indicator {
                    width: 24px;
                    height: 24px;
                }

                .bael-radiogroup.large .bael-radio-indicator::after {
                    width: 10px;
                    height: 10px;
                }

                .bael-radiogroup.large .bael-radio-label {
                    font-size: 16px;
                }

                .bael-radiogroup.large .bael-radio-description {
                    font-size: 13px;
                }

                /* Card variant */
                .bael-radiogroup.cards .bael-radio-item {
                    padding: 14px 16px;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 10px;
                    transition: all 0.15s;
                }

                .bael-radiogroup.cards .bael-radio-item:hover {
                    background: rgba(255,255,255,0.05);
                    border-color: rgba(255,255,255,0.15);
                }

                .bael-radiogroup.cards .bael-radio-item.checked {
                    background: rgba(59, 130, 246, 0.08);
                    border-color: rgba(59, 130, 246, 0.3);
                }

                .bael-radiogroup.cards.green .bael-radio-item.checked {
                    background: rgba(34, 197, 94, 0.08);
                    border-color: rgba(34, 197, 94, 0.3);
                }

                .bael-radiogroup.cards.purple .bael-radio-item.checked {
                    background: rgba(139, 92, 246, 0.08);
                    border-color: rgba(139, 92, 246, 0.3);
                }

                .bael-radiogroup.cards.orange .bael-radio-item.checked {
                    background: rgba(249, 115, 22, 0.08);
                    border-color: rgba(249, 115, 22, 0.3);
                }

                .bael-radiogroup.cards.red .bael-radio-item.checked {
                    background: rgba(239, 68, 68, 0.08);
                    border-color: rgba(239, 68, 68, 0.3);
                }

                /* Right indicator variant */
                .bael-radiogroup.indicator-right .bael-radio-item {
                    flex-direction: row-reverse;
                    justify-content: space-between;
                }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // CREATE RADIO GROUP
    // ============================================================

    /**
     * Create radio group
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Radio group container not found");
        return null;
      }

      const id = `bael-radiogroup-${++this.idCounter}`;
      const config = {
        name: id,
        options: [], // [{ value, label, description?, icon?, disabled? }]
        value: null,
        disabled: false,
        size: "default", // small, default, large
        color: "blue", // blue, green, purple, orange, red
        variant: "default", // default, cards
        horizontal: false,
        indicatorRight: false,
        onChange: null,
        ...options,
      };

      // Set default value
      if (config.value === null && config.options.length > 0) {
        config.value = config.options[0].value;
      }

      const el = document.createElement("div");
      el.className = "bael-radiogroup";
      if (config.size !== "default") el.classList.add(config.size);
      if (config.color !== "blue") el.classList.add(config.color);
      if (config.variant !== "default") el.classList.add(config.variant);
      if (config.horizontal) el.classList.add("horizontal");
      if (config.indicatorRight) el.classList.add("indicator-right");
      if (config.disabled) el.classList.add("disabled");
      el.id = id;
      el.setAttribute("role", "radiogroup");

      const state = {
        id,
        element: el,
        container,
        config,
        value: config.value,
        items: [],
      };

      this._render(state);
      this._bindEvents(state);
      container.appendChild(el);

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
     * Render radio group
     */
    _render(state) {
      const { element, config } = state;

      config.options.forEach((opt, i) => {
        const item = document.createElement("label");
        item.className = "bael-radio-item";
        if (opt.value === state.value) item.classList.add("checked");
        if (opt.disabled) item.classList.add("disabled");
        item.dataset.value = opt.value;

        // Hidden input
        const input = document.createElement("input");
        input.type = "radio";
        input.className = "bael-radio-input";
        input.name = config.name;
        input.value = opt.value;
        input.checked = opt.value === state.value;
        input.disabled = config.disabled || opt.disabled;
        item.appendChild(input);

        // Custom indicator
        const indicator = document.createElement("span");
        indicator.className = "bael-radio-indicator";
        item.appendChild(indicator);

        // Content
        const content = document.createElement("div");
        content.className = "bael-radio-content";

        const labelEl = document.createElement("span");
        labelEl.className = "bael-radio-label";

        if (opt.icon) {
          const iconEl = document.createElement("span");
          iconEl.className = "bael-radio-icon";
          iconEl.innerHTML = opt.icon;
          labelEl.appendChild(iconEl);
        }

        const textEl = document.createElement("span");
        textEl.textContent = opt.label;
        labelEl.appendChild(textEl);
        content.appendChild(labelEl);

        if (opt.description) {
          const desc = document.createElement("div");
          desc.className = "bael-radio-description";
          desc.textContent = opt.description;
          content.appendChild(desc);
        }

        item.appendChild(content);

        state.items.push({ element: item, input, option: opt });
        element.appendChild(item);
      });
    }

    /**
     * Set value
     */
    _setValue(state, value) {
      const { items, config } = state;

      const changed = state.value !== value;
      state.value = value;

      items.forEach(({ element, input, option }) => {
        const isChecked = option.value === value;
        element.classList.toggle("checked", isChecked);
        input.checked = isChecked;
      });

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
      state.items.forEach(({ input, option }) => {
        input.disabled = disabled || option.disabled;
      });
    }

    /**
     * Bind events
     */
    _bindEvents(state) {
      state.items.forEach(({ element, input, option }) => {
        input.addEventListener("change", () => {
          if (input.checked) {
            this._setValue(state, option.value);
          }
        });

        element.addEventListener("click", (e) => {
          if (option.disabled || state.config.disabled) {
            e.preventDefault();
          }
        });

        input.addEventListener("keydown", (e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowRight") {
            e.preventDefault();
            this._focusNext(state, option.value, 1);
          } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
            e.preventDefault();
            this._focusNext(state, option.value, -1);
          }
        });
      });
    }

    /**
     * Focus next/prev option
     */
    _focusNext(state, currentValue, direction) {
      const { items, config } = state;
      const enabledItems = items.filter((i) => !i.option.disabled);
      const currentIndex = enabledItems.findIndex(
        (i) => i.option.value === currentValue,
      );

      if (currentIndex < 0) return;

      const nextIndex =
        (currentIndex + direction + enabledItems.length) % enabledItems.length;
      const nextItem = enabledItems[nextIndex];

      nextItem.input.focus();
      this._setValue(state, nextItem.option.value);
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

  const bael = new BaelRadioGroup();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$radioGroup = (container, options) => bael.create(container, options);
  window.$radio = (container, options) => bael.create(container, options);

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelRadioGroup = bael;

  console.log("🔘 BAEL Radio Group loaded");
})();
