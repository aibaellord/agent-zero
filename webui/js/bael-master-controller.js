/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BAEL - LORD OF ALL
 * MASTER CONTROLLER - Supreme Orchestration System
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * The Master Controller coordinates all 76+ Bael systems, ensuring seamless
 * integration, optimal performance, and unified control across the entire
 * framework. This is the brain that connects every module.
 *
 * Features:
 * - System registry and lifecycle management
 * - Cross-system event bus and communication
 * - Centralized state management
 * - Performance monitoring and optimization
 * - Error recovery and self-healing
 * - Feature flags and configuration
 * - Hot module reload support
 * - Dependency injection
 * - Plugin architecture support
 *
 * @version 2.0.0
 * @author Bael System
 */

(function () {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════
  // MASTER CONTROLLER CLASS
  // ═══════════════════════════════════════════════════════════════════════

  class BaelMasterController {
    constructor() {
      // Core state
      this.version = "2.0.0";
      this.initialized = false;
      this.startTime = Date.now();

      // System registry
      this.systems = new Map();
      this.systemOrder = [];
      this.dependencies = new Map();

      // Event system
      this.eventBus = new EventTarget();
      this.eventHistory = [];
      this.maxEventHistory = 1000;

      // State management
      this.globalState = this.createReactiveState({
        theme: localStorage.getItem("bael_theme") || "bael-dark",
        focusMode: false,
        sidebarOpen: true,
        activeChat: null,
        isProcessing: false,
        connectionStatus: "connected",
        heisenbergActive: false,
        systemHealth: 100,
        totalTokens: 0,
        sessionDuration: 0,
      });

      // Performance metrics
      this.metrics = {
        systemLoadTimes: new Map(),
        eventCounts: new Map(),
        errorCounts: new Map(),
        lastHealthCheck: null,
      };

      // Feature flags
      this.features = {
        heisenberg: true,
        voiceCommands: true,
        workflows: true,
        workspaces: true,
        multiModel: true,
        analytics: true,
        collaboration: false,
        debugMode: false,
      };

      // Initialize
      this.init();
    }

    // ═════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═════════════════════════════════════════════════════════════════

    async init() {
      console.log("👑 BAEL Master Controller initializing...");

      try {
        // Load configuration
        await this.loadConfiguration();

        // Register core systems
        this.registerCoreSystems();

        // Setup global error handling
        this.setupErrorHandling();

        // Setup performance monitoring
        this.setupPerformanceMonitoring();

        // Setup cross-system communication
        this.setupEventBridge();

        // Initialize health check
        this.startHealthCheck();

        // Mark as initialized
        this.initialized = true;

        // Emit ready event
        this.emit("bael:ready", {
          version: this.version,
          systems: this.systems.size,
          loadTime: Date.now() - this.startTime,
        });

        console.log(
          `👑 BAEL Master Controller ready (${Date.now() - this.startTime}ms)`,
        );
        console.log(`   📦 ${this.systems.size} systems registered`);
      } catch (error) {
        console.error("❌ Master Controller initialization failed:", error);
        this.handleCriticalError(error);
      }
    }

    async loadConfiguration() {
      // Load feature flags from localStorage
      const savedFeatures = localStorage.getItem("bael_features");
      if (savedFeatures) {
        try {
          Object.assign(this.features, JSON.parse(savedFeatures));
        } catch (e) {}
      }

      // Load from server if available
      try {
        const response = await fetch("/get_settings", { method: "POST" });
        if (response.ok) {
          const settings = await response.json();
          if (settings.bael_features) {
            Object.assign(this.features, settings.bael_features);
          }
        }
      } catch (e) {
        // Server not available, use defaults
      }
    }

    registerCoreSystems() {
      // Auto-discover and register all Bael systems
      const systemPatterns = [
        "BaelCore",
        "BaelCommandPalette",
        "BaelFocusMode",
        "BaelTokenCounter",
        "BaelNotesPanel",
        "BaelThinkingViz",
        "BaelPromptLibrary",
        "BaelPerformance",
        "BaelThemeEditor",
        "BaelSplitView",
        "BaelFloatingAction",
        "BaelChatSearch",
        "BaelKeybindings",
        "BaelExport",
        "BaelContextMenu",
        "BaelSessionStats",
        "BaelMarkdownPreview",
        "BaelNotifications",
        "BaelAudio",
        "BaelMacroRecorder",
        "BaelVoiceCommands",
        "BaelMemoryViz",
        "BaelWorkflowBuilder",
        "BaelPluginSystem",
        "BaelMultiModel",
        "BaelTimeline",
        "BaelPlayground",
        "BaelDashboard",
        "BaelPersonas",
        "BaelBookmarks",
        "BaelTemplates",
        "BaelAccessibility",
        "BaelDiffViewer",
        "BaelTerminal",
        "BaelAnalytics",
        "BaelSnippets",
        "BaelFiletree",
        "BaelQuickActions",
        "BaelCollaboration",
        "BaelHistory",
        "BaelAutoSave",
        "BaelBranching",
        "BaelRating",
        "BaelShortcuts",
        "BaelConnection",
        "BaelModelCompare",
        "BaelContextViz",
        "BaelAgentMonitor",
        "BaelConversationFlow",
        "BaelSmartSuggestions",
        "BaelSessionManager",
        "BaelMessagePinning",
        "BaelNotificationCenter",
        "BaelQuickReply",
        "BaelResponseCache",
        "BaelMarkdownRenderer",
        "BaelSentimentAnalyzer",
        "BaelAgentRoster",
        "BaelImageGenerator",
        "BaelTaskScheduler",
        "BaelConversationBranches",
        "BaelApiMonitor",
        "BaelMemoryBrowser",
        "BaelCodeRefactor",
        "BaelDebugConsole",
        "BaelModelSelector",
        "BaelSecretVault",
        "BaelNetworkInspector",
        "BaelCodePlayground",
        "BaelContextMonitor",
        "BaelMessageBookmarks",
        "BaelMessageReactions",
        "BaelPersonaSwitcher",
        "BaelTimelineVisualizer",
        "BaelTypingIndicator",
        "BaelWorkspaceManager",
      ];

      systemPatterns.forEach((name) => {
        if (window[name]) {
          this.register(name, window[name], {
            autoInit: false,
            category: this.categorizeSystem(name),
          });
        }
      });
    }

    categorizeSystem(name) {
      const categories = {
        ui: ["Theme", "Focus", "Split", "Floating", "Context", "Accessibility"],
        chat: ["Message", "Conversation", "Quick", "Response", "Markdown"],
        ai: ["Model", "Thinking", "Sentiment", "Agent", "Heisenberg"],
        tools: ["Command", "Code", "Terminal", "Diff", "Snippet", "Workflow"],
        data: ["Memory", "History", "Export", "Analytics", "Session", "Cache"],
        media: ["Audio", "Voice", "Image"],
        system: ["Core", "Performance", "Connection", "Notification", "Plugin"],
      };

      for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some((k) => name.includes(k))) {
          return category;
        }
      }
      return "other";
    }

    // ═════════════════════════════════════════════════════════════════
    // SYSTEM REGISTRY
    // ═════════════════════════════════════════════════════════════════

    register(name, system, options = {}) {
      const startTime = performance.now();

      const registration = {
        name,
        system,
        options,
        status: "registered",
        registeredAt: Date.now(),
        loadTime: null,
        errors: [],
        lastActivity: null,
      };

      this.systems.set(name, registration);
      this.systemOrder.push(name);

      // Track dependencies
      if (options.dependencies) {
        this.dependencies.set(name, options.dependencies);
      }

      registration.loadTime = performance.now() - startTime;
      this.metrics.systemLoadTimes.set(name, registration.loadTime);

      return this;
    }

    get(name) {
      const registration = this.systems.get(name);
      return registration ? registration.system : null;
    }

    has(name) {
      return this.systems.has(name);
    }

    getAll(category = null) {
      const systems = [];
      for (const [name, reg] of this.systems) {
        if (!category || reg.options.category === category) {
          systems.push({ name, ...reg });
        }
      }
      return systems;
    }

    // ═════════════════════════════════════════════════════════════════
    // EVENT SYSTEM
    // ═════════════════════════════════════════════════════════════════

    on(event, handler) {
      this.eventBus.addEventListener(event, handler);
      return () => this.off(event, handler);
    }

    off(event, handler) {
      this.eventBus.removeEventListener(event, handler);
    }

    emit(event, data = {}) {
      const eventObj = new CustomEvent(event, {
        detail: { ...data, timestamp: Date.now() },
      });

      // Track event
      this.eventHistory.push({ event, data, timestamp: Date.now() });
      if (this.eventHistory.length > this.maxEventHistory) {
        this.eventHistory.shift();
      }

      // Update metrics
      const count = (this.metrics.eventCounts.get(event) || 0) + 1;
      this.metrics.eventCounts.set(event, count);

      // Dispatch
      this.eventBus.dispatchEvent(eventObj);

      // Also dispatch to window for legacy support
      window.dispatchEvent(new CustomEvent(event, { detail: data }));
    }

    setupEventBridge() {
      // Bridge key events between systems
      const bridgedEvents = [
        "bael-message-sent",
        "bael-message-received",
        "bael-theme-change",
        "bael-focus-mode",
        "bael-sidebar-toggle",
        "bael-chat-switch",
        "bael-tool-call",
        "bael-thought",
        "bael-error",
        "bael-success",
      ];

      bridgedEvents.forEach((event) => {
        window.addEventListener(event, (e) => {
          this.emit(event, e.detail);
        });
      });

      // Bridge Alpine store changes
      if (window.Alpine) {
        document.addEventListener("alpine:init", () => {
          // Watch for store changes
          ["settings", "chats", "tabs"].forEach((storeName) => {
            const store = Alpine.store(storeName);
            if (store) {
              this.emit(`bael:store:${storeName}:init`, { store });
            }
          });
        });
      }
    }

    // ═════════════════════════════════════════════════════════════════
    // STATE MANAGEMENT
    // ═════════════════════════════════════════════════════════════════

    createReactiveState(initial) {
      const controller = this;

      return new Proxy(initial, {
        set(target, property, value) {
          const oldValue = target[property];
          target[property] = value;

          if (oldValue !== value) {
            controller.emit("bael:state:change", {
              property,
              oldValue,
              newValue: value,
            });
          }

          return true;
        },
      });
    }

    getState(key) {
      return key ? this.globalState[key] : { ...this.globalState };
    }

    setState(key, value) {
      if (typeof key === "object") {
        Object.assign(this.globalState, key);
      } else {
        this.globalState[key] = value;
      }
    }

    // ═════════════════════════════════════════════════════════════════
    // PERFORMANCE MONITORING
    // ═════════════════════════════════════════════════════════════════

    setupPerformanceMonitoring() {
      // Track page performance
      if (window.PerformanceObserver) {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === "longtask") {
              this.emit("bael:performance:longtask", {
                duration: entry.duration,
                startTime: entry.startTime,
              });
            }
          }
        });

        try {
          observer.observe({ entryTypes: ["longtask"] });
        } catch (e) {}
      }

      // Track memory usage
      setInterval(() => {
        if (performance.memory) {
          this.emit("bael:performance:memory", {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
          });
        }
      }, 30000);
    }

    getPerformanceReport() {
      return {
        uptime: Date.now() - this.startTime,
        systemsLoaded: this.systems.size,
        systemLoadTimes: Object.fromEntries(this.metrics.systemLoadTimes),
        eventCounts: Object.fromEntries(this.metrics.eventCounts),
        errorCounts: Object.fromEntries(this.metrics.errorCounts),
        lastHealthCheck: this.metrics.lastHealthCheck,
        memory: performance.memory
          ? {
              used: performance.memory.usedJSHeapSize,
              total: performance.memory.totalJSHeapSize,
            }
          : null,
      };
    }

    // ═════════════════════════════════════════════════════════════════
    // HEALTH CHECK
    // ═════════════════════════════════════════════════════════════════

    startHealthCheck() {
      setInterval(() => this.runHealthCheck(), 60000);
      this.runHealthCheck();
    }

    runHealthCheck() {
      const results = {
        timestamp: Date.now(),
        systems: {},
        overallHealth: 100,
      };

      let healthyCount = 0;
      let totalCount = 0;

      for (const [name, reg] of this.systems) {
        totalCount++;
        const isHealthy = reg.errors.length === 0 && reg.status !== "error";
        results.systems[name] = {
          status: reg.status,
          errors: reg.errors.length,
          healthy: isHealthy,
        };
        if (isHealthy) healthyCount++;
      }

      results.overallHealth =
        totalCount > 0 ? (healthyCount / totalCount) * 100 : 100;
      this.globalState.systemHealth = results.overallHealth;
      this.metrics.lastHealthCheck = results;

      this.emit("bael:health:check", results);

      return results;
    }

    // ═════════════════════════════════════════════════════════════════
    // ERROR HANDLING
    // ═════════════════════════════════════════════════════════════════

    setupErrorHandling() {
      // Global error handler
      window.addEventListener("error", (event) => {
        this.handleError(event.error, "uncaught");
      });

      // Promise rejection handler
      window.addEventListener("unhandledrejection", (event) => {
        this.handleError(event.reason, "unhandledrejection");
      });
    }

    handleError(error, type = "error") {
      const errorInfo = {
        message: error?.message || String(error),
        stack: error?.stack,
        type,
        timestamp: Date.now(),
      };

      // Track error count
      const count = (this.metrics.errorCounts.get(type) || 0) + 1;
      this.metrics.errorCounts.set(type, count);

      // Emit error event
      this.emit("bael:error", errorInfo);

      // Log to console
      console.error(`[BAEL ERROR] ${type}:`, error);

      // Try to recover
      this.attemptRecovery(errorInfo);
    }

    handleCriticalError(error) {
      console.error("🚨 CRITICAL ERROR:", error);

      // Show user-friendly error
      if (window.BaelNotifications) {
        window.BaelNotifications.error(
          "System error occurred. Some features may be unavailable.",
        );
      }
    }

    attemptRecovery(errorInfo) {
      // Basic recovery strategies
      if (
        errorInfo.message.includes("fetch") ||
        errorInfo.message.includes("network")
      ) {
        // Network error - emit connection issue
        this.globalState.connectionStatus = "disconnected";
        this.emit("bael:connection:lost");
      }
    }

    // ═════════════════════════════════════════════════════════════════
    // FEATURE FLAGS
    // ═════════════════════════════════════════════════════════════════

    isEnabled(feature) {
      return this.features[feature] === true;
    }

    enableFeature(feature) {
      this.features[feature] = true;
      this.saveFeatures();
      this.emit("bael:feature:enabled", { feature });
    }

    disableFeature(feature) {
      this.features[feature] = false;
      this.saveFeatures();
      this.emit("bael:feature:disabled", { feature });
    }

    saveFeatures() {
      localStorage.setItem("bael_features", JSON.stringify(this.features));
    }

    // ═════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═════════════════════════════════════════════════════════════════

    // Show the command palette
    showCommandPalette() {
      if (window.BaelCommandPalette) {
        window.BaelCommandPalette.toggle();
      }
    }

    // Toggle focus mode
    toggleFocusMode() {
      if (window.BaelFocusMode) {
        window.BaelFocusMode.toggle();
      }
    }

    // Show dashboard
    showDashboard() {
      if (window.BaelDashboard) {
        window.BaelDashboard.toggle();
      }
    }

    // Show workflow builder
    showWorkflowBuilder() {
      if (window.BaelWorkflowBuilder) {
        window.BaelWorkflowBuilder.toggle();
      }
    }

    // Get system status
    getStatus() {
      return {
        version: this.version,
        initialized: this.initialized,
        uptime: Date.now() - this.startTime,
        systemCount: this.systems.size,
        health: this.globalState.systemHealth,
        features: { ...this.features },
        state: this.getState(),
      };
    }

    // Debug mode
    enableDebugMode() {
      this.features.debugMode = true;
      console.log("🔧 Debug mode enabled");
      console.log("Status:", this.getStatus());
      console.log("Performance:", this.getPerformanceReport());
    }
  }

  // ═══════════════════════════════════════════════════════════════════════
  // INITIALIZE AND EXPOSE
  // ═══════════════════════════════════════════════════════════════════════

  // Create global instance
  window.BaelMaster = new BaelMasterController();

  // Expose convenience methods
  window.Bael = {
    // Core
    get master() {
      return window.BaelMaster;
    },
    get version() {
      return window.BaelMaster.version;
    },

    // Quick access
    command: () => window.BaelMaster.showCommandPalette(),
    focus: () => window.BaelMaster.toggleFocusMode(),
    dashboard: () => window.BaelMaster.showDashboard(),
    workflow: () => window.BaelMaster.showWorkflowBuilder(),

    // State
    getState: (key) => window.BaelMaster.getState(key),
    setState: (key, value) => window.BaelMaster.setState(key, value),

    // Events
    on: (event, handler) => window.BaelMaster.on(event, handler),
    emit: (event, data) => window.BaelMaster.emit(event, data),

    // Systems
    get: (name) => window.BaelMaster.get(name),
    has: (name) => window.BaelMaster.has(name),

    // Features
    isEnabled: (feature) => window.BaelMaster.isEnabled(feature),

    // Debug
    debug: () => window.BaelMaster.enableDebugMode(),
    status: () => window.BaelMaster.getStatus(),
    performance: () => window.BaelMaster.getPerformanceReport(),
  };

  console.log("👑 BAEL - LORD OF ALL - Master Controller loaded");
  console.log("   Type Bael.debug() to enable debug mode");
  console.log("   Type Bael.status() to view system status");
})();
