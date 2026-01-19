"""
HEISENBERG MEMORY SUPERCHARGER
==============================
Enhanced memory system with:
- Weighted retrieval based on topological relevance
- Auto-consolidation of similar memories
- Metadata enrichment with quantum state
- Temporal decay with importance preservation
"""

from __future__ import annotations

import asyncio
import hashlib
import time
from collections import defaultdict
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional, Tuple

import numpy as np


class MemoryImportance(Enum):
    """Memory importance levels"""
    CRITICAL = 5
    HIGH = 4
    MEDIUM = 3
    LOW = 2
    EPHEMERAL = 1


@dataclass
class EnhancedMemory:
    """Enhanced memory entry with Heisenberg metadata"""
    id: str
    content: str
    embedding: np.ndarray
    importance: MemoryImportance = MemoryImportance.MEDIUM
    creation_time: float = field(default_factory=time.time)
    last_access_time: float = field(default_factory=time.time)
    access_count: int = 0
    quantum_amplitude: float = 1.0
    topological_neighbors: List[str] = field(default_factory=list)
    tags: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)

    @property
    def age(self) -> float:
        """Age in seconds"""
        return time.time() - self.creation_time

    @property
    def recency(self) -> float:
        """Recency score (higher = more recent)"""
        return 1.0 / (1.0 + (time.time() - self.last_access_time) / 3600)

    @property
    def relevance_score(self) -> float:
        """Combined relevance score"""
        importance_weight = self.importance.value / 5.0
        recency_weight = self.recency
        access_weight = min(1.0, self.access_count / 10.0)
        quantum_weight = self.quantum_amplitude

        return (importance_weight * 0.3 +
                recency_weight * 0.3 +
                access_weight * 0.2 +
                quantum_weight * 0.2)


