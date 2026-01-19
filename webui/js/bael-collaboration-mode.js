/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BAEL - LORD OF ALL
 * COLLABORATION MODE - Multi-User Support
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Enable collaborative AI interaction:
 * - User profiles
 * - Session sharing
 * - Real-time presence
 * - Collaborative editing
 * - Permission system
 *
 * @version 1.0.0
 */

(function () {
  "use strict";

  class BaelCollaborationMode {
    constructor() {
      // User management
      this.currentUser = null;
      this.users = new Map();
      this.presence = new Map();

      // Session management
      this.sessions = new Map();
      this.activeSession = null;
      this.sharedCursors = new Map();

      // WebSocket simulation (for demo - would use real WS in production)
      this.ws = null;
      this.isConnected = false;

      // UI
      this.panel = null;
      this.isVisible = false;
      this.presenceIndicator = null;

      this.init();
    }

    init() {
      this.loadCurrentUser();
      this.loadSessions();
      this.createUI();
      this.createPresenceIndicator();
      this.addStyles();
      this.bindEvents();
      console.log("👥 Bael Collaboration Mode initialized");
    }

    // ═════════════════════════════════════════════════════════════════
    // USER MANAGEMENT
    // ═════════════════════════════════════════════════════════════════

    loadCurrentUser() {
      try {
        const saved = localStorage.getItem("bael_current_user");
        if (saved) {
          this.currentUser = JSON.parse(saved);
        } else {
          this.currentUser = this.createDefaultUser();
        }
      } catch (e) {
        this.currentUser = this.createDefaultUser();
      }
    }

    createDefaultUser() {
      const user = {
        id: "user_" + Date.now().toString(36),
        name: "User",
        avatar: this.generateAvatar(),
        color: this.generateUserColor(),
        createdAt: new Date(),
        settings: {},
      };
      localStorage.setItem("bael_current_user", JSON.stringify(user));
      return user;
    }

    updateCurrentUser(updates) {
      this.currentUser = { ...this.currentUser, ...updates };
      localStorage.setItem(
        "bael_current_user",
        JSON.stringify(this.currentUser),
      );
      this.updateUI();
      this.broadcastPresence();
    }

    generateAvatar() {
      const emojis = [
        "👤",
        "👩",
        "👨",
        "🧑",
        "👻",
        "🤖",
        "🦊",
        "🐱",
        "🦁",
        "🐼",
        "🐨",
        "🐯",
      ];
      return emojis[Math.floor(Math.random() * emojis.length)];
    }

    generateUserColor() {
      const colors = [
        "#ff3366",
        "#10b981",
        "#6366f1",
        "#f59e0b",
        "#ec4899",
        "#8b5cf6",
        "#14b8a6",
        "#f43f5e",
      ];
      return colors[Math.floor(Math.random() * colors.length)];
    }

    // ═════════════════════════════════════════════════════════════════
    // SESSION MANAGEMENT
    // ═════════════════════════════════════════════════════════════════

    createSession(name = "New Session") {
      const session = {
        id: "session_" + Date.now().toString(36),
        name,
        createdBy: this.currentUser.id,
        createdAt: new Date(),
        participants: [this.currentUser.id],
        permissions: {
          canEdit: true,
          canInvite: true,
        },
        messages: [],
        isActive: true,
      };

      this.sessions.set(session.id, session);
      this.saveSessions();
      this.emit("session-created", session);

      return session;
    }

    joinSession(sessionId) {
      const session = this.sessions.get(sessionId);
      if (!session) return false;

      if (!session.participants.includes(this.currentUser.id)) {
        session.participants.push(this.currentUser.id);
        this.saveSessions();
      }

      this.activeSession = session;
      this.broadcastPresence();
      this.emit("session-joined", session);

      return true;
    }

    leaveSession() {
      if (!this.activeSession) return;

      const idx = this.activeSession.participants.indexOf(this.currentUser.id);
      if (idx !== -1) {
        this.activeSession.participants.splice(idx, 1);
      }

      this.saveSessions();
      this.emit("session-left", this.activeSession);
      this.activeSession = null;
    }

    getSessionShareLink(sessionId) {
      const session = this.sessions.get(sessionId);
      if (!session) return null;

      // Generate shareable link (would be real URL in production)
      const shareCode = btoa(
        JSON.stringify({
          id: sessionId,
          key: Math.random().toString(36).substr(2, 8),
        }),
      );

      return `${window.location.origin}/join/${shareCode}`;
    }

    loadSessions() {
      try {
        const saved = JSON.parse(localStorage.getItem("bael_sessions") || "{}");
        Object.entries(saved).forEach(([id, session]) => {
          session.createdAt = new Date(session.createdAt);
          this.sessions.set(id, session);
        });
      } catch (e) {
        console.warn("Failed to load sessions:", e);
      }
    }

    saveSessions() {
      const data = Object.fromEntries(this.sessions);
      localStorage.setItem("bael_sessions", JSON.stringify(data));
    }

    // ═════════════════════════════════════════════════════════════════
    // PRESENCE SYSTEM
    // ═════════════════════════════════════════════════════════════════

    broadcastPresence() {
      if (!this.activeSession) return;

      const presence = {
        userId: this.currentUser.id,
        userName: this.currentUser.name,
        avatar: this.currentUser.avatar,
        color: this.currentUser.color,
        sessionId: this.activeSession.id,
        status: "online",
        lastSeen: new Date(),
        cursor: this.getCursorPosition(),
      };

      // In production, send via WebSocket
      this.presence.set(this.currentUser.id, presence);
      this.emit("presence-updated", presence);
      this.updatePresenceUI();
    }

    getCursorPosition() {
      const input = document.querySelector("#user-input");
      if (input) {
        return {
          element: "input",
          position: input.selectionStart,
        };
      }
      return null;
    }

    updatePresenceUI() {
      if (!this.presenceIndicator) return;

      const onlineUsers = Array.from(this.presence.values()).filter(
        (p) => p.sessionId === this.activeSession?.id,
      );

      this.presenceIndicator.innerHTML = `
                <div class="presence-avatars">
                    ${onlineUsers
                      .slice(0, 5)
                      .map(
                        (u) => `
                        <div class="presence-avatar" style="background-color: ${u.color}" title="${u.userName}">
                            ${u.avatar}
                        </div>
                    `,
                      )
                      .join("")}
                    ${
                      onlineUsers.length > 5
                        ? `
                        <div class="presence-more">+${onlineUsers.length - 5}</div>
                    `
                        : ""
                    }
                </div>
                ${
                  this.activeSession
                    ? `
                    <span class="presence-session">${this.activeSession.name}</span>
                `
                    : ""
                }
            `;
    }

    // ═════════════════════════════════════════════════════════════════
    // UI
    // ═════════════════════════════════════════════════════════════════

    createUI() {
      const panel = document.createElement("div");
      panel.id = "bael-collab-panel";
      panel.className = "bael-collab-panel";
      panel.innerHTML = this.renderPanel();
      document.body.appendChild(panel);
      this.panel = panel;
    }

    createPresenceIndicator() {
      const indicator = document.createElement("div");
      indicator.id = "bael-presence-indicator";
      indicator.className = "bael-presence-indicator";
      document.body.appendChild(indicator);
      this.presenceIndicator = indicator;
    }

    renderPanel() {
      const sessionsList = Array.from(this.sessions.values());

      return `
                <div class="collab-header">
                    <div class="collab-title">
                        <span class="collab-icon">👥</span>
                        <span>Collaboration</span>
                    </div>
                    <button class="collab-close" id="collab-close">×</button>
                </div>

                <div class="collab-content">
                    <div class="collab-section">
                        <h4>Your Profile</h4>
                        <div class="collab-profile">
                            <div class="profile-avatar" style="background-color: ${this.currentUser.color}">
                                ${this.currentUser.avatar}
                            </div>
                            <div class="profile-info">
                                <input type="text" id="collab-name" value="${this.currentUser.name}"
                                       placeholder="Your name"/>
                                <div class="profile-actions">
                                    <button class="collab-btn-sm" id="collab-change-avatar">Change Avatar</button>
                                    <button class="collab-btn-sm" id="collab-change-color">Change Color</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="collab-section">
                        <h4>Sessions</h4>
                        <button class="collab-btn primary" id="collab-new-session">
                            + Create New Session
                        </button>

                        <div class="collab-sessions">
                            ${
                              sessionsList.length === 0
                                ? `
                                <p class="collab-empty">No sessions yet</p>
                            `
                                : `
                                ${sessionsList
                                  .map(
                                    (s) => `
                                    <div class="session-item ${this.activeSession?.id === s.id ? "active" : ""}"
                                         data-id="${s.id}">
                                        <div class="session-info">
                                            <span class="session-name">${s.name}</span>
                                            <span class="session-meta">
                                                ${s.participants.length} participant(s)
                                            </span>
                                        </div>
                                        <div class="session-actions">
                                            ${
                                              this.activeSession?.id === s.id
                                                ? `
                                                <button class="session-leave" data-id="${s.id}">Leave</button>
                                            `
                                                : `
                                                <button class="session-join" data-id="${s.id}">Join</button>
                                            `
                                            }
                                            <button class="session-share" data-id="${s.id}" title="Share">🔗</button>
                                            <button class="session-delete" data-id="${s.id}" title="Delete">🗑</button>
                                        </div>
                                    </div>
                                `,
                                  )
                                  .join("")}
                            `
                            }
                        </div>
                    </div>

                    ${
                      this.activeSession
                        ? `
                        <div class="collab-section">
                            <h4>Current Session</h4>
                            <div class="collab-active-session">
                                <div class="active-session-header">
                                    <span>${this.activeSession.name}</span>
                                    <span class="active-badge">Active</span>
                                </div>
                                <div class="active-session-participants">
                                    <h5>Participants</h5>
                                    ${this.activeSession.participants
                                      .map((pid) => {
                                        const p = this.presence.get(pid);
                                        return `
                                            <div class="participant">
                                                <span class="participant-avatar"
                                                      style="background-color: ${p?.color || "#666"}">
                                                    ${p?.avatar || "👤"}
                                                </span>
                                                <span class="participant-name">
                                                    ${p?.userName || "Unknown"}
                                                    ${pid === this.currentUser.id ? " (you)" : ""}
                                                </span>
                                                <span class="participant-status ${p?.status || "offline"}">
                                                    ●
                                                </span>
                                            </div>
                                        `;
                                      })
                                      .join("")}
                                </div>
                            </div>
                        </div>
                    `
                        : ""
                    }
                </div>
            `;
    }

    updateUI() {
      if (!this.panel) return;
      this.panel.innerHTML = this.renderPanel();
      this.bindPanelEvents();
      this.updatePresenceUI();
    }

    addStyles() {
      if (document.getElementById("bael-collab-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-collab-styles";
      styles.textContent = `
                .bael-collab-panel {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 90vw;
                    max-width: 500px;
                    max-height: 80vh;
                    background: var(--color-panel, #0f0f17);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 20px;
                    z-index: 100065;
                    display: none;
                    flex-direction: column;
                    overflow: hidden;
                    box-shadow: 0 40px 120px rgba(0,0,0,0.7);
                }

                .bael-collab-panel.visible {
                    display: flex;
                    animation: collabIn 0.3s ease;
                }

                @keyframes collabIn {
                    from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
                    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                }

                .collab-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 16px 24px;
                    border-bottom: 1px solid var(--color-border, #252535);
                }

                .collab-title {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 17px;
                    font-weight: 700;
                    color: var(--color-text, #fff);
                }

                .collab-icon {
                    font-size: 24px;
                }

                .collab-close {
                    width: 36px;
                    height: 36px;
                    background: transparent;
                    border: none;
                    color: var(--color-text-muted, #666);
                    font-size: 24px;
                    cursor: pointer;
                }

                .collab-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                }

                .collab-section {
                    margin-bottom: 24px;
                }

                .collab-section h4 {
                    font-size: 12px;
                    font-weight: 600;
                    color: var(--color-text-muted, #888);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    margin-bottom: 12px;
                }

                .collab-profile {
                    display: flex;
                    gap: 16px;
                    padding: 16px;
                    background: var(--color-surface, #181820);
                    border-radius: 12px;
                }

                .profile-avatar {
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 30px;
                }

                .profile-info {
                    flex: 1;
                }

                .profile-info input {
                    width: 100%;
                    padding: 10px 14px;
                    background: var(--color-panel, #12121a);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 8px;
                    color: var(--color-text, #fff);
                    font-size: 14px;
                    margin-bottom: 10px;
                }

                .profile-actions {
                    display: flex;
                    gap: 8px;
                }

                .collab-btn-sm {
                    padding: 6px 12px;
                    background: transparent;
                    border: 1px solid var(--color-border, #333);
                    border-radius: 6px;
                    color: var(--color-text-muted, #888);
                    font-size: 11px;
                    cursor: pointer;
                }

                .collab-btn {
                    width: 100%;
                    padding: 12px;
                    background: var(--color-surface, #181820);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 10px;
                    color: var(--color-text, #fff);
                    font-size: 13px;
                    cursor: pointer;
                    margin-bottom: 12px;
                }

                .collab-btn.primary {
                    background: var(--color-primary, #ff3366);
                    border-color: transparent;
                }

                .collab-sessions {
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .collab-empty {
                    text-align: center;
                    padding: 20px;
                    color: var(--color-text-muted, #666);
                    font-size: 13px;
                }

                .session-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 14px;
                    background: var(--color-surface, #181820);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 10px;
                }

                .session-item.active {
                    border-color: var(--color-primary, #ff3366);
                    background: rgba(255,51,102,0.1);
                }

                .session-name {
                    font-size: 13px;
                    font-weight: 500;
                    color: var(--color-text, #fff);
                }

                .session-meta {
                    font-size: 10px;
                    color: var(--color-text-muted, #666);
                    display: block;
                    margin-top: 2px;
                }

                .session-actions {
                    display: flex;
                    gap: 6px;
                }

                .session-join, .session-leave {
                    padding: 6px 12px;
                    background: var(--color-primary, #ff3366);
                    border: none;
                    border-radius: 6px;
                    color: #fff;
                    font-size: 11px;
                    cursor: pointer;
                }

                .session-leave {
                    background: transparent;
                    border: 1px solid var(--color-border, #333);
                    color: var(--color-text-muted, #888);
                }

                .session-share, .session-delete {
                    width: 28px;
                    height: 28px;
                    background: transparent;
                    border: none;
                    font-size: 12px;
                    cursor: pointer;
                    opacity: 0.6;
                }

                .session-share:hover, .session-delete:hover {
                    opacity: 1;
                }

                .collab-active-session {
                    padding: 16px;
                    background: var(--color-surface, #181820);
                    border-radius: 12px;
                }

                .active-session-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 12px;
                    font-weight: 600;
                    color: var(--color-text, #fff);
                }

                .active-badge {
                    font-size: 10px;
                    padding: 3px 8px;
                    background: #10b981;
                    border-radius: 20px;
                    color: #fff;
                }

                .active-session-participants h5 {
                    font-size: 11px;
                    color: var(--color-text-muted, #666);
                    margin-bottom: 8px;
                }

                .participant {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 8px 0;
                }

                .participant-avatar {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                }

                .participant-name {
                    flex: 1;
                    font-size: 12px;
                    color: var(--color-text, #fff);
                }

                .participant-status {
                    font-size: 8px;
                }

                .participant-status.online {
                    color: #10b981;
                }

                .participant-status.offline {
                    color: var(--color-text-muted, #555);
                }

                /* Presence Indicator */
                .bael-presence-indicator {
                    position: fixed;
                    top: 12px;
                    right: 60px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 8px 12px;
                    background: var(--color-surface, #181820);
                    border: 1px solid var(--color-border, #252535);
                    border-radius: 30px;
                    z-index: 100060;
                }

                .presence-avatars {
                    display: flex;
                }

                .presence-avatar {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                    margin-left: -8px;
                    border: 2px solid var(--color-panel, #0f0f17);
                }

                .presence-avatar:first-child {
                    margin-left: 0;
                }

                .presence-more {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    background: var(--color-border, #333);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                    color: var(--color-text-muted, #888);
                    margin-left: -8px;
                }

                .presence-session {
                    font-size: 11px;
                    color: var(--color-text-muted, #888);
                }
            `;
      document.head.appendChild(styles);
    }

    // ═════════════════════════════════════════════════════════════════
    // EVENT BINDING
    // ═════════════════════════════════════════════════════════════════

    bindEvents() {
      this.bindPanelEvents();

      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.shiftKey && e.key === "C") {
          e.preventDefault();
          this.toggle();
        }
      });
    }

    bindPanelEvents() {
      if (!this.panel) return;

      this.panel
        .querySelector("#collab-close")
        ?.addEventListener("click", () => this.close());

      this.panel
        .querySelector("#collab-name")
        ?.addEventListener("change", (e) => {
          this.updateCurrentUser({ name: e.target.value });
        });

      this.panel
        .querySelector("#collab-change-avatar")
        ?.addEventListener("click", () => {
          this.updateCurrentUser({ avatar: this.generateAvatar() });
        });

      this.panel
        .querySelector("#collab-change-color")
        ?.addEventListener("click", () => {
          this.updateCurrentUser({ color: this.generateUserColor() });
        });

      this.panel
        .querySelector("#collab-new-session")
        ?.addEventListener("click", () => {
          const name = prompt("Session name:", "Collaborative Session");
          if (name) {
            const session = this.createSession(name);
            this.joinSession(session.id);
            this.updateUI();
          }
        });

      this.panel.querySelectorAll(".session-join").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.joinSession(btn.dataset.id);
          this.updateUI();
        });
      });

      this.panel.querySelectorAll(".session-leave").forEach((btn) => {
        btn.addEventListener("click", () => {
          this.leaveSession();
          this.updateUI();
        });
      });

      this.panel.querySelectorAll(".session-share").forEach((btn) => {
        btn.addEventListener("click", () => {
          const link = this.getSessionShareLink(btn.dataset.id);
          if (link) {
            navigator.clipboard.writeText(link);
            window.BaelNotifications?.show("Share link copied!", "success");
          }
        });
      });

      this.panel.querySelectorAll(".session-delete").forEach((btn) => {
        btn.addEventListener("click", () => {
          if (confirm("Delete this session?")) {
            this.sessions.delete(btn.dataset.id);
            if (this.activeSession?.id === btn.dataset.id) {
              this.activeSession = null;
            }
            this.saveSessions();
            this.updateUI();
          }
        });
      });
    }

    emit(event, data) {
      window.dispatchEvent(
        new CustomEvent(`bael:collab:${event}`, { detail: data }),
      );
    }

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

  window.BaelCollaborationMode = new BaelCollaborationMode();
})();
