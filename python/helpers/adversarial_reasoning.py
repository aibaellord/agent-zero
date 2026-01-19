"""
ADVERSARIAL REASONING SYSTEM
============================
Red Team / Blue Team cognitive architecture.
Every conclusion is stress-tested by adversarial agents.

Features:
- Devil's Advocate generation
- Assumption challenging
- Edge case discovery
- Bias detection
- Logical fallacy identification
- Steelman/Strawman analysis
"""

from __future__ import annotations

import random
import time
from dataclasses import dataclass, field
from enum import Enum, auto
from typing import Any, Dict, List, Optional, Tuple

# Optional numpy
try:
    import numpy as np
    HAS_NUMPY = True
except ImportError:
    HAS_NUMPY = False


class AttackType(Enum):
    """Types of adversarial attacks on reasoning"""
    ASSUMPTION_CHALLENGE = auto()
    EDGE_CASE = auto()
    COUNTEREXAMPLE = auto()
    LOGICAL_FALLACY = auto()
    BIAS_DETECTION = auto()
    STEELMAN = auto()
    STRAWMAN = auto()
    REDUCTIO = auto()
    SCOPE_CREEP = auto()
    HIDDEN_COST = auto()


class DefenseType(Enum):
    """Types of defenses against attacks"""
    EVIDENCE = auto()
    CLARIFICATION = auto()
    SCOPE_LIMITATION = auto()
    ACKNOWLEDGMENT = auto()
    COUNTERARGUMENT = auto()
    REFORMULATION = auto()


@dataclass
class AdversarialAttack:
    """An adversarial attack on a conclusion"""
    attack_type: AttackType
    target: str
    attack_content: str
    severity: float  # 0-1
    confidence: float  # 0-1
    suggested_defense: Optional[DefenseType] = None


@dataclass
class DefenseResult:
    """Result of defending against an attack"""
    attack: AdversarialAttack
    defense_type: DefenseType
    defense_content: str
    success: bool
    residual_vulnerability: float  # 0-1


class LogicalFallacyDetector:
    """Detects logical fallacies in reasoning"""

    FALLACY_PATTERNS = {
        'ad_hominem': ['person', 'they are', 'he is', 'she is', 'credibility'],
        'straw_man': ['actually saying', 'really means', 'what they want'],
        'false_dichotomy': ['either', 'or', 'only two', 'must choose'],
        'slippery_slope': ['lead to', 'eventually', 'next thing'],
        'appeal_to_authority': ['expert says', 'studies show', 'according to'],
        'circular_reasoning': ['because', 'therefore', 'thus'],
        'hasty_generalization': ['all', 'every', 'never', 'always'],
        'red_herring': ['but what about', 'the real issue'],
        'appeal_to_emotion': ['feel', 'imagine', 'think of'],
        'false_cause': ['caused by', 'result of', 'because of']
    }

    def detect(self, text: str) -> List[Tuple[str, float]]:
        """Detect potential fallacies in text"""
        text_lower = text.lower()
        detected = []

        for fallacy, patterns in self.FALLACY_PATTERNS.items():
            score = sum(1 for p in patterns if p in text_lower)
            if score > 0:
                confidence = min(1.0, score / len(patterns) * 2)
                detected.append((fallacy, confidence))

        return detected


class BiasDetector:
    """Detects cognitive biases in reasoning"""

    BIAS_INDICATORS = {
        'confirmation_bias': ['confirms', 'as expected', 'proves', 'just as I thought'],
        'anchoring_bias': ['initial', 'first', 'starting point', 'originally'],
        'availability_bias': ['recently', 'just saw', 'remember when', 'last time'],
        'sunk_cost': ['already invested', 'come this far', 'spent so much'],
        'bandwagon': ['everyone', 'popular', 'trending', 'most people'],
        'authority_bias': ['expert', 'professor', 'study shows', 'research says'],
        'optimism_bias': ['will definitely', 'surely', 'no doubt', 'guaranteed'],
        'pessimism_bias': ['never work', 'impossible', 'too hard', 'cant be done'],
        'hindsight_bias': ['knew it', 'obvious', 'should have known', 'predictable'],
        'self_serving': ['my success', 'their fault', 'I did well', 'they failed']
    }

    def detect(self, text: str) -> List[Tuple[str, float]]:
        """Detect potential biases in text"""
        text_lower = text.lower()
        detected = []

        for bias, indicators in self.BIAS_INDICATORS.items():
            score = sum(1 for i in indicators if i in text_lower)
            if score > 0:
                confidence = min(1.0, score / len(indicators) * 2.5)
                detected.append((bias, confidence))

        return detected


