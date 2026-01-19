# Tool: Quantum Reasoning

Use this tool for parallel hypothesis exploration using quantum-inspired superposition.

## Usage

```json
{
    "tool_name": "quantum_reasoning",
    "tool_args": {
        "action": "create|apply|collapse|status",
        "task": "problem to analyze",
        "hypotheses": ["hypothesis 1", "hypothesis 2", ...],
        "evidence": "evidence to update probabilities"
    }
}
```

## Actions

### `create`

Create a quantum superposition of hypotheses. If no hypotheses provided, generates 8 default reasoning approaches.

### `apply`

Apply evidence to update branch probabilities. Requires `evidence` parameter.

### `collapse`

Collapse superposition to single best hypothesis based on accumulated evidence.

### `status`

Get current quantum state: active branches, measurements, entanglement pairs.

## When to Use

- Complex problems with multiple possible approaches
- When you need to explore parallel solution paths
- To systematically evaluate competing hypotheses
- For uncertainty-aware reasoning
