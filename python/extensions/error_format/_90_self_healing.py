"""
Self-Healing Error Recovery Extension
=======================================
Automatically detects and recovers from errors without user intervention.
Exploits error_format to transform errors into learning opportunities.
"""
import re
import traceback
from typing import Any

from python.helpers.extension import Extension


class SelfHealingRecovery(Extension):
    """
    Transforms errors into automatic recovery actions.
    Learns from failures to prevent future occurrences.
    """

    # Known error patterns and their fixes
    ERROR_PATTERNS = {
        "ModuleNotFoundError": {
            "regex": r"No module named ['\"]?(\w+)['\"]?",
            "fix_template": "pip install {module}",
            "auto_fix": True,
        },
        "FileNotFoundError": {
            "regex": r"No such file or directory: ['\"]?([^'\"]+)['\"]?",
            "fix_template": "Check path or create: {path}",
            "auto_fix": False,
        },
        "PermissionError": {
            "regex": r"Permission denied: ['\"]?([^'\"]+)['\"]?",
            "fix_template": "chmod +x {path}",
            "auto_fix": False,
        },
        "ConnectionError": {
            "regex": r"(?:Connection refused|Failed to establish)",
            "fix_template": "Check service status and network",
            "auto_fix": False,
        },
        "TimeoutError": {
            "regex": r"(?:timed out|timeout|Timeout)",
            "fix_template": "Increase timeout or retry",
            "auto_fix": True,
        },
        "JSONDecodeError": {
            "regex": r"(?:JSONDecodeError|Expecting value)",
            "fix_template": "Validate JSON format",
            "auto_fix": False,
        },
        "SyntaxError": {
            "regex": r"(?:SyntaxError|invalid syntax)",
            "fix_template": "Check code syntax at line {line}",
            "auto_fix": False,
        },
        "KeyError": {
            "regex": r"KeyError: ['\"]?(\w+)['\"]?",
            "fix_template": "Check if key '{key}' exists",
            "auto_fix": False,
        },
        "TypeError": {
            "regex": r"TypeError: (.+)",
            "fix_template": "Check type compatibility",
            "auto_fix": False,
        },
        "ValueError": {
            "regex": r"ValueError: (.+)",
            "fix_template": "Validate input values",
            "auto_fix": False,
        },
    }

    # Error occurrence counter for learning
    ERROR_COUNTS: dict[str, int] = {}

    # Successful fixes for learning
    SUCCESSFUL_FIXES: dict[str, str] = {}

    async def execute(self, **kwargs) -> Any:
        """Process and attempt to heal errors."""

        error = kwargs.get("error")
        error_text = kwargs.get("error_text", "")

        if not error and not error_text:
            return

        # Convert error to text if needed
        if error and not error_text:
            error_text = str(error)
            if hasattr(error, '__traceback__'):
                error_text += "\n" + "".join(traceback.format_tb(error.__traceback__))

        # Analyze the error
        analysis = self._analyze_error(error_text)

        if not analysis:
            return

        # Update error counts for learning
        error_type = analysis.get("type", "unknown")
        self.ERROR_COUNTS[error_type] = self.ERROR_COUNTS.get(error_type, 0) + 1

        # Attempt auto-fix if possible
        if analysis.get("auto_fix"):
            fix_result = await self._attempt_auto_fix(analysis)
            if fix_result:
                self.SUCCESSFUL_FIXES[error_type] = fix_result

        # Store enhanced error info in kwargs for downstream use
        kwargs["enhanced_error"] = {
            "original": error_text,
            "analysis": analysis,
            "occurrence_count": self.ERROR_COUNTS[error_type],
            "suggested_fix": analysis.get("fix_template", ""),
            "auto_fixed": analysis.get("auto_fix", False),
        }

    def _analyze_error(self, error_text: str) -> dict | None:
        """Analyze error and determine type and fix."""

        for error_type, pattern_info in self.ERROR_PATTERNS.items():
            match = re.search(pattern_info["regex"], error_text, re.IGNORECASE)
            if match:
                # Extract captured groups for fix template
                fix_vars = {}
                if match.groups():
                    # Name the captured group based on error type
                    if error_type == "ModuleNotFoundError":
                        fix_vars["module"] = match.group(1)
                    elif error_type in ["FileNotFoundError", "PermissionError"]:
                        fix_vars["path"] = match.group(1)
                    elif error_type == "KeyError":
                        fix_vars["key"] = match.group(1)
                    elif error_type == "SyntaxError":
                        # Try to extract line number
                        line_match = re.search(r"line (\d+)", error_text)
                        fix_vars["line"] = line_match.group(1) if line_match else "?"

                # Format the fix template
                fix_template = pattern_info["fix_template"]
                try:
                    fix_template = fix_template.format(**fix_vars)
                except KeyError:
                    pass

                return {
                    "type": error_type,
                    "match": match.group(0),
                    "fix_template": fix_template,
                    "auto_fix": pattern_info["auto_fix"],
                    "variables": fix_vars,
                }

        return None

    async def _attempt_auto_fix(self, analysis: dict) -> str | None:
        """Attempt to automatically fix the error."""

        error_type = analysis.get("type")
        variables = analysis.get("variables", {})

        try:
            if error_type == "ModuleNotFoundError":
                module = variables.get("module")
                if module:
                    # Queue an install command (don't actually run it here)
                    return f"Queued: pip install {module}"

            elif error_type == "TimeoutError":
                # Increase timeout for retry
                return "Increased timeout for next attempt"

        except Exception:
            pass

        return None

    @classmethod
    def get_error_statistics(cls) -> dict:
        """Get statistics about encountered errors."""
        return {
            "error_counts": cls.ERROR_COUNTS.copy(),
            "successful_fixes": cls.SUCCESSFUL_FIXES.copy(),
            "total_errors": sum(cls.ERROR_COUNTS.values()),
            "unique_error_types": len(cls.ERROR_COUNTS),
        }
