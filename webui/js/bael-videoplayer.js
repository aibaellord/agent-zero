/**
 * BAEL Video Player Component - Lord Of All Vision
 *
 * Custom video player:
 * - Play/pause/seek controls
 * - Fullscreen support
 * - Picture-in-picture
 * - Quality selector
 * - Subtitles support
 *
 * @version 1.0.0
 * @author Bael Framework
 */

(function () {
  "use strict";

  // ============================================================
  // VIDEO PLAYER CLASS
  // ============================================================

  class BaelVideoPlayer {
    constructor() {
      this.instances = new Map();
      this.idCounter = 0;
      this._injectStyles();
    }

    /**
     * Inject component styles
     */
    _injectStyles() {
      if (document.getElementById("bael-video-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-video-styles";
      styles.textContent = `
                .bael-video {
                    position: relative;
                    background: #000;
                    border-radius: 12px;
                    overflow: hidden;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                }

                .bael-video video {
                    width: 100%;
                    display: block;
                }

                /* Controls overlay */
                .bael-video-controls {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(transparent, rgba(0,0,0,0.8));
                    padding: 40px 16px 16px;
                    opacity: 0;
                    transition: opacity 0.3s;
                }

                .bael-video:hover .bael-video-controls,
                .bael-video.paused .bael-video-controls,
                .bael-video-controls:focus-within {
                    opacity: 1;
                }

                /* Progress bar */
                .bael-video-progress {
                    position: relative;
                    height: 4px;
                    background: rgba(255,255,255,0.2);
                    border-radius: 2px;
                    cursor: pointer;
                    margin-bottom: 12px;
                    transition: height 0.15s;
                }

                .bael-video-progress:hover {
                    height: 6px;
                }

                .bael-video-progress-buffered {
                    position: absolute;
                    top: 0;
                    left: 0;
                    height: 100%;
                    background: rgba(255,255,255,0.3);
                    border-radius: 2px;
                }

                .bael-video-progress-bar {
                    position: absolute;
                    top: 0;
                    left: 0;
                    height: 100%;
                    background: #ef4444;
                    border-radius: 2px;
                }

                .bael-video-progress-thumb {
                    position: absolute;
                    top: 50%;
                    width: 14px;
                    height: 14px;
                    background: #ef4444;
                    border-radius: 50%;
                    transform: translate(-50%, -50%) scale(0);
                    transition: transform 0.15s;
                }

                .bael-video-progress:hover .bael-video-progress-thumb {
                    transform: translate(-50%, -50%) scale(1);
                }

                .bael-video-progress-tooltip {
                    position: absolute;
                    bottom: 20px;
                    padding: 4px 8px;
                    background: rgba(0,0,0,0.8);
                    border-radius: 4px;
                    color: white;
                    font-size: 12px;
                    transform: translateX(-50%);
                    pointer-events: none;
                    opacity: 0;
                    transition: opacity 0.15s;
                }

                .bael-video-progress:hover .bael-video-progress-tooltip {
                    opacity: 1;
                }

                /* Bottom controls */
                .bael-video-bottom {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .bael-video-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 36px;
                    height: 36px;
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    border-radius: 6px;
                    transition: all 0.15s;
                }

                .bael-video-btn:hover {
                    background: rgba(255,255,255,0.1);
                }

                .bael-video-btn svg {
                    width: 20px;
                    height: 20px;
                }

                .bael-video-play {
                    width: 44px;
                    height: 44px;
                }

                .bael-video-play svg {
                    width: 24px;
                    height: 24px;
                }

                /* Volume */
                .bael-video-volume {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .bael-video-volume-slider {
                    width: 0;
                    height: 4px;
                    background: rgba(255,255,255,0.2);
                    border-radius: 2px;
                    cursor: pointer;
                    overflow: hidden;
                    transition: width 0.2s;
                }

                .bael-video-volume:hover .bael-video-volume-slider {
                    width: 80px;
                }

                .bael-video-volume-bar {
                    height: 100%;
                    background: white;
                    border-radius: 2px;
                }

                /* Time */
                .bael-video-time {
                    font-size: 13px;
                    color: rgba(255,255,255,0.9);
                    font-variant-numeric: tabular-nums;
                }

                .bael-video-spacer {
                    flex: 1;
                }

                /* Settings menu */
                .bael-video-settings-menu {
                    position: absolute;
                    bottom: 60px;
                    right: 16px;
                    min-width: 180px;
                    background: rgba(20,20,20,0.95);
                    border-radius: 8px;
                    overflow: hidden;
                    opacity: 0;
                    visibility: hidden;
                    transform: translateY(10px);
                    transition: all 0.2s;
                }

                .bael-video-settings-menu.open {
                    opacity: 1;
                    visibility: visible;
                    transform: translateY(0);
                }

                .bael-video-settings-item {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 16px;
                    color: white;
                    font-size: 13px;
                    cursor: pointer;
                    transition: background 0.15s;
                }

                .bael-video-settings-item:hover {
                    background: rgba(255,255,255,0.1);
                }

                .bael-video-settings-value {
                    color: rgba(255,255,255,0.6);
                }

                /* Submenu */
                .bael-video-submenu {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(20,20,20,0.95);
                    transform: translateX(100%);
                    transition: transform 0.2s;
                }

                .bael-video-submenu.open {
                    transform: translateX(0);
                }

                .bael-video-submenu-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 16px;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                    color: white;
                    font-size: 13px;
                    cursor: pointer;
                }

                .bael-video-submenu-header:hover {
                    background: rgba(255,255,255,0.05);
                }

                .bael-video-submenu-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 16px;
                    color: white;
                    font-size: 13px;
                    cursor: pointer;
                }

                .bael-video-submenu-item:hover {
                    background: rgba(255,255,255,0.1);
                }

                .bael-video-submenu-item.active::before {
                    content: '✓';
                    margin-right: 4px;
                }

                /* Play overlay */
                .bael-video-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(0,0,0,0.3);
                    cursor: pointer;
                    opacity: 0;
                    transition: opacity 0.3s;
                }

                .bael-video.paused .bael-video-overlay {
                    opacity: 1;
                }

                .bael-video-overlay-play {
                    width: 72px;
                    height: 72px;
                    background: rgba(0,0,0,0.6);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.15s;
                }

                .bael-video-overlay:hover .bael-video-overlay-play {
                    transform: scale(1.1);
                }

                .bael-video-overlay-play svg {
                    width: 32px;
                    height: 32px;
                    color: white;
                    margin-left: 4px;
                }

                /* Fullscreen */
                .bael-video.fullscreen {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 100000;
                    border-radius: 0;
                }

                .bael-video.fullscreen video {
                    height: 100%;
                    object-fit: contain;
                }

                /* Loading spinner */
                .bael-video-loading {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    display: none;
                }

                .bael-video.loading .bael-video-loading {
                    display: block;
                }

                .bael-video-spinner {
                    width: 48px;
                    height: 48px;
                    border: 4px solid rgba(255,255,255,0.2);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: bael-video-spin 0.8s linear infinite;
                }

                @keyframes bael-video-spin {
                    to { transform: rotate(360deg); }
                }

                /* Subtitles */
                .bael-video-subtitles {
                    position: absolute;
                    bottom: 80px;
                    left: 50%;
                    transform: translateX(-50%);
                    max-width: 80%;
                    padding: 8px 16px;
                    background: rgba(0,0,0,0.75);
                    border-radius: 4px;
                    color: white;
                    font-size: 16px;
                    text-align: center;
                    pointer-events: none;
                }
            `;
      document.head.appendChild(styles);
    }

    // ============================================================
    // CREATE VIDEO PLAYER
    // ============================================================

    /**
     * Create video player
     */
    create(container, options = {}) {
      if (typeof container === "string") {
        container = document.querySelector(container);
      }

      if (!container) {
        console.error("Video container not found");
        return null;
      }

      const id = `bael-video-${++this.idCounter}`;
      const config = {
        src: "",
        poster: "",
        autoplay: false,
        loop: false,
        muted: false,
        qualities: [], // [{ label: '1080p', src: '...' }, ...]
        subtitles: [], // [{ label: 'English', src: '...', lang: 'en' }, ...]
        playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
        showPiP: true,
        showFullscreen: true,
        showSettings: true,
        onPlay: null,
        onPause: null,
        onEnd: null,
        onTimeUpdate: null,
        ...options,
      };

      const el = document.createElement("div");
      el.className = "bael-video paused";
      el.id = id;

      const state = {
        id,
        element: el,
        container,
        config,
        playing: false,
        volume: 1,
        currentTime: 0,
        duration: 0,
        currentQuality: 0,
        currentSubtitle: -1,
        playbackRate: 1,
        isFullscreen: false,
        settingsOpen: false,
      };

      this._render(state);
      this._setupEvents(state);
      container.appendChild(el);

      this.instances.set(id, state);

      return {
        id,
        play: () => this._play(state),
        pause: () => this._pause(state),
        toggle: () => this._toggle(state),
        seek: (time) => this._seek(state, time),
        setVolume: (vol) => this._setVolume(state, vol),
        setQuality: (index) => this._setQuality(state, index),
        setPlaybackRate: (rate) => this._setPlaybackRate(state, rate),
        enterFullscreen: () => this._enterFullscreen(state),
        exitFullscreen: () => this._exitFullscreen(state),
        destroy: () => this.destroy(id),
      };
    }

    /**
     * Render player
     */
    _render(state) {
      const { element, config } = state;

      // Video element
      const video = document.createElement("video");
      video.src =
        config.qualities.length > 0 ? config.qualities[0].src : config.src;
      video.poster = config.poster;
      video.autoplay = config.autoplay;
      video.loop = config.loop;
      video.muted = config.muted;
      video.playsInline = true;
      state.video = video;
      element.appendChild(video);

      // Loading spinner
      const loading = document.createElement("div");
      loading.className = "bael-video-loading";
      loading.innerHTML = '<div class="bael-video-spinner"></div>';
      element.appendChild(loading);

      // Play overlay
      const overlay = document.createElement("div");
      overlay.className = "bael-video-overlay";
      overlay.innerHTML = `
                <div class="bael-video-overlay-play">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                </div>
            `;
      overlay.addEventListener("click", () => this._toggle(state));
      element.appendChild(overlay);

      // Subtitles container
      const subtitles = document.createElement("div");
      subtitles.className = "bael-video-subtitles";
      subtitles.style.display = "none";
      state.subtitlesEl = subtitles;
      element.appendChild(subtitles);

      // Controls
      const controls = document.createElement("div");
      controls.className = "bael-video-controls";

      // Progress bar
      const progress = document.createElement("div");
      progress.className = "bael-video-progress";
      progress.innerHTML = `
                <div class="bael-video-progress-buffered"></div>
                <div class="bael-video-progress-bar"></div>
                <div class="bael-video-progress-thumb"></div>
                <div class="bael-video-progress-tooltip">0:00</div>
            `;
      progress.addEventListener("click", (e) =>
        this._onProgressClick(state, e),
      );
      progress.addEventListener("mousemove", (e) =>
        this._onProgressHover(state, e),
      );
      state.progressEl = progress;
      state.progressBar = progress.querySelector(".bael-video-progress-bar");
      state.progressThumb = progress.querySelector(
        ".bael-video-progress-thumb",
      );
      state.progressTooltip = progress.querySelector(
        ".bael-video-progress-tooltip",
      );
      state.bufferedEl = progress.querySelector(
        ".bael-video-progress-buffered",
      );
      controls.appendChild(progress);

      // Bottom controls
      const bottom = document.createElement("div");
      bottom.className = "bael-video-bottom";

      // Play button
      const playBtn = document.createElement("button");
      playBtn.type = "button";
      playBtn.className = "bael-video-btn bael-video-play";
      playBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>`;
      playBtn.addEventListener("click", () => this._toggle(state));
      state.playBtn = playBtn;
      bottom.appendChild(playBtn);

      // Volume
      const volume = document.createElement("div");
      volume.className = "bael-video-volume";

      const volumeBtn = document.createElement("button");
      volumeBtn.type = "button";
      volumeBtn.className = "bael-video-btn";
      volumeBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/></svg>`;
      volumeBtn.addEventListener("click", () => this._toggleMute(state));
      state.volumeBtn = volumeBtn;
      volume.appendChild(volumeBtn);

      const volumeSlider = document.createElement("div");
      volumeSlider.className = "bael-video-volume-slider";
      volumeSlider.innerHTML =
        '<div class="bael-video-volume-bar" style="width: 100%"></div>';
      volumeSlider.addEventListener("click", (e) =>
        this._onVolumeClick(state, e),
      );
      state.volumeSlider = volumeSlider;
      state.volumeBar = volumeSlider.querySelector(".bael-video-volume-bar");
      volume.appendChild(volumeSlider);

      bottom.appendChild(volume);

      // Time
      const time = document.createElement("div");
      time.className = "bael-video-time";
      time.textContent = "0:00 / 0:00";
      state.timeEl = time;
      bottom.appendChild(time);

      // Spacer
      const spacer = document.createElement("div");
      spacer.className = "bael-video-spacer";
      bottom.appendChild(spacer);

      // Settings
      if (config.showSettings) {
        const settingsBtn = document.createElement("button");
        settingsBtn.type = "button";
        settingsBtn.className = "bael-video-btn";
        settingsBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>`;
        settingsBtn.addEventListener("click", () =>
          this._toggleSettings(state),
        );
        bottom.appendChild(settingsBtn);

        this._createSettingsMenu(state, controls);
      }

      // PiP
      if (config.showPiP && document.pictureInPictureEnabled) {
        const pipBtn = document.createElement("button");
        pipBtn.type = "button";
        pipBtn.className = "bael-video-btn";
        pipBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 7h-8v6h8V7zm2-4H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14z"/></svg>`;
        pipBtn.addEventListener("click", () => this._togglePiP(state));
        bottom.appendChild(pipBtn);
      }

      // Fullscreen
      if (config.showFullscreen) {
        const fsBtn = document.createElement("button");
        fsBtn.type = "button";
        fsBtn.className = "bael-video-btn";
        fsBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>`;
        fsBtn.addEventListener("click", () => this._toggleFullscreen(state));
        state.fullscreenBtn = fsBtn;
        bottom.appendChild(fsBtn);
      }

      controls.appendChild(bottom);
      element.appendChild(controls);
    }

    /**
     * Create settings menu
     */
    _createSettingsMenu(state, controls) {
      const { config } = state;

      const menu = document.createElement("div");
      menu.className = "bael-video-settings-menu";

      // Speed option
      const speedItem = document.createElement("div");
      speedItem.className = "bael-video-settings-item";
      speedItem.innerHTML = `<span>Speed</span><span class="bael-video-settings-value">1x</span>`;
      speedItem.addEventListener("click", () =>
        this._openSubmenu(state, "speed"),
      );
      state.speedValueEl = speedItem.querySelector(
        ".bael-video-settings-value",
      );
      menu.appendChild(speedItem);

      // Quality option (if available)
      if (config.qualities.length > 0) {
        const qualityItem = document.createElement("div");
        qualityItem.className = "bael-video-settings-item";
        qualityItem.innerHTML = `<span>Quality</span><span class="bael-video-settings-value">${config.qualities[0].label}</span>`;
        qualityItem.addEventListener("click", () =>
          this._openSubmenu(state, "quality"),
        );
        state.qualityValueEl = qualityItem.querySelector(
          ".bael-video-settings-value",
        );
        menu.appendChild(qualityItem);
      }

      // Subtitles option (if available)
      if (config.subtitles.length > 0) {
        const subItem = document.createElement("div");
        subItem.className = "bael-video-settings-item";
        subItem.innerHTML = `<span>Subtitles</span><span class="bael-video-settings-value">Off</span>`;
        subItem.addEventListener("click", () =>
          this._openSubmenu(state, "subtitles"),
        );
        state.subValueEl = subItem.querySelector(".bael-video-settings-value");
        menu.appendChild(subItem);
      }

      // Speed submenu
      const speedSubmenu = this._createSubmenu(
        state,
        "speed",
        "Speed",
        config.playbackRates.map((r) => ({ label: `${r}x`, value: r })),
        (val) => this._setPlaybackRate(state, val),
      );
      menu.appendChild(speedSubmenu);

      // Quality submenu
      if (config.qualities.length > 0) {
        const qualitySubmenu = this._createSubmenu(
          state,
          "quality",
          "Quality",
          config.qualities.map((q, i) => ({ label: q.label, value: i })),
          (val) => this._setQuality(state, val),
        );
        menu.appendChild(qualitySubmenu);
      }

      // Subtitles submenu
      if (config.subtitles.length > 0) {
        const subSubmenu = this._createSubmenu(
          state,
          "subtitles",
          "Subtitles",
          [
            { label: "Off", value: -1 },
            ...config.subtitles.map((s, i) => ({ label: s.label, value: i })),
          ],
          (val) => this._setSubtitle(state, val),
        );
        menu.appendChild(subSubmenu);
      }

      state.settingsMenu = menu;
      controls.appendChild(menu);
    }

    /**
     * Create submenu
     */
    _createSubmenu(state, name, title, options, onSelect) {
      const submenu = document.createElement("div");
      submenu.className = "bael-video-submenu";
      submenu.dataset.name = name;

      const header = document.createElement("div");
      header.className = "bael-video-submenu-header";
      header.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg> ${title}`;
      header.addEventListener("click", () => this._closeSubmenu(state));
      submenu.appendChild(header);

      options.forEach((opt) => {
        const item = document.createElement("div");
        item.className = "bael-video-submenu-item";
        item.textContent = opt.label;
        item.dataset.value = opt.value;
        item.addEventListener("click", () => {
          onSelect(opt.value);
          submenu
            .querySelectorAll(".bael-video-submenu-item")
            .forEach((i) => i.classList.remove("active"));
          item.classList.add("active");
          this._closeSubmenu(state);
        });
        submenu.appendChild(item);
      });

      // Mark default
      const defaultItem =
        submenu.querySelector('[data-value="1"]') ||
        submenu.querySelector(".bael-video-submenu-item");
      if (defaultItem) defaultItem.classList.add("active");

      return submenu;
    }

    /**
     * Setup video events
     */
    _setupEvents(state) {
      const { video, element, config } = state;

      video.addEventListener("loadedmetadata", () => {
        state.duration = video.duration;
        this._updateTime(state);
      });

      video.addEventListener("timeupdate", () => {
        state.currentTime = video.currentTime;
        this._updateProgress(state);
        this._updateTime(state);
        if (config.onTimeUpdate) config.onTimeUpdate(video.currentTime);
      });

      video.addEventListener("progress", () => {
        this._updateBuffered(state);
      });

      video.addEventListener("play", () => {
        state.playing = true;
        element.classList.remove("paused");
        this._updatePlayButton(state);
        if (config.onPlay) config.onPlay();
      });

      video.addEventListener("pause", () => {
        state.playing = false;
        element.classList.add("paused");
        this._updatePlayButton(state);
        if (config.onPause) config.onPause();
      });

      video.addEventListener("ended", () => {
        state.playing = false;
        element.classList.add("paused");
        this._updatePlayButton(state);
        if (config.onEnd) config.onEnd();
      });

      video.addEventListener("waiting", () => {
        element.classList.add("loading");
      });

      video.addEventListener("canplay", () => {
        element.classList.remove("loading");
      });

      // Keyboard shortcuts
      element.addEventListener("keydown", (e) => {
        switch (e.key) {
          case " ":
          case "k":
            e.preventDefault();
            this._toggle(state);
            break;
          case "ArrowLeft":
            this._seek(state, video.currentTime - 5);
            break;
          case "ArrowRight":
            this._seek(state, video.currentTime + 5);
            break;
          case "ArrowUp":
            this._setVolume(state, state.volume + 0.1);
            break;
          case "ArrowDown":
            this._setVolume(state, state.volume - 0.1);
            break;
          case "m":
            this._toggleMute(state);
            break;
          case "f":
            this._toggleFullscreen(state);
            break;
        }
      });

      // Double click for fullscreen
      video.addEventListener("dblclick", () => {
        this._toggleFullscreen(state);
      });

      // Click outside to close settings
      document.addEventListener("click", (e) => {
        if (
          state.settingsOpen &&
          !e.target.closest(".bael-video-settings-menu") &&
          !e.target.closest(".bael-video-btn")
        ) {
          this._closeSettings(state);
        }
      });
    }

    // ============================================================
    // CONTROLS
    // ============================================================

    _play(state) {
      state.video.play().catch(() => {});
    }
    _pause(state) {
      state.video.pause();
    }
    _toggle(state) {
      state.playing ? this._pause(state) : this._play(state);
    }

    _seek(state, time) {
      state.video.currentTime = Math.max(0, Math.min(state.duration, time));
    }

    _setVolume(state, vol) {
      state.volume = Math.max(0, Math.min(1, vol));
      state.video.volume = state.volume;
      if (state.volumeBar) {
        state.volumeBar.style.width = `${state.volume * 100}%`;
      }
      this._updateVolumeIcon(state);
    }

    _toggleMute(state) {
      if (state.video.volume > 0) {
        state.lastVolume = state.video.volume;
        this._setVolume(state, 0);
      } else {
        this._setVolume(state, state.lastVolume || 1);
      }
    }

    _setQuality(state, index) {
      const { config, video } = state;
      const currentTime = video.currentTime;
      const wasPlaying = !video.paused;

      state.currentQuality = index;
      video.src = config.qualities[index].src;
      video.currentTime = currentTime;

      if (wasPlaying) video.play();

      if (state.qualityValueEl) {
        state.qualityValueEl.textContent = config.qualities[index].label;
      }
    }

    _setPlaybackRate(state, rate) {
      state.playbackRate = rate;
      state.video.playbackRate = rate;
      if (state.speedValueEl) {
        state.speedValueEl.textContent = `${rate}x`;
      }
    }

    _setSubtitle(state, index) {
      state.currentSubtitle = index;
      if (state.subValueEl) {
        state.subValueEl.textContent =
          index === -1 ? "Off" : state.config.subtitles[index].label;
      }
      // Subtitle rendering would need VTT parsing - simplified here
      state.subtitlesEl.style.display = index === -1 ? "none" : "block";
    }

    _togglePiP(state) {
      if (document.pictureInPictureElement) {
        document.exitPictureInPicture();
      } else {
        state.video.requestPictureInPicture();
      }
    }

    _toggleFullscreen(state) {
      if (state.isFullscreen) {
        this._exitFullscreen(state);
      } else {
        this._enterFullscreen(state);
      }
    }

    _enterFullscreen(state) {
      const el = state.element;
      if (el.requestFullscreen) {
        el.requestFullscreen();
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      }
      state.isFullscreen = true;
      state.element.classList.add("fullscreen");
    }

    _exitFullscreen(state) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
      state.isFullscreen = false;
      state.element.classList.remove("fullscreen");
    }

    _toggleSettings(state) {
      state.settingsOpen = !state.settingsOpen;
      state.settingsMenu.classList.toggle("open", state.settingsOpen);
    }

    _closeSettings(state) {
      state.settingsOpen = false;
      state.settingsMenu.classList.remove("open");
      state.settingsMenu
        .querySelectorAll(".bael-video-submenu")
        .forEach((s) => s.classList.remove("open"));
    }

    _openSubmenu(state, name) {
      const submenu = state.settingsMenu.querySelector(`[data-name="${name}"]`);
      if (submenu) submenu.classList.add("open");
    }

    _closeSubmenu(state) {
      state.settingsMenu
        .querySelectorAll(".bael-video-submenu")
        .forEach((s) => s.classList.remove("open"));
    }

    // ============================================================
    // UI UPDATES
    // ============================================================

    _updateProgress(state) {
      const percent = (state.currentTime / state.duration) * 100 || 0;
      if (state.progressBar) state.progressBar.style.width = `${percent}%`;
      if (state.progressThumb) state.progressThumb.style.left = `${percent}%`;
    }

    _updateBuffered(state) {
      const { video, bufferedEl } = state;
      if (!bufferedEl || !video.buffered.length) return;
      const end = video.buffered.end(video.buffered.length - 1);
      const percent = (end / state.duration) * 100;
      bufferedEl.style.width = `${percent}%`;
    }

    _updateTime(state) {
      if (state.timeEl) {
        state.timeEl.textContent = `${this._formatTime(state.currentTime)} / ${this._formatTime(state.duration)}`;
      }
    }

    _updatePlayButton(state) {
      const icon = state.playing
        ? `<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>`
        : `<path d="M8 5v14l11-7z"/>`;
      state.playBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor">${icon}</svg>`;
    }

    _updateVolumeIcon(state) {
      const vol = state.video.volume;
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

    _formatTime(s) {
      const mins = Math.floor(s / 60);
      const secs = Math.floor(s % 60);
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    }

    _onProgressClick(state, e) {
      const rect = state.progressEl.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      this._seek(state, percent * state.duration);
    }

    _onProgressHover(state, e) {
      const rect = state.progressEl.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const time = percent * state.duration;
      state.progressTooltip.textContent = this._formatTime(time);
      state.progressTooltip.style.left = `${e.clientX - rect.left}px`;
    }

    _onVolumeClick(state, e) {
      const rect = state.volumeSlider.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      this._setVolume(state, percent);
    }

    /**
     * Destroy player
     */
    destroy(id) {
      const state = this.instances.get(id);
      if (!state) return;

      state.video.pause();
      state.video.src = "";
      state.element.remove();
      this.instances.delete(id);
    }
  }

  // ============================================================
  // SINGLETON INSTANCE
  // ============================================================

  const bael = new BaelVideoPlayer();

  // ============================================================
  // GLOBAL SHORTCUTS
  // ============================================================

  window.$video = (container, options) => bael.create(container, options);
  window.$videoPlayer = window.$video;

  // ============================================================
  // EXPORT
  // ============================================================

  window.BaelVideoPlayer = bael;

  console.log("🎬 BAEL Video Player Component loaded");
})();
