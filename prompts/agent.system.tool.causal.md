## Tool: causal

Temporal causal reasoning tool - cause-effect chains and counterfactual analysis.

### Usage

```json
{
    "tool_name": "causal",
    "tool_args": {
        "operation": "<operation>",
        ...
    }
}
```

### Operations

#### add_event

Add an event to the causal graph.

```json
{
  "tool_name": "causal",
  "tool_args": {
    "operation": "add_event",
    "event_id": "server_crash",
    "name": "Server Crashed",
    "value": 1
  }
}
```

#### add_cause

Add a causal relationship.

```json
{
  "tool_name": "causal",
  "tool_args": {
    "operation": "add_cause",
    "cause": "memory_leak",
    "effect": "server_crash",
    "strength": 0.9,
    "relation": "CAUSES"
  }
}
```

Relations: CAUSES, ENABLES, PREVENTS, CORRELATES, TRIGGERS, AMPLIFIES, DAMPENS

#### what_if

Counterfactual simulation - what would happen if...

```json
{
  "tool_name": "causal",
  "tool_args": {
    "operation": "what_if",
    "node": "memory_limit",
    "value": 8192,
    "steps": 10
  }
}
```

#### why

Root cause analysis - why did this happen?

```json
{
  "tool_name": "causal",
  "tool_args": {
    "operation": "why",
    "effect": "performance_degradation"
  }
}
```

#### chain

Get the causal chain between two events.

```json
{
  "tool_name": "causal",
  "tool_args": {
    "operation": "chain",
    "start": "code_change",
    "end": "user_complaint"
  }
}
```

#### status

Get engine statistics.

```json
{
  "tool_name": "causal",
  "tool_args": {
    "operation": "status"
  }
}
```

### Capabilities

- Causal graph construction
- Counterfactual simulation
- Root cause analysis
- Blame attribution
- What-if analysis
- Causal path discovery
