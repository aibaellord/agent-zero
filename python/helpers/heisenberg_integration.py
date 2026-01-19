"""
HEISENBERG INTEGRATION LAYER
============================
Central integration for the Heisenberg Singularity system.
Provides unified access and lifecycle management.
"""

from __future__ import annotations

import asyncio
from typing import TYPE_CHECKING, Any, Dict, Optional

if TYPE_CHECKING:
    from agent import Agent


class HeisenbergIntegration:
    """
    Master integration layer for all Heisenberg systems.
    """

    _instances: Dict[int, 'HeisenbergIntegration'] = {}

    def __init__(self, agent: 'Agent'):
        self.agent = agent
        self.initialized = False
        self._heisenberg = None
        self._swarm = None
        self._memory_supercharger = None

    @classmethod
    def get_instance(cls, agent: 'Agent') -> 'HeisenbergIntegration':
        """Get or create integration instance for agent"""
        agent_id = id(agent)
        if agent_id not in cls._instances:
            cls._instances[agent_id] = cls(agent)
        return cls._instances[agent_id]

    async def initialize(self) -> bool:
        """Initialize all Heisenberg systems"""
        if self.initialized:
            return True

        try:
            # Import core systems
            from python.helpers.heisenberg_core import get_heisenberg_core
            from python.helpers.memory_supercharger import \
                get_memory_supercharger
            from python.helpers.swarm_intelligence import \
                get_swarm_intelligence

            # Initialize
            self._heisenberg = get_heisenberg_core()
            self._swarm = get_swarm_intelligence()
            self._memory_supercharger = get_memory_supercharger()

            # Attach to agent
            self.agent._heisenberg = self._heisenberg
            self.agent._swarm = self._swarm
            self.agent._memory_supercharger = self._memory_supercharger

            # Create initial quantum branches for capability awareness
            self._heisenberg.quantum.create_superposition([
                "I can use quantum superposition for parallel hypothesis exploration",
                "I can apply chaos theory for creative variation",
                "I can use game theory for strategic analysis",
                "I can leverage swarm intelligence for distributed reasoning",
                "I can explore topology for memory structure",
                "I can self-modify to evolve better strategies",
                "I can optimize information for efficiency",
                "I have transcendent mathematical capabilities"
            ])

            self.initialized = True
            return True

        except Exception as e:
            print(f"Heisenberg initialization error: {e}")
            return False

    @property
    def heisenberg(self):
        """Get Heisenberg core"""
        return self._heisenberg

    @property
    def swarm(self):
        """Get swarm intelligence"""
        return self._swarm

    @property
    def memory(self):
        """Get memory supercharger"""
        return self._memory_supercharger

    def get_status(self) -> Dict[str, Any]:
        """Get complete system status"""
        if not self.initialized:
            return {'status': 'not_initialized'}

        return {
            'status': 'active',
            'heisenberg': self._heisenberg.get_system_state() if self._heisenberg else None,
            'swarm': self._swarm.get_swarm_state() if self._swarm else None,
            'memory': self._memory_supercharger.get_statistics() if self._memory_supercharger else None
        }

    async def think(self, task: str) -> Dict[str, Any]:
        """
        Perform integrated Heisenberg thinking.
        Combines all systems for maximum cognitive power.
        """
        if not self.initialized:
            await self.initialize()

        results = {
            'quantum': None,
            'chaos': None,
            'swarm': None,
            'topology': None
        }

        try:
            import hashlib

            import numpy as np

            # Create task embedding
            task_hash = int(hashlib.md5(task.encode()).hexdigest()[:8], 16)
            np.random.seed(task_hash % 10000)
            task_embedding = np.random.randn(128)
            task_embedding = task_embedding / np.linalg.norm(task_embedding)

            # 1. Create quantum superposition
            self._heisenberg.quantum.create_superposition([
                f"Analyze: {task[:50]}",
                f"Decompose: {task[:50]}",
                f"Abstract: {task[:50]}",
                f"Analogize: {task[:50]}"
            ])
            results['quantum'] = {
                'branches': len(self._heisenberg.quantum.branches)
            }

            # 2. Generate chaos variations
            variation = self._heisenberg.chaos.generate_creative_variation(task, 0.3)
            results['chaos'] = {
                'variation': variation
            }

            # 3. Query topological memory
            neighbors = self._heisenberg.topology.find_topological_neighbors(task_embedding, 3)
            results['topology'] = {
                'neighbors': len(neighbors)
            }

            # 4. Simple swarm fitness
            def fitness_fn(pos):
                return float(np.dot(pos / (np.linalg.norm(pos) + 0.001), task_embedding))

            # Quick swarm iteration
            swarm_result = await self._swarm.swarm_think(task_embedding, fitness_fn, 5)
            results['swarm'] = {
                'fitness': swarm_result.get('final_fitness', 0)
            }

        except Exception as e:
            results['error'] = str(e)

        return results

    def apply_decoherence(self, factor: float = 0.99) -> None:
        """Apply decoherence to all systems"""
        if not self.initialized:
            return

        try:
            # Quantum decoherence
            self._heisenberg.quantum.apply_decoherence(factor)

            # Swarm pheromone evaporation
            self._swarm.pheromone_field.evaporate(1 - factor)

            # Memory decay
            self._memory_supercharger.decay()

        except Exception:
            pass

    async def evolve(self) -> Dict[str, Any]:
        """Run one evolution cycle"""
        if not self.initialized:
            return {'status': 'not_initialized'}

        try:
            # Evolve prompts
            evolution = self._heisenberg.self_modifier.prompt_evolution

            if not evolution.population:
                evolution.initialize_population([
                    "Analyze step by step",
                    "Consider alternatives",
                    "Verify reasoning",
                    "Look for patterns"
                ])

            def fitness_fn(prompt):
                words = prompt.lower().split()
                return len(set(words)) / max(len(words), 1)

            evolution.evaluate_fitness(fitness_fn)
            new_pop = evolution.evolve()

            return {
                'status': 'evolved',
                'generation': evolution.generation,
                'population_size': len(new_pop),
                'best_fitness': evolution.best_ever.fitness if evolution.best_ever else 0
            }

        except Exception as e:
            return {'status': 'error', 'error': str(e)}


# Convenience function
def get_integration(agent: 'Agent') -> HeisenbergIntegration:
    """Get Heisenberg integration for agent"""
    return HeisenbergIntegration.get_instance(agent)
