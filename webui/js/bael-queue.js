/**
 * BAEL Queue - Task & Job Queue System
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete queuing system:
 * - FIFO/LIFO/Priority queues
 * - Job processing
 * - Retry logic
 * - Rate limiting
 * - Dead letter queues
 */

(function () {
  "use strict";

  class BaelQueue {
    constructor() {
      this.queues = new Map();
      this.workers = new Map();
      this.stats = new Map();
      console.log("📋 Bael Queue initialized");
    }

    // ═══════════════════════════════════════════════════════════
    // QUEUE CREATION
    // ═══════════════════════════════════════════════════════════

    create(name, options = {}) {
      const config = {
        type: options.type || "fifo",
        maxSize: options.maxSize || Infinity,
        retries: options.retries ?? 3,
        retryDelay: options.retryDelay || 1000,
        timeout: options.timeout || 30000,
        rateLimit: options.rateLimit || null,
        deadLetterQueue: options.deadLetterQueue || null,
        onProcess: options.onProcess || null,
        ...options,
      };

      const queue = {
        name,
        config,
        items: [],
        processing: false,
        paused: false,
        dlq: [],
      };

      this.queues.set(name, queue);
      this.stats.set(name, {
        added: 0,
        processed: 0,
        failed: 0,
        retries: 0,
      });

      return new QueueInterface(this, name);
    }

    get(name) {
      if (!this.queues.has(name)) {
        throw new Error(`Queue "${name}" not found`);
      }
      return new QueueInterface(this, name);
    }

    has(name) {
      return this.queues.has(name);
    }

    delete(name) {
      this.queues.delete(name);
      this.workers.delete(name);
      this.stats.delete(name);
    }

    list() {
      return [...this.queues.keys()];
    }

    // ═══════════════════════════════════════════════════════════
    // QUEUE OPERATIONS
    // ═══════════════════════════════════════════════════════════

    enqueue(name, item, options = {}) {
      const queue = this.queues.get(name);
      if (!queue) throw new Error(`Queue "${name}" not found`);

      if (queue.items.length >= queue.config.maxSize) {
        throw new Error(`Queue "${name}" is full`);
      }

      const job = {
        id: this._generateId(),
        data: item,
        priority: options.priority || 0,
        attempts: 0,
        maxRetries: options.retries ?? queue.config.retries,
        delay: options.delay || 0,
        timeout: options.timeout || queue.config.timeout,
        createdAt: Date.now(),
        scheduledAt: Date.now() + (options.delay || 0),
        status: "pending",
      };

      this._insertJob(queue, job);
      this.stats.get(name).added++;

      this._processQueue(name);

      return job.id;
    }

    _insertJob(queue, job) {
      switch (queue.config.type) {
        case "lifo":
          queue.items.unshift(job);
          break;
        case "priority":
          const idx = queue.items.findIndex((j) => j.priority < job.priority);
          if (idx === -1) {
            queue.items.push(job);
          } else {
            queue.items.splice(idx, 0, job);
          }
          break;
        case "fifo":
        default:
          queue.items.push(job);
          break;
      }
    }

    dequeue(name) {
      const queue = this.queues.get(name);
      if (!queue) throw new Error(`Queue "${name}" not found`);

      const now = Date.now();
      const idx = queue.items.findIndex((j) => j.scheduledAt <= now);
      if (idx === -1) return null;

      return queue.items.splice(idx, 1)[0];
    }

    peek(name) {
      const queue = this.queues.get(name);
      if (!queue) return null;
      return queue.items[0] || null;
    }

    size(name) {
      const queue = this.queues.get(name);
      return queue ? queue.items.length : 0;
    }

    isEmpty(name) {
      return this.size(name) === 0;
    }

    clear(name) {
      const queue = this.queues.get(name);
      if (queue) {
        queue.items = [];
      }
    }

    // ═══════════════════════════════════════════════════════════
    // WORKERS
    // ═══════════════════════════════════════════════════════════

    process(name, handler, options = {}) {
      const queue = this.queues.get(name);
      if (!queue) throw new Error(`Queue "${name}" not found`);

      const workerConfig = {
        handler,
        concurrency: options.concurrency || 1,
        pollInterval: options.pollInterval || 100,
        running: 0,
      };

      this.workers.set(name, workerConfig);
      this._processQueue(name);

      return {
        stop: () => this.stopWorker(name),
        pause: () => this.pauseQueue(name),
        resume: () => this.resumeQueue(name),
      };
    }

    async _processQueue(name) {
      const queue = this.queues.get(name);
      const worker = this.workers.get(name);

      if (!queue || !worker || queue.paused || queue.processing) return;

      queue.processing = true;

      while (queue.items.length > 0 && worker.running < worker.concurrency) {
        if (queue.paused) break;

        const job = this.dequeue(name);
        if (!job) {
          await this._sleep(worker.pollInterval);
          continue;
        }

        worker.running++;
        this._processJob(name, job, worker).finally(() => {
          worker.running--;
          this._processQueue(name);
        });
      }

      queue.processing = false;
    }

    async _processJob(name, job, worker) {
      const queue = this.queues.get(name);
      const stats = this.stats.get(name);

      job.status = "processing";
      job.attempts++;

      try {
        // Check rate limit
        if (queue.config.rateLimit) {
          await this._checkRateLimit(name);
        }

        // Execute with timeout
        const result = await this._withTimeout(
          worker.handler(job.data, job),
          job.timeout,
        );

        job.status = "completed";
        job.result = result;
        stats.processed++;

        return result;
      } catch (error) {
        job.error = error;

        if (job.attempts < job.maxRetries) {
          // Retry
          job.status = "pending";
          job.scheduledAt = Date.now() + queue.config.retryDelay * job.attempts;
          this._insertJob(queue, job);
          stats.retries++;
        } else {
          // Move to DLQ
          job.status = "failed";
          stats.failed++;

          if (queue.config.deadLetterQueue) {
            const dlq = this.queues.get(queue.config.deadLetterQueue);
            if (dlq) {
              dlq.items.push(job);
            }
          }
          queue.dlq.push(job);
        }

        throw error;
      }
    }

    async _withTimeout(promise, ms) {
      return Promise.race([
        promise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Job timeout")), ms),
        ),
      ]);
    }

    async _checkRateLimit(name) {
      const queue = this.queues.get(name);
      if (!queue.config.rateLimit) return;

      const { maxRequests, interval } = queue.config.rateLimit;

      if (!queue._rateLimitState) {
        queue._rateLimitState = { count: 0, resetAt: Date.now() + interval };
      }

      const state = queue._rateLimitState;
      const now = Date.now();

      if (now >= state.resetAt) {
        state.count = 0;
        state.resetAt = now + interval;
      }

      if (state.count >= maxRequests) {
        await this._sleep(state.resetAt - now);
        state.count = 0;
        state.resetAt = Date.now() + interval;
      }

      state.count++;
    }

    stopWorker(name) {
      this.workers.delete(name);
    }

    pauseQueue(name) {
      const queue = this.queues.get(name);
      if (queue) queue.paused = true;
    }

    resumeQueue(name) {
      const queue = this.queues.get(name);
      if (queue) {
        queue.paused = false;
        this._processQueue(name);
      }
    }

    // ═══════════════════════════════════════════════════════════
    // BULK OPERATIONS
    // ═══════════════════════════════════════════════════════════

    enqueueBulk(name, items, options = {}) {
      return items.map((item, i) =>
        this.enqueue(name, item, {
          ...options,
          delay: (options.delay || 0) + (options.stagger || 0) * i,
        }),
      );
    }

    drain(name) {
      const queue = this.queues.get(name);
      if (!queue) return [];
      const items = [...queue.items];
      queue.items = [];
      return items;
    }

    // ═══════════════════════════════════════════════════════════
    // JOB MANAGEMENT
    // ═══════════════════════════════════════════════════════════

    getJob(name, jobId) {
      const queue = this.queues.get(name);
      if (!queue) return null;
      return queue.items.find((j) => j.id === jobId) || null;
    }

    removeJob(name, jobId) {
      const queue = this.queues.get(name);
      if (!queue) return false;
      const idx = queue.items.findIndex((j) => j.id === jobId);
      if (idx === -1) return false;
      queue.items.splice(idx, 1);
      return true;
    }

    updateJob(name, jobId, updates) {
      const job = this.getJob(name, jobId);
      if (!job) return false;
      Object.assign(job, updates);
      return true;
    }

    getFailedJobs(name) {
      const queue = this.queues.get(name);
      return queue ? [...queue.dlq] : [];
    }

    retryFailed(name) {
      const queue = this.queues.get(name);
      if (!queue) return 0;

      const count = queue.dlq.length;
      queue.dlq.forEach((job) => {
        job.attempts = 0;
        job.status = "pending";
        job.scheduledAt = Date.now();
        this._insertJob(queue, job);
      });
      queue.dlq = [];

      this._processQueue(name);
      return count;
    }

    // ═══════════════════════════════════════════════════════════
    // STATS
    // ═══════════════════════════════════════════════════════════

    getStats(name) {
      const stats = this.stats.get(name);
      const queue = this.queues.get(name);
      if (!stats || !queue) return null;

      return {
        ...stats,
        pending: queue.items.filter((j) => j.status === "pending").length,
        processing: queue.items.filter((j) => j.status === "processing").length,
        dlqSize: queue.dlq.length,
        isPaused: queue.paused,
      };
    }

    getAllStats() {
      const result = {};
      for (const name of this.queues.keys()) {
        result[name] = this.getStats(name);
      }
      return result;
    }

    // ═══════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════

    _generateId() {
      return `job_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    }

    _sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // QUEUE INTERFACE
  // ═══════════════════════════════════════════════════════════════════

  class QueueInterface {
    constructor(manager, name) {
      this._manager = manager;
      this._name = name;
    }

    add(item, options) {
      return this._manager.enqueue(this._name, item, options);
    }

    addBulk(items, options) {
      return this._manager.enqueueBulk(this._name, items, options);
    }

    process(handler, options) {
      return this._manager.process(this._name, handler, options);
    }

    peek() {
      return this._manager.peek(this._name);
    }

    size() {
      return this._manager.size(this._name);
    }

    isEmpty() {
      return this._manager.isEmpty(this._name);
    }

    clear() {
      return this._manager.clear(this._name);
    }

    drain() {
      return this._manager.drain(this._name);
    }

    pause() {
      return this._manager.pauseQueue(this._name);
    }

    resume() {
      return this._manager.resumeQueue(this._name);
    }

    getJob(jobId) {
      return this._manager.getJob(this._name, jobId);
    }

    removeJob(jobId) {
      return this._manager.removeJob(this._name, jobId);
    }

    getFailed() {
      return this._manager.getFailedJobs(this._name);
    }

    retryFailed() {
      return this._manager.retryFailed(this._name);
    }

    stats() {
      return this._manager.getStats(this._name);
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // SPECIALIZED QUEUES
  // ═══════════════════════════════════════════════════════════════════

  class PriorityQueue {
    constructor() {
      this.items = [];
    }

    enqueue(item, priority = 0) {
      const node = { item, priority };
      const idx = this.items.findIndex((n) => n.priority < priority);
      if (idx === -1) {
        this.items.push(node);
      } else {
        this.items.splice(idx, 0, node);
      }
      return this;
    }

    dequeue() {
      return this.items.shift()?.item;
    }

    peek() {
      return this.items[0]?.item;
    }

    size() {
      return this.items.length;
    }

    isEmpty() {
      return this.items.length === 0;
    }

    clear() {
      this.items = [];
    }

    toArray() {
      return this.items.map((n) => n.item);
    }
  }

  class CircularQueue {
    constructor(capacity) {
      this.capacity = capacity;
      this.items = new Array(capacity);
      this.head = 0;
      this.tail = 0;
      this.length = 0;
    }

    enqueue(item) {
      if (this.isFull()) {
        return false;
      }
      this.items[this.tail] = item;
      this.tail = (this.tail + 1) % this.capacity;
      this.length++;
      return true;
    }

    dequeue() {
      if (this.isEmpty()) {
        return undefined;
      }
      const item = this.items[this.head];
      this.items[this.head] = undefined;
      this.head = (this.head + 1) % this.capacity;
      this.length--;
      return item;
    }

    peek() {
      return this.items[this.head];
    }

    size() {
      return this.length;
    }

    isEmpty() {
      return this.length === 0;
    }

    isFull() {
      return this.length === this.capacity;
    }

    clear() {
      this.items = new Array(this.capacity);
      this.head = 0;
      this.tail = 0;
      this.length = 0;
    }

    toArray() {
      const result = [];
      for (let i = 0; i < this.length; i++) {
        result.push(this.items[(this.head + i) % this.capacity]);
      }
      return result;
    }
  }

  class Deque {
    constructor() {
      this.items = [];
    }

    pushFront(item) {
      this.items.unshift(item);
      return this;
    }

    pushBack(item) {
      this.items.push(item);
      return this;
    }

    popFront() {
      return this.items.shift();
    }

    popBack() {
      return this.items.pop();
    }

    peekFront() {
      return this.items[0];
    }

    peekBack() {
      return this.items[this.items.length - 1];
    }

    size() {
      return this.items.length;
    }

    isEmpty() {
      return this.items.length === 0;
    }

    clear() {
      this.items = [];
    }

    toArray() {
      return [...this.items];
    }
  }

  // Initialize
  window.BaelQueue = new BaelQueue();
  window.PriorityQueue = PriorityQueue;
  window.CircularQueue = CircularQueue;
  window.Deque = Deque;

  // Global shortcuts
  window.$queue = window.BaelQueue;
  window.$createQueue = (name, opts) => window.BaelQueue.create(name, opts);

  console.log("📋 Bael Queue ready");
})();
