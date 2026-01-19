"""
HEISENBERG LEARNING EXTENSION
=============================
Extension that runs after message loop to learn from interactions.
Updates memory topology, adjusts self-modification parameters, and records patterns.
"""

import traceback

import numpy as np

from python.helpers.extension import Extension


class HeisenbergLearner(Extension):
    """Learn from completed message loops to improve future performance"""

    async def execute(self, **kwargs):
        try:
            # Get Heisenberg systems
            heisenberg = self.agent.get_data("heisenberg_core")

            if not heisenberg:
                return

            # Get message loop context
            history = kwargs.get("history", [])
            result = kwargs.get("result", {})

            # Analyze the interaction for learning
            await self._update_memory_topology(heisenberg, history)
            await self._analyze_patterns(heisenberg, history)
            await self._adjust_meta_parameters(heisenberg, result)

            # Clear temporary Heisenberg flags
            self.agent.set_data("heisenberg_strategic_mode", False)
            self.agent.set_data("heisenberg_creative_mode", False)
            self.agent.set_data("heisenberg_enhancements", None)

        except Exception as e:
            traceback.print_exc()

    async def _update_memory_topology(self, heisenberg, history):
        """Add successful interaction patterns to topological memory"""
        if not hasattr(heisenberg, 'topology'):
            return

        try:
            # Extract key phrases from successful interactions
            interaction_summary = []
            for msg in history[-5:]:  # Last 5 messages
                content = msg.get("content", "")
                if isinstance(content, str) and len(content) > 20:
                    # Take first 100 chars as summary
                    interaction_summary.append(content[:100])

            if interaction_summary:
                # Create embedding for this interaction pattern
                summary_text = " | ".join(interaction_summary)
                embedding = np.random.randn(128)  # Would use actual embedding model

                # Add to topological memory
                heisenberg.topology.add_memory(
                    embedding,
                    f"Interaction: {summary_text[:200]}"
                )
        except Exception:
            pass

    async def _analyze_patterns(self, heisenberg, history):
        """Analyze patterns in the interaction for future reference"""
        if not hasattr(heisenberg, 'category'):
            return

        try:
            # Track tool usage patterns
            tool_sequence = []
            for msg in history:
                if msg.get("role") == "assistant":
                    content = msg.get("content", "")
                    if isinstance(content, str) and "tool_name" in content:
                        # Extract tool name pattern
                        tool_sequence.append("tool_used")

            # Record the pattern if substantial
            if len(tool_sequence) >= 2:
                self.agent.set_data("last_tool_pattern", tool_sequence)

        except Exception:
            pass

    async def _adjust_meta_parameters(self, heisenberg, result):
        """Adjust Heisenberg meta-parameters based on result quality"""
        if not hasattr(heisenberg, 'self_modifier'):
            return

        try:
            # Determine if interaction was successful
            success = result.get("success", True) if isinstance(result, dict) else True

            if success:
                # Slightly reduce exploration, increase exploitation
                heisenberg.self_modifier.meta_parameters["exploration_rate"] *= 0.99
                heisenberg.self_modifier.meta_parameters["mutation_strength"] *= 0.99
            else:
                # Increase exploration on failure
                heisenberg.self_modifier.meta_parameters["exploration_rate"] = min(
                    0.5,
                    heisenberg.self_modifier.meta_parameters["exploration_rate"] * 1.05
                )

        except Exception:
            pass
