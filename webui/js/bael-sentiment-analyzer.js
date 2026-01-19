/**
 * BAEL - LORD OF ALL
 * Sentiment Analyzer - Real-time emotion and tone detection in conversations
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelSentimentAnalyzer {
    constructor() {
      this.isVisible = false;
      this.analysisHistory = [];
      this.emotionPatterns = this.buildPatterns();
      this.init();
    }

    buildPatterns() {
      return {
        joy: {
          keywords: [
            "happy",
            "great",
            "amazing",
            "excellent",
            "wonderful",
            "fantastic",
            "love",
            "awesome",
            "perfect",
            "brilliant",
            "excited",
            "delighted",
            "thrilled",
            "😊",
            "😄",
            "🎉",
            "❤️",
            "🥰",
          ],
          weight: 1,
          color: "#4ade80",
          emoji: "😊",
        },
        anger: {
          keywords: [
            "angry",
            "furious",
            "annoyed",
            "frustrated",
            "hate",
            "terrible",
            "awful",
            "stupid",
            "ridiculous",
            "unacceptable",
            "😠",
            "😡",
            "🤬",
          ],
          weight: 1,
          color: "#ef4444",
          emoji: "😠",
        },
        sadness: {
          keywords: [
            "sad",
            "disappointed",
            "unhappy",
            "sorry",
            "unfortunately",
            "regret",
            "miss",
            "depressed",
            "upset",
            "😢",
            "😭",
            "💔",
          ],
          weight: 1,
          color: "#60a5fa",
          emoji: "😢",
        },
        fear: {
          keywords: [
            "worried",
            "scared",
            "afraid",
            "nervous",
            "anxious",
            "concerned",
            "terrified",
            "panic",
            "😰",
            "😱",
            "😨",
          ],
          weight: 1,
          color: "#a855f7",
          emoji: "😰",
        },
        surprise: {
          keywords: [
            "wow",
            "amazing",
            "unexpected",
            "shocked",
            "surprised",
            "incredible",
            "unbelievable",
            "😮",
            "😲",
            "🤯",
          ],
          weight: 0.8,
          color: "#f97316",
          emoji: "😮",
        },
        curiosity: {
          keywords: [
            "how",
            "why",
            "what",
            "when",
            "where",
            "who",
            "interesting",
            "wonder",
            "curious",
            "🤔",
            "❓",
          ],
          weight: 0.6,
          color: "#06b6d4",
          emoji: "🤔",
        },
        confidence: {
          keywords: [
            "definitely",
            "certainly",
            "absolutely",
            "sure",
            "confident",
            "guarantee",
            "must",
            "will",
            "clearly",
          ],
          weight: 0.7,
          color: "#22c55e",
          emoji: "💪",
        },
        uncertainty: {
          keywords: [
            "maybe",
            "perhaps",
            "possibly",
            "might",
            "could",
            "unsure",
            "unclear",
            "not sure",
            "think",
          ],
          weight: 0.5,
          color: "#94a3b8",
          emoji: "🤷",
        },
      };
    }

    init() {
      this.createUI();
      this.bindEvents();
      this.observeMessages();
      console.log("🎭 Bael Sentiment Analyzer initialized");
    }

    createUI() {
      const styles = document.createElement("style");
      styles.id = "bael-sentiment-styles";
      styles.textContent = `
                .bael-sentiment-widget {
                    position: fixed;
                    top: 80px;
                    right: 20px;
                    width: 260px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 14px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                    z-index: 7000;
                    overflow: hidden;
                    transform: translateX(300px);
                    opacity: 0;
                    transition: all 0.3s ease;
                }

                .bael-sentiment-widget.visible {
                    transform: translateX(0);
                    opacity: 1;
                }

                .bael-sentiment-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 14px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .bael-sentiment-title {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .bael-sentiment-close {
                    width: 26px;
                    height: 26px;
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    font-size: 12px;
                }

                .bael-sentiment-close:hover {
                    background: #ff4444;
                    color: #fff;
                    border-color: #ff4444;
                }

                .bael-sentiment-content {
                    padding: 14px;
                }

                .bael-current-mood {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    padding: 16px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border-radius: 10px;
                    margin-bottom: 14px;
                }

                .bael-mood-emoji {
                    font-size: 48px;
                    animation: bael-pulse-mood 2s ease infinite;
                }

                @keyframes bael-pulse-mood {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }

                .bael-mood-info {
                    text-align: left;
                }

                .bael-mood-label {
                    font-size: 18px;
                    font-weight: 700;
                    color: var(--bael-text-primary, #fff);
                    text-transform: capitalize;
                }

                .bael-mood-score {
                    font-size: 11px;
                    color: var(--bael-text-muted, #888);
                    margin-top: 2px;
                }

                .bael-emotion-bars {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .bael-emotion-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .bael-emotion-icon {
                    font-size: 16px;
                    width: 24px;
                    text-align: center;
                }

                .bael-emotion-name {
                    width: 70px;
                    font-size: 11px;
                    color: var(--bael-text-muted, #888);
                    text-transform: capitalize;
                }

                .bael-emotion-bar-bg {
                    flex: 1;
                    height: 8px;
                    background: var(--bael-border, #2a2a3a);
                    border-radius: 4px;
                    overflow: hidden;
                }

                .bael-emotion-bar-fill {
                    height: 100%;
                    border-radius: 4px;
                    transition: width 0.5s ease;
                }

                .bael-emotion-value {
                    width: 30px;
                    font-size: 10px;
                    color: var(--bael-text-muted, #888);
                    text-align: right;
                }

                .bael-sentiment-footer {
                    padding: 10px 14px;
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                    display: flex;
                    justify-content: space-between;
                    font-size: 10px;
                    color: var(--bael-text-muted, #666);
                }

                .bael-sentiment-trigger {
                    position: fixed;
                    top: 80px;
                    right: 20px;
                    width: 44px;
                    height: 44px;
                    background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
                    border: none;
                    border-radius: 12px;
                    color: #fff;
                    font-size: 20px;
                    cursor: pointer;
                    box-shadow: 0 4px 16px rgba(139, 92, 246, 0.4);
                    z-index: 6999;
                    transition: all 0.3s ease;
                }

                .bael-sentiment-trigger:hover {
                    transform: scale(1.08);
                    box-shadow: 0 6px 24px rgba(139, 92, 246, 0.5);
                }

                .bael-sentiment-trigger.hidden {
                    opacity: 0;
                    pointer-events: none;
                }

                /* Message sentiment badges */
                .bael-msg-sentiment {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    padding: 2px 8px;
                    background: rgba(139, 92, 246, 0.1);
                    border: 1px solid rgba(139, 92, 246, 0.2);
                    border-radius: 12px;
                    font-size: 10px;
                    margin-top: 6px;
                }
            `;
      document.head.appendChild(styles);

      // Trigger button
      this.trigger = document.createElement("button");
      this.trigger.className = "bael-sentiment-trigger";
      this.trigger.innerHTML = "🎭";
      this.trigger.title = "Sentiment Analysis";
      document.body.appendChild(this.trigger);

      // Widget
      this.widget = document.createElement("div");
      this.widget.className = "bael-sentiment-widget";
      this.widget.innerHTML = `
                <div class="bael-sentiment-header">
                    <div class="bael-sentiment-title">
                        <span>🎭</span>
                        <span>Sentiment Analysis</span>
                    </div>
                    <button class="bael-sentiment-close">✕</button>
                </div>
                <div class="bael-sentiment-content">
                    <div class="bael-current-mood">
                        <div class="bael-mood-emoji">😐</div>
                        <div class="bael-mood-info">
                            <div class="bael-mood-label">Neutral</div>
                            <div class="bael-mood-score">Analyzing...</div>
                        </div>
                    </div>
                    <div class="bael-emotion-bars" id="sentiment-bars">
                        ${this.renderEmotionBars({})}
                    </div>
                </div>
                <div class="bael-sentiment-footer">
                    <span>Messages analyzed: <strong id="msg-count">0</strong></span>
                    <span id="last-update">Just now</span>
                </div>
            `;
      document.body.appendChild(this.widget);
    }

    renderEmotionBars(scores) {
      return Object.entries(this.emotionPatterns)
        .map(([emotion, data]) => {
          const score = scores[emotion] || 0;
          const percentage = Math.round(score * 100);
          return `
                    <div class="bael-emotion-row">
                        <span class="bael-emotion-icon">${data.emoji}</span>
                        <span class="bael-emotion-name">${emotion}</span>
                        <div class="bael-emotion-bar-bg">
                            <div class="bael-emotion-bar-fill" style="width: ${percentage}%; background: ${data.color}"></div>
                        </div>
                        <span class="bael-emotion-value">${percentage}%</span>
                    </div>
                `;
        })
        .join("");
    }

    bindEvents() {
      this.trigger.addEventListener("click", () => this.toggle());
      this.widget
        .querySelector(".bael-sentiment-close")
        .addEventListener("click", () => this.hide());
    }

    toggle() {
      if (this.isVisible) {
        this.hide();
      } else {
        this.show();
      }
    }

    show() {
      this.isVisible = true;
      this.widget.classList.add("visible");
      this.trigger.classList.add("hidden");
      this.analyzeAllMessages();
    }

    hide() {
      this.isVisible = false;
      this.widget.classList.remove("visible");
      this.trigger.classList.remove("hidden");
    }

    observeMessages() {
      const observer = new MutationObserver(() => {
        if (this.isVisible) {
          this.analyzeAllMessages();
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    analyzeText(text) {
      if (!text) return {};

      const lowerText = text.toLowerCase();
      const scores = {};
      let totalScore = 0;

      for (const [emotion, data] of Object.entries(this.emotionPatterns)) {
        let emotionScore = 0;
        for (const keyword of data.keywords) {
          const regex = new RegExp(keyword.toLowerCase(), "gi");
          const matches = lowerText.match(regex);
          if (matches) {
            emotionScore += matches.length * data.weight;
          }
        }
        scores[emotion] = emotionScore;
        totalScore += emotionScore;
      }

      // Normalize scores
      if (totalScore > 0) {
        for (const emotion in scores) {
          scores[emotion] = scores[emotion] / totalScore;
        }
      }

      return scores;
    }

    analyzeAllMessages() {
      const messages = document.querySelectorAll(
        '.message-content, .chat-message, [class*="message"]',
      );
      let combinedText = "";
      let msgCount = 0;

      messages.forEach((msg) => {
        const text = msg.textContent || "";
        if (text.trim().length > 0) {
          combinedText += " " + text;
          msgCount++;
        }
      });

      if (combinedText.length > 0) {
        const scores = this.analyzeText(combinedText);
        this.updateDisplay(scores, msgCount);
      }
    }

    updateDisplay(scores, msgCount) {
      // Find dominant emotion
      let dominant = { emotion: "neutral", score: 0 };
      for (const [emotion, score] of Object.entries(scores)) {
        if (score > dominant.score) {
          dominant = { emotion, score };
        }
      }

      // Update mood display
      const moodEmoji = this.widget.querySelector(".bael-mood-emoji");
      const moodLabel = this.widget.querySelector(".bael-mood-label");
      const moodScore = this.widget.querySelector(".bael-mood-score");

      const pattern = this.emotionPatterns[dominant.emotion];
      if (pattern && dominant.score > 0.1) {
        moodEmoji.textContent = pattern.emoji;
        moodLabel.textContent = dominant.emotion;
        moodLabel.style.color = pattern.color;
        moodScore.textContent = `${Math.round(dominant.score * 100)}% confidence`;
      } else {
        moodEmoji.textContent = "😐";
        moodLabel.textContent = "Neutral";
        moodLabel.style.color = "#94a3b8";
        moodScore.textContent = "Balanced tone detected";
      }

      // Update bars
      const barsContainer = this.widget.querySelector("#sentiment-bars");
      barsContainer.innerHTML = this.renderEmotionBars(scores);

      // Update footer
      this.widget.querySelector("#msg-count").textContent = msgCount;
      this.widget.querySelector("#last-update").textContent = "Updated now";

      // Store in history
      this.analysisHistory.push({
        timestamp: Date.now(),
        scores,
        dominant: dominant.emotion,
      });

      // Keep only last 100 analyses
      if (this.analysisHistory.length > 100) {
        this.analysisHistory = this.analysisHistory.slice(-100);
      }
    }

    // Public API
    getLastAnalysis() {
      return this.analysisHistory[this.analysisHistory.length - 1] || null;
    }

    getDominantEmotion() {
      const last = this.getLastAnalysis();
      return last ? last.dominant : "neutral";
    }
  }

  // Initialize
  window.BaelSentimentAnalyzer = new BaelSentimentAnalyzer();
})();
