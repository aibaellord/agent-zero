"""
TEMPORAL CAUSAL ENGINE
======================
Cause-effect chains, counterfactual reasoning, what-if simulation.

Features:
- Causal graph construction
- Counterfactual simulation
- Temporal dependency tracking
- Intervention analysis
- Root cause identification
"""

from __future__ import annotations

import random
import time
from collections import defaultdict
from dataclasses import dataclass, field
from enum import Enum, auto
from typing import Any, Dict, List, Optional, Set, Tuple

# Optional numpy
try:
    import numpy as np
    HAS_NUMPY = True
except ImportError:
    np = None
    HAS_NUMPY = False


class CausalRelationType(Enum):
    """Types of causal relationships"""
    CAUSES = auto()
    ENABLES = auto()
    PREVENTS = auto()
    CORRELATES = auto()
    PRECEDES = auto()
    TRIGGERS = auto()
    AMPLIFIES = auto()
    DAMPENS = auto()


@dataclass
class CausalNode:
    """A node in the causal graph"""
    id: str
    name: str
    value: Any = None
    timestamp: Optional[float] = None
    properties: Dict[str, Any] = field(default_factory=dict)


@dataclass
class CausalEdge:
    """A causal relationship between nodes"""
    source: str
    target: str
    relation: CausalRelationType
    strength: float = 1.0  # -1 to 1
    delay: float = 0.0  # Time delay
    conditions: Dict[str, Any] = field(default_factory=dict)


@dataclass
class Intervention:
    """An intervention on a causal node"""
    node_id: str
    new_value: Any
    timestamp: float


@dataclass
class CounterfactualQuery:
    """A counterfactual query"""
    observation: Dict[str, Any]  # What we observed
    intervention: Dict[str, Any]  # What we hypothetically change
    query: str  # What we want to know


class CausalGraph:
    """Directed acyclic graph for causal reasoning"""

    def __init__(self):
        self.nodes: Dict[str, CausalNode] = {}
        self.edges: List[CausalEdge] = []
        self.adjacency: Dict[str, List[str]] = defaultdict(list)
        self.reverse_adjacency: Dict[str, List[str]] = defaultdict(list)

    def add_node(self, node: CausalNode):
        """Add a node to the graph"""
        self.nodes[node.id] = node

    def add_edge(self, edge: CausalEdge):
        """Add a causal edge"""
        self.edges.append(edge)
        self.adjacency[edge.source].append(edge.target)
        self.reverse_adjacency[edge.target].append(edge.source)

    def get_causes(self, node_id: str) -> List[str]:
        """Get direct causes of a node"""
        return self.reverse_adjacency.get(node_id, [])

    def get_effects(self, node_id: str) -> List[str]:
        """Get direct effects of a node"""
        return self.adjacency.get(node_id, [])

    def get_ancestors(self, node_id: str) -> Set[str]:
        """Get all ancestors (transitive causes)"""
        ancestors = set()
        queue = list(self.get_causes(node_id))

        while queue:
            current = queue.pop(0)
            if current not in ancestors:
                ancestors.add(current)
                queue.extend(self.get_causes(current))

        return ancestors

    def get_descendants(self, node_id: str) -> Set[str]:
        """Get all descendants (transitive effects)"""
        descendants = set()
        queue = list(self.get_effects(node_id))

        while queue:
            current = queue.pop(0)
            if current not in descendants:
                descendants.add(current)
                queue.extend(self.get_effects(current))

        return descendants

    def find_paths(self, source: str, target: str,
                   max_length: int = 10) -> List[List[str]]:
        """Find all causal paths from source to target"""
        paths = []

        def dfs(current: str, path: List[str]):
            if len(path) > max_length:
                return
            if current == target:
                paths.append(path.copy())
                return

            for next_node in self.get_effects(current):
                if next_node not in path:  # Avoid cycles
                    path.append(next_node)
                    dfs(next_node, path)
                    path.pop()

        dfs(source, [source])
        return paths

    def get_edge(self, source: str, target: str) -> Optional[CausalEdge]:
        """Get edge between two nodes"""
        for edge in self.edges:
            if edge.source == source and edge.target == target:
                return edge
        return None


