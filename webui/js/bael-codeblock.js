/**
 * BAEL Code Block Component - Lord Of All Code
 *
 * Code display with syntax highlighting:
 * - Multiple language support
 * - Line numbers
 * - Copy button
 * - Collapsible
 * - Diff view
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // CODE BLOCK CLASS
  // ============================================================

  class BaelCodeBlock {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-codeblock-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-codeblock-styles";
      styles.textContent = `
                .bael-codeblock {
                    position: relative;
                    font-family: 'SF Mono', 'Monaco', 'Consolas', 'Liberation Mono', monospace;
                    font-size: 13px;
                    line-height: 1.6;
                    background: rgba(0,0,0,0.3);
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 10px;
                    overflow: hidden;
                }

                /* Header */
                .bael-codeblock-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 8px;
                    padding: 8px 14px;
                    background: rgba(255,255,255,0.03);
                    border-bottom: 1px solid rgba(255,255,255,0.06);
                }

                .bael-codeblock-lang {
                    font-size: 11px;
                    font-weight: 600;
                    color: #888;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .bael-codeblock-filename {
                    flex: 1;
                    font-size: 12px;
                    color: #aaa;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .bael-codeblock-actions {
                    display: flex;
                    gap: 4px;
                }

                .bael-codeblock-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 4px 8px;
                    background: rgba(255,255,255,0.05);
                    border: none;
                    border-radius: 4px;
                    color: #888;
                    cursor: pointer;
                    font-size: 11px;
                    font-family: inherit;
                    transition: all 0.15s;
                    gap: 4px;
                }

                .bael-codeblock-btn:hover {
                    background: rgba(255,255,255,0.1);
                    color: #fff;
                }

                .bael-codeblock-btn.copied {
                    background: rgba(34, 197, 94, 0.2);
                    color: #22c55e;
                }

                .bael-codeblock-btn svg {
                    width: 14px;
                    height: 14px;
                }

                /* Code container */
                .bael-codeblock-container {
                    display: flex;
                    overflow-x: auto;
                    max-height: 500px;
                    overflow-y: auto;
                }

                .bael-codeblock.collapsed .bael-codeblock-container {
                    max-height: 200px;
                    overflow: hidden;
                    mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
                    -webkit-mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
                }

                /* Line numbers */
                .bael-codeblock-lines {
                    flex-shrink: 0;
                    padding: 14px 0;
                    text-align: right;
                    color: #555;
                    user-select: none;
                    background: rgba(0,0,0,0.15);
                    border-right: 1px solid rgba(255,255,255,0.05);
                }

                .bael-codeblock-line-num {
                    display: block;
                    padding: 0 12px;
                    font-size: 12px;
                }

                /* Code content */
                .bael-codeblock-code {
                    flex: 1;
                    padding: 14px 16px;
                    margin: 0;
                    white-space: pre;
                    color: #e4e4e7;
                    tab-size: 4;
                }

                .bael-codeblock-line {
                    display: block;
                    padding: 0 4px;
                    margin: 0 -4px;
                }

                .bael-codeblock-line.highlight {
                    background: rgba(59, 130, 246, 0.15);
                    border-left: 2px solid #3b82f6;
                    margin-left: -6px;
                    padding-left: 6px;
                }

                /* Diff view */
                .bael-codeblock-line.added {
                    background: rgba(34, 197, 94, 0.15);
                }

                .bael-codeblock-line.removed {
                    background: rgba(239, 68, 68, 0.15);
                }

                .bael-codeblock-line.added::before {
                    content: '+';
                    color: #22c55e;
                    margin-right: 8px;
                }

                .bael-codeblock-line.removed::before {
                    content: '-';
                    color: #ef4444;
                    margin-right: 8px;
                }

                /* Syntax highlighting */
                .bael-code-keyword { color: #c678dd; }
                .bael-code-string { color: #98c379; }
                .bael-code-number { color: #d19a66; }
                .bael-code-comment { color: #5c6370; font-style: italic; }
                .bael-code-function { color: #61afef; }
                .bael-code-class { color: #e5c07b; }
                .bael-code-operator { color: #56b6c2; }
                .bael-code-punctuation { color: #abb2bf; }
                .bael-code-variable { color: #e06c75; }
                .bael-code-property { color: #d19a66; }
                .bael-code-tag { color: #e06c75; }
                .bael-code-attr { color: #d19a66; }
                .bael-code-regex { color: #56b6c2; }

                /* Expand button */
                .bael-codeblock-expand {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    display: flex;
                    justify-content: center;
                    padding: 12px;
                    background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%);
                }

                .bael-codeblock-expand-btn {
                    padding: 6px 16px;
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.15);
                    border-radius: 999px;
                    color: #ccc;
                    cursor: pointer;
                    font-size: 12px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    transition: all 0.15s;
                }

                .bael-codeblock-expand-btn:hover {
                    background: rgba(255,255,255,0.15);
                    color: #fff;
                }

                /* Inline code */
                .bael-code-inline {
                    display: inline;
                    padding: 2px 6px;
                    background: rgba(255,255,255,0.08);
                    border-radius: 4px;
                    font-family: 'SF Mono', monospace;
                    font-size: 0.9em;
                    color: #e4e4e7;
                }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // ICONS
    // ============================================================

    _copyIcon =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>';
    _checkIcon =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
    _collapseIcon =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"/></svg>';
    _expandIcon =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>';

    // ============================================================
    // SYNTAX PATTERNS
    // ============================================================

    _patterns = {
      javascript: [
        { pattern: /(\/\/.*$)/gm, class: "comment" },
        { pattern: /(\/\*[\s\S]*?\*\/)/g, class: "comment" },
        {
          pattern: /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g,
          class: "string",
        },
        {
          pattern:
            /\b(const|let|var|function|return|if|else|for|while|class|extends|import|export|default|from|async|await|try|catch|throw|new|this|super)\b/g,
          class: "keyword",
        },
        { pattern: /\b(\d+\.?\d*)\b/g, class: "number" },
        { pattern: /\b([A-Z][a-zA-Z0-9]*)\b/g, class: "class" },
        { pattern: /\b([a-z_]\w*)\s*(?=\()/gi, class: "function" },
      ],
      python: [
        { pattern: /(#.*$)/gm, class: "comment" },
        { pattern: /("""[\s\S]*?"""|'''[\s\S]*?''')/g, class: "string" },
        { pattern: /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, class: "string" },
        {
          pattern:
            /\b(def|class|if|elif|else|for|while|return|import|from|as|try|except|raise|with|lambda|and|or|not|in|is|True|False|None|async|await)\b/g,
          class: "keyword",
        },
        { pattern: /\b(\d+\.?\d*)\b/g, class: "number" },
        { pattern: /\b([A-Z][a-zA-Z0-9]*)\b/g, class: "class" },
        { pattern: /\b([a-z_]\w*)\s*(?=\()/gi, class: "function" },
      ],
      html: [
        { pattern: /(&lt;!--[\s\S]*?--&gt;)/g, class: "comment" },
        {
          pattern: /(&lt;\/?)([\w-]+)/g,
          class: "tag",
          replace: '$1<span class="bael-code-tag">$2</span>',
        },
        {
          pattern: /(\s)([\w-]+)(=)/g,
          class: "attr",
          replace: '$1<span class="bael-code-attr">$2</span>$3',
        },
        { pattern: /("(?:[^"\\]|\\.)*")/g, class: "string" },
      ],
      css: [
        { pattern: /(\/\*[\s\S]*?\*\/)/g, class: "comment" },
        { pattern: /([.#]?[\w-]+)\s*(?=\{)/g, class: "class" },
        {
          pattern: /([\w-]+)\s*:/g,
          class: "property",
          replace: '<span class="bael-code-property">$1</span>:',
        },
        { pattern: /:\s*([^;{}]+)/g, class: "string" },
      ],
      json: [
        {
          pattern: /("[\w-]+")\s*:/g,
          class: "property",
          replace: '<span class="bael-code-property">$1</span>:',
        },
        {
          pattern: /:\s*("(?:[^"\\]|\\.)*")/g,
          class: "string",
          replace: ': <span class="bael-code-string">$1</span>',
        },
        { pattern: /\b(true|false|null)\b/g, class: "keyword" },
        { pattern: /\b(\d+\.?\d*)\b/g, class: "number" },
      ],
      bash: [
        { pattern: /(#.*$)/gm, class: "comment" },
        { pattern: /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, class: "string" },
        { pattern: /\$\{?[\w]+\}?/g, class: "variable" },
        {
          pattern:
            /\b(if|then|else|fi|for|while|do|done|case|esac|function|return|exit|echo|cd|ls|mkdir|rm|cp|mv|cat|grep|sed|awk)\b/g,
          class: "keyword",
        },
      ],
    };

    // ============================================================
    // CREATE CODE BLOCK
    // ============================================================

    /**
     * Create code block
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Code block container not found");
        return null;
      }

      const id = `bael-codeblock-${++this.idCounter}`;
      const config = {
        code: "",
        language: "javascript",
        filename: "",
        showLineNumbers: true,
        showCopy: true,
        showHeader: true,
        highlightLines: [], // [1, 3, 5] or '1,3,5' or '1-5'
        maxHeight: 500,
        collapsible: false,
        collapsed: false,
        collapseHeight: 200,
        diff: false, // Enable diff mode
        wrap: false, // Wrap long lines
        ...options,
      };

      const el = document.createElement("div");
      el.className = "bael-codeblock";
      if (config.collapsed) el.classList.add("collapsed");
      el.id = id;

      const state = {
        id,
        element: el,
        container,
        config,
        highlightedLines: this._parseHighlightLines(config.highlightLines),
      };

      this._render(state);
      this._bindEvents(state);
      container.appendChild(el);

      this.instances.set(id, state);

      return {
        id,
        setCode: (code) => this._setCode(state, code),
        toggleCollapse: () => this._toggleCollapse(state),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Parse highlight lines
     */
    _parseHighlightLines(lines) {
      if (!lines) return new Set();
      if (lines instanceof Set) return lines;
      if (Array.isArray(lines)) return new Set(lines);

      const result = new Set();
      const parts = String(lines).split(",");

      parts.forEach((part) => {
        if (part.includes("-")) {
          const [start, end] = part.split("-").map((n) => parseInt(n.trim()));
          for (let i = start; i <= end; i++) {
            result.add(i);
          }
        } else {
          result.add(parseInt(part.trim()));
        }
      });

      return result;
    }

    /**
     * Render code block
     */
    _render(state) {
      const { element, config, highlightedLines } = state;
      element.innerHTML = "";

      // Header
      if (config.showHeader) {
        const header = document.createElement("div");
        header.className = "bael-codeblock-header";

        if (config.language) {
          const lang = document.createElement("span");
          lang.className = "bael-codeblock-lang";
          lang.textContent = config.language;
          header.appendChild(lang);
        }

        if (config.filename) {
          const filename = document.createElement("span");
          filename.className = "bael-codeblock-filename";
          filename.textContent = config.filename;
          header.appendChild(filename);
        }

        const actions = document.createElement("div");
        actions.className = "bael-codeblock-actions";

        if (config.showCopy) {
          const copyBtn = document.createElement("button");
          copyBtn.className = "bael-codeblock-btn";
          copyBtn.innerHTML = this._copyIcon + "<span>Copy</span>";
          copyBtn.addEventListener("click", () => this._copy(state, copyBtn));
          actions.appendChild(copyBtn);
        }

        header.appendChild(actions);
        element.appendChild(header);
      }

      // Container
      const codeContainer = document.createElement("div");
      codeContainer.className = "bael-codeblock-container";
      if (config.wrap) codeContainer.style.whiteSpace = "pre-wrap";

      const lines = config.code.split("\n");

      // Line numbers
      if (config.showLineNumbers) {
        const lineNums = document.createElement("div");
        lineNums.className = "bael-codeblock-lines";

        lines.forEach((_, i) => {
          const num = document.createElement("span");
          num.className = "bael-codeblock-line-num";
          num.textContent = String(i + 1);
          lineNums.appendChild(num);
        });

        codeContainer.appendChild(lineNums);
      }

      // Code
      const pre = document.createElement("pre");
      pre.className = "bael-codeblock-code";

      const highlighted = this._highlight(config.code, config.language);
      const codeLines = highlighted.split("\n");

      codeLines.forEach((line, i) => {
        const lineEl = document.createElement("span");
        lineEl.className = "bael-codeblock-line";

        if (highlightedLines.has(i + 1)) {
          lineEl.classList.add("highlight");
        }

        // Diff mode
        if (config.diff) {
          if (line.startsWith("+")) {
            lineEl.classList.add("added");
          } else if (line.startsWith("-")) {
            lineEl.classList.add("removed");
          }
        }

        lineEl.innerHTML = line || " ";
        pre.appendChild(lineEl);
      });

      codeContainer.appendChild(pre);
      element.appendChild(codeContainer);

      // Expand button for collapsed
      if (config.collapsible && config.collapsed) {
        const expandWrapper = document.createElement("div");
        expandWrapper.className = "bael-codeblock-expand";

        const expandBtn = document.createElement("button");
        expandBtn.className = "bael-codeblock-expand-btn";
        expandBtn.textContent = "Show more";
        expandBtn.addEventListener("click", () => this._toggleCollapse(state));
        expandWrapper.appendChild(expandBtn);

        element.appendChild(expandWrapper);
      }
    }

    /**
     * Simple syntax highlighting
     */
    _highlight(code, language) {
      // Escape HTML
      let highlighted = code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      const patterns = this._patterns[language];
      if (!patterns) return highlighted;

      patterns.forEach(({ pattern, class: className, replace }) => {
        if (replace) {
          highlighted = highlighted.replace(pattern, replace);
        } else {
          highlighted = highlighted.replace(
            pattern,
            `<span class="bael-code-${className}">$1</span>`,
          );
        }
      });

      return highlighted;
    }

    /**
     * Copy code
     */
    async _copy(state, button) {
      try {
        await navigator.clipboard.writeText(state.config.code);
        button.classList.add("copied");
        button.innerHTML = this._checkIcon + "<span>Copied!</span>";

        setTimeout(() => {
          button.classList.remove("copied");
          button.innerHTML = this._copyIcon + "<span>Copy</span>";
        }, 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }

    /**
     * Set code
     */
    _setCode(state, code) {
      state.config.code = code;
      this._render(state);
    }

    /**
     * Toggle collapse
     */
    _toggleCollapse(state) {
      state.config.collapsed = !state.config.collapsed;
      state.element.classList.toggle("collapsed", state.config.collapsed);
      this._render(state);
    }

    /**
     * Bind events
     */
    _bindEvents(state) {
      // Could add keyboard shortcuts here
    }

    /**
     * Create inline code
     */
    inline(text) {
      const span = document.createElement("span");
      span.className = "bael-code-inline";
      span.textContent = text;
      return span;
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

  const bael = new BaelCodeBlock();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$codeBlock = (container, options) => bael.create(container, options);
  window.$code = (container, options) => bael.create(container, options);
  window.$inlineCode = (text) => bael.inline(text);

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelCodeBlock = bael;

  console.log("💻 BAEL Code Block loaded");
})();
