"""
HEISENBERG REASONING ENHANCEMENT
================================
Enhance reasoning stream with quantum branch tracking.
"""

from python.helpers.extension import Extension


class HeisenbergReasoningEnhance(Extension):
    """Enhance reasoning with Heisenberg tracking"""

    async def execute(self, chunk: str = "", **kwargs):
        heisenberg = self.agent.get_data("heisenberg_core")
        if not heisenberg or not chunk:
            return

        # Track reasoning tokens for pattern analysis
        reasoning_tokens = self.agent.get_data("reasoning_token_buffer") or ""
        reasoning_tokens += chunk

        # Keep buffer manageable
        if len(reasoning_tokens) > 5000:
            reasoning_tokens = reasoning_tokens[-2500:]

        self.agent.set_data("reasoning_token_buffer", reasoning_tokens)

        # Look for hypothesis indicators in reasoning
        hypothesis_indicators = ['maybe', 'perhaps', 'could', 'might', 'possibly',
                                'alternative', 'another approach', 'or we could']

        chunk_lower = chunk.lower()
        for indicator in hypothesis_indicators:
            if indicator in chunk_lower:
                # Found hypothesis branch point
                branch_count = self.agent.get_data("hypothesis_branch_count") or 0
                self.agent.set_data("hypothesis_branch_count", branch_count + 1)
                break
