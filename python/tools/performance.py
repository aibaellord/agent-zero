"""
PERFORMANCE TOOL
================
Performance optimization and monitoring.
"""

from python.helpers.performance_multiplier import get_performance_multiplier
from python.helpers.tool import Response, Tool


class PerformanceTool(Tool):
    """Tool for performance optimization"""

    async def execute(self, **kwargs):
        perf = get_performance_multiplier()
        operation = self.args.get("operation", "status")

        if operation == "optimize_prompt":
            prompt = self.args.get("prompt", "")

            original_len = len(prompt)
            optimized = perf.optimize_prompt(prompt)
            new_len = len(optimized)

            reduction = (original_len - new_len) / original_len * 100 if original_len > 0 else 0

            return Response(
                message=f"""✨ **Prompt Optimized:**
- Original: {original_len} chars
- Optimized: {new_len} chars
- Reduction: {reduction:.1f}%
- Tokens saved: ~{(original_len - new_len) // 4}""",
                break_loop=False
            )

        elif operation == "truncate":
            context = self.args.get("context", "")
            max_tokens = self.args.get("max_tokens", 4000)

            truncated = perf.truncate_context(context, max_tokens)

            return Response(
                message=f"""✂️ **Context Truncated:**
- Original: {len(context)} chars
- Truncated: {len(truncated)} chars
- Target tokens: {max_tokens}""",
                break_loop=False
            )

        elif operation == "cache":
            key = self.args.get("key", "")
            value = self.args.get("value", None)

            if value is not None:
                perf.cache_result(key, value)
                return Response(
                    message=f"💾 Cached value for key: {key}",
                    break_loop=False
                )
            else:
                cached = perf.get_cached(key)
                if cached is not None:
                    return Response(
                        message=f"✅ Cache hit for '{key}': {str(cached)[:100]}...",
                        break_loop=False
                    )
                else:
                    return Response(
                        message=f"❌ Cache miss for key: {key}",
                        break_loop=False
                    )

        elif operation == "report":
            report = perf.get_performance_report()

            msg = f"""📈 **Performance Report:**

**Cache:**
- Hit Rate: {report['cache']['hit_rate']:.1%}
- Size: {report['cache']['size']} items
- Hits: {report['cache']['hits']} / Misses: {report['cache']['misses']}

**Token Optimization:**
- Compression Ratio: {report['tokens']['compression_ratio']:.1%}
- Tokens Saved: {report['tokens']['tokens_saved']}

**Parallel Execution:**
- Active Tasks: {report['parallel']['active_tasks']}
- Total Executions: {report['parallel']['total_executions']}

**Batch Processing:**
- Pending Items: {report['batch']['pending']}
- Total Processed: {report['batch']['total_processed']}"""

            return Response(message=msg, break_loop=False)

        elif operation == "clear_cache":
            perf.clear_cache()
            return Response(
                message="🗑️ Cache cleared.",
                break_loop=False
            )

        elif operation == "status":
            report = perf.get_performance_report()

            # Calculate overall efficiency
            cache_eff = report['cache']['hit_rate']
            token_eff = 1 - report['tokens']['compression_ratio']
            overall = (cache_eff + token_eff) / 2

            emoji = "🟢" if overall > 0.5 else "🟡" if overall > 0.25 else "🔴"

            return Response(
                message=f"""{emoji} **Performance Status:**

- Cache Efficiency: {cache_eff:.0%}
- Token Savings: {token_eff:.0%}
- Overall Efficiency: {overall:.0%}""",
                break_loop=False
            )

        else:
            return Response(
                message=f"Unknown operation: {operation}. Use: optimize_prompt, truncate, cache, report, clear_cache, status",
                break_loop=False
            )
