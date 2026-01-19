"""
KNOWLEDGE GRAPH ENGINE
======================
A powerful graph-based knowledge system for Agent Zero.
Stores relationships, enables traversal, discovers patterns.

Features:
- Entity-Relationship-Entity triples
- Graph traversal algorithms
- Pattern discovery
- Semantic clustering
- Inference engine
- Query language
"""

from __future__ import annotations

import hashlib
import json
import time
from collections import defaultdict
from dataclasses import dataclass, field
from enum import Enum, auto
from typing import Any, Callable, Dict, List, Optional, Set, Tuple


class RelationType(Enum):
    """Standard relationship types"""
    IS_A = "is_a"
    HAS_A = "has_a"
    PART_OF = "part_of"
    RELATED_TO = "related_to"
    CAUSES = "causes"
    DEPENDS_ON = "depends_on"
    SIMILAR_TO = "similar_to"
    OPPOSITE_OF = "opposite_of"
    USED_FOR = "used_for"
    CREATED_BY = "created_by"
    LOCATED_IN = "located_in"
    OCCURS_BEFORE = "occurs_before"
    OCCURS_AFTER = "occurs_after"
    ENABLES = "enables"
    PREVENTS = "prevents"
    CUSTOM = "custom"


@dataclass
class Entity:
    """A node in the knowledge graph"""
    id: str
    name: str
    entity_type: str
    properties: Dict[str, Any] = field(default_factory=dict)
    created_at: float = field(default_factory=time.time)
    updated_at: float = field(default_factory=time.time)
    importance: float = 0.5

    def __hash__(self):
        return hash(self.id)

    def __eq__(self, other):
        return isinstance(other, Entity) and self.id == other.id


@dataclass
class Relationship:
    """An edge in the knowledge graph"""
    source_id: str
    target_id: str
    relation_type: str
    properties: Dict[str, Any] = field(default_factory=dict)
    weight: float = 1.0
    confidence: float = 1.0
    created_at: float = field(default_factory=time.time)
    bidirectional: bool = False

    @property
    def id(self) -> str:
        return f"{self.source_id}-{self.relation_type}-{self.target_id}"


@dataclass
class Triple:
    """Subject-Predicate-Object triple"""
    subject: str
    predicate: str
    object: str
    confidence: float = 1.0
    source: str = "user"


class GraphIndex:
    """Efficient indexing for graph queries"""

    def __init__(self):
        self.by_type: Dict[str, Set[str]] = defaultdict(set)
        self.by_property: Dict[str, Dict[Any, Set[str]]] = defaultdict(lambda: defaultdict(set))
        self.outgoing: Dict[str, Set[str]] = defaultdict(set)
        self.incoming: Dict[str, Set[str]] = defaultdict(set)
        self.by_relation: Dict[str, Set[str]] = defaultdict(set)

    def index_entity(self, entity: Entity):
        """Index an entity"""
        self.by_type[entity.entity_type].add(entity.id)
        for key, value in entity.properties.items():
            if isinstance(value, (str, int, float, bool)):
                self.by_property[key][value].add(entity.id)

    def index_relationship(self, rel: Relationship):
        """Index a relationship"""
        self.outgoing[rel.source_id].add(rel.id)
        self.incoming[rel.target_id].add(rel.id)
        self.by_relation[rel.relation_type].add(rel.id)
        if rel.bidirectional:
            self.outgoing[rel.target_id].add(rel.id)
            self.incoming[rel.source_id].add(rel.id)

    def remove_entity(self, entity_id: str):
        """Remove entity from indexes"""
        for type_set in self.by_type.values():
            type_set.discard(entity_id)
        for prop_dict in self.by_property.values():
            for val_set in prop_dict.values():
                val_set.discard(entity_id)

    def remove_relationship(self, rel: Relationship):
        """Remove relationship from indexes"""
        self.outgoing[rel.source_id].discard(rel.id)
        self.incoming[rel.target_id].discard(rel.id)
        self.by_relation[rel.relation_type].discard(rel.id)


