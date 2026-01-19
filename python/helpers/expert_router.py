"""
EXPERT SYSTEM ROUTER
====================
Routes tasks to specialized expert sub-systems.

Features:
- Task type detection
- Expert matching
- Load balancing
- Fallback chains
- Performance tracking
"""

from __future__ import annotations

import re
import time
from dataclasses import dataclass, field
from enum import Enum, auto
from typing import Any, Callable, Dict, List, Optional, Tuple


class ExpertDomain(Enum):
    """Expert domains"""
    CODE = "code"
    MATH = "math"
    WRITING = "writing"
    ANALYSIS = "analysis"
    RESEARCH = "research"
    CREATIVE = "creative"
    TECHNICAL = "technical"
    PLANNING = "planning"
    DEBUGGING = "debugging"
    OPTIMIZATION = "optimization"
    TRANSLATION = "translation"
    SUMMARIZATION = "summarization"
    GENERAL = "general"


@dataclass
class Expert:
    """An expert system configuration"""
    name: str
    domain: ExpertDomain
    patterns: List[str]  # Regex patterns that match this expert
    capabilities: List[str]
    priority: int = 5
    enabled: bool = True
    handler: Optional[Callable] = None
    config: Dict[str, Any] = field(default_factory=dict)

    # Performance tracking
    uses: int = 0
    successes: int = 0
    total_time: float = 0.0

    @property
    def success_rate(self) -> float:
        return self.successes / max(self.uses, 1)

    @property
    def avg_time(self) -> float:
        return self.total_time / max(self.uses, 1)


@dataclass
class RoutingDecision:
    """Result of routing decision"""
    expert: Expert
    confidence: float
    matched_patterns: List[str]
    alternatives: List[Tuple[Expert, float]]
    reasoning: str


class TaskAnalyzer:
    """Analyzes tasks to determine expert requirements"""

    # Domain detection patterns
    DOMAIN_PATTERNS = {
        ExpertDomain.CODE: [
            r'\b(code|program|function|class|variable|debug|compile|run)\b',
            r'\b(python|javascript|java|c\+\+|rust|go|typescript)\b',
            r'\b(api|sdk|library|framework|package)\b',
            r'```\w*\n',  # Code blocks
        ],
        ExpertDomain.MATH: [
            r'\b(calculate|compute|solve|equation|formula|math)\b',
            r'\b(sum|product|integral|derivative|matrix|vector)\b',
            r'[0-9]+\s*[\+\-\*\/\^]\s*[0-9]+',
            r'\b(prove|theorem|proof)\b',
        ],
        ExpertDomain.WRITING: [
            r'\b(write|compose|draft|essay|article|blog|story)\b',
            r'\b(paragraph|sentence|grammar|style|tone)\b',
            r'\b(edit|proofread|rewrite|revise)\b',
        ],
        ExpertDomain.ANALYSIS: [
            r'\b(analyze|analysis|examine|investigate|study)\b',
            r'\b(data|metrics|statistics|trends|patterns)\b',
            r'\b(compare|contrast|evaluate|assess)\b',
        ],
        ExpertDomain.RESEARCH: [
            r'\b(research|find|search|look up|information)\b',
            r'\b(sources|references|papers|studies)\b',
            r'\b(learn about|understand|explain)\b',
        ],
        ExpertDomain.CREATIVE: [
            r'\b(creative|imagine|brainstorm|ideas|concept)\b',
            r'\b(design|art|music|poem|story)\b',
            r'\b(innovative|novel|unique|original)\b',
        ],
        ExpertDomain.PLANNING: [
            r'\b(plan|schedule|organize|strategy|roadmap)\b',
            r'\b(steps|phases|timeline|milestone)\b',
            r'\b(project|task|goal|objective)\b',
        ],
        ExpertDomain.DEBUGGING: [
            r'\b(debug|fix|error|bug|issue|problem)\b',
            r'\b(traceback|exception|crash|fail)\b',
            r'\b(troubleshoot|diagnose|resolve)\b',
        ],
        ExpertDomain.OPTIMIZATION: [
            r'\b(optimize|improve|enhance|speed up|faster)\b',
            r'\b(performance|efficiency|reduce|minimize)\b',
            r'\b(refactor|clean up|streamline)\b',
        ],
        ExpertDomain.SUMMARIZATION: [
            r'\b(summarize|summary|tldr|brief|overview)\b',
            r'\b(key points|main ideas|highlights)\b',
            r'\b(condense|shorten|simplify)\b',
        ],
    }

    def analyze(self, task: str) -> Dict[ExpertDomain, float]:
        """Analyze task and return domain scores"""
        scores = {}
        task_lower = task.lower()

        for domain, patterns in self.DOMAIN_PATTERNS.items():
            score = 0.0
            for pattern in patterns:
                matches = re.findall(pattern, task_lower, re.IGNORECASE)
                score += len(matches) * 0.2
            scores[domain] = min(score, 1.0)

        # Default to general if no strong match
        if max(scores.values()) < 0.2:
            scores[ExpertDomain.GENERAL] = 0.5

        return scores

    def get_primary_domain(self, task: str) -> Tuple[ExpertDomain, float]:
        """Get the primary domain for a task"""
        scores = self.analyze(task)
        if not scores:
            return ExpertDomain.GENERAL, 0.5

        best_domain = max(scores, key=scores.get)
        return best_domain, scores[best_domain]


