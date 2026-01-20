/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █   ██████╗██╗  ██╗ █████╗ ████████╗    ██╗███╗   ██╗███████╗             █
 * █  ██╔════╝██║  ██║██╔══██╗╚══██╔══╝    ██║████╗  ██║██╔════╝             █
 * █  ██║     ███████║███████║   ██║       ██║██╔██╗ ██║███████╗             █
 * █  ██║     ██╔══██║██╔══██║   ██║       ██║██║╚██╗██║╚════██║             █
 * █  ╚██████╗██║  ██║██║  ██║   ██║       ██║██║ ╚████║███████║             █
 * █   ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝       ╚═╝╚═╝  ╚═══╝╚══════╝             █
 * █                                                                          █
 * █   BAEL CHAT INSIGHTS - Real-time Chat Analysis & Intelligence           █
 * █   Sentiment, topics, patterns, and conversation analytics (Ctrl+Shift+I)█
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  class BaelChatInsights {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
      this.container = null;

      this.insights = {
        sentiment: { positive: 0, neutral: 0, negative: 0 },
        topics: new Map(),
        entities: new Map(),
        keywords: new Map(),
        messageStats: { total: 0, user: 0, agent: 0 },
        wordCount: 0,
        avgResponseTime: 0,
        lastAnalyzed: null,
      };

      // Sentiment keywords
      this.sentimentWords = {
        positive: [
          "great",
          "excellent",
          "awesome",
          "good",
          "thanks",
          "perfect",
          "love",
          "amazing",
          "wonderful",
          "fantastic",
          "helpful",
          "appreciate",
          "brilliant",
          "incredible",
        ],
        negative: [
          "bad",
          "error",
          "wrong",
          "issue",
          "problem",
          "fail",
          "broken",
          "terrible",
          "awful",
          "hate",
          "frustrating",
          "annoying",
          "disappointed",
          "confused",
        ],
      };

      // Topic keywords
      this.topicKeywords = {
        "Code & Programming": [
          "code",
          "function",
          "class",
          "variable",
          "debug",
          "programming",
          "script",
          "algorithm",
          "api",
          "javascript",
          "python",
        ],
        "Files & Data": [
          "file",
          "folder",
          "directory",
          "data",
          "database",
          "json",
          "csv",
          "upload",
          "download",
        ],
        "AI & Models": [
          "ai",
          "model",
          "llm",
          "gpt",
          "claude",
          "training",
          "prompt",
          "agent",
          "neural",
        ],
        "Web & Internet": [
          "web",
          "website",
          "url",
          "http",
          "browser",
          "internet",
          "html",
          "css",
          "server",
        ],
        Configuration: [
          "config",
          "settings",
          "setup",
          "install",
          "configure",
          "parameter",
          "option",
        ],
      };
    }

    async initialize() {
      console.log("💡 Bael Chat Insights initializing...");

      this.loadInsights();
      this.injectStyles();
      this.createContainer();
      this.setupShortcuts();
      this.observeChat();

      this.initialized = true;
      console.log("✅ BAEL CHAT INSIGHTS READY");

      return this;
    }

    loadInsights() {
      try {
        const saved = localStorage.getItem("bael-chat-insights");
        if (saved) {
          const data = JSON.parse(saved);
          this.insights = {
            ...this.insights,
            ...data,
            topics: new Map(data.topics || []),
            entities: new Map(data.entities || []),
            keywords: new Map(data.keywords || []),
          };
        }
      } catch (e) {}
    }

    saveInsights() {
      try {
        const data = {
          ...this.insights,
          topics: [...this.insights.topics],
          entities: [...this.insights.entities],
          keywords: [...this.insights.keywords],
        };
        localStorage.setItem("bael-chat-insights", JSON.stringify(data));
      } catch (e) {}
    }

    observeChat() {
      // Observe chat container for new messages
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1 && node.classList?.contains("message")) {
              this.analyzeMessage(node);
            }
          });
        });
      });

      // Try to find chat container
      const findAndObserve = () => {
        const chatContainer = document.querySelector(
          "#chat-messages, .chat-container, .messages",
        );
        if (chatContainer) {
          observer.observe(chatContainer, { childList: true, subtree: true });
          // Analyze existing messages
          this.analyzeExistingMessages(chatContainer);
        } else {
          setTimeout(findAndObserve, 1000);
        }
      };

      findAndObserve();
    }

    analyzeExistingMessages(container) {
      const messages = container.querySelectorAll(
        '.message, [class*="message"]',
      );
      messages.forEach((msg) => this.analyzeMessage(msg, false));
      this.saveInsights();
    }

    analyzeMessage(element, save = true) {
      const text = element.textContent?.toLowerCase() || "";
      const isUser =
        element.classList.contains("user") ||
        element.querySelector(".user-message") !== null;

      if (text.length < 3) return;

      // Update message stats
      this.insights.messageStats.total++;
      if (isUser) {
        this.insights.messageStats.user++;
      } else {
        this.insights.messageStats.agent++;
      }

      // Word count
      this.insights.wordCount += text.split(/\s+/).length;

      // Sentiment analysis
      this.analyzeSentiment(text);

      // Topic detection
      this.detectTopics(text);

      // Keyword extraction
      this.extractKeywords(text);

      this.insights.lastAnalyzed = new Date().toISOString();

      if (save) this.saveInsights();
    }

    analyzeSentiment(text) {
      let score = 0;

      this.sentimentWords.positive.forEach((word) => {
        if (text.includes(word)) score++;
      });

      this.sentimentWords.negative.forEach((word) => {
        if (text.includes(word)) score--;
      });

      if (score > 0) this.insights.sentiment.positive++;
      else if (score < 0) this.insights.sentiment.negative++;
      else this.insights.sentiment.neutral++;
    }

    detectTopics(text) {
      Object.entries(this.topicKeywords).forEach(([topic, keywords]) => {
        keywords.forEach((keyword) => {
          if (text.includes(keyword)) {
            const count = this.insights.topics.get(topic) || 0;
            this.insights.topics.set(topic, count + 1);
          }
        });
      });
    }

    extractKeywords(text) {
      // Simple keyword extraction (words > 4 chars, not common)
      const stopWords = new Set([
        "this",
        "that",
        "with",
        "have",
        "will",
        "from",
        "they",
        "what",
        "would",
        "there",
        "their",
        "been",
        "which",
        "could",
        "should",
      ]);
      const words = text
        .split(/\s+/)
        .filter((w) => w.length > 4 && !stopWords.has(w));

      words.forEach((word) => {
        const clean = word.replace(/[^a-z]/g, "");
        if (clean.length > 4) {
          const count = this.insights.keywords.get(clean) || 0;
          this.insights.keywords.set(clean, count + 1);
        }
      });
    }

    injectStyles() {
      if (document.getElementById("bael-insights-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-insights-styles";
      styles.textContent = `
                .bael-insights-panel {
                    position: fixed;
                    top: 0;
                    right: -400px;
                    width: 380px;
                    height: 100vh;
                    background: #12121a;
                    border-left: 1px solid rgba(255, 255, 255, 0.1);
                    box-shadow: -20px 0 60px rgba(0, 0, 0, 0.4);
                    z-index: 9800;
                    transition: right 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .bael-insights-panel.visible {
                    right: 0;
                }

                .insights-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 20px 24px;
                    background: rgba(255, 255, 255, 0.03);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
                }

                .insights-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .insights-title h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                    color: #fff;
                }

                .insights-close {
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    border: none;
                    background: rgba(255, 255, 255, 0.06);
                    color: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    font-size: 18px;
                    transition: all 0.2s;
                }

                .insights-close:hover {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }

                .insights-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px 24px;
                }

                .insight-section {
                    margin-bottom: 24px;
                }

                .insight-section-title {
                    font-size: 12px;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.4);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    margin-bottom: 12px;
                }

                /* Sentiment Meter */
                .sentiment-meter {
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 12px;
                    padding: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }

                .sentiment-bar {
                    height: 24px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 12px;
                    display: flex;
                    overflow: hidden;
                    margin-bottom: 12px;
                }

                .sentiment-segment {
                    height: 100%;
                    transition: width 0.5s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 11px;
                    font-weight: 600;
                    color: #fff;
                }

                .sentiment-positive {
                    background: linear-gradient(90deg, #22c55e, #4ade80);
                }

                .sentiment-neutral {
                    background: linear-gradient(90deg, #6b7280, #9ca3af);
                }

                .sentiment-negative {
                    background: linear-gradient(90deg, #ef4444, #f87171);
                }

                .sentiment-labels {
                    display: flex;
                    justify-content: space-between;
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.5);
                }

                /* Stats Grid */
                .stats-mini-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 12px;
                }

                .stat-mini {
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 10px;
                    padding: 14px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }

                .stat-mini-value {
                    font-size: 22px;
                    font-weight: 700;
                    color: #fff;
                    margin-bottom: 2px;
                }

                .stat-mini-label {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.4);
                }

                /* Topics */
                .topics-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .topic-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .topic-bar {
                    flex: 1;
                    height: 24px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 6px;
                    overflow: hidden;
                }

                .topic-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #6366f1, #8b5cf6);
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    padding: 0 10px;
                    font-size: 11px;
                    font-weight: 500;
                    color: #fff;
                    white-space: nowrap;
                    transition: width 0.5s ease;
                }

                .topic-count {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.5);
                    min-width: 30px;
                    text-align: right;
                }

                /* Keywords */
                .keywords-cloud {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .keyword-tag {
                    padding: 6px 12px;
                    background: rgba(99, 102, 241, 0.15);
                    border: 1px solid rgba(99, 102, 241, 0.3);
                    border-radius: 20px;
                    font-size: 12px;
                    color: #a5b4fc;
                    transition: all 0.2s;
                }

                .keyword-tag:hover {
                    background: rgba(99, 102, 241, 0.25);
                }

                .keyword-count {
                    margin-left: 4px;
                    opacity: 0.6;
                }

                /* Actions */
                .insights-actions {
                    padding: 16px 24px;
                    border-top: 1px solid rgba(255, 255, 255, 0.06);
                    display: flex;
                    gap: 10px;
                }

                .insight-action {
                    flex: 1;
                    padding: 10px;
                    border-radius: 8px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    background: rgba(255, 255, 255, 0.03);
                    color: rgba(255, 255, 255, 0.7);
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .insight-action:hover {
                    background: rgba(99, 102, 241, 0.2);
                    border-color: rgba(99, 102, 241, 0.4);
                    color: #fff;
                }

                /* Mini indicator */
                .insights-indicator {
                    position: fixed;
                    top: 50%;
                    right: 0;
                    transform: translateY(-50%);
                    width: 40px;
                    height: 100px;
                    background: linear-gradient(180deg, #6366f1, #8b5cf6);
                    border-radius: 10px 0 0 10px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    cursor: pointer;
                    z-index: 9799;
                    transition: all 0.3s;
                    box-shadow: -4px 0 20px rgba(99, 102, 241, 0.3);
                }

                .insights-indicator:hover {
                    width: 48px;
                }

                .insights-indicator.hidden {
                    display: none;
                }

                .insights-indicator span {
                    font-size: 20px;
                }

                .insights-indicator-label {
                    writing-mode: vertical-rl;
                    text-orientation: mixed;
                    font-size: 10px;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.9);
                    letter-spacing: 1px;
                }
            `;
      document.head.appendChild(styles);
    }

    createContainer() {
      // Create side panel
      this.container = document.createElement("div");
      this.container.id = "bael-chat-insights";
      this.container.className = "bael-insights-panel";
      document.body.appendChild(this.container);

      // Create indicator tab
      this.indicator = document.createElement("div");
      this.indicator.className = "insights-indicator";
      this.indicator.innerHTML = `
                <span>💡</span>
                <div class="insights-indicator-label">INSIGHTS</div>
            `;
      this.indicator.onclick = () => this.show();
      document.body.appendChild(this.indicator);
    }

    setupShortcuts() {
      document.addEventListener("keydown", (e) => {
        // Ctrl+Shift+I for insights
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "I") {
          e.preventDefault();
          if (this.visible) {
            this.hide();
          } else {
            this.show();
          }
        }

        // Escape to close
        if (e.key === "Escape" && this.visible) {
          this.hide();
        }
      });
    }

    show() {
      this.visible = true;
      this.render();
      this.container.classList.add("visible");
      this.indicator.classList.add("hidden");
    }

    hide() {
      this.visible = false;
      this.container.classList.remove("visible");
      this.indicator.classList.remove("hidden");
    }

    render() {
      const sentimentTotal =
        this.insights.sentiment.positive +
          this.insights.sentiment.neutral +
          this.insights.sentiment.negative || 1;

      const topTopics = [...this.insights.topics.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      const maxTopic = topTopics.length > 0 ? topTopics[0][1] : 1;

      const topKeywords = [...this.insights.keywords.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15);

      this.container.innerHTML = `
                <div class="insights-header">
                    <div class="insights-title">
                        <span style="font-size: 24px;">💡</span>
                        <h3>Chat Insights</h3>
                    </div>
                    <button class="insights-close" onclick="BaelChatInsights.hide()">✕</button>
                </div>

                <div class="insights-content">
                    <div class="insight-section">
                        <div class="insight-section-title">Conversation Stats</div>
                        <div class="stats-mini-grid">
                            <div class="stat-mini">
                                <div class="stat-mini-value">${this.insights.messageStats.total}</div>
                                <div class="stat-mini-label">Total Messages</div>
                            </div>
                            <div class="stat-mini">
                                <div class="stat-mini-value">${this.insights.wordCount.toLocaleString()}</div>
                                <div class="stat-mini-label">Words Exchanged</div>
                            </div>
                            <div class="stat-mini">
                                <div class="stat-mini-value">${this.insights.messageStats.user}</div>
                                <div class="stat-mini-label">Your Messages</div>
                            </div>
                            <div class="stat-mini">
                                <div class="stat-mini-value">${this.insights.messageStats.agent}</div>
                                <div class="stat-mini-label">Agent Responses</div>
                            </div>
                        </div>
                    </div>

                    <div class="insight-section">
                        <div class="insight-section-title">Sentiment Analysis</div>
                        <div class="sentiment-meter">
                            <div class="sentiment-bar">
                                <div class="sentiment-segment sentiment-positive"
                                     style="width: ${((this.insights.sentiment.positive / sentimentTotal) * 100).toFixed(1)}%">
                                    ${this.insights.sentiment.positive > 0 ? "😊" : ""}
                                </div>
                                <div class="sentiment-segment sentiment-neutral"
                                     style="width: ${((this.insights.sentiment.neutral / sentimentTotal) * 100).toFixed(1)}%">
                                    ${this.insights.sentiment.neutral > 0 ? "😐" : ""}
                                </div>
                                <div class="sentiment-segment sentiment-negative"
                                     style="width: ${((this.insights.sentiment.negative / sentimentTotal) * 100).toFixed(1)}%">
                                    ${this.insights.sentiment.negative > 0 ? "😟" : ""}
                                </div>
                            </div>
                            <div class="sentiment-labels">
                                <span>Positive (${this.insights.sentiment.positive})</span>
                                <span>Neutral (${this.insights.sentiment.neutral})</span>
                                <span>Negative (${this.insights.sentiment.negative})</span>
                            </div>
                        </div>
                    </div>

                    <div class="insight-section">
                        <div class="insight-section-title">Top Topics</div>
                        ${
                          topTopics.length > 0
                            ? `
                            <div class="topics-list">
                                ${topTopics
                                  .map(
                                    ([topic, count]) => `
                                    <div class="topic-item">
                                        <div class="topic-bar">
                                            <div class="topic-fill" style="width: ${(count / maxTopic) * 100}%">
                                                ${topic}
                                            </div>
                                        </div>
                                        <div class="topic-count">${count}</div>
                                    </div>
                                `,
                                  )
                                  .join("")}
                            </div>
                        `
                            : '<div style="color: rgba(255,255,255,0.4); font-size: 13px;">No topics detected yet. Keep chatting!</div>'
                        }
                    </div>

                    <div class="insight-section">
                        <div class="insight-section-title">Top Keywords</div>
                        ${
                          topKeywords.length > 0
                            ? `
                            <div class="keywords-cloud">
                                ${topKeywords
                                  .map(
                                    ([word, count]) => `
                                    <span class="keyword-tag">${word}<span class="keyword-count">${count}</span></span>
                                `,
                                  )
                                  .join("")}
                            </div>
                        `
                            : '<div style="color: rgba(255,255,255,0.4); font-size: 13px;">Keywords will appear as you chat.</div>'
                        }
                    </div>
                </div>

                <div class="insights-actions">
                    <button class="insight-action" onclick="BaelChatInsights.exportInsights()">
                        📤 Export
                    </button>
                    <button class="insight-action" onclick="BaelChatInsights.refreshInsights()">
                        🔄 Refresh
                    </button>
                    <button class="insight-action" onclick="BaelChatInsights.clearInsights()">
                        🗑️ Clear
                    </button>
                </div>
            `;
    }

    exportInsights() {
      const data = {
        exported: new Date().toISOString(),
        ...this.insights,
        topics: Object.fromEntries(this.insights.topics),
        keywords: Object.fromEntries(this.insights.keywords),
        entities: Object.fromEntries(this.insights.entities),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `chat-insights-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }

    refreshInsights() {
      const chatContainer = document.querySelector(
        "#chat-messages, .chat-container, .messages",
      );
      if (chatContainer) {
        // Reset and reanalyze
        this.insights = {
          sentiment: { positive: 0, neutral: 0, negative: 0 },
          topics: new Map(),
          entities: new Map(),
          keywords: new Map(),
          messageStats: { total: 0, user: 0, agent: 0 },
          wordCount: 0,
          avgResponseTime: 0,
          lastAnalyzed: null,
        };
        this.analyzeExistingMessages(chatContainer);
        this.render();
      }
    }

    clearInsights() {
      if (confirm("Clear all insights data?")) {
        this.insights = {
          sentiment: { positive: 0, neutral: 0, negative: 0 },
          topics: new Map(),
          entities: new Map(),
          keywords: new Map(),
          messageStats: { total: 0, user: 0, agent: 0 },
          wordCount: 0,
          avgResponseTime: 0,
          lastAnalyzed: null,
        };
        this.saveInsights();
        this.render();
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  window.BaelChatInsights = new BaelChatInsights();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelChatInsights.initialize();
    });
  } else {
    window.BaelChatInsights.initialize();
  }

  console.log("💡 Bael Chat Insights loaded");
})();
