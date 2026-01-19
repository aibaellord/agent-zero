/**
 * BAEL Debug - Developer Tools & Debugging
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete debugging system:
 * - Console enhancement
 * - Object inspection
 * - Call stack tracing
 * - Breakpoint helpers
 * - State snapshots
 */

(function () {
  "use strict";

  class BaelDebug {
    constructor() {
      this.enabled = true;
      this.level = "debug";
      this.logs = [];
      this.maxLogs = 1000;
      this.watchers = new Map();
      this.breakpoints = new Map();
      this.snapshots = [];
      this.styles = this.createStyles();
      console.log("🔧 Bael Debug initialized");
    }

    createStyles() {
      return {
        log: "color: #888",
        info: "color: #3498db; font-weight: bold",
        warn: "color: #f39c12; font-weight: bold",
        error: "color: #e74c3c; font-weight: bold",
        debug: "color: #9b59b6; font-weight: bold",
        success: "color: #27ae60; font-weight: bold",
        trace: "color: #95a5a6",
        group: "color: #2c3e50; font-weight: bold; font-size: 1.1em",
        table: "color: #16a085",
        time: "color: #e67e22",
      };
    }

    // ═══════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════

    enable() {
      this.enabled = true;
      return this;
    }

    disable() {
      this.enabled = false;
      return this;
    }

    setLevel(level) {
      this.level = level;
      return this;
    }

    isEnabled() {
      return this.enabled;
    }

    // ═══════════════════════════════════════════════════════════
    // LOGGING
    // ═══════════════════════════════════════════════════════════

    log(...args) {
      if (!this.enabled) return;
      this.addToHistory("log", args);
      console.log("%c[LOG]", this.styles.log, ...args);
    }

    info(...args) {
      if (!this.enabled) return;
      this.addToHistory("info", args);
      console.log("%c[INFO]", this.styles.info, ...args);
    }

    warn(...args) {
      if (!this.enabled) return;
      this.addToHistory("warn", args);
      console.warn("%c[WARN]", this.styles.warn, ...args);
    }

    error(...args) {
      if (!this.enabled) return;
      this.addToHistory("error", args);
      console.error("%c[ERROR]", this.styles.error, ...args);
    }

    debug(...args) {
      if (!this.enabled) return;
      this.addToHistory("debug", args);
      console.log("%c[DEBUG]", this.styles.debug, ...args);
    }

    success(...args) {
      if (!this.enabled) return;
      this.addToHistory("success", args);
      console.log("%c[SUCCESS]", this.styles.success, ...args);
    }

    trace(...args) {
      if (!this.enabled) return;
      this.addToHistory("trace", args);
      console.log("%c[TRACE]", this.styles.trace, ...args);
      console.trace();
    }

    addToHistory(type, args) {
      this.logs.push({
        type,
        args: args.map((a) => this.safeClone(a)),
        timestamp: Date.now(),
        stack: new Error().stack,
      });

      if (this.logs.length > this.maxLogs) {
        this.logs.shift();
      }
    }

    getHistory(filter) {
      if (!filter) return [...this.logs];
      if (typeof filter === "string") {
        return this.logs.filter((l) => l.type === filter);
      }
      return this.logs.filter(filter);
    }

    clearHistory() {
      this.logs = [];
      return this;
    }

    // ═══════════════════════════════════════════════════════════
    // GROUPING
    // ═══════════════════════════════════════════════════════════

    group(label) {
      if (!this.enabled) return;
      console.group("%c" + label, this.styles.group);
    }

    groupCollapsed(label) {
      if (!this.enabled) return;
      console.groupCollapsed("%c" + label, this.styles.group);
    }

    groupEnd() {
      if (!this.enabled) return;
      console.groupEnd();
    }

    // ═══════════════════════════════════════════════════════════
    // TABLES
    // ═══════════════════════════════════════════════════════════

    table(data, columns) {
      if (!this.enabled) return;
      console.log("%c[TABLE]", this.styles.table);
      console.table(data, columns);
    }

    // ═══════════════════════════════════════════════════════════
    // TIMING
    // ═══════════════════════════════════════════════════════════

    time(label) {
      if (!this.enabled) return;
      console.time(label);
    }

    timeEnd(label) {
      if (!this.enabled) return;
      console.timeEnd(label);
    }

    timeLog(label, ...args) {
      if (!this.enabled) return;
      console.timeLog(label, ...args);
    }

    // ═══════════════════════════════════════════════════════════
    // OBJECT INSPECTION
    // ═══════════════════════════════════════════════════════════

    inspect(obj, options = {}) {
      const { depth = 2, showHidden = false, showFunctions = true } = options;

      const result = this.inspectValue(
        obj,
        depth,
        new WeakSet(),
        showHidden,
        showFunctions,
      );

      if (this.enabled) {
        console.log("%c[INSPECT]", this.styles.debug, result);
      }

      return result;
    }

    inspectValue(value, depth, seen, showHidden, showFunctions) {
      if (depth < 0) return "...";

      if (value === null) return "null";
      if (value === undefined) return "undefined";

      const type = typeof value;

      if (type === "string") return `"${value}"`;
      if (type === "number" || type === "boolean") return String(value);
      if (type === "symbol") return value.toString();
      if (type === "function") {
        if (!showFunctions) return "[Function]";
        return `[Function: ${value.name || "anonymous"}]`;
      }

      if (type === "object") {
        if (seen.has(value)) return "[Circular]";
        seen.add(value);

        if (Array.isArray(value)) {
          const items = value.map((v) =>
            this.inspectValue(v, depth - 1, seen, showHidden, showFunctions),
          );
          return `[${items.join(", ")}]`;
        }

        if (value instanceof Date) return value.toISOString();
        if (value instanceof RegExp) return value.toString();
        if (value instanceof Error) return `[${value.name}: ${value.message}]`;
        if (value instanceof Map) {
          const entries = [...value.entries()].map(
            ([k, v]) =>
              `${this.inspectValue(k, depth - 1, seen, showHidden, showFunctions)} => ${this.inspectValue(v, depth - 1, seen, showHidden, showFunctions)}`,
          );
          return `Map(${value.size}) { ${entries.join(", ")} }`;
        }
        if (value instanceof Set) {
          const items = [...value].map((v) =>
            this.inspectValue(v, depth - 1, seen, showHidden, showFunctions),
          );
          return `Set(${value.size}) { ${items.join(", ")} }`;
        }

        const props = showHidden
          ? Object.getOwnPropertyNames(value)
          : Object.keys(value);

        const entries = props.map((key) => {
          try {
            return `${key}: ${this.inspectValue(value[key], depth - 1, seen, showHidden, showFunctions)}`;
          } catch {
            return `${key}: [Error accessing property]`;
          }
        });

        const constructor = value.constructor?.name || "Object";
        return constructor === "Object"
          ? `{ ${entries.join(", ")} }`
          : `${constructor} { ${entries.join(", ")} }`;
      }

      return String(value);
    }

    dir(obj) {
      if (!this.enabled) return;
      console.dir(obj, { depth: null });
    }

    dirxml(node) {
      if (!this.enabled) return;
      console.dirxml(node);
    }

    // ═══════════════════════════════════════════════════════════
    // ASSERTIONS
    // ═══════════════════════════════════════════════════════════

    assert(condition, ...args) {
      if (!this.enabled) return;
      console.assert(condition, ...args);
      if (!condition) {
        this.addToHistory("assert", args);
      }
    }

    // ═══════════════════════════════════════════════════════════
    // WATCHERS
    // ═══════════════════════════════════════════════════════════

    watch(obj, prop, callback) {
      const key = `${obj.constructor?.name || "Object"}.${prop}`;
      let value = obj[prop];

      Object.defineProperty(obj, prop, {
        get: () => {
          this.debug(`[WATCH GET] ${key}:`, value);
          return value;
        },
        set: (newValue) => {
          const oldValue = value;
          value = newValue;
          this.debug(`[WATCH SET] ${key}:`, oldValue, "->", newValue);
          callback?.(newValue, oldValue);
        },
        configurable: true,
      });

      this.watchers.set(key, {
        obj,
        prop,
        originalDescriptor: Object.getOwnPropertyDescriptor(obj, prop),
      });

      return () => this.unwatch(obj, prop);
    }

    unwatch(obj, prop) {
      const key = `${obj.constructor?.name || "Object"}.${prop}`;
      const watcher = this.watchers.get(key);

      if (watcher) {
        Object.defineProperty(
          obj,
          prop,
          watcher.originalDescriptor || {
            value: obj[prop],
            writable: true,
            configurable: true,
          },
        );
        this.watchers.delete(key);
      }
    }

    // ═══════════════════════════════════════════════════════════
    // BREAKPOINTS
    // ═══════════════════════════════════════════════════════════

    breakpoint(label, condition = true) {
      if (!this.enabled) return;

      const shouldBreak =
        typeof condition === "function" ? condition() : condition;

      if (shouldBreak) {
        this.info(`[BREAKPOINT] ${label}`);
        debugger;
      }
    }

    conditionalBreak(label, condition) {
      this.breakpoints.set(label, condition);
    }

    checkBreakpoint(label, context = {}) {
      const condition = this.breakpoints.get(label);
      if (
        condition &&
        (typeof condition === "function" ? condition(context) : condition)
      ) {
        this.info(`[BREAKPOINT] ${label}`, context);
        debugger;
      }
    }

    // ═══════════════════════════════════════════════════════════
    // SNAPSHOTS
    // ═══════════════════════════════════════════════════════════

    snapshot(label, data) {
      const snap = {
        label,
        data: this.safeClone(data),
        timestamp: Date.now(),
        stack: new Error().stack,
      };

      this.snapshots.push(snap);
      this.debug(`[SNAPSHOT] ${label}`, snap.data);

      return snap;
    }

    getSnapshots(label) {
      if (label) {
        return this.snapshots.filter((s) => s.label === label);
      }
      return [...this.snapshots];
    }

    compareSnapshots(label1, label2) {
      const snap1 = this.snapshots.find((s) => s.label === label1);
      const snap2 = this.snapshots.find((s) => s.label === label2);

      if (!snap1 || !snap2) {
        return null;
      }

      return this.diff(snap1.data, snap2.data);
    }

    clearSnapshots() {
      this.snapshots = [];
    }

    // ═══════════════════════════════════════════════════════════
    // DIFF
    // ═══════════════════════════════════════════════════════════

    diff(a, b, path = "") {
      const changes = [];

      if (typeof a !== typeof b) {
        changes.push({
          path,
          type: "type",
          from: typeof a,
          to: typeof b,
          oldValue: a,
          newValue: b,
        });
        return changes;
      }

      if (a === b) return changes;

      if (typeof a !== "object" || a === null || b === null) {
        changes.push({ path, type: "value", from: a, to: b });
        return changes;
      }

      const aKeys = Object.keys(a);
      const bKeys = Object.keys(b);

      // Check for added keys
      for (const key of bKeys) {
        if (!aKeys.includes(key)) {
          changes.push({
            path: path ? `${path}.${key}` : key,
            type: "added",
            value: b[key],
          });
        }
      }

      // Check for removed keys
      for (const key of aKeys) {
        if (!bKeys.includes(key)) {
          changes.push({
            path: path ? `${path}.${key}` : key,
            type: "removed",
            value: a[key],
          });
        }
      }

      // Check for changed values
      for (const key of aKeys) {
        if (bKeys.includes(key)) {
          const childChanges = this.diff(
            a[key],
            b[key],
            path ? `${path}.${key}` : key,
          );
          changes.push(...childChanges);
        }
      }

      return changes;
    }

    // ═══════════════════════════════════════════════════════════
    // CALL STACK
    // ═══════════════════════════════════════════════════════════

    getCallStack() {
      const stack = new Error().stack || "";
      return stack
        .split("\n")
        .slice(2)
        .map((line) => {
          const match =
            line.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/) ||
            line.match(/at\s+(.+?):(\d+):(\d+)/);

          if (match) {
            return {
              function: match[1],
              file: match[2],
              line: parseInt(match[3]),
              column: parseInt(match[4] || 0),
            };
          }
          return { raw: line.trim() };
        });
    }

    printStack() {
      const stack = this.getCallStack();
      this.group("Call Stack");
      stack.forEach((frame, i) => {
        if (frame.function) {
          this.log(`${i}: ${frame.function} (${frame.file}:${frame.line})`);
        } else {
          this.log(`${i}: ${frame.raw}`);
        }
      });
      this.groupEnd();
    }

    // ═══════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════

    safeClone(obj) {
      try {
        return JSON.parse(JSON.stringify(obj));
      } catch {
        return obj;
      }
    }

    count(label) {
      if (!this.enabled) return;
      console.count(label);
    }

    countReset(label) {
      if (!this.enabled) return;
      console.countReset(label);
    }

    clear() {
      console.clear();
    }

    // Memory snapshot
    memorySnapshot() {
      if (performance.memory) {
        return {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit,
          timestamp: Date.now(),
        };
      }
      return null;
    }

    // Pretty print
    pretty(obj) {
      if (!this.enabled) return;
      console.log(JSON.stringify(obj, null, 2));
    }

    // Profile function
    profile(label, fn) {
      console.profile(label);
      const result = fn();
      console.profileEnd(label);
      return result;
    }

    // Create labeled logger
    createLogger(prefix) {
      return {
        log: (...args) => this.log(`[${prefix}]`, ...args),
        info: (...args) => this.info(`[${prefix}]`, ...args),
        warn: (...args) => this.warn(`[${prefix}]`, ...args),
        error: (...args) => this.error(`[${prefix}]`, ...args),
        debug: (...args) => this.debug(`[${prefix}]`, ...args),
      };
    }
  }

  // Initialize
  window.BaelDebug = new BaelDebug();

  // Global shortcuts
  window.$debug = window.BaelDebug;
  window.$log = (...args) => window.BaelDebug.log(...args);
  window.$inspect = (obj, opts) => window.BaelDebug.inspect(obj, opts);
  window.$watch = (obj, prop, cb) => window.BaelDebug.watch(obj, prop, cb);

  console.log("🔧 Bael Debug ready");
})();
