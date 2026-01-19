"""
SWARM SUPERINTELLIGENCE ENGINE
===============================
64-agent distributed reasoning with stigmergy coordination.
Implements emergent collective intelligence through:
- Ant Colony Optimization (ACO)
- Particle Swarm Optimization (PSO)
- Boid-like flocking for idea convergence
- Stigmergic communication via shared memory
- Hierarchical delegation with role specialization
"""

from __future__ import annotations

import asyncio
import hashlib
import json
import time
from abc import ABC, abstractmethod
from collections import defaultdict
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Callable, Dict, List, Optional, Set, Tuple

import numpy as np

# =============================================================================
# AGENT ROLE DEFINITIONS
# =============================================================================

class AgentRole(Enum):
    """Specialized roles for swarm agents"""
    EXPLORER = "explorer"           # Discovers new solution paths
    EXPLOITER = "exploiter"         # Deepens promising paths
    SCOUT = "scout"                 # Fast superficial search
    ANALYST = "analyst"             # Deep analysis of findings
    SYNTHESIZER = "synthesizer"     # Combines findings
    CRITIC = "critic"               # Validates and challenges
    COORDINATOR = "coordinator"     # Manages sub-swarms
    SPECIALIST = "specialist"       # Domain expert
    GENERALIST = "generalist"       # Cross-domain reasoning
    DEVIL_ADVOCATE = "devil_advocate"  # Contrarian perspectives


class AgentState(Enum):
    """States for swarm agents"""
    IDLE = "idle"
    EXPLORING = "exploring"
    EXPLOITING = "exploiting"
    COMMUNICATING = "communicating"
    WAITING = "waiting"
    COMPLETED = "completed"
    FAILED = "failed"


# =============================================================================
# SWARM AGENT DEFINITION
# =============================================================================

@dataclass
class SwarmAgent:
    """A single agent in the swarm"""
    id: str
    role: AgentRole
    position: np.ndarray  # Position in solution space
    velocity: np.ndarray  # Movement direction
    personal_best: np.ndarray = None
    personal_best_fitness: float = float('-inf')
    state: AgentState = AgentState.IDLE
    pheromone_trail: List[Tuple[np.ndarray, float]] = field(default_factory=list)
    discoveries: List[Dict] = field(default_factory=list)
    messages_sent: int = 0
    messages_received: int = 0
    energy: float = 1.0
    specialization_score: Dict[str, float] = field(default_factory=dict)

    def __post_init__(self):
        if self.personal_best is None:
            self.personal_best = self.position.copy()

    @property
    def fitness(self) -> float:
        return self.personal_best_fitness

    def deposit_pheromone(self, position: np.ndarray, strength: float) -> None:
        """Deposit pheromone at a position"""
        self.pheromone_trail.append((position.copy(), strength))

    def consume_energy(self, amount: float = 0.01) -> bool:
        """Consume energy, return False if exhausted"""
        self.energy -= amount
        return self.energy > 0


@dataclass
class SwarmMessage:
    """Message for stigmergic communication"""
    sender_id: str
    message_type: str
    content: Dict[str, Any]
    position: np.ndarray
    timestamp: float = field(default_factory=time.time)
    ttl: int = 100  # Time to live in iterations
    strength: float = 1.0


# =============================================================================
# PHEROMONE FIELD
# =============================================================================

