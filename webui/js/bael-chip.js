/**
 * BAEL Chip/Tag Display Component - Lord Of All Labels
 *
 * Compact chip/tag UI elements:
 * - Deletable chips
 * - Avatar chips
 * - Selectable chips
 * - Chip groups
 * - Filter chips
 * - Action chips
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // CHIP CLASS
  // ============================================================

  class BaelChip {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-chip-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-chip-styles";
      styles.textContent = `
                .bael-chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    background: rgba(255,255,255,0.08);
                    border: 1px solid rgba(255,255,255,0.12);
                    border-radius: 16px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    font-size: 13px;
                    color: #ddd;
                    cursor: default;
                    transition: all 0.15s;
                    user-select: none;
                }

                .bael-chip:hover {
                    background: rgba(255,255,255,0.12);
                }

                /* Clickable/selectable */
                .bael-chip.clickable {
                    cursor: pointer;
                }

                .bael-chip.selected {
                    background: rgba(59, 130, 246, 0.2);
                    border-color: #3b82f6;
                    color: #3b82f6;
                }

                /* Avatar */
                .bael-chip-avatar {
                    width: 20px;
                    height: 20px;
                    margin-left: -4px;
                    border-radius: 50%;
                    object-fit: cover;
                    background: rgba(255,255,255,0.1);
                }

                /* Icon */
                .bael-chip-icon {
                    width: 14px;
                    height: 14px;
                    margin-left: -2px;
                    color: inherit;
                    opacity: 0.7;
                }

                /* Delete button */
                .bael-chip-delete {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 16px;
                    height: 16px;
                    margin-right: -4px;
                    margin-left: 2px;
                    background: rgba(255,255,255,0.1);
                    border: none;
                    border-radius: 50%;
                    color: inherit;
                    cursor: pointer;
                    transition: all 0.1s;
                }

                .bael-chip-delete:hover {
                    background: rgba(239, 68, 68, 0.3);
                    color: #ef4444;
                }

                .bael-chip-delete svg {
                    width: 10px;
                    height: 10px;
                }

                /* Size variants */
                .bael-chip.small {
                    padding: 4px 8px;
                    font-size: 11px;
                    border-radius: 12px;
                }

                .bael-chip.small .bael-chip-avatar {
                    width: 16px;
                    height: 16px;
                }

                .bael-chip.small .bael-chip-delete {
                    width: 14px;
                    height: 14px;
                }

                .bael-chip.large {
                    padding: 8px 16px;
                    font-size: 15px;
                    border-radius: 20px;
                }

                .bael-chip.large .bael-chip-avatar {
                    width: 24px;
                    height: 24px;
                }

                /* Color variants */
                .bael-chip.blue {
                    background: rgba(59, 130, 246, 0.15);
                    border-color: rgba(59, 130, 246, 0.3);
                    color: #60a5fa;
                }

                .bael-chip.green {
                    background: rgba(34, 197, 94, 0.15);
                    border-color: rgba(34, 197, 94, 0.3);
                    color: #4ade80;
                }

                .bael-chip.red {
                    background: rgba(239, 68, 68, 0.15);
                    border-color: rgba(239, 68, 68, 0.3);
                    color: #f87171;
                }

                .bael-chip.yellow {
                    background: rgba(234, 179, 8, 0.15);
                    border-color: rgba(234, 179, 8, 0.3);
                    color: #facc15;
                }

                .bael-chip.purple {
                    background: rgba(168, 85, 247, 0.15);
                    border-color: rgba(168, 85, 247, 0.3);
                    color: #c084fc;
                }

                .bael-chip.orange {
                    background: rgba(249, 115, 22, 0.15);
                    border-color: rgba(249, 115, 22, 0.3);
                    color: #fb923c;
                }

                /* Outlined variant */
                .bael-chip.outlined {
                    background: transparent;
                }

                .bael-chip.outlined:hover {
                    background: rgba(255,255,255,0.05);
                }

                /* Disabled */
                .bael-chip.disabled {
                    opacity: 0.5;
                    pointer-events: none;
                }

                /* Chip group */
                .bael-chip-group {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .bael-chip-group.column {
                    flex-direction: column;
                    align-items: flex-start;
                }

                /* Checkbox chip (filter) */
                .bael-chip.filter .bael-chip-check {
                    width: 14px;
                    height: 14px;
                    margin-left: -2px;
                    opacity: 0;
                    transform: scale(0.5);
                    transition: all 0.15s;
                }

                .bael-chip.filter.selected .bael-chip-check {
                    opacity: 1;
                    transform: scale(1);
                }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // CREATE CHIP
    // ============================================================

    /**
     * Create single chip
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Chip container not found");
        return null;
      }

      const id = `bael-chip-${++this.idCounter}`;
      const config = {
        label: "Chip",
        avatar: null, // URL for avatar image
        icon: null, // SVG icon HTML
        deletable: false,
        selectable: false,
        selected: false,
        filter: false, // Filter chip with checkbox
        color: null, // blue, green, red, yellow, purple, orange
        outlined: false,
        size: "default", // small, default, large
        disabled: false,
        onClick: null,
        onDelete: null,
        onSelect: null,
        ...options,
      };

      const el = document.createElement("div");
      el.className = "bael-chip";
      if (config.size !== "default") el.classList.add(config.size);
      if (config.color) el.classList.add(config.color);
      if (config.outlined) el.classList.add("outlined");
      if (config.disabled) el.classList.add("disabled");
      if (config.selectable || config.filter) el.classList.add("clickable");
      if (config.filter) el.classList.add("filter");
      if (config.selected) el.classList.add("selected");
      el.id = id;

      const state = {
        id,
        element: el,
        container,
        config,
        selected: config.selected,
      };

      this._render(state);
      this._bindEvents(state);
      container.appendChild(el);

      this.instances.set(id, state);

      return {
        id,
        isSelected: () => state.selected,
        setSelected: (s) => this._setSelected(state, s),
        setLabel: (l) => {
          state.labelEl.textContent = l;
        },
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Create chip group
     */
    createGroup(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      const groupConfig = {
        chips: [], // Array of chip configs
        multiSelect: true,
        column: false,
        onChange: null,
        ...options,
      };

      const groupEl = document.createElement("div");
      groupEl.className = "bael-chip-group";
      if (groupConfig.column) groupEl.classList.add("column");

      const chipInstances = [];
      const values = new Set();

      groupConfig.chips.forEach((chipOpts, index) => {
        const chip = this.create(groupEl, {
          ...chipOpts,
          selectable: true,
          onSelect: (selected, chipState) => {
            if (selected) {
              if (!groupConfig.multiSelect) {
                // Deselect others
                chipInstances.forEach((c, i) => {
                  if (i !== index && c.isSelected()) {
                    c.setSelected(false);
                    values.delete(i);
                  }
                });
              }
              values.add(index);
            } else {
              values.delete(index);
            }

            if (groupConfig.onChange) {
              groupConfig.onChange(
                Array.from(values).map((i) => groupConfig.chips[i].value || i),
              );
            }
          },
        });

        if (chipOpts.selected) values.add(index);
        chipInstances.push(chip);
      });

      container.appendChild(groupEl);

      return {
        element: groupEl,
        chips: chipInstances,
        getSelected: () =>
          Array.from(values).map((i) => groupConfig.chips[i].value || i),
        destroy: () => {
          chipInstances.forEach((c) => c.destroy());
          groupEl.remove();
        },
      };
    }

    /**
     * Render chip
     */
    _render(state) {
      const { element, config } = state;

      // Filter check icon
      if (config.filter) {
        const check = document.createElement("span");
        check.className = "bael-chip-check";
        check.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="width:100%;height:100%">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                `;
        element.appendChild(check);
      }

      // Avatar
      if (config.avatar) {
        const avatar = document.createElement("img");
        avatar.className = "bael-chip-avatar";
        avatar.src = config.avatar;
        avatar.alt = "";
        element.appendChild(avatar);
      }

      // Icon
      if (config.icon && !config.avatar) {
        const icon = document.createElement("span");
        icon.className = "bael-chip-icon";
        icon.innerHTML = config.icon;
        element.appendChild(icon);
      }

      // Label
      const label = document.createElement("span");
      label.className = "bael-chip-label";
      label.textContent = config.label;
      state.labelEl = label;
      element.appendChild(label);

      // Delete button
      if (config.deletable) {
        const deleteBtn = document.createElement("button");
        deleteBtn.type = "button";
        deleteBtn.className = "bael-chip-delete";
        deleteBtn.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                `;
        state.deleteBtn = deleteBtn;
        element.appendChild(deleteBtn);
      }
    }

    /**
     * Bind events
     */
    _bindEvents(state) {
      const { element, config, deleteBtn } = state;

      // Click
      element.addEventListener("click", (e) => {
        if (config.disabled) return;
        if (e.target.closest(".bael-chip-delete")) return;

        if (config.selectable || config.filter) {
          this._setSelected(state, !state.selected);
        }

        if (config.onClick) {
          config.onClick(state);
        }
      });

      // Delete
      if (deleteBtn) {
        deleteBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          if (config.disabled) return;

          if (config.onDelete) {
            config.onDelete(state);
          }

          this.destroy(state.id);
        });
      }
    }

    /**
     * Set selected state
     */
    _setSelected(state, selected) {
      if (state.selected === selected) return;

      state.selected = selected;
      state.element.classList.toggle("selected", selected);

      if (state.config.onSelect) {
        state.config.onSelect(selected, state);
      }
    }

    /**
     * Destroy chip
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

  const bael = new BaelChip();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$chip = (container, options) => bael.create(container, options);
  window.$chipGroup = (container, options) =>
    bael.createGroup(container, options);

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelChip = bael;

  console.log("🏷️ BAEL Chip Component loaded");
})();
