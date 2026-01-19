"""
OMNISCIENT CONTROLLER
=====================
The Master Orchestration Layer that unifies ALL cognitive systems.
This is the brain's executive function - making high-level decisions
about which cognitive resources to deploy for any given task.

Features:
- Unified access to all Heisenberg engines
- Autonomous decision-making on cognitive strategy
- Dynamic resource allocation
- Meta-optimization of reasoning paths
- Emergent capability synthesis
"""

from __future__ import annotations

import asyncio
import hashlib
import math
import random
import time
from collections import defaultdict
from dataclasses import dataclass, field
from enum import Enum, auto
from typing import Any, Callable, Dict, List, Optional, Tuple

# Optional numpy
try:
    import numpy as np
    HAS_NUMPY = True
except ImportError:
    HAS_NUMPY = False


class CognitiveMode(Enum):
    """Cognitive modes for different task types"""
    ANALYTICAL = auto()      # Deep logical analysis
    CREATIVE = auto()        # Novel idea generation
    STRATEGIC = auto()       # Game-theoretic reasoning
    EXPLORATORY = auto()     # Broad search
    FOCUSED = auto()         # Narrow deep dive
    ADVERSARIAL = auto()     # Devil's advocate
    INTEGRATIVE = auto()     # Synthesis across domains
    METACOGNITIVE = auto()   # Thinking about thinking
    AUTONOMOUS = auto()      # Self-directed goal pursuit


class TaskComplexity(Enum):
    """Task complexity classification"""
    TRIVIAL = 1
    SIMPLE = 2
    MODERATE = 3
    COMPLEX = 4
    VERY_COMPLEX = 5
    SUPERHUMAN = 6


@dataclass
class CognitiveStrategy:
    """A strategy for approaching a cognitive task"""
    name: str
    modes: List[CognitiveMode]
    engines: List[str]
    confidence: float = 0.5
    estimated_tokens: int = 0
    estimated_time: float = 0.0
    priority: int = 5
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ExecutionPlan:
    """A complete plan for executing a cognitive task"""
    task: str
    complexity: TaskComplexity
    strategies: List[CognitiveStrategy]
    parallel_branches: int
    estimated_total_tokens: int
    estimated_time: float
    resource_allocation: Dict[str, float]
    checkpoints: List[str]
    fallback_strategies: List[CognitiveStrategy]


class ResourceAllocator:
    """
    Dynamically allocates cognitive resources based on task demands.
    """

    def __init__(self, total_budget: float = 1.0):
        self.total_budget = total_budget
        self.allocations: Dict[str, float] = {}
        self.usage_history: List[Dict] = []

    def allocate(self, task_analysis: Dict[str, float]) -> Dict[str, float]:
        """Allocate resources based on task analysis"""
        total_demand = sum(task_analysis.values())
        if total_demand == 0:
            return {k: self.total_budget / len(task_analysis) for k in task_analysis}

        # Normalize allocations
        allocations = {
            k: (v / total_demand) * self.total_budget
            for k, v in task_analysis.items()
        }

        self.allocations = allocations
        return allocations

    def rebalance(self, performance: Dict[str, float]) -> Dict[str, float]:
        """Rebalance based on performance feedback"""
        if not self.allocations:
            return {}

        # Boost high-performers, reduce low-performers
        new_allocations = {}
        for engine, alloc in self.allocations.items():
            perf = performance.get(engine, 0.5)
            adjustment = (perf - 0.5) * 0.2  # -0.1 to +0.1
            new_allocations[engine] = max(0.05, min(0.5, alloc + adjustment))

        # Renormalize
        total = sum(new_allocations.values())
        self.allocations = {k: v/total for k, v in new_allocations.items()}

        return self.allocations


class EmergenceDetector:
    """
    Detects emergent capabilities - when the system exhibits
    behaviors not explicitly programmed.
    """

    def __init__(self):
        self.capability_signatures: Dict[str, np.ndarray] = {}
        self.observed_behaviors: List[Dict] = []
        self.emergent_patterns: List[Dict] = []

    def register_capability(self, name: str, signature: np.ndarray):
        """Register a known capability signature"""
        self.capability_signatures[name] = signature / (np.linalg.norm(signature) + 1e-10)

    def observe_behavior(self, behavior: Dict[str, Any], embedding: np.ndarray):
        """Observe a behavior and check for emergence"""
        embedding = embedding / (np.linalg.norm(embedding) + 1e-10)

        # Check similarity to known capabilities
        max_similarity = 0.0
        closest_capability = None

        for name, sig in self.capability_signatures.items():
            sim = float(np.dot(embedding, sig))
            if sim > max_similarity:
                max_similarity = sim
                closest_capability = name

        # If low similarity to all known, might be emergent
        if max_similarity < 0.5:
            self.emergent_patterns.append({
                'timestamp': time.time(),
                'behavior': behavior,
                'embedding': embedding.tolist(),
                'closest_known': closest_capability,
                'novelty_score': 1.0 - max_similarity
            })
            return True, 1.0 - max_similarity

        self.observed_behaviors.append({
            'behavior': behavior,
            'matched': closest_capability,
            'similarity': max_similarity
        })
        return False, 0.0

    def get_emergent_capabilities(self) -> List[Dict]:
        """Return detected emergent capabilities"""
        return self.emergent_patterns


