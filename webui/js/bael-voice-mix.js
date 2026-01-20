/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █  ██╗   ██╗ ██████╗ ██╗ ██████╗███████╗    ███╗   ███╗██╗██╗  ██╗         █
 * █  ██║   ██║██╔═══██╗██║██╔════╝██╔════╝    ████╗ ████║██║╚██╗██╔╝         █
 * █  ██║   ██║██║   ██║██║██║     █████╗      ██╔████╔██║██║ ╚███╔╝          █
 * █  ╚██╗ ██╔╝██║   ██║██║██║     ██╔══╝      ██║╚██╔╝██║██║ ██╔██╗          █
 * █   ╚████╔╝ ╚██████╔╝██║╚██████╗███████╗    ██║ ╚═╝ ██║██║██╔╝ ██╗         █
 * █    ╚═══╝   ╚═════╝ ╚═╝ ╚═════╝╚══════╝    ╚═╝     ╚═╝╚═╝╚═╝  ╚═╝         █
 * █                                                                          █
 * █   BAEL VOICE MIX - Advanced Voice Control & Audio Mixing                █
 * █   Voice commands, TTS controls, and audio visualization                  █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  class BaelVoiceMix {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
      this.isRecording = false;
      this.isSpeaking = false;
      this.volume = 80;
      this.rate = 1.0;
      this.pitch = 1.0;
      this.voices = [];
      this.selectedVoice = null;
      this.storageKey = "bael-voice-mix";
    }

    async initialize() {
      console.log("🎙️ Bael Voice Mix initializing...");

      this.loadSettings();
      this.injectStyles();
      this.createWidget();
      this.createPanel();
      this.setupVoices();
      this.setupShortcuts();

      this.initialized = true;
      console.log("✅ BAEL VOICE MIX READY (Ctrl+Shift+V)");

      return this;
    }

    injectStyles() {
      if (document.getElementById("bael-voicemix-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-voicemix-styles";
      styles.textContent = `
                /* Widget */
                .bael-voicemix-widget {
                    position: fixed;
                    left: 20px;
                    bottom: 80px;
                    display: flex;
                    gap: 6px;
                    z-index: 9300;
                }

                .voicemix-btn {
                    width: 40px;
                    height: 40px;
                    border-radius: 10px;
                    border: none;
                    cursor: pointer;
                    font-size: 16px;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .voicemix-btn.mic {
                    background: linear-gradient(135deg, #ef4444, #dc2626);
                    color: #fff;
                    box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
                }

                .voicemix-btn.mic.recording {
                    animation: micPulse 1s ease-in-out infinite;
                }

                @keyframes micPulse {
                    0%, 100% { transform: scale(1); box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4); }
                    50% { transform: scale(1.1); box-shadow: 0 6px 25px rgba(239, 68, 68, 0.6); }
                }

                .voicemix-btn.speak {
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: #fff;
                    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
                }

                .voicemix-btn.speak.speaking {
                    animation: speakPulse 0.5s ease-in-out infinite;
                }

                @keyframes speakPulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }

                .voicemix-btn.settings {
                    background: rgba(255, 255, 255, 0.1);
                    color: rgba(255, 255, 255, 0.7);
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                }

                .voicemix-btn:hover {
                    transform: scale(1.1);
                }

                /* Panel */
                .bael-voicemix-panel {
                    position: fixed;
                    left: 20px;
                    bottom: 130px;
                    width: 300px;
                    background: #12121a;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    z-index: 9400;
                    display: none;
                    overflow: hidden;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
                }

                .bael-voicemix-panel.visible {
                    display: block;
                    animation: voicePanelIn 0.25s ease-out;
                }

                @keyframes voicePanelIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .voicemix-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px 16px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .voicemix-title {
                    font-size: 15px;
                    font-weight: 700;
                    color: #fff;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .voicemix-close {
                    width: 28px;
                    height: 28px;
                    border-radius: 8px;
                    border: none;
                    background: transparent;
                    color: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    font-size: 14px;
                }

                .voicemix-close:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: #fff;
                }

                /* Visualizer */
                .voicemix-visualizer {
                    padding: 16px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                }

                .visualizer-canvas {
                    width: 100%;
                    height: 50px;
                    background: rgba(255, 255, 255, 0.03);
                    border-radius: 8px;
                }

                /* Controls */
                .voicemix-controls {
                    padding: 16px;
                }

                .voicemix-control {
                    margin-bottom: 16px;
                }

                .voicemix-control:last-child {
                    margin-bottom: 0;
                }

                .control-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }

                .control-label {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.6);
                }

                .control-value {
                    font-size: 12px;
                    color: #fff;
                    font-weight: 600;
                }

                .control-slider {
                    width: 100%;
                    height: 6px;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 3px;
                    appearance: none;
                    outline: none;
                }

                .control-slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #10b981;
                    cursor: pointer;
                    transition: transform 0.2s;
                }

                .control-slider::-webkit-slider-thumb:hover {
                    transform: scale(1.2);
                }

                .control-slider.volume::-webkit-slider-thumb {
                    background: #3b82f6;
                }

                .control-slider.rate::-webkit-slider-thumb {
                    background: #f59e0b;
                }

                .control-slider.pitch::-webkit-slider-thumb {
                    background: #8b5cf6;
                }

                /* Voice Select */
                .voicemix-voice-select {
                    width: 100%;
                    padding: 10px 12px;
                    background: rgba(255, 255, 255, 0.03);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 8px;
                    color: #fff;
                    font-size: 12px;
                    outline: none;
                }

                /* Quick Actions */
                .voicemix-actions {
                    padding: 12px 16px;
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 8px;
                }

                .voicemix-action {
                    padding: 10px;
                    border-radius: 8px;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    background: transparent;
                    color: #fff;
                    font-size: 11px;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: center;
                }

                .voicemix-action:hover {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.2);
                }

                .voicemix-action.active {
                    background: rgba(16, 185, 129, 0.15);
                    border-color: #10b981;
                    color: #10b981;
                }

                /* Status Bar */
                .voicemix-status {
                    padding: 10px 16px;
                    background: rgba(255, 255, 255, 0.02);
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.4);
                    text-align: center;
                }
            `;
      document.head.appendChild(styles);
    }

    createWidget() {
      this.widget = document.createElement("div");
      this.widget.className = "bael-voicemix-widget";
      this.widget.innerHTML = `
                <button class="voicemix-btn mic" id="voice-mic" title="Voice Input (Hold Space)">🎤</button>
                <button class="voicemix-btn speak" id="voice-speak" title="Read Last Response">🔊</button>
                <button class="voicemix-btn settings" id="voice-settings" title="Voice Settings (Ctrl+Shift+V)">⚙️</button>
            `;

      this.widget.querySelector("#voice-mic").onclick = () =>
        this.toggleRecording();
      this.widget.querySelector("#voice-speak").onclick = () =>
        this.speakLastResponse();
      this.widget.querySelector("#voice-settings").onclick = () =>
        this.toggle();

      document.body.appendChild(this.widget);
    }

    createPanel() {
      this.panel = document.createElement("div");
      this.panel.className = "bael-voicemix-panel";
      document.body.appendChild(this.panel);
    }

    renderPanel() {
      this.panel.innerHTML = `
                <div class="voicemix-header">
                    <div class="voicemix-title">
                        <span>🎙️</span>
                        Voice Mix
                    </div>
                    <button class="voicemix-close" onclick="BaelVoiceMix.hide()">✕</button>
                </div>

                <div class="voicemix-visualizer">
                    <canvas class="visualizer-canvas" id="voice-visualizer"></canvas>
                </div>

                <div class="voicemix-controls">
                    <div class="voicemix-control">
                        <div class="control-header">
                            <span class="control-label">Voice</span>
                        </div>
                        <select class="voicemix-voice-select" id="voice-select" onchange="BaelVoiceMix.setVoice(this.value)">
                            ${this.voices
                              .map(
                                (v, i) => `
                                <option value="${i}" ${this.selectedVoice === i ? "selected" : ""}>
                                    ${v.name} (${v.lang})
                                </option>
                            `,
                              )
                              .join("")}
                        </select>
                    </div>

                    <div class="voicemix-control">
                        <div class="control-header">
                            <span class="control-label">Volume</span>
                            <span class="control-value">${this.volume}%</span>
                        </div>
                        <input type="range" class="control-slider volume"
                               min="0" max="100" value="${this.volume}"
                               oninput="BaelVoiceMix.setVolume(this.value)">
                    </div>

                    <div class="voicemix-control">
                        <div class="control-header">
                            <span class="control-label">Speed</span>
                            <span class="control-value">${this.rate.toFixed(1)}x</span>
                        </div>
                        <input type="range" class="control-slider rate"
                               min="0.5" max="2" step="0.1" value="${this.rate}"
                               oninput="BaelVoiceMix.setRate(this.value)">
                    </div>

                    <div class="voicemix-control">
                        <div class="control-header">
                            <span class="control-label">Pitch</span>
                            <span class="control-value">${this.pitch.toFixed(1)}</span>
                        </div>
                        <input type="range" class="control-slider pitch"
                               min="0.5" max="2" step="0.1" value="${this.pitch}"
                               oninput="BaelVoiceMix.setPitch(this.value)">
                    </div>
                </div>

                <div class="voicemix-actions">
                    <button class="voicemix-action" onclick="BaelVoiceMix.presetNormal()">
                        😊<br>Normal
                    </button>
                    <button class="voicemix-action" onclick="BaelVoiceMix.presetFast()">
                        ⚡<br>Fast
                    </button>
                    <button class="voicemix-action" onclick="BaelVoiceMix.presetSlow()">
                        🐢<br>Slow
                    </button>
                </div>

                <div class="voicemix-status" id="voice-status">
                    Ready • Press and hold Space for voice input
                </div>
            `;

      this.initVisualizer();
    }

    setupVoices() {
      // Get available voices
      const loadVoices = () => {
        this.voices = speechSynthesis.getVoices();
        if (this.voices.length > 0 && this.selectedVoice === null) {
          this.selectedVoice = 0;
        }
      };

      loadVoices();
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    initVisualizer() {
      const canvas = document.getElementById("voice-visualizer");
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      const width = (canvas.width = canvas.offsetWidth * 2);
      const height = (canvas.height = canvas.offsetHeight * 2);

      // Draw static waveform
      ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = "rgba(16, 185, 129, 0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();

      const centerY = height / 2;
      for (let x = 0; x < width; x++) {
        const y = centerY + Math.sin(x * 0.02) * 10;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    setVoice(index) {
      this.selectedVoice = parseInt(index);
      this.saveSettings();
    }

    setVolume(value) {
      this.volume = parseInt(value);
      this.panel.querySelector(".voicemix-control .control-value").textContent =
        `${this.volume}%`;
      this.saveSettings();
    }

    setRate(value) {
      this.rate = parseFloat(value);
      const valueEl = this.panel.querySelectorAll(
        ".voicemix-control .control-value",
      )[1];
      if (valueEl) valueEl.textContent = `${this.rate.toFixed(1)}x`;
      this.saveSettings();
    }

    setPitch(value) {
      this.pitch = parseFloat(value);
      const valueEl = this.panel.querySelectorAll(
        ".voicemix-control .control-value",
      )[2];
      if (valueEl) valueEl.textContent = this.pitch.toFixed(1);
      this.saveSettings();
    }

    presetNormal() {
      this.rate = 1.0;
      this.pitch = 1.0;
      this.volume = 80;
      this.renderPanel();
      this.saveSettings();
      this.showToast("Normal preset applied");
    }

    presetFast() {
      this.rate = 1.5;
      this.pitch = 1.0;
      this.volume = 80;
      this.renderPanel();
      this.saveSettings();
      this.showToast("Fast preset applied");
    }

    presetSlow() {
      this.rate = 0.7;
      this.pitch = 1.0;
      this.volume = 80;
      this.renderPanel();
      this.saveSettings();
      this.showToast("Slow preset applied");
    }

    toggleRecording() {
      if (this.isRecording) {
        this.stopRecording();
      } else {
        this.startRecording();
      }
    }

    startRecording() {
      if (
        !("webkitSpeechRecognition" in window) &&
        !("SpeechRecognition" in window)
      ) {
        this.showToast("Speech recognition not supported");
        return;
      }

      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;

      this.recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");

        // Insert into chat
        const chatInput = document.querySelector(
          'textarea, #chat-input, [contenteditable="true"]',
        );
        if (chatInput) {
          if (
            chatInput.tagName === "TEXTAREA" ||
            chatInput.tagName === "INPUT"
          ) {
            chatInput.value = transcript;
            chatInput.dispatchEvent(new Event("input", { bubbles: true }));
          } else {
            chatInput.innerText = transcript;
          }
        }
      };

      this.recognition.onend = () => {
        this.isRecording = false;
        document.getElementById("voice-mic")?.classList.remove("recording");
        this.updateStatus("Recording ended");
      };

      this.recognition.start();
      this.isRecording = true;
      document.getElementById("voice-mic")?.classList.add("recording");
      this.updateStatus("🔴 Recording...");
      this.showToast("🎤 Recording started");
    }

    stopRecording() {
      if (this.recognition) {
        this.recognition.stop();
      }
      this.isRecording = false;
      document.getElementById("voice-mic")?.classList.remove("recording");
      this.updateStatus("Ready");
    }

    speakLastResponse() {
      // Find last AI response
      const messages = document.querySelectorAll(
        '[class*="message"], .message, [role="article"]',
      );
      const lastMessage = messages[messages.length - 1];

      if (!lastMessage) {
        this.showToast("No response to read");
        return;
      }

      const text = lastMessage.textContent;
      this.speak(text);
    }

    speak(text) {
      if (this.isSpeaking) {
        speechSynthesis.cancel();
        this.isSpeaking = false;
        document.getElementById("voice-speak")?.classList.remove("speaking");
        this.updateStatus("Stopped");
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);

      if (this.voices.length > 0 && this.selectedVoice !== null) {
        utterance.voice = this.voices[this.selectedVoice];
      }

      utterance.volume = this.volume / 100;
      utterance.rate = this.rate;
      utterance.pitch = this.pitch;

      utterance.onstart = () => {
        this.isSpeaking = true;
        document.getElementById("voice-speak")?.classList.add("speaking");
        this.updateStatus("🔊 Speaking...");
      };

      utterance.onend = () => {
        this.isSpeaking = false;
        document.getElementById("voice-speak")?.classList.remove("speaking");
        this.updateStatus("Ready");
      };

      speechSynthesis.speak(utterance);
    }

    updateStatus(text) {
      const status = document.getElementById("voice-status");
      if (status) status.textContent = text;
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
                padding: 10px 20px;
                border-radius: 8px;
                font-size: 13px;
                z-index: 9999;
            `;
      toast.textContent = message;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
    }

    saveSettings() {
      try {
        localStorage.setItem(
          this.storageKey,
          JSON.stringify({
            volume: this.volume,
            rate: this.rate,
            pitch: this.pitch,
            selectedVoice: this.selectedVoice,
          }),
        );
      } catch (e) {
        console.error("Failed to save voice settings:", e);
      }
    }

    loadSettings() {
      try {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
          const data = JSON.parse(saved);
          this.volume = data.volume ?? 80;
          this.rate = data.rate ?? 1.0;
          this.pitch = data.pitch ?? 1.0;
          this.selectedVoice = data.selectedVoice ?? null;
        }
      } catch (e) {
        console.error("Failed to load voice settings:", e);
      }
    }

    setupShortcuts() {
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "V") {
          e.preventDefault();
          this.toggle();
        }

        // Hold Space for voice input (only when not in input field)
        if (e.code === "Space" && !this.isInputFocused()) {
          e.preventDefault();
          if (!this.isRecording) {
            this.startRecording();
          }
        }

        if (e.key === "Escape" && this.visible) {
          this.hide();
        }
      });

      document.addEventListener("keyup", (e) => {
        if (e.code === "Space" && this.isRecording) {
          this.stopRecording();
        }
      });
    }

    isInputFocused() {
      const active = document.activeElement;
      return (
        active &&
        (active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          active.contentEditable === "true")
      );
    }

    toggle() {
      if (this.visible) {
        this.hide();
      } else {
        this.show();
      }
    }

    show() {
      this.visible = true;
      this.renderPanel();
      this.panel.classList.add("visible");
    }

    hide() {
      this.visible = false;
      this.panel.classList.remove("visible");
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  window.BaelVoiceMix = new BaelVoiceMix();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelVoiceMix.initialize();
    });
  } else {
    window.BaelVoiceMix.initialize();
  }

  console.log("🎙️ Bael Voice Mix loaded");
})();
