/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █  ██╗   ██╗ ██████╗ ██╗ ██████╗███████╗                                  █
 * █  ██║   ██║██╔═══██╗██║██╔════╝██╔════╝                                  █
 * █  ██║   ██║██║   ██║██║██║     █████╗                                    █
 * █  ╚██╗ ██╔╝██║   ██║██║██║     ██╔══╝                                    █
 * █   ╚████╔╝ ╚██████╔╝██║╚██████╗███████╗                                  █
 * █    ╚═══╝   ╚═════╝ ╚═╝ ╚═════╝╚══════╝                                  █
 * █                                                                          █
 * █   BAEL VOICE COMMANDER - Voice Control Interface (Ctrl+Shift+M)         █
 * █   Hands-free voice commands for the AI assistant                        █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  class BaelVoiceCommander {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.listening = false;
      this.recognition = null;
      this.indicator = null;
      this.commands = new Map();
      this.transcript = "";
    }

    async initialize() {
      console.log("🎙️ Bael Voice Commander initializing...");

      if (!this.checkSupport()) {
        console.warn("Speech Recognition not supported in this browser");
        return this;
      }

      this.setupRecognition();
      this.injectStyles();
      this.createIndicator();
      this.registerDefaultCommands();
      this.setupShortcuts();

      this.initialized = true;
      console.log("✅ BAEL VOICE COMMANDER READY");

      return this;
    }

    checkSupport() {
      return (
        "webkitSpeechRecognition" in window || "SpeechRecognition" in window
      );
    }

    setupRecognition() {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();

      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = "en-US";

      this.recognition.onstart = () => {
        this.listening = true;
        this.updateIndicator();
      };

      this.recognition.onend = () => {
        this.listening = false;
        this.updateIndicator();
      };

      this.recognition.onresult = (event) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        this.updateTranscript(interimTranscript || finalTranscript);

        if (finalTranscript) {
          this.processCommand(finalTranscript.trim().toLowerCase());
        }
      };

      this.recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        this.toast(`Voice error: ${event.error}`, "error");
        this.listening = false;
        this.updateIndicator();
      };
    }

    injectStyles() {
      if (document.getElementById("bael-voice-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-voice-styles";
      styles.textContent = `
                .bael-voice-indicator {
                    position: fixed;
                    bottom: 100px;
                    left: 50%;
                    transform: translateX(-50%) translateY(100px);
                    background: #12121a;
                    padding: 16px 24px;
                    border-radius: 16px;
                    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5);
                    border: 2px solid rgba(255, 255, 255, 0.1);
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    opacity: 0;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    pointer-events: none;
                    min-width: 300px;
                    max-width: 500px;
                }

                .bael-voice-indicator.visible {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                    pointer-events: auto;
                }

                .bael-voice-indicator.listening {
                    border-color: #ef4444;
                    box-shadow: 0 0 30px rgba(239, 68, 68, 0.3);
                }

                .voice-mic-container {
                    position: relative;
                    width: 50px;
                    height: 50px;
                }

                .voice-mic {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: rgba(239, 68, 68, 0.2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    transition: all 0.3s ease;
                }

                .bael-voice-indicator.listening .voice-mic {
                    background: #ef4444;
                    animation: bael-mic-pulse 1.5s ease-in-out infinite;
                }

                @keyframes bael-mic-pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.1); }
                }

                .voice-ripple {
                    position: absolute;
                    inset: 0;
                    border-radius: 50%;
                    border: 2px solid #ef4444;
                    animation: bael-voice-ripple 1.5s ease-out infinite;
                    opacity: 0;
                }

                .bael-voice-indicator.listening .voice-ripple {
                    opacity: 1;
                }

                @keyframes bael-voice-ripple {
                    0% { transform: scale(1); opacity: 0.6; }
                    100% { transform: scale(1.8); opacity: 0; }
                }

                .voice-content {
                    flex: 1;
                }

                .voice-status {
                    font-size: 11px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: rgba(255, 255, 255, 0.4);
                    margin-bottom: 6px;
                }

                .bael-voice-indicator.listening .voice-status {
                    color: #ef4444;
                }

                .voice-transcript {
                    font-size: 15px;
                    color: #fff;
                    min-height: 22px;
                }

                .voice-hints {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                    margin-top: 8px;
                }

                .voice-hint {
                    padding: 4px 10px;
                    border-radius: 6px;
                    background: rgba(255, 255, 255, 0.08);
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.5);
                }

                .voice-close {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    border: none;
                    background: rgba(255, 255, 255, 0.08);
                    color: rgba(255, 255, 255, 0.5);
                    cursor: pointer;
                    font-size: 16px;
                    transition: all 0.2s;
                }

                .voice-close:hover {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }
            `;
      document.head.appendChild(styles);
    }

    createIndicator() {
      this.indicator = document.createElement("div");
      this.indicator.className = "bael-voice-indicator";
      this.indicator.innerHTML = `
                <div class="voice-mic-container">
                    <div class="voice-mic">🎙️</div>
                    <div class="voice-ripple"></div>
                </div>
                <div class="voice-content">
                    <div class="voice-status">Ready to listen</div>
                    <div class="voice-transcript">Say a command...</div>
                    <div class="voice-hints">
                        <span class="voice-hint">"New chat"</span>
                        <span class="voice-hint">"Clear"</span>
                        <span class="voice-hint">"Send"</span>
                    </div>
                </div>
                <button class="voice-close" onclick="BaelVoiceCommander.stop()">✕</button>
            `;
      document.body.appendChild(this.indicator);
    }

    registerDefaultCommands() {
      // Navigation commands
      this.registerCommand(
        ["new chat", "start new chat", "new conversation"],
        () => {
          this.executeAction("new-chat");
        },
      );

      this.registerCommand(
        ["open settings", "settings", "go to settings"],
        () => {
          this.executeAction("settings");
        },
      );

      // Chat commands
      this.registerCommand(["send", "send message", "submit"], () => {
        this.executeAction("send");
      });

      this.registerCommand(["clear", "clear input", "delete"], () => {
        this.executeAction("clear");
      });

      // Control commands
      this.registerCommand(["stop listening", "stop", "close voice"], () => {
        this.stop();
      });

      this.registerCommand(["pause agent", "pause", "stop agent"], () => {
        this.executeAction("pause");
      });

      this.registerCommand(["resume agent", "resume", "continue"], () => {
        this.executeAction("resume");
      });

      // UI commands
      this.registerCommand(["open search", "search", "find"], () => {
        window.dispatchEvent(new CustomEvent("bael:open-search"));
      });

      this.registerCommand(
        ["open launcher", "launcher", "quick launch"],
        () => {
          window.dispatchEvent(new CustomEvent("bael:open-launcher"));
        },
      );

      this.registerCommand(["open notes", "notes", "quick notes"], () => {
        if (window.BaelQuickNotes) {
          window.BaelQuickNotes.show();
        }
      });

      // Text input commands (prepend with "type")
      this.registerCommand(
        ["type"],
        (text) => {
          this.insertText(text);
        },
        { prefix: true },
      );

      // Ask commands (prepend with "ask")
      this.registerCommand(
        ["ask", "question"],
        (text) => {
          this.insertText(text);
          setTimeout(() => this.executeAction("send"), 300);
        },
        { prefix: true },
      );
    }

    registerCommand(triggers, callback, options = {}) {
      triggers.forEach((trigger) => {
        this.commands.set(trigger, { callback, options });
      });
    }

    processCommand(text) {
      this.updateTranscript(text);

      // Check for exact matches first
      for (const [trigger, { callback }] of this.commands) {
        if (text === trigger) {
          this.toast(`Command: ${trigger}`, "success");
          callback();
          return;
        }
      }

      // Check for prefix matches
      for (const [trigger, { callback, options }] of this.commands) {
        if (options.prefix && text.startsWith(trigger + " ")) {
          const content = text.slice(trigger.length + 1);
          this.toast(`Command: ${trigger} "${content}"`, "success");
          callback(content);
          return;
        }
      }

      // No command matched - treat as text input
      this.insertText(text);
    }

    executeAction(action) {
      switch (action) {
        case "new-chat":
          const newChatBtn = document.querySelector(
            '[x-on\\:click*="newChat"], .new-chat-btn',
          );
          if (newChatBtn) newChatBtn.click();
          break;

        case "settings":
          const settingsBtn = document.querySelector(
            '[x-on\\:click*="settings"], .settings-btn, [href*="settings"]',
          );
          if (settingsBtn) settingsBtn.click();
          break;

        case "send":
          const sendBtn = document.querySelector(
            '[type="submit"], [x-on\\:click*="send"]',
          );
          if (sendBtn) sendBtn.click();
          break;

        case "clear":
          const input = document.querySelector(
            '#msg-input, textarea[name="message"]',
          );
          if (input) {
            input.value = "";
            input.dispatchEvent(new Event("input", { bubbles: true }));
          }
          break;

        case "pause":
          const pauseBtn = document.querySelector(
            '[x-on\\:click*="pause"], .pause-btn',
          );
          if (pauseBtn) pauseBtn.click();
          break;

        case "resume":
          const resumeBtn = document.querySelector(
            '[x-on\\:click*="resume"], .resume-btn',
          );
          if (resumeBtn) resumeBtn.click();
          break;
      }
    }

    insertText(text) {
      const input = document.querySelector(
        '#msg-input, textarea[name="message"]',
      );
      if (input) {
        input.value += (input.value ? " " : "") + text;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.focus();
      }
    }

    setupShortcuts() {
      document.addEventListener("keydown", (e) => {
        // Ctrl+Shift+M for voice commander
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "M") {
          e.preventDefault();
          if (this.listening) {
            this.stop();
          } else {
            this.start();
          }
        }
      });
    }

    updateIndicator() {
      if (this.listening) {
        this.indicator.classList.add("visible", "listening");
        this.indicator.querySelector(".voice-status").textContent =
          "Listening...";
      } else {
        this.indicator.classList.remove("listening");
        this.indicator.querySelector(".voice-status").textContent =
          "Ready to listen";
      }
    }

    updateTranscript(text) {
      this.transcript = text;
      this.indicator.querySelector(".voice-transcript").textContent =
        text || "Say a command...";
    }

    start() {
      if (!this.recognition) {
        this.toast("Voice control not supported", "error");
        return;
      }

      try {
        this.indicator.classList.add("visible");
        this.recognition.start();
      } catch (e) {
        console.error("Failed to start voice recognition:", e);
      }
    }

    stop() {
      if (this.recognition) {
        this.recognition.stop();
      }
      this.indicator.classList.remove("visible", "listening");
    }

    toast(message, type = "info") {
      window.dispatchEvent(
        new CustomEvent("bael:toast", {
          detail: { message, type },
        }),
      );
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  window.BaelVoiceCommander = new BaelVoiceCommander();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelVoiceCommander.initialize();
    });
  } else {
    window.BaelVoiceCommander.initialize();
  }

  console.log("🎙️ Bael Voice Commander loaded");
})();
