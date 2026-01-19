/**
 * BAEL Performance - Performance Monitoring & Optimization
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete performance system:
 * - Performance timing
 * - Memory monitoring
 * - FPS tracking
 * - Long task detection
 * - Core Web Vitals
 */

(function () {
  "use strict";

  class BaelPerformance {
    constructor() {
      this.marks = new Map();
      this.measures = new Map();
      this.observers = new Map();
      this.metrics = {};
      this.fps = { current: 0, samples: [], running: false };
      console.log("📊 Bael Performance initialized");
    }

    // ═══════════════════════════════════════════════════════════
    // TIMING MARKS & MEASURES
    // ═══════════════════════════════════════════════════════════

    mark(name) {
      const now = performance.now();
      this.marks.set(name, now);

      try {
        performance.mark(name);
      } catch (e) {}

      return now;
    }

    measure(name, startMark, endMark) {
      let duration;

      if (startMark && endMark) {
        const start = this.marks.get(startMark) || 0;
        const end = this.marks.get(endMark) || performance.now();
        duration = end - start;
      } else if (startMark) {
        const start = this.marks.get(startMark) || 0;
        duration = performance.now() - start;
      } else {
        duration = 0;
      }

      const existing = this.measures.get(name) || [];
      existing.push(duration);
      this.measures.set(name, existing);

      try {
        performance.measure(name, startMark, endMark);
      } catch (e) {}

      return duration;
    }

    clearMarks(name) {
      if (name) {
        this.marks.delete(name);
        try {
          performance.clearMarks(name);
        } catch (e) {}
      } else {
        this.marks.clear();
        try {
          performance.clearMarks();
        } catch (e) {}
      }
    }

    clearMeasures(name) {
      if (name) {
        this.measures.delete(name);
        try {
          performance.clearMeasures(name);
        } catch (e) {}
      } else {
        this.measures.clear();
        try {
          performance.clearMeasures();
        } catch (e) {}
      }
    }

    // ═══════════════════════════════════════════════════════════
    // TIMING UTILITIES
    // ═══════════════════════════════════════════════════════════

    time(label) {
      this.mark(`${label}_start`);
      return {
        end: () => {
          this.mark(`${label}_end`);
          return this.measure(label, `${label}_start`, `${label}_end`);
        },
      };
    }

    async timeAsync(label, fn) {
      this.mark(`${label}_start`);
      try {
        const result = await fn();
        return { result, duration: this.measure(label, `${label}_start`) };
      } catch (error) {
        this.measure(label, `${label}_start`);
        throw error;
      }
    }

    profile(fn, label = "profile") {
      const timer = this.time(label);
      const result = fn();
      const duration = timer.end();
      return { result, duration };
    }

    async profileAsync(fn, label = "profile") {
      const timer = this.time(label);
      const result = await fn();
      const duration = timer.end();
      return { result, duration };
    }

    benchmark(fn, iterations = 1000, warmup = 100) {
      // Warmup
      for (let i = 0; i < warmup; i++) {
        fn();
      }

      // Benchmark
      const times = [];
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        fn();
        times.push(performance.now() - start);
      }

      return {
        iterations,
        total: times.reduce((a, b) => a + b, 0),
        mean: times.reduce((a, b) => a + b, 0) / times.length,
        min: Math.min(...times),
        max: Math.max(...times),
        median: this.median(times),
        stdDev: this.stdDev(times),
        opsPerSecond: 1000 / (times.reduce((a, b) => a + b, 0) / times.length),
      };
    }

    median(arr) {
      const sorted = [...arr].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2
        ? sorted[mid]
        : (sorted[mid - 1] + sorted[mid]) / 2;
    }

    stdDev(arr) {
      const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
      const squareDiffs = arr.map((v) => Math.pow(v - mean, 2));
      return Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / arr.length);
    }

    // ═══════════════════════════════════════════════════════════
    // FPS MONITORING
    // ═══════════════════════════════════════════════════════════

    startFPS(callback) {
      if (this.fps.running) return;

      this.fps.running = true;
      this.fps.samples = [];
      let lastTime = performance.now();
      let frames = 0;

      const loop = () => {
        if (!this.fps.running) return;

        frames++;
        const now = performance.now();

        if (now - lastTime >= 1000) {
          this.fps.current = Math.round((frames * 1000) / (now - lastTime));
          this.fps.samples.push(this.fps.current);

          if (this.fps.samples.length > 60) {
            this.fps.samples.shift();
          }

          callback?.(this.fps.current);
          frames = 0;
          lastTime = now;
        }

        requestAnimationFrame(loop);
      };

      requestAnimationFrame(loop);
    }

    stopFPS() {
      this.fps.running = false;
    }

    getFPS() {
      return {
        current: this.fps.current,
        average: this.fps.samples.length
          ? Math.round(
              this.fps.samples.reduce((a, b) => a + b, 0) /
                this.fps.samples.length,
            )
          : 0,
        min: Math.min(...this.fps.samples) || 0,
        max: Math.max(...this.fps.samples) || 0,
      };
    }

    // ═══════════════════════════════════════════════════════════
    // MEMORY MONITORING
    // ═══════════════════════════════════════════════════════════

    getMemory() {
      if (performance.memory) {
        return {
          usedJSHeapSize: performance.memory.usedJSHeapSize,
          totalJSHeapSize: performance.memory.totalJSHeapSize,
          jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
          usedMB:
            Math.round((performance.memory.usedJSHeapSize / 1048576) * 100) /
            100,
          totalMB:
            Math.round((performance.memory.totalJSHeapSize / 1048576) * 100) /
            100,
          limitMB:
            Math.round((performance.memory.jsHeapSizeLimit / 1048576) * 100) /
            100,
          percentUsed: Math.round(
            (performance.memory.usedJSHeapSize /
              performance.memory.jsHeapSizeLimit) *
              100,
          ),
        };
      }
      return null;
    }

    watchMemory(callback, interval = 1000) {
      if (!performance.memory) {
        console.warn("Memory API not available");
        return null;
      }

      const id = setInterval(() => {
        callback(this.getMemory());
      }, interval);

      return () => clearInterval(id);
    }

    // ═══════════════════════════════════════════════════════════
    // NAVIGATION TIMING
    // ═══════════════════════════════════════════════════════════

    getNavigationTiming() {
      const timing = performance.timing || {};
      const navigation =
        performance.getEntriesByType?.("navigation")?.[0] || {};

      return {
        // DNS
        dns:
          timing.domainLookupEnd - timing.domainLookupStart ||
          navigation.domainLookupEnd - navigation.domainLookupStart,

        // TCP
        tcp:
          timing.connectEnd - timing.connectStart ||
          navigation.connectEnd - navigation.connectStart,

        // TLS
        tls: timing.secureConnectionStart
          ? timing.connectEnd - timing.secureConnectionStart
          : navigation.secureConnectionStart
            ? navigation.connectEnd - navigation.secureConnectionStart
            : 0,

        // TTFB
        ttfb:
          timing.responseStart - timing.requestStart ||
          navigation.responseStart - navigation.requestStart,

        // Response
        response:
          timing.responseEnd - timing.responseStart ||
          navigation.responseEnd - navigation.responseStart,

        // DOM Processing
        domProcessing:
          timing.domComplete - timing.domLoading ||
          navigation.domComplete - navigation.domInteractive,

        // DOM Interactive
        domInteractive:
          timing.domInteractive - timing.navigationStart ||
          navigation.domInteractive,

        // DOM Complete
        domComplete:
          timing.domComplete - timing.navigationStart || navigation.domComplete,

        // Load Event
        loadEvent:
          timing.loadEventEnd - timing.loadEventStart ||
          navigation.loadEventEnd - navigation.loadEventStart,

        // Total
        total:
          timing.loadEventEnd - timing.navigationStart ||
          navigation.loadEventEnd,
      };
    }

    // ═══════════════════════════════════════════════════════════
    // RESOURCE TIMING
    // ═══════════════════════════════════════════════════════════

    getResourceTiming(filter) {
      const resources = performance.getEntriesByType("resource");

      let filtered = resources;
      if (filter) {
        if (typeof filter === "string") {
          filtered = resources.filter((r) => r.initiatorType === filter);
        } else if (filter instanceof RegExp) {
          filtered = resources.filter((r) => filter.test(r.name));
        } else if (typeof filter === "function") {
          filtered = resources.filter(filter);
        }
      }

      return filtered.map((r) => ({
        name: r.name,
        type: r.initiatorType,
        duration: r.duration,
        size: r.transferSize || 0,
        startTime: r.startTime,
        dns: r.domainLookupEnd - r.domainLookupStart,
        tcp: r.connectEnd - r.connectStart,
        ttfb: r.responseStart - r.requestStart,
        download: r.responseEnd - r.responseStart,
      }));
    }

    getResourceSummary() {
      const resources = this.getResourceTiming();

      const byType = {};
      resources.forEach((r) => {
        if (!byType[r.type]) {
          byType[r.type] = { count: 0, totalSize: 0, totalDuration: 0 };
        }
        byType[r.type].count++;
        byType[r.type].totalSize += r.size;
        byType[r.type].totalDuration += r.duration;
      });

      return {
        total: resources.length,
        totalSize: resources.reduce((sum, r) => sum + r.size, 0),
        totalDuration: resources.reduce((sum, r) => sum + r.duration, 0),
        byType,
      };
    }

    // ═══════════════════════════════════════════════════════════
    // LONG TASK DETECTION
    // ═══════════════════════════════════════════════════════════

    observeLongTasks(callback, threshold = 50) {
      if (!window.PerformanceObserver) {
        console.warn("PerformanceObserver not available");
        return null;
      }

      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration >= threshold) {
              callback({
                duration: entry.duration,
                startTime: entry.startTime,
                name: entry.name,
                attribution: entry.attribution,
              });
            }
          }
        });

        observer.observe({ entryTypes: ["longtask"] });
        this.observers.set("longtask", observer);

        return () => {
          observer.disconnect();
          this.observers.delete("longtask");
        };
      } catch (e) {
        console.warn("Long task observation not supported");
        return null;
      }
    }

    // ═══════════════════════════════════════════════════════════
    // CORE WEB VITALS
    // ═══════════════════════════════════════════════════════════

    observeWebVitals(callback) {
      const vitals = {};

      // LCP - Largest Contentful Paint
      this.observeEntry("largest-contentful-paint", (entry) => {
        vitals.lcp = entry.startTime;
        callback?.("lcp", entry.startTime);
      });

      // FID - First Input Delay
      this.observeEntry("first-input", (entry) => {
        vitals.fid = entry.processingStart - entry.startTime;
        callback?.("fid", vitals.fid);
      });

      // CLS - Cumulative Layout Shift
      let clsValue = 0;
      this.observeEntry("layout-shift", (entry) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          vitals.cls = clsValue;
          callback?.("cls", clsValue);
        }
      });

      // FCP - First Contentful Paint
      this.observeEntry("paint", (entry) => {
        if (entry.name === "first-contentful-paint") {
          vitals.fcp = entry.startTime;
          callback?.("fcp", entry.startTime);
        }
      });

      // TTFB
      const navTiming = this.getNavigationTiming();
      vitals.ttfb = navTiming.ttfb;
      callback?.("ttfb", navTiming.ttfb);

      return vitals;
    }

    observeEntry(type, callback) {
      if (!window.PerformanceObserver) return null;

      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            callback(entry);
          }
        });

        observer.observe({ entryTypes: [type] });

        const key = `observe_${type}`;
        this.observers.set(key, observer);

        return () => {
          observer.disconnect();
          this.observers.delete(key);
        };
      } catch (e) {
        return null;
      }
    }

    // ═══════════════════════════════════════════════════════════
    // PAINT TIMING
    // ═══════════════════════════════════════════════════════════

    getPaintTiming() {
      const paints = performance.getEntriesByType("paint");
      const result = {};

      paints.forEach((paint) => {
        const key = paint.name === "first-paint" ? "fp" : "fcp";
        result[key] = paint.startTime;
      });

      return result;
    }

    // ═══════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════

    now() {
      return performance.now();
    }

    formatDuration(ms) {
      if (ms < 1) return `${(ms * 1000).toFixed(2)}μs`;
      if (ms < 1000) return `${ms.toFixed(2)}ms`;
      return `${(ms / 1000).toFixed(2)}s`;
    }

    formatBytes(bytes) {
      const units = ["B", "KB", "MB", "GB"];
      let size = bytes;
      let unit = 0;
      while (size >= 1024 && unit < units.length - 1) {
        size /= 1024;
        unit++;
      }
      return `${size.toFixed(2)} ${units[unit]}`;
    }

    // Get all stats
    getStats() {
      return {
        memory: this.getMemory(),
        fps: this.getFPS(),
        navigation: this.getNavigationTiming(),
        paint: this.getPaintTiming(),
        resources: this.getResourceSummary(),
      };
    }

    // Cleanup
    disconnect() {
      this.observers.forEach((observer) => observer.disconnect());
      this.observers.clear();
      this.stopFPS();
    }
  }

  // Initialize
  window.BaelPerformance = new BaelPerformance();

  // Global shortcuts
  window.$perf = window.BaelPerformance;
  window.$time = (label) => window.BaelPerformance.time(label);
  window.$benchmark = (fn, iterations) =>
    window.BaelPerformance.benchmark(fn, iterations);

  console.log("📊 Bael Performance ready");
})();
