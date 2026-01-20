/**
 * ████████████████████████████████████████████████████████████████████████████
 * █                                                                          █
 * █  ██████╗ ██████╗  ██████╗ ███████╗██╗██╗     ███████╗███████╗            █
 * █  ██╔══██╗██╔══██╗██╔═══██╗██╔════╝██║██║     ██╔════╝██╔════╝            █
 * █  ██████╔╝██████╔╝██║   ██║█████╗  ██║██║     █████╗  ███████╗            █
 * █  ██╔═══╝ ██╔══██╗██║   ██║██╔══╝  ██║██║     ██╔══╝  ╚════██║            █
 * █  ██║     ██║  ██║╚██████╔╝██║     ██║███████╗███████╗███████║            █
 * █  ╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝╚══════╝╚══════╝╚══════╝            █
 * █                                                                          █
 * █   BAEL AGENT PROFILES - Agent Configuration & Profiles Manager          █
 * █   Manage and switch between agent configurations (Ctrl+Shift+G)         █
 * █                                                                          █
 * ████████████████████████████████████████████████████████████████████████████
 */

(function () {
  "use strict";

  class BaelAgentProfiles {
    constructor() {
      this.version = "1.0.0";
      this.initialized = false;
      this.visible = false;
      this.container = null;
      this.profiles = [];
      this.activeProfile = null;
    }

    async initialize() {
      console.log("🎭 Bael Agent Profiles initializing...");

      await this.loadProfiles();
      this.injectStyles();
      this.createContainer();
      this.setupShortcuts();

      this.initialized = true;
      console.log("✅ BAEL AGENT PROFILES READY");

      return this;
    }

    injectStyles() {
      if (document.getElementById("bael-agent-profiles-styles")) return;

      const styles = document.createElement("style");
      styles.id = "bael-agent-profiles-styles";
      styles.textContent = `
                .bael-profiles-overlay {
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

                .bael-profiles-overlay.visible {
                    opacity: 1;
                    pointer-events: auto;
                }

                .bael-profiles-modal {
                    width: 90vw;
                    max-width: 1000px;
                    max-height: 85vh;
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

                .bael-profiles-overlay.visible .bael-profiles-modal {
                    transform: scale(1);
                }

                .profiles-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 20px 24px;
                    background: rgba(255, 255, 255, 0.03);
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .profiles-title {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .profiles-title h2 {
                    margin: 0;
                    font-size: 20px;
                    font-weight: 600;
                    color: #fff;
                }

                .profiles-actions {
                    display: flex;
                    gap: 10px;
                }

                .profile-btn {
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

                .profile-btn.primary {
                    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                    color: #fff;
                }

                .profile-btn.primary:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
                }

                .profile-btn.secondary {
                    background: rgba(255, 255, 255, 0.08);
                    color: rgba(255, 255, 255, 0.8);
                }

                .profiles-close {
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

                .profiles-close:hover {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }

                .profiles-content {
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px;
                }

                .profiles-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 20px;
                }

                .profile-card {
                    background: rgba(255, 255, 255, 0.04);
                    border-radius: 14px;
                    border: 2px solid rgba(255, 255, 255, 0.06);
                    overflow: hidden;
                    transition: all 0.2s;
                }

                .profile-card:hover {
                    border-color: rgba(99, 102, 241, 0.3);
                    transform: translateY(-3px);
                    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
                }

                .profile-card.active {
                    border-color: #22c55e;
                    box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
                }

                .profile-header-section {
                    padding: 20px;
                    background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%);
                    display: flex;
                    align-items: center;
                    gap: 14px;
                }

                .profile-avatar {
                    width: 56px;
                    height: 56px;
                    border-radius: 14px;
                    background: rgba(255, 255, 255, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 28px;
                }

                .profile-meta h3 {
                    margin: 0 0 4px;
                    font-size: 16px;
                    font-weight: 600;
                    color: #fff;
                }

                .profile-meta p {
                    margin: 0;
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.5);
                }

                .profile-badge {
                    padding: 4px 10px;
                    border-radius: 6px;
                    font-size: 10px;
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .profile-badge.active {
                    background: rgba(34, 197, 94, 0.2);
                    color: #22c55e;
                }

                .profile-badge.builtin {
                    background: rgba(99, 102, 241, 0.2);
                    color: #6366f1;
                }

                .profile-body {
                    padding: 16px 20px;
                }

                .profile-description {
                    font-size: 13px;
                    color: rgba(255, 255, 255, 0.6);
                    line-height: 1.5;
                    margin-bottom: 16px;
                }

                .profile-stats {
                    display: flex;
                    gap: 16px;
                    margin-bottom: 16px;
                }

                .profile-stat {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.5);
                }

                .profile-stat-value {
                    color: #fff;
                    font-weight: 600;
                }

                .profile-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 6px;
                    margin-bottom: 16px;
                }

                .profile-tag {
                    padding: 4px 10px;
                    border-radius: 6px;
                    background: rgba(255, 255, 255, 0.06);
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.6);
                }

                .profile-actions {
                    display: flex;
                    gap: 8px;
                }

                .profile-action {
                    flex: 1;
                    padding: 10px;
                    border-radius: 8px;
                    border: none;
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .profile-action.activate {
                    background: rgba(34, 197, 94, 0.2);
                    color: #22c55e;
                }

                .profile-action.activate:hover {
                    background: rgba(34, 197, 94, 0.3);
                }

                .profile-action.edit {
                    background: rgba(99, 102, 241, 0.2);
                    color: #6366f1;
                }

                .profile-action.edit:hover {
                    background: rgba(99, 102, 241, 0.3);
                }

                .profile-action.delete {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }

                .profile-action.delete:hover {
                    background: rgba(239, 68, 68, 0.3);
                }
            `;
      document.head.appendChild(styles);
    }

    createContainer() {
      this.container = document.createElement("div");
      this.container.id = "bael-agent-profiles";
      this.container.className = "bael-profiles-overlay";

      this.container.innerHTML = `
                <div class="bael-profiles-modal">
                    <div class="profiles-header">
                        <div class="profiles-title">
                            <span style="font-size: 24px;">🎭</span>
                            <h2>Agent Profiles</h2>
                        </div>
                        <div class="profiles-actions">
                            <button class="profile-btn primary" onclick="BaelAgentProfiles.createProfile()">
                                ➕ New Profile
                            </button>
                            <button class="profile-btn secondary" onclick="BaelAgentProfiles.refreshProfiles()">
                                🔄 Refresh
                            </button>
                            <button class="profiles-close" onclick="BaelAgentProfiles.hide()">✕</button>
                        </div>
                    </div>
                    <div class="profiles-content">
                        <div class="profiles-grid"></div>
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

    setupShortcuts() {
      document.addEventListener("keydown", (e) => {
        // Ctrl+Shift+G for agent profiles
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "G") {
          e.preventDefault();
          if (this.visible) {
            this.hide();
          } else {
            this.show();
          }
        }
      });
    }

    async loadProfiles() {
      try {
        // Try to fetch from API
        const response = await fetch("/api/agents");
        if (response.ok) {
          const data = await response.json();
          this.profiles = data.agents || [];
          this.activeProfile = data.current || "default";
        } else {
          this.profiles = this.getDefaultProfiles();
        }
      } catch (e) {
        this.profiles = this.getDefaultProfiles();
      }
    }

    getDefaultProfiles() {
      return [
        {
          id: "default",
          name: "Default Agent",
          icon: "🤖",
          description:
            "The standard Agent Zero configuration with balanced capabilities for general tasks.",
          model: "gpt-4",
          builtin: true,
          tags: ["general", "balanced", "default"],
        },
        {
          id: "developer",
          name: "Developer",
          icon: "👨‍💻",
          description:
            "Optimized for coding tasks with enhanced code execution and debugging capabilities.",
          model: "gpt-4",
          builtin: true,
          tags: ["coding", "debug", "development"],
        },
        {
          id: "researcher",
          name: "Researcher",
          icon: "🔬",
          description:
            "Enhanced for research tasks with improved web search and document analysis.",
          model: "gpt-4",
          builtin: true,
          tags: ["research", "analysis", "documents"],
        },
        {
          id: "hacker",
          name: "Hacker",
          icon: "💀",
          description:
            "Security-focused agent for penetration testing and security analysis.",
          model: "gpt-4",
          builtin: true,
          tags: ["security", "pentesting", "analysis"],
        },
      ];
    }

    render() {
      const grid = this.container.querySelector(".profiles-grid");

      grid.innerHTML = this.profiles
        .map((profile) => {
          const isActive = profile.id === this.activeProfile;

          return `
                    <div class="profile-card ${isActive ? "active" : ""}">
                        <div class="profile-header-section">
                            <div class="profile-avatar">${profile.icon || "🤖"}</div>
                            <div class="profile-meta">
                                <h3>${profile.name}</h3>
                                <p>${profile.model || "Default Model"}</p>
                            </div>
                            ${isActive ? '<span class="profile-badge active">Active</span>' : ""}
                            ${profile.builtin ? '<span class="profile-badge builtin">Built-in</span>' : ""}
                        </div>
                        <div class="profile-body">
                            <p class="profile-description">${profile.description || "No description"}</p>
                            <div class="profile-tags">
                                ${(profile.tags || []).map((tag) => `<span class="profile-tag">#${tag}</span>`).join("")}
                            </div>
                            <div class="profile-actions">
                                ${
                                  !isActive
                                    ? `
                                    <button class="profile-action activate" onclick="BaelAgentProfiles.activateProfile('${profile.id}')">
                                        ✅ Activate
                                    </button>
                                `
                                    : `
                                    <button class="profile-action" style="background: rgba(255,255,255,0.05); color: rgba(255,255,255,0.5);" disabled>
                                        Currently Active
                                    </button>
                                `
                                }
                                <button class="profile-action edit" onclick="BaelAgentProfiles.editProfile('${profile.id}')">
                                    ✏️ Edit
                                </button>
                                ${
                                  !profile.builtin
                                    ? `
                                    <button class="profile-action delete" onclick="BaelAgentProfiles.deleteProfile('${profile.id}')">
                                        🗑️
                                    </button>
                                `
                                    : ""
                                }
                            </div>
                        </div>
                    </div>
                `;
        })
        .join("");
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

    async activateProfile(profileId) {
      try {
        const response = await fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ agent_profile: profileId }),
        });

        if (response.ok) {
          this.activeProfile = profileId;
          this.render();
          this.toast(`Profile "${profileId}" activated!`, "success");

          // Dispatch event
          window.dispatchEvent(
            new CustomEvent("bael:profile-changed", {
              detail: { profile: profileId },
            }),
          );
        }
      } catch (e) {
        this.toast("Failed to activate profile", "error");
      }
    }

    createProfile() {
      const name = prompt("Profile name:");
      if (!name) return;

      const profile = {
        id: name.toLowerCase().replace(/\s+/g, "_"),
        name,
        icon: "🤖",
        description: "Custom agent profile",
        model: "gpt-4",
        builtin: false,
        tags: ["custom"],
      };

      this.profiles.push(profile);
      this.render();
      this.toast("Profile created!", "success");
    }

    editProfile(profileId) {
      window.dispatchEvent(
        new CustomEvent("bael:edit-profile", {
          detail: { profileId },
        }),
      );
      this.toast("Open Settings to edit profile", "info");
    }

    deleteProfile(profileId) {
      if (!confirm("Delete this profile?")) return;

      this.profiles = this.profiles.filter((p) => p.id !== profileId);
      this.render();
      this.toast("Profile deleted", "success");
    }

    async refreshProfiles() {
      await this.loadProfiles();
      this.render();
      this.toast("Profiles refreshed", "success");
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

  window.BaelAgentProfiles = new BaelAgentProfiles();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.BaelAgentProfiles.initialize();
    });
  } else {
    window.BaelAgentProfiles.initialize();
  }

  console.log("🎭 Bael Agent Profiles loaded");
})();
