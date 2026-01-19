# Agent Zero Quick Reference Card

## One-Command Quick Start

### Terminal 1: Start Ollama

```bash
ollama serve
# Keep this running - Agent Zero needs it!
```

### Terminal 2: Start Agent Zero

```bash
cd /Volumes/SSD320/agent-zero
source venv/bin/activate  # If using virtual environment
python run_ui.py
```

### Browser

```
Open: http://localhost:5000
```

---

## Essential Commands

```bash
# View available Ollama models
ollama list

# Download a new Ollama model
ollama pull mistral        # or: llama2, neural-chat, dolphin, etc.

# Check if Ollama is running
curl http://localhost:11434/api/tags

# Check if Agent Zero is running
curl http://localhost:5000

# View Agent Zero logs (while running in terminal)
# Errors appear directly in the terminal window

# Stop Agent Zero
# Press Ctrl+C in the Agent Zero terminal

# Stop Ollama
# Press Ctrl+C in the Ollama terminal
```

---

## Configuration Quick Reference

### File: `/Volumes/SSD320/agent-zero/.env`

**Most Important Settings:**

```ini
# Which Ollama model to use
OLLAMA_MODEL=llama2

# Web UI port
WEB_UI_PORT=5000

# Agent personality/role
AGENT_SUBDIR=default

# Enable core features (set to true)
ENABLE_CODE_EXECUTION=true
ENABLE_MEMORY=true
```

**To edit:**

```bash
nano /Volumes/SSD320/agent-zero/.env
# Make changes, then Ctrl+X to save
# Restart Agent Zero for changes to take effect
```

---

## Available Ollama Models

### Lightweight (Fast, Lower RAM)

- `mistral` - Excellent reasoning, ~7B parameters
- `neural-chat` - Conversational, ~7B parameters
- `phi` - Tiny but powerful, ~3B parameters

### Balanced (Good for most tasks)

- `llama2` - Default, versatile, ~7B parameters
- `dolphin-mixtral` - Strong reasoning, ~46B parameters

### Powerful (Slower, needs GPU)

- `neural-chat-7b-v3-1` - Very capable, ~7B parameters
- `mistral-7b` - Alternative mistral version

### To switch models:

```bash
# 1. Download the model
ollama pull mistral

# 2. Update .env
# OLLAMA_MODEL=mistral

# 3. Restart Agent Zero
# Ctrl+C, then python run_ui.py
```

---

## Verify Everything Works

| Component      | Test Command                                  | Expected Result               |
| -------------- | --------------------------------------------- | ----------------------------- |
| **Ollama**     | `ollama list`                                 | Shows available models        |
| **Ollama API** | `curl http://localhost:11434/api/tags`        | JSON response with model list |
| **Agent Zero** | `curl http://localhost:5000`                  | HTML response or redirect     |
| **Web UI**     | Visit http://localhost:5000                   | Chat interface loads          |
| **Chat**       | Send "Hello"                                  | Agent responds                |
| **Memory**     | Send "My name is Test" then "What's my name?" | Agent remembers               |
| **Code**       | Send "Write Python for 2+2"                   | Agent writes and executes     |

---

## Troubleshooting Quick Fixes

### Agent Zero won't start

```bash
# Check if port 5000 is in use
lsof -i :5000

# If in use, change WEB_UI_PORT in .env to 5001, 5002, etc.
# Then restart Agent Zero
```

### "Connection refused" error

```bash
# Ollama is not running! Start it:
ollama serve

# Keep it running in a separate terminal
```

### Model not found

```bash
# List installed models
ollama list

# Download missing model
ollama pull llama2

# Update OLLAMA_MODEL in .env
```

### Slow responses

```bash
# 1. Check if Ollama is the bottleneck
# 2. Switch to a faster model: mistral, phi
# 3. Reduce CONTEXT_WINDOW in .env to 2048
# 4. Close other apps to free RAM
```

### Memory issues

```bash
# Reduce context window in .env
CONTEXT_WINDOW=2048  # Lower = faster but less memory

# Or reduce context even more for large datasets
CONTEXT_WINDOW=1024
```

---

## File Structure Quick Reference

```
/Volumes/SSD320/agent-zero/
├── .env                      # Your configuration ← EDIT THIS
├── run_ui.py                 # Start Agent Zero Web UI
├── run_cli.py                # Start Agent Zero Terminal
├── agent.py                  # Core agent logic
├── models.py                 # LLM provider configs
├── prompts/                  # System prompts
│   ├── default/              # Default prompts
│   └── agent.system.main.md  # Main system prompt
├── agents/                   # Agent profiles
│   ├── default/              # Default agent
│   ├── developer/            # Developer agent
│   └── researcher/           # Researcher agent
├── python/
│   ├── tools/                # Tools (code execution, search, memory, etc.)
│   ├── extensions/           # Extensions (lifecycle hooks)
│   ├── api/                  # Web API endpoints
│   └── helpers/              # Utility functions
├── memory/                   # Persistent memory storage
├── knowledge/                # Knowledge base (docs, PDFs, data)
├── logs/                     # Chat logs and history
└── tmp/                      # Temporary files
```

---

## Next: Verification Steps

1. **Ensure Ollama is running** (separate terminal): `ollama serve`
2. **Start Agent Zero**: `python run_ui.py`
3. **Open browser**: http://localhost:5000
4. **Test chat**: Send "Hello"
5. **Review errors**: Check terminal for any error messages
6. **Fill out checklist**: Use `VERIFICATION_CHECKLIST.md`

---

## Once Working: Enhancement Plan

After Agent Zero is confirmed working:

- Identify which components are fastest/slowest
- Determine which Ollama model performs best
- Build optimization strategy based on actual performance
- Implement custom prompts, tools, and extensions

**Go to: `GETTING_STARTED.md` for detailed setup**
**Then: `VERIFICATION_CHECKLIST.md` to verify everything**
