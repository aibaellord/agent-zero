## Tool: meta_cognitive

Meta-cognitive monitoring tool - thinking about thinking.
Real-time cognitive quality monitoring and improvement.

### Usage

```json
{
    "tool_name": "meta_cognitive",
    "tool_args": {
        "operation": "<operation>",
        ...
    }
}
```

### Operations

#### add_step

Add a reasoning step for tracking.

```json
{
  "tool_name": "meta_cognitive",
  "tool_args": {
    "operation": "add_step",
    "content": "The user needs X because of Y",
    "step_type": "inference",
    "confidence": 0.8,
    "dependencies": [0, 1]
  }
}
```

Step types: observation, inference, assumption, conclusion

#### focus

Track attention focus on a topic.

```json
{
  "tool_name": "meta_cognitive",
  "tool_args": {
    "operation": "focus",
    "topic": "database optimization",
    "original_topic": "performance issues"
  }
}
```

#### assess

Get quality assessment of current reasoning.

```json
{
  "tool_name": "meta_cognitive",
  "tool_args": {
    "operation": "assess"
  }
}
```

#### status

Get current cognitive state.

```json
{
  "tool_name": "meta_cognitive",
  "tool_args": {
    "operation": "status"
  }
}
```

#### reset

Reset the reasoning chain.

```json
{
  "tool_name": "meta_cognitive",
  "tool_args": {
    "operation": "reset"
  }
}
```

### Capabilities

- Reasoning chain validation
- Circular reasoning detection
- Cognitive load estimation
- Attention tracking
- Confidence calibration
- Self-correction triggering
