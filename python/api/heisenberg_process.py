"""
Heisenberg Process API
======================

REST API endpoint for processing tasks through Heisenberg systems.
"""

import json
import traceback

from flask import Request, Response

from python.helpers.api import ApiHandler


class HeisenbergProcessApi(ApiHandler):
    """API handler for Heisenberg task processing"""

    async def process(self, input: dict, request: Request) -> dict | Response:
        try:
            from python.helpers import heisenberg_ultimate
            ultimate = heisenberg_ultimate.get_heisenberg_ultimate()

            if not ultimate.initialized:
                await ultimate.initialize()

            task = input.get("task", "")
            context = input.get("context", {})
            systems = input.get("systems")
            strategy = input.get("strategy", "auto")

            if not task:
                return {
                    "ok": False,
                    "error": "No task provided"
                }

            result = await ultimate.process(
                task=task,
                context=context,
                systems=systems,
                strategy=strategy
            )

            return {
                "ok": True,
                "result": {
                    "success": result.success,
                    "data": str(result.result) if result.result else None,
                    "error": result.error,
                    "systems_used": result.systems_used,
                    "processing_time": result.processing_time,
                    "confidence": result.confidence
                }
            }

        except Exception as e:
            traceback.print_exc()
            return {
                "ok": False,
                "error": str(e)
            }
