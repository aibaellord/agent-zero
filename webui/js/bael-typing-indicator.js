/**
 * BAEL - LORD OF ALL
 * Typing Indicator - Show when agent is thinking/typing
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelTypingIndicator {
    constructor() {
      this.indicator = null;
      this.isActive = false;
      this.startTime = null;
      this.phases = [
        "Thinking",
        "Processing",
        "Analyzing",
        "Composing",
        "Generating",
      ];
      this.currentPhase = 0;
      this.phaseInterval = null;
      this.init();
    }

    init() {
      this.addStyles();
      this.createIndicator();
      this.hookIntoSystem();
      console.log("💭 Bael Typing Indicator initialized");
    }

    addStyles() {
      const styles = document.createElement("style");
      styles.id = "bael-typing-indicator-styles";
      styles.textContent = `
                /* Typing Indicator */
                .bael-typing-indicator {
                    position: fixed;
                    bottom: 100px;
                    left: 50%;
                    transform: translateX(-50%);
                    display: none;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 20px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 25px;
                    z-index: 100040;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.4);
                    animation: typingIndicatorIn 0.3s ease;
                }

                .bael-typing-indicator.visible {
                    display: flex;
                }

                @keyframes typingIndicatorIn {
                    from {
                        opacity: 0;
                        transform: translateX(-50%) translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
                    }
                }

                /* Avatar */
                .typing-avatar {
                    width: 36px;
                    height: 36px;
                    background: linear-gradient(135deg, #ff3366, #ff6b6b);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 16px;
                    animation: avatarPulse 2s infinite;
                }

                @keyframes avatarPulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }

                /* Content */
                .typing-content {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .typing-phase {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .typing-phase-text {
                    min-width: 90px;
                }

                .typing-dots {
                    display: flex;
                    gap: 4px;
                }

                .typing-dot {
                    width: 6px;
                    height: 6px;
                    background: var(--bael-accent, #ff3366);
                    border-radius: 50%;
                    animation: dotBounce 1.4s infinite;
                }

                .typing-dot:nth-child(2) {
                    animation-delay: 0.2s;
                }

                .typing-dot:nth-child(3) {
                    animation-delay: 0.4s;
                }

                @keyframes dotBounce {
                    0%, 60%, 100% {
                        transform: translateY(0);
                        opacity: 1;
                    }
                    30% {
                        transform: translateY(-6px);
                        opacity: 0.6;
                    }
                }

                .typing-time {
                    font-size: 10px;
                    color: var(--bael-text-muted, #666);
                }

                /* Brain Wave Animation */
                .typing-wave {
                    display: flex;
                    align-items: center;
                    gap: 2px;
                    margin-left: 12px;
                }

                .typing-wave-bar {
                    width: 3px;
                    height: 16px;
                    background: var(--bael-accent, #ff3366);
                    border-radius: 2px;
                    animation: waveBar 1s ease-in-out infinite;
                }

                .typing-wave-bar:nth-child(1) { animation-delay: 0s; }
                .typing-wave-bar:nth-child(2) { animation-delay: 0.1s; }
                .typing-wave-bar:nth-child(3) { animation-delay: 0.2s; }
                .typing-wave-bar:nth-child(4) { animation-delay: 0.3s; }
                .typing-wave-bar:nth-child(5) { animation-delay: 0.4s; }

                @keyframes waveBar {
                    0%, 100% {
                        height: 8px;
                        opacity: 0.5;
                    }
                    50% {
                        height: 20px;
                        opacity: 1;
                    }
                }

                /* Cancel Button */
                .typing-cancel {
                    width: 28px;
                    height: 28px;
                    background: transparent;
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 50%;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    margin-left: 8px;
                    transition: all 0.2s ease;
                }

                .typing-cancel:hover {
                    border-color: #ef4444;
                    color: #ef4444;
                }
            `;
      document.head.appendChild(styles);
    }

    createIndicator() {
      const indicator = document.createElement("div");
      indicator.className = "bael-typing-indicator";
      indicator.innerHTML = `
                <div class="typing-avatar">👑</div>
                <div class="typing-content">
                    <div class="typing-phase">
                        <span class="typing-phase-text">Thinking</span>
                        <div class="typing-dots">
                            <span class="typing-dot"></span>
                            <span class="typing-dot"></span>
                            <span class="typing-dot"></span>
                        </div>
                    </div>
                    <div class="typing-time">0s</div>
                </div>
                <div class="typing-wave">
                    <div class="typing-wave-bar"></div>
                    <div class="typing-wave-bar"></div>
                    <div class="typing-wave-bar"></div>
                    <div class="typing-wave-bar"></div>
                    <div class="typing-wave-bar"></div>
                </div>
                <button class="typing-cancel" title="Cancel">✕</button>
            `;

      indicator
        .querySelector(".typing-cancel")
        .addEventListener("click", () => {
          this.hide();
          // Emit cancel event
          document.dispatchEvent(new CustomEvent("bael-typing-cancelled"));
        });

      document.body.appendChild(indicator);
      this.indicator = indicator;
    }

    hookIntoSystem() {
      // Watch for form submissions
      document.addEventListener(
        "submit",
        (e) => {
          const input = e.target.querySelector('textarea, input[type="text"]');
          if (input && input.value.trim()) {
            this.show();
          }
        },
        true,
      );

      // Watch for fetch requests
      const originalFetch = window.fetch;
      window.fetch = async (...args) => {
        const [url] = args;

        if (
          typeof url === "string" &&
          (url.includes("/message") || url.includes("/chat"))
        ) {
          this.show();
        }

        try {
          const response = await originalFetch.apply(window, args);

          // Clone response to read it
          const cloned = response.clone();

          // Hide indicator when response comes
          if (
            typeof url === "string" &&
            (url.includes("/message") || url.includes("/chat"))
          ) {
            // For streaming responses, wait a bit
            setTimeout(() => {
              this.hide();
            }, 500);
          }

          return response;
        } catch (error) {
          this.hide();
          throw error;
        }
      };

      // Watch for streaming content
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.addedNodes.length > 0) {
            // Check if new content is being added (streaming)
            const hasNewContent = Array.from(mutation.addedNodes).some(
              (node) => {
                return (
                  node.nodeType === Node.ELEMENT_NODE &&
                  (node.matches?.(
                    '.message, .response, [x-ref="msgcont"] > div',
                  ) ||
                    node.querySelector?.(".message, .response"))
                );
              },
            );

            if (hasNewContent && this.isActive) {
              // Content is being streamed, hide after delay
              setTimeout(() => this.hide(), 1000);
            }
          }
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    show() {
      if (this.isActive) return;

      this.isActive = true;
      this.startTime = Date.now();
      this.currentPhase = 0;
      this.indicator.classList.add("visible");

      // Update time
      this.timeInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        this.indicator.querySelector(".typing-time").textContent =
          `${elapsed}s`;
      }, 1000);

      // Cycle through phases
      this.phaseInterval = setInterval(() => {
        this.currentPhase = (this.currentPhase + 1) % this.phases.length;
        this.indicator.querySelector(".typing-phase-text").textContent =
          this.phases[this.currentPhase];
      }, 2000);
    }

    hide() {
      if (!this.isActive) return;

      this.isActive = false;
      this.indicator.classList.remove("visible");

      if (this.timeInterval) {
        clearInterval(this.timeInterval);
        this.timeInterval = null;
      }

      if (this.phaseInterval) {
        clearInterval(this.phaseInterval);
        this.phaseInterval = null;
      }

      // Reset
      this.indicator.querySelector(".typing-time").textContent = "0s";
      this.indicator.querySelector(".typing-phase-text").textContent =
        this.phases[0];
    }
  }

  // Initialize
  window.BaelTypingIndicator = new BaelTypingIndicator();
})();
