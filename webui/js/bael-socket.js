/**
 * BAEL WebSocket Utilities - Real-time Communication
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete WebSocket system:
 * - Connection management
 * - Auto-reconnect
 * - Message queuing
 * - Event handling
 * - Heartbeat/ping
 * - Room/channel support
 */

(function () {
  "use strict";

  class BaelSocket {
    constructor() {
      this.connections = new Map();
      this.defaultOptions = {
        reconnect: true,
        reconnectInterval: 1000,
        reconnectMaxAttempts: 10,
        reconnectBackoff: 1.5,
        pingInterval: 30000,
        pingMessage: "ping",
        pongMessage: "pong",
        queueMessages: true,
        maxQueueSize: 100,
      };
      console.log("🔌 Bael Socket initialized");
    }

    // ═══════════════════════════════════════════════════════════
    // CONNECTION MANAGEMENT
    // ═══════════════════════════════════════════════════════════

    // Create new connection
    connect(url, options = {}) {
      const config = { ...this.defaultOptions, ...options };

      const connection = {
        url,
        config,
        ws: null,
        status: "disconnected",
        reconnectAttempts: 0,
        messageQueue: [],
        listeners: {
          open: [],
          close: [],
          error: [],
          message: [],
          reconnect: [],
        },
        channels: new Map(),
        pingTimer: null,
        pongTimer: null,
        lastPong: null,
      };

      this.createSocket(connection);
      this.connections.set(url, connection);

      return this.createConnectionAPI(connection);
    }

    // Create WebSocket
    createSocket(connection) {
      try {
        connection.ws = new WebSocket(connection.url);
        connection.status = "connecting";

        connection.ws.onopen = (event) => {
          connection.status = "connected";
          connection.reconnectAttempts = 0;

          // Flush message queue
          this.flushQueue(connection);

          // Start ping
          this.startPing(connection);

          // Notify listeners
          connection.listeners.open.forEach((fn) => fn(event));
        };

        connection.ws.onclose = (event) => {
          connection.status = "disconnected";
          this.stopPing(connection);

          // Notify listeners
          connection.listeners.close.forEach((fn) => fn(event));

          // Attempt reconnect
          if (
            connection.config.reconnect &&
            connection.reconnectAttempts <
              connection.config.reconnectMaxAttempts
          ) {
            this.scheduleReconnect(connection);
          }
        };

        connection.ws.onerror = (error) => {
          connection.listeners.error.forEach((fn) => fn(error));
        };

        connection.ws.onmessage = (event) => {
          // Handle pong
          if (event.data === connection.config.pongMessage) {
            connection.lastPong = Date.now();
            return;
          }

          // Parse message
          let data;
          try {
            data = JSON.parse(event.data);
          } catch {
            data = event.data;
          }

          // Check for channel messages
          if (data && typeof data === "object" && data.channel) {
            const channelListeners = connection.channels.get(data.channel);
            if (channelListeners) {
              channelListeners.forEach((fn) => fn(data.payload || data));
            }
          }

          // Notify listeners
          connection.listeners.message.forEach((fn) => fn(data, event));
        };
      } catch (error) {
        connection.status = "error";
        connection.listeners.error.forEach((fn) => fn(error));
      }
    }

    // Create connection API
    createConnectionAPI(connection) {
      return {
        // Send message
        send: (data) => {
          if (connection.ws && connection.ws.readyState === WebSocket.OPEN) {
            const message =
              typeof data === "object" ? JSON.stringify(data) : data;
            connection.ws.send(message);
            return true;
          }

          if (connection.config.queueMessages) {
            if (
              connection.messageQueue.length < connection.config.maxQueueSize
            ) {
              connection.messageQueue.push(data);
            }
          }
          return false;
        },

        // Close connection
        close: (code, reason) => {
          connection.config.reconnect = false;
          if (connection.ws) {
            connection.ws.close(code, reason);
          }
          this.connections.delete(connection.url);
        },

        // Reconnect
        reconnect: () => {
          connection.config.reconnect = true;
          connection.reconnectAttempts = 0;
          if (connection.ws) {
            connection.ws.close();
          }
          this.createSocket(connection);
        },

        // Event handlers
        on: (event, callback) => {
          if (connection.listeners[event]) {
            connection.listeners[event].push(callback);
          }
          return () => this.off(connection, event, callback);
        },

        off: (event, callback) => {
          if (connection.listeners[event]) {
            const index = connection.listeners[event].indexOf(callback);
            if (index > -1) connection.listeners[event].splice(index, 1);
          }
        },

        // Channel subscription
        subscribe: (channel, callback) => {
          if (!connection.channels.has(channel)) {
            connection.channels.set(channel, []);
          }
          connection.channels.get(channel).push(callback);

          // Send subscription message
          this.createConnectionAPI(connection).send({
            type: "subscribe",
            channel,
          });

          return () => {
            const listeners = connection.channels.get(channel);
            if (listeners) {
              const index = listeners.indexOf(callback);
              if (index > -1) listeners.splice(index, 1);
            }
          };
        },

        // Unsubscribe from channel
        unsubscribe: (channel) => {
          connection.channels.delete(channel);
          this.createConnectionAPI(connection).send({
            type: "unsubscribe",
            channel,
          });
        },

        // Publish to channel
        publish: (channel, payload) => {
          return this.createConnectionAPI(connection).send({
            type: "publish",
            channel,
            payload,
          });
        },

        // Get status
        getStatus: () => connection.status,

        // Check if connected
        isConnected: () =>
          connection.ws && connection.ws.readyState === WebSocket.OPEN,

        // Get raw WebSocket
        getSocket: () => connection.ws,

        // Get queue
        getQueue: () => [...connection.messageQueue],

        // Clear queue
        clearQueue: () => {
          connection.messageQueue = [];
        },
      };
    }

    // ═══════════════════════════════════════════════════════════
    // RECONNECTION
    // ═══════════════════════════════════════════════════════════

    scheduleReconnect(connection) {
      const delay =
        connection.config.reconnectInterval *
        Math.pow(
          connection.config.reconnectBackoff,
          connection.reconnectAttempts,
        );

      connection.status = "reconnecting";
      connection.reconnectAttempts++;

      connection.listeners.reconnect.forEach((fn) =>
        fn({
          attempt: connection.reconnectAttempts,
          maxAttempts: connection.config.reconnectMaxAttempts,
          delay,
        }),
      );

      setTimeout(() => {
        if (connection.config.reconnect) {
          this.createSocket(connection);
        }
      }, delay);
    }

    // ═══════════════════════════════════════════════════════════
    // MESSAGE QUEUE
    // ═══════════════════════════════════════════════════════════

    flushQueue(connection) {
      while (
        connection.messageQueue.length > 0 &&
        connection.ws.readyState === WebSocket.OPEN
      ) {
        const message = connection.messageQueue.shift();
        const data =
          typeof message === "object" ? JSON.stringify(message) : message;
        connection.ws.send(data);
      }
    }

    // ═══════════════════════════════════════════════════════════
    // HEARTBEAT
    // ═══════════════════════════════════════════════════════════

    startPing(connection) {
      if (connection.config.pingInterval <= 0) return;

      connection.pingTimer = setInterval(() => {
        if (connection.ws && connection.ws.readyState === WebSocket.OPEN) {
          connection.ws.send(connection.config.pingMessage);
        }
      }, connection.config.pingInterval);
    }

    stopPing(connection) {
      if (connection.pingTimer) {
        clearInterval(connection.pingTimer);
        connection.pingTimer = null;
      }
      if (connection.pongTimer) {
        clearTimeout(connection.pongTimer);
        connection.pongTimer = null;
      }
    }

    // ═══════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════

    // Get connection by URL
    get(url) {
      const connection = this.connections.get(url);
      if (connection) {
        return this.createConnectionAPI(connection);
      }
      return null;
    }

    // Get all connections
    getAll() {
      const result = {};
      for (const [url, connection] of this.connections) {
        result[url] = this.createConnectionAPI(connection);
      }
      return result;
    }

    // Close all connections
    closeAll() {
      for (const [url, connection] of this.connections) {
        connection.config.reconnect = false;
        if (connection.ws) {
          connection.ws.close();
        }
      }
      this.connections.clear();
    }

    // Check WebSocket support
    isSupported() {
      return "WebSocket" in window;
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // SOCKET.IO-LIKE WRAPPER
  // ═══════════════════════════════════════════════════════════════════

  class BaelIO {
    constructor(url, options = {}) {
      this.url = url;
      this.socket = window.BaelSocket.connect(url, options);
      this.eventHandlers = new Map();
    }

    // Emit event
    emit(event, ...args) {
      return this.socket.send({
        event,
        args,
      });
    }

    // Listen for event
    on(event, callback) {
      if (!this.eventHandlers.has(event)) {
        this.eventHandlers.set(event, []);
      }
      this.eventHandlers.get(event).push(callback);

      // Setup message handler if first listener
      if (this.eventHandlers.get(event).length === 1) {
        this.socket.on("message", (data) => {
          if (data && data.event === event) {
            const handlers = this.eventHandlers.get(event);
            handlers?.forEach((fn) => fn(...(data.args || [])));
          }
        });
      }

      return this;
    }

    // Remove listener
    off(event, callback) {
      if (callback) {
        const handlers = this.eventHandlers.get(event);
        if (handlers) {
          const index = handlers.indexOf(callback);
          if (index > -1) handlers.splice(index, 1);
        }
      } else {
        this.eventHandlers.delete(event);
      }
      return this;
    }

    // One-time listener
    once(event, callback) {
      const wrapper = (...args) => {
        callback(...args);
        this.off(event, wrapper);
      };
      return this.on(event, wrapper);
    }

    // Connection events
    onConnect(callback) {
      this.socket.on("open", callback);
      return this;
    }

    onDisconnect(callback) {
      this.socket.on("close", callback);
      return this;
    }

    onError(callback) {
      this.socket.on("error", callback);
      return this;
    }

    // Room operations
    join(room) {
      return this.emit("join", room);
    }

    leave(room) {
      return this.emit("leave", room);
    }

    // Close
    disconnect() {
      this.socket.close();
    }

    // Get status
    get connected() {
      return this.socket.isConnected();
    }
  }

  // Initialize
  window.BaelSocket = new BaelSocket();
  window.BaelIO = BaelIO;

  // Global shortcuts
  window.$socket = (url, options) => window.BaelSocket.connect(url, options);
  window.$io = (url, options) => new BaelIO(url, options);
})();
