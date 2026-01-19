"""
ZERO-SHOT DOMAIN ADAPTER
========================
Transfer knowledge to completely new domains without training.

Features:
- Structural analogy mapping
- Abstract pattern extraction
- Domain-independent reasoning primitives
- Cross-domain concept bridging
- Invariant feature detection
"""

from __future__ import annotations

import hashlib
import random
from collections import defaultdict
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Set, Tuple

# Optional numpy
try:
    import numpy as np
    HAS_NUMPY = True
except ImportError:
    np = None
    HAS_NUMPY = False


@dataclass
class DomainConcept:
    """A concept within a domain"""
    name: str
    domain: str
    properties: Dict[str, Any]
    relations: List[Tuple[str, str]]  # (relation_type, target_concept)
    abstraction_level: int = 0
    embedding: Optional[Any] = None  # numpy array if available


@dataclass
class StructuralMapping:
    """A mapping between structures in different domains"""
    source_domain: str
    target_domain: str
    concept_map: Dict[str, str]  # source_concept -> target_concept
    relation_map: Dict[str, str]  # source_relation -> target_relation
    confidence: float
    invariants: List[str]  # Properties preserved across domains


class AbstractPatternLibrary:
    """Library of domain-independent abstract patterns"""

    PATTERNS = {
        'hierarchy': {
            'relations': ['contains', 'parent_of', 'subsumes'],
            'properties': ['level', 'children_count'],
            'operations': ['traverse_up', 'traverse_down', 'find_root']
        },
        'network': {
            'relations': ['connected_to', 'flows_to', 'influences'],
            'properties': ['degree', 'centrality'],
            'operations': ['find_path', 'find_clusters', 'find_bridges']
        },
        'sequence': {
            'relations': ['follows', 'precedes', 'causes'],
            'properties': ['position', 'duration'],
            'operations': ['next', 'previous', 'find_pattern']
        },
        'container': {
            'relations': ['contains', 'inside_of', 'overlaps'],
            'properties': ['capacity', 'contents'],
            'operations': ['add', 'remove', 'check_membership']
        },
        'transformation': {
            'relations': ['transforms_to', 'derived_from', 'equivalent_to'],
            'properties': ['input_type', 'output_type'],
            'operations': ['apply', 'reverse', 'compose']
        },
        'competition': {
            'relations': ['competes_with', 'dominates', 'excludes'],
            'properties': ['resources', 'fitness'],
            'operations': ['compare', 'select', 'eliminate']
        },
        'cooperation': {
            'relations': ['cooperates_with', 'supports', 'enhances'],
            'properties': ['contribution', 'shared_goal'],
            'operations': ['combine', 'coordinate', 'share']
        },
        'cycle': {
            'relations': ['leads_to', 'returns_to', 'oscillates'],
            'properties': ['period', 'phase'],
            'operations': ['advance', 'reset', 'find_period']
        }
    }

    def identify_patterns(self, relations: List[Tuple[str, str, str]]) -> List[str]:
        """Identify abstract patterns from concrete relations"""
        found_patterns = []
        relation_types = set(r[1] for r in relations)

        for pattern_name, pattern_def in self.PATTERNS.items():
            pattern_relations = set(pattern_def['relations'])

            # Check for overlap with pattern relations
            overlap = len(relation_types & pattern_relations)
            if overlap > 0:
                confidence = overlap / len(pattern_relations)
                if confidence > 0.3:
                    found_patterns.append(pattern_name)

        return found_patterns

    def get_pattern_operations(self, pattern: str) -> List[str]:
        """Get operations available for a pattern"""
        return self.PATTERNS.get(pattern, {}).get('operations', [])


