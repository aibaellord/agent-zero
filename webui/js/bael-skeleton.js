/**
 * BAEL Skeleton Component - Lord Of All Placeholders
 *
 * Loading skeleton placeholders with:
 * - Multiple shapes (text, circle, rect)
 * - Animation (pulse, wave)
 * - Configurable sizes
 * - Composition helpers
 * - Avatar skeleton
 * - Card skeleton
 * - List skeleton
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // SKELETON CLASS
  // ============================================================

  class BaelSkeleton {
    constructor() {
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-skeleton-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-skeleton-styles";
      styles.textContent = `
                .bael-skeleton {
                    background: #e5e7eb;
                    border-radius: 4px;
                    display: inline-block;
                }

                /* Animations */
                .bael-skeleton.pulse {
                    animation: bael-skeleton-pulse 1.5s ease-in-out infinite;
                }

                @keyframes bael-skeleton-pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }

                .bael-skeleton.wave {
                    position: relative;
                    overflow: hidden;
                }

                .bael-skeleton.wave::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    transform: translateX(-100%);
                    background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(255,255,255,0.4),
                        transparent
                    );
                    animation: bael-skeleton-wave 1.5s ease-in-out infinite;
                }

                @keyframes bael-skeleton-wave {
                    100% { transform: translateX(100%); }
                }

                /* Shapes */
                .bael-skeleton.circle {
                    border-radius: 50%;
                }

                .bael-skeleton.rounded {
                    border-radius: 8px;
                }

                .bael-skeleton.pill {
                    border-radius: 9999px;
                }

                /* Text lines */
                .bael-skeleton.text {
                    height: 1em;
                    width: 100%;
                    margin-bottom: 0.5em;
                }

                .bael-skeleton.text:last-child {
                    margin-bottom: 0;
                }

                /* Composites */
                .bael-skeleton-group {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .bael-skeleton-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .bael-skeleton-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                /* Avatar composite */
                .bael-skeleton-avatar {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .bael-skeleton-avatar-circle {
                    flex-shrink: 0;
                }

                .bael-skeleton-avatar-lines {
                    flex: 1;
                }

                /* Card composite */
                .bael-skeleton-card {
                    border: 1px solid #e5e7eb;
                    border-radius: 12px;
                    overflow: hidden;
                }

                .bael-skeleton-card-image {
                    width: 100%;
                }

                .bael-skeleton-card-body {
                    padding: 16px;
                }

                /* Table composite */
                .bael-skeleton-table {
                    width: 100%;
                }

                .bael-skeleton-table-row {
                    display: flex;
                    gap: 16px;
                    padding: 12px 0;
                    border-bottom: 1px solid #e5e7eb;
                }

                .bael-skeleton-table-cell {
                    flex: 1;
                }

                /* List composite */
                .bael-skeleton-list {
                    display: flex;
                    flex-direction: column;
                }

                .bael-skeleton-list-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 0;
                    border-bottom: 1px solid #f3f4f6;
                }

                .bael-skeleton-list-item:last-child {
                    border-bottom: none;
                }

                /* Dark mode */
                .bael-skeleton.dark {
                    background: #374151;
                }

                .bael-skeleton.dark.wave::after {
                    background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(255,255,255,0.1),
                        transparent
                    );
                }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // CREATE SKELETONS
    // ============================================================

    /**
     * Create a basic skeleton
     */
    create(options = {}) {
      const config = {
        width: "100%",
        height: "20px",
        shape: "rect", // rect, circle, rounded, pill
        animation: "pulse", // pulse, wave, none
        dark: false,
        className: "",
        ...options,
      };

      const skeleton = document.createElement("div");
      skeleton.className = `bael-skeleton ${config.shape} ${config.animation}`;
      if (config.dark) skeleton.classList.add("dark");
      if (config.className) skeleton.classList.add(config.className);

      if (typeof config.width === "number") {
        skeleton.style.width = config.width + "px";
      } else {
        skeleton.style.width = config.width;
      }

      if (typeof config.height === "number") {
        skeleton.style.height = config.height + "px";
      } else {
        skeleton.style.height = config.height;
      }

      return skeleton;
    }

    /**
     * Create text lines skeleton
     */
    text(options = {}) {
      const config = {
        lines: 3,
        widths: null, // array of widths or null for random
        gap: "8px",
        animation: "pulse",
        dark: false,
        ...options,
      };

      const container = document.createElement("div");
      container.style.display = "flex";
      container.style.flexDirection = "column";
      container.style.gap = config.gap;

      for (let i = 0; i < config.lines; i++) {
        let width;
        if (config.widths && config.widths[i]) {
          width = config.widths[i];
        } else {
          // Random width for last line
          width =
            i === config.lines - 1 ? 60 + Math.random() * 20 + "%" : "100%";
        }

        const line = this.create({
          width,
          height: "1em",
          animation: config.animation,
          dark: config.dark,
        });
        line.classList.add("text");
        container.appendChild(line);
      }

      return container;
    }

    /**
     * Create circle skeleton (avatar-like)
     */
    circle(options = {}) {
      const config = {
        size: 48,
        animation: "pulse",
        dark: false,
        ...options,
      };

      return this.create({
        width: config.size,
        height: config.size,
        shape: "circle",
        animation: config.animation,
        dark: config.dark,
      });
    }

    /**
     * Create avatar with text skeleton
     */
    avatar(options = {}) {
      const config = {
        size: 48,
        lines: 2,
        animation: "pulse",
        dark: false,
        ...options,
      };

      const container = document.createElement("div");
      container.className = "bael-skeleton-avatar";

      // Avatar circle
      const circle = this.circle({
        size: config.size,
        animation: config.animation,
        dark: config.dark,
      });
      circle.classList.add("bael-skeleton-avatar-circle");
      container.appendChild(circle);

      // Text lines
      const lines = document.createElement("div");
      lines.className = "bael-skeleton-avatar-lines";

      const widths = config.lines === 2 ? ["60%", "40%"] : null;
      const text = this.text({
        lines: config.lines,
        widths,
        animation: config.animation,
        dark: config.dark,
      });
      lines.appendChild(text);
      container.appendChild(lines);

      return container;
    }

    /**
     * Create card skeleton
     */
    card(options = {}) {
      const config = {
        imageHeight: 180,
        showImage: true,
        titleLines: 1,
        bodyLines: 3,
        showFooter: false,
        animation: "pulse",
        dark: false,
        ...options,
      };

      const container = document.createElement("div");
      container.className = "bael-skeleton-card";

      // Image
      if (config.showImage) {
        const image = this.create({
          width: "100%",
          height: config.imageHeight,
          shape: "rect",
          animation: config.animation,
          dark: config.dark,
        });
        image.classList.add("bael-skeleton-card-image");
        container.appendChild(image);
      }

      // Body
      const body = document.createElement("div");
      body.className = "bael-skeleton-card-body";

      // Title
      if (config.titleLines > 0) {
        const title = this.text({
          lines: config.titleLines,
          widths: ["70%"],
          animation: config.animation,
          dark: config.dark,
        });
        title.style.marginBottom = "12px";
        body.appendChild(title);
      }

      // Body text
      const text = this.text({
        lines: config.bodyLines,
        animation: config.animation,
        dark: config.dark,
      });
      body.appendChild(text);

      // Footer
      if (config.showFooter) {
        const footer = document.createElement("div");
        footer.style.display = "flex";
        footer.style.gap = "8px";
        footer.style.marginTop = "16px";

        footer.appendChild(
          this.create({
            width: 80,
            height: 32,
            shape: "rounded",
            animation: config.animation,
            dark: config.dark,
          }),
        );

        footer.appendChild(
          this.create({
            width: 80,
            height: 32,
            shape: "rounded",
            animation: config.animation,
            dark: config.dark,
          }),
        );

        body.appendChild(footer);
      }

      container.appendChild(body);

      return container;
    }

    /**
     * Create list skeleton
     */
    list(options = {}) {
      const config = {
        items: 5,
        showAvatar: true,
        avatarSize: 40,
        lines: 2,
        animation: "pulse",
        dark: false,
        ...options,
      };

      const container = document.createElement("div");
      container.className = "bael-skeleton-list";

      for (let i = 0; i < config.items; i++) {
        const item = document.createElement("div");
        item.className = "bael-skeleton-list-item";

        if (config.showAvatar) {
          const avatar = this.circle({
            size: config.avatarSize,
            animation: config.animation,
            dark: config.dark,
          });
          item.appendChild(avatar);
        }

        const content = document.createElement("div");
        content.className = "bael-skeleton-content";

        const widths = config.lines === 2 ? ["80%", "50%"] : null;
        const text = this.text({
          lines: config.lines,
          widths,
          gap: "6px",
          animation: config.animation,
          dark: config.dark,
        });
        content.appendChild(text);
        item.appendChild(content);

        container.appendChild(item);
      }

      return container;
    }

    /**
     * Create table skeleton
     */
    table(options = {}) {
      const config = {
        rows: 5,
        columns: 4,
        showHeader: true,
        animation: "pulse",
        dark: false,
        ...options,
      };

      const container = document.createElement("div");
      container.className = "bael-skeleton-table";

      // Header
      if (config.showHeader) {
        const header = document.createElement("div");
        header.className = "bael-skeleton-table-row";
        header.style.borderBottomWidth = "2px";

        for (let i = 0; i < config.columns; i++) {
          const cell = this.create({
            width: "100%",
            height: 20,
            animation: config.animation,
            dark: config.dark,
          });
          cell.classList.add("bael-skeleton-table-cell");
          header.appendChild(cell);
        }

        container.appendChild(header);
      }

      // Rows
      for (let i = 0; i < config.rows; i++) {
        const row = document.createElement("div");
        row.className = "bael-skeleton-table-row";

        for (let j = 0; j < config.columns; j++) {
          const width = j === 0 ? "80%" : 50 + Math.random() * 40 + "%";
          const cell = this.create({
            width,
            height: 16,
            animation: config.animation,
            dark: config.dark,
          });
          cell.classList.add("bael-skeleton-table-cell");
          row.appendChild(cell);
        }

        container.appendChild(row);
      }

      return container;
    }

    /**
     * Create paragraph skeleton
     */
    paragraph(options = {}) {
      return this.text({
        lines: 4,
        widths: ["100%", "100%", "100%", "75%"],
        ...options,
      });
    }

    /**
     * Create button skeleton
     */
    button(options = {}) {
      const config = {
        width: 100,
        height: 38,
        ...options,
      };

      return this.create({
        width: config.width,
        height: config.height,
        shape: "rounded",
        ...options,
      });
    }

    /**
     * Create image skeleton
     */
    image(options = {}) {
      const config = {
        width: "100%",
        height: 200,
        ...options,
      };

      return this.create({
        width: config.width,
        height: config.height,
        shape: "rounded",
        ...options,
      });
    }

    // ============================================================
    // RENDER HELPERS
    // ============================================================

    /**
     * Render skeleton into container
     */
    render(container, skeleton) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Skeleton container not found");
        return;
      }

      container.appendChild(skeleton);
      return skeleton;
    }

    /**
     * Replace content with skeleton
     */
    replace(container, skeleton) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Skeleton container not found");
        return;
      }

      container.innerHTML = "";
      container.appendChild(skeleton);
      return skeleton;
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelSkeleton();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$skeleton = (options) => bael.create(options);
  window.$skeleton.text = (options) => bael.text(options);
  window.$skeleton.circle = (options) => bael.circle(options);
  window.$skeleton.avatar = (options) => bael.avatar(options);
  window.$skeleton.card = (options) => bael.card(options);
  window.$skeleton.list = (options) => bael.list(options);
  window.$skeleton.table = (options) => bael.table(options);
  window.$skeleton.paragraph = (options) => bael.paragraph(options);
  window.$skeleton.button = (options) => bael.button(options);
  window.$skeleton.image = (options) => bael.image(options);
  window.$skeleton.render = (container, skeleton) =>
    bael.render(container, skeleton);
  window.$skeleton.replace = (container, skeleton) =>
    bael.replace(container, skeleton);

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelSkeleton = bael;

  console.log("💀 BAEL Skeleton Component loaded");
})();
