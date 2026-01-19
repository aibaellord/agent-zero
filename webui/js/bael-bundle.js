/**
 * BAEL Bundle - Module Bundler & Optimizer
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete bundling system:
 * - Module concatenation
 * - Code minification
 * - Tree shaking simulation
 * - Source maps
 * - Build configuration
 */

(function () {
  "use strict";

  class BaelBundle {
    constructor() {
      this.modules = new Map();
      this.dependencies = new Map();
      this.chunks = new Map();
      this.config = this.defaultConfig();
      console.log("📦 Bael Bundle initialized");
    }

    defaultConfig() {
      return {
        entry: null,
        output: {
          filename: "bundle.js",
          path: "/dist",
        },
        minify: false,
        sourceMaps: false,
        splitChunks: false,
        treeshake: false,
        target: "browser",
      };
    }

    // ═══════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════

    configure(options) {
      this.config = { ...this.config, ...options };
      return this;
    }

    setEntry(entry) {
      this.config.entry = entry;
      return this;
    }

    setOutput(output) {
      this.config.output = { ...this.config.output, ...output };
      return this;
    }

    enableMinify(value = true) {
      this.config.minify = value;
      return this;
    }

    enableSourceMaps(value = true) {
      this.config.sourceMaps = value;
      return this;
    }

    // ═══════════════════════════════════════════════════════════
    // MODULE REGISTRATION
    // ═══════════════════════════════════════════════════════════

    addModule(name, code, options = {}) {
      this.modules.set(name, {
        name,
        code,
        deps: options.deps || [],
        exports: options.exports || [],
        size: code.length,
      });

      // Track dependencies
      if (options.deps) {
        this.dependencies.set(name, options.deps);
      }

      return this;
    }

    removeModule(name) {
      this.modules.delete(name);
      this.dependencies.delete(name);
      return this;
    }

    hasModule(name) {
      return this.modules.has(name);
    }

    getModule(name) {
      return this.modules.get(name);
    }

    // ═══════════════════════════════════════════════════════════
    // DEPENDENCY RESOLUTION
    // ═══════════════════════════════════════════════════════════

    resolveDependencies(entry) {
      const resolved = [];
      const visited = new Set();

      const visit = (name) => {
        if (visited.has(name)) return;
        visited.add(name);

        const deps = this.dependencies.get(name) || [];
        deps.forEach(visit);

        if (this.modules.has(name)) {
          resolved.push(name);
        }
      };

      if (Array.isArray(entry)) {
        entry.forEach(visit);
      } else {
        visit(entry);
      }

      return resolved;
    }

    detectCircular() {
      const circular = [];
      const visited = new Set();
      const stack = new Set();

      const visit = (name, path = []) => {
        if (stack.has(name)) {
          circular.push([...path, name]);
          return;
        }
        if (visited.has(name)) return;

        visited.add(name);
        stack.add(name);

        const deps = this.dependencies.get(name) || [];
        deps.forEach((dep) => visit(dep, [...path, name]));

        stack.delete(name);
      };

      this.modules.forEach((_, name) => visit(name));

      return circular;
    }

    // ═══════════════════════════════════════════════════════════
    // BUNDLING
    // ═══════════════════════════════════════════════════════════

    bundle(entry = this.config.entry) {
      if (!entry) {
        throw new Error("No entry point specified");
      }

      const order = this.resolveDependencies(entry);
      const parts = [];

      // Header
      parts.push(this.generateHeader());

      // Modules
      order.forEach((name) => {
        const module = this.modules.get(name);
        parts.push(this.wrapModule(module));
      });

      // Footer
      parts.push(this.generateFooter(entry));

      let code = parts.join("\n");

      // Minify if enabled
      if (this.config.minify) {
        code = this.minify(code);
      }

      // Generate source map
      let sourceMap = null;
      if (this.config.sourceMaps) {
        sourceMap = this.generateSourceMap(order);
      }

      return {
        code,
        sourceMap,
        modules: order,
        size: code.length,
      };
    }

    generateHeader() {
      return `
(function(modules) {
    var installedModules = {};

    function __require(moduleId) {
        if (installedModules[moduleId]) {
            return installedModules[moduleId].exports;
        }

        var module = installedModules[moduleId] = {
            id: moduleId,
            loaded: false,
            exports: {}
        };

        modules[moduleId].call(module.exports, module, module.exports, __require);
        module.loaded = true;

        return module.exports;
    }

    __require.m = modules;
    __require.c = installedModules;
    __require.d = function(exports, name, getter) {
        if (!__require.o(exports, name)) {
            Object.defineProperty(exports, name, { enumerable: true, get: getter });
        }
    };
    __require.o = function(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop);
    };
    __require.r = function(exports) {
        if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
            Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
        }
        Object.defineProperty(exports, '__esModule', { value: true });
    };

    return __require;
})({`.trim();
    }

    wrapModule(module) {
      return `
    "${module.name}": function(module, exports, __require) {
        ${module.code}
    },`.trim();
    }

    generateFooter(entry) {
      const entryPoint = Array.isArray(entry) ? entry[0] : entry;
      return `
})("${entryPoint}");`.trim();
    }

    // ═══════════════════════════════════════════════════════════
    // MINIFICATION
    // ═══════════════════════════════════════════════════════════

    minify(code) {
      let result = code;

      // Remove comments
      result = result.replace(/\/\*[\s\S]*?\*\//g, "");
      result = result.replace(/\/\/.*$/gm, "");

      // Remove extra whitespace
      result = result.replace(/\s+/g, " ");
      result = result.replace(/\s*([{}:;,=()<>+\-*\/\[\]])\s*/g, "$1");

      // Remove leading/trailing whitespace
      result = result.trim();

      return result;
    }

    // Advanced minification
    minifyAdvanced(code) {
      let result = this.minify(code);

      // Shorten variable names (simplified - production would use proper AST)
      const reserved = [
        "var",
        "let",
        "const",
        "function",
        "return",
        "if",
        "else",
        "for",
        "while",
        "do",
        "switch",
        "case",
        "break",
        "continue",
        "try",
        "catch",
        "finally",
        "throw",
        "new",
        "delete",
        "typeof",
        "void",
        "this",
        "true",
        "false",
        "null",
        "undefined",
      ];

      // This is a simplified approach - real minifiers use proper parsing
      return result;
    }

    // ═══════════════════════════════════════════════════════════
    // SOURCE MAPS
    // ═══════════════════════════════════════════════════════════

    generateSourceMap(modules) {
      const sources = [];
      const mappings = [];

      modules.forEach((name, index) => {
        const module = this.modules.get(name);
        sources.push(name);
        // Simplified mapping
        mappings.push(`AAAA${index === 0 ? "" : ",CAAC"}`);
      });

      return {
        version: 3,
        file: this.config.output.filename,
        sources,
        names: [],
        mappings: mappings.join(";"),
      };
    }

    // ═══════════════════════════════════════════════════════════
    // CHUNK SPLITTING
    // ═══════════════════════════════════════════════════════════

    createChunk(name, modules) {
      const code = modules
        .map((m) => {
          const mod = this.modules.get(m);
          return mod ? mod.code : "";
        })
        .join("\n");

      this.chunks.set(name, {
        name,
        modules,
        code,
        size: code.length,
      });

      return this;
    }

    splitBySize(maxSize = 50000) {
      const chunks = [];
      let currentChunk = [];
      let currentSize = 0;

      this.modules.forEach((module, name) => {
        if (currentSize + module.size > maxSize && currentChunk.length > 0) {
          chunks.push(currentChunk);
          currentChunk = [];
          currentSize = 0;
        }

        currentChunk.push(name);
        currentSize += module.size;
      });

      if (currentChunk.length > 0) {
        chunks.push(currentChunk);
      }

      chunks.forEach((chunk, i) => {
        this.createChunk(`chunk-${i}`, chunk);
      });

      return chunks;
    }

    // ═══════════════════════════════════════════════════════════
    // TREE SHAKING (SIMPLIFIED)
    // ═══════════════════════════════════════════════════════════

    analyzeUsage(entry) {
      const used = new Set();
      const code = this.modules.get(entry)?.code || "";

      // Find all referenced modules
      this.modules.forEach((_, name) => {
        if (
          code.includes(`require('${name}')`) ||
          code.includes(`require("${name}")`) ||
          code.includes(`from '${name}'`) ||
          code.includes(`from "${name}"`)
        ) {
          used.add(name);
        }
      });

      return [...used];
    }

    treeshake(entry) {
      const used = new Set([entry]);

      const analyze = (name) => {
        const deps = this.dependencies.get(name) || [];
        deps.forEach((dep) => {
          if (!used.has(dep)) {
            used.add(dep);
            analyze(dep);
          }
        });
      };

      analyze(entry);

      const unused = [];
      this.modules.forEach((_, name) => {
        if (!used.has(name)) {
          unused.push(name);
        }
      });

      return {
        used: [...used],
        unused,
        savings: unused.reduce((sum, name) => {
          const mod = this.modules.get(name);
          return sum + (mod ? mod.size : 0);
        }, 0),
      };
    }

    // ═══════════════════════════════════════════════════════════
    // STATISTICS
    // ═══════════════════════════════════════════════════════════

    getStats() {
      let totalSize = 0;
      const moduleStats = [];

      this.modules.forEach((module, name) => {
        totalSize += module.size;
        moduleStats.push({
          name,
          size: module.size,
          deps: module.deps.length,
        });
      });

      // Sort by size
      moduleStats.sort((a, b) => b.size - a.size);

      return {
        totalModules: this.modules.size,
        totalSize,
        totalSizeFormatted: this.formatSize(totalSize),
        modules: moduleStats,
        chunks: this.chunks.size,
        circular: this.detectCircular().length,
      };
    }

    formatSize(bytes) {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }

    // ═══════════════════════════════════════════════════════════
    // BUILD
    // ═══════════════════════════════════════════════════════════

    async build() {
      const startTime = performance.now();

      console.log("📦 Starting build...");
      console.log(`   Entry: ${this.config.entry}`);
      console.log(
        `   Output: ${this.config.output.path}/${this.config.output.filename}`,
      );

      // Detect circular dependencies
      const circular = this.detectCircular();
      if (circular.length > 0) {
        console.warn("⚠️ Circular dependencies detected:", circular);
      }

      // Tree shake if enabled
      if (this.config.treeshake) {
        const shake = this.treeshake(this.config.entry);
        console.log(
          `   Tree shaking removed ${shake.unused.length} modules (${this.formatSize(shake.savings)} saved)`,
        );
      }

      // Bundle
      const result = this.bundle();

      const endTime = performance.now();
      const duration = (endTime - startTime).toFixed(2);

      console.log(`✅ Build complete in ${duration}ms`);
      console.log(`   Size: ${this.formatSize(result.size)}`);
      console.log(`   Modules: ${result.modules.length}`);

      return {
        ...result,
        duration: parseFloat(duration),
        config: this.config,
      };
    }

    // ═══════════════════════════════════════════════════════════
    // WATCH MODE (SIMULATED)
    // ═══════════════════════════════════════════════════════════

    watch(onChange) {
      console.log("👀 Watching for changes...");

      // In a real implementation, this would use File System API or similar
      return {
        stop: () => {
          console.log("Stopped watching");
        },
        rebuild: () => {
          console.log("Rebuilding...");
          const result = this.build();
          onChange?.(result);
          return result;
        },
      };
    }
  }

  // Initialize
  window.BaelBundle = new BaelBundle();

  // Global shortcuts
  window.$bundle = window.BaelBundle;

  console.log("📦 Bael Bundle ready");
})();
