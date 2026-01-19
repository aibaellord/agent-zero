/**
 * BAEL Test Suite - Comprehensive Testing Framework
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete testing framework for all Bael systems with:
 * - Unit testing for individual components
 * - Integration testing for system interactions
 * - Performance benchmarking
 * - UI/UX testing
 * - Automated test runner
 * - Test reports and coverage
 */

(function () {
  "use strict";

  class BaelTestSuite {
    constructor() {
      this.testResults = [];
      this.currentSuite = null;
      this.isRunning = false;
      this.startTime = 0;
      this.config = {
        timeout: 5000,
        parallel: false,
        verbose: true,
        stopOnFail: false,
      };
      this.suites = new Map();
      this.hooks = {
        beforeAll: [],
        afterAll: [],
        beforeEach: [],
        afterEach: [],
      };
      this.init();
    }

    init() {
      this.loadConfig();
      this.registerBuiltInTests();
      this.createUI();
      this.addStyles();
      this.bindEvents();
      console.log("🧪 Bael Test Suite initialized");
    }

    loadConfig() {
      const saved = localStorage.getItem("bael_test_config");
      if (saved) {
        try {
          Object.assign(this.config, JSON.parse(saved));
        } catch (e) {
          console.warn("Failed to load test config");
        }
      }
    }

    saveConfig() {
      localStorage.setItem("bael_test_config", JSON.stringify(this.config));
    }

    // Test Registration
    describe(name, fn) {
      const suite = {
        name,
        tests: [],
        nested: [],
        beforeAll: [],
        afterAll: [],
        beforeEach: [],
        afterEach: [],
      };

      const prevSuite = this.currentSuite;
      this.currentSuite = suite;

      fn();

      this.currentSuite = prevSuite;

      if (prevSuite) {
        prevSuite.nested.push(suite);
      } else {
        this.suites.set(name, suite);
      }

      return suite;
    }

    it(name, fn, timeout = this.config.timeout) {
      if (!this.currentSuite) {
        console.error("it() must be called within describe()");
        return;
      }

      this.currentSuite.tests.push({
        name,
        fn,
        timeout,
        status: "pending",
        duration: 0,
        error: null,
      });
    }

    beforeAll(fn) {
      if (this.currentSuite) {
        this.currentSuite.beforeAll.push(fn);
      } else {
        this.hooks.beforeAll.push(fn);
      }
    }

    afterAll(fn) {
      if (this.currentSuite) {
        this.currentSuite.afterAll.push(fn);
      } else {
        this.hooks.afterAll.push(fn);
      }
    }

    beforeEach(fn) {
      if (this.currentSuite) {
        this.currentSuite.beforeEach.push(fn);
      } else {
        this.hooks.beforeEach.push(fn);
      }
    }

    afterEach(fn) {
      if (this.currentSuite) {
        this.currentSuite.afterEach.push(fn);
      } else {
        this.hooks.afterEach.push(fn);
      }
    }

    // Assertions
    expect(actual) {
      return {
        toBe: (expected) => {
          if (actual !== expected) {
            throw new Error(
              `Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`,
            );
          }
        },
        toEqual: (expected) => {
          if (JSON.stringify(actual) !== JSON.stringify(expected)) {
            throw new Error(
              `Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`,
            );
          }
        },
        toBeTruthy: () => {
          if (!actual) {
            throw new Error(
              `Expected truthy but got ${JSON.stringify(actual)}`,
            );
          }
        },
        toBeFalsy: () => {
          if (actual) {
            throw new Error(`Expected falsy but got ${JSON.stringify(actual)}`);
          }
        },
        toBeNull: () => {
          if (actual !== null) {
            throw new Error(`Expected null but got ${JSON.stringify(actual)}`);
          }
        },
        toBeUndefined: () => {
          if (actual !== undefined) {
            throw new Error(
              `Expected undefined but got ${JSON.stringify(actual)}`,
            );
          }
        },
        toBeDefined: () => {
          if (actual === undefined) {
            throw new Error(`Expected defined but got undefined`);
          }
        },
        toContain: (expected) => {
          if (Array.isArray(actual)) {
            if (!actual.includes(expected)) {
              throw new Error(
                `Expected array to contain ${JSON.stringify(expected)}`,
              );
            }
          } else if (typeof actual === "string") {
            if (!actual.includes(expected)) {
              throw new Error(`Expected string to contain "${expected}"`);
            }
          } else {
            throw new Error(`toContain only works with arrays and strings`);
          }
        },
        toHaveLength: (expected) => {
          if (actual.length !== expected) {
            throw new Error(
              `Expected length ${expected} but got ${actual.length}`,
            );
          }
        },
        toBeGreaterThan: (expected) => {
          if (actual <= expected) {
            throw new Error(
              `Expected ${actual} to be greater than ${expected}`,
            );
          }
        },
        toBeLessThan: (expected) => {
          if (actual >= expected) {
            throw new Error(`Expected ${actual} to be less than ${expected}`);
          }
        },
        toBeInstanceOf: (expected) => {
          if (!(actual instanceof expected)) {
            throw new Error(`Expected instance of ${expected.name}`);
          }
        },
        toThrow: (expectedError) => {
          let thrown = false;
          let thrownError = null;
          try {
            actual();
          } catch (e) {
            thrown = true;
            thrownError = e;
          }
          if (!thrown) {
            throw new Error("Expected function to throw");
          }
          if (expectedError && thrownError.message !== expectedError) {
            throw new Error(
              `Expected error "${expectedError}" but got "${thrownError.message}"`,
            );
          }
        },
        toMatch: (pattern) => {
          if (!pattern.test(actual)) {
            throw new Error(`Expected "${actual}" to match ${pattern}`);
          }
        },
        toHaveProperty: (prop, value) => {
          if (!(prop in actual)) {
            throw new Error(`Expected object to have property "${prop}"`);
          }
          if (value !== undefined && actual[prop] !== value) {
            throw new Error(
              `Expected property "${prop}" to be ${JSON.stringify(value)} but got ${JSON.stringify(actual[prop])}`,
            );
          }
        },
        not: {
          toBe: (expected) => {
            if (actual === expected) {
              throw new Error(`Expected not to be ${JSON.stringify(expected)}`);
            }
          },
          toEqual: (expected) => {
            if (JSON.stringify(actual) === JSON.stringify(expected)) {
              throw new Error(
                `Expected not to equal ${JSON.stringify(expected)}`,
              );
            }
          },
          toContain: (expected) => {
            if (Array.isArray(actual) && actual.includes(expected)) {
              throw new Error(
                `Expected array not to contain ${JSON.stringify(expected)}`,
              );
            }
            if (typeof actual === "string" && actual.includes(expected)) {
              throw new Error(`Expected string not to contain "${expected}"`);
            }
          },
        },
      };
    }

    // Test Runner
    async run(suiteFilter = null) {
      if (this.isRunning) {
        console.warn("Tests already running");
        return;
      }

      this.isRunning = true;
      this.startTime = performance.now();
      this.testResults = [];

      this.updateUI("running");

      try {
        // Run global beforeAll
        for (const hook of this.hooks.beforeAll) {
          await this.runWithTimeout(hook, this.config.timeout);
        }

        // Run suites
        for (const [name, suite] of this.suites) {
          if (suiteFilter && name !== suiteFilter) continue;
          await this.runSuite(suite);
        }

        // Run global afterAll
        for (const hook of this.hooks.afterAll) {
          await this.runWithTimeout(hook, this.config.timeout);
        }
      } catch (error) {
        console.error("Test run failed:", error);
      }

      this.isRunning = false;
      this.updateUI("complete");
      this.generateReport();
    }

    async runSuite(suite, parentName = "") {
      const fullName = parentName
        ? `${parentName} > ${suite.name}`
        : suite.name;

      if (this.config.verbose) {
        console.log(`\n📦 Suite: ${fullName}`);
      }

      // Run beforeAll
      for (const hook of suite.beforeAll) {
        await this.runWithTimeout(hook, this.config.timeout);
      }

      // Run tests
      for (const test of suite.tests) {
        await this.runTest(test, fullName, suite);

        if (this.config.stopOnFail && test.status === "failed") {
          return;
        }
      }

      // Run nested suites
      for (const nested of suite.nested) {
        await this.runSuite(nested, fullName);
      }

      // Run afterAll
      for (const hook of suite.afterAll) {
        await this.runWithTimeout(hook, this.config.timeout);
      }
    }

    async runTest(test, suiteName, suite) {
      const start = performance.now();

      try {
        // Run beforeEach hooks
        for (const hook of [...this.hooks.beforeEach, ...suite.beforeEach]) {
          await this.runWithTimeout(hook, this.config.timeout);
        }

        // Run test
        await this.runWithTimeout(test.fn, test.timeout);

        test.status = "passed";
        test.duration = performance.now() - start;

        if (this.config.verbose) {
          console.log(`  ✅ ${test.name} (${test.duration.toFixed(2)}ms)`);
        }

        // Run afterEach hooks
        for (const hook of [...suite.afterEach, ...this.hooks.afterEach]) {
          await this.runWithTimeout(hook, this.config.timeout);
        }
      } catch (error) {
        test.status = "failed";
        test.error = error.message || String(error);
        test.duration = performance.now() - start;

        console.error(`  ❌ ${test.name}: ${test.error}`);
      }

      this.testResults.push({
        suite: suiteName,
        name: test.name,
        status: test.status,
        duration: test.duration,
        error: test.error,
      });

      this.updateTestInUI(test, suiteName);
    }

    async runWithTimeout(fn, timeout) {
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          reject(new Error(`Test timeout after ${timeout}ms`));
        }, timeout);

        Promise.resolve(fn())
          .then(resolve)
          .catch(reject)
          .finally(() => clearTimeout(timer));
      });
    }

    // Built-in Tests
    registerBuiltInTests() {
      // Test Bael Core Systems
      this.describe("Bael Core Systems", () => {
        this.it("should have BaelTheme initialized", () => {
          this.expect(window.BaelTheme).toBeDefined();
        });

        this.it("should have BaelSettings initialized", () => {
          this.expect(window.BaelSettings).toBeDefined();
        });

        this.it("should have BaelQuickActions initialized", () => {
          this.expect(window.BaelQuickActions).toBeDefined();
        });

        this.it("should have BaelContextMenu initialized", () => {
          this.expect(window.BaelContextMenu).toBeDefined();
        });

        this.it("should have BaelKeyboardShortcuts initialized", () => {
          this.expect(window.BaelKeyboardShortcuts).toBeDefined();
        });
      });

      // Test Phase 5 Systems
      this.describe("Bael Phase 5 Systems", () => {
        this.it("should have BaelMultiModelRouter initialized", () => {
          this.expect(window.BaelMultiModelRouter).toBeDefined();
        });

        this.it("should have BaelCostTracker initialized", () => {
          this.expect(window.BaelCostTracker).toBeDefined();
        });

        this.it("should have BaelScheduler initialized", () => {
          this.expect(window.BaelScheduler).toBeDefined();
        });

        this.it("should have BaelOfflineController initialized", () => {
          this.expect(window.BaelOfflineController).toBeDefined();
        });

        this.it("should have BaelAnalyticsDashboard initialized", () => {
          this.expect(window.BaelAnalyticsDashboard).toBeDefined();
        });
      });

      // Test Phase 6 Systems
      this.describe("Bael Phase 6 Systems", () => {
        this.it("should have BaelWorkflowEngine initialized", () => {
          this.expect(window.BaelWorkflowEngine).toBeDefined();
        });

        this.it("should have BaelPluginManager initialized", () => {
          this.expect(window.BaelPluginManager).toBeDefined();
        });

        this.it("should have BaelContextManager initialized", () => {
          this.expect(window.BaelContextManager).toBeDefined();
        });

        this.it("should have BaelPersonaSystem initialized", () => {
          this.expect(window.BaelPersonaSystem).toBeDefined();
        });

        this.it("should have BaelChatAnalytics initialized", () => {
          this.expect(window.BaelChatAnalytics).toBeDefined();
        });
      });

      // Test LocalStorage
      this.describe("LocalStorage Operations", () => {
        this.it("should save and retrieve data", () => {
          const testKey = "bael_test_key";
          const testValue = { foo: "bar", num: 42 };

          localStorage.setItem(testKey, JSON.stringify(testValue));
          const retrieved = JSON.parse(localStorage.getItem(testKey));

          this.expect(retrieved).toEqual(testValue);
          localStorage.removeItem(testKey);
        });

        this.it("should handle large data", () => {
          const testKey = "bael_test_large";
          const largeData = "x".repeat(100000);

          localStorage.setItem(testKey, largeData);
          const retrieved = localStorage.getItem(testKey);

          this.expect(retrieved.length).toBe(100000);
          localStorage.removeItem(testKey);
        });
      });

      // Test DOM Operations
      this.describe("DOM Operations", () => {
        this.it("should have main chat container", () => {
          const container = document.querySelector(
            ".chat-container, #chat-container, [x-data]",
          );
          this.expect(container).toBeTruthy();
        });

        this.it("should have input area", () => {
          const input = document.querySelector(
            'textarea, input[type="text"], [contenteditable]',
          );
          this.expect(input).toBeTruthy();
        });

        this.it("should create and remove elements", () => {
          const testEl = document.createElement("div");
          testEl.id = "bael-test-element";
          document.body.appendChild(testEl);

          this.expect(
            document.getElementById("bael-test-element"),
          ).toBeTruthy();

          testEl.remove();
          this.expect(document.getElementById("bael-test-element")).toBeNull();
        });
      });

      // Test Event System
      this.describe("Event System", () => {
        this.it("should dispatch and receive custom events", async () => {
          return new Promise((resolve) => {
            const eventName = "bael-test-event";
            const eventData = { test: true };

            window.addEventListener(
              eventName,
              (e) => {
                this.expect(e.detail).toEqual(eventData);
                resolve();
              },
              { once: true },
            );

            window.dispatchEvent(
              new CustomEvent(eventName, { detail: eventData }),
            );
          });
        });
      });

      // Performance Tests
      this.describe("Performance Tests", () => {
        this.it("should render 100 elements under 100ms", () => {
          const start = performance.now();
          const container = document.createElement("div");

          for (let i = 0; i < 100; i++) {
            const el = document.createElement("div");
            el.textContent = `Item ${i}`;
            container.appendChild(el);
          }

          const duration = performance.now() - start;
          this.expect(duration).toBeLessThan(100);
        });

        this.it("should handle rapid state changes", () => {
          const start = performance.now();
          const obj = {};

          for (let i = 0; i < 10000; i++) {
            obj[`key_${i}`] = Math.random();
          }

          const duration = performance.now() - start;
          this.expect(duration).toBeLessThan(100);
        });
      });
    }

    // UI Creation
    createUI() {
      this.panel = document.createElement("div");
      this.panel.id = "bael-test-panel";
      this.panel.innerHTML = `
                <div class="bael-test-header">
                    <h3>🧪 Bael Test Suite</h3>
                    <div class="bael-test-actions">
                        <button class="run-btn" title="Run All Tests">▶️ Run All</button>
                        <button class="stop-btn" title="Stop Tests" disabled>⏹️ Stop</button>
                        <button class="clear-btn" title="Clear Results">🗑️ Clear</button>
                        <button class="close-btn" title="Close">✕</button>
                    </div>
                </div>

                <div class="bael-test-tabs">
                    <button class="tab-btn active" data-tab="results">Results</button>
                    <button class="tab-btn" data-tab="suites">Suites</button>
                    <button class="tab-btn" data-tab="config">Config</button>
                    <button class="tab-btn" data-tab="report">Report</button>
                </div>

                <div class="bael-test-content">
                    <div class="tab-content active" id="results-tab">
                        <div class="test-summary">
                            <div class="summary-stat passed">
                                <span class="count">0</span>
                                <span class="label">Passed</span>
                            </div>
                            <div class="summary-stat failed">
                                <span class="count">0</span>
                                <span class="label">Failed</span>
                            </div>
                            <div class="summary-stat pending">
                                <span class="count">0</span>
                                <span class="label">Pending</span>
                            </div>
                            <div class="summary-stat duration">
                                <span class="count">0ms</span>
                                <span class="label">Duration</span>
                            </div>
                        </div>
                        <div class="test-progress">
                            <div class="progress-bar"></div>
                        </div>
                        <div class="test-results-list"></div>
                    </div>

                    <div class="tab-content" id="suites-tab">
                        <div class="suites-list"></div>
                    </div>

                    <div class="tab-content" id="config-tab">
                        <div class="config-group">
                            <label>
                                <span>Test Timeout (ms)</span>
                                <input type="number" id="test-timeout" min="100" max="60000" value="${this.config.timeout}">
                            </label>
                        </div>
                        <div class="config-group">
                            <label>
                                <input type="checkbox" id="test-verbose" ${this.config.verbose ? "checked" : ""}>
                                <span>Verbose Output</span>
                            </label>
                        </div>
                        <div class="config-group">
                            <label>
                                <input type="checkbox" id="test-stop-fail" ${this.config.stopOnFail ? "checked" : ""}>
                                <span>Stop on First Failure</span>
                            </label>
                        </div>
                        <button class="save-config-btn">💾 Save Configuration</button>
                    </div>

                    <div class="tab-content" id="report-tab">
                        <div class="report-content">
                            <p>Run tests to generate a report</p>
                        </div>
                        <div class="report-actions">
                            <button class="export-report-btn" disabled>📄 Export Report</button>
                            <button class="copy-report-btn" disabled>📋 Copy to Clipboard</button>
                        </div>
                    </div>
                </div>
            `;

      document.body.appendChild(this.panel);
      this.updateSuitesList();
    }

    addStyles() {
      const style = document.createElement("style");
      style.textContent = `
                #bael-test-panel {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0.9);
                    width: 700px;
                    max-width: 95vw;
                    max-height: 80vh;
                    background: var(--bael-surface, #1e1e1e);
                    border: 1px solid var(--bael-border, #333);
                    border-radius: 12px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
                    z-index: 100001;
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    opacity: 0;
                    transition: opacity 0.3s, transform 0.3s;
                }

                #bael-test-panel.visible {
                    display: flex;
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }

                .bael-test-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    background: var(--bael-bg-dark, #151515);
                    border-bottom: 1px solid var(--bael-border, #333);
                }

                .bael-test-header h3 {
                    margin: 0;
                    font-size: 16px;
                    color: var(--bael-text, #fff);
                }

                .bael-test-actions {
                    display: flex;
                    gap: 8px;
                }

                .bael-test-actions button {
                    background: var(--bael-surface, #252525);
                    border: 1px solid var(--bael-border, #333);
                    color: var(--bael-text, #fff);
                    padding: 6px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 12px;
                    transition: all 0.2s;
                }

                .bael-test-actions button:hover:not(:disabled) {
                    background: var(--bael-primary, #646cff);
                }

                .bael-test-actions button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .bael-test-actions .close-btn {
                    background: transparent;
                    border: none;
                    font-size: 16px;
                }

                .bael-test-tabs {
                    display: flex;
                    gap: 0;
                    border-bottom: 1px solid var(--bael-border, #333);
                    background: var(--bael-bg-dark, #151515);
                }

                .bael-test-tabs .tab-btn {
                    background: transparent;
                    border: none;
                    color: var(--bael-text-dim, #888);
                    padding: 12px 20px;
                    cursor: pointer;
                    font-size: 13px;
                    transition: all 0.2s;
                    border-bottom: 2px solid transparent;
                }

                .bael-test-tabs .tab-btn:hover {
                    color: var(--bael-text, #fff);
                    background: rgba(255,255,255,0.05);
                }

                .bael-test-tabs .tab-btn.active {
                    color: var(--bael-primary, #646cff);
                    border-bottom-color: var(--bael-primary, #646cff);
                }

                .bael-test-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px;
                }

                .tab-content {
                    display: none;
                }

                .tab-content.active {
                    display: block;
                }

                .test-summary {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 12px;
                    margin-bottom: 16px;
                }

                .summary-stat {
                    background: var(--bael-bg-dark, #151515);
                    padding: 16px;
                    border-radius: 8px;
                    text-align: center;
                }

                .summary-stat .count {
                    display: block;
                    font-size: 24px;
                    font-weight: bold;
                    margin-bottom: 4px;
                }

                .summary-stat.passed .count { color: #4caf50; }
                .summary-stat.failed .count { color: #f44336; }
                .summary-stat.pending .count { color: #ff9800; }
                .summary-stat.duration .count { color: #2196f3; }

                .summary-stat .label {
                    font-size: 11px;
                    color: var(--bael-text-dim, #888);
                    text-transform: uppercase;
                }

                .test-progress {
                    height: 4px;
                    background: var(--bael-bg-dark, #151515);
                    border-radius: 2px;
                    margin-bottom: 16px;
                    overflow: hidden;
                }

                .progress-bar {
                    height: 100%;
                    width: 0;
                    background: linear-gradient(90deg, #4caf50, #8bc34a);
                    transition: width 0.3s;
                }

                .progress-bar.has-failed {
                    background: linear-gradient(90deg, #4caf50, #f44336);
                }

                .test-results-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .test-result-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 10px 12px;
                    background: var(--bael-bg-dark, #151515);
                    border-radius: 6px;
                    font-size: 13px;
                }

                .test-result-item .status-icon {
                    width: 20px;
                    height: 20px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                }

                .test-result-item.passed .status-icon { color: #4caf50; }
                .test-result-item.failed .status-icon { color: #f44336; }
                .test-result-item.pending .status-icon { color: #ff9800; }

                .test-result-item .test-info {
                    flex: 1;
                }

                .test-result-item .test-name {
                    color: var(--bael-text, #fff);
                }

                .test-result-item .test-suite {
                    font-size: 11px;
                    color: var(--bael-text-dim, #888);
                }

                .test-result-item .test-duration {
                    font-size: 11px;
                    color: var(--bael-text-dim, #888);
                }

                .test-result-item .test-error {
                    font-size: 11px;
                    color: #f44336;
                    margin-top: 4px;
                    font-family: monospace;
                }

                .suites-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .suite-item {
                    padding: 12px;
                    background: var(--bael-bg-dark, #151515);
                    border-radius: 6px;
                }

                .suite-item .suite-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }

                .suite-item .suite-name {
                    font-weight: 600;
                    color: var(--bael-text, #fff);
                }

                .suite-item .suite-count {
                    font-size: 12px;
                    color: var(--bael-text-dim, #888);
                }

                .suite-item .suite-tests {
                    font-size: 12px;
                    color: var(--bael-text-dim, #888);
                }

                .suite-item button {
                    background: var(--bael-primary, #646cff);
                    border: none;
                    color: white;
                    padding: 4px 10px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 11px;
                }

                .config-group {
                    margin-bottom: 16px;
                }

                .config-group label {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: var(--bael-text, #fff);
                    font-size: 13px;
                }

                .config-group input[type="number"] {
                    width: 100px;
                    padding: 6px 10px;
                    background: var(--bael-bg-dark, #151515);
                    border: 1px solid var(--bael-border, #333);
                    border-radius: 4px;
                    color: var(--bael-text, #fff);
                }

                .config-group input[type="checkbox"] {
                    width: 16px;
                    height: 16px;
                }

                .save-config-btn,
                .export-report-btn,
                .copy-report-btn {
                    background: var(--bael-primary, #646cff);
                    border: none;
                    color: white;
                    padding: 10px 20px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 13px;
                    margin-right: 8px;
                }

                .report-content {
                    background: var(--bael-bg-dark, #151515);
                    padding: 16px;
                    border-radius: 6px;
                    margin-bottom: 16px;
                    max-height: 300px;
                    overflow-y: auto;
                    font-family: monospace;
                    font-size: 12px;
                    white-space: pre-wrap;
                    color: var(--bael-text, #fff);
                }

                .report-actions {
                    display: flex;
                    gap: 8px;
                }

                .report-actions button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                @keyframes bael-test-spin {
                    to { transform: rotate(360deg); }
                }

                .test-result-item.running .status-icon {
                    animation: bael-test-spin 1s linear infinite;
                }
            `;
      document.head.appendChild(style);
    }

    bindEvents() {
      // Tab switching
      this.panel.querySelectorAll(".tab-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.panel
            .querySelectorAll(".tab-btn")
            .forEach((b) => b.classList.remove("active"));
          this.panel
            .querySelectorAll(".tab-content")
            .forEach((c) => c.classList.remove("active"));
          btn.classList.add("active");
          const tabId = btn.dataset.tab + "-tab";
          this.panel.querySelector(`#${tabId}`).classList.add("active");
        });
      });

      // Run button
      this.panel.querySelector(".run-btn").addEventListener("click", () => {
        this.run();
      });

      // Clear button
      this.panel.querySelector(".clear-btn").addEventListener("click", () => {
        this.clearResults();
      });

      // Close button
      this.panel.querySelector(".close-btn").addEventListener("click", () => {
        this.close();
      });

      // Save config
      this.panel
        .querySelector(".save-config-btn")
        .addEventListener("click", () => {
          this.config.timeout = parseInt(
            this.panel.querySelector("#test-timeout").value,
          );
          this.config.verbose =
            this.panel.querySelector("#test-verbose").checked;
          this.config.stopOnFail =
            this.panel.querySelector("#test-stop-fail").checked;
          this.saveConfig();
          this.showNotification("Configuration saved");
        });

      // Export report
      this.panel
        .querySelector(".export-report-btn")
        .addEventListener("click", () => {
          this.exportReport();
        });

      // Copy report
      this.panel
        .querySelector(".copy-report-btn")
        .addEventListener("click", () => {
          this.copyReport();
        });

      // Keyboard shortcut
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "T") {
          e.preventDefault();
          this.toggle();
        }
      });
    }

    updateSuitesList() {
      const list = this.panel.querySelector(".suites-list");
      list.innerHTML = "";

      for (const [name, suite] of this.suites) {
        const item = document.createElement("div");
        item.className = "suite-item";
        item.innerHTML = `
                    <div class="suite-header">
                        <span class="suite-name">${name}</span>
                        <button data-suite="${name}">▶️ Run</button>
                    </div>
                    <div class="suite-count">${suite.tests.length} tests</div>
                    <div class="suite-tests">${suite.tests.map((t) => t.name).join(", ")}</div>
                `;

        item.querySelector("button").addEventListener("click", () => {
          this.run(name);
        });

        list.appendChild(item);
      }
    }

    updateUI(state) {
      const runBtn = this.panel.querySelector(".run-btn");
      const stopBtn = this.panel.querySelector(".stop-btn");

      if (state === "running") {
        runBtn.disabled = true;
        stopBtn.disabled = false;
        this.panel.querySelector(".progress-bar").style.width = "0%";
        this.panel.querySelector(".test-results-list").innerHTML = "";
      } else {
        runBtn.disabled = false;
        stopBtn.disabled = true;
      }
    }

    updateTestInUI(test, suiteName) {
      const list = this.panel.querySelector(".test-results-list");

      const item = document.createElement("div");
      item.className = `test-result-item ${test.status}`;
      item.innerHTML = `
                <span class="status-icon">${test.status === "passed" ? "✓" : test.status === "failed" ? "✗" : "⋯"}</span>
                <div class="test-info">
                    <div class="test-name">${test.name}</div>
                    <div class="test-suite">${suiteName}</div>
                    ${test.error ? `<div class="test-error">${test.error}</div>` : ""}
                </div>
                <span class="test-duration">${test.duration.toFixed(2)}ms</span>
            `;

      list.appendChild(item);

      // Update summary
      this.updateSummary();
    }

    updateSummary() {
      const passed = this.testResults.filter(
        (t) => t.status === "passed",
      ).length;
      const failed = this.testResults.filter(
        (t) => t.status === "failed",
      ).length;
      const pending = this.testResults.filter(
        (t) => t.status === "pending",
      ).length;
      const duration = performance.now() - this.startTime;

      this.panel.querySelector(".summary-stat.passed .count").textContent =
        passed;
      this.panel.querySelector(".summary-stat.failed .count").textContent =
        failed;
      this.panel.querySelector(".summary-stat.pending .count").textContent =
        pending;
      this.panel.querySelector(".summary-stat.duration .count").textContent =
        `${duration.toFixed(0)}ms`;

      const total = passed + failed + pending;
      const progress =
        total > 0 ? ((passed + failed) / this.getTotalTests()) * 100 : 0;
      const progressBar = this.panel.querySelector(".progress-bar");
      progressBar.style.width = `${progress}%`;

      if (failed > 0) {
        progressBar.classList.add("has-failed");
      } else {
        progressBar.classList.remove("has-failed");
      }
    }

    getTotalTests() {
      let total = 0;
      for (const suite of this.suites.values()) {
        total += this.countTests(suite);
      }
      return total;
    }

    countTests(suite) {
      let count = suite.tests.length;
      for (const nested of suite.nested) {
        count += this.countTests(nested);
      }
      return count;
    }

    clearResults() {
      this.testResults = [];
      this.panel.querySelector(".test-results-list").innerHTML = "";
      this.panel.querySelector(".summary-stat.passed .count").textContent = "0";
      this.panel.querySelector(".summary-stat.failed .count").textContent = "0";
      this.panel.querySelector(".summary-stat.pending .count").textContent =
        "0";
      this.panel.querySelector(".summary-stat.duration .count").textContent =
        "0ms";
      this.panel.querySelector(".progress-bar").style.width = "0%";
      this.panel.querySelector(".progress-bar").classList.remove("has-failed");
    }

    generateReport() {
      const passed = this.testResults.filter(
        (t) => t.status === "passed",
      ).length;
      const failed = this.testResults.filter(
        (t) => t.status === "failed",
      ).length;
      const duration = performance.now() - this.startTime;

      let report = `
╔════════════════════════════════════════════════════════════════╗
║                    BAEL TEST SUITE REPORT                      ║
╠════════════════════════════════════════════════════════════════╣
║  Date: ${new Date().toISOString()}
║  Total Tests: ${this.testResults.length}
║  Passed: ${passed} ✓
║  Failed: ${failed} ✗
║  Duration: ${duration.toFixed(2)}ms
╠════════════════════════════════════════════════════════════════╣
`;

      // Group by suite
      const bySuite = {};
      for (const result of this.testResults) {
        if (!bySuite[result.suite]) {
          bySuite[result.suite] = [];
        }
        bySuite[result.suite].push(result);
      }

      for (const [suite, tests] of Object.entries(bySuite)) {
        report += `\n║ 📦 ${suite}\n`;
        for (const test of tests) {
          const icon = test.status === "passed" ? "✓" : "✗";
          report += `║   ${icon} ${test.name} (${test.duration.toFixed(2)}ms)\n`;
          if (test.error) {
            report += `║      ↳ Error: ${test.error}\n`;
          }
        }
      }

      report += `╚════════════════════════════════════════════════════════════════╝`;

      this.panel.querySelector(".report-content").textContent = report;
      this.panel.querySelector(".export-report-btn").disabled = false;
      this.panel.querySelector(".copy-report-btn").disabled = false;

      this.lastReport = report;
    }

    exportReport() {
      if (!this.lastReport) return;

      const blob = new Blob([this.lastReport], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bael-test-report-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);

      this.showNotification("Report exported");
    }

    copyReport() {
      if (!this.lastReport) return;

      navigator.clipboard.writeText(this.lastReport).then(() => {
        this.showNotification("Report copied to clipboard");
      });
    }

    showNotification(message) {
      const notification = document.createElement("div");
      notification.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: var(--bael-primary, #646cff);
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                z-index: 100002;
                animation: bael-fade-in 0.3s;
            `;
      notification.textContent = message;
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    }

    // Public API
    open() {
      this.panel.classList.add("visible");
    }

    close() {
      this.panel.classList.remove("visible");
    }

    toggle() {
      this.panel.classList.toggle("visible");
    }

    get isVisible() {
      return this.panel.classList.contains("visible");
    }
  }

  // Initialize
  window.BaelTestSuite = new BaelTestSuite();
})();
