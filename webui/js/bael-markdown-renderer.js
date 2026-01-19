/**
 * BAEL - LORD OF ALL
 * Markdown Renderer - Enhanced markdown rendering with syntax highlighting
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelMarkdownRenderer {
    constructor() {
      this.codeBlockIndex = 0;
      this.init();
    }

    init() {
      this.addStyles();
      this.observeMessages();
      console.log("📝 Bael Markdown Renderer initialized");
    }

    addStyles() {
      const styles = document.createElement("style");
      styles.id = "bael-markdown-styles";
      styles.textContent = `
                /* Code Blocks */
                .bael-code-block {
                    position: relative;
                    margin: 12px 0;
                    border-radius: 10px;
                    overflow: hidden;
                    background: #1a1a2e;
                    border: 1px solid var(--bael-border, #2a2a3a);
                }

                .bael-code-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 8px 14px;
                    background: #12121a;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .bael-code-lang {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--bael-accent, #ff3366);
                    text-transform: uppercase;
                }

                .bael-code-actions {
                    display: flex;
                    gap: 6px;
                }

                .bael-code-btn {
                    padding: 4px 10px;
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 4px;
                    color: var(--bael-text-muted, #666);
                    font-size: 10px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    transition: all 0.2s ease;
                }

                .bael-code-btn:hover {
                    border-color: var(--bael-accent, #ff3366);
                    color: var(--bael-text-primary, #fff);
                }

                .bael-code-content {
                    padding: 14px;
                    overflow-x: auto;
                    font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
                    font-size: 13px;
                    line-height: 1.5;
                    tab-size: 4;
                }

                .bael-code-content code {
                    background: transparent !important;
                    padding: 0 !important;
                    color: #e0e0e0;
                }

                /* Syntax Highlighting */
                .bael-code-content .keyword { color: #ff79c6; }
                .bael-code-content .string { color: #f1fa8c; }
                .bael-code-content .comment { color: #6272a4; font-style: italic; }
                .bael-code-content .number { color: #bd93f9; }
                .bael-code-content .function { color: #50fa7b; }
                .bael-code-content .operator { color: #ff79c6; }
                .bael-code-content .class-name { color: #8be9fd; }
                .bael-code-content .variable { color: #f8f8f2; }
                .bael-code-content .punctuation { color: #f8f8f2; }
                .bael-code-content .property { color: #66d9ef; }
                .bael-code-content .tag { color: #ff79c6; }
                .bael-code-content .attr-name { color: #50fa7b; }
                .bael-code-content .attr-value { color: #f1fa8c; }

                /* Inline Code */
                .bael-inline-code {
                    padding: 2px 6px;
                    background: rgba(255, 51, 102, 0.1);
                    border: 1px solid rgba(255, 51, 102, 0.2);
                    border-radius: 4px;
                    font-family: 'Monaco', 'Menlo', monospace;
                    font-size: 0.9em;
                    color: var(--bael-accent, #ff3366);
                }

                /* Tables */
                .bael-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 12px 0;
                    font-size: 13px;
                }

                .bael-table th,
                .bael-table td {
                    padding: 10px 14px;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    text-align: left;
                }

                .bael-table th {
                    background: var(--bael-bg-secondary, #12121a);
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .bael-table tr:nth-child(even) {
                    background: rgba(255, 255, 255, 0.02);
                }

                /* Blockquotes */
                .bael-blockquote {
                    margin: 12px 0;
                    padding: 12px 16px;
                    border-left: 4px solid var(--bael-accent, #ff3366);
                    background: rgba(255, 51, 102, 0.05);
                    border-radius: 0 8px 8px 0;
                    color: var(--bael-text-muted, #888);
                    font-style: italic;
                }

                /* Lists */
                .bael-list {
                    margin: 8px 0;
                    padding-left: 24px;
                }

                .bael-list li {
                    margin: 6px 0;
                    line-height: 1.5;
                }

                .bael-list-ordered {
                    list-style-type: decimal;
                }

                .bael-list-unordered {
                    list-style-type: none;
                }

                .bael-list-unordered li::before {
                    content: '▸';
                    color: var(--bael-accent, #ff3366);
                    margin-right: 8px;
                }

                /* Task Lists */
                .bael-task-item {
                    display: flex;
                    align-items: flex-start;
                    gap: 8px;
                    margin: 6px 0;
                    list-style: none;
                }

                .bael-task-checkbox {
                    width: 18px;
                    height: 18px;
                    border: 2px solid var(--bael-border, #2a2a3a);
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                    margin-top: 2px;
                }

                .bael-task-checkbox.checked {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                }

                .bael-task-checkbox.checked::after {
                    content: '✓';
                    color: #fff;
                    font-size: 12px;
                    font-weight: bold;
                }

                /* Headers */
                .bael-h1, .bael-h2, .bael-h3, .bael-h4 {
                    margin: 16px 0 8px 0;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .bael-h1 { font-size: 1.8em; border-bottom: 1px solid var(--bael-border, #2a2a3a); padding-bottom: 8px; }
                .bael-h2 { font-size: 1.5em; }
                .bael-h3 { font-size: 1.25em; }
                .bael-h4 { font-size: 1.1em; }

                /* Links */
                .bael-link {
                    color: var(--bael-accent, #ff3366);
                    text-decoration: none;
                    border-bottom: 1px dashed rgba(255, 51, 102, 0.3);
                    transition: all 0.2s ease;
                }

                .bael-link:hover {
                    border-bottom-style: solid;
                }

                /* Horizontal Rule */
                .bael-hr {
                    border: none;
                    height: 1px;
                    background: var(--bael-border, #2a2a3a);
                    margin: 20px 0;
                }

                /* Math/KaTeX (if present) */
                .bael-math {
                    padding: 12px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-radius: 8px;
                    margin: 8px 0;
                    overflow-x: auto;
                }

                /* Images */
                .bael-image {
                    max-width: 100%;
                    border-radius: 8px;
                    margin: 12px 0;
                }
            `;
      document.head.appendChild(styles);
    }

    observeMessages() {
      // Process existing messages
      this.processMessages();

      // Watch for new messages
      const observer = new MutationObserver(() => {
        this.processMessages();
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    processMessages() {
      // Find code blocks that haven't been processed
      const codeBlocks = document.querySelectorAll(
        "pre:not(.bael-processed), code:not(.bael-processed):not(pre code)",
      );

      codeBlocks.forEach((block) => {
        if (block.tagName === "PRE") {
          this.processCodeBlock(block);
        } else if (block.tagName === "CODE" && !block.closest("pre")) {
          this.processInlineCode(block);
        }
      });
    }

    processCodeBlock(pre) {
      pre.classList.add("bael-processed");

      const code = pre.querySelector("code") || pre;
      const text = code.textContent;
      const lang = this.detectLanguage(code);

      // Create wrapper
      const wrapper = document.createElement("div");
      wrapper.className = "bael-code-block";
      wrapper.innerHTML = `
                <div class="bael-code-header">
                    <span class="bael-code-lang">${lang}</span>
                    <div class="bael-code-actions">
                        <button class="bael-code-btn copy-btn">📋 Copy</button>
                        <button class="bael-code-btn exec-btn" style="${["python", "javascript", "bash", "shell"].includes(lang) ? "" : "display:none"}">▶ Run</button>
                    </div>
                </div>
                <div class="bael-code-content">
                    <code>${this.highlightSyntax(text, lang)}</code>
                </div>
            `;

      // Copy button
      wrapper.querySelector(".copy-btn").addEventListener("click", () => {
        navigator.clipboard.writeText(text);
        if (window.BaelNotifications) {
          window.BaelNotifications.success("Code copied!");
        }
      });

      // Execute button
      wrapper.querySelector(".exec-btn").addEventListener("click", () => {
        if (window.BaelCodePlayground) {
          window.BaelCodePlayground.toggle();
          // Set code in playground
          const editor = document.querySelector("#pg-code-input");
          if (editor) {
            editor.value = text;
            editor.dispatchEvent(new Event("input"));
          }
        }
      });

      pre.parentNode.replaceChild(wrapper, pre);
    }

    processInlineCode(code) {
      code.classList.add("bael-processed");
      code.classList.add("bael-inline-code");
    }

    detectLanguage(codeElement) {
      // Check class names
      const classes = codeElement.className.split(" ");
      for (const cls of classes) {
        if (cls.startsWith("language-")) {
          return cls.replace("language-", "");
        }
        if (cls.startsWith("lang-")) {
          return cls.replace("lang-", "");
        }
      }

      // Try to auto-detect
      const code = codeElement.textContent;

      if (
        code.includes("def ") ||
        (code.includes("import ") && code.includes(":"))
      )
        return "python";
      if (
        code.includes("function") ||
        code.includes("=>") ||
        code.includes("const ")
      )
        return "javascript";
      if (
        code.includes("#!/bin/bash") ||
        code.match(/^\s*(ls|cd|mkdir|echo|cat|grep)/m)
      )
        return "bash";
      if (
        code.includes("SELECT") ||
        (code.includes("FROM") && code.includes("WHERE"))
      )
        return "sql";
      if (code.includes("<html") || code.includes("<!DOCTYPE")) return "html";
      if (code.includes("{") && code.includes(":") && code.includes(";"))
        return "css";
      if (code.includes("package ") || code.includes("public class"))
        return "java";
      if (code.includes("#include") || code.includes("int main")) return "c";
      if (code.includes("func ") || code.includes("package main")) return "go";
      if (code.includes("fn ") || code.includes("let mut")) return "rust";

      return "code";
    }

    highlightSyntax(code, lang) {
      // Simple syntax highlighting
      let highlighted = this.escapeHtml(code);

      // Language-specific patterns
      const patterns = {
        keyword:
          /\b(if|else|for|while|return|function|const|let|var|class|import|from|export|default|async|await|try|catch|throw|new|this|def|lambda|yield|with|as|in|not|and|or|is|True|False|None|public|private|protected|static|void|int|float|double|string|bool|null|undefined|package|interface|struct|enum|trait|impl|fn|mut|use|mod|pub|crate|self|super|match|where|type|alias)\b/g,
        string: /(["'`])(?:(?!\1)[^\\]|\\.)*?\1/g,
        comment:
          /(\/\/.*$|\/\*[\s\S]*?\*\/|#(?!!).*$|"""[\s\S]*?"""|'''[\s\S]*?''')/gm,
        number:
          /\b(\d+\.?\d*([eE][+-]?\d+)?|0x[0-9a-fA-F]+|0b[01]+|0o[0-7]+)\b/g,
        function: /\b([a-zA-Z_]\w*)\s*(?=\()/g,
        operator: /([+\-*/%=<>!&|^~?:]+|=>)/g,
        className: /\b([A-Z][a-zA-Z0-9_]*)\b/g,
      };

      // Apply patterns (order matters)
      highlighted = highlighted
        .replace(patterns.comment, '<span class="comment">$1</span>')
        .replace(patterns.string, '<span class="string">$&</span>')
        .replace(patterns.number, '<span class="number">$1</span>')
        .replace(patterns.keyword, '<span class="keyword">$1</span>')
        .replace(patterns.function, '<span class="function">$1</span>')
        .replace(patterns.className, '<span class="class-name">$1</span>');

      return highlighted;
    }

    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }
  }

  // Initialize
  window.BaelMarkdownRenderer = new BaelMarkdownRenderer();
})();