class ConceptBridge:
    """Bridges concepts across domains"""

    def __init__(self):
        self.concept_embeddings: Dict[str, Any] = {}
        self.domain_concepts: Dict[str, List[DomainConcept]] = defaultdict(list)
        self.bridges: List[Tuple[DomainConcept, DomainConcept, float]] = []

    def add_concept(self, concept: DomainConcept):
        """Add a concept to the bridge"""
        self.domain_concepts[concept.domain].append(concept)

        # Generate embedding if not provided
        if concept.embedding is None:
            concept.embedding = self._generate_embedding(concept)

        self.concept_embeddings[f"{concept.domain}:{concept.name}"] = concept.embedding

    def _generate_embedding(self, concept: DomainConcept) -> List[float]:
        """Generate embedding from concept properties"""
        # Create deterministic embedding from concept properties
        hash_input = f"{concept.name}:{concept.domain}:{str(concept.properties)}"
        hash_val = int(hashlib.md5(hash_input.encode()).hexdigest()[:8], 16)

        # Use random with seed for reproducibility
        random.seed(hash_val % 10000)
        embedding = [random.gauss(0, 1) for _ in range(64)]

        # Add structural features
        embedding[0] = concept.abstraction_level / 10.0
        embedding[1] = len(concept.relations) / 20.0
        embedding[2] = len(concept.properties) / 10.0

        # Normalize
        norm = (sum(x*x for x in embedding) ** 0.5) + 1e-10
        return [x / norm for x in embedding]

    def find_bridges(self, source_domain: str, target_domain: str,
                     threshold: float = 0.5) -> List[Tuple[str, str, float]]:
        """Find concept bridges between domains"""
        bridges = []

        source_concepts = self.domain_concepts.get(source_domain, [])
        target_concepts = self.domain_concepts.get(target_domain, [])

        for sc in source_concepts:
            for tc in target_concepts:
                if sc.embedding is not None and tc.embedding is not None:
                    # Dot product
                    similarity = sum(a*b for a, b in zip(sc.embedding, tc.embedding))
                    if similarity > threshold:
                        bridges.append((sc.name, tc.name, similarity))
                        self.bridges.append((sc, tc, similarity))

        bridges.sort(key=lambda x: x[2], reverse=True)
        return bridges


class InvariantDetector:
    """Detects invariant properties across domain transformations"""

    def __init__(self):
        self.observed_transformations: List[Dict] = []
        self.invariant_cache: Dict[str, List[str]] = {}

    def observe_transformation(self, source: Dict[str, Any],
                               target: Dict[str, Any],
                               transformation: str):
        """Observe a domain transformation"""
        # Find preserved properties
        preserved = []
        for key in source:
            if key in target and source[key] == target[key]:
                preserved.append(key)

        self.observed_transformations.append({
            'source': source,
            'target': target,
            'transformation': transformation,
            'preserved': preserved
        })

        # Update invariant cache
        if transformation not in self.invariant_cache:
            self.invariant_cache[transformation] = preserved
        else:
            # Keep only properties that are always preserved
            self.invariant_cache[transformation] = [
                p for p in self.invariant_cache[transformation]
                if p in preserved
            ]

    def get_invariants(self, transformation: str) -> List[str]:
        """Get known invariants for a transformation type"""
        return self.invariant_cache.get(transformation, [])

    def predict_preserved(self, source: Dict[str, Any],
                          transformation: str) -> Dict[str, Any]:
        """Predict what will be preserved after transformation"""
        invariants = self.get_invariants(transformation)
        return {k: v for k, v in source.items() if k in invariants}


