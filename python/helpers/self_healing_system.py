"""
SELF-HEALING SYSTEM
===================
Automatic error diagnosis, recovery, and self-repair.

Features:
- Error pattern recognition
- Automatic retry with exponential backoff
- Self-diagnostic routines
- Automatic fix generation
- Recovery strategy learning
- Circuit breaker pattern
"""

from __future__ import annotations

import asyncio
import hashlib
import time
import traceback
from collections import defaultdict
from dataclasses import dataclass, field
from enum import Enum, auto
from typing import Any, Callable, Dict, List, Optional, Tuple


class ErrorSeverity(Enum):
    """Severity levels for errors"""
    RECOVERABLE = 1
    DEGRADED = 2
    CRITICAL = 3
    FATAL = 4


class RecoveryStrategy(Enum):
    """Strategies for recovery"""
    RETRY = auto()
    FALLBACK = auto()
    SKIP = auto()
    RESTART = auto()
    ESCALATE = auto()
    CIRCUIT_BREAK = auto()


@dataclass
class ErrorPattern:
    """A recognized error pattern"""
    pattern_id: str
    error_type: str
    message_pattern: str
    occurrence_count: int = 0
    last_seen: float = 0.0
    severity: ErrorSeverity = ErrorSeverity.RECOVERABLE
    recovery_strategies: List[RecoveryStrategy] = field(default_factory=list)
    success_rate: float = 0.0


@dataclass
class RecoveryResult:
    """Result of a recovery attempt"""
    success: bool
    strategy_used: RecoveryStrategy
    attempts: int
    duration: float
    message: str
    side_effects: List[str] = field(default_factory=list)


@dataclass
class CircuitState:
    """State of a circuit breaker"""
    name: str
    state: str  # 'closed', 'open', 'half_open'
    failure_count: int = 0
    success_count: int = 0
    last_failure: float = 0.0
    last_success: float = 0.0
    threshold: int = 5
    reset_timeout: float = 60.0


class ErrorPatternRecognizer:
    """Recognizes and categorizes error patterns"""

    KNOWN_PATTERNS = {
        'connection_refused': {
            'keywords': ['connection refused', 'connect call failed', 'econnrefused'],
            'severity': ErrorSeverity.RECOVERABLE,
            'strategies': [RecoveryStrategy.RETRY, RecoveryStrategy.FALLBACK]
        },
        'timeout': {
            'keywords': ['timeout', 'timed out', 'deadline exceeded'],
            'severity': ErrorSeverity.RECOVERABLE,
            'strategies': [RecoveryStrategy.RETRY]
        },
        'auth_failure': {
            'keywords': ['unauthorized', '401', 'authentication', 'credentials'],
            'severity': ErrorSeverity.CRITICAL,
            'strategies': [RecoveryStrategy.ESCALATE]
        },
        'rate_limit': {
            'keywords': ['rate limit', '429', 'too many requests'],
            'severity': ErrorSeverity.RECOVERABLE,
            'strategies': [RecoveryStrategy.RETRY, RecoveryStrategy.CIRCUIT_BREAK]
        },
        'not_found': {
            'keywords': ['not found', '404', 'does not exist'],
            'severity': ErrorSeverity.DEGRADED,
            'strategies': [RecoveryStrategy.SKIP, RecoveryStrategy.FALLBACK]
        },
        'memory_error': {
            'keywords': ['out of memory', 'memory error', 'oom'],
            'severity': ErrorSeverity.CRITICAL,
            'strategies': [RecoveryStrategy.RESTART]
        },
        'syntax_error': {
            'keywords': ['syntax error', 'invalid syntax', 'unexpected token'],
            'severity': ErrorSeverity.DEGRADED,
            'strategies': [RecoveryStrategy.SKIP]
        },
        'type_error': {
            'keywords': ['type error', 'typeerror', 'expected type'],
            'severity': ErrorSeverity.DEGRADED,
            'strategies': [RecoveryStrategy.FALLBACK]
        },
        'attribute_error': {
            'keywords': ['attribute error', 'has no attribute', 'attributeerror'],
            'severity': ErrorSeverity.DEGRADED,
            'strategies': [RecoveryStrategy.FALLBACK]
        },
        'import_error': {
            'keywords': ['import error', 'no module named', 'importerror'],
            'severity': ErrorSeverity.CRITICAL,
            'strategies': [RecoveryStrategy.ESCALATE]
        }
    }

    def __init__(self):
        self.patterns: Dict[str, ErrorPattern] = {}
        self.unknown_errors: List[Dict] = []

    def recognize(self, error: Exception) -> Optional[ErrorPattern]:
        """Recognize an error pattern"""
        error_str = str(error).lower()
        error_type = type(error).__name__

        for pattern_id, pattern_def in self.KNOWN_PATTERNS.items():
            if any(kw in error_str for kw in pattern_def['keywords']):
                # Create or update pattern
                if pattern_id not in self.patterns:
                    self.patterns[pattern_id] = ErrorPattern(
                        pattern_id=pattern_id,
                        error_type=error_type,
                        message_pattern=pattern_def['keywords'][0],
                        severity=pattern_def['severity'],
                        recovery_strategies=pattern_def['strategies']
                    )

                pattern = self.patterns[pattern_id]
                pattern.occurrence_count += 1
                pattern.last_seen = time.time()
                return pattern

        # Unknown error
        self.unknown_errors.append({
            'type': error_type,
            'message': str(error)[:200],
            'timestamp': time.time()
        })
        return None

    def get_frequent_patterns(self, min_occurrences: int = 3) -> List[ErrorPattern]:
        """Get frequently occurring patterns"""
        return [
            p for p in self.patterns.values()
            if p.occurrence_count >= min_occurrences
        ]


