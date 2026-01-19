/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BAEL - LORD OF ALL
 * RESPONSE FORMATTER SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Advanced response formatting and display:
 * - Code highlighting
 * - Markdown rendering
 * - Table formatting
 * - LaTeX math support
 * - Diagram rendering
 * - Interactive elements
 *
 * @version 1.0.0
 */

(function () {
  "use strict";

  class BaelResponseFormatter {
    constructor() {
      // Configuration
      this.config = {
        enableCodeHighlight: true,
        enableMarkdown: true,
        enableMath: true,
        enableDiagrams: true,
        enableCopyButtons: true,
        enableLineNumbers: true,
        theme: "dark",
      };

      // Syntax patterns
      this.languagePatterns = {
        javascript: {
          keywords:
            /\b(const|let|var|function|return|if|else|for|while|class|extends|import|export|default|async|await|try|catch|throw|new|this|super)\b/g,
          strings: /(["'`])(?:(?!\1)[^\\]|\\.)*\1/g,
          comments: /\/\/.*$|\/\*[\s\S]*?\*\//gm,
          numbers: /\b\d+\.?\d*\b/g,
          functions: /\b([a-zA-Z_]\w*)\s*(?=\()/g,
        },
        python: {
          keywords:
            /\b(def|class|if|elif|else|for|while|return|import|from|as|try|except|finally|raise|with|lambda|and|or|not|in|is|None|True|False|self)\b/g,
          strings:
            /(["'])(?:(?!\1)[^\\]|\\.)*\1|"""[\s\S]*?"""|'''[\s\S]*?'''/g,
          comments: /#.*$/gm,
          numbers: /\b\d+\.?\d*\b/g,
          decorators: /@\w+/g,
        },
        typescript: {
          keywords:
            /\b(const|let|var|function|return|if|else|for|while|class|extends|import|export|default|async|await|interface|type|enum|implements|namespace|readonly|public|private|protected)\b/g,
          strings: /(["'`])(?:(?!\1)[^\\]|\\.)*\1/g,
          comments: /\/\/.*$|\/\*[\s\S]*?\*\//gm,
          types: /\b([A-Z][a-zA-Z0-9]*)\b/g,
          numbers: /\b\d+\.?\d*\b/g,
        },
        css: {
          selectors: /([.#]?[a-zA-Z_-][\w-]*)\s*\{/g,
          properties: /([a-z-]+)\s*:/g,
          values: /:\s*([^;{}]+)/g,
          comments: /\/\*[\s\S]*?\*\//g,
        },
        html: {
          tags: /<\/?([a-zA-Z][a-zA-Z0-9]*)/g,
          attributes: /\s([a-zA-Z-]+)=/g,
          strings: /"[^"]*"|'[^']*'/g,
          comments: /<!--[\s\S]*?-->/g,
        },
        sql: {
          keywords:
            /\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TABLE|INDEX|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AND|OR|NOT|NULL|ORDER|BY|GROUP|HAVING|LIMIT|AS)\b/gi,
          strings: /'[^']*'/g,
          comments: /--.*$/gm,
          numbers: /\b\d+\b/g,
        },
        json: {
          keys: /"([^"]+)"\s*:/g,
          strings: /"[^"]*"/g,
          numbers: /\b\d+\.?\d*\b/g,
          booleans: /\b(true|false|null)\b/g,
        },
        bash: {
          keywords:
            /\b(if|then|else|elif|fi|for|while|do|done|case|esac|function|return|exit|export|source|alias)\b/g,
          variables: /\$[a-zA-Z_]\w*|\$\{[^}]+\}/g,
          strings: /(["'])(?:(?!\1)[^\\]|\\.)*\1/g,
          comments: /#.*$/gm,
        },
      };

      this.init();
    }

    init() {
      this.loadConfig();
      this.addStyles();
      this.setupObserver();
      console.log("📝 Bael Response Formatter initialized");
    }

    // ═════════════════════════════════════════════════════════════════
    // MAIN FORMATTING
    // ═════════════════════════════════════════════════════════════════

    format(content, options = {}) {
      const opts = { ...this.config, ...options };
      let formatted = content;

      // Process in order
      if (opts.enableMarkdown) {
        formatted = this.processMarkdown(formatted);
      }

      if (opts.enableCodeHighlight) {
        formatted = this.processCodeBlocks(formatted);
      }

      if (opts.enableMath) {
        formatted = this.processMath(formatted);
      }

      if (opts.enableDiagrams) {
        formatted = this.processDiagrams(formatted);
      }

      return formatted;
    }

    // ═════════════════════════════════════════════════════════════════
    // MARKDOWN PROCESSING
    // ═════════════════════════════════════════════════════════════════

    processMarkdown(content) {
      let html = content;

      // Headers
      html = html.replace(/^######\s+(.+)$/gm, "<h6>$1</h6>");
      html = html.replace(/^#####\s+(.+)$/gm, "<h5>$1</h5>");
      html = html.replace(/^####\s+(.+)$/gm, "<h4>$1</h4>");
      html = html.replace(/^###\s+(.+)$/gm, "<h3>$1</h3>");
      html = html.replace(/^##\s+(.+)$/gm, "<h2>$1</h2>");
      html = html.replace(/^#\s+(.+)$/gm, "<h1>$1</h1>");

      // Bold and italic
      html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
      html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
      html = html.replace(/__(.+?)__/g, "<strong>$1</strong>");
      html = html.replace(/_(.+?)_/g, "<em>$1</em>");

      // Strikethrough
      html = html.replace(/~~(.+?)~~/g, "<del>$1</del>");

      // Inline code
      html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

      // Links
      html = html.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener">$1</a>',
      );

      // Images
      html = html.replace(
        /!\[([^\]]*)\]\(([^)]+)\)/g,
        '<img src="$2" alt="$1" class="md-image">',
      );

      // Blockquotes
      html = html.replace(/^>\s+(.+)$/gm, "<blockquote>$1</blockquote>");

      // Horizontal rules
      html = html.replace(/^---+$/gm, "<hr>");
      html = html.replace(/^\*\*\*+$/gm, "<hr>");

      // Unordered lists
      html = html.replace(/^[\*\-]\s+(.+)$/gm, "<li>$1</li>");
      html = html.replace(/(<li>.*<\/li>)/gs, "<ul>$1</ul>");

      // Ordered lists
      html = html.replace(/^\d+\.\s+(.+)$/gm, "<li>$1</li>");

      // Tables
      html = this.processTables(html);

      // Paragraphs
      html = html.replace(/\n\n/g, "</p><p>");
      html = "<p>" + html + "</p>";
      html = html.replace(/<p><\/p>/g, "");
      html = html.replace(/<p>(<h\d>)/g, "$1");
      html = html.replace(/(<\/h\d>)<\/p>/g, "$1");

      return html;
    }

    processTables(html) {
      const tableRegex = /\|(.+)\|\n\|[-:|\s]+\|\n((?:\|.+\|\n?)*)/g;

      return html.replace(tableRegex, (match, headerRow, bodyRows) => {
        const headers = headerRow
          .split("|")
          .map((h) => h.trim())
          .filter((h) => h);
        const rows = bodyRows
          .trim()
          .split("\n")
          .map((row) =>
            row
              .split("|")
              .map((c) => c.trim())
              .filter((c) => c),
          );

        let table =
          '<div class="table-wrapper"><table class="md-table"><thead><tr>';
        headers.forEach((h) => (table += `<th>${h}</th>`));
        table += "</tr></thead><tbody>";

        rows.forEach((row) => {
          table += "<tr>";
          row.forEach((cell) => (table += `<td>${cell}</td>`));
          table += "</tr>";
        });

        table += "</tbody></table></div>";
        return table;
      });
    }

    // ═════════════════════════════════════════════════════════════════
    // CODE HIGHLIGHTING
    // ═════════════════════════════════════════════════════════════════

    processCodeBlocks(content) {
      // Fenced code blocks
      const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;

      return content.replace(codeBlockRegex, (match, lang, code) => {
        const language = lang?.toLowerCase() || "text";
        const highlighted = this.highlightCode(code.trim(), language);
        const id = "code_" + Math.random().toString(36).substr(2, 9);

        return `
                    <div class="code-block" data-language="${language}">
                        <div class="code-header">
                            <span class="code-lang">${language}</span>
                            <div class="code-actions">
                                <button class="code-btn copy" data-code="${this.escapeHtml(code.trim())}" title="Copy">
                                    📋
                                </button>
                                <button class="code-btn wrap" title="Toggle wrap">↩️</button>
                            </div>
                        </div>
                        <div class="code-container">
                            ${this.config.enableLineNumbers ? this.addLineNumbers(highlighted) : ""}
                            <pre><code id="${id}" class="language-${language}">${highlighted}</code></pre>
                        </div>
                    </div>
                `;
      });
    }

    highlightCode(code, language) {
      const patterns = this.languagePatterns[language];
      if (!patterns) {
        return this.escapeHtml(code);
      }

      let highlighted = this.escapeHtml(code);

      // Apply patterns
      if (patterns.comments) {
        highlighted = highlighted.replace(
          patterns.comments,
          '<span class="hl-comment">$&</span>',
        );
      }
      if (patterns.strings) {
        highlighted = highlighted.replace(
          patterns.strings,
          '<span class="hl-string">$&</span>',
        );
      }
      if (patterns.keywords) {
        highlighted = highlighted.replace(
          patterns.keywords,
          '<span class="hl-keyword">$&</span>',
        );
      }
      if (patterns.numbers) {
        highlighted = highlighted.replace(
          patterns.numbers,
          '<span class="hl-number">$&</span>',
        );
      }
      if (patterns.functions) {
        highlighted = highlighted.replace(
          patterns.functions,
          '<span class="hl-function">$1</span>',
        );
      }
      if (patterns.types) {
        highlighted = highlighted.replace(
          patterns.types,
          '<span class="hl-type">$1</span>',
        );
      }
      if (patterns.decorators) {
        highlighted = highlighted.replace(
          patterns.decorators,
          '<span class="hl-decorator">$&</span>',
        );
      }
      if (patterns.variables) {
        highlighted = highlighted.replace(
          patterns.variables,
          '<span class="hl-variable">$&</span>',
        );
      }

      return highlighted;
    }

    addLineNumbers(code) {
      const lines = code.split("\n").length;
      let lineNums = '<div class="line-numbers">';
      for (let i = 1; i <= lines; i++) {
        lineNums += `<span>${i}</span>`;
      }
      lineNums += "</div>";
      return lineNums;
    }

    // ═════════════════════════════════════════════════════════════════
    // MATH PROCESSING
    // ═════════════════════════════════════════════════════════════════

    processMath(content) {
      // Block math $$...$$
      content = content.replace(/\$\$([\s\S]+?)\$\$/g, (match, math) => {
        return `<div class="math-block" data-math="${this.escapeHtml(math)}">${this.renderMath(math, true)}</div>`;
      });

      // Inline math $...$
      content = content.replace(/\$([^$]+)\$/g, (match, math) => {
        return `<span class="math-inline" data-math="${this.escapeHtml(math)}">${this.renderMath(math, false)}</span>`;
      });

      return content;
    }

    renderMath(expression, isBlock) {
      // Simple math rendering (for complex math, integrate KaTeX or MathJax)
      let rendered = expression
        .replace(
          /\\frac\{([^}]+)\}\{([^}]+)\}/g,
          '<span class="frac"><span class="num">$1</span><span class="denom">$2</span></span>',
        )
        .replace(/\\sqrt\{([^}]+)\}/g, "√($1)")
        .replace(/\^(\d+)/g, "<sup>$1</sup>")
        .replace(/_(\d+)/g, "<sub>$1</sub>")
        .replace(/\\pi/g, "π")
        .replace(/\\alpha/g, "α")
        .replace(/\\beta/g, "β")
        .replace(/\\gamma/g, "γ")
        .replace(/\\delta/g, "δ")
        .replace(/\\sigma/g, "σ")
        .replace(/\\sum/g, "∑")
        .replace(/\\int/g, "∫")
        .replace(/\\infty/g, "∞")
        .replace(/\\pm/g, "±")
        .replace(/\\times/g, "×")
        .replace(/\\div/g, "÷")
        .replace(/\\leq/g, "≤")
        .replace(/\\geq/g, "≥")
        .replace(/\\neq/g, "≠");

      return rendered;
    }

    // ═════════════════════════════════════════════════════════════════
    // DIAGRAM PROCESSING
    // ═════════════════════════════════════════════════════════════════

    processDiagrams(content) {
      // Mermaid-style diagrams
      const diagramRegex = /```(mermaid|diagram)\n([\s\S]*?)```/g;

      return content.replace(diagramRegex, (match, type, diagram) => {
        const id = "diagram_" + Math.random().toString(36).substr(2, 9);
        return `
                    <div class="diagram-block" id="${id}">
                        <div class="diagram-header">
                            <span>📊 ${type}</span>
                        </div>
                        <div class="diagram-content">
                            ${this.renderSimpleDiagram(diagram.trim())}
                        </div>
                    </div>
                `;
      });
    }

    renderSimpleDiagram(definition) {
      // Simple flowchart rendering
      const lines = definition.split("\n");
      let svg = '<svg class="simple-diagram" viewBox="0 0 400 200">';
      let y = 30;
      let nodes = [];

      lines.forEach((line, i) => {
        const match = line.match(/(\w+)\s*-->\s*(\w+)/);
        if (match) {
          nodes.push({ from: match[1], to: match[2], y: y });
          y += 50;
        }
      });

      // Render nodes and connections
      nodes.forEach((node, i) => {
        const x1 = 50;
        const x2 = 300;

        svg += `
                    <rect x="${x1 - 40}" y="${node.y - 15}" width="80" height="30" rx="5" class="node"/>
                    <text x="${x1}" y="${node.y + 5}" text-anchor="middle">${node.from}</text>
                    <line x1="${x1 + 40}" y1="${node.y}" x2="${x2 - 40}" y2="${node.y}" class="edge"/>
                    <polygon points="${x2 - 45},${node.y - 5} ${x2 - 45},${node.y + 5} ${x2 - 35},${node.y}" class="arrow"/>
                    <rect x="${x2 - 40}" y="${node.y - 15}" width="80" height="30" rx="5" class="node"/>
                    <text x="${x2}" y="${node.y + 5}" text-anchor="middle">${node.to}</text>
                `;
      });

      svg += "</svg>";
      return svg;
    }

    // ═════════════════════════════════════════════════════════════════
    // MUTATION OBSERVER
    // ═════════════════════════════════════════════════════════════════

    setupObserver() {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.processNewContent(node);
            }
          });
        });
      });

      // Observe chat container
      setTimeout(() => {
        const container = document.querySelector(
          ".messages, #messages, .chat-messages, .conversation",
        );
        if (container) {
          observer.observe(container, { childList: true, subtree: true });
        }
      }, 1000);
    }

    processNewContent(node) {
      // Find code blocks and add copy buttons
      node.querySelectorAll?.(".code-block .code-btn.copy")?.forEach((btn) => {
        if (!btn.hasListener) {
          btn.hasListener = true;
          btn.addEventListener("click", () => {
            navigator.clipboard.writeText(btn.dataset.code);
            btn.textContent = "✓";
            setTimeout(() => (btn.textContent = "📋"), 1500);
          });
        }
      });

      // Wrap toggle
      node.querySelectorAll?.(".code-block .code-btn.wrap")?.forEach((btn) => {
        if (!btn.hasListener) {
          btn.hasListener = true;
          btn.addEventListener("click", () => {
            const block = btn.closest(".code-block");
            block?.classList.toggle("wrap-enabled");
          });
        }
      });
    }

    // ═════════════════════════════════════════════════════════════════
    // UTILITIES
    // ═════════════════════════════════════════════════════════════════

    escapeHtml(str) {
      const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      };
      return str.replace(/[&<>"']/g, (m) => map[m]);
    }

    loadConfig() {
      try {
        const saved = localStorage.getItem("bael_formatter_config");
        if (saved) {
          Object.assign(this.config, JSON.parse(saved));
        }
      } catch (e) {}
    }

    saveConfig() {
      localStorage.setItem(
        "bael_formatter_config",
        JSON.stringify(this.config),
      );
    }

    // ═════════════════════════════════════════════════════════════════
    // STYLES
    // ═════════════════════════════════════════════════════════════════

    addStyles() {
      if (document.getElementById("bael-formatter-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-formatter-styles";
      styles.textContent = `
                /* Code Blocks */
                .code-block {
                    background: var(--color-surface, #0d1117);
                    border: 1px solid var(--color-border, #30363d);
                    border-radius: 12px;
                    margin: 16px 0;
                    overflow: hidden;
                }

                .code-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 8px 16px;
                    background: rgba(0,0,0,0.2);
                    border-bottom: 1px solid var(--color-border, #30363d);
                }

                .code-lang {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--color-text-muted, #8b949e);
                    text-transform: uppercase;
                }

                .code-actions {
                    display: flex;
                    gap: 8px;
                }

                .code-btn {
                    padding: 4px 8px;
                    background: transparent;
                    border: none;
                    color: var(--color-text-muted, #8b949e);
                    cursor: pointer;
                    font-size: 12px;
                    border-radius: 4px;
                }

                .code-btn:hover {
                    background: rgba(255,255,255,0.1);
                }

                .code-container {
                    display: flex;
                    overflow-x: auto;
                }

                .line-numbers {
                    display: flex;
                    flex-direction: column;
                    padding: 16px 12px;
                    background: rgba(0,0,0,0.2);
                    text-align: right;
                    user-select: none;
                    border-right: 1px solid var(--color-border, #30363d);
                }

                .line-numbers span {
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 12px;
                    line-height: 1.6;
                    color: var(--color-text-muted, #6e7681);
                }

                .code-block pre {
                    margin: 0;
                    padding: 16px;
                    flex: 1;
                    overflow-x: auto;
                }

                .code-block code {
                    font-family: 'JetBrains Mono', 'Fira Code', monospace;
                    font-size: 13px;
                    line-height: 1.6;
                    color: var(--color-text, #c9d1d9);
                }

                .code-block.wrap-enabled pre {
                    white-space: pre-wrap;
                    word-break: break-word;
                }

                /* Syntax Highlighting */
                .hl-keyword { color: #ff7b72; }
                .hl-string { color: #a5d6ff; }
                .hl-comment { color: #8b949e; font-style: italic; }
                .hl-number { color: #79c0ff; }
                .hl-function { color: #d2a8ff; }
                .hl-type { color: #ffa657; }
                .hl-decorator { color: #ffa657; }
                .hl-variable { color: #79c0ff; }

                /* Inline Code */
                .inline-code {
                    background: rgba(110,118,129,0.2);
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 0.9em;
                }

                /* Tables */
                .table-wrapper {
                    overflow-x: auto;
                    margin: 16px 0;
                }

                .md-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 14px;
                }

                .md-table th,
                .md-table td {
                    padding: 10px 16px;
                    border: 1px solid var(--color-border, #30363d);
                    text-align: left;
                }

                .md-table th {
                    background: var(--color-surface, #161b22);
                    font-weight: 600;
                }

                .md-table tr:nth-child(even) {
                    background: rgba(0,0,0,0.1);
                }

                /* Blockquotes */
                blockquote {
                    margin: 16px 0;
                    padding: 12px 20px;
                    border-left: 4px solid var(--color-primary, #ff3366);
                    background: rgba(255,51,102,0.05);
                    font-style: italic;
                    color: var(--color-text-muted, #8b949e);
                }

                /* Math */
                .math-block {
                    display: block;
                    padding: 20px;
                    background: var(--color-surface, #161b22);
                    border-radius: 10px;
                    text-align: center;
                    font-size: 18px;
                    margin: 16px 0;
                    font-family: 'Times New Roman', serif;
                }

                .math-inline {
                    font-family: 'Times New Roman', serif;
                    padding: 0 4px;
                }

                .frac {
                    display: inline-flex;
                    flex-direction: column;
                    align-items: center;
                    font-size: 0.8em;
                    vertical-align: middle;
                }

                .frac .num {
                    border-bottom: 1px solid currentColor;
                    padding-bottom: 2px;
                }

                .frac .denom {
                    padding-top: 2px;
                }

                /* Diagrams */
                .diagram-block {
                    margin: 16px 0;
                    border: 1px solid var(--color-border, #30363d);
                    border-radius: 12px;
                    overflow: hidden;
                }

                .diagram-header {
                    padding: 8px 16px;
                    background: var(--color-surface, #161b22);
                    border-bottom: 1px solid var(--color-border, #30363d);
                    font-size: 12px;
                    color: var(--color-text-muted, #8b949e);
                }

                .diagram-content {
                    padding: 20px;
                    background: var(--color-panel, #0d1117);
                }

                .simple-diagram {
                    width: 100%;
                    max-height: 300px;
                }

                .simple-diagram .node {
                    fill: var(--color-surface, #21262d);
                    stroke: var(--color-border, #30363d);
                    stroke-width: 2;
                }

                .simple-diagram text {
                    fill: var(--color-text, #c9d1d9);
                    font-size: 12px;
                }

                .simple-diagram .edge {
                    stroke: var(--color-primary, #ff3366);
                    stroke-width: 2;
                }

                .simple-diagram .arrow {
                    fill: var(--color-primary, #ff3366);
                }

                /* Images */
                .md-image {
                    max-width: 100%;
                    border-radius: 8px;
                    margin: 16px 0;
                }

                /* Headers */
                h1, h2, h3, h4, h5, h6 {
                    margin: 20px 0 10px;
                    font-weight: 600;
                    line-height: 1.3;
                }

                h1 { font-size: 28px; }
                h2 { font-size: 24px; }
                h3 { font-size: 20px; }
                h4 { font-size: 18px; }
                h5 { font-size: 16px; }
                h6 { font-size: 14px; color: var(--color-text-muted, #8b949e); }

                /* Links */
                a {
                    color: var(--color-primary, #ff3366);
                    text-decoration: none;
                }

                a:hover {
                    text-decoration: underline;
                }

                /* Lists */
                ul, ol {
                    margin: 12px 0;
                    padding-left: 24px;
                }

                li {
                    margin: 6px 0;
                }

                /* HR */
                hr {
                    border: none;
                    height: 1px;
                    background: var(--color-border, #30363d);
                    margin: 24px 0;
                }
            `;
      document.head.appendChild(styles);
    }

    // ═════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═════════════════════════════════════════════════════════════════

    setConfig(key, value) {
      this.config[key] = value;
      this.saveConfig();
    }

    getConfig(key) {
      return this.config[key];
    }
  }

  window.BaelResponseFormatter = new BaelResponseFormatter();
})();
