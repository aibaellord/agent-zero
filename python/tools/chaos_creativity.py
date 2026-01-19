"""
CHAOS CREATIVITY TOOL
=====================
Generate creative variations using chaos-theoretic dynamics.
"""

import json

from python.helpers.heisenberg_core import (ChaosCreativityEngine,
                                            get_heisenberg_core)
from python.helpers.tool import Response, Tool


class ChaosCreativity(Tool):
    """
    Chaos-theoretic creativity engine for generating novel ideas.
    Uses Lorenz attractor dynamics for controlled unpredictability.
    """

    async def execute(self, **kwargs):
        heisenberg = get_heisenberg_core()
        chaos = heisenberg.chaos

        concept = self.args.get("concept", "")
        action = self.args.get("action", "generate")  # generate, evolve, analyze
        strength = self.args.get("strength", 0.5)
        iterations = self.args.get("iterations", 5)

        if not concept and action != "analyze":
            return Response(
                message="Please provide a 'concept' to generate creative variations.",
                break_loop=False
            )

        if action == "generate":
            # Generate single creative variation
            variation = chaos.generate_creative_variation(concept, strength)

            state = chaos.lorenz.get_normalized_state()

            return Response(
                message=f"**Creative Variation**\n\n"
                       f"Original: {concept}\n\n"
                       f"Variation: {variation}\n\n"
                       f"Chaos State: scale={state[0]:.2f}, abstraction={state[1]:.2f}, perspective={state[2]:.2f}",
                break_loop=False
            )

        elif action == "evolve":
            # Evolve concept through strange attractor
            ideas = chaos.generate_strange_attractor_ideas(
                [concept],
                n_iterations=iterations * 20
            )

            # Deduplicate and select diverse ideas
            unique_ideas = list(dict.fromkeys(ideas))[:min(len(ideas), 10)]

            return Response(
                message=f"**Strange Attractor Evolution** ({len(unique_ideas)} unique ideas)\n\n" +
                       "\n".join([f"{i+1}. {idea}" for i, idea in enumerate(unique_ideas)]),
                break_loop=False
            )

        elif action == "analyze":
            # Analyze fractal dimension and chaos metrics
            if len(chaos.lorenz.history) < 10:
                # Generate some history first
                for _ in range(100):
                    chaos.lorenz.step()

            history = [s[0] for s in chaos.lorenz.history[-100:]]
            fractal_dim = chaos.calculate_fractal_dimension(history)

            return Response(
                message=f"**Chaos Analysis**\n\n"
                       f"Lorenz Attractor State: {chaos.lorenz.state.tolist()}\n"
                       f"Fractal Dimension: {fractal_dim:.3f} (theoretical: 2.06)\n"
                       f"Lyapunov Exponent: {chaos.lyapunov_exponent:.3f}\n"
                       f"History Points: {len(chaos.lorenz.history)}\n"
                       f"Creative Seeds Generated: {len(chaos.creative_seeds)}",
                break_loop=False
            )

        return Response(
            message=f"Unknown action: {action}. Use: generate, evolve, analyze",
            break_loop=False
        )
