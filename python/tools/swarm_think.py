"""
SWARM THINK TOOL
================
Leverage 64-agent swarm intelligence for distributed reasoning.
"""

import hashlib

import numpy as np

from python.helpers.swarm_intelligence import get_swarm_intelligence
from python.helpers.tool import Response, Tool


class SwarmThink(Tool):
    """
    Swarm intelligence for distributed, emergent reasoning.
    64 specialized agents coordinate via stigmergy.
    """

    async def execute(self, **kwargs):
        swarm = get_swarm_intelligence()

        task = self.args.get("task", "")
        action = self.args.get("action", "think")  # think, status, patterns
        iterations = self.args.get("iterations", 20)

        if action == "think":
            if not task:
                return Response(
                    message="Please provide a 'task' for the swarm to analyze.",
                    break_loop=False
                )

            # Create task embedding
            task_hash = int(hashlib.md5(task.encode()).hexdigest()[:8], 16)
            np.random.seed(task_hash % 10000)
            task_embedding = np.random.randn(128)
            task_embedding = task_embedding / np.linalg.norm(task_embedding)

            # Simple fitness function based on distance to task
            def fitness_fn(position: np.ndarray) -> float:
                similarity = np.dot(position / (np.linalg.norm(position) + 0.001),
                                   task_embedding)
                return (similarity + 1) / 2  # Normalize to [0, 1]

            # Run swarm thinking
            result = await swarm.swarm_think(
                task_embedding=task_embedding,
                fitness_fn=fitness_fn,
                n_iterations=iterations
            )

            # Format results
            patterns = result.get('emergent_patterns', [])
            contributions = result.get('role_contributions', {})

            result_lines = [
                f"**Swarm Thinking Complete** ({iterations} iterations)",
                f"",
                f"**Final Fitness**: {result.get('final_fitness', 0):.4f}",
                f"",
                f"**Emergent Patterns**: {len(patterns)}"
            ]

            for pattern in patterns[:5]:
                result_lines.append(f"  - {pattern.get('type', 'unknown')}: {json.dumps(pattern.get('center', []))[:50]}...")

            result_lines.append("")
            result_lines.append("**Top Role Contributions**:")

            sorted_roles = sorted(
                contributions.items(),
                key=lambda x: x[1].get('avg_fitness', 0),
                reverse=True
            )

            for role, stats in sorted_roles[:5]:
                result_lines.append(
                    f"  - {role}: fitness={stats.get('avg_fitness', 0):.3f}, "
                    f"discoveries={stats.get('total_discoveries', 0)}"
                )

            return Response(
                message="\n".join(result_lines),
                break_loop=False
            )

        elif action == "status":
            # Get swarm status
            state = swarm.get_swarm_state()
            best_agents = swarm.get_best_agents(5)

            result_lines = [
                f"**Swarm Status**",
                f"",
                f"**Total Agents**: {state.get('total_agents', 0)}",
                f"**Iteration**: {state.get('iteration', 0)}",
                f"**PSO Best Fitness**: {state.get('pso_global_best_fitness', 0):.4f}",
                f"**Boid Spread**: {state.get('boid_spread', 0):.4f}",
                f"**Pheromone Deposits**: {state.get('pheromone_deposits', 0)}",
                f"**Messages on Board**: {state.get('messages_on_board', 0)}",
                f"",
                f"**Role Distribution**:"
            ]

            for role, count in state.get('role_distribution', {}).items():
                result_lines.append(f"  - {role}: {count}")

            result_lines.append("")
            result_lines.append("**Best Agents**:")
            for agent in best_agents:
                result_lines.append(
                    f"  - {agent.id}: fitness={agent.personal_best_fitness:.4f}, "
                    f"discoveries={len(agent.discoveries)}"
                )

            return Response(
                message="\n".join(result_lines),
                break_loop=False
            )

        elif action == "patterns":
            # Get emergent patterns
            patterns = swarm.emergent_patterns[-20:]

            if not patterns:
                return Response(
                    message="No emergent patterns detected yet. Run 'think' first.",
                    break_loop=False
                )

            result_lines = [
                f"**Emergent Patterns** ({len(patterns)} total)",
                ""
            ]

            for i, pattern in enumerate(patterns):
                result_lines.append(
                    f"{i+1}. Type: {pattern.get('type', 'unknown')}, "
                    f"Iteration: {pattern.get('iteration', 0)}"
                )

            return Response(
                message="\n".join(result_lines),
                break_loop=False
            )

        return Response(
            message=f"Unknown action: {action}. Use: think, status, patterns",
            break_loop=False
        )


# Need to import json for the tool
import json
