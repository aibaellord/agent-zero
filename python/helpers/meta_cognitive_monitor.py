"""
META-COGNITIVE MONITOR
======================
Thinking about thinking - real-time cognitive quality monitoring.

Features:
- Reasoning chain validation
- Cognitive load estimation
- Attention allocation tracking
- Error pattern detection
- Self-correction triggering
- Confidence calibration
"""

from __future__ import annotations

import random
import time
from collections import deque
from dataclasses import dataclass, field
from enum import Enum, auto
from typing import Any, Dict, List, Optional, Tuple

# Optional numpy
try:
    import numpy as np
    HAS_NUMPY = True
except ImportError:
    HAS_NUMPY = False


class CognitiveAlert(Enum):
    """Types of cognitive alerts"""
    CIRCULAR_REASONING = auto()
    EXCESSIVE_COMPLEXITY = auto()
    LOW_CONFIDENCE = auto()
    HIGH_UNCERTAINTY = auto()
    SCOPE_CREEP = auto()
    TANGENT_DETECTED = auto()
    ASSUMPTION_UNSTATED = auto()
    CONCLUSION_PREMATURE = auto()
    EVIDENCE_LACKING = auto()
    CONTRADICTION = auto()


class ReasoningQuality(Enum):
    """Quality levels for reasoning"""
    EXCELLENT = 5
    GOOD = 4
    ADEQUATE = 3
    POOR = 2
    CRITICAL = 1


@dataclass
class CognitiveState:
    """Current cognitive state snapshot"""
    timestamp: float
    cognitive_load: float  # 0-1
    attention_focus: str
    active_goals: int
    reasoning_depth: int
    confidence: float
    uncertainty: float
    alerts: List[CognitiveAlert]


@dataclass
class ReasoningStep:
    """A single step in reasoning chain"""
    step_id: int
    content: str
    step_type: str  # observation, inference, conclusion, etc.
    confidence: float
    dependencies: List[int]  # IDs of steps this depends on
    timestamp: float


class ReasoningChainValidator:
    """Validates chains of reasoning for logical consistency"""

    def __init__(self):
        self.steps: List[ReasoningStep] = []
        self.step_counter = 0

    def add_step(self, content: str, step_type: str,
                 confidence: float, dependencies: List[int] = None) -> int:
        """Add a reasoning step"""
        step = ReasoningStep(
            step_id=self.step_counter,
            content=content,
            step_type=step_type,
            confidence=confidence,
            dependencies=dependencies or [],
            timestamp=time.time()
        )
        self.steps.append(step)
        self.step_counter += 1
        return step.step_id

    def detect_circular_reasoning(self) -> List[List[int]]:
        """Detect circular dependencies in reasoning"""
        cycles = []

        # Build dependency graph
        graph = {s.step_id: s.dependencies for s in self.steps}

        def find_cycle(node: int, path: List[int], visited: set) -> Optional[List[int]]:
            if node in path:
                cycle_start = path.index(node)
                return path[cycle_start:]
            if node in visited:
                return None

            visited.add(node)
            path.append(node)

            for dep in graph.get(node, []):
                result = find_cycle(dep, path.copy(), visited)
                if result:
                    return result

            return None

        visited = set()
        for step_id in graph:
            cycle = find_cycle(step_id, [], visited)
            if cycle and cycle not in cycles:
                cycles.append(cycle)

        return cycles

    def calculate_chain_confidence(self) -> float:
        """Calculate overall confidence of reasoning chain"""
        if not self.steps:
            return 0.0

        # Confidence propagates - each step can only be as confident
        # as its least confident dependency
        confidences = {}

        for step in self.steps:
            if not step.dependencies:
                confidences[step.step_id] = step.confidence
            else:
                dep_confidences = [
                    confidences.get(d, 0.5) for d in step.dependencies
                ]
                # Chain confidence is product (AND logic)
                chain_conf = 1.0
                for dc in dep_confidences:
                    chain_conf *= dc
                confidences[step.step_id] = step.confidence * chain_conf

        vals = list(confidences.values())
        return sum(vals) / len(vals) if vals else 0.5

    def get_weakest_links(self, n: int = 3) -> List[ReasoningStep]:
        """Get the n weakest steps in the chain"""
        return sorted(self.steps, key=lambda s: s.confidence)[:n]

    def clear(self):
        """Clear the reasoning chain"""
        self.steps = []
        self.step_counter = 0


