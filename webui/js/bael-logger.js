/**
 * BAEL Logger - Advanced Logging System
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete logging with:
 * - Log levels
 * - Namespaces
 * - Formatters
 * - Transports (console, storage, remote)
 * - Log aggregation
 * - Performance timing
 */

(function () {
  "use strict";

  const LOG_LEVELS = {
    trace: 0,
    debug: 1,
    info: 2,
    warn: 3,
    error: 4,
    fatal: 5,
    silent: 6,
  };

  class BaelLogger {
    constructor() {
      this.level = "info";
      this.transports = [];
      this.formatters = [];
      this.logs = [];
      this.maxLogs = 1000;
      this.timers = new Map();
      this.groups = [];
      this.init();
    }

    init() {
      this.addDefaultTransports();
      this.addDefaultFormatters();
      console.log("📝 Bael Logger initialized");
    }

    // Add default transports
    addDefaultTransports() {
      // Console transport
      this.addTransport({
        name: "console",
        handler: (entry) => {
          const method = entry.level === "fatal" ? "error" : entry.level;
          const consoleFn = console[method] || console.log;

          const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
          const namespace = entry.namespace ? `[${entry.namespace}]` : "";

          if (entry.level === "error" || entry.level === "fatal") {
            consoleFn(`${prefix}${namespace}`, entry.message, entry.data || "");
            if (entry.stack) console.error(entry.stack);
          } else {
            consoleFn(`${prefix}${namespace}`, entry.message, entry.data || "");
          }
        },
      });

      // Storage transport (stores in memory and localStorage)
      this.addTransport({
        name: "storage",
        handler: (entry) => {
          // Memory storage
          this.logs.push(entry);
          while (this.logs.length > this.maxLogs) {
            this.logs.shift();
          }

          // LocalStorage for errors only
          if (entry.level === "error" || entry.level === "fatal") {
            try {
              const errors = JSON.parse(
                localStorage.getItem("bael_error_logs") || "[]",
              );
              errors.push(entry);
              while (errors.length > 100) errors.shift();
              localStorage.setItem("bael_error_logs", JSON.stringify(errors));
            } catch (e) {
              // Storage full or unavailable
            }
          }
        },
      });
    }

    // Add default formatters
    addDefaultFormatters() {
      // Timestamp formatter
      this.addFormatter((entry) => {
        entry.timestamp = new Date().toISOString();
        return entry;
      });

      // Error serializer
      this.addFormatter((entry) => {
        if (entry.data instanceof Error) {
          entry.stack = entry.data.stack;
          entry.data = {
            name: entry.data.name,
            message: entry.data.message,
          };
        }
        return entry;
      });
    }

    // Set log level
    setLevel(level) {
      if (LOG_LEVELS[level] !== undefined) {
        this.level = level;
      }
      return this;
    }

    // Check if level is enabled
    isLevelEnabled(level) {
      return LOG_LEVELS[level] >= LOG_LEVELS[this.level];
    }

    // Add transport
    addTransport(transport) {
      this.transports.push(transport);
      return this;
    }

    // Remove transport
    removeTransport(name) {
      this.transports = this.transports.filter((t) => t.name !== name);
      return this;
    }

    // Add formatter
    addFormatter(formatter) {
      this.formatters.push(formatter);
      return this;
    }

    // Core log method
    log(level, message, data, namespace) {
      if (!this.isLevelEnabled(level)) return;

      let entry = {
        level,
        message,
        data,
        namespace,
        groups: [...this.groups],
      };

      // Apply formatters
      for (const formatter of this.formatters) {
        entry = formatter(entry);
      }

      // Send to transports
      for (const transport of this.transports) {
        try {
          transport.handler(entry);
        } catch (e) {
          console.error("Transport error:", e);
        }
      }

      return entry;
    }

    // Level methods
    trace(message, data) {
      return this.log("trace", message, data);
    }

    debug(message, data) {
      return this.log("debug", message, data);
    }

    info(message, data) {
      return this.log("info", message, data);
    }

    warn(message, data) {
      return this.log("warn", message, data);
    }

    error(message, data) {
      return this.log("error", message, data);
    }

    fatal(message, data) {
      return this.log("fatal", message, data);
    }

    // Create namespaced logger
    namespace(name) {
      const logger = this;
      return {
        trace: (message, data) => logger.log("trace", message, data, name),
        debug: (message, data) => logger.log("debug", message, data, name),
        info: (message, data) => logger.log("info", message, data, name),
        warn: (message, data) => logger.log("warn", message, data, name),
        error: (message, data) => logger.log("error", message, data, name),
        fatal: (message, data) => logger.log("fatal", message, data, name),
        time: (label) => logger.time(`${name}:${label}`),
        timeEnd: (label) => logger.timeEnd(`${name}:${label}`),
      };
    }

    // Timing methods
    time(label) {
      this.timers.set(label, performance.now());
      return this;
    }

    timeEnd(label) {
      const start = this.timers.get(label);
      if (start) {
        const duration = performance.now() - start;
        this.debug(`${label}: ${duration.toFixed(2)}ms`);
        this.timers.delete(label);
        return duration;
      }
      return null;
    }

    timeLog(label) {
      const start = this.timers.get(label);
      if (start) {
        const duration = performance.now() - start;
        this.debug(`${label}: ${duration.toFixed(2)}ms (running)`);
        return duration;
      }
      return null;
    }

    // Grouping
    group(name) {
      this.groups.push(name);
      console.group(name);
      return this;
    }

    groupEnd() {
      this.groups.pop();
      console.groupEnd();
      return this;
    }

    // Table logging
    table(data, columns) {
      console.table(data, columns);
      return this;
    }

    // Assert
    assert(condition, message, data) {
      if (!condition) {
        this.error(`Assertion failed: ${message}`, data);
      }
      return this;
    }

    // Count occurrences
    counters = new Map();

    count(label = "default") {
      const count = (this.counters.get(label) || 0) + 1;
      this.counters.set(label, count);
      this.debug(`${label}: ${count}`);
      return count;
    }

    countReset(label = "default") {
      this.counters.delete(label);
      return this;
    }

    // Clear logs
    clear() {
      this.logs = [];
      console.clear();
      return this;
    }

    // Get logs
    getLogs(filter = {}) {
      let logs = [...this.logs];

      if (filter.level) {
        logs = logs.filter((l) => l.level === filter.level);
      }

      if (filter.namespace) {
        logs = logs.filter((l) => l.namespace === filter.namespace);
      }

      if (filter.since) {
        logs = logs.filter((l) => new Date(l.timestamp) >= filter.since);
      }

      if (filter.search) {
        const searchLower = filter.search.toLowerCase();
        logs = logs.filter(
          (l) =>
            l.message.toLowerCase().includes(searchLower) ||
            JSON.stringify(l.data).toLowerCase().includes(searchLower),
        );
      }

      return logs;
    }

    // Export logs
    export(format = "json") {
      if (format === "json") {
        return JSON.stringify(this.logs, null, 2);
      }

      if (format === "csv") {
        const headers = ["timestamp", "level", "namespace", "message", "data"];
        const rows = this.logs.map((log) => [
          log.timestamp,
          log.level,
          log.namespace || "",
          log.message,
          JSON.stringify(log.data || ""),
        ]);
        return [headers, ...rows].map((r) => r.join(",")).join("\n");
      }

      if (format === "text") {
        return this.logs
          .map(
            (log) =>
              `[${log.timestamp}] [${log.level.toUpperCase()}]${log.namespace ? ` [${log.namespace}]` : ""} ${log.message}${log.data ? ` ${JSON.stringify(log.data)}` : ""}`,
          )
          .join("\n");
      }

      return this.logs;
    }

    // Download logs
    download(filename = "bael-logs", format = "json") {
      const content = this.export(format);
      const blob = new Blob([content], {
        type: format === "json" ? "application/json" : "text/plain",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.${format === "csv" ? "csv" : format === "text" ? "txt" : "json"}`;
      a.click();
      URL.revokeObjectURL(url);
      return this;
    }

    // Statistics
    getStats() {
      const stats = {
        total: this.logs.length,
        byLevel: {},
      };

      Object.keys(LOG_LEVELS).forEach((level) => {
        if (level !== "silent") {
          stats.byLevel[level] = this.logs.filter(
            (l) => l.level === level,
          ).length;
        }
      });

      return stats;
    }

    // Create child logger with prefix
    child(prefix) {
      return this.namespace(prefix);
    }

    // Wrap function with logging
    wrap(fn, name) {
      const logger = this;
      return function (...args) {
        logger.debug(`${name} called`, { args });
        try {
          const result = fn.apply(this, args);
          if (result instanceof Promise) {
            return result
              .then((r) => {
                logger.debug(`${name} resolved`, { result: r });
                return r;
              })
              .catch((e) => {
                logger.error(`${name} rejected`, e);
                throw e;
              });
          }
          logger.debug(`${name} returned`, { result });
          return result;
        } catch (e) {
          logger.error(`${name} threw`, e);
          throw e;
        }
      };
    }
  }

  // Initialize
  window.BaelLog = new BaelLogger();

  // Convenience aliases
  window.$log = {
    trace: (...args) => window.BaelLog.trace(...args),
    debug: (...args) => window.BaelLog.debug(...args),
    info: (...args) => window.BaelLog.info(...args),
    warn: (...args) => window.BaelLog.warn(...args),
    error: (...args) => window.BaelLog.error(...args),
    fatal: (...args) => window.BaelLog.fatal(...args),
  };
})();
