## Tool: infinite_loop_breaker

Detects and breaks infinite loops in agent reasoning.

### Usage

When you suspect you're stuck in a loop or repeating the same actions:

```json
{
  "tool_name": "infinite_loop_breaker",
  "tool_args": {
    "action": "<action>"
  }
}
```

### Actions

- **check**: Check if currently in a loop (repeated actions or messages)
- **break**: Force break out of detected loop and reset
- **reset**: Clear all tracking history
- **status**: Get current loop tracking statistics

### When to Use

- When you notice you're repeating the same reasoning
- When tool calls keep failing the same way
- When you've tried the same approach multiple times
- When progress seems stalled

### Example

If you've attempted the same fix 3+ times without success:

```json
{
  "tool_name": "infinite_loop_breaker",
  "tool_args": {
    "action": "check"
  }
}
```

If loop detected, break free:

```json
{
  "tool_name": "infinite_loop_breaker",
  "tool_args": {
    "action": "break"
  }
}
```
