/**
 * BAEL List Component - Lord Of All Lists
 *
 * List and list item components:
 * - Simple lists
 * - Icon lists
 * - Interactive lists
 * - Nested lists
 * - Virtual scrolling
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // LIST CLASS
  // ============================================================

  class BaelList {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-list-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-list-styles";
      styles.textContent = `
                .bael-list {
                    list-style: none;
                    margin: 0;
                    padding: 0;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }

                /* List item */
                .bael-list-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    color: #e4e4e7;
                    transition: background 0.15s;
                }

                .bael-list.compact .bael-list-item {
                    padding: 8px 12px;
                    gap: 10px;
                }

                .bael-list.relaxed .bael-list-item {
                    padding: 16px 20px;
                    gap: 14px;
                }

                /* Interactive */
                .bael-list.interactive .bael-list-item {
                    cursor: pointer;
                    border-radius: 8px;
                }

                .bael-list.interactive .bael-list-item:hover {
                    background: rgba(255,255,255,0.05);
                }

                .bael-list.interactive .bael-list-item.active {
                    background: rgba(59, 130, 246, 0.15);
                    color: #3b82f6;
                }

                .bael-list.interactive .bael-list-item.selected {
                    background: rgba(59, 130, 246, 0.1);
                }

                /* Bordered */
                .bael-list.bordered .bael-list-item {
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                }

                .bael-list.bordered .bael-list-item:last-child {
                    border-bottom: none;
                }

                /* Striped */
                .bael-list.striped .bael-list-item:nth-child(odd) {
                    background: rgba(255,255,255,0.02);
                }

                /* Icon / Avatar */
                .bael-list-icon {
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background: rgba(59, 130, 246, 0.15);
                    color: #3b82f6;
                }

                .bael-list-icon svg {
                    width: 16px;
                    height: 16px;
                }

                .bael-list-icon.avatar {
                    border-radius: 50%;
                    overflow: hidden;
                }

                .bael-list-icon.avatar img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .bael-list-icon.small {
                    width: 24px;
                    height: 24px;
                }

                .bael-list-icon.small svg {
                    width: 14px;
                    height: 14px;
                }

                .bael-list-icon.large {
                    width: 40px;
                    height: 40px;
                }

                .bael-list-icon.large svg {
                    width: 20px;
                    height: 20px;
                }

                /* Icon colors */
                .bael-list-icon.green { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
                .bael-list-icon.purple { background: rgba(139, 92, 246, 0.15); color: #8b5cf6; }
                .bael-list-icon.orange { background: rgba(249, 115, 22, 0.15); color: #f97316; }
                .bael-list-icon.red { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
                .bael-list-icon.gray { background: rgba(107, 114, 128, 0.15); color: #6b7280; }

                /* Content */
                .bael-list-content {
                    flex: 1;
                    min-width: 0;
                }

                .bael-list-title {
                    font-size: 14px;
                    font-weight: 500;
                    color: #fff;
                    line-height: 1.3;
                }

                .bael-list-desc {
                    font-size: 13px;
                    color: #888;
                    margin-top: 2px;
                    line-height: 1.4;
                }

                .bael-list-meta {
                    font-size: 12px;
                    color: #666;
                    margin-top: 4px;
                }

                /* Suffix / Action */
                .bael-list-suffix {
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #888;
                    font-size: 13px;
                }

                .bael-list-action {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 6px;
                    background: none;
                    border: none;
                    color: #888;
                    cursor: pointer;
                    border-radius: 4px;
                    transition: all 0.15s;
                }

                .bael-list-action:hover {
                    background: rgba(255,255,255,0.1);
                    color: #fff;
                }

                .bael-list-action svg {
                    width: 16px;
                    height: 16px;
                }

                /* Badge */
                .bael-list-badge {
                    padding: 2px 8px;
                    background: rgba(59, 130, 246, 0.2);
                    color: #3b82f6;
                    border-radius: 999px;
                    font-size: 11px;
                    font-weight: 600;
                }

                .bael-list-badge.green { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
                .bael-list-badge.red { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
                .bael-list-badge.orange { background: rgba(249, 115, 22, 0.2); color: #f97316; }
                .bael-list-badge.gray { background: rgba(107, 114, 128, 0.2); color: #9ca3af; }

                /* Checkbox / Radio */
                .bael-list-check {
                    flex-shrink: 0;
                    width: 18px;
                    height: 18px;
                    border: 2px solid rgba(255,255,255,0.2);
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.15s;
                    cursor: pointer;
                }

                .bael-list-check.radio {
                    border-radius: 50%;
                }

                .bael-list-check.checked {
                    background: #3b82f6;
                    border-color: #3b82f6;
                }

                .bael-list-check svg {
                    width: 12px;
                    height: 12px;
                    color: #fff;
                    opacity: 0;
                    transition: opacity 0.15s;
                }

                .bael-list-check.checked svg {
                    opacity: 1;
                }

                /* Disabled */
                .bael-list-item.disabled {
                    opacity: 0.5;
                    pointer-events: none;
                }

                /* Nested */
                .bael-list-nested {
                    margin-left: 24px;
                    padding-left: 16px;
                    border-left: 1px solid rgba(255,255,255,0.08);
                }

                /* Drag handle */
                .bael-list-drag {
                    flex-shrink: 0;
                    cursor: grab;
                    color: #555;
                    padding: 4px;
                }

                .bael-list-drag:active {
                    cursor: grabbing;
                }

                .bael-list-drag svg {
                    width: 14px;
                    height: 14px;
                }

                /* Virtualized container */
                .bael-list-virtual {
                    overflow-y: auto;
                    position: relative;
                }

                .bael-list-virtual-content {
                    position: relative;
                }

                /* Empty state */
                .bael-list-empty {
                    padding: 32px 16px;
                    text-align: center;
                    color: #666;
                    font-size: 14px;
                }

                /* Loading */
                .bael-list-loading {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                    color: #888;
                }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // ICONS
    // ============================================================

    _checkIcon =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>';
    _dragIcon =
      '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>';

    // ============================================================
    // CREATE LIST
    // ============================================================

    /**
     * Create list
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("List container not found");
        return null;
      }

      const id = `bael-list-${++this.idCounter}`;
      const config = {
        items: [],
        density: "default", // compact, default, relaxed
        interactive: true,
        bordered: false,
        striped: false,
        selectable: false, // single, multiple, none/false
        showCheckbox: false,
        draggable: false,
        emptyText: "No items",
        maxHeight: null, // Virtual scrolling threshold
        itemHeight: 48, // For virtual scrolling
        onSelect: null, // (item, selected, allSelected) => {}
        onReorder: null, // (items) => {}
        onClick: null, // (item, index) => {}
        ...options,
      };

      const el = document.createElement("ul");
      el.className = "bael-list";
      if (config.density !== "default") el.classList.add(config.density);
      if (config.interactive) el.classList.add("interactive");
      if (config.bordered) el.classList.add("bordered");
      if (config.striped) el.classList.add("striped");
      el.id = id;
      el.setAttribute("role", "list");

      const state = {
        id,
        element: el,
        container,
        config,
        selected: new Set(),
      };

      this._render(state);
      container.appendChild(el);

      this.instances.set(id, state);

      return {
        id,
        setItems: (items) => this._setItems(state, items),
        getSelected: () => this._getSelected(state),
        selectAll: () => this._selectAll(state),
        deselectAll: () => this._deselectAll(state),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Render list
     */
    _render(state) {
      const { element, config } = state;
      element.innerHTML = "";

      if (config.items.length === 0) {
        const empty = document.createElement("li");
        empty.className = "bael-list-empty";
        empty.textContent = config.emptyText;
        element.appendChild(empty);
        return;
      }

      config.items.forEach((item, index) => {
        element.appendChild(this._createItem(state, item, index));
      });
    }

    /**
     * Create list item
     */
    _createItem(state, item, index) {
      const { config, selected } = state;

      const li = document.createElement("li");
      li.className = "bael-list-item";
      if (item.disabled) li.classList.add("disabled");
      if (item.active) li.classList.add("active");
      if (selected.has(item.id || index)) li.classList.add("selected");
      li.setAttribute("role", "listitem");
      li.dataset.index = index;
      if (item.id) li.dataset.id = item.id;

      // Drag handle
      if (config.draggable && !item.disabled) {
        const drag = document.createElement("span");
        drag.className = "bael-list-drag";
        drag.innerHTML = this._dragIcon;
        li.appendChild(drag);
      }

      // Checkbox
      if (config.showCheckbox) {
        const check = document.createElement("span");
        check.className = "bael-list-check";
        if (config.selectable === "single") check.classList.add("radio");
        if (selected.has(item.id || index)) check.classList.add("checked");
        check.innerHTML = this._checkIcon;
        check.addEventListener("click", (e) => {
          e.stopPropagation();
          this._toggleSelect(state, item, index);
        });
        li.appendChild(check);
      }

      // Icon or Avatar
      if (item.icon || item.avatar) {
        const icon = document.createElement("span");
        icon.className = "bael-list-icon";
        if (item.avatar) icon.classList.add("avatar");
        if (item.iconColor) icon.classList.add(item.iconColor);
        if (item.iconSize) icon.classList.add(item.iconSize);

        if (item.avatar) {
          const img = document.createElement("img");
          img.src = item.avatar;
          img.alt = "";
          icon.appendChild(img);
        } else {
          icon.innerHTML = item.icon;
        }

        li.appendChild(icon);
      }

      // Content
      const content = document.createElement("div");
      content.className = "bael-list-content";

      if (item.title) {
        const title = document.createElement("div");
        title.className = "bael-list-title";
        title.textContent = item.title;
        content.appendChild(title);
      }

      if (item.description) {
        const desc = document.createElement("div");
        desc.className = "bael-list-desc";
        desc.textContent = item.description;
        content.appendChild(desc);
      }

      if (item.meta) {
        const meta = document.createElement("div");
        meta.className = "bael-list-meta";
        meta.textContent = item.meta;
        content.appendChild(meta);
      }

      li.appendChild(content);

      // Suffix
      if (item.suffix || item.badge || item.action) {
        const suffix = document.createElement("div");
        suffix.className = "bael-list-suffix";

        if (item.suffix) {
          const suffixText = document.createElement("span");
          suffixText.textContent = item.suffix;
          suffix.appendChild(suffixText);
        }

        if (item.badge) {
          const badge = document.createElement("span");
          badge.className = `bael-list-badge ${item.badgeColor || ""}`;
          badge.textContent = item.badge;
          suffix.appendChild(badge);
        }

        if (item.action) {
          const action = document.createElement("button");
          action.className = "bael-list-action";
          action.innerHTML = item.action.icon;
          action.addEventListener("click", (e) => {
            e.stopPropagation();
            if (item.action.onClick) item.action.onClick(item);
          });
          suffix.appendChild(action);
        }

        li.appendChild(suffix);
      }

      // Click handler
      if (config.interactive && !item.disabled) {
        li.addEventListener("click", () => {
          if (config.selectable) {
            this._toggleSelect(state, item, index);
          }
          if (config.onClick) {
            config.onClick(item, index);
          }
        });
      }

      return li;
    }

    /**
     * Toggle selection
     */
    _toggleSelect(state, item, index) {
      const { config, selected } = state;
      const key = item.id || index;

      if (config.selectable === "single") {
        selected.clear();
        selected.add(key);
      } else if (selected.has(key)) {
        selected.delete(key);
      } else {
        selected.add(key);
      }

      this._render(state);

      if (config.onSelect) {
        config.onSelect(item, selected.has(key), this._getSelected(state));
      }
    }

    /**
     * Get selected items
     */
    _getSelected(state) {
      const { config, selected } = state;
      return config.items.filter((item, index) =>
        selected.has(item.id || index),
      );
    }

    /**
     * Select all
     */
    _selectAll(state) {
      state.config.items.forEach((item, index) => {
        state.selected.add(item.id || index);
      });
      this._render(state);
    }

    /**
     * Deselect all
     */
    _deselectAll(state) {
      state.selected.clear();
      this._render(state);
    }

    /**
     * Set items
     */
    _setItems(state, items) {
      state.config.items = items;
      this._render(state);
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

  const bael = new BaelList();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$list = (container, options) => bael.create(container, options);
  window.$listView = (container, options) => bael.create(container, options);

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelList = bael;

  console.log("📋 BAEL List loaded");
})();
