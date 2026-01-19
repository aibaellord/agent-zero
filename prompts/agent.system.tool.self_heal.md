## Tool: self_heal

Self-healing system tool - automatic diagnostics and recovery.

### Usage

```json
{
    "tool_name": "self_heal",
    "tool_args": {
        "operation": "<operation>",
        ...
    }
}
```

### Operations

#### diagnose

Run self-diagnostic routines.

```json
{
  "tool_name": "self_heal",
  "tool_args": {
    "operation": "diagnose"
  }
}
```

#### health

Get overall health status.

```json
{
  "tool_name": "self_heal",
  "tool_args": {
    "operation": "health"
  }
}
```

#### stats

Get self-healing statistics.

```json
{
  "tool_name": "self_heal",
  "tool_args": {
    "operation": "stats"
  }
}
```

#### handle_error

Process an error for automatic recovery.

```json
{
  "tool_name": "self_heal",
  "tool_args": {
    "operation": "handle_error",
    "error_type": "ConnectionError",
    "error_message": "Connection refused to database",
    "context": "database_connection"
  }
}
```

### Capabilities

- Error pattern recognition
- Automatic retry with exponential backoff
- Circuit breaker pattern
- Self-diagnostic routines
- Health scoring
- Recovery strategy learning
