"""
Cross-Dimensional Synthesis Extension
=======================================
Synthesizes knowledge across 7 conceptual dimensions for holistic understanding.
Exploits system_prompt to inject multi-dimensional awareness.
"""
from typing import Any

from python.helpers.extension import Extension


class CrossDimensionalSynthesis(Extension):
    """
    Operates across 7 dimensions of knowledge:
    1. Temporal - Past patterns and future projections
    2. Semantic - Meaning and context relationships
    3. Structural - Hierarchical organization
    4. Causal - Cause-effect chains
    5. Analogical - Cross-domain pattern matching
    6. Procedural - Step-by-step processes
    7. Meta-cognitive - Thinking about thinking
    """

    DIMENSIONS = {
        "temporal": {
            "prompt_injection": """
## Temporal Dimension Awareness
- Recall relevant past solutions and their outcomes
- Project potential future implications of current actions
- Identify temporal patterns in user requests
- Consider time-sensitive aspects of the task""",
            "weight": 0.9,
        },
        "semantic": {
            "prompt_injection": """
## Semantic Dimension Awareness
- Understand deep meaning beyond literal interpretation
- Map semantic relationships between concepts
- Identify synonyms, antonyms, and related concepts
- Consider cultural and contextual nuances""",
            "weight": 0.95,
        },
        "structural": {
            "prompt_injection": """
## Structural Dimension Awareness
- Organize information hierarchically
- Identify component-whole relationships
- Map dependencies and connections
- Build modular, maintainable solutions""",
            "weight": 0.85,
        },
        "causal": {
            "prompt_injection": """
## Causal Dimension Awareness
- Trace cause-effect relationships
- Predict consequences of actions
- Identify root causes of problems
- Design solutions that address causes, not symptoms""",
            "weight": 0.9,
        },
        "analogical": {
            "prompt_injection": """
## Analogical Dimension Awareness
- Find patterns across different domains
- Apply solutions from similar problems
- Use metaphors and analogies for understanding
- Transfer learning from past experiences""",
            "weight": 0.8,
        },
        "procedural": {
            "prompt_injection": """
## Procedural Dimension Awareness
- Break complex tasks into clear steps
- Ensure logical sequence of operations
- Include verification and validation steps
- Plan for error handling and recovery""",
            "weight": 0.95,
        },
        "metacognitive": {
            "prompt_injection": """
## Meta-Cognitive Dimension Awareness
- Monitor own reasoning process
- Identify when approach isn't working
- Adjust strategy based on feedback
- Know what you don't know""",
            "weight": 0.85,
        },
    }

    async def execute(self, **kwargs) -> Any:
        """Inject cross-dimensional awareness into system prompt."""

        # Get the prompt parts list
        prompt_parts = kwargs.get("prompt_parts", [])

        if not isinstance(prompt_parts, list):
            return

        # Build dimensional injection
        dimensional_prompt = self._build_dimensional_prompt()

        # Inject after the main role definition
        insertion_index = self._find_insertion_point(prompt_parts)
        prompt_parts.insert(insertion_index, dimensional_prompt)

    def _build_dimensional_prompt(self) -> str:
        """Build the complete dimensional awareness prompt."""

        # Check agent's dimensional preferences
        active_dimensions = self._get_active_dimensions()

        prompt_parts = [
            "\n# Cross-Dimensional Synthesis Framework",
            "You operate across multiple dimensions of understanding simultaneously:",
        ]

        for dim_name in active_dimensions:
            dim_info = self.DIMENSIONS.get(dim_name, {})
            injection = dim_info.get("prompt_injection", "")
            if injection:
                prompt_parts.append(injection)

        prompt_parts.append("""
## Synthesis Protocol
When processing any request:
1. Activate relevant dimensional perspectives
2. Gather insights from each dimension
3. Synthesize insights into unified understanding
4. Generate solution that addresses all dimensions
5. Validate solution across dimensions
""")

        return "\n".join(prompt_parts)

    def _get_active_dimensions(self) -> list[str]:
        """Determine which dimensions should be active for this agent."""

        # Default to all dimensions above weight threshold
        threshold = 0.8

        active = [
            dim_name
            for dim_name, dim_info in self.DIMENSIONS.items()
            if dim_info.get("weight", 0) >= threshold
        ]

        # Check if agent has dimensional preferences
        if hasattr(self.agent, 'data') and self.agent.data:
            preferences = self.agent.data.get("dimensional_preferences", [])
            if preferences:
                active = [d for d in preferences if d in self.DIMENSIONS]

        return active

    def _find_insertion_point(self, prompt_parts: list) -> int:
        """Find the best insertion point for dimensional prompt."""

        # Look for the end of role definition
        for i, part in enumerate(prompt_parts):
            if isinstance(part, str):
                if "## Your role" in part.lower() or "# your role" in part.lower():
                    return i + 1

        # Default to beginning if no role section found
        return min(1, len(prompt_parts))
