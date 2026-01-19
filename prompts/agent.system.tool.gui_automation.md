## Tool: gui_automation

🔮 **HIDDEN POWER FEATURE** - GUI automation for desktop control.
Record, replay, and automate desktop workflows.

### Usage

```json
{
    "tool_name": "gui_automation",
    "tool_args": {
        "operation": "<operation>",
        ...
    }
}
```

### Operations

#### record

Start recording a new workflow.

```json
{
  "tool_name": "gui_automation",
  "tool_args": {
    "operation": "record",
    "name": "my_workflow"
  }
}
```

#### stop

Stop recording and save workflow.

```json
{
  "tool_name": "gui_automation",
  "tool_args": {
    "operation": "stop"
  }
}
```

#### play

Execute a saved workflow.

```json
{
  "tool_name": "gui_automation",
  "tool_args": {
    "operation": "play",
    "name": "my_workflow"
  }
}
```

#### action

Execute a quick single action.

```json
{
  "tool_name": "gui_automation",
  "tool_args": {
    "operation": "action",
    "action": "click",
    "target": "500,300",
    "params": { "button": "left" }
  }
}
```

Actions: click, type, wait, scroll, hotkey

#### list

List all saved workflows.

```json
{
  "tool_name": "gui_automation",
  "tool_args": {
    "operation": "list"
  }
}
```

#### export

Export workflow as JSON.

```json
{
  "tool_name": "gui_automation",
  "tool_args": {
    "operation": "export",
    "name": "my_workflow"
  }
}
```

#### import

Import workflow from JSON.

```json
{
  "tool_name": "gui_automation",
  "tool_args": {
    "operation": "import",
    "name": "new_workflow",
    "data": "[{\"action\":\"click\",\"target\":\"500,300\"}]"
  }
}
```

#### status

Get automation engine status.

```json
{
  "tool_name": "gui_automation",
  "tool_args": {
    "operation": "status"
  }
}
```

### Capabilities

- Record user actions
- Replay workflows reliably
- Smart element location
- Multiple retry strategies
- Workflow import/export
- Execution history tracking
