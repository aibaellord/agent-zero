/**
 * BAEL Docs - Documentation & API Explorer
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete documentation system:
 * - Runtime API documentation
 * - Method introspection
 * - Example generation
 * - Interactive explorer
 * - Markdown export
 */

(function () {
  "use strict";

  class BaelDocs {
    constructor() {
      this.registry = new Map();
      this.examples = new Map();
      this.categories = new Map();
      console.log("📚 Bael Docs initialized");
    }

    // ═══════════════════════════════════════════════════════════
    // REGISTRATION
    // ═══════════════════════════════════════════════════════════

    register(name, target, options = {}) {
      const doc = this.introspect(target, name, options);
      this.registry.set(name, doc);

      if (options.category) {
        if (!this.categories.has(options.category)) {
          this.categories.set(options.category, []);
        }
        this.categories.get(options.category).push(name);
      }

      return this;
    }

    introspect(target, name, options = {}) {
      const doc = {
        name,
        type: this.getType(target),
        description: options.description || "",
        category: options.category || "General",
        version: options.version || "1.0.0",
        methods: [],
        properties: [],
        events: options.events || [],
        examples: options.examples || [],
        source: options.source || null,
      };

      if (typeof target === "function") {
        // Class or function
        doc.constructor = this.introspectFunction(target);

        // Static methods
        Object.getOwnPropertyNames(target).forEach((prop) => {
          if (
            typeof target[prop] === "function" &&
            prop !== "constructor" &&
            prop !== "prototype"
          ) {
            doc.methods.push({
              ...this.introspectFunction(target[prop], prop),
              static: true,
            });
          }
        });

        // Instance methods
        if (target.prototype) {
          Object.getOwnPropertyNames(target.prototype).forEach((prop) => {
            if (
              typeof target.prototype[prop] === "function" &&
              prop !== "constructor"
            ) {
              doc.methods.push(
                this.introspectFunction(target.prototype[prop], prop),
              );
            }
          });
        }
      } else if (typeof target === "object" && target !== null) {
        // Object instance
        Object.keys(target).forEach((key) => {
          if (typeof target[key] === "function") {
            doc.methods.push(this.introspectFunction(target[key], key));
          } else {
            doc.properties.push({
              name: key,
              type: this.getType(target[key]),
              value: this.safeStringify(target[key]),
            });
          }
        });
      }

      return doc;
    }

    introspectFunction(fn, name = fn.name) {
      const source = fn.toString();
      const params = this.extractParams(source);
      const returnType = this.inferReturnType(source);

      return {
        name,
        params,
        returnType,
        async: source.startsWith("async"),
        generator: source.includes("function*"),
        length: fn.length,
        source: source.length < 500 ? source : null,
      };
    }

    extractParams(source) {
      const match = source.match(/\(([^)]*)\)/);
      if (!match) return [];

      const paramsStr = match[1].trim();
      if (!paramsStr) return [];

      return paramsStr.split(",").map((param) => {
        param = param.trim();

        // Handle destructuring
        if (param.startsWith("{") || param.startsWith("[")) {
          return { name: param, type: "object", destructured: true };
        }

        // Handle default values
        const defaultMatch = param.match(/^(\w+)\s*=\s*(.+)$/);
        if (defaultMatch) {
          return {
            name: defaultMatch[1],
            type: this.inferType(defaultMatch[2]),
            default: defaultMatch[2],
          };
        }

        // Handle rest params
        if (param.startsWith("...")) {
          return { name: param.slice(3), type: "array", rest: true };
        }

        return { name: param, type: "any" };
      });
    }

    inferType(value) {
      if (value === "true" || value === "false") return "boolean";
      if (value === "null") return "null";
      if (value === "undefined") return "undefined";
      if (/^['"`]/.test(value)) return "string";
      if (/^-?\d+(\.\d+)?$/.test(value)) return "number";
      if (value.startsWith("[")) return "array";
      if (value.startsWith("{")) return "object";
      if (value.startsWith("()") || value.includes("=>")) return "function";
      return "any";
    }

    inferReturnType(source) {
      if (source.includes("return ")) {
        if (source.includes("Promise")) return "Promise";
        if (source.includes("return true") || source.includes("return false"))
          return "boolean";
        if (source.includes("return null")) return "null | any";
        if (source.includes("return this")) return "this";
        return "any";
      }
      return "void";
    }

    getType(value) {
      if (value === null) return "null";
      if (Array.isArray(value)) return "array";
      if (value instanceof Date) return "Date";
      if (value instanceof RegExp) return "RegExp";
      if (value instanceof Map) return "Map";
      if (value instanceof Set) return "Set";
      if (value instanceof Promise) return "Promise";
      return typeof value;
    }

    safeStringify(value) {
      try {
        if (typeof value === "function") return "[Function]";
        return JSON.stringify(value);
      } catch {
        return String(value);
      }
    }

    // ═══════════════════════════════════════════════════════════
    // EXAMPLES
    // ═══════════════════════════════════════════════════════════

    addExample(apiName, example) {
      if (!this.examples.has(apiName)) {
        this.examples.set(apiName, []);
      }
      this.examples.get(apiName).push({
        title: example.title || "Example",
        description: example.description || "",
        code: example.code,
        output: example.output,
      });
      return this;
    }

    getExamples(apiName) {
      return this.examples.get(apiName) || [];
    }

    // ═══════════════════════════════════════════════════════════
    // DOCUMENTATION RETRIEVAL
    // ═══════════════════════════════════════════════════════════

    get(name) {
      return this.registry.get(name);
    }

    getAll() {
      return [...this.registry.values()];
    }

    getByCategory(category) {
      const names = this.categories.get(category) || [];
      return names.map((n) => this.registry.get(n)).filter(Boolean);
    }

    getCategories() {
      return [...this.categories.keys()];
    }

    search(query) {
      const results = [];
      const queryLower = query.toLowerCase();

      this.registry.forEach((doc, name) => {
        let score = 0;

        if (name.toLowerCase().includes(queryLower)) {
          score += 10;
        }

        if (doc.description.toLowerCase().includes(queryLower)) {
          score += 5;
        }

        doc.methods.forEach((method) => {
          if (method.name.toLowerCase().includes(queryLower)) {
            score += 3;
          }
        });

        if (score > 0) {
          results.push({ doc, score });
        }
      });

      return results.sort((a, b) => b.score - a.score).map((r) => r.doc);
    }

    // ═══════════════════════════════════════════════════════════
    // MARKDOWN EXPORT
    // ═══════════════════════════════════════════════════════════

    toMarkdown(name) {
      const doc = this.registry.get(name);
      if (!doc) return "";

      let md = `# ${doc.name}\n\n`;

      if (doc.description) {
        md += `${doc.description}\n\n`;
      }

      if (doc.version) {
        md += `**Version:** ${doc.version}\n\n`;
      }

      if (doc.category) {
        md += `**Category:** ${doc.category}\n\n`;
      }

      // Constructor
      if (doc.constructor) {
        md += `## Constructor\n\n`;
        md += `\`\`\`javascript\n`;
        md += `new ${doc.name}(${doc.constructor.params.map((p) => p.name).join(", ")})\n`;
        md += `\`\`\`\n\n`;
      }

      // Methods
      if (doc.methods.length > 0) {
        md += `## Methods\n\n`;

        doc.methods.forEach((method) => {
          const modifier = method.static ? "static " : "";
          const async = method.async ? "async " : "";
          const params = method.params
            .map((p) => {
              if (p.default) return `${p.name} = ${p.default}`;
              if (p.rest) return `...${p.name}`;
              return p.name;
            })
            .join(", ");

          md += `### ${modifier}${async}${method.name}(${params})\n\n`;

          if (method.params.length > 0) {
            md += `**Parameters:**\n`;
            method.params.forEach((p) => {
              md += `- \`${p.name}\`: ${p.type}`;
              if (p.default) md += ` (default: ${p.default})`;
              md += `\n`;
            });
            md += `\n`;
          }

          md += `**Returns:** ${method.returnType}\n\n`;
        });
      }

      // Properties
      if (doc.properties.length > 0) {
        md += `## Properties\n\n`;

        doc.properties.forEach((prop) => {
          md += `### ${prop.name}\n\n`;
          md += `**Type:** ${prop.type}\n\n`;
          if (prop.value) {
            md += `**Value:** ${prop.value}\n\n`;
          }
        });
      }

      // Events
      if (doc.events.length > 0) {
        md += `## Events\n\n`;

        doc.events.forEach((event) => {
          md += `### ${event.name}\n\n`;
          if (event.description) {
            md += `${event.description}\n\n`;
          }
        });
      }

      // Examples
      const examples = this.getExamples(name);
      if (examples.length > 0) {
        md += `## Examples\n\n`;

        examples.forEach((ex) => {
          md += `### ${ex.title}\n\n`;
          if (ex.description) {
            md += `${ex.description}\n\n`;
          }
          md += `\`\`\`javascript\n${ex.code}\n\`\`\`\n\n`;
          if (ex.output) {
            md += `**Output:**\n\`\`\`\n${ex.output}\n\`\`\`\n\n`;
          }
        });
      }

      return md;
    }

    toMarkdownAll() {
      let md = `# API Documentation\n\n`;

      md += `## Table of Contents\n\n`;

      this.getCategories().forEach((category) => {
        md += `### ${category}\n\n`;
        const docs = this.getByCategory(category);
        docs.forEach((doc) => {
          md += `- [${doc.name}](#${doc.name.toLowerCase()})\n`;
        });
        md += `\n`;
      });

      md += `---\n\n`;

      this.registry.forEach((doc, name) => {
        md += this.toMarkdown(name);
        md += `---\n\n`;
      });

      return md;
    }

    // ═══════════════════════════════════════════════════════════
    // HTML EXPORT
    // ═══════════════════════════════════════════════════════════

    toHTML(name) {
      const doc = this.registry.get(name);
      if (!doc) return "";

      let html = `<div class="api-doc" id="${name}">`;
      html += `<h1>${doc.name}</h1>`;

      if (doc.description) {
        html += `<p class="description">${doc.description}</p>`;
      }

      if (doc.methods.length > 0) {
        html += `<h2>Methods</h2>`;
        html += `<div class="methods">`;

        doc.methods.forEach((method) => {
          html += `<div class="method">`;
          html += `<h3><code>${method.name}</code></h3>`;

          if (method.params.length > 0) {
            html += `<h4>Parameters</h4><ul>`;
            method.params.forEach((p) => {
              html += `<li><code>${p.name}</code>: ${p.type}</li>`;
            });
            html += `</ul>`;
          }

          html += `<p><strong>Returns:</strong> ${method.returnType}</p>`;
          html += `</div>`;
        });

        html += `</div>`;
      }

      html += `</div>`;
      return html;
    }

    // ═══════════════════════════════════════════════════════════
    // INTERACTIVE EXPLORER
    // ═══════════════════════════════════════════════════════════

    explore() {
      console.log(
        "%c📚 Bael API Explorer",
        "font-size: 18px; font-weight: bold; color: #3498db",
      );
      console.log("");

      this.getCategories().forEach((category) => {
        console.log(`%c${category}`, "font-weight: bold; color: #27ae60");
        const docs = this.getByCategory(category);
        docs.forEach((doc) => {
          console.log(`  ${doc.name}`);
          doc.methods.slice(0, 5).forEach((m) => {
            console.log(`    - ${m.name}()`);
          });
          if (doc.methods.length > 5) {
            console.log(`    ... and ${doc.methods.length - 5} more methods`);
          }
        });
        console.log("");
      });

      console.log(
        '%cUse $docs.get("name") to see full documentation',
        "color: #888",
      );
    }

    help(name) {
      const doc = this.registry.get(name);
      if (!doc) {
        console.log(`No documentation found for "${name}"`);
        return;
      }

      console.log(
        `%c${doc.name}`,
        "font-size: 16px; font-weight: bold; color: #3498db",
      );
      if (doc.description) {
        console.log(doc.description);
      }
      console.log("");

      console.log("%cMethods:", "font-weight: bold");
      doc.methods.forEach((m) => {
        const params = m.params.map((p) => p.name).join(", ");
        console.log(`  ${m.name}(${params}) → ${m.returnType}`);
      });
    }

    // ═══════════════════════════════════════════════════════════
    // AUTO-DOCUMENTATION
    // ═══════════════════════════════════════════════════════════

    autoDocument() {
      // Auto-register all Bael modules
      const baelModules = [
        "BaelCore",
        "BaelDOM",
        "BaelState",
        "BaelEvents",
        "BaelComponents",
        "BaelRouter",
        "BaelStore",
        "BaelHttp",
        "BaelSchema",
        "BaelI18n",
        "BaelWorker",
        "BaelPerformance",
        "BaelDebug",
        "BaelMath",
        "BaelValidate",
      ];

      baelModules.forEach((name) => {
        if (window[name]) {
          this.register(name, window[name], {
            category: "Bael Framework",
            description: `${name} module`,
          });
        }
      });

      return this;
    }
  }

  // Initialize
  window.BaelDocs = new BaelDocs();

  // Global shortcuts
  window.$docs = window.BaelDocs;
  window.$help = (name) => window.BaelDocs.help(name);
  window.$explore = () => window.BaelDocs.explore();

  console.log("📚 Bael Docs ready");
})();
