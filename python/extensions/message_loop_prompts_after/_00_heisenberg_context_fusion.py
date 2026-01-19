"""
HEISENBERG CONTEXT FUSION
=========================
After prompts are built, inject quantum-enhanced context.
Fuses memory recall with topological relevance and chaos-creative variations.
"""

import numpy as np

from python.helpers.extension import Extension
from python.helpers.heisenberg_core import get_heisenberg_core


class HeisenbergContextFusion(Extension):
    """Fuse Heisenberg-enhanced context into message loop"""

    async def execute(self, loop_data, **kwargs):
        heisenberg = self.agent.get_data("heisenberg_core")
        if not heisenberg:
            return

        # Get current context from loop data
        current_context = ""
        if hasattr(loop_data, 'extras_persistent'):
            current_context = str(loop_data.extras_persistent)

        if not current_context:
            return

        # Generate quantum-enhanced context additions
        enhancements = []

        # 1. Top quantum branches (most probable hypotheses)
        top_branches = heisenberg.quantum.get_top_branches(3)
        if top_branches:
            branch_insights = [f"- {b.hypothesis} (p={b.probability:.2f})"
                             for b in top_branches]
            enhancements.append(
                "**Active Reasoning Branches:**\n" + "\n".join(branch_insights)
            )

        # 2. Topological signature of memory
        topo_sig = heisenberg.topology.get_topological_signature()
        if topo_sig['n_points'] > 0:
            enhancements.append(
                f"**Memory Topology:** β₀={topo_sig['betti_numbers'][0]} (components), "
                f"β₁={topo_sig['betti_numbers'][1]} (cycles), "
                f"connectivity={topo_sig['connectivity_ratio']:.2f}"
            )

        # 3. Chaos-creative variation of current focus
        chaos_engine = self.agent.get_data("chaos_engine")
        if chaos_engine and current_context:
            # Generate one creative variation
            variation = chaos_engine.generate_creative_variation(
                current_context[:100],
                variation_strength=0.3
            )
            enhancements.append(
                f"**Creative Perspective:** {variation}"
            )

        # 4. Meta-parameters state
        meta_params = self.agent.get_data("heisenberg_meta_params")
        if meta_params:
            mode = "Exploration" if meta_params.get('exploration_rate', 0.3) > 0.4 else "Exploitation"
            enhancements.append(f"**Reasoning Mode:** {mode}")

        # 5. Heisenberg uncertainty bounds
        uncertainty_bounds = heisenberg.quantum.get_heisenberg_bounds()
        if uncertainty_bounds:
            avg_uncertainty = np.mean([
                pu * mu for pu, mu in uncertainty_bounds.values()
            ])
            enhancements.append(
                f"**Uncertainty Level:** {avg_uncertainty:.3f} (lower = more confident)"
            )

        # Inject into loop data extras
        if enhancements and hasattr(loop_data, 'extras_persistent'):
            heisenberg_context = "\n\n".join(enhancements)
            loop_data.extras_persistent["heisenberg_context"] = heisenberg_context
