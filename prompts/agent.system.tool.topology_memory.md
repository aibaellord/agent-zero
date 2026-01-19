# Tool: Topology Memory

Use this tool to explore memory through topological lens with persistent homology.

## Usage

```json
{
  "tool_name": "topology_memory",
  "tool_args": {
    "action": "query|add|signature|homology",
    "content": "content to add or query",
    "neighbors": 5
  }
}
```

## Actions

### `add`

Add content to topological memory with automatic embedding.

### `query`

Find topological neighbors of content based on embedding similarity.

### `signature`

Get topological signature: Betti numbers, Euler characteristic, connectivity ratio.

### `homology`

Compute persistent homology to find stable knowledge structures.

## Betti Number Interpretation

- β₀: Connected components (clusters of related knowledge)
- β₁: Holes/cycles (circular reasoning paths)
- β₂: Voids (missing knowledge areas)

## When to Use

- Understanding knowledge structure
- Finding related concepts
- Identifying knowledge gaps
- Exploring semantic neighborhoods
