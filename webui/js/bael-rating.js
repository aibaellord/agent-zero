/**
 * BAEL - LORD OF ALL
 * Response Rating - Feedback and quality tracking system
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelRating {
    constructor() {
      this.ratings = new Map();
      this.stats = null;
      this.init();
    }

    init() {
      this.loadRatings();
      this.addStyles();
      this.observeMessages();
      this.createStatsPanel();
      console.log("⭐ Bael Rating initialized");
    }

    loadRatings() {
      try {
        const saved = JSON.parse(localStorage.getItem("bael_ratings") || "{}");
        this.ratings = new Map(Object.entries(saved));
      } catch (e) {
        this.ratings = new Map();
      }
    }

    saveRatings() {
      const obj = Object.fromEntries(this.ratings);
      localStorage.setItem("bael_ratings", JSON.stringify(obj));
    }

    addStyles() {
      const styles = document.createElement("style");
      styles.id = "bael-rating-styles";
      styles.textContent = `
                /* Rating Widget */
                .bael-rating-widget {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-top: 10px;
                    padding-top: 10px;
                    border-top: 1px solid var(--bael-border, #2a2a3a);
                }

                .rating-label {
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                }

                .rating-buttons {
                    display: flex;
                    gap: 4px;
                }

                .rating-btn {
                    width: 28px;
                    height: 28px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                    opacity: 0.6;
                }

                .rating-btn:hover {
                    opacity: 1;
                    transform: scale(1.1);
                }

                .rating-btn.selected {
                    opacity: 1;
                    border-color: var(--bael-accent, #ff3366);
                }

                .rating-btn.thumbs-up.selected {
                    background: rgba(74, 222, 128, 0.2);
                    border-color: #4ade80;
                }

                .rating-btn.thumbs-down.selected {
                    background: rgba(248, 113, 113, 0.2);
                    border-color: #f87171;
                }

                .rating-feedback {
                    display: none;
                    margin-top: 8px;
                }

                .rating-feedback.visible {
                    display: block;
                }

                .feedback-input {
                    width: 100%;
                    padding: 8px 10px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 12px;
                    resize: none;
                    height: 60px;
                }

                .feedback-input::placeholder {
                    color: var(--bael-text-muted, #666);
                }

                .feedback-actions {
                    display: flex;
                    justify-content: flex-end;
                    gap: 8px;
                    margin-top: 8px;
                }

                .feedback-btn {
                    padding: 6px 12px;
                    border-radius: 6px;
                    font-size: 11px;
                    cursor: pointer;
                }

                .feedback-btn.cancel {
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    color: var(--bael-text-muted, #666);
                }

                .feedback-btn.submit {
                    background: var(--bael-accent, #ff3366);
                    border: none;
                    color: white;
                }

                /* Tags */
                .rating-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                    margin-top: 8px;
                }

                .rating-tag {
                    padding: 4px 10px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 12px;
                    font-size: 10px;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .rating-tag:hover {
                    border-color: var(--bael-accent, #ff3366);
                    color: var(--bael-text-primary, #fff);
                }

                .rating-tag.selected {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                    color: white;
                }

                /* Stats Panel */
                .bael-rating-stats {
                    position: fixed;
                    bottom: 200px;
                    right: 20px;
                    width: 280px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 16px;
                    z-index: 100015;
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
                }

                .bael-rating-stats.visible {
                    display: flex;
                    animation: statsAppear 0.2s ease;
                }

                @keyframes statsAppear {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .stats-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 14px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .stats-title {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .stats-close {
                    width: 24px;
                    height: 24px;
                    background: transparent;
                    border: none;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    font-size: 14px;
                    border-radius: 4px;
                }

                .stats-close:hover {
                    background: rgba(255, 51, 102, 0.2);
                    color: var(--bael-accent, #ff3366);
                }

                .stats-content {
                    padding: 14px;
                }

                .stats-overview {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                    margin-bottom: 14px;
                }

                .stat-card {
                    padding: 12px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-radius: 10px;
                    text-align: center;
                }

                .stat-value {
                    font-size: 24px;
                    font-weight: 700;
                    color: var(--bael-text-primary, #fff);
                }

                .stat-label {
                    font-size: 10px;
                    color: var(--bael-text-muted, #666);
                    margin-top: 4px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .satisfaction-meter {
                    margin-top: 14px;
                }

                .meter-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                }

                .meter-label {
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                }

                .meter-value {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--bael-accent, #ff3366);
                }

                .meter-bar {
                    height: 8px;
                    background: var(--bael-bg-tertiary, #181820);
                    border-radius: 4px;
                    overflow: hidden;
                }

                .meter-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #f87171, #fbbf24, #4ade80);
                    border-radius: 4px;
                    transition: width 0.3s ease;
                }

                .common-tags {
                    margin-top: 14px;
                }

                .tags-label {
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                    margin-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .tag-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                }

                .tag-item {
                    padding: 4px 10px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-radius: 10px;
                    font-size: 10px;
                    color: var(--bael-text-primary, #fff);
                }

                .tag-count {
                    margin-left: 4px;
                    color: var(--bael-text-muted, #666);
                }

                /* Stats Toggle Button */
                .bael-stats-btn {
                    position: fixed;
                    bottom: 195px;
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

                .bael-stats-btn:hover {
                    border-color: var(--bael-accent, #ff3366);
                    transform: scale(1.1);
                }

                /* Rated indicator */
                .bael-rated-indicator {
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    margin-left: 8px;
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                }

                .rated-positive {
                    color: #4ade80;
                }

                .rated-negative {
                    color: #f87171;
                }
            `;
      document.head.appendChild(styles);
    }

    observeMessages() {
      const observer = new MutationObserver(() => {
        // Add rating widgets to assistant messages
        document
          .querySelectorAll(".message.assistant:not([data-rating-widget])")
          .forEach((msg) => {
            msg.setAttribute("data-rating-widget", "true");
            this.addRatingWidget(msg);
          });
      });

      observer.observe(document.body, { childList: true, subtree: true });
    }

    addRatingWidget(messageElement) {
      const messageId = this.getMessageId(messageElement);
      const existingRating = this.ratings.get(messageId);

      const widget = document.createElement("div");
      widget.className = "bael-rating-widget";
      widget.innerHTML = `
                <span class="rating-label">Was this helpful?</span>
                <div class="rating-buttons">
                    <button class="rating-btn thumbs-up ${existingRating?.rating === "positive" ? "selected" : ""}" data-rating="positive" title="Helpful">👍</button>
                    <button class="rating-btn thumbs-down ${existingRating?.rating === "negative" ? "selected" : ""}" data-rating="negative" title="Not helpful">👎</button>
                </div>
                <div class="rating-feedback">
                    <div class="rating-tags">
                        ${this.getTagsForRating(existingRating?.rating)
                          .map(
                            (tag) =>
                              `<span class="rating-tag ${existingRating?.tags?.includes(tag) ? "selected" : ""}" data-tag="${tag}">${tag}</span>`,
                          )
                          .join("")}
                    </div>
                    <textarea class="feedback-input" placeholder="Additional feedback (optional)...">${existingRating?.feedback || ""}</textarea>
                    <div class="feedback-actions">
                        <button class="feedback-btn cancel">Cancel</button>
                        <button class="feedback-btn submit">Submit</button>
                    </div>
                </div>
            `;

      // Bind events
      const thumbsUp = widget.querySelector(".thumbs-up");
      const thumbsDown = widget.querySelector(".thumbs-down");
      const feedbackSection = widget.querySelector(".rating-feedback");
      const cancelBtn = widget.querySelector(".cancel");
      const submitBtn = widget.querySelector(".submit");
      const tags = widget.querySelectorAll(".rating-tag");
      const feedbackInput = widget.querySelector(".feedback-input");

      thumbsUp.addEventListener("click", () => {
        thumbsUp.classList.add("selected");
        thumbsDown.classList.remove("selected");
        this.updateTags(widget, "positive");
        feedbackSection.classList.add("visible");
      });

      thumbsDown.addEventListener("click", () => {
        thumbsDown.classList.add("selected");
        thumbsUp.classList.remove("selected");
        this.updateTags(widget, "negative");
        feedbackSection.classList.add("visible");
      });

      cancelBtn.addEventListener("click", () => {
        feedbackSection.classList.remove("visible");
      });

      submitBtn.addEventListener("click", () => {
        const rating = thumbsUp.classList.contains("selected")
          ? "positive"
          : thumbsDown.classList.contains("selected")
            ? "negative"
            : null;

        if (!rating) return;

        const selectedTags = [
          ...widget.querySelectorAll(".rating-tag.selected"),
        ].map((t) => t.dataset.tag);
        const feedback = feedbackInput.value.trim();

        this.submitRating(
          messageId,
          rating,
          selectedTags,
          feedback,
          messageElement,
        );
        feedbackSection.classList.remove("visible");
      });

      tags.forEach((tag) => {
        tag.addEventListener("click", () => {
          tag.classList.toggle("selected");
        });
      });

      messageElement.appendChild(widget);
    }

    getMessageId(element) {
      // Generate a unique ID based on message content
      const content = element.textContent || "";
      return "msg_" + this.hashCode(content.substring(0, 100));
    }

    hashCode(str) {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
      }
      return Math.abs(hash).toString(36);
    }

    getTagsForRating(rating) {
      if (rating === "positive") {
        return ["Accurate", "Helpful", "Clear", "Complete", "Fast"];
      } else if (rating === "negative") {
        return ["Inaccurate", "Unhelpful", "Confusing", "Incomplete", "Slow"];
      }
      return ["Accurate", "Helpful", "Clear", "Complete", "Fast"];
    }

    updateTags(widget, rating) {
      const tagsContainer = widget.querySelector(".rating-tags");
      tagsContainer.innerHTML = this.getTagsForRating(rating)
        .map(
          (tag) => `<span class="rating-tag" data-tag="${tag}">${tag}</span>`,
        )
        .join("");

      tagsContainer.querySelectorAll(".rating-tag").forEach((tag) => {
        tag.addEventListener("click", () => {
          tag.classList.toggle("selected");
        });
      });
    }

    submitRating(messageId, rating, tags, feedback, messageElement) {
      const ratingData = {
        id: messageId,
        rating: rating,
        tags: tags,
        feedback: feedback,
        timestamp: Date.now(),
        messagePreview: (messageElement.textContent || "").substring(0, 100),
      };

      this.ratings.set(messageId, ratingData);
      this.saveRatings();

      // Update UI
      this.addRatedIndicator(messageElement, rating);

      if (window.BaelNotifications) {
        window.BaelNotifications.success("Feedback submitted. Thank you!");
      }

      // Dispatch event
      window.dispatchEvent(
        new CustomEvent("bael-rating-submitted", { detail: ratingData }),
      );
    }

    addRatedIndicator(messageElement, rating) {
      const existing = messageElement.querySelector(".bael-rated-indicator");
      if (existing) existing.remove();

      const indicator = document.createElement("span");
      indicator.className = `bael-rated-indicator ${rating === "positive" ? "rated-positive" : "rated-negative"}`;
      indicator.innerHTML =
        rating === "positive" ? "✓ Helpful" : "✗ Not helpful";

      const header =
        messageElement.querySelector(".message-header") || messageElement;
      header.appendChild(indicator);
    }

    createStatsPanel() {
      // Stats button
      const button = document.createElement("button");
      button.className = "bael-stats-btn";
      button.innerHTML = "📊";
      button.title = "Rating Statistics";
      button.addEventListener("click", () => this.toggleStats());
      document.body.appendChild(button);

      // Stats panel
      const panel = document.createElement("div");
      panel.className = "bael-rating-stats";
      panel.innerHTML = this.renderStats();
      document.body.appendChild(panel);
      this.stats = panel;
    }

    renderStats() {
      const ratingsArray = [...this.ratings.values()];
      const totalRatings = ratingsArray.length;
      const positiveRatings = ratingsArray.filter(
        (r) => r.rating === "positive",
      ).length;
      const negativeRatings = ratingsArray.filter(
        (r) => r.rating === "negative",
      ).length;
      const satisfaction =
        totalRatings > 0
          ? Math.round((positiveRatings / totalRatings) * 100)
          : 0;

      // Count tags
      const tagCounts = {};
      ratingsArray.forEach((r) => {
        (r.tags || []).forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });

      const topTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      return `
                <div class="stats-header">
                    <span class="stats-title">📊 Rating Statistics</span>
                    <button class="stats-close">×</button>
                </div>
                <div class="stats-content">
                    <div class="stats-overview">
                        <div class="stat-card">
                            <div class="stat-value">${totalRatings}</div>
                            <div class="stat-label">Total Ratings</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" style="color: #4ade80;">👍 ${positiveRatings}</div>
                            <div class="stat-label">Positive</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value" style="color: #f87171;">👎 ${negativeRatings}</div>
                            <div class="stat-label">Negative</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value">${satisfaction}%</div>
                            <div class="stat-label">Satisfaction</div>
                        </div>
                    </div>

                    <div class="satisfaction-meter">
                        <div class="meter-header">
                            <span class="meter-label">Overall Satisfaction</span>
                            <span class="meter-value">${satisfaction}%</span>
                        </div>
                        <div class="meter-bar">
                            <div class="meter-fill" style="width: ${satisfaction}%;"></div>
                        </div>
                    </div>

                    ${
                      topTags.length > 0
                        ? `
                        <div class="common-tags">
                            <div class="tags-label">Top Feedback Tags</div>
                            <div class="tag-list">
                                ${topTags
                                  .map(
                                    ([tag, count]) =>
                                      `<span class="tag-item">${tag}<span class="tag-count">(${count})</span></span>`,
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

    toggleStats() {
      this.stats.classList.toggle("visible");
      if (this.stats.classList.contains("visible")) {
        this.stats.innerHTML = this.renderStats();
        this.stats
          .querySelector(".stats-close")
          .addEventListener("click", () => {
            this.stats.classList.remove("visible");
          });
      }
    }
  }

  // Initialize
  window.BaelRating = new BaelRating();
})();
