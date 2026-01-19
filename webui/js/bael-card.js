/**
 * BAEL Card Component - Lord Of All Cards
 *
 * Versatile card component with:
 * - Headers and footers
 * - Media sections
 * - Actions
 * - Multiple variants
 * - Hover effects
 * - Collapsible
 * - Loading states
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // CARD CLASS
  // ============================================================

  class BaelCard {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-card-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-card-styles";
      styles.textContent = `
                .bael-card {
                    --card-bg: white;
                    --card-border: #e5e7eb;
                    --card-radius: 12px;
                    --card-shadow: 0 1px 3px rgba(0,0,0,0.1);
                    --card-padding: 16px;

                    background: var(--card-bg);
                    border: 1px solid var(--card-border);
                    border-radius: var(--card-radius);
                    box-shadow: var(--card-shadow);
                    overflow: hidden;
                }

                /* Header */
                .bael-card-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: var(--card-padding);
                    border-bottom: 1px solid var(--card-border);
                }

                .bael-card-header-content {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .bael-card-title {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: #1f2937;
                    margin: 0;
                }

                .bael-card-subtitle {
                    font-size: 0.875rem;
                    color: #6b7280;
                    margin: 0;
                }

                .bael-card-actions {
                    display: flex;
                    gap: 8px;
                }

                /* Media */
                .bael-card-media {
                    position: relative;
                    overflow: hidden;
                }

                .bael-card-media img,
                .bael-card-media video {
                    width: 100%;
                    height: auto;
                    display: block;
                }

                .bael-card-media-overlay {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(transparent, rgba(0,0,0,0.6));
                    display: flex;
                    align-items: flex-end;
                    padding: var(--card-padding);
                    color: white;
                }

                /* Body */
                .bael-card-body {
                    padding: var(--card-padding);
                }

                .bael-card-text {
                    color: #4b5563;
                    line-height: 1.6;
                }

                /* Footer */
                .bael-card-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: var(--card-padding);
                    border-top: 1px solid var(--card-border);
                    background: #f9fafb;
                }

                /* Variants */
                .bael-card-flat {
                    --card-shadow: none;
                }

                .bael-card-elevated {
                    --card-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
                }

                .bael-card-bordered {
                    --card-shadow: none;
                    border-width: 2px;
                }

                /* Colors */
                .bael-card-primary { border-left: 4px solid #4f46e5; }
                .bael-card-success { border-left: 4px solid #10b981; }
                .bael-card-warning { border-left: 4px solid #f59e0b; }
                .bael-card-danger { border-left: 4px solid #ef4444; }
                .bael-card-info { border-left: 4px solid #06b6d4; }

                /* Hover */
                .bael-card-hoverable {
                    transition: transform 0.2s, box-shadow 0.2s;
                    cursor: pointer;
                }

                .bael-card-hoverable:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1);
                }

                /* Sizes */
                .bael-card-sm { --card-padding: 12px; --card-radius: 8px; }
                .bael-card-md { --card-padding: 16px; --card-radius: 12px; }
                .bael-card-lg { --card-padding: 24px; --card-radius: 16px; }

                /* Collapsible */
                .bael-card-collapsible .bael-card-header {
                    cursor: pointer;
                }

                .bael-card-collapse-icon {
                    transition: transform 0.2s;
                }

                .bael-card-collapsed .bael-card-collapse-icon {
                    transform: rotate(-90deg);
                }

                .bael-card-collapsed .bael-card-body,
                .bael-card-collapsed .bael-card-footer {
                    display: none;
                }

                /* Loading */
                .bael-card-loading {
                    position: relative;
                    pointer-events: none;
                }

                .bael-card-loading::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: rgba(255,255,255,0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .bael-card-loading-spinner {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 32px;
                    height: 32px;
                    border: 3px solid #e5e7eb;
                    border-top-color: #4f46e5;
                    border-radius: 50%;
                    animation: bael-card-spin 0.8s linear infinite;
                    z-index: 1;
                }

                @keyframes bael-card-spin {
                    to { transform: translate(-50%, -50%) rotate(360deg); }
                }

                /* Horizontal card */
                .bael-card-horizontal {
                    display: flex;
                    flex-direction: row;
                }

                .bael-card-horizontal .bael-card-media {
                    width: 40%;
                    flex-shrink: 0;
                }

                .bael-card-horizontal .bael-card-media img {
                    height: 100%;
                    object-fit: cover;
                }

                .bael-card-horizontal .bael-card-content {
                    display: flex;
                    flex-direction: column;
                    flex: 1;
                }

                /* Dark mode */
                .bael-card-dark {
                    --card-bg: #1f2937;
                    --card-border: #374151;
                    color: white;
                }

                .bael-card-dark .bael-card-title { color: white; }
                .bael-card-dark .bael-card-subtitle { color: #9ca3af; }
                .bael-card-dark .bael-card-text { color: #d1d5db; }
                .bael-card-dark .bael-card-footer { background: #111827; }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // CREATE CARD
    // ============================================================

    /**
     * Create a card
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Card container not found");
        return null;
      }

      const id = `bael-card-${++this.idCounter}`;
      const config = {
        // Header
        title: "",
        subtitle: "",
        headerActions: null,

        // Media
        image: null,
        imageAlt: "",
        video: null,
        mediaOverlay: null,

        // Body
        content: "",

        // Footer
        footer: null,
        footerActions: null,

        // Options
        variant: "default",
        color: null,
        size: "md",
        horizontal: false,
        hoverable: false,
        collapsible: false,
        collapsed: false,
        loading: false,
        dark: false,
        customClass: "",

        onClick: null,
        onCollapse: null,
        ...options,
      };

      // Create card
      const card = document.createElement("div");
      card.id = id;
      card.className = this._buildClassName(config);

      // Content wrapper for horizontal layout
      const contentWrapper = config.horizontal
        ? document.createElement("div")
        : card;
      if (config.horizontal) {
        contentWrapper.className = "bael-card-content";
      }

      // Header
      if (config.title || config.subtitle || config.headerActions) {
        const header = this._createHeader(config);
        contentWrapper.appendChild(header);
      }

      // Media (before content wrapper for horizontal)
      if (config.image || config.video) {
        const media = this._createMedia(config);
        if (config.horizontal) {
          card.appendChild(media);
        } else {
          // Insert before header if exists, otherwise as first child
          if (contentWrapper.firstChild) {
            contentWrapper.insertBefore(media, contentWrapper.firstChild);
          } else {
            contentWrapper.appendChild(media);
          }
        }
      }

      // Body
      if (config.content) {
        const body = this._createBody(config);
        contentWrapper.appendChild(body);
      }

      // Footer
      if (config.footer || config.footerActions) {
        const footer = this._createFooter(config);
        contentWrapper.appendChild(footer);
      }

      // Append content wrapper
      if (config.horizontal) {
        card.appendChild(contentWrapper);
      }

      // Loading overlay
      if (config.loading) {
        const spinner = document.createElement("div");
        spinner.className = "bael-card-loading-spinner";
        card.appendChild(spinner);
      }

      // Click handler
      if (config.onClick) {
        card.onclick = config.onClick;
      }

      // Collapsible setup
      if (config.collapsible) {
        this._setupCollapsible(card, config);
      }

      container.appendChild(card);

      const state = { id, card, config };
      this.instances.set(id, state);

      return {
        id,
        element: card,
        setTitle: (title) => this.setTitle(id, title),
        setContent: (content) => this.setContent(id, content),
        setLoading: (loading) => this.setLoading(id, loading),
        toggle: () => this.toggle(id),
        expand: () => this.expand(id),
        collapse: () => this.collapse(id),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Build class name
     */
    _buildClassName(config) {
      const classes = ["bael-card"];

      if (config.variant !== "default") {
        classes.push(`bael-card-${config.variant}`);
      }

      classes.push(`bael-card-${config.size}`);

      if (config.color) classes.push(`bael-card-${config.color}`);
      if (config.hoverable) classes.push("bael-card-hoverable");
      if (config.horizontal) classes.push("bael-card-horizontal");
      if (config.collapsible) classes.push("bael-card-collapsible");
      if (config.collapsed) classes.push("bael-card-collapsed");
      if (config.loading) classes.push("bael-card-loading");
      if (config.dark) classes.push("bael-card-dark");
      if (config.customClass) classes.push(config.customClass);

      return classes.join(" ");
    }

    /**
     * Create header
     */
    _createHeader(config) {
      const header = document.createElement("div");
      header.className = "bael-card-header";

      const content = document.createElement("div");
      content.className = "bael-card-header-content";

      if (config.title) {
        const title = document.createElement("h3");
        title.className = "bael-card-title";
        title.textContent = config.title;
        content.appendChild(title);
      }

      if (config.subtitle) {
        const subtitle = document.createElement("p");
        subtitle.className = "bael-card-subtitle";
        subtitle.textContent = config.subtitle;
        content.appendChild(subtitle);
      }

      header.appendChild(content);

      // Actions
      if (config.headerActions || config.collapsible) {
        const actions = document.createElement("div");
        actions.className = "bael-card-actions";

        if (config.headerActions instanceof Element) {
          actions.appendChild(config.headerActions);
        } else if (config.headerActions) {
          actions.innerHTML = config.headerActions;
        }

        if (config.collapsible) {
          const collapseIcon = document.createElement("span");
          collapseIcon.className = "bael-card-collapse-icon";
          collapseIcon.innerHTML = "▼";
          actions.appendChild(collapseIcon);
        }

        header.appendChild(actions);
      }

      return header;
    }

    /**
     * Create media section
     */
    _createMedia(config) {
      const media = document.createElement("div");
      media.className = "bael-card-media";

      if (config.image) {
        const img = document.createElement("img");
        img.src = config.image;
        img.alt = config.imageAlt || config.title || "";
        media.appendChild(img);
      } else if (config.video) {
        const video = document.createElement("video");
        video.src = config.video;
        video.controls = true;
        media.appendChild(video);
      }

      if (config.mediaOverlay) {
        const overlay = document.createElement("div");
        overlay.className = "bael-card-media-overlay";

        if (config.mediaOverlay instanceof Element) {
          overlay.appendChild(config.mediaOverlay);
        } else {
          overlay.innerHTML = config.mediaOverlay;
        }

        media.appendChild(overlay);
      }

      return media;
    }

    /**
     * Create body
     */
    _createBody(config) {
      const body = document.createElement("div");
      body.className = "bael-card-body";

      if (config.content instanceof Element) {
        body.appendChild(config.content);
      } else {
        const text = document.createElement("p");
        text.className = "bael-card-text";
        text.innerHTML = config.content;
        body.appendChild(text);
      }

      return body;
    }

    /**
     * Create footer
     */
    _createFooter(config) {
      const footer = document.createElement("div");
      footer.className = "bael-card-footer";

      if (config.footer instanceof Element) {
        footer.appendChild(config.footer);
      } else if (config.footer) {
        const footerText = document.createElement("span");
        footerText.innerHTML = config.footer;
        footer.appendChild(footerText);
      }

      if (config.footerActions) {
        const actions = document.createElement("div");
        actions.className = "bael-card-actions";

        if (config.footerActions instanceof Element) {
          actions.appendChild(config.footerActions);
        } else {
          actions.innerHTML = config.footerActions;
        }

        footer.appendChild(actions);
      }

      return footer;
    }

    /**
     * Setup collapsible
     */
    _setupCollapsible(card, config) {
      const header = card.querySelector(".bael-card-header");
      if (!header) return;

      header.addEventListener("click", () => {
        this.toggle(card.id);
      });
    }

    // ============================================================
    // COLLAPSIBLE
    // ============================================================

    /**
     * Toggle collapse
     */
    toggle(cardId) {
      const state = this.instances.get(cardId);
      if (!state) return;

      if (state.card.classList.contains("bael-card-collapsed")) {
        this.expand(cardId);
      } else {
        this.collapse(cardId);
      }
    }

    /**
     * Expand card
     */
    expand(cardId) {
      const state = this.instances.get(cardId);
      if (!state) return;

      state.card.classList.remove("bael-card-collapsed");
      state.config.collapsed = false;

      if (state.config.onCollapse) {
        state.config.onCollapse(false);
      }
    }

    /**
     * Collapse card
     */
    collapse(cardId) {
      const state = this.instances.get(cardId);
      if (!state) return;

      state.card.classList.add("bael-card-collapsed");
      state.config.collapsed = true;

      if (state.config.onCollapse) {
        state.config.onCollapse(true);
      }
    }

    // ============================================================
    // UPDATES
    // ============================================================

    /**
     * Set title
     */
    setTitle(cardId, title) {
      const state = this.instances.get(cardId);
      if (!state) return;

      const titleEl = state.card.querySelector(".bael-card-title");
      if (titleEl) {
        titleEl.textContent = title;
      }

      state.config.title = title;
    }

    /**
     * Set content
     */
    setContent(cardId, content) {
      const state = this.instances.get(cardId);
      if (!state) return;

      const textEl = state.card.querySelector(".bael-card-text");
      if (textEl) {
        if (content instanceof Element) {
          textEl.innerHTML = "";
          textEl.appendChild(content);
        } else {
          textEl.innerHTML = content;
        }
      }

      state.config.content = content;
    }

    /**
     * Set loading state
     */
    setLoading(cardId, loading) {
      const state = this.instances.get(cardId);
      if (!state) return;

      if (loading) {
        state.card.classList.add("bael-card-loading");

        if (!state.card.querySelector(".bael-card-loading-spinner")) {
          const spinner = document.createElement("div");
          spinner.className = "bael-card-loading-spinner";
          state.card.appendChild(spinner);
        }
      } else {
        state.card.classList.remove("bael-card-loading");

        const spinner = state.card.querySelector(".bael-card-loading-spinner");
        if (spinner) spinner.remove();
      }

      state.config.loading = loading;
    }

    // ============================================================
    // DESTROY
    // ============================================================

    /**
     * Destroy card
     */
    destroy(cardId) {
      const state = this.instances.get(cardId);
      if (!state) return;

      state.card.remove();
      this.instances.delete(cardId);
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelCard();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$card = (container, options) => bael.create(container, options);

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelCard = bael;

  console.log("🃏 BAEL Card Component loaded");
})();
