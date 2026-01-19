"""
HEISENBERG STATUS TOOL
======================
Get complete Heisenberg system status.
"""

import json

from python.helpers.heisenberg_core import get_heisenberg_core
from python.helpers.swarm_intelligence import get_swarm_intelligence
from python.helpers.tool import Response, Tool


class HeisenbergStatus(Tool):
    """
    Complete Heisenberg Singularity system status.
    Shows state of all engines and performance metrics.
    """

    async def execute(self, **kwargs):
        heisenberg = get_heisenberg_core()
        swarm = get_swarm_intelligence()

        action = self.args.get("action", "full")  # full, quantum, swarm, memory, performance

        if action == "full":
            # Complete system status
            system_state = heisenberg.get_system_state()
            swarm_state = swarm.get_swarm_state()

            result_lines = [
                "# 🌌 HEISENBERG SINGULARITY STATUS",
                "",
                "## Quantum Engine",
                f"- Active Branches: {system_state.get('quantum_branches', 0)}",
                f"- Top Hypothesis: {system_state.get('top_hypothesis', 'None')[:50] if system_state.get('top_hypothesis') else 'None'}...",
                "",
                "## Category Engine",
                f"- Categories: {len(heisenberg.category.categories)}",
                f"- Functors: {len(heisenberg.category.functors)}",
                "",
                "## Topological Memory",
                f"- Points: {system_state.get('memory_topology', {}).get('n_points', 0)}",
                f"- Betti Numbers: {system_state.get('memory_topology', {}).get('betti_numbers', [0,0,0])}",
                "",
                "## Chaos Engine",
                f"- Lorenz State: {system_state.get('chaos_state', [0,0,0])}",
                f"- Creative Seeds: {len(heisenberg.chaos.creative_seeds)}",
                "",
                "## Game Theory",
                f"- Strategic Analyses: {len(heisenberg.game_theory.strategic_history)}",
                f"- Mechanisms Designed: {len(heisenberg.game_theory.mechanism_designer.mechanisms)}",
                "",
                "## Swarm Intelligence",
                f"- Total Agents: {swarm_state.get('total_agents', 0)}",
                f"- PSO Best Fitness: {swarm_state.get('pso_global_best_fitness', 0):.4f}",
                f"- Pheromone Deposits: {swarm_state.get('pheromone_deposits', 0)}",
                f"- Emergent Patterns: {len(swarm.emergent_patterns)}",
                "",
                "## Self-Modification",
                f"- Evolution Generation: {system_state.get('evolution_generation', 0)}",
                f"- Mutation Rate: {heisenberg.self_modifier.prompt_evolution.MUTATION_RATE:.3f}",
                "",
                "## Performance",
                f"- Accuracy: {system_state.get('performance', {}).get('reasoning_accuracy', 0.5):.2f}",
                f"- Creativity: {system_state.get('performance', {}).get('creativity_score', 0.5):.2f}",
                f"- Efficiency: {system_state.get('performance', {}).get('efficiency', 0.5):.2f}",
                f"- Adaptability: {system_state.get('performance', {}).get('adaptability', 0.5):.2f}",
            ]

            return Response(
                message="\n".join(result_lines),
                break_loop=False
            )

        elif action == "quantum":
            branches = heisenberg.quantum.get_top_branches(10)

            result_lines = [
                "## Quantum Superposition Status",
                f"Total Branches: {len(heisenberg.quantum.branches)}",
                f"Measurements: {len(heisenberg.quantum.measurement_history)}",
                "",
                "**Top Branches:**"
            ]

            for b in branches:
                result_lines.append(
                    f"- {b.hypothesis[:50]}... (p={b.probability:.3f})"
                )

            return Response(
                message="\n".join(result_lines),
                break_loop=False
            )

        elif action == "swarm":
            state = swarm.get_swarm_state()
            best = swarm.get_best_agents(5)

            result_lines = [
                "## Swarm Intelligence Status",
                f"Agents: {state['total_agents']}",
                f"Iteration: {state['iteration']}",
                "",
                "**Best Agents:**"
            ]

            for a in best:
                result_lines.append(
                    f"- {a.id}: fitness={a.personal_best_fitness:.4f}"
                )

            return Response(
                message="\n".join(result_lines),
                break_loop=False
            )

        elif action == "memory":
            sig = heisenberg.topology.get_topological_signature()

            return Response(
                message=f"## Topological Memory Status\n\n"
                       f"Points: {sig['n_points']}\n"
                       f"Connections: {sig['n_connections']}\n"
                       f"Betti: β₀={sig['betti_numbers'][0]}, β₁={sig['betti_numbers'][1]}, β₂={sig['betti_numbers'][2]}\n"
                       f"Euler: {sig['euler_characteristic']}",
                break_loop=False
            )

        elif action == "performance":
            perf = heisenberg.performance
            params = heisenberg.self_modifier.meta_parameters

            return Response(
                message=f"## Performance Status\n\n"
                       f"**Metrics:**\n"
                       f"- Accuracy: {perf['reasoning_accuracy']:.2f}\n"
                       f"- Creativity: {perf['creativity_score']:.2f}\n"
                       f"- Efficiency: {perf['efficiency']:.2f}\n"
                       f"- Adaptability: {perf['adaptability']:.2f}\n\n"
                       f"**Parameters:**\n"
                       f"- Exploration: {params['exploration_rate']:.2f}\n"
                       f"- Exploitation: {params['exploitation_rate']:.2f}",
                break_loop=False
            )

        return Response(
            message=f"Unknown action: {action}. Use: full, quantum, swarm, memory, performance",
            break_loop=False
        )
