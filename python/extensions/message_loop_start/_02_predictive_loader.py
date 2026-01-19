"""
Predictive Context Loader Extension
=====================================
Pre-loads relevant context before the LLM starts thinking.
Exploits message_loop_start to anticipate and load what's needed.
"""
import re
from typing import Any
from python.helpers.extension import Extension


class PredictiveContextLoader(Extension):
    """
    Analyzes incoming messages and pre-loads relevant context.
    Reduces latency by anticipating what the agent will need.
    """

    # Context prediction patterns
    PREDICTION_PATTERNS = {
        "file_operation": {
            "regex": r"(?:read|write|edit|modify|create|delete)\s+(?:file|the\s+file)?\s*['\"]?([^'\"]+\.\w+)",
            "action": "preload_file",
        },
        "code_execution": {
            "regex": r"(?:run|execute|python|node|bash|shell)\s+(.+)",
            "action": "preload_runtime",
        },
        "memory_recall": {
            "regex": r"(?:remember|recall|what did|previous|last time|history)",
            "action": "preload_memory",
        },
        "web_search": {
            "regex": r"(?:search|find|look up|google|what is|who is)",
            "action": "preload_search",
        },
    }

    async def execute(self, **kwargs) -> Any:
        """Pre-load context based on message analysis."""

        loop_data = kwargs.get("loop_data")
        if not loop_data or not loop_data.user_message:
            return

        # Handle both string and Message object
        user_msg = loop_data.user_message
        if hasattr(user_msg, 'content'):
            user_message = str(user_msg.content).lower()
        else:
            user_message = str(user_msg).lower()

        # Initialize prediction cache in loop data
        if not hasattr(loop_data, 'extras_temporary'):
            loop_data.extras_temporary = {}

        loop_data.extras_temporary["predicted_needs"] = []

        # Analyze message and predict needs
        predictions = await self._predict_needs(user_message)

        # Pre-load predicted resources
        for prediction in predictions:
            await self._preload_resource(prediction, loop_data)
            loop_data.extras_temporary["predicted_needs"].append(prediction)

    async def _predict_needs(self, message: str) -> list[dict]:
        """Analyze message and predict what resources will be needed."""
        predictions = []

        for pattern_name, pattern_info in self.PREDICTION_PATTERNS.items():
            match = re.search(pattern_info["regex"], message, re.IGNORECASE)
            if match:
                predictions.append({
                    "type": pattern_name,
                    "action": pattern_info["action"],
                    "match": match.group(1) if match.groups() else None,
                    "confidence": 0.85,
                })

        # Use neural pathway data if available
        if hasattr(self.agent, 'data') and self.agent.data:
            pathways = self.agent.data.get("neural_pathways", {})
            patterns = pathways.get("patterns", {})

            for pattern_name, keywords in patterns.items():
                if any(kw in message for kw in keywords):
                    predictions.append({
                        "type": f"pathway_{pattern_name}",
                        "action": "activate_pathway",
                        "pathway": pattern_name,
                        "confidence": 0.9,
                    })
                    break

        return predictions

    async def _preload_resource(self, prediction: dict, loop_data: Any):
        """Pre-load a predicted resource."""
        action = prediction.get("action")

        if action == "preload_memory":
            # Trigger early memory recall
            try:
                if hasattr(self.agent, 'memory') and self.agent.memory:
                    memories = await self.agent.memory.search(
                        query=loop_data.user_message[:200],
                        limit=3,
                    )
                    loop_data.extras_temporary["preloaded_memories"] = memories
            except Exception:
                pass

        elif action == "activate_pathway":
            # Activate the predicted neural pathway
            pathway = prediction.get("pathway")
            if hasattr(self.agent, 'data') and self.agent.data:
                pathways = self.agent.data.get("neural_pathways", {})
                pathways["active_pathway"] = pathway
                pathways["pathway_history"].append(pathway)
