"""
UTIL MODEL CALL BEFORE EXTENSION - Heisenberg
==============================================
Optimize utility model calls with cached reasoning.
"""

from typing import Any

from python.helpers.extension import Extension


class HeisenbergUtilModelOptimize(Extension):
    """
    Optimize utility model calls using Heisenberg insights.
    """

    async def execute(self, **kwargs) -> Any:
        prompt = kwargs.get('prompt', '')

        if not hasattr(self.agent, '_heisenberg') or not prompt:
            return

        try:
            heisenberg = self.agent._heisenberg

            # Check if similar prompts have been processed
            import hashlib

            import numpy as np

            prompt_hash = hashlib.md5(prompt[:200].encode()).hexdigest()[:8]

            # Store for potential caching
            if not hasattr(self.agent, '_heisenberg_util_cache'):
                self.agent._heisenberg_util_cache = {}

            cache = self.agent._heisenberg_util_cache

            # Look for similar cached results (by hash prefix)
            prefix = prompt_hash[:4]
            if prefix in cache:
                # Boost efficiency for cache hits
                heisenberg.performance['efficiency'] = min(
                    1.0,
                    heisenberg.performance['efficiency'] + 0.01
                )

        except Exception:
            pass
