/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █   ██████╗ ██████╗ ██╗██████╗  ██████╗ ███████╗                           █
 * █   ██╔══██╗██╔══██╗██║██╔══██╗██╔════╝ ██╔════╝                           █
 * █   ██████╔╝██████╔╝██║██║  ██║██║  ███╗█████╗                             █
 * █   ██╔══██╗██╔══██╗██║██║  ██║██║   ██║██╔══╝                             █
 * █   ██████╔╝██║  ██║██║██████╔╝╚██████╔╝███████╗                           █
 * █   ╚═════╝ ╚═╝  ╚═╝╚═╝╚═════╝  ╚═════╝ ╚══════╝                           █
 * █                                                                          █
 * █   BAEL ALPINE BRIDGE - Bidirectional Alpine.js ↔ Bael Integration       █
 * █   Seamlessly connects 10+ Alpine stores with 258 Bael modules            █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  // ═══════════════════════════════════════════════════════════════════════════
  // BAEL ALPINE BRIDGE
  // ═══════════════════════════════════════════════════════════════════════════

  class BaelAlpineBridge {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.storeProxies = new Map();
      this.watchedPaths = new Map();
      this.syncQueue = [];
      this.syncDebounce = null;

      // Store mappings: Alpine store name → Bael module
      this.storeMappings = {
        sidebar: ["BaelSidebar", "BaelNavigation"],
        chats: ["BaelChat", "BaelConversation"],
        tasks: ["BaelScheduler", "BaelTasks"],
        notifications: ["BaelNotify", "BaelToast", "BaelNotificationCenter"],
        input: ["BaelInput", "BaelChat"],
        projects: ["BaelProjects", "BaelWorkspace"],
        attachments: ["BaelAttachments", "BaelFiles"],
        speech: ["BaelSpeech", "BaelVoice"],
        preferences: ["BaelPreferences", "BaelSettings"],
        chatTop: ["BaelStatus", "BaelConnection"],
        root: ["BaelRoot", "BaelModals"],
      };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════════════

    async initialize() {
      console.log("🌉 Bael Alpine Bridge initializing...");

      try {
        // Wait for Alpine
        await this.waitForAlpine();

        // Setup store proxies
        this.setupStoreProxies();

        // Setup Bael event listeners
        this.setupBaelListeners();

        // Setup Alpine effects
        this.setupAlpineEffects();

        // Initial sync
        this.performInitialSync();

        this.initialized = true;
        console.log("✅ BAEL ALPINE BRIDGE ACTIVE");

        return this;
      } catch (error) {
        console.error("❌ Bael Alpine Bridge initialization failed:", error);
        throw error;
      }
    }

    async waitForAlpine(timeout = 5000) {
      const start = Date.now();
      while (!window.Alpine?.store && Date.now() - start < timeout) {
        await new Promise((r) => setTimeout(r, 50));
      }
      if (!window.Alpine?.store) {
        throw new Error("Alpine.js not found");
      }
      return true;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // STORE PROXIES - Intercept Alpine store mutations
    // ═══════════════════════════════════════════════════════════════════════

    setupStoreProxies() {
      const storeNames = Object.keys(this.storeMappings);

      storeNames.forEach((storeName) => {
        try {
          const store = Alpine.store(storeName);
          if (store) {
            this.createStoreProxy(storeName, store);
          }
        } catch (e) {
          // Store may not exist
        }
      });

      console.log(`🏪 Proxied ${this.storeProxies.size} Alpine stores`);
    }

    createStoreProxy(storeName, store) {
      const self = this;
      const originalValues = {};

      // Capture original values
      Object.keys(store).forEach((key) => {
        if (typeof store[key] !== "function") {
          originalValues[key] = JSON.parse(JSON.stringify(store[key] || null));
        }
      });

      // Create property watchers using Object.defineProperty
      Object.keys(store).forEach((key) => {
        if (typeof store[key] === "function") return;

        let value = store[key];
        const descriptor = Object.getOwnPropertyDescriptor(store, key);

        // Skip if already has getter/setter
        if (descriptor?.get || descriptor?.set) return;

        try {
          Object.defineProperty(store, `_${key}`, {
            value: value,
            writable: true,
            enumerable: false,
          });

          Object.defineProperty(store, key, {
            get() {
              return this[`_${key}`];
            },
            set(newValue) {
              const oldValue = this[`_${key}`];
              this[`_${key}`] = newValue;

              // Emit change event
              self.onStoreChange(storeName, key, newValue, oldValue);
            },
            enumerable: true,
            configurable: true,
          });
        } catch (e) {
          // Some properties can't be redefined
        }
      });

      this.storeProxies.set(storeName, {
        store,
        originalValues,
      });
    }

    onStoreChange(storeName, key, newValue, oldValue) {
      // Avoid infinite loops
      if (JSON.stringify(newValue) === JSON.stringify(oldValue)) return;

      // Queue sync
      this.queueSync({
        type: "alpine-to-bael",
        store: storeName,
        key,
        value: newValue,
        oldValue,
      });

      // Emit event
      this.emit("alpine:change", {
        store: storeName,
        key,
        value: newValue,
        oldValue,
      });
    }

    // ═══════════════════════════════════════════════════════════════════════
    // BAEL EVENT LISTENERS - Sync Bael → Alpine
    // ═══════════════════════════════════════════════════════════════════════

    setupBaelListeners() {
      // Listen to BaelEventBus if available
      if (window.BaelEventBus) {
        window.BaelEventBus.on("*", (event, data) => {
          this.handleBaelEvent(event, data);
        });
      }

      // Listen to DOM events from Bael modules
      window.addEventListener("bael:settings", (e) => {
        this.syncSettingsToAlpine(e.detail);
      });

      window.addEventListener("bael:notification", (e) => {
        this.syncNotificationToAlpine(e.detail);
      });

      window.addEventListener("bael:chat:message", (e) => {
        this.syncChatToAlpine(e.detail);
      });

      window.addEventListener("bael:scheduler:tasks-updated", (e) => {
        this.syncTasksToAlpine(e.detail);
      });

      window.addEventListener("bael:projects:activated", (e) => {
        this.syncProjectToAlpine(e.detail);
      });
    }

    handleBaelEvent(event, data) {
      // Map Bael events to Alpine store updates
      const eventMappings = {
        "settings:updated": () => this.syncSettingsToAlpine(data),
        "chat:created": () => this.syncChatsToAlpine(),
        "chat:removed": () => this.syncChatsToAlpine(),
        "scheduler:tasks-updated": () => this.syncTasksToAlpine(data),
        notification: () => this.syncNotificationToAlpine(data),
        "files:listed": () => this.syncFilesToAlpine(data),
        "projects:listed": () => this.syncProjectsToAlpine(data),
        "mcp:status-updated": () => this.syncMCPToAlpine(data),
      };

      const handler = eventMappings[event];
      if (handler) {
        handler();
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // ALPINE EFFECTS - Watch for reactive changes
    // ═══════════════════════════════════════════════════════════════════════

    setupAlpineEffects() {
      // Watch key store properties with Alpine effects
      if (window.Alpine?.effect) {
        // Watch chat selection
        Alpine.effect(() => {
          const chats = Alpine.store("chats");
          if (chats?.selectedId) {
            this.syncToBael("chats", "selectedId", chats.selectedId);
          }
        });

        // Watch preferences
        Alpine.effect(() => {
          const prefs = Alpine.store("preferences");
          if (prefs) {
            this.syncToBael("preferences", "all", {
              autoScroll: prefs.autoScroll,
              soundEnabled: prefs.soundEnabled,
            });
          }
        });

        // Watch sidebar state
        Alpine.effect(() => {
          const sidebar = Alpine.store("sidebar");
          if (sidebar) {
            this.syncToBael("sidebar", "collapsed", sidebar.collapsed);
          }
        });
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SYNC METHODS - Alpine ↔ Bael
    // ═══════════════════════════════════════════════════════════════════════

    performInitialSync() {
      // Sync all Alpine stores to Bael on init
      this.storeProxies.forEach((proxy, storeName) => {
        const store = proxy.store;
        Object.keys(store).forEach((key) => {
          if (typeof store[key] !== "function") {
            this.syncToBael(storeName, key, store[key]);
          }
        });
      });
    }

    queueSync(syncItem) {
      this.syncQueue.push(syncItem);

      // Debounce syncs
      if (this.syncDebounce) clearTimeout(this.syncDebounce);
      this.syncDebounce = setTimeout(() => this.processSyncQueue(), 16);
    }

    processSyncQueue() {
      const queue = [...this.syncQueue];
      this.syncQueue = [];

      queue.forEach((item) => {
        if (item.type === "alpine-to-bael") {
          this.syncToBael(item.store, item.key, item.value);
        } else if (item.type === "bael-to-alpine") {
          this.syncToAlpine(item.store, item.key, item.value);
        }
      });
    }

    syncToBael(storeName, key, value) {
      const modules = this.storeMappings[storeName] || [];

      modules.forEach((moduleName) => {
        const module = window[moduleName];
        if (module) {
          // Try direct property set
          if (module[key] !== undefined) {
            module[key] = value;
          }

          // Try setState method
          if (module.setState) {
            module.setState({ [key]: value });
          }

          // Try set method
          if (module.set) {
            module.set(key, value);
          }
        }
      });

      // Also sync to BaelState if available
      if (window.BaelState?.set) {
        window.BaelState.set(`alpine.${storeName}.${key}`, value);
      }
    }

    syncToAlpine(storeName, key, value) {
      const store = Alpine.store(storeName);
      if (store && store[key] !== undefined) {
        // Temporarily disable our watcher to avoid loops
        const proxy = this.storeProxies.get(storeName);
        if (proxy) {
          store[`_${key}`] = value;
        } else {
          store[key] = value;
        }
      }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SPECIFIC SYNC HANDLERS
    // ═══════════════════════════════════════════════════════════════════════

    syncSettingsToAlpine(data) {
      // Settings are typically managed separately
      // But we can sync specific UI-related settings
      if (data?.theme) {
        document.documentElement.setAttribute("data-theme", data.theme);
      }
    }

    syncNotificationToAlpine(data) {
      const store = Alpine.store("notifications");
      if (store?.addOrUpdateNotification) {
        store.addOrUpdateNotification({
          id: data.id || Date.now(),
          type: data.type || "info",
          message: data.message,
          title: data.title,
          timestamp: Date.now(),
        });
      }
    }

    syncChatToAlpine(data) {
      const store = Alpine.store("chats");
      if (store && data?.chat) {
        // Update chat list if needed
        const existing = store.chats?.find((c) => c.id === data.chat.id);
        if (!existing && data.chat) {
          store.chats = [...(store.chats || []), data.chat];
        }
      }
    }

    async syncChatsToAlpine() {
      const store = Alpine.store("chats");
      if (store && window.BaelChat?.load) {
        const result = await window.BaelChat.load();
        if (result?.chats) {
          store.chats = result.chats;
        }
      }
    }

    syncTasksToAlpine(tasks) {
      const store = Alpine.store("tasks");
      if (store) {
        store.tasks = tasks;
      }
    }

    syncFilesToAlpine(data) {
      // File data is typically modal-based, not store-based
      this.emit("files:synced", data);
    }

    syncProjectsToAlpine(projects) {
      const store = Alpine.store("projects");
      if (store) {
        store.list = projects;
      }
    }

    syncProjectToAlpine(data) {
      const store = Alpine.store("projects");
      if (store) {
        store.activeProject = data.name;
      }
    }

    syncMCPToAlpine(servers) {
      // MCP data is typically in settings modal
      this.emit("mcp:synced", servers);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // CONVENIENCE METHODS
    // ═══════════════════════════════════════════════════════════════════════

    // Get Alpine store
    getStore(name) {
      return Alpine.store(name);
    }

    // Set Alpine store value
    setStoreValue(storeName, key, value) {
      const store = Alpine.store(storeName);
      if (store) {
        store[key] = value;
      }
    }

    // Watch a specific path
    watch(storeName, key, callback) {
      const path = `${storeName}.${key}`;
      if (!this.watchedPaths.has(path)) {
        this.watchedPaths.set(path, []);
      }
      this.watchedPaths.get(path).push(callback);

      return () => {
        const callbacks = this.watchedPaths.get(path);
        if (callbacks) {
          const index = callbacks.indexOf(callback);
          if (index > -1) callbacks.splice(index, 1);
        }
      };
    }

    // ═══════════════════════════════════════════════════════════════════════
    // EVENT SYSTEM
    // ═══════════════════════════════════════════════════════════════════════

    emit(event, data) {
      window.dispatchEvent(
        new CustomEvent(`bael:bridge:${event}`, { detail: data }),
      );

      // Notify watched paths
      if (event === "alpine:change") {
        const path = `${data.store}.${data.key}`;
        const callbacks = this.watchedPaths.get(path);
        if (callbacks) {
          callbacks.forEach((cb) => {
            try {
              cb(data.value, data.oldValue);
            } catch (e) {
              console.error(e);
            }
          });
        }
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ALPINE DIRECTIVE: x-bael
  // ═══════════════════════════════════════════════════════════════════════════

  function registerBaelDirective() {
    if (!window.Alpine?.directive) return;

    // x-bael directive for binding Bael modules to elements
    Alpine.directive(
      "bael",
      (el, { value, modifiers, expression }, { evaluate, effect }) => {
        const moduleName = value;
        const module = window[moduleName];

        if (!module) {
          console.warn(`Bael module not found: ${moduleName}`);
          return;
        }

        // Bind module methods to element
        if (modifiers.includes("bind")) {
          el._baelModule = module;
        }

        // Call module method on click
        if (modifiers.includes("click")) {
          const method = expression;
          el.addEventListener("click", () => {
            if (module[method]) {
              module[method]();
            }
          });
        }

        // Sync with module property
        if (modifiers.includes("sync")) {
          const prop = expression;
          effect(() => {
            if (module[prop] !== undefined) {
              el.textContent = module[prop];
            }
          });
        }
      },
    );

    console.log("📝 x-bael directive registered");
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ALPINE MAGIC: $bael
  // ═══════════════════════════════════════════════════════════════════════════

  function registerBaelMagic() {
    if (!window.Alpine?.magic) return;

    // $bael magic property for accessing Bael modules in Alpine templates
    Alpine.magic("bael", () => {
      return {
        // Access any Bael module
        get(moduleName) {
          return window[moduleName];
        },

        // Quick access to common modules
        get api() {
          return window.BaelAPI;
        },
        get chat() {
          return window.BaelChat;
        },
        get settings() {
          return window.BaelSettings;
        },
        get scheduler() {
          return window.BaelScheduler;
        },
        get files() {
          return window.BaelFiles;
        },
        get memory() {
          return window.BaelMemory;
        },
        get mcp() {
          return window.BaelMCP;
        },
        get projects() {
          return window.BaelProjects;
        },
        get notify() {
          return window.BaelNotify;
        },
        get backup() {
          return window.BaelBackup;
        },
        get speech() {
          return window.BaelSpeech;
        },
        get heisenberg() {
          return window.BaelHeisenberg;
        },
        get supremacy() {
          return window.BaelSupremacy;
        },
        get domination() {
          return window.BaelDomination;
        },
        get omniscient() {
          return window.BaelOmniscient;
        },
        get exploit() {
          return window.BaelExploit;
        },
      };
    });

    console.log("✨ $bael magic registered");
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  window.BaelAlpineBridge = new BaelAlpineBridge();

  // Register directives and magic after Alpine loads
  document.addEventListener("alpine:init", () => {
    registerBaelDirective();
    registerBaelMagic();
  });

  // Also try registering if Alpine is already loaded
  if (window.Alpine) {
    registerBaelDirective();
    registerBaelMagic();
  }

  // Auto-initialize after DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(() => window.BaelAlpineBridge.initialize(), 200);
    });
  } else {
    setTimeout(() => window.BaelAlpineBridge.initialize(), 200);
  }

  console.log("🌉 Bael Alpine Bridge loaded");
})();
