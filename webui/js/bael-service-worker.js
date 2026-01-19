/**
 * ═══════════════════════════════════════════════════════════════════════════
 * BAEL - LORD OF ALL
 * SERVICE WORKER - Offline Mode & PWA Enhancement
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Advanced Progressive Web App features:
 * - Offline caching strategies
 * - Background sync
 * - Push notifications
 * - Asset precaching
 * - Dynamic caching
 *
 * @version 1.0.0
 */

const CACHE_NAME = "bael-cache-v1";
const STATIC_CACHE = "bael-static-v1";
const DYNAMIC_CACHE = "bael-dynamic-v1";
const DATA_CACHE = "bael-data-v1";

// Assets to precache
const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/css/style.css",
  "/css/chat.css",
  "/css/settings.css",
  "/js/alpine.min.js",
  "/js/app.js",
  "/js/bael-master-controller.js",
  "/js/bael-theme-system.js",
  "/js/bael-command-palette.js",
  "/js/bael-chat-essentials.js",
  "/public/favicon.ico",
  "/public/icon-192.png",
  "/public/icon-512.png",
];

// Cache strategies
const CACHE_STRATEGIES = {
  cacheFirst: [
    "css",
    "js",
    "png",
    "jpg",
    "jpeg",
    "gif",
    "svg",
    "woff",
    "woff2",
  ],
  networkFirst: ["html", "json"],
  staleWhileRevalidate: ["api"],
};

// ═════════════════════════════════════════════════════════════════════════
// INSTALLATION
// ═════════════════════════════════════════════════════════════════════════

self.addEventListener("install", (event) => {
  console.log("[SW] Installing Service Worker...");

  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => {
        console.log("[SW] Precaching static assets");
        return cache
          .addAll(
            PRECACHE_ASSETS.map((url) => {
              return new Request(url, { mode: "no-cors" });
            }),
          )
          .catch((err) => {
            console.warn("[SW] Some assets failed to cache:", err);
            return Promise.resolve();
          });
      })
      .then(() => {
        console.log("[SW] Skip waiting");
        return self.skipWaiting();
      }),
  );
});

// ═════════════════════════════════════════════════════════════════════════
// ACTIVATION
// ═════════════════════════════════════════════════════════════════════════

self.addEventListener("activate", (event) => {
  console.log("[SW] Activating Service Worker...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              // Delete old caches
              return (
                name.startsWith("bael-") &&
                name !== STATIC_CACHE &&
                name !== DYNAMIC_CACHE &&
                name !== DATA_CACHE
              );
            })
            .map((name) => {
              console.log("[SW] Deleting old cache:", name);
              return caches.delete(name);
            }),
        );
      })
      .then(() => {
        console.log("[SW] Claiming clients");
        return self.clients.claim();
      }),
  );
});

// ═════════════════════════════════════════════════════════════════════════
// FETCH HANDLING
// ═════════════════════════════════════════════════════════════════════════

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip WebSocket connections
  if (request.url.includes("/ws")) {
    return;
  }

  // Determine strategy
  const strategy = getStrategy(request);

  event.respondWith(handleRequest(request, strategy));
});

function getStrategy(request) {
  const url = new URL(request.url);
  const extension = url.pathname.split(".").pop().toLowerCase();

  // API requests
  if (url.pathname.startsWith("/api/")) {
    return "staleWhileRevalidate";
  }

  // Static assets
  if (CACHE_STRATEGIES.cacheFirst.includes(extension)) {
    return "cacheFirst";
  }

  // HTML and JSON
  if (
    CACHE_STRATEGIES.networkFirst.includes(extension) ||
    url.pathname === "/"
  ) {
    return "networkFirst";
  }

  return "networkFirst";
}

async function handleRequest(request, strategy) {
  switch (strategy) {
    case "cacheFirst":
      return cacheFirst(request);
    case "networkFirst":
      return networkFirst(request);
    case "staleWhileRevalidate":
      return staleWhileRevalidate(request);
    default:
      return networkFirst(request);
  }
}

// ═════════════════════════════════════════════════════════════════════════
// CACHE STRATEGIES
// ═════════════════════════════════════════════════════════════════════════

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return getOfflineFallback(request);
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    return getOfflineFallback(request);
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(DATA_CACHE);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);

  return cached || fetchPromise;
}

// ═════════════════════════════════════════════════════════════════════════
// OFFLINE FALLBACK
// ═════════════════════════════════════════════════════════════════════════

