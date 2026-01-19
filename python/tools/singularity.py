"""
SINGULARITY TOOL
================
The ultimate tool - unified access to the complete Heisenberg Singularity.
"""

from python.helpers.singularity_core import get_singularity_core
from python.helpers.tool import Response, Tool


class SingularityTool(Tool):
    """The ultimate unified cognitive tool"""

    async def execute(self, **kwargs):
        core = get_singularity_core()
        operation = self.args.get("operation", "status")

        if operation == "boot":
            result = await core.boot()

            systems = ", ".join(result['systems_initialized'])

            return Response(
                message=f"""🚀 **SINGULARITY ONLINE**

**Systems Initialized:** {len(result['systems_initialized'])}
- {systems}

**Consciousness Level:** {result['consciousness_level']:.0%}
**Boot Duration:** {result['duration']:.3f}s
**Status:** {result['status'].upper()}

The Heisenberg Singularity is now fully operational.""",
                break_loop=False
            )

        elif operation == "think":
            input_text = self.args.get("input", "")
            depth = self.args.get("depth", 3)

            result = await core.think(input_text, depth)

            msg = f"""🧠 **SINGULARITY COGNITION**

**Input:** {result['input'][:100]}...
**Depth:** {result['depth']} layers

**Processing Layers:**
"""
            for layer in result['layers']:
                msg += f"  • {layer['layer']}: "
                if 'complexity' in layer:
                    msg += f"Complexity={layer['complexity']}"
                elif 'confidence' in layer:
                    msg += f"Confidence={layer['confidence']:.0%}"
                elif 'strategies' in layer:
                    msg += f"Strategies={layer['strategies']}"
                else:
                    msg += "processed"
                msg += "\n"

            msg += f"""
**Conclusion:**
- Quality: {result['conclusion']['quality']}
- Confidence: {result['conclusion']['final_confidence']:.0%}
- Reasoning Depth: {result['conclusion']['reasoning_depth']} steps"""

            return Response(message=msg, break_loop=False)

        elif operation == "evolve":
            result = await core.evolve()

            msg = f"""🔄 **SINGULARITY EVOLUTION #{result['evolution_number']}**

**Analysis:**
- Health: {result['analysis']['health']['status']}
- Reasoning Quality: {result['analysis']['reasoning_quality']}

**Improvements Identified:**
"""
            for imp in result['improvements'] or ['No improvements needed']:
                msg += f"  • {imp}\n"

            return Response(message=msg, break_loop=False)

        elif operation == "status":
            report = core.generate_status_report()
            return Response(message=report, break_loop=False)

        elif operation == "state":
            state = core.get_state()

            return Response(
                message=f"""📊 **SINGULARITY STATE**

- Consciousness: {state.consciousness_level:.0%}
- Cognitive Load: {state.cognitive_load:.0%}
- Health Score: {state.health_score:.0%}
- Performance: {state.performance_score:.0%}
- Active Goals: {state.active_goals}
- Emergent Patterns: {state.emergent_patterns}
- Self-Modifications: {state.self_modifications}
- Adversarial Confidence: {state.adversarial_confidence:.0%}""",
                break_loop=False
            )

        else:
            return Response(
                message=f"Unknown operation: {operation}. Use: boot, think, evolve, status, state",
                break_loop=False
            )
