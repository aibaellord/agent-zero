/**
 * BAEL Stream - Reactive Streams & Observables
 * Phase 7: Testing, Documentation & Performance
 *
 * Complete streaming system:
 * - Observable pattern
 * - Operators (map, filter, reduce, etc.)
 * - Subjects
 * - Hot/cold observables
 * - Backpressure handling
 */

(function () {
  "use strict";

  class BaelStream {
    constructor() {
      console.log("🌊 Bael Stream initialized");
    }

    // ═══════════════════════════════════════════════════════════
    // OBSERVABLE CREATION
    // ═══════════════════════════════════════════════════════════

    create(subscribeFn) {
      return new Observable(subscribeFn);
    }

    of(...values) {
      return this.create((observer) => {
        values.forEach((v) => observer.next(v));
        observer.complete();
        return () => {};
      });
    }

    from(source) {
      if (source instanceof Observable) {
        return source;
      }

      if (Array.isArray(source)) {
        return this.of(...source);
      }

      if (source instanceof Promise) {
        return this.fromPromise(source);
      }

      if (typeof source[Symbol.iterator] === "function") {
        return this.create((observer) => {
          for (const value of source) {
            observer.next(value);
          }
          observer.complete();
          return () => {};
        });
      }

      return this.of(source);
    }

    fromPromise(promise) {
      return this.create((observer) => {
        let cancelled = false;

        promise
          .then((value) => {
            if (!cancelled) {
              observer.next(value);
              observer.complete();
            }
          })
          .catch((error) => {
            if (!cancelled) {
              observer.error(error);
            }
          });

        return () => {
          cancelled = true;
        };
      });
    }

    fromEvent(element, eventName, options) {
      return this.create((observer) => {
        const handler = (event) => observer.next(event);
        element.addEventListener(eventName, handler, options);
        return () => element.removeEventListener(eventName, handler, options);
      });
    }

    interval(ms) {
      return this.create((observer) => {
        let count = 0;
        const id = setInterval(() => {
          observer.next(count++);
        }, ms);
        return () => clearInterval(id);
      });
    }

    timer(delay, interval) {
      return this.create((observer) => {
        let count = 0;
        let intervalId;

        const timeoutId = setTimeout(() => {
          observer.next(count++);

          if (interval !== undefined) {
            intervalId = setInterval(() => {
              observer.next(count++);
            }, interval);
          } else {
            observer.complete();
          }
        }, delay);

        return () => {
          clearTimeout(timeoutId);
          if (intervalId) clearInterval(intervalId);
        };
      });
    }

    empty() {
      return this.create((observer) => {
        observer.complete();
        return () => {};
      });
    }

    never() {
      return this.create(() => () => {});
    }

    throw(error) {
      return this.create((observer) => {
        observer.error(error);
        return () => {};
      });
    }

    range(start, count) {
      return this.create((observer) => {
        for (let i = 0; i < count; i++) {
          observer.next(start + i);
        }
        observer.complete();
        return () => {};
      });
    }

    // ═══════════════════════════════════════════════════════════
    // SUBJECTS
    // ═══════════════════════════════════════════════════════════

    subject() {
      return new Subject();
    }

    behaviorSubject(initialValue) {
      return new BehaviorSubject(initialValue);
    }

    replaySubject(bufferSize = Infinity) {
      return new ReplaySubject(bufferSize);
    }

    asyncSubject() {
      return new AsyncSubject();
    }

    // ═══════════════════════════════════════════════════════════
    // COMBINATION
    // ═══════════════════════════════════════════════════════════

    merge(...observables) {
      return this.create((observer) => {
        let completed = 0;
        const subs = observables.map((obs) =>
          obs.subscribe({
            next: (v) => observer.next(v),
            error: (e) => observer.error(e),
            complete: () => {
              completed++;
              if (completed === observables.length) {
                observer.complete();
              }
            },
          }),
        );
        return () => subs.forEach((s) => s.unsubscribe());
      });
    }

    concat(...observables) {
      return this.create((observer) => {
        let index = 0;
        let subscription;

        const subscribeNext = () => {
          if (index >= observables.length) {
            observer.complete();
            return;
          }

          subscription = observables[index++].subscribe({
            next: (v) => observer.next(v),
            error: (e) => observer.error(e),
            complete: subscribeNext,
          });
        };

        subscribeNext();

        return () => subscription?.unsubscribe();
      });
    }

    combineLatest(...observables) {
      return this.create((observer) => {
        const values = new Array(observables.length);
        const hasValue = new Array(observables.length).fill(false);
        let completed = 0;

        const subs = observables.map((obs, i) =>
          obs.subscribe({
            next: (v) => {
              values[i] = v;
              hasValue[i] = true;
              if (hasValue.every(Boolean)) {
                observer.next([...values]);
              }
            },
            error: (e) => observer.error(e),
            complete: () => {
              completed++;
              if (completed === observables.length) {
                observer.complete();
              }
            },
          }),
        );

        return () => subs.forEach((s) => s.unsubscribe());
      });
    }

    zip(...observables) {
      return this.create((observer) => {
        const buffers = observables.map(() => []);
        let completed = new Array(observables.length).fill(false);

        const emit = () => {
          if (buffers.every((b) => b.length > 0)) {
            observer.next(buffers.map((b) => b.shift()));
          }
        };

        const subs = observables.map((obs, i) =>
          obs.subscribe({
            next: (v) => {
              buffers[i].push(v);
              emit();
            },
            error: (e) => observer.error(e),
            complete: () => {
              completed[i] = true;
              if (completed.every(Boolean) || buffers[i].length === 0) {
                observer.complete();
              }
            },
          }),
        );

        return () => subs.forEach((s) => s.unsubscribe());
      });
    }

    forkJoin(...observables) {
      return this.create((observer) => {
        const values = new Array(observables.length);
        const hasValue = new Array(observables.length).fill(false);
        let completed = 0;

        const subs = observables.map((obs, i) =>
          obs.subscribe({
            next: (v) => {
              values[i] = v;
              hasValue[i] = true;
            },
            error: (e) => observer.error(e),
            complete: () => {
              completed++;
              if (completed === observables.length) {
                if (hasValue.every(Boolean)) {
                  observer.next(values);
                }
                observer.complete();
              }
            },
          }),
        );

        return () => subs.forEach((s) => s.unsubscribe());
      });
    }

    race(...observables) {
      return this.create((observer) => {
        let winner = -1;

        const subs = observables.map((obs, i) =>
          obs.subscribe({
            next: (v) => {
              if (winner === -1) {
                winner = i;
                subs.forEach((s, j) => {
                  if (j !== i) s.unsubscribe();
                });
              }
              if (winner === i) {
                observer.next(v);
              }
            },
            error: (e) => {
              if (winner === -1 || winner === i) {
                observer.error(e);
              }
            },
            complete: () => {
              if (winner === i) {
                observer.complete();
              }
            },
          }),
        );

        return () => subs.forEach((s) => s.unsubscribe());
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // OBSERVABLE
  // ═══════════════════════════════════════════════════════════════════

  class Observable {
    constructor(subscribeFn) {
      this._subscribe = subscribeFn;
    }

    subscribe(observerOrNext, error, complete) {
      const observer =
        typeof observerOrNext === "function"
          ? { next: observerOrNext, error, complete }
          : observerOrNext;

      const safeObserver = {
        next: (v) => observer.next?.(v),
        error: (e) => observer.error?.(e),
        complete: () => observer.complete?.(),
        closed: false,
      };

      const teardown = this._subscribe(safeObserver);

      return {
        unsubscribe: () => {
          safeObserver.closed = true;
          if (typeof teardown === "function") {
            teardown();
          } else if (teardown?.unsubscribe) {
            teardown.unsubscribe();
          }
        },
      };
    }

    // Operators
    pipe(...operators) {
      return operators.reduce((obs, op) => op(obs), this);
    }

    map(fn) {
      return new Observable((observer) => {
        return this.subscribe({
          next: (v) => observer.next(fn(v)),
          error: (e) => observer.error(e),
          complete: () => observer.complete(),
        });
      });
    }

    filter(predicate) {
      return new Observable((observer) => {
        return this.subscribe({
          next: (v) => predicate(v) && observer.next(v),
          error: (e) => observer.error(e),
          complete: () => observer.complete(),
        });
      });
    }

    reduce(fn, initial) {
      return new Observable((observer) => {
        let acc = initial;
        return this.subscribe({
          next: (v) => {
            acc = fn(acc, v);
          },
          error: (e) => observer.error(e),
          complete: () => {
            observer.next(acc);
            observer.complete();
          },
        });
      });
    }

    scan(fn, initial) {
      return new Observable((observer) => {
        let acc = initial;
        return this.subscribe({
          next: (v) => {
            acc = fn(acc, v);
            observer.next(acc);
          },
          error: (e) => observer.error(e),
          complete: () => observer.complete(),
        });
      });
    }

    take(count) {
      return new Observable((observer) => {
        let taken = 0;
        const sub = this.subscribe({
          next: (v) => {
            if (taken < count) {
              taken++;
              observer.next(v);
              if (taken === count) {
                observer.complete();
                sub.unsubscribe();
              }
            }
          },
          error: (e) => observer.error(e),
          complete: () => observer.complete(),
        });
        return sub;
      });
    }

    skip(count) {
      return new Observable((observer) => {
        let skipped = 0;
        return this.subscribe({
          next: (v) => {
            if (skipped >= count) {
              observer.next(v);
            } else {
              skipped++;
            }
          },
          error: (e) => observer.error(e),
          complete: () => observer.complete(),
        });
      });
    }

    distinctUntilChanged(compare = (a, b) => a === b) {
      return new Observable((observer) => {
        let prev;
        let hasPrev = false;
        return this.subscribe({
          next: (v) => {
            if (!hasPrev || !compare(prev, v)) {
              hasPrev = true;
              prev = v;
              observer.next(v);
            }
          },
          error: (e) => observer.error(e),
          complete: () => observer.complete(),
        });
      });
    }

    debounceTime(ms) {
      return new Observable((observer) => {
        let timeout;
        return this.subscribe({
          next: (v) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => observer.next(v), ms);
          },
          error: (e) => observer.error(e),
          complete: () => {
            clearTimeout(timeout);
            observer.complete();
          },
        });
      });
    }

    throttleTime(ms) {
      return new Observable((observer) => {
        let lastTime = 0;
        return this.subscribe({
          next: (v) => {
            const now = Date.now();
            if (now - lastTime >= ms) {
              lastTime = now;
              observer.next(v);
            }
          },
          error: (e) => observer.error(e),
          complete: () => observer.complete(),
        });
      });
    }

    delay(ms) {
      return new Observable((observer) => {
        const timeouts = [];
        return this.subscribe({
          next: (v) => {
            const id = setTimeout(() => observer.next(v), ms);
            timeouts.push(id);
          },
          error: (e) => observer.error(e),
          complete: () => {
            setTimeout(() => observer.complete(), ms);
          },
        });
      });
    }

    tap(fn) {
      return new Observable((observer) => {
        return this.subscribe({
          next: (v) => {
            fn(v);
            observer.next(v);
          },
          error: (e) => observer.error(e),
          complete: () => observer.complete(),
        });
      });
    }

    switchMap(fn) {
      return new Observable((observer) => {
        let innerSub;
        const outerSub = this.subscribe({
          next: (v) => {
            innerSub?.unsubscribe();
            innerSub = fn(v).subscribe({
              next: (iv) => observer.next(iv),
              error: (e) => observer.error(e),
            });
          },
          error: (e) => observer.error(e),
          complete: () => observer.complete(),
        });
        return () => {
          outerSub.unsubscribe();
          innerSub?.unsubscribe();
        };
      });
    }

    mergeMap(fn, concurrent = Infinity) {
      return new Observable((observer) => {
        const subs = [];
        let completed = false;

        const outerSub = this.subscribe({
          next: (v) => {
            const inner = fn(v).subscribe({
              next: (iv) => observer.next(iv),
              error: (e) => observer.error(e),
              complete: () => {
                const idx = subs.indexOf(inner);
                if (idx > -1) subs.splice(idx, 1);
                if (completed && subs.length === 0) {
                  observer.complete();
                }
              },
            });
            subs.push(inner);
          },
          error: (e) => observer.error(e),
          complete: () => {
            completed = true;
            if (subs.length === 0) {
              observer.complete();
            }
          },
        });

        return () => {
          outerSub.unsubscribe();
          subs.forEach((s) => s.unsubscribe());
        };
      });
    }

    catchError(fn) {
      return new Observable((observer) => {
        return this.subscribe({
          next: (v) => observer.next(v),
          error: (e) => fn(e).subscribe(observer),
          complete: () => observer.complete(),
        });
      });
    }

    retry(count) {
      return new Observable((observer) => {
        let attempts = 0;

        const subscribe = () => {
          return this.subscribe({
            next: (v) => observer.next(v),
            error: (e) => {
              attempts++;
              if (attempts <= count) {
                subscribe();
              } else {
                observer.error(e);
              }
            },
            complete: () => observer.complete(),
          });
        };

        return subscribe();
      });
    }

    toPromise() {
      return new Promise((resolve, reject) => {
        let value;
        this.subscribe({
          next: (v) => {
            value = v;
          },
          error: reject,
          complete: () => resolve(value),
        });
      });
    }

    toArray() {
      return this.reduce((arr, v) => [...arr, v], []);
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // SUBJECTS
  // ═══════════════════════════════════════════════════════════════════

  class Subject extends Observable {
    constructor() {
      super((observer) => {
        this._observers.add(observer);
        return () => this._observers.delete(observer);
      });
      this._observers = new Set();
    }

    next(value) {
      this._observers.forEach((obs) => obs.next(value));
    }

    error(err) {
      this._observers.forEach((obs) => obs.error(err));
    }

    complete() {
      this._observers.forEach((obs) => obs.complete());
    }
  }

  class BehaviorSubject extends Subject {
    constructor(value) {
      super();
      this._value = value;
    }

    get value() {
      return this._value;
    }

    next(value) {
      this._value = value;
      super.next(value);
    }

    subscribe(observerOrNext, error, complete) {
      const sub = super.subscribe(observerOrNext, error, complete);
      const observer =
        typeof observerOrNext === "function"
          ? { next: observerOrNext }
          : observerOrNext;
      observer.next?.(this._value);
      return sub;
    }
  }

  class ReplaySubject extends Subject {
    constructor(bufferSize = Infinity) {
      super();
      this._buffer = [];
      this._bufferSize = bufferSize;
    }

    next(value) {
      this._buffer.push(value);
      if (this._buffer.length > this._bufferSize) {
        this._buffer.shift();
      }
      super.next(value);
    }

    subscribe(observerOrNext, error, complete) {
      const sub = super.subscribe(observerOrNext, error, complete);
      const observer =
        typeof observerOrNext === "function"
          ? { next: observerOrNext }
          : observerOrNext;
      this._buffer.forEach((v) => observer.next?.(v));
      return sub;
    }
  }

  class AsyncSubject extends Subject {
    constructor() {
      super();
      this._value = undefined;
      this._hasValue = false;
      this._completed = false;
    }

    next(value) {
      if (!this._completed) {
        this._value = value;
        this._hasValue = true;
      }
    }

    complete() {
      if (!this._completed) {
        this._completed = true;
        if (this._hasValue) {
          super.next(this._value);
        }
        super.complete();
      }
    }
  }

  // Initialize
  window.BaelStream = new BaelStream();
  window.Observable = Observable;
  window.Subject = Subject;
  window.BehaviorSubject = BehaviorSubject;
  window.ReplaySubject = ReplaySubject;

  // Global shortcuts
  window.$stream = window.BaelStream;
  window.$observable = (fn) => window.BaelStream.create(fn);
  window.$subject = () => window.BaelStream.subject();

  console.log("🌊 Bael Stream ready");
})();