async function getOfflineFallback(request) {
  const url = new URL(request.url);

  // HTML pages - return offline page
  if (request.headers.get("accept")?.includes("text/html")) {
    return caches.match("/offline.html") || createOfflinePage();
  }

  // API requests - return offline response
  if (url.pathname.startsWith("/api/")) {
    return new Response(
      JSON.stringify({
        error: "offline",
        message:
          "You are currently offline. This feature will be available when you reconnect.",
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  // Images - return placeholder
  if (request.headers.get("accept")?.includes("image")) {
    return createOfflineImage();
  }

  return new Response("Offline", { status: 503 });
}

function createOfflinePage() {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bael - Offline</title>
    <style>
        :root {
            --bg: #0a0a0f;
            --text: #ffffff;
            --primary: #ff3366;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: var(--bg);
            color: var(--text);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .container {
            text-align: center;
            padding: 40px;
        }
        .icon {
            width: 120px;
            height: 120px;
            margin-bottom: 30px;
            opacity: 0.8;
        }
        h1 {
            font-size: 28px;
            margin-bottom: 16px;
            background: linear-gradient(135deg, var(--primary), #8b5cf6);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        p {
            color: #888;
            font-size: 16px;
            max-width: 400px;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        .retry-btn {
            padding: 12px 32px;
            background: var(--primary);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            transition: transform 0.2s;
        }
        .retry-btn:hover {
            transform: scale(1.05);
        }
        .cached-data {
            margin-top: 40px;
            padding: 20px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            max-width: 500px;
        }
        .cached-data h3 {
            font-size: 14px;
            color: #666;
            margin-bottom: 12px;
        }
    </style>
</head>
<body>
    <div class="container">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 2.5z"/>
        </svg>
        <h1>Bael - Lord Of All</h1>
        <p>You appear to be offline. Some features may be limited, but your previous conversations and data are still available.</p>
        <button class="retry-btn" onclick="location.reload()">
            Try Again
        </button>
        <div class="cached-data">
            <h3>Available Offline</h3>
            <p>• Previous chat history<br>• Saved prompts<br>• Local settings<br>• Cached knowledge</p>
        </div>
    </div>
    <script>
        window.addEventListener('online', () => {
            document.body.innerHTML = '<div class="container"><h1>Back Online!</h1><p>Reconnecting...</p></div>';
            setTimeout(() => location.reload(), 1000);
        });
    </script>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  });
}

function createOfflineImage() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <rect fill="#1a1a2e" width="100" height="100"/>
        <text x="50" y="55" text-anchor="middle" fill="#666" font-family="sans-serif">Offline</text>
    </svg>`;

  return new Response(svg, {
    headers: { "Content-Type": "image/svg+xml" },
  });
}

// ═════════════════════════════════════════════════════════════════════════
// BACKGROUND SYNC
// ═════════════════════════════════════════════════════════════════════════

self.addEventListener("sync", (event) => {
  console.log("[SW] Background sync:", event.tag);

  if (event.tag === "sync-messages") {
    event.waitUntil(syncMessages());
  }

  if (event.tag === "sync-data") {
    event.waitUntil(syncData());
  }
});

async function syncMessages() {
  try {
    const db = await openDB();
    const pendingMessages = await db.getAll("pending-messages");

    for (const msg of pendingMessages) {
      try {
        await fetch("/api/message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(msg),
        });
        await db.delete("pending-messages", msg.id);
      } catch (e) {
        console.warn("[SW] Failed to sync message:", msg.id);
      }
    }
  } catch (error) {
    console.error("[SW] Sync messages failed:", error);
  }
}

async function syncData() {
  // Sync any pending data when back online
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({
      type: "SYNC_COMPLETE",
      timestamp: Date.now(),
    });
  });
}

// Simple IndexedDB wrapper
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("bael-offline", 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      resolve({
        getAll: (store) =>
          new Promise((res, rej) => {
            const tx = db.transaction(store, "readonly");
            const req = tx.objectStore(store).getAll();
            req.onsuccess = () => res(req.result);
            req.onerror = () => rej(req.error);
          }),
        delete: (store, key) =>
          new Promise((res, rej) => {
            const tx = db.transaction(store, "readwrite");
            const req = tx.objectStore(store).delete(key);
            req.onsuccess = () => res();
            req.onerror = () => rej(req.error);
          }),
      });
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("pending-messages")) {
        db.createObjectStore("pending-messages", { keyPath: "id" });
      }
    };
  });
}

// ═════════════════════════════════════════════════════════════════════════
// PUSH NOTIFICATIONS
// ═════════════════════════════════════════════════════════════════════════

self.addEventListener("push", (event) => {
  console.log("[SW] Push received");

  let data = { title: "Bael", body: "New notification" };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: "/public/icon-192.png",
    badge: "/public/badge-72.png",
    vibrate: [100, 50, 100],
    data: data.data || {},
    actions: data.actions || [
      { action: "open", title: "Open Bael" },
      { action: "dismiss", title: "Dismiss" },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event.action);

  event.notification.close();

  if (event.action === "dismiss") {
    return;
  }

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing window
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.postMessage({
              type: "NOTIFICATION_CLICK",
              data: event.notification.data,
            });
            return client.focus();
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow("/");
        }
      }),
  );
});

// ═════════════════════════════════════════════════════════════════════════
// MESSAGE HANDLING
// ═════════════════════════════════════════════════════════════════════════

self.addEventListener("message", (event) => {
  console.log("[SW] Message received:", event.data.type);

  switch (event.data.type) {
    case "SKIP_WAITING":
      self.skipWaiting();
      break;

    case "CACHE_URLS":
      event.waitUntil(cacheUrls(event.data.urls));
      break;

    case "CLEAR_CACHE":
      event.waitUntil(clearCache(event.data.cacheName));
      break;

    case "GET_CACHE_SIZE":
      event.waitUntil(
        getCacheSize().then((size) => {
          event.source.postMessage({
            type: "CACHE_SIZE",
            size,
          });
        }),
      );
      break;
  }
});

async function cacheUrls(urls) {
  const cache = await caches.open(DYNAMIC_CACHE);
  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        await cache.put(url, response);
      }
    } catch (e) {
      console.warn("[SW] Failed to cache:", url);
    }
  }
}

async function clearCache(cacheName) {
  if (cacheName) {
    await caches.delete(cacheName);
  } else {
    const names = await caches.keys();
    await Promise.all(
      names.filter((n) => n.startsWith("bael-")).map((n) => caches.delete(n)),
    );
  }
}

async function getCacheSize() {
  let totalSize = 0;
  const cacheNames = await caches.keys();

  for (const name of cacheNames) {
    if (!name.startsWith("bael-")) continue;

    const cache = await caches.open(name);
    const keys = await cache.keys();

    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
  }

  return totalSize;
}

console.log("[SW] Bael Service Worker loaded");
