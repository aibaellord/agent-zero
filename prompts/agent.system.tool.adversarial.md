## Tool: adversarial

Adversarial reasoning tool with Red Team / Blue Team cognitive architecture.
Every conclusion is stress-tested by adversarial agents.

### Usage

```json
{
    "tool_name": "adversarial",
    "tool_args": {
        "operation": "<operation>",
        ...
    }
}
```

### Operations

#### stress_test

Stress test a conclusion with adversarial attacks and defenses.

```json
{
  "tool_name": "adversarial",
  "tool_args": {
    "operation": "stress_test",
    "conclusion": "The proposed solution will scale to 1M users",
    "reasoning": "Based on load testing results...",
    "assumptions": ["Database can handle the load", "Network is stable"]
  }
}
```

#### attack

Generate Red Team attacks on a conclusion.

```json
{
  "tool_name": "adversarial",
  "tool_args": {
    "operation": "attack",
    "conclusion": "This algorithm is O(n log n)"
  }
}
```

#### steelman

Create the strongest possible version of an argument.

```json
{
  "tool_name": "adversarial",
  "tool_args": {
    "operation": "steelman",
    "argument": "We should use microservices architecture"
  }
}
```

#### status

Get adversarial system statistics.

```json
{
  "tool_name": "adversarial",
  "tool_args": {
    "operation": "status"
  }
}
```

### Capabilities

- Logical fallacy detection
- Cognitive bias detection
- Devil's advocate generation
- Assumption challenging
- Edge case discovery
- Confidence calibration
