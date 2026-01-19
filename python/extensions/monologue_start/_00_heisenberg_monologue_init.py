"""
MONOLOGUE START EXTENSION - Heisenberg
======================================
Prepare cognitive state at start of internal monologue.
"""

from typing import Any

from python.helpers.extension import Extension


class HeisenbergMonologueStart(Extension):
    """
    Initialize cognitive state for monologue reasoning.
    """

    async def execute(self, **kwargs) -> Any:
        if not hasattr(self.agent, '_heisenberg'):
            return

        try:
            heisenberg = self.agent._heisenberg

            # Reset monologue-specific state
            self.agent._heisenberg_monologue = {
                'started_branches': len(heisenberg.quantum.branches),
                'chaos_state': heisenberg.chaos.lorenz.state.copy(),
                'token_count': 0
            }

            # Create initial superposition if empty
            if len(heisenberg.quantum.branches) == 0:
                heisenberg.quantum.create_superposition([
                    "Approach via analysis",
                    "Approach via synthesis",
                    "Approach via analogy",
                    "Approach via first principles"
                ])

            # Boost exploration at monologue start
            heisenberg.self_modifier.meta_parameters['exploration_rate'] = min(
                0.5,
                heisenberg.self_modifier.meta_parameters['exploration_rate'] + 0.05
            )

        except Exception:
            pass
