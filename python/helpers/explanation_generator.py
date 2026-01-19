"""
EXPLANATION GENERATOR
=====================
Generates human-readable explanations of agent reasoning.

Features:
- Step-by-step explanations
- Multiple detail levels
- Visual representations
- Confidence annotations
- Decision trees
"""

from __future__ import annotations

import time
from dataclasses import dataclass, field
from enum import Enum, auto
from typing import Any, Dict, List, Optional, Tuple


class DetailLevel(Enum):
    """Explanation detail levels"""
    BRIEF = "brief"          # One sentence
    SUMMARY = "summary"      # Key points
    DETAILED = "detailed"    # Full explanation
    TECHNICAL = "technical"  # With technical details
    DEBUG = "debug"          # Everything


class ExplanationType(Enum):
    """Types of explanations"""
    REASONING = "reasoning"
    DECISION = "decision"
    PROCESS = "process"
    ERROR = "error"
    COMPARISON = "comparison"


@dataclass
class ExplanationStep:
    """A step in the explanation"""
    step_number: int
    description: str
    reasoning: str
    confidence: float
    evidence: List[str] = field(default_factory=list)
    alternatives: List[str] = field(default_factory=list)


@dataclass
class Explanation:
    """A complete explanation"""
    title: str
    explanation_type: ExplanationType
    detail_level: DetailLevel
    steps: List[ExplanationStep]
    summary: str
    conclusion: str
    confidence: float
    generated_at: float = field(default_factory=time.time)
    metadata: Dict[str, Any] = field(default_factory=dict)


class ReasoningTracer:
    """Traces reasoning steps for explanation"""

    def __init__(self):
        self.steps: List[Dict] = []
        self.current_context = {}

    def add_step(self, description: str, reasoning: str = "",
                 confidence: float = 1.0, evidence: List[str] = None):
        """Add a reasoning step"""
        self.steps.append({
            "step": len(self.steps) + 1,
            "description": description,
            "reasoning": reasoning,
            "confidence": confidence,
            "evidence": evidence or [],
            "timestamp": time.time()
        })

    def set_context(self, key: str, value: Any):
        """Set context for current explanation"""
        self.current_context[key] = value

    def get_steps(self) -> List[Dict]:
        """Get all steps"""
        return self.steps.copy()

    def clear(self):
        """Clear all steps"""
        self.steps = []
        self.current_context = {}


class DecisionTreeBuilder:
    """Builds decision tree representations"""

    def __init__(self):
        self.nodes: Dict[str, Dict] = {}
        self.edges: List[Tuple[str, str, str]] = []
        self.root: Optional[str] = None

    def add_node(self, node_id: str, label: str,
                 node_type: str = "decision",
                 data: Dict = None):
        """Add a node to the tree"""
        self.nodes[node_id] = {
            "id": node_id,
            "label": label,
            "type": node_type,
            "data": data or {}
        }
        if self.root is None:
            self.root = node_id

    def add_edge(self, from_id: str, to_id: str, label: str = ""):
        """Add an edge between nodes"""
        self.edges.append((from_id, to_id, label))

    def to_ascii(self, node_id: str = None, prefix: str = "",
                 is_last: bool = True) -> str:
        """Generate ASCII representation"""
        if node_id is None:
            node_id = self.root

        if node_id not in self.nodes:
            return ""

        node = self.nodes[node_id]
        connector = "└── " if is_last else "├── "
        result = prefix + connector + node["label"] + "\n"

        # Find children
        children = [(to_id, label) for (from_id, to_id, label) in self.edges
                    if from_id == node_id]

        for i, (child_id, edge_label) in enumerate(children):
            is_last_child = i == len(children) - 1
            new_prefix = prefix + ("    " if is_last else "│   ")
            if edge_label:
                result += new_prefix + f"[{edge_label}]\n"
            result += self.to_ascii(child_id, new_prefix, is_last_child)

        return result

    def to_dict(self) -> Dict:
        """Export as dictionary"""
        return {
            "nodes": self.nodes,
            "edges": [{"from": f, "to": t, "label": l} for f, t, l in self.edges],
            "root": self.root
        }


