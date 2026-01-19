from python.helpers import prompt_evolution as pe
from python.helpers.tool import Response, Tool


class PromptEvolution(Tool):
    """Tool for evolving and improving prompts automatically."""

    async def execute(self, **kwargs):
        operation = self.args.get("operation", "status")

        evolution = pe.get_prompt_evolution()

        if operation == "register":
            content = self.args.get("content", "")
            name = self.args.get("name", "")

            if not content:
                return Response(
                    message="❌ Prompt content required.",
                    break_loop=False
                )

            variant = evolution.register_prompt(content, name)
            return Response(
                message=f"✅ Registered prompt variant:\n" +
                        f"  ID: {variant.id}\n" +
                        f"  Name: {name}\n" +
                        f"  Generation: {variant.generation}",
                break_loop=False
            )

        elif operation == "record":
            variant_id = self.args.get("variant_id", "")
            success = self.args.get("success", True)
            score = self.args.get("score", 1.0)

            evolution.record_usage(variant_id, success, score)
            return Response(
                message=f"✅ Recorded usage for variant {variant_id}: " +
                        f"{'success' if success else 'failure'} (score: {score})",
                break_loop=False
            )

        elif operation == "evolve":
            top_k = self.args.get("top_k", 3)

            new_variants = evolution.evolve(top_k)

            if new_variants:
                variant_info = "\n".join([
                    f"  - {v.id}: gen {v.generation} (parent: {v.parent_id})"
                    for v in new_variants
                ])
                return Response(
                    message=f"🧬 Evolution complete! {len(new_variants)} new variants:\n{variant_info}",
                    break_loop=False
                )
            return Response(
                message="⚠️ Not enough data to evolve. Need more recorded usages.",
                break_loop=False
            )

        elif operation == "best":
            best = evolution.get_best_variant()

            if best:
                return Response(
                    message=f"🏆 Best performing variant:\n" +
                            f"  ID: {best.id}\n" +
                            f"  Fitness: {best.fitness:.2%}\n" +
                            f"  Success rate: {best.success_rate:.2%}\n" +
                            f"  Uses: {best.uses}\n" +
                            f"  Content preview: {best.content[:100]}...",
                    break_loop=False
                )
            return Response(message="No variants registered yet.", break_loop=False)

        elif operation == "ab_test":
            variant_a = self.args.get("variant_a", "")
            variant_b = self.args.get("variant_b", "")

            if not variant_a or not variant_b:
                return Response(
                    message="❌ Both variant_a and variant_b IDs required.",
                    break_loop=False
                )

            test = evolution.start_ab_test(variant_a, variant_b)
            return Response(
                message=f"🔬 A/B Test started:\n" +
                        f"  Test ID: {test.test_id}\n" +
                        f"  Variant A: {variant_a}\n" +
                        f"  Variant B: {variant_b}",
                break_loop=False
            )

        elif operation == "prune":
            keep_top = self.args.get("keep_top", 10)

            pruned = evolution.prune(keep_top)
            return Response(
                message=f"🗑️ Pruned {pruned} underperforming variants.",
                break_loop=False
            )

        elif operation == "export":
            export_data = evolution.export()
            return Response(
                message=f"📤 Exported evolution state:\n{export_data[:500]}...",
                break_loop=False
            )

        else:  # status
            stats = evolution.get_statistics()

            return Response(
                message=f"📊 **Prompt Evolution Status**\n" +
                        f"Total variants: {stats['total_variants']}\n" +
                        f"Current generation: {stats['current_generation']}\n" +
                        f"Total uses: {stats['total_uses']}\n" +
                        f"Average fitness: {stats['avg_fitness']:.2%}\n" +
                        f"Best fitness: {stats['best_fitness']:.2%}\n" +
                        f"Active A/B tests: {stats['active_ab_tests']}\n" +
                        f"Mutations: {stats['mutations']}",
                break_loop=False
            )
