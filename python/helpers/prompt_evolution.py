"""
PROMPT EVOLUTION SYSTEM
=======================
Automatically evolves and improves prompts based on success metrics.

Features:
- Tracks prompt performance
- Mutates underperforming prompts
- Crossover between successful prompts
- A/B testing framework
- Version control for prompts
"""

from __future__ import annotations

import hashlib
import json
import random
import re
import time
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple


@dataclass
class PromptVariant:
    """A version of a prompt"""
    id: str
    content: str
    parent_id: Optional[str] = None
    generation: int = 0
    created_at: float = field(default_factory=time.time)
    uses: int = 0
    successes: int = 0
    total_score: float = 0.0
    metadata: Dict[str, Any] = field(default_factory=dict)

    @property
    def success_rate(self) -> float:
        return self.successes / max(self.uses, 1)

    @property
    def average_score(self) -> float:
        return self.total_score / max(self.uses, 1)

    @property
    def fitness(self) -> float:
        """Combined fitness score"""
        if self.uses < 3:
            return 0.5  # Not enough data
        return (self.success_rate * 0.6) + (self.average_score * 0.4)


@dataclass
class ABTest:
    """A/B test between two prompt variants"""
    test_id: str
    variant_a: str
    variant_b: str
    started_at: float = field(default_factory=time.time)
    a_uses: int = 0
    b_uses: int = 0
    a_successes: int = 0
    b_successes: int = 0
    concluded: bool = False
    winner: Optional[str] = None

    def record_result(self, variant: str, success: bool):
        if variant == "a":
            self.a_uses += 1
            if success:
                self.a_successes += 1
        else:
            self.b_uses += 1
            if success:
                self.b_successes += 1

        # Check if we have enough data to conclude
        min_samples = 10
        if self.a_uses >= min_samples and self.b_uses >= min_samples:
            a_rate = self.a_successes / self.a_uses
            b_rate = self.b_successes / self.b_uses

            # Significant difference (>10%)
            if abs(a_rate - b_rate) > 0.1:
                self.concluded = True
                self.winner = "a" if a_rate > b_rate else "b"


class MutationEngine:
    """Mutates prompts to create variations"""

    MUTATION_STRATEGIES = [
        "rephrase",
        "simplify",
        "elaborate",
        "reorder",
        "add_example",
        "add_constraint",
        "change_tone",
        "add_clarification"
    ]

    def __init__(self):
        self.mutation_count = 0

    def mutate(self, content: str, strategy: str = "random") -> str:
        """Apply a mutation to prompt content"""
        if strategy == "random":
            strategy = random.choice(self.MUTATION_STRATEGIES)

        self.mutation_count += 1

        if strategy == "simplify":
            return self._simplify(content)
        elif strategy == "elaborate":
            return self._elaborate(content)
        elif strategy == "reorder":
            return self._reorder(content)
        elif strategy == "add_constraint":
            return self._add_constraint(content)
        elif strategy == "change_tone":
            return self._change_tone(content)
        else:
            return self._rephrase(content)

    def _simplify(self, content: str) -> str:
        """Simplify the prompt"""
        # Remove filler words
        fillers = ['basically', 'actually', 'really', 'very', 'quite', 'just']
        result = content
        for filler in fillers:
            result = re.sub(rf'\b{filler}\s+', '', result, flags=re.IGNORECASE)
        return result

    def _elaborate(self, content: str) -> str:
        """Add more detail"""
        if not content.endswith('.'):
            content += '.'
        return content + " Be thorough and comprehensive in your response."

    def _reorder(self, content: str) -> str:
        """Reorder sentences"""
        sentences = re.split(r'(?<=[.!?])\s+', content)
        if len(sentences) > 1:
            random.shuffle(sentences)
        return ' '.join(sentences)

    def _add_constraint(self, content: str) -> str:
        """Add a constraint"""
        constraints = [
            " Focus on accuracy over speed.",
            " Prioritize clarity in your explanation.",
            " Consider edge cases.",
            " Think step by step.",
            " Verify your reasoning."
        ]
        return content + random.choice(constraints)

    def _change_tone(self, content: str) -> str:
        """Change the tone"""
        # Add directive language
        if not content.startswith("You"):
            return "You should " + content[0].lower() + content[1:]
        return content

    def _rephrase(self, content: str) -> str:
        """Generic rephrasing"""
        # Simple synonym replacements
        replacements = [
            ("make sure", "ensure"),
            ("use", "utilize"),
            ("help", "assist"),
            ("find", "identify"),
            ("give", "provide"),
            ("show", "demonstrate"),
        ]
        result = content
        for old, new in replacements:
            if random.random() > 0.5:
                result = re.sub(rf'\b{old}\b', new, result, flags=re.IGNORECASE)
        return result


