"""
PERFORMANCE MULTIPLIER
======================
Optimization layer for maximum efficiency.

Features:
- Intelligent caching
- Token optimization
- Parallel execution management
- Resource pooling
- Lazy evaluation
- Memoization
- Batch processing
"""

from __future__ import annotations

import asyncio
import hashlib
import threading
import time
from collections import OrderedDict
from dataclasses import dataclass, field
from functools import wraps
from typing import Any, Callable, Dict, Generic, List, Optional, TypeVar

T = TypeVar('T')


class LRUCache(Generic[T]):
    """Least Recently Used cache with TTL support"""

    def __init__(self, max_size: int = 1000, ttl: float = 3600):
        self.max_size = max_size
        self.ttl = ttl
        self.cache: OrderedDict[str, Tuple[T, float]] = OrderedDict()
        self.hits = 0
        self.misses = 0
        self._lock = threading.Lock()

    def get(self, key: str) -> Optional[T]:
        """Get item from cache"""
        with self._lock:
            if key not in self.cache:
                self.misses += 1
                return None

            value, timestamp = self.cache[key]

            # Check TTL
            if time.time() - timestamp > self.ttl:
                del self.cache[key]
                self.misses += 1
                return None

            # Move to end (most recently used)
            self.cache.move_to_end(key)
            self.hits += 1
            return value

    def set(self, key: str, value: T):
        """Set item in cache"""
        with self._lock:
            # Remove oldest if at capacity
            while len(self.cache) >= self.max_size:
                self.cache.popitem(last=False)

            self.cache[key] = (value, time.time())

    def clear(self):
        """Clear cache"""
        with self._lock:
            self.cache.clear()

    @property
    def hit_rate(self) -> float:
        """Get cache hit rate"""
        total = self.hits + self.misses
        return self.hits / total if total > 0 else 0.0


class TokenOptimizer:
    """Optimizes token usage"""

    def __init__(self, target_reduction: float = 0.3):
        self.target_reduction = target_reduction
        self.total_original = 0
        self.total_optimized = 0

    def compress_prompt(self, prompt: str) -> str:
        """Compress prompt while preserving meaning"""
        # Remove excessive whitespace
        lines = prompt.split('\n')
        compressed_lines = []

        for line in lines:
            # Strip leading/trailing whitespace
            stripped = line.strip()

            # Skip empty lines in groups
            if not stripped:
                if compressed_lines and compressed_lines[-1]:
                    compressed_lines.append('')
                continue

            compressed_lines.append(stripped)

        # Join with minimal newlines
        compressed = '\n'.join(compressed_lines)

        # Track stats
        self.total_original += len(prompt)
        self.total_optimized += len(compressed)

        return compressed

    def truncate_context(self, context: str, max_tokens: int = 4000,
                         chars_per_token: float = 4.0) -> str:
        """Truncate context to fit token limit"""
        max_chars = int(max_tokens * chars_per_token)

        if len(context) <= max_chars:
            return context

        # Keep first and last parts
        keep_ratio = 0.7  # Keep 70% from start, 30% from end
        first_chars = int(max_chars * keep_ratio)
        last_chars = max_chars - first_chars - 20  # 20 for separator

        truncated = (
            context[:first_chars] +
            "\n[...truncated...]\n" +
            context[-last_chars:]
        )

        return truncated

    def deduplicate_context(self, messages: List[Dict]) -> List[Dict]:
        """Remove duplicate content from message history"""
        seen_content = set()
        deduped = []

        for msg in messages:
            content = msg.get('content', '')
            content_hash = hashlib.md5(content.encode()).hexdigest()

            if content_hash not in seen_content:
                seen_content.add(content_hash)
                deduped.append(msg)

        return deduped

    @property
    def compression_ratio(self) -> float:
        """Get overall compression ratio"""
        if self.total_original == 0:
            return 1.0
        return self.total_optimized / self.total_original


class ParallelExecutor:
    """Manages parallel task execution"""

    def __init__(self, max_workers: int = 10):
        self.max_workers = max_workers
        self.active_tasks: Dict[str, asyncio.Task] = {}
        self.completed_results: Dict[str, Any] = {}
        self._semaphore: Optional[asyncio.Semaphore] = None

    @property
    def semaphore(self) -> asyncio.Semaphore:
        """Get or create semaphore"""
        if self._semaphore is None:
            self._semaphore = asyncio.Semaphore(self.max_workers)
        return self._semaphore

    async def execute(self, task_id: str, coro) -> Any:
        """Execute a coroutine with rate limiting"""
        async with self.semaphore:
            task = asyncio.create_task(coro)
            self.active_tasks[task_id] = task

            try:
                result = await task
                self.completed_results[task_id] = result
                return result
            finally:
                if task_id in self.active_tasks:
                    del self.active_tasks[task_id]

    async def execute_batch(self, tasks: List[Tuple[str, Any]]) -> Dict[str, Any]:
        """Execute multiple tasks in parallel"""
        async def run_task(task_id: str, coro):
            return task_id, await self.execute(task_id, coro)

        results = await asyncio.gather(
            *[run_task(tid, coro) for tid, coro in tasks],
            return_exceptions=True
        )

        return {
            tid: result for tid, result in results
            if not isinstance(result, Exception)
        }

    def get_status(self) -> Dict[str, Any]:
        """Get executor status"""
        return {
            'max_workers': self.max_workers,
            'active_tasks': len(self.active_tasks),
            'completed_tasks': len(self.completed_results)
        }


