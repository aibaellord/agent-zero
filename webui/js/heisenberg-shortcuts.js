/**
 * HEISENBERG KEYBOARD SHORTCUTS
 * =============================
 * Keyboard shortcuts for Heisenberg Singularity features.
 *
 * Available shortcuts:
 * - Ctrl/Cmd + Shift + H: Open Heisenberg Dashboard
 * - Ctrl/Cmd + Shift + I: Open Heisenberg Instruments
 * - Ctrl/Cmd + Shift + R: Refresh Heisenberg Status
 * - Alt + H: Quick Heisenberg Status
 */

import { callJsonApi } from "/js/api.js";

// Track if shortcuts are enabled
let heisenbergShortcutsEnabled = true;

/**
 * Initialize Heisenberg keyboard shortcuts
 */
export function initHeisenbergShortcuts() {
  document.addEventListener("keydown", handleHeisenbergShortcuts);
  console.log("🔬 Heisenberg keyboard shortcuts initialized");
}

/**
 * Handle Heisenberg-specific keyboard shortcuts
 */
async function handleHeisenbergShortcuts(e) {
  if (!heisenbergShortcutsEnabled) return;

  // Don't trigger shortcuts when typing in inputs
  if (
    e.target.tagName === "INPUT" ||
    e.target.tagName === "TEXTAREA" ||
    e.target.isContentEditable
  ) {
    return;
  }

  const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const cmdKey = isMac ? e.metaKey : e.ctrlKey;

  // Ctrl/Cmd + Shift + H: Open Heisenberg Dashboard
  if (cmdKey && e.shiftKey && e.key === "H") {
    e.preventDefault();
    openHeisenbergDashboard();
    return;
  }

  // Ctrl/Cmd + Shift + I: Open Heisenberg Instruments
  if (cmdKey && e.shiftKey && e.key === "I") {
    e.preventDefault();
    openHeisenbergInstruments();
    return;
  }

  // Ctrl/Cmd + Shift + R: Refresh Heisenberg Status
  if (cmdKey && e.shiftKey && e.key === "R") {
    e.preventDefault();
    await refreshHeisenbergStatus();
    return;
  }

  // Alt + H: Quick Heisenberg Status Toast
  if (e.altKey && e.key === "h") {
    e.preventDefault();
    await showQuickHeisenbergStatus();
    return;
  }
}

/**
 * Open Heisenberg Dashboard in settings modal
 */
function openHeisenbergDashboard() {
  if (window.Alpine && Alpine.store("settings")) {
    Alpine.store("settings").show();
    setTimeout(() => {
      Alpine.store("settings").activeTab = "heisenberg";
    }, 100);
  }
}

/**
 * Open Heisenberg Instruments panel
 */
function openHeisenbergInstruments() {
  if (window.Alpine && Alpine.store("settings")) {
    Alpine.store("settings").show();
    setTimeout(() => {
      Alpine.store("settings").activeTab = "heisenberg";
      // Try to scroll to instruments section
      setTimeout(() => {
        const instrumentsSection = document.getElementById(
          "section-heisenberg-instruments",
        );
        if (instrumentsSection) {
          instrumentsSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 200);
    }, 100);
  }
}

/**
 * Refresh Heisenberg status
 */
async function refreshHeisenbergStatus() {
  showToast("🔄 Refreshing Heisenberg...", "info");

  try {
    const response = await callJsonApi("/heisenberg_status", {
      action: "health",
    });

    if (response.ok) {
      const health = response.overall_health;
      const status =
        health >= 0.9 ? "excellent" : health >= 0.7 ? "good" : "degraded";
      showToast(
        `✅ Heisenberg Health: ${status} (${Math.round(health * 100)}%)`,
        "success",
      );
    } else {
      showToast("⚠️ Heisenberg not responding", "warning");
    }
  } catch (e) {
    showToast("❌ Failed to refresh Heisenberg", "error");
  }
}

/**
 * Show quick Heisenberg status
 */
async function showQuickHeisenbergStatus() {
  try {
    const response = await callJsonApi("/heisenberg_status", {
      action: "status",
    });

    if (response.ok && response.initialized) {
      const systems = response.systems || {};
      const stats = response.stats || {};
      showToast(
        `🔬 Heisenberg: ${systems.online}/${systems.total} systems | ${stats.total_calls || 0} calls`,
        "info",
      );
    } else {
      showToast("🔬 Heisenberg: OFFLINE", "warning");
    }
  } catch (e) {
    showToast("🔬 Heisenberg: ERROR", "error");
  }
}

/**
 * Show toast notification
 */
function showToast(message, type = "info") {
  // Try to use the notification store if available
  if (window.Alpine && Alpine.store("notifications")) {
    Alpine.store("notifications").frontendNotification(message, type);
    return;
  }

  // Fallback to console
  console.log(`[${type.toUpperCase()}] ${message}`);
}

/**
 * Enable/disable Heisenberg shortcuts
 */
export function setHeisenbergShortcutsEnabled(enabled) {
  heisenbergShortcutsEnabled = enabled;
}

// Auto-initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHeisenbergShortcuts);
} else {
  initHeisenbergShortcuts();
}

// Export for manual control
export default {
  initHeisenbergShortcuts,
  setHeisenbergShortcutsEnabled,
  openHeisenbergDashboard,
  openHeisenbergInstruments,
  refreshHeisenbergStatus,
  showQuickHeisenbergStatus,
};