class PheromoneField:
    """
    Shared pheromone field for stigmergic communication.
    Agents leave chemical-like trails that guide other agents.
    """

    def __init__(self, dimensions: int = 128,
                 evaporation_rate: float = 0.05,
                 diffusion_rate: float = 0.02):
        self.dimensions = dimensions
        self.evaporation_rate = evaporation_rate
        self.diffusion_rate = diffusion_rate

        # Pheromone deposits: list of (position, strength, type)
        self.deposits: List[Dict] = []

        # Message board for stigmergic communication
        self.message_board: List[SwarmMessage] = []

    def deposit(self, position: np.ndarray, strength: float,
                pheromone_type: str = "default") -> None:
        """Deposit pheromone at position"""
        self.deposits.append({
            'position': position.copy(),
            'strength': strength,
            'type': pheromone_type,
            'timestamp': time.time()
        })

    def sense(self, position: np.ndarray, radius: float = 0.5,
              pheromone_type: Optional[str] = None) -> List[Dict]:
        """Sense pheromone near a position"""
        sensed = []

        for deposit in self.deposits:
            if pheromone_type and deposit['type'] != pheromone_type:
                continue

            distance = np.linalg.norm(position - deposit['position'])
            if distance < radius:
                # Strength decays with distance
                effective_strength = deposit['strength'] * (1 - distance / radius)
                sensed.append({
                    'position': deposit['position'],
                    'strength': effective_strength,
                    'type': deposit['type'],
                    'direction': (deposit['position'] - position) / (distance + 0.001)
                })

        return sensed

    def get_gradient(self, position: np.ndarray,
                     pheromone_type: str = "default") -> np.ndarray:
        """Get pheromone gradient at position"""
        gradient = np.zeros(self.dimensions)

        for deposit in self.deposits:
            if deposit['type'] != pheromone_type:
                continue

            direction = deposit['position'] - position
            distance = np.linalg.norm(direction) + 0.001

            # Gradient contribution
            contribution = deposit['strength'] / (distance ** 2)
            gradient += contribution * (direction / distance)

        # Normalize
        norm = np.linalg.norm(gradient)
        if norm > 0:
            gradient = gradient / norm

        return gradient

    def post_message(self, message: SwarmMessage) -> None:
        """Post a message to the stigmergic message board"""
        self.message_board.append(message)

    def read_messages(self, position: np.ndarray,
                      radius: float = 1.0,
                      message_type: Optional[str] = None) -> List[SwarmMessage]:
        """Read messages near a position"""
        messages = []

        for msg in self.message_board:
            if message_type and msg.message_type != message_type:
                continue

            distance = np.linalg.norm(position - msg.position)
            if distance < radius:
                messages.append(msg)

        return messages

    def evaporate(self) -> None:
        """Apply evaporation to all pheromones"""
        for deposit in self.deposits:
            deposit['strength'] *= (1 - self.evaporation_rate)

        # Remove weak deposits
        self.deposits = [d for d in self.deposits if d['strength'] > 0.01]

        # Age messages
        for msg in self.message_board:
            msg.ttl -= 1
            msg.strength *= 0.95

        # Remove expired messages
        self.message_board = [m for m in self.message_board if m.ttl > 0]

    def diffuse(self) -> None:
        """Apply diffusion to spread pheromones"""
        # Simplified diffusion - spread strength to nearby space
        for deposit in self.deposits:
            noise = np.random.randn(self.dimensions) * self.diffusion_rate
            deposit['position'] += noise
            deposit['strength'] *= 0.99  # Small decay from diffusion


# =============================================================================
# SWARM ALGORITHMS
# =============================================================================

