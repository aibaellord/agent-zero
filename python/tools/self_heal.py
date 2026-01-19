"""
SELF-HEAL TOOL
==============
Automatic diagnostics and self-repair.
"""

from python.helpers.self_healing_system import get_self_healing_system
from python.helpers.tool import Response, Tool


class SelfHealTool(Tool):
    """Tool for self-healing and diagnostics"""

    async def execute(self, **kwargs):
        healer = get_self_healing_system()
        operation = self.args.get("operation", "status")

        if operation == "diagnose":
            results = await healer.run_diagnostics()

            msg = "🔍 **Diagnostic Results:**\n\n"
            for name, result in results.items():
                status_emoji = "✅" if result['status'] == 'pass' else "❌"
                msg += f"{status_emoji} **{name}:** {result['status']}\n"
                if result['status'] == 'fail':
                    msg += f"   Error: {result.get('error', 'Unknown')}\n"

            return Response(message=msg, break_loop=False)

        elif operation == "health":
            status = healer.get_health_status()

            health_emoji = "🟢" if status['status'] == 'healthy' else "🟡" if status['status'] == 'degraded' else "🔴"

            msg = f"""{health_emoji} **Health Status: {status['status'].upper()}**

- Health Score: {status['health_score']:.0%}
- Open Circuits: {len(status['open_circuits'])}
- Recent Errors: {status['recent_error_count']}
- Recovery Rate: {status['recovery_rate']:.0%}
"""

            if status['open_circuits']:
                msg += "\n**Open Circuit Breakers:**\n"
                for circuit in status['open_circuits']:
                    msg += f"- {circuit}\n"

            if status['frequent_patterns']:
                msg += "\n**Frequent Error Patterns:**\n"
                for pattern in status['frequent_patterns'][:5]:
                    msg += f"- {pattern['id']}: {pattern['count']} occurrences\n"

            return Response(message=msg, break_loop=False)

        elif operation == "stats":
            stats = healer.get_statistics()

            return Response(
                message=f"""📊 **Self-Healing Statistics:**

- Total Errors: {stats['total_errors']}
- Patterns Recognized: {stats['patterns_recognized']}
- Unknown Errors: {stats['unknown_errors']}
- Recovery Attempts: {stats['recovery_attempts']}
- Successful Recoveries: {stats['successful_recoveries']}
- Circuit Breakers: {stats['circuit_breakers']}
- Auto-Fixes Registered: {stats['auto_fixes_registered']}""",
                break_loop=False
            )

        elif operation == "handle_error":
            error_type = self.args.get("error_type", "Exception")
            error_msg = self.args.get("error_message", "Unknown error")
            context = self.args.get("context", "")

            # Create synthetic error
            class SyntheticError(Exception):
                pass

            SyntheticError.__name__ = error_type
            error = SyntheticError(error_msg)

            result = await healer.handle_error(error, context)

            status_emoji = "✅" if result.success else "❌"

            return Response(
                message=f"""{status_emoji} **Error Handling Result:**

- Success: {result.success}
- Strategy: {result.strategy_used.name}
- Attempts: {result.attempts}
- Duration: {result.duration:.3f}s
- Message: {result.message}""",
                break_loop=False
            )

        else:
            return Response(
                message=f"Unknown operation: {operation}. Use: diagnose, health, stats, handle_error",
                break_loop=False
            )