class PatternMatcher:
    """Discovers patterns in the knowledge graph"""

    def __init__(self, graph: 'KnowledgeGraph'):
        self.graph = graph
        self.discovered_patterns: List[Dict] = []

    def find_triangles(self) -> List[Tuple[str, str, str]]:
        """Find all triangular relationships (A->B->C->A)"""
        triangles = []
        for entity_id in self.graph.entities:
            neighbors = self.graph.get_neighbors(entity_id)
            for n1 in neighbors:
                for n2 in neighbors:
                    if n1 != n2:
                        n1_neighbors = self.graph.get_neighbors(n1)
                        if n2 in n1_neighbors:
                            triangle = tuple(sorted([entity_id, n1, n2]))
                            if triangle not in triangles:
                                triangles.append(triangle)
        return triangles

    def find_hubs(self, min_connections: int = 5) -> List[Tuple[str, int]]:
        """Find highly connected entities (hubs)"""
        hubs = []
        for entity_id in self.graph.entities:
            connections = len(self.graph.get_neighbors(entity_id))
            if connections >= min_connections:
                hubs.append((entity_id, connections))
        return sorted(hubs, key=lambda x: x[1], reverse=True)

    def find_chains(self, relation_type: str, max_length: int = 5) -> List[List[str]]:
        """Find chains of same relationship type"""
        chains = []
        visited = set()

        for entity_id in self.graph.entities:
            if entity_id in visited:
                continue

            chain = [entity_id]
            current = entity_id

            while len(chain) < max_length:
                rels = self.graph.get_relationships_from(current)
                next_hop = None
                for rel in rels:
                    if rel.relation_type == relation_type and rel.target_id not in chain:
                        next_hop = rel.target_id
                        break

                if next_hop:
                    chain.append(next_hop)
                    current = next_hop
                else:
                    break

            if len(chain) > 1:
                chains.append(chain)
                visited.update(chain)

        return sorted(chains, key=len, reverse=True)

    def find_clusters(self, min_size: int = 3) -> List[Set[str]]:
        """Find densely connected clusters"""
        clusters = []
        visited = set()

        for entity_id in self.graph.entities:
            if entity_id in visited:
                continue

            # BFS to find connected component
            cluster = set()
            queue = [entity_id]

            while queue:
                current = queue.pop(0)
                if current in visited:
                    continue

                visited.add(current)
                cluster.add(current)

                neighbors = self.graph.get_neighbors(current)
                for neighbor in neighbors:
                    if neighbor not in visited:
                        queue.append(neighbor)

            if len(cluster) >= min_size:
                clusters.append(cluster)

        return sorted(clusters, key=len, reverse=True)


class InferenceEngine:
    """Infers new knowledge from existing relationships"""

    def __init__(self, graph: 'KnowledgeGraph'):
        self.graph = graph
        self.rules: List[Callable] = []
        self.inferred: List[Triple] = []
        self._setup_default_rules()

    def _setup_default_rules(self):
        """Setup default inference rules"""
        # Transitivity: If A is_a B and B is_a C, then A is_a C
        self.add_rule(self._transitive_is_a)
        # Inheritance: If A is_a B and B has_a C, then A has_a C
        self.add_rule(self._inheritance)
        # Symmetry: If A similar_to B, then B similar_to A
        self.add_rule(self._symmetry)

    def add_rule(self, rule: Callable):
        """Add an inference rule"""
        self.rules.append(rule)

    def _transitive_is_a(self) -> List[Triple]:
        """Transitive closure for is_a relationships"""
        inferred = []
        is_a_rels = [r for r in self.graph.relationships.values()
                     if r.relation_type == RelationType.IS_A.value]

        for r1 in is_a_rels:
            for r2 in is_a_rels:
                if r1.target_id == r2.source_id:
                    # A is_a B and B is_a C -> A is_a C
                    new_rel_id = f"{r1.source_id}-is_a-{r2.target_id}"
                    if new_rel_id not in self.graph.relationships:
                        inferred.append(Triple(
                            subject=r1.source_id,
                            predicate=RelationType.IS_A.value,
                            object=r2.target_id,
                            confidence=r1.confidence * r2.confidence * 0.9,
                            source="inference:transitive"
                        ))
        return inferred

    def _inheritance(self) -> List[Triple]:
        """Property inheritance through is_a"""
        inferred = []
        is_a_rels = [r for r in self.graph.relationships.values()
                     if r.relation_type == RelationType.IS_A.value]
        has_a_rels = [r for r in self.graph.relationships.values()
                      if r.relation_type == RelationType.HAS_A.value]

        for is_a in is_a_rels:
            for has_a in has_a_rels:
                if is_a.target_id == has_a.source_id:
                    new_rel_id = f"{is_a.source_id}-has_a-{has_a.target_id}"
                    if new_rel_id not in self.graph.relationships:
                        inferred.append(Triple(
                            subject=is_a.source_id,
                            predicate=RelationType.HAS_A.value,
                            object=has_a.target_id,
                            confidence=is_a.confidence * has_a.confidence * 0.8,
                            source="inference:inheritance"
                        ))
        return inferred

    def _symmetry(self) -> List[Triple]:
        """Symmetric relationships"""
        inferred = []
        symmetric_types = [RelationType.SIMILAR_TO.value, RelationType.RELATED_TO.value]

        for rel in self.graph.relationships.values():
            if rel.relation_type in symmetric_types:
                reverse_id = f"{rel.target_id}-{rel.relation_type}-{rel.source_id}"
                if reverse_id not in self.graph.relationships:
                    inferred.append(Triple(
                        subject=rel.target_id,
                        predicate=rel.relation_type,
                        object=rel.source_id,
                        confidence=rel.confidence,
                        source="inference:symmetry"
                    ))
        return inferred

    def run_inference(self) -> List[Triple]:
        """Run all inference rules"""
        all_inferred = []
        for rule in self.rules:
            inferred = rule()
            all_inferred.extend(inferred)

        self.inferred = all_inferred
        return all_inferred

    def apply_inferences(self):
        """Apply inferred triples to the graph"""
        for triple in self.inferred:
            self.graph.add_relationship(
                source_id=triple.subject,
                target_id=triple.object,
                relation_type=triple.predicate,
                properties={"inferred": True, "source": triple.source},
                confidence=triple.confidence
            )


