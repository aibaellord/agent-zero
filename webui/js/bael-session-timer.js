/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █  ███████╗███████╗███████╗███████╗██╗ ██████╗ ███╗   ██╗                  █
 * █  ██╔════╝██╔════╝██╔════╝██╔════╝██║██╔═══██╗████╗  ██║                  █
 * █  ███████╗█████╗  ███████╗███████╗██║██║   ██║██╔██╗ ██║                  █
 * █  ╚════██║██╔══╝  ╚════██║╚════██║██║██║   ██║██║╚██╗██║                  █
 * █  ███████║███████╗███████║███████║██║╚██████╔╝██║ ╚████║                  █
 * █  ╚══════╝╚══════╝╚══════╝╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═══╝                  █
 * █   ████████╗██╗███╗   ███╗███████╗██████╗                                 █
 * █   ╚══██╔══╝██║████╗ ████║██╔════╝██╔══██╗                                █
 * █      ██║   ██║██╔████╔██║█████╗  ██████╔╝                                █
 * █      ██║   ██║██║╚██╔╝██║██╔══╝  ██╔══██╗                                █
 * █      ██║   ██║██║ ╚═╝ ██║███████╗██║  ██║                                █
 * █      ╚═╝   ╚═╝╚═╝     ╚═╝╚══════╝╚═╝  ╚═╝                                █
 * █                                                                          █
 * █   BAEL SESSION TIMER - Track Session Duration & Take Breaks             █
 * █   Session tracking, break reminders, and productivity insights          █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  class BaelSessionTimer {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.sessionStart = Date.now();
      this.totalActiveTime = 0;
      this.lastActivity = Date.now();
      this.isIdle = false;
      this.idleThreshold = 2 * 60 * 1000; // 2 minutes
      this.breakInterval = 25 * 60 * 1000; // 25 minutes (Pomodoro)
      this.breakDuration = 5 * 60 * 1000; // 5 minutes
      this.lastBreakReminder = 0;
      this.storageKey = "bael-session-timer";
      this.timerInterval = null;
      this.messageCount = 0;
    }

    async initialize() {
      console.log("⏱️ Bael Session Timer initializing...");

      this.loadFromStorage();
      this.injectStyles();
      this.createWidget();
      this.startTimer();
      this.setupActivityTracking();
      this.setupBreakReminders();

      this.initialized = true;
      console.log("✅ BAEL SESSION TIMER READY");

      return this;
    }

    injectStyles() {
      if (document.getElementById("bael-session-timer-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-session-timer-styles";
      styles.textContent = `
                .bael-timer-widget {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 8px 14px;
                    background: rgba(18, 18, 26, 0.9);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                    z-index: 9300;
                    cursor: pointer;
                    transition: all 0.3s;
                }

                .bael-timer-widget:hover {
                    background: rgba(30, 30, 45, 0.95);
                    border-color: rgba(255, 255, 255, 0.2);
                }

                .timer-icon {
                    font-size: 14px;
                }

                .timer-display {
                    font-size: 13px;
                    font-weight: 600;
                    color: #fff;
                    font-family: 'SF Mono', monospace;
                }

                .timer-status {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #10b981;
                }

                .timer-status.idle {
                    background: #f59e0b;
                }

                /* Timer Panel */
                .bael-timer-panel {
                    position: fixed;
                    top: 70px;
                    right: 20px;
                    width: 300px;
                    background: #12121a;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                    z-index: 9400;
                    display: none;
                    overflow: hidden;
                }

                .bael-timer-panel.visible {
                    display: block;
                    animation: timerPanelIn 0.2s ease-out;
                }

                @keyframes timerPanelIn {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .timer-panel-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px 16px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .timer-panel-title {
                    font-size: 14px;
                    font-weight: 700;
                    color: #fff;
                }

                .timer-panel-close {
                    width: 28px;
                    height: 28px;
                    border-radius: 8px;
                    border: none;
                    background: transparent;
                    color: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                }

                .timer-panel-close:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                }

                .timer-panel-content {
                    padding: 16px;
                }

                /* Big Timer Display */
                .timer-big-display {
                    text-align: center;
                    padding: 20px;
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 12px;
                    margin-bottom: 16px;
                }

                .timer-big-time {
                    font-size: 36px;
                    font-weight: 700;
                    font-family: 'SF Mono', monospace;
                    color: #fff;
                }

                .timer-big-label {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.4);
                    margin-top: 4px;
                }

                /* Stats Grid */
                .timer-stats {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                    margin-bottom: 16px;
                }

                .timer-stat {
                    padding: 12px;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 10px;
                    text-align: center;
                }

                .timer-stat-value {
                    font-size: 20px;
                    font-weight: 700;
                    color: #a5b4fc;
                }

                .timer-stat-label {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.4);
                    margin-top: 2px;
                }

                /* Break Progress */
                .break-progress {
                    padding: 12px;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 10px;
                    margin-bottom: 16px;
                }

                .break-progress-label {
                    display: flex;
                    justify-content: space-between;
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.6);
                    margin-bottom: 8px;
                }

                .break-progress-bar {
                    height: 6px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 3px;
                    overflow: hidden;
                }

                .break-progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #10b981, #34d399);
                    transition: width 0.5s;
                }

                /* Actions */
                .timer-actions {
                    display: flex;
                    gap: 8px;
                }

                .timer-action-btn {
                    flex: 1;
                    padding: 10px;
                    border-radius: 8px;
                    border: none;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .timer-action-btn.primary {
                    background: linear-gradient(135deg, #6366f1, #8b5cf6);
                    color: #fff;
                }

                .timer-action-btn.secondary {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: #fff;
                }

                .timer-action-btn:hover {
                    opacity: 0.9;
                }

                /* Break Reminder Modal */
                .break-reminder-modal {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 350px;
                    background: linear-gradient(135deg, #12121a, #1a1a2e);
                    border: 1px solid rgba(16, 185, 129, 0.3);
                    border-radius: 20px;
                    padding: 30px;
                    z-index: 9900;
                    text-align: center;
                    display: none;
                    box-shadow: 0 40px 100px rgba(0, 0, 0, 0.6), 0 0 50px rgba(16, 185, 129, 0.15);
                }

                .break-reminder-modal.visible {
                    display: block;
                    animation: breakIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }

                @keyframes breakIn {
                    from {
                        opacity: 0;
                        transform: translate(-50%, -50%) scale(0.9);
                    }
                    to {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                    }
                }

                .break-icon {
                    font-size: 50px;
                    margin-bottom: 16px;
                }

                .break-title {
                    font-size: 20px;
                    font-weight: 700;
                    color: #fff;
                    margin-bottom: 10px;
                }

                .break-text {
                    font-size: 14px;
                    color: rgba(255, 255, 255, 0.6);
                    margin-bottom: 20px;
                    line-height: 1.5;
                }

                .break-actions {
                    display: flex;
                    gap: 10px;
                    justify-content: center;
                }

                .break-btn {
                    padding: 12px 24px;
                    border-radius: 10px;
                    border: none;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                }

                .break-btn.primary {
                    background: linear-gradient(135deg, #10b981, #34d399);
                    color: #fff;
                }

                .break-btn.secondary {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.15);
                    color: #fff;
                }

                .break-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(5px);
                    z-index: 9899;
                    display: none;
                }

                .break-overlay.visible {
                    display: block;
                }
            `;
      document.head.appendChild(styles);
    }

    createWidget() {
      // Main widget
      this.widget = document.createElement("div");
      this.widget.className = "bael-timer-widget";
      this.widget.onclick = () => this.togglePanel();
      document.body.appendChild(this.widget);

      // Panel
      this.panel = document.createElement("div");
      this.panel.className = "bael-timer-panel";
      document.body.appendChild(this.panel);

      // Break reminder overlay
      this.breakOverlay = document.createElement("div");
      this.breakOverlay.className = "break-overlay";
      document.body.appendChild(this.breakOverlay);

      // Break reminder modal
      this.breakModal = document.createElement("div");
      this.breakModal.className = "break-reminder-modal";
      document.body.appendChild(this.breakModal);
    }

    startTimer() {
      this.updateWidget();
      this.timerInterval = setInterval(() => {
        if (!this.isIdle) {
          this.totalActiveTime += 1000;
        }
        this.updateWidget();
        this.checkBreakReminder();
      }, 1000);
    }

    updateWidget() {
      const elapsed = Date.now() - this.sessionStart;

      this.widget.innerHTML = `
                <span class="timer-icon">⏱️</span>
                <span class="timer-display">${this.formatTime(elapsed)}</span>
                <span class="timer-status ${this.isIdle ? "idle" : ""}"></span>
            `;
    }

    togglePanel() {
      const isVisible = this.panel.classList.contains("visible");
      if (isVisible) {
        this.panel.classList.remove("visible");
      } else {
        this.renderPanel();
        this.panel.classList.add("visible");
      }
    }

    renderPanel() {
      const elapsed = Date.now() - this.sessionStart;
      const timeSinceBreak = Date.now() - this.lastBreakReminder;
      const breakProgress = Math.min(
        100,
        (timeSinceBreak / this.breakInterval) * 100,
      );
      const timeUntilBreak = Math.max(0, this.breakInterval - timeSinceBreak);

      this.panel.innerHTML = `
                <div class="timer-panel-header">
                    <span class="timer-panel-title">⏱️ Session Timer</span>
                    <button class="timer-panel-close" onclick="BaelSessionTimer.hidePanel()">✕</button>
                </div>
                <div class="timer-panel-content">
                    <div class="timer-big-display">
                        <div class="timer-big-time">${this.formatTime(elapsed)}</div>
                        <div class="timer-big-label">Session Duration</div>
                    </div>

                    <div class="timer-stats">
                        <div class="timer-stat">
                            <div class="timer-stat-value">${this.formatTime(this.totalActiveTime)}</div>
                            <div class="timer-stat-label">Active Time</div>
                        </div>
                        <div class="timer-stat">
                            <div class="timer-stat-value">${this.messageCount}</div>
                            <div class="timer-stat-label">Messages</div>
                        </div>
                    </div>

                    <div class="break-progress">
                        <div class="break-progress-label">
                            <span>Next Break</span>
                            <span>${this.formatTime(timeUntilBreak)}</span>
                        </div>
                        <div class="break-progress-bar">
                            <div class="break-progress-fill" style="width: ${breakProgress}%"></div>
                        </div>
                    </div>

                    <div class="timer-actions">
                        <button class="timer-action-btn secondary" onclick="BaelSessionTimer.resetSession()">
                            🔄 Reset
                        </button>
                        <button class="timer-action-btn primary" onclick="BaelSessionTimer.takeBreak()">
                            ☕ Take Break
                        </button>
                    </div>
                </div>
            `;
    }

    hidePanel() {
      this.panel.classList.remove("visible");
    }

    setupActivityTracking() {
      const updateActivity = () => {
        this.lastActivity = Date.now();
        if (this.isIdle) {
          this.isIdle = false;
          this.updateWidget();
        }
      };

      document.addEventListener("mousemove", updateActivity);
      document.addEventListener("keydown", updateActivity);
      document.addEventListener("click", updateActivity);
      document.addEventListener("scroll", updateActivity);

      // Check for idle
      setInterval(() => {
        if (
          Date.now() - this.lastActivity > this.idleThreshold &&
          !this.isIdle
        ) {
          this.isIdle = true;
          this.updateWidget();
        }
      }, 10000);

      // Track messages
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.addedNodes.length) {
            mutation.addedNodes.forEach((node) => {
              if (
                node.classList?.contains("message") ||
                node.classList?.contains("chat-message")
              ) {
                this.messageCount++;
              }
            });
          }
        });
      });

      observer.observe(document.body, { childList: true, subtree: true });
    }

    setupBreakReminders() {
      this.lastBreakReminder = Date.now();
    }

    checkBreakReminder() {
      const timeSinceBreak = Date.now() - this.lastBreakReminder;

      if (timeSinceBreak >= this.breakInterval) {
        this.showBreakReminder();
      }
    }

    showBreakReminder() {
      this.breakOverlay.classList.add("visible");
      this.breakModal.classList.add("visible");

      this.breakModal.innerHTML = `
                <div class="break-icon">☕</div>
                <div class="break-title">Time for a Break!</div>
                <div class="break-text">
                    You've been working for ${this.formatTime(this.breakInterval)}.<br>
                    Take a 5-minute break to stay fresh and productive.
                </div>
                <div class="break-actions">
                    <button class="break-btn secondary" onclick="BaelSessionTimer.skipBreak()">
                        Skip
                    </button>
                    <button class="break-btn primary" onclick="BaelSessionTimer.takeBreak()">
                        Take Break
                    </button>
                </div>
            `;
    }

    hideBreakReminder() {
      this.breakOverlay.classList.remove("visible");
      this.breakModal.classList.remove("visible");
    }

    takeBreak() {
      this.lastBreakReminder = Date.now();
      this.hideBreakReminder();
      this.showToast("☕ Enjoy your break! Timer paused.");
      this.saveToStorage();
    }

    skipBreak() {
      this.lastBreakReminder = Date.now();
      this.hideBreakReminder();
    }

    resetSession() {
      this.sessionStart = Date.now();
      this.totalActiveTime = 0;
      this.messageCount = 0;
      this.lastBreakReminder = Date.now();
      this.saveToStorage();
      this.renderPanel();
      this.showToast("🔄 Session reset!");
    }

    formatTime(ms) {
      const seconds = Math.floor(ms / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);

      if (hours > 0) {
        return `${hours}:${String(minutes % 60).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
      }
      return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
    }

    showToast(message) {
      const toast = document.createElement("div");
      toast.style.cssText = `
                position: fixed;
                bottom: 80px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(16, 185, 129, 0.9);
                color: #fff;
                padding: 12px 24px;
                border-radius: 10px;
                font-size: 14px;
                z-index: 9999;
            `;
      toast.textContent = message;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2500);
    }

    saveToStorage() {
      try {
        localStorage.setItem(
          this.storageKey,
          JSON.stringify({
            sessionStart: this.sessionStart,
            totalActiveTime: this.totalActiveTime,
            messageCount: this.messageCount,
            lastBreakReminder: this.lastBreakReminder,
          }),
        );
      } catch (e) {
        console.error("Failed to save timer:", e);
      }
    }

    loadFromStorage() {
      try {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          const data = JSON.parse(saved);
          // Only restore if session is recent (within 1 hour)
          if (Date.now() - data.sessionStart < 3600000) {
            this.sessionStart = data.sessionStart;
            this.totalActiveTime = data.totalActiveTime || 0;
            this.messageCount = data.messageCount || 0;
            this.lastBreakReminder = data.lastBreakReminder || Date.now();
          }
        }
      } catch (e) {
        console.error("Failed to load timer:", e);
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  window.BaelSessionTimer = new BaelSessionTimer();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelSessionTimer.initialize();
    });
  } else {
    window.BaelSessionTimer.initialize();
  }

  console.log("⏱️ Bael Session Timer loaded");
})();
