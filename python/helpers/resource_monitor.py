"""
RESOURCE MONITOR
================
Real-time tracking of tokens, memory, time, and costs.

Features:
- Token usage tracking
- Memory monitoring
- Time profiling
- Cost estimation
- Budget alerts
- Usage reports
"""

from __future__ import annotations

import threading
import time
from collections import defaultdict
from dataclasses import dataclass, field
from typing import Any, Callable, Dict, List, Optional


@dataclass
class ResourceUsage:
    """Usage record for a single operation"""
    operation: str
    tokens_in: int = 0
    tokens_out: int = 0
    time_ms: float = 0.0
    memory_bytes: int = 0
    cost: float = 0.0
    timestamp: float = field(default_factory=time.time)
    metadata: Dict[str, Any] = field(default_factory=dict)

    @property
    def total_tokens(self) -> int:
        return self.tokens_in + self.tokens_out


@dataclass
class Budget:
    """Resource budget configuration"""
    max_tokens_per_hour: int = 100000
    max_tokens_per_day: int = 1000000
    max_cost_per_hour: float = 10.0
    max_cost_per_day: float = 100.0
    max_time_per_operation: float = 60.0  # seconds
    alert_threshold: float = 0.8  # Alert at 80% usage


class UsageTracker:
    """Tracks cumulative resource usage"""

    def __init__(self):
        self.total_tokens_in = 0
        self.total_tokens_out = 0
        self.total_cost = 0.0
        self.total_time_ms = 0.0
        self.operation_count = 0
        self.hourly_tokens: Dict[int, int] = defaultdict(int)
        self.daily_tokens: Dict[str, int] = defaultdict(int)
        self.by_operation: Dict[str, Dict] = defaultdict(
            lambda: {"count": 0, "tokens": 0, "cost": 0.0, "time": 0.0}
        )

    def record(self, usage: ResourceUsage):
        """Record a usage event"""
        self.total_tokens_in += usage.tokens_in
        self.total_tokens_out += usage.tokens_out
        self.total_cost += usage.cost
        self.total_time_ms += usage.time_ms
        self.operation_count += 1

        # Track by hour
        hour_key = int(usage.timestamp // 3600)
        self.hourly_tokens[hour_key] += usage.total_tokens

        # Track by day
        day_key = time.strftime("%Y-%m-%d", time.localtime(usage.timestamp))
        self.daily_tokens[day_key] += usage.total_tokens

        # Track by operation
        op_stats = self.by_operation[usage.operation]
        op_stats["count"] += 1
        op_stats["tokens"] += usage.total_tokens
        op_stats["cost"] += usage.cost
        op_stats["time"] += usage.time_ms

    def get_current_hour_tokens(self) -> int:
        """Get tokens used in current hour"""
        hour_key = int(time.time() // 3600)
        return self.hourly_tokens.get(hour_key, 0)

    def get_today_tokens(self) -> int:
        """Get tokens used today"""
        day_key = time.strftime("%Y-%m-%d")
        return self.daily_tokens.get(day_key, 0)

    def get_summary(self) -> Dict[str, Any]:
        """Get usage summary"""
        return {
            "total_tokens_in": self.total_tokens_in,
            "total_tokens_out": self.total_tokens_out,
            "total_tokens": self.total_tokens_in + self.total_tokens_out,
            "total_cost": self.total_cost,
            "total_time_seconds": self.total_time_ms / 1000,
            "operation_count": self.operation_count,
            "tokens_this_hour": self.get_current_hour_tokens(),
            "tokens_today": self.get_today_tokens(),
            "top_operations": sorted(
                [(k, v["tokens"]) for k, v in self.by_operation.items()],
                key=lambda x: x[1], reverse=True
            )[:5]
        }


class CostCalculator:
    """Calculates costs based on token usage"""

    # Default pricing (per 1K tokens)
    DEFAULT_PRICING = {
        "gpt-4": {"input": 0.03, "output": 0.06},
        "gpt-4-turbo": {"input": 0.01, "output": 0.03},
        "gpt-3.5-turbo": {"input": 0.0005, "output": 0.0015},
        "claude-3-opus": {"input": 0.015, "output": 0.075},
        "claude-3-sonnet": {"input": 0.003, "output": 0.015},
        "claude-3-haiku": {"input": 0.00025, "output": 0.00125},
        "ollama": {"input": 0.0, "output": 0.0},  # Free local
        "default": {"input": 0.001, "output": 0.002}
    }

    def __init__(self, custom_pricing: Dict = None):
        self.pricing = {**self.DEFAULT_PRICING}
        if custom_pricing:
            self.pricing.update(custom_pricing)

    def calculate(self, tokens_in: int, tokens_out: int,
                  model: str = "default") -> float:
        """Calculate cost for token usage"""
        pricing = self.pricing.get(model, self.pricing["default"])

        cost_in = (tokens_in / 1000) * pricing["input"]
        cost_out = (tokens_out / 1000) * pricing["output"]

        return cost_in + cost_out


class AlertManager:
    """Manages resource usage alerts"""

    def __init__(self):
        self.alerts: List[Dict] = []
        self.callbacks: List[Callable] = []

    def add_callback(self, callback: Callable):
        """Add alert callback"""
        self.callbacks.append(callback)

    def trigger_alert(self, alert_type: str, message: str,
                      severity: str = "warning"):
        """Trigger an alert"""
        alert = {
            "type": alert_type,
            "message": message,
            "severity": severity,
            "timestamp": time.time()
        }
        self.alerts.append(alert)

        for callback in self.callbacks:
            try:
                callback(alert)
            except Exception:
                pass

    def get_recent_alerts(self, count: int = 10) -> List[Dict]:
        """Get recent alerts"""
        return self.alerts[-count:]


class ResourceMonitor:
    """
    Complete resource monitoring system.
    Track tokens, memory, time, and costs in real-time.
    """

    def __init__(self, budget: Budget = None):
        self.budget = budget or Budget()
        self.tracker = UsageTracker()
        self.calculator = CostCalculator()
        self.alerts = AlertManager()
        self.history: List[ResourceUsage] = []
        self.active_operations: Dict[str, float] = {}
        self._lock = threading.Lock()
        self.start_time = time.time()

    def start_operation(self, operation_id: str):
        """Start timing an operation"""
        with self._lock:
            self.active_operations[operation_id] = time.time()

    def end_operation(self, operation_id: str,
                      tokens_in: int = 0, tokens_out: int = 0,
                      model: str = "default",
                      metadata: Dict = None) -> ResourceUsage:
        """End an operation and record usage"""
        with self._lock:
            start_time = self.active_operations.pop(operation_id, time.time())
            elapsed_ms = (time.time() - start_time) * 1000

            cost = self.calculator.calculate(tokens_in, tokens_out, model)

            usage = ResourceUsage(
                operation=operation_id,
                tokens_in=tokens_in,
                tokens_out=tokens_out,
                time_ms=elapsed_ms,
                cost=cost,
                metadata=metadata or {}
            )

            self.tracker.record(usage)
            self.history.append(usage)

            # Check budget limits
            self._check_limits()

            return usage

    def record_usage(self, operation: str, tokens_in: int, tokens_out: int,
                     model: str = "default", time_ms: float = 0.0) -> ResourceUsage:
        """Record usage without timing"""
        cost = self.calculator.calculate(tokens_in, tokens_out, model)

        usage = ResourceUsage(
            operation=operation,
            tokens_in=tokens_in,
            tokens_out=tokens_out,
            time_ms=time_ms,
            cost=cost
        )

        with self._lock:
            self.tracker.record(usage)
            self.history.append(usage)
            self._check_limits()

        return usage

    def _check_limits(self):
        """Check if any budget limits are exceeded"""
        hourly_tokens = self.tracker.get_current_hour_tokens()
        daily_tokens = self.tracker.get_today_tokens()

        # Check hourly token limit
        if hourly_tokens > self.budget.max_tokens_per_hour * self.budget.alert_threshold:
            self.alerts.trigger_alert(
                "hourly_token_limit",
                f"Approaching hourly token limit: {hourly_tokens}/{self.budget.max_tokens_per_hour}",
                "warning" if hourly_tokens < self.budget.max_tokens_per_hour else "critical"
            )

        # Check daily token limit
        if daily_tokens > self.budget.max_tokens_per_day * self.budget.alert_threshold:
            self.alerts.trigger_alert(
                "daily_token_limit",
                f"Approaching daily token limit: {daily_tokens}/{self.budget.max_tokens_per_day}",
                "warning" if daily_tokens < self.budget.max_tokens_per_day else "critical"
            )

    def get_current_usage(self) -> Dict[str, Any]:
        """Get current usage statistics"""
        summary = self.tracker.get_summary()

        return {
            **summary,
            "budget": {
                "hourly_tokens_remaining": max(0,
                    self.budget.max_tokens_per_hour - self.tracker.get_current_hour_tokens()),
                "daily_tokens_remaining": max(0,
                    self.budget.max_tokens_per_day - self.tracker.get_today_tokens()),
                "hourly_usage_pct": self.tracker.get_current_hour_tokens() /
                                   self.budget.max_tokens_per_hour * 100,
                "daily_usage_pct": self.tracker.get_today_tokens() /
                                  self.budget.max_tokens_per_day * 100
            },
            "uptime_seconds": time.time() - self.start_time,
            "active_operations": len(self.active_operations),
            "recent_alerts": self.alerts.get_recent_alerts(5)
        }

    def get_operation_report(self) -> Dict[str, Dict]:
        """Get detailed report by operation type"""
        return dict(self.tracker.by_operation)

    def estimate_remaining_capacity(self) -> Dict[str, int]:
        """Estimate remaining capacity for current period"""
        hourly_remaining = max(0,
            self.budget.max_tokens_per_hour - self.tracker.get_current_hour_tokens())
        daily_remaining = max(0,
            self.budget.max_tokens_per_day - self.tracker.get_today_tokens())

        # Estimate operations based on average
        avg_tokens = (self.tracker.total_tokens_in + self.tracker.total_tokens_out) / \
                     max(self.tracker.operation_count, 1)

        return {
            "hourly_tokens_remaining": hourly_remaining,
            "daily_tokens_remaining": daily_remaining,
            "estimated_hourly_operations": int(hourly_remaining / max(avg_tokens, 1)),
            "estimated_daily_operations": int(daily_remaining / max(avg_tokens, 1))
        }

    def reset_hourly_counters(self):
        """Reset hourly counters (for testing)"""
        current_hour = int(time.time() // 3600)
        self.tracker.hourly_tokens[current_hour] = 0

    def get_statistics(self) -> Dict[str, Any]:
        """Get comprehensive statistics"""
        return {
            "usage": self.get_current_usage(),
            "capacity": self.estimate_remaining_capacity(),
            "operations": self.get_operation_report(),
            "history_size": len(self.history)
        }


# Singleton
_resource_monitor: Optional[ResourceMonitor] = None


def get_resource_monitor() -> ResourceMonitor:
    """Get the Resource Monitor singleton"""
    global _resource_monitor
    if _resource_monitor is None:
        _resource_monitor = ResourceMonitor()
    return _resource_monitor
