"""
Heisenberg Status API
=====================

REST API endpoint for Heisenberg Singularity system status and control.
Provides real-time status, health checks, and system control.
"""

import asyncio
import json
import traceback

from flask import Request, Response

from python.helpers.api import ApiHandler


class HeisenbergStatusApi(ApiHandler):
    """API handler for Heisenberg system status"""

    async def process(self, input: dict, request: Request) -> dict | Response:
        action = input.get("action", "status")

        try:
            # Import Heisenberg systems
            from python.helpers import heisenberg_ultimate
            ultimate = heisenberg_ultimate.get_heisenberg_ultimate()

            if action == "status":
                return await self._get_status(ultimate)

            elif action == "health":
                return await self._health_check(ultimate)

            elif action == "systems":
                return await self._list_systems(ultimate)

            elif action == "metrics":
                return await self._get_metrics(ultimate)

            elif action == "initialize":
                return await self._initialize(ultimate)

            elif action == "dashboard":
                return await self._get_dashboard(ultimate)

            else:
                return {
                    "ok": False,
                    "error": f"Unknown action: {action}"
                }

        except Exception as e:
            traceback.print_exc()
            return {
                "ok": False,
                "error": str(e)
            }

    async def _get_status(self, ultimate) -> dict:
        """Get comprehensive status"""
        if not ultimate.initialized:
            return {
                "ok": True,
                "initialized": False,
                "message": "Heisenberg not initialized"
            }

        status = ultimate.get_status()
        return {
            "ok": True,
            **status
        }

    async def _health_check(self, ultimate) -> dict:
        """Perform health check"""
        if not ultimate.initialized:
            await ultimate.initialize()

        health = await ultimate.health_check()
        return {
            "ok": True,
            **health
        }

    async def _list_systems(self, ultimate) -> dict:
        """List all systems by category"""
        if not ultimate.initialized:
            await ultimate.initialize()

        systems_info = {}
        for category, system_names in ultimate.categories.items():
            systems_info[category] = []
            for name in system_names:
                metric = ultimate.metrics.get(name)
                systems_info[category].append({
                    "name": name,
                    "status": metric.status.value if metric else "unknown",
                    "calls": metric.calls if metric else 0,
                    "errors": metric.errors if metric else 0
                })

        return {
            "ok": True,
            "categories": systems_info
        }

    async def _get_metrics(self, ultimate) -> dict:
        """Get detailed metrics"""
        if not ultimate.initialized:
            return {"ok": True, "metrics": {}}

        metrics = {}
        for name, m in ultimate.metrics.items():
            metrics[name] = {
                "status": m.status.value,
                "calls": m.calls,
                "errors": m.errors,
                "error_rate": m.error_rate,
                "avg_time": m.avg_time,
                "total_time": m.total_time,
                "last_call": m.last_call
            }

        return {
            "ok": True,
            "metrics": metrics
        }

    async def _initialize(self, ultimate) -> dict:
        """Initialize Heisenberg systems"""
        if ultimate.initialized:
            return {
                "ok": True,
                "message": "Already initialized",
                "initialized": True
            }

        success = await ultimate.initialize()
        return {
            "ok": success,
            "initialized": success,
            "message": "Initialized successfully" if success else "Initialization failed"
        }

    async def _get_dashboard(self, ultimate) -> dict:
        """Get dashboard data for UI"""
        if not ultimate.initialized:
            await ultimate.initialize()

        status = ultimate.get_status()
        health = await ultimate.health_check()

        # Calculate summary stats
        total_calls = sum(m.calls for m in ultimate.metrics.values())
        total_errors = sum(m.errors for m in ultimate.metrics.values())

        # Get recent task history
        recent_tasks = []
        for task in ultimate.task_history[-10:]:
            recent_tasks.append({
                "success": task.success,
                "time": task.processing_time,
                "systems": task.systems_used,
                "confidence": task.confidence
            })

        return {
            "ok": True,
            "dashboard": {
                "version": status["version"],
                "codename": status["codename"],
                "initialized": status["initialized"],
                "uptime": status["uptime"],
                "systems": {
                    "total": status["systems"]["total"],
                    "online": status["systems"]["online"],
                    "offline": status["systems"]["offline"]
                },
                "health": {
                    "overall": health["overall_health"],
                    "details": health["systems"]
                },
                "stats": {
                    "total_calls": total_calls,
                    "total_errors": total_errors,
                    "error_rate": total_errors / total_calls if total_calls > 0 else 0,
                    "tasks_completed": len(ultimate.task_history),
                    "success_rate": status["tasks"]["success_rate"]
                },
                "categories": status["categories"],
                "recent_tasks": recent_tasks
            }
        }
