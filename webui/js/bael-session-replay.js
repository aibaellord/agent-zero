/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █  ███████╗███████╗███████╗███████╗██╗ ██████╗ ███╗   ██╗                  █
 * █  ██╔════╝██╔════╝██╔════╝██╔════╝██║██╔═══██╗████╗  ██║                  █
 * █  ███████╗█████╗  ███████╗███████╗██║██║   ██║██╔██╗ ██║                  █
 * █  ╚════██║██╔══╝  ╚════██║╚════██║██║██║   ██║██║╚██╗██║                  █
 * █  ███████║███████╗███████║███████║██║╚██████╔╝██║ ╚████║                  █
 * █  ╚══════╝╚══════╝╚══════╝╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═══╝                  █
 * █                                                                          █
 * █   BAEL SESSION REPLAY - Record & Replay Sessions (Ctrl+Shift+R)         █
 * █   Record interactions and replay them for debugging or demos            █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  class BaelSessionReplay {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
      this.container = null;
      this.recordings = [];
      this.isRecording = false;
      this.isPlaying = false;
      this.currentRecording = null;
      this.recordedEvents = [];
      this.recordingStart = null;
    }

    async initialize() {
      console.log("🎬 Bael Session Replay initializing...");

      this.loadRecordings();
      this.injectStyles();
      this.createContainer();
      this.createRecordingIndicator();
      this.setupShortcuts();

      this.initialized = true;
      console.log("✅ BAEL SESSION REPLAY READY");

      return this;
    }

    loadRecordings() {
      try {
        const saved = localStorage.getItem("bael-session-recordings");
        if (saved) {
          this.recordings = JSON.parse(saved);
        }
      } catch (e) {
        this.recordings = [];
      }
    }

    saveRecordings() {
      try {
        // Only keep last 20 recordings to save space
        const toSave = this.recordings.slice(0, 20);
        localStorage.setItem("bael-session-recordings", JSON.stringify(toSave));
      } catch (e) {
        console.error("Failed to save recordings:", e);
      }
    }

    injectStyles() {
      if (document.getElementById("bael-replay-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-replay-styles";
      styles.textContent = `
                .bael-replay-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(8px);
                    z-index: 9900;
                    opacity: 0;
                    transition: opacity 0.25s ease;
                    pointer-events: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .bael-replay-overlay.visible {
                    opacity: 1;
                    pointer-events: auto;
                }

                .bael-replay-modal {
                    width: 90vw;
                    max-width: 900px;
                    max-height: 80vh;
                    background: #12121a;
                    border-radius: 16px;
                    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    transform: scale(0.95);
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .bael-replay-overlay.visible .bael-replay-modal {
                    transform: scale(1);
                }

                .replay-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 20px 24px;
                    background: rgba(255, 255, 255, 0.03);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .replay-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .replay-title h2 {
                    margin: 0;
                    font-size: 20px;
                    font-weight: 600;
                    color: #fff;
                }

                .replay-actions {
                    display: flex;
                    gap: 10px;
                }

                .replay-btn {
                    padding: 10px 18px;
                    border-radius: 8px;
                    border: none;
                    font-size: 13px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .replay-btn.record {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }

                .replay-btn.record:hover {
                    background: rgba(239, 68, 68, 0.3);
                }

                .replay-btn.record.recording {
                    background: #ef4444;
                    color: #fff;
                    animation: bael-record-pulse 1s ease-in-out infinite;
                }

                @keyframes bael-record-pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }

                .replay-close {
                    width: 40px;
                    height: 40px;
                    border-radius: 8px;
                    border: none;
                    background: rgba(255, 255, 255, 0.08);
                    color: rgba(255, 255, 255, 0.6);
                    cursor: pointer;
                    font-size: 20px;
                    transition: all 0.2s;
                }

                .replay-close:hover {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }

                .replay-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px;
                }

                .replay-empty {
                    text-align: center;
                    padding: 60px 20px;
                    color: rgba(255, 255, 255, 0.4);
                }

                .replay-empty-icon {
                    font-size: 64px;
                    margin-bottom: 16px;
                }

                .recordings-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .recording-item {
                    background: rgba(255, 255, 255, 0.04);
                    border-radius: 12px;
                    border: 2px solid rgba(255, 255, 255, 0.06);
                    padding: 16px 20px;
                    transition: all 0.2s;
                }

                .recording-item:hover {
                    border-color: rgba(99, 102, 241, 0.3);
                }

                .recording-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 10px;
                }

                .recording-name {
                    font-size: 15px;
                    font-weight: 600;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .recording-meta {
                    display: flex;
                    gap: 16px;
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.4);
                }

                .recording-stat {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                }

                .recording-actions {
                    display: flex;
                    gap: 8px;
                }

                .recording-action {
                    padding: 8px 14px;
                    border-radius: 6px;
                    border: none;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .recording-action.play {
                    background: rgba(34, 197, 94, 0.2);
                    color: #22c55e;
                }

                .recording-action.play:hover {
                    background: rgba(34, 197, 94, 0.3);
                }

                .recording-action.delete {
                    background: rgba(239, 68, 68, 0.15);
                    color: #ef4444;
                }

                .recording-action.delete:hover {
                    background: rgba(239, 68, 68, 0.25);
                }

                .bael-recording-indicator {
                    position: fixed;
                    top: 80px;
                    right: 20px;
                    background: rgba(239, 68, 68, 0.95);
                    padding: 10px 18px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    z-index: 10000;
                    opacity: 0;
                    transform: translateX(100px);
                    transition: all 0.3s ease;
                    pointer-events: none;
                }

                .bael-recording-indicator.visible {
                    opacity: 1;
                    transform: translateX(0);
                    pointer-events: auto;
                }

                .recording-dot {
                    width: 10px;
                    height: 10px;
                    background: #fff;
                    border-radius: 50%;
                    animation: bael-record-blink 1s ease-in-out infinite;
                }

                @keyframes bael-record-blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.3; }
                }

                .recording-indicator-text {
                    font-size: 13px;
                    font-weight: 600;
                    color: #fff;
                }

                .recording-indicator-time {
                    font-family: 'Consolas', 'Monaco', monospace;
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.8);
                }

                .recording-stop-btn {
                    padding: 6px 12px;
                    border-radius: 6px;
                    border: none;
                    background: rgba(255, 255, 255, 0.2);
                    color: #fff;
                    font-size: 12px;
                    cursor: pointer;
                }

                .recording-stop-btn:hover {
                    background: rgba(255, 255, 255, 0.3);
                }
            `;
      document.head.appendChild(styles);
    }

    createContainer() {
      this.container = document.createElement("div");
      this.container.id = "bael-session-replay";
      this.container.className = "bael-replay-overlay";

      this.container.innerHTML = `
                <div class="bael-replay-modal">
                    <div class="replay-header">
                        <div class="replay-title">
                            <span style="font-size: 24px;">🎬</span>
                            <h2>Session Replay</h2>
                        </div>
                        <div class="replay-actions">
                            <button class="replay-btn record" onclick="BaelSessionReplay.toggleRecording()">
                                ⏺️ Start Recording
                            </button>
                            <button class="replay-close" onclick="BaelSessionReplay.hide()">✕</button>
                        </div>
                    </div>
                    <div class="replay-content">
                        <div class="recordings-list"></div>
                    </div>
                </div>
            `;

      document.body.appendChild(this.container);

      // Close on overlay click
      this.container.addEventListener("click", (e) => {
        if (e.target === this.container) {
          this.hide();
        }
      });
    }

    createRecordingIndicator() {
      this.indicator = document.createElement("div");
      this.indicator.className = "bael-recording-indicator";
      this.indicator.innerHTML = `
                <div class="recording-dot"></div>
                <span class="recording-indicator-text">Recording</span>
                <span class="recording-indicator-time">00:00</span>
                <button class="recording-stop-btn" onclick="BaelSessionReplay.stopRecording()">Stop</button>
            `;
      document.body.appendChild(this.indicator);
    }

    setupShortcuts() {
      document.addEventListener("keydown", (e) => {
        // Ctrl+Shift+R for session replay
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "R") {
          e.preventDefault();
          if (this.visible) {
            this.hide();
          } else {
            this.show();
          }
        }
      });
    }

    render() {
      const list = this.container.querySelector(".recordings-list");

      if (this.recordings.length === 0) {
        list.innerHTML = `
                    <div class="replay-empty">
                        <div class="replay-empty-icon">🎬</div>
                        <p>No recordings yet</p>
                        <p style="font-size: 13px;">Click "Start Recording" to capture a session</p>
                    </div>
                `;
        return;
      }

      list.innerHTML = this.recordings
        .map((rec, index) => {
          const date = new Date(rec.timestamp).toLocaleString();
          const duration = this.formatDuration(rec.duration);
          const eventCount = rec.events?.length || 0;

          return `
                    <div class="recording-item">
                        <div class="recording-header">
                            <div class="recording-name">
                                🎞️ ${rec.name || `Recording ${index + 1}`}
                            </div>
                            <div class="recording-actions">
                                <button class="recording-action play" onclick="BaelSessionReplay.playRecording(${index})">
                                    ▶️ Play
                                </button>
                                <button class="recording-action delete" onclick="BaelSessionReplay.deleteRecording(${index})">
                                    🗑️
                                </button>
                            </div>
                        </div>
                        <div class="recording-meta">
                            <span class="recording-stat">📅 ${date}</span>
                            <span class="recording-stat">⏱️ ${duration}</span>
                            <span class="recording-stat">📊 ${eventCount} events</span>
                        </div>
                    </div>
                `;
        })
        .join("");

      // Update record button
      const recordBtn = this.container.querySelector(".replay-btn.record");
      if (this.isRecording) {
        recordBtn.classList.add("recording");
        recordBtn.innerHTML = "⏹️ Stop Recording";
      } else {
        recordBtn.classList.remove("recording");
        recordBtn.innerHTML = "⏺️ Start Recording";
      }
    }

    show() {
      this.visible = true;
      this.container.classList.add("visible");
      this.render();
    }

    hide() {
      this.visible = false;
      this.container.classList.remove("visible");
    }

    toggleRecording() {
      if (this.isRecording) {
        this.stopRecording();
      } else {
        this.startRecording();
      }
    }

    startRecording() {
      this.isRecording = true;
      this.recordingStart = Date.now();
      this.recordedEvents = [];

      this.hide();
      this.indicator.classList.add("visible");

      // Start tracking events
      this.setupEventListeners();
      this.startRecordingTimer();

      this.toast("Recording started", "info");
    }

    setupEventListeners() {
      // Track clicks
      this.clickHandler = (e) => {
        this.recordEvent("click", {
          x: e.clientX,
          y: e.clientY,
          target: this.getElementPath(e.target),
        });
      };

      // Track keystrokes (without capturing sensitive data)
      this.keyHandler = (e) => {
        if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName)) {
          // Don't record actual key values in text inputs
          this.recordEvent("input", {
            target: this.getElementPath(e.target),
          });
        } else {
          this.recordEvent("keydown", {
            key: e.key,
            modifiers: {
              ctrl: e.ctrlKey,
              shift: e.shiftKey,
              alt: e.altKey,
            },
          });
        }
      };

      // Track scrolls
      this.scrollHandler = this.debounce(() => {
        this.recordEvent("scroll", {
          x: window.scrollX,
          y: window.scrollY,
        });
      }, 100);

      document.addEventListener("click", this.clickHandler);
      document.addEventListener("keydown", this.keyHandler);
      document.addEventListener("scroll", this.scrollHandler);
    }

    recordEvent(type, data) {
      this.recordedEvents.push({
        type,
        data,
        timestamp: Date.now() - this.recordingStart,
      });
    }

    getElementPath(element) {
      const path = [];
      while (element && element !== document.body) {
        let selector = element.tagName.toLowerCase();
        if (element.id) {
          selector += `#${element.id}`;
        } else if (element.className) {
          selector += `.${element.className.split(" ")[0]}`;
        }
        path.unshift(selector);
        element = element.parentElement;
      }
      return path.join(" > ");
    }

    startRecordingTimer() {
      this.recordingInterval = setInterval(() => {
        const elapsed = Date.now() - this.recordingStart;
        const timeDisplay = this.indicator.querySelector(
          ".recording-indicator-time",
        );
        timeDisplay.textContent = this.formatDuration(elapsed);
      }, 1000);
    }

    stopRecording() {
      if (!this.isRecording) return;

      this.isRecording = false;
      const duration = Date.now() - this.recordingStart;

      // Clean up
      document.removeEventListener("click", this.clickHandler);
      document.removeEventListener("keydown", this.keyHandler);
      document.removeEventListener("scroll", this.scrollHandler);
      clearInterval(this.recordingInterval);

      this.indicator.classList.remove("visible");

      // Save recording
      const name = prompt(
        "Recording name:",
        `Session ${new Date().toLocaleDateString()}`,
      );
      if (name !== null) {
        const recording = {
          name,
          timestamp: Date.now(),
          duration,
          events: this.recordedEvents,
        };

        this.recordings.unshift(recording);
        this.saveRecordings();
        this.toast(
          `Recording saved: ${this.recordedEvents.length} events`,
          "success",
        );
      }

      this.recordedEvents = [];
      this.show();
    }

    playRecording(index) {
      const recording = this.recordings[index];
      if (!recording || !recording.events?.length) {
        this.toast("No events to replay", "warning");
        return;
      }

      this.hide();
      this.isPlaying = true;
      this.toast("Replaying session...", "info");

      // Replay events with timing
      recording.events.forEach((event, i) => {
        setTimeout(() => {
          this.replayEvent(event);

          // Last event
          if (i === recording.events.length - 1) {
            this.isPlaying = false;
            this.toast("Replay complete", "success");
          }
        }, event.timestamp);
      });
    }

    replayEvent(event) {
      switch (event.type) {
        case "click":
          this.showClickIndicator(event.data.x, event.data.y);
          break;
        case "scroll":
          window.scrollTo({
            top: event.data.y,
            left: event.data.x,
            behavior: "smooth",
          });
          break;
      }
    }

    showClickIndicator(x, y) {
      const indicator = document.createElement("div");
      indicator.style.cssText = `
                position: fixed;
                left: ${x}px;
                top: ${y}px;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: rgba(99, 102, 241, 0.5);
                border: 2px solid #6366f1;
                transform: translate(-50%, -50%) scale(0);
                z-index: 10001;
                pointer-events: none;
                animation: bael-click-ripple 0.4s ease-out forwards;
            `;

      document.body.appendChild(indicator);
      setTimeout(() => indicator.remove(), 500);
    }

    deleteRecording(index) {
      if (!confirm("Delete this recording?")) return;

      this.recordings.splice(index, 1);
      this.saveRecordings();
      this.render();
      this.toast("Recording deleted", "success");
    }

    formatDuration(ms) {
      const seconds = Math.floor(ms / 1000);
      const m = Math.floor(seconds / 60);
      const s = seconds % 60;
      return `${m}:${s.toString().padStart(2, "0")}`;
    }

    debounce(fn, delay) {
      let timer;
      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
      };
    }

    toast(message, type = "info") {
      window.dispatchEvent(
        new CustomEvent("bael:toast", {
          detail: { message, type },
        }),
      );
    }
  }

  // Add click ripple animation
  const style = document.createElement("style");
  style.textContent = `
        @keyframes bael-click-ripple {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
            100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }
    `;
  document.head.appendChild(style);

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  window.BaelSessionReplay = new BaelSessionReplay();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelSessionReplay.initialize();
    });
  } else {
    window.BaelSessionReplay.initialize();
  }

  console.log("🎬 Bael Session Replay loaded");
})();
