/**
 * Bael Session Logger - Log and export all chat sessions
 * Keyboard: Ctrl+Alt+L to toggle
 */
(function () {
  "use strict";

  class BaelSessionLogger {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
      this.storageKey = "bael-session-logger";
      this.sessions = [];
      this.currentSession = null;
      this.isLogging = true;
    }

    async initialize() {
      this.loadFromStorage();
      this.injectStyles();
      this.createElements();
      this.setupShortcuts();
      this.startSession();
      this.setupObserver();
      this.initialized = true;
      console.log("📝 Bael Session Logger initialized");
    }

    injectStyles() {
      if (document.getElementById("bael-logger-styles")) return;

      const css = `
                .bael-logger-fab {
                    position: fixed;
                    bottom: 720px;
                    right: 20px;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #14b8a6, #0d9488);
                    color: white;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 22px;
                    box-shadow: 0 4px 15px rgba(20, 184, 166, 0.4);
                    z-index: 9999;
                    transition: all 0.3s ease;
                }

                .bael-logger-fab:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 20px rgba(20, 184, 166, 0.5);
                }

                .bael-logger-indicator {
                    position: absolute;
                    top: 4px;
                    right: 4px;
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    background: #ef4444;
                    animation: bael-pulse 1.5s ease infinite;
                }

                .bael-logger-indicator.paused {
                    background: #666;
                    animation: none;
                }

                @keyframes bael-pulse {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(1.2); }
                }

                .bael-logger-panel {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) scale(0.9);
                    width: 800px;
                    max-width: 95vw;
                    max-height: 85vh;
                    background: linear-gradient(135deg, #1a1a2e, #252540);
                    border-radius: 20px;
                    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
                    z-index: 10001;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    overflow: hidden;
                    border: 1px solid rgba(20, 184, 166, 0.3);
                }

                .bael-logger-panel.visible {
                    opacity: 1;
                    visibility: visible;
                    transform: translate(-50%, -50%) scale(1);
                }

                .bael-logger-header {
                    background: linear-gradient(135deg, #14b8a6, #0d9488);
                    padding: 16px 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .bael-logger-title {
                    color: white;
                    font-size: 18px;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .bael-logger-controls {
                    display: flex;
                    gap: 10px;
                }

                .bael-logger-btn {
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    padding: 8px 16px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 12px;
                    font-weight: 500;
                    transition: background 0.2s;
                }

                .bael-logger-btn:hover {
                    background: rgba(255,255,255,0.3);
                }

                .bael-logger-close {
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 18px;
                    transition: background 0.2s;
                }

                .bael-logger-close:hover {
                    background: rgba(255,255,255,0.3);
                }

                .bael-logger-content {
                    display: flex;
                    height: calc(85vh - 60px);
                }

                .bael-logger-sidebar {
                    width: 220px;
                    background: rgba(0,0,0,0.25);
                    border-right: 1px solid rgba(255,255,255,0.05);
                    overflow-y: auto;
                }

                .bael-logger-session-item {
                    padding: 12px 16px;
                    border-bottom: 1px solid rgba(255,255,255,0.03);
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .bael-logger-session-item:hover,
                .bael-logger-session-item.active {
                    background: rgba(20, 184, 166, 0.1);
                }

                .bael-logger-session-item.active {
                    border-left: 3px solid #14b8a6;
                }

                .bael-logger-session-date {
                    color: white;
                    font-size: 13px;
                    font-weight: 500;
                    margin-bottom: 4px;
                }

                .bael-logger-session-meta {
                    color: #666;
                    font-size: 11px;
                    display: flex;
                    gap: 12px;
                }

                .bael-logger-main {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .bael-logger-toolbar {
                    padding: 12px 20px;
                    background: rgba(0,0,0,0.15);
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                    display: flex;
                    gap: 10px;
                    align-items: center;
                }

                .bael-logger-search {
                    flex: 1;
                    padding: 10px 16px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 8px;
                    color: white;
                    font-size: 13px;
                }

                .bael-logger-search::placeholder {
                    color: #555;
                }

                .bael-logger-filter {
                    padding: 10px 16px;
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 8px;
                    color: white;
                    font-size: 13px;
                    cursor: pointer;
                }

                .bael-logger-log-area {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px 20px;
                }

                .bael-logger-entry {
                    padding: 12px 16px;
                    background: rgba(255,255,255,0.02);
                    border: 1px solid rgba(255,255,255,0.04);
                    border-radius: 10px;
                    margin-bottom: 10px;
                }

                .bael-logger-entry-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                }

                .bael-logger-entry-sender {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .bael-logger-entry-avatar {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 14px;
                }

                .bael-logger-entry-avatar.user {
                    background: linear-gradient(135deg, #3b82f6, #2563eb);
                }

                .bael-logger-entry-avatar.agent {
                    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                }

                .bael-logger-entry-avatar.system {
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                }

                .bael-logger-entry-name {
                    color: white;
                    font-size: 13px;
                    font-weight: 500;
                }

                .bael-logger-entry-time {
                    color: #555;
                    font-size: 11px;
                }

                .bael-logger-entry-content {
                    color: #bbb;
                    font-size: 13px;
                    line-height: 1.5;
                    white-space: pre-wrap;
                    word-break: break-word;
                }

                .bael-logger-entry-content.truncated::after {
                    content: '...';
                    color: #666;
                }

                .bael-logger-entry-tools {
                    margin-top: 8px;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                }

                .bael-logger-tool-badge {
                    padding: 4px 10px;
                    background: rgba(139, 92, 246, 0.2);
                    color: #a78bfa;
                    border-radius: 12px;
                    font-size: 11px;
                }

                .bael-logger-empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    color: #555;
                    text-align: center;
                }

                .bael-logger-empty-icon {
                    font-size: 48px;
                    margin-bottom: 16px;
                    opacity: 0.5;
                }

                .bael-logger-stats {
                    padding: 12px 20px;
                    background: rgba(0,0,0,0.2);
                    border-top: 1px solid rgba(255,255,255,0.05);
                    display: flex;
                    gap: 24px;
                }

                .bael-logger-stat {
                    color: #888;
                    font-size: 12px;
                }

                .bael-logger-stat strong {
                    color: #14b8a6;
                }
            `;

      const style = document.createElement("style");
      style.id = "bael-logger-styles";
      style.textContent = css;
      document.head.appendChild(style);
    }

    createElements() {
      // FAB
      this.fab = document.createElement("button");
      this.fab.className = "bael-logger-fab";
      this.fab.innerHTML = '📝<span class="bael-logger-indicator"></span>';
      this.fab.title = "Session Logger (Ctrl+Alt+L)";
      this.fab.addEventListener("click", () => this.toggle());
      document.body.appendChild(this.fab);

      // Panel
      this.panel = document.createElement("div");
      this.panel.className = "bael-logger-panel";
      this.panel.innerHTML = `
                <div class="bael-logger-header">
                    <div class="bael-logger-title">
                        <span>📝</span>
                        <span>Session Logger</span>
                    </div>
                    <div class="bael-logger-controls">
                        <button class="bael-logger-btn" id="bael-logger-toggle">⏸️ Pause</button>
                        <button class="bael-logger-btn" id="bael-logger-new">🆕 New Session</button>
                        <button class="bael-logger-btn" id="bael-logger-export">📤 Export</button>
                        <button class="bael-logger-close">×</button>
                    </div>
                </div>
                <div class="bael-logger-content">
                    <div class="bael-logger-sidebar" id="bael-logger-sessions"></div>
                    <div class="bael-logger-main">
                        <div class="bael-logger-toolbar">
                            <input type="text" class="bael-logger-search" id="bael-logger-search" placeholder="Search logs...">
                            <select class="bael-logger-filter" id="bael-logger-filter">
                                <option value="all">All Messages</option>
                                <option value="user">User Only</option>
                                <option value="agent">Agent Only</option>
                                <option value="tools">With Tools</option>
                            </select>
                        </div>
                        <div class="bael-logger-log-area" id="bael-logger-logs"></div>
                        <div class="bael-logger-stats" id="bael-logger-stats"></div>
                    </div>
                </div>
            `;
      document.body.appendChild(this.panel);

      // Events
      this.panel
        .querySelector(".bael-logger-close")
        .addEventListener("click", () => this.hide());
      this.panel
        .querySelector("#bael-logger-toggle")
        .addEventListener("click", () => this.toggleLogging());
      this.panel
        .querySelector("#bael-logger-new")
        .addEventListener("click", () => this.startSession());
      this.panel
        .querySelector("#bael-logger-export")
        .addEventListener("click", () => this.exportSession());
      this.panel
        .querySelector("#bael-logger-search")
        .addEventListener("input", (e) => this.filterLogs(e.target.value));
      this.panel
        .querySelector("#bael-logger-filter")
        .addEventListener("change", (e) => this.setFilter(e.target.value));

      this.renderSessions();
    }

    setupShortcuts() {
      document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.altKey && e.key === "l") {
          e.preventDefault();
          this.toggle();
        }
        if (e.key === "Escape" && this.visible) {
          this.hide();
        }
      });
    }

    setupObserver() {
      const observer = new MutationObserver((mutations) => {
        if (!this.isLogging || !this.currentSession) return;

        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              this.checkForNewMessage(node);
            }
          });
        });
      });

      observer.observe(document.body, { childList: true, subtree: true });
    }

    checkForNewMessage(node) {
      const selectors = [
        ".message",
        '[class*="message"]',
        ".chat-bubble",
        ".msg",
      ];

      for (const sel of selectors) {
        if (node.matches && node.matches(sel)) {
          this.logMessage(node);
          return;
        }
        const found = node.querySelectorAll ? node.querySelectorAll(sel) : [];
        found.forEach((el) => this.logMessage(el));
      }
    }

    logMessage(element) {
      if (element.dataset.logged) return;
      element.dataset.logged = "true";

      const text = element.textContent || "";
      if (text.length < 5) return;

      const isUser =
        element.classList.contains("user") ||
        element.classList.contains("user-message") ||
        element.getAttribute("data-sender") === "user";

      const tools = [];
      element
        .querySelectorAll('[class*="tool"], .tool-name, .tool-call')
        .forEach((t) => {
          tools.push(t.textContent.trim());
        });

      const entry = {
        id: Date.now(),
        type: isUser ? "user" : "agent",
        content: text.substring(0, 2000),
        tools,
        timestamp: new Date().toISOString(),
      };

      this.currentSession.entries.push(entry);
      this.currentSession.messageCount++;

      if (this.visible && this.selectedSession === this.currentSession.id) {
        this.renderLogs();
      }

      // Auto-save periodically
      if (this.currentSession.entries.length % 5 === 0) {
        this.saveToStorage();
      }
    }

    startSession() {
      const session = {
        id: Date.now(),
        startTime: new Date().toISOString(),
        entries: [],
        messageCount: 0,
      };

      this.sessions.unshift(session);
      this.currentSession = session;
      this.selectedSession = session.id;

      this.saveToStorage();
      this.renderSessions();
      this.renderLogs();

      this.showToast("New session started");
    }

    toggleLogging() {
      this.isLogging = !this.isLogging;

      const btn = this.panel.querySelector("#bael-logger-toggle");
      const indicator = this.fab.querySelector(".bael-logger-indicator");

      if (this.isLogging) {
        btn.textContent = "⏸️ Pause";
        indicator.classList.remove("paused");
      } else {
        btn.textContent = "▶️ Resume";
        indicator.classList.add("paused");
      }
    }

    exportSession() {
      const session = this.sessions.find((s) => s.id === this.selectedSession);
      if (!session) return;

      const formats = {
        json: () => JSON.stringify(session, null, 2),
        markdown: () => this.toMarkdown(session),
        txt: () => this.toPlainText(session),
      };

      const format = prompt("Export format (json, markdown, txt):", "json");
      if (!format || !formats[format]) return;

      const content = formats[format]();
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `session-${new Date().toISOString().split("T")[0]}.${format === "markdown" ? "md" : format}`;
      a.click();

      URL.revokeObjectURL(url);
      this.showToast("Session exported!");
    }

    toMarkdown(session) {
      let md = `# Chat Session\n\n`;
      md += `**Started:** ${new Date(session.startTime).toLocaleString()}\n`;
      md += `**Messages:** ${session.entries.length}\n\n---\n\n`;

      session.entries.forEach((e) => {
        const time = new Date(e.timestamp).toLocaleTimeString();
        const sender = e.type === "user" ? "👤 You" : "🤖 Agent";
        md += `### ${sender} (${time})\n\n`;
        md += `${e.content}\n\n`;
        if (e.tools.length) {
          md += `*Tools used: ${e.tools.join(", ")}*\n\n`;
        }
      });

      return md;
    }

    toPlainText(session) {
      let txt = `Chat Session - ${new Date(session.startTime).toLocaleString()}\n`;
      txt += `${"=".repeat(50)}\n\n`;

      session.entries.forEach((e) => {
        const time = new Date(e.timestamp).toLocaleTimeString();
        const sender = e.type === "user" ? "You" : "Agent";
        txt += `[${time}] ${sender}:\n${e.content}\n\n`;
      });

      return txt;
    }

    filterLogs(query) {
      this.searchQuery = query;
      this.renderLogs();
    }

    setFilter(filter) {
      this.typeFilter = filter;
      this.renderLogs();
    }

    renderSessions() {
      const container = this.panel.querySelector("#bael-logger-sessions");

      container.innerHTML =
        this.sessions
          .map((s) => {
            const date = new Date(s.startTime);
            const isActive = s.id === this.selectedSession;

            return `
                    <div class="bael-logger-session-item ${isActive ? "active" : ""}" data-id="${s.id}">
                        <div class="bael-logger-session-date">${date.toLocaleDateString()}</div>
                        <div class="bael-logger-session-meta">
                            <span>${date.toLocaleTimeString()}</span>
                            <span>${s.entries.length} msgs</span>
                        </div>
                    </div>
                `;
          })
          .join("") ||
        '<div style="padding:20px;color:#555;font-size:12px;">No sessions yet</div>';

      container.querySelectorAll(".bael-logger-session-item").forEach((el) => {
        el.addEventListener("click", () => {
          this.selectedSession = parseInt(el.dataset.id);
          this.renderSessions();
          this.renderLogs();
        });
      });
    }

    renderLogs() {
      const container = this.panel.querySelector("#bael-logger-logs");
      const statsEl = this.panel.querySelector("#bael-logger-stats");

      const session = this.sessions.find((s) => s.id === this.selectedSession);
      if (!session) {
        container.innerHTML = `
                    <div class="bael-logger-empty">
                        <div class="bael-logger-empty-icon">📝</div>
                        <div>Select a session to view logs</div>
                    </div>
                `;
        return;
      }

      let entries = session.entries;

      // Apply filters
      if (this.typeFilter === "user")
        entries = entries.filter((e) => e.type === "user");
      else if (this.typeFilter === "agent")
        entries = entries.filter((e) => e.type === "agent");
      else if (this.typeFilter === "tools")
        entries = entries.filter((e) => e.tools.length > 0);

      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        entries = entries.filter((e) => e.content.toLowerCase().includes(q));
      }

      if (entries.length === 0) {
        container.innerHTML = `
                    <div class="bael-logger-empty">
                        <div class="bael-logger-empty-icon">🔍</div>
                        <div>No matching entries</div>
                    </div>
                `;
      } else {
        container.innerHTML = entries
          .map((e) => {
            const time = new Date(e.timestamp).toLocaleTimeString();
            const avatar = e.type === "user" ? "👤" : "🤖";
            const name = e.type === "user" ? "You" : "Agent";
            const truncated = e.content.length > 500;
            const content = truncated ? e.content.substring(0, 500) : e.content;

            return `
                        <div class="bael-logger-entry">
                            <div class="bael-logger-entry-header">
                                <div class="bael-logger-entry-sender">
                                    <div class="bael-logger-entry-avatar ${e.type}">${avatar}</div>
                                    <div class="bael-logger-entry-name">${name}</div>
                                </div>
                                <div class="bael-logger-entry-time">${time}</div>
                            </div>
                            <div class="bael-logger-entry-content ${truncated ? "truncated" : ""}">${this.escapeHtml(content)}</div>
                            ${
                              e.tools.length
                                ? `
                                <div class="bael-logger-entry-tools">
                                    ${e.tools.map((t) => `<span class="bael-logger-tool-badge">🔧 ${t}</span>`).join("")}
                                </div>
                            `
                                : ""
                            }
                        </div>
                    `;
          })
          .join("");
      }

      // Stats
      const userCount = session.entries.filter((e) => e.type === "user").length;
      const agentCount = session.entries.filter(
        (e) => e.type === "agent",
      ).length;
      const toolCount = session.entries.reduce(
        (sum, e) => sum + e.tools.length,
        0,
      );

      statsEl.innerHTML = `
                <div class="bael-logger-stat">Total: <strong>${session.entries.length}</strong></div>
                <div class="bael-logger-stat">User: <strong>${userCount}</strong></div>
                <div class="bael-logger-stat">Agent: <strong>${agentCount}</strong></div>
                <div class="bael-logger-stat">Tools: <strong>${toolCount}</strong></div>
            `;
    }

    escapeHtml(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    }

    showToast(message) {
      const t = document.createElement("div");
      t.style.cssText = `position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#14b8a6,#0d9488);color:white;padding:12px 24px;border-radius:10px;font-size:14px;z-index:100000;`;
      t.textContent = message;
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 2000);
    }

    toggle() {
      this.visible ? this.hide() : this.show();
    }

    show() {
      this.renderSessions();
      this.renderLogs();
      this.panel.classList.add("visible");
      this.visible = true;
    }

    hide() {
      this.panel.classList.remove("visible");
      this.visible = false;
    }

    loadFromStorage() {
      try {
        const data = JSON.parse(localStorage.getItem(this.storageKey) || "{}");
        this.sessions = data.sessions || [];
        if (this.sessions.length) {
          this.selectedSession = this.sessions[0].id;
        }
      } catch (e) {}
    }

    saveToStorage() {
      try {
        // Keep only last 20 sessions
        this.sessions = this.sessions.slice(0, 20);
        localStorage.setItem(
          this.storageKey,
          JSON.stringify({ sessions: this.sessions }),
        );
      } catch (e) {}
    }
  }

  window.BaelSessionLogger = new BaelSessionLogger();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () =>
      window.BaelSessionLogger.initialize(),
    );
  } else {
    window.BaelSessionLogger.initialize();
  }
})();
