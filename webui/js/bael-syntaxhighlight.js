/**
 * BAEL Highlight Component - Lord Of All Syntax
 *
 * Syntax highlighting for code:
 * - Multiple language support
 * - Line numbers
 * - Copy button
 * - Theme support
 * - Word highlighting
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // SYNTAX PATTERNS
  // ============================================================

  const SYNTAX = {
    javascript: {
      keywords:
        /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|class|extends|new|this|super|import|export|default|from|async|await|try|catch|finally|throw|typeof|instanceof|in|of|null|undefined|true|false)\b/g,
      strings: /(["'`])(?:(?!\1)[^\\]|\\.)*?\1/g,
      comments: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
      numbers: /\b(\d+\.?\d*|0x[a-fA-F0-9]+)\b/g,
      functions: /\b([a-zA-Z_$][\w$]*)\s*(?=\()/g,
      operators: /([+\-*/%=<>!&|^~?:]+)/g,
      punctuation: /([{}[\]();,.])/g,
    },
    python: {
      keywords:
        /\b(def|class|if|elif|else|for|while|try|except|finally|with|as|import|from|return|yield|raise|pass|break|continue|and|or|not|in|is|None|True|False|lambda|global|nonlocal|assert|async|await)\b/g,
      strings:
        /("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g,
      comments: /(#.*$)/gm,
      numbers: /\b(\d+\.?\d*j?|0x[a-fA-F0-9]+|0o[0-7]+|0b[01]+)\b/g,
      functions: /\b([a-zA-Z_]\w*)\s*(?=\()/g,
      decorators: /(@\w+)/g,
      operators: /([+\-*/%=<>!&|^~@:]+)/g,
    },
    html: {
      tags: /(<\/?[\w-]+|>|\/>)/g,
      attributes: /\s([\w-]+)(?==)/g,
      strings: /(["'])(?:(?!\1)[^\\]|\\.)*?\1/g,
      comments: /(<!--[\s\S]*?-->)/g,
      doctype: /(<![A-Z]+[^>]*>)/gi,
    },
    css: {
      selectors: /([.#]?[\w-]+)(?=\s*\{)/g,
      properties: /([\w-]+)(?=\s*:)/g,
      values: /:\s*([^;{}]+)/g,
      comments: /(\/\*[\s\S]*?\*\/)/g,
      strings: /(["'])(?:(?!\1)[^\\]|\\.)*?\1/g,
      numbers: /(\d+\.?\d*(px|em|rem|%|vh|vw|s|ms)?)/g,
      atRules: /(@[\w-]+)/g,
    },
    json: {
      keys: /"([^"]+)"\s*:/g,
      strings: /"(?:[^"\\]|\\.)*"/g,
      numbers: /\b(-?\d+\.?\d*)\b/g,
      keywords: /\b(true|false|null)\b/g,
      punctuation: /([{}[\]:,])/g,
    },
    bash: {
      keywords:
        /\b(if|then|else|elif|fi|for|while|do|done|case|esac|function|return|exit|export|source|alias|echo|read|cd|pwd|ls|mkdir|rm|cp|mv|cat|grep|sed|awk|sudo|chmod|chown)\b/g,
      strings: /(["'])(?:(?!\1)[^\\]|\\.)*?\1/g,
      comments: /(#.*$)/gm,
      variables: /(\$\{?\w+\}?)/g,
      operators: /([|&;><]+)/g,
    },
    sql: {
      keywords:
        /\b(SELECT|FROM|WHERE|AND|OR|NOT|IN|LIKE|BETWEEN|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AS|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|INDEX|DROP|ALTER|ADD|COLUMN|PRIMARY|KEY|FOREIGN|REFERENCES|UNIQUE|NULL|DEFAULT|CASCADE)\b/gi,
      strings: /(["'])(?:(?!\1)[^\\]|\\.)*?\1/g,
      comments: /(--.*$|\/\*[\s\S]*?\*\/)/gm,
      numbers: /\b(\d+\.?\d*)\b/g,
      functions:
        /\b(COUNT|SUM|AVG|MAX|MIN|CONCAT|SUBSTRING|TRIM|UPPER|LOWER|NOW|DATE|YEAR|MONTH|DAY)\s*(?=\()/gi,
    },
  };

  // ============================================================
  // HIGHLIGHT CLASS
  // ============================================================

  class BaelHighlight {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-highlight-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-highlight-styles";
      styles.textContent = `
                .bael-highlight {
                    position: relative;
                    font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
                    font-size: 14px;
                    line-height: 1.6;
                    border-radius: 8px;
                    overflow: hidden;
                }

                .bael-highlight-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 8px 16px;
                    background: #1e1e1e;
                    border-bottom: 1px solid #333;
                }

                .bael-highlight-lang {
                    font-size: 12px;
                    color: #888;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .bael-highlight-copy {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 4px 10px;
                    border: none;
                    background: rgba(255,255,255,0.1);
                    color: #aaa;
                    font-size: 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    transition: all 0.15s;
                }

                .bael-highlight-copy:hover {
                    background: rgba(255,255,255,0.15);
                    color: white;
                }

                .bael-highlight-copy.copied {
                    background: #22c55e;
                    color: white;
                }

                .bael-highlight-copy svg {
                    width: 14px;
                    height: 14px;
                }

                .bael-highlight-content {
                    display: flex;
                    background: #1e1e1e;
                    overflow-x: auto;
                }

                .bael-highlight-lines {
                    padding: 16px 0;
                    text-align: right;
                    color: #555;
                    background: rgba(255,255,255,0.03);
                    user-select: none;
                    border-right: 1px solid #333;
                }

                .bael-highlight-line-number {
                    padding: 0 12px;
                    display: block;
                }

                .bael-highlight-code {
                    flex: 1;
                    padding: 16px;
                    margin: 0;
                    color: #d4d4d4;
                    white-space: pre;
                    overflow-x: auto;
                }

                /* Token colors - Dark theme */
                .bael-hl-keyword { color: #569cd6; }
                .bael-hl-string { color: #ce9178; }
                .bael-hl-comment { color: #6a9955; font-style: italic; }
                .bael-hl-number { color: #b5cea8; }
                .bael-hl-function { color: #dcdcaa; }
                .bael-hl-operator { color: #d4d4d4; }
                .bael-hl-punctuation { color: #808080; }
                .bael-hl-variable { color: #9cdcfe; }
                .bael-hl-tag { color: #569cd6; }
                .bael-hl-attribute { color: #9cdcfe; }
                .bael-hl-selector { color: #d7ba7d; }
                .bael-hl-property { color: #9cdcfe; }
                .bael-hl-value { color: #ce9178; }
                .bael-hl-decorator { color: #dcdcaa; }
                .bael-hl-key { color: #9cdcfe; }
                .bael-hl-atrule { color: #c586c0; }

                /* Line highlighting */
                .bael-hl-line-highlight {
                    background: rgba(255, 255, 0, 0.1);
                    display: block;
                    margin: 0 -16px;
                    padding: 0 16px;
                }

                /* Light theme */
                .bael-highlight.light .bael-highlight-header {
                    background: #f5f5f5;
                    border-color: #e0e0e0;
                }

                .bael-highlight.light .bael-highlight-lang {
                    color: #666;
                }

                .bael-highlight.light .bael-highlight-copy {
                    background: rgba(0,0,0,0.05);
                    color: #666;
                }

                .bael-highlight.light .bael-highlight-content {
                    background: #fafafa;
                }

                .bael-highlight.light .bael-highlight-lines {
                    background: #f0f0f0;
                    color: #999;
                    border-color: #e0e0e0;
                }

                .bael-highlight.light .bael-highlight-code {
                    color: #333;
                }

                .bael-highlight.light .bael-hl-keyword { color: #0000ff; }
                .bael-highlight.light .bael-hl-string { color: #a31515; }
                .bael-highlight.light .bael-hl-comment { color: #008000; }
                .bael-highlight.light .bael-hl-number { color: #098658; }
                .bael-highlight.light .bael-hl-function { color: #795e26; }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // CREATE HIGHLIGHT
    // ============================================================

    /**
     * Create syntax highlighted code block
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Highlight container not found");
        return null;
      }

      const id = `bael-highlight-${++this.idCounter}`;
      const config = {
        code: "",
        language: "javascript",
        showHeader: true,
        showLineNumbers: true,
        showCopy: true,
        theme: "dark", // dark, light
        highlightLines: [], // Array of line numbers to highlight
        startLine: 1,
        ...options,
      };

      const el = document.createElement("div");
      el.className = `bael-highlight${config.theme === "light" ? " light" : ""}`;
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
        setCode: (code, language) => this._setCode(state, code, language),
        setTheme: (theme) => this._setTheme(state, theme),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Render highlight block
     */
    _render(state) {
      const { element, config } = state;

      element.innerHTML = "";

      // Header
      if (config.showHeader) {
        const header = document.createElement("div");
        header.className = "bael-highlight-header";

        const lang = document.createElement("span");
        lang.className = "bael-highlight-lang";
        lang.textContent = config.language;
        header.appendChild(lang);

        if (config.showCopy) {
          const copy = document.createElement("button");
          copy.type = "button";
          copy.className = "bael-highlight-copy";
          copy.innerHTML = `
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                        </svg>
                        Copy
                    `;
          copy.addEventListener("click", () => this._copyCode(state, copy));
          header.appendChild(copy);
        }

        element.appendChild(header);
      }

      // Content
      const content = document.createElement("div");
      content.className = "bael-highlight-content";

      // Highlighted code
      const highlighted = this._highlight(config.code, config.language);
      const lines = highlighted.split("\n");

      // Line numbers
      if (config.showLineNumbers) {
        const lineNumbers = document.createElement("div");
        lineNumbers.className = "bael-highlight-lines";

        lines.forEach((_, i) => {
          const num = document.createElement("span");
          num.className = "bael-highlight-line-number";
          num.textContent = config.startLine + i;
          lineNumbers.appendChild(num);
        });

        content.appendChild(lineNumbers);
      }

      // Code
      const code = document.createElement("pre");
      code.className = "bael-highlight-code";

      // Apply line highlighting
      const highlightedLines = lines.map((line, i) => {
        const lineNum = config.startLine + i;
        if (config.highlightLines.includes(lineNum)) {
          return `<span class="bael-hl-line-highlight">${line}</span>`;
        }
        return line;
      });

      code.innerHTML = highlightedLines.join("\n");
      state.codeEl = code;
      content.appendChild(code);

      element.appendChild(content);
    }

    /**
     * Highlight code
     */
    _highlight(code, language) {
      if (!code) return "";

      // Escape HTML first
      let escaped = code
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      const syntax = SYNTAX[language];
      if (!syntax) return escaped;

      // Store strings and comments to avoid highlighting inside them
      const tokens = [];
      let tokenIndex = 0;

      // Replace strings
      if (syntax.strings) {
        escaped = escaped.replace(syntax.strings, (match) => {
          tokens.push(`<span class="bael-hl-string">${match}</span>`);
          return `__TOKEN_${tokenIndex++}__`;
        });
      }

      // Replace comments
      if (syntax.comments) {
        escaped = escaped.replace(syntax.comments, (match) => {
          tokens.push(`<span class="bael-hl-comment">${match}</span>`);
          return `__TOKEN_${tokenIndex++}__`;
        });
      }

      // Apply language-specific highlighting
      if (
        language === "javascript" ||
        language === "python" ||
        language === "bash" ||
        language === "sql"
      ) {
        if (syntax.keywords) {
          escaped = escaped.replace(
            syntax.keywords,
            '<span class="bael-hl-keyword">$&</span>',
          );
        }
        if (syntax.functions) {
          escaped = escaped.replace(
            syntax.functions,
            '<span class="bael-hl-function">$1</span>',
          );
        }
        if (syntax.numbers) {
          escaped = escaped.replace(
            syntax.numbers,
            '<span class="bael-hl-number">$1</span>',
          );
        }
        if (syntax.decorators) {
          escaped = escaped.replace(
            syntax.decorators,
            '<span class="bael-hl-decorator">$1</span>',
          );
        }
        if (syntax.variables) {
          escaped = escaped.replace(
            syntax.variables,
            '<span class="bael-hl-variable">$1</span>',
          );
        }
      } else if (language === "html") {
        if (syntax.tags) {
          escaped = escaped.replace(
            syntax.tags,
            '<span class="bael-hl-tag">$1</span>',
          );
        }
        if (syntax.attributes) {
          escaped = escaped.replace(
            syntax.attributes,
            ' <span class="bael-hl-attribute">$1</span>=',
          );
        }
      } else if (language === "css") {
        if (syntax.selectors) {
          escaped = escaped.replace(
            syntax.selectors,
            '<span class="bael-hl-selector">$1</span>',
          );
        }
        if (syntax.properties) {
          escaped = escaped.replace(
            syntax.properties,
            '<span class="bael-hl-property">$1</span>',
          );
        }
        if (syntax.atRules) {
          escaped = escaped.replace(
            syntax.atRules,
            '<span class="bael-hl-atrule">$1</span>',
          );
        }
      } else if (language === "json") {
        if (syntax.keys) {
          escaped = escaped.replace(
            syntax.keys,
            '"<span class="bael-hl-key">$1</span>":',
          );
        }
        if (syntax.keywords) {
          escaped = escaped.replace(
            syntax.keywords,
            '<span class="bael-hl-keyword">$1</span>',
          );
        }
        if (syntax.numbers) {
          escaped = escaped.replace(
            syntax.numbers,
            '<span class="bael-hl-number">$1</span>',
          );
        }
      }

      // Restore tokens
      tokens.forEach((token, i) => {
        escaped = escaped.replace(`__TOKEN_${i}__`, token);
      });

      return escaped;
    }

    /**
     * Copy code to clipboard
     */
    async _copyCode(state, button) {
      try {
        await navigator.clipboard.writeText(state.config.code);
        button.classList.add("copied");
        button.innerHTML = `
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    Copied!
                `;

        setTimeout(() => {
          button.classList.remove("copied");
          button.innerHTML = `
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                        </svg>
                        Copy
                    `;
        }, 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }

    /**
     * Set code
     */
    _setCode(state, code, language) {
      state.config.code = code;
      if (language) state.config.language = language;
      this._render(state);
    }

    /**
     * Set theme
     */
    _setTheme(state, theme) {
      state.config.theme = theme;
      state.element.classList.toggle("light", theme === "light");
    }

    /**
     * Destroy highlight
     */
    destroy(highlightId) {
      const state = this.instances.get(highlightId);
      if (!state) return;

      state.element.remove();
      this.instances.delete(highlightId);
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelHighlight();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$highlight = (container, options) => bael.create(container, options);
  window.$code = window.$highlight;
  window.$syntax = window.$highlight;

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelHighlight = bael;

  console.log("🎨 BAEL Syntax Highlight Component loaded");
})();
