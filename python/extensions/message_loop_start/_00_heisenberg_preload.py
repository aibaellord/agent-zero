"""
HEISENBERG PRELOAD
==================
At the start of each message loop iteration, preload relevant context.
Uses swarm intelligence to find relevant prior knowledge.
"""

import numpy as np

from python.helpers.extension import Extension
from python.helpers.heisenberg_core import get_heisenberg_core
from python.helpers.swarm_intelligence import get_swarm_intelligence


class HeisenbergPreload(Extension):
    """Preload Heisenberg-enhanced context at loop start"""

    async def execute(self, loop_data, **kwargs):
        heisenberg = self.agent.get_data("heisenberg_core")
        swarm = self.agent.get_data("swarm_intelligence")

        if not heisenberg:
            return

        # 1. Check swarm pheromone field for relevant trails
        if swarm:
            # Use current iteration as position seed
            iteration = loop_data.iteration if hasattr(loop_data, 'iteration') else 0
            np.random.seed(iteration)
            query_position = np.random.randn(128)

            # Sense nearby pheromones
            sensed = swarm.pheromone_field.sense(query_position, radius=1.0)

            if sensed:
                # Store strongest signals for context
                strongest = sorted(sensed, key=lambda x: x['strength'], reverse=True)[:3]
                self.agent.set_data("swarm_signals", strongest)

        # 2. Get topological neighbors for context
        topo_sig = heisenberg.topology.get_topological_signature()

        if topo_sig['n_points'] > 0:
            # Query with current context embedding
            np.random.seed(hash(str(loop_data)) % 10000 if loop_data else 42)
            query_embedding = np.random.randn(128)

            neighbors = heisenberg.topology.find_topological_neighbors(
                query_embedding, n_neighbors=3
            )

            self.agent.set_data("topological_neighbors", neighbors)

        # 3. Get quantum interference patterns
        interference = heisenberg.quantum.calculate_interference()

        # Find constructively interfering branches
        constructive = {bid: score for bid, score in interference.items() if score > 0}
        if constructive:
            top_constructive = sorted(constructive.items(),
                                      key=lambda x: x[1], reverse=True)[:3]
            self.agent.set_data("constructive_interference", top_constructive)

        # 4. Check for suggested mutations
        mutation = self.agent.get_data("suggested_behavior_mutation")
        if mutation:
            # Clear after use
            self.agent.set_data("suggested_behavior_mutation", None)
            self.agent.set_data("active_behavior_mutation", mutation)

        # 5. Preload chaos-creative seeds
        chaos_engine = self.agent.get_data("chaos_engine")
        if chaos_engine and len(chaos_engine.creative_seeds) > 0:
            # Get recent creative seeds
            recent_seeds = chaos_engine.creative_seeds[-5:]
            self.agent.set_data("creative_seeds_available", len(recent_seeds))

        # 6. Check convergence of recent reasoning
        crystal_history = self.agent.get_data("crystallization_history") or []
        if len(crystal_history) >= 3:
            recent_efficiency = [c.get('info_efficiency', 0.5) for c in crystal_history[-3:]]
            avg_efficiency = np.mean(recent_efficiency)

            # If efficiency is dropping, increase exploration
            if avg_efficiency < 0.4:
                meta_params = self.agent.get_data("heisenberg_meta_params") or {}
                meta_params['exploration_rate'] = min(0.7, meta_params.get('exploration_rate', 0.3) + 0.1)
                meta_params['exploitation_rate'] = 1 - meta_params['exploration_rate']
                self.agent.set_data("heisenberg_meta_params", meta_params)
