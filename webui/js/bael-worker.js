/**
 * BAEL Worker - Web Workers & Threading
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete worker system:
 * - Inline worker creation
 * - Worker pool management
 * - Task queuing & scheduling
 * - SharedArrayBuffer support
 * - Transferable objects
 */

(function () {
  "use strict";

  class BaelWorker {
    constructor() {
      this.workers = new Map();
      this.pools = new Map();
      this.tasks = new Map();
      this.taskId = 0;
      console.log("⚙️ Bael Worker initialized");
    }

    // ═══════════════════════════════════════════════════════════
    // INLINE WORKER CREATION
    // ═══════════════════════════════════════════════════════════

    createInlineWorker(fn, options = {}) {
      const workerCode = this.generateWorkerCode(fn);
      const blob = new Blob([workerCode], { type: "application/javascript" });
      const url = URL.createObjectURL(blob);

      const worker = new Worker(url, options);

      worker._blobUrl = url;
      worker._cleanup = () => URL.revokeObjectURL(url);

      return worker;
    }

    generateWorkerCode(fn) {
      const fnString = fn.toString();

      return `
                const workerFn = ${fnString};

                self.onmessage = async function(e) {
                    const { id, type, data } = e.data;

                    try {
                        if (type === 'run') {
                            const result = await workerFn(data);
                            self.postMessage({ id, type: 'result', data: result });
                        } else if (type === 'ping') {
                            self.postMessage({ id, type: 'pong' });
                        }
                    } catch (error) {
                        self.postMessage({
                            id,
                            type: 'error',
                            error: {
                                message: error.message,
                                stack: error.stack
                            }
                        });
                    }
                };

                self.postMessage({ type: 'ready' });
            `;
    }

    // ═══════════════════════════════════════════════════════════
    // MANAGED WORKERS
    // ═══════════════════════════════════════════════════════════

    create(name, fn, options = {}) {
      if (this.workers.has(name)) {
        this.terminate(name);
      }

      const worker = this.createInlineWorker(fn, options);
      const pending = new Map();

      const wrapper = {
        worker,
        pending,
        ready: false,
        messageHandler: (e) => {
          const { id, type, data, error } = e.data;

          if (type === "ready") {
            wrapper.ready = true;
            return;
          }

          const task = pending.get(id);
          if (task) {
            if (type === "result") {
              task.resolve(data);
            } else if (type === "error") {
              task.reject(new Error(error.message));
            } else if (type === "pong") {
              task.resolve(true);
            }
            pending.delete(id);
          }
        },
        errorHandler: (error) => {
          console.error(`Worker ${name} error:`, error);
          // Reject all pending
          pending.forEach((task) => task.reject(error));
          pending.clear();
        },
      };

      worker.addEventListener("message", wrapper.messageHandler);
      worker.addEventListener("error", wrapper.errorHandler);

      this.workers.set(name, wrapper);

      return this;
    }

    async run(name, data, transfer = []) {
      const wrapper = this.workers.get(name);
      if (!wrapper) {
        throw new Error(`Worker ${name} not found`);
      }

      // Wait for ready
      if (!wrapper.ready) {
        await this.waitForReady(name);
      }

      const id = ++this.taskId;

      return new Promise((resolve, reject) => {
        wrapper.pending.set(id, { resolve, reject });
        wrapper.worker.postMessage({ id, type: "run", data }, transfer);
      });
    }

    async waitForReady(name, timeout = 5000) {
      const wrapper = this.workers.get(name);
      if (!wrapper) throw new Error(`Worker ${name} not found`);
      if (wrapper.ready) return;

      const start = Date.now();
      while (!wrapper.ready) {
        if (Date.now() - start > timeout) {
          throw new Error(`Worker ${name} timeout`);
        }
        await new Promise((r) => setTimeout(r, 10));
      }
    }

    terminate(name) {
      const wrapper = this.workers.get(name);
      if (wrapper) {
        wrapper.worker.terminate();
        wrapper.worker._cleanup?.();
        wrapper.pending.forEach((task) =>
          task.reject(new Error("Worker terminated")),
        );
        this.workers.delete(name);
      }
      return this;
    }

    terminateAll() {
      this.workers.forEach((_, name) => this.terminate(name));
      return this;
    }

    // ═══════════════════════════════════════════════════════════
    // WORKER POOL
    // ═══════════════════════════════════════════════════════════

    createPool(name, fn, options = {}) {
      const size = options.size || navigator.hardwareConcurrency || 4;
      const workers = [];
      const queue = [];
      let roundRobin = 0;

      for (let i = 0; i < size; i++) {
        const workerName = `${name}_${i}`;
        this.create(workerName, fn, options);
        workers.push({
          name: workerName,
          busy: false,
        });
      }

      const pool = {
        name,
        workers,
        queue,
        size,

        async run(data, transfer) {
          // Find available worker
          let available = workers.find((w) => !w.busy);

          if (!available) {
            // All busy, queue the task
            return new Promise((resolve, reject) => {
              queue.push({ data, transfer, resolve, reject });
            });
          }

          return this.executeOnWorker(available, data, transfer);
        },

        async executeOnWorker(worker, data, transfer) {
          worker.busy = true;

          try {
            const result = await window.BaelWorker.run(
              worker.name,
              data,
              transfer,
            );
            return result;
          } finally {
            worker.busy = false;

            // Check queue
            if (queue.length > 0) {
              const next = queue.shift();
              this.executeOnWorker(worker, next.data, next.transfer)
                .then(next.resolve)
                .catch(next.reject);
            }
          }
        },

        async map(items, options = {}) {
          const { concurrency = size } = options;
          const results = new Array(items.length);
          let index = 0;

          const runNext = async () => {
            while (index < items.length) {
              const i = index++;
              results[i] = await this.run(items[i]);
            }
          };

          const promises = [];
          for (let i = 0; i < concurrency; i++) {
            promises.push(runNext());
          }

          await Promise.all(promises);
          return results;
        },

        terminate() {
          workers.forEach((w) => window.BaelWorker.terminate(w.name));
          queue.forEach((task) => task.reject(new Error("Pool terminated")));
          queue.length = 0;
          window.BaelWorker.pools.delete(name);
        },

        getStats() {
          return {
            size,
            active: workers.filter((w) => w.busy).length,
            queued: queue.length,
          };
        },
      };

      this.pools.set(name, pool);
      return pool;
    }

    getPool(name) {
      return this.pools.get(name);
    }

    // ═══════════════════════════════════════════════════════════
    // TASK SCHEDULING
    // ═══════════════════════════════════════════════════════════

    async schedule(tasks, options = {}) {
      const { concurrency = navigator.hardwareConcurrency || 4, onProgress } =
        options;

      const results = [];
      let completed = 0;
      let index = 0;

      const runNext = async () => {
        while (index < tasks.length) {
          const i = index++;
          const task = tasks[i];

          try {
            const result = await task();
            results[i] = { status: "fulfilled", value: result };
          } catch (error) {
            results[i] = { status: "rejected", reason: error };
          }

          completed++;
          onProgress?.({
            completed,
            total: tasks.length,
            progress: completed / tasks.length,
          });
        }
      };

      const runners = [];
      for (let i = 0; i < Math.min(concurrency, tasks.length); i++) {
        runners.push(runNext());
      }

      await Promise.all(runners);
      return results;
    }

    // ═══════════════════════════════════════════════════════════
    // QUICK HELPERS
    // ═══════════════════════════════════════════════════════════

    async compute(fn, data, transfer = []) {
      const worker = this.createInlineWorker(fn);

      return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          worker.terminate();
          worker._cleanup?.();
          reject(new Error("Computation timeout"));
        }, 30000);

        worker.onmessage = (e) => {
          const { type, data: result, error } = e.data;

          if (type === "ready") return;

          clearTimeout(timeout);
          worker.terminate();
          worker._cleanup?.();

          if (type === "result") {
            resolve(result);
          } else if (type === "error") {
            reject(new Error(error.message));
          }
        };

        worker.onerror = (error) => {
          clearTimeout(timeout);
          worker.terminate();
          worker._cleanup?.();
          reject(error);
        };

        // Wait for ready then run
        setTimeout(() => {
          worker.postMessage({ id: 1, type: "run", data }, transfer);
        }, 0);
      });
    }

    // Run CPU-intensive function in worker
    async offload(fn) {
      const fnString = fn.toString();

      const workerCode = `
                self.onmessage = async function(e) {
                    const fn = new Function('return ' + e.data.fn)();
                    try {
                        const result = await fn();
                        self.postMessage({ type: 'result', data: result });
                    } catch (error) {
                        self.postMessage({ type: 'error', error: { message: error.message } });
                    }
                };
            `;

      const blob = new Blob([workerCode], { type: "application/javascript" });
      const url = URL.createObjectURL(blob);
      const worker = new Worker(url);

      return new Promise((resolve, reject) => {
        worker.onmessage = (e) => {
          URL.revokeObjectURL(url);
          worker.terminate();

          if (e.data.type === "result") {
            resolve(e.data.data);
          } else {
            reject(new Error(e.data.error.message));
          }
        };

        worker.onerror = (error) => {
          URL.revokeObjectURL(url);
          worker.terminate();
          reject(error);
        };

        worker.postMessage({ fn: fnString });
      });
    }

    // ═══════════════════════════════════════════════════════════
    // SHARED MEMORY
    // ═══════════════════════════════════════════════════════════

    createSharedBuffer(byteLength) {
      if (typeof SharedArrayBuffer === "undefined") {
        console.warn("SharedArrayBuffer not available");
        return new ArrayBuffer(byteLength);
      }
      return new SharedArrayBuffer(byteLength);
    }

    createSharedArray(type, length) {
      const TypedArray =
        {
          int8: Int8Array,
          uint8: Uint8Array,
          int16: Int16Array,
          uint16: Uint16Array,
          int32: Int32Array,
          uint32: Uint32Array,
          float32: Float32Array,
          float64: Float64Array,
        }[type] || Float64Array;

      const buffer = this.createSharedBuffer(
        TypedArray.BYTES_PER_ELEMENT * length,
      );
      return new TypedArray(buffer);
    }

    // Atomics wrapper
    atomic = {
      add(arr, index, value) {
        return Atomics.add(arr, index, value);
      },
      sub(arr, index, value) {
        return Atomics.sub(arr, index, value);
      },
      and(arr, index, value) {
        return Atomics.and(arr, index, value);
      },
      or(arr, index, value) {
        return Atomics.or(arr, index, value);
      },
      xor(arr, index, value) {
        return Atomics.xor(arr, index, value);
      },
      load(arr, index) {
        return Atomics.load(arr, index);
      },
      store(arr, index, value) {
        return Atomics.store(arr, index, value);
      },
      exchange(arr, index, value) {
        return Atomics.exchange(arr, index, value);
      },
      compareExchange(arr, index, expected, replacement) {
        return Atomics.compareExchange(arr, index, expected, replacement);
      },
      wait(arr, index, value, timeout) {
        return Atomics.wait(arr, index, value, timeout);
      },
      notify(arr, index, count) {
        return Atomics.notify(arr, index, count);
      },
    };

    // ═══════════════════════════════════════════════════════════
    // TRANSFERABLE HELPERS
    // ═══════════════════════════════════════════════════════════

    transfer(data) {
      const transferable = [];

      const findTransferable = (obj) => {
        if (!obj || typeof obj !== "object") return;

        if (
          obj instanceof ArrayBuffer ||
          obj instanceof MessagePort ||
          obj instanceof ImageBitmap ||
          (typeof OffscreenCanvas !== "undefined" &&
            obj instanceof OffscreenCanvas)
        ) {
          transferable.push(obj);
        } else if (ArrayBuffer.isView(obj)) {
          transferable.push(obj.buffer);
        } else if (Array.isArray(obj)) {
          obj.forEach(findTransferable);
        } else {
          Object.values(obj).forEach(findTransferable);
        }
      };

      findTransferable(data);

      return { data, transfer: transferable };
    }

    // ═══════════════════════════════════════════════════════════
    // PARALLEL UTILITIES
    // ═══════════════════════════════════════════════════════════

    async parallelMap(array, fn, concurrency) {
      const pool = this.createPool("_parallel_map_temp", fn, {
        size: concurrency || navigator.hardwareConcurrency,
      });

      try {
        return await pool.map(array);
      } finally {
        pool.terminate();
      }
    }

    async parallelReduce(array, fn, initial, concurrency) {
      const chunkSize = Math.ceil(
        array.length / (concurrency || navigator.hardwareConcurrency),
      );
      const chunks = [];

      for (let i = 0; i < array.length; i += chunkSize) {
        chunks.push(array.slice(i, i + chunkSize));
      }

      // First pass - reduce each chunk
      const partialResults = await this.parallelMap(chunks, (chunk) =>
        chunk.reduce(fn, initial),
      );

      // Final reduction
      return partialResults.reduce(fn, initial);
    }

    // Check worker support
    isSupported() {
      return typeof Worker !== "undefined";
    }

    isSharedBufferSupported() {
      return typeof SharedArrayBuffer !== "undefined";
    }
  }

  // Initialize
  window.BaelWorker = new BaelWorker();

  // Global shortcuts
  window.$worker = window.BaelWorker;
  window.$compute = (fn, data, transfer) =>
    window.BaelWorker.compute(fn, data, transfer);
  window.$offload = (fn) => window.BaelWorker.offload(fn);

  console.log("⚙️ Bael Worker ready");
})();
