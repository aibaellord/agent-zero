from python.helpers import explanation_generator as eg
from python.helpers.tool import Response, Tool


class Explain(Tool):
    """Tool for generating human-readable explanations of reasoning."""

    async def execute(self, **kwargs):
        operation = self.args.get("operation", "status")

        generator = eg.get_explanation_generator()

        if operation == "trace":
            description = self.args.get("description", "")
            reasoning = self.args.get("reasoning", "")
            confidence = self.args.get("confidence", 1.0)
            evidence = self.args.get("evidence", [])

            if not description:
                return Response(
                    message="❌ Step description required.",
                    break_loop=False
                )

            generator.trace_step(description, reasoning, confidence, evidence)
            return Response(
                message=f"📝 Traced step: {description}\n" +
                        f"  Reasoning: {reasoning[:80] if reasoning else 'N/A'}\n" +
                        f"  Confidence: {confidence:.0%}",
                break_loop=False
            )

        elif operation == "reasoning":
            goal = self.args.get("goal", "Task completion")
            detail = self.args.get("detail", "summary")

            try:
                detail_level = eg.DetailLevel(detail)
            except ValueError:
                detail_level = eg.DetailLevel.SUMMARY

            explanation = generator.generate_reasoning_explanation(goal, detail_level)
            formatted = generator.format_explanation(explanation)

            return Response(
                message=f"📖 **Reasoning Explanation**\n{formatted}",
                break_loop=False
            )

        elif operation == "decision":
            choice = self.args.get("choice", "")
            alternatives = self.args.get("alternatives", [])
            reason = self.args.get("reason", "")

            if not choice:
                return Response(
                    message="❌ Choice required.",
                    break_loop=False
                )

            explanation = generator.explain_decision(choice, alternatives, reason)
            formatted = generator.format_explanation(explanation)

            return Response(
                message=f"🎯 **Decision Explanation**\n{formatted}",
                break_loop=False
            )

        elif operation == "comparison":
            options = self.args.get("options", [])
            criteria = self.args.get("criteria", [])
            recommendation = self.args.get("recommendation", "")

            if not options or not criteria:
                return Response(
                    message="❌ Options and criteria required.",
                    break_loop=False
                )

            comparison = generator.explain_comparison(options, criteria, recommendation)

            return Response(
                message=f"⚖️ **Comparison**\n{comparison}",
                break_loop=False
            )

        elif operation == "error":
            error = self.args.get("error", "")
            cause = self.args.get("cause", "")
            fix = self.args.get("fix", "")
            context = self.args.get("context", {})

            if not error:
                return Response(
                    message="❌ Error description required.",
                    break_loop=False
                )

            explanation = generator.explain_error(error, cause, fix, context)
            formatted = generator.format_explanation(explanation)

            return Response(
                message=f"🔍 **Error Explanation**\n{formatted}",
                break_loop=False
            )

        elif operation == "tree":
            decisions = self.args.get("decisions", [])

            if not decisions:
                return Response(
                    message="❌ Decisions list required.",
                    break_loop=False
                )

            tree = generator.build_decision_tree(decisions)

            return Response(
                message=f"🌳 **Decision Tree**\n```\n{tree}\n```",
                break_loop=False
            )

        elif operation == "clear":
            generator.clear_trace()
            return Response(
                message="🧹 Reasoning trace cleared.",
                break_loop=False
            )

        elif operation == "recent":
            count = self.args.get("count", 5)
            recent = generator.get_recent_explanations(count)

            if recent:
                exp_list = "\n".join([
                    f"  - {e.title} ({e.explanation_type.value}, {e.confidence:.0%})"
                    for e in recent
                ])
                return Response(
                    message=f"📋 Recent explanations:\n{exp_list}",
                    break_loop=False
                )
            return Response(message="No explanations generated yet.", break_loop=False)

        else:  # status
            stats = generator.get_statistics()

            return Response(
                message=f"📊 **Explanation Generator Status**\n" +
                        f"Total explanations: {stats['total_explanations']}\n" +
                        f"By type: {stats.get('by_type', {})}\n" +
                        f"Avg confidence: {stats.get('avg_confidence', 0):.0%}\n" +
                        f"Steps traced: {stats.get('total_steps_traced', 0)}",
                break_loop=False
            )
