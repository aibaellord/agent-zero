## Tool: state_save

Save and restore complete agent state with checkpoints.

**Operations:**

- `set`: Set a state value
- `get`: Get a state value
- `checkpoint`: Create a named checkpoint
- `restore`: Restore from checkpoint
- `rollback`: Rollback N checkpoints
- `list`: List all checkpoints
- `changes`: Get recent state changes
- `export`: Export complete state
- `status`: Get serializer statistics

**Arguments:**

- `operation`: The operation to perform
- `key`: State key (for set/get)
- `value`: State value (for set)
- `default`: Default value (for get)
- `name`: Checkpoint name
- `compress`: Whether to compress (bool)
- `checkpoint_id`: ID to restore
- `steps`: Number of steps to rollback
- `count`: Number of items to show

**Example:**

```json
{
  "thoughts": ["Creating checkpoint before major changes"],
  "tool_name": "state_save",
  "tool_args": {
    "operation": "checkpoint",
    "name": "before_refactor",
    "compress": true
  }
}
```
