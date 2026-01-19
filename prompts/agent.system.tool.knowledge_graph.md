## Tool: knowledge_graph

Manage knowledge graphs with entities and relationships.

**Operations:**

- `add_entity`: Add an entity node
- `add_relationship`: Connect two entities
- `add_triple`: Add subject-predicate-object triple
- `query`: Query the graph with patterns
- `find_path`: Find paths between entities
- `infer`: Run inference engine
- `patterns`: Discover graph patterns
- `subgraph`: Get subgraph around entity
- `status`: Get graph statistics

**Arguments:**

- `operation`: The operation to perform
- `graph`: Graph name (default: "default")
- `name`, `type`, `properties`: For add_entity
- `source`, `target`, `relation`: For add_relationship
- `subject`, `predicate`, `object`: For add_triple
- `pattern`: Query pattern (e.g., "?x is_a Person")
- `start`, `end`: For find_path
- `entity`, `depth`: For subgraph

**Example:**

```json
{
  "thoughts": ["Building knowledge graph about project structure"],
  "tool_name": "knowledge_graph",
  "tool_args": {
    "operation": "add_triple",
    "subject": "User",
    "subject_type": "entity",
    "predicate": "has_a",
    "object": "Account",
    "object_type": "entity"
  }
}
```
