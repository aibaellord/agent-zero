/**
 * BAEL Timer Manager - Time Utilities & Scheduling
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete timing system:
 * - Debounce/throttle
 * - Delayed execution
 * - Interval management
 * - Countdown timers
 * - Rate limiting
 * - Idle detection
 */

(function () {
  "use strict";

  class BaelTimer {
    constructor() {
      this.timers = new Map();
      this.intervals = new Map();
      this.countdowns = new Map();
      this.idleCallbacks = [];
      this.lastActivity = Date.now();
      this.idleTimeout = 60000; // 1 minute default
      this.isIdle = false;
      this.init();
    }

    init() {
      this.setupIdleDetection();
      console.log("⏱️ Bael Timer Manager initialized");
    }

    // Debounce function
    debounce(fn, wait = 300, options = {}) {
      let timeoutId = null;
      let lastArgs = null;
      let lastThis = null;
      const { leading = false, trailing = true, maxWait = null } = options;
      let lastInvokeTime = 0;

      const invoke = () => {
        if (lastArgs) {
          fn.apply(lastThis, lastArgs);
          lastArgs = null;
          lastThis = null;
          lastInvokeTime = Date.now();
        }
      };

      const debounced = function (...args) {
        lastArgs = args;
        lastThis = this;

        const now = Date.now();
        const timeSinceLastInvoke = now - lastInvokeTime;

        // Leading edge
        if (leading && !timeoutId) {
          invoke();
        }

        // Clear existing timeout
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        // Max wait
        if (maxWait !== null && timeSinceLastInvoke >= maxWait) {
          invoke();
        }

        // Trailing edge
        if (trailing) {
          timeoutId = setTimeout(() => {
            invoke();
            timeoutId = null;
          }, wait);
        }
      };

      debounced.cancel = () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        lastArgs = null;
        lastThis = null;
      };

      debounced.flush = () => {
        if (timeoutId) {
          invoke();
          debounced.cancel();
        }
      };

      return debounced;
    }

    // Throttle function
    throttle(fn, wait = 300, options = {}) {
      let lastTime = 0;
      let timeoutId = null;
      let lastArgs = null;
      let lastThis = null;
      const { leading = true, trailing = true } = options;

      const invoke = () => {
        fn.apply(lastThis, lastArgs);
        lastTime = Date.now();
        lastArgs = null;
        lastThis = null;
      };

      const throttled = function (...args) {
        lastArgs = args;
        lastThis = this;
        const now = Date.now();
        const remaining = wait - (now - lastTime);

        if (remaining <= 0 || remaining > wait) {
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = null;
          }

          if (leading || lastTime !== 0) {
            invoke();
          } else {
            lastTime = now;
          }
        } else if (!timeoutId && trailing) {
          timeoutId = setTimeout(() => {
            timeoutId = null;
            invoke();
          }, remaining);
        }
      };

      throttled.cancel = () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        lastTime = 0;
        lastArgs = null;
        lastThis = null;
      };

      return throttled;
    }

    // Delay execution
    delay(fn, wait = 0, ...args) {
      const id = this.generateId();
      const timeoutId = setTimeout(() => {
        this.timers.delete(id);
        fn(...args);
      }, wait);

      this.timers.set(id, {
        timeoutId,
        cancel: () => {
          clearTimeout(timeoutId);
          this.timers.delete(id);
        },
      });

      return id;
    }

    // Cancel a delayed execution
    cancel(id) {
      const timer = this.timers.get(id);
      if (timer) {
        timer.cancel();
        return true;
      }
      return false;
    }

    // Set interval with management
    setInterval(fn, interval, options = {}) {
      const id = options.id || this.generateId();
      const { immediate = false, maxIterations = null } = options;
      let iterations = 0;

      if (immediate) {
        fn();
        iterations++;
      }

      const intervalId = setInterval(() => {
        iterations++;
        fn();

        if (maxIterations !== null && iterations >= maxIterations) {
          this.clearInterval(id);
        }
      }, interval);

      this.intervals.set(id, {
        intervalId,
        interval,
        iterations: () => iterations,
        pause: null,
        clear: () => {
          clearInterval(intervalId);
          this.intervals.delete(id);
        },
      });

      return id;
    }

    // Clear interval
    clearInterval(id) {
      const interval = this.intervals.get(id);
      if (interval) {
        interval.clear();
        return true;
      }
      return false;
    }

    // Clear all intervals
    clearAllIntervals() {
      this.intervals.forEach((interval) => interval.clear());
    }

    // Create countdown timer
    countdown(seconds, callbacks = {}) {
      const id = this.generateId();
      let remaining = seconds;
      let paused = false;
      let intervalId = null;

      const tick = () => {
        if (paused) return;

        remaining--;
        callbacks.onTick?.(remaining, seconds);

        if (remaining <= 0) {
          clearInterval(intervalId);
          this.countdowns.delete(id);
          callbacks.onComplete?.();
        }
      };

      intervalId = setInterval(tick, 1000);
      callbacks.onStart?.(seconds);

      const controller = {
        id,
        getRemaining: () => remaining,
        isPaused: () => paused,
        pause: () => {
          paused = true;
          callbacks.onPause?.(remaining);
        },
        resume: () => {
          paused = false;
          callbacks.onResume?.(remaining);
        },
        add: (secs) => {
          remaining += secs;
          callbacks.onTick?.(remaining, seconds);
        },
        reset: (newSeconds) => {
          remaining = newSeconds ?? seconds;
          callbacks.onTick?.(remaining, seconds);
        },
        cancel: () => {
          clearInterval(intervalId);
          this.countdowns.delete(id);
          callbacks.onCancel?.();
        },
      };

      this.countdowns.set(id, controller);
      return controller;
    }

    // Create stopwatch
    stopwatch(callbacks = {}) {
      const id = this.generateId();
      let elapsed = 0;
      let running = false;
      let startTime = null;
      let intervalId = null;
      const laps = [];

      const getElapsed = () => {
        if (running && startTime) {
          return elapsed + (Date.now() - startTime);
        }
        return elapsed;
      };

      const controller = {
        id,
        start: () => {
          if (!running) {
            running = true;
            startTime = Date.now();
            intervalId = setInterval(() => {
              callbacks.onTick?.(getElapsed());
            }, 100);
            callbacks.onStart?.(elapsed);
          }
        },
        stop: () => {
          if (running) {
            elapsed = getElapsed();
            running = false;
            startTime = null;
            clearInterval(intervalId);
            callbacks.onStop?.(elapsed);
          }
        },
        reset: () => {
          elapsed = 0;
          startTime = running ? Date.now() : null;
          laps.length = 0;
          callbacks.onReset?.();
        },
        lap: () => {
          const time = getElapsed();
          const lap = {
            time,
            delta: laps.length > 0 ? time - laps[laps.length - 1].time : time,
          };
          laps.push(lap);
          callbacks.onLap?.(lap, laps);
          return lap;
        },
        getElapsed,
        getLaps: () => [...laps],
        isRunning: () => running,
        formatTime: (ms = getElapsed()) => this.formatDuration(ms),
      };

      return controller;
    }

    // Rate limiter
    rateLimit(fn, limit, window = 1000) {
      const calls = [];

      return (...args) => {
        const now = Date.now();

        // Remove old calls outside window
        while (calls.length > 0 && calls[0] <= now - window) {
          calls.shift();
        }

        if (calls.length < limit) {
          calls.push(now);
          return fn(...args);
        } else {
          console.warn("Rate limit exceeded");
          return null;
        }
      };
    }

    // Request animation frame with timing
    raf(callback) {
      let lastTime = 0;
      let running = true;

      const tick = (timestamp) => {
        if (!running) return;

        const deltaTime = timestamp - lastTime;
        lastTime = timestamp;

        callback(deltaTime, timestamp);
        requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);

      return {
        stop: () => {
          running = false;
        },
      };
    }

    // Once after next paint
    afterPaint(callback) {
      return new Promise((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            callback?.();
            resolve();
          });
        });
      });
    }

    // Idle detection
    setupIdleDetection() {
      const events = [
        "mousedown",
        "mousemove",
        "keydown",
        "scroll",
        "touchstart",
      ];

      const resetIdle = this.throttle(() => {
        this.lastActivity = Date.now();
        if (this.isIdle) {
          this.isIdle = false;
          this.idleCallbacks.forEach((cb) => cb.onActive?.());
        }
      }, 1000);

      events.forEach((event) => {
        document.addEventListener(event, resetIdle, { passive: true });
      });

      // Check for idle
      setInterval(() => {
        const idleTime = Date.now() - this.lastActivity;
        if (idleTime >= this.idleTimeout && !this.isIdle) {
          this.isIdle = true;
          this.idleCallbacks.forEach((cb) => cb.onIdle?.(idleTime));
        }
      }, 1000);
    }

    // Register idle callback
    onIdle(callbacks, timeout = this.idleTimeout) {
      const id = this.generateId();
      this.idleCallbacks.push({ id, ...callbacks, timeout });
      return () => {
        const index = this.idleCallbacks.findIndex((cb) => cb.id === id);
        if (index > -1) this.idleCallbacks.splice(index, 1);
      };
    }

    // Set idle timeout
    setIdleTimeout(timeout) {
      this.idleTimeout = timeout;
    }

    // Wait/sleep helper
    sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    // Timeout promise
    timeout(promise, ms, message = "Operation timed out") {
      return Promise.race([
        promise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error(message)), ms),
        ),
      ]);
    }

    // Retry with delay
    async retry(fn, options = {}) {
      const {
        attempts = 3,
        delay = 1000,
        backoff = 2,
        onRetry = null,
      } = options;

      let lastError;
      for (let i = 0; i < attempts; i++) {
        try {
          return await fn();
        } catch (error) {
          lastError = error;
          onRetry?.(error, i + 1);
          if (i < attempts - 1) {
            await this.sleep(delay * Math.pow(backoff, i));
          }
        }
      }
      throw lastError;
    }

    // Format duration
    formatDuration(ms) {
      const seconds = Math.floor(ms / 1000) % 60;
      const minutes = Math.floor(ms / 60000) % 60;
      const hours = Math.floor(ms / 3600000);

      if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
      }
      return `${minutes}:${String(seconds).padStart(2, "0")}`;
    }

    // Parse duration string to ms
    parseDuration(str) {
      const units = {
        ms: 1,
        s: 1000,
        m: 60000,
        h: 3600000,
        d: 86400000,
      };

      const match = str.match(/^(\d+(?:\.\d+)?)(ms|s|m|h|d)?$/);
      if (!match) return null;

      const value = parseFloat(match[1]);
      const unit = match[2] || "ms";
      return value * (units[unit] || 1);
    }

    // Generate unique ID
    generateId() {
      return "timer_" + Math.random().toString(36).substr(2, 9);
    }

    // Get active timers count
    getActiveCount() {
      return {
        timers: this.timers.size,
        intervals: this.intervals.size,
        countdowns: this.countdowns.size,
      };
    }

    // Clear all
    clearAll() {
      this.timers.forEach((t) => t.cancel());
      this.intervals.forEach((i) => i.clear());
      this.countdowns.forEach((c) => c.cancel());
    }
  }

  // Initialize
  window.BaelTimer = new BaelTimer();

  // Global shortcuts
  window.$debounce = (fn, wait, opts) =>
    window.BaelTimer.debounce(fn, wait, opts);
  window.$throttle = (fn, wait, opts) =>
    window.BaelTimer.throttle(fn, wait, opts);
  window.$delay = (fn, wait, ...args) =>
    window.BaelTimer.delay(fn, wait, ...args);
  window.$sleep = (ms) => window.BaelTimer.sleep(ms);
})();