class ParticleSwarmOptimizer:
    """
    Particle Swarm Optimization for collective intelligence.
    """

    def __init__(self, n_particles: int = 64, dimensions: int = 128):
        self.n_particles = n_particles
        self.dimensions = dimensions

        # PSO parameters
        self.w = 0.7      # Inertia weight
        self.c1 = 1.5     # Cognitive (personal best) weight
        self.c2 = 1.5     # Social (global best) weight

        # Swarm state
        self.particles: List[SwarmAgent] = []
        self.global_best: Optional[np.ndarray] = None
        self.global_best_fitness: float = float('-inf')

        self._initialize_swarm()

    def _initialize_swarm(self) -> None:
        """Initialize particle swarm"""
        roles = list(AgentRole)

        for i in range(self.n_particles):
            # Random initial position and velocity
            position = np.random.randn(self.dimensions)
            velocity = np.random.randn(self.dimensions) * 0.1

            # Assign role based on index for diversity
            role = roles[i % len(roles)]

            agent = SwarmAgent(
                id=f"particle_{i}",
                role=role,
                position=position,
                velocity=velocity
            )
            self.particles.append(agent)

    def step(self, fitness_fn: Callable[[np.ndarray], float]) -> None:
        """Perform one PSO iteration"""
        for particle in self.particles:
            # Evaluate fitness
            fitness = fitness_fn(particle.position)

            # Update personal best
            if fitness > particle.personal_best_fitness:
                particle.personal_best = particle.position.copy()
                particle.personal_best_fitness = fitness

            # Update global best
            if fitness > self.global_best_fitness:
                self.global_best = particle.position.copy()
                self.global_best_fitness = fitness

        # Update velocities and positions
        for particle in self.particles:
            r1, r2 = np.random.random(2)

            cognitive = self.c1 * r1 * (particle.personal_best - particle.position)
            social = self.c2 * r2 * (self.global_best - particle.position)

            particle.velocity = (self.w * particle.velocity +
                                cognitive + social)

            # Velocity clamping
            max_velocity = 1.0
            velocity_magnitude = np.linalg.norm(particle.velocity)
            if velocity_magnitude > max_velocity:
                particle.velocity = particle.velocity / velocity_magnitude * max_velocity

            particle.position += particle.velocity

    def get_consensus(self) -> np.ndarray:
        """Get swarm consensus (weighted average of positions)"""
        weights = np.array([p.personal_best_fitness for p in self.particles])
        weights = np.maximum(weights, 0)  # Non-negative
        weights = weights / (weights.sum() + 0.001)

        consensus = np.zeros(self.dimensions)
        for w, p in zip(weights, self.particles):
            consensus += w * p.personal_best

        return consensus


class AntColonyOptimizer:
    """
    Ant Colony Optimization for path finding in solution space.
    """

    def __init__(self, n_ants: int = 32, n_nodes: int = 50):
        self.n_ants = n_ants
        self.n_nodes = n_nodes

        # ACO parameters
        self.alpha = 1.0    # Pheromone importance
        self.beta = 2.0     # Heuristic importance
        self.rho = 0.1      # Evaporation rate
        self.Q = 100.0      # Pheromone deposit factor

        # Pheromone matrix
        self.pheromones = np.ones((n_nodes, n_nodes))

        # Heuristic information (inverse distance)
        self.heuristic = np.random.rand(n_nodes, n_nodes) + 0.1

        # Solution paths
        self.best_path: List[int] = []
        self.best_path_length: float = float('inf')

    def step(self, cost_fn: Callable[[List[int]], float]) -> List[int]:
        """Perform one ACO iteration"""
        all_paths = []
        all_costs = []

        for _ in range(self.n_ants):
            path = self._construct_path()
            cost = cost_fn(path)

            all_paths.append(path)
            all_costs.append(cost)

            if cost < self.best_path_length:
                self.best_path = path.copy()
                self.best_path_length = cost

        # Evaporate pheromones
        self.pheromones *= (1 - self.rho)

        # Deposit pheromones
        for path, cost in zip(all_paths, all_costs):
            deposit = self.Q / (cost + 0.001)
            for i in range(len(path) - 1):
                self.pheromones[path[i], path[i+1]] += deposit

        return self.best_path

    def _construct_path(self) -> List[int]:
        """Construct a path using probabilistic selection"""
        visited = set()
        current = np.random.randint(self.n_nodes)
        path = [current]
        visited.add(current)

        while len(visited) < self.n_nodes:
            probabilities = self._calculate_probabilities(current, visited)

            if probabilities.sum() == 0:
                # No valid moves - go to random unvisited
                unvisited = list(set(range(self.n_nodes)) - visited)
                if not unvisited:
                    break
                next_node = np.random.choice(unvisited)
            else:
                probabilities /= probabilities.sum()
                next_node = np.random.choice(self.n_nodes, p=probabilities)

            path.append(next_node)
            visited.add(next_node)
            current = next_node

        return path

    def _calculate_probabilities(self, current: int,
                                  visited: Set[int]) -> np.ndarray:
        """Calculate selection probabilities for next node"""
        probabilities = np.zeros(self.n_nodes)

        for j in range(self.n_nodes):
            if j not in visited:
                pheromone = self.pheromones[current, j] ** self.alpha
                heuristic = self.heuristic[current, j] ** self.beta
                probabilities[j] = pheromone * heuristic

        return probabilities


