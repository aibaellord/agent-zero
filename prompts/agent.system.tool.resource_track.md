## Tool: resource_track

Track tokens, memory, time, and costs in real-time.

**Operations:**

- `record`: Record resource usage
- `start`: Start timing an operation
- `end`: End operation and record
- `budget`: Check budget status
- `capacity`: Estimate remaining capacity
- `report`: Get operations report
- `alerts`: Get recent alerts
- `status`: Get current usage

**Arguments:**

- `operation`: The operation to perform
- `name`/`id`: Operation name/ID
- `tokens_in`: Input tokens
- `tokens_out`: Output tokens
- `model`: Model name (for cost calculation)
- `time_ms`: Execution time in ms
- `count`: Number of items to show

**Example:**

```json
{
  "thoughts": ["Tracking token usage for this API call"],
  "tool_name": "resource_track",
  "tool_args": {
    "operation": "record",
    "name": "gpt4_completion",
    "tokens_in": 1500,
    "tokens_out": 500,
    "model": "gpt-4"
  }
}
```