class ZeroShotDomainAdapter:
    """
    Complete zero-shot domain adaptation system.
    """

    def __init__(self):
        self.pattern_library = AbstractPatternLibrary()
        self.concept_bridge = ConceptBridge()
        self.invariant_detector = InvariantDetector()

        self.domain_knowledge: Dict[str, Dict] = {}
        self.successful_transfers: List[Dict] = []

    def register_domain(self, domain: str, concepts: List[Dict],
                        relations: List[Tuple[str, str, str]]):
        """Register a domain with its concepts and relations"""
        self.domain_knowledge[domain] = {
            'concepts': concepts,
            'relations': relations,
            'patterns': self.pattern_library.identify_patterns(relations)
        }

        # Add concepts to bridge
        for concept_dict in concepts:
            concept = DomainConcept(
                name=concept_dict.get('name', ''),
                domain=domain,
                properties=concept_dict.get('properties', {}),
                relations=[(r[1], r[2]) for r in relations if r[0] == concept_dict.get('name', '')],
                abstraction_level=concept_dict.get('level', 0)
            )
            self.concept_bridge.add_concept(concept)

    def transfer_knowledge(self, source_domain: str, target_domain: str,
                          source_solution: Dict[str, Any]) -> Dict[str, Any]:
        """Transfer a solution from source domain to target domain"""
        if source_domain not in self.domain_knowledge:
            return {'error': f'Unknown source domain: {source_domain}'}

        if target_domain not in self.domain_knowledge:
            return {'error': f'Unknown target domain: {target_domain}'}

        source_info = self.domain_knowledge[source_domain]
        target_info = self.domain_knowledge[target_domain]

        # Find pattern overlap
        shared_patterns = set(source_info['patterns']) & set(target_info['patterns'])

        # Find concept bridges
        bridges = self.concept_bridge.find_bridges(source_domain, target_domain, 0.3)

        # Create mapping
        mapping = StructuralMapping(
            source_domain=source_domain,
            target_domain=target_domain,
            concept_map={b[0]: b[1] for b in bridges[:10]},
            relation_map={},  # Would be filled with relation mapping
            confidence=len(bridges) / max(len(source_info['concepts']), 1),
            invariants=list(shared_patterns)
        )

        # Transform solution
        transferred = {
            'original_solution': source_solution,
            'mapping': {
                'concept_map': mapping.concept_map,
                'shared_patterns': list(shared_patterns),
                'confidence': mapping.confidence
            },
            'adapted_solution': self._apply_mapping(source_solution, mapping),
            'recommendations': self._generate_transfer_recommendations(
                source_info, target_info, mapping
            )
        }

        self.successful_transfers.append(transferred)
        return transferred

    def _apply_mapping(self, solution: Dict[str, Any],
                       mapping: StructuralMapping) -> Dict[str, Any]:
        """Apply structural mapping to transform solution"""
        adapted = {}

        for key, value in solution.items():
            # Map concepts
            if key in mapping.concept_map:
                new_key = mapping.concept_map[key]
            else:
                new_key = key

            # Recursively map values if they're dicts
            if isinstance(value, dict):
                adapted[new_key] = self._apply_mapping(value, mapping)
            elif isinstance(value, str) and value in mapping.concept_map:
                adapted[new_key] = mapping.concept_map[value]
            else:
                adapted[new_key] = value

        adapted['_transfer_confidence'] = mapping.confidence
        adapted['_invariants_preserved'] = mapping.invariants

        return adapted

    def _generate_transfer_recommendations(self, source_info: Dict,
                                           target_info: Dict,
                                           mapping: StructuralMapping) -> List[str]:
        """Generate recommendations for the transfer"""
        recommendations = []

        if mapping.confidence < 0.3:
            recommendations.append(
                "Low confidence transfer - verify all concept mappings manually"
            )

        # Check for unmapped concepts
        unmapped = len(source_info['concepts']) - len(mapping.concept_map)
        if unmapped > 0:
            recommendations.append(
                f"{unmapped} concepts could not be mapped - may need manual adaptation"
            )

        # Pattern-based recommendations
        source_only = set(source_info['patterns']) - set(target_info['patterns'])
        if source_only:
            recommendations.append(
                f"Source patterns not in target: {source_only} - solution may need restructuring"
            )

        target_only = set(target_info['patterns']) - set(source_info['patterns'])
        if target_only:
            recommendations.append(
                f"Target has additional patterns: {target_only} - consider exploiting these"
            )

        return recommendations

    def get_transfer_confidence(self, source_domain: str,
                                target_domain: str) -> float:
        """Estimate confidence for a potential transfer"""
        if source_domain not in self.domain_knowledge:
            return 0.0
        if target_domain not in self.domain_knowledge:
            return 0.0

        source_patterns = set(self.domain_knowledge[source_domain]['patterns'])
        target_patterns = set(self.domain_knowledge[target_domain]['patterns'])

        overlap = len(source_patterns & target_patterns)
        total = len(source_patterns | target_patterns)

        pattern_score = overlap / max(total, 1)

        bridges = self.concept_bridge.find_bridges(source_domain, target_domain)
        bridge_score = len(bridges) / 10  # Normalize

        return min(1.0, (pattern_score + bridge_score) / 2)

    def get_statistics(self) -> Dict[str, Any]:
        """Get adapter statistics"""
        return {
            'registered_domains': len(self.domain_knowledge),
            'total_concepts': sum(
                len(d['concepts']) for d in self.domain_knowledge.values()
            ),
            'total_bridges': len(self.concept_bridge.bridges),
            'successful_transfers': len(self.successful_transfers),
            'pattern_coverage': {
                domain: info['patterns']
                for domain, info in self.domain_knowledge.items()
            }
        }


# Singleton
_zero_shot_adapter: Optional[ZeroShotDomainAdapter] = None


def get_zero_shot_adapter() -> ZeroShotDomainAdapter:
    """Get singleton adapter"""
    global _zero_shot_adapter
    if _zero_shot_adapter is None:
        _zero_shot_adapter = ZeroShotDomainAdapter()
    return _zero_shot_adapter
