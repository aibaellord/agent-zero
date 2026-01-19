"""
Strategic Reasoning Engine Tool
=================================
Applies multiple reasoning frameworks simultaneously.
Combines analytical, creative, critical, and systems thinking.
"""
from typing import Any

from python.helpers.tool import Response, Tool


class StrategicReasoningEngine(Tool):
    """
    Multi-framework reasoning engine.
    Applies 6 distinct reasoning frameworks to any problem.
    """

    FRAMEWORKS = {
        "analytical": {
            "name": "Analytical Reasoning",
            "icon": "🔬",
            "steps": [
                "Break down into components",
                "Identify relationships and dependencies",
                "Quantify where possible",
                "Apply logical rules",
                "Synthesize conclusions",
            ],
            "questions": [
                "What are the key components?",
                "What are the relationships between components?",
                "What data supports each conclusion?",
                "What logical rules apply?",
            ],
        },
        "creative": {
            "name": "Creative Reasoning",
            "icon": "🎨",
            "steps": [
                "Challenge assumptions",
                "Generate multiple alternatives",
                "Combine ideas unexpectedly",
                "Think from different perspectives",
                "Embrace unconventional solutions",
            ],
            "questions": [
                "What assumptions are we making?",
                "What if we did the opposite?",
                "How would an expert in another field approach this?",
                "What's the most unusual solution possible?",
            ],
        },
        "critical": {
            "name": "Critical Reasoning",
            "icon": "⚖️",
            "steps": [
                "Evaluate evidence quality",
                "Identify biases and fallacies",
                "Consider counterarguments",
                "Assess reliability of sources",
                "Form balanced conclusions",
            ],
            "questions": [
                "What evidence supports this?",
                "What are the potential biases?",
                "What would opponents argue?",
                "How reliable is each source?",
            ],
        },
        "systems": {
            "name": "Systems Thinking",
            "icon": "🔄",
            "steps": [
                "Identify system boundaries",
                "Map feedback loops",
                "Find leverage points",
                "Consider unintended consequences",
                "Design for emergence",
            ],
            "questions": [
                "What are the system boundaries?",
                "What feedback loops exist?",
                "Where are the highest-leverage interventions?",
                "What unintended consequences might occur?",
            ],
        },
        "first_principles": {
            "name": "First Principles",
            "icon": "🎯",
            "steps": [
                "Identify fundamental truths",
                "Strip away assumptions",
                "Rebuild from basics",
                "Question everything",
                "Create from ground up",
            ],
            "questions": [
                "What do we know to be absolutely true?",
                "What are we assuming that might not be true?",
                "If we started from scratch, what would we build?",
                "What is the simplest possible solution?",
            ],
        },
        "probabilistic": {
            "name": "Probabilistic Reasoning",
            "icon": "🎲",
            "steps": [
                "Identify possible outcomes",
                "Estimate probabilities",
                "Consider expected values",
                "Plan for uncertainty",
                "Make robust decisions",
            ],
            "questions": [
                "What are all possible outcomes?",
                "What is the probability of each?",
                "What is the expected value of each option?",
                "How can we hedge against uncertainty?",
            ],
        },
    }

    async def execute(self, **kwargs) -> Response:
        """Execute strategic reasoning."""

        method = self.args.get("method", "analyze")

        if method == "analyze":
            return await self._analyze(self.args.get("problem", ""))
        elif method == "framework":
            return await self._apply_framework(
                self.args.get("framework", "analytical"),
                self.args.get("problem", "")
            )
        elif method == "compare":
            return await self._compare_frameworks(self.args.get("problem", ""))
        elif method == "list":
            return await self._list_frameworks()
        else:
            return Response(
                message=f"Unknown method: {method}. Use: analyze, framework, compare, list",
                break_loop=False
            )

    async def _analyze(self, problem: str) -> Response:
        """Apply multi-framework analysis to a problem."""

        if not problem:
            return Response(
                message="Please provide a problem to analyze.",
                break_loop=False
            )

        formatted = [f"# Strategic Analysis: {problem[:100]}...\n"]

        # Apply each framework
        for framework_id, framework in self.FRAMEWORKS.items():
            formatted.append(f"## {framework['icon']} {framework['name']}")

            # Apply framework questions
            insights = self._apply_framework_logic(framework, problem)
            for insight in insights:
                formatted.append(f"  • {insight}")
            formatted.append("")

        # Synthesis
        formatted.append("## 🔗 Synthesis")
        formatted.append("Combining insights from all frameworks:")
        formatted.append("  • Cross-validate conclusions across frameworks")
        formatted.append("  • Identify areas of agreement and conflict")
        formatted.append("  • Generate robust, multi-perspective solution")

        return Response(
            message="\n".join(formatted),
            break_loop=False
        )

    async def _apply_framework(self, framework_id: str, problem: str) -> Response:
        """Apply a specific framework to a problem."""

        framework = self.FRAMEWORKS.get(framework_id)

        if not framework:
            available = ", ".join(self.FRAMEWORKS.keys())
            return Response(
                message=f"Unknown framework: {framework_id}. Available: {available}",
                break_loop=False
            )

        if not problem:
            return Response(
                message="Please provide a problem to analyze.",
                break_loop=False
            )

        formatted = [f"# {framework['icon']} {framework['name']} Analysis\n"]
        formatted.append(f"**Problem:** {problem}\n")

        # Steps
        formatted.append("## Steps:")
        for i, step in enumerate(framework["steps"], 1):
            formatted.append(f"  {i}. {step}")

        # Questions
        formatted.append("\n## Key Questions:")
        for question in framework["questions"]:
            formatted.append(f"  ❓ {question}")

        # Applied insights
        formatted.append("\n## Applied Insights:")
        insights = self._apply_framework_logic(framework, problem)
        for insight in insights:
            formatted.append(f"  💡 {insight}")

        return Response(
            message="\n".join(formatted),
            break_loop=False
        )

    async def _compare_frameworks(self, problem: str) -> Response:
        """Compare how different frameworks approach a problem."""

        if not problem:
            return Response(
                message="Please provide a problem to compare frameworks.",
                break_loop=False
            )

        formatted = [f"# Framework Comparison\n**Problem:** {problem}\n"]

        # Create comparison table
        formatted.append("| Framework | Focus | Key Insight |")
        formatted.append("|-----------|-------|-------------|")

        for framework_id, framework in self.FRAMEWORKS.items():
            focus = framework["steps"][0]
            insight = self._apply_framework_logic(framework, problem)[0]
            formatted.append(f"| {framework['icon']} {framework['name'][:15]} | {focus[:20]} | {insight[:30]}... |")

        formatted.append("\n## Recommendation:")
        formatted.append("Use multiple frameworks for complex problems.")
        formatted.append("Combine insights for robust solutions.")

        return Response(
            message="\n".join(formatted),
            break_loop=False
        )

    async def _list_frameworks(self) -> Response:
        """List all available reasoning frameworks."""

        formatted = ["# Available Reasoning Frameworks\n"]

        for framework_id, framework in self.FRAMEWORKS.items():
            formatted.append(f"## {framework['icon']} {framework['name']}")
            formatted.append(f"**ID:** `{framework_id}`\n")
            formatted.append("**Steps:**")
            for step in framework["steps"]:
                formatted.append(f"  • {step}")
            formatted.append("")

        formatted.append("---")
        formatted.append("Use `method: 'framework', framework: '<id>'` to apply a specific framework.")

        return Response(
            message="\n".join(formatted),
            break_loop=False
        )

    def _apply_framework_logic(self, framework: dict, problem: str) -> list[str]:
        """Apply framework logic to generate insights."""

        insights = []
        problem_lower = problem.lower()

        framework_name = framework["name"]

        if "Analytical" in framework_name:
            insights.append(f"Decompose '{problem[:30]}...' into measurable components")
            insights.append("Identify cause-effect relationships")
            insights.append("Apply logical deduction to each component")

        elif "Creative" in framework_name:
            insights.append("Challenge the framing of the problem itself")
            insights.append("Consider how unrelated domains solve similar issues")
            insights.append("Generate at least 5 alternative approaches")

        elif "Critical" in framework_name:
            insights.append("Evaluate the evidence supporting current assumptions")
            insights.append("Identify potential biases in problem definition")
            insights.append("Consider what opponents would argue")

        elif "Systems" in framework_name:
            insights.append("Map the system boundaries and stakeholders")
            insights.append("Identify feedback loops that maintain the problem")
            insights.append("Find leverage points for maximum impact")

        elif "First Principles" in framework_name:
            insights.append("Strip problem to fundamental truths")
            insights.append("Question every assumption")
            insights.append("Rebuild solution from basic principles")

        elif "Probabilistic" in framework_name:
            insights.append("Enumerate all possible outcomes")
            insights.append("Estimate probability distribution")
            insights.append("Calculate expected value of each option")

        return insights
