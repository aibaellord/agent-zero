# Agent Zero Verification Checklist

Use this checklist to verify each component is working before optimization.

## Prerequisites ✓

- [ ] Python 3.10+ installed
- [ ] Ollama installed and running (`ollama list` works)
- [ ] Agent Zero repository at `/Volumes/SSD320/agent-zero`
- [ ] `.env` file created with proper configuration
- [ ] Python dependencies installed (`pip install -r requirements.txt`)

## Installation ✓

- [ ] Virtual environment created and activated
- [ ] `pip install -r requirements.txt` completed successfully
- [ ] `playwright install chromium` completed successfully
- [ ] No dependency conflicts or errors

## Startup ✓

- [ ] Ollama server is running (`ollama serve` in terminal)
- [ ] Agent Zero web UI starts without errors (`python run_ui.py`)
- [ ] Web UI accessible at `http://localhost:5000`
- [ ] No port conflicts (if port 5000 taken, verify `.env` WEB_UI_PORT change)

## Web UI Interface ✓

- [ ] Chat window loads
- [ ] Input box appears and is responsive
- [ ] Settings button accessible (bottom-left)
- [ ] File browser accessible
- [ ] Action buttons visible (pause, context, history, etc.)

## Configuration ✓

- [ ] Settings page opens without errors
- [ ] Ollama provider appears in model selection
- [ ] Model list shows available Ollama models
- [ ] API/Model configuration saves successfully
- [ ] All toggles (Memory, Search, Code Execution) are enabled

## Basic Functionality ✓

### Chat Test

- [ ] Can send a simple message ("Hello")
- [ ] Agent responds within reasonable time (<30 seconds)
- [ ] Response appears in chat window
- [ ] No obvious errors in terminal output

### Memory Test

- [ ] Send: "My name is [Your Name]"
- [ ] Send: "What is my name?"
- [ ] Agent recalls your name correctly

### Search Test

- [ ] Send: "Search for the latest news about AI"
- [ ] Agent performs search and returns results
- [ ] Results appear in response

### Code Execution Test

- [ ] Send: "Write and execute a Python function that returns 2+2"
- [ ] Agent writes code in markdown
- [ ] Code executes successfully
- [ ] Output shows in response

### Tool Verification

- [ ] Response tool: Agent can end conversations properly
- [ ] Memory tools: Memories persist across conversations
- [ ] Document query: Can import and query documents
- [ ] Search: SearXNG search works

## Performance ✓

- [ ] Ollama responses are reasonably fast (under 30 seconds)
- [ ] No memory leaks (RAM usage stable)
- [ ] No CPU spikes during idle
- [ ] Web UI responsive (no lag)

## Error Checking ✓

- [ ] Terminal shows no Python errors
- [ ] Web UI console (F12) shows no JavaScript errors
- [ ] No warnings about missing dependencies
- [ ] All API connections successful

## Ollama Specifics ✓

- [ ] Ollama models load correctly
- [ ] Selected model generates responses
- [ ] Model switching works (change OLLAMA_MODEL in `.env` and restart)
- [ ] If finetuned model available, it loads and works

## What's Working Summary

Document what you've confirmed:

### ✅ Working Components

```
- [ ] Ollama integration: YES / NO / PARTIAL
- [ ] Chat interface: YES / NO / PARTIAL
- [ ] Memory system: YES / NO / PARTIAL
- [ ] Code execution: YES / NO / PARTIAL
- [ ] Search/RAG: YES / NO / PARTIAL
- [ ] File operations: YES / NO / PARTIAL
- [ ] Multi-agent: YES / NO / PARTIAL
```

### ⚠️ Issues Found

```
(List any issues, errors, or unexpected behavior)
1.
2.
3.
```

### 💡 Performance Observations

```
- Typical response time: ___ seconds
- Memory usage: ___ MB
- CPU usage: ___ %
- Web UI responsiveness: SMOOTH / LAGGY / ACCEPTABLE
```

---

## Next Action

Once you've completed this checklist and confirmed Agent Zero is working:

1. **Share the "What's Working Summary"** so we know which components are operational
2. **Report any issues** found during testing
3. **We'll build the Perfect Enhancement Plan** based on actual working state

This ensures our optimization plan is realistic, targeted, and maximizes impact without breaking what's already functional.