class BoidFlocking:
    """
    Boid-like flocking for idea convergence.
    Agents flock toward promising solution regions.
    """

    def __init__(self, n_boids: int = 64, dimensions: int = 128):
        self.n_boids = n_boids
        self.dimensions = dimensions

        # Flocking parameters
        self.separation_weight = 1.5
        self.alignment_weight = 1.0
        self.cohesion_weight = 1.0
        self.goal_weight = 2.0

        # Perception radius
        self.perception_radius = 2.0

        # Boids
        self.positions = np.random.randn(n_boids, dimensions)
        self.velocities = np.random.randn(n_boids, dimensions) * 0.1

        # Goal (attractor)
        self.goal: Optional[np.ndarray] = None

    def set_goal(self, goal: np.ndarray) -> None:
        """Set the goal position for the flock"""
        self.goal = goal

    def step(self) -> None:
        """Perform one flocking step"""
        accelerations = np.zeros_like(self.velocities)

        for i in range(self.n_boids):
            # Find neighbors
            distances = np.linalg.norm(self.positions - self.positions[i], axis=1)
            neighbors = np.where((distances > 0) &
                                 (distances < self.perception_radius))[0]

            if len(neighbors) > 0:
                # Separation: avoid crowding
                separation = np.zeros(self.dimensions)
                for j in neighbors:
                    diff = self.positions[i] - self.positions[j]
                    dist = np.linalg.norm(diff) + 0.001
                    separation += diff / dist
                separation /= len(neighbors)

                # Alignment: match velocity
                alignment = self.velocities[neighbors].mean(axis=0)

                # Cohesion: move toward center
                center = self.positions[neighbors].mean(axis=0)
                cohesion = center - self.positions[i]
            else:
                separation = np.zeros(self.dimensions)
                alignment = np.zeros(self.dimensions)
                cohesion = np.zeros(self.dimensions)

            # Goal seeking
            if self.goal is not None:
                goal_direction = self.goal - self.positions[i]
                goal_direction = goal_direction / (np.linalg.norm(goal_direction) + 0.001)
            else:
                goal_direction = np.zeros(self.dimensions)

            # Combine forces
            acceleration = (
                self.separation_weight * separation +
                self.alignment_weight * alignment +
                self.cohesion_weight * cohesion +
                self.goal_weight * goal_direction
            )

            accelerations[i] = acceleration

        # Update velocities and positions
        self.velocities += accelerations * 0.1

        # Velocity limiting
        speeds = np.linalg.norm(self.velocities, axis=1, keepdims=True)
        max_speed = 1.0
        self.velocities = np.where(speeds > max_speed,
                                    self.velocities / speeds * max_speed,
                                    self.velocities)

        self.positions += self.velocities

    def get_flock_center(self) -> np.ndarray:
        """Get center of mass of the flock"""
        return self.positions.mean(axis=0)

    def get_flock_spread(self) -> float:
        """Get measure of flock spread (convergence)"""
        center = self.get_flock_center()
        distances = np.linalg.norm(self.positions - center, axis=1)
        return distances.mean()


# =============================================================================
# SWARM SUPERINTELLIGENCE ENGINE
# =============================================================================

