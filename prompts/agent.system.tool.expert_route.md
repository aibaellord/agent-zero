## Tool: expert_route

Route tasks to specialized expert systems.

**Operations:**

- `route`: Route a task to best expert
- `register`: Register a new expert
- `record`: Record expert result
- `stats`: Get expert statistics
- `rebalance`: Rebalance priorities
- `best`: Get best expert for domain
- `status`: Get router statistics

**Arguments:**

- `operation`: The operation to perform
- `task`: Task description (for route)
- `name`: Expert name (for register)
- `domain`: Expert domain (code, math, writing, analysis, etc.)
- `patterns`: Regex patterns for matching
- `capabilities`: List of capabilities
- `expert`: Expert name (for record)
- `success`: Whether task was successful
- `time`: Execution time

**Domains:**
code, math, writing, analysis, research, creative, technical, planning, debugging, optimization, translation, summarization, general

**Example:**

```json
{
  "thoughts": ["Finding best expert for this coding task"],
  "tool_name": "expert_route",
  "tool_args": {
    "operation": "route",
    "task": "Debug the Python script for memory leak"
  }
}
```
