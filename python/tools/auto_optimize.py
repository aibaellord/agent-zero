"""
AUTO OPTIMIZER TOOL
==================
Universal optimization tool - optimizes anything automatically.
"""

from python.helpers.auto_optimizer import get_auto_optimizer
from python.helpers.tool import Response, Tool


class AutoOptimize(Tool):
    """Universal auto-optimization tool"""

    async def execute(self, **kwargs):
        optimizer = get_auto_optimizer()
        operation = self.args.get("operation", "optimize")

        if operation == "optimize":
            content = self.args.get("content", "")
            content_type = self.args.get("type", "auto")
            goal = self.args.get("goal", "general")

            if not content:
                return Response(message="❌ No content provided", break_loop=False)

            result = optimizer.optimize(content, content_type, goal)

            changes_str = "\n".join(f"  • {c}" for c in result.changes) if result.changes else "  (none)"

            return Response(
                message=f"""⚡ **Auto-Optimization Complete**

**Type Detected:** {content_type}
**Goal:** {goal}
**Improvement:** {result.improvement:.1%}

**Changes Made:**
{changes_str}

**Optimized Content:**
```
{result.optimized}
```

**Metrics:** {result.metrics}""",
                break_loop=False
            )

        elif operation == "quick":
            content = self.args.get("content", "")
            content_type = self.args.get("type", "auto")

            result = optimizer.optimize(content, content_type)
            return Response(message=result.optimized, break_loop=False)

        elif operation == "stats":
            stats = optimizer.get_stats()
            return Response(
                message=f"""📊 **Optimizer Stats**

- Total Optimizations: {stats['total_optimizations']}
- Average Improvement: {stats['average_improvement']:.1%}""",
                break_loop=False
            )

        else:
            return Response(
                message=f"Unknown operation: {operation}. Use: optimize, quick, stats",
                break_loop=False
            )
