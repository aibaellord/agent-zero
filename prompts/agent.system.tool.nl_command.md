## Tool: nl_command

Parse and execute natural language commands.

**Operations:**

- `parse`: Parse natural language to command
- `help`: Get help for a command
- `suggest`: Get command suggestions
- `register`: Register a custom command
- `categories`: List command categories
- `list`: List all commands
- `status`: Get parser statistics

**Arguments:**

- `operation`: The operation to perform
- `input`: Natural language input text
- `command`: Command name (for help)
- `limit`: Number of suggestions
- `name`: Command name (for register)
- `patterns`: Regex patterns for matching
- `description`: Command description
- `examples`: Usage examples
- `category`: Command category

**Built-in Categories:**
system, files, execution, search, analysis, custom

**Example:**

```json
{
  "thoughts": ["Parsing user's natural language request"],
  "tool_name": "nl_command",
  "tool_args": {
    "operation": "parse",
    "input": "create a new python file called utils.py"
  }
}
```