class DevilsAdvocate:
    """Generates devil's advocate arguments"""

    CHALLENGE_TEMPLATES = [
        "What if the opposite were true: {opposite}?",
        "Have you considered that {alternative}?",
        "This assumes {assumption} - but what if that's wrong?",
        "A critic might say: {criticism}",
        "The hidden cost here is: {cost}",
        "This could fail if: {failure_mode}",
        "Edge case: what happens when {edge_case}?",
        "Counter-evidence: {counter}"
    ]

    def generate_challenges(self, conclusion: str,
                           assumptions: List[str] = None) -> List[str]:
        """Generate devil's advocate challenges"""
        challenges = []

        # Challenge the conclusion directly
        challenges.append(f"What evidence would disprove: '{conclusion[:100]}'?")

        # Challenge assumptions
        if assumptions:
            for assumption in assumptions[:3]:
                challenges.append(
                    f"This assumes '{assumption}' - what if that's false?"
                )

        # Generate edge cases
        challenges.append(
            f"What's the extreme case where this fails: '{conclusion[:50]}'?"
        )

        # Cost/benefit challenge
        challenges.append(
            f"What's the hidden cost of: '{conclusion[:50]}'?"
        )

        return challenges


class RedTeam:
    """
    Red Team that attacks conclusions and reasoning.
    """

    def __init__(self):
        self.fallacy_detector = LogicalFallacyDetector()
        self.bias_detector = BiasDetector()
        self.devils_advocate = DevilsAdvocate()
        self.attack_history: List[AdversarialAttack] = []

    def attack(self, conclusion: str, reasoning: str = "",
               assumptions: List[str] = None) -> List[AdversarialAttack]:
        """Generate attacks on a conclusion"""
        attacks = []

        # Detect fallacies
        text = f"{conclusion} {reasoning}"
        fallacies = self.fallacy_detector.detect(text)
        for fallacy, confidence in fallacies:
            attacks.append(AdversarialAttack(
                attack_type=AttackType.LOGICAL_FALLACY,
                target=fallacy,
                attack_content=f"Potential {fallacy.replace('_', ' ')} detected",
                severity=confidence,
                confidence=confidence,
                suggested_defense=DefenseType.CLARIFICATION
            ))

        # Detect biases
        biases = self.bias_detector.detect(text)
        for bias, confidence in biases:
            attacks.append(AdversarialAttack(
                attack_type=AttackType.BIAS_DETECTION,
                target=bias,
                attack_content=f"Potential {bias.replace('_', ' ')} detected",
                severity=confidence * 0.8,
                confidence=confidence,
                suggested_defense=DefenseType.ACKNOWLEDGMENT
            ))

        # Generate devil's advocate challenges
        challenges = self.devils_advocate.generate_challenges(
            conclusion, assumptions
        )
        for challenge in challenges:
            attacks.append(AdversarialAttack(
                attack_type=AttackType.ASSUMPTION_CHALLENGE,
                target="conclusion",
                attack_content=challenge,
                severity=0.5,
                confidence=0.6,
                suggested_defense=DefenseType.EVIDENCE
            ))

        # Edge case attacks
        attacks.append(AdversarialAttack(
            attack_type=AttackType.EDGE_CASE,
            target="boundary_conditions",
            attack_content=f"What happens at the limits of: {conclusion[:50]}?",
            severity=0.4,
            confidence=0.5,
            suggested_defense=DefenseType.SCOPE_LIMITATION
        ))

        self.attack_history.extend(attacks)
        return attacks


class BlueTeam:
    """
    Blue Team that defends conclusions and strengthens reasoning.
    """

    def __init__(self):
        self.defense_history: List[DefenseResult] = []

    def defend(self, attack: AdversarialAttack,
               original_conclusion: str) -> DefenseResult:
        """Defend against an attack"""
        defense_type = attack.suggested_defense or DefenseType.COUNTERARGUMENT

        # Generate defense based on type
        if defense_type == DefenseType.EVIDENCE:
            defense_content = f"Evidence supporting the conclusion: [would cite specific evidence for '{original_conclusion[:50]}']"
        elif defense_type == DefenseType.CLARIFICATION:
            defense_content = f"To clarify: the argument is specifically about {original_conclusion[:50]}, not a general claim"
        elif defense_type == DefenseType.SCOPE_LIMITATION:
            defense_content = f"Acknowledged limitation: this conclusion applies within defined scope, not universally"
        elif defense_type == DefenseType.ACKNOWLEDGMENT:
            defense_content = f"Valid point acknowledged. Adjusting confidence accordingly."
        elif defense_type == DefenseType.COUNTERARGUMENT:
            defense_content = f"Counter to attack: {attack.attack_content[:50]} - [specific counter]"
        else:
            defense_content = f"Reformulated conclusion addressing: {attack.target}"

        # Determine success (based on attack severity)
        success = random.random() > attack.severity * 0.7
        residual = attack.severity * (0.3 if success else 0.7)

        result = DefenseResult(
            attack=attack,
            defense_type=defense_type,
            defense_content=defense_content,
            success=success,
            residual_vulnerability=residual
        )

        self.defense_history.append(result)
        return result


