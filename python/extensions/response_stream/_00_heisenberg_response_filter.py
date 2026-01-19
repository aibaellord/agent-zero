"""
HEISENBERG RESPONSE FILTER
==========================
Filter and enhance response stream.
"""

from python.helpers.extension import Extension


class HeisenbergResponseFilter(Extension):
    """Filter response with Heisenberg awareness"""

    async def execute(self, chunk: str = "", **kwargs):
        if not chunk:
            return

        # Track response for analysis
        response_buffer = self.agent.get_data("response_buffer") or ""
        response_buffer += chunk

        if len(response_buffer) > 10000:
            response_buffer = response_buffer[-5000:]

        self.agent.set_data("response_buffer", response_buffer)

        # Count response tokens
        token_count = self.agent.get_data("response_token_count") or 0
        # Approximate tokens (words / 0.75)
        token_count += len(chunk.split()) / 0.75
        self.agent.set_data("response_token_count", token_count)
