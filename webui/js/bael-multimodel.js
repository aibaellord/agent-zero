/**
 * BAEL - LORD OF ALL
 * Multi-Model Manager - AI model switching and configuration interface
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelMultiModel {
    constructor() {
      this.container = null;
      this.isVisible = false;
      this.currentModel = null;
      this.models = [];
      this.presets = [];
      this.init();
    }

    init() {
      this.loadModels();
      this.loadPresets();
      this.createContainer();
      this.createQuickSwitcher();
      this.addStyles();
      this.bindEvents();
      console.log("🤖 Bael Multi-Model Manager initialized");
    }

    loadModels() {
      // Load from API or local storage
      this.models = [
        {
          id: "gpt-4",
          provider: "openai",
          name: "GPT-4",
          description: "Most capable model for complex tasks",
          icon: "🧠",
          color: "#10a37f",
          maxTokens: 128000,
          costPer1k: { input: 0.03, output: 0.06 },
        },
        {
          id: "gpt-4-turbo",
          provider: "openai",
          name: "GPT-4 Turbo",
          description: "Faster GPT-4 with vision capabilities",
          icon: "⚡",
          color: "#10a37f",
          maxTokens: 128000,
          costPer1k: { input: 0.01, output: 0.03 },
        },
        {
          id: "gpt-3.5-turbo",
          provider: "openai",
          name: "GPT-3.5 Turbo",
          description: "Fast and cost-effective",
          icon: "💨",
          color: "#10a37f",
          maxTokens: 16385,
          costPer1k: { input: 0.0005, output: 0.0015 },
        },
        {
          id: "claude-3-opus",
          provider: "anthropic",
          name: "Claude 3 Opus",
          description: "Most intelligent Claude model",
          icon: "🎭",
          color: "#d4a574",
          maxTokens: 200000,
          costPer1k: { input: 0.015, output: 0.075 },
        },
        {
          id: "claude-3-sonnet",
          provider: "anthropic",
          name: "Claude 3 Sonnet",
          description: "Balanced performance and cost",
          icon: "📜",
          color: "#d4a574",
          maxTokens: 200000,
          costPer1k: { input: 0.003, output: 0.015 },
        },
        {
          id: "claude-3-haiku",
          provider: "anthropic",
          name: "Claude 3 Haiku",
          description: "Fastest Claude model",
          icon: "🌸",
          color: "#d4a574",
          maxTokens: 200000,
          costPer1k: { input: 0.00025, output: 0.00125 },
        },
        {
          id: "gemini-pro",
          provider: "google",
          name: "Gemini Pro",
          description: "Google's multimodal model",
          icon: "💎",
          color: "#4285f4",
          maxTokens: 32000,
          costPer1k: { input: 0.0005, output: 0.0015 },
        },
        {
          id: "llama-3-70b",
          provider: "meta",
          name: "Llama 3 70B",
          description: "Open source powerhouse",
          icon: "🦙",
          color: "#0467df",
          maxTokens: 8192,
          costPer1k: { input: 0.0007, output: 0.0009 },
        },
        {
          id: "mistral-large",
          provider: "mistral",
          name: "Mistral Large",
          description: "European AI excellence",
          icon: "🌬️",
          color: "#ff7000",
          maxTokens: 32000,
          costPer1k: { input: 0.008, output: 0.024 },
        },
        {
          id: "local-ollama",
          provider: "local",
          name: "Local (Ollama)",
          description: "Run models locally",
          icon: "🏠",
          color: "#666",
          maxTokens: 8192,
          costPer1k: { input: 0, output: 0 },
        },
      ];

      // Get current model from settings
      this.currentModel = this.models[0];
    }

    loadPresets() {
      this.presets = [
        {
          id: "creative",
          name: "Creative Writing",
          icon: "✨",
          model: "claude-3-opus",
          temperature: 0.9,
          topP: 0.95,
          description: "Higher creativity, more varied outputs",
        },
        {
          id: "coding",
          name: "Coding Assistant",
          icon: "💻",
          model: "gpt-4-turbo",
          temperature: 0.2,
          topP: 0.1,
          description: "Precise, deterministic code generation",
        },
        {
          id: "analysis",
          name: "Data Analysis",
          icon: "📊",
          model: "claude-3-sonnet",
          temperature: 0.3,
          topP: 0.5,
          description: "Balanced for analytical tasks",
        },
        {
          id: "fast",
          name: "Quick Responses",
          icon: "⚡",
          model: "claude-3-haiku",
          temperature: 0.5,
          topP: 0.5,
          description: "Speed-optimized for simple tasks",
        },
        {
          id: "free",
          name: "Cost Saver",
          icon: "💰",
          model: "local-ollama",
          temperature: 0.7,
          topP: 0.9,
          description: "Free local processing",
        },
      ];
    }

    createContainer() {
      const container = document.createElement("div");
      container.id = "bael-multimodel";
      container.className = "bael-multimodel";
      container.innerHTML = `
                <div class="multimodel-header">
                    <div class="multimodel-title">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                            <line x1="8" y1="21" x2="16" y2="21"/>
                            <line x1="12" y1="17" x2="12" y2="21"/>
                        </svg>
                        <span>Model Manager</span>
                    </div>
                    <button class="multimodel-close" id="multimodel-close">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                    </button>
                </div>

                <div class="multimodel-content">
                    <div class="multimodel-sidebar">
                        <div class="sidebar-section">
                            <h4>Current Model</h4>
                            <div class="current-model-card" id="current-model-card"></div>
                        </div>

                        <div class="sidebar-section">
                            <h4>Quick Presets</h4>
                            <div class="presets-list" id="presets-list"></div>
                        </div>

                        <div class="sidebar-section">
                            <h4>Parameters</h4>
                            <div class="param-controls">
                                <div class="param-group">
                                    <label>Temperature</label>
                                    <input type="range" id="param-temp" min="0" max="2" step="0.1" value="0.7">
                                    <span class="param-value" id="temp-value">0.7</span>
                                </div>
                                <div class="param-group">
                                    <label>Top P</label>
                                    <input type="range" id="param-topp" min="0" max="1" step="0.05" value="0.9">
                                    <span class="param-value" id="topp-value">0.9</span>
                                </div>
                                <div class="param-group">
                                    <label>Max Tokens</label>
                                    <input type="number" id="param-maxtokens" value="4096" min="1" max="128000">
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="multimodel-main">
                        <div class="models-search">
                            <input type="text" id="model-search" placeholder="Search models...">
                            <div class="provider-filters" id="provider-filters"></div>
                        </div>
                        <div class="models-grid" id="models-grid"></div>
                    </div>
                </div>
            `;
      document.body.appendChild(container);
      this.container = container;

      this.renderModels();
      this.renderPresets();
      this.renderCurrentModel();
      this.renderProviderFilters();
    }

    createQuickSwitcher() {
      const switcher = document.createElement("div");
      switcher.id = "bael-model-switcher";
      switcher.className = "bael-model-switcher";
      switcher.innerHTML = `
                <button class="model-switcher-btn" id="model-switcher-btn">
                    <span class="switcher-icon">🤖</span>
                    <span class="switcher-name">GPT-4</span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 18 9"/>
                    </svg>
                </button>
                <div class="model-switcher-dropdown" id="model-switcher-dropdown"></div>
            `;
      document.body.appendChild(switcher);
      this.switcher = switcher;

      this.renderQuickDropdown();
    }

    renderModels() {
      const grid = this.container.querySelector("#models-grid");
      grid.innerHTML = this.models
        .map(
          (model) => `
                <div class="model-card ${model.id === this.currentModel?.id ? "active" : ""}"
                     data-id="${model.id}"
                     style="--model-color: ${model.color}">
                    <div class="model-icon">${model.icon}</div>
                    <div class="model-info">
                        <div class="model-name">${model.name}</div>
                        <div class="model-provider">${model.provider}</div>
                        <div class="model-desc">${model.description}</div>
                    </div>
                    <div class="model-stats">
                        <div class="stat">
                            <span class="stat-label">Context</span>
                            <span class="stat-value">${this.formatTokens(model.maxTokens)}</span>
                        </div>
                        <div class="stat">
                            <span class="stat-label">Cost/1K</span>
                            <span class="stat-value">$${model.costPer1k.input.toFixed(4)}</span>
                        </div>
                    </div>
                    <button class="model-select-btn">Select</button>
                </div>
            `,
        )
        .join("");

      // Bind click handlers
      grid.querySelectorAll(".model-card").forEach((card) => {
        card.addEventListener("click", () => {
          this.selectModel(card.dataset.id);
        });
      });
    }

    renderPresets() {
      const list = this.container.querySelector("#presets-list");
      list.innerHTML = this.presets
        .map(
          (preset) => `
                <div class="preset-item" data-id="${preset.id}">
                    <span class="preset-icon">${preset.icon}</span>
                    <div class="preset-info">
                        <span class="preset-name">${preset.name}</span>
                        <span class="preset-desc">${preset.description}</span>
                    </div>
                </div>
            `,
        )
        .join("");

      list.querySelectorAll(".preset-item").forEach((item) => {
        item.addEventListener("click", () => {
          this.applyPreset(item.dataset.id);
        });
      });
    }

    renderCurrentModel() {
      const card = this.container.querySelector("#current-model-card");
      if (!this.currentModel) return;

      card.innerHTML = `
                <div class="current-model-icon" style="background: ${this.currentModel.color}">
                    ${this.currentModel.icon}
                </div>
                <div class="current-model-info">
                    <div class="current-model-name">${this.currentModel.name}</div>
                    <div class="current-model-provider">${this.currentModel.provider}</div>
                </div>
            `;
    }

    renderProviderFilters() {
      const providers = [...new Set(this.models.map((m) => m.provider))];
      const filters = this.container.querySelector("#provider-filters");

      filters.innerHTML = `
                <button class="provider-filter active" data-provider="all">All</button>
                ${providers
                  .map(
                    (p) => `
                    <button class="provider-filter" data-provider="${p}">${this.capitalizeFirst(p)}</button>
                `,
                  )
                  .join("")}
            `;

      filters.querySelectorAll(".provider-filter").forEach((btn) => {
        btn.addEventListener("click", () => {
          filters
            .querySelectorAll(".provider-filter")
            .forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          this.filterByProvider(btn.dataset.provider);
        });
      });
    }

    renderQuickDropdown() {
      const dropdown = this.switcher.querySelector("#model-switcher-dropdown");
      dropdown.innerHTML = `
                <div class="dropdown-section">
                    <div class="dropdown-label">Recent Models</div>
                    ${this.models
                      .slice(0, 5)
                      .map(
                        (model) => `
                        <div class="dropdown-item" data-id="${model.id}">
                            <span class="item-icon">${model.icon}</span>
                            <span class="item-name">${model.name}</span>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
                <div class="dropdown-divider"></div>
                <div class="dropdown-item open-manager">
                    <span class="item-icon">⚙️</span>
                    <span class="item-name">Open Model Manager</span>
                </div>
            `;

      dropdown.querySelectorAll(".dropdown-item[data-id]").forEach((item) => {
        item.addEventListener("click", (e) => {
          e.stopPropagation();
          this.selectModel(item.dataset.id);
          this.hideDropdown();
        });
      });

      dropdown.querySelector(".open-manager").addEventListener("click", (e) => {
        e.stopPropagation();
        this.hideDropdown();
        this.open();
      });
    }

    selectModel(modelId) {
      const model = this.models.find((m) => m.id === modelId);
      if (!model) return;

      this.currentModel = model;
      this.renderCurrentModel();
      this.renderModels();
      this.updateSwitcherDisplay();

      // Update actual settings (would connect to backend)
      console.log("Model selected:", model);

      if (window.BaelNotifications) {
        window.BaelNotifications.success(`Switched to ${model.name}`);
      }
    }

    applyPreset(presetId) {
      const preset = this.presets.find((p) => p.id === presetId);
      if (!preset) return;

      // Apply model
      this.selectModel(preset.model);

      // Apply parameters
      this.container.querySelector("#param-temp").value = preset.temperature;
      this.container.querySelector("#temp-value").textContent =
        preset.temperature;
      this.container.querySelector("#param-topp").value = preset.topP;
      this.container.querySelector("#topp-value").textContent = preset.topP;

      if (window.BaelNotifications) {
        window.BaelNotifications.info(`Applied "${preset.name}" preset`);
      }
    }

    filterByProvider(provider) {
      const cards = this.container.querySelectorAll(".model-card");
      cards.forEach((card) => {
        const model = this.models.find((m) => m.id === card.dataset.id);
        if (provider === "all" || model.provider === provider) {
          card.style.display = "";
        } else {
          card.style.display = "none";
        }
      });
    }

    updateSwitcherDisplay() {
      if (!this.currentModel) return;
      this.switcher.querySelector(".switcher-icon").textContent =
        this.currentModel.icon;
      this.switcher.querySelector(".switcher-name").textContent =
        this.currentModel.name;
    }

    formatTokens(tokens) {
      if (tokens >= 1000000) return (tokens / 1000000).toFixed(1) + "M";
      if (tokens >= 1000) return (tokens / 1000).toFixed(0) + "K";
      return tokens.toString();
    }

    capitalizeFirst(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }

    addStyles() {
      if (document.getElementById("bael-multimodel-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-multimodel-styles";
      styles.textContent = `
                .bael-multimodel {
                    position: fixed;
                    inset: 0;
                    background: var(--bael-bg-primary, #0a0a0f);
                    z-index: 100016;
                    display: none;
                    flex-direction: column;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }

                .bael-multimodel.visible {
                    display: flex;
                    animation: mmFadeIn 0.3s ease;
                }

                @keyframes mmFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .multimodel-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 24px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .multimodel-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 18px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .multimodel-title svg {
                    width: 24px;
                    height: 24px;
                    color: var(--bael-accent, #ff3366);
                }

                .multimodel-close {
                    width: 36px;
                    height: 36px;
                    border: none;
                    background: transparent;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .multimodel-close:hover {
                    background: rgba(255, 51, 102, 0.2);
                    color: var(--bael-accent, #ff3366);
                }

                .multimodel-close svg {
                    width: 20px;
                    height: 20px;
                }

                .multimodel-content {
                    display: flex;
                    flex: 1;
                    overflow: hidden;
                }

                .multimodel-sidebar {
                    width: 320px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-right: 1px solid var(--bael-border, #2a2a3a);
                    overflow-y: auto;
                    padding: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                }

                .sidebar-section h4 {
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: var(--bael-text-muted, #666);
                    margin: 0 0 12px 0;
                }

                .current-model-card {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    padding: 16px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 2px solid var(--bael-accent, #ff3366);
                    border-radius: 12px;
                }

                .current-model-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                }

                .current-model-name {
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .current-model-provider {
                    font-size: 12px;
                    color: var(--bael-text-muted, #666);
                    text-transform: capitalize;
                }

                .presets-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .preset-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .preset-item:hover {
                    border-color: var(--bael-accent, #ff3366);
                    transform: translateX(4px);
                }

                .preset-icon {
                    font-size: 20px;
                }

                .preset-info {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .preset-name {
                    font-size: 13px;
                    font-weight: 500;
                    color: var(--bael-text-primary, #fff);
                }

                .preset-desc {
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                }

                .param-controls {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .param-group {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .param-group label {
                    font-size: 12px;
                    color: var(--bael-text-secondary, #aaa);
                }

                .param-group input[type="range"] {
                    width: 100%;
                    height: 4px;
                    background: var(--bael-border, #2a2a3a);
                    border-radius: 2px;
                    -webkit-appearance: none;
                }

                .param-group input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 16px;
                    height: 16px;
                    background: var(--bael-accent, #ff3366);
                    border-radius: 50%;
                    cursor: pointer;
                }

                .param-group input[type="number"] {
                    padding: 8px 12px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 13px;
                    outline: none;
                }

                .param-value {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--bael-accent, #ff3366);
                    text-align: right;
                }

                .multimodel-main {
                    flex: 1;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                .models-search {
                    padding: 20px;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                #model-search {
                    padding: 12px 16px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 14px;
                    outline: none;
                }

                #model-search:focus {
                    border-color: var(--bael-accent, #ff3366);
                }

                .provider-filters {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                .provider-filter {
                    padding: 6px 14px;
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 16px;
                    color: var(--bael-text-secondary, #aaa);
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .provider-filter:hover {
                    border-color: var(--bael-accent, #ff3366);
                    color: var(--bael-accent, #ff3366);
                }

                .provider-filter.active {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                    color: #fff;
                }

                .models-grid {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                    gap: 16px;
                    align-content: start;
                }

                .model-card {
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 16px;
                    padding: 20px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .model-card:hover {
                    border-color: var(--model-color);
                    transform: translateY(-4px);
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
                }

                .model-card.active {
                    border-color: var(--bael-accent, #ff3366);
                    border-width: 2px;
                }

                .model-icon {
                    width: 56px;
                    height: 56px;
                    background: var(--model-color);
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                }

                .model-info {
                    flex: 1;
                }

                .model-name {
                    font-size: 18px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                    margin-bottom: 4px;
                }

                .model-provider {
                    font-size: 12px;
                    color: var(--model-color);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 8px;
                }

                .model-desc {
                    font-size: 13px;
                    color: var(--bael-text-muted, #666);
                    line-height: 1.5;
                }

                .model-stats {
                    display: flex;
                    gap: 20px;
                }

                .stat {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }

                .stat-label {
                    font-size: 10px;
                    color: var(--bael-text-muted, #666);
                    text-transform: uppercase;
                }

                .stat-value {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .model-select-btn {
                    padding: 10px 20px;
                    background: var(--model-color);
                    border: none;
                    border-radius: 8px;
                    color: #fff;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .model-select-btn:hover {
                    filter: brightness(1.1);
                }

                /* Quick Switcher */
                .bael-model-switcher {
                    position: fixed;
                    top: 12px;
                    right: 140px;
                    z-index: 9998;
                }

                .model-switcher-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 14px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .model-switcher-btn:hover {
                    border-color: var(--bael-accent, #ff3366);
                }

                .model-switcher-btn svg {
                    width: 14px;
                    height: 14px;
                    color: var(--bael-text-muted, #666);
                }

                .switcher-icon {
                    font-size: 16px;
                }

                .model-switcher-dropdown {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    margin-top: 8px;
                    min-width: 200px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 10px;
                    padding: 8px;
                    display: none;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
                }

                .model-switcher-dropdown.visible {
                    display: block;
                    animation: dropdownFade 0.2s ease;
                }

                @keyframes dropdownFade {
                    from { opacity: 0; transform: translateY(-8px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .dropdown-section {
                    padding: 4px 0;
                }

                .dropdown-label {
                    padding: 6px 12px;
                    font-size: 10px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: var(--bael-text-muted, #666);
                }

                .dropdown-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 10px 12px;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: background 0.2s ease;
                }

                .dropdown-item:hover {
                    background: rgba(255, 255, 255, 0.05);
                }

                .item-icon {
                    font-size: 16px;
                }

                .item-name {
                    font-size: 13px;
                    color: var(--bael-text-primary, #fff);
                }

                .dropdown-divider {
                    height: 1px;
                    background: var(--bael-border, #2a2a3a);
                    margin: 8px 0;
                }
            `;
      document.head.appendChild(styles);
    }

    bindEvents() {
      // Close
      this.container
        .querySelector("#multimodel-close")
        .addEventListener("click", () => this.close());

      // Escape to close
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && this.isVisible) {
          this.close();
        }
      });

      // Parameter sliders
      this.container
        .querySelector("#param-temp")
        .addEventListener("input", (e) => {
          this.container.querySelector("#temp-value").textContent =
            e.target.value;
        });

      this.container
        .querySelector("#param-topp")
        .addEventListener("input", (e) => {
          this.container.querySelector("#topp-value").textContent =
            e.target.value;
        });

      // Search
      this.container
        .querySelector("#model-search")
        .addEventListener("input", (e) => {
          const query = e.target.value.toLowerCase();
          this.container.querySelectorAll(".model-card").forEach((card) => {
            const model = this.models.find((m) => m.id === card.dataset.id);
            const matches =
              model.name.toLowerCase().includes(query) ||
              model.provider.toLowerCase().includes(query) ||
              model.description.toLowerCase().includes(query);
            card.style.display = matches ? "" : "none";
          });
        });

      // Quick switcher
      this.switcher
        .querySelector("#model-switcher-btn")
        .addEventListener("click", () => {
          this.toggleDropdown();
        });

      // Close dropdown on outside click
      document.addEventListener("click", (e) => {
        if (!this.switcher.contains(e.target)) {
          this.hideDropdown();
        }
      });
    }

    toggleDropdown() {
      const dropdown = this.switcher.querySelector("#model-switcher-dropdown");
      dropdown.classList.toggle("visible");
    }

    hideDropdown() {
      const dropdown = this.switcher.querySelector("#model-switcher-dropdown");
      dropdown.classList.remove("visible");
    }

    // Public API
    open() {
      this.isVisible = true;
      this.container.classList.add("visible");
    }

    close() {
      this.isVisible = false;
      this.container.classList.remove("visible");
    }

    toggle() {
      if (this.isVisible) {
        this.close();
      } else {
        this.open();
      }
    }

    getCurrentModel() {
      return this.currentModel;
    }
  }

  // Initialize
  window.BaelMultiModel = new BaelMultiModel();
})();
