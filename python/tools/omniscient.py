"""
OMNISCIENT ORCHESTRATOR TOOL
============================
Master control over all cognitive systems.
"""

from python.helpers.omniscient_controller import get_omniscient_controller
from python.helpers.tool import Response, Tool


class OmniscientTool(Tool):
    """Tool for omniscient controller operations"""

    async def execute(self, **kwargs):
        controller = get_omniscient_controller()
        operation = self.args.get("operation", "status")

        if operation == "analyze":
            task = self.args.get("task", "")

            complexity, resources = controller.analyze_task(task)

            msg = f"""🔍 **Task Analysis:**

**Task:** {task[:100]}...

**Complexity:** {complexity.name} (Level {complexity.value})

**Resource Requirements:**
"""
            for engine, score in sorted(resources.items(), key=lambda x: x[1], reverse=True):
                bar = "█" * int(score * 10) + "░" * (10 - int(score * 10))
                msg += f"- {engine}: [{bar}] {score:.0%}\n"

            return Response(message=msg, break_loop=False)

        elif operation == "plan":
            task = self.args.get("task", "")

            plan = controller.create_execution_plan(task)

            msg = f"""📋 **Execution Plan:**

**Task:** {plan.task[:100]}...
**Complexity:** {plan.complexity.name}
**Estimated Tokens:** {plan.estimated_total_tokens}
**Parallel Branches:** {plan.parallel_branches}

**Strategies:**
"""
            for strategy in plan.strategies:
                msg += f"\n**{strategy.name}** (Priority: {strategy.priority})\n"
                msg += f"  Modes: {', '.join(m.name for m in strategy.modes)}\n"
                msg += f"  Engines: {', '.join(strategy.engines)}\n"
                msg += f"  Confidence: {strategy.confidence:.0%}\n"

            msg += f"\n**Checkpoints:** {len(plan.checkpoints)}"
            msg += f"\n**Fallbacks:** {len(plan.fallback_strategies)}"

            return Response(message=msg, break_loop=False)

        elif operation == "add_goal":
            goal = self.args.get("goal", "")
            priority = self.args.get("priority", 5)

            goal_id = controller.add_goal(goal, priority)

            return Response(
                message=f"🎯 Added goal [{goal_id}]: {goal[:50]}... (priority: {priority})",
                break_loop=False
            )

        elif operation == "decompose":
            goal_id = self.args.get("goal_id", "")

            sub_goals = controller.decompose_goal(goal_id)

            if not sub_goals:
                return Response(
                    message=f"Could not decompose goal {goal_id}",
                    break_loop=False
                )

            msg = f"🔀 **Decomposed Goal {goal_id} into {len(sub_goals)} sub-goals:**\n"
            for i, sg_id in enumerate(sub_goals, 1):
                goal = next((g for g in controller.active_goals if g['id'] == sg_id), None)
                if goal:
                    msg += f"{i}. [{sg_id}] {goal['description'][:50]}...\n"

            return Response(message=msg, break_loop=False)

        elif operation == "next_goal":
            goal = controller.get_next_goal()

            if goal:
                return Response(
                    message=f"➡️ **Next Goal:** [{goal['id']}] {goal['description'][:100]}... (priority: {goal['priority']})",
                    break_loop=False
                )
            else:
                return Response(
                    message="No goals ready for execution (dependencies not met or queue empty).",
                    break_loop=False
                )

        elif operation == "status":
            status = controller.get_system_status()

            msg = f"""🌐 **Omniscient Controller Status:**

- Current Mode: {status['current_mode']}
- Active Strategies: {status['active_strategies']}
- Active Goals: {status['active_goals']}
- Completed Goals: {status['completed_goals']}
- Execution History: {status['execution_history_size']}
- Emergent Patterns: {status['emergent_patterns']}

**Performance Metrics:**
"""
            for metric, value in status['performance_metrics'].items():
                bar = "█" * int(value * 10) + "░" * (10 - int(value * 10))
                msg += f"- {metric}: [{bar}] {value:.0%}\n"

            return Response(message=msg, break_loop=False)

        else:
            return Response(
                message=f"Unknown operation: {operation}. Use: analyze, plan, add_goal, decompose, next_goal, status",
                break_loop=False
            )
