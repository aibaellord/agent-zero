from python.helpers import expert_router as er
from python.helpers.tool import Response, Tool


class ExpertRoute(Tool):
    """Tool for routing tasks to specialized expert systems."""

    async def execute(self, **kwargs):
        operation = self.args.get("operation", "route")

        router = er.get_expert_router()

        if operation == "route":
            task = self.args.get("task", "")

            if not task:
                return Response(
                    message="❌ Task description required.",
                    break_loop=False
                )

            decision = router.route(task)

            alt_str = ""
            if decision.alternatives:
                alt_str = "\n  Alternatives: " + ", ".join([
                    f"{e.name} ({c:.0%})" for e, c in decision.alternatives[:3]
                ])

            return Response(
                message=f"🎯 **Routing Decision**\n" +
                        f"  Task: {task[:80]}...\n" +
                        f"  Expert: {decision.expert.name}\n" +
                        f"  Domain: {decision.expert.domain.value}\n" +
                        f"  Confidence: {decision.confidence:.0%}\n" +
                        f"  Reasoning: {decision.reasoning}" +
                        alt_str,
                break_loop=False
            )

        elif operation == "register":
            name = self.args.get("name", "")
            domain = self.args.get("domain", "general")
            patterns = self.args.get("patterns", [])
            capabilities = self.args.get("capabilities", [])

            if not name:
                return Response(
                    message="❌ Expert name required.",
                    break_loop=False
                )

            try:
                domain_enum = er.ExpertDomain(domain)
            except ValueError:
                domain_enum = er.ExpertDomain.GENERAL

            expert = er.Expert(
                name=name,
                domain=domain_enum,
                patterns=patterns,
                capabilities=capabilities
            )
            router.register_expert(expert)

            return Response(
                message=f"✅ Registered expert: {name}\n" +
                        f"  Domain: {domain}\n" +
                        f"  Capabilities: {capabilities}",
                break_loop=False
            )

        elif operation == "record":
            expert_name = self.args.get("expert", "")
            success = self.args.get("success", True)
            time_taken = self.args.get("time", 0.0)

            router.record_result(expert_name, success, time_taken)
            return Response(
                message=f"✅ Recorded result for {expert_name}: " +
                        f"{'success' if success else 'failure'} ({time_taken:.2f}s)",
                break_loop=False
            )

        elif operation == "stats":
            stats = router.get_expert_stats()

            expert_lines = [
                f"  {name}: {s['uses']} uses, {s['success_rate']:.0%} success"
                for name, s in list(stats.items())[:10]
            ]

            return Response(
                message=f"📊 **Expert Statistics**\n" + "\n".join(expert_lines),
                break_loop=False
            )

        elif operation == "rebalance":
            router.rebalance_priorities()
            return Response(
                message="⚖️ Expert priorities rebalanced based on performance.",
                break_loop=False
            )

        elif operation == "best":
            domain = self.args.get("domain", "general")

            try:
                domain_enum = er.ExpertDomain(domain)
            except ValueError:
                return Response(
                    message=f"❌ Unknown domain: {domain}",
                    break_loop=False
                )

            best = router.get_best_expert_for_domain(domain_enum)

            if best:
                return Response(
                    message=f"🏆 Best expert for {domain}:\n" +
                            f"  Name: {best.name}\n" +
                            f"  Success rate: {best.success_rate:.0%}\n" +
                            f"  Uses: {best.uses}",
                    break_loop=False
                )
            return Response(
                message=f"No experts found for domain: {domain}",
                break_loop=False
            )

        else:  # status
            stats = router.get_statistics()

            return Response(
                message=f"📊 **Expert Router Status**\n" +
                        f"Total experts: {stats['total_experts']}\n" +
                        f"Enabled: {stats['enabled_experts']}\n" +
                        f"Domains covered: {stats['domains_covered']}\n" +
                        f"Total routings: {stats['total_routings']}\n" +
                        f"Avg confidence: {stats['avg_confidence']:.0%}",
                break_loop=False
            )
