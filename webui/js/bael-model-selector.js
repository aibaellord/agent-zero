/**
 * BAEL - LORD OF ALL
 * AI Model Selector - Dynamic model switching and configuration
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelModelSelector {
    constructor() {
      this.isVisible = false;
      this.currentModel = null;
      this.models = this.getDefaultModels();
      this.favorites = JSON.parse(
        localStorage.getItem("bael-favorite-models") || "[]",
      );
      this.init();
    }

    getDefaultModels() {
      return [
        // OpenAI
        {
          id: "gpt-4o",
          name: "GPT-4o",
          provider: "openai",
          context: 128000,
          speed: "fast",
          cost: "$$",
          tags: ["vision", "multimodal"],
        },
        {
          id: "gpt-4-turbo",
          name: "GPT-4 Turbo",
          provider: "openai",
          context: 128000,
          speed: "fast",
          cost: "$$$",
          tags: ["vision"],
        },
        {
          id: "gpt-4",
          name: "GPT-4",
          provider: "openai",
          context: 8192,
          speed: "medium",
          cost: "$$$$",
          tags: [],
        },
        {
          id: "gpt-3.5-turbo",
          name: "GPT-3.5 Turbo",
          provider: "openai",
          context: 16385,
          speed: "fast",
          cost: "$",
          tags: [],
        },
        {
          id: "o1-preview",
          name: "o1 Preview",
          provider: "openai",
          context: 128000,
          speed: "slow",
          cost: "$$$$",
          tags: ["reasoning"],
        },
        {
          id: "o1-mini",
          name: "o1 Mini",
          provider: "openai",
          context: 128000,
          speed: "medium",
          cost: "$$",
          tags: ["reasoning"],
        },

        // Anthropic
        {
          id: "claude-3-5-sonnet-20241022",
          name: "Claude 3.5 Sonnet",
          provider: "anthropic",
          context: 200000,
          speed: "fast",
          cost: "$$",
          tags: ["vision", "coding"],
        },
        {
          id: "claude-3-opus-20240229",
          name: "Claude 3 Opus",
          provider: "anthropic",
          context: 200000,
          speed: "medium",
          cost: "$$$$",
          tags: ["vision"],
        },
        {
          id: "claude-3-haiku-20240307",
          name: "Claude 3 Haiku",
          provider: "anthropic",
          context: 200000,
          speed: "fast",
          cost: "$",
          tags: ["vision"],
        },

        // Google
        {
          id: "gemini-1.5-pro",
          name: "Gemini 1.5 Pro",
          provider: "google",
          context: 1000000,
          speed: "fast",
          cost: "$$",
          tags: ["vision", "multimodal"],
        },
        {
          id: "gemini-1.5-flash",
          name: "Gemini 1.5 Flash",
          provider: "google",
          context: 1000000,
          speed: "fast",
          cost: "$",
          tags: ["vision"],
        },

        // Local/Open
        {
          id: "llama-3.2-90b",
          name: "Llama 3.2 90B",
          provider: "ollama",
          context: 128000,
          speed: "medium",
          cost: "free",
          tags: ["vision", "local"],
        },
        {
          id: "llama-3.1-70b",
          name: "Llama 3.1 70B",
          provider: "ollama",
          context: 128000,
          speed: "medium",
          cost: "free",
          tags: ["local"],
        },
        {
          id: "mixtral-8x7b",
          name: "Mixtral 8x7B",
          provider: "ollama",
          context: 32000,
          speed: "fast",
          cost: "free",
          tags: ["local", "moe"],
        },
        {
          id: "codellama-70b",
          name: "CodeLlama 70B",
          provider: "ollama",
          context: 16000,
          speed: "medium",
          cost: "free",
          tags: ["local", "coding"],
        },
      ];
    }

    init() {
      this.createUI();
      this.bindEvents();
      console.log("🤖 Bael Model Selector initialized");
    }

    createUI() {
      const styles = document.createElement("style");
      styles.id = "bael-model-selector-styles";
      styles.textContent = `
                .bael-model-panel {
                    position: fixed;
                    top: 60px;
                    right: 80px;
                    width: 380px;
                    max-height: 600px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 14px;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
                    z-index: 8500;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    transform: translateY(-10px);
                    opacity: 0;
                    pointer-events: none;
                    transition: all 0.3s ease;
                }

                .bael-model-panel.visible {
                    transform: translateY(0);
                    opacity: 1;
                    pointer-events: all;
                }

                .bael-model-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px 16px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .bael-model-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .bael-model-close {
                    width: 28px;
                    height: 28px;
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    font-size: 14px;
                }

                .bael-model-close:hover {
                    background: #ff4444;
                    color: #fff;
                    border-color: #ff4444;
                }

                .bael-model-current {
                    padding: 14px 16px;
                    background: rgba(255, 51, 102, 0.05);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .bael-model-current-label {
                    font-size: 10px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: var(--bael-text-muted, #666);
                    margin-bottom: 6px;
                }

                .bael-model-current-name {
                    font-size: 15px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .bael-model-search {
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .bael-model-search input {
                    width: 100%;
                    padding: 10px 12px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 12px;
                }

                .bael-model-search input:focus {
                    outline: none;
                    border-color: var(--bael-accent, #ff3366);
                }

                .bael-model-tabs {
                    display: flex;
                    padding: 0 16px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .bael-model-tab {
                    padding: 10px 14px;
                    background: transparent;
                    border: none;
                    border-bottom: 2px solid transparent;
                    color: var(--bael-text-muted, #888);
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .bael-model-tab:hover {
                    color: var(--bael-text-primary, #fff);
                }

                .bael-model-tab.active {
                    color: var(--bael-accent, #ff3366);
                    border-bottom-color: var(--bael-accent, #ff3366);
                }

                .bael-model-list {
                    flex: 1;
                    overflow-y: auto;
                    padding: 12px;
                }

                .bael-model-group {
                    margin-bottom: 16px;
                }

                .bael-model-group-title {
                    font-size: 10px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    color: var(--bael-text-muted, #666);
                    padding: 8px 8px 4px;
                }

                .bael-model-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 2px solid var(--bael-border, #2a2a3a);
                    border-radius: 10px;
                    margin-bottom: 8px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .bael-model-item:hover {
                    border-color: rgba(255, 51, 102, 0.4);
                }

                .bael-model-item.active {
                    border-color: var(--bael-accent, #ff3366);
                    background: rgba(255, 51, 102, 0.05);
                }

                .bael-model-icon {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    flex-shrink: 0;
                }

                .bael-model-icon.openai { background: rgba(16, 163, 127, 0.2); }
                .bael-model-icon.anthropic { background: rgba(218, 165, 32, 0.2); }
                .bael-model-icon.google { background: rgba(66, 133, 244, 0.2); }
                .bael-model-icon.ollama { background: rgba(139, 92, 246, 0.2); }

                .bael-model-info {
                    flex: 1;
                    min-width: 0;
                }

                .bael-model-name {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                    margin-bottom: 4px;
                }

                .bael-model-meta {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                .bael-model-meta-item {
                    font-size: 10px;
                    color: var(--bael-text-muted, #888);
                    display: flex;
                    align-items: center;
                    gap: 3px;
                }

                .bael-model-tags {
                    display: flex;
                    gap: 4px;
                    flex-wrap: wrap;
                    margin-top: 6px;
                }

                .bael-model-tag {
                    padding: 2px 6px;
                    background: rgba(255, 51, 102, 0.1);
                    border-radius: 8px;
                    font-size: 9px;
                    color: var(--bael-accent, #ff3366);
                }

                .bael-model-fav {
                    width: 28px;
                    height: 28px;
                    background: transparent;
                    border: none;
                    color: var(--bael-text-muted, #666);
                    font-size: 16px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .bael-model-fav:hover,
                .bael-model-fav.active {
                    color: #f59e0b;
                }

                .bael-model-trigger {
                    position: fixed;
                    top: 60px;
                    right: 20px;
                    padding: 8px 14px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 20px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 12px;
                    cursor: pointer;
                    z-index: 8499;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.3s ease;
                }

                .bael-model-trigger:hover {
                    border-color: var(--bael-accent, #ff3366);
                }

                .bael-model-trigger-icon {
                    font-size: 14px;
                }

                .bael-model-empty {
                    text-align: center;
                    padding: 40px 20px;
                    color: var(--bael-text-muted, #666);
                }
            `;
      document.head.appendChild(styles);

      // Panel
      this.panel = document.createElement("div");
      this.panel.className = "bael-model-panel";
      this.panel.innerHTML = this.renderPanel();
      document.body.appendChild(this.panel);

      // Trigger button
      this.trigger = document.createElement("button");
      this.trigger.className = "bael-model-trigger";
      this.trigger.innerHTML = `
                <span class="bael-model-trigger-icon">🤖</span>
                <span id="trigger-model-name">Select Model</span>
                <span>▼</span>
            `;
      document.body.appendChild(this.trigger);
    }

    renderPanel() {
      return `
                <div class="bael-model-header">
                    <div class="bael-model-title">
                        <span>🤖</span>
                        <span>Model Selection</span>
                    </div>
                    <button class="bael-model-close">✕</button>
                </div>
                <div class="bael-model-current">
                    <div class="bael-model-current-label">Active Model</div>
                    <div class="bael-model-current-name" id="current-model-display">
                        <span>None selected</span>
                    </div>
                </div>
                <div class="bael-model-search">
                    <input type="text" placeholder="Search models..." id="model-search">
                </div>
                <div class="bael-model-tabs">
                    <button class="bael-model-tab active" data-tab="all">All</button>
                    <button class="bael-model-tab" data-tab="favorites">★ Favorites</button>
                    <button class="bael-model-tab" data-tab="local">Local</button>
                </div>
                <div class="bael-model-list" id="model-list">
                    ${this.renderModelList()}
                </div>
            `;
    }

    renderModelList(filter = "all", search = "") {
      let filtered = this.models;

      if (filter === "favorites") {
        filtered = this.models.filter((m) => this.favorites.includes(m.id));
      } else if (filter === "local") {
        filtered = this.models.filter((m) => m.provider === "ollama");
      }

      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            m.provider.toLowerCase().includes(q) ||
            m.tags.some((t) => t.toLowerCase().includes(q)),
        );
      }

      if (filtered.length === 0) {
        return `<div class="bael-model-empty">No models found</div>`;
      }

      // Group by provider
      const groups = {};
      filtered.forEach((model) => {
        if (!groups[model.provider]) groups[model.provider] = [];
        groups[model.provider].push(model);
      });

      return Object.entries(groups)
        .map(
          ([provider, models]) => `
                <div class="bael-model-group">
                    <div class="bael-model-group-title">${this.getProviderName(provider)}</div>
                    ${models.map((model) => this.renderModelItem(model)).join("")}
                </div>
            `,
        )
        .join("");
    }

    renderModelItem(model) {
      const isFav = this.favorites.includes(model.id);
      const isActive = this.currentModel?.id === model.id;

      return `
                <div class="bael-model-item ${isActive ? "active" : ""}" data-id="${model.id}">
                    <div class="bael-model-icon ${model.provider}">
                        ${this.getProviderIcon(model.provider)}
                    </div>
                    <div class="bael-model-info">
                        <div class="bael-model-name">${model.name}</div>
                        <div class="bael-model-meta">
                            <span class="bael-model-meta-item">📐 ${this.formatContext(model.context)}</span>
                            <span class="bael-model-meta-item">⚡ ${model.speed}</span>
                            <span class="bael-model-meta-item">💰 ${model.cost}</span>
                        </div>
                        ${
                          model.tags.length > 0
                            ? `
                            <div class="bael-model-tags">
                                ${model.tags.map((tag) => `<span class="bael-model-tag">${tag}</span>`).join("")}
                            </div>
                        `
                            : ""
                        }
                    </div>
                    <button class="bael-model-fav ${isFav ? "active" : ""}" data-id="${model.id}">
                        ${isFav ? "★" : "☆"}
                    </button>
                </div>
            `;
    }

    bindEvents() {
      // Trigger
      this.trigger.addEventListener("click", () => this.toggle());

      // Close
      this.panel
        .querySelector(".bael-model-close")
        .addEventListener("click", () => this.hide());

      // Search
      this.panel
        .querySelector("#model-search")
        .addEventListener("input", (e) => {
          const activeTab = this.panel.querySelector(".bael-model-tab.active")
            .dataset.tab;
          this.panel.querySelector("#model-list").innerHTML =
            this.renderModelList(activeTab, e.target.value);
        });

      // Tabs
      this.panel
        .querySelector(".bael-model-tabs")
        .addEventListener("click", (e) => {
          if (e.target.classList.contains("bael-model-tab")) {
            this.panel
              .querySelectorAll(".bael-model-tab")
              .forEach((t) => t.classList.remove("active"));
            e.target.classList.add("active");
            const search = this.panel.querySelector("#model-search").value;
            this.panel.querySelector("#model-list").innerHTML =
              this.renderModelList(e.target.dataset.tab, search);
          }
        });

      // Model selection
      this.panel.querySelector("#model-list").addEventListener("click", (e) => {
        // Favorite toggle
        const favBtn = e.target.closest(".bael-model-fav");
        if (favBtn) {
          e.stopPropagation();
          this.toggleFavorite(favBtn.dataset.id);
          return;
        }

        // Model selection
        const item = e.target.closest(".bael-model-item");
        if (item) {
          this.selectModel(item.dataset.id);
        }
      });

      // Keyboard
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.key === "m") {
          e.preventDefault();
          this.toggle();
        }
        if (e.key === "Escape" && this.isVisible) {
          this.hide();
        }
      });

      // Click outside
      document.addEventListener("click", (e) => {
        if (
          this.isVisible &&
          !this.panel.contains(e.target) &&
          !this.trigger.contains(e.target)
        ) {
          this.hide();
        }
      });
    }

    selectModel(modelId) {
      const model = this.models.find((m) => m.id === modelId);
      if (!model) return;

      this.currentModel = model;

      // Update UI
      this.panel.querySelector("#current-model-display").innerHTML = `
                <span>${this.getProviderIcon(model.provider)}</span>
                <span>${model.name}</span>
            `;
      this.trigger.querySelector("#trigger-model-name").textContent =
        model.name;

      // Refresh list to show active state
      const activeTab = this.panel.querySelector(".bael-model-tab.active")
        .dataset.tab;
      const search = this.panel.querySelector("#model-search").value;
      this.panel.querySelector("#model-list").innerHTML = this.renderModelList(
        activeTab,
        search,
      );

      // Emit event
      document.dispatchEvent(
        new CustomEvent("bael-model-changed", {
          detail: { model },
        }),
      );

      if (window.BaelNotifications) {
        window.BaelNotifications.success(`Switched to ${model.name}`);
      }

      this.hide();
    }

    toggleFavorite(modelId) {
      const idx = this.favorites.indexOf(modelId);
      if (idx > -1) {
        this.favorites.splice(idx, 1);
      } else {
        this.favorites.push(modelId);
      }
      localStorage.setItem(
        "bael-favorite-models",
        JSON.stringify(this.favorites),
      );

      // Refresh list
      const activeTab = this.panel.querySelector(".bael-model-tab.active")
        .dataset.tab;
      const search = this.panel.querySelector("#model-search").value;
      this.panel.querySelector("#model-list").innerHTML = this.renderModelList(
        activeTab,
        search,
      );
    }

    toggle() {
      if (this.isVisible) this.hide();
      else this.show();
    }

    show() {
      this.isVisible = true;
      this.panel.classList.add("visible");
      this.panel.querySelector("#model-search").focus();
    }

    hide() {
      this.isVisible = false;
      this.panel.classList.remove("visible");
    }

    getProviderIcon(provider) {
      const icons = {
        openai: "🟢",
        anthropic: "🟡",
        google: "🔵",
        ollama: "🟣",
      };
      return icons[provider] || "⚪";
    }

    getProviderName(provider) {
      const names = {
        openai: "OpenAI",
        anthropic: "Anthropic",
        google: "Google",
        ollama: "Local (Ollama)",
      };
      return names[provider] || provider;
    }

    formatContext(tokens) {
      if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(1)}M`;
      if (tokens >= 1000) return `${(tokens / 1000).toFixed(0)}K`;
      return tokens;
    }
  }

  window.BaelModelSelector = new BaelModelSelector();
})();
