/**
 * BAEL Typography Component - Lord Of All Text
 *
 * Text styling and typography utilities:
 * - Heading levels
 * - Text styles (lead, muted, etc.)
 * - Text decoration
 * - Truncation
 * - Gradient text
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // TYPOGRAPHY CLASS
  // ============================================================

  class BaelTypography {
    constructor() {
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-typography-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-typography-styles";
      styles.textContent = `
                /* Base reset */
                .bael-text, .bael-heading {
                    margin: 0;
                    padding: 0;
                }

                /* Headings */
                .bael-h1 {
                    font-size: 2.5rem;
                    font-weight: 700;
                    line-height: 1.2;
                    letter-spacing: -0.02em;
                }

                .bael-h2 {
                    font-size: 2rem;
                    font-weight: 600;
                    line-height: 1.25;
                    letter-spacing: -0.015em;
                }

                .bael-h3 {
                    font-size: 1.5rem;
                    font-weight: 600;
                    line-height: 1.3;
                    letter-spacing: -0.01em;
                }

                .bael-h4 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    line-height: 1.35;
                }

                .bael-h5 {
                    font-size: 1.125rem;
                    font-weight: 600;
                    line-height: 1.4;
                }

                .bael-h6 {
                    font-size: 1rem;
                    font-weight: 600;
                    line-height: 1.5;
                }

                /* Display headings (larger) */
                .bael-display-1 {
                    font-size: 5rem;
                    font-weight: 800;
                    line-height: 1.1;
                    letter-spacing: -0.03em;
                }

                .bael-display-2 {
                    font-size: 4rem;
                    font-weight: 800;
                    line-height: 1.15;
                    letter-spacing: -0.025em;
                }

                .bael-display-3 {
                    font-size: 3rem;
                    font-weight: 700;
                    line-height: 1.2;
                    letter-spacing: -0.02em;
                }

                /* Text sizes */
                .bael-text-xs { font-size: 0.75rem; }
                .bael-text-sm { font-size: 0.875rem; }
                .bael-text-base { font-size: 1rem; }
                .bael-text-lg { font-size: 1.125rem; }
                .bael-text-xl { font-size: 1.25rem; }
                .bael-text-2xl { font-size: 1.5rem; }
                .bael-text-3xl { font-size: 2rem; }

                /* Font weights */
                .bael-font-light { font-weight: 300; }
                .bael-font-normal { font-weight: 400; }
                .bael-font-medium { font-weight: 500; }
                .bael-font-semibold { font-weight: 600; }
                .bael-font-bold { font-weight: 700; }
                .bael-font-extrabold { font-weight: 800; }

                /* Text styles */
                .bael-text-lead {
                    font-size: 1.25rem;
                    font-weight: 300;
                    line-height: 1.6;
                    color: var(--text-secondary, #666);
                }

                .bael-text-muted {
                    color: var(--text-muted, #888) !important;
                }

                .bael-text-subtle {
                    color: var(--text-subtle, #999) !important;
                    font-size: 0.875rem;
                }

                .bael-text-caption {
                    font-size: 0.75rem;
                    color: var(--text-muted, #888);
                    line-height: 1.4;
                }

                .bael-text-overline {
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    color: var(--text-muted, #888);
                }

                /* Text colors */
                .bael-text-primary { color: var(--primary, #6a9fe2) !important; }
                .bael-text-success { color: var(--success, #4caf50) !important; }
                .bael-text-warning { color: var(--warning, #ff9800) !important; }
                .bael-text-error { color: var(--error, #f44336) !important; }
                .bael-text-info { color: var(--info, #2196f3) !important; }

                /* Text alignment */
                .bael-text-left { text-align: left; }
                .bael-text-center { text-align: center; }
                .bael-text-right { text-align: right; }
                .bael-text-justify { text-align: justify; }

                /* Text decoration */
                .bael-text-underline { text-decoration: underline; }
                .bael-text-line-through { text-decoration: line-through; }
                .bael-text-no-underline { text-decoration: none; }

                /* Text transform */
                .bael-text-uppercase { text-transform: uppercase; }
                .bael-text-lowercase { text-transform: lowercase; }
                .bael-text-capitalize { text-transform: capitalize; }

                /* Line clamp / truncation */
                .bael-truncate {
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .bael-line-clamp-1 {
                    display: -webkit-box;
                    -webkit-line-clamp: 1;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .bael-line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .bael-line-clamp-3 {
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .bael-line-clamp-4 {
                    display: -webkit-box;
                    -webkit-line-clamp: 4;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                /* Gradient text */
                .bael-text-gradient {
                    background: linear-gradient(135deg, var(--primary, #6a9fe2), var(--secondary, #9c6ae2));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .bael-text-gradient-gold {
                    background: linear-gradient(135deg, #ffd700, #ffb347, #ffd700);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                .bael-text-gradient-rainbow {
                    background: linear-gradient(90deg, #ff6b6b, #ffd93d, #6bcb77, #4d96ff, #9c6ae2);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                /* Line heights */
                .bael-leading-none { line-height: 1; }
                .bael-leading-tight { line-height: 1.25; }
                .bael-leading-snug { line-height: 1.375; }
                .bael-leading-normal { line-height: 1.5; }
                .bael-leading-relaxed { line-height: 1.625; }
                .bael-leading-loose { line-height: 2; }

                /* Letter spacing */
                .bael-tracking-tight { letter-spacing: -0.025em; }
                .bael-tracking-normal { letter-spacing: 0; }
                .bael-tracking-wide { letter-spacing: 0.025em; }
                .bael-tracking-wider { letter-spacing: 0.05em; }
                .bael-tracking-widest { letter-spacing: 0.1em; }

                /* White space */
                .bael-whitespace-nowrap { white-space: nowrap; }
                .bael-whitespace-pre { white-space: pre; }
                .bael-whitespace-pre-line { white-space: pre-line; }
                .bael-whitespace-pre-wrap { white-space: pre-wrap; }

                /* Word break */
                .bael-break-normal { word-break: normal; overflow-wrap: normal; }
                .bael-break-words { overflow-wrap: break-word; }
                .bael-break-all { word-break: break-all; }

                /* Lists */
                .bael-list-disc { list-style-type: disc; padding-left: 1.5rem; }
                .bael-list-decimal { list-style-type: decimal; padding-left: 1.5rem; }
                .bael-list-none { list-style: none; padding-left: 0; }

                /* Blockquote */
                .bael-blockquote {
                    padding: 1rem 1.5rem;
                    margin: 1rem 0;
                    border-left: 4px solid var(--primary, #6a9fe2);
                    background: var(--bg-subtle, rgba(0,0,0,0.02));
                    border-radius: 0 4px 4px 0;
                }

                .bael-blockquote p {
                    margin: 0;
                    font-style: italic;
                    font-size: 1.125rem;
                    line-height: 1.6;
                }

                .bael-blockquote cite {
                    display: block;
                    margin-top: 0.5rem;
                    font-size: 0.875rem;
                    color: var(--text-muted, #888);
                    font-style: normal;
                }

                /* Code inline */
                .bael-code-inline {
                    font-family: 'Monaco', 'Consolas', monospace;
                    font-size: 0.875em;
                    padding: 0.125em 0.375em;
                    background: var(--bg-code, rgba(0,0,0,0.1));
                    border-radius: 4px;
                    color: var(--text-code, #e06c75);
                }

                /* Keyboard key */
                .bael-kbd {
                    display: inline-block;
                    padding: 0.125em 0.5em;
                    font-family: 'Monaco', 'Consolas', monospace;
                    font-size: 0.75rem;
                    background: var(--bg-kbd, #2a2a2a);
                    color: #fff;
                    border-radius: 4px;
                    box-shadow: 0 2px 0 0 rgba(0,0,0,0.3);
                }

                /* Mark / Highlight */
                .bael-mark {
                    background-color: rgba(255, 235, 59, 0.4);
                    padding: 0.1em 0.2em;
                    border-radius: 2px;
                }

                /* Abbreviation */
                .bael-abbr {
                    text-decoration: underline dotted;
                    cursor: help;
                }

                /* Responsive text */
                @media (max-width: 768px) {
                    .bael-h1 { font-size: 2rem; }
                    .bael-h2 { font-size: 1.75rem; }
                    .bael-h3 { font-size: 1.375rem; }
                    .bael-display-1 { font-size: 3rem; }
                    .bael-display-2 { font-size: 2.5rem; }
                    .bael-display-3 { font-size: 2rem; }
                }

                @media (max-width: 576px) {
                    .bael-h1 { font-size: 1.75rem; }
                    .bael-h2 { font-size: 1.5rem; }
                    .bael-display-1 { font-size: 2.5rem; }
                    .bael-display-2 { font-size: 2rem; }
                }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // CREATE ELEMENTS
    // ============================================================

    /**
     * Create heading
     */
    heading(level = 1, text = "", options = {}) {
      const tag = `h${Math.min(Math.max(level, 1), 6)}`;
      const el = document.createElement(tag);
      el.className = `bael-heading bael-h${level}`;
      el.textContent = text;

      if (options.gradient) {
        el.classList.add("bael-text-gradient");
      }
      if (options.display) {
        el.classList.remove(`bael-h${level}`);
        el.classList.add(`bael-display-${options.display}`);
      }
      if (options.align) {
        el.classList.add(`bael-text-${options.align}`);
      }
      if (options.className) {
        el.classList.add(...options.className.split(" "));
      }

      return el;
    }

    /**
     * Create text element
     */
    text(content = "", options = {}) {
      const el = document.createElement(options.tag || "p");
      el.className = "bael-text";

      if (options.html) {
        el.innerHTML = content;
      } else {
        el.textContent = content;
      }

      if (options.size) el.classList.add(`bael-text-${options.size}`);
      if (options.weight) el.classList.add(`bael-font-${options.weight}`);
      if (options.color) el.classList.add(`bael-text-${options.color}`);
      if (options.align) el.classList.add(`bael-text-${options.align}`);
      if (options.transform) el.classList.add(`bael-text-${options.transform}`);
      if (options.leading) el.classList.add(`bael-leading-${options.leading}`);
      if (options.tracking)
        el.classList.add(`bael-tracking-${options.tracking}`);
      if (options.truncate) el.classList.add("bael-truncate");
      if (options.clamp) el.classList.add(`bael-line-clamp-${options.clamp}`);
      if (options.muted) el.classList.add("bael-text-muted");
      if (options.lead) el.classList.add("bael-text-lead");
      if (options.caption) el.classList.add("bael-text-caption");
      if (options.overline) el.classList.add("bael-text-overline");
      if (options.gradient)
        el.classList.add(
          `bael-text-gradient${options.gradient === true ? "" : "-" + options.gradient}`,
        );
      if (options.className) el.classList.add(...options.className.split(" "));

      return el;
    }

    /**
     * Create lead paragraph
     */
    lead(text) {
      return this.text(text, { lead: true });
    }

    /**
     * Create muted text
     */
    muted(text) {
      return this.text(text, { muted: true });
    }

    /**
     * Create caption
     */
    caption(text) {
      return this.text(text, { caption: true });
    }

    /**
     * Create overline
     */
    overline(text) {
      return this.text(text, { overline: true, tag: "span" });
    }

    /**
     * Create blockquote
     */
    blockquote(quote, author = null) {
      const el = document.createElement("blockquote");
      el.className = "bael-blockquote";

      const p = document.createElement("p");
      p.textContent = quote;
      el.appendChild(p);

      if (author) {
        const cite = document.createElement("cite");
        cite.textContent = `— ${author}`;
        el.appendChild(cite);
      }

      return el;
    }

    /**
     * Create inline code
     */
    code(text) {
      const el = document.createElement("code");
      el.className = "bael-code-inline";
      el.textContent = text;
      return el;
    }

    /**
     * Create keyboard key
     */
    kbd(key) {
      const el = document.createElement("kbd");
      el.className = "bael-kbd";
      el.textContent = key;
      return el;
    }

    /**
     * Create marked/highlighted text
     */
    mark(text) {
      const el = document.createElement("mark");
      el.className = "bael-mark";
      el.textContent = text;
      return el;
    }

    /**
     * Create abbreviation
     */
    abbr(text, title) {
      const el = document.createElement("abbr");
      el.className = "bael-abbr";
      el.textContent = text;
      el.title = title;
      return el;
    }

    /**
     * Create list
     */
    list(items, type = "disc") {
      const el = document.createElement(type === "decimal" ? "ol" : "ul");
      el.className = `bael-list-${type === "none" ? "none" : type}`;

      items.forEach((item) => {
        const li = document.createElement("li");
        if (typeof item === "string") {
          li.textContent = item;
        } else if (item instanceof HTMLElement) {
          li.appendChild(item);
        }
        el.appendChild(li);
      });

      return el;
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelTypography();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$heading = (level, text, opts) => bael.heading(level, text, opts);
  window.$h1 = (text, opts) => bael.heading(1, text, opts);
  window.$h2 = (text, opts) => bael.heading(2, text, opts);
  window.$h3 = (text, opts) => bael.heading(3, text, opts);
  window.$h4 = (text, opts) => bael.heading(4, text, opts);
  window.$text = (content, opts) => bael.text(content, opts);
  window.$lead = (text) => bael.lead(text);
  window.$muted = (text) => bael.muted(text);
  window.$caption = (text) => bael.caption(text);
  window.$overline = (text) => bael.overline(text);
  window.$blockquote = (quote, author) => bael.blockquote(quote, author);
  window.$kbd = (key) => bael.kbd(key);
  window.$mark = (text) => bael.mark(text);
  window.$abbr = (text, title) => bael.abbr(text, title);

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelTypography = bael;

  console.log("🔤 BAEL Typography loaded");
})();
