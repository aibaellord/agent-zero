# Tool: Game Theory

Use this tool for strategic analysis and mechanism design.

## Usage

```json
{
    "tool_name": "game_theory",
    "tool_args": {
        "action": "analyze|auction|vote",
        "agents": ["agent1", "agent2"],
        "strategies": {"agent1": ["option1", "option2"], ...},
        "situation": "strategic situation description"
    }
}
```

## Actions

### `analyze`

Analyze strategic situation, find Nash equilibrium, generate recommendations.

### `auction`

Design an auction mechanism. Set `auction_type` to "vickrey", "english", "dutch", or "sealed".

### `vote`

Design a voting system. Set `voting_rule` to "schulze", "borda", "plurality", or "condorcet".

## When to Use

- Multi-stakeholder decision problems
- Resource allocation with competing interests
- Designing fair mechanisms
- Strategic interaction analysis
