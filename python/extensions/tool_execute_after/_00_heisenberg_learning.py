"""
HEISENBERG LEARNING
===================
After tool execution, learn from results.
Updates quantum states, memory topology, and self-modifying parameters.
"""

import hashlib
import time

import numpy as np

from python.helpers.extension import Extension
from python.helpers.heisenberg_core import get_heisenberg_core


class HeisenbergLearning(Extension):
    """Learn from tool execution results"""

    async def execute(self, tool, response, **kwargs):
        heisenberg = self.agent.get_data("heisenberg_core")
        if not heisenberg:
            return

        tool_name = tool.name if hasattr(tool, 'name') else str(tool)
        result_message = response.message if hasattr(response, 'message') else str(response)

        # 1. Evaluate execution success
        success_indicators = ['success', 'completed', 'done', 'result', 'output']
        failure_indicators = ['error', 'failed', 'exception', 'cannot', 'unable']

        result_lower = result_message.lower()
        success_score = sum(1 for ind in success_indicators if ind in result_lower)
        failure_score = sum(1 for ind in failure_indicators if ind in result_lower)

        execution_success = success_score > failure_score

        # 2. Update quantum branches based on outcome
        def outcome_relevance(hypothesis: str, evidence: str) -> float:
            """Boost hypotheses related to successful execution"""
            if execution_success:
                return 0.1 if tool_name.lower() in hypothesis.lower() else 0.0
            else:
                return -0.1 if tool_name.lower() in hypothesis.lower() else 0.0

        heisenberg.quantum.apply_evidence(
            f"Tool {tool_name} result: {'success' if execution_success else 'failure'}",
            outcome_relevance
        )

        # 3. Add to topological memory
        # Create embedding from result
        result_hash = int(hashlib.md5(result_message.encode()).hexdigest()[:8], 16)
        np.random.seed(result_hash % 10000)
        result_embedding = np.random.randn(128)

        heisenberg.topology.add_memory(
            result_embedding,
            f"Tool:{tool_name} Success:{execution_success}"
        )

        # 4. Update performance metrics for self-modification
        current_performance = heisenberg.performance.copy()

        if execution_success:
            current_performance['reasoning_accuracy'] = min(
                0.99, current_performance['reasoning_accuracy'] + 0.01
            )
            current_performance['efficiency'] = min(
                0.99, current_performance['efficiency'] + 0.01
            )
        else:
            current_performance['reasoning_accuracy'] = max(
                0.1, current_performance['reasoning_accuracy'] - 0.02
            )

        heisenberg.performance = current_performance

        # 5. Trigger self-modification adaptation
        heisenberg.self_modifier.adapt_parameters(current_performance)

        # 6. Record mutation opportunity
        if not execution_success:
            # Generate behavior mutation suggestion
            current_behavior = f"Use {tool_name} with standard approach"
            mutation = heisenberg.self_modifier.generate_behavior_mutation(current_behavior)

            self.agent.set_data("suggested_behavior_mutation", mutation)

        # 7. Update swarm with learning
        swarm = self.agent.get_data("swarm_intelligence")
        if swarm:
            # Strengthen or weaken pheromone based on outcome
            modifier = 1.2 if execution_success else 0.8

            for deposit in swarm.pheromone_field.deposits[-10:]:
                if deposit['type'] == 'tool_usage':
                    deposit['strength'] *= modifier

        # 8. Log learning event
        learning_event = {
            'timestamp': time.time(),
            'tool': tool_name,
            'success': execution_success,
            'performance': current_performance,
            'quantum_branches': len(heisenberg.quantum.branches),
            'memory_points': len(heisenberg.topology.points)
        }

        learning_history = self.agent.get_data("heisenberg_learning_history") or []
        learning_history.append(learning_event)
        self.agent.set_data("heisenberg_learning_history", learning_history[-100:])  # Keep last 100
