"""
HIST ADD BEFORE EXTENSION - Heisenberg
=======================================
Intercept history additions to enrich with metadata.
"""

from typing import Any

from python.helpers.extension import Extension


class HeisenbergHistAddBefore(Extension):
    """
    Enrich messages with Heisenberg metadata before adding to history.
    """

    async def execute(self, **kwargs) -> Any:
        message = kwargs.get('message', {})

        if not hasattr(self.agent, '_heisenberg'):
            return message

        try:
            heisenberg = self.agent._heisenberg

            # Add quantum state hash
            if hasattr(heisenberg, 'quantum') and heisenberg.quantum.branches:
                top_branches = heisenberg.quantum.get_top_branches(3)
                message['_heisenberg_quantum'] = {
                    'branch_count': len(heisenberg.quantum.branches),
                    'top_hypotheses': [b.hypothesis[:50] for b in top_branches],
                    'top_probabilities': [float(b.probability) for b in top_branches]
                }

            # Add topology signature
            if hasattr(heisenberg, 'topology'):
                sig = heisenberg.topology.get_topological_signature()
                message['_heisenberg_topology'] = {
                    'betti': sig['betti_numbers'],
                    'points': sig['n_points']
                }

            # Add chaos state
            if hasattr(heisenberg, 'chaos'):
                message['_heisenberg_chaos'] = heisenberg.chaos.lorenz.state.tolist()

        except Exception:
            pass  # Don't break history on enrichment errors

        return message
