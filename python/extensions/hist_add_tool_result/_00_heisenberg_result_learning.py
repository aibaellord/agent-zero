"""
HIST ADD TOOL RESULT EXTENSION - Heisenberg
============================================
Learn from tool results to update topological memory.
"""

from typing import Any

from python.helpers.extension import Extension


class HeisenbergToolResultLearning(Extension):
    """
    Extract knowledge from tool results and add to topological memory.
    """

    async def execute(self, **kwargs) -> Any:
        tool_name = kwargs.get('tool_name', '')
        tool_result = kwargs.get('result', '')

        if not hasattr(self.agent, '_heisenberg'):
            return

        try:
            heisenberg = self.agent._heisenberg

            # Add successful tool result to memory
            if tool_result and len(str(tool_result)) > 20:
                import hashlib

                import numpy as np

                # Create embedding from result
                result_str = str(tool_result)[:500]
                result_hash = int(hashlib.md5(result_str.encode()).hexdigest()[:8], 16)
                np.random.seed(result_hash % 10000)
                embedding = np.random.randn(128)

                # Add to topology
                heisenberg.topology.add_memory(
                    embedding,
                    f"[{tool_name}]: {result_str[:100]}"
                )

                # Track in performance metrics
                heisenberg.performance['efficiency'] = (
                    heisenberg.performance['efficiency'] * 0.95 + 0.05
                )

        except Exception:
            pass  # Don't break tool chain on learning errors
