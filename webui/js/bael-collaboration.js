/**
 * BAEL - LORD OF ALL
 * Collaboration Mode - Real-time collaboration features
 * ═══════════════════════════════════════════════════════════════
 */

(function () {
  "use strict";

  class BaelCollaboration {
    constructor() {
      this.room = null;
      this.users = [];
      this.isConnected = false;
      this.userId = this.generateUserId();
      this.userName = this.getDefaultName();
      this.userColor = this.getRandomColor();
      this.cursors = {};
      this.panel = null;
      this.init();
    }

    init() {
      this.loadSettings();
      this.addStyles();
      this.createUI();
      this.bindEvents();
      console.log("👥 Bael Collaboration initialized");
    }

    generateUserId() {
      return "user_" + Math.random().toString(36).substr(2, 9);
    }

    getDefaultName() {
      const saved = localStorage.getItem("bael_collab_name");
      if (saved) return saved;

      const adjectives = [
        "Swift",
        "Brave",
        "Clever",
        "Mighty",
        "Noble",
        "Fierce",
        "Wise",
        "Quick",
      ];
      const nouns = [
        "Wolf",
        "Eagle",
        "Dragon",
        "Phoenix",
        "Lion",
        "Tiger",
        "Hawk",
        "Bear",
      ];
      return (
        adjectives[Math.floor(Math.random() * adjectives.length)] +
        nouns[Math.floor(Math.random() * nouns.length)]
      );
    }

    getRandomColor() {
      const colors = [
        "#ff3366",
        "#3366ff",
        "#33ff66",
        "#ff6633",
        "#6633ff",
        "#33ffff",
        "#ffff33",
        "#ff33ff",
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    }

    loadSettings() {
      try {
        const saved = JSON.parse(
          localStorage.getItem("bael_collab_settings") || "{}",
        );
        if (saved.name) this.userName = saved.name;
        if (saved.color) this.userColor = saved.color;
      } catch (e) {}
    }

    saveSettings() {
      localStorage.setItem(
        "bael_collab_settings",
        JSON.stringify({
          name: this.userName,
          color: this.userColor,
        }),
      );
      localStorage.setItem("bael_collab_name", this.userName);
    }

    addStyles() {
      const styles = document.createElement("style");
      styles.id = "bael-collaboration-styles";
      styles.textContent = `
                /* Collaboration Trigger */
                .bael-collab-trigger {
                    position: fixed;
                    bottom: 750px;
                    right: 20px;
                    width: 48px;
                    height: 48px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9977;
                    transition: all 0.3s ease;
                    font-size: 20px;
                }

                .bael-collab-trigger:hover {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                    transform: scale(1.1);
                }

                .bael-collab-trigger.connected {
                    border-color: #4ade80;
                    box-shadow: 0 0 10px rgba(74, 222, 128, 0.3);
                }

                /* User Count Badge */
                .collab-badge {
                    position: absolute;
                    top: -4px;
                    right: -4px;
                    min-width: 18px;
                    height: 18px;
                    background: var(--bael-accent, #ff3366);
                    border-radius: 9px;
                    font-size: 10px;
                    font-weight: 700;
                    color: white;
                    display: none;
                    align-items: center;
                    justify-content: center;
                    padding: 0 4px;
                }

                .bael-collab-trigger.connected .collab-badge {
                    display: flex;
                }

                /* Collaboration Panel */
                .bael-collab-panel {
                    position: fixed;
                    bottom: 80px;
                    right: 80px;
                    width: 360px;
                    background: var(--bael-bg-primary, #0a0a0f);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 16px;
                    z-index: 100022;
                    display: none;
                    flex-direction: column;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    box-shadow: 0 10px 50px rgba(0, 0, 0, 0.5);
                    overflow: hidden;
                }

                .bael-collab-panel.visible {
                    display: flex;
                    animation: collabAppear 0.2s ease;
                }

                @keyframes collabAppear {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Header */
                .collab-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 14px 16px;
                    background: var(--bael-bg-secondary, #12121a);
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .collab-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .collab-status {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                }

                .status-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: #666;
                }

                .status-dot.online {
                    background: #4ade80;
                }

                .collab-close {
                    width: 28px;
                    height: 28px;
                    border: none;
                    background: transparent;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    border-radius: 6px;
                }

                .collab-close:hover {
                    background: rgba(255, 51, 102, 0.2);
                    color: var(--bael-accent, #ff3366);
                }

                /* Content */
                .collab-content {
                    padding: 16px;
                }

                /* Profile Section */
                .collab-profile {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 14px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 12px;
                    margin-bottom: 16px;
                }

                .profile-avatar {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 20px;
                    font-weight: 700;
                    color: white;
                }

                .profile-info {
                    flex: 1;
                }

                .profile-name {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                    margin-bottom: 4px;
                }

                .profile-id {
                    font-size: 11px;
                    color: var(--bael-text-muted, #666);
                }

                .profile-edit {
                    width: 32px;
                    height: 32px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 6px;
                    color: var(--bael-text-muted, #666);
                    cursor: pointer;
                    font-size: 14px;
                }

                .profile-edit:hover {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                    color: white;
                }

                /* Room Section */
                .collab-section {
                    margin-bottom: 16px;
                }

                .section-title {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--bael-text-muted, #666);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 10px;
                }

                .room-input-group {
                    display: flex;
                    gap: 8px;
                }

                .room-input {
                    flex: 1;
                    padding: 10px 12px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 13px;
                    outline: none;
                }

                .room-input:focus {
                    border-color: var(--bael-accent, #ff3366);
                }

                .room-btn {
                    padding: 10px 16px;
                    background: var(--bael-accent, #ff3366);
                    border: none;
                    border-radius: 8px;
                    color: white;
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: filter 0.2s ease;
                }

                .room-btn:hover {
                    filter: brightness(1.1);
                }

                .room-btn.secondary {
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                }

                .room-btn.secondary:hover {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                }

                /* Room Info */
                .room-info {
                    padding: 14px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 12px;
                    display: none;
                }

                .room-info.visible {
                    display: block;
                }

                .room-name {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 12px;
                }

                .room-name-text {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--bael-text-primary, #fff);
                }

                .room-copy {
                    padding: 4px 8px;
                    background: var(--bael-bg-tertiary, #181820);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 4px;
                    color: var(--bael-text-muted, #666);
                    font-size: 10px;
                    cursor: pointer;
                }

                .room-copy:hover {
                    background: var(--bael-accent, #ff3366);
                    border-color: var(--bael-accent, #ff3366);
                    color: white;
                }

                /* Users List */
                .users-list {
                    margin-top: 12px;
                }

                .user-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 8px 0;
                    border-bottom: 1px solid var(--bael-border, #2a2a3a);
                }

                .user-item:last-child {
                    border-bottom: none;
                }

                .user-avatar {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    font-weight: 700;
                    color: white;
                }

                .user-name {
                    flex: 1;
                    font-size: 13px;
                    color: var(--bael-text-primary, #fff);
                }

                .user-you {
                    font-size: 10px;
                    color: var(--bael-text-muted, #666);
                    background: var(--bael-bg-tertiary, #181820);
                    padding: 2px 6px;
                    border-radius: 4px;
                }

                /* Actions */
                .collab-actions {
                    display: flex;
                    gap: 8px;
                    margin-top: 16px;
                }

                .collab-action {
                    flex: 1;
                    padding: 10px;
                    background: var(--bael-bg-secondary, #12121a);
                    border: 1px solid var(--bael-border, #2a2a3a);
                    border-radius: 8px;
                    color: var(--bael-text-primary, #fff);
                    font-size: 12px;
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 6px;
                    transition: all 0.2s ease;
                }

                .collab-action:hover {
                    background: var(--bael-bg-tertiary, #181820);
                    border-color: var(--bael-accent, #ff3366);
                }

                .collab-action-icon {
                    font-size: 18px;
                }

                /* Remote Cursors */
                .remote-cursor {
                    position: fixed;
                    width: 20px;
                    height: 20px;
                    pointer-events: none;
                    z-index: 99999;
                    transition: all 0.1s ease;
                }

                .cursor-pointer {
                    width: 0;
                    height: 0;
                    border-left: 8px solid transparent;
                    border-right: 8px solid transparent;
                    border-bottom: 16px solid currentColor;
                    transform: rotate(-45deg);
                }

                .cursor-label {
                    position: absolute;
                    left: 16px;
                    top: 12px;
                    padding: 2px 6px;
                    background: currentColor;
                    border-radius: 4px;
                    font-size: 10px;
                    font-weight: 600;
                    color: white;
                    white-space: nowrap;
                }
            `;
      document.head.appendChild(styles);
    }

    createUI() {
      // Trigger
      const trigger = document.createElement("button");
      trigger.className = "bael-collab-trigger";
      trigger.title = "Collaboration (Ctrl+Shift+C)";
      trigger.innerHTML = `
                👥
                <span class="collab-badge">0</span>
            `;
      document.body.appendChild(trigger);
      this.trigger = trigger;

      // Panel
      const panel = document.createElement("div");
      panel.className = "bael-collab-panel";
      panel.innerHTML = this.renderPanel();
      document.body.appendChild(panel);
      this.panel = panel;

      this.bindPanelEvents();
    }

    renderPanel() {
      return `
                <div class="collab-header">
                    <div class="collab-title">
                        <span>👥</span>
                        <span>Collaboration</span>
                    </div>
                    <div class="collab-status">
                        <span class="status-dot ${this.isConnected ? "online" : ""}"></span>
                        <span>${this.isConnected ? "Connected" : "Offline"}</span>
                    </div>
                    <button class="collab-close">×</button>
                </div>

                <div class="collab-content">
                    <!-- Profile -->
                    <div class="collab-profile">
                        <div class="profile-avatar" style="background: ${this.userColor}">
                            ${this.userName.charAt(0).toUpperCase()}
                        </div>
                        <div class="profile-info">
                            <div class="profile-name">${this.userName}</div>
                            <div class="profile-id">${this.userId}</div>
                        </div>
                        <button class="profile-edit" title="Edit profile">✏️</button>
                    </div>

                    <!-- Room -->
                    <div class="collab-section">
                        <div class="section-title">Room</div>
                        <div class="room-input-group" ${this.isConnected ? 'style="display: none"' : ""}>
                            <input type="text" class="room-input" id="room-code" placeholder="Enter room code...">
                            <button class="room-btn" id="join-room">Join</button>
                            <button class="room-btn secondary" id="create-room">Create</button>
                        </div>

                        <div class="room-info ${this.isConnected ? "visible" : ""}" id="room-info">
                            <div class="room-name">
                                <span class="room-name-text" id="room-name">${this.room || "-"}</span>
                                <button class="room-copy" id="copy-room">Copy Code</button>
                            </div>
                            <div class="users-list" id="users-list">
                                ${this.renderUsers()}
                            </div>
                            <button class="room-btn secondary" id="leave-room" style="margin-top: 12px; width: 100%;">Leave Room</button>
                        </div>
                    </div>

                    <!-- Quick Actions -->
                    <div class="collab-section">
                        <div class="section-title">Quick Actions</div>
                        <div class="collab-actions">
                            <button class="collab-action" id="share-chat">
                                <span class="collab-action-icon">💬</span>
                                <span>Share Chat</span>
                            </button>
                            <button class="collab-action" id="share-screen">
                                <span class="collab-action-icon">🖥️</span>
                                <span>Share View</span>
                            </button>
                            <button class="collab-action" id="voice-call">
                                <span class="collab-action-icon">🎤</span>
                                <span>Voice Chat</span>
                            </button>
                        </div>
                    </div>
                </div>
            `;
    }

    renderUsers() {
      const allUsers = [
        {
          id: this.userId,
          name: this.userName,
          color: this.userColor,
          isYou: true,
        },
        ...this.users,
      ];

      return allUsers
        .map(
          (user) => `
                <div class="user-item">
                    <div class="user-avatar" style="background: ${user.color}">${user.name.charAt(0).toUpperCase()}</div>
                    <span class="user-name">${user.name}</span>
                    ${user.isYou ? '<span class="user-you">You</span>' : ""}
                </div>
            `,
        )
        .join("");
    }

    bindEvents() {
      this.trigger.addEventListener("click", () => this.toggle());

      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "C") {
          e.preventDefault();
          this.toggle();
        }
      });

      // Track mouse movement for cursor sharing
      if (this.isConnected) {
        document.addEventListener("mousemove", (e) => {
          this.broadcastCursor(e.clientX, e.clientY);
        });
      }
    }

    bindPanelEvents() {
      this.panel
        .querySelector(".collab-close")
        .addEventListener("click", () => this.close());

      this.panel
        .querySelector("#create-room")
        .addEventListener("click", () => this.createRoom());
      this.panel
        .querySelector("#join-room")
        .addEventListener("click", () => this.joinRoom());
      this.panel
        .querySelector("#leave-room")
        .addEventListener("click", () => this.leaveRoom());
      this.panel
        .querySelector("#copy-room")
        .addEventListener("click", () => this.copyRoomCode());

      this.panel
        .querySelector(".profile-edit")
        .addEventListener("click", () => this.editProfile());

      this.panel
        .querySelector("#share-chat")
        .addEventListener("click", () => this.shareChat());
      this.panel
        .querySelector("#share-screen")
        .addEventListener("click", () => this.shareScreen());
      this.panel
        .querySelector("#voice-call")
        .addEventListener("click", () => this.startVoiceCall());
    }

    toggle() {
      if (this.panel.classList.contains("visible")) {
        this.close();
      } else {
        this.open();
      }
    }

    open() {
      this.panel.classList.add("visible");
    }

    close() {
      this.panel.classList.remove("visible");
    }

    createRoom() {
      const roomCode =
        "BAEL-" + Math.random().toString(36).substr(2, 6).toUpperCase();
      this.room = roomCode;
      this.connectToRoom(roomCode);
    }

    joinRoom() {
      const code = this.panel.querySelector("#room-code").value.trim();
      if (!code) {
        if (window.BaelNotifications) {
          window.BaelNotifications.warning("Please enter a room code");
        }
        return;
      }
      this.room = code;
      this.connectToRoom(code);
    }

    connectToRoom(roomCode) {
      // Simulate connection (in real implementation, use WebSocket)
      this.isConnected = true;
      this.trigger.classList.add("connected");

      // Update UI
      this.panel.innerHTML = this.renderPanel();
      this.bindPanelEvents();

      this.updateUserCount();

      if (window.BaelNotifications) {
        window.BaelNotifications.success(`Connected to room: ${roomCode}`);
      }
    }

    leaveRoom() {
      this.isConnected = false;
      this.room = null;
      this.users = [];
      this.trigger.classList.remove("connected");

      // Remove remote cursors
      Object.keys(this.cursors).forEach((id) => {
        if (this.cursors[id]) {
          this.cursors[id].remove();
        }
      });
      this.cursors = {};

      // Update UI
      this.panel.innerHTML = this.renderPanel();
      this.bindPanelEvents();

      if (window.BaelNotifications) {
        window.BaelNotifications.info("Left the room");
      }
    }

    copyRoomCode() {
      if (this.room) {
        navigator.clipboard.writeText(this.room);
        if (window.BaelNotifications) {
          window.BaelNotifications.success("Room code copied to clipboard");
        }
      }
    }

    editProfile() {
      const newName = prompt("Enter your display name:", this.userName);
      if (newName && newName.trim()) {
        this.userName = newName.trim();
        this.saveSettings();

        // Update UI
        this.panel.querySelector(".profile-name").textContent = this.userName;
        this.panel.querySelector(".profile-avatar").textContent = this.userName
          .charAt(0)
          .toUpperCase();
        this.panel.querySelector("#users-list").innerHTML = this.renderUsers();

        if (window.BaelNotifications) {
          window.BaelNotifications.success("Profile updated");
        }
      }
    }

    updateUserCount() {
      const badge = this.trigger.querySelector(".collab-badge");
      badge.textContent = this.users.length + 1; // Include self
    }

    broadcastCursor(x, y) {
      // In real implementation, send to WebSocket
    }

    updateRemoteCursor(userId, x, y, name, color) {
      if (!this.cursors[userId]) {
        const cursor = document.createElement("div");
        cursor.className = "remote-cursor";
        cursor.style.color = color;
        cursor.innerHTML = `
                    <div class="cursor-pointer"></div>
                    <div class="cursor-label">${name}</div>
                `;
        document.body.appendChild(cursor);
        this.cursors[userId] = cursor;
      }

      this.cursors[userId].style.left = x + "px";
      this.cursors[userId].style.top = y + "px";
    }

    shareChat() {
      if (window.BaelNotifications) {
        window.BaelNotifications.info("Chat sharing: coming soon");
      }
    }

    shareScreen() {
      if (window.BaelNotifications) {
        window.BaelNotifications.info("View sharing: coming soon");
      }
    }

    startVoiceCall() {
      if (window.BaelNotifications) {
        window.BaelNotifications.info("Voice chat: coming soon");
      }
    }
  }

  // Initialize
  window.BaelCollaboration = new BaelCollaboration();
})();