class QueryEngine:
    """Query language for the knowledge graph"""

    def __init__(self, graph: 'KnowledgeGraph'):
        self.graph = graph

    def query(self, pattern: str) -> List[Dict]:
        """
        Simple query language:
        - "?x is_a Person" - find all entities that are a Person
        - "John ?r ?y" - find all relationships from John
        - "?x ?r ?y WHERE type(?x) = 'Person'" - with filter
        """
        results = []
        parts = pattern.strip().split()

        if len(parts) < 3:
            return results

        subject, predicate, obj = parts[0], parts[1], parts[2]

        # Handle different query patterns
        if subject.startswith("?"):
            # Find entities matching predicate-object
            for rel in self.graph.relationships.values():
                if self._matches(rel.relation_type, predicate) and \
                   self._matches(rel.target_id, obj):
                    results.append({
                        subject: rel.source_id,
                        "relation": rel.relation_type,
                        "target": rel.target_id
                    })
        elif predicate.startswith("?"):
            # Find relationships from subject to object
            for rel in self.graph.relationships.values():
                if self._matches(rel.source_id, subject) and \
                   self._matches(rel.target_id, obj):
                    results.append({
                        "source": rel.source_id,
                        predicate: rel.relation_type,
                        "target": rel.target_id
                    })
        elif obj.startswith("?"):
            # Find targets of subject-predicate
            for rel in self.graph.relationships.values():
                if self._matches(rel.source_id, subject) and \
                   self._matches(rel.relation_type, predicate):
                    results.append({
                        "source": rel.source_id,
                        "relation": rel.relation_type,
                        obj: rel.target_id
                    })

        return results

    def _matches(self, value: str, pattern: str) -> bool:
        """Check if value matches pattern"""
        if pattern.startswith("?"):
            return True  # Variable matches anything
        return value == pattern or pattern == "*"

    def path_query(self, start: str, end: str, max_depth: int = 5) -> List[List[str]]:
        """Find all paths between two entities"""
        paths = []
        self._dfs_paths(start, end, [start], paths, max_depth)
        return paths

    def _dfs_paths(self, current: str, target: str, path: List[str],
                   paths: List[List[str]], max_depth: int):
        """DFS to find paths"""
        if current == target:
            paths.append(path.copy())
            return

        if len(path) >= max_depth:
            return

        neighbors = self.graph.get_neighbors(current)
        for neighbor in neighbors:
            if neighbor not in path:
                path.append(neighbor)
                self._dfs_paths(neighbor, target, path, paths, max_depth)
                path.pop()