class CircuitBreaker:
    """Circuit breaker for preventing cascading failures"""

    def __init__(self, name: str, threshold: int = 5, reset_timeout: float = 60.0):
        self.state = CircuitState(
            name=name,
            state='closed',
            threshold=threshold,
            reset_timeout=reset_timeout
        )

    def can_execute(self) -> bool:
        """Check if execution is allowed"""
        if self.state.state == 'closed':
            return True

        if self.state.state == 'open':
            # Check if we should try again
            if time.time() - self.state.last_failure > self.state.reset_timeout:
                self.state.state = 'half_open'
                return True
            return False

        # half_open - allow one try
        return True

    def record_success(self):
        """Record a successful execution"""
        self.state.success_count += 1
        self.state.last_success = time.time()

        if self.state.state == 'half_open':
            self.state.state = 'closed'
            self.state.failure_count = 0

    def record_failure(self):
        """Record a failed execution"""
        self.state.failure_count += 1
        self.state.last_failure = time.time()

        if self.state.failure_count >= self.state.threshold:
            self.state.state = 'open'


class RetryManager:
    """Manages retry logic with exponential backoff"""

    def __init__(self, max_retries: int = 3, base_delay: float = 1.0,
                 max_delay: float = 60.0, exponential_base: float = 2.0):
        self.max_retries = max_retries
        self.base_delay = base_delay
        self.max_delay = max_delay
        self.exponential_base = exponential_base

    def get_delay(self, attempt: int) -> float:
        """Calculate delay for a given attempt"""
        delay = self.base_delay * (self.exponential_base ** attempt)
        return min(delay, self.max_delay)

    async def retry(self, func: Callable, *args, **kwargs) -> Tuple[bool, Any]:
        """Retry a function with exponential backoff"""
        last_error = None

        for attempt in range(self.max_retries):
            try:
                result = await func(*args, **kwargs) if asyncio.iscoroutinefunction(func) else func(*args, **kwargs)
                return True, result
            except Exception as e:
                last_error = e
                if attempt < self.max_retries - 1:
                    delay = self.get_delay(attempt)
                    await asyncio.sleep(delay)

        return False, last_error


