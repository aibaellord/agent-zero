"""
HEISENBERG CRYSTALLIZATION
===========================
At the end of each monologue, crystallize learnings.
Collapses quantum states, updates topological structure, evolves prompts.
"""

import time

import numpy as np

from python.helpers.extension import Extension
from python.helpers.heisenberg_core import get_heisenberg_core


class HeisenbergCrystallization(Extension):
    """Crystallize learnings at monologue end"""

    async def execute(self, msg, **kwargs):
        heisenberg = self.agent.get_data("heisenberg_core")
        if not heisenberg:
            return

        # 1. Evaluate monologue quality
        monologue_text = msg.content if hasattr(msg, 'content') else str(msg)

        # Information-theoretic analysis
        info_analysis = heisenberg.information.optimize_message(monologue_text)

        # 2. Conditionally collapse quantum state if high confidence
        top_branches = heisenberg.quantum.get_top_branches(1)
        if top_branches and top_branches[0].probability > 0.7:
            # High confidence - collapse to best hypothesis
            collapsed = heisenberg.quantum.measure_and_collapse()

            self.agent.set_data("collapsed_hypothesis", collapsed.hypothesis)

            # Create new superposition from collapsed state
            new_hypotheses = [
                f"Build on: {collapsed.hypothesis}",
                f"Extend: {collapsed.hypothesis}",
                f"Apply: {collapsed.hypothesis}",
                f"Generalize: {collapsed.hypothesis}"
            ]

            heisenberg.quantum.create_superposition(new_hypotheses)

        # 3. Update topological memory with monologue
        # Create embedding
        mono_hash = int(hash(monologue_text) % 10000)
        np.random.seed(abs(mono_hash))
        mono_embedding = np.random.randn(128)

        heisenberg.topology.add_memory(
            mono_embedding,
            f"Monologue:{monologue_text[:50]}..."
        )

        # 4. Compute persistent homology if enough points
        if len(heisenberg.topology.points) > 10 and len(heisenberg.topology.points) % 10 == 0:
            filtration = np.linspace(0.1, 2.0, 10)
            persistence = heisenberg.topology.compute_persistent_homology(filtration.tolist())

            self.agent.set_data("memory_persistence", persistence)

        # 5. Evolve prompts if evolution engine has population
        if heisenberg.self_modifier.prompt_evolution.population:
            # Simple fitness based on information efficiency
            def fitness_fn(prompt: str) -> float:
                analysis = heisenberg.information.optimize_message(prompt)
                # Prefer low redundancy, high entropy
                return (1 - analysis.get('redundancy', 0.5)) * analysis.get('entropy_per_char', 1.0)

            heisenberg.self_modifier.prompt_evolution.evaluate_fitness(fitness_fn)
            heisenberg.self_modifier.prompt_evolution.evolve()

        # 6. Update chaos attractor with monologue influence
        chaos_engine = self.agent.get_data("chaos_engine")
        if chaos_engine:
            # Use monologue characteristics to perturb chaos
            perturbation = np.array([
                info_analysis.get('entropy_per_char', 1.0),
                info_analysis.get('kolmogorov_estimate', 0.5),
                len(monologue_text) / 1000
            ]) * 0.01

            chaos_engine.lorenz.state += perturbation

        # 7. Crystallization summary
        crystallization = {
            'timestamp': time.time(),
            'monologue_length': len(monologue_text),
            'info_efficiency': 1 - info_analysis.get('redundancy', 0.5),
            'quantum_branches': len(heisenberg.quantum.branches),
            'memory_topology': heisenberg.topology.get_topological_signature(),
            'evolution_generation': heisenberg.self_modifier.prompt_evolution.generation
        }

        history = self.agent.get_data("crystallization_history") or []
        history.append(crystallization)
        self.agent.set_data("crystallization_history", history[-50:])
