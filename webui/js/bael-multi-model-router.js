/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BAEL - LORD OF ALL
 * MULTI-MODEL ROUTER - Intelligent AI Provider Management
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Routes requests to multiple AI providers with:
 * - Automatic failover and load balancing
 * - Cost optimization
 * - Performance tracking
 * - Model comparison capabilities
 * - Rate limiting and quota management
 *
 * @version 1.0.0
 */

(function () {
  "use strict";

  class BaelMultiModelRouter {
    constructor() {
      // Available providers and models
      this.providers = new Map();
      this.models = new Map();

      // Active configuration
      this.activeProvider = "openai";
      this.activeModel = "gpt-4";
      this.fallbackChain = [];

      // Routing strategy
      this.strategy = "quality"; // quality, cost, speed, balanced

      // Usage tracking
      this.usage = {
        totalRequests: 0,
        totalTokens: 0,
        totalCost: 0,
        byProvider: new Map(),
        byModel: new Map(),
      };

      // Performance metrics
      this.metrics = {
        latency: new Map(),
        errors: new Map(),
        successRate: new Map(),
      };

      // Rate limiting
      this.rateLimits = new Map();
      this.requestQueue = [];

      // UI
      this.panel = null;
      this.isVisible = false;

      this.init();
    }

    init() {
      this.registerDefaultProviders();
      this.loadConfiguration();
      this.createUI();
      this.addStyles();
      this.bindEvents();
      this.startMonitoring();
      console.log("🔀 Bael Multi-Model Router initialized");
    }

    // ═════════════════════════════════════════════════════════════════
    // PROVIDER REGISTRATION
    // ═════════════════════════════════════════════════════════════════

    registerDefaultProviders() {
      // OpenAI
      this.registerProvider("openai", {
        name: "OpenAI",
        icon: "🤖",
        color: "#10a37f",
        models: [
          {
            id: "gpt-4o",
            name: "GPT-4o",
            contextWindow: 128000,
            inputCost: 5,
            outputCost: 15,
            tier: "premium",
          },
          {
            id: "gpt-4-turbo",
            name: "GPT-4 Turbo",
            contextWindow: 128000,
            inputCost: 10,
            outputCost: 30,
            tier: "premium",
          },
          {
            id: "gpt-4",
            name: "GPT-4",
            contextWindow: 8192,
            inputCost: 30,
            outputCost: 60,
            tier: "premium",
          },
          {
            id: "gpt-3.5-turbo",
            name: "GPT-3.5 Turbo",
            contextWindow: 16385,
            inputCost: 0.5,
            outputCost: 1.5,
            tier: "standard",
          },
        ],
        rateLimit: { rpm: 500, tpm: 90000 },
      });

      // Anthropic
      this.registerProvider("anthropic", {
        name: "Anthropic",
        icon: "🧠",
        color: "#d4a574",
        models: [
          {
            id: "claude-3-opus",
            name: "Claude 3 Opus",
            contextWindow: 200000,
            inputCost: 15,
            outputCost: 75,
            tier: "premium",
          },
          {
            id: "claude-3-sonnet",
            name: "Claude 3 Sonnet",
            contextWindow: 200000,
            inputCost: 3,
            outputCost: 15,
            tier: "standard",
          },
          {
            id: "claude-3-haiku",
            name: "Claude 3 Haiku",
            contextWindow: 200000,
            inputCost: 0.25,
            outputCost: 1.25,
            tier: "economy",
          },
        ],
        rateLimit: { rpm: 1000, tpm: 100000 },
      });

      // Google
      this.registerProvider("google", {
        name: "Google",
        icon: "🔷",
        color: "#4285f4",
        models: [
          {
            id: "gemini-ultra",
            name: "Gemini Ultra",
            contextWindow: 1000000,
            inputCost: 10,
            outputCost: 30,
            tier: "premium",
          },
          {
            id: "gemini-pro",
            name: "Gemini Pro",
            contextWindow: 128000,
            inputCost: 0.5,
            outputCost: 1.5,
            tier: "standard",
          },
        ],
        rateLimit: { rpm: 1500, tpm: 120000 },
      });

      // Groq
      this.registerProvider("groq", {
        name: "Groq",
        icon: "⚡",
        color: "#f55036",
        models: [
          {
            id: "llama-3.1-70b",
            name: "Llama 3.1 70B",
            contextWindow: 131072,
            inputCost: 0.59,
            outputCost: 0.79,
            tier: "economy",
          },
          {
            id: "llama-3.1-8b",
            name: "Llama 3.1 8B",
            contextWindow: 131072,
            inputCost: 0.05,
            outputCost: 0.08,
            tier: "economy",
          },
          {
            id: "mixtral-8x7b",
            name: "Mixtral 8x7B",
            contextWindow: 32768,
            inputCost: 0.24,
            outputCost: 0.24,
            tier: "economy",
          },
        ],
        rateLimit: { rpm: 30, tpm: 6000 },
      });

      // Ollama (Local)
      this.registerProvider("ollama", {
        name: "Ollama (Local)",
        icon: "🏠",
        color: "#ffffff",
        models: [
          {
            id: "llama3",
            name: "Llama 3",
            contextWindow: 8192,
            inputCost: 0,
            outputCost: 0,
            tier: "free",
          },
          {
            id: "mistral",
            name: "Mistral",
            contextWindow: 8192,
            inputCost: 0,
            outputCost: 0,
            tier: "free",
          },
          {
            id: "codellama",
            name: "Code Llama",
            contextWindow: 8192,
            inputCost: 0,
            outputCost: 0,
            tier: "free",
          },
        ],
        rateLimit: { rpm: Infinity, tpm: Infinity },
      });
    }

    registerProvider(id, config) {
      this.providers.set(id, config);
      config.models.forEach((model) => {
        this.models.set(`${id}/${model.id}`, { ...model, provider: id });
      });
    }

    // ═════════════════════════════════════════════════════════════════
    // ROUTING LOGIC
    // ═════════════════════════════════════════════════════════════════

    selectModel(requirements = {}) {
      const candidates = this.getCandidates(requirements);

      switch (this.strategy) {
        case "quality":
          return this.selectByQuality(candidates);
        case "cost":
          return this.selectByCost(candidates);
        case "speed":
          return this.selectBySpeed(candidates);
        case "balanced":
        default:
          return this.selectBalanced(candidates);
      }
    }

    getCandidates(requirements) {
      const candidates = [];

      for (const [fullId, model] of this.models) {
        const provider = this.providers.get(model.provider);

        // Check requirements
        if (
          requirements.minContext &&
          model.contextWindow < requirements.minContext
        )
          continue;
        if (requirements.maxCost && model.inputCost > requirements.maxCost)
          continue;
        if (requirements.tier && model.tier !== requirements.tier) continue;
        if (
          requirements.providers &&
          !requirements.providers.includes(model.provider)
        )
          continue;

        // Check rate limits
        if (this.isRateLimited(model.provider)) continue;

        candidates.push({ fullId, model, provider });
      }

      return candidates;
    }

    selectByQuality(candidates) {
      // Sort by tier (premium > standard > economy > free)
      const tierOrder = { premium: 0, standard: 1, economy: 2, free: 3 };
      candidates.sort(
        (a, b) => tierOrder[a.model.tier] - tierOrder[b.model.tier],
      );
      return candidates[0];
    }

    selectByCost(candidates) {
      candidates.sort((a, b) => a.model.inputCost - b.model.inputCost);
      return candidates[0];
    }

    selectBySpeed(candidates) {
      // Use historical latency data
      candidates.sort((a, b) => {
        const latencyA = this.metrics.latency.get(a.fullId) || 1000;
        const latencyB = this.metrics.latency.get(b.fullId) || 1000;
        return latencyA - latencyB;
      });
      return candidates[0];
    }

    selectBalanced(candidates) {
      // Score based on quality, cost, and speed
      candidates.forEach((c) => {
        const tierScore = { premium: 100, standard: 70, economy: 40, free: 20 }[
          c.model.tier
        ];
        const costScore = Math.max(0, 100 - c.model.inputCost * 2);
        const latency = this.metrics.latency.get(c.fullId) || 500;
        const speedScore = Math.max(0, 100 - latency / 10);
        c.score = tierScore * 0.4 + costScore * 0.3 + speedScore * 0.3;
      });

      candidates.sort((a, b) => b.score - a.score);
      return candidates[0];
    }

    isRateLimited(providerId) {
      const limit = this.rateLimits.get(providerId);
      if (!limit) return false;

      const now = Date.now();
      const windowStart = now - 60000; // 1 minute window

      // Count recent requests
      const recentRequests = limit.requests.filter((t) => t > windowStart);
      limit.requests = recentRequests;

      const provider = this.providers.get(providerId);
      return recentRequests.length >= provider.rateLimit.rpm;
    }

    recordRequest(providerId) {
      if (!this.rateLimits.has(providerId)) {
        this.rateLimits.set(providerId, { requests: [] });
      }
      this.rateLimits.get(providerId).requests.push(Date.now());
    }

    // ═════════════════════════════════════════════════════════════════
    // COST TRACKING
    // ═════════════════════════════════════════════════════════════════

    trackUsage(modelFullId, inputTokens, outputTokens) {
      const model = this.models.get(modelFullId);
      if (!model) return;

      const inputCost = (inputTokens / 1000000) * model.inputCost;
      const outputCost = (outputTokens / 1000000) * model.outputCost;
      const totalCost = inputCost + outputCost;

      this.usage.totalRequests++;
      this.usage.totalTokens += inputTokens + outputTokens;
      this.usage.totalCost += totalCost;

      // By provider
      const providerUsage = this.usage.byProvider.get(model.provider) || {
        requests: 0,
        tokens: 0,
        cost: 0,
      };
      providerUsage.requests++;
      providerUsage.tokens += inputTokens + outputTokens;
      providerUsage.cost += totalCost;
      this.usage.byProvider.set(model.provider, providerUsage);

      // By model
      const modelUsage = this.usage.byModel.get(modelFullId) || {
        requests: 0,
        tokens: 0,
        cost: 0,
      };
      modelUsage.requests++;
      modelUsage.tokens += inputTokens + outputTokens;
      modelUsage.cost += totalCost;
      this.usage.byModel.set(modelFullId, modelUsage);

      // Save and emit
      this.saveUsage();
      this.emit("usage-update", {
        modelFullId,
        inputTokens,
        outputTokens,
        cost: totalCost,
      });
      this.updateUI();
    }

    // ═════════════════════════════════════════════════════════════════
    // CONFIGURATION
    // ═════════════════════════════════════════════════════════════════

    loadConfiguration() {
      try {
        const saved = JSON.parse(
          localStorage.getItem("bael_router_config") || "{}",
        );
        if (saved.activeProvider) this.activeProvider = saved.activeProvider;
        if (saved.activeModel) this.activeModel = saved.activeModel;
        if (saved.strategy) this.strategy = saved.strategy;
        if (saved.fallbackChain) this.fallbackChain = saved.fallbackChain;
      } catch (e) {}

      // Load usage
      try {
        const usage = JSON.parse(
          localStorage.getItem("bael_router_usage") || "{}",
        );
        if (usage.totalRequests) this.usage.totalRequests = usage.totalRequests;
        if (usage.totalTokens) this.usage.totalTokens = usage.totalTokens;
        if (usage.totalCost) this.usage.totalCost = usage.totalCost;
      } catch (e) {}
    }

    saveConfiguration() {
      localStorage.setItem(
        "bael_router_config",
        JSON.stringify({
          activeProvider: this.activeProvider,
          activeModel: this.activeModel,
          strategy: this.strategy,
          fallbackChain: this.fallbackChain,
        }),
      );
    }

    saveUsage() {
      localStorage.setItem(
        "bael_router_usage",
        JSON.stringify({
          totalRequests: this.usage.totalRequests,
          totalTokens: this.usage.totalTokens,
          totalCost: this.usage.totalCost,
        }),
      );
    }

    setStrategy(strategy) {
      this.strategy = strategy;
      this.saveConfiguration();
      this.emit("strategy-change", { strategy });
    }

    setActiveModel(providerId, modelId) {
      this.activeProvider = providerId;
      this.activeModel = modelId;
      this.saveConfiguration();
      this.emit("model-change", { provider: providerId, model: modelId });
    }

    // ═════════════════════════════════════════════════════════════════
    // MONITORING
    // ═════════════════════════════════════════════════════════════════

    startMonitoring() {
      // Intercept API calls to track latency
      this.interceptFetch();
    }

    interceptFetch() {
      const originalFetch = window.fetch;
      const router = this;

      window.fetch = async function (url, options) {
        const startTime = performance.now();

        try {
          const response = await originalFetch.apply(window, arguments);
          const endTime = performance.now();

          // Track latency for AI endpoints
          if (typeof url === "string" && url.includes("/message")) {
            const latency = endTime - startTime;
            router.recordLatency(
              router.activeProvider,
              router.activeModel,
              latency,
            );
          }

          return response;
        } catch (error) {
          router.recordError(router.activeProvider, router.activeModel, error);
          throw error;
        }
      };
    }

    recordLatency(provider, model, latency) {
      const key = `${provider}/${model}`;
      const existing = this.metrics.latency.get(key) || [];
      existing.push(latency);
      if (existing.length > 100) existing.shift();
      this.metrics.latency.set(
        key,
        existing.reduce((a, b) => a + b) / existing.length,
      );
    }

    recordError(provider, model, error) {
      const key = `${provider}/${model}`;
      const count = (this.metrics.errors.get(key) || 0) + 1;
      this.metrics.errors.set(key, count);
    }

    // ═════════════════════════════════════════════════════════════════
    // UI
    // ═════════════════════════════════════════════════════════════════

    createUI() {
      const panel = document.createElement("div");
      panel.id = "bael-router-panel";
      panel.className = "bael-router-panel";
      panel.innerHTML = this.renderPanel();
      document.body.appendChild(panel);
      this.panel = panel;
    }

    renderPanel() {
      return `
                <div class="router-header">
                    <div class="router-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="3"/>
                            <path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
                            <path d="M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                        </svg>
                        <span>Multi-Model Router</span>
                    </div>
                    <button class="router-close" id="router-close">×</button>
                </div>

                <div class="router-content">
                    <!-- Strategy Selector -->
                    <div class="router-section">
                        <h4>Routing Strategy</h4>
                        <div class="strategy-grid">
                            <button class="strategy-btn ${this.strategy === "quality" ? "active" : ""}" data-strategy="quality">
                                <span>👑</span> Quality First
                            </button>
                            <button class="strategy-btn ${this.strategy === "cost" ? "active" : ""}" data-strategy="cost">
                                <span>💰</span> Cost Optimized
                            </button>
                            <button class="strategy-btn ${this.strategy === "speed" ? "active" : ""}" data-strategy="speed">
                                <span>⚡</span> Speed Priority
                            </button>
                            <button class="strategy-btn ${this.strategy === "balanced" ? "active" : ""}" data-strategy="balanced">
                                <span>⚖️</span> Balanced
                            </button>
                        </div>
                    </div>

                    <!-- Active Model -->
                    <div class="router-section">
                        <h4>Active Model</h4>
                        <div class="active-model" id="active-model-display">
                            ${this.renderActiveModel()}
                        </div>
                    </div>

                    <!-- Provider List -->
                    <div class="router-section">
                        <h4>Available Providers</h4>
                        <div class="provider-list" id="provider-list">
                            ${this.renderProviders()}
                        </div>
                    </div>

                    <!-- Usage Stats -->
                    <div class="router-section">
                        <h4>Usage Statistics</h4>
                        <div class="usage-stats">
                            <div class="stat-item">
                                <span class="stat-label">Total Requests</span>
                                <span class="stat-value" id="stat-requests">${this.usage.totalRequests}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Total Tokens</span>
                                <span class="stat-value" id="stat-tokens">${this.formatNumber(this.usage.totalTokens)}</span>
                            </div>
                            <div class="stat-item highlight">
                                <span class="stat-label">Estimated Cost</span>
                                <span class="stat-value" id="stat-cost">$${this.usage.totalCost.toFixed(4)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
    }

    renderActiveModel() {
      const model = this.models.get(
        `${this.activeProvider}/${this.activeModel}`,
      );
      const provider = this.providers.get(this.activeProvider);
      if (!model || !provider) return "<p>No model selected</p>";

      return `
                <div class="model-card active">
                    <div class="model-icon" style="background: ${provider.color}">${provider.icon}</div>
                    <div class="model-info">
                        <div class="model-name">${model.name}</div>
                        <div class="model-provider">${provider.name}</div>
                    </div>
                    <div class="model-stats">
                        <span class="model-context">${this.formatNumber(model.contextWindow)} ctx</span>
                        <span class="model-cost">$${model.inputCost}/${model.outputCost}</span>
                    </div>
                </div>
            `;
    }

    renderProviders() {
      let html = "";
      for (const [id, provider] of this.providers) {
        html += `
                    <div class="provider-card" data-provider="${id}">
                        <div class="provider-header">
                            <span class="provider-icon" style="background: ${provider.color}">${provider.icon}</span>
                            <span class="provider-name">${provider.name}</span>
                            <span class="provider-models">${provider.models.length} models</span>
                        </div>
                        <div class="provider-models-list">
                            ${provider.models
                              .map(
                                (m) => `
                                <button class="model-select-btn" data-provider="${id}" data-model="${m.id}">
                                    <span class="model-select-name">${m.name}</span>
                                    <span class="model-select-tier tier-${m.tier}">${m.tier}</span>
                                </button>
                            `,
                              )
                              .join("")}
                        </div>
                    </div>
                `;
      }
      return html;
    }

    updateUI() {
      if (!this.panel) return;

      this.panel.querySelector("#stat-requests").textContent =
        this.usage.totalRequests;
      this.panel.querySelector("#stat-tokens").textContent = this.formatNumber(
        this.usage.totalTokens,
      );
      this.panel.querySelector("#stat-cost").textContent =
        "$" + this.usage.totalCost.toFixed(4);
      this.panel.querySelector("#active-model-display").innerHTML =
        this.renderActiveModel();
    }

    addStyles() {
      if (document.getElementById("bael-router-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-router-styles";
      styles.textContent = `
                .bael-router-panel {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 500px;
                    max-width: 95vw;
                    max-height: 90vh;
                    background: var(--color-panel, #12121a);
                    border: 1px solid var(--color-border, #2a2a3a);
                    border-radius: 16px;
                    z-index: 100050;
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6);
                }

                .bael-router-panel.visible {
                    display: flex;
                    animation: routerIn 0.3s ease;
                }

                @keyframes routerIn {
                    from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }

                .router-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 20px;
                    border-bottom: 1px solid var(--color-border, #2a2a3a);
                }

                .router-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--color-text, #fff);
                }

                .router-title svg {
                    width: 22px;
                    height: 22px;
                    color: var(--color-primary, #ff3366);
                }

                .router-close {
                    width: 32px;
                    height: 32px;
                    background: transparent;
                    border: none;
                    color: var(--color-text-muted, #666);
                    font-size: 24px;
                    cursor: pointer;
                    border-radius: 6px;
                }

                .router-close:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: var(--color-text, #fff);
                }

                .router-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                }

                .router-section {
                    margin-bottom: 24px;
                }

                .router-section h4 {
                    font-size: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                    color: var(--color-text-muted, #666);
                    margin-bottom: 12px;
                }

                .strategy-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                }

                .strategy-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 16px;
                    background: var(--color-surface, #181820);
                    border: 1px solid var(--color-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--color-text-secondary, #aaa);
                    cursor: pointer;
                    font-size: 13px;
                    transition: all 0.2s;
                }

                .strategy-btn:hover {
                    border-color: var(--color-primary, #ff3366);
                }

                .strategy-btn.active {
                    background: rgba(255, 51, 102, 0.1);
                    border-color: var(--color-primary, #ff3366);
                    color: var(--color-text, #fff);
                }

                .model-card {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px;
                    background: var(--color-surface, #181820);
                    border: 1px solid var(--color-border, #2a2a3a);
                    border-radius: 10px;
                }

                .model-card.active {
                    border-color: var(--color-primary, #ff3366);
                }

                .model-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                }

                .model-info {
                    flex: 1;
                }

                .model-name {
                    font-size: 15px;
                    font-weight: 600;
                    color: var(--color-text, #fff);
                }

                .model-provider {
                    font-size: 12px;
                    color: var(--color-text-muted, #666);
                }

                .model-stats {
                    text-align: right;
                    font-size: 11px;
                    color: var(--color-text-muted, #666);
                }

                .provider-card {
                    background: var(--color-surface, #181820);
                    border: 1px solid var(--color-border, #2a2a3a);
                    border-radius: 10px;
                    margin-bottom: 8px;
                    overflow: hidden;
                }

                .provider-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 16px;
                    cursor: pointer;
                }

                .provider-icon {
                    width: 28px;
                    height: 28px;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                }

                .provider-name {
                    flex: 1;
                    font-size: 14px;
                    font-weight: 500;
                    color: var(--color-text, #fff);
                }

                .provider-models {
                    font-size: 11px;
                    color: var(--color-text-muted, #666);
                }

                .provider-models-list {
                    padding: 0 12px 12px;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                }

                .model-select-btn {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 10px;
                    background: var(--color-background, #0a0a0f);
                    border: 1px solid var(--color-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--color-text-secondary, #aaa);
                    cursor: pointer;
                    font-size: 11px;
                    transition: all 0.2s;
                }

                .model-select-btn:hover {
                    border-color: var(--color-primary, #ff3366);
                    color: var(--color-text, #fff);
                }

                .model-select-tier {
                    padding: 2px 5px;
                    border-radius: 4px;
                    font-size: 9px;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .tier-premium { background: #10b981; color: #000; }
                .tier-standard { background: #3b82f6; color: #fff; }
                .tier-economy { background: #f59e0b; color: #000; }
                .tier-free { background: #8b5cf6; color: #fff; }

                .usage-stats {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 12px;
                }

                .stat-item {
                    padding: 16px;
                    background: var(--color-surface, #181820);
                    border: 1px solid var(--color-border, #2a2a3a);
                    border-radius: 10px;
                    text-align: center;
                }

                .stat-item.highlight {
                    border-color: var(--color-primary, #ff3366);
                    background: rgba(255, 51, 102, 0.1);
                }

                .stat-label {
                    display: block;
                    font-size: 10px;
                    color: var(--color-text-muted, #666);
                    margin-bottom: 6px;
                }

                .stat-value {
                    font-size: 18px;
                    font-weight: 700;
                    color: var(--color-text, #fff);
                }

                .stat-item.highlight .stat-value {
                    color: var(--color-primary, #ff3366);
                }
            `;
      document.head.appendChild(styles);
    }

    bindEvents() {
      // Close button
      this.panel
        .querySelector("#router-close")
        .addEventListener("click", () => this.close());

      // Strategy buttons
      this.panel.querySelectorAll(".strategy-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.setStrategy(btn.dataset.strategy);
          this.panel
            .querySelectorAll(".strategy-btn")
            .forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
        });
      });

      // Model selection
      this.panel.querySelectorAll(".model-select-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.setActiveModel(btn.dataset.provider, btn.dataset.model);
          this.updateUI();
        });
      });

      // Keyboard shortcut
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "M") {
          e.preventDefault();
          this.toggle();
        }
      });
    }

    // ═════════════════════════════════════════════════════════════════
    // UTILITIES
    // ═════════════════════════════════════════════════════════════════

    formatNumber(num) {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
      if (num >= 1000) return (num / 1000).toFixed(1) + "K";
      return num.toString();
    }

    emit(event, data) {
      window.dispatchEvent(
        new CustomEvent(`bael:router:${event}`, { detail: data }),
      );
    }

    // ═════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═════════════════════════════════════════════════════════════════

    open() {
      this.isVisible = true;
      this.panel.classList.add("visible");
    }

    close() {
      this.isVisible = false;
      this.panel.classList.remove("visible");
    }

    toggle() {
      if (this.isVisible) this.close();
      else this.open();
    }

    getActiveModel() {
      return this.models.get(`${this.activeProvider}/${this.activeModel}`);
    }

    getUsageReport() {
      return { ...this.usage };
    }
  }

  // Initialize
  window.BaelMultiModelRouter = new BaelMultiModelRouter();
})();
