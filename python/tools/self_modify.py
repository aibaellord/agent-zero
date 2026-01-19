"""
SELF MODIFY TOOL
================
Self-modification and evolution of agent behavior.
"""

from python.helpers.heisenberg_core import get_heisenberg_core
from python.helpers.tool import Response, Tool


class SelfModify(Tool):
    """
    Self-modification engine for evolving agent behavior.
    Genetic optimization of prompts and parameters.
    """

    async def execute(self, **kwargs):
        heisenberg = get_heisenberg_core()
        self_mod = heisenberg.self_modifier

        action = self.args.get("action", "status")  # status, mutate, evolve, adapt
        behavior = self.args.get("behavior", "")
        metrics = self.args.get("metrics", {})

        if action == "status":
            # Get self-modification status
            params = self_mod.meta_parameters
            evolution = self_mod.prompt_evolution

            result_lines = [
                f"**Self-Modification Status**",
                f"",
                f"**Meta-Parameters**:",
                f"- Exploration Rate: {params.get('exploration_rate', 0.3):.2f}",
                f"- Exploitation Rate: {params.get('exploitation_rate', 0.7):.2f}",
                f"- Learning Rate: {params.get('learning_rate', 0.01):.4f}",
                f"- Momentum: {params.get('momentum', 0.9):.2f}",
                f"",
                f"**Evolution Status**:",
                f"- Generation: {evolution.generation}",
                f"- Population Size: {len(evolution.population)}",
                f"- Mutation Rate: {evolution.MUTATION_RATE:.3f}",
                f"- Crossover Rate: {evolution.CROSSOVER_RATE:.3f}",
                f"",
                f"**Behavior Mutations**: {len(self_mod.behavior_mutations)}",
                f"**Adaptation History**: {len(self_mod.adaptation_history)}"
            ]

            if evolution.best_ever:
                result_lines.append(f"")
                result_lines.append(f"**Best Evolved Prompt**:")
                result_lines.append(f"  Fitness: {evolution.best_ever.fitness:.4f}")
                result_lines.append(f"  Preview: {evolution.best_ever.dna[:100]}...")

            return Response(
                message="\n".join(result_lines),
                break_loop=False
            )

        elif action == "mutate":
            if not behavior:
                return Response(
                    message="Please provide 'behavior' to mutate.",
                    break_loop=False
                )

            mutation = self_mod.generate_behavior_mutation(behavior)

            return Response(
                message=f"**Behavior Mutation**\n\n"
                       f"**Original**: {behavior}\n\n"
                       f"**Mutated**: {mutation}\n\n"
                       f"Total mutations: {len(self_mod.behavior_mutations)}",
                break_loop=False
            )

        elif action == "evolve":
            # Evolve prompts
            if not self_mod.prompt_evolution.population:
                # Initialize with seed prompts
                seed_prompts = [
                    "Analyze the problem step by step.",
                    "Consider multiple perspectives.",
                    "Verify your reasoning.",
                    "Look for patterns and analogies.",
                    "Think about edge cases.",
                    "Simplify when possible.",
                    "Ask clarifying questions.",
                    "Validate your assumptions."
                ]
                self_mod.prompt_evolution.initialize_population(seed_prompts)

            # Simple fitness based on prompt length and keyword diversity
            def fitness_fn(prompt: str) -> float:
                words = prompt.lower().split()
                unique_ratio = len(set(words)) / max(len(words), 1)
                length_score = min(1.0, len(prompt) / 100)
                return (unique_ratio * 0.6 + length_score * 0.4)

            self_mod.prompt_evolution.evaluate_fitness(fitness_fn)
            new_pop = self_mod.prompt_evolution.evolve()

            top = self_mod.prompt_evolution.get_best(3)

            result_lines = [
                f"**Evolution Complete**",
                f"",
                f"**Generation**: {self_mod.prompt_evolution.generation}",
                f"**Population Size**: {len(new_pop)}",
                f"",
                f"**Top Prompts**:"
            ]

            for i, prompt in enumerate(top):
                result_lines.append(f"{i+1}. (fitness={prompt.fitness:.4f}) {prompt.dna[:80]}...")

            return Response(
                message="\n".join(result_lines),
                break_loop=False
            )

        elif action == "adapt":
            if not metrics:
                # Use default metrics from heisenberg performance
                metrics = heisenberg.performance.copy()

            new_params = self_mod.adapt_parameters(metrics)

            return Response(
                message=f"**Parameters Adapted**\n\n"
                       f"Based on performance metrics:\n"
                       f"- Accuracy: {metrics.get('reasoning_accuracy', 0.5):.2f}\n"
                       f"- Creativity: {metrics.get('creativity_score', 0.5):.2f}\n"
                       f"- Efficiency: {metrics.get('efficiency', 0.5):.2f}\n"
                       f"- Adaptability: {metrics.get('adaptability', 0.5):.2f}\n\n"
                       f"**New Parameters**:\n"
                       f"- Exploration: {new_params['exploration_rate']:.2f}\n"
                       f"- Exploitation: {new_params['exploitation_rate']:.2f}",
                break_loop=False
            )

        return Response(
            message=f"Unknown action: {action}. Use: status, mutate, evolve, adapt",
            break_loop=False
        )
