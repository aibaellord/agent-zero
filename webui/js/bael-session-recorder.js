/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BAEL - LORD OF ALL
 * SESSION RECORDING SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Comprehensive session capture and replay:
 * - Record entire chat sessions
 * - Playback with timeline controls
 * - Export recordings
 * - Share session recordings
 * - Annotations and bookmarks
 *
 * @version 1.0.0
 */

(function () {
  "use strict";

  class BaelSessionRecorder {
    constructor() {
      // Recording state
      this.isRecording = false;
      this.isPaused = false;
      this.currentRecording = null;
      this.recordings = new Map();

      // Playback state
      this.isPlaying = false;
      this.playbackIndex = 0;
      this.playbackSpeed = 1;
      this.currentPlayback = null;

      // Event tracking
      this.eventBuffer = [];
      this.recordingStartTime = null;

      // UI
      this.panel = null;
      this.indicator = null;
      this.isVisible = false;

      this.init();
    }

    init() {
      this.loadRecordings();
      this.createUI();
      this.createIndicator();
      this.addStyles();
      this.bindEvents();
      console.log("🎬 Bael Session Recorder initialized");
    }

    // ═════════════════════════════════════════════════════════════════
    // RECORDING
    // ═════════════════════════════════════════════════════════════════

    startRecording(name = null) {
      if (this.isRecording) return false;

      this.isRecording = true;
      this.isPaused = false;
      this.recordingStartTime = Date.now();
      this.eventBuffer = [];

      this.currentRecording = {
        id: "rec_" + Date.now().toString(36),
        name: name || `Recording ${new Date().toLocaleString()}`,
        startTime: new Date(),
        endTime: null,
        duration: 0,
        events: [],
        bookmarks: [],
        metadata: {
          userAgent: navigator.userAgent,
          screenSize: `${window.innerWidth}x${window.innerHeight}`,
          url: window.location.href,
        },
      };

      this.startEventCapture();
      this.updateIndicator();
      this.emit("recording-started", this.currentRecording);
      window.BaelNotifications?.show("Recording started", "info");

      return true;
    }

    pauseRecording() {
      if (!this.isRecording || this.isPaused) return;
      this.isPaused = true;
      this.addEvent("pause", { timestamp: Date.now() });
      this.updateIndicator();
    }

    resumeRecording() {
      if (!this.isRecording || !this.isPaused) return;
      this.isPaused = false;
      this.addEvent("resume", { timestamp: Date.now() });
      this.updateIndicator();
    }

    stopRecording() {
      if (!this.isRecording) return null;

      this.isRecording = false;
      this.isPaused = false;

      this.currentRecording.endTime = new Date();
      this.currentRecording.duration = Date.now() - this.recordingStartTime;
      this.currentRecording.events = [...this.eventBuffer];

      // Save recording
      this.recordings.set(this.currentRecording.id, this.currentRecording);
      this.saveRecordings();

      const recording = this.currentRecording;
      this.currentRecording = null;
      this.eventBuffer = [];

      this.stopEventCapture();
      this.updateIndicator();
      this.updateUI();
      this.emit("recording-stopped", recording);
      window.BaelNotifications?.show("Recording saved", "success");

      return recording;
    }

    addEvent(type, data = {}) {
      if (!this.isRecording || this.isPaused) return;

      const event = {
        type,
        timestamp: Date.now() - this.recordingStartTime,
        data,
      };

      this.eventBuffer.push(event);
    }

    addBookmark(label = "Bookmark") {
      if (!this.isRecording) return;

      const bookmark = {
        id: "bm_" + Date.now().toString(36),
        label,
        timestamp: Date.now() - this.recordingStartTime,
      };

      this.currentRecording.bookmarks.push(bookmark);
      window.BaelNotifications?.show("Bookmark added", "info");
    }

    // ═════════════════════════════════════════════════════════════════
    // EVENT CAPTURE
    // ═════════════════════════════════════════════════════════════════

    startEventCapture() {
      // Capture user messages
      this.messageObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              this.captureMessageNode(node);
            }
          });
        });
      });

      const chatContainer = document.querySelector(
        ".messages, #messages, .chat-messages",
      );
      if (chatContainer) {
        this.messageObserver.observe(chatContainer, {
          childList: true,
          subtree: true,
        });
      }

      // Capture input
      this.inputHandler = (e) => {
        if (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT") {
          this.addEvent("input", {
            value: e.target.value,
            selector: this.getSelector(e.target),
          });
        }
      };
      document.addEventListener("input", this.inputHandler);

      // Capture clicks
      this.clickHandler = (e) => {
        this.addEvent("click", {
          x: e.clientX,
          y: e.clientY,
          selector: this.getSelector(e.target),
          text: e.target.textContent?.substring(0, 50),
        });
      };
      document.addEventListener("click", this.clickHandler);

      // Capture scrolls
      this.scrollHandler = () => {
        this.addEvent("scroll", {
          x: window.scrollX,
          y: window.scrollY,
        });
      };
      document.addEventListener(
        "scroll",
        this.throttle(this.scrollHandler, 500),
      );
    }

    stopEventCapture() {
      if (this.messageObserver) {
        this.messageObserver.disconnect();
      }
      document.removeEventListener("input", this.inputHandler);
      document.removeEventListener("click", this.clickHandler);
      document.removeEventListener("scroll", this.scrollHandler);
    }

    captureMessageNode(node) {
      const isUserMessage =
        node.classList?.contains("user") || node.dataset?.role === "user";
      const isAIMessage =
        node.classList?.contains("ai") ||
        node.classList?.contains("assistant") ||
        node.dataset?.role === "assistant";

      if (isUserMessage || isAIMessage) {
        this.addEvent("message", {
          role: isUserMessage ? "user" : "assistant",
          content: node.textContent,
          html: node.innerHTML,
        });
      }
    }

    getSelector(el) {
      if (!el) return "";
      if (el.id) return `#${el.id}`;
      if (el.className) return `.${el.className.split(" ")[0]}`;
      return el.tagName.toLowerCase();
    }

    throttle(fn, wait) {
      let lastTime = 0;
      return (...args) => {
        const now = Date.now();
        if (now - lastTime >= wait) {
          lastTime = now;
          fn.apply(this, args);
        }
      };
    }

    // ═════════════════════════════════════════════════════════════════
    // PLAYBACK
    // ═════════════════════════════════════════════════════════════════

    startPlayback(recordingId) {
      const recording = this.recordings.get(recordingId);
      if (!recording) return false;

      this.isPlaying = true;
      this.currentPlayback = recording;
      this.playbackIndex = 0;

      this.showPlaybackOverlay();
      this.playNextEvent();

      return true;
    }

    playNextEvent() {
      if (!this.isPlaying || !this.currentPlayback) return;
      if (this.playbackIndex >= this.currentPlayback.events.length) {
        this.stopPlayback();
        return;
      }

      const event = this.currentPlayback.events[this.playbackIndex];
      const prevEvent = this.currentPlayback.events[this.playbackIndex - 1];

      const delay = prevEvent
        ? (event.timestamp - prevEvent.timestamp) / this.playbackSpeed
        : 0;

      setTimeout(
        () => {
          this.renderPlaybackEvent(event);
          this.updatePlaybackProgress();
          this.playbackIndex++;
          this.playNextEvent();
        },
        Math.min(delay, 3000),
      ); // Cap delay at 3 seconds
    }

    renderPlaybackEvent(event) {
      // Visual indication of events during playback
      switch (event.type) {
        case "message":
          this.showPlaybackMessage(event.data);
          break;
        case "click":
          this.showClickIndicator(event.data);
          break;
        case "input":
          this.showInputReplay(event.data);
          break;
      }
    }

    showPlaybackMessage(data) {
      const container = document.querySelector(".playback-messages");
      if (!container) return;

      const msg = document.createElement("div");
      msg.className = `playback-message ${data.role}`;
      msg.innerHTML = `
                <span class="msg-role">${data.role}</span>
                <div class="msg-content">${data.content}</div>
            `;
      container.appendChild(msg);
      container.scrollTop = container.scrollHeight;
    }

    showClickIndicator(data) {
      const indicator = document.createElement("div");
      indicator.className = "playback-click";
      indicator.style.left = `${data.x}px`;
      indicator.style.top = `${data.y}px`;
      document.body.appendChild(indicator);

      setTimeout(() => indicator.remove(), 500);
    }

    showInputReplay(data) {
      const el = document.querySelector(data.selector);
      if (el) {
        el.value = data.value;
        el.classList.add("playback-highlight");
        setTimeout(() => el.classList.remove("playback-highlight"), 500);
      }
    }

    stopPlayback() {
      this.isPlaying = false;
      this.currentPlayback = null;
      this.playbackIndex = 0;
      this.hidePlaybackOverlay();
    }

    setPlaybackSpeed(speed) {
      this.playbackSpeed = speed;
    }

    seekTo(timestamp) {
      if (!this.currentPlayback) return;

      const targetIndex = this.currentPlayback.events.findIndex(
        (e) => e.timestamp >= timestamp,
      );

      if (targetIndex >= 0) {
        this.playbackIndex = targetIndex;
      }
    }

    // ═════════════════════════════════════════════════════════════════
    // UI
    // ═════════════════════════════════════════════════════════════════

    createUI() {
      const panel = document.createElement("div");
      panel.id = "bael-recorder-panel";
      panel.className = "bael-recorder-panel";
      panel.innerHTML = this.renderPanel();
      document.body.appendChild(panel);
      this.panel = panel;
    }

    createIndicator() {
      const indicator = document.createElement("div");
      indicator.id = "bael-recording-indicator";
      indicator.className = "bael-recording-indicator";
      indicator.innerHTML = `
                <span class="rec-dot"></span>
                <span class="rec-time">00:00</span>
            `;
      document.body.appendChild(indicator);
      this.indicator = indicator;
    }

    renderPanel() {
      const recordingsList = Array.from(this.recordings.values()).sort(
        (a, b) => new Date(b.startTime) - new Date(a.startTime),
      );

      return `
                <div class="recorder-header">
                    <div class="recorder-title">
                        <span class="recorder-icon">🎬</span>
                        <span>Session Recorder</span>
                    </div>
                    <button class="recorder-close" id="recorder-close">×</button>
                </div>

                <div class="recorder-content">
                    <div class="recorder-controls">
                        ${
                          this.isRecording
                            ? `
                            <div class="recording-status">
                                <span class="status-dot active"></span>
                                <span>Recording...</span>
                                <span class="recording-time" id="recording-timer">00:00</span>
                            </div>
                            <div class="control-buttons">
                                <button class="rec-btn" id="rec-bookmark">🔖 Bookmark</button>
                                ${
                                  this.isPaused
                                    ? `<button class="rec-btn" id="rec-resume">▶️ Resume</button>`
                                    : `<button class="rec-btn" id="rec-pause">⏸️ Pause</button>`
                                }
                                <button class="rec-btn danger" id="rec-stop">⏹️ Stop</button>
                            </div>
                        `
                            : `
                            <div class="start-recording">
                                <input type="text" id="rec-name" placeholder="Recording name (optional)">
                                <button class="rec-btn primary" id="rec-start">🔴 Start Recording</button>
                            </div>
                        `
                        }
                    </div>

                    <div class="recordings-section">
                        <h4>Saved Recordings (${recordingsList.length})</h4>

                        ${
                          recordingsList.length === 0
                            ? `
                            <div class="no-recordings">
                                <span>📼</span>
                                <p>No recordings yet</p>
                            </div>
                        `
                            : `
                            <div class="recordings-list">
                                ${recordingsList
                                  .map(
                                    (r) => `
                                    <div class="recording-item" data-id="${r.id}">
                                        <div class="recording-info">
                                            <span class="recording-name">${r.name}</span>
                                            <span class="recording-meta">
                                                ${this.formatDate(r.startTime)} •
                                                ${this.formatDuration(r.duration)} •
                                                ${r.events.length} events
                                            </span>
                                        </div>
                                        <div class="recording-actions">
                                            <button class="rec-action play" data-id="${r.id}" title="Play">▶️</button>
                                            <button class="rec-action export" data-id="${r.id}" title="Export">📤</button>
                                            <button class="rec-action delete" data-id="${r.id}" title="Delete">🗑️</button>
                                        </div>
                                    </div>
                                `,
                                  )
                                  .join("")}
                            </div>
                        `
                        }
                    </div>

                    <div class="recorder-actions">
                        <button class="rec-btn" id="rec-import">📥 Import Recording</button>
                        <button class="rec-btn" id="rec-clear-all">🗑️ Clear All</button>
                    </div>
                </div>
            `;
    }

    showPlaybackOverlay() {
      const overlay = document.createElement("div");
      overlay.id = "bael-playback-overlay";
      overlay.className = "bael-playback-overlay";
      overlay.innerHTML = `
                <div class="playback-header">
                    <span>▶️ Playing: ${this.currentPlayback.name}</span>
                    <button id="playback-stop">×</button>
                </div>
                <div class="playback-messages"></div>
                <div class="playback-controls">
                    <div class="playback-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" id="playback-progress"></div>
                        </div>
                        <span class="progress-time" id="playback-time">0 / ${this.currentPlayback.events.length}</span>
                    </div>
                    <div class="speed-controls">
                        <button class="speed-btn" data-speed="0.5">0.5x</button>
                        <button class="speed-btn active" data-speed="1">1x</button>
                        <button class="speed-btn" data-speed="2">2x</button>
                        <button class="speed-btn" data-speed="5">5x</button>
                    </div>
                </div>
            `;
      document.body.appendChild(overlay);

      overlay
        .querySelector("#playback-stop")
        ?.addEventListener("click", () => this.stopPlayback());
      overlay.querySelectorAll(".speed-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.setPlaybackSpeed(parseFloat(btn.dataset.speed));
          overlay
            .querySelectorAll(".speed-btn")
            .forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
        });
      });
    }

    hidePlaybackOverlay() {
      document.getElementById("bael-playback-overlay")?.remove();
    }

    updatePlaybackProgress() {
      const fill = document.getElementById("playback-progress");
      const time = document.getElementById("playback-time");

      if (fill && this.currentPlayback) {
        const percent =
          (this.playbackIndex / this.currentPlayback.events.length) * 100;
        fill.style.width = `${percent}%`;
      }

      if (time && this.currentPlayback) {
        time.textContent = `${this.playbackIndex} / ${this.currentPlayback.events.length}`;
      }
    }

    updateIndicator() {
      if (!this.indicator) return;

      if (this.isRecording) {
        this.indicator.classList.add("visible");
        this.indicator.classList.toggle("paused", this.isPaused);
        this.startTimer();
      } else {
        this.indicator.classList.remove("visible");
        this.stopTimer();
      }
    }

    startTimer() {
      this.timerInterval = setInterval(() => {
        if (!this.isRecording) return;
        const elapsed = Date.now() - this.recordingStartTime;
        const timeEl = this.indicator.querySelector(".rec-time");
        if (timeEl) {
          timeEl.textContent = this.formatDuration(elapsed);
        }
        const panelTimer = document.getElementById("recording-timer");
        if (panelTimer) {
          panelTimer.textContent = this.formatDuration(elapsed);
        }
      }, 1000);
    }

    stopTimer() {
      clearInterval(this.timerInterval);
    }

    updateUI() {
      if (!this.panel) return;
      this.panel.innerHTML = this.renderPanel();
      this.bindPanelEvents();
    }

    addStyles() {
      if (document.getElementById("bael-recorder-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-recorder-styles";
      styles.textContent = `
                .bael-recorder-panel {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 90vw;
                    max-width: 600px;
                    max-height: 80vh;
                    background: var(--color-panel, #0f0f17);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 20px;
                    z-index: 100090;
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: 0 50px 150px rgba(0,0,0,0.8);
                }

                .bael-recorder-panel.visible {
                    display: flex;
                    animation: recorderIn 0.3s ease;
                }

                @keyframes recorderIn {
                    from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }

                .recorder-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 24px;
                    border-bottom: 1px solid var(--color-border, #252535);
                }

                .recorder-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 17px;
                    font-weight: 700;
                    color: var(--color-text, #fff);
                }

                .recorder-icon { font-size: 24px; }

                .recorder-close {
                    padding: 8px 16px;
                    background: transparent;
                    border: none;
                    color: var(--color-text-muted, #666);
                    font-size: 20px;
                    cursor: pointer;
                }

                .recorder-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px 24px;
                }

                .recorder-controls {
                    padding: 16px;
                    background: var(--color-surface, #181820);
                    border-radius: 14px;
                    margin-bottom: 20px;
                }

                .recording-status {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 12px;
                    font-size: 14px;
                    color: var(--color-text, #fff);
                }

                .status-dot {
                    width: 10px;
                    height: 10px;
                    background: #666;
                    border-radius: 50%;
                }

                .status-dot.active {
                    background: #ff3366;
                    animation: pulse 1s infinite;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }

                .recording-time {
                    margin-left: auto;
                    font-family: monospace;
                    font-size: 16px;
                    font-weight: 700;
                    color: #ff3366;
                }

                .control-buttons {
                    display: flex;
                    gap: 8px;
                }

                .rec-btn {
                    padding: 10px 16px;
                    background: var(--color-panel, #12121a);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 10px;
                    color: var(--color-text, #fff);
                    font-size: 13px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .rec-btn:hover {
                    border-color: var(--color-primary, #ff3366);
                }

                .rec-btn.primary {
                    background: var(--color-primary, #ff3366);
                    border-color: transparent;
                }

                .rec-btn.danger {
                    background: rgba(239,68,68,0.2);
                    border-color: #ef4444;
                    color: #ef4444;
                }

                .start-recording {
                    display: flex;
                    gap: 12px;
                }

                .start-recording input {
                    flex: 1;
                    padding: 10px 14px;
                    background: var(--color-panel, #12121a);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 10px;
                    color: var(--color-text, #fff);
                    font-size: 13px;
                }

                .recordings-section h4 {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--color-text-muted, #888);
                    margin-bottom: 12px;
                }

                .no-recordings {
                    text-align: center;
                    padding: 40px;
                    color: var(--color-text-muted, #666);
                }

                .no-recordings span {
                    font-size: 40px;
                    display: block;
                    margin-bottom: 10px;
                }

                .recordings-list {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                    max-height: 250px;
                    overflow-y: auto;
                }

                .recording-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px;
                    background: var(--color-surface, #181820);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 10px;
                    transition: border-color 0.2s;
                }

                .recording-item:hover {
                    border-color: var(--color-primary, #ff3366);
                }

                .recording-name {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--color-text, #fff);
                    display: block;
                    margin-bottom: 4px;
                }

                .recording-meta {
                    font-size: 11px;
                    color: var(--color-text-muted, #666);
                }

                .recording-actions {
                    display: flex;
                    gap: 6px;
                }

                .rec-action {
                    width: 32px;
                    height: 32px;
                    background: var(--color-panel, #12121a);
                    border: none;
                    border-radius: 8px;
                    font-size: 14px;
                    cursor: pointer;
                    transition: background 0.2s;
                }

                .rec-action:hover {
                    background: rgba(255,51,102,0.2);
                }

                .recorder-actions {
                    display: flex;
                    gap: 12px;
                    margin-top: 20px;
                    padding-top: 16px;
                    border-top: 1px solid var(--color-border, #252535);
                }

                /* Recording Indicator */
                .bael-recording-indicator {
                    position: fixed;
                    top: 20px;
                    left: 50%;
                    transform: translateX(-50%);
                    display: none;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    background: rgba(15,15,23,0.9);
                    border: 1px solid #ff3366;
                    border-radius: 20px;
                    z-index: 100095;
                    backdrop-filter: blur(10px);
                }

                .bael-recording-indicator.visible {
                    display: flex;
                    animation: indicatorIn 0.3s ease;
                }

                .bael-recording-indicator.paused .rec-dot {
                    animation: none;
                    background: #f59e0b;
                }

                .rec-dot {
                    width: 10px;
                    height: 10px;
                    background: #ff3366;
                    border-radius: 50%;
                    animation: pulse 1s infinite;
                }

                .rec-time {
                    font-family: monospace;
                    font-size: 13px;
                    font-weight: 600;
                    color: #fff;
                }

                /* Playback Overlay */
                .bael-playback-overlay {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 90vw;
                    max-width: 700px;
                    max-height: 80vh;
                    background: var(--color-panel, #0f0f17);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 20px;
                    z-index: 100100;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 50px 150px rgba(0,0,0,0.8);
                }

                .playback-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 14px 20px;
                    border-bottom: 1px solid var(--color-border, #252535);
                    color: var(--color-text, #fff);
                    font-size: 14px;
                    font-weight: 600;
                }

                .playback-header button {
                    background: none;
                    border: none;
                    color: var(--color-text-muted, #666);
                    font-size: 20px;
                    cursor: pointer;
                }

                .playback-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                    max-height: 400px;
                }

                .playback-message {
                    padding: 12px 16px;
                    margin-bottom: 12px;
                    border-radius: 12px;
                    animation: messageIn 0.3s ease;
                }

                .playback-message.user {
                    background: rgba(99,102,241,0.1);
                    border: 1px solid rgba(99,102,241,0.3);
                }

                .playback-message.assistant {
                    background: rgba(16,185,129,0.1);
                    border: 1px solid rgba(16,185,129,0.3);
                }

                @keyframes messageIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .msg-role {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--color-text-muted, #888);
                    text-transform: uppercase;
                    display: block;
                    margin-bottom: 6px;
                }

                .msg-content {
                    font-size: 13px;
                    color: var(--color-text, #fff);
                    line-height: 1.5;
                }

                .playback-controls {
                    padding: 16px 20px;
                    border-top: 1px solid var(--color-border, #252535);
                }

                .playback-progress {
                    margin-bottom: 12px;
                }

                .progress-bar {
                    height: 6px;
                    background: var(--color-border, #333);
                    border-radius: 3px;
                    overflow: hidden;
                    margin-bottom: 8px;
                }

                .progress-fill {
                    height: 100%;
                    background: var(--color-primary, #ff3366);
                    width: 0;
                    transition: width 0.3s;
                }

                .progress-time {
                    font-size: 11px;
                    color: var(--color-text-muted, #666);
                }

                .speed-controls {
                    display: flex;
                    gap: 8px;
                }

                .speed-btn {
                    padding: 6px 12px;
                    background: var(--color-surface, #181820);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 6px;
                    color: var(--color-text-muted, #888);
                    font-size: 12px;
                    cursor: pointer;
                }

                .speed-btn.active {
                    background: var(--color-primary, #ff3366);
                    border-color: transparent;
                    color: #fff;
                }

                /* Playback Click Indicator */
                .playback-click {
                    position: fixed;
                    width: 30px;
                    height: 30px;
                    background: rgba(255,51,102,0.5);
                    border-radius: 50%;
                    pointer-events: none;
                    z-index: 100105;
                    animation: clickRipple 0.5s ease-out forwards;
                }

                @keyframes clickRipple {
                    from { transform: scale(0); opacity: 1; }
                    to { transform: scale(2); opacity: 0; }
                }

                .playback-highlight {
                    outline: 2px solid #ff3366 !important;
                    outline-offset: 2px;
                }
            `;
      document.head.appendChild(styles);
    }

    // ═════════════════════════════════════════════════════════════════
    // UTILITIES
    // ═════════════════════════════════════════════════════════════════

    formatDuration(ms) {
      const seconds = Math.floor(ms / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);

      if (hours > 0) {
        return `${hours}:${String(minutes % 60).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
      }
      return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
    }

    formatDate(date) {
      return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    emit(event, data = {}) {
      window.dispatchEvent(
        new CustomEvent(`bael:recorder:${event}`, { detail: data }),
      );
    }

    // ═════════════════════════════════════════════════════════════════
    // EXPORT/IMPORT
    // ═════════════════════════════════════════════════════════════════

    exportRecording(id) {
      const recording = this.recordings.get(id);
      if (!recording) return;

      const blob = new Blob([JSON.stringify(recording, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${recording.name.replace(/[^a-z0-9]/gi, "_")}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }

    importRecording(file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const recording = JSON.parse(e.target.result);
          recording.id = "rec_" + Date.now().toString(36);
          recording.name += " (Imported)";
          this.recordings.set(recording.id, recording);
          this.saveRecordings();
          this.updateUI();
          window.BaelNotifications?.show("Recording imported", "success");
        } catch (err) {
          window.BaelNotifications?.show("Invalid recording file", "error");
        }
      };
      reader.readAsText(file);
    }

    deleteRecording(id) {
      this.recordings.delete(id);
      this.saveRecordings();
      this.updateUI();
    }

    // ═════════════════════════════════════════════════════════════════
    // PERSISTENCE
    // ═════════════════════════════════════════════════════════════════

    loadRecordings() {
      try {
        const saved = JSON.parse(
          localStorage.getItem("bael_recordings") || "{}",
        );
        Object.entries(saved).forEach(([id, rec]) => {
          this.recordings.set(id, rec);
        });
      } catch (e) {
        console.warn("Failed to load recordings:", e);
      }
    }

    saveRecordings() {
      localStorage.setItem(
        "bael_recordings",
        JSON.stringify(Object.fromEntries(this.recordings)),
      );
    }

    // ═════════════════════════════════════════════════════════════════
    // EVENT BINDING
    // ═════════════════════════════════════════════════════════════════

    bindEvents() {
      this.bindPanelEvents();

      // Keyboard shortcut
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "R") {
          e.preventDefault();
          this.toggle();
        }
      });
    }

    bindPanelEvents() {
      if (!this.panel) return;

      // Close
      this.panel
        .querySelector("#recorder-close")
        ?.addEventListener("click", () => this.close());

      // Start recording
      this.panel.querySelector("#rec-start")?.addEventListener("click", () => {
        const name = this.panel.querySelector("#rec-name")?.value;
        this.startRecording(name);
        this.updateUI();
      });

      // Stop recording
      this.panel.querySelector("#rec-stop")?.addEventListener("click", () => {
        this.stopRecording();
      });

      // Pause/Resume
      this.panel.querySelector("#rec-pause")?.addEventListener("click", () => {
        this.pauseRecording();
        this.updateUI();
      });

      this.panel.querySelector("#rec-resume")?.addEventListener("click", () => {
        this.resumeRecording();
        this.updateUI();
      });

      // Bookmark
      this.panel
        .querySelector("#rec-bookmark")
        ?.addEventListener("click", () => {
          this.addBookmark();
        });

      // Play
      this.panel.querySelectorAll(".rec-action.play").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.close();
          this.startPlayback(btn.dataset.id);
        });
      });

      // Export
      this.panel.querySelectorAll(".rec-action.export").forEach((btn) => {
        btn.addEventListener("click", () =>
          this.exportRecording(btn.dataset.id),
        );
      });

      // Delete
      this.panel.querySelectorAll(".rec-action.delete").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (confirm("Delete this recording?")) {
            this.deleteRecording(btn.dataset.id);
          }
        });
      });

      // Import
      this.panel.querySelector("#rec-import")?.addEventListener("click", () => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";
        input.onchange = (e) => {
          if (e.target.files[0]) {
            this.importRecording(e.target.files[0]);
          }
        };
        input.click();
      });

      // Clear all
      this.panel
        .querySelector("#rec-clear-all")
        ?.addEventListener("click", () => {
          if (confirm("Clear all recordings?")) {
            this.recordings.clear();
            this.saveRecordings();
            this.updateUI();
          }
        });
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

  window.BaelSessionRecorder = new BaelSessionRecorder();
})();
