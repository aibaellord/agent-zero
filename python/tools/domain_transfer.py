"""
DOMAIN TRANSFER TOOL
====================
Zero-shot knowledge transfer between domains.
"""

from python.helpers.tool import Response, Tool
from python.helpers.zero_shot_adapter import get_zero_shot_adapter


class DomainTransferTool(Tool):
    """Tool for zero-shot domain transfer"""

    async def execute(self, **kwargs):
        adapter = get_zero_shot_adapter()
        operation = self.args.get("operation", "status")

        if operation == "register":
            domain = self.args.get("domain", "")
            concepts = self.args.get("concepts", [])
            relations = self.args.get("relations", [])

            adapter.register_domain(domain, concepts, relations)

            return Response(
                message=f"📚 Registered domain '{domain}' with {len(concepts)} concepts and {len(relations)} relations",
                break_loop=False
            )

        elif operation == "transfer":
            source = self.args.get("source_domain", "")
            target = self.args.get("target_domain", "")
            solution = self.args.get("solution", {})

            result = adapter.transfer_knowledge(source, target, solution)

            if 'error' in result:
                return Response(
                    message=f"❌ Transfer failed: {result['error']}",
                    break_loop=False
                )

            msg = f"""🔄 **Knowledge Transfer: {source} → {target}**

**Confidence:** {result['mapping']['confidence']:.0%}

**Shared Patterns:** {', '.join(result['mapping']['shared_patterns']) or 'None'}

**Concept Mappings:**
"""
            for src, tgt in list(result['mapping']['concept_map'].items())[:10]:
                msg += f"- {src} → {tgt}\n"

            if result.get('recommendations'):
                msg += "\n**Recommendations:**\n"
                for rec in result['recommendations']:
                    msg += f"- {rec}\n"

            return Response(message=msg, break_loop=False)

        elif operation == "confidence":
            source = self.args.get("source_domain", "")
            target = self.args.get("target_domain", "")

            confidence = adapter.get_transfer_confidence(source, target)

            bar = "█" * int(confidence * 20) + "░" * (20 - int(confidence * 20))

            return Response(
                message=f"📊 Transfer confidence {source} → {target}:\n[{bar}] {confidence:.0%}",
                break_loop=False
            )

        elif operation == "status":
            stats = adapter.get_statistics()

            msg = f"""🌍 **Zero-Shot Domain Adapter Status:**

- Registered Domains: {stats['registered_domains']}
- Total Concepts: {stats['total_concepts']}
- Total Bridges: {stats['total_bridges']}
- Successful Transfers: {stats['successful_transfers']}
"""

            if stats['pattern_coverage']:
                msg += "\n**Pattern Coverage:**\n"
                for domain, patterns in stats['pattern_coverage'].items():
                    msg += f"- {domain}: {', '.join(patterns[:3])}...\n"

            return Response(message=msg, break_loop=False)

        else:
            return Response(
                message=f"Unknown operation: {operation}. Use: register, transfer, confidence, status",
                break_loop=False
            )
