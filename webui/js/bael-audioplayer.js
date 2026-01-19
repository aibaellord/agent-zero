/**
 * BAEL Audio Player Component - Lord Of All Sound
 *
 * Custom audio player:
 * - Play/pause controls
 * - Progress bar with seek
 * - Volume control
 * - Playback speed
 * - Waveform visualization
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // AUDIO PLAYER CLASS
  // ============================================================

  class BaelAudioPlayer {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-audio-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-audio-styles";
      styles.textContent = `
                .bael-audio {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    padding: 16px;
                    background: linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
                    border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 12px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }

                .bael-audio-info {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .bael-audio-artwork {
                    width: 48px;
                    height: 48px;
                    border-radius: 8px;
                    background: rgba(255,255,255,0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    flex-shrink: 0;
                }

                .bael-audio-artwork img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .bael-audio-artwork svg {
                    width: 24px;
                    height: 24px;
                    color: #666;
                }

                .bael-audio-meta {
                    flex: 1;
                    min-width: 0;
                }

                .bael-audio-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: white;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .bael-audio-artist {
                    font-size: 12px;
                    color: #888;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                /* Controls */
                .bael-audio-controls {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .bael-audio-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 40px;
                    height: 40px;
                    background: rgba(255,255,255,0.1);
                    border: none;
                    border-radius: 50%;
                    color: white;
                    cursor: pointer;
                    transition: all 0.15s;
                }

                .bael-audio-btn:hover {
                    background: rgba(255,255,255,0.15);
                    transform: scale(1.05);
                }

                .bael-audio-btn svg {
                    width: 18px;
                    height: 18px;
                }

                .bael-audio-play {
                    width: 48px;
                    height: 48px;
                    background: #3b82f6;
                }

                .bael-audio-play:hover {
                    background: #2563eb;
                }

                .bael-audio-play svg {
                    width: 22px;
                    height: 22px;
                }

                .bael-audio-btn-sm {
                    width: 32px;
                    height: 32px;
                }

                .bael-audio-btn-sm svg {
                    width: 14px;
                    height: 14px;
                }

                /* Progress */
                .bael-audio-progress-container {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .bael-audio-progress {
                    position: relative;
                    height: 6px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 3px;
                    cursor: pointer;
                    overflow: hidden;
                }

                .bael-audio-progress-bar {
                    position: absolute;
                    top: 0;
                    left: 0;
                    height: 100%;
                    background: #3b82f6;
                    border-radius: 3px;
                    width: 0%;
                    transition: width 0.1s linear;
                }

                .bael-audio-buffered {
                    position: absolute;
                    top: 0;
                    left: 0;
                    height: 100%;
                    background: rgba(255,255,255,0.15);
                    border-radius: 3px;
                }

                .bael-audio-progress-thumb {
                    position: absolute;
                    top: 50%;
                    width: 14px;
                    height: 14px;
                    background: white;
                    border-radius: 50%;
                    transform: translate(-50%, -50%);
                    opacity: 0;
                    transition: opacity 0.15s;
                    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
                }

                .bael-audio-progress:hover .bael-audio-progress-thumb {
                    opacity: 1;
                }

                .bael-audio-times {
                    display: flex;
                    justify-content: space-between;
                    font-size: 11px;
                    color: #666;
                    font-variant-numeric: tabular-nums;
                }

                /* Volume */
                .bael-audio-volume {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .bael-audio-volume-slider {
                    width: 80px;
                    height: 4px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 2px;
                    cursor: pointer;
                    position: relative;
                }

                .bael-audio-volume-bar {
                    height: 100%;
                    background: white;
                    border-radius: 2px;
                    width: 100%;
                }

                /* Speed */
                .bael-audio-speed {
                    padding: 4px 10px;
                    background: rgba(255,255,255,0.1);
                    border: none;
                    border-radius: 4px;
                    color: #ccc;
                    font-size: 12px;
                    cursor: pointer;
                    transition: all 0.15s;
                }

                .bael-audio-speed:hover {
                    background: rgba(255,255,255,0.15);
                    color: white;
                }

                /* Waveform */
                .bael-audio-waveform {
                    height: 40px;
                    display: flex;
                    align-items: center;
                    gap: 2px;
                    cursor: pointer;
                }

                .bael-audio-waveform-bar {
                    flex: 1;
                    background: rgba(255,255,255,0.2);
                    border-radius: 1px;
                    transition: background 0.15s;
                }

                .bael-audio-waveform-bar.played {
                    background: #3b82f6;
                }

                /* Compact variant */
                .bael-audio.compact {
                    flex-direction: row;
                    padding: 12px;
                }

                .bael-audio.compact .bael-audio-info {
                    display: none;
                }

                .bael-audio.compact .bael-audio-progress-container {
                    display: none;
                }

                .bael-audio.compact .bael-audio-times {
                    font-size: 12px;
                    color: #888;
                }

                /* Minimal variant */
                .bael-audio.minimal {
                    padding: 8px;
                    background: none;
                    border: none;
                }

                .bael-audio.minimal .bael-audio-play {
                    width: 36px;
                    height: 36px;
                }

                .bael-audio.minimal .bael-audio-play svg {
                    width: 16px;
                    height: 16px;
                }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // CREATE AUDIO PLAYER
    // ============================================================

    /**
     * Create audio player
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Audio container not found");
        return null;
      }

      const id = `bael-audio-${++this.idCounter}`;
      const config = {
        src: "",
        title: "Untitled",
        artist: "",
        artwork: null,
        variant: "default", // default, compact, minimal
        showWaveform: false,
        showVolume: true,
        showSpeed: true,
        showSkip: true,
        skipAmount: 10,
        speeds: [0.5, 0.75, 1, 1.25, 1.5, 2],
        autoplay: false,
        loop: false,
        onPlay: null,
        onPause: null,
        onEnd: null,
        onTimeUpdate: null,
        ...options,
      };

      const el = document.createElement("div");
      el.className = `bael-audio${config.variant !== "default" ? ` ${config.variant}` : ""}`;
      el.id = id;

      // Create audio element
      const audio = document.createElement("audio");
      audio.src = config.src;
      audio.loop = config.loop;
      audio.preload = "metadata";

      const state = {
        id,
        element: el,
        audio,
        container,
        config,
        playing: false,
        currentTime: 0,
        duration: 0,
        volume: 1,
        speed: 1,
        speedIndex: config.speeds.indexOf(1),
      };

      this._render(state);
      this._setupAudioEvents(state);
      container.appendChild(el);

      if (config.autoplay) {
        audio.play().catch(() => {});
      }

      this.instances.set(id, state);

      return {
        id,
        play: () => this._play(state),
        pause: () => this._pause(state),
        toggle: () => this._toggle(state),
        seek: (time) => this._seek(state, time),
        setVolume: (vol) => this._setVolume(state, vol),
        setSpeed: (speed) => this._setSpeed(state, speed),
        setSrc: (src) => this._setSrc(state, src),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Render player UI
     */
    _render(state) {
      const { element, config } = state;

      element.innerHTML = "";

      // Info section (title, artist, artwork)
      if (config.variant === "default") {
        const info = document.createElement("div");
        info.className = "bael-audio-info";

        const artwork = document.createElement("div");
        artwork.className = "bael-audio-artwork";
        if (config.artwork) {
          artwork.innerHTML = `<img src="${config.artwork}" alt="">`;
        } else {
          artwork.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>`;
        }
        info.appendChild(artwork);

        const meta = document.createElement("div");
        meta.className = "bael-audio-meta";
        meta.innerHTML = `
                    <div class="bael-audio-title">${config.title}</div>
                    ${config.artist ? `<div class="bael-audio-artist">${config.artist}</div>` : ""}
                `;
        info.appendChild(meta);

        element.appendChild(info);
      }

      // Controls
      const controls = document.createElement("div");
      controls.className = "bael-audio-controls";

      // Skip back
      if (config.showSkip && config.variant !== "minimal") {
        const skipBack = document.createElement("button");
        skipBack.type = "button";
        skipBack.className = "bael-audio-btn bael-audio-btn-sm";
        skipBack.title = `Back ${config.skipAmount}s`;
        skipBack.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg>`;
        skipBack.addEventListener("click", () =>
          this._skip(state, -config.skipAmount),
        );
        controls.appendChild(skipBack);
      }

      // Play/Pause
      const playBtn = document.createElement("button");
      playBtn.type = "button";
      playBtn.className = "bael-audio-btn bael-audio-play";
      playBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
      playBtn.addEventListener("click", () => this._toggle(state));
      state.playBtn = playBtn;
      controls.appendChild(playBtn);

      // Skip forward
      if (config.showSkip && config.variant !== "minimal") {
        const skipForward = document.createElement("button");
        skipForward.type = "button";
        skipForward.className = "bael-audio-btn bael-audio-btn-sm";
        skipForward.title = `Forward ${config.skipAmount}s`;
        skipForward.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>`;
        skipForward.addEventListener("click", () =>
          this._skip(state, config.skipAmount),
        );
        controls.appendChild(skipForward);
      }

      // Progress
      if (config.variant !== "compact") {
        const progressContainer = document.createElement("div");
        progressContainer.className = "bael-audio-progress-container";

        const progress = document.createElement("div");
        progress.className = "bael-audio-progress";
        progress.innerHTML = `
                    <div class="bael-audio-buffered"></div>
                    <div class="bael-audio-progress-bar"></div>
                    <div class="bael-audio-progress-thumb"></div>
                `;
        progress.addEventListener("click", (e) =>
          this._onProgressClick(state, e),
        );
        state.progressEl = progress;
        state.progressBar = progress.querySelector(".bael-audio-progress-bar");
        state.progressThumb = progress.querySelector(
          ".bael-audio-progress-thumb",
        );
        state.bufferedEl = progress.querySelector(".bael-audio-buffered");
        progressContainer.appendChild(progress);

        const times = document.createElement("div");
        times.className = "bael-audio-times";
        times.innerHTML = `
                    <span class="bael-audio-current">0:00</span>
                    <span class="bael-audio-duration">0:00</span>
                `;
        state.currentTimeEl = times.querySelector(".bael-audio-current");
        state.durationEl = times.querySelector(".bael-audio-duration");
        progressContainer.appendChild(times);

        controls.appendChild(progressContainer);
      } else {
        // Compact time display
        const time = document.createElement("span");
        time.className = "bael-audio-times";
        time.textContent = "0:00";
        state.currentTimeEl = time;
        controls.appendChild(time);
      }

      // Volume
      if (config.showVolume && config.variant !== "minimal") {
        const volume = document.createElement("div");
        volume.className = "bael-audio-volume";

        const volumeBtn = document.createElement("button");
        volumeBtn.type = "button";
        volumeBtn.className = "bael-audio-btn bael-audio-btn-sm";
        volumeBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>`;
        volumeBtn.addEventListener("click", () => this._toggleMute(state));
        state.volumeBtn = volumeBtn;
        volume.appendChild(volumeBtn);

        const volumeSlider = document.createElement("div");
        volumeSlider.className = "bael-audio-volume-slider";
        volumeSlider.innerHTML = '<div class="bael-audio-volume-bar"></div>';
        volumeSlider.addEventListener("click", (e) =>
          this._onVolumeClick(state, e),
        );
        state.volumeSlider = volumeSlider;
        state.volumeBar = volumeSlider.querySelector(".bael-audio-volume-bar");
        volume.appendChild(volumeSlider);

        controls.appendChild(volume);
      }

      // Speed
      if (config.showSpeed && config.variant !== "minimal") {
        const speedBtn = document.createElement("button");
        speedBtn.type = "button";
        speedBtn.className = "bael-audio-speed";
        speedBtn.textContent = "1x";
        speedBtn.addEventListener("click", () => this._cycleSpeed(state));
        state.speedBtn = speedBtn;
        controls.appendChild(speedBtn);
      }

      element.appendChild(controls);

      // Waveform
      if (config.showWaveform) {
        const waveform = document.createElement("div");
        waveform.className = "bael-audio-waveform";
        // Generate random waveform bars
        const barCount = 50;
        for (let i = 0; i < barCount; i++) {
          const bar = document.createElement("div");
          bar.className = "bael-audio-waveform-bar";
          bar.style.height = `${20 + Math.random() * 80}%`;
          waveform.appendChild(bar);
        }
        waveform.addEventListener("click", (e) =>
          this._onWaveformClick(state, e),
        );
        state.waveformEl = waveform;
        element.appendChild(waveform);
      }
    }

    /**
     * Setup audio events
     */
    _setupAudioEvents(state) {
      const { audio, config } = state;

      audio.addEventListener("loadedmetadata", () => {
        state.duration = audio.duration;
        if (state.durationEl) {
          state.durationEl.textContent = this._formatTime(audio.duration);
        }
      });

      audio.addEventListener("timeupdate", () => {
        state.currentTime = audio.currentTime;
        this._updateProgress(state);
        if (config.onTimeUpdate) config.onTimeUpdate(audio.currentTime);
      });

      audio.addEventListener("progress", () => {
        this._updateBuffered(state);
      });

      audio.addEventListener("play", () => {
        state.playing = true;
        this._updatePlayButton(state);
        if (config.onPlay) config.onPlay();
      });

      audio.addEventListener("pause", () => {
        state.playing = false;
        this._updatePlayButton(state);
        if (config.onPause) config.onPause();
      });

      audio.addEventListener("ended", () => {
        state.playing = false;
        this._updatePlayButton(state);
        if (config.onEnd) config.onEnd();
      });
    }

    /**
     * Update progress bar
     */
    _updateProgress(state) {
      const { audio, progressBar, progressThumb, currentTimeEl, waveformEl } =
        state;
      const percent = (audio.currentTime / audio.duration) * 100 || 0;

      if (progressBar) {
        progressBar.style.width = `${percent}%`;
      }

      if (progressThumb) {
        progressThumb.style.left = `${percent}%`;
      }

      if (currentTimeEl) {
        currentTimeEl.textContent = this._formatTime(audio.currentTime);
      }

      // Update waveform
      if (waveformEl) {
        const bars = waveformEl.querySelectorAll(".bael-audio-waveform-bar");
        const playedCount = Math.floor((percent / 100) * bars.length);
        bars.forEach((bar, i) => {
          bar.classList.toggle("played", i < playedCount);
        });
      }
    }

    /**
     * Update buffered progress
     */
    _updateBuffered(state) {
      const { audio, bufferedEl } = state;
      if (!bufferedEl || !audio.buffered.length) return;

      const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
      const percent = (bufferedEnd / audio.duration) * 100;
      bufferedEl.style.width = `${percent}%`;
    }

    /**
     * Update play button icon
     */
    _updatePlayButton(state) {
      const { playBtn, playing } = state;
      if (playing) {
        playBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>`;
      } else {
        playBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
      }
    }

    /**
     * Format time
     */
    _formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    }

    // ============================================================
    // CONTROLS
    // ============================================================

    _play(state) {
      state.audio.play().catch(() => {});
    }

    _pause(state) {
      state.audio.pause();
    }

    _toggle(state) {
      if (state.playing) {
        this._pause(state);
      } else {
        this._play(state);
      }
    }

    _skip(state, seconds) {
      state.audio.currentTime = Math.max(
        0,
        Math.min(state.duration, state.audio.currentTime + seconds),
      );
    }

    _seek(state, time) {
      state.audio.currentTime = Math.max(0, Math.min(state.duration, time));
    }

    _setVolume(state, vol) {
      state.volume = Math.max(0, Math.min(1, vol));
      state.audio.volume = state.volume;

      if (state.volumeBar) {
        state.volumeBar.style.width = `${state.volume * 100}%`;
      }

      this._updateVolumeIcon(state);
    }

    _toggleMute(state) {
      if (state.audio.volume > 0) {
        state.lastVolume = state.audio.volume;
        this._setVolume(state, 0);
      } else {
        this._setVolume(state, state.lastVolume || 1);
      }
    }

    _updateVolumeIcon(state) {
      if (!state.volumeBtn) return;

      const vol = state.audio.volume;
      let icon;

      if (vol === 0) {
        icon = `<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>`;
      } else if (vol < 0.5) {
        icon = `<path d="M7 9v6h4l5 5V4l-5 5H7z"/>`;
      } else {
        icon = `<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>`;
      }

      state.volumeBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor">${icon}</svg>`;
    }

    _setSpeed(state, speed) {
      state.speed = speed;
      state.audio.playbackRate = speed;
      if (state.speedBtn) {
        state.speedBtn.textContent = `${speed}x`;
      }
    }

    _cycleSpeed(state) {
      const speeds = state.config.speeds;
      state.speedIndex = (state.speedIndex + 1) % speeds.length;
      this._setSpeed(state, speeds[state.speedIndex]);
    }

    _setSrc(state, src) {
      state.audio.src = src;
      state.audio.load();
    }

    // ============================================================
    // EVENT HANDLERS
    // ============================================================

    _onProgressClick(state, e) {
      const rect = state.progressEl.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      this._seek(state, percent * state.duration);
    }

    _onVolumeClick(state, e) {
      const rect = state.volumeSlider.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      this._setVolume(state, percent);
    }

    _onWaveformClick(state, e) {
      const rect = state.waveformEl.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      this._seek(state, percent * state.duration);
    }

    /**
     * Destroy player
     */
    destroy(id) {
      const state = this.instances.get(id);
      if (!state) return;

      state.audio.pause();
      state.audio.src = "";
      state.element.remove();
      this.instances.delete(id);
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelAudioPlayer();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$audio = (container, options) => bael.create(container, options);
  window.$audioPlayer = window.$audio;

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelAudioPlayer = bael;

  console.log("🎵 BAEL Audio Player Component loaded");
})();