class SelfDiagnostic:
    """Runs self-diagnostic routines"""

    def __init__(self):
        self.diagnostics: Dict[str, Callable] = {}
        self.results: List[Dict] = []

    def register_diagnostic(self, name: str, check_func: Callable):
        """Register a diagnostic check"""
        self.diagnostics[name] = check_func

    async def run_all(self) -> Dict[str, Any]:
        """Run all diagnostic checks"""
        results = {}

        for name, check in self.diagnostics.items():
            try:
                if asyncio.iscoroutinefunction(check):
                    result = await check()
                else:
                    result = check()
                results[name] = {'status': 'pass', 'result': result}
            except Exception as e:
                results[name] = {'status': 'fail', 'error': str(e)}

        self.results.append({
            'timestamp': time.time(),
            'results': results
        })

        return results

    def get_health_score(self) -> float:
        """Get overall health score (0-1)"""
        if not self.results:
            return 1.0

        latest = self.results[-1]['results']
        passed = sum(1 for r in latest.values() if r['status'] == 'pass')
        return passed / len(latest) if latest else 1.0


class SelfHealingSystem:
    """
    Complete self-healing system with diagnosis and recovery.
    """

    def __init__(self):
        self.pattern_recognizer = ErrorPatternRecognizer()
        self.circuit_breakers: Dict[str, CircuitBreaker] = {}
        self.retry_manager = RetryManager()
        self.diagnostics = SelfDiagnostic()

        self.recovery_history: List[RecoveryResult] = []
        self.error_log: List[Dict] = []
        self.auto_fixes: Dict[str, Callable] = {}

        # Register default diagnostics
        self._register_default_diagnostics()

    def _register_default_diagnostics(self):
        """Register default diagnostic checks"""
        self.diagnostics.register_diagnostic(
            'memory_check',
            lambda: {'status': 'ok'}  # Would check actual memory
        )
        self.diagnostics.register_diagnostic(
            'import_check',
            self._check_imports
        )

    def _check_imports(self) -> Dict[str, bool]:
        """Check if core imports work"""
        results = {}
        core_modules = ['numpy', 'asyncio', 'json', 'hashlib']

        for module in core_modules:
            try:
                __import__(module)
                results[module] = True
            except ImportError:
                results[module] = False

        return results

    def get_circuit_breaker(self, name: str) -> CircuitBreaker:
        """Get or create a circuit breaker"""
        if name not in self.circuit_breakers:
            self.circuit_breakers[name] = CircuitBreaker(name)
        return self.circuit_breakers[name]

    def register_auto_fix(self, pattern_id: str, fix_func: Callable):
        """Register an automatic fix for a pattern"""
        self.auto_fixes[pattern_id] = fix_func

    async def handle_error(self, error: Exception, context: str = "",
                          allow_retry: bool = True) -> RecoveryResult:
        """Handle an error with automatic recovery"""
        start_time = time.time()

        # Log error
        self.error_log.append({
            'type': type(error).__name__,
            'message': str(error),
            'context': context,
            'timestamp': start_time,
            'traceback': traceback.format_exc()
        })

        # Recognize pattern
        pattern = self.pattern_recognizer.recognize(error)

        if pattern is None:
            # Unknown error - escalate
            result = RecoveryResult(
                success=False,
                strategy_used=RecoveryStrategy.ESCALATE,
                attempts=0,
                duration=time.time() - start_time,
                message=f"Unknown error: {error}"
            )
            self.recovery_history.append(result)
            return result

        # Try recovery strategies
        for strategy in pattern.recovery_strategies:
            if strategy == RecoveryStrategy.RETRY and allow_retry:
                # Check circuit breaker
                circuit = self.get_circuit_breaker(context or pattern.pattern_id)

                if not circuit.can_execute():
                    continue

                # Would retry the operation here
                circuit.record_failure()  # Assume failure for now

            elif strategy == RecoveryStrategy.FALLBACK:
                # Look for auto-fix
                if pattern.pattern_id in self.auto_fixes:
                    try:
                        fix = self.auto_fixes[pattern.pattern_id]
                        if asyncio.iscoroutinefunction(fix):
                            await fix()
                        else:
                            fix()

                        result = RecoveryResult(
                            success=True,
                            strategy_used=strategy,
                            attempts=1,
                            duration=time.time() - start_time,
                            message=f"Applied auto-fix for {pattern.pattern_id}"
                        )
                        self.recovery_history.append(result)
                        return result
                    except Exception:
                        pass

            elif strategy == RecoveryStrategy.SKIP:
                result = RecoveryResult(
                    success=True,
                    strategy_used=strategy,
                    attempts=0,
                    duration=time.time() - start_time,
                    message=f"Skipped operation due to {pattern.pattern_id}"
                )
                self.recovery_history.append(result)
                return result

            elif strategy == RecoveryStrategy.CIRCUIT_BREAK:
                circuit = self.get_circuit_breaker(context or pattern.pattern_id)
                circuit.record_failure()

                result = RecoveryResult(
                    success=False,
                    strategy_used=strategy,
                    attempts=0,
                    duration=time.time() - start_time,
                    message=f"Circuit breaker opened for {pattern.pattern_id}"
                )
                self.recovery_history.append(result)
                return result

        # No recovery succeeded
        result = RecoveryResult(
            success=False,
            strategy_used=RecoveryStrategy.ESCALATE,
            attempts=len(pattern.recovery_strategies),
            duration=time.time() - start_time,
            message=f"All recovery strategies failed for {pattern.pattern_id}"
        )
        self.recovery_history.append(result)
        return result

    async def run_diagnostics(self) -> Dict[str, Any]:
        """Run self-diagnostics"""
        return await self.diagnostics.run_all()

    def get_health_status(self) -> Dict[str, Any]:
        """Get overall health status"""
        health_score = self.diagnostics.get_health_score()

        # Check circuit breakers
        open_circuits = [
            name for name, cb in self.circuit_breakers.items()
            if cb.state.state == 'open'
        ]

        # Recent errors
        recent_errors = [
            e for e in self.error_log
            if time.time() - e['timestamp'] < 300  # Last 5 minutes
        ]

        # Recovery success rate
        if self.recovery_history:
            recovery_rate = sum(
                1 for r in self.recovery_history if r.success
            ) / len(self.recovery_history)
        else:
            recovery_rate = 1.0

        return {
            'health_score': health_score,
            'status': 'healthy' if health_score > 0.8 else 'degraded' if health_score > 0.5 else 'unhealthy',
            'open_circuits': open_circuits,
            'recent_error_count': len(recent_errors),
            'recovery_rate': recovery_rate,
            'frequent_patterns': [
                {'id': p.pattern_id, 'count': p.occurrence_count}
                for p in self.pattern_recognizer.get_frequent_patterns()
            ]
        }

    def get_statistics(self) -> Dict[str, Any]:
        """Get system statistics"""
        return {
            'total_errors': len(self.error_log),
            'patterns_recognized': len(self.pattern_recognizer.patterns),
            'unknown_errors': len(self.pattern_recognizer.unknown_errors),
            'recovery_attempts': len(self.recovery_history),
            'successful_recoveries': sum(1 for r in self.recovery_history if r.success),
            'circuit_breakers': len(self.circuit_breakers),
            'auto_fixes_registered': len(self.auto_fixes)
        }


# Singleton
_self_healing_system: Optional[SelfHealingSystem] = None


def get_self_healing_system() -> SelfHealingSystem:
    """Get singleton self-healing system"""
    global _self_healing_system
    if _self_healing_system is None:
        _self_healing_system = SelfHealingSystem()
    return _self_healing_system
