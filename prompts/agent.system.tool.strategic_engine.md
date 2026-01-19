## Tool: strategic_engine

Multi-framework strategic reasoning engine for complex problem solving.

### Usage

Apply sophisticated reasoning frameworks to any problem:

```json
{
    "tool_name": "strategic_engine",
    "tool_args": {
        "method": "<method>",
        ...args
    }
}
```

### Methods

#### analyze

Apply all 6 reasoning frameworks simultaneously:

```json
{
  "tool_name": "strategic_engine",
  "tool_args": {
    "method": "analyze",
    "problem": "How to optimize database performance?"
  }
}
```

#### framework

Apply a specific reasoning framework:

```json
{
  "tool_name": "strategic_engine",
  "tool_args": {
    "method": "framework",
    "framework": "first_principles",
    "problem": "Design a new caching system"
  }
}
```

Available frameworks:

- **analytical**: Break down, quantify, apply logic
- **creative**: Challenge assumptions, generate alternatives
- **critical**: Evaluate evidence, identify biases
- **systems**: Map boundaries, feedback loops, leverage points
- **first_principles**: Strip to fundamentals, rebuild
- **probabilistic**: Outcomes, probabilities, expected values

#### compare

Compare how different frameworks approach the same problem:

```json
{
  "tool_name": "strategic_engine",
  "tool_args": {
    "method": "compare",
    "problem": "Scale web application to 1M users"
  }
}
```

#### list

List all available frameworks with details:

```json
{
  "tool_name": "strategic_engine",
  "tool_args": {
    "method": "list"
  }
}
```

### When to Use

- Complex problems requiring deep analysis
- When simple solutions haven't worked
- When you need multiple perspectives
- For architectural and design decisions
- When stakes are high and thoroughness matters
