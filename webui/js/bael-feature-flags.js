/**
 * BAEL Feature Flags - Dynamic Feature Management
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete feature flag system with:
 * - Runtime feature toggling
 * - User segmentation
 * - Percentage rollouts
 * - A/B testing support
 * - Feature dependencies
 * - Scheduled activations
 * - Remote config support
 * - Analytics integration
 */

(function () {
  "use strict";

  class BaelFeatureFlags {
    constructor() {
      this.flags = new Map();
      this.overrides = new Map();
      this.userId = this.getUserId();
      this.segments = new Set();
      this.config = {
        remoteConfigUrl: null,
        refreshInterval: 300000, // 5 minutes
        enableAnalytics: true,
        defaultEnabled: false,
      };
      this.evaluationHistory = [];
      this.init();
    }

    init() {
      this.loadConfig();
      this.loadFlags();
      this.registerCoreFlags();
      this.createUI();
      this.addStyles();
      this.bindEvents();
      this.startRefreshTimer();
      console.log("🚩 Bael Feature Flags initialized");
    }

    loadConfig() {
      const saved = localStorage.getItem("bael_featureflags_config");
      if (saved) {
        try {
          Object.assign(this.config, JSON.parse(saved));
        } catch (e) {
          console.warn("Failed to load feature flags config");
        }
      }
    }

    saveConfig() {
      localStorage.setItem(
        "bael_featureflags_config",
        JSON.stringify(this.config),
      );
    }

    loadFlags() {
      const saved = localStorage.getItem("bael_featureflags_overrides");
      if (saved) {
        try {
          const overrides = JSON.parse(saved);
          Object.entries(overrides).forEach(([key, value]) => {
            this.overrides.set(key, value);
          });
        } catch (e) {
          console.warn("Failed to load feature flag overrides");
        }
      }
    }

    saveFlags() {
      const overrides = {};
      this.overrides.forEach((value, key) => {
        overrides[key] = value;
      });
      localStorage.setItem(
        "bael_featureflags_overrides",
        JSON.stringify(overrides),
      );
    }

    getUserId() {
      let userId = localStorage.getItem("bael_user_id");
      if (!userId) {
        userId =
          "user_" +
          Date.now().toString(36) +
          Math.random().toString(36).substr(2);
        localStorage.setItem("bael_user_id", userId);
      }
      return userId;
    }

    // Register Core Flags
    registerCoreFlags() {
      // Phase 7 features
      this.register("test_suite", {
        name: "Test Suite",
        description: "Enable the built-in test suite (Ctrl+Shift+T)",
        enabled: true,
        category: "testing",
      });

      this.register("performance_monitor", {
        name: "Performance Monitor",
        description: "Enable real-time performance monitoring (Ctrl+Shift+P)",
        enabled: true,
        category: "performance",
      });

      this.register("documentation", {
        name: "Documentation Panel",
        description: "Enable interactive documentation (F1)",
        enabled: true,
        category: "help",
      });

      this.register("error_boundary", {
        name: "Error Boundary",
        description: "Global error catching and recovery",
        enabled: true,
        category: "stability",
      });

      this.register("lazy_loading", {
        name: "Lazy Loading",
        description: "Smart resource lazy loading",
        enabled: true,
        category: "performance",
      });

      // Experimental features
      this.register("experimental_ai_personas", {
        name: "AI Personas (Experimental)",
        description: "Custom AI personality profiles",
        enabled: true,
        category: "experimental",
      });

      this.register("experimental_knowledge_graph", {
        name: "Knowledge Graph (Experimental)",
        description: "Visual knowledge mapping",
        enabled: true,
        category: "experimental",
      });

      this.register("experimental_workflow_engine", {
        name: "Workflow Engine (Experimental)",
        description: "Automated workflow automation",
        enabled: true,
        category: "experimental",
      });

      // Beta features
      this.register("beta_collaboration", {
        name: "Collaboration Mode (Beta)",
        description: "Multi-user collaboration features",
        enabled: false,
        rolloutPercentage: 50,
        category: "beta",
      });

      this.register("beta_fine_tuning", {
        name: "Fine-Tuning (Beta)",
        description: "Model fine-tuning interface",
        enabled: false,
        rolloutPercentage: 25,
        category: "beta",
      });

      // A/B Tests
      this.register("ab_new_chat_layout", {
        name: "New Chat Layout",
        description: "A/B test for new chat UI layout",
        enabled: false,
        rolloutPercentage: 50,
        variants: ["control", "variant_a", "variant_b"],
        category: "ab_test",
      });
    }

    // Register a flag
    register(key, options = {}) {
      const flag = {
        key,
        name: options.name || key,
        description: options.description || "",
        enabled: options.enabled ?? this.config.defaultEnabled,
        rolloutPercentage: options.rolloutPercentage ?? 100,
        segments: options.segments || [],
        dependencies: options.dependencies || [],
        variants: options.variants || null,
        scheduledStart: options.scheduledStart || null,
        scheduledEnd: options.scheduledEnd || null,
        category: options.category || "general",
        createdAt: new Date(),
        evaluations: 0,
      };

      this.flags.set(key, flag);
      return this;
    }

    // Check if flag is enabled
    isEnabled(key, context = {}) {
      // Check override first
      if (this.overrides.has(key)) {
        return this.overrides.get(key);
      }

      const flag = this.flags.get(key);
      if (!flag) {
        return this.config.defaultEnabled;
      }

      flag.evaluations++;

      // Check scheduled times
      const now = new Date();
      if (flag.scheduledStart && now < new Date(flag.scheduledStart)) {
        return false;
      }
      if (flag.scheduledEnd && now > new Date(flag.scheduledEnd)) {
        return false;
      }

      // Check if base enabled
      if (!flag.enabled) {
        return false;
      }

      // Check dependencies
      if (flag.dependencies.length > 0) {
        const depsEnabled = flag.dependencies.every((dep) =>
          this.isEnabled(dep, context),
        );
        if (!depsEnabled) {
          return false;
        }
      }

      // Check segment
      if (flag.segments.length > 0) {
        const inSegment = flag.segments.some(
          (seg) => this.segments.has(seg) || context.segments?.includes(seg),
        );
        if (!inSegment) {
          return false;
        }
      }

      // Check rollout percentage
      if (flag.rolloutPercentage < 100) {
        const hash = this.hashString(this.userId + key);
        const bucket = hash % 100;
        if (bucket >= flag.rolloutPercentage) {
          return false;
        }
      }

      // Record evaluation
      if (this.config.enableAnalytics) {
        this.recordEvaluation(key, true);
      }

      return true;
    }

    // Get variant for A/B test
    getVariant(key) {
      const flag = this.flags.get(key);
      if (!flag || !flag.variants || !this.isEnabled(key)) {
        return null;
      }

      const hash = this.hashString(this.userId + key);
      const variantIndex = hash % flag.variants.length;
      return flag.variants[variantIndex];
    }

    // Set override
    setOverride(key, enabled) {
      this.overrides.set(key, enabled);
      this.saveFlags();
      this.updateUI();

      // Dispatch event
      window.dispatchEvent(
        new CustomEvent("bael-feature-changed", {
          detail: { key, enabled },
        }),
      );
    }

    // Clear override
    clearOverride(key) {
      this.overrides.delete(key);
      this.saveFlags();
      this.updateUI();
    }

    // Clear all overrides
    clearAllOverrides() {
      this.overrides.clear();
      this.saveFlags();
      this.updateUI();
    }

    // Add user to segment
    addSegment(segment) {
      this.segments.add(segment);
    }

    // Remove user from segment
    removeSegment(segment) {
      this.segments.delete(segment);
    }

    // Hash function for consistent bucketing
    hashString(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
      }
      return Math.abs(hash);
    }

    // Record evaluation for analytics
    recordEvaluation(key, result) {
      this.evaluationHistory.push({
        key,
        result,
        timestamp: new Date(),
      });

      // Keep only last 1000 evaluations
      if (this.evaluationHistory.length > 1000) {
        this.evaluationHistory.shift();
      }
    }

    // Remote config
    async fetchRemoteConfig() {
      if (!this.config.remoteConfigUrl) return;

      try {
        const response = await fetch(this.config.remoteConfigUrl);
        const data = await response.json();

        if (data.flags) {
          Object.entries(data.flags).forEach(([key, options]) => {
            this.register(key, options);
          });
        }

        console.log("[FeatureFlags] Remote config loaded");
      } catch (error) {
        console.warn("[FeatureFlags] Failed to fetch remote config:", error);
      }
    }

    startRefreshTimer() {
      if (this.config.remoteConfigUrl && this.config.refreshInterval > 0) {
        setInterval(() => {
          this.fetchRemoteConfig();
        }, this.config.refreshInterval);
      }
    }

    // Get all flags
    getAllFlags() {
      const result = {};
      this.flags.forEach((flag, key) => {
        result[key] = {
          ...flag,
          currentValue: this.isEnabled(key),
          hasOverride: this.overrides.has(key),
        };
      });
      return result;
    }

    // Get flags by category
    getFlagsByCategory(category) {
      const result = [];
      this.flags.forEach((flag, key) => {
        if (flag.category === category) {
          result.push({
            ...flag,
            key,
            currentValue: this.isEnabled(key),
            hasOverride: this.overrides.has(key),
          });
        }
      });
      return result;
    }

    // Get categories
    getCategories() {
      const categories = new Set();
      this.flags.forEach((flag) => {
        categories.add(flag.category);
      });
      return Array.from(categories);
    }

    // UI
    createUI() {
      this.panel = document.createElement("div");
      this.panel.id = "bael-featureflags-panel";
      this.panel.innerHTML = `
                <div class="ff-header">
                    <h3>🚩 Feature Flags</h3>
                    <div class="ff-actions">
                        <button class="reset-btn" title="Clear all overrides">Reset All</button>
                        <button class="close-btn">✕</button>
                    </div>
                </div>

                <div class="ff-search">
                    <input type="text" id="ff-search-input" placeholder="Search flags...">
                </div>

                <div class="ff-categories" id="ff-categories"></div>

                <div class="ff-list" id="ff-list"></div>

                <div class="ff-footer">
                    <span class="ff-user-id">User: ${this.userId.substring(0, 16)}...</span>
                    <span class="ff-count" id="ff-count">0 flags</span>
                </div>
            `;
      document.body.appendChild(this.panel);
    }

    updateUI() {
      this.updateCategories();
      this.updateFlagList();
    }

    updateCategories() {
      const container = document.getElementById("ff-categories");
      if (!container) return;

      const categories = this.getCategories();
      container.innerHTML = `
                <button class="category-btn active" data-category="all">All</button>
                ${categories
                  .map(
                    (cat) => `
                    <button class="category-btn" data-category="${cat}">${this.formatCategory(cat)}</button>
                `,
                  )
                  .join("")}
            `;
    }

    updateFlagList(filter = {}) {
      const list = document.getElementById("ff-list");
      if (!list) return;

      const { category = "all", search = "" } = filter;
      let flags = [];

      this.flags.forEach((flag, key) => {
        if (category !== "all" && flag.category !== category) return;
        if (
          search &&
          !flag.name.toLowerCase().includes(search.toLowerCase()) &&
          !key.toLowerCase().includes(search.toLowerCase())
        )
          return;

        flags.push({
          ...flag,
          key,
          currentValue: this.isEnabled(key),
          hasOverride: this.overrides.has(key),
        });
      });

      list.innerHTML =
        flags
          .map(
            (flag) => `
                <div class="ff-item ${flag.currentValue ? "enabled" : "disabled"} ${flag.hasOverride ? "overridden" : ""}">
                    <div class="ff-item-main">
                        <div class="ff-item-info">
                            <span class="ff-name">${flag.name}</span>
                            <span class="ff-key">${flag.key}</span>
                            <span class="ff-category-badge">${this.formatCategory(flag.category)}</span>
                        </div>
                        <div class="ff-toggle">
                            <label class="toggle-switch">
                                <input type="checkbox" ${flag.currentValue ? "checked" : ""} data-flag="${flag.key}">
                                <span class="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                    <div class="ff-item-details">
                        <p class="ff-description">${flag.description}</p>
                        <div class="ff-meta">
                            ${flag.rolloutPercentage < 100 ? `<span class="ff-rollout">${flag.rolloutPercentage}% rollout</span>` : ""}
                            ${flag.hasOverride ? `<span class="ff-override-badge">Overridden</span>` : ""}
                            <span class="ff-evals">${flag.evaluations} evaluations</span>
                        </div>
                    </div>
                </div>
            `,
          )
          .join("") || '<div class="no-flags">No flags found</div>';

      document.getElementById("ff-count").textContent = `${flags.length} flags`;
    }

    formatCategory(category) {
      return category
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
    }

    addStyles() {
      const style = document.createElement("style");
      style.textContent = `
                #bael-featureflags-panel {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0.9);
                    width: 600px;
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

                #bael-featureflags-panel.visible {
                    display: flex;
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }

                .ff-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    background: var(--bael-bg-dark, #151515);
                    border-bottom: 1px solid var(--bael-border, #333);
                }

                .ff-header h3 {
                    margin: 0;
                    font-size: 16px;
                    color: var(--bael-text, #fff);
                }

                .ff-actions {
                    display: flex;
                    gap: 8px;
                }

                .ff-actions button {
                    background: var(--bael-surface, #252525);
                    border: 1px solid var(--bael-border, #333);
                    color: var(--bael-text, #fff);
                    padding: 6px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 12px;
                }

                .ff-actions .close-btn {
                    background: transparent;
                    border: none;
                }

                .ff-search {
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--bael-border, #333);
                }

                .ff-search input {
                    width: 100%;
                    padding: 10px 12px;
                    background: var(--bael-bg-dark, #151515);
                    border: 1px solid var(--bael-border, #333);
                    color: var(--bael-text, #fff);
                    border-radius: 6px;
                    font-size: 13px;
                }

                .ff-categories {
                    display: flex;
                    gap: 8px;
                    padding: 12px 16px;
                    overflow-x: auto;
                    border-bottom: 1px solid var(--bael-border, #333);
                }

                .category-btn {
                    padding: 6px 12px;
                    background: var(--bael-bg-dark, #151515);
                    border: 1px solid var(--bael-border, #333);
                    color: var(--bael-text-dim, #888);
                    border-radius: 16px;
                    cursor: pointer;
                    font-size: 11px;
                    white-space: nowrap;
                }

                .category-btn.active {
                    background: var(--bael-accent, #00d4ff);
                    color: #000;
                    border-color: var(--bael-accent, #00d4ff);
                }

                .ff-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 12px 16px;
                }

                .ff-item {
                    background: var(--bael-bg-dark, #151515);
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 8px;
                    border-left: 3px solid #666;
                }

                .ff-item.enabled {
                    border-left-color: #4caf50;
                }

                .ff-item.disabled {
                    border-left-color: #f44336;
                }

                .ff-item.overridden {
                    background: rgba(255, 152, 0, 0.1);
                }

                .ff-item-main {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 8px;
                }

                .ff-item-info {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .ff-name {
                    font-weight: 600;
                    color: var(--bael-text, #fff);
                }

                .ff-key {
                    font-family: monospace;
                    font-size: 11px;
                    color: var(--bael-text-dim, #888);
                }

                .ff-category-badge {
                    font-size: 10px;
                    color: var(--bael-accent, #00d4ff);
                    text-transform: uppercase;
                }

                .toggle-switch {
                    position: relative;
                    display: inline-block;
                    width: 50px;
                    height: 26px;
                }

                .toggle-switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }

                .toggle-slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #444;
                    transition: 0.4s;
                    border-radius: 26px;
                }

                .toggle-slider:before {
                    position: absolute;
                    content: "";
                    height: 20px;
                    width: 20px;
                    left: 3px;
                    bottom: 3px;
                    background-color: white;
                    transition: 0.4s;
                    border-radius: 50%;
                }

                input:checked + .toggle-slider {
                    background-color: #4caf50;
                }

                input:checked + .toggle-slider:before {
                    transform: translateX(24px);
                }

                .ff-description {
                    font-size: 12px;
                    color: var(--bael-text-dim, #888);
                    margin: 0 0 8px;
                }

                .ff-meta {
                    display: flex;
                    gap: 12px;
                    font-size: 11px;
                }

                .ff-rollout {
                    color: #ff9800;
                }

                .ff-override-badge {
                    color: #ff9800;
                    font-weight: 500;
                }

                .ff-evals {
                    color: var(--bael-text-dim, #888);
                }

                .ff-footer {
                    display: flex;
                    justify-content: space-between;
                    padding: 12px 16px;
                    background: var(--bael-bg-dark, #151515);
                    border-top: 1px solid var(--bael-border, #333);
                    font-size: 11px;
                    color: var(--bael-text-dim, #888);
                }

                .no-flags {
                    text-align: center;
                    padding: 40px;
                    color: var(--bael-text-dim, #888);
                }
            `;
      document.head.appendChild(style);
    }

    bindEvents() {
      // Close button
      this.panel.querySelector(".close-btn").addEventListener("click", () => {
        this.close();
      });

      // Reset button
      this.panel.querySelector(".reset-btn").addEventListener("click", () => {
        if (confirm("Clear all flag overrides?")) {
          this.clearAllOverrides();
        }
      });

      // Search
      document
        .getElementById("ff-search-input")
        ?.addEventListener("input", (e) => {
          const activeCategory =
            this.panel.querySelector(".category-btn.active")?.dataset
              .category || "all";
          this.updateFlagList({
            search: e.target.value,
            category: activeCategory,
          });
        });

      // Category buttons
      this.panel.addEventListener("click", (e) => {
        if (e.target.classList.contains("category-btn")) {
          this.panel
            .querySelectorAll(".category-btn")
            .forEach((b) => b.classList.remove("active"));
          e.target.classList.add("active");

          const search =
            document.getElementById("ff-search-input")?.value || "";
          this.updateFlagList({ category: e.target.dataset.category, search });
        }
      });

      // Toggle switches
      this.panel.addEventListener("change", (e) => {
        if (e.target.dataset.flag) {
          this.setOverride(e.target.dataset.flag, e.target.checked);
        }
      });

      // Keyboard shortcut
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "F") {
          e.preventDefault();
          this.toggle();
        }
      });
    }

    open() {
      this.panel.classList.add("visible");
      this.updateUI();
    }

    close() {
      this.panel.classList.remove("visible");
    }

    toggle() {
      if (this.panel.classList.contains("visible")) {
        this.close();
      } else {
        this.open();
      }
    }

    get isVisible() {
      return this.panel.classList.contains("visible");
    }
  }

  // Initialize
  window.BaelFeatureFlags = new BaelFeatureFlags();
})();
