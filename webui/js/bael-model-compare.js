/**
 * BAEL - LORD OF ALL
 * Model Comparison - Compare responses from different AI models
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelModelCompare {
    constructor() {
      this.panel = null;
      this.comparisons = [];
      this.models = this.defineModels();
      this.init();
    }

    init() {
      this.loadComparisons();
      this.addStyles();
      this.createUI();
      this.bindEvents();
      console.log("🔬 Bael Model Compare initialized");
    }

    defineModels() {
      return [
        { id: "gpt-4", name: "GPT-4", provider: "OpenAI", color: "#10a37f" },
        {
          id: "gpt-4-turbo",
          name: "GPT-4 Turbo",
          provider: "OpenAI",
          color: "#10a37f",
        },
        {
          id: "gpt-3.5-turbo",
          name: "GPT-3.5 Turbo",
          provider: "OpenAI",
          color: "#10a37f",
        },
        {
          id: "claude-3-opus",
          name: "Claude 3 Opus",
          provider: "Anthropic",
          color: "#d97706",
        },
        {
          id: "claude-3-sonnet",
          name: "Claude 3 Sonnet",
          provider: "Anthropic",
          color: "#d97706",
        },
        {
          id: "claude-3-haiku",
          name: "Claude 3 Haiku",
          provider: "Anthropic",
          color: "#d97706",
        },
        {
          id: "gemini-pro",
          name: "Gemini Pro",
          provider: "Google",
          color: "#4285f4",
        },
        { id: "llama-3", name: "Llama 3", provider: "Meta", color: "#0066cc" },
        {
          id: "mistral-large",
          name: "Mistral Large",
          provider: "Mistral",
          color: "#ff7000",
        },
        {
          id: "local",
          name: "Local Model",
          provider: "Local",
          color: "#9333ea",
        },
      ];
    }

    loadComparisons() {
      try {
        this.comparisons = JSON.parse(
          localStorage.getItem("bael_model_comparisons") || "[]",
        );
      } catch (e) {
        this.comparisons = [];
      }
    }

    saveComparisons() {
      localStorage.setItem(
        "bael_model_comparisons",
        JSON.stringify(this.comparisons),
      );
    }

    addStyles() {
      const styles = document.createElement("style");
      styles.id = "bael-model-compare-styles";
      styles.textContent = `
                /* Compare Panel */
                .bael-model-compare-panel {
                    position: fixed;
                    inset: 60px 20px 20px 20px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 16px;
                    z-index: 100030;
                    display: none;
                    flex-direction: column;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
                    overflow: hidden;
                }

                .bael-model-compare-panel.visible {
                    display: flex;
                    animation: compareAppear 0.3s ease;
                }

                @keyframes compareAppear {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }

                /* Header */
                .compare-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 16px 20px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .compare-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .compare-title-icon {
                    font-size: 20px;
                }

                .compare-close {
                    width: 32px;
                    height: 32px;
                    background: transparent;
                    border: none;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    border-radius: 6px;
                    font-size: 18px;
                }

                .compare-close:hover {
                    background: rgba(255, 51, 102, 0.2);
                    color: var(--bael-accent, #ff3366);
                }

                /* Content */
                .compare-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                /* Input Section */
                .compare-input-section {
                    padding: 20px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .input-label {
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--bael-text-muted, #666);
                    margin-bottom: 10px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .prompt-input {
                    width: 100%;
                    padding: 12px 14px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 10px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 14px;
                    resize: none;
                    height: 80px;
                    margin-bottom: 16px;
                }

                .prompt-input::placeholder {
                    color: var(--bael-text-muted, #666);
                }

                /* Model Selection */
                .model-selection {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                    margin-bottom: 16px;
                }

                .model-chip {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 12px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 20px;
                    font-size: 12px;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .model-chip:hover {
                    border-color: var(--bael-accent, #ff3366);
                }

                .model-chip.selected {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                    color: white;
                }

                .model-chip-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                }

                .compare-btn {
                    padding: 12px 24px;
                    background: var(--bael-accent, #ff3366);
                    border: none;
                    border-radius: 8px;
                    color: white;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .compare-btn:hover {
                    filter: brightness(1.1);
                }

                .compare-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                /* Results Section */
                .compare-results {
                    flex: 1;
                    overflow: auto;
                    padding: 20px;
                }

                .results-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 16px;
                }

                .result-card {
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 12px;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                .result-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .result-model {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .model-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                }

                .model-name {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .model-provider {
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                }

                .result-stats {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                }

                .stat-item {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .result-content {
                    flex: 1;
                    padding: 16px;
                    font-size: 13px;
                    line-height: 1.6;
                    color: var(--bael-text-primary, #fff);
                    max-height: 300px;
                    overflow-y: auto;
                }

                .result-content.loading {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100px;
                }

                .result-content.error {
                    color: #f87171;
                }

                .loading-spinner {
                    width: 24px;
                    height: 24px;
                    border: 2px solid var(--bael-border, #2a2a3a);
                    border-top-color: var(--bael-accent, #ff3366);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    to { transform: rotate(360deg); }
                }

                .result-footer {
                    padding: 10px 16px;
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                    display: flex;
                    gap: 8px;
                }

                .result-action {
                    padding: 6px 10px;
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-muted, #666);
                    font-size: 11px;
                    cursor: pointer;
                }

                .result-action:hover {
                    border-color: var(--bael-accent, #ff3366);
                    color: var(--bael-accent, #ff3366);
                }

                /* Empty State */
                .empty-results {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 60px;
                    color: var(--bael-text-muted, #666);
                }

                .empty-icon {
                    font-size: 48px;
                    margin-bottom: 16px;
                }

                .empty-text {
                    font-size: 14px;
                }

                /* History Section */
                .compare-history {
                    padding: 16px 20px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                }

                .history-label {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--bael-text-muted, #666);
                    margin-bottom: 10px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .history-list {
                    display: flex;
                    gap: 10px;
                    overflow-x: auto;
                    padding-bottom: 8px;
                }

                .history-item {
                    flex-shrink: 0;
                    padding: 8px 14px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    cursor: pointer;
                    max-width: 200px;
                }

                .history-item:hover {
                    border-color: var(--bael-accent, #ff3366);
                }

                .history-prompt {
                    font-size: 11px;
                    color: var(--bael-text-primary, #fff);
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    margin-bottom: 4px;
                }

                .history-meta {
                    font-size: 10px;
                    color: var(--bael-text-muted, #666);
                }

                /* Compare Button (floating) */
                .bael-compare-btn {
                    position: fixed;
                    bottom: 250px;
                    right: 20px;
                    width: 44px;
                    height: 44px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    z-index: 100005;
                    transition: all 0.3s ease;
                }

                .bael-compare-btn:hover {
                    border-color: var(--bael-accent, #ff3366);
                    transform: scale(1.1);
                }
            `;
      document.head.appendChild(styles);
    }

    createUI() {
      // Floating button
      const button = document.createElement("button");
      button.className = "bael-compare-btn";
      button.innerHTML = "🔬";
      button.title = "Model Comparison (Ctrl+Shift+M)";
      button.addEventListener("click", () => this.togglePanel());
      document.body.appendChild(button);

      // Main panel
      const panel = document.createElement("div");
      panel.className = "bael-model-compare-panel";
      panel.innerHTML = this.renderPanel();
      document.body.appendChild(panel);
      this.panel = panel;

      this.bindPanelEvents();
    }

    renderPanel() {
      return `
                <div class="compare-header">
                    <div class="compare-title">
                        <span class="compare-title-icon">🔬</span>
                        <span>Model Comparison</span>
                    </div>
                    <button class="compare-close">×</button>
                </div>

                <div class="compare-content">
                    <div class="compare-input-section">
                        <div class="input-label">Enter Your Prompt</div>
                        <textarea class="prompt-input" id="compare-prompt" placeholder="Enter a prompt to compare responses from different models..."></textarea>

                        <div class="input-label">Select Models to Compare</div>
                        <div class="model-selection" id="model-selection">
                            ${this.models
                              .map(
                                (model) => `
                                <div class="model-chip" data-model="${model.id}">
                                    <span class="model-chip-dot" style="background: ${model.color};"></span>
                                    ${model.name}
                                </div>
                            `,
                              )
                              .join("")}
                        </div>

                        <button class="compare-btn" id="run-comparison">Compare Models</button>
                    </div>

                    <div class="compare-results" id="compare-results">
                        <div class="empty-results">
                            <div class="empty-icon">🔬</div>
                            <div class="empty-text">Select models and enter a prompt to compare responses</div>
                        </div>
                    </div>

                    ${
                      this.comparisons.length > 0
                        ? `
                        <div class="compare-history">
                            <div class="history-label">Recent Comparisons</div>
                            <div class="history-list">
                                ${this.comparisons
                                  .slice(-5)
                                  .reverse()
                                  .map(
                                    (comp) => `
                                    <div class="history-item" data-id="${comp.id}">
                                        <div class="history-prompt">${this.escapeHtml(comp.prompt.substring(0, 50))}...</div>
                                        <div class="history-meta">${comp.models.length} models • ${new Date(comp.timestamp).toLocaleDateString()}</div>
                                    </div>
                                `,
                                  )
                                  .join("")}
                            </div>
                        </div>
                    `
                        : ""
                    }
                </div>
            `;
    }

    bindPanelEvents() {
      this.panel
        .querySelector(".compare-close")
        .addEventListener("click", () => this.closePanel());
      this.panel
        .querySelector("#run-comparison")
        .addEventListener("click", () => this.runComparison());

      // Model selection
      this.panel.querySelectorAll(".model-chip").forEach((chip) => {
        chip.addEventListener("click", () => {
          chip.classList.toggle("selected");
          this.updateCompareButton();
        });
      });

      // History items
      this.panel.querySelectorAll(".history-item").forEach((item) => {
        item.addEventListener("click", () => {
          const id = item.dataset.id;
          const comparison = this.comparisons.find((c) => c.id === id);
          if (comparison) {
            this.loadComparison(comparison);
          }
        });
      });
    }

    bindEvents() {
      // Keyboard shortcut
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "M") {
          e.preventDefault();
          this.togglePanel();
        }
      });
    }

    updateCompareButton() {
      const selected = this.panel.querySelectorAll(
        ".model-chip.selected",
      ).length;
      const btn = this.panel.querySelector("#run-comparison");
      btn.disabled = selected < 2;
      btn.textContent =
        selected < 2
          ? "Select at least 2 models"
          : `Compare ${selected} Models`;
    }

    async runComparison() {
      const prompt = this.panel.querySelector("#compare-prompt").value.trim();
      if (!prompt) {
        if (window.BaelNotifications) {
          window.BaelNotifications.warning("Please enter a prompt");
        }
        return;
      }

      const selectedModels = [
        ...this.panel.querySelectorAll(".model-chip.selected"),
      ].map((chip) => {
        const id = chip.dataset.model;
        return this.models.find((m) => m.id === id);
      });

      if (selectedModels.length < 2) {
        if (window.BaelNotifications) {
          window.BaelNotifications.warning("Please select at least 2 models");
        }
        return;
      }

      // Show loading states
      const resultsContainer = this.panel.querySelector("#compare-results");
      resultsContainer.innerHTML = `
                <div class="results-grid">
                    ${selectedModels
                      .map(
                        (model) => `
                        <div class="result-card" data-model="${model.id}">
                            <div class="result-header">
                                <div class="result-model">
                                    <span class="model-dot" style="background: ${model.color};"></span>
                                    <div>
                                        <div class="model-name">${model.name}</div>
                                        <div class="model-provider">${model.provider}</div>
                                    </div>
                                </div>
                                <div class="result-stats">
                                    <span class="stat-item" id="time-${model.id}">⏱️ --</span>
                                    <span class="stat-item" id="tokens-${model.id}">📝 --</span>
                                </div>
                            </div>
                            <div class="result-content loading" id="content-${model.id}">
                                <div class="loading-spinner"></div>
                            </div>
                            <div class="result-footer">
                                <button class="result-action copy-result" data-model="${model.id}">Copy</button>
                                <button class="result-action use-result" data-model="${model.id}">Use This</button>
                            </div>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
            `;

      // Simulate API calls (in production, these would be real API calls)
      const comparison = {
        id: Date.now().toString(),
        prompt: prompt,
        models: selectedModels.map((m) => m.id),
        timestamp: Date.now(),
        results: [],
      };

      for (const model of selectedModels) {
        await this.fetchModelResponse(model, prompt, comparison);
      }

      // Save comparison
      this.comparisons.push(comparison);
      this.saveComparisons();

      // Bind result actions
      this.bindResultActions();
    }

    async fetchModelResponse(model, prompt, comparison) {
      const startTime = Date.now();
      const contentEl = this.panel.querySelector(`#content-${model.id}`);
      const timeEl = this.panel.querySelector(`#time-${model.id}`);
      const tokensEl = this.panel.querySelector(`#tokens-${model.id}`);

      try {
        // Simulate API delay (replace with actual API call)
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 + Math.random() * 2000),
        );

        // Simulated response (replace with actual API response)
        const response = this.generateSimulatedResponse(model, prompt);
        const endTime = Date.now();
        const duration = ((endTime - startTime) / 1000).toFixed(2);
        const tokens = Math.floor(response.length / 4);

        // Update UI
        contentEl.classList.remove("loading");
        contentEl.textContent = response;
        timeEl.textContent = `⏱️ ${duration}s`;
        tokensEl.textContent = `📝 ~${tokens} tokens`;

        // Save result
        comparison.results.push({
          model: model.id,
          response: response,
          duration: parseFloat(duration),
          tokens: tokens,
        });
      } catch (error) {
        contentEl.classList.remove("loading");
        contentEl.classList.add("error");
        contentEl.textContent = `Error: ${error.message}`;
      }
    }

    generateSimulatedResponse(model, prompt) {
      // This is a placeholder - in production, this would call the actual model API
      const responses = {
        "gpt-4": `[GPT-4 Response] Based on your prompt "${prompt.substring(0, 50)}...", here's a comprehensive analysis with detailed insights and structured reasoning...`,
        "gpt-4-turbo": `[GPT-4 Turbo Response] Quickly processing "${prompt.substring(0, 50)}...", I can provide a rapid yet thorough response with key points highlighted...`,
        "gpt-3.5-turbo": `[GPT-3.5 Response] Analyzing "${prompt.substring(0, 50)}...", here's a helpful response covering the main aspects of your query...`,
        "claude-3-opus": `[Claude 3 Opus Response] Taking a thoughtful approach to "${prompt.substring(0, 50)}...", I'll provide a nuanced and detailed analysis...`,
        "claude-3-sonnet": `[Claude 3 Sonnet Response] Considering "${prompt.substring(0, 50)}...", let me offer a balanced and insightful perspective...`,
        "claude-3-haiku": `[Claude 3 Haiku Response] For "${prompt.substring(0, 50)}...", here's a concise yet meaningful response...`,
        "gemini-pro": `[Gemini Pro Response] Processing "${prompt.substring(0, 50)}...", I can provide a multi-faceted analysis with practical applications...`,
        "llama-3": `[Llama 3 Response] Engaging with "${prompt.substring(0, 50)}...", here's an open and accessible exploration of the topic...`,
        "mistral-large": `[Mistral Large Response] Examining "${prompt.substring(0, 50)}...", I offer a European perspective with technical precision...`,
        local: `[Local Model Response] Processing "${prompt.substring(0, 50)}..." locally with full privacy, here's my analysis...`,
      };

      return (
        responses[model.id] ||
        `[${model.name} Response] Processing your prompt...`
      );
    }

    bindResultActions() {
      this.panel.querySelectorAll(".copy-result").forEach((btn) => {
        btn.addEventListener("click", () => {
          const modelId = btn.dataset.model;
          const content = this.panel.querySelector(
            `#content-${modelId}`,
          ).textContent;
          navigator.clipboard.writeText(content).then(() => {
            if (window.BaelNotifications) {
              window.BaelNotifications.success("Response copied!");
            }
          });
        });
      });

      this.panel.querySelectorAll(".use-result").forEach((btn) => {
        btn.addEventListener("click", () => {
          const modelId = btn.dataset.model;
          const content = this.panel.querySelector(
            `#content-${modelId}`,
          ).textContent;

          // Send to chat input
          const chatInput = document.querySelector(
            '#msg, textarea, [contenteditable="true"]',
          );
          if (chatInput) {
            if (chatInput.value !== undefined) {
              chatInput.value = content;
            } else {
              chatInput.textContent = content;
            }
            chatInput.focus();
          }

          this.closePanel();
        });
      });
    }

    loadComparison(comparison) {
      // Populate prompt
      this.panel.querySelector("#compare-prompt").value = comparison.prompt;

      // Select models
      this.panel.querySelectorAll(".model-chip").forEach((chip) => {
        chip.classList.toggle(
          "selected",
          comparison.models.includes(chip.dataset.model),
        );
      });

      // Show results if available
      if (comparison.results && comparison.results.length > 0) {
        const selectedModels = comparison.models
          .map((id) => this.models.find((m) => m.id === id))
          .filter(Boolean);
        const resultsContainer = this.panel.querySelector("#compare-results");

        resultsContainer.innerHTML = `
                    <div class="results-grid">
                        ${selectedModels
                          .map((model) => {
                            const result = comparison.results.find(
                              (r) => r.model === model.id,
                            );
                            return `
                                <div class="result-card" data-model="${model.id}">
                                    <div class="result-header">
                                        <div class="result-model">
                                            <span class="model-dot" style="background: ${model.color};"></span>
                                            <div>
                                                <div class="model-name">${model.name}</div>
                                                <div class="model-provider">${model.provider}</div>
                                            </div>
                                        </div>
                                        <div class="result-stats">
                                            <span class="stat-item">⏱️ ${result?.duration || "--"}s</span>
                                            <span class="stat-item">📝 ~${result?.tokens || "--"} tokens</span>
                                        </div>
                                    </div>
                                    <div class="result-content" id="content-${model.id}">${result?.response || "No response"}</div>
                                    <div class="result-footer">
                                        <button class="result-action copy-result" data-model="${model.id}">Copy</button>
                                        <button class="result-action use-result" data-model="${model.id}">Use This</button>
                                    </div>
                                </div>
                            `;
                          })
                          .join("")}
                    </div>
                `;

        this.bindResultActions();
      }

      this.updateCompareButton();
    }

    togglePanel() {
      this.panel.classList.toggle("visible");
    }

    closePanel() {
      this.panel.classList.remove("visible");
    }

    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }
  }

  // Initialize
  window.BaelModelCompare = new BaelModelCompare();
})();
