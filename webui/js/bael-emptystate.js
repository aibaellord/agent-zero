/**
 * BAEL Empty State Component - Lord Of All Placeholders
 *
 * Empty state placeholder displays:
 * - Icon illustration
 * - Title and description
 * - Action buttons
 * - Custom graphics
 * - Loading state
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // EMPTY STATE CLASS
  // ============================================================

  class BaelEmptyState {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-emptystate-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-emptystate-styles";
      styles.textContent = `
                .bael-emptystate {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 48px 24px;
                    text-align: center;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }

                .bael-emptystate.fullscreen {
                    min-height: 100vh;
                    padding: 24px;
                }

                .bael-emptystate.compact {
                    padding: 24px 16px;
                }

                /* Illustration */
                .bael-emptystate-icon {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 96px;
                    height: 96px;
                    margin-bottom: 24px;
                    background: rgba(59, 130, 246, 0.1);
                    border-radius: 50%;
                    color: #3b82f6;
                }

                .bael-emptystate-icon svg {
                    width: 48px;
                    height: 48px;
                }

                .bael-emptystate-icon.small {
                    width: 64px;
                    height: 64px;
                    margin-bottom: 16px;
                }

                .bael-emptystate-icon.small svg {
                    width: 32px;
                    height: 32px;
                }

                .bael-emptystate-icon.large {
                    width: 128px;
                    height: 128px;
                    margin-bottom: 32px;
                }

                .bael-emptystate-icon.large svg {
                    width: 64px;
                    height: 64px;
                }

                /* Colors */
                .bael-emptystate-icon.gray { background: rgba(107, 114, 128, 0.1); color: #6b7280; }
                .bael-emptystate-icon.green { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
                .bael-emptystate-icon.purple { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
                .bael-emptystate-icon.orange { background: rgba(249, 115, 22, 0.1); color: #f97316; }
                .bael-emptystate-icon.red { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
                .bael-emptystate-icon.teal { background: rgba(20, 184, 166, 0.1); color: #14b8a6; }

                /* Custom image */
                .bael-emptystate-image {
                    max-width: 200px;
                    max-height: 150px;
                    margin-bottom: 24px;
                    object-fit: contain;
                    opacity: 0.8;
                }

                .bael-emptystate-image.large {
                    max-width: 280px;
                    max-height: 200px;
                }

                /* Content */
                .bael-emptystate-title {
                    font-size: 20px;
                    font-weight: 600;
                    color: #fff;
                    margin-bottom: 8px;
                    line-height: 1.3;
                }

                .bael-emptystate.compact .bael-emptystate-title {
                    font-size: 16px;
                }

                .bael-emptystate-desc {
                    font-size: 14px;
                    color: #888;
                    max-width: 400px;
                    line-height: 1.5;
                    margin-bottom: 24px;
                }

                .bael-emptystate.compact .bael-emptystate-desc {
                    font-size: 13px;
                    margin-bottom: 16px;
                }

                /* Actions */
                .bael-emptystate-actions {
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                    justify-content: center;
                }

                .bael-emptystate-btn {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 10px 20px;
                    font-size: 14px;
                    font-weight: 500;
                    border-radius: 8px;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-family: inherit;
                }

                .bael-emptystate-btn.primary {
                    background: #3b82f6;
                    color: #fff;
                }

                .bael-emptystate-btn.primary:hover {
                    background: #2563eb;
                    transform: translateY(-1px);
                }

                .bael-emptystate-btn.secondary {
                    background: rgba(255,255,255,0.08);
                    color: #ccc;
                }

                .bael-emptystate-btn.secondary:hover {
                    background: rgba(255,255,255,0.12);
                    color: #fff;
                }

                .bael-emptystate-btn svg {
                    width: 16px;
                    height: 16px;
                }

                /* Tips / Features */
                .bael-emptystate-tips {
                    margin-top: 32px;
                    padding-top: 24px;
                    border-top: 1px solid rgba(255,255,255,0.08);
                    max-width: 500px;
                }

                .bael-emptystate-tips-title {
                    font-size: 12px;
                    font-weight: 600;
                    color: #666;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 16px;
                }

                .bael-emptystate-tip {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    text-align: left;
                    margin-bottom: 12px;
                }

                .bael-emptystate-tip:last-child {
                    margin-bottom: 0;
                }

                .bael-emptystate-tip-icon {
                    flex-shrink: 0;
                    width: 20px;
                    height: 20px;
                    color: #3b82f6;
                }

                .bael-emptystate-tip-text {
                    font-size: 13px;
                    color: #888;
                    line-height: 1.4;
                }

                /* Animated illustration */
                .bael-emptystate-icon.animated {
                    animation: bael-empty-float 3s ease-in-out infinite;
                }

                @keyframes bael-empty-float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }

                /* Bordered variant */
                .bael-emptystate.bordered {
                    border: 2px dashed rgba(255,255,255,0.1);
                    border-radius: 16px;
                    background: rgba(255,255,255,0.01);
                }

                /* Error state */
                .bael-emptystate.error .bael-emptystate-icon {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                }

                .bael-emptystate.error .bael-emptystate-title {
                    color: #ef4444;
                }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // PRESET ICONS
    // ============================================================

    _icons = {
      empty:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>',
      search:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>',
      noResults:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>',
      error:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      noData:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>',
      folder:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>',
      upload:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
      lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>',
      offline:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0119 12.55"/><path d="M5 12.55a10.94 10.94 0 015.17-2.39"/><path d="M10.71 5.05A16 16 0 0122.58 9"/><path d="M1.42 9a15.91 15.91 0 014.7-2.88"/><path d="M8.53 16.11a6 6 0 016.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>',
      calendar:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
      notification:
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>',
    };

    _checkIcon =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';

    // ============================================================
    // CREATE EMPTY STATE
    // ============================================================

    /**
     * Create empty state
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Empty state container not found");
        return null;
      }

      const id = `bael-emptystate-${++this.idCounter}`;
      const config = {
        icon: "empty", // Icon name or custom SVG
        iconColor: "blue", // blue, gray, green, purple, orange, red, teal
        iconSize: "default", // small, default, large
        animated: false, // Float animation
        image: null, // Custom image URL
        imageSize: "default", // default, large
        title: "No items found",
        description: "",
        actions: [], // [{ label, icon?, primary?, onClick }]
        tips: null, // { title, items: [{ icon?, text }] }
        size: "default", // compact, default, fullscreen
        bordered: false,
        error: false,
        ...options,
      };

      const el = document.createElement("div");
      el.className = "bael-emptystate";
      if (config.size !== "default") el.classList.add(config.size);
      if (config.bordered) el.classList.add("bordered");
      if (config.error) el.classList.add("error");
      el.id = id;

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
        update: (opts) => this._update(state, opts),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Render empty state
     */
    _render(state) {
      const { element, config } = state;
      element.innerHTML = "";

      // Image or Icon
      if (config.image) {
        const img = document.createElement("img");
        img.className = `bael-emptystate-image ${config.imageSize}`;
        img.src = config.image;
        img.alt = "";
        element.appendChild(img);
      } else if (config.icon) {
        const iconWrap = document.createElement("div");
        iconWrap.className = `bael-emptystate-icon ${config.iconColor} ${config.iconSize}`;
        if (config.animated) iconWrap.classList.add("animated");

        const iconSvg = this._icons[config.icon] || config.icon;
        iconWrap.innerHTML = iconSvg;
        element.appendChild(iconWrap);
      }

      // Title
      if (config.title) {
        const title = document.createElement("h3");
        title.className = "bael-emptystate-title";
        title.textContent = config.title;
        element.appendChild(title);
      }

      // Description
      if (config.description) {
        const desc = document.createElement("p");
        desc.className = "bael-emptystate-desc";
        desc.textContent = config.description;
        element.appendChild(desc);
      }

      // Actions
      if (config.actions && config.actions.length > 0) {
        const actions = document.createElement("div");
        actions.className = "bael-emptystate-actions";

        config.actions.forEach((action) => {
          const btn = document.createElement("button");
          btn.className = `bael-emptystate-btn ${action.primary ? "primary" : "secondary"}`;

          if (action.icon) {
            const iconSpan = document.createElement("span");
            iconSpan.innerHTML = action.icon;
            btn.appendChild(iconSpan);
          }

          btn.appendChild(document.createTextNode(action.label));

          if (action.onClick) {
            btn.addEventListener("click", action.onClick);
          }

          actions.appendChild(btn);
        });

        element.appendChild(actions);
      }

      // Tips
      if (config.tips) {
        const tips = document.createElement("div");
        tips.className = "bael-emptystate-tips";

        if (config.tips.title) {
          const tipsTitle = document.createElement("div");
          tipsTitle.className = "bael-emptystate-tips-title";
          tipsTitle.textContent = config.tips.title;
          tips.appendChild(tipsTitle);
        }

        config.tips.items.forEach((tip) => {
          const tipEl = document.createElement("div");
          tipEl.className = "bael-emptystate-tip";

          const tipIcon = document.createElement("span");
          tipIcon.className = "bael-emptystate-tip-icon";
          tipIcon.innerHTML = tip.icon || this._checkIcon;
          tipEl.appendChild(tipIcon);

          const tipText = document.createElement("span");
          tipText.className = "bael-emptystate-tip-text";
          tipText.textContent = tip.text;
          tipEl.appendChild(tipText);

          tips.appendChild(tipEl);
        });

        element.appendChild(tips);
      }
    }

    /**
     * Update empty state
     */
    _update(state, options) {
      Object.assign(state.config, options);
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

  const bael = new BaelEmptyState();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$emptyState = (container, options) => bael.create(container, options);
  window.$placeholder = (container, options) => bael.create(container, options);
  window.$noData = (container, options) => bael.create(container, options);

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelEmptyState = bael;

  console.log("📭 BAEL Empty State loaded");
})();