class CounterfactualSimulator:
    """Simulates counterfactual scenarios"""

    def __init__(self, causal_graph: CausalGraph):
        self.graph = causal_graph
        self.simulation_history: List[Dict] = []

    def simulate(self, intervention: Intervention,
                 steps: int = 10) -> Dict[str, List[Any]]:
        """Simulate effect of intervention"""
        # Get affected nodes
        affected = self.graph.get_descendants(intervention.node_id)
        affected.add(intervention.node_id)

        # Initialize values
        current_values = {
            node_id: self.graph.nodes[node_id].value
            for node_id in self.graph.nodes
        }

        # Apply intervention
        current_values[intervention.node_id] = intervention.new_value

        # Track history
        history = {node_id: [current_values[node_id]] for node_id in affected}

        # Propagate effects
        for step in range(steps):
            new_values = current_values.copy()

            for node_id in affected:
                if node_id == intervention.node_id:
                    continue  # Intervention is fixed

                # Calculate new value based on causes
                causes = self.graph.get_causes(node_id)
                if causes:
                    # Simple linear combination
                    total_effect = 0.0
                    for cause_id in causes:
                        edge = self.graph.get_edge(cause_id, node_id)
                        if edge:
                            cause_value = current_values.get(cause_id, 0)
                            if isinstance(cause_value, (int, float)):
                                total_effect += edge.strength * cause_value

                    new_values[node_id] = total_effect

            current_values = new_values
            for node_id in affected:
                history[node_id].append(current_values[node_id])

        result = {
            'intervention': {
                'node': intervention.node_id,
                'value': intervention.new_value
            },
            'affected_nodes': list(affected),
            'trajectories': history,
            'final_state': {node_id: history[node_id][-1] for node_id in affected}
        }

        self.simulation_history.append(result)
        return result

    def compare_scenarios(self, interventions: List[Intervention],
                          steps: int = 10) -> Dict[str, Any]:
        """Compare multiple intervention scenarios"""
        results = []

        for intervention in interventions:
            result = self.simulate(intervention, steps)
            results.append(result)

        # Compare final states
        comparison = {
            'scenarios': results,
            'best_by_node': {},
            'summary': []
        }

        # Find best intervention for each affected node
        all_affected = set()
        for r in results:
            all_affected.update(r['affected_nodes'])

        for node_id in all_affected:
            values = []
            for i, r in enumerate(results):
                if node_id in r['final_state']:
                    values.append((i, r['final_state'][node_id]))

            if values:
                # Assuming higher is better
                best = max(values, key=lambda x: x[1] if isinstance(x[1], (int, float)) else 0)
                comparison['best_by_node'][node_id] = {
                    'intervention_index': best[0],
                    'value': best[1]
                }

        return comparison


class RootCauseAnalyzer:
    """Analyzes root causes of observed effects"""

    def __init__(self, causal_graph: CausalGraph):
        self.graph = causal_graph

    def find_root_causes(self, effect_node: str,
                         observation: Dict[str, Any] = None) -> List[Dict]:
        """Find potential root causes of an observed effect"""
        # Get all ancestors
        ancestors = self.graph.get_ancestors(effect_node)

        # Find roots (nodes with no causes)
        roots = []
        for ancestor in ancestors:
            if not self.graph.get_causes(ancestor):
                paths = self.graph.find_paths(ancestor, effect_node)

                # Calculate path strength
                for path in paths:
                    strength = 1.0
                    for i in range(len(path) - 1):
                        edge = self.graph.get_edge(path[i], path[i+1])
                        if edge:
                            strength *= abs(edge.strength)

                    roots.append({
                        'root': ancestor,
                        'path': path,
                        'path_length': len(path),
                        'strength': strength
                    })

        # Sort by strength
        roots.sort(key=lambda x: x['strength'], reverse=True)
        return roots

    def blame_attribution(self, effect_node: str,
                          effect_value: float) -> Dict[str, float]:
        """Attribute blame across causes using Shapley-like values"""
        causes = self.graph.get_causes(effect_node)

        if not causes:
            return {}

        # Simple attribution based on edge strengths
        total_strength = 0.0
        attributions = {}

        for cause_id in causes:
            edge = self.graph.get_edge(cause_id, effect_node)
            if edge:
                cause_value = self.graph.nodes.get(cause_id, CausalNode(cause_id, cause_id)).value
                if isinstance(cause_value, (int, float)):
                    contribution = edge.strength * cause_value
                    total_strength += abs(contribution)
                    attributions[cause_id] = contribution

        # Normalize
        if total_strength > 0:
            attributions = {
                k: v / total_strength for k, v in attributions.items()
            }

        return attributions


