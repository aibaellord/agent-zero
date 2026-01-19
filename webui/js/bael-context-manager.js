/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BAEL - LORD OF ALL
 * CONTEXT WINDOW MANAGER
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Intelligent context window management:
 * - Token counting and estimation
 * - Context compression
 * - Priority-based message retention
 * - Memory optimization
 * - Context visualization
 *
 * @version 1.0.0
 */

(function () {
  "use strict";

  class BaelContextManager {
    constructor() {
      // Context limits by model
      this.modelLimits = {
        "gpt-4o": 128000,
        "gpt-4-turbo": 128000,
        "gpt-4": 8192,
        "gpt-3.5-turbo": 16384,
        "claude-3-opus": 200000,
        "claude-3-sonnet": 200000,
        "claude-3-haiku": 200000,
        "gemini-pro": 32768,
        "llama-3": 8192,
        mistral: 32768,
        default: 8192,
      };

      // Current context state
      this.currentModel = "gpt-4o";
      this.contextLimit = this.modelLimits["gpt-4o"];
      this.usedTokens = 0;
      this.messages = [];

      // Compression settings
      this.compressionSettings = {
        enabled: true,
        threshold: 0.8, // Start compression at 80% capacity
        strategy: "smart", // smart, aggressive, conservative
        preserveSystemPrompt: true,
        preserveLastN: 5,
      };

      // Priority weights
      this.priorityWeights = {
        system: 10,
        userRecent: 9,
        aiRecent: 8,
        userOld: 5,
        aiOld: 4,
        context: 3,
      };

      // Token estimation cache
      this.tokenCache = new Map();

      // UI
      this.panel = null;
      this.isVisible = false;
      this.indicator = null;

      this.init();
    }

    init() {
      this.loadSettings();
      this.createUI();
      this.createIndicator();
      this.addStyles();
      this.bindEvents();
      console.log("📊 Bael Context Manager initialized");
    }

    // ═════════════════════════════════════════════════════════════════
    // TOKEN COUNTING
    // ═════════════════════════════════════════════════════════════════

    estimateTokens(text) {
      if (!text) return 0;

      // Check cache
      const cacheKey = text.substring(0, 100) + text.length;
      if (this.tokenCache.has(cacheKey)) {
        return this.tokenCache.get(cacheKey);
      }

      // Estimation: ~4 characters per token for English
      // Adjust for code and special characters
      let tokens = 0;

      // Count words
      const words = text.split(/\s+/).filter(Boolean);
      tokens += words.length;

      // Add tokens for special characters and punctuation
      const specialChars = (text.match(/[^\w\s]/g) || []).length;
      tokens += Math.ceil(specialChars / 2);

      // Adjust for code blocks (code tends to use more tokens)
      const codeBlocks = (text.match(/```[\s\S]*?```/g) || []).length;
      tokens += codeBlocks * 10;

      // Rough adjustment
      tokens = Math.ceil(text.length / 4);

      // Cache result
      this.tokenCache.set(cacheKey, tokens);

      return tokens;
    }

    countMessageTokens(message) {
      let tokens = 0;

      // Role overhead
      tokens += 4; // Role tokens

      // Content tokens
      if (typeof message.content === "string") {
        tokens += this.estimateTokens(message.content);
      } else if (Array.isArray(message.content)) {
        message.content.forEach((part) => {
          if (part.type === "text") {
            tokens += this.estimateTokens(part.text);
          } else if (part.type === "image_url") {
            tokens += 85; // Base image token cost
          }
        });
      }

      return tokens;
    }

    calculateTotalTokens(messages) {
      let total = 0;
      messages.forEach((msg) => {
        total += this.countMessageTokens(msg);
      });
      return total;
    }

    // ═════════════════════════════════════════════════════════════════
    // CONTEXT MANAGEMENT
    // ═════════════════════════════════════════════════════════════════

    setModel(modelName) {
      this.currentModel = modelName;
      this.contextLimit =
        this.modelLimits[modelName] || this.modelLimits["default"];
      this.updateIndicator();
      this.saveSettings();
    }

    addMessage(message) {
      message.tokenCount = this.countMessageTokens(message);
      message.timestamp = new Date();
      message.priority = this.calculatePriority(message);

      this.messages.push(message);
      this.usedTokens += message.tokenCount;

      // Check if compression needed
      if (this.shouldCompress()) {
        this.compress();
      }

      this.updateIndicator();
    }

    calculatePriority(message) {
      const isRecent =
        this.messages.length < this.compressionSettings.preserveLastN;

      if (message.role === "system") {
        return this.priorityWeights.system;
      } else if (message.role === "user") {
        return isRecent
          ? this.priorityWeights.userRecent
          : this.priorityWeights.userOld;
      } else if (message.role === "assistant") {
        return isRecent
          ? this.priorityWeights.aiRecent
          : this.priorityWeights.aiOld;
      }
      return this.priorityWeights.context;
    }

    shouldCompress() {
      if (!this.compressionSettings.enabled) return false;
      const usageRatio = this.usedTokens / this.contextLimit;
      return usageRatio >= this.compressionSettings.threshold;
    }

    compress() {
      const strategy = this.compressionSettings.strategy;

      switch (strategy) {
        case "aggressive":
          this.aggressiveCompress();
          break;
        case "conservative":
          this.conservativeCompress();
          break;
        case "smart":
        default:
          this.smartCompress();
      }

      this.emit("context-compressed", {
        usedTokens: this.usedTokens,
        limit: this.contextLimit,
      });
    }

    smartCompress() {
      // Sort messages by priority (keep high priority)
      const sorted = [...this.messages].sort((a, b) => b.priority - a.priority);

      // Calculate target token count (70% of limit)
      const targetTokens = this.contextLimit * 0.7;

      const keptMessages = [];
      let currentTokens = 0;

      // Always keep system prompt
      sorted.forEach((msg) => {
        if (
          msg.role === "system" &&
          this.compressionSettings.preserveSystemPrompt
        ) {
          keptMessages.push(msg);
          currentTokens += msg.tokenCount;
        }
      });

      // Keep recent messages
      const recentMessages = this.messages.slice(
        -this.compressionSettings.preserveLastN,
      );
      recentMessages.forEach((msg) => {
        if (!keptMessages.includes(msg)) {
          keptMessages.push(msg);
          currentTokens += msg.tokenCount;
        }
      });

      // Add other messages by priority until target reached
      sorted.forEach((msg) => {
        if (
          !keptMessages.includes(msg) &&
          currentTokens + msg.tokenCount <= targetTokens
        ) {
          keptMessages.push(msg);
          currentTokens += msg.tokenCount;
        }
      });

      // Sort by original order
      keptMessages.sort((a, b) => a.timestamp - b.timestamp);

      this.messages = keptMessages;
      this.usedTokens = currentTokens;
    }

    aggressiveCompress() {
      // Keep only system prompt and last few messages
      const systemMessages = this.messages.filter((m) => m.role === "system");
      const recentMessages = this.messages.slice(
        -this.compressionSettings.preserveLastN,
      );

      this.messages = [
        ...systemMessages,
        ...recentMessages.filter((m) => m.role !== "system"),
      ];
      this.usedTokens = this.calculateTotalTokens(this.messages);
    }

    conservativeCompress() {
      // Summarize older messages instead of removing
      const cutoff =
        this.messages.length - this.compressionSettings.preserveLastN - 1;
      if (cutoff <= 0) return;

      const olderMessages = this.messages.slice(0, cutoff);
      const summary = this.summarizeMessages(olderMessages);

      // Replace older messages with summary
      const summaryMessage = {
        role: "system",
        content: `[Conversation Summary]\n${summary}`,
        tokenCount: this.estimateTokens(summary),
        timestamp: new Date(),
        priority: this.priorityWeights.context,
        isSummary: true,
      };

      this.messages = [
        ...this.messages.filter((m) => m.role === "system" && !m.isSummary),
        summaryMessage,
        ...this.messages.slice(cutoff),
      ];

      this.usedTokens = this.calculateTotalTokens(this.messages);
    }

    summarizeMessages(messages) {
      // Simple summarization (in production, use AI)
      const userMessages = messages.filter((m) => m.role === "user");
      const topics = new Set();

      userMessages.forEach((msg) => {
        const content = typeof msg.content === "string" ? msg.content : "";
        // Extract key topics (first 50 chars of each message)
        topics.add(content.substring(0, 50).trim());
      });

      return `Previous topics discussed: ${Array.from(topics).slice(0, 5).join("; ")}`;
    }

    clearContext() {
      const systemMessages = this.messages.filter(
        (m) => m.role === "system" && !m.isSummary,
      );
      this.messages = systemMessages;
      this.usedTokens = this.calculateTotalTokens(this.messages);
      this.updateIndicator();
      this.updateUI();
    }

    // ═════════════════════════════════════════════════════════════════
    // VISUALIZATION
    // ═════════════════════════════════════════════════════════════════

    getContextBreakdown() {
      const breakdown = {
        system: 0,
        user: 0,
        assistant: 0,
        other: 0,
      };

      this.messages.forEach((msg) => {
        if (breakdown[msg.role] !== undefined) {
          breakdown[msg.role] += msg.tokenCount;
        } else {
          breakdown.other += msg.tokenCount;
        }
      });

      return breakdown;
    }

    getUsagePercentage() {
      return Math.round((this.usedTokens / this.contextLimit) * 100);
    }

    getUsageColor() {
      const percentage = this.getUsagePercentage();
      if (percentage < 50) return "#10b981";
      if (percentage < 75) return "#f59e0b";
      if (percentage < 90) return "#ef4444";
      return "#dc2626";
    }

    // ═════════════════════════════════════════════════════════════════
    // UI
    // ═════════════════════════════════════════════════════════════════

    createUI() {
      const panel = document.createElement("div");
      panel.id = "bael-context-panel";
      panel.className = "bael-context-panel";
      panel.innerHTML = this.renderPanel();
      document.body.appendChild(panel);
      this.panel = panel;
    }

    createIndicator() {
      const indicator = document.createElement("div");
      indicator.id = "bael-context-indicator";
      indicator.className = "bael-context-indicator";
      indicator.innerHTML = this.renderIndicator();
      indicator.addEventListener("click", () => this.toggle());
      document.body.appendChild(indicator);
      this.indicator = indicator;
    }

    renderIndicator() {
      const percentage = this.getUsagePercentage();
      const color = this.getUsageColor();

      return `
                <div class="context-ring" style="--percentage: ${percentage}; --color: ${color}">
                    <svg viewBox="0 0 36 36">
                        <path class="context-ring-bg"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                        <path class="context-ring-fill"
                              stroke-dasharray="${percentage}, 100"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"/>
                    </svg>
                    <span class="context-percentage">${percentage}%</span>
                </div>
                <span class="context-label">Context</span>
            `;
    }

    renderPanel() {
      const breakdown = this.getContextBreakdown();
      const percentage = this.getUsagePercentage();
      const color = this.getUsageColor();

      return `
                <div class="ctx-header">
                    <div class="ctx-title">
                        <span class="ctx-icon">📊</span>
                        <span>Context Manager</span>
                    </div>
                    <button class="ctx-close" id="ctx-close">×</button>
                </div>

                <div class="ctx-content">
                    <div class="ctx-section">
                        <div class="ctx-usage">
                            <div class="ctx-usage-visual">
                                <div class="ctx-progress">
                                    <div class="ctx-progress-fill" style="width: ${percentage}%; background: ${color}"></div>
                                </div>
                                <div class="ctx-usage-text">
                                    <span class="ctx-tokens">${this.usedTokens.toLocaleString()}</span>
                                    <span class="ctx-sep">/</span>
                                    <span class="ctx-limit">${this.contextLimit.toLocaleString()}</span>
                                    <span class="ctx-unit">tokens</span>
                                </div>
                            </div>
                            <div class="ctx-usage-percentage" style="color: ${color}">${percentage}%</div>
                        </div>
                    </div>

                    <div class="ctx-section">
                        <h4>Model Selection</h4>
                        <select class="ctx-model-select" id="ctx-model">
                            ${Object.entries(this.modelLimits)
                              .filter(([k]) => k !== "default")
                              .map(
                                ([model, limit]) => `
                                <option value="${model}" ${model === this.currentModel ? "selected" : ""}>
                                    ${model} (${limit / 1000}k)
                                </option>
                            `,
                              )
                              .join("")}
                        </select>
                    </div>

                    <div class="ctx-section">
                        <h4>Token Breakdown</h4>
                        <div class="ctx-breakdown">
                            <div class="ctx-breakdown-item">
                                <span class="ctx-breakdown-label">System</span>
                                <div class="ctx-breakdown-bar">
                                    <div class="ctx-breakdown-fill system"
                                         style="width: ${(breakdown.system / this.usedTokens) * 100 || 0}%"></div>
                                </div>
                                <span class="ctx-breakdown-value">${breakdown.system}</span>
                            </div>
                            <div class="ctx-breakdown-item">
                                <span class="ctx-breakdown-label">User</span>
                                <div class="ctx-breakdown-bar">
                                    <div class="ctx-breakdown-fill user"
                                         style="width: ${(breakdown.user / this.usedTokens) * 100 || 0}%"></div>
                                </div>
                                <span class="ctx-breakdown-value">${breakdown.user}</span>
                            </div>
                            <div class="ctx-breakdown-item">
                                <span class="ctx-breakdown-label">Assistant</span>
                                <div class="ctx-breakdown-bar">
                                    <div class="ctx-breakdown-fill assistant"
                                         style="width: ${(breakdown.assistant / this.usedTokens) * 100 || 0}%"></div>
                                </div>
                                <span class="ctx-breakdown-value">${breakdown.assistant}</span>
                            </div>
                        </div>
                    </div>

                    <div class="ctx-section">
                        <h4>Compression Settings</h4>
                        <div class="ctx-settings">
                            <label class="ctx-toggle">
                                <input type="checkbox" id="ctx-compression"
                                       ${this.compressionSettings.enabled ? "checked" : ""}>
                                <span>Auto-compression</span>
                            </label>

                            <div class="ctx-setting">
                                <span>Threshold</span>
                                <select id="ctx-threshold">
                                    <option value="0.7" ${this.compressionSettings.threshold === 0.7 ? "selected" : ""}>70%</option>
                                    <option value="0.8" ${this.compressionSettings.threshold === 0.8 ? "selected" : ""}>80%</option>
                                    <option value="0.9" ${this.compressionSettings.threshold === 0.9 ? "selected" : ""}>90%</option>
                                </select>
                            </div>

                            <div class="ctx-setting">
                                <span>Strategy</span>
                                <select id="ctx-strategy">
                                    <option value="smart" ${this.compressionSettings.strategy === "smart" ? "selected" : ""}>Smart</option>
                                    <option value="aggressive" ${this.compressionSettings.strategy === "aggressive" ? "selected" : ""}>Aggressive</option>
                                    <option value="conservative" ${this.compressionSettings.strategy === "conservative" ? "selected" : ""}>Conservative</option>
                                </select>
                            </div>

                            <div class="ctx-setting">
                                <span>Preserve Last N</span>
                                <input type="number" id="ctx-preserve" min="1" max="20"
                                       value="${this.compressionSettings.preserveLastN}">
                            </div>
                        </div>
                    </div>

                    <div class="ctx-section">
                        <h4>Messages (${this.messages.length})</h4>
                        <div class="ctx-messages">
                            ${this.messages
                              .slice(-10)
                              .map(
                                (msg, i) => `
                                <div class="ctx-message ${msg.role}">
                                    <span class="ctx-msg-role">${msg.role}</span>
                                    <span class="ctx-msg-tokens">${msg.tokenCount} tokens</span>
                                    <span class="ctx-msg-priority">P${msg.priority}</span>
                                </div>
                            `,
                              )
                              .join("")}
                            ${
                              this.messages.length > 10
                                ? `
                                <p class="ctx-more">+ ${this.messages.length - 10} more messages</p>
                            `
                                : ""
                            }
                        </div>
                    </div>

                    <div class="ctx-actions">
                        <button class="ctx-btn" id="ctx-compress">Compress Now</button>
                        <button class="ctx-btn danger" id="ctx-clear">Clear Context</button>
                    </div>
                </div>
            `;
    }

    updateUI() {
      if (!this.panel) return;
      this.panel.innerHTML = this.renderPanel();
      this.bindPanelEvents();
    }

    updateIndicator() {
      if (!this.indicator) return;
      this.indicator.innerHTML = this.renderIndicator();
    }

    addStyles() {
      if (document.getElementById("bael-context-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-context-styles";
      styles.textContent = `
                .bael-context-panel {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 90vw;
                    max-width: 480px;
                    max-height: 80vh;
                    background: var(--color-panel, #0f0f17);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 20px;
                    z-index: 100074;
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: 0 40px 120px rgba(0,0,0,0.7);
                }

                .bael-context-panel.visible {
                    display: flex;
                    animation: ctxIn 0.3s ease;
                }

                @keyframes ctxIn {
                    from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }

                .ctx-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 24px;
                    border-bottom: 1px solid var(--color-border, #252535);
                }

                .ctx-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 17px;
                    font-weight: 700;
                    color: var(--color-text, #fff);
                }

                .ctx-icon { font-size: 22px; }

                .ctx-close {
                    width: 36px;
                    height: 36px;
                    background: transparent;
                    border: none;
                    color: var(--color-text-muted, #666);
                    font-size: 24px;
                    cursor: pointer;
                }

                .ctx-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px 24px;
                }

                .ctx-section {
                    margin-bottom: 24px;
                }

                .ctx-section h4 {
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--color-text-muted, #888);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 12px;
                }

                .ctx-usage {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }

                .ctx-usage-visual { flex: 1; }

                .ctx-progress {
                    height: 8px;
                    background: var(--color-border, #333);
                    border-radius: 4px;
                    overflow: hidden;
                    margin-bottom: 8px;
                }

                .ctx-progress-fill {
                    height: 100%;
                    transition: width 0.3s ease;
                }

                .ctx-usage-text {
                    font-size: 12px;
                    color: var(--color-text-muted, #888);
                }

                .ctx-tokens {
                    color: var(--color-text, #fff);
                    font-weight: 600;
                }

                .ctx-usage-percentage {
                    font-size: 32px;
                    font-weight: 700;
                }

                .ctx-model-select {
                    width: 100%;
                    padding: 12px;
                    background: var(--color-surface, #181820);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 10px;
                    color: var(--color-text, #fff);
                    font-size: 13px;
                }

                .ctx-breakdown { display: flex; flex-direction: column; gap: 12px; }

                .ctx-breakdown-item {
                    display: grid;
                    grid-template-columns: 80px 1fr 60px;
                    align-items: center;
                    gap: 12px;
                }

                .ctx-breakdown-label {
                    font-size: 12px;
                    color: var(--color-text-muted, #888);
                }

                .ctx-breakdown-bar {
                    height: 6px;
                    background: var(--color-border, #333);
                    border-radius: 3px;
                    overflow: hidden;
                }

                .ctx-breakdown-fill {
                    height: 100%;
                    transition: width 0.3s ease;
                }

                .ctx-breakdown-fill.system { background: #8b5cf6; }
                .ctx-breakdown-fill.user { background: #10b981; }
                .ctx-breakdown-fill.assistant { background: #6366f1; }

                .ctx-breakdown-value {
                    font-size: 11px;
                    color: var(--color-text-muted, #666);
                    text-align: right;
                }

                .ctx-settings { display: flex; flex-direction: column; gap: 12px; }

                .ctx-toggle {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 13px;
                    color: var(--color-text, #fff);
                }

                .ctx-setting {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .ctx-setting span {
                    font-size: 13px;
                    color: var(--color-text, #fff);
                }

                .ctx-setting select, .ctx-setting input {
                    padding: 6px 10px;
                    background: var(--color-surface, #181820);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 6px;
                    color: var(--color-text, #fff);
                    font-size: 12px;
                    width: 100px;
                }

                .ctx-messages {
                    max-height: 200px;
                    overflow-y: auto;
                }

                .ctx-message {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 8px;
                    background: var(--color-surface, #181820);
                    border-radius: 6px;
                    margin-bottom: 6px;
                    font-size: 11px;
                }

                .ctx-message.system { border-left: 3px solid #8b5cf6; }
                .ctx-message.user { border-left: 3px solid #10b981; }
                .ctx-message.assistant { border-left: 3px solid #6366f1; }

                .ctx-msg-role {
                    font-weight: 600;
                    color: var(--color-text, #fff);
                    min-width: 60px;
                }

                .ctx-msg-tokens {
                    color: var(--color-text-muted, #666);
                }

                .ctx-msg-priority {
                    margin-left: auto;
                    color: var(--color-text-muted, #555);
                }

                .ctx-more {
                    text-align: center;
                    font-size: 11px;
                    color: var(--color-text-muted, #555);
                    padding: 8px;
                }

                .ctx-actions {
                    display: flex;
                    gap: 10px;
                }

                .ctx-btn {
                    flex: 1;
                    padding: 12px;
                    background: var(--color-surface, #181820);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 10px;
                    color: var(--color-text, #fff);
                    font-size: 13px;
                    cursor: pointer;
                }

                .ctx-btn.danger {
                    border-color: #ef4444;
                    color: #ef4444;
                }

                /* Indicator */
                .bael-context-indicator {
                    position: fixed;
                    bottom: 70px;
                    right: 20px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 14px;
                    background: var(--color-surface, #181820);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 30px;
                    z-index: 100061;
                    cursor: pointer;
                }

                .context-ring {
                    width: 32px;
                    height: 32px;
                    position: relative;
                }

                .context-ring svg {
                    width: 100%;
                    height: 100%;
                    transform: rotate(-90deg);
                }

                .context-ring-bg {
                    fill: none;
                    stroke: var(--color-border, #333);
                    stroke-width: 3;
                }

                .context-ring-fill {
                    fill: none;
                    stroke: var(--color);
                    stroke-width: 3;
                    stroke-linecap: round;
                    transition: stroke-dasharray 0.3s ease;
                }

                .context-percentage {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 8px;
                    font-weight: 700;
                    color: var(--color-text, #fff);
                }

                .context-label {
                    font-size: 11px;
                    color: var(--color-text-muted, #888);
                }
            `;
      document.head.appendChild(styles);
    }

    // ═════════════════════════════════════════════════════════════════
    // EVENT BINDING
    // ═════════════════════════════════════════════════════════════════

    bindEvents() {
      this.bindPanelEvents();

      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "X") {
          e.preventDefault();
          this.toggle();
        }
      });
    }

    bindPanelEvents() {
      if (!this.panel) return;

      // Close
      this.panel
        .querySelector("#ctx-close")
        ?.addEventListener("click", () => this.close());

      // Model selection
      this.panel
        .querySelector("#ctx-model")
        ?.addEventListener("change", (e) => {
          this.setModel(e.target.value);
          this.updateUI();
        });

      // Compression toggle
      this.panel
        .querySelector("#ctx-compression")
        ?.addEventListener("change", (e) => {
          this.compressionSettings.enabled = e.target.checked;
          this.saveSettings();
        });

      // Threshold
      this.panel
        .querySelector("#ctx-threshold")
        ?.addEventListener("change", (e) => {
          this.compressionSettings.threshold = parseFloat(e.target.value);
          this.saveSettings();
        });

      // Strategy
      this.panel
        .querySelector("#ctx-strategy")
        ?.addEventListener("change", (e) => {
          this.compressionSettings.strategy = e.target.value;
          this.saveSettings();
        });

      // Preserve last N
      this.panel
        .querySelector("#ctx-preserve")
        ?.addEventListener("change", (e) => {
          this.compressionSettings.preserveLastN = parseInt(e.target.value);
          this.saveSettings();
        });

      // Compress button
      this.panel
        .querySelector("#ctx-compress")
        ?.addEventListener("click", () => {
          this.compress();
          this.updateUI();
          window.BaelNotifications?.show("Context compressed", "success");
        });

      // Clear button
      this.panel.querySelector("#ctx-clear")?.addEventListener("click", () => {
        if (confirm("Clear all context except system prompts?")) {
          this.clearContext();
          window.BaelNotifications?.show("Context cleared", "success");
        }
      });
    }

    emit(event, data = {}) {
      window.dispatchEvent(
        new CustomEvent(`bael:context:${event}`, { detail: data }),
      );
    }

    // ═════════════════════════════════════════════════════════════════
    // PERSISTENCE
    // ═════════════════════════════════════════════════════════════════

    loadSettings() {
      try {
        const saved = JSON.parse(
          localStorage.getItem("bael_context_settings") || "{}",
        );
        if (saved.currentModel) this.currentModel = saved.currentModel;
        if (saved.compressionSettings) {
          this.compressionSettings = {
            ...this.compressionSettings,
            ...saved.compressionSettings,
          };
        }
        this.contextLimit =
          this.modelLimits[this.currentModel] || this.modelLimits["default"];
      } catch (e) {
        console.warn("Failed to load context settings:", e);
      }
    }

    saveSettings() {
      localStorage.setItem(
        "bael_context_settings",
        JSON.stringify({
          currentModel: this.currentModel,
          compressionSettings: this.compressionSettings,
        }),
      );
    }

    // ═════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═════════════════════════════════════════════════════════════════

    open() {
      this.isVisible = true;
      this.updateUI();
      this.panel.classList.add("visible");
    }

    close() {
      this.isVisible = false;
      this.panel.classList.remove("visible");
    }

    toggle() {
      this.isVisible ? this.close() : this.open();
    }
  }

  window.BaelContextManager = new BaelContextManager();
})();