class AttentionTracker:
    """Tracks attention allocation across topics/tasks"""

    def __init__(self, window_size: int = 100):
        self.attention_history: deque = deque(maxlen=window_size)
        self.topic_time: Dict[str, float] = {}
        self.current_focus: Optional[str] = None
        self.focus_start: float = 0.0

    def focus_on(self, topic: str):
        """Record focusing on a topic"""
        now = time.time()

        # Record time on previous topic
        if self.current_focus:
            duration = now - self.focus_start
            self.topic_time[self.current_focus] = (
                self.topic_time.get(self.current_focus, 0) + duration
            )

        self.current_focus = topic
        self.focus_start = now
        self.attention_history.append({
            'topic': topic,
            'timestamp': now
        })

    def get_attention_distribution(self) -> Dict[str, float]:
        """Get distribution of attention across topics"""
        total_time = sum(self.topic_time.values())
        if total_time == 0:
            return {}
        return {
            topic: time / total_time
            for topic, time in self.topic_time.items()
        }

    def detect_tangent(self, original_topic: str, threshold: float = 0.3) -> bool:
        """Detect if attention has wandered from original topic"""
        if not self.attention_history:
            return False

        recent = list(self.attention_history)[-10:]
        on_topic = sum(1 for a in recent if original_topic.lower() in a['topic'].lower())

        return on_topic / len(recent) < threshold


class CognitiveLoadEstimator:
    """Estimates current cognitive load"""

    def __init__(self):
        self.task_weights: Dict[str, float] = {}
        self.active_tasks: List[str] = []
        self.history: List[Tuple[float, float]] = []

    def add_task(self, task: str, weight: float = 1.0):
        """Add an active task"""
        self.active_tasks.append(task)
        self.task_weights[task] = weight

    def complete_task(self, task: str):
        """Mark a task as complete"""
        if task in self.active_tasks:
            self.active_tasks.remove(task)

    def estimate_load(self) -> float:
        """Estimate current cognitive load (0-1)"""
        if not self.active_tasks:
            return 0.0

        total_weight = sum(
            self.task_weights.get(t, 1.0) for t in self.active_tasks
        )

        # Normalize to 0-1 (assume max comfortable load is 5)
        load = min(1.0, total_weight / 5.0)

        self.history.append((time.time(), load))
        return load

    def get_load_trend(self) -> str:
        """Get trend of cognitive load"""
        if len(self.history) < 2:
            return "stable"

        recent = self.history[-10:]
        loads = [h[1] for h in recent]

        if loads[-1] > loads[0] + 0.1:
            return "increasing"
        elif loads[-1] < loads[0] - 0.1:
            return "decreasing"
        return "stable"


