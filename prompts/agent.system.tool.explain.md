## Tool: explain

Generate human-readable explanations of reasoning.

**Operations:**

- `trace`: Add a reasoning step to current trace
- `reasoning`: Generate reasoning explanation
- `decision`: Explain a decision
- `comparison`: Create comparison explanation
- `error`: Explain an error
- `tree`: Build decision tree
- `clear`: Clear current trace
- `recent`: Get recent explanations
- `status`: Get generator statistics

**Arguments:**

- `operation`: The operation to perform
- `description`: Step description (for trace)
- `reasoning`: Reasoning text
- `confidence`: Confidence level (0-1)
- `evidence`: List of evidence
- `goal`: Goal being explained
- `detail`: Detail level (brief, summary, detailed, technical)
- `choice`: Chosen option (for decision)
- `alternatives`: Alternative options
- `reason`: Reason for decision
- `options`, `criteria`, `recommendation`: For comparison
- `error`, `cause`, `fix`: For error explanation
- `decisions`: List for decision tree

**Example:**

```json
{
  "thoughts": ["Explaining why I chose this approach"],
  "tool_name": "explain",
  "tool_args": {
    "operation": "decision",
    "choice": "Use async/await pattern",
    "alternatives": ["callbacks", "promises", "threads"],
    "reason": "Better readability and native Python support"
  }
}
```