class SwarmSuperintelligence:
    """
    Complete Swarm Superintelligence Engine.
    Orchestrates 64 specialized agents with stigmergic coordination.
    """

    MAX_AGENTS = 64

    def __init__(self, dimensions: int = 128):
        self.dimensions = dimensions

        # Core components
        self.pheromone_field = PheromoneField(dimensions=dimensions)
        self.pso = ParticleSwarmOptimizer(n_particles=32, dimensions=dimensions)
        self.aco = AntColonyOptimizer(n_ants=16, n_nodes=50)
        self.boids = BoidFlocking(n_boids=16, dimensions=dimensions)

        # Agent registry
        self.agents: Dict[str, SwarmAgent] = {}
        self.role_distribution: Dict[AgentRole, List[str]] = defaultdict(list)

        # Collective knowledge
        self.collective_memory: List[Dict] = []
        self.emergent_patterns: List[Dict] = []
        self.consensus_solutions: List[np.ndarray] = []

        # Performance tracking
        self.iteration = 0
        self.convergence_history: List[float] = []

        self._initialize_agents()

    def _initialize_agents(self) -> None:
        """Initialize the swarm with specialized agents"""
        roles = list(AgentRole)
        agents_per_role = self.MAX_AGENTS // len(roles)

        agent_count = 0
        for role in roles:
            for i in range(agents_per_role):
                if agent_count >= self.MAX_AGENTS:
                    break

                position = np.random.randn(self.dimensions)
                velocity = np.random.randn(self.dimensions) * 0.1

                agent = SwarmAgent(
                    id=f"{role.value}_{i}",
                    role=role,
                    position=position,
                    velocity=velocity
                )

                # Set role-specific specialization
                agent.specialization_score = {
                    'exploration': 0.8 if role in [AgentRole.EXPLORER, AgentRole.SCOUT] else 0.3,
                    'exploitation': 0.8 if role in [AgentRole.EXPLOITER, AgentRole.ANALYST] else 0.3,
                    'synthesis': 0.8 if role == AgentRole.SYNTHESIZER else 0.3,
                    'criticism': 0.8 if role in [AgentRole.CRITIC, AgentRole.DEVIL_ADVOCATE] else 0.3
                }

                self.agents[agent.id] = agent
                self.role_distribution[role].append(agent.id)
                agent_count += 1

        # Ensure we have all 64
        while agent_count < self.MAX_AGENTS:
            role = roles[agent_count % len(roles)]
            position = np.random.randn(self.dimensions)
            velocity = np.random.randn(self.dimensions) * 0.1

            agent = SwarmAgent(
                id=f"extra_{agent_count}",
                role=role,
                position=position,
                velocity=velocity
            )

            self.agents[agent.id] = agent
            self.role_distribution[role].append(agent.id)
            agent_count += 1

    async def swarm_think(self, task_embedding: np.ndarray,
                          fitness_fn: Callable[[np.ndarray], float],
                          n_iterations: int = 50) -> Dict[str, Any]:
        """
        Collective thinking through swarm intelligence.
        Returns consensus solution and emergent insights.
        """
        result = {
            'iterations': n_iterations,
            'solutions': [],
            'emergent_patterns': [],
            'convergence': [],
            'role_contributions': {}
        }

        # Set goal for boids
        self.boids.set_goal(task_embedding)

        for iteration in range(n_iterations):
            self.iteration = iteration

            # Phase 1: PSO update
            self.pso.step(fitness_fn)

            # Phase 2: ACO path finding
            def path_cost(path):
                return len(path) / 10  # Simple cost
            self.aco.step(path_cost)

            # Phase 3: Boid flocking
            self.boids.step()

            # Phase 4: Pheromone updates
            await self._update_pheromones(fitness_fn)

            # Phase 5: Agent communication
            await self._agent_communication()

            # Phase 6: Emergent pattern detection
            patterns = self._detect_emergent_patterns()
            if patterns:
                result['emergent_patterns'].extend(patterns)

            # Track convergence
            spread = self.boids.get_flock_spread()
            self.convergence_history.append(spread)
            result['convergence'].append(spread)

            # Collect solutions
            if iteration % 10 == 0:
                consensus = self._compute_consensus()
                result['solutions'].append({
                    'iteration': iteration,
                    'consensus': consensus.tolist(),
                    'fitness': fitness_fn(consensus)
                })

        # Final consensus
        final_consensus = self._compute_consensus()
        result['final_consensus'] = final_consensus.tolist()
        result['final_fitness'] = fitness_fn(final_consensus)

        # Role contributions
        result['role_contributions'] = self._analyze_role_contributions()

        return result

    async def _update_pheromones(self,
                                  fitness_fn: Callable[[np.ndarray], float]) -> None:
        """Update pheromone field based on agent discoveries"""
        for agent in self.agents.values():
            if agent.state == AgentState.COMPLETED:
                continue

            # Evaluate current position
            fitness = fitness_fn(agent.position)

            # Deposit pheromone proportional to fitness
            if fitness > 0:
                self.pheromone_field.deposit(
                    agent.position,
                    strength=fitness,
                    pheromone_type=agent.role.value
                )

            # Update personal best
            if fitness > agent.personal_best_fitness:
                agent.personal_best = agent.position.copy()
                agent.personal_best_fitness = fitness

                agent.discoveries.append({
                    'iteration': self.iteration,
                    'position': agent.position.tolist(),
                    'fitness': fitness
                })

        # Evaporate
        self.pheromone_field.evaporate()

    async def _agent_communication(self) -> None:
        """Stigmergic communication between agents"""
        for agent in self.agents.values():
            # Sense pheromones
            sensed = self.pheromone_field.sense(
                agent.position,
                radius=1.0,
                pheromone_type=None  # Sense all types
            )

            if sensed:
                # Move toward strongest pheromone gradient
                gradient = self.pheromone_field.get_gradient(
                    agent.position,
                    pheromone_type=agent.role.value
                )

                # Role-specific behavior
                if agent.role in [AgentRole.EXPLORER, AgentRole.SCOUT]:
                    # Explorers avoid strong pheromone trails
                    agent.velocity -= gradient * 0.1
                    agent.velocity += np.random.randn(self.dimensions) * 0.2
                elif agent.role in [AgentRole.EXPLOITER, AgentRole.ANALYST]:
                    # Exploiters follow pheromone trails
                    agent.velocity += gradient * 0.3
                elif agent.role == AgentRole.DEVIL_ADVOCATE:
                    # Contrarians go opposite direction
                    agent.velocity -= gradient * 0.5
                else:
                    # Others have moderate following
                    agent.velocity += gradient * 0.1

                # Velocity limiting
                speed = np.linalg.norm(agent.velocity)
                if speed > 1.0:
                    agent.velocity = agent.velocity / speed

                agent.position += agent.velocity

            # Read and post messages
            messages = self.pheromone_field.read_messages(agent.position)

            for msg in messages:
                agent.messages_received += 1

                # React to messages based on type
                if msg.message_type == 'discovery':
                    if agent.role == AgentRole.EXPLOITER:
                        # Move toward discovery
                        direction = msg.position - agent.position
                        agent.velocity += direction * 0.1 * msg.strength

            # Post discoveries
            if agent.discoveries and self.iteration % 5 == 0:
                latest = agent.discoveries[-1]
                message = SwarmMessage(
                    sender_id=agent.id,
                    message_type='discovery',
                    content={'fitness': latest['fitness']},
                    position=agent.position.copy(),
                    strength=latest['fitness']
                )
                self.pheromone_field.post_message(message)
                agent.messages_sent += 1

    def _detect_emergent_patterns(self) -> List[Dict]:
        """Detect emergent patterns in swarm behavior"""
        patterns = []

        # Cluster detection
        positions = np.array([a.position for a in self.agents.values()])

        # Simple clustering: find dense regions
        for i, pos in enumerate(positions):
            distances = np.linalg.norm(positions - pos, axis=1)
            nearby = np.sum(distances < 0.5)

            if nearby > 5:  # Cluster detected
                cluster_center = positions[distances < 0.5].mean(axis=0)
                avg_fitness = np.mean([
                    list(self.agents.values())[j].personal_best_fitness
                    for j in np.where(distances < 0.5)[0]
                ])

                patterns.append({
                    'type': 'cluster',
                    'iteration': self.iteration,
                    'center': cluster_center.tolist(),
                    'size': int(nearby),
                    'avg_fitness': float(avg_fitness)
                })
                break  # One cluster per iteration

        # Convergence pattern
        if len(self.convergence_history) > 10:
            recent = self.convergence_history[-10:]
            if np.std(recent) < 0.1:
                patterns.append({
                    'type': 'convergence',
                    'iteration': self.iteration,
                    'spread': float(recent[-1])
                })

        self.emergent_patterns.extend(patterns)
        return patterns

    def _compute_consensus(self) -> np.ndarray:
        """Compute swarm consensus solution"""
        # Weighted average by fitness
        total_weight = 0
        consensus = np.zeros(self.dimensions)

        for agent in self.agents.values():
            weight = max(0, agent.personal_best_fitness)
            consensus += weight * agent.personal_best
            total_weight += weight

        if total_weight > 0:
            consensus /= total_weight
        else:
            # Fall back to PSO global best
            consensus = self.pso.global_best if self.pso.global_best is not None else np.zeros(self.dimensions)

        self.consensus_solutions.append(consensus)
        return consensus

    def _analyze_role_contributions(self) -> Dict[str, Dict]:
        """Analyze contribution of each role"""
        contributions = {}

        for role in AgentRole:
            agent_ids = self.role_distribution[role]
            agents = [self.agents[aid] for aid in agent_ids]

            if agents:
                contributions[role.value] = {
                    'count': len(agents),
                    'avg_fitness': np.mean([a.personal_best_fitness for a in agents]),
                    'total_discoveries': sum(len(a.discoveries) for a in agents),
                    'messages_sent': sum(a.messages_sent for a in agents),
                    'messages_received': sum(a.messages_received for a in agents),
                    'avg_energy': np.mean([a.energy for a in agents])
                }

        return contributions

    def get_swarm_state(self) -> Dict[str, Any]:
        """Get complete swarm state"""
        return {
            'total_agents': len(self.agents),
            'iteration': self.iteration,
            'pso_global_best_fitness': self.pso.global_best_fitness,
            'aco_best_path_length': self.aco.best_path_length,
            'boid_spread': self.boids.get_flock_spread(),
            'pheromone_deposits': len(self.pheromone_field.deposits),
            'messages_on_board': len(self.pheromone_field.message_board),
            'emergent_patterns': len(self.emergent_patterns),
            'consensus_solutions': len(self.consensus_solutions),
            'role_distribution': {r.value: len(ids) for r, ids in self.role_distribution.items()}
        }

    def get_best_agents(self, n: int = 5) -> List[SwarmAgent]:
        """Get top performing agents"""
        sorted_agents = sorted(
            self.agents.values(),
            key=lambda a: a.personal_best_fitness,
            reverse=True
        )
        return sorted_agents[:n]


# =============================================================================
# FACTORY FUNCTIONS
# =============================================================================

_swarm_instance: Optional[SwarmSuperintelligence] = None


def get_swarm_intelligence() -> SwarmSuperintelligence:
    """Get singleton swarm intelligence instance"""
    global _swarm_instance
    if _swarm_instance is None:
        _swarm_instance = SwarmSuperintelligence()
    return _swarm_instance


def reset_swarm_intelligence() -> SwarmSuperintelligence:
    """Reset and return fresh swarm intelligence"""
    global _swarm_instance
    _swarm_instance = SwarmSuperintelligence()
    return _swarm_instance
