/**
 * BAEL Breadcrumb Component - Lord Of All Paths
 *
 * Navigation breadcrumbs:
 * - Path navigation
 * - Separator customization
 * - Collapsible long paths
 * - Dropdown menus
 * - Icons
 * - Click handlers
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // BREADCRUMB CLASS
  // ============================================================

  class BaelBreadcrumb {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-breadcrumb-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-breadcrumb-styles";
      styles.textContent = `
                .bael-breadcrumb {
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 8px;
                    font-family: system-ui, -apple-system, sans-serif;
                    font-size: 14px;
                }

                .bael-breadcrumb-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .bael-breadcrumb-link {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    color: #6b7280;
                    text-decoration: none;
                    padding: 4px 8px;
                    border-radius: 6px;
                    transition: all 0.15s;
                }

                .bael-breadcrumb-link:hover {
                    color: #4f46e5;
                    background: #eef2ff;
                }

                .bael-breadcrumb-link.current {
                    color: #111827;
                    font-weight: 500;
                    pointer-events: none;
                }

                .bael-breadcrumb-link.disabled {
                    color: #d1d5db;
                    pointer-events: none;
                }

                .bael-breadcrumb-icon {
                    width: 16px;
                    height: 16px;
                    flex-shrink: 0;
                }

                .bael-breadcrumb-separator {
                    color: #d1d5db;
                    display: flex;
                    align-items: center;
                }

                /* Collapsed items */
                .bael-breadcrumb-collapsed {
                    position: relative;
                }

                .bael-breadcrumb-collapsed-trigger {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 28px;
                    height: 28px;
                    border: none;
                    background: #f3f4f6;
                    border-radius: 6px;
                    cursor: pointer;
                    color: #6b7280;
                    transition: all 0.15s;
                }

                .bael-breadcrumb-collapsed-trigger:hover {
                    background: #e5e7eb;
                    color: #374151;
                }

                .bael-breadcrumb-dropdown {
                    position: absolute;
                    top: 100%;
                    left: 0;
                    margin-top: 4px;
                    background: white;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    box-shadow: 0 4px 16px rgba(0,0,0,0.1);
                    padding: 4px;
                    min-width: 150px;
                    z-index: 100;
                    display: none;
                }

                .bael-breadcrumb-dropdown.open {
                    display: block;
                    animation: baelBreadcrumbFadeIn 0.15s ease-out;
                }

                @keyframes baelBreadcrumbFadeIn {
                    from { opacity: 0; transform: translateY(-8px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .bael-breadcrumb-dropdown-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 12px;
                    color: #374151;
                    text-decoration: none;
                    border-radius: 4px;
                    transition: background 0.1s;
                    cursor: pointer;
                }

                .bael-breadcrumb-dropdown-item:hover {
                    background: #f3f4f6;
                }

                /* Variants */
                .bael-breadcrumb.pills .bael-breadcrumb-link {
                    background: #f3f4f6;
                    padding: 6px 12px;
                    border-radius: 20px;
                }

                .bael-breadcrumb.pills .bael-breadcrumb-link:hover {
                    background: #e5e7eb;
                }

                .bael-breadcrumb.pills .bael-breadcrumb-link.current {
                    background: #4f46e5;
                    color: white;
                }

                .bael-breadcrumb.compact {
                    font-size: 12px;
                    gap: 4px;
                }

                .bael-breadcrumb.compact .bael-breadcrumb-link {
                    padding: 2px 6px;
                }
            `;
      document.head.appendChild(styles);
    }

    /**
     * Get default separator
     */
    _getDefaultSeparator() {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>`;
    }

    // ============================================================
    // CREATE BREADCRUMB
    // ============================================================

    /**
     * Create a breadcrumb
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Breadcrumb container not found");
        return null;
      }

      const id = `bael-breadcrumb-${++this.idCounter}`;
      const config = {
        items: [], // { label, href?, icon?, disabled?, children? }
        separator: this._getDefaultSeparator(),
        maxItems: 0, // 0 = no collapse
        variant: "default", // default, pills, compact
        onClick: null,
        ...options,
      };

      const el = document.createElement("nav");
      el.className = `bael-breadcrumb${config.variant !== "default" ? " " + config.variant : ""}`;
      el.id = id;
      el.setAttribute("aria-label", "Breadcrumb");

      const state = {
        id,
        element: el,
        container,
        config,
      };

      this._render(state);
      container.appendChild(el);

      this.instances.set(id, state);

      return {
        id,
        setItems: (items) => this.setItems(id, items),
        getItems: () => [...config.items],
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Render breadcrumb
     */
    _render(state) {
      const { element, config } = state;
      const { items, separator, maxItems } = config;

      element.innerHTML = "";

      if (items.length === 0) return;

      // Determine visible items
      let visibleItems = [...items];
      let collapsedItems = [];

      if (maxItems > 0 && items.length > maxItems) {
        // Keep first and last (maxItems - 1)
        const keepEnd = maxItems - 2;
        collapsedItems = items.slice(1, items.length - keepEnd);
        visibleItems = [
          items[0],
          { collapsed: true, items: collapsedItems },
          ...items.slice(items.length - keepEnd),
        ];
      }

      visibleItems.forEach((item, index) => {
        const itemEl = document.createElement("div");
        itemEl.className = "bael-breadcrumb-item";

        if (item.collapsed) {
          // Collapsed dropdown
          const collapsed = document.createElement("div");
          collapsed.className = "bael-breadcrumb-collapsed";

          const trigger = document.createElement("button");
          trigger.className = "bael-breadcrumb-collapsed-trigger";
          trigger.type = "button";
          trigger.innerHTML = "•••";
          trigger.addEventListener("click", (e) => {
            e.stopPropagation();
            dropdown.classList.toggle("open");
          });
          collapsed.appendChild(trigger);

          const dropdown = document.createElement("div");
          dropdown.className = "bael-breadcrumb-dropdown";

          item.items.forEach((collapsedItem) => {
            const dropdownItem = document.createElement("a");
            dropdownItem.className = "bael-breadcrumb-dropdown-item";
            dropdownItem.href = collapsedItem.href || "#";

            if (collapsedItem.icon) {
              const icon = document.createElement("span");
              icon.className = "bael-breadcrumb-icon";
              icon.innerHTML = collapsedItem.icon;
              dropdownItem.appendChild(icon);
            }

            const label = document.createElement("span");
            label.textContent = collapsedItem.label;
            dropdownItem.appendChild(label);

            dropdownItem.addEventListener("click", (e) => {
              if (!collapsedItem.href || collapsedItem.href === "#") {
                e.preventDefault();
              }
              dropdown.classList.remove("open");
              if (config.onClick) {
                config.onClick(collapsedItem);
              }
            });

            dropdown.appendChild(dropdownItem);
          });

          collapsed.appendChild(dropdown);
          itemEl.appendChild(collapsed);

          // Close dropdown on outside click
          document.addEventListener("click", () => {
            dropdown.classList.remove("open");
          });
        } else {
          // Regular item
          const isLast = index === visibleItems.length - 1;
          const link = document.createElement("a");
          link.className = `bael-breadcrumb-link${isLast ? " current" : ""}${item.disabled ? " disabled" : ""}`;
          link.href = item.href || "#";

          if (isLast) {
            link.setAttribute("aria-current", "page");
          }

          if (item.icon) {
            const icon = document.createElement("span");
            icon.className = "bael-breadcrumb-icon";
            icon.innerHTML = item.icon;
            link.appendChild(icon);
          }

          const label = document.createElement("span");
          label.textContent = item.label;
          link.appendChild(label);

          if (!isLast && (!item.href || item.href === "#")) {
            link.addEventListener("click", (e) => {
              e.preventDefault();
              if (config.onClick) {
                config.onClick(item);
              }
            });
          }

          itemEl.appendChild(link);
        }

        // Add separator (except for last item)
        if (index < visibleItems.length - 1) {
          const sep = document.createElement("span");
          sep.className = "bael-breadcrumb-separator";
          sep.innerHTML = separator;
          sep.setAttribute("aria-hidden", "true");
          itemEl.appendChild(sep);
        }

        element.appendChild(itemEl);
      });
    }

    // ============================================================
    // PUBLIC METHODS
    // ============================================================

    /**
     * Set breadcrumb items
     */
    setItems(breadcrumbId, items) {
      const state = this.instances.get(breadcrumbId);
      if (!state) return;

      state.config.items = items;
      this._render(state);
    }

    /**
     * Destroy breadcrumb
     */
    destroy(breadcrumbId) {
      const state = this.instances.get(breadcrumbId);
      if (!state) return;

      state.element.remove();
      this.instances.delete(breadcrumbId);
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelBreadcrumb();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$breadcrumb = (container, options) => bael.create(container, options);

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelBreadcrumb = bael;

  console.log("🍞 BAEL Breadcrumb Component loaded");
})();
