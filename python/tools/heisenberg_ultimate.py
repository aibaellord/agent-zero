"""
Heisenberg Ultimate Tool
========================

Unified access to the complete Heisenberg Singularity system.
"""

import asyncio

from python.helpers import heisenberg_ultimate
from python.helpers.tool import Response, Tool


class HeisenbergUltimateTool(Tool):
    """
    Access the full power of Heisenberg Singularity.

    This tool provides unified access to all 23 cognitive systems,
    18 power instruments, and the complete Heisenberg architecture.
    """

    async def execute(self, **kwargs) -> Response:
        action = self.args.get("action", "status")

        # Get or initialize the ultimate system
        try:
            ultimate = heisenberg_ultimate.get_heisenberg_ultimate()
            if not ultimate.initialized:
                await ultimate.initialize(self.agent)
        except Exception as e:
            return Response(
                message=f"❌ Failed to initialize Heisenberg Ultimate: {e}",
                break_loop=False
            )

        try:
            if action == "status":
                return await self._get_status(ultimate)

            elif action == "process":
                return await self._process_task(ultimate)

            elif action == "health":
                return await self._health_check(ultimate)

            elif action == "systems":
                return await self._list_systems(ultimate)

            elif action == "query":
                return await self._query_system(ultimate)

            else:
                return Response(
                    message=f"Unknown action: {action}. Available: status, process, health, systems, query",
                    break_loop=False
                )

        except Exception as e:
            return Response(
                message=f"❌ Error executing {action}: {e}",
                break_loop=False
            )

    async def _get_status(self, ultimate) -> Response:
        """Get comprehensive system status"""
        status = ultimate.get_status()

        lines = [
            "🔬 **HEISENBERG ULTIMATE STATUS**",
            f"Version: {status['version']} ({status['codename']})",
            f"Initialized: {'✅' if status['initialized'] else '❌'}",
            f"Uptime: {status['uptime']:.1f}s",
            "",
            "**Systems:**",
            f"  Online: {status['systems']['online']}/{status['systems']['total']}",
            "",
            "**Categories:**"
        ]

        for cat, count in status['categories'].items():
            lines.append(f"  {cat}: {count} systems")

        if status['tasks']['completed'] > 0:
            lines.extend([
                "",
                "**Tasks:**",
                f"  Completed: {status['tasks']['completed']}",
                f"  Success Rate: {status['tasks']['success_rate']:.1%}"
            ])

        return Response(message="\n".join(lines), break_loop=False)

    async def _process_task(self, ultimate) -> Response:
        """Process a task through the unified system"""
        task = self.args.get("task", "")
        context = self.args.get("context", {})
        systems = self.args.get("systems")
        strategy = self.args.get("strategy", "auto")

        if not task:
            return Response(
                message="❌ No task provided. Use 'task' argument.",
                break_loop=False
            )

        result = await ultimate.process(
            task=task,
            context=context,
            systems=systems,
            strategy=strategy
        )

        lines = [
            "🔬 **HEISENBERG PROCESSING RESULT**",
            f"Success: {'✅' if result.success else '❌'}",
            f"Confidence: {result.confidence:.1%}",
            f"Time: {result.processing_time:.3f}s",
            f"Systems Used: {', '.join(result.systems_used)}",
            "",
            "**Result:**"
        ]

        if result.success:
            lines.append(str(result.result)[:500])
        else:
            lines.append(f"Error: {result.error}")

        return Response(message="\n".join(lines), break_loop=False)

    async def _health_check(self, ultimate) -> Response:
        """Perform system health check"""
        health = await ultimate.health_check()

        lines = [
            "🏥 **HEISENBERG HEALTH CHECK**",
            f"Overall: {'✅ HEALTHY' if health['overall_health'] else '⚠️ ISSUES DETECTED'}",
            "",
            "**System Status:**"
        ]

        healthy_count = 0
        for name, status in health['systems'].items():
            if status.get('healthy'):
                healthy_count += 1
                lines.append(f"  ✅ {name}")
            else:
                lines.append(f"  ❌ {name}: {status.get('error', 'Unknown error')}")

        lines.insert(2, f"Healthy: {healthy_count}/{len(health['systems'])}")

        return Response(message="\n".join(lines), break_loop=False)

    async def _list_systems(self, ultimate) -> Response:
        """List all available systems"""
        status = ultimate.get_status()

        lines = [
            "🧠 **HEISENBERG SYSTEMS**",
            ""
        ]

        for category, systems in ultimate.categories.items():
            if systems:
                lines.append(f"**{category.upper()}:**")
                for sys_name in systems:
                    metric = status['metrics'].get(sys_name, {})
                    sys_status = metric.get('status', 'unknown')
                    icon = "✅" if sys_status == 'online' else "❌"
                    lines.append(f"  {icon} {sys_name}")
                lines.append("")

        return Response(message="\n".join(lines), break_loop=False)

    async def _query_system(self, ultimate) -> Response:
        """Query a specific system"""
        system_name = self.args.get("system", "")
        query = self.args.get("query", "")

        if not system_name:
            return Response(
                message="❌ No system specified. Use 'system' argument.",
                break_loop=False
            )

        system = ultimate.get_system(system_name)
        if not system:
            return Response(
                message=f"❌ System '{system_name}' not found.",
                break_loop=False
            )

        # Try common methods
        result = None
        if hasattr(system, 'get_status'):
            result = system.get_status() if not asyncio.iscoroutinefunction(system.get_status) else await system.get_status()
        elif hasattr(system, 'status'):
            result = system.status

        return Response(
            message=f"📊 **{system_name}**\n\n{result}",
            break_loop=False
        )
