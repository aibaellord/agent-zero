"""
AUTO OPTIMIZER
==============
The hidden gem - automatic optimization of anything.
Code, prompts, queries, configurations - it optimizes everything.
"""

from __future__ import annotations

import re
import time
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple


@dataclass
class OptimizationResult:
    """Result of an optimization run"""
    original: str
    optimized: str
    improvement: float  # 0-1
    changes: List[str]
    metrics: Dict[str, Any]


class AutoOptimizer:
    """
    Universal optimizer - applies optimization strategies
    to any input type automatically.
    """

    def __init__(self):
        self.optimization_count = 0
        self.total_improvement = 0.0

    def optimize(
        self,
        content: str,
        content_type: str = "auto",
        goal: str = "general"
    ) -> OptimizationResult:
        """
        Automatically optimize any content.

        content_type: auto, code, prompt, query, config, text
        goal: general, performance, clarity, brevity, accuracy
        """
        if content_type == "auto":
            content_type = self._detect_type(content)

        if content_type == "code":
            return self._optimize_code(content, goal)
        elif content_type == "prompt":
            return self._optimize_prompt(content, goal)
        elif content_type == "query":
            return self._optimize_query(content, goal)
        elif content_type == "config":
            return self._optimize_config(content, goal)
        else:
            return self._optimize_text(content, goal)

    def _detect_type(self, content: str) -> str:
        """Detect content type automatically"""
        # Check for code patterns
        code_patterns = [
            r'def\s+\w+\s*\(',
            r'function\s+\w+\s*\(',
            r'class\s+\w+',
            r'import\s+\w+',
            r'if\s+.*:',
            r'\{\s*"',  # JSON
        ]

        for pattern in code_patterns:
            if re.search(pattern, content):
                return "code"

        # Check for prompt patterns
        if any(kw in content.lower() for kw in ['you are', 'your task', 'please', 'generate', 'create']):
            return "prompt"

        # Check for query patterns
        if any(kw in content.lower() for kw in ['select', 'from', 'where', 'search', 'find']):
            return "query"

        # Check for config patterns
        if re.search(r'^\s*\w+\s*[=:]\s*', content, re.MULTILINE):
            return "config"

        return "text"

    def _optimize_code(self, code: str, goal: str) -> OptimizationResult:
        """Optimize code"""
        optimized = code
        changes = []

        # Remove redundant whitespace
        lines = optimized.split('\n')
        new_lines = []
        for line in lines:
            # Preserve indentation but strip trailing whitespace
            stripped = line.rstrip()
            if stripped or (new_lines and new_lines[-1]):  # Keep single blank lines
                new_lines.append(stripped)
        optimized = '\n'.join(new_lines)

        if optimized != code:
            changes.append("Removed trailing whitespace")

        # Remove redundant pass statements after other statements
        optimized = re.sub(r'(\n\s+\w.*)\n(\s+)pass\n', r'\1\n', optimized)
        if 'pass' not in optimized and 'pass' in code:
            changes.append("Removed redundant pass statements")

        # Simplify boolean comparisons
        original = optimized
        optimized = re.sub(r'== True', '', optimized)
        optimized = re.sub(r'== False', ' is False', optimized)
        if optimized != original:
            changes.append("Simplified boolean comparisons")

        # Calculate improvement
        improvement = 1 - (len(optimized) / len(code)) if code else 0

        self.optimization_count += 1
        self.total_improvement += improvement

        return OptimizationResult(
            original=code,
            optimized=optimized,
            improvement=max(0, improvement),
            changes=changes,
            metrics={
                "original_length": len(code),
                "optimized_length": len(optimized),
                "lines_removed": code.count('\n') - optimized.count('\n')
            }
        )

    def _optimize_prompt(self, prompt: str, goal: str) -> OptimizationResult:
        """Optimize a prompt for better LLM interaction"""
        optimized = prompt
        changes = []

        # Remove redundant phrases
        redundant = [
            (r"please\s+", ""),
            (r"could you\s+", ""),
            (r"I would like you to\s+", ""),
            (r"I want you to\s+", ""),
        ]

        for pattern, replacement in redundant:
            original = optimized
            optimized = re.sub(pattern, replacement, optimized, flags=re.IGNORECASE)
            if optimized != original:
                changes.append(f"Removed redundant phrase: {pattern}")

        # Make instructions more direct
        if goal == "clarity":
            optimized = optimized.replace("try to", "")
            optimized = optimized.replace("maybe", "")
            if "try to" in prompt:
                changes.append("Made instructions more direct")

        # Add structure if missing
        if goal in ["clarity", "accuracy"] and len(prompt) > 200:
            if not any(x in prompt for x in ['1.', '•', '-', '*']):
                changes.append("Consider adding structured format")

        improvement = 1 - (len(optimized) / len(prompt)) if prompt else 0

        return OptimizationResult(
            original=prompt,
            optimized=optimized.strip(),
            improvement=max(0, improvement),
            changes=changes,
            metrics={
                "original_tokens": len(prompt.split()),
                "optimized_tokens": len(optimized.split()),
                "token_reduction": len(prompt.split()) - len(optimized.split())
            }
        )

    def _optimize_query(self, query: str, goal: str) -> OptimizationResult:
        """Optimize a query (SQL, search, etc.)"""
        optimized = query
        changes = []

        # SQL optimization
        if "SELECT" in query.upper():
            # Replace SELECT * with specific columns hint
            if "SELECT *" in query.upper():
                changes.append("Consider specifying columns instead of SELECT *")

            # Add index hint if no WHERE clause
            if "WHERE" not in query.upper() and "LIMIT" not in query.upper():
                changes.append("Consider adding WHERE or LIMIT clause")

        # General query optimization
        optimized = re.sub(r'\s+', ' ', optimized).strip()
        if optimized != query:
            changes.append("Normalized whitespace")

        return OptimizationResult(
            original=query,
            optimized=optimized,
            improvement=0.1 if changes else 0,
            changes=changes,
            metrics={"type": "query"}
        )

    def _optimize_config(self, config: str, goal: str) -> OptimizationResult:
        """Optimize configuration"""
        optimized = config
        changes = []

        # Remove duplicate lines
        lines = optimized.split('\n')
        seen = set()
        new_lines = []
        for line in lines:
            if line.strip() and line not in seen:
                seen.add(line)
                new_lines.append(line)

        if len(new_lines) < len(lines):
            changes.append(f"Removed {len(lines) - len(new_lines)} duplicate lines")

        optimized = '\n'.join(new_lines)

        return OptimizationResult(
            original=config,
            optimized=optimized,
            improvement=1 - (len(new_lines) / len(lines)) if lines else 0,
            changes=changes,
            metrics={"lines": len(new_lines)}
        )

    def _optimize_text(self, text: str, goal: str) -> OptimizationResult:
        """Optimize general text"""
        optimized = text
        changes = []

        if goal == "brevity":
            # Remove filler words
            fillers = ['basically', 'actually', 'really', 'very', 'just', 'quite']
            for filler in fillers:
                original = optimized
                optimized = re.sub(rf'\b{filler}\s+', '', optimized, flags=re.IGNORECASE)
                if optimized != original:
                    changes.append(f"Removed filler word: {filler}")

        # Fix double spaces
        original = optimized
        optimized = re.sub(r'  +', ' ', optimized)
        if optimized != original:
            changes.append("Fixed double spaces")

        return OptimizationResult(
            original=text,
            optimized=optimized,
            improvement=1 - (len(optimized) / len(text)) if text else 0,
            changes=changes,
            metrics={"words": len(optimized.split())}
        )

    def get_stats(self) -> Dict[str, Any]:
        """Get optimization statistics"""
        return {
            "total_optimizations": self.optimization_count,
            "average_improvement": (
                self.total_improvement / self.optimization_count
                if self.optimization_count > 0 else 0
            )
        }


# Singleton
_auto_optimizer: Optional[AutoOptimizer] = None


def get_auto_optimizer() -> AutoOptimizer:
    """Get the Auto Optimizer singleton"""
    global _auto_optimizer
    if _auto_optimizer is None:
        _auto_optimizer = AutoOptimizer()
    return _auto_optimizer


def quick_optimize(content: str, content_type: str = "auto") -> str:
    """Quick optimization - returns optimized content directly"""
    optimizer = get_auto_optimizer()
    result = optimizer.optimize(content, content_type)
    return result.optimized
