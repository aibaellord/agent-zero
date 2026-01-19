"""
META-COGNITIVE TOOL
===================
Thinking about thinking - cognitive quality monitoring.
"""

from python.helpers.meta_cognitive_monitor import get_meta_cognitive_monitor
from python.helpers.tool import Response, Tool


class MetaCognitiveTool(Tool):
    """Tool for meta-cognitive monitoring"""

    async def execute(self, **kwargs):
        monitor = get_meta_cognitive_monitor()
        operation = self.args.get("operation", "status")

        if operation == "add_step":
            content = self.args.get("content", "")
            step_type = self.args.get("step_type", "inference")
            confidence = self.args.get("confidence", 0.7)
            dependencies = self.args.get("dependencies", [])

            step_id = monitor.add_reasoning_step(
                content, step_type, confidence, dependencies
            )

            return Response(
                message=f"🧠 Added reasoning step #{step_id}: {content[:50]}... (confidence: {confidence:.0%})",
                break_loop=False
            )

        elif operation == "focus":
            topic = self.args.get("topic", "")
            original = self.args.get("original_topic", None)

            monitor.focus(topic, original)

            return Response(
                message=f"🎯 Focus shifted to: {topic}",
                break_loop=False
            )

        elif operation == "assess":
            quality, details = monitor.get_quality_assessment()
            recommendations = monitor.get_recommendations()

            msg = f"""🔍 **Reasoning Quality Assessment:**

**Quality Level:** {quality.name} ({details['score']:.1f}/5)
- Cognitive Load: {details['cognitive_load']:.0%}
- Chain Confidence: {details['confidence']:.0%}
- Reasoning Depth: {details['depth']} steps
- Active Alerts: {details['active_alerts']}
"""

            if details['weakest_links']:
                msg += "\n**Weakest Links:**\n"
                for link in details['weakest_links']:
                    msg += f"- {link}\n"

            if recommendations:
                msg += "\n**Recommendations:**\n"
                for rec in recommendations:
                    msg += f"- {rec}\n"

            return Response(message=msg, break_loop=False)

        elif operation == "status":
            state = monitor.get_current_state()
            stats = monitor.get_statistics()

            return Response(
                message=f"""🧠 **Meta-Cognitive Status:**

**Current State:**
- Cognitive Load: {state.cognitive_load:.0%}
- Attention Focus: {state.attention_focus}
- Active Goals: {state.active_goals}
- Reasoning Depth: {state.reasoning_depth}
- Confidence: {state.confidence:.0%}
- Uncertainty: {state.uncertainty:.0%}

**Statistics:**
- Total Steps: {stats['total_reasoning_steps']}
- Total Alerts: {stats['total_alerts']}
- Load Trend: {stats['load_trend']}
- Correction Triggers: {stats['correction_triggers']}""",
                break_loop=False
            )

        elif operation == "reset":
            monitor.reset_chain()
            return Response(
                message="🔄 Reasoning chain reset.",
                break_loop=False
            )

        else:
            return Response(
                message=f"Unknown operation: {operation}. Use: add_step, focus, assess, status, reset",
                break_loop=False
            )
