## Tool: prompt_evolution

Evolve and improve prompts automatically based on success metrics.

**Operations:**

- `register`: Register a new prompt variant
- `record`: Record usage result (success/failure)
- `evolve`: Create evolved variants from top performers
- `best`: Get best performing variant
- `ab_test`: Start A/B test between variants
- `prune`: Remove underperforming variants
- `export`: Export evolution state
- `status`: Get evolution statistics

**Arguments:**

- `operation`: The operation to perform
- `content`: Prompt content (for register)
- `name`: Optional prompt name
- `variant_id`: ID of variant (for record)
- `success`: Whether usage was successful (bool)
- `score`: Quality score (0-1)
- `top_k`: Number of top variants to use (for evolve)
- `variant_a`, `variant_b`: IDs for A/B testing

**Example:**

```json
{
  "thoughts": ["Registering a new prompt for evolution tracking"],
  "tool_name": "prompt_evolution",
  "tool_args": {
    "operation": "register",
    "content": "You are a helpful coding assistant...",
    "name": "coding_prompt_v1"
  }
}
```
