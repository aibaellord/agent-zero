## Tool: domain_transfer

Zero-shot domain transfer tool - transfer knowledge between domains.

### Usage

```json
{
    "tool_name": "domain_transfer",
    "tool_args": {
        "operation": "<operation>",
        ...
    }
}
```

### Operations

#### register

Register a domain with its concepts and relations.

```json
{
  "tool_name": "domain_transfer",
  "tool_args": {
    "operation": "register",
    "domain": "software_architecture",
    "concepts": [
      { "name": "component", "properties": { "type": "module" } },
      { "name": "interface", "properties": { "type": "contract" } }
    ],
    "relations": [
      ["component", "implements", "interface"],
      ["component", "depends_on", "component"]
    ]
  }
}
```

#### transfer

Transfer knowledge from one domain to another.

```json
{
  "tool_name": "domain_transfer",
  "tool_args": {
    "operation": "transfer",
    "source_domain": "software_architecture",
    "target_domain": "organizational_structure",
    "solution": { "pattern": "microservices", "rationale": "scalability" }
  }
}
```

#### confidence

Estimate transfer confidence between domains.

```json
{
  "tool_name": "domain_transfer",
  "tool_args": {
    "operation": "confidence",
    "source_domain": "biology",
    "target_domain": "computing"
  }
}
```

#### status

Get adapter status.

```json
{
  "tool_name": "domain_transfer",
  "tool_args": {
    "operation": "status"
  }
}
```

### Capabilities

- Structural analogy mapping
- Cross-domain concept bridging
- Pattern transfer
- Invariant detection
- Transfer confidence estimation
