## Tool: knowledge_network

Explores and navigates the crystallized knowledge network.

### Usage

To explore knowledge relationships and find insights:

```json
{
    "tool_name": "knowledge_network",
    "tool_args": {
        "method": "<method>",
        ...args
    }
}
```

### Methods

#### explore

Search the knowledge network for related concepts:

```json
{
  "tool_name": "knowledge_network",
  "tool_args": {
    "method": "explore",
    "query": "machine learning optimization"
  }
}
```

#### connect

Find connections between two concepts:

```json
{
  "tool_name": "knowledge_network",
  "tool_args": {
    "method": "connect",
    "concept_a": "python",
    "concept_b": "web development"
  }
}
```

#### cluster

Find knowledge clusters around a topic:

```json
{
  "tool_name": "knowledge_network",
  "tool_args": {
    "method": "cluster",
    "topic": "data science"
  }
}
```

#### path

Find reasoning path between concepts:

```json
{
  "tool_name": "knowledge_network",
  "tool_args": {
    "method": "path",
    "start": "problem",
    "end": "solution"
  }
}
```

#### map

Generate overview map of knowledge network:

```json
{
  "tool_name": "knowledge_network",
  "tool_args": {
    "method": "map"
  }
}
```

### When to Use

- When looking for related past solutions
- When connecting disparate pieces of information
- When building comprehensive understanding
- When reviewing what knowledge is available
