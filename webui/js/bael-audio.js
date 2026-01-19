/**
 * BAEL - LORD OF ALL
 * Audio & Sound Effects System - Immersive audio feedback
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelAudio {
    constructor() {
      this.enabled = this.loadPreference("bael_audio_enabled", false);
      this.volume = this.loadPreference("bael_audio_volume", 0.3);
      this.audioContext = null;
      this.sounds = {};
      this.initialized = false;
      this.init();
    }

    init() {
      this.createSounds();
      this.registerEvents();
      console.log("⚡ Bael Audio System initialized");
    }

    initAudioContext() {
      if (this.audioContext) return;

      try {
        this.audioContext = new (
          window.AudioContext || window.webkitAudioContext
        )();
        this.masterGain = this.audioContext.createGain();
        this.masterGain.gain.value = this.volume;
        this.masterGain.connect(this.audioContext.destination);
        this.initialized = true;
      } catch (e) {
        console.warn("Web Audio API not supported");
      }
    }

    createSounds() {
      // Define synthesized sound profiles
      this.soundProfiles = {
        // Message sent
        send: {
          type: "sine",
          frequency: [440, 554, 659],
          duration: 0.15,
          attack: 0.01,
          decay: 0.1,
        },

        // Message received
        receive: {
          type: "sine",
          frequency: [659, 554, 440],
          duration: 0.2,
          attack: 0.02,
          decay: 0.15,
        },

        // Notification
        notify: {
          type: "sine",
          frequency: [880, 1047],
          duration: 0.3,
          attack: 0.01,
          decay: 0.25,
        },

        // Success
        success: {
          type: "sine",
          frequency: [523, 659, 784],
          duration: 0.4,
          attack: 0.02,
          decay: 0.3,
        },

        // Error
        error: {
          type: "square",
          frequency: [220, 196],
          duration: 0.3,
          attack: 0.01,
          decay: 0.25,
        },

        // Warning
        warning: {
          type: "triangle",
          frequency: [440, 349],
          duration: 0.25,
          attack: 0.02,
          decay: 0.2,
        },

        // Click
        click: {
          type: "sine",
          frequency: [1200],
          duration: 0.05,
          attack: 0.005,
          decay: 0.04,
        },

        // Hover
        hover: {
          type: "sine",
          frequency: [800],
          duration: 0.03,
          attack: 0.005,
          decay: 0.02,
        },

        // Toggle on
        toggleOn: {
          type: "sine",
          frequency: [400, 600],
          duration: 0.1,
          attack: 0.01,
          decay: 0.08,
        },

        // Toggle off
        toggleOff: {
          type: "sine",
          frequency: [600, 400],
          duration: 0.1,
          attack: 0.01,
          decay: 0.08,
        },

        // Open modal/panel
        open: {
          type: "sine",
          frequency: [300, 400, 500],
          duration: 0.2,
          attack: 0.02,
          decay: 0.15,
        },

        // Close modal/panel
        close: {
          type: "sine",
          frequency: [500, 400, 300],
          duration: 0.15,
          attack: 0.01,
          decay: 0.12,
        },

        // AI thinking pulse
        thinking: {
          type: "sine",
          frequency: [220, 277, 330],
          duration: 0.8,
          attack: 0.1,
          decay: 0.6,
          loop: true,
        },

        // Complete/done
        complete: {
          type: "sine",
          frequency: [523, 659, 784, 1047],
          duration: 0.5,
          attack: 0.02,
          decay: 0.4,
        },

        // Typing indicator
        typing: {
          type: "sine",
          frequency: [600],
          duration: 0.02,
          attack: 0.005,
          decay: 0.015,
        },

        // Power up (startup sound)
        powerUp: {
          type: "sine",
          frequency: [100, 150, 200, 300, 400, 500, 600, 800],
          duration: 1.5,
          attack: 0.1,
          decay: 1.2,
        },

        // Ambient drone (background)
        ambient: {
          type: "sine",
          frequency: [55, 82.5, 110],
          duration: 10,
          attack: 2,
          decay: 6,
          loop: true,
        },
      };
    }

    play(soundName, options = {}) {
      if (!this.enabled) return;

      // Initialize on first interaction
      if (!this.initialized) {
        this.initAudioContext();
      }

      if (!this.audioContext || this.audioContext.state === "suspended") {
        this.audioContext?.resume();
      }

      const profile = this.soundProfiles[soundName];
      if (!profile) {
        console.warn(`Sound "${soundName}" not found`);
        return;
      }

      this.synthesizeSound(profile, options);
    }

    synthesizeSound(profile, options = {}) {
      const ctx = this.audioContext;
      if (!ctx) return;

      const now = ctx.currentTime;
      const duration = options.duration || profile.duration;
      const frequencies = profile.frequency;

      // Create gain envelope
      const gainNode = ctx.createGain();
      gainNode.connect(this.masterGain);

      // ADSR envelope
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.8, now + profile.attack);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

      // Create oscillators for each frequency
      frequencies.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        osc.type = profile.type;

        // Slight detuning for richness
        osc.frequency.setValueAtTime(freq, now);

        // If multiple frequencies, create arpeggio effect
        if (frequencies.length > 1) {
          const delay = (index * duration) / frequencies.length;
          osc.frequency.setValueAtTime(freq, now + delay);
        }

        // Add filter for smoothness
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 2000;

        osc.connect(filter);
        filter.connect(gainNode);

        osc.start(now + index * 0.05);
        osc.stop(now + duration + 0.1);
      });
    }

    playSequence(notes, tempo = 120) {
      if (!this.enabled) return;

      const beatDuration = 60 / tempo;
      notes.forEach((note, index) => {
        setTimeout(
          () => {
            this.play(note.sound || "click");
          },
          index * beatDuration * 1000,
        );
      });
    }

    // Ambient background sound
    startAmbient() {
      if (!this.enabled || this.ambientPlaying) return;

      this.initAudioContext();
      if (!this.audioContext) return;

      const ctx = this.audioContext;
      const now = ctx.currentTime;

      this.ambientOscillators = [];
      this.ambientGain = ctx.createGain();
      this.ambientGain.gain.value = 0.05;
      this.ambientGain.connect(this.masterGain);

      // Create layered drones
      [55, 82.5, 110, 165].forEach((freq) => {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = freq;

        // Add slight modulation
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.1;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 2;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);
        lfo.start();

        osc.connect(this.ambientGain);
        osc.start();
        this.ambientOscillators.push({ osc, lfo });
      });

      this.ambientPlaying = true;
    }

    stopAmbient() {
      if (!this.ambientPlaying) return;

      this.ambientOscillators?.forEach(({ osc, lfo }) => {
        osc.stop();
        lfo.stop();
      });

      this.ambientOscillators = [];
      this.ambientPlaying = false;
    }

    registerEvents() {
      // Auto-play sounds on various UI events
      document.addEventListener("click", (e) => {
        if (!this.enabled) return;

        const target = e.target;

        // Button clicks
        if (target.matches('button, .btn, [role="button"]')) {
          this.play("click");
        }

        // Toggle switches
        if (target.matches('input[type="checkbox"]')) {
          this.play(target.checked ? "toggleOn" : "toggleOff");
        }
      });

      // Bael-specific events
      window.addEventListener("bael:notification:show", (e) => {
        const type = e.detail?.type || "info";
        if (type === "success") this.play("success");
        else if (type === "error") this.play("error");
        else if (type === "warning") this.play("warning");
        else this.play("notify");
      });

      window.addEventListener("bael:message:sent", () => {
        this.play("send");
      });

      window.addEventListener("bael:message:received", () => {
        this.play("receive");
      });

      window.addEventListener("bael:thinking:start", () => {
        this.startThinking();
      });

      window.addEventListener("bael:thinking:end", () => {
        this.stopThinking();
        this.play("complete");
      });

      window.addEventListener("bael:modal:open", () => {
        this.play("open");
      });

      window.addEventListener("bael:modal:close", () => {
        this.play("close");
      });
    }

    startThinking() {
      if (this.thinkingInterval) return;

      let phase = 0;
      this.thinkingInterval = setInterval(() => {
        if (this.enabled) {
          const freq = 200 + Math.sin(phase) * 50;
          this.synthesizeSound({
            type: "sine",
            frequency: [freq],
            duration: 0.3,
            attack: 0.1,
            decay: 0.2,
          });
          phase += 0.5;
        }
      }, 500);
    }

    stopThinking() {
      if (this.thinkingInterval) {
        clearInterval(this.thinkingInterval);
        this.thinkingInterval = null;
      }
    }

    // Settings
    setEnabled(enabled) {
      this.enabled = enabled;
      this.savePreference("bael_audio_enabled", enabled);

      if (enabled) {
        this.play("powerUp");
      } else {
        this.stopAmbient();
        this.stopThinking();
      }
    }

    setVolume(volume) {
      this.volume = Math.max(0, Math.min(1, volume));
      this.savePreference("bael_audio_volume", this.volume);

      if (this.masterGain) {
        this.masterGain.gain.value = this.volume;
      }
    }

    toggle() {
      this.setEnabled(!this.enabled);
      return this.enabled;
    }

    loadPreference(key, defaultValue) {
      try {
        const saved = localStorage.getItem(key);
        return saved !== null ? JSON.parse(saved) : defaultValue;
      } catch (e) {
        return defaultValue;
      }
    }

    savePreference(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {}
    }

    // Create settings UI
    createSettingsUI() {
      return `
                <div class="audio-settings">
                    <div class="audio-setting">
                        <label class="setting-label">
                            <input type="checkbox" ${this.enabled ? "checked" : ""}
                                   onchange="window.BaelAudio.setEnabled(this.checked)">
                            <span>Enable Sound Effects</span>
                        </label>
                    </div>
                    <div class="audio-setting">
                        <label class="setting-label">Volume</label>
                        <input type="range" min="0" max="1" step="0.1" value="${this.volume}"
                               onchange="window.BaelAudio.setVolume(parseFloat(this.value))">
                    </div>
                    <div class="audio-preview">
                        <button onclick="window.BaelAudio.play('notify')">Test</button>
                    </div>
                </div>
            `;
    }
  }

  // Initialize
  window.BaelAudio = new BaelAudio();

  // Register with command palette
  if (window.BaelCommandPalette) {
    window.BaelCommandPalette.registerCommand({
      id: "audio:toggle",
      title: "Toggle Sound Effects",
      category: "Settings",
      handler: () => {
        const enabled = window.BaelAudio.toggle();
        if (window.Bael?.notifications) {
          window.Bael.notifications.info(
            `Sound effects ${enabled ? "enabled" : "disabled"}`,
          );
        }
      },
    });
  }
})();
