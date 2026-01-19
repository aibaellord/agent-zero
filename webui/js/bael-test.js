/**
 * BAEL Test Utilities - Testing & Assertion Library
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete testing system:
 * - Assertions
 * - Test suites
 * - Mocking
 * - Spies
 * - Benchmarking
 * - Code coverage helpers
 */

(function () {
  "use strict";

  class BaelTest {
    constructor() {
      this.suites = [];
      this.currentSuite = null;
      this.results = [];
      this.mocks = new Map();
      this.spies = new Map();
      this.config = {
        timeout: 5000,
        verbose: true,
        stopOnFail: false,
        randomOrder: false,
      };
      console.log("🧪 Bael Test initialized");
    }

    // ═══════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═══════════════════════════════════════════════════════════

    configure(options) {
      Object.assign(this.config, options);
      return this;
    }

    // ═══════════════════════════════════════════════════════════
    // TEST SUITE MANAGEMENT
    // ═══════════════════════════════════════════════════════════

    // Describe test suite
    describe(name, fn) {
      const suite = {
        name,
        tests: [],
        beforeAll: [],
        afterAll: [],
        beforeEach: [],
        afterEach: [],
        nested: [],
      };

      this.suites.push(suite);
      const previousSuite = this.currentSuite;
      this.currentSuite = suite;

      try {
        fn();
      } catch (error) {
        console.error(`Error in suite "${name}":`, error);
      }

      this.currentSuite = previousSuite;
      return this;
    }

    // Individual test
    it(name, fn, options = {}) {
      if (!this.currentSuite) {
        throw new Error("it() must be called within describe()");
      }

      this.currentSuite.tests.push({
        name,
        fn,
        timeout: options.timeout || this.config.timeout,
        skip: options.skip || false,
        only: options.only || false,
      });

      return this;
    }

    // Skip test
    skip(name, fn) {
      return this.it(name, fn, { skip: true });
    }

    // Only run this test
    only(name, fn) {
      return this.it(name, fn, { only: true });
    }

    // Before all tests in suite
    beforeAll(fn) {
      if (this.currentSuite) {
        this.currentSuite.beforeAll.push(fn);
      }
      return this;
    }

    // After all tests in suite
    afterAll(fn) {
      if (this.currentSuite) {
        this.currentSuite.afterAll.push(fn);
      }
      return this;
    }

    // Before each test
    beforeEach(fn) {
      if (this.currentSuite) {
        this.currentSuite.beforeEach.push(fn);
      }
      return this;
    }

    // After each test
    afterEach(fn) {
      if (this.currentSuite) {
        this.currentSuite.afterEach.push(fn);
      }
      return this;
    }

    // ═══════════════════════════════════════════════════════════
    // TEST RUNNER
    // ═══════════════════════════════════════════════════════════

    // Run all tests
    async run() {
      this.results = [];
      const startTime = performance.now();

      console.group("🧪 Running Tests...");

      for (const suite of this.suites) {
        await this.runSuite(suite);
      }

      const duration = performance.now() - startTime;
      this.printSummary(duration);

      console.groupEnd();

      return {
        suites: this.results,
        duration,
        passed: this.results.filter((r) => r.status === "passed").length,
        failed: this.results.filter((r) => r.status === "failed").length,
        skipped: this.results.filter((r) => r.status === "skipped").length,
      };
    }

    // Run single suite
    async runSuite(suite) {
      console.group(`📦 ${suite.name}`);

      // Run beforeAll
      for (const hook of suite.beforeAll) {
        try {
          await hook();
        } catch (error) {
          console.error("beforeAll failed:", error);
        }
      }

      // Check for only tests
      const hasOnly = suite.tests.some((t) => t.only);
      let tests = hasOnly ? suite.tests.filter((t) => t.only) : suite.tests;

      // Randomize order if configured
      if (this.config.randomOrder) {
        tests = this.shuffle([...tests]);
      }

      // Run tests
      for (const test of tests) {
        await this.runTest(suite, test);

        if (
          this.config.stopOnFail &&
          this.results[this.results.length - 1]?.status === "failed"
        ) {
          break;
        }
      }

      // Run afterAll
      for (const hook of suite.afterAll) {
        try {
          await hook();
        } catch (error) {
          console.error("afterAll failed:", error);
        }
      }

      console.groupEnd();
    }

    // Run single test
    async runTest(suite, test) {
      if (test.skip) {
        this.results.push({
          suite: suite.name,
          test: test.name,
          status: "skipped",
          duration: 0,
        });
        console.log(`⏭️ SKIP: ${test.name}`);
        return;
      }

      const startTime = performance.now();

      // Run beforeEach
      for (const hook of suite.beforeEach) {
        try {
          await hook();
        } catch (error) {
          console.error("beforeEach failed:", error);
        }
      }

      try {
        // Run with timeout
        await this.withTimeout(test.fn(), test.timeout);

        const duration = performance.now() - startTime;
        this.results.push({
          suite: suite.name,
          test: test.name,
          status: "passed",
          duration,
        });
        console.log(`✅ PASS: ${test.name} (${duration.toFixed(2)}ms)`);
      } catch (error) {
        const duration = performance.now() - startTime;
        this.results.push({
          suite: suite.name,
          test: test.name,
          status: "failed",
          duration,
          error: error.message,
        });
        console.error(`❌ FAIL: ${test.name}`, error.message);
      }

      // Run afterEach
      for (const hook of suite.afterEach) {
        try {
          await hook();
        } catch (error) {
          console.error("afterEach failed:", error);
        }
      }
    }

    // Timeout wrapper
    withTimeout(promise, ms) {
      return Promise.race([
        Promise.resolve(promise),
        new Promise((_, reject) => {
          setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms);
        }),
      ]);
    }

    // Shuffle array
    shuffle(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }

    // Print summary
    printSummary(duration) {
      const passed = this.results.filter((r) => r.status === "passed").length;
      const failed = this.results.filter((r) => r.status === "failed").length;
      const skipped = this.results.filter((r) => r.status === "skipped").length;

      console.log("\n" + "═".repeat(50));
      console.log(`📊 Test Summary (${duration.toFixed(2)}ms)`);
      console.log("═".repeat(50));
      console.log(`✅ Passed:  ${passed}`);
      console.log(`❌ Failed:  ${failed}`);
      console.log(`⏭️ Skipped: ${skipped}`);
      console.log(`📋 Total:   ${this.results.length}`);
      console.log("═".repeat(50));

      if (failed > 0) {
        console.log("\n❌ Failed Tests:");
        this.results
          .filter((r) => r.status === "failed")
          .forEach((r) => {
            console.log(`  - ${r.suite} > ${r.test}`);
            console.log(`    ${r.error}`);
          });
      }
    }

    // ═══════════════════════════════════════════════════════════
    // ASSERTIONS
    // ═══════════════════════════════════════════════════════════

    // Create expect wrapper
    expect(value) {
      return new BaelExpect(value);
    }

    // ═══════════════════════════════════════════════════════════
    // MOCKING
    // ═══════════════════════════════════════════════════════════

    // Create mock function
    mock(name = "mock") {
      const calls = [];
      const mockFn = function (...args) {
        calls.push({ args, timestamp: Date.now() });
        return mockFn._returnValue;
      };

      mockFn.calls = calls;
      mockFn.callCount = () => calls.length;
      mockFn.calledWith = (...args) => {
        return calls.some(
          (c) => JSON.stringify(c.args) === JSON.stringify(args),
        );
      };
      mockFn.returns = (value) => {
        mockFn._returnValue = value;
        return mockFn;
      };
      mockFn.reset = () => {
        calls.length = 0;
        mockFn._returnValue = undefined;
      };
      mockFn.mockName = name;

      this.mocks.set(name, mockFn);
      return mockFn;
    }

    // Create spy
    spy(obj, method) {
      const original = obj[method];
      const calls = [];

      const spyFn = function (...args) {
        calls.push({ args, timestamp: Date.now() });
        return original.apply(this, args);
      };

      spyFn.calls = calls;
      spyFn.callCount = () => calls.length;
      spyFn.calledWith = (...args) => {
        return calls.some(
          (c) => JSON.stringify(c.args) === JSON.stringify(args),
        );
      };
      spyFn.restore = () => {
        obj[method] = original;
      };
      spyFn.reset = () => {
        calls.length = 0;
      };

      obj[method] = spyFn;
      this.spies.set(`${obj.constructor.name}.${method}`, spyFn);

      return spyFn;
    }

    // Restore all spies
    restoreAllSpies() {
      for (const spy of this.spies.values()) {
        spy.restore();
      }
      this.spies.clear();
    }

    // ═══════════════════════════════════════════════════════════
    // STUBS
    // ═══════════════════════════════════════════════════════════

    // Stub method
    stub(obj, method, implementation) {
      const original = obj[method];

      obj[method] = implementation;

      return {
        restore: () => {
          obj[method] = original;
        },
      };
    }

    // Stub property
    stubProperty(obj, prop, value) {
      const descriptor = Object.getOwnPropertyDescriptor(obj, prop);
      const original = obj[prop];

      Object.defineProperty(obj, prop, {
        value,
        writable: true,
        configurable: true,
      });

      return {
        restore: () => {
          if (descriptor) {
            Object.defineProperty(obj, prop, descriptor);
          } else {
            obj[prop] = original;
          }
        },
      };
    }

    // ═══════════════════════════════════════════════════════════
    // ASYNC UTILITIES
    // ═══════════════════════════════════════════════════════════

    // Wait for condition
    async waitFor(condition, options = {}) {
      const { timeout = 5000, interval = 100 } = options;
      const startTime = Date.now();

      while (Date.now() - startTime < timeout) {
        if (await condition()) {
          return true;
        }
        await this.delay(interval);
      }

      throw new Error("waitFor timeout");
    }

    // Delay
    delay(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    // ═══════════════════════════════════════════════════════════
    // BENCHMARKING
    // ═══════════════════════════════════════════════════════════

    // Benchmark function
    async benchmark(name, fn, options = {}) {
      const { iterations = 1000, warmup = 100 } = options;

      // Warmup
      for (let i = 0; i < warmup; i++) {
        await fn();
      }

      // Actual benchmark
      const times = [];
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        await fn();
        times.push(performance.now() - start);
      }

      const result = {
        name,
        iterations,
        min: Math.min(...times),
        max: Math.max(...times),
        mean: times.reduce((a, b) => a + b, 0) / times.length,
        median: times.sort((a, b) => a - b)[Math.floor(times.length / 2)],
        total: times.reduce((a, b) => a + b, 0),
        ops: iterations / (times.reduce((a, b) => a + b, 0) / 1000),
      };

      console.log(`⏱️ Benchmark: ${name}`);
      console.log(`   Iterations: ${iterations}`);
      console.log(`   Mean: ${result.mean.toFixed(4)}ms`);
      console.log(`   Min: ${result.min.toFixed(4)}ms`);
      console.log(`   Max: ${result.max.toFixed(4)}ms`);
      console.log(`   Ops/sec: ${result.ops.toFixed(2)}`);

      return result;
    }

    // Compare benchmarks
    async compare(benchmarks) {
      const results = [];

      for (const { name, fn } of benchmarks) {
        const result = await this.benchmark(name, fn);
        results.push(result);
      }

      // Sort by ops/sec
      results.sort((a, b) => b.ops - a.ops);

      console.log("\n📊 Benchmark Comparison:");
      results.forEach((r, i) => {
        const faster =
          i === 0 ? "" : ` (${(results[0].ops / r.ops).toFixed(2)}x slower)`;
        console.log(
          `   ${i + 1}. ${r.name}: ${r.ops.toFixed(2)} ops/sec${faster}`,
        );
      });

      return results;
    }

    // ═══════════════════════════════════════════════════════════
    // DOM TESTING
    // ═══════════════════════════════════════════════════════════

    // Create test container
    createContainer() {
      const container = document.createElement("div");
      container.id = "test-container";
      container.style.cssText = "position: fixed; top: -9999px; left: -9999px;";
      document.body.appendChild(container);
      return container;
    }

    // Render to container
    render(html, container) {
      if (!container) {
        container = this.createContainer();
      }
      container.innerHTML = html;
      return container;
    }

    // Cleanup
    cleanup() {
      const container = document.getElementById("test-container");
      if (container) {
        container.remove();
      }
      this.restoreAllSpies();
      this.mocks.clear();
    }

    // Simulate event
    fireEvent(element, eventName, options = {}) {
      const event = new Event(eventName, {
        bubbles: true,
        cancelable: true,
        ...options,
      });
      element.dispatchEvent(event);
      return event;
    }

    // Simulate click
    click(element) {
      return this.fireEvent(element, "click");
    }

    // Simulate input
    input(element, value) {
      element.value = value;
      this.fireEvent(element, "input");
      this.fireEvent(element, "change");
    }

    // Query helper
    query(selector, container = document) {
      return container.querySelector(selector);
    }

    // Query all helper
    queryAll(selector, container = document) {
      return Array.from(container.querySelectorAll(selector));
    }

    // ═══════════════════════════════════════════════════════════
    // SNAPSHOT TESTING
    // ═══════════════════════════════════════════════════════════

    // Save snapshot
    saveSnapshot(name, data) {
      const snapshots = JSON.parse(
        localStorage.getItem("bael-snapshots") || "{}",
      );
      snapshots[name] = {
        data: typeof data === "object" ? JSON.stringify(data) : String(data),
        timestamp: Date.now(),
      };
      localStorage.setItem("bael-snapshots", JSON.stringify(snapshots));
    }

    // Match snapshot
    matchSnapshot(name, data) {
      const snapshots = JSON.parse(
        localStorage.getItem("bael-snapshots") || "{}",
      );
      const snapshot = snapshots[name];

      if (!snapshot) {
        this.saveSnapshot(name, data);
        return true;
      }

      const current =
        typeof data === "object" ? JSON.stringify(data) : String(data);
      return current === snapshot.data;
    }

    // Update snapshot
    updateSnapshot(name, data) {
      this.saveSnapshot(name, data);
    }

    // Clear snapshots
    clearSnapshots() {
      localStorage.removeItem("bael-snapshots");
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // EXPECT CLASS
  // ═══════════════════════════════════════════════════════════════════

  class BaelExpect {
    constructor(value) {
      this.value = value;
      this.negated = false;
    }

    get not() {
      this.negated = true;
      return this;
    }

    assert(condition, message) {
      const result = this.negated ? !condition : condition;
      if (!result) {
        throw new Error(message);
      }
      return true;
    }

    toBe(expected) {
      return this.assert(
        this.value === expected,
        `Expected ${this.value} ${this.negated ? "not " : ""}to be ${expected}`,
      );
    }

    toEqual(expected) {
      const isEqual = JSON.stringify(this.value) === JSON.stringify(expected);
      return this.assert(
        isEqual,
        `Expected ${JSON.stringify(this.value)} ${this.negated ? "not " : ""}to equal ${JSON.stringify(expected)}`,
      );
    }

    toBeNull() {
      return this.assert(
        this.value === null,
        `Expected ${this.value} ${this.negated ? "not " : ""}to be null`,
      );
    }

    toBeUndefined() {
      return this.assert(
        this.value === undefined,
        `Expected ${this.value} ${this.negated ? "not " : ""}to be undefined`,
      );
    }

    toBeDefined() {
      return this.assert(
        this.value !== undefined,
        `Expected value ${this.negated ? "not " : ""}to be defined`,
      );
    }

    toBeTruthy() {
      return this.assert(
        !!this.value,
        `Expected ${this.value} ${this.negated ? "not " : ""}to be truthy`,
      );
    }

    toBeFalsy() {
      return this.assert(
        !this.value,
        `Expected ${this.value} ${this.negated ? "not " : ""}to be falsy`,
      );
    }

    toBeGreaterThan(expected) {
      return this.assert(
        this.value > expected,
        `Expected ${this.value} ${this.negated ? "not " : ""}to be greater than ${expected}`,
      );
    }

    toBeGreaterThanOrEqual(expected) {
      return this.assert(
        this.value >= expected,
        `Expected ${this.value} ${this.negated ? "not " : ""}to be >= ${expected}`,
      );
    }

    toBeLessThan(expected) {
      return this.assert(
        this.value < expected,
        `Expected ${this.value} ${this.negated ? "not " : ""}to be less than ${expected}`,
      );
    }

    toBeLessThanOrEqual(expected) {
      return this.assert(
        this.value <= expected,
        `Expected ${this.value} ${this.negated ? "not " : ""}to be <= ${expected}`,
      );
    }

    toContain(item) {
      const contains = Array.isArray(this.value)
        ? this.value.includes(item)
        : String(this.value).includes(item);
      return this.assert(
        contains,
        `Expected ${JSON.stringify(this.value)} ${this.negated ? "not " : ""}to contain ${item}`,
      );
    }

    toHaveLength(length) {
      return this.assert(
        this.value.length === length,
        `Expected length ${this.value.length} ${this.negated ? "not " : ""}to be ${length}`,
      );
    }

    toMatch(pattern) {
      const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
      return this.assert(
        regex.test(this.value),
        `Expected ${this.value} ${this.negated ? "not " : ""}to match ${pattern}`,
      );
    }

    toThrow(expected) {
      let threw = false;
      let error;

      try {
        this.value();
      } catch (e) {
        threw = true;
        error = e;
      }

      if (!threw) {
        return this.assert(false, "Expected function to throw");
      }

      if (expected) {
        const matches =
          expected instanceof RegExp
            ? expected.test(error.message)
            : error.message.includes(expected);
        return this.assert(
          matches,
          `Expected error "${error.message}" ${this.negated ? "not " : ""}to match ${expected}`,
        );
      }

      return this.assert(threw, "Expected function to throw");
    }

    async toReject(expected) {
      let rejected = false;
      let error;

      try {
        await this.value;
      } catch (e) {
        rejected = true;
        error = e;
      }

      if (!rejected) {
        return this.assert(false, "Expected promise to reject");
      }

      if (expected) {
        const matches =
          expected instanceof RegExp
            ? expected.test(error.message)
            : error.message.includes(expected);
        return this.assert(matches, `Expected rejection to match ${expected}`);
      }

      return true;
    }

    toBeInstanceOf(expected) {
      return this.assert(
        this.value instanceof expected,
        `Expected ${this.value} ${this.negated ? "not " : ""}to be instance of ${expected.name}`,
      );
    }

    toHaveProperty(prop, value) {
      const has = prop in this.value;
      if (value !== undefined) {
        return this.assert(
          has && this.value[prop] === value,
          `Expected property ${prop} ${this.negated ? "not " : ""}to be ${value}`,
        );
      }
      return this.assert(
        has,
        `Expected object ${this.negated ? "not " : ""}to have property ${prop}`,
      );
    }

    toBeCloseTo(expected, precision = 2) {
      const diff = Math.abs(this.value - expected);
      const epsilon = Math.pow(10, -precision) / 2;
      return this.assert(
        diff < epsilon,
        `Expected ${this.value} ${this.negated ? "not " : ""}to be close to ${expected}`,
      );
    }
  }

  // Initialize
  window.BaelTest = new BaelTest();

  // Global shortcuts
  window.$test = window.BaelTest;
  window.describe = (name, fn) => window.BaelTest.describe(name, fn);
  window.it = (name, fn, opts) => window.BaelTest.it(name, fn, opts);
  window.expect = (value) => window.BaelTest.expect(value);
  window.beforeAll = (fn) => window.BaelTest.beforeAll(fn);
  window.afterAll = (fn) => window.BaelTest.afterAll(fn);
  window.beforeEach = (fn) => window.BaelTest.beforeEach(fn);
  window.afterEach = (fn) => window.BaelTest.afterEach(fn);
})();