class ExpertRouter:
    """
    Routes tasks to appropriate expert systems.
    Intelligent task-to-expert matching.
    """

    def __init__(self):
        self.experts: Dict[str, Expert] = {}
        self.analyzer = TaskAnalyzer()
        self.routing_history: List[Dict] = []
        self.fallback_chain: List[str] = []
        self._setup_default_experts()

    def _setup_default_experts(self):
        """Setup default expert configurations"""
        defaults = [
            Expert(
                name="code_expert",
                domain=ExpertDomain.CODE,
                patterns=[r'\b(code|program|function|debug)\b'],
                capabilities=["code_generation", "code_review", "debugging"],
                priority=8
            ),
            Expert(
                name="math_expert",
                domain=ExpertDomain.MATH,
                patterns=[r'\b(calculate|solve|equation)\b'],
                capabilities=["calculation", "proofs", "statistics"],
                priority=8
            ),
            Expert(
                name="writing_expert",
                domain=ExpertDomain.WRITING,
                patterns=[r'\b(write|compose|edit)\b'],
                capabilities=["content_creation", "editing", "style"],
                priority=7
            ),
            Expert(
                name="research_expert",
                domain=ExpertDomain.RESEARCH,
                patterns=[r'\b(research|find|search)\b'],
                capabilities=["web_search", "data_gathering", "synthesis"],
                priority=7
            ),
            Expert(
                name="analysis_expert",
                domain=ExpertDomain.ANALYSIS,
                patterns=[r'\b(analyze|examine|evaluate)\b'],
                capabilities=["data_analysis", "comparison", "insights"],
                priority=7
            ),
            Expert(
                name="creative_expert",
                domain=ExpertDomain.CREATIVE,
                patterns=[r'\b(creative|imagine|design)\b'],
                capabilities=["ideation", "design", "innovation"],
                priority=6
            ),
            Expert(
                name="planning_expert",
                domain=ExpertDomain.PLANNING,
                patterns=[r'\b(plan|organize|strategy)\b'],
                capabilities=["project_planning", "scheduling", "roadmaps"],
                priority=6
            ),
            Expert(
                name="general_expert",
                domain=ExpertDomain.GENERAL,
                patterns=[r'.*'],  # Matches everything
                capabilities=["general_assistance"],
                priority=1
            ),
        ]

        for expert in defaults:
            self.register_expert(expert)

        self.fallback_chain = ["general_expert"]

    def register_expert(self, expert: Expert):
        """Register an expert system"""
        self.experts[expert.name] = expert

    def unregister_expert(self, name: str):
        """Unregister an expert system"""
        if name in self.experts:
            del self.experts[name]

    def route(self, task: str) -> RoutingDecision:
        """Route a task to the best expert"""
        domain, domain_confidence = self.analyzer.get_primary_domain(task)

        # Find matching experts
        candidates = []
        for expert in self.experts.values():
            if not expert.enabled:
                continue

            # Check domain match
            if expert.domain == domain:
                score = domain_confidence * 0.6
            else:
                score = 0.1

            # Check pattern matches
            matched_patterns = []
            for pattern in expert.patterns:
                if re.search(pattern, task, re.IGNORECASE):
                    matched_patterns.append(pattern)
                    score += 0.1

            # Factor in priority and success rate
            score += expert.priority * 0.02
            score += expert.success_rate * 0.1

            candidates.append((expert, score, matched_patterns))

        # Sort by score
        candidates.sort(key=lambda x: x[1], reverse=True)

        if not candidates:
            # Use fallback
            fallback = self.experts.get(self.fallback_chain[0])
            return RoutingDecision(
                expert=fallback,
                confidence=0.3,
                matched_patterns=[],
                alternatives=[],
                reasoning="No matching expert found, using fallback"
            )

        best = candidates[0]
        alternatives = [(c[0], c[1]) for c in candidates[1:4]]

        decision = RoutingDecision(
            expert=best[0],
            confidence=min(best[1], 1.0),
            matched_patterns=best[2],
            alternatives=alternatives,
            reasoning=f"Matched domain {domain.value} with confidence {domain_confidence:.2f}"
        )

        self.routing_history.append({
            "timestamp": time.time(),
            "task_preview": task[:100],
            "expert": best[0].name,
            "confidence": decision.confidence
        })

        return decision

    def record_result(self, expert_name: str, success: bool,
                      execution_time: float = 0.0):
        """Record expert execution result"""
        if expert_name in self.experts:
            expert = self.experts[expert_name]
            expert.uses += 1
            if success:
                expert.successes += 1
            expert.total_time += execution_time

    def get_expert_stats(self) -> Dict[str, Dict]:
        """Get statistics for all experts"""
        return {
            name: {
                "domain": expert.domain.value,
                "uses": expert.uses,
                "success_rate": expert.success_rate,
                "avg_time": expert.avg_time,
                "priority": expert.priority,
                "enabled": expert.enabled
            }
            for name, expert in self.experts.items()
        }

    def get_best_expert_for_domain(self, domain: ExpertDomain) -> Optional[Expert]:
        """Get best performing expert for a domain"""
        domain_experts = [e for e in self.experts.values()
                         if e.domain == domain and e.enabled]
        if not domain_experts:
            return None

        return max(domain_experts, key=lambda e: e.success_rate * e.priority)

    def rebalance_priorities(self):
        """Rebalance expert priorities based on performance"""
        for expert in self.experts.values():
            if expert.uses >= 10:
                # Adjust priority based on success rate
                if expert.success_rate > 0.8:
                    expert.priority = min(expert.priority + 1, 10)
                elif expert.success_rate < 0.4:
                    expert.priority = max(expert.priority - 1, 1)

    def get_statistics(self) -> Dict[str, Any]:
        """Get router statistics"""
        return {
            "total_experts": len(self.experts),
            "enabled_experts": sum(1 for e in self.experts.values() if e.enabled),
            "total_routings": len(self.routing_history),
            "domains_covered": len(set(e.domain for e in self.experts.values())),
            "avg_confidence": sum(h["confidence"] for h in self.routing_history[-100:]) /
                             max(len(self.routing_history[-100:]), 1)
        }


# Singleton
_expert_router: Optional[ExpertRouter] = None


def get_expert_router() -> ExpertRouter:
    """Get the Expert Router singleton"""
    global _expert_router
    if _expert_router is None:
        _expert_router = ExpertRouter()
    return _expert_router
