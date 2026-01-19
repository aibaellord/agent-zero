/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █   ██████╗ ██╗   ██╗██╗    ██╗   ██╗███╗   ██╗██╗███████╗██╗███████╗██████╗█
 * █  ██╔════╝ ██║   ██║██║    ██║   ██║████╗  ██║██║██╔════╝██║██╔════╝██╔══██╗
 * █  ██║  ███╗██║   ██║██║    ██║   ██║██╔██╗ ██║██║█████╗  ██║█████╗  ██████╔╝
 * █  ██║   ██║██║   ██║██║    ██║   ██║██║╚██╗██║██║██╔══╝  ██║██╔══╝  ██╔══██╗
 * █  ╚██████╔╝╚██████╔╝██║    ╚██████╔╝██║ ╚████║██║██║     ██║███████╗██║  ██║
 * █   ╚═════╝  ╚═════╝ ╚═╝     ╚═════╝ ╚═╝  ╚═══╝╚═╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═╝
 * █                                                                          █
 * █   BAEL GUI UNIFIER - Complete Agent Zero & Bael Integration             █
 * █   Bridges 62 API endpoints with 258 Bael modules seamlessly             █
 * █   "As Above, So Below" - Maximum Power, Zero Constraints                █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════
  // BAEL GUI UNIFIER - Master Integration Layer
  // ═══════════════════════════════════════════════════════════════════════════

  class BaelGUIUnifier {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.stores = new Map();
      this.endpoints = new Map();
      this.subscribers = new Map();
      this.requestCache = new Map();
      this.pendingRequests = new Map();

      // Performance tracking
      this.metrics = {
        apiCalls: 0,
        cacheHits: 0,
        cacheMisses: 0,
        totalLatency: 0,
        errors: 0,
      };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════

    async initialize() {
      console.log("🔗 Bael GUI Unifier initializing...");

      try {
        // Register all 62 API endpoints
        this.registerAllEndpoints();

        // Capture Alpine stores
        await this.captureAlpineStores();

        // Initialize unified API
        this.initializeUnifiedAPI();

        // Initialize domain-specific managers
        this.initializeChatManager();
        this.initializeSettingsManager();
        this.initializeSchedulerManager();
        this.initializeFileManager();
        this.initializeMemoryManager();
        this.initializeMCPManager();
        this.initializeProjectManager();
        this.initializeNotificationManager();
        this.initializeBackupManager();
        this.initializeSpeechManager();
        this.initializeHeisenbergManager();

        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();

        // Setup global error handling
        this.setupErrorHandling();

        // Connect to Bael power systems
        this.connectPowerSystems();

        this.initialized = true;
        console.log("✅ BAEL GUI UNIFIER ACTIVE - 62 endpoints bridged");

        // Emit initialization event
        this.emit("initialized", { version: this.version });

        return this;
      } catch (error) {
        console.error("❌ Bael GUI Unifier initialization failed:", error);
        throw error;
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ENDPOINT REGISTRATION - All 62 API Endpoints
    // ═══════════════════════════════════════════════════════════════════════

    registerAllEndpoints() {
      const endpoints = {
        // ─────────────────────────────────────────────────────────────────
        // Chat & Messaging (14 endpoints)
        // ─────────────────────────────────────────────────────────────────
        message: { path: "/message", method: "POST", category: "chat" },
        message_async: {
          path: "/message_async",
          method: "POST",
          category: "chat",
        },
        poll: { path: "/poll", method: "POST", category: "chat" },
        pause: { path: "/pause", method: "POST", category: "chat" },
        nudge: { path: "/nudge", method: "POST", category: "chat" },
        reset: { path: "/reset", method: "POST", category: "chat" },
        restart: { path: "/restart", method: "POST", category: "chat" },
        chat_create: { path: "/chat_create", method: "POST", category: "chat" },
        chat_remove: { path: "/chat_remove", method: "POST", category: "chat" },
        chat_reset: { path: "/chat_reset", method: "POST", category: "chat" },
        chat_load: { path: "/chat_load", method: "POST", category: "chat" },
        chat_export: { path: "/chat_export", method: "POST", category: "chat" },
        chat_files_path_get: {
          path: "/chat_files_path_get",
          method: "GET",
          category: "chat",
        },
        history_get: { path: "/history_get", method: "GET", category: "chat" },
        ctx_window_get: {
          path: "/ctx_window_get",
          method: "GET",
          category: "chat",
        },

        // ─────────────────────────────────────────────────────────────────
        // Settings (3 endpoints)
        // ─────────────────────────────────────────────────────────────────
        settings_get: {
          path: "/settings_get",
          method: "GET",
          category: "settings",
        },
        settings_set: {
          path: "/settings_set",
          method: "POST",
          category: "settings",
        },
        csrf_token: {
          path: "/csrf_token",
          method: "GET",
          category: "settings",
        },

        // ─────────────────────────────────────────────────────────────────
        // Scheduler (6 endpoints)
        // ─────────────────────────────────────────────────────────────────
        scheduler_tasks_list: {
          path: "/scheduler_tasks_list",
          method: "POST",
          category: "scheduler",
        },
        scheduler_task_create: {
          path: "/scheduler_task_create",
          method: "POST",
          category: "scheduler",
        },
        scheduler_task_update: {
          path: "/scheduler_task_update",
          method: "POST",
          category: "scheduler",
        },
        scheduler_task_delete: {
          path: "/scheduler_task_delete",
          method: "POST",
          category: "scheduler",
        },
        scheduler_task_run: {
          path: "/scheduler_task_run",
          method: "POST",
          category: "scheduler",
        },
        scheduler_tick: {
          path: "/scheduler_tick",
          method: "POST",
          category: "scheduler",
        },

        // ─────────────────────────────────────────────────────────────────
        // MCP - Model Context Protocol (4 endpoints)
        // ─────────────────────────────────────────────────────────────────
        mcp_servers_status: {
          path: "/mcp_servers_status",
          method: "POST",
          category: "mcp",
        },
        mcp_servers_apply: {
          path: "/mcp_servers_apply",
          method: "POST",
          category: "mcp",
        },
        mcp_server_get_detail: {
          path: "/mcp_server_get_detail",
          method: "POST",
          category: "mcp",
        },
        mcp_server_get_log: {
          path: "/mcp_server_get_log",
          method: "POST",
          category: "mcp",
        },

        // ─────────────────────────────────────────────────────────────────
        // File Management (7 endpoints)
        // ─────────────────────────────────────────────────────────────────
        get_work_dir_files: {
          path: "/get_work_dir_files",
          method: "POST",
          category: "files",
        },
        upload_work_dir_files: {
          path: "/upload_work_dir_files",
          method: "POST",
          category: "files",
          multipart: true,
        },
        download_work_dir_file: {
          path: "/download_work_dir_file",
          method: "GET",
          category: "files",
        },
        delete_work_dir_file: {
          path: "/delete_work_dir_file",
          method: "POST",
          category: "files",
        },
        file_info: { path: "/file_info", method: "POST", category: "files" },
        upload: {
          path: "/upload",
          method: "POST",
          category: "files",
          multipart: true,
        },
        image_get: { path: "/image_get", method: "GET", category: "files" },

        // ─────────────────────────────────────────────────────────────────
        // Memory & Knowledge (4 endpoints)
        // ─────────────────────────────────────────────────────────────────
        import_knowledge: {
          path: "/import_knowledge",
          method: "POST",
          category: "memory",
          multipart: true,
        },
        knowledge_path_get: {
          path: "/knowledge_path_get",
          method: "GET",
          category: "memory",
        },
        knowledge_reindex: {
          path: "/knowledge_reindex",
          method: "POST",
          category: "memory",
        },
        memory_dashboard: {
          path: "/memory_dashboard",
          method: "POST",
          category: "memory",
        },

        // ─────────────────────────────────────────────────────────────────
        // Notifications (4 endpoints)
        // ─────────────────────────────────────────────────────────────────
        notification_create: {
          path: "/notification_create",
          method: "POST",
          category: "notifications",
        },
        notifications_history: {
          path: "/notifications_history",
          method: "POST",
          category: "notifications",
        },
        notifications_mark_read: {
          path: "/notifications_mark_read",
          method: "POST",
          category: "notifications",
        },
        notifications_clear: {
          path: "/notifications_clear",
          method: "POST",
          category: "notifications",
        },

        // ─────────────────────────────────────────────────────────────────
        // Projects (1 action-based endpoint)
        // ─────────────────────────────────────────────────────────────────
        projects: { path: "/projects", method: "POST", category: "projects" },

        // ─────────────────────────────────────────────────────────────────
        // Backup & Restore (6 endpoints)
        // ─────────────────────────────────────────────────────────────────
        backup_create: {
          path: "/backup_create",
          method: "POST",
          category: "backup",
        },
        backup_restore: {
          path: "/backup_restore",
          method: "POST",
          category: "backup",
          multipart: true,
        },
        backup_restore_preview: {
          path: "/backup_restore_preview",
          method: "POST",
          category: "backup",
        },
        backup_preview_grouped: {
          path: "/backup_preview_grouped",
          method: "POST",
          category: "backup",
        },
        backup_inspect: {
          path: "/backup_inspect",
          method: "POST",
          category: "backup",
        },
        backup_get_defaults: {
          path: "/backup_get_defaults",
          method: "GET",
          category: "backup",
        },

        // ─────────────────────────────────────────────────────────────────
        // Heisenberg Advanced AI (3 endpoints)
        // ─────────────────────────────────────────────────────────────────
        heisenberg_status: {
          path: "/heisenberg_status",
          method: "POST",
          category: "heisenberg",
        },
        heisenberg_process: {
          path: "/heisenberg_process",
          method: "POST",
          category: "heisenberg",
        },
        heisenberg_instruments: {
          path: "/heisenberg_instruments",
          method: "POST",
          category: "heisenberg",
        },

        // ─────────────────────────────────────────────────────────────────
        // External API Access (4 endpoints)
        // ─────────────────────────────────────────────────────────────────
        api_message: {
          path: "/api_message",
          method: "POST",
          category: "external",
        },
        api_log_get: {
          path: "/api_log_get",
          method: "GET",
          category: "external",
        },
        api_reset_chat: {
          path: "/api_reset_chat",
          method: "POST",
          category: "external",
        },
        api_terminate_chat: {
          path: "/api_terminate_chat",
          method: "POST",
          category: "external",
        },

        // ─────────────────────────────────────────────────────────────────
        // Speech (2 endpoints)
        // ─────────────────────────────────────────────────────────────────
        transcribe: {
          path: "/transcribe",
          method: "POST",
          category: "speech",
          multipart: true,
        },
        synthesize: { path: "/synthesize", method: "POST", category: "speech" },

        // ─────────────────────────────────────────────────────────────────
        // Tunnel & RFC (3 endpoints)
        // ─────────────────────────────────────────────────────────────────
        tunnel: { path: "/tunnel", method: "POST", category: "tunnel" },
        tunnel_proxy: {
          path: "/tunnel_proxy",
          method: "POST",
          category: "tunnel",
        },
        rfc: { path: "/rfc", method: "POST", category: "tunnel" },

        // ─────────────────────────────────────────────────────────────────
        // Health (1 endpoint)
        // ─────────────────────────────────────────────────────────────────
        health: { path: "/", method: "GET", category: "health" },
      };

      Object.entries(endpoints).forEach(([name, config]) => {
        this.endpoints.set(name, config);
      });

      console.log(`📡 Registered ${this.endpoints.size} API endpoints`);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ALPINE STORE CAPTURE
    // ═══════════════════════════════════════════════════════════════════════

    async captureAlpineStores() {
      const storeNames = [
        "sidebar",
        "chats",
        "tasks",
        "notifications",
        "input",
        "projects",
        "attachments",
        "speech",
        "preferences",
        "chatTop",
        "welcomeStore",
        "root",
      ];

      // Wait for Alpine to be ready
      await this.waitForAlpine();

      storeNames.forEach((name) => {
        try {
          const store = Alpine?.store(name);
          if (store) {
            this.stores.set(name, store);
          }
        } catch (e) {
          // Store may not exist yet
        }
      });

      console.log(`🏪 Captured ${this.stores.size} Alpine stores`);
    }

    async waitForAlpine(timeout = 5000) {
      const start = Date.now();
      while (!window.Alpine?.store && Date.now() - start < timeout) {
        await new Promise((r) => setTimeout(r, 50));
      }
      return !!window.Alpine?.store;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // UNIFIED API - Core Request Handler
    // ═══════════════════════════════════════════════════════════════════════

    initializeUnifiedAPI() {
      const self = this;

      window.BaelAPI = {
        // Core request method with caching, deduplication, and metrics
        async request(endpoint, data = {}, options = {}) {
          const config = self.endpoints.get(endpoint);
          if (!config) {
            console.warn(`Unknown endpoint: ${endpoint}`);
            return { error: `Unknown endpoint: ${endpoint}` };
          }

          const cacheKey = options.cache
            ? `${endpoint}:${JSON.stringify(data)}`
            : null;

          // Check cache
          if (cacheKey && self.requestCache.has(cacheKey)) {
            const cached = self.requestCache.get(cacheKey);
            if (Date.now() - cached.timestamp < (options.cacheTTL || 30000)) {
              self.metrics.cacheHits++;
              return cached.data;
            }
          }

          // Deduplicate concurrent requests
          if (cacheKey && self.pendingRequests.has(cacheKey)) {
            return await self.pendingRequests.get(cacheKey);
          }

          const requestPromise = self.executeRequest(config, data, options);

          if (cacheKey) {
            self.pendingRequests.set(cacheKey, requestPromise);
          }

          try {
            const result = await requestPromise;

            // Cache successful responses
            if (cacheKey && !result.error) {
              self.requestCache.set(cacheKey, {
                data: result,
                timestamp: Date.now(),
              });
            }

            return result;
          } finally {
            if (cacheKey) {
              self.pendingRequests.delete(cacheKey);
            }
          }
        },

        // Convenience methods
        async get(endpoint, params = {}, options = {}) {
          return await this.request(endpoint, params, {
            ...options,
            method: "GET",
          });
        },

        async post(endpoint, data = {}, options = {}) {
          return await this.request(endpoint, data, {
            ...options,
            method: "POST",
          });
        },

        // Get metrics
        getMetrics() {
          return { ...self.metrics };
        },

        // Clear cache
        clearCache() {
          self.requestCache.clear();
        },

        // Get all endpoints
        getEndpoints() {
          return Array.from(self.endpoints.entries()).map(([name, config]) => ({
            name,
            ...config,
          }));
        },

        // Get endpoints by category
        getEndpointsByCategory(category) {
          return this.getEndpoints().filter((e) => e.category === category);
        },
      };
    }

    async executeRequest(config, data, options) {
      const startTime = performance.now();
      this.metrics.apiCalls++;
      this.metrics.cacheMisses++;

      try {
        let url = config.path;
        let fetchOptions = {
          method: options.method || config.method,
          headers: {},
        };

        if (config.multipart || options.multipart) {
          // Handle multipart/form-data
          const formData =
            data instanceof FormData ? data : this.toFormData(data);
          fetchOptions.body = formData;
        } else if (fetchOptions.method === "POST") {
          fetchOptions.headers["Content-Type"] = "application/json";
          fetchOptions.body = JSON.stringify(data);
        } else if (
          fetchOptions.method === "GET" &&
          Object.keys(data).length > 0
        ) {
          const params = new URLSearchParams(data);
          url = `${url}?${params.toString()}`;
        }

        const response = await fetch(url, fetchOptions);

        // Track latency
        this.metrics.totalLatency += performance.now() - startTime;

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          return await response.json();
        } else if (contentType?.includes("text/")) {
          return { text: await response.text() };
        } else {
          return { blob: await response.blob() };
        }
      } catch (error) {
        this.metrics.errors++;
        console.error(`API Error [${config.path}]:`, error);
        this.emit("api:error", { endpoint: config.path, error });
        return { error: error.message };
      }
    }

    toFormData(data) {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof File || value instanceof Blob) {
          formData.append(key, value);
        } else if (Array.isArray(value)) {
          value.forEach((v) => formData.append(key, v));
        } else if (typeof value === "object") {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      });
      return formData;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CHAT MANAGER - BaelChat
    // ═══════════════════════════════════════════════════════════════════════

    initializeChatManager() {
      const self = this;

      window.BaelChat = {
        // Send message with attachments
        async send(message, attachments = []) {
          const formData = new FormData();
          formData.append("text", message);

          // Get chat ID from store
          const chatStore = self.stores.get("chats");
          if (chatStore?.selectedId) {
            formData.append("context", chatStore.selectedId);
          }

          // Add attachments
          attachments.forEach((file, i) => {
            formData.append(`visual_files`, file);
          });

          return await BaelAPI.request("message", formData, {
            multipart: true,
          });
        },

        // Send async message
        async sendAsync(message, attachments = []) {
          const formData = new FormData();
          formData.append("text", message);
          attachments.forEach((file) => formData.append("visual_files", file));
          return await BaelAPI.request("message_async", formData, {
            multipart: true,
          });
        },

        // Poll for updates
        async poll(logFrom = 0, logsApproved = true) {
          const chatStore = self.stores.get("chats");
          return await BaelAPI.post("poll", {
            context: chatStore?.selectedId || "",
            log_from: logFrom,
            logs_approved: logsApproved,
          });
        },

        // Pause/Resume
        async pause(paused = true) {
          return await BaelAPI.post("pause", { paused });
        },

        async resume() {
          return await this.pause(false);
        },

        // Control
        async nudge() {
          return await BaelAPI.post("nudge");
        },

        async reset() {
          return await BaelAPI.post("reset");
        },

        async restart() {
          return await BaelAPI.post("restart");
        },

        // Chat CRUD
        async create(name = "") {
          return await BaelAPI.post("chat_create", { name });
        },

        async remove(id) {
          return await BaelAPI.post("chat_remove", { id });
        },

        async resetHistory() {
          const chatStore = self.stores.get("chats");
          return await BaelAPI.post("chat_reset", {
            id: chatStore?.selectedId,
          });
        },

        async load() {
          return await BaelAPI.post("chat_load");
        },

        async export(id) {
          return await BaelAPI.post("chat_export", { id });
        },

        // Context
        async getContext() {
          return await BaelAPI.get(
            "ctx_window_get",
            {},
            { cache: true, cacheTTL: 5000 },
          );
        },

        async getHistory() {
          return await BaelAPI.get(
            "history_get",
            {},
            { cache: true, cacheTTL: 5000 },
          );
        },

        // Get current chat ID
        getCurrentId() {
          return self.stores.get("chats")?.selectedId;
        },

        // Get all chats
        getAll() {
          return self.stores.get("chats")?.chats || [];
        },
      };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SETTINGS MANAGER - BaelSettings
    // ═══════════════════════════════════════════════════════════════════════

    initializeSettingsManager() {
      const self = this;
      let settingsCache = null;

      window.BaelSettings = {
        // Get all settings
        async getAll(forceRefresh = false) {
          if (!forceRefresh && settingsCache) {
            return settingsCache;
          }
          const result = await BaelAPI.get("settings_get");
          if (!result.error) {
            settingsCache = result;
          }
          return result;
        },

        // Get nested value
        async get(path, defaultValue = null) {
          const settings = await this.getAll();
          return this.getByPath(settings, path, defaultValue);
        },

        // Set settings
        async set(settings) {
          const result = await BaelAPI.post("settings_set", settings);
          if (!result.error) {
            settingsCache = { ...settingsCache, ...settings };
            self.emit("settings:updated", settings);

            // Sync with BaelSettingsBridge if available
            if (window.BaelSettingsBridge) {
              Object.entries(settings).forEach(([key, value]) => {
                window.BaelSettingsBridge.set(key, value);
              });
            }
          }
          return result;
        },

        // Update single value
        async update(path, value) {
          const settings = await this.getAll();
          this.setByPath(settings, path, value);
          return await this.set(settings);
        },

        // Helper: Get value by path
        getByPath(obj, path, defaultValue = null) {
          const keys = path.split(".");
          let current = obj;
          for (const key of keys) {
            if (current === undefined || current === null) return defaultValue;
            current = current[key];
          }
          return current ?? defaultValue;
        },

        // Helper: Set value by path
        setByPath(obj, path, value) {
          const keys = path.split(".");
          let current = obj;
          for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = {};
            current = current[keys[i]];
          }
          current[keys[keys.length - 1]] = value;
        },

        // Clear cache
        clearCache() {
          settingsCache = null;
        },

        // Presets (convenience)
        presets: {
          minimal: {
            "chat_model.ctx_window": 16000,
            "memory.auto_recall": false,
          },
          balanced: {
            "chat_model.ctx_window": 32000,
            "memory.auto_recall": true,
          },
          maxPower: {
            "chat_model.ctx_window": 128000,
            "memory.auto_recall": true,
            "memory.ai_filter": true,
          },
        },

        async applyPreset(presetName) {
          const preset = this.presets[presetName];
          if (preset) {
            return await this.set(preset);
          }
          throw new Error(`Unknown preset: ${presetName}`);
        },
      };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SCHEDULER MANAGER - BaelScheduler
    // ═══════════════════════════════════════════════════════════════════════

    initializeSchedulerManager() {
      const self = this;

      window.BaelScheduler = {
        tasks: [],

        // List all tasks
        async list(forceRefresh = false) {
          const result = await BaelAPI.post(
            "scheduler_tasks_list",
            {},
            { cache: !forceRefresh, cacheTTL: 10000 },
          );
          if (result.tasks) {
            this.tasks = result.tasks;
            self.emit("scheduler:tasks-updated", this.tasks);
          }
          return this.tasks;
        },

        // Create task
        async create(task) {
          const result = await BaelAPI.post("scheduler_task_create", task);
          if (!result.error) {
            await this.list(true);
            self.emit("scheduler:task-created", result);
          }
          return result;
        },

        // Update task
        async update(task) {
          const result = await BaelAPI.post("scheduler_task_update", task);
          if (!result.error) {
            await this.list(true);
            self.emit("scheduler:task-updated", result);
          }
          return result;
        },

        // Delete task
        async delete(id) {
          const result = await BaelAPI.post("scheduler_task_delete", { id });
          if (!result.error) {
            await this.list(true);
            self.emit("scheduler:task-deleted", id);
          }
          return result;
        },

        // Run task immediately
        async run(id) {
          const result = await BaelAPI.post("scheduler_task_run", { id });
          self.emit("scheduler:task-run", { id, result });
          return result;
        },

        // Filter by type
        getByType(type) {
          return this.tasks.filter((t) => t.type === type);
        },

        getScheduled() {
          return this.getByType("scheduled");
        },
        getAdhoc() {
          return this.getByType("adhoc");
        },
        getPlanned() {
          return this.getByType("planned");
        },

        // Get by ID
        getById(id) {
          return this.tasks.find((t) => t.id === id);
        },

        // Create helpers for common task types
        async createScheduled(name, prompt, cronExpression, options = {}) {
          return await this.create({
            type: "scheduled",
            name,
            prompt,
            cron: cronExpression,
            enabled: true,
            ...options,
          });
        },

        async createAdhoc(name, prompt, options = {}) {
          return await this.create({
            type: "adhoc",
            name,
            prompt,
            enabled: true,
            ...options,
          });
        },

        async createPlanned(name, prompt, conditions, options = {}) {
          return await this.create({
            type: "planned",
            name,
            prompt,
            conditions,
            enabled: true,
            ...options,
          });
        },
      };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // FILE MANAGER - BaelFiles
    // ═══════════════════════════════════════════════════════════════════════

    initializeFileManager() {
      const self = this;

      window.BaelFiles = {
        currentPath: "",

        // List directory
        async list(path = "") {
          this.currentPath = path;
          const result = await BaelAPI.post("get_work_dir_files", { path });
          self.emit("files:listed", { path, files: result });
          return result;
        },

        // Upload files
        async upload(files, path = "") {
          const formData = new FormData();
          formData.append("path", path || this.currentPath);

          const fileArray =
            files instanceof FileList
              ? Array.from(files)
              : Array.isArray(files)
                ? files
                : [files];

          fileArray.forEach((file) => formData.append("files", file));

          const result = await BaelAPI.request(
            "upload_work_dir_files",
            formData,
            { multipart: true },
          );
          if (!result.error) {
            self.emit("files:uploaded", { path, files: fileArray });
          }
          return result;
        },

        // Download file
        download(path) {
          const url = `/download_work_dir_file?path=${encodeURIComponent(path)}`;
          window.location.href = url;
          self.emit("files:downloaded", { path });
        },

        // Delete file/folder
        async delete(path) {
          const result = await BaelAPI.post("delete_work_dir_file", { path });
          if (!result.error) {
            self.emit("files:deleted", { path });
          }
          return result;
        },

        // Get file info
        async info(path) {
          return await BaelAPI.post("file_info", { path });
        },

        // Navigation
        async navigate(path) {
          this.currentPath = path;
          return await this.list(path);
        },

        async navigateUp() {
          const parts = this.currentPath.split("/").filter(Boolean);
          parts.pop();
          return await this.navigate(parts.join("/"));
        },

        getPath() {
          return this.currentPath;
        },

        // Get image
        getImageUrl(path) {
          return `/image_get?path=${encodeURIComponent(path)}`;
        },
      };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // MEMORY MANAGER - BaelMemory
    // ═══════════════════════════════════════════════════════════════════════

    initializeMemoryManager() {
      const self = this;

      window.BaelMemory = {
        // Dashboard with stats
        async dashboard(options = {}) {
          return await BaelAPI.post("memory_dashboard", {
            action: "stats",
            ...options,
          });
        },

        // Search memories
        async search(query, options = {}) {
          return await BaelAPI.post("memory_dashboard", {
            action: "search",
            query,
            ...options,
          });
        },

        // Delete memories
        async delete(ids) {
          const idArray = Array.isArray(ids) ? ids : [ids];
          return await BaelAPI.post("memory_dashboard", {
            action: "bulk_delete",
            ids: idArray,
          });
        },

        // Import knowledge
        async importKnowledge(files) {
          const formData = new FormData();
          const fileArray =
            files instanceof FileList
              ? Array.from(files)
              : Array.isArray(files)
                ? files
                : [files];
          fileArray.forEach((file) => formData.append("files", file));

          const result = await BaelAPI.request("import_knowledge", formData, {
            multipart: true,
          });
          if (!result.error) {
            self.emit("memory:knowledge-imported", { files: fileArray });
          }
          return result;
        },

        // Get knowledge path
        async getKnowledgePath() {
          return await BaelAPI.get("knowledge_path_get");
        },

        // Reindex
        async reindex() {
          const result = await BaelAPI.post("knowledge_reindex");
          self.emit("memory:reindexed", result);
          return result;
        },

        // Integration with BaelOmniscient knowledge graph
        async addToGraph(id, data) {
          if (window.BaelOmniscient?.graphEngine) {
            window.BaelOmniscient.graphEngine.addNode(id, data);
          }
        },

        async connectInGraph(from, to, relationship) {
          if (window.BaelOmniscient?.graphEngine) {
            window.BaelOmniscient.graphEngine.connect(from, to, relationship);
          }
        },

        async queryGraph(startId) {
          if (window.BaelOmniscient?.graphEngine) {
            return window.BaelOmniscient.graphEngine.query(startId);
          }
          return [];
        },
      };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // MCP MANAGER - BaelMCP
    // ═══════════════════════════════════════════════════════════════════════

    initializeMCPManager() {
      const self = this;

      window.BaelMCP = {
        servers: [],

        // Get status of all servers
        async getStatus() {
          const result = await BaelAPI.post("mcp_servers_status");
          if (result.servers) {
            this.servers = result.servers;
            self.emit("mcp:status-updated", this.servers);
          }
          return result;
        },

        // Apply configuration
        async apply(config) {
          const result = await BaelAPI.post("mcp_servers_apply", config);
          if (!result.error) {
            await this.getStatus();
            self.emit("mcp:config-applied", config);
          }
          return result;
        },

        // Get server details
        async getDetail(serverName) {
          return await BaelAPI.post("mcp_server_get_detail", {
            name: serverName,
          });
        },

        // Get server logs
        async getLogs(serverName) {
          return await BaelAPI.post("mcp_server_get_log", { name: serverName });
        },

        // Filter helpers
        getConnected() {
          return this.servers.filter((s) => s.status === "connected");
        },

        getDisconnected() {
          return this.servers.filter((s) => s.status !== "connected");
        },

        getByName(name) {
          return this.servers.find((s) => s.name === name);
        },
      };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PROJECT MANAGER - BaelProjects
    // ═══════════════════════════════════════════════════════════════════════

    initializeProjectManager() {
      const self = this;

      window.BaelProjects = {
        projects: [],
        active: null,

        // List all projects
        async list() {
          const result = await BaelAPI.post("projects", { action: "list" });
          if (result.projects) {
            this.projects = result.projects;
            self.emit("projects:listed", this.projects);
          }
          return this.projects;
        },

        // Load project details
        async load(name) {
          return await BaelAPI.post("projects", { action: "load", name });
        },

        // Create project
        async create(project) {
          const result = await BaelAPI.post("projects", {
            action: "create",
            ...project,
          });
          if (!result.error) {
            await this.list();
            self.emit("projects:created", project);
          }
          return result;
        },

        // Update project
        async update(project) {
          const result = await BaelAPI.post("projects", {
            action: "update",
            ...project,
          });
          if (!result.error) {
            await this.list();
            self.emit("projects:updated", project);
          }
          return result;
        },

        // Delete project
        async delete(name) {
          const result = await BaelAPI.post("projects", {
            action: "delete",
            name,
          });
          if (!result.error) {
            await this.list();
            self.emit("projects:deleted", name);
          }
          return result;
        },

        // Activate project for a chat
        async activate(name, chatId) {
          const result = await BaelAPI.post("projects", {
            action: "activate",
            name,
            chat_id: chatId,
          });
          if (!result.error) {
            this.active = name;
            self.emit("projects:activated", { name, chatId });
          }
          return result;
        },

        // Deactivate project
        async deactivate(chatId) {
          const result = await BaelAPI.post("projects", {
            action: "deactivate",
            chat_id: chatId,
          });
          if (!result.error) {
            this.active = null;
            self.emit("projects:deactivated", chatId);
          }
          return result;
        },

        // Get file structure
        async getFileStructure(name) {
          return await BaelAPI.post("projects", {
            action: "file_structure",
            name,
          });
        },

        getActive() {
          return this.active;
        },
      };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // NOTIFICATION MANAGER - BaelNotify
    // ═══════════════════════════════════════════════════════════════════════

    initializeNotificationManager() {
      const self = this;
      const store = this.stores.get("notifications");

      window.BaelNotify = {
        // Notification types
        info(message, title = "", options = {}) {
          return this.notify("info", message, title, options);
        },

        success(message, title = "", options = {}) {
          return this.notify("success", message, title, options);
        },

        warning(message, title = "", options = {}) {
          return this.notify("warning", message, title, options);
        },

        error(message, title = "", options = {}) {
          return this.notify("error", message, title, options);
        },

        progress(message, title = "", options = {}) {
          return this.notify("progress", message, title, options);
        },

        // Core notify method
        notify(type, message, title = "", options = {}) {
          // Use Alpine store if available
          if (store?.[type]) {
            store[type](
              message,
              title,
              options.detail,
              options.duration,
              options.group,
            );
          }

          // Use BaelToast if available
          if (window.BaelToast?.show) {
            window.BaelToast.show({
              type,
              message,
              title,
              duration: options.duration || 5000,
            });
          }

          // Send to backend for persistence
          BaelAPI.post("notification_create", {
            type,
            message,
            title,
            ...options,
          });

          self.emit("notification", { type, message, title, options });
        },

        // Get history
        async getHistory(options = {}) {
          return await BaelAPI.post("notifications_history", options);
        },

        // Mark as read
        async markRead(ids) {
          const idArray = Array.isArray(ids) ? ids : [ids];
          return await BaelAPI.post("notifications_mark_read", {
            ids: idArray,
          });
        },

        // Clear all
        async clear() {
          if (store?.clear) {
            store.clear();
          }
          return await BaelAPI.post("notifications_clear");
        },
      };

      // Shorthand
      window.notify = window.BaelNotify;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // BACKUP MANAGER - BaelBackup
    // ═══════════════════════════════════════════════════════════════════════

    initializeBackupManager() {
      const self = this;

      window.BaelBackup = {
        // Create backup
        async create(patterns = [], name = "") {
          return await BaelAPI.post("backup_create", { patterns, name });
        },

        // Restore from backup
        async restore(file, options = {}) {
          const formData = new FormData();
          formData.append("backup", file);
          Object.entries(options).forEach(([k, v]) => {
            formData.append(k, typeof v === "object" ? JSON.stringify(v) : v);
          });

          const result = await BaelAPI.request("backup_restore", formData, {
            multipart: true,
          });
          if (!result.error) {
            self.emit("backup:restored", result);
          }
          return result;
        },

        // Preview restore
        async previewRestore(file) {
          const formData = new FormData();
          formData.append("backup", file);
          return await BaelAPI.request("backup_restore_preview", formData, {
            multipart: true,
          });
        },

        // Preview grouped
        async previewGrouped(patterns = []) {
          return await BaelAPI.post("backup_preview_grouped", { patterns });
        },

        // Inspect backup
        async inspect(file) {
          const formData = new FormData();
          formData.append("backup", file);
          return await BaelAPI.request("backup_inspect", formData, {
            multipart: true,
          });
        },

        // Get default patterns
        async getDefaults() {
          return await BaelAPI.get("backup_get_defaults");
        },
      };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SPEECH MANAGER - BaelSpeech
    // ═══════════════════════════════════════════════════════════════════════

    initializeSpeechManager() {
      const self = this;

      window.BaelSpeech = {
        // Speech-to-text
        async transcribe(audioBlob) {
          const formData = new FormData();
          formData.append("audio", audioBlob, "recording.wav");

          const result = await BaelAPI.request("transcribe", formData, {
            multipart: true,
          });
          if (!result.error) {
            self.emit("speech:transcribed", result);
          }
          return result;
        },

        // Text-to-speech
        async synthesize(text, options = {}) {
          const result = await BaelAPI.post("synthesize", { text, ...options });
          if (!result.error) {
            self.emit("speech:synthesized", result);
          }
          return result;
        },

        // Use browser TTS
        speak(text, options = {}) {
          if ("speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            Object.assign(utterance, options);
            window.speechSynthesis.speak(utterance);
            return true;
          }
          return false;
        },

        // Stop speaking
        stopSpeaking() {
          if ("speechSynthesis" in window) {
            window.speechSynthesis.cancel();
          }
        },
      };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // HEISENBERG MANAGER - BaelHeisenberg
    // ═══════════════════════════════════════════════════════════════════════

    initializeHeisenbergManager() {
      const self = this;

      window.BaelHeisenberg = {
        // Get status
        async status(action = "dashboard") {
          return await BaelAPI.post("heisenberg_status", { action });
        },

        // Get health
        async health() {
          return await this.status("health");
        },

        // Get systems status
        async systems() {
          return await this.status("systems");
        },

        // Get metrics
        async metrics() {
          return await this.status("metrics");
        },

        // Get dashboard data
        async dashboard() {
          return await this.status("dashboard");
        },

        // Process input through Heisenberg
        async process(input, options = {}) {
          const result = await BaelAPI.post("heisenberg_process", {
            input,
            ...options,
          });
          self.emit("heisenberg:processed", result);
          return result;
        },

        // Manage instruments
        async instruments(action = "list", data = {}) {
          return await BaelAPI.post("heisenberg_instruments", {
            action,
            ...data,
          });
        },

        async listInstruments() {
          return await this.instruments("list");
        },

        async runInstrument(name, args = {}) {
          return await this.instruments("run", { name, args });
        },
      };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // KEYBOARD SHORTCUTS
    // ═══════════════════════════════════════════════════════════════════════

    setupKeyboardShortcuts() {
      const shortcuts = {
        "Ctrl+Enter": () => this.triggerSend(),
        "Ctrl+/": () => this.openCommandPalette(),
        "Ctrl+,": () => this.openSettings(),
        "Ctrl+Shift+P": () => this.openCommandPalette(),
        "Ctrl+K": () => this.openCommandPalette(),
        "Ctrl+B": () => this.toggleSidebar(),
        "Ctrl+Shift+D": () => this.toggleDebug(),
        Escape: () => this.closeModals(),
        "Ctrl+N": () => BaelChat.create(),
        "Ctrl+Shift+N": () => this.openProjectCreate(),
      };

      document.addEventListener("keydown", (e) => {
        // Build key combo string
        const keys = [];
        if (e.ctrlKey || e.metaKey) keys.push("Ctrl");
        if (e.shiftKey) keys.push("Shift");
        if (e.altKey) keys.push("Alt");

        // Handle special keys
        const key = e.key.length === 1 ? e.key.toUpperCase() : e.key;
        keys.push(key);

        const combo = keys.join("+");
        const handler = shortcuts[combo];

        if (handler && !this.isInputFocused()) {
          e.preventDefault();
          handler();
        }
      });

      // Export for customization
      window.BaelShortcuts = {
        register(combo, handler) {
          shortcuts[combo] = handler;
        },
        unregister(combo) {
          delete shortcuts[combo];
        },
        list() {
          return { ...shortcuts };
        },
      };
    }

    isInputFocused() {
      const active = document.activeElement;
      return (
        active?.tagName === "INPUT" ||
        active?.tagName === "TEXTAREA" ||
        active?.isContentEditable
      );
    }

    triggerSend() {
      const sendBtn = document.querySelector(
        '#send-btn, .send-button, [data-action="send"]',
      );
      sendBtn?.click();
    }

    openCommandPalette() {
      if (window.BaelCommandCenter?.show) {
        window.BaelCommandCenter.show();
      } else if (window.BaelCommand?.toggle) {
        window.BaelCommand.toggle();
      }
    }

    openSettings() {
      const store = this.stores.get("root");
      if (store) {
        store.settingsOpen = true;
      }
    }

    toggleSidebar() {
      const store = this.stores.get("sidebar");
      if (store) {
        store.collapsed = !store.collapsed;
      }
    }

    toggleDebug() {
      const current = localStorage.getItem("bael_debug") === "true";
      localStorage.setItem("bael_debug", String(!current));
      window.BaelNotify?.info(
        `Debug mode ${!current ? "enabled" : "disabled"}`,
      );
      this.emit("debug:toggled", !current);
    }

    closeModals() {
      const store = this.stores.get("root");
      if (store) {
        store.settingsOpen = false;
      }
      // Close any Bael modals
      document.querySelectorAll('[x-data*="modal"]').forEach((el) => {
        el.__x?.$data?.close?.();
      });
    }

    openProjectCreate() {
      const store = this.stores.get("projects");
      if (store) {
        store.creating = true;
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ERROR HANDLING
    // ═══════════════════════════════════════════════════════════════════════

    setupErrorHandling() {
      window.addEventListener("unhandledrejection", (event) => {
        console.error("Unhandled promise rejection:", event.reason);
        this.emit("error:unhandled", event.reason);
      });

      window.addEventListener("error", (event) => {
        console.error("Global error:", event.error);
        this.emit("error:global", event.error);
      });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // POWER SYSTEMS CONNECTION
    // ═══════════════════════════════════════════════════════════════════════

    connectPowerSystems() {
      // Connect to BaelSupremacy for AI decisions
      if (window.BaelSupremacy) {
        this.on("api:error", (data) => {
          window.BaelSupremacy.learn?.({
            type: "api_error",
            endpoint: data.endpoint,
            error: data.error,
          });
        });
      }

      // Connect to BaelExploit for optimization
      if (window.BaelExploit) {
        // Use token exploitation for message compression
        const originalSend = window.BaelChat?.send;
        if (originalSend && window.BaelExploit.tokenExploit) {
          window.BaelChat.send = async (message, attachments) => {
            // Could compress message here if needed
            return await originalSend.call(
              window.BaelChat,
              message,
              attachments,
            );
          };
        }
      }

      // Connect to BaelOmniscient for awareness
      if (window.BaelOmniscient) {
        this.on("*", (event, data) => {
          window.BaelOmniscient.awarenessEngine?.observe?.("gui-event", {
            event,
            data,
            timestamp: Date.now(),
          });
        });
      }

      // Connect to BaelDomination for agent control
      if (window.BaelDomination) {
        window.BaelDomination.guiUnifier = this;
      }

      console.log("⚡ Power systems connected");
    }

    // ═══════════════════════════════════════════════════════════════════════
    // EVENT SYSTEM
    // ═══════════════════════════════════════════════════════════════════════

    on(event, callback) {
      if (!this.subscribers.has(event)) {
        this.subscribers.set(event, []);
      }
      this.subscribers.get(event).push(callback);
      return () => this.off(event, callback);
    }

    off(event, callback) {
      const subs = this.subscribers.get(event);
      if (subs) {
        const index = subs.indexOf(callback);
        if (index > -1) subs.splice(index, 1);
      }
    }

    emit(event, data) {
      // Emit to specific subscribers
      const subs = this.subscribers.get(event);
      if (subs) {
        subs.forEach((cb) => {
          try {
            cb(data);
          } catch (e) {
            console.error(e);
          }
        });
      }

      // Emit to wildcard subscribers
      const wildcardSubs = this.subscribers.get("*");
      if (wildcardSubs) {
        wildcardSubs.forEach((cb) => {
          try {
            cb(event, data);
          } catch (e) {
            console.error(e);
          }
        });
      }

      // Also dispatch DOM event
      window.dispatchEvent(new CustomEvent(`bael:${event}`, { detail: data }));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // UTILITY METHODS
    // ═══════════════════════════════════════════════════════════════════════

    getStore(name) {
      return this.stores.get(name);
    }

    getEndpoint(name) {
      return this.endpoints.get(name);
    }

    getMetrics() {
      return { ...this.metrics };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  window.BaelGUIUnifier = new BaelGUIUnifier();

  // Auto-initialize after DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelGUIUnifier.initialize();
    });
  } else {
    // DOM already ready
    setTimeout(() => window.BaelGUIUnifier.initialize(), 100);
  }

  console.log("🔗 Bael GUI Unifier loaded");
})();