class MemorySupercharger:
    """
    Enhanced memory system with Heisenberg integration.
    """

    def __init__(self,
                 max_memories: int = 10000,
                 consolidation_threshold: float = 0.85,
                 decay_rate: float = 0.001):
        self.max_memories = max_memories
        self.consolidation_threshold = consolidation_threshold
        self.decay_rate = decay_rate

        # Memory storage
        self.memories: Dict[str, EnhancedMemory] = {}
        self.tag_index: Dict[str, List[str]] = defaultdict(list)
        self.temporal_index: List[str] = []  # Ordered by creation time

        # Consolidation tracking
        self.consolidation_pairs: List[Tuple[str, str, float]] = []
        self.consolidation_history: List[Dict] = []

        # Statistics
        self.stats = {
            'total_insertions': 0,
            'total_retrievals': 0,
            'total_consolidations': 0,
            'total_decays': 0
        }

    def insert(self,
               content: str,
               embedding: Optional[np.ndarray] = None,
               importance: MemoryImportance = MemoryImportance.MEDIUM,
               tags: Optional[List[str]] = None,
               metadata: Optional[Dict] = None) -> str:
        """Insert a new memory"""
        # Generate ID
        mem_id = hashlib.md5(f"{content}:{time.time()}".encode()).hexdigest()[:16]

        # Generate embedding if not provided
        if embedding is None:
            # Simple hash-based embedding
            content_hash = int(hashlib.md5(content.encode()).hexdigest()[:8], 16)
            np.random.seed(content_hash % 10000)
            embedding = np.random.randn(128)
            embedding = embedding / np.linalg.norm(embedding)

        # Create memory entry
        memory = EnhancedMemory(
            id=mem_id,
            content=content,
            embedding=embedding,
            importance=importance,
            tags=tags or [],
            metadata=metadata or {}
        )

        # Store
        self.memories[mem_id] = memory
        self.temporal_index.append(mem_id)

        # Update tag index
        for tag in memory.tags:
            self.tag_index[tag].append(mem_id)

        self.stats['total_insertions'] += 1

        # Find topological neighbors
        self._update_topological_neighbors(mem_id)

        # Check for consolidation opportunities
        self._check_consolidation(mem_id)

        # Evict if over capacity
        if len(self.memories) > self.max_memories:
            self._evict_least_relevant()

        return mem_id

    def retrieve(self,
                 query: Optional[str] = None,
                 query_embedding: Optional[np.ndarray] = None,
                 tags: Optional[List[str]] = None,
                 min_importance: MemoryImportance = MemoryImportance.EPHEMERAL,
                 limit: int = 10,
                 boost_recent: bool = True) -> List[EnhancedMemory]:
        """Retrieve memories with weighted scoring"""
        candidates = []

        # Generate query embedding if needed
        if query and query_embedding is None:
            query_hash = int(hashlib.md5(query.encode()).hexdigest()[:8], 16)
            np.random.seed(query_hash % 10000)
            query_embedding = np.random.randn(128)
            query_embedding = query_embedding / np.linalg.norm(query_embedding)

        for mem_id, memory in self.memories.items():
            # Filter by importance
            if memory.importance.value < min_importance.value:
                continue

            # Filter by tags
            if tags and not any(t in memory.tags for t in tags):
                continue

            # Calculate similarity score
            if query_embedding is not None:
                similarity = np.dot(query_embedding, memory.embedding)
            else:
                similarity = 0.5  # Default if no query

            # Combined score
            score = similarity * 0.5 + memory.relevance_score * 0.5

            if boost_recent:
                score *= (1 + memory.recency * 0.2)

            candidates.append((memory, score))

        # Sort by score
        candidates.sort(key=lambda x: x[1], reverse=True)

        # Update access stats
        results = []
        for memory, score in candidates[:limit]:
            memory.last_access_time = time.time()
            memory.access_count += 1
            results.append(memory)

        self.stats['total_retrievals'] += len(results)

        return results

    def decay(self) -> int:
        """Apply temporal decay to memories"""
        decayed_count = 0

        for memory in self.memories.values():
            # Decay quantum amplitude
            decay_factor = 1 - (self.decay_rate * memory.age / 3600)
            decay_factor = max(0.1, decay_factor)  # Minimum amplitude

            # Importance protects against decay
            protection = memory.importance.value / 5.0
            actual_decay = decay_factor + (1 - decay_factor) * protection

            old_amplitude = memory.quantum_amplitude
            memory.quantum_amplitude *= actual_decay

            if memory.quantum_amplitude < old_amplitude:
                decayed_count += 1

        self.stats['total_decays'] += decayed_count
        return decayed_count

    def consolidate(self, force: bool = False) -> int:
        """Consolidate similar memories"""
        consolidated_count = 0

        # Find consolidation pairs
        pairs_to_consolidate = [
            (id1, id2, sim) for id1, id2, sim in self.consolidation_pairs
            if sim > self.consolidation_threshold or force
        ]

        for id1, id2, similarity in pairs_to_consolidate:
            if id1 not in self.memories or id2 not in self.memories:
                continue

            mem1 = self.memories[id1]
            mem2 = self.memories[id2]

            # Merge into higher importance memory
            if mem1.importance.value >= mem2.importance.value:
                primary, secondary = mem1, mem2
            else:
                primary, secondary = mem2, mem1

            # Merge content
            primary.content = f"{primary.content}\n[Consolidated]: {secondary.content}"

            # Merge embeddings (weighted average)
            weight1 = primary.relevance_score
            weight2 = secondary.relevance_score
            primary.embedding = (
                (primary.embedding * weight1 + secondary.embedding * weight2) /
                (weight1 + weight2)
            )
            primary.embedding = primary.embedding / np.linalg.norm(primary.embedding)

            # Merge metadata
            primary.tags = list(set(primary.tags + secondary.tags))
            primary.access_count += secondary.access_count
            primary.metadata['consolidated_from'] = primary.metadata.get('consolidated_from', [])
            primary.metadata['consolidated_from'].append(secondary.id)

            # Boost quantum amplitude
            primary.quantum_amplitude = min(1.0, primary.quantum_amplitude + 0.1)

            # Remove secondary
            del self.memories[secondary.id]

            # Record consolidation
            self.consolidation_history.append({
                'timestamp': time.time(),
                'primary_id': primary.id,
                'secondary_id': secondary.id,
                'similarity': similarity
            })

            consolidated_count += 1

        # Clear processed pairs
        self.consolidation_pairs = [
            (id1, id2, sim) for id1, id2, sim in self.consolidation_pairs
            if sim <= self.consolidation_threshold
        ]

        self.stats['total_consolidations'] += consolidated_count
        return consolidated_count

    def boost_importance(self, mem_id: str,
                         boost: int = 1) -> bool:
        """Boost memory importance"""
        if mem_id not in self.memories:
            return False

        memory = self.memories[mem_id]
        new_value = min(5, memory.importance.value + boost)
        memory.importance = MemoryImportance(new_value)
        memory.quantum_amplitude = min(1.0, memory.quantum_amplitude + 0.1)

        return True

    def get_by_tags(self, tags: List[str],
                    require_all: bool = False) -> List[EnhancedMemory]:
        """Get memories by tags"""
        if require_all:
            mem_ids = set(self.memories.keys())
            for tag in tags:
                mem_ids &= set(self.tag_index.get(tag, []))
        else:
            mem_ids = set()
            for tag in tags:
                mem_ids.update(self.tag_index.get(tag, []))

        return [self.memories[mid] for mid in mem_ids if mid in self.memories]

    def _update_topological_neighbors(self, mem_id: str) -> None:
        """Find topological neighbors for a memory"""
        if mem_id not in self.memories:
            return

        memory = self.memories[mem_id]
        neighbors = []

        for other_id, other in self.memories.items():
            if other_id == mem_id:
                continue

            similarity = np.dot(memory.embedding, other.embedding)
            if similarity > 0.5:
                neighbors.append(other_id)

        memory.topological_neighbors = neighbors[:10]  # Max 10 neighbors

    def _check_consolidation(self, new_mem_id: str) -> None:
        """Check if new memory should be consolidated with existing"""
        if new_mem_id not in self.memories:
            return

        new_memory = self.memories[new_mem_id]

        for other_id, other in self.memories.items():
            if other_id == new_mem_id:
                continue

            similarity = np.dot(new_memory.embedding, other.embedding)
            if similarity > 0.7:  # High similarity threshold
                self.consolidation_pairs.append((new_mem_id, other_id, similarity))

    def _evict_least_relevant(self) -> None:
        """Evict least relevant memories when over capacity"""
        # Sort by relevance score
        sorted_memories = sorted(
            self.memories.values(),
            key=lambda m: m.relevance_score
        )

        # Evict bottom 10%
        evict_count = max(1, len(sorted_memories) // 10)

        for memory in sorted_memories[:evict_count]:
            del self.memories[memory.id]

            # Clean tag index
            for tag in memory.tags:
                if memory.id in self.tag_index[tag]:
                    self.tag_index[tag].remove(memory.id)

    def get_statistics(self) -> Dict[str, Any]:
        """Get memory system statistics"""
        if not self.memories:
            return {**self.stats, 'count': 0}

        importances = [m.importance.value for m in self.memories.values()]
        amplitudes = [m.quantum_amplitude for m in self.memories.values()]
        access_counts = [m.access_count for m in self.memories.values()]

        return {
            **self.stats,
            'count': len(self.memories),
            'avg_importance': np.mean(importances),
            'avg_amplitude': np.mean(amplitudes),
            'avg_access_count': np.mean(access_counts),
            'total_tags': len(self.tag_index),
            'pending_consolidations': len(self.consolidation_pairs)
        }


# Singleton instance
_memory_supercharger: Optional[MemorySupercharger] = None


def get_memory_supercharger() -> MemorySupercharger:
    """Get singleton memory supercharger"""
    global _memory_supercharger
    if _memory_supercharger is None:
        _memory_supercharger = MemorySupercharger()
    return _memory_supercharger


def reset_memory_supercharger() -> MemorySupercharger:
    """Reset memory supercharger"""
    global _memory_supercharger
    _memory_supercharger = MemorySupercharger()
    return _memory_supercharger