class CrossoverEngine:
    """Combines successful prompts"""

    def crossover(self, parent_a: str, parent_b: str) -> str:
        """Create child from two parents"""
        # Split into sentences
        a_sentences = re.split(r'(?<=[.!?])\s+', parent_a)
        b_sentences = re.split(r'(?<=[.!?])\s+', parent_b)

        # Take alternating sentences
        child_sentences = []
        max_len = max(len(a_sentences), len(b_sentences))

        for i in range(max_len):
            if i < len(a_sentences) and random.random() > 0.5:
                child_sentences.append(a_sentences[i])
            elif i < len(b_sentences):
                child_sentences.append(b_sentences[i])

        return ' '.join(child_sentences)


class PromptEvolutionSystem:
    """
    Complete prompt evolution system.
    Tracks, mutates, and improves prompts automatically.
    """

    def __init__(self):
        self.variants: Dict[str, PromptVariant] = {}
        self.ab_tests: Dict[str, ABTest] = {}
        self.active_prompt: Optional[str] = None
        self.mutation_engine = MutationEngine()
        self.crossover_engine = CrossoverEngine()
        self.history: List[Dict] = []
        self.generation = 0

    def _generate_id(self, content: str) -> str:
        """Generate unique ID for variant"""
        hash_input = f"{content}:{time.time()}"
        return hashlib.md5(hash_input.encode()).hexdigest()[:10]

    def register_prompt(self, content: str,
                        name: str = None,
                        metadata: Dict = None) -> PromptVariant:
        """Register a new prompt variant"""
        variant_id = self._generate_id(content)
        variant = PromptVariant(
            id=variant_id,
            content=content,
            generation=self.generation,
            metadata=metadata or {"name": name}
        )
        self.variants[variant_id] = variant

        if self.active_prompt is None:
            self.active_prompt = variant_id

        return variant

    def record_usage(self, variant_id: str, success: bool,
                     score: float = 1.0):
        """Record usage of a prompt variant"""
        if variant_id not in self.variants:
            return

        variant = self.variants[variant_id]
        variant.uses += 1
        if success:
            variant.successes += 1
        variant.total_score += score

        self.history.append({
            "timestamp": time.time(),
            "variant_id": variant_id,
            "success": success,
            "score": score
        })

    def get_best_variant(self) -> Optional[PromptVariant]:
        """Get the best performing variant"""
        if not self.variants:
            return None

        # Need at least 3 uses to evaluate
        candidates = [v for v in self.variants.values() if v.uses >= 3]
        if not candidates:
            return list(self.variants.values())[0]

        return max(candidates, key=lambda v: v.fitness)

    def evolve(self, top_k: int = 3) -> List[PromptVariant]:
        """Evolve the population"""
        self.generation += 1
        new_variants = []

        # Get top performers
        candidates = [v for v in self.variants.values() if v.uses >= 3]
        if len(candidates) < 2:
            # Not enough data, just mutate
            if self.variants:
                best = list(self.variants.values())[0]
                mutated = self.mutation_engine.mutate(best.content)
                new_variant = PromptVariant(
                    id=self._generate_id(mutated),
                    content=mutated,
                    parent_id=best.id,
                    generation=self.generation
                )
                self.variants[new_variant.id] = new_variant
                new_variants.append(new_variant)
            return new_variants

        top_variants = sorted(candidates, key=lambda v: v.fitness, reverse=True)[:top_k]

        # Mutation: Create mutated versions of top performers
        for variant in top_variants[:2]:
            mutated = self.mutation_engine.mutate(variant.content)
            new_variant = PromptVariant(
                id=self._generate_id(mutated),
                content=mutated,
                parent_id=variant.id,
                generation=self.generation
            )
            self.variants[new_variant.id] = new_variant
            new_variants.append(new_variant)

        # Crossover: Combine top 2
        if len(top_variants) >= 2:
            child_content = self.crossover_engine.crossover(
                top_variants[0].content,
                top_variants[1].content
            )
            child = PromptVariant(
                id=self._generate_id(child_content),
                content=child_content,
                parent_id=f"{top_variants[0].id}+{top_variants[1].id}",
                generation=self.generation
            )
            self.variants[child.id] = child
            new_variants.append(child)

        return new_variants

    def start_ab_test(self, variant_a_id: str,
                      variant_b_id: str) -> ABTest:
        """Start an A/B test"""
        test_id = f"test_{len(self.ab_tests)}"
        test = ABTest(
            test_id=test_id,
            variant_a=variant_a_id,
            variant_b=variant_b_id
        )
        self.ab_tests[test_id] = test
        return test

    def get_variant_for_test(self, test_id: str) -> Tuple[str, str]:
        """Get which variant to use for A/B test"""
        test = self.ab_tests.get(test_id)
        if not test or test.concluded:
            return None, None

        # Alternate between A and B
        if test.a_uses <= test.b_uses:
            return "a", test.variant_a
        else:
            return "b", test.variant_b

    def prune(self, keep_top: int = 10, min_uses: int = 5):
        """Remove underperforming variants"""
        # Keep variants with not enough uses
        to_keep = {k: v for k, v in self.variants.items() if v.uses < min_uses}

        # Keep top performers
        evaluated = [v for v in self.variants.values() if v.uses >= min_uses]
        top = sorted(evaluated, key=lambda v: v.fitness, reverse=True)[:keep_top]

        for v in top:
            to_keep[v.id] = v

        pruned = len(self.variants) - len(to_keep)
        self.variants = to_keep
        return pruned

    def get_statistics(self) -> Dict[str, Any]:
        """Get evolution statistics"""
        if not self.variants:
            return {"total_variants": 0}

        fitnesses = [v.fitness for v in self.variants.values() if v.uses >= 3]

        return {
            "total_variants": len(self.variants),
            "current_generation": self.generation,
            "total_uses": sum(v.uses for v in self.variants.values()),
            "avg_fitness": sum(fitnesses) / max(len(fitnesses), 1) if fitnesses else 0,
            "best_fitness": max(fitnesses) if fitnesses else 0,
            "active_ab_tests": sum(1 for t in self.ab_tests.values() if not t.concluded),
            "mutations": self.mutation_engine.mutation_count
        }

    def export(self) -> str:
        """Export evolution state as JSON"""
        return json.dumps({
            "generation": self.generation,
            "variants": [
                {
                    "id": v.id,
                    "content": v.content,
                    "parent_id": v.parent_id,
                    "generation": v.generation,
                    "uses": v.uses,
                    "successes": v.successes,
                    "total_score": v.total_score,
                    "fitness": v.fitness
                }
                for v in self.variants.values()
            ],
            "stats": self.get_statistics()
        }, indent=2)


# Singleton
_prompt_evolution: Optional[PromptEvolutionSystem] = None


def get_prompt_evolution() -> PromptEvolutionSystem:
    """Get the Prompt Evolution System singleton"""
    global _prompt_evolution
    if _prompt_evolution is None:
        _prompt_evolution = PromptEvolutionSystem()
    return _prompt_evolution