class KnowledgeGraph:
    """
    The main Knowledge Graph system.
    A powerful graph-based knowledge representation.
    """

    def __init__(self, name: str = "default"):
        self.name = name
        self.entities: Dict[str, Entity] = {}
        self.relationships: Dict[str, Relationship] = {}
        self.index = GraphIndex()
        self.pattern_matcher = PatternMatcher(self)
        self.inference_engine = InferenceEngine(self)
        self.query_engine = QueryEngine(self)
        self.created_at = time.time()
        self.stats = {
            "entities_added": 0,
            "relationships_added": 0,
            "queries_executed": 0,
            "inferences_made": 0
        }

    def _generate_id(self, name: str, entity_type: str) -> str:
        """Generate unique ID for entity"""
        content = f"{name}:{entity_type}:{time.time()}"
        return hashlib.md5(content.encode()).hexdigest()[:12]

    def add_entity(self, name: str, entity_type: str,
                   properties: Dict[str, Any] = None,
                   importance: float = 0.5) -> Entity:
        """Add an entity to the graph"""
        entity_id = self._generate_id(name, entity_type)
        entity = Entity(
            id=entity_id,
            name=name,
            entity_type=entity_type,
            properties=properties or {},
            importance=importance
        )
        self.entities[entity_id] = entity
        self.index.index_entity(entity)
        self.stats["entities_added"] += 1
        return entity

    def add_relationship(self, source_id: str, target_id: str,
                         relation_type: str,
                         properties: Dict[str, Any] = None,
                         weight: float = 1.0,
                         confidence: float = 1.0,
                         bidirectional: bool = False) -> Optional[Relationship]:
        """Add a relationship between entities"""
        if source_id not in self.entities or target_id not in self.entities:
            return None

        rel = Relationship(
            source_id=source_id,
            target_id=target_id,
            relation_type=relation_type,
            properties=properties or {},
            weight=weight,
            confidence=confidence,
            bidirectional=bidirectional
        )
        self.relationships[rel.id] = rel
        self.index.index_relationship(rel)
        self.stats["relationships_added"] += 1
        return rel

    def add_triple(self, subject_name: str, subject_type: str,
                   predicate: str,
                   object_name: str, object_type: str) -> Tuple[Entity, Relationship, Entity]:
        """Convenience method to add subject-predicate-object triple"""
        # Find or create subject
        subject = self.find_entity_by_name(subject_name) or \
                  self.add_entity(subject_name, subject_type)

        # Find or create object
        obj = self.find_entity_by_name(object_name) or \
              self.add_entity(object_name, object_type)

        # Create relationship
        rel = self.add_relationship(subject.id, obj.id, predicate)

        return subject, rel, obj

    def find_entity_by_name(self, name: str) -> Optional[Entity]:
        """Find entity by name"""
        for entity in self.entities.values():
            if entity.name == name:
                return entity
        return None

    def get_entity(self, entity_id: str) -> Optional[Entity]:
        """Get entity by ID"""
        return self.entities.get(entity_id)

    def get_neighbors(self, entity_id: str) -> Set[str]:
        """Get all neighboring entity IDs"""
        neighbors = set()
        for rel in self.relationships.values():
            if rel.source_id == entity_id:
                neighbors.add(rel.target_id)
            if rel.bidirectional and rel.target_id == entity_id:
                neighbors.add(rel.source_id)
        return neighbors

    def get_relationships_from(self, entity_id: str) -> List[Relationship]:
        """Get all relationships from an entity"""
        return [r for r in self.relationships.values() if r.source_id == entity_id]

    def get_relationships_to(self, entity_id: str) -> List[Relationship]:
        """Get all relationships to an entity"""
        return [r for r in self.relationships.values() if r.target_id == entity_id]

    def query(self, pattern: str) -> List[Dict]:
        """Execute a query"""
        self.stats["queries_executed"] += 1
        return self.query_engine.query(pattern)

    def find_path(self, start_name: str, end_name: str,
                  max_depth: int = 5) -> List[List[str]]:
        """Find paths between entities by name"""
        start = self.find_entity_by_name(start_name)
        end = self.find_entity_by_name(end_name)

        if not start or not end:
            return []

        paths = self.query_engine.path_query(start.id, end.id, max_depth)

        # Convert IDs to names
        named_paths = []
        for path in paths:
            named_path = [self.entities[eid].name for eid in path]
            named_paths.append(named_path)

        return named_paths

    def run_inference(self) -> int:
        """Run inference engine and apply results"""
        inferred = self.inference_engine.run_inference()
        self.inference_engine.apply_inferences()
        self.stats["inferences_made"] += len(inferred)
        return len(inferred)

    def find_patterns(self) -> Dict[str, Any]:
        """Discover patterns in the graph"""
        return {
            "triangles": self.pattern_matcher.find_triangles()[:10],
            "hubs": self.pattern_matcher.find_hubs()[:10],
            "clusters": [len(c) for c in self.pattern_matcher.find_clusters()][:10]
        }

    def get_subgraph(self, entity_id: str, depth: int = 2) -> Dict[str, Any]:
        """Get subgraph around an entity"""
        entities = {entity_id}
        rels = []

        current_layer = {entity_id}
        for _ in range(depth):
            next_layer = set()
            for eid in current_layer:
                neighbors = self.get_neighbors(eid)
                next_layer.update(neighbors)

                for rel in self.get_relationships_from(eid):
                    rels.append({
                        "source": self.entities[rel.source_id].name,
                        "relation": rel.relation_type,
                        "target": self.entities[rel.target_id].name
                    })

            entities.update(next_layer)
            current_layer = next_layer

        return {
            "entities": [self.entities[eid].name for eid in entities if eid in self.entities],
            "relationships": rels[:50]
        }

    def export_json(self) -> str:
        """Export graph as JSON"""
        data = {
            "name": self.name,
            "entities": [
                {
                    "id": e.id,
                    "name": e.name,
                    "type": e.entity_type,
                    "properties": e.properties,
                    "importance": e.importance
                }
                for e in self.entities.values()
            ],
            "relationships": [
                {
                    "source": r.source_id,
                    "target": r.target_id,
                    "type": r.relation_type,
                    "weight": r.weight,
                    "confidence": r.confidence
                }
                for r in self.relationships.values()
            ],
            "stats": self.stats
        }
        return json.dumps(data, indent=2)

    def import_json(self, data: str):
        """Import graph from JSON"""
        parsed = json.loads(data)

        # Import entities
        id_map = {}
        for e in parsed.get("entities", []):
            entity = self.add_entity(
                name=e["name"],
                entity_type=e["type"],
                properties=e.get("properties", {}),
                importance=e.get("importance", 0.5)
            )
            id_map[e["id"]] = entity.id

        # Import relationships
        for r in parsed.get("relationships", []):
            source_id = id_map.get(r["source"], r["source"])
            target_id = id_map.get(r["target"], r["target"])
            if source_id in self.entities and target_id in self.entities:
                self.add_relationship(
                    source_id=source_id,
                    target_id=target_id,
                    relation_type=r["type"],
                    weight=r.get("weight", 1.0),
                    confidence=r.get("confidence", 1.0)
                )

    def get_statistics(self) -> Dict[str, Any]:
        """Get graph statistics"""
        entity_types = defaultdict(int)
        relation_types = defaultdict(int)

        for e in self.entities.values():
            entity_types[e.entity_type] += 1

        for r in self.relationships.values():
            relation_types[r.relation_type] += 1

        return {
            "total_entities": len(self.entities),
            "total_relationships": len(self.relationships),
            "entity_types": dict(entity_types),
            "relation_types": dict(relation_types),
            "operations": self.stats,
            "patterns": {
                "hubs": len(self.pattern_matcher.find_hubs()),
                "clusters": len(self.pattern_matcher.find_clusters())
            }
        }


# Global knowledge graphs
_knowledge_graphs: Dict[str, KnowledgeGraph] = {}


def get_knowledge_graph(name: str = "default") -> KnowledgeGraph:
    """Get or create a knowledge graph by name"""
    if name not in _knowledge_graphs:
        _knowledge_graphs[name] = KnowledgeGraph(name)
    return _knowledge_graphs[name]


def list_knowledge_graphs() -> List[str]:
    """List all knowledge graph names"""
    return list(_knowledge_graphs.keys())
