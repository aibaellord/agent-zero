/**
 * BAEL Template - Template Engine System
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete template system:
 * - String interpolation
 * - Conditionals & loops
 * - Partials
 * - Filters
 * - Caching & precompilation
 */

(function () {
  "use strict";

  class BaelTemplate {
    constructor() {
      this.templates = new Map();
      this.partials = new Map();
      this.filters = new Map();
      this.cache = new Map();
      this.config = {
        delimiters: ["{{", "}}"],
        escape: true,
        cache: true,
      };

      // Built-in filters
      this._registerBuiltinFilters();

      console.log("📝 Bael Template initialized");
    }

    // ═══════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════

    configure(options) {
      Object.assign(this.config, options);
      return this;
    }

    setDelimiters(open, close) {
      this.config.delimiters = [open, close];
      this.cache.clear();
      return this;
    }

    // ═══════════════════════════════════════════════════════════
    // TEMPLATE REGISTRATION
    // ═══════════════════════════════════════════════════════════

    register(name, template) {
      this.templates.set(name, template);
      this.cache.delete(name);
      return this;
    }

    get(name) {
      return this.templates.get(name);
    }

    has(name) {
      return this.templates.has(name);
    }

    remove(name) {
      this.templates.delete(name);
      this.cache.delete(name);
    }

    // ═══════════════════════════════════════════════════════════
    // PARTIALS
    // ═══════════════════════════════════════════════════════════

    partial(name, template) {
      this.partials.set(name, template);
      return this;
    }

    getPartial(name) {
      return this.partials.get(name);
    }

    // ═══════════════════════════════════════════════════════════
    // FILTERS
    // ═══════════════════════════════════════════════════════════

    filter(name, fn) {
      this.filters.set(name, fn);
      return this;
    }

    getFilter(name) {
      return this.filters.get(name);
    }

    _registerBuiltinFilters() {
      // String filters
      this.filter("upper", (v) => String(v).toUpperCase());
      this.filter("lower", (v) => String(v).toLowerCase());
      this.filter(
        "capitalize",
        (v) => String(v).charAt(0).toUpperCase() + String(v).slice(1),
      );
      this.filter("trim", (v) => String(v).trim());
      this.filter("truncate", (v, len = 50) => {
        const s = String(v);
        return s.length > len ? s.slice(0, len) + "..." : s;
      });
      this.filter("replace", (v, search, replacement) =>
        String(v).replace(new RegExp(search, "g"), replacement),
      );
      this.filter("split", (v, sep) => String(v).split(sep));
      this.filter("join", (v, sep = ", ") =>
        Array.isArray(v) ? v.join(sep) : v,
      );
      this.filter("reverse", (v) =>
        Array.isArray(v)
          ? [...v].reverse()
          : String(v).split("").reverse().join(""),
      );
      this.filter("slice", (v, start, end) => v.slice(start, end));

      // Number filters
      this.filter("round", (v, decimals = 0) => Number(v).toFixed(decimals));
      this.filter("floor", (v) => Math.floor(Number(v)));
      this.filter("ceil", (v) => Math.ceil(Number(v)));
      this.filter("abs", (v) => Math.abs(Number(v)));
      this.filter("currency", (v, currency = "USD") => {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency,
        }).format(v);
      });
      this.filter(
        "percent",
        (v, decimals = 0) => (Number(v) * 100).toFixed(decimals) + "%",
      );

      // Date filters
      this.filter("date", (v, format = "YYYY-MM-DD") => {
        const d = v instanceof Date ? v : new Date(v);
        return format
          .replace("YYYY", d.getFullYear())
          .replace("MM", String(d.getMonth() + 1).padStart(2, "0"))
          .replace("DD", String(d.getDate()).padStart(2, "0"))
          .replace("HH", String(d.getHours()).padStart(2, "0"))
          .replace("mm", String(d.getMinutes()).padStart(2, "0"))
          .replace("ss", String(d.getSeconds()).padStart(2, "0"));
      });
      this.filter("relative", (v) => {
        const d = v instanceof Date ? v : new Date(v);
        const diff = Date.now() - d.getTime();
        const seconds = Math.floor(diff / 1000);
        if (seconds < 60) return "just now";
        if (seconds < 3600) return Math.floor(seconds / 60) + " minutes ago";
        if (seconds < 86400) return Math.floor(seconds / 3600) + " hours ago";
        return Math.floor(seconds / 86400) + " days ago";
      });

      // Collection filters
      this.filter("first", (v) => (Array.isArray(v) ? v[0] : v));
      this.filter("last", (v) => (Array.isArray(v) ? v[v.length - 1] : v));
      this.filter("length", (v) => v?.length || 0);
      this.filter(
        "size",
        (v) => v?.length || v?.size || Object.keys(v || {}).length,
      );
      this.filter("sort", (v, key) => {
        if (!Array.isArray(v)) return v;
        if (key) return [...v].sort((a, b) => (a[key] > b[key] ? 1 : -1));
        return [...v].sort();
      });
      this.filter("unique", (v) => (Array.isArray(v) ? [...new Set(v)] : v));
      this.filter("pluck", (v, key) =>
        Array.isArray(v) ? v.map((item) => item[key]) : v,
      );
      this.filter("where", (v, key, value) => {
        if (!Array.isArray(v)) return v;
        return v.filter((item) => item[key] === value);
      });

      // Boolean filters
      this.filter("default", (v, def) => (v == null || v === "" ? def : v));
      this.filter("json", (v, indent) => JSON.stringify(v, null, indent));
      this.filter("escape", (v) => this._escapeHtml(String(v)));
      this.filter("raw", (v) => v);
    }

    // ═══════════════════════════════════════════════════════════
    // RENDERING
    // ═══════════════════════════════════════════════════════════

    render(template, data = {}) {
      const compiled = this.compile(template);
      return compiled(data);
    }

    renderNamed(name, data = {}) {
      const template = this.templates.get(name);
      if (!template) {
        throw new Error(`Template "${name}" not found`);
      }
      return this.render(template, data);
    }

    compile(template) {
      const cacheKey = template;

      if (this.config.cache && this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const fn = this._compile(template);

      if (this.config.cache) {
        this.cache.set(cacheKey, fn);
      }

      return fn;
    }

    _compile(template) {
      const [open, close] = this.config.delimiters;
      const openEsc = this._escapeRegex(open);
      const closeEsc = this._escapeRegex(close);

      // Pre-process includes/partials
      template = this._processPartials(template);

      // Build function body
      let code = 'let __output = "";\n';
      code += "const __escape = this._escapeHtml.bind(this);\n";
      code += "const __filters = this.filters;\n";

      const regex = new RegExp(`${openEsc}([#/^]?)([^}]+?)${closeEsc}`, "g");
      let lastIndex = 0;
      let match;
      const stack = [];

      while ((match = regex.exec(template)) !== null) {
        // Add text before tag
        const text = template.slice(lastIndex, match.index);
        if (text) {
          code += `__output += ${JSON.stringify(text)};\n`;
        }

        const [fullMatch, prefix, content] = match;
        const trimmedContent = content.trim();

        if (prefix === "#") {
          // Block start
          const parts = trimmedContent.split(/\s+/);
          const keyword = parts[0];
          const expr = parts.slice(1).join(" ");

          if (keyword === "if") {
            code += `if (${this._parseExpression(expr)}) {\n`;
            stack.push("if");
          } else if (keyword === "unless") {
            code += `if (!(${this._parseExpression(expr)})) {\n`;
            stack.push("if");
          } else if (keyword === "each") {
            const [iterVar, , collection] = expr.split(/\s+/);
            code += `for (let __i = 0; __i < (${this._parseExpression(collection)})?.length || 0; __i++) {\n`;
            code += `  const ${iterVar} = (${this._parseExpression(collection)})[__i];\n`;
            code += `  const __index = __i;\n`;
            stack.push("each");
          } else if (keyword === "with") {
            code += `{ const __ctx = ${this._parseExpression(expr)};\n`;
            stack.push("with");
          }
        } else if (prefix === "/") {
          // Block end
          const last = stack.pop();
          if (last === "with") {
            code += "}\n";
          } else {
            code += "}\n";
          }
        } else if (prefix === "^") {
          // Inverse block
          const parts = trimmedContent.split(/\s+/);
          const keyword = parts[0];
          const expr = parts.slice(1).join(" ");

          if (keyword === "if") {
            code += `if (!(${this._parseExpression(expr)})) {\n`;
            stack.push("if");
          }
        } else {
          // Output expression
          const { expression, raw } = this._parseOutput(trimmedContent);
          const shouldEscape = this.config.escape && !raw;

          if (shouldEscape) {
            code += `__output += __escape(String(${expression} ?? ''));\n`;
          } else {
            code += `__output += String(${expression} ?? '');\n`;
          }
        }

        lastIndex = regex.lastIndex;
      }

      // Add remaining text
      const remaining = template.slice(lastIndex);
      if (remaining) {
        code += `__output += ${JSON.stringify(remaining)};\n`;
      }

      code += "return __output;";

      // Create function
      try {
        const fn = new Function("__data", `with (__data) {\n${code}\n}`);
        return (data) => fn.call(this, data);
      } catch (e) {
        console.error("Template compilation error:", e);
        console.error("Generated code:", code);
        throw e;
      }
    }

    _parseExpression(expr) {
      // Handle filters
      if (expr.includes("|")) {
        return this._applyFilters(expr);
      }
      return expr;
    }

    _parseOutput(content) {
      let raw = false;
      let expression = content;

      // Check for raw output
      if (expression.startsWith("{") && expression.endsWith("}")) {
        raw = true;
        expression = expression.slice(1, -1);
      } else if (expression.startsWith("&")) {
        raw = true;
        expression = expression.slice(1).trim();
      }

      expression = this._parseExpression(expression);

      return { expression, raw };
    }

    _applyFilters(expr) {
      const parts = expr.split("|").map((p) => p.trim());
      let result = parts[0];

      for (let i = 1; i < parts.length; i++) {
        const filterExpr = parts[i];
        const match = filterExpr.match(/^(\w+)(?:\(([^)]*)\))?$/);

        if (match) {
          const [, filterName, args] = match;
          const argList = args ? `, ${args}` : "";
          result = `__filters.get('${filterName}')(${result}${argList})`;
        }
      }

      return result;
    }

    _processPartials(template) {
      const [open, close] = this.config.delimiters;
      const openEsc = this._escapeRegex(open);
      const closeEsc = this._escapeRegex(close);
      const regex = new RegExp(`${openEsc}>\\s*(\\w+)\\s*${closeEsc}`, "g");

      return template.replace(regex, (match, name) => {
        const partial = this.partials.get(name);
        return partial || "";
      });
    }

    _escapeHtml(str) {
      const entities = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      };
      return str.replace(/[&<>"']/g, (c) => entities[c]);
    }

    _escapeRegex(str) {
      return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }

    // ═══════════════════════════════════════════════════════════
    // STRING INTERPOLATION (Simple)
    // ═══════════════════════════════════════════════════════════

    interpolate(str, data) {
      return str.replace(/\${(\w+(?:\.\w+)*)}/g, (match, path) => {
        return this._getPath(data, path) ?? "";
      });
    }

    _getPath(obj, path) {
      return path.split(".").reduce((o, k) => o?.[k], obj);
    }

    // ═══════════════════════════════════════════════════════════
    // TAGGED TEMPLATE LITERAL
    // ═══════════════════════════════════════════════════════════

    tag(strings, ...values) {
      return strings.reduce((result, str, i) => {
        const value = values[i] ?? "";
        const escaped = this.config.escape
          ? this._escapeHtml(String(value))
          : value;
        return result + str + escaped;
      }, "");
    }

    // Create safe HTML tagged template
    html(strings, ...values) {
      return strings.reduce((result, str, i) => {
        let value = values[i];
        if (value === undefined || value === null) value = "";

        // Don't escape if marked as raw
        if (value && value.__raw) {
          return result + str + value.value;
        }

        return result + str + this._escapeHtml(String(value));
      }, "");
    }

    raw(value) {
      return { __raw: true, value };
    }

    // ═══════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════

    clearCache() {
      this.cache.clear();
      return this;
    }

    list() {
      return [...this.templates.keys()];
    }

    listPartials() {
      return [...this.partials.keys()];
    }

    listFilters() {
      return [...this.filters.keys()];
    }
  }

  // Initialize
  window.BaelTemplate = new BaelTemplate();

  // Global shortcuts
  window.$template = window.BaelTemplate;
  window.$render = (tpl, data) => window.BaelTemplate.render(tpl, data);
  window.$html = window.BaelTemplate.html.bind(window.BaelTemplate);

  console.log("📝 Bael Template ready");
})();