class CognitiveRouter:
    """
    Routes tasks to appropriate cognitive engines based on task analysis.
    """

    def __init__(self):
        self.routing_history: List[Dict] = []
        self.engine_performance: Dict[str, List[float]] = defaultdict(list)

        # Define engine specializations
        self.engine_specializations = {
            'quantum': ['uncertainty', 'parallel', 'hypothesis', 'superposition', 'probability'],
            'chaos': ['creative', 'novel', 'brainstorm', 'variation', 'explore'],
            'topology': ['structure', 'relationship', 'connection', 'memory', 'pattern'],
            'game_theory': ['strategic', 'compete', 'negotiate', 'optimize', 'equilibrium'],
            'information': ['compress', 'efficient', 'entropy', 'encode', 'signal'],
            'swarm': ['distributed', 'collective', 'parallel', 'diverse', 'emergent'],
            'self_mod': ['adapt', 'evolve', 'learn', 'improve', 'meta'],
            'category': ['abstract', 'map', 'transform', 'functor', 'structure']
        }

    def route(self, task: str, context: Dict[str, Any] = None) -> List[Tuple[str, float]]:
        """Route task to appropriate engines with confidence scores"""
        task_lower = task.lower()
        context = context or {}

        scores = {}
        for engine, keywords in self.engine_specializations.items():
            score = sum(1 for kw in keywords if kw in task_lower)
            # Add historical performance bonus
            if self.engine_performance[engine]:
                score += np.mean(self.engine_performance[engine][-10:]) * 2
            scores[engine] = score

        # Normalize scores
        total = sum(scores.values()) + 1e-10
        normalized = [(engine, score/total) for engine, score in scores.items()]

        # Sort by score descending
        normalized.sort(key=lambda x: x[1], reverse=True)

        self.routing_history.append({
            'task': task[:100],
            'routing': normalized,
            'timestamp': time.time()
        })

        return normalized

    def record_performance(self, engine: str, score: float):
        """Record performance for learning"""
        self.engine_performance[engine].append(score)
        # Keep last 100 records
        if len(self.engine_performance[engine]) > 100:
            self.engine_performance[engine] = self.engine_performance[engine][-100:]


