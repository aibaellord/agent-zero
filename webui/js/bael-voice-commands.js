/**
 * BAEL - LORD OF ALL
 * Voice Command Integration - Speech recognition for hands-free control
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelVoiceCommands {
    constructor() {
      this.recognition = null;
      this.synthesis = window.speechSynthesis;
      this.isListening = false;
      this.indicator = null;
      this.wakeWord = "bael";
      this.wakeWordActive = false;
      this.commands = new Map();
      this.language = "en-US";
      this.continuous = false;
      this.interimResults = true;
      this.init();
    }

    init() {
      if (!this.checkSupport()) {
        console.warn("⚠️ Speech recognition not supported");
        return;
      }

      this.setupRecognition();
      this.registerDefaultCommands();
      this.createIndicator();
      this.addStyles();
      this.bindEvents();
      console.log("🎤 Bael Voice Commands initialized");
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

      this.recognition.lang = this.language;
      this.recognition.continuous = this.continuous;
      this.recognition.interimResults = this.interimResults;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.updateIndicator("listening");
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (!this.wakeWordActive) {
          this.updateIndicator("idle");
        } else {
          // Restart for continuous wake word listening
          this.recognition.start();
        }
      };

      this.recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        this.updateIndicator("error");
        setTimeout(() => this.updateIndicator("idle"), 2000);
      };

      this.recognition.onresult = (event) => {
        this.handleResult(event);
      };
    }

    registerDefaultCommands() {
      // Navigation commands
      this.registerCommand("new chat", () => {
        this.speak("Starting new chat");
        try {
          Alpine.store("chats")?.create();
        } catch (e) {}
      });

      this.registerCommand("open settings", () => {
        this.speak("Opening settings");
        try {
          Alpine.store("tabs")?.select("settings");
        } catch (e) {}
      });

      this.registerCommand("go back", () => {
        this.speak("Going back");
        window.history.back();
      });

      // UI commands
      this.registerCommand("toggle sidebar", () => {
        document.querySelector(".sidebar-toggle")?.click();
      });

      this.registerCommand("focus mode", () => {
        this.speak("Entering focus mode");
        window.BaelFocusMode?.toggle();
      });

      this.registerCommand("open notes", () => {
        this.speak("Opening notes");
        window.BaelNotesPanel?.toggle();
      });

      this.registerCommand("command palette", () => {
        window.BaelCommandPalette?.toggle();
      });

      this.registerCommand("search", () => {
        window.BaelChatSearch?.toggle();
      });

      this.registerCommand("export chat", () => {
        this.speak("Opening export");
        window.BaelExport?.open();
      });

      // Control commands
      this.registerCommand("stop listening", () => {
        this.speak("Goodbye");
        this.stopListening();
      });

      this.registerCommand("pause agent", () => {
        this.speak("Pausing agent");
        document.querySelector(".pause-btn")?.click();
      });

      this.registerCommand("scroll down", () => {
        const container = document.querySelector(".messages-container");
        if (container) container.scrollBy({ top: 300, behavior: "smooth" });
      });

      this.registerCommand("scroll up", () => {
        const container = document.querySelector(".messages-container");
        if (container) container.scrollBy({ top: -300, behavior: "smooth" });
      });

      this.registerCommand("scroll to top", () => {
        const container = document.querySelector(".messages-container");
        if (container) container.scrollTo({ top: 0, behavior: "smooth" });
      });

      this.registerCommand("scroll to bottom", () => {
        const container = document.querySelector(".messages-container");
        if (container)
          container.scrollTo({
            top: container.scrollHeight,
            behavior: "smooth",
          });
      });

      // Theme commands
      this.registerCommand("dark theme", () => {
        document.documentElement.setAttribute("data-theme", "bael-dark");
        localStorage.setItem("bael_theme", "bael-dark");
        this.speak("Switched to dark theme");
      });

      this.registerCommand("light theme", () => {
        document.documentElement.setAttribute("data-theme", "bael-light");
        localStorage.setItem("bael_theme", "bael-light");
        this.speak("Switched to light theme");
      });

      this.registerCommand("crimson theme", () => {
        document.documentElement.setAttribute("data-theme", "bael-crimson");
        localStorage.setItem("bael_theme", "bael-crimson");
        this.speak("Switched to crimson theme");
      });

      // Help
      this.registerCommand("help", () => {
        this.showHelp();
      });

      this.registerCommand("list commands", () => {
        this.showHelp();
      });
    }

    registerCommand(phrase, handler, options = {}) {
      this.commands.set(phrase.toLowerCase(), {
        handler,
        description: options.description || "",
        category: options.category || "general",
      });
    }

    handleResult(event) {
      let transcript = "";
      let isFinal = false;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          isFinal = true;
        }
      }

      const lowerTranscript = transcript.toLowerCase().trim();

      // Check for wake word if in wake word mode
      if (this.wakeWordActive && !this.isAwake) {
        if (lowerTranscript.includes(this.wakeWord)) {
          this.isAwake = true;
          this.updateIndicator("awake");
          this.speak("Yes?");
          // Auto-deactivate after 10 seconds
          setTimeout(() => {
            this.isAwake = false;
            this.updateIndicator("sleeping");
          }, 10000);
        }
        return;
      }

      // Update indicator with transcript
      this.updateIndicator("processing", transcript);

      if (isFinal) {
        this.processCommand(lowerTranscript);
      }
    }

    processCommand(transcript) {
      // Check for exact matches first
      if (this.commands.has(transcript)) {
        this.executeCommand(transcript);
        return;
      }

      // Check for partial matches
      for (const [phrase, cmd] of this.commands) {
        if (transcript.includes(phrase)) {
          this.executeCommand(phrase);
          return;
        }
      }

      // Check if it's a message to send
      if (transcript.startsWith("send") || transcript.startsWith("type")) {
        const message = transcript.replace(/^(send|type)\s+/, "");
        this.sendMessage(message);
        return;
      }

      // No command matched - show as transcript
      this.updateIndicator("idle");
    }

    executeCommand(phrase) {
      const cmd = this.commands.get(phrase);
      if (cmd) {
        this.updateIndicator("executing", phrase);
        try {
          cmd.handler();
        } catch (e) {
          console.error("Command execution error:", e);
        }
        setTimeout(() => this.updateIndicator("idle"), 1500);
      }
    }

    sendMessage(message) {
      // Find the input area and send
      const input =
        document.querySelector('textarea[x-model="message"]') ||
        document.querySelector(".message-input");
      if (input) {
        input.value = message;
        input.dispatchEvent(new Event("input", { bubbles: true }));

        // Try to find and click send button
        const sendBtn =
          document.querySelector(".send-btn") ||
          document.querySelector('[x-on\\:click*="send"]');
        if (sendBtn) {
          setTimeout(() => sendBtn.click(), 100);
        }

        this.speak("Sending message");
      }
    }

    speak(text) {
      if (!this.synthesis) return;

      // Cancel any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.language;
      utterance.rate = 1.1;
      utterance.pitch = 1;

      // Try to find a female voice
      const voices = this.synthesis.getVoices();
      const femaleVoice = voices.find(
        (v) =>
          v.name.includes("Female") ||
          v.name.includes("Samantha") ||
          v.name.includes("Victoria"),
      );
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      this.synthesis.speak(utterance);
    }

    createIndicator() {
      const indicator = document.createElement("div");
      indicator.id = "bael-voice-indicator";
      indicator.className = "bael-voice-indicator";
      indicator.innerHTML = `
                <div class="voice-orb">
                    <div class="orb-ring"></div>
                    <div class="orb-core">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                            <line x1="12" y1="19" x2="12" y2="23"/>
                            <line x1="8" y1="23" x2="16" y2="23"/>
                        </svg>
                    </div>
                </div>
                <div class="voice-transcript" id="voice-transcript"></div>
                <div class="voice-status" id="voice-status">Click or say "${this.wakeWord}"</div>
                <button class="voice-close" id="voice-close">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            `;
      document.body.appendChild(indicator);
      this.indicator = indicator;
    }

    addStyles() {
      if (document.getElementById("bael-voice-commands-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-voice-commands-styles";
      styles.textContent = `
                .bael-voice-indicator {
                    position: fixed;
                    bottom: 100px;
                    left: 50%;
                    transform: translateX(-50%);
                    display: none;
                    flex-direction: column;
                    align-items: center;
                    gap: 16px;
                    padding: 20px 30px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 20px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                    z-index: 100002;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                }

                .bael-voice-indicator.active {
                    display: flex;
                    animation: voiceSlideUp 0.3s ease;
                }

                @keyframes voiceSlideUp {
                    from {
                        opacity: 0;
                        transform: translateX(-50%) translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(-50%) translateY(0);
                    }
                }

                .voice-orb {
                    position: relative;
                    width: 80px;
                    height: 80px;
                    cursor: pointer;
                }

                .orb-ring {
                    position: absolute;
                    inset: 0;
                    border: 3px solid var(--bael-accent, #ff3366);
                    border-radius: 50%;
                    opacity: 0.3;
                }

                .listening .orb-ring {
                    animation: orbPulse 1.5s ease-in-out infinite;
                }

                @keyframes orbPulse {
                    0%, 100% {
                        transform: scale(1);
                        opacity: 0.3;
                    }
                    50% {
                        transform: scale(1.3);
                        opacity: 0;
                    }
                }

                .orb-core {
                    position: absolute;
                    inset: 10px;
                    background: linear-gradient(135deg, var(--bael-accent, #ff3366), #ff6b8a);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                }

                .orb-core svg {
                    width: 32px;
                    height: 32px;
                    color: #fff;
                }

                .listening .orb-core {
                    animation: orbBreathing 1s ease-in-out infinite alternate;
                }

                @keyframes orbBreathing {
                    from { transform: scale(1); }
                    to { transform: scale(1.05); }
                }

                .processing .orb-core {
                    background: linear-gradient(135deg, #2196f3, #64b5f6);
                    animation: orbSpin 1s linear infinite;
                }

                @keyframes orbSpin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .executing .orb-core {
                    background: linear-gradient(135deg, #4caf50, #81c784);
                }

                .error .orb-core {
                    background: linear-gradient(135deg, #f44336, #e57373);
                }

                .voice-transcript {
                    font-size: 16px;
                    font-weight: 500;
                    color: var(--bael-text-primary, #fff);
                    text-align: center;
                    max-width: 300px;
                    min-height: 24px;
                }

                .voice-status {
                    font-size: 12px;
                    color: var(--bael-text-muted, #666);
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .listening .voice-status {
                    color: var(--bael-accent, #ff3366);
                }

                .voice-close {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    width: 24px;
                    height: 24px;
                    border: none;
                    background: transparent;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    border-radius: 6px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }

                .voice-close:hover {
                    background: rgba(255, 255, 255, 0.1);
                    color: var(--bael-text-primary, #fff);
                }

                .voice-close svg {
                    width: 14px;
                    height: 14px;
                }

                /* Floating mic button */
                .bael-voice-trigger {
                    position: fixed;
                    bottom: 20px;
                    left: 20px;
                    width: 56px;
                    height: 56px;
                    background: var(--bael-accent, #ff3366);
                    border: none;
                    border-radius: 50%;
                    box-shadow: 0 4px 20px rgba(255, 51, 102, 0.4);
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9990;
                    transition: all 0.3s ease;
                }

                .bael-voice-trigger:hover {
                    transform: scale(1.05);
                    box-shadow: 0 6px 30px rgba(255, 51, 102, 0.5);
                }

                .bael-voice-trigger svg {
                    width: 24px;
                    height: 24px;
                    color: #fff;
                }

                .bael-voice-trigger.listening {
                    animation: triggerPulse 1.5s ease-in-out infinite;
                }

                @keyframes triggerPulse {
                    0%, 100% { box-shadow: 0 4px 20px rgba(255, 51, 102, 0.4); }
                    50% { box-shadow: 0 4px 40px rgba(255, 51, 102, 0.8); }
                }
            `;
      document.head.appendChild(styles);
    }

    bindEvents() {
      // Close button
      this.indicator
        .querySelector("#voice-close")
        .addEventListener("click", () => {
          this.stopListening();
        });

      // Click on orb to toggle
      this.indicator
        .querySelector(".voice-orb")
        .addEventListener("click", () => {
          if (this.isListening) {
            this.stopListening();
          } else {
            this.startListening();
          }
        });

      // Create floating trigger button
      this.createTriggerButton();

      // Keyboard shortcut
      document.addEventListener("keydown", (e) => {
        // Ctrl+Shift+V to toggle voice
        if (e.ctrlKey && e.shiftKey && e.key === "V") {
          e.preventDefault();
          this.toggle();
        }
      });
    }

    createTriggerButton() {
      const trigger = document.createElement("button");
      trigger.className = "bael-voice-trigger";
      trigger.title = "Voice Commands (Ctrl+Shift+V)";
      trigger.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                    <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
            `;
      trigger.addEventListener("click", () => this.toggle());
      document.body.appendChild(trigger);
      this.triggerButton = trigger;
    }

    updateIndicator(state, transcript = "") {
      const states = [
        "idle",
        "listening",
        "processing",
        "executing",
        "error",
        "awake",
        "sleeping",
      ];
      states.forEach((s) => this.indicator.classList.remove(s));
      this.indicator.classList.add(state);

      const transcriptEl = this.indicator.querySelector("#voice-transcript");
      const statusEl = this.indicator.querySelector("#voice-status");

      if (transcript) {
        transcriptEl.textContent = transcript;
      }

      switch (state) {
        case "listening":
          statusEl.textContent = "Listening...";
          break;
        case "processing":
          statusEl.textContent = "Processing...";
          break;
        case "executing":
          statusEl.textContent = `Executing: ${transcript}`;
          break;
        case "error":
          statusEl.textContent = "Error - Try again";
          break;
        case "awake":
          statusEl.textContent = "Listening for command...";
          break;
        case "sleeping":
          statusEl.textContent = `Say "${this.wakeWord}" to wake`;
          break;
        default:
          statusEl.textContent = "Ready";
      }

      // Update trigger button
      if (this.triggerButton) {
        this.triggerButton.classList.toggle("listening", state === "listening");
      }
    }

    showHelp() {
      const commands = Array.from(this.commands.entries())
        .map(([phrase, cmd]) => `• "${phrase}"`)
        .join("\n");

      if (window.BaelNotifications) {
        window.BaelNotifications.info(`Available commands:\n${commands}`, {
          title: "Voice Commands",
          duration: 10000,
        });
      }

      this.speak(
        "Here are some commands you can say. New chat. Open settings. Focus mode. Search. And more.",
      );
    }

    // Public API
    startListening() {
      if (!this.recognition) return;

      this.indicator.classList.add("active");
      this.recognition.start();
    }

    stopListening() {
      if (!this.recognition) return;

      this.isListening = false;
      this.wakeWordActive = false;
      this.recognition.stop();
      this.indicator.classList.remove("active");
      this.updateIndicator("idle");
    }

    toggle() {
      if (this.indicator.classList.contains("active")) {
        this.stopListening();
      } else {
        this.startListening();
      }
    }

    enableWakeWord() {
      this.wakeWordActive = true;
      this.isAwake = false;
      this.indicator.classList.add("active");
      this.updateIndicator("sleeping");
      this.recognition.start();
    }

    setLanguage(lang) {
      this.language = lang;
      if (this.recognition) {
        this.recognition.lang = lang;
      }
    }

    setWakeWord(word) {
      this.wakeWord = word.toLowerCase();
    }
  }

  // Initialize
  window.BaelVoiceCommands = new BaelVoiceCommands();
})();
