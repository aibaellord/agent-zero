from python.helpers import resource_monitor as rm
from python.helpers.tool import Response, Tool


class ResourceTrack(Tool):
    """Tool for tracking tokens, memory, time, and costs."""

    async def execute(self, **kwargs):
        operation = self.args.get("operation", "status")

        monitor = rm.get_resource_monitor()

        if operation == "record":
            op_name = self.args.get("name", "operation")
            tokens_in = self.args.get("tokens_in", 0)
            tokens_out = self.args.get("tokens_out", 0)
            model = self.args.get("model", "default")
            time_ms = self.args.get("time_ms", 0.0)

            usage = monitor.record_usage(op_name, tokens_in, tokens_out, model, time_ms)

            return Response(
                message=f"📊 Recorded usage:\n" +
                        f"  Operation: {op_name}\n" +
                        f"  Tokens: {usage.total_tokens} ({tokens_in} in, {tokens_out} out)\n" +
                        f"  Cost: ${usage.cost:.4f}\n" +
                        f"  Time: {time_ms:.2f}ms",
                break_loop=False
            )

        elif operation == "start":
            op_id = self.args.get("id", "operation")
            monitor.start_operation(op_id)
            return Response(
                message=f"⏱️ Started timing: {op_id}",
                break_loop=False
            )

        elif operation == "end":
            op_id = self.args.get("id", "operation")
            tokens_in = self.args.get("tokens_in", 0)
            tokens_out = self.args.get("tokens_out", 0)
            model = self.args.get("model", "default")

            usage = monitor.end_operation(op_id, tokens_in, tokens_out, model)

            return Response(
                message=f"⏱️ Completed: {op_id}\n" +
                        f"  Duration: {usage.time_ms:.2f}ms\n" +
                        f"  Tokens: {usage.total_tokens}\n" +
                        f"  Cost: ${usage.cost:.4f}",
                break_loop=False
            )

        elif operation == "budget":
            budget = monitor.budget
            current = monitor.get_current_usage()

            return Response(
                message=f"💰 **Budget Status**\n" +
                        f"Hourly tokens: {current['budget']['hourly_usage_pct']:.1f}% used\n" +
                        f"  Remaining: {current['budget']['hourly_tokens_remaining']:,}\n" +
                        f"Daily tokens: {current['budget']['daily_usage_pct']:.1f}% used\n" +
                        f"  Remaining: {current['budget']['daily_tokens_remaining']:,}\n" +
                        f"Limits:\n" +
                        f"  Hourly: {budget.max_tokens_per_hour:,} tokens\n" +
                        f"  Daily: {budget.max_tokens_per_day:,} tokens",
                break_loop=False
            )

        elif operation == "capacity":
            capacity = monitor.estimate_remaining_capacity()

            return Response(
                message=f"📈 **Remaining Capacity**\n" +
                        f"Hourly tokens: {capacity['hourly_tokens_remaining']:,}\n" +
                        f"Daily tokens: {capacity['daily_tokens_remaining']:,}\n" +
                        f"Est. hourly ops: {capacity['estimated_hourly_operations']}\n" +
                        f"Est. daily ops: {capacity['estimated_daily_operations']}",
                break_loop=False
            )

        elif operation == "report":
            report = monitor.get_operation_report()

            lines = []
            for op_name, stats in list(report.items())[:10]:
                lines.append(
                    f"  {op_name}: {stats['count']} ops, "
                    f"{stats['tokens']} tokens, ${stats['cost']:.4f}"
                )

            return Response(
                message=f"📊 **Operations Report**\n" + "\n".join(lines) if lines
                        else "No operations recorded yet.",
                break_loop=False
            )

        elif operation == "alerts":
            alerts = monitor.alerts.get_recent_alerts(10)

            if alerts:
                alert_lines = [
                    f"  [{a['severity']}] {a['type']}: {a['message']}"
                    for a in alerts
                ]
                return Response(
                    message=f"🚨 **Recent Alerts**\n" + "\n".join(alert_lines),
                    break_loop=False
                )
            return Response(message="✅ No alerts.", break_loop=False)

        else:  # status
            current = monitor.get_current_usage()

            return Response(
                message=f"📊 **Resource Monitor Status**\n" +
                        f"Total tokens: {current['total_tokens']:,}\n" +
                        f"  In: {current['total_tokens_in']:,}\n" +
                        f"  Out: {current['total_tokens_out']:,}\n" +
                        f"Total cost: ${current['total_cost']:.4f}\n" +
                        f"Operations: {current['operation_count']}\n" +
                        f"Uptime: {current['uptime_seconds']:.0f}s\n" +
                        f"Tokens this hour: {current['tokens_this_hour']:,}\n" +
                        f"Tokens today: {current['tokens_today']:,}",
                break_loop=False
            )
