## Tool: benchmark

Run performance benchmarks and quality tests.

**Operations:**

- `run`: Run benchmarks (all or specific suite)
- `suites`: List available benchmark suites
- `create_suite`: Create a new suite
- `baseline`: Set baseline score for comparison
- `compare`: Compare to baseline
- `regression`: Get regression report
- `report`: Generate full report
- `status`: Get benchmark statistics

**Built-in Suites:**

- `performance`: Python performance tests
- `quality`: Memory and consistency tests

**Arguments:**

- `operation`: The operation to perform
- `suite`: Suite name (for run)
- `name`: Suite/benchmark name
- `description`: Suite description
- `benchmark`: Benchmark name
- `score`: Baseline score
- `format`: Report format (text/json)

**Example:**

```json
{
  "thoughts": ["Running performance benchmarks"],
  "tool_name": "benchmark",
  "tool_args": {
    "operation": "run",
    "suite": "performance"
  }
}
```