class BatchProcessor:
    """Processes items in batches for efficiency"""

    def __init__(self, batch_size: int = 10,
                 flush_interval: float = 1.0):
        self.batch_size = batch_size
        self.flush_interval = flush_interval
        self.buffer: List[Any] = []
        self.processors: List[Callable] = []
        self.last_flush = time.time()
        self.total_processed = 0

    def add_processor(self, processor: Callable):
        """Add a batch processor"""
        self.processors.append(processor)

    def add(self, item: Any) -> bool:
        """Add item to batch, return True if batch was flushed"""
        self.buffer.append(item)

        should_flush = (
            len(self.buffer) >= self.batch_size or
            time.time() - self.last_flush > self.flush_interval
        )

        if should_flush:
            self.flush()
            return True
        return False

    def flush(self):
        """Flush current batch"""
        if not self.buffer:
            return

        batch = self.buffer.copy()
        self.buffer.clear()
        self.last_flush = time.time()

        for processor in self.processors:
            try:
                processor(batch)
            except Exception:
                pass  # Log but don't fail

        self.total_processed += len(batch)


class ResourcePool(Generic[T]):
    """Pool of reusable resources"""

    def __init__(self, factory: Callable[[], T],
                 max_size: int = 10):
        self.factory = factory
        self.max_size = max_size
        self.pool: List[T] = []
        self.in_use: int = 0
        self._lock = threading.Lock()

    def acquire(self) -> T:
        """Acquire a resource from pool"""
        with self._lock:
            if self.pool:
                self.in_use += 1
                return self.pool.pop()

            if self.in_use < self.max_size:
                self.in_use += 1
                return self.factory()

            # Pool exhausted
            raise RuntimeError("Resource pool exhausted")

    def release(self, resource: T):
        """Release resource back to pool"""
        with self._lock:
            self.pool.append(resource)
            self.in_use -= 1

    @property
    def available(self) -> int:
        """Number of available resources"""
        return len(self.pool)


def memoize(ttl: float = 3600):
    """Memoization decorator with TTL"""
    cache = {}

    def decorator(func):
        @wraps(func)
        async def async_wrapper(*args, **kwargs):
            key = hashlib.md5(
                f"{args}:{kwargs}".encode()
            ).hexdigest()

            if key in cache:
                value, timestamp = cache[key]
                if time.time() - timestamp < ttl:
                    return value

            result = await func(*args, **kwargs)
            cache[key] = (result, time.time())
            return result

        @wraps(func)
        def sync_wrapper(*args, **kwargs):
            key = hashlib.md5(
                f"{args}:{kwargs}".encode()
            ).hexdigest()

            if key in cache:
                value, timestamp = cache[key]
                if time.time() - timestamp < ttl:
                    return value

            result = func(*args, **kwargs)
            cache[key] = (result, time.time())
            return result

        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        return sync_wrapper

    return decorator


class PerformanceMultiplier:
    """
    Complete performance optimization system.
    """

    def __init__(self):
        self.cache = LRUCache(max_size=5000, ttl=3600)
        self.token_optimizer = TokenOptimizer()
        self.parallel_executor = ParallelExecutor(max_workers=20)
        self.batch_processor = BatchProcessor()

        self.metrics = {
            'cache_hits': 0,
            'cache_misses': 0,
            'tokens_saved': 0,
            'parallel_executions': 0,
            'batches_processed': 0
        }

    def cache_result(self, key: str, value: Any):
        """Cache a result"""
        self.cache.set(key, value)

    def get_cached(self, key: str) -> Optional[Any]:
        """Get cached result"""
        result = self.cache.get(key)
        if result is not None:
            self.metrics['cache_hits'] += 1
        else:
            self.metrics['cache_misses'] += 1
        return result

    def optimize_prompt(self, prompt: str) -> str:
        """Optimize a prompt"""
        original_len = len(prompt)
        optimized = self.token_optimizer.compress_prompt(prompt)
        self.metrics['tokens_saved'] += (original_len - len(optimized)) // 4
        return optimized

    def truncate_context(self, context: str, max_tokens: int = 4000) -> str:
        """Truncate context to fit token limit"""
        return self.token_optimizer.truncate_context(context, max_tokens)

    async def parallel_execute(self, tasks: List[Tuple[str, Any]]) -> Dict[str, Any]:
        """Execute tasks in parallel"""
        self.metrics['parallel_executions'] += len(tasks)
        return await self.parallel_executor.execute_batch(tasks)

    def batch_add(self, item: Any) -> bool:
        """Add item to batch processing"""
        flushed = self.batch_processor.add(item)
        if flushed:
            self.metrics['batches_processed'] += 1
        return flushed

    def get_performance_report(self) -> Dict[str, Any]:
        """Get performance report"""
        return {
            'cache': {
                'hit_rate': self.cache.hit_rate,
                'size': len(self.cache.cache),
                'hits': self.cache.hits,
                'misses': self.cache.misses
            },
            'tokens': {
                'compression_ratio': self.token_optimizer.compression_ratio,
                'tokens_saved': self.metrics['tokens_saved']
            },
            'parallel': {
                'active_tasks': len(self.parallel_executor.active_tasks),
                'total_executions': self.metrics['parallel_executions']
            },
            'batch': {
                'pending': len(self.batch_processor.buffer),
                'total_processed': self.batch_processor.total_processed
            }
        }

    def clear_cache(self):
        """Clear all caches"""
        self.cache.clear()


# Singleton
_performance_multiplier: Optional[PerformanceMultiplier] = None


def get_performance_multiplier() -> PerformanceMultiplier:
    """Get singleton performance multiplier"""
    global _performance_multiplier
    if _performance_multiplier is None:
        _performance_multiplier = PerformanceMultiplier()
    return _performance_multiplier
