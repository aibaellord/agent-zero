"""
HEISENBERG SINGULARITY INITIALIZATION
======================================
First extension in the chain - initializes all Heisenberg core systems.
This is the genesis point for quantum-category-topology-chaos-game-info-self-mod architecture.
"""

import numpy as np

from python.helpers.extension import Extension
from python.helpers.heisenberg_core import get_heisenberg_core
from python.helpers.swarm_intelligence import get_swarm_intelligence


class HeisenbergInit(Extension):
    """Initialize the Heisenberg Singularity Core on agent creation"""

    async def execute(self, **kwargs):
        # Get core engines
        heisenberg = get_heisenberg_core()
        swarm = get_swarm_intelligence()

        # Store references in agent data for later use
        self.agent.set_data("heisenberg_core", heisenberg)
        self.agent.set_data("swarm_intelligence", swarm)

        # Initialize agent-specific quantum state
        agent_id = f"agent_{self.agent.number}"

        # Create initial superposition of agent capabilities
        capabilities = [
            f"Problem decomposition for {agent_id}",
            f"Pattern recognition for {agent_id}",
            f"Analogical reasoning for {agent_id}",
            f"First principles analysis for {agent_id}",
            f"Creative synthesis for {agent_id}",
            f"Strategic optimization for {agent_id}",
            f"Memory integration for {agent_id}",
            f"Tool orchestration for {agent_id}"
        ]

        branch_ids = heisenberg.quantum.create_superposition(capabilities)
        self.agent.set_data("quantum_capability_branches", branch_ids)

        # Initialize topological memory for this agent
        if hasattr(self.agent, 'context') and self.agent.context:
            # Create embedding from context id
            seed = hash(str(self.agent.context.id)) % 10000
            np.random.seed(seed)
            initial_embedding = np.random.randn(128)

            heisenberg.topology.add_memory(
                initial_embedding,
                f"Agent {self.agent.number} initialization"
            )

        # Set meta-parameters based on agent hierarchy
        meta_params = heisenberg.self_modifier.meta_parameters.copy()

        # Subordinate agents should explore more
        if self.agent.number > 0:
            meta_params['exploration_rate'] = min(0.6, 0.3 + self.agent.number * 0.1)
            meta_params['exploitation_rate'] = 1 - meta_params['exploration_rate']

        self.agent.set_data("heisenberg_meta_params", meta_params)

        # Initialize chaos attractor state
        from python.helpers.heisenberg_core import ChaosCreativityEngine
        agent_chaos = ChaosCreativityEngine()

        # Set unique initial conditions based on agent
        initial_chaos = np.array([
            1.0 + self.agent.number * 0.1,
            1.0 + self.agent.number * 0.05,
            1.0 + self.agent.number * 0.15
        ])
        agent_chaos.lorenz.reset(initial_chaos)

        self.agent.set_data("chaos_engine", agent_chaos)

        # Log initialization
        self.agent.set_data("heisenberg_initialized", True)
        self.agent.set_data("heisenberg_init_timestamp", np.datetime64('now'))
