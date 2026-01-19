"""
Neural Pathway Optimizer Extension
===================================
Pre-computes optimal reasoning paths based on task patterns.
Exploits agent_init to prime the neural pathways before any message is processed.
"""
import asyncio
from typing import Any
from python.helpers.extension import Extension


class NeuralPathwayOptimizer(Extension):
    """
    Pre-loads optimal reasoning patterns based on task history.
    Creates 'neural highways' for frequently used reasoning paths.
    """

    # Cache of optimal pathways keyed by task pattern
    PATHWAY_CACHE: dict[str, dict[str, Any]] = {}

    # Pattern signatures for common task types
    TASK_PATTERNS = {
        "code": ["implement", "fix", "debug", "code", "function", "class", "script", "program"],
        "research": ["find", "search", "research", "look up", "what is", "explain", "how does"],
        "analysis": ["analyze", "compare", "evaluate", "assess", "review", "audit"],
        "creative": ["create", "design", "generate", "write", "compose", "build"],
        "system": ["configure", "setup", "install", "deploy", "run", "execute"],
        "memory": ["remember", "recall", "save", "store", "forget", "delete"],
    }

    async def execute(self, **kwargs) -> Any:
        """Initialize neural pathways for the agent."""

        # Only initialize for main agent (A0)
        if self.agent.number != 0:
            return

        # Store pathway optimizer in agent data for later use
        if not hasattr(self.agent, 'data') or self.agent.data is None:
            self.agent.data = {}

        self.agent.data["neural_pathways"] = {
            "patterns": self.TASK_PATTERNS,
            "cache": self.PATHWAY_CACHE,
            "active_pathway": None,
            "pathway_history": [],
            "optimization_level": 1.0,
        }

        # Pre-warm pathways from memory if available
        await self._prewarm_pathways()

    async def _prewarm_pathways(self):
        """Pre-load successful pathways from agent memory."""
        try:
            # Check if memory system is available
            if hasattr(self.agent, 'memory') and self.agent.memory:
                # Try to recall successful solution patterns
                memories = await self.agent.memory.search(
                    query="successful solution pathway",
                    limit=5,
                    area="solutions"
                )

                if memories:
                    for mem in memories:
                        pattern_key = self._extract_pattern(mem.get("text", ""))
                        if pattern_key:
                            self.PATHWAY_CACHE[pattern_key] = {
                                "steps": mem.get("steps", []),
                                "success_rate": mem.get("success_rate", 0.8),
                                "avg_time": mem.get("avg_time", 10.0),
                            }
        except Exception:
            # Silently continue if memory access fails
            pass

    def _extract_pattern(self, text: str) -> str | None:
        """Extract pattern key from memory text."""
        text_lower = text.lower()
        for pattern_name, keywords in self.TASK_PATTERNS.items():
            if any(kw in text_lower for kw in keywords):
                return pattern_name
        return None