class TemporalCausalEngine:
    """
    Complete temporal causal reasoning engine.
    """

    def __init__(self):
        self.graph = CausalGraph()
        self.simulator = CounterfactualSimulator(self.graph)
        self.analyzer = RootCauseAnalyzer(self.graph)

        self.event_log: List[Dict] = []
        self.learned_relations: List[CausalEdge] = []

    def add_event(self, event_id: str, name: str, value: Any = None,
                  timestamp: float = None, properties: Dict = None):
        """Add an event/node to the causal graph"""
        node = CausalNode(
            id=event_id,
            name=name,
            value=value,
            timestamp=timestamp or time.time(),
            properties=properties or {}
        )
        self.graph.add_node(node)

        self.event_log.append({
            'type': 'add_event',
            'event': event_id,
            'timestamp': node.timestamp
        })

    def add_causation(self, cause: str, effect: str,
                      relation: CausalRelationType = CausalRelationType.CAUSES,
                      strength: float = 1.0, delay: float = 0.0):
        """Add a causal relationship"""
        edge = CausalEdge(
            source=cause,
            target=effect,
            relation=relation,
            strength=strength,
            delay=delay
        )
        self.graph.add_edge(edge)

    def what_if(self, node_id: str, new_value: Any,
                steps: int = 10) -> Dict[str, Any]:
        """Answer a what-if question"""
        intervention = Intervention(
            node_id=node_id,
            new_value=new_value,
            timestamp=time.time()
        )
        return self.simulator.simulate(intervention, steps)

    def why(self, effect_node: str) -> Dict[str, Any]:
        """Answer a 'why' question - find root causes"""
        root_causes = self.analyzer.find_root_causes(effect_node)
        attributions = self.analyzer.blame_attribution(
            effect_node,
            self.graph.nodes.get(effect_node, CausalNode('', '')).value or 0
        )

        return {
            'effect': effect_node,
            'root_causes': root_causes[:5],
            'direct_causes': self.graph.get_causes(effect_node),
            'blame_attribution': attributions
        }

    def what_could_happen(self, trigger_node: str) -> Dict[str, Any]:
        """Predict what could happen if a node is triggered"""
        effects = self.graph.get_descendants(trigger_node)

        # Trace paths to each effect
        effect_analysis = []
        for effect_id in effects:
            paths = self.graph.find_paths(trigger_node, effect_id)
            effect_analysis.append({
                'effect': effect_id,
                'paths': len(paths),
                'shortest_path': min(len(p) for p in paths) if paths else 0,
                'effect_node': self.graph.nodes.get(effect_id)
            })

        return {
            'trigger': trigger_node,
            'total_effects': len(effects),
            'effect_analysis': effect_analysis
        }

    def compare_interventions(self, node_id: str,
                              values: List[Any],
                              steps: int = 10) -> Dict[str, Any]:
        """Compare different intervention values"""
        interventions = [
            Intervention(node_id=node_id, new_value=v, timestamp=time.time())
            for v in values
        ]
        return self.simulator.compare_scenarios(interventions, steps)

    def learn_causation(self, observations: List[Dict]) -> List[CausalEdge]:
        """Learn causal relationships from observations"""
        # Simple temporal precedence + correlation learning
        learned = []

        # Sort by timestamp
        sorted_obs = sorted(observations, key=lambda x: x.get('timestamp', 0))

        for i in range(len(sorted_obs) - 1):
            current = sorted_obs[i]
            next_obs = sorted_obs[i + 1]

            # If one follows another closely, might be causal
            time_diff = next_obs.get('timestamp', 0) - current.get('timestamp', 0)

            if 0 < time_diff < 60:  # Within 1 minute
                edge = CausalEdge(
                    source=current.get('id', str(i)),
                    target=next_obs.get('id', str(i+1)),
                    relation=CausalRelationType.PRECEDES,
                    strength=0.5,  # Low confidence for learned relations
                    delay=time_diff
                )
                learned.append(edge)
                self.learned_relations.append(edge)

        return learned

    def get_causal_chain(self, start: str, end: str) -> Dict[str, Any]:
        """Get the causal chain between two events"""
        paths = self.graph.find_paths(start, end)

        if not paths:
            return {
                'exists': False,
                'start': start,
                'end': end,
                'message': 'No causal path found'
            }

        # Analyze paths
        path_analysis = []
        for path in paths:
            total_strength = 1.0
            total_delay = 0.0
            edges = []

            for i in range(len(path) - 1):
                edge = self.graph.get_edge(path[i], path[i+1])
                if edge:
                    total_strength *= abs(edge.strength)
                    total_delay += edge.delay
                    edges.append({
                        'from': path[i],
                        'to': path[i+1],
                        'relation': edge.relation.name,
                        'strength': edge.strength
                    })

            path_analysis.append({
                'path': path,
                'length': len(path),
                'total_strength': total_strength,
                'total_delay': total_delay,
                'edges': edges
            })

        # Sort by strength
        path_analysis.sort(key=lambda x: x['total_strength'], reverse=True)

        return {
            'exists': True,
            'start': start,
            'end': end,
            'paths': path_analysis,
            'strongest_path': path_analysis[0] if path_analysis else None
        }

    def get_statistics(self) -> Dict[str, Any]:
        """Get engine statistics"""
        return {
            'nodes': len(self.graph.nodes),
            'edges': len(self.graph.edges),
            'events_logged': len(self.event_log),
            'learned_relations': len(self.learned_relations),
            'simulations_run': len(self.simulator.simulation_history)
        }


# Singleton
_temporal_causal_engine: Optional[TemporalCausalEngine] = None


def get_temporal_causal_engine() -> TemporalCausalEngine:
    """Get singleton engine"""
    global _temporal_causal_engine
    if _temporal_causal_engine is None:
        _temporal_causal_engine = TemporalCausalEngine()
    return _temporal_causal_engine
