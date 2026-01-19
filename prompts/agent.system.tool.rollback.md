## Tool: rollback

Undo and rollback agent actions with transactions.

**Operations:**

- `record`: Record an action for rollback
- `undo`: Undo last N actions
- `redo`: Redo last N undone actions
- `save_point`: Create named restoration point
- `restore`: Restore to a point
- `transaction_start`: Begin a transaction
- `transaction_commit`: Commit transaction
- `transaction_rollback`: Rollback transaction
- `history`: Get action history
- `points`: List restoration points
- `status`: Get rollback statistics

**Action Types:**
file_create, file_modify, file_delete, state_change, memory_save, memory_delete, config_change, command_execute, custom

**Arguments:**

- `operation`: The operation to perform
- `type`: Action type
- `description`: Action description
- `data`: Action data
- `undo_data`: Data needed for undo
- `count`: Number of actions
- `name`: Point/transaction name
- `point_id`: Restoration point ID
- `transaction_id`: Transaction ID

**Example:**

```json
{
  "thoughts": ["Creating restoration point before changes"],
  "tool_name": "rollback",
  "tool_args": {
    "operation": "save_point",
    "name": "before_database_migration",
    "description": "State before DB schema changes"
  }
}
```
