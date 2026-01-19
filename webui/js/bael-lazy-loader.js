/**
 * BAEL Lazy Loader - Intelligent Resource Loading
 * Phase 7: Testing, Documentation & Performance
 *
 * Smart lazy loading system with:
 * - Intersection Observer for visibility-based loading
 * - Script/CSS/Image lazy loading
 * - Component lazy initialization
 * - Priority queue for loading order
 * - Prefetching and preloading
 * - Network-aware loading
 * - Load status tracking
 */

(function () {
  "use strict";

  class BaelLazyLoader {
    constructor() {
      this.loadedResources = new Set();
      this.pendingResources = new Map();
      this.loadQueue = [];
      this.loadingCount = 0;
      this.maxConcurrent = 6;
      this.observers = new Map();
      this.config = {
        rootMargin: "100px",
        threshold: 0.1,
        enablePrefetch: true,
        respectDataSaver: true,
        priorityLevels: ["critical", "high", "normal", "low", "idle"],
      };
      this.init();
    }

    init() {
      this.loadConfig();
      this.setupIntersectionObserver();
      this.setupIdleCallback();
      this.checkNetworkConditions();
      this.createUI();
      this.addStyles();
      this.bindEvents();
      console.log("⚡ Bael Lazy Loader initialized");
    }

    loadConfig() {
      const saved = localStorage.getItem("bael_lazyloader_config");
      if (saved) {
        try {
          Object.assign(this.config, JSON.parse(saved));
        } catch (e) {
          console.warn("Failed to load lazy loader config");
        }
      }
    }

    saveConfig() {
      localStorage.setItem(
        "bael_lazyloader_config",
        JSON.stringify(this.config),
      );
    }

    // Intersection Observer Setup
    setupIntersectionObserver() {
      this.mainObserver = new IntersectionObserver(
        (entries) => this.handleIntersection(entries),
        {
          rootMargin: this.config.rootMargin,
          threshold: this.config.threshold,
        },
      );
    }

    handleIntersection(entries) {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target;
          const loadType = element.dataset.lazyType || "auto";

          this.loadElement(element, loadType);
          this.mainObserver.unobserve(element);
        }
      });
    }

    // Idle Callback for Low Priority
    setupIdleCallback() {
      if ("requestIdleCallback" in window) {
        this.processIdleQueue();
      }
    }

    processIdleQueue() {
      requestIdleCallback((deadline) => {
        while (deadline.timeRemaining() > 0 && this.loadQueue.length > 0) {
          const task = this.loadQueue.shift();
          if (task && task.priority === "idle") {
            task.execute();
          } else if (task) {
            this.loadQueue.unshift(task);
            break;
          }
        }

        if (this.loadQueue.length > 0) {
          this.processIdleQueue();
        }
      });
    }

    // Network Conditions
    checkNetworkConditions() {
      if ("connection" in navigator) {
        const connection = navigator.connection;

        this.networkInfo = {
          effectiveType: connection.effectiveType,
          saveData: connection.saveData,
          downlink: connection.downlink,
          rtt: connection.rtt,
        };

        connection.addEventListener("change", () => {
          this.networkInfo = {
            effectiveType: connection.effectiveType,
            saveData: connection.saveData,
            downlink: connection.downlink,
            rtt: connection.rtt,
          };
          this.adjustLoadingStrategy();
        });
      } else {
        this.networkInfo = { effectiveType: "4g", saveData: false };
      }
    }

    adjustLoadingStrategy() {
      // Slow connection - be more conservative
      if (
        this.networkInfo.effectiveType === "2g" ||
        this.networkInfo.effectiveType === "slow-2g"
      ) {
        this.maxConcurrent = 2;
        this.config.enablePrefetch = false;
      } else if (this.networkInfo.effectiveType === "3g") {
        this.maxConcurrent = 4;
        this.config.enablePrefetch = false;
      } else {
        this.maxConcurrent = 6;
        this.config.enablePrefetch = true;
      }

      // Data saver mode
      if (this.networkInfo.saveData && this.config.respectDataSaver) {
        this.config.enablePrefetch = false;
        this.maxConcurrent = 2;
      }
    }

    // Observe Elements
    observe(element) {
      if (!element || this.loadedResources.has(element)) return;
      this.mainObserver.observe(element);
    }

    observeAll(selector = "[data-lazy]") {
      document.querySelectorAll(selector).forEach((el) => this.observe(el));
    }

    // Load Element Based on Type
    loadElement(element, type) {
      switch (type) {
        case "image":
          this.loadImage(element);
          break;
        case "iframe":
          this.loadIframe(element);
          break;
        case "video":
          this.loadVideo(element);
          break;
        case "component":
          this.loadComponent(element);
          break;
        case "auto":
        default:
          this.autoLoad(element);
      }
    }

    autoLoad(element) {
      const tagName = element.tagName.toLowerCase();

      if (tagName === "img") {
        this.loadImage(element);
      } else if (tagName === "iframe") {
        this.loadIframe(element);
      } else if (tagName === "video") {
        this.loadVideo(element);
      } else if (element.dataset.src || element.dataset.component) {
        this.loadComponent(element);
      }
    }

    // Image Loading
    loadImage(element) {
      const src = element.dataset.src;
      const srcset = element.dataset.srcset;

      if (!src) return;

      const img = new Image();

      img.onload = () => {
        element.src = src;
        if (srcset) element.srcset = srcset;
        element.classList.add("lazy-loaded");
        element.classList.remove("lazy-loading");
        this.loadedResources.add(element);
        this.dispatchLoadEvent(element, "image");
      };

      img.onerror = () => {
        element.classList.add("lazy-error");
        element.classList.remove("lazy-loading");
        this.dispatchErrorEvent(element, "image");
      };

      element.classList.add("lazy-loading");
      img.src = src;
    }

    // Iframe Loading
    loadIframe(element) {
      const src = element.dataset.src;
      if (!src) return;

      element.classList.add("lazy-loading");
      element.src = src;

      element.onload = () => {
        element.classList.add("lazy-loaded");
        element.classList.remove("lazy-loading");
        this.loadedResources.add(element);
        this.dispatchLoadEvent(element, "iframe");
      };

      element.onerror = () => {
        element.classList.add("lazy-error");
        element.classList.remove("lazy-loading");
        this.dispatchErrorEvent(element, "iframe");
      };
    }

    // Video Loading
    loadVideo(element) {
      const src = element.dataset.src;
      const poster = element.dataset.poster;

      if (poster) element.poster = poster;

      if (src) {
        element.classList.add("lazy-loading");
        element.src = src;

        element.onloadeddata = () => {
          element.classList.add("lazy-loaded");
          element.classList.remove("lazy-loading");
          this.loadedResources.add(element);
          this.dispatchLoadEvent(element, "video");
        };
      }
    }

    // Component Loading
    loadComponent(element) {
      const componentName = element.dataset.component;
      const componentSrc = element.dataset.src;

      if (componentSrc) {
        this.loadScript(componentSrc).then(() => {
          this.initComponent(element, componentName);
        });
      } else if (componentName) {
        this.initComponent(element, componentName);
      }
    }

    initComponent(element, componentName) {
      if (componentName && window[componentName]) {
        try {
          if (typeof window[componentName] === "function") {
            new window[componentName](element);
          } else if (window[componentName].init) {
            window[componentName].init(element);
          }
          element.classList.add("lazy-loaded");
          this.dispatchLoadEvent(element, "component");
        } catch (e) {
          console.error(`Failed to init component ${componentName}:`, e);
          this.dispatchErrorEvent(element, "component");
        }
      }
    }

    // Script Loading
    loadScript(src, options = {}) {
      if (this.loadedResources.has(src)) {
        return Promise.resolve();
      }

      if (this.pendingResources.has(src)) {
        return this.pendingResources.get(src);
      }

      const promise = new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = src;
        script.async = options.async !== false;
        script.defer = options.defer || false;

        if (options.type) script.type = options.type;
        if (options.crossOrigin) script.crossOrigin = options.crossOrigin;

        script.onload = () => {
          this.loadedResources.add(src);
          this.pendingResources.delete(src);
          this.updateStats();
          resolve();
        };

        script.onerror = () => {
          this.pendingResources.delete(src);
          reject(new Error(`Failed to load script: ${src}`));
        };

        document.head.appendChild(script);
      });

      this.pendingResources.set(src, promise);
      return promise;
    }

    // CSS Loading
    loadCSS(href, options = {}) {
      if (this.loadedResources.has(href)) {
        return Promise.resolve();
      }

      if (this.pendingResources.has(href)) {
        return this.pendingResources.get(href);
      }

      const promise = new Promise((resolve, reject) => {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;

        if (options.media) link.media = options.media;

        link.onload = () => {
          this.loadedResources.add(href);
          this.pendingResources.delete(href);
          this.updateStats();
          resolve();
        };

        link.onerror = () => {
          this.pendingResources.delete(href);
          reject(new Error(`Failed to load CSS: ${href}`));
        };

        document.head.appendChild(link);
      });

      this.pendingResources.set(href, promise);
      return promise;
    }

    // Prefetch/Preload
    prefetch(url, as = "fetch") {
      if (!this.config.enablePrefetch || this.loadedResources.has(url)) return;

      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = url;
      link.as = as;
      document.head.appendChild(link);
    }

    preload(url, as) {
      if (this.loadedResources.has(url)) return;

      const link = document.createElement("link");
      link.rel = "preload";
      link.href = url;
      link.as = as;

      if (as === "font") {
        link.crossOrigin = "anonymous";
      }

      document.head.appendChild(link);
    }

    preconnect(url) {
      const link = document.createElement("link");
      link.rel = "preconnect";
      link.href = url;
      document.head.appendChild(link);
    }

    // Queue Management
    queueLoad(task, priority = "normal") {
      const priorityIndex = this.config.priorityLevels.indexOf(priority);

      this.loadQueue.push({
        ...task,
        priority,
        priorityIndex,
        timestamp: Date.now(),
      });

      // Sort by priority
      this.loadQueue.sort((a, b) => a.priorityIndex - b.priorityIndex);

      this.processQueue();
    }

    processQueue() {
      while (
        this.loadingCount < this.maxConcurrent &&
        this.loadQueue.length > 0
      ) {
        const task = this.loadQueue.shift();

        if (task && task.execute) {
          this.loadingCount++;

          Promise.resolve(task.execute()).finally(() => {
            this.loadingCount--;
            this.processQueue();
          });
        }
      }
    }

    // Events
    dispatchLoadEvent(element, type) {
      element.dispatchEvent(
        new CustomEvent("lazyloaded", {
          detail: { type, element },
          bubbles: true,
        }),
      );
    }

    dispatchErrorEvent(element, type) {
      element.dispatchEvent(
        new CustomEvent("lazyerror", {
          detail: { type, element },
          bubbles: true,
        }),
      );
    }

    // UI
    createUI() {
      this.indicator = document.createElement("div");
      this.indicator.id = "bael-lazy-indicator";
      this.indicator.innerHTML = `
                <span class="icon">⚡</span>
                <span class="count">0</span>
            `;
      this.indicator.style.display = "none";
      document.body.appendChild(this.indicator);

      this.panel = document.createElement("div");
      this.panel.id = "bael-lazy-panel";
      this.panel.innerHTML = `
                <div class="lazy-panel-header">
                    <h3>⚡ Lazy Loader</h3>
                    <button class="close-btn">✕</button>
                </div>

                <div class="lazy-panel-stats">
                    <div class="stat">
                        <span class="value" id="lazy-stat-loaded">0</span>
                        <span class="label">Loaded</span>
                    </div>
                    <div class="stat">
                        <span class="value" id="lazy-stat-pending">0</span>
                        <span class="label">Pending</span>
                    </div>
                    <div class="stat">
                        <span class="value" id="lazy-stat-queue">0</span>
                        <span class="label">Queued</span>
                    </div>
                    <div class="stat">
                        <span class="value" id="lazy-stat-network">${this.networkInfo?.effectiveType || "4g"}</span>
                        <span class="label">Network</span>
                    </div>
                </div>

                <div class="lazy-panel-config">
                    <h4>Settings</h4>
                    <label>
                        <input type="checkbox" id="lazy-enable-prefetch" ${this.config.enablePrefetch ? "checked" : ""}>
                        Enable Prefetch
                    </label>
                    <label>
                        <input type="checkbox" id="lazy-respect-datasaver" ${this.config.respectDataSaver ? "checked" : ""}>
                        Respect Data Saver
                    </label>
                    <label>
                        Max Concurrent:
                        <input type="number" id="lazy-max-concurrent" value="${this.maxConcurrent}" min="1" max="10">
                    </label>
                </div>

                <div class="lazy-panel-resources">
                    <h4>Loaded Resources</h4>
                    <div class="resource-list" id="lazy-resource-list"></div>
                </div>
            `;
      document.body.appendChild(this.panel);
    }

    updateStats() {
      document.getElementById("lazy-stat-loaded").textContent =
        this.loadedResources.size;
      document.getElementById("lazy-stat-pending").textContent =
        this.pendingResources.size;
      document.getElementById("lazy-stat-queue").textContent =
        this.loadQueue.length;

      // Update indicator
      const pending = this.pendingResources.size + this.loadQueue.length;
      this.indicator.querySelector(".count").textContent = pending;
      this.indicator.style.display = pending > 0 ? "flex" : "none";

      // Update resource list
      const list = document.getElementById("lazy-resource-list");
      if (list) {
        const resources = Array.from(this.loadedResources).slice(-20).reverse();
        list.innerHTML = resources
          .map(
            (r) => `
                    <div class="resource-item">
                        <span class="resource-icon">${this.getResourceIcon(r)}</span>
                        <span class="resource-name">${this.truncateResource(r)}</span>
                    </div>
                `,
          )
          .join("");
      }
    }

    getResourceIcon(resource) {
      if (typeof resource !== "string") return "📦";
      if (resource.endsWith(".js")) return "📜";
      if (resource.endsWith(".css")) return "🎨";
      if (/\.(jpg|jpeg|png|gif|svg|webp)$/i.test(resource)) return "🖼️";
      return "📄";
    }

    truncateResource(resource) {
      if (typeof resource !== "string") return "Element";
      const name = resource.split("/").pop();
      return name.length > 30 ? name.substring(0, 30) + "..." : name;
    }

    addStyles() {
      const style = document.createElement("style");
      style.textContent = `
                /* Lazy Loading States */
                [data-lazy] {
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                [data-lazy].lazy-loading {
                    opacity: 0.3;
                }

                [data-lazy].lazy-loaded {
                    opacity: 1;
                }

                [data-lazy].lazy-error {
                    opacity: 0.5;
                    filter: grayscale(100%);
                }

                /* Lazy Indicator */
                #bael-lazy-indicator {
                    position: fixed;
                    bottom: 20px;
                    left: 200px;
                    background: linear-gradient(135deg, #ff9800, #ff5722);
                    color: white;
                    padding: 8px 12px;
                    border-radius: 20px;
                    font-size: 12px;
                    z-index: 99997;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    cursor: pointer;
                    box-shadow: 0 2px 8px rgba(255, 152, 0, 0.4);
                    animation: pulse 1.5s infinite;
                }

                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }

                /* Lazy Panel */
                #bael-lazy-panel {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0.9);
                    width: 450px;
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

                #bael-lazy-panel.visible {
                    display: flex;
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1);
                }

                .lazy-panel-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 20px;
                    background: var(--bael-bg-dark, #151515);
                    border-bottom: 1px solid var(--bael-border, #333);
                }

                .lazy-panel-header h3 {
                    margin: 0;
                    font-size: 16px;
                    color: var(--bael-text, #fff);
                }

                .lazy-panel-header .close-btn {
                    background: transparent;
                    border: none;
                    color: var(--bael-text-dim, #888);
                    font-size: 18px;
                    cursor: pointer;
                }

                .lazy-panel-stats {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 12px;
                    padding: 16px;
                    background: rgba(0,0,0,0.2);
                    border-bottom: 1px solid var(--bael-border, #333);
                }

                .lazy-panel-stats .stat {
                    text-align: center;
                }

                .lazy-panel-stats .value {
                    display: block;
                    font-size: 20px;
                    font-weight: bold;
                    color: #ff9800;
                }

                .lazy-panel-stats .label {
                    font-size: 10px;
                    color: var(--bael-text-dim, #888);
                    text-transform: uppercase;
                }

                .lazy-panel-config {
                    padding: 16px;
                    border-bottom: 1px solid var(--bael-border, #333);
                }

                .lazy-panel-config h4 {
                    margin: 0 0 12px;
                    font-size: 12px;
                    color: var(--bael-text-dim, #888);
                    text-transform: uppercase;
                }

                .lazy-panel-config label {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 13px;
                    color: var(--bael-text, #fff);
                    margin-bottom: 8px;
                }

                .lazy-panel-config input[type="number"] {
                    width: 50px;
                    background: var(--bael-bg-dark, #151515);
                    border: 1px solid var(--bael-border, #333);
                    color: var(--bael-text, #fff);
                    padding: 4px 8px;
                    border-radius: 4px;
                }

                .lazy-panel-resources {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px;
                }

                .lazy-panel-resources h4 {
                    margin: 0 0 12px;
                    font-size: 12px;
                    color: var(--bael-text-dim, #888);
                    text-transform: uppercase;
                }

                .resource-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .resource-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 12px;
                    background: var(--bael-bg-dark, #151515);
                    border-radius: 6px;
                    font-size: 12px;
                }

                .resource-icon {
                    font-size: 16px;
                }

                .resource-name {
                    color: var(--bael-text, #fff);
                    font-family: monospace;
                    word-break: break-all;
                }
            `;
      document.head.appendChild(style);
    }

    bindEvents() {
      // Indicator click
      this.indicator.addEventListener("click", () => this.open());

      // Close button
      this.panel
        .querySelector(".close-btn")
        .addEventListener("click", () => this.close());

      // Config changes
      document
        .getElementById("lazy-enable-prefetch")
        ?.addEventListener("change", (e) => {
          this.config.enablePrefetch = e.target.checked;
          this.saveConfig();
        });

      document
        .getElementById("lazy-respect-datasaver")
        ?.addEventListener("change", (e) => {
          this.config.respectDataSaver = e.target.checked;
          this.saveConfig();
          this.adjustLoadingStrategy();
        });

      document
        .getElementById("lazy-max-concurrent")
        ?.addEventListener("change", (e) => {
          this.maxConcurrent = parseInt(e.target.value) || 6;
        });

      // Keyboard shortcut
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "L") {
          e.preventDefault();
          this.toggle();
        }
      });

      // Auto-observe new elements
      if ("MutationObserver" in window) {
        const mo = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === 1) {
                if (node.hasAttribute && node.hasAttribute("data-lazy")) {
                  this.observe(node);
                }
                if (node.querySelectorAll) {
                  node
                    .querySelectorAll("[data-lazy]")
                    .forEach((el) => this.observe(el));
                }
              }
            });
          });
        });

        mo.observe(document.body, { childList: true, subtree: true });
      }
    }

    open() {
      this.panel.classList.add("visible");
      this.updateStats();
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
  window.BaelLazyLoader = new BaelLazyLoader();

  // Auto-observe on DOMContentLoaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelLazyLoader.observeAll();
    });
  } else {
    window.BaelLazyLoader.observeAll();
  }
})();