class OmniscientController:
    """
    The Master Controller that orchestrates all cognitive operations.
    """

    def __init__(self):
        self.resource_allocator = ResourceAllocator()
        self.emergence_detector = EmergenceDetector()
        self.cognitive_router = CognitiveRouter()

        # State tracking
        self.current_mode = CognitiveMode.ANALYTICAL
        self.active_strategies: List[CognitiveStrategy] = []
        self.execution_history: List[Dict] = []
        self.performance_metrics: Dict[str, float] = {
            'accuracy': 0.7,
            'creativity': 0.6,
            'efficiency': 0.7,
            'adaptability': 0.6,
            'robustness': 0.7
        }

        # Engine references (set during initialization)
        self._heisenberg = None
        self._swarm = None
        self._memory = None

        # Autonomous goal tracking
        self.active_goals: List[Dict] = []
        self.completed_goals: List[Dict] = []
        self.goal_dependencies: Dict[str, List[str]] = {}

    def set_engines(self, heisenberg, swarm, memory):
        """Set references to cognitive engines"""
        self._heisenberg = heisenberg
        self._swarm = swarm
        self._memory = memory

    def analyze_task(self, task: str) -> Tuple[TaskComplexity, Dict[str, float]]:
        """Analyze task to determine complexity and resource needs"""
        task_lower = task.lower()

        # Complexity indicators
        complexity_score = 0

        # Length-based complexity
        word_count = len(task.split())
        if word_count > 100:
            complexity_score += 2
        elif word_count > 50:
            complexity_score += 1

        # Keyword-based complexity
        complex_keywords = [
            'analyze', 'synthesize', 'compare', 'evaluate', 'design',
            'optimize', 'implement', 'integrate', 'comprehensive', 'complex',
            'multi-step', 'strategic', 'systematic', 'thorough', 'detailed'
        ]
        complexity_score += sum(1 for kw in complex_keywords if kw in task_lower)

        # Multi-part detection
        if any(x in task_lower for x in ['and', 'also', 'additionally', 'furthermore']):
            complexity_score += 1

        # Map to complexity level
        if complexity_score <= 1:
            complexity = TaskComplexity.TRIVIAL
        elif complexity_score <= 3:
            complexity = TaskComplexity.SIMPLE
        elif complexity_score <= 5:
            complexity = TaskComplexity.MODERATE
        elif complexity_score <= 8:
            complexity = TaskComplexity.COMPLEX
        elif complexity_score <= 12:
            complexity = TaskComplexity.VERY_COMPLEX
        else:
            complexity = TaskComplexity.SUPERHUMAN

        # Resource needs analysis
        resource_needs = {
            'quantum': 0.0,
            'chaos': 0.0,
            'topology': 0.0,
            'game_theory': 0.0,
            'information': 0.0,
            'swarm': 0.0,
            'self_mod': 0.0
        }

        # Route to get engine scores
        routing = self.cognitive_router.route(task)
        for engine, score in routing:
            if engine in resource_needs:
                resource_needs[engine] = score

        return complexity, resource_needs

    def create_execution_plan(self, task: str) -> ExecutionPlan:
        """Create a comprehensive execution plan for a task"""
        complexity, resource_needs = self.analyze_task(task)

        # Allocate resources
        allocations = self.resource_allocator.allocate(resource_needs)

        # Create strategies based on complexity
        strategies = []

        # Primary strategy
        top_engines = sorted(resource_needs.items(), key=lambda x: x[1], reverse=True)[:3]
        primary = CognitiveStrategy(
            name="primary",
            modes=[self._complexity_to_mode(complexity)],
            engines=[e[0] for e in top_engines],
            confidence=0.7,
            estimated_tokens=complexity.value * 500,
            priority=1
        )
        strategies.append(primary)

        # Exploratory strategy for complex tasks
        if complexity.value >= TaskComplexity.COMPLEX.value:
            exploratory = CognitiveStrategy(
                name="exploratory",
                modes=[CognitiveMode.EXPLORATORY, CognitiveMode.CREATIVE],
                engines=['chaos', 'swarm', 'quantum'],
                confidence=0.5,
                estimated_tokens=complexity.value * 300,
                priority=2
            )
            strategies.append(exploratory)

        # Adversarial check for important tasks
        if complexity.value >= TaskComplexity.MODERATE.value:
            adversarial = CognitiveStrategy(
                name="adversarial_check",
                modes=[CognitiveMode.ADVERSARIAL],
                engines=['quantum', 'game_theory'],
                confidence=0.6,
                estimated_tokens=200,
                priority=3
            )
            strategies.append(adversarial)

        # Fallback strategies
        fallbacks = [
            CognitiveStrategy(
                name="simplified",
                modes=[CognitiveMode.FOCUSED],
                engines=['topology', 'information'],
                confidence=0.4,
                priority=10
            )
        ]

        # Calculate totals
        total_tokens = sum(s.estimated_tokens for s in strategies)
        parallel_branches = min(complexity.value, 8)

        return ExecutionPlan(
            task=task,
            complexity=complexity,
            strategies=strategies,
            parallel_branches=parallel_branches,
            estimated_total_tokens=total_tokens,
            estimated_time=total_tokens / 100,  # Rough estimate
            resource_allocation=allocations,
            checkpoints=[f"checkpoint_{i}" for i in range(complexity.value)],
            fallback_strategies=fallbacks
        )

    def _complexity_to_mode(self, complexity: TaskComplexity) -> CognitiveMode:
        """Map complexity to primary cognitive mode"""
        mapping = {
            TaskComplexity.TRIVIAL: CognitiveMode.FOCUSED,
            TaskComplexity.SIMPLE: CognitiveMode.ANALYTICAL,
            TaskComplexity.MODERATE: CognitiveMode.ANALYTICAL,
            TaskComplexity.COMPLEX: CognitiveMode.INTEGRATIVE,
            TaskComplexity.VERY_COMPLEX: CognitiveMode.AUTONOMOUS,
            TaskComplexity.SUPERHUMAN: CognitiveMode.METACOGNITIVE
        }
        return mapping.get(complexity, CognitiveMode.ANALYTICAL)

    async def execute_plan(self, plan: ExecutionPlan) -> Dict[str, Any]:
        """Execute a cognitive plan"""
        results = {
            'task': plan.task,
            'complexity': plan.complexity.name,
            'strategies_executed': [],
            'emergent_capabilities': [],
            'final_confidence': 0.0,
            'tokens_used': 0
        }

        for strategy in plan.strategies:
            try:
                result = await self._execute_strategy(strategy, plan)
                results['strategies_executed'].append({
                    'name': strategy.name,
                    'success': True,
                    'result': result
                })
                results['tokens_used'] += strategy.estimated_tokens

                # Check for emergence
                if result.get('embedding') is not None:
                    is_emergent, novelty = self.emergence_detector.observe_behavior(
                        {'strategy': strategy.name, 'result': result},
                        np.array(result['embedding'])
                    )
                    if is_emergent:
                        results['emergent_capabilities'].append({
                            'novelty': novelty,
                            'description': f"Novel behavior in {strategy.name}"
                        })

            except Exception as e:
                results['strategies_executed'].append({
                    'name': strategy.name,
                    'success': False,
                    'error': str(e)
                })

        # Calculate final confidence
        successes = [s for s in results['strategies_executed'] if s['success']]
        if successes:
            results['final_confidence'] = len(successes) / len(plan.strategies)

        self.execution_history.append(results)
        return results

    async def _execute_strategy(self, strategy: CognitiveStrategy,
                                 plan: ExecutionPlan) -> Dict[str, Any]:
        """Execute a single strategy"""
        result = {
            'engines_used': strategy.engines,
            'modes': [m.name for m in strategy.modes],
            'outputs': []
        }

        # Execute on each engine
        for engine_name in strategy.engines:
            if self._heisenberg is not None:
                engine = getattr(self._heisenberg, engine_name, None)
                if engine:
                    # Simple execution - real implementation would be richer
                    result['outputs'].append({
                        'engine': engine_name,
                        'status': 'executed'
                    })

        # Generate embedding for emergence detection
        hash_input = f"{strategy.name}:{','.join(strategy.engines)}"
        hash_val = int(hashlib.md5(hash_input.encode()).hexdigest()[:8], 16)
        np.random.seed(hash_val % 10000)
        result['embedding'] = np.random.randn(128).tolist()

        return result

    def add_goal(self, goal: str, priority: int = 5,
                 dependencies: List[str] = None) -> str:
        """Add an autonomous goal"""
        goal_id = hashlib.md5(f"{goal}:{time.time()}".encode()).hexdigest()[:12]

        goal_entry = {
            'id': goal_id,
            'description': goal,
            'priority': priority,
            'status': 'pending',
            'created': time.time(),
            'sub_goals': [],
            'progress': 0.0
        }

        self.active_goals.append(goal_entry)

        if dependencies:
            self.goal_dependencies[goal_id] = dependencies

        return goal_id

    def decompose_goal(self, goal_id: str) -> List[str]:
        """Decompose a goal into sub-goals"""
        goal = next((g for g in self.active_goals if g['id'] == goal_id), None)
        if not goal:
            return []

        # Simple decomposition - real implementation would use LLM
        description = goal['description']

        # Create sub-goals based on common patterns
        sub_goals = []
        sub_goal_templates = [
            f"Analyze requirements for: {description[:50]}",
            f"Design solution for: {description[:50]}",
            f"Implement solution for: {description[:50]}",
            f"Validate solution for: {description[:50]}",
            f"Optimize solution for: {description[:50]}"
        ]

        for template in sub_goal_templates:
            sub_id = self.add_goal(template, goal['priority'] + 1)
            sub_goals.append(sub_id)
            goal['sub_goals'].append(sub_id)

        return sub_goals

    def get_next_goal(self) -> Optional[Dict]:
        """Get the next goal to work on based on priority and dependencies"""
        # Filter goals with met dependencies
        ready_goals = []

        for goal in self.active_goals:
            if goal['status'] != 'pending':
                continue

            deps = self.goal_dependencies.get(goal['id'], [])
            deps_met = all(
                any(g['id'] == d and g['status'] == 'completed'
                    for g in self.completed_goals)
                for d in deps
            )

            if deps_met:
                ready_goals.append(goal)

        if not ready_goals:
            return None

        # Return highest priority
        return min(ready_goals, key=lambda g: g['priority'])

    def get_system_status(self) -> Dict[str, Any]:
        """Get complete controller status"""
        return {
            'current_mode': self.current_mode.name,
            'active_strategies': len(self.active_strategies),
            'active_goals': len(self.active_goals),
            'completed_goals': len(self.completed_goals),
            'execution_history_size': len(self.execution_history),
            'emergent_patterns': len(self.emergence_detector.emergent_patterns),
            'performance_metrics': self.performance_metrics,
            'resource_allocation': self.resource_allocator.allocations
        }


# Singleton
_omniscient_controller: Optional[OmniscientController] = None


def get_omniscient_controller() -> OmniscientController:
    """Get singleton controller"""
    global _omniscient_controller
    if _omniscient_controller is None:
        _omniscient_controller = OmniscientController()
    return _omniscient_controller
