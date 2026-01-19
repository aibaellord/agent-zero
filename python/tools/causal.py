"""
CAUSAL REASONING TOOL
=====================
Cause-effect chains and counterfactual analysis.
"""

from python.helpers.temporal_causal_engine import (CausalRelationType,
                                                   get_temporal_causal_engine)
from python.helpers.tool import Response, Tool


class CausalTool(Tool):
    """Tool for causal reasoning operations"""

    async def execute(self, **kwargs):
        engine = get_temporal_causal_engine()
        operation = self.args.get("operation", "status")

        if operation == "add_event":
            event_id = self.args.get("event_id", "")
            name = self.args.get("name", event_id)
            value = self.args.get("value", None)

            engine.add_event(event_id, name, value)

            return Response(
                message=f"📍 Added event: {name} (id: {event_id})",
                break_loop=False
            )

        elif operation == "add_cause":
            cause = self.args.get("cause", "")
            effect = self.args.get("effect", "")
            strength = self.args.get("strength", 1.0)
            relation = self.args.get("relation", "CAUSES")

            rel_type = CausalRelationType[relation.upper()] if relation else CausalRelationType.CAUSES
            engine.add_causation(cause, effect, rel_type, strength)

            return Response(
                message=f"🔗 Added causation: {cause} → {effect} (strength: {strength})",
                break_loop=False
            )

        elif operation == "what_if":
            node = self.args.get("node", "")
            value = self.args.get("value", None)
            steps = self.args.get("steps", 10)

            result = engine.what_if(node, value, steps)

            msg = f"""🤔 **What-If Analysis:**

**Intervention:** Set {node} = {value}

**Affected Nodes:** {len(result.get('affected_nodes', []))}
"""
            final_state = result.get('final_state', {})
            for node_id, val in list(final_state.items())[:10]:
                msg += f"- {node_id}: {val}\n"

            return Response(message=msg, break_loop=False)

        elif operation == "why":
            effect = self.args.get("effect", "")
            result = engine.why(effect)

            msg = f"""❓ **Why Analysis for: {effect}**

**Direct Causes:** {', '.join(result.get('direct_causes', []))}

**Root Causes:**
"""
            for root in result.get('root_causes', [])[:5]:
                msg += f"- {root['root']} (path: {' → '.join(root['path'])}, strength: {root['strength']:.2f})\n"

            if result.get('blame_attribution'):
                msg += "\n**Blame Attribution:**\n"
                for cause, blame in result['blame_attribution'].items():
                    msg += f"- {cause}: {blame:.0%}\n"

            return Response(message=msg, break_loop=False)

        elif operation == "chain":
            start = self.args.get("start", "")
            end = self.args.get("end", "")

            result = engine.get_causal_chain(start, end)

            if not result.get('exists'):
                return Response(
                    message=f"No causal chain found from {start} to {end}",
                    break_loop=False
                )

            msg = f"""⛓️ **Causal Chain: {start} → {end}**

**Paths Found:** {len(result.get('paths', []))}
"""
            if result.get('strongest_path'):
                sp = result['strongest_path']
                msg += f"\n**Strongest Path:**\n"
                msg += f"- Path: {' → '.join(sp['path'])}\n"
                msg += f"- Strength: {sp['total_strength']:.2f}\n"
                msg += f"- Delay: {sp['total_delay']:.1f}s\n"

            return Response(message=msg, break_loop=False)

        elif operation == "status":
            stats = engine.get_statistics()

            return Response(
                message=f"""⏱️ **Temporal Causal Engine Status:**

- Nodes (events): {stats['nodes']}
- Edges (causations): {stats['edges']}
- Events logged: {stats['events_logged']}
- Learned relations: {stats['learned_relations']}
- Simulations run: {stats['simulations_run']}""",
                break_loop=False
            )

        else:
            return Response(
                message=f"Unknown operation: {operation}. Use: add_event, add_cause, what_if, why, chain, status",
                break_loop=False
            )
