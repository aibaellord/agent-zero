# Tool: Self Modify

Use this tool for self-modification and evolution of behavior.

## Usage

```json
{
    "tool_name": "self_modify",
    "tool_args": {
        "action": "status|mutate|evolve|adapt",
        "behavior": "behavior to mutate",
        "metrics": {"accuracy": 0.8, ...}
    }
}
```

## Actions

### `status`

Get self-modification status: meta-parameters, evolution generation, best evolved prompts.

### `mutate`

Generate a mutation of given behavior string.

### `evolve`

Run genetic evolution on prompt population. Selects, crosses, and mutates.

### `adapt`

Adapt meta-parameters based on performance metrics.

## When to Use

- Improving reasoning strategies
- Adapting to new problem domains
- Experimenting with alternative approaches
- Meta-learning from experience
