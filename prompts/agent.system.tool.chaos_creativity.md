# Tool: Chaos Creativity

Use this tool to generate creative variations using chaos-theoretic dynamics.

## Usage

```json
{
  "tool_name": "chaos_creativity",
  "tool_args": {
    "action": "generate|evolve|analyze",
    "concept": "concept to transform",
    "strength": 0.5,
    "iterations": 5
  }
}
```

## Actions

### `generate`

Generate a single creative variation of the concept. `strength` controls mutation intensity (0-1).

### `evolve`

Evolve concept through strange attractor, generating multiple diverse ideas.

### `analyze`

Analyze chaos system state: Lorenz attractor position, fractal dimension, Lyapunov exponent.

## When to Use

- When stuck on a problem and need fresh perspectives
- For brainstorming and ideation
- To escape local optima in solution space
- When you need controlled unpredictability
