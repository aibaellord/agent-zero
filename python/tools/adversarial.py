"""
ADVERSARIAL TOOL
================
Red team / Blue team adversarial reasoning tool.
"""

from python.helpers.adversarial_reasoning import get_adversarial_system
from python.helpers.tool import Response, Tool


class AdversarialTool(Tool):
    """Tool for adversarial reasoning operations"""

    async def execute(self, **kwargs):
        adversarial = get_adversarial_system()
        operation = self.args.get("operation", "stress_test")

        if operation == "stress_test":
            conclusion = self.args.get("conclusion", "")
            reasoning = self.args.get("reasoning", "")
            assumptions = self.args.get("assumptions", [])

            result = adversarial.stress_test(
                conclusion, reasoning, assumptions
            )

            return Response(
                message=self._format_stress_test(result),
                break_loop=False
            )

        elif operation == "attack":
            conclusion = self.args.get("conclusion", "")
            attacks = adversarial.red_team.attack(conclusion)

            attack_lines = []
            for attack in attacks:
                attack_lines.append(
                    f"- [{attack.attack_type.name}] ({attack.severity:.0%} severity): {attack.attack_content}"
                )

            return Response(
                message=f"⚔️ **Red Team Attacks:**\n" + "\n".join(attack_lines),
                break_loop=False
            )

        elif operation == "steelman":
            argument = self.args.get("argument", "")
            steelmanned = adversarial.steelman(argument)

            return Response(
                message=f"💪 **Steelmanned Argument:**\n{steelmanned}",
                break_loop=False
            )

        elif operation == "status":
            stats = adversarial.get_statistics()
            return Response(
                message=f"""🎯 **Adversarial System Status:**
- Total attacks: {stats['total_attacks']}
- Total defenses: {stats['total_defenses']}
- Defense success rate: {stats['defense_success_rate']:.1%}
- Battles fought: {stats['battles_fought']}
- Average final confidence: {stats['avg_final_confidence']:.1%}""",
                break_loop=False
            )

        else:
            return Response(
                message=f"Unknown operation: {operation}. Use: stress_test, attack, steelman, status",
                break_loop=False
            )

    def _format_stress_test(self, result):
        msg = f"""🔬 **Stress Test Results:**

**Conclusion:** {result['conclusion'][:100]}...

**Attacks Found:** {len(result['attacks'])}
"""
        for attack in result['attacks'][:5]:
            msg += f"- [{attack['type']}] {attack['content'][:60]}...\n"

        msg += f"""
**Final Confidence:** {result['final_confidence']:.1%}

**Vulnerabilities:** {len(result['vulnerabilities'])}
"""
        for vuln in result['vulnerabilities'][:3]:
            msg += f"- {vuln['type']}: {vuln['description'][:50]}...\n"

        if result['recommendations']:
            msg += "\n**Recommendations:**\n"
            for rec in result['recommendations']:
                msg += f"- {rec}\n"

        return msg
