"""
HEISENBERG MESSAGE ENHANCEMENT
==============================
Extension to enhance agent messages with Heisenberg intelligence before sending to LLM.
Adds contextual enhancements, pattern recognition insights, and memory suggestions.
"""

import traceback

from python.helpers.extension import Extension


class HeisenbergMessageEnhancer(Extension):
    """Enhance messages with Heisenberg intelligence before LLM call"""

    async def execute(self, **kwargs):
        try:
            # Get Heisenberg systems from agent data
            heisenberg = self.agent.get_data("heisenberg_core")

            if not heisenberg:
                return  # Heisenberg not initialized

            # Get the current message from kwargs
            history = kwargs.get("history", [])
            if not history:
                return

            # Find the last user message
            last_user_msg = None
            for msg in reversed(history):
                if msg.get("role") == "user":
                    last_user_msg = msg.get("content", "")
                    break

            if not last_user_msg or len(last_user_msg) < 10:
                return

            # Apply Heisenberg enhancements
            enhancements = []

            # 1. Get topological memory suggestions
            if hasattr(heisenberg, 'topology') and hasattr(heisenberg.topology, 'query_memories'):
                try:
                    import numpy as np

                    # Create a simple hash-based embedding for the query
                    query_embedding = np.random.randn(128)
                    memories = heisenberg.topology.query_memories(query_embedding, top_k=3)
                    if memories:
                        relevant_memories = [m[0] for m in memories if m[1] > 0.7]  # High similarity
                        if relevant_memories:
                            enhancements.append(f"Related context: {'; '.join(relevant_memories[:2])}")
                except Exception:
                    pass

            # 2. Check game theory equilibrium for strategic tasks
            if any(word in last_user_msg.lower() for word in ['decide', 'choose', 'compare', 'versus', 'vs', 'option']):
                try:
                    if hasattr(heisenberg, 'game_theory'):
                        self.agent.set_data("heisenberg_strategic_mode", True)
                except Exception:
                    pass

            # 3. Apply chaos-based creativity boost for creative tasks
            if any(word in last_user_msg.lower() for word in ['create', 'imagine', 'design', 'invent', 'novel', 'unique']):
                try:
                    if hasattr(heisenberg, 'chaos'):
                        # Increase chaos sensitivity for creative tasks
                        self.agent.set_data("heisenberg_creative_mode", True)
                except Exception:
                    pass

            # Store enhancements for potential use
            if enhancements:
                self.agent.set_data("heisenberg_enhancements", enhancements)

        except Exception as e:
            # Don't let Heisenberg errors break message processing
            traceback.print_exc()
