"""
Infinite Loop Breaker Tool
============================
Detects and breaks infinite loops in agent reasoning.
Monitors for repetitive patterns and provides escape mechanisms.
"""
import hashlib
import time
from typing import Any

from python.helpers.tool import Response, Tool


class InfiniteLoopBreaker(Tool):
    """
    Monitors agent behavior for infinite loop patterns.
    Provides escape mechanisms when loops are detected.
    """

    # Pattern detection thresholds
    REPEAT_THRESHOLD = 3  # Same action repeated N times
    TIME_THRESHOLD = 60   # Max seconds for single action
    SIMILARITY_THRESHOLD = 0.85  # Message similarity threshold

    # History tracking
    _action_history: list[dict] = []
    _message_hashes: list[str] = []

    async def execute(self, **kwargs) -> Response:
        """Check for and break infinite loops."""

        action = self.args.get("action", "check")

        if action == "check":
            return await self._check_for_loops()
        elif action == "break":
            return await self._break_loop()
        elif action == "reset":
            return await self._reset_tracking()
        elif action == "status":
            return await self._get_status()
        else:
            return Response(
                message=f"Unknown action: {action}. Use: check, break, reset, status",
                break_loop=False
            )

    async def _check_for_loops(self) -> Response:
        """Check if agent is in a loop."""

        loop_detected = False
        loop_type = None
        details = []

        # Check for repeated actions
        if len(self._action_history) >= self.REPEAT_THRESHOLD:
            recent = self._action_history[-self.REPEAT_THRESHOLD:]
            if len(set(a.get("type") for a in recent)) == 1:
                loop_detected = True
                loop_type = "repeated_action"
                details.append(f"Same action repeated {self.REPEAT_THRESHOLD} times")

        # Check for similar messages
        if len(self._message_hashes) >= self.REPEAT_THRESHOLD:
            recent_hashes = self._message_hashes[-self.REPEAT_THRESHOLD:]
            if len(set(recent_hashes)) == 1:
                loop_detected = True
                loop_type = "repeated_message"
                details.append("Same or very similar messages repeated")

        # Check for time-based loops
        if self._action_history:
            first_action_time = self._action_history[0].get("time", time.time())
            if time.time() - first_action_time > self.TIME_THRESHOLD * len(self._action_history):
                loop_detected = True
                loop_type = "time_exceeded"
                details.append("Actions taking too long, possible loop")

        if loop_detected:
            return Response(
                message=f"⚠️ LOOP DETECTED: {loop_type}\nDetails: {'; '.join(details)}\n\nUse 'break' action to escape or 'reset' to clear tracking.",
                break_loop=False
            )
        else:
            return Response(
                message="✓ No loop detected. Agent reasoning is progressing normally.",
                break_loop=False
            )

    async def _break_loop(self) -> Response:
        """Break out of detected loop."""

        # Clear action history
        self._action_history.clear()
        self._message_hashes.clear()

        # Generate escape suggestions
        suggestions = [
            "1. Try a completely different approach",
            "2. Break the problem into smaller sub-tasks",
            "3. Ask for clarification from the user",
            "4. Save current progress and restart fresh",
            "5. Delegate to a subordinate agent with different context",
        ]

        return Response(
            message=f"🔓 LOOP BROKEN\n\nHistory cleared. Suggestions for moving forward:\n" + "\n".join(suggestions),
            break_loop=True  # Force break the current loop
        )

    async def _reset_tracking(self) -> Response:
        """Reset all tracking data."""

        self._action_history.clear()
        self._message_hashes.clear()

        return Response(
            message="✓ Loop tracking reset. All history cleared.",
            break_loop=False
        )

    async def _get_status(self) -> Response:
        """Get current loop tracking status."""

        status = {
            "actions_tracked": len(self._action_history),
            "messages_tracked": len(self._message_hashes),
            "repeat_threshold": self.REPEAT_THRESHOLD,
            "time_threshold": self.TIME_THRESHOLD,
        }

        if self._action_history:
            recent = self._action_history[-5:]
            status["recent_actions"] = [a.get("type") for a in recent]

        return Response(
            message=f"Loop Tracker Status:\n{self._format_status(status)}",
            break_loop=False
        )

    def _format_status(self, status: dict) -> str:
        """Format status dictionary for display."""
        lines = []
        for key, value in status.items():
            formatted_key = key.replace("_", " ").title()
            lines.append(f"  • {formatted_key}: {value}")
        return "\n".join(lines)

    @classmethod
    def track_action(cls, action_type: str, details: Any = None):
        """Track an action for loop detection."""
        cls._action_history.append({
            "type": action_type,
            "time": time.time(),
            "details": details,
        })

        # Keep only recent history
        if len(cls._action_history) > 50:
            cls._action_history = cls._action_history[-50:]

    @classmethod
    def track_message(cls, message: str):
        """Track a message for similarity detection."""
        # Hash the message for comparison
        msg_hash = hashlib.md5(message.encode()).hexdigest()[:8]
        cls._message_hashes.append(msg_hash)

        # Keep only recent history
        if len(cls._message_hashes) > 50:
            cls._message_hashes = cls._message_hashes[-50:]

    async def before_execution(self, **kwargs):
        """Track this tool usage."""
        self.track_action("loop_breaker", self.args.get("action"))
        await super().before_execution(**kwargs)
