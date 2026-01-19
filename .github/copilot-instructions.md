# Agent Zero: AI Coding Agent Instructions

## Core Architecture Overview

Agent Zero is a **hierarchical agentic framework** enabling multi-level agent delegation. Understand this core pattern:

- **Hierarchical Structure**: User (or Agent 0) → Subordinate Agents → Further delegation
- **LLM-Agnostic**: Uses LiteLLM for provider abstraction (OpenAI, Anthropic, Claude, etc.)
- **No Hard Constraints**: Agent behavior defined entirely by system prompts in `/prompts`, not code
- **Docker-First**: Container-based runtime with hybrid development (Python on host + Docker execution)

Key diagram: See [architecture.md](../docs/architecture.md) - agents access shared assets (prompts, memory, knowledge, tools, extensions, instruments).

## Message Protocol & Tool Invocation

### Agent Communication Structure

All LLM responses follow this JSON format:

```json
{
  "thoughts": "Chain of thought reasoning (as object or string)",
  "tool_name": "specific tool to invoke",
  "tool_args": {...}  // JSON arguments for the tool
}
```

### Critical Tool Categories

Located in `/python/tools/`:

1. **Core Workflow**:
   - `response.py` - End conversation or return results
   - `code_execution_tool.py` - Run Python/Node/shell in terminal
   - `call_subordinate.py` - Delegate to sub-agents

2. **Information Access**:
   - `document_query.py` - RAG over knowledge base
   - `search_engine.py` - SearXNG integration
   - `memory_*.py` - Persistent memory operations

3. **Behavior Control**:
   - `behaviour_adjustment.py` - Modify agent behavior via prompts
   - `wait.py` - User interaction/approval patterns

## Project Structure & Customization

### Prompt System (The "Brain")

**Location**: `/prompts/default/` (also `/prompts/{custom_subdir}/`)

**Hierarchy**:

```
agent.system.main.md (entry point)
├── agent.system.main.role.md (agent identity/capabilities)
├── agent.system.main.communication.md (message format/thinking)
├── agent.system.main.solving.md (problem approach)
├── agent.system.main.behaviour.md (behavioral rules)
├── agent.system.tools.md (tool descriptions)
└── agent.system.tool.*.md (individual tool specs)
```

**Customization**: Agents in `/agents/{profile}/` override defaults. Example: `agents/developer/prompts/agent.system.main.role.md` replaces the default role.

### Agent Profiles

**Location**: `/agents/`

Each agent profile contains optional directories:

- `prompts/` - Custom system prompt overrides
- `tools/` - Custom tool implementations (override defaults)
- `extensions/` - Extension hooks for lifecycle events
- `_context.md` - Agent-specific configuration

When an agent requests a tool, Agent Zero checks `/agents/{profile}/tools/` first; falls back to `/python/tools/`.

### Extension System

**Extension Points** (in order):

- `agent_init`, `before_main_llm_call`, `message_loop_start`/`_end`, `monologue_start`/`_end`, `reasoning_stream`, `response_stream`, `system_prompt`

**Pattern**:

```python
# Location: /python/extensions/{extension_point}/_10_feature.py
from python.helpers.extension import Extension

class MyExtension(Extension):
    async def execute(self, **kwargs):
        # Access: self.agent, self.context, message data
        pass
```

Files execute alphabetically (prefix with numbers to control order).

## Memory & Knowledge Systems

### Memory (Persistent Learning)

- **Location**: `/memory/` directory
- **Structure**: Vectorized memories + solutions index
- **Tools**: `memory_save.py`, `memory_load.py`, `memory_forget.py`
- **Pattern**: Agents query past solutions before solving new tasks

### Knowledge Base (RAG)

- **Location**: `/knowledge/default/` + `/knowledge/custom/`
- **Supported Formats**: `.txt`, `.pdf`, `.csv`, `.html`, `.json`, `.md`
- **Tool**: `document_query.py` (semantic search + LLM synthesis)
- **Automatic**: `/docs` folder auto-indexed

## Development Workflow

### Setup (See [development.md](../docs/development.md))

```bash
# 1. Clone repo
git clone https://github.com/agent0ai/agent-zero

# 2. Install Python deps (conda/venv)
pip install -r requirements.txt

# 3. Configure environment
cp example.env .env  # Add API keys (OPENAI_API_KEY, etc.)

# 4. Start Docker backend
docker run -d --name agent-zero -p 5000:5000 agent0ai/agent-zero:latest

# 5. Run framework (connects to Docker)
python run_ui.py  # Web UI at http://localhost:5000
# or: python run_cli.py  # Terminal interface
```

### Key Files to Understand

| File               | Purpose                                                                          |
| ------------------ | -------------------------------------------------------------------------------- |
| `agent.py`         | Core agent loop: message handling, tool dispatch, context management             |
| `models.py`        | LLM provider config via LiteLLM                                                  |
| `python/api/`      | Flask endpoints for web UI                                                       |
| `python/helpers/`  | Utilities: token counting, history summarization, extensions, dirty JSON parsing |
| `requirements.txt` | Python dependencies (LangChain, browser-use, FastMCP, etc.)                      |

## Common Modification Patterns

### 1. **Changing Agent Behavior**

Edit `/prompts/default/agent.system.main.behaviour.md` (or create custom prompt variant).

### 2. **Adding Custom Tool**

1. Create `/python/tools/my_tool.py` extending `Tool` base class
2. Add description to `/prompts/default/agent.system.tool.my_tool.md`
3. Reference in `/prompts/default/agent.system.tools.md`

### 3. **Creating Agent Profile**

1. Create `/agents/my_agent/prompts/` with overrides (e.g., `agent.system.main.role.md`)
2. Select profile via `.env` `AGENT_SUBDIR=my_agent`
3. Can also add custom tools/extensions at `/agents/my_agent/{tools,extensions}/`

### 4. **Extending Lifecycle**

Create extension in `/python/extensions/{extension_point}/_XX_name.py` to hook into agent initialization, message loops, or LLM calls.

## Critical Patterns NOT to Break

1. **Never hard-code behavior** - Use prompts, not code constants
2. **Tool responses** - Return structured `Response` objects with proper exit semantics
3. **Async-first** - All tools, extensions, and API calls are async
4. **Message JSON** - Always validate incoming LLM responses parse as valid tool calls
5. **Memory consistency** - Don't bypass vectorDB; use tool interface for persistence
6. **Docker isolation** - Code execution happens in container; host can't directly execute

## Debugging & Testing

### Enable Debug Logging

```python
# In code or .env:
LOG_LEVEL=DEBUG
LITELLM_LOG=DEBUG  # See model API calls
```

### Test Agent Reasoning

Web UI shows real-time `thoughts` JSON, tool dispatch, and results. Watch for:

- Malformed JSON in agent responses
- Tool names not matching available tools
- Memory query failures
- Token limit issues (watch summarization)

### Common Issues

- **Tool not found**: Check `/python/tools/` and agent profile `/tools/`
- **Prompt ignored**: Ensure it's in correct `/prompts/` subdirectory
- **Memory not persisting**: Verify vectorDB initialized and `memory_save` called

## Reference Docs

- [Architecture](../docs/architecture.md) - System design and components
- [Extensibility](../docs/extensibility.md) - Plugin system and custom tools
- [Usage](../docs/usage.md) - Multi-agent cooperation examples
- [Development Guide](../docs/development.md) - Full setup with VS Code debugger

---

**Last Updated**: January 2026 | **Framework**: Agent Zero (Python-based, LiteLLM, Docker runtime)
