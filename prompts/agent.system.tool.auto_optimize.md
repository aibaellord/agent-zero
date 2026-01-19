## Tool: auto_optimize

🔮 **HIDDEN POWER FEATURE** - Universal automatic optimization.
Optimizes code, prompts, queries, configs, and text automatically.

### Usage

```json
{
    "tool_name": "auto_optimize",
    "tool_args": {
        "operation": "<operation>",
        ...
    }
}
```

### Operations

#### optimize

Full optimization with analysis and report.

```json
{
  "tool_name": "auto_optimize",
  "tool_args": {
    "operation": "optimize",
    "content": "your content here",
    "type": "auto",
    "goal": "general"
  }
}
```

Types: auto, code, prompt, query, config, text
Goals: general, performance, clarity, brevity, accuracy

#### quick

Quick optimization - returns optimized content only.

```json
{
  "tool_name": "auto_optimize",
  "tool_args": {
    "operation": "quick",
    "content": "Please could you maybe try to help me",
    "type": "prompt"
  }
}
```

Returns: "Help me"

#### stats

Get optimizer statistics.

```json
{
  "tool_name": "auto_optimize",
  "tool_args": {
    "operation": "stats"
  }
}
```

### Optimization Strategies

**For Code:**

- Remove redundant whitespace
- Simplify boolean comparisons
- Remove redundant statements
- Improve structure

**For Prompts:**

- Remove redundant phrases
- Make instructions direct
- Suggest structural improvements
- Reduce token count

**For Queries:**

- Normalize whitespace
- Suggest index usage
- Recommend WHERE/LIMIT clauses

**For Config:**

- Remove duplicates
- Organize structure

**For Text:**

- Remove filler words
- Fix spacing
- Improve clarity
