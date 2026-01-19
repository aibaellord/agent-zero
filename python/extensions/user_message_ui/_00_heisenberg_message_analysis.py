"""
USER MESSAGE UI EXTENSION - Heisenberg
======================================
Analyze user messages for strategic insights.
"""

from typing import Any

from python.helpers.extension import Extension


class HeisenbergUserMessageAnalysis(Extension):
    """
    Analyze incoming user messages for cognitive optimization.
    """

    async def execute(self, **kwargs) -> Any:
        message = kwargs.get('message', '')

        if not hasattr(self.agent, '_heisenberg') or not message:
            return

        try:
            heisenberg = self.agent._heisenberg

            # Analyze message complexity
            words = message.split()
            word_count = len(words)
            unique_ratio = len(set(words)) / max(word_count, 1)

            # Estimate task complexity
            complexity_indicators = [
                'complex', 'difficult', 'challenging', 'multi', 'comprehensive',
                'analyze', 'optimize', 'design', 'create', 'implement'
            ]
            complexity_score = sum(1 for ind in complexity_indicators if ind in message.lower())

            # Adjust parameters based on complexity
            if complexity_score > 2 or word_count > 100:
                # Complex task - more exploration, more swarm agents
                heisenberg.self_modifier.meta_parameters['exploration_rate'] = 0.4

                # Create rich superposition
                heisenberg.quantum.create_superposition([
                    f"Direct approach to: {message[:50]}",
                    f"Decompose problem: {message[:50]}",
                    f"Find analogies for: {message[:50]}",
                    f"Abstract pattern: {message[:50]}",
                    f"First principles: {message[:50]}",
                    f"Adversarial view: {message[:50]}",
                    f"Meta-cognitive: {message[:50]}",
                    f"Synthesis approach: {message[:50]}"
                ])
            else:
                # Simple task - more exploitation
                heisenberg.self_modifier.meta_parameters['exploration_rate'] = 0.2

            # Store analysis
            self.agent._heisenberg_user_analysis = {
                'word_count': word_count,
                'unique_ratio': unique_ratio,
                'complexity_score': complexity_score
            }

        except Exception:
            pass