class AdversarialReasoningSystem:
    """
    Complete adversarial reasoning system combining Red and Blue teams.
    """

    def __init__(self):
        self.red_team = RedTeam()
        self.blue_team = BlueTeam()
        self.battle_history: List[Dict] = []

    def stress_test(self, conclusion: str, reasoning: str = "",
                    assumptions: List[str] = None,
                    defense_rounds: int = 1) -> Dict[str, Any]:
        """Stress test a conclusion with adversarial reasoning"""

        result = {
            'conclusion': conclusion,
            'attacks': [],
            'defenses': [],
            'final_confidence': 1.0,
            'vulnerabilities': [],
            'recommendations': []
        }

        # Red team attacks
        attacks = self.red_team.attack(conclusion, reasoning, assumptions)
        result['attacks'] = [
            {
                'type': a.attack_type.name,
                'target': a.target,
                'content': a.attack_content,
                'severity': a.severity
            }
            for a in attacks
        ]

        # Blue team defends
        total_vulnerability = 0.0
        for attack in attacks:
            for _ in range(defense_rounds):
                defense = self.blue_team.defend(attack, conclusion)
                result['defenses'].append({
                    'attack_type': attack.attack_type.name,
                    'defense_type': defense.defense_type.name,
                    'success': defense.success,
                    'residual': defense.residual_vulnerability
                })

                if defense.success:
                    break

            total_vulnerability += defense.residual_vulnerability

        # Calculate final confidence
        if attacks:
            avg_vulnerability = total_vulnerability / len(attacks)
            result['final_confidence'] = max(0.1, 1.0 - avg_vulnerability)

        # Identify remaining vulnerabilities
        for attack in attacks:
            if attack.severity > 0.5:
                result['vulnerabilities'].append({
                    'type': attack.attack_type.name,
                    'description': attack.attack_content[:100]
                })

        # Generate recommendations
        if result['final_confidence'] < 0.5:
            result['recommendations'].append(
                "Consider revising the conclusion - significant vulnerabilities detected"
            )
        if any(a.attack_type == AttackType.LOGICAL_FALLACY for a in attacks):
            result['recommendations'].append(
                "Review for logical fallacies in reasoning"
            )
        if any(a.attack_type == AttackType.BIAS_DETECTION for a in attacks):
            result['recommendations'].append(
                "Check for cognitive biases influencing the conclusion"
            )

        self.battle_history.append(result)
        return result

    def steelman(self, argument: str) -> str:
        """Create the strongest version of an argument"""
        return f"Steelmanned version of '{argument[:50]}': [strongest possible interpretation with additional supporting evidence and addressing anticipated objections]"

    def strawman_detect(self, original: str, interpretation: str) -> Tuple[bool, float]:
        """Detect if interpretation is a strawman of original"""
        # Simple detection based on keyword overlap
        orig_words = set(original.lower().split())
        interp_words = set(interpretation.lower().split())

        overlap = len(orig_words & interp_words)
        total = len(orig_words | interp_words)

        similarity = overlap / max(total, 1)
        is_strawman = similarity < 0.3  # Low overlap suggests strawman

        return is_strawman, 1.0 - similarity

    def get_statistics(self) -> Dict[str, Any]:
        """Get adversarial system statistics"""
        total_attacks = len(self.red_team.attack_history)
        total_defenses = len(self.blue_team.defense_history)

        successful_defenses = sum(
            1 for d in self.blue_team.defense_history if d.success
        )

        # Calculate average safely without numpy
        confidences = [b['final_confidence'] for b in self.battle_history]
        avg_conf = sum(confidences) / len(confidences) if confidences else 0.0

        return {
            'total_attacks': total_attacks,
            'total_defenses': total_defenses,
            'defense_success_rate': successful_defenses / max(total_defenses, 1),
            'battles_fought': len(self.battle_history),
            'avg_final_confidence': avg_conf
        }


# Singleton
_adversarial_system: Optional[AdversarialReasoningSystem] = None


def get_adversarial_system() -> AdversarialReasoningSystem:
    """Get singleton adversarial system"""
    global _adversarial_system
    if _adversarial_system is None:
        _adversarial_system = AdversarialReasoningSystem()
    return _adversarial_system
