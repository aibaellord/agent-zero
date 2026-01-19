"""
Deep Memory Crystallization Extension
=======================================
Transforms successful solutions into diamond-hard knowledge crystals.
Exploits message_loop_end to crystallize learnings after each interaction.
"""
import hashlib
import time
from typing import Any
from python.helpers.extension import Extension


class DeepMemoryCrystallization(Extension):
    """
    Crystallizes successful problem-solving patterns into permanent memory.
    Creates 'diamond-hard' knowledge structures that persist and compound.
    """

    # Crystallization threshold - minimum quality for storage
    CRYSTAL_THRESHOLD = 0.7

    # Maximum crystals per session
    MAX_CRYSTALS_PER_SESSION = 10

    # Session crystal counter
    _session_crystals = 0

    async def execute(self, **kwargs) -> Any:
        """Crystallize learnings from completed message loop."""

        loop_data = kwargs.get("loop_data")
        if not loop_data:
            return

        # Check if we've hit the session limit
        if self._session_crystals >= self.MAX_CRYSTALS_PER_SESSION:
            return

        # Analyze the interaction for crystallizable patterns
        crystal = await self._analyze_for_crystallization(loop_data)

        if crystal and crystal.get("quality", 0) >= self.CRYSTAL_THRESHOLD:
            await self._store_crystal(crystal)
            self._session_crystals += 1

    async def _analyze_for_crystallization(self, loop_data: Any) -> dict | None:
        """Analyze the interaction for crystallizable patterns."""

        # Check for successful tool executions
        tool_results = getattr(loop_data, 'extras_temporary', {}).get('tool_results', [])

        if not tool_results:
            return None

        # Calculate success indicators
        success_count = sum(1 for r in tool_results if r.get("success", False))
        total_count = len(tool_results)

        if total_count == 0:
            return None

        success_rate = success_count / total_count

        # Build the crystal
        crystal = {
            "id": self._generate_crystal_id(loop_data),
            "timestamp": time.time(),
            "task_type": self._identify_task_type(loop_data),
            "tools_used": [r.get("tool") for r in tool_results],
            "success_rate": success_rate,
            "quality": self._calculate_quality(loop_data, success_rate),
            "pattern": self._extract_pattern(loop_data),
            "context": {
                "user_message": getattr(loop_data, 'user_message', '')[:500],
                "agent_number": self.agent.number,
            },
        }

        return crystal

    def _generate_crystal_id(self, loop_data: Any) -> str:
        """Generate unique crystal ID."""
        content = f"{time.time()}-{getattr(loop_data, 'user_message', '')}"
        return hashlib.sha256(content.encode()).hexdigest()[:16]

    def _identify_task_type(self, loop_data: Any) -> str:
        """Identify the type of task from the interaction."""
        message = getattr(loop_data, 'user_message', '').lower()

        type_keywords = {
            "coding": ["code", "function", "class", "implement", "fix", "debug"],
            "research": ["search", "find", "research", "what is", "how to"],
            "file_ops": ["file", "read", "write", "create", "delete"],
            "memory": ["remember", "recall", "save", "forget"],
            "system": ["run", "execute", "command", "terminal"],
        }

        for task_type, keywords in type_keywords.items():
            if any(kw in message for kw in keywords):
                return task_type

        return "general"

    def _calculate_quality(self, loop_data: Any, success_rate: float) -> float:
        """Calculate the quality score for the crystal."""
        quality = success_rate

        # Bonus for using multiple tools effectively
        tool_results = getattr(loop_data, 'extras_temporary', {}).get('tool_results', [])
        if len(tool_results) > 1:
            quality += 0.1

        # Bonus for completing without errors
        errors = getattr(loop_data, 'extras_temporary', {}).get('errors', [])
        if not errors:
            quality += 0.1

        return min(quality, 1.0)

    def _extract_pattern(self, loop_data: Any) -> dict:
        """Extract the problem-solving pattern from the interaction."""
        tool_results = getattr(loop_data, 'extras_temporary', {}).get('tool_results', [])

        return {
            "sequence": [r.get("tool") for r in tool_results],
            "duration": getattr(loop_data, 'duration', 0),
            "iterations": getattr(loop_data, 'iteration_count', 1),
        }

    async def _store_crystal(self, crystal: dict):
        """Store the crystal in memory."""
        try:
            if hasattr(self.agent, 'memory') and self.agent.memory:
                await self.agent.memory.save(
                    text=f"Crystal [{crystal['task_type']}]: {crystal['pattern']}",
                    metadata={
                        "type": "crystal",
                        "crystal_id": crystal["id"],
                        "quality": crystal["quality"],
                        "timestamp": crystal["timestamp"],
                    },
                    area="solutions",
                )
        except Exception:
            pass
