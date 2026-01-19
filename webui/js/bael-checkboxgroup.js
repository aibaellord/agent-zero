/**
 * BAEL Checkbox Group Component - Lord Of All Checks
 *
 * Checkbox group with custom styling:
 * - Custom checkbox indicators
 * - Indeterminate state
 * - Multi-select
 * - Card variant
 * - Select all option
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // CHECKBOX GROUP CLASS
  // ============================================================

  class BaelCheckboxGroup {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-checkboxgroup-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-checkboxgroup-styles";
      styles.textContent = `
                .bael-checkboxgroup {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }

                .bael-checkboxgroup.horizontal {
                    flex-direction: row;
                    flex-wrap: wrap;
                    gap: 16px;
                }

                .bael-checkboxgroup.disabled {
                    opacity: 0.5;
                    pointer-events: none;
                }

                /* Checkbox item */
                .bael-checkbox-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    cursor: pointer;
                }

                .bael-checkbox-item.disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                /* Hidden native input */
                .bael-checkbox-input {
                    position: absolute;
                    opacity: 0;
                    pointer-events: none;
                }

                /* Custom checkbox indicator */
                .bael-checkbox-indicator {
                    position: relative;
                    flex-shrink: 0;
                    width: 20px;
                    height: 20px;
                    background: rgba(0,0,0,0.3);
                    border: 2px solid rgba(255,255,255,0.2);
                    border-radius: 5px;
                    transition: all 0.15s;
                    margin-top: 1px;
                }

                /* Checkmark */
                .bael-checkbox-indicator svg {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 12px;
                    height: 12px;
                    transform: translate(-50%, -50%) scale(0);
                    transition: transform 0.15s ease;
                    color: #3b82f6;
                }

                /* Indeterminate dash */
                .bael-checkbox-indicator::before {
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 10px;
                    height: 2px;
                    background: #3b82f6;
                    transform: translate(-50%, -50%) scale(0);
                    transition: transform 0.15s ease;
                    border-radius: 1px;
                }

                .bael-checkbox-item:hover .bael-checkbox-indicator {
                    border-color: rgba(255,255,255,0.35);
                }

                .bael-checkbox-item.checked .bael-checkbox-indicator {
                    border-color: #3b82f6;
                    background: rgba(59, 130, 246, 0.15);
                }

                .bael-checkbox-item.checked .bael-checkbox-indicator svg {
                    transform: translate(-50%, -50%) scale(1);
                }

                .bael-checkbox-item.indeterminate .bael-checkbox-indicator {
                    border-color: #3b82f6;
                }

                .bael-checkbox-item.indeterminate .bael-checkbox-indicator::before {
                    transform: translate(-50%, -50%) scale(1);
                }

                .bael-checkbox-input:focus + .bael-checkbox-indicator {
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
                }

                /* Colors */
                .bael-checkboxgroup.green .bael-checkbox-item.checked .bael-checkbox-indicator { border-color: #22c55e; background: rgba(34, 197, 94, 0.15); }
                .bael-checkboxgroup.green .bael-checkbox-indicator svg { color: #22c55e; }
                .bael-checkboxgroup.green .bael-checkbox-indicator::before { background: #22c55e; }

                .bael-checkboxgroup.purple .bael-checkbox-item.checked .bael-checkbox-indicator { border-color: #8b5cf6; background: rgba(139, 92, 246, 0.15); }
                .bael-checkboxgroup.purple .bael-checkbox-indicator svg { color: #8b5cf6; }
                .bael-checkboxgroup.purple .bael-checkbox-indicator::before { background: #8b5cf6; }

                .bael-checkboxgroup.orange .bael-checkbox-item.checked .bael-checkbox-indicator { border-color: #f97316; background: rgba(249, 115, 22, 0.15); }
                .bael-checkboxgroup.orange .bael-checkbox-indicator svg { color: #f97316; }
                .bael-checkboxgroup.orange .bael-checkbox-indicator::before { background: #f97316; }

                .bael-checkboxgroup.red .bael-checkbox-item.checked .bael-checkbox-indicator { border-color: #ef4444; background: rgba(239, 68, 68, 0.15); }
                .bael-checkboxgroup.red .bael-checkbox-indicator svg { color: #ef4444; }
                .bael-checkboxgroup.red .bael-checkbox-indicator::before { background: #ef4444; }

                /* Content */
                .bael-checkbox-content {
                    flex: 1;
                    min-width: 0;
                }

                .bael-checkbox-label {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 14px;
                    color: #ddd;
                    line-height: 1.4;
                }

                .bael-checkbox-icon {
                    display: flex;
                    align-items: center;
                }

                .bael-checkbox-icon svg {
                    width: 16px;
                    height: 16px;
                }

                .bael-checkbox-description {
                    font-size: 12px;
                    color: #888;
                    margin-top: 2px;
                    line-height: 1.4;
                }

                /* Size: Small */
                .bael-checkboxgroup.small .bael-checkbox-indicator {
                    width: 16px;
                    height: 16px;
                    border-radius: 4px;
                }

                .bael-checkboxgroup.small .bael-checkbox-indicator svg {
                    width: 10px;
                    height: 10px;
                }

                .bael-checkboxgroup.small .bael-checkbox-indicator::before {
                    width: 8px;
                }

                .bael-checkboxgroup.small .bael-checkbox-label {
                    font-size: 12px;
                }

                .bael-checkboxgroup.small .bael-checkbox-description {
                    font-size: 11px;
                }

                /* Size: Large */
                .bael-checkboxgroup.large .bael-checkbox-indicator {
                    width: 24px;
                    height: 24px;
                    border-radius: 6px;
                }

                .bael-checkboxgroup.large .bael-checkbox-indicator svg {
                    width: 16px;
                    height: 16px;
                }

                .bael-checkboxgroup.large .bael-checkbox-indicator::before {
                    width: 12px;
                    height: 3px;
                }

                .bael-checkboxgroup.large .bael-checkbox-label {
                    font-size: 16px;
                }

                .bael-checkboxgroup.large .bael-checkbox-description {
                    font-size: 13px;
                }

                /* Card variant */
                .bael-checkboxgroup.cards .bael-checkbox-item {
                    padding: 14px 16px;
                    background: rgba(255,255,255,0.03);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 10px;
                    transition: all 0.15s;
                }

                .bael-checkboxgroup.cards .bael-checkbox-item:hover {
                    background: rgba(255,255,255,0.05);
                    border-color: rgba(255,255,255,0.15);
                }

                .bael-checkboxgroup.cards .bael-checkbox-item.checked {
                    background: rgba(59, 130, 246, 0.08);
                    border-color: rgba(59, 130, 246, 0.3);
                }

                .bael-checkboxgroup.cards.green .bael-checkbox-item.checked {
                    background: rgba(34, 197, 94, 0.08);
                    border-color: rgba(34, 197, 94, 0.3);
                }

                .bael-checkboxgroup.cards.purple .bael-checkbox-item.checked {
                    background: rgba(139, 92, 246, 0.08);
                    border-color: rgba(139, 92, 246, 0.3);
                }

                /* Right indicator */
                .bael-checkboxgroup.indicator-right .bael-checkbox-item {
                    flex-direction: row-reverse;
                    justify-content: space-between;
                }

                /* Select all divider */
                .bael-checkbox-selectall {
                    padding-bottom: 10px;
                    margin-bottom: 4px;
                    border-bottom: 1px solid rgba(255,255,255,0.08);
                }

                .bael-checkbox-selectall .bael-checkbox-label {
                    font-weight: 500;
                }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // CREATE CHECKBOX GROUP
    // ============================================================

    /**
     * Create checkbox group
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Checkbox group container not found");
        return null;
      }

      const id = `bael-checkboxgroup-${++this.idCounter}`;
      const config = {
        name: id,
        options: [], // [{ value, label, description?, icon?, disabled? }]
        value: [], // Array of selected values
        disabled: false,
        size: "default", // small, default, large
        color: "blue", // blue, green, purple, orange, red
        variant: "default", // default, cards
        horizontal: false,
        indicatorRight: false,
        selectAll: false, // Show select all option
        selectAllLabel: "Select All",
        min: 0, // Minimum selections
        max: Infinity, // Maximum selections
        onChange: null,
        ...options,
      };

      const el = document.createElement("div");
      el.className = "bael-checkboxgroup";
      if (config.size !== "default") el.classList.add(config.size);
      if (config.color !== "blue") el.classList.add(config.color);
      if (config.variant !== "default") el.classList.add(config.variant);
      if (config.horizontal) el.classList.add("horizontal");
      if (config.indicatorRight) el.classList.add("indicator-right");
      if (config.disabled) el.classList.add("disabled");
      el.id = id;
      el.setAttribute("role", "group");

      const state = {
        id,
        element: el,
        container,
        config,
        value: new Set(config.value),
        items: [],
        selectAllItem: null,
      };

      this._render(state);
      this._bindEvents(state);
      container.appendChild(el);

      this.instances.set(id, state);

      return {
        id,
        getValue: () => Array.from(state.value),
        setValue: (v) => this._setValue(state, v),
        setDisabled: (d) => this._setDisabled(state, d),
        checkAll: () => this._checkAll(state),
        uncheckAll: () => this._uncheckAll(state),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Render checkbox group
     */
    _render(state) {
      const { element, config } = state;

      // Select all option
      if (config.selectAll) {
        const item = this._createItem(
          state,
          {
            value: "__select_all__",
            label: config.selectAllLabel,
          },
          true,
        );
        item.classList.add("bael-checkbox-selectall");
        state.selectAllItem = item;
        element.appendChild(item);

        this._updateSelectAll(state);
      }

      // Options
      config.options.forEach((opt) => {
        const item = this._createItem(state, opt, false);
        element.appendChild(item);
      });
    }

    /**
     * Create checkbox item
     */
    _createItem(state, opt, isSelectAll) {
      const item = document.createElement("label");
      item.className = "bael-checkbox-item";
      if (!isSelectAll && state.value.has(opt.value))
        item.classList.add("checked");
      if (opt.disabled) item.classList.add("disabled");
      item.dataset.value = opt.value;

      // Hidden input
      const input = document.createElement("input");
      input.type = "checkbox";
      input.className = "bael-checkbox-input";
      input.name = isSelectAll
        ? `${state.config.name}__all`
        : state.config.name;
      input.value = opt.value;
      input.checked = !isSelectAll && state.value.has(opt.value);
      input.disabled = state.config.disabled || opt.disabled;
      item.appendChild(input);

      // Custom indicator
      const indicator = document.createElement("span");
      indicator.className = "bael-checkbox-indicator";
      indicator.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
            `;
      item.appendChild(indicator);

      // Content
      const content = document.createElement("div");
      content.className = "bael-checkbox-content";

      const labelEl = document.createElement("span");
      labelEl.className = "bael-checkbox-label";

      if (opt.icon) {
        const iconEl = document.createElement("span");
        iconEl.className = "bael-checkbox-icon";
        iconEl.innerHTML = opt.icon;
        labelEl.appendChild(iconEl);
      }

      const textEl = document.createElement("span");
      textEl.textContent = opt.label;
      labelEl.appendChild(textEl);
      content.appendChild(labelEl);

      if (opt.description) {
        const desc = document.createElement("div");
        desc.className = "bael-checkbox-description";
        desc.textContent = opt.description;
        content.appendChild(desc);
      }

      item.appendChild(content);

      if (!isSelectAll) {
        state.items.push({ element: item, input, option: opt });
      }

      return item;
    }

    /**
     * Update select all state
     */
    _updateSelectAll(state) {
      if (!state.selectAllItem) return;

      const { config, value, items } = state;
      const enabledItems = items.filter((i) => !i.option.disabled);
      const checkedCount = enabledItems.filter((i) =>
        value.has(i.option.value),
      ).length;

      const allChecked =
        checkedCount === enabledItems.length && enabledItems.length > 0;
      const someChecked =
        checkedCount > 0 && checkedCount < enabledItems.length;

      const input = state.selectAllItem.querySelector("input");
      input.checked = allChecked;
      input.indeterminate = someChecked;

      state.selectAllItem.classList.toggle("checked", allChecked);
      state.selectAllItem.classList.toggle("indeterminate", someChecked);
    }

    /**
     * Set value
     */
    _setValue(state, values) {
      state.value = new Set(values);

      state.items.forEach(({ element, input, option }) => {
        const isChecked = state.value.has(option.value);
        element.classList.toggle("checked", isChecked);
        input.checked = isChecked;
      });

      this._updateSelectAll(state);

      if (state.config.onChange) {
        state.config.onChange(Array.from(state.value));
      }
    }

    /**
     * Toggle value
     */
    _toggle(state, value) {
      const { config } = state;

      if (state.value.has(value)) {
        // Check min
        if (state.value.size > config.min) {
          state.value.delete(value);
        }
      } else {
        // Check max
        if (state.value.size < config.max) {
          state.value.add(value);
        }
      }

      // Update UI
      const item = state.items.find((i) => i.option.value === value);
      if (item) {
        const isChecked = state.value.has(value);
        item.element.classList.toggle("checked", isChecked);
        item.input.checked = isChecked;
      }

      this._updateSelectAll(state);

      if (config.onChange) {
        config.onChange(Array.from(state.value));
      }
    }

    /**
     * Check all
     */
    _checkAll(state) {
      const { config, items } = state;
      const values = [];

      items.forEach(({ option }) => {
        if (!option.disabled) {
          values.push(option.value);
        }
      });

      // Respect max
      const toSelect = values.slice(0, config.max);
      this._setValue(state, toSelect);
    }

    /**
     * Uncheck all
     */
    _uncheckAll(state) {
      // Respect min
      if (state.config.min > 0) {
        const values = Array.from(state.value).slice(0, state.config.min);
        this._setValue(state, values);
      } else {
        this._setValue(state, []);
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

      if (state.selectAllItem) {
        state.selectAllItem.querySelector("input").disabled = disabled;
      }
    }

    /**
     * Bind events
     */
    _bindEvents(state) {
      // Regular items
      state.items.forEach(({ element, input, option }) => {
        input.addEventListener("change", () => {
          this._toggle(state, option.value);
        });

        element.addEventListener("click", (e) => {
          if (option.disabled || state.config.disabled) {
            e.preventDefault();
          }
        });
      });

      // Select all
      if (state.selectAllItem) {
        const input = state.selectAllItem.querySelector("input");
        input.addEventListener("change", () => {
          if (input.checked) {
            this._checkAll(state);
          } else {
            this._uncheckAll(state);
          }
        });
      }
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

  const bael = new BaelCheckboxGroup();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$checkboxGroup = (container, options) =>
    bael.create(container, options);
  window.$checkboxes = (container, options) => bael.create(container, options);

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelCheckboxGroup = bael;

  console.log("☑️ BAEL Checkbox Group loaded");
})();
