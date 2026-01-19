"""
HEISENBERG CONSOLIDATION
========================
At the end of each message loop, consolidate and persist learnings.
"""

import time

import numpy as np

from python.helpers.extension import Extension
from python.helpers.heisenberg_core import get_heisenberg_core


class HeisenbergConsolidation(Extension):
    """Consolidate Heisenberg state at message loop end"""

    async def execute(self, loop_data, **kwargs):
        heisenberg = self.agent.get_data("heisenberg_core")
        if not heisenberg:
            return

        # 1. Apply decoherence to quantum states
        # Natural loss of quantum properties over time
        for branch in heisenberg.quantum.branches.values():
            if branch.state.value == "superposition":
                # Small amplitude decay
                branch.amplitude *= 0.99

        # Renormalize
        heisenberg.quantum._normalize_amplitudes()

        # 2. Update integration state
        heisenberg.integration_state['active_branches'] = len(heisenberg.quantum.branches)
        heisenberg.integration_state['memory_points'] = len(heisenberg.topology.points)
        heisenberg.integration_state['creative_seeds'] = len(heisenberg.chaos.creative_seeds)
        heisenberg.integration_state['strategic_analyses'] = len(heisenberg.game_theory.strategic_history)

        # 3. Evaporate swarm pheromones
        swarm = self.agent.get_data("swarm_intelligence")
        if swarm:
            swarm.pheromone_field.evaporate()
            swarm.pheromone_field.diffuse()

        # 4. Track iteration metrics
        iteration_metrics = {
            'timestamp': time.time(),
            'iteration': loop_data.iteration if hasattr(loop_data, 'iteration') else 0,
            'quantum_coherence': np.mean([
                abs(b.amplitude) for b in heisenberg.quantum.branches.values()
            ]) if heisenberg.quantum.branches else 0,
            'memory_betti': heisenberg.topology.betti_numbers,
            'chaos_state': heisenberg.chaos.lorenz.state.tolist(),
            'performance': heisenberg.performance.copy()
        }

        metrics_history = self.agent.get_data("iteration_metrics_history") or []
        metrics_history.append(iteration_metrics)
        self.agent.set_data("iteration_metrics_history", metrics_history[-100:])

        # 5. Check for pattern emergence
        if len(metrics_history) >= 10:
            # Calculate trend in quantum coherence
            coherences = [m.get('quantum_coherence', 0.5) for m in metrics_history[-10:]]
            coherence_trend = np.polyfit(range(10), coherences, 1)[0]

            if coherence_trend < -0.01:
                # Coherence declining - may need to create new superposition
                self.agent.set_data("needs_new_superposition", True)

        # 6. Garbage collection for old data
        learning_history = self.agent.get_data("heisenberg_learning_history") or []
        if len(learning_history) > 100:
            self.agent.set_data("heisenberg_learning_history", learning_history[-50:])
