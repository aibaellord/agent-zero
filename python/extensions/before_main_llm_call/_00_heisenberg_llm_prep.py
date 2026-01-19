"""
HEISENBERG LLM PREPARATION
==========================
Prepare context before main LLM call.
Injects Heisenberg state summary into context.
"""

from python.helpers.extension import Extension


class HeisenbergLLMPrep(Extension):
    """Prepare LLM call with Heisenberg context"""

    async def execute(self, **kwargs):
        heisenberg = self.agent.get_data("heisenberg_core")
        if not heisenberg:
            return

        # Prepare concise state summary for LLM context awareness
        state_summary = {
            'quantum_branches': len(heisenberg.quantum.branches),
            'top_hypothesis': None,
            'memory_structure': heisenberg.topology.betti_numbers if heisenberg.topology.betti_numbers else [0, 0, 0],
            'reasoning_mode': 'exploration' if heisenberg.self_modifier.meta_parameters.get('exploration_rate', 0.3) > 0.4 else 'exploitation',
            'performance': heisenberg.performance
        }

        # Get top hypothesis
        top = heisenberg.quantum.get_top_branches(1)
        if top:
            state_summary['top_hypothesis'] = top[0].hypothesis[:100]

        self.agent.set_data("heisenberg_llm_context", state_summary)

        # Reset response tracking for this call
        self.agent.set_data("response_buffer", "")
        self.agent.set_data("response_token_count", 0)
        self.agent.set_data("hypothesis_branch_count", 0)