class MetaCognitiveMonitor:
    """
    The complete meta-cognitive monitoring system.
    """

    def __init__(self):
        self.chain_validator = ReasoningChainValidator()
        self.attention_tracker = AttentionTracker()
        self.load_estimator = CognitiveLoadEstimator()

        self.alerts: List[Tuple[float, CognitiveAlert, str]] = []
        self.state_history: List[CognitiveState] = []
        self.correction_triggers: List[Dict] = []

        # Thresholds
        self.confidence_threshold = 0.4
        self.load_threshold = 0.8
        self.complexity_threshold = 10

    def add_reasoning_step(self, content: str, step_type: str,
                           confidence: float, dependencies: List[int] = None) -> int:
        """Add and validate a reasoning step"""
        step_id = self.chain_validator.add_step(
            content, step_type, confidence, dependencies
        )

        # Check for issues
        if confidence < self.confidence_threshold:
            self._raise_alert(
                CognitiveAlert.LOW_CONFIDENCE,
                f"Low confidence ({confidence:.2f}) in step: {content[:50]}"
            )

        # Check for circular reasoning
        cycles = self.chain_validator.detect_circular_reasoning()
        if cycles:
            self._raise_alert(
                CognitiveAlert.CIRCULAR_REASONING,
                f"Circular reasoning detected in steps: {cycles}"
            )

        # Check complexity
        if len(self.chain_validator.steps) > self.complexity_threshold:
            self._raise_alert(
                CognitiveAlert.EXCESSIVE_COMPLEXITY,
                f"Reasoning chain has {len(self.chain_validator.steps)} steps"
            )

        return step_id

    def focus(self, topic: str, original_topic: str = None):
        """Record attention focus"""
        self.attention_tracker.focus_on(topic)

        if original_topic and self.attention_tracker.detect_tangent(original_topic):
            self._raise_alert(
                CognitiveAlert.TANGENT_DETECTED,
                f"Attention wandered from '{original_topic}' to '{topic}'"
            )

    def add_task(self, task: str, weight: float = 1.0):
        """Add a cognitive task"""
        self.load_estimator.add_task(task, weight)

        load = self.load_estimator.estimate_load()
        if load > self.load_threshold:
            self._raise_alert(
                CognitiveAlert.EXCESSIVE_COMPLEXITY,
                f"Cognitive load at {load:.0%} - consider simplifying"
            )

    def complete_task(self, task: str):
        """Mark task complete"""
        self.load_estimator.complete_task(task)

    def _raise_alert(self, alert_type: CognitiveAlert, message: str):
        """Raise a cognitive alert"""
        self.alerts.append((time.time(), alert_type, message))

        # Trigger correction if critical
        if alert_type in [CognitiveAlert.CIRCULAR_REASONING,
                          CognitiveAlert.CONTRADICTION]:
            self.correction_triggers.append({
                'timestamp': time.time(),
                'trigger': alert_type.name,
                'message': message
            })

    def get_current_state(self) -> CognitiveState:
        """Get current cognitive state"""
        state = CognitiveState(
            timestamp=time.time(),
            cognitive_load=self.load_estimator.estimate_load(),
            attention_focus=self.attention_tracker.current_focus or "none",
            active_goals=len(self.load_estimator.active_tasks),
            reasoning_depth=len(self.chain_validator.steps),
            confidence=self.chain_validator.calculate_chain_confidence(),
            uncertainty=1.0 - self.chain_validator.calculate_chain_confidence(),
            alerts=[a[1] for a in self.alerts[-5:]]
        )
        self.state_history.append(state)
        return state

    def get_quality_assessment(self) -> Tuple[ReasoningQuality, Dict[str, Any]]:
        """Assess overall reasoning quality"""
        state = self.get_current_state()

        score = 5.0  # Start with excellent

        # Deductions
        if state.cognitive_load > 0.8:
            score -= 1
        if state.confidence < 0.5:
            score -= 1
        if state.reasoning_depth > 15:
            score -= 0.5
        if len(state.alerts) > 3:
            score -= 0.5
        if any(a == CognitiveAlert.CIRCULAR_REASONING for a in state.alerts):
            score -= 1.5

        score = max(1, min(5, score))
        quality = ReasoningQuality(int(score))

        details = {
            'score': score,
            'cognitive_load': state.cognitive_load,
            'confidence': state.confidence,
            'depth': state.reasoning_depth,
            'active_alerts': len(state.alerts),
            'weakest_links': [
                s.content[:50] for s in self.chain_validator.get_weakest_links(3)
            ]
        }

        return quality, details

    def get_recommendations(self) -> List[str]:
        """Get recommendations for improving reasoning"""
        recommendations = []
        state = self.get_current_state()

        if state.cognitive_load > 0.7:
            recommendations.append(
                "High cognitive load - consider breaking down into smaller tasks"
            )

        if state.confidence < 0.5:
            recommendations.append(
                "Low confidence - gather more evidence or simplify conclusions"
            )

        weak_links = self.chain_validator.get_weakest_links(2)
        for link in weak_links:
            if link.confidence < 0.4:
                recommendations.append(
                    f"Strengthen reasoning step: '{link.content[:50]}'"
                )

        cycles = self.chain_validator.detect_circular_reasoning()
        if cycles:
            recommendations.append(
                "Break circular reasoning by grounding in independent evidence"
            )

        trend = self.load_estimator.get_load_trend()
        if trend == "increasing":
            recommendations.append(
                "Cognitive load increasing - prioritize and defer less critical tasks"
            )

        return recommendations

    def reset_chain(self):
        """Reset the reasoning chain"""
        self.chain_validator.clear()

    def get_statistics(self) -> Dict[str, Any]:
        """Get monitoring statistics"""
        return {
            'total_reasoning_steps': len(self.chain_validator.steps),
            'total_alerts': len(self.alerts),
            'average_confidence': self.chain_validator.calculate_chain_confidence(),
            'attention_distribution': self.attention_tracker.get_attention_distribution(),
            'load_trend': self.load_estimator.get_load_trend(),
            'correction_triggers': len(self.correction_triggers)
        }


# Singleton
_meta_cognitive_monitor: Optional[MetaCognitiveMonitor] = None


def get_meta_cognitive_monitor() -> MetaCognitiveMonitor:
    """Get singleton monitor"""
    global _meta_cognitive_monitor
    if _meta_cognitive_monitor is None:
        _meta_cognitive_monitor = MetaCognitiveMonitor()
    return _meta_cognitive_monitor
