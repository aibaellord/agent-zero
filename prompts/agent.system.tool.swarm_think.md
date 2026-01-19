# Tool: Swarm Think

Use this tool to leverage 64-agent swarm intelligence for distributed reasoning.

## Usage

```json
{
  "tool_name": "swarm_think",
  "tool_args": {
    "action": "think|status|patterns",
    "task": "task for swarm analysis",
    "iterations": 20
  }
}
```

## Actions

### `think`

Deploy swarm intelligence on task. 64 specialized agents (Explorers, Exploiters, Scouts, Analysts, Synthesizers, Critics, Coordinators, Specialists, Generalists, Devil's Advocates) collaborate via stigmergy.

### `status`

Get swarm status: agent count, iteration, PSO best fitness, role distribution.

### `patterns`

List emergent patterns discovered by the swarm.

## When to Use

- Complex problems benefiting from diverse perspectives
- Parallel exploration of solution space
- When you need emergent insights
- For optimization problems
