## Tool: performance

Performance optimization tool - maximize efficiency.

### Usage

```json
{
    "tool_name": "performance",
    "tool_args": {
        "operation": "<operation>",
        ...
    }
}
```

### Operations

#### optimize_prompt

Optimize a prompt for token efficiency.

```json
{
  "tool_name": "performance",
  "tool_args": {
    "operation": "optimize_prompt",
    "prompt": "Your long prompt text here..."
  }
}
```

#### truncate

Truncate context to fit token limit.

```json
{
  "tool_name": "performance",
  "tool_args": {
    "operation": "truncate",
    "context": "Long context string...",
    "max_tokens": 4000
  }
}
```

#### cache

Cache or retrieve cached values.

```json
{
  "tool_name": "performance",
  "tool_args": {
    "operation": "cache",
    "key": "expensive_computation_result",
    "value": "result_to_cache"
  }
}
```

Omit "value" to retrieve from cache.

#### report

Get performance report.

```json
{
  "tool_name": "performance",
  "tool_args": {
    "operation": "report"
  }
}
```

#### clear_cache

Clear all caches.

```json
{
  "tool_name": "performance",
  "tool_args": {
    "operation": "clear_cache"
  }
}
```

#### status

Get quick performance status.

```json
{
  "tool_name": "performance",
  "tool_args": {
    "operation": "status"
  }
}
```

### Capabilities

- Intelligent caching with LRU
- Token optimization
- Context truncation
- Parallel execution management
- Batch processing
- Performance metrics