class ExplanationGenerator:
    """
    Generates human-readable explanations of agent reasoning.
    Makes AI decisions transparent and understandable.
    """

    def __init__(self):
        self.tracer = ReasoningTracer()
        self.explanations: List[Explanation] = []
        self.templates = self._load_templates()

    def _load_templates(self) -> Dict[str, str]:
        """Load explanation templates"""
        return {
            "reasoning_brief": "I {action} because {reason}.",
            "reasoning_summary": "To accomplish {goal}, I:\n{steps}\n\nThis approach was chosen because {rationale}.",
            "decision_brief": "I chose {choice} over {alternatives} because {reason}.",
            "error_brief": "The error occurred because {cause}. Suggested fix: {fix}.",
            "comparison": "Option A ({option_a}) vs Option B ({option_b}):\n{comparison}\n\nRecommendation: {recommendation}"
        }

    def trace_step(self, description: str, reasoning: str = "",
                   confidence: float = 1.0, evidence: List[str] = None):
        """Add a step to the current trace"""
        self.tracer.add_step(description, reasoning, confidence, evidence)

    def generate_reasoning_explanation(
        self,
        goal: str,
        detail_level: DetailLevel = DetailLevel.SUMMARY
    ) -> Explanation:
        """Generate explanation for reasoning process"""
        steps = self.tracer.get_steps()

        explanation_steps = [
            ExplanationStep(
                step_number=s["step"],
                description=s["description"],
                reasoning=s["reasoning"],
                confidence=s["confidence"],
                evidence=s["evidence"]
            )
            for s in steps
        ]

        # Generate summary based on detail level
        if detail_level == DetailLevel.BRIEF:
            summary = self._generate_brief_summary(steps)
        elif detail_level == DetailLevel.SUMMARY:
            summary = self._generate_summary(steps)
        else:
            summary = self._generate_detailed_summary(steps)

        # Calculate overall confidence
        if steps:
            overall_confidence = sum(s["confidence"] for s in steps) / len(steps)
        else:
            overall_confidence = 0.5

        explanation = Explanation(
            title=f"Reasoning for: {goal}",
            explanation_type=ExplanationType.REASONING,
            detail_level=detail_level,
            steps=explanation_steps,
            summary=summary,
            conclusion=f"Completed with {overall_confidence:.0%} confidence.",
            confidence=overall_confidence
        )

        self.explanations.append(explanation)
        return explanation

    def _generate_brief_summary(self, steps: List[Dict]) -> str:
        """Generate brief one-line summary"""
        if not steps:
            return "No reasoning steps recorded."
        return f"Performed {len(steps)} steps to reach conclusion."

    def _generate_summary(self, steps: List[Dict]) -> str:
        """Generate summary with key points"""
        if not steps:
            return "No reasoning steps recorded."

        lines = [f"Process completed in {len(steps)} steps:"]
        for s in steps[:5]:
            lines.append(f"  {s['step']}. {s['description']}")

        if len(steps) > 5:
            lines.append(f"  ... and {len(steps) - 5} more steps")

        return "\n".join(lines)

    def _generate_detailed_summary(self, steps: List[Dict]) -> str:
        """Generate detailed summary"""
        if not steps:
            return "No reasoning steps recorded."

        lines = [f"Detailed reasoning process ({len(steps)} steps):"]
        for s in steps:
            lines.append(f"\n**Step {s['step']}**: {s['description']}")
            if s['reasoning']:
                lines.append(f"  Reasoning: {s['reasoning']}")
            if s['evidence']:
                lines.append(f"  Evidence: {', '.join(s['evidence'])}")
            lines.append(f"  Confidence: {s['confidence']:.0%}")

        return "\n".join(lines)

    def explain_decision(
        self,
        choice: str,
        alternatives: List[str],
        reason: str,
        detail_level: DetailLevel = DetailLevel.SUMMARY
    ) -> Explanation:
        """Generate explanation for a decision"""
        alt_text = ", ".join(alternatives) if alternatives else "other options"

        if detail_level == DetailLevel.BRIEF:
            summary = f"Chose {choice} because {reason}"
        else:
            summary = f"**Decision**: {choice}\n\n"
            summary += f"**Alternatives considered**: {alt_text}\n\n"
            summary += f"**Rationale**: {reason}"

        explanation = Explanation(
            title=f"Decision: {choice}",
            explanation_type=ExplanationType.DECISION,
            detail_level=detail_level,
            steps=[ExplanationStep(
                step_number=1,
                description=f"Selected {choice}",
                reasoning=reason,
                confidence=0.8,
                alternatives=alternatives
            )],
            summary=summary,
            conclusion=f"Final decision: {choice}",
            confidence=0.8
        )

        self.explanations.append(explanation)
        return explanation

    def explain_comparison(
        self,
        options: List[Dict[str, Any]],
        criteria: List[str],
        recommendation: str
    ) -> str:
        """Generate comparison explanation"""
        lines = ["**Comparison Analysis**\n"]

        # Header
        header = "| Criteria | " + " | ".join(o.get("name", f"Option {i+1}")
                                               for i, o in enumerate(options)) + " |"
        separator = "|" + "---|" * (len(options) + 1)
        lines.append(header)
        lines.append(separator)

        # Rows
        for criterion in criteria:
            row = f"| {criterion} |"
            for opt in options:
                value = opt.get(criterion, "N/A")
                row += f" {value} |"
            lines.append(row)

        lines.append(f"\n**Recommendation**: {recommendation}")

        return "\n".join(lines)

    def explain_error(
        self,
        error: str,
        cause: str,
        fix: str,
        context: Dict = None
    ) -> Explanation:
        """Generate error explanation"""
        summary = f"**Error**: {error}\n\n"
        summary += f"**Cause**: {cause}\n\n"
        summary += f"**Suggested Fix**: {fix}"

        if context:
            summary += "\n\n**Context**:\n"
            for key, value in context.items():
                summary += f"  - {key}: {value}\n"

        explanation = Explanation(
            title=f"Error: {error[:50]}...",
            explanation_type=ExplanationType.ERROR,
            detail_level=DetailLevel.DETAILED,
            steps=[ExplanationStep(
                step_number=1,
                description="Error analysis",
                reasoning=cause,
                confidence=0.7,
                evidence=[fix]
            )],
            summary=summary,
            conclusion=f"Apply fix: {fix}",
            confidence=0.7,
            metadata=context or {}
        )

        self.explanations.append(explanation)
        return explanation

    def build_decision_tree(
        self,
        decisions: List[Dict]
    ) -> str:
        """Build and return ASCII decision tree"""
        builder = DecisionTreeBuilder()

        for i, decision in enumerate(decisions):
            node_id = f"node_{i}"
            builder.add_node(
                node_id,
                decision.get("question", f"Decision {i+1}"),
                "decision"
            )

            if i > 0:
                builder.add_edge(f"node_{i-1}", node_id,
                               decision.get("condition", ""))

        return builder.to_ascii()

    def format_explanation(
        self,
        explanation: Explanation,
        format_type: str = "markdown"
    ) -> str:
        """Format explanation for output"""
        if format_type == "markdown":
            return self._format_markdown(explanation)
        elif format_type == "plain":
            return self._format_plain(explanation)
        else:
            return str(explanation)

    def _format_markdown(self, exp: Explanation) -> str:
        """Format as markdown"""
        lines = [f"# {exp.title}\n"]
        lines.append(f"*Confidence: {exp.confidence:.0%}*\n")
        lines.append(exp.summary)
        lines.append(f"\n**Conclusion**: {exp.conclusion}")
        return "\n".join(lines)

    def _format_plain(self, exp: Explanation) -> str:
        """Format as plain text"""
        lines = [exp.title, "=" * len(exp.title), ""]
        lines.append(exp.summary)
        lines.append(f"\nConclusion: {exp.conclusion}")
        return "\n".join(lines)

    def clear_trace(self):
        """Clear current trace"""
        self.tracer.clear()

    def get_recent_explanations(self, count: int = 5) -> List[Explanation]:
        """Get recent explanations"""
        return self.explanations[-count:]

    def get_statistics(self) -> Dict[str, Any]:
        """Get explanation statistics"""
        if not self.explanations:
            return {"total_explanations": 0}

        return {
            "total_explanations": len(self.explanations),
            "by_type": {t.value: sum(1 for e in self.explanations
                                     if e.explanation_type == t)
                       for t in ExplanationType},
            "avg_confidence": sum(e.confidence for e in self.explanations) /
                            len(self.explanations),
            "total_steps_traced": sum(len(e.steps) for e in self.explanations)
        }


# Singleton
_explanation_generator: Optional[ExplanationGenerator] = None


def get_explanation_generator() -> ExplanationGenerator:
    """Get the Explanation Generator singleton"""
    global _explanation_generator
    if _explanation_generator is None:
        _explanation_generator = ExplanationGenerator()
    return _explanation_generator
