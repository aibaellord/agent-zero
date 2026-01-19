import * as device from "./device.js";
import { initHeisenbergShortcuts } from "./heisenberg-shortcuts.js";

export async function initialize() {
  // set device class to body tag
  setDeviceClass();

  // Initialize Heisenberg keyboard shortcuts
  initHeisenbergShortcuts();
}

function setDeviceClass() {
  device.determineInputType().then((type) => {
    // Remove any class starting with 'device-' from <body>
    const body = document.body;
    body.classList.forEach((cls) => {
      if (cls.startsWith("device-")) {
        body.classList.remove(cls);
      }
    });
    // Add the new device class
    body.classList.add(`device-${type}`);
  });
}
