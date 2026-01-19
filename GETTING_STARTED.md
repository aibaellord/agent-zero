# Getting Agent Zero Up & Running - Quick Start Guide

## Prerequisites Check

Before starting, verify you have:

- [x] Python 3.10+ installed
- [x] Ollama installed (on your SSD at `/Volumes/SSD320`)
- [x] Docker installed (optional, for RFC features)
- [x] 4GB+ RAM available
- [x] Agent Zero cloned at `/Volumes/SSD320/agent-zero`

## Step 1: Verify Ollama is Running

```bash
# Check if Ollama is running
ollama list

# If Ollama isn't running, start it:
ollama serve

# In a new terminal, verify models are available:
ollama list
# Should show: llama2, mistral, neural-chat, etc.
```

**Note**: If you don't see your finetuned model, place it in Ollama's model directory or specify its path.

## Step 2: Install Python Dependencies

```bash
cd /Volumes/SSD320/agent-zero

# Create a Python virtual environment (recommended)
python3 -m venv venv
source venv/bin/activate  # On macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Install Playwright browser binaries (needed for browser automation)
playwright install chromium
```

## Step 3: Configure `.env` File

The `.env` file has been created at `/Volumes/SSD320/agent-zero/.env`

**Key settings to verify/update:**

```bash
# 1. Set your Ollama model (see available models with: ollama list)
OLLAMA_MODEL=llama2  # Change to: mistral, dolphin, neural-chat, etc.

# 2. Set the web UI port (default: 5000)
WEB_UI_PORT=5000

# 3. Enable code execution (you want this!)
ENABLE_CODE_EXECUTION=true

# 4. Choose your agent profile (default, developer, researcher)
AGENT_SUBDIR=default
```

## Step 4: Start Agent Zero Web UI

```bash
cd /Volumes/SSD320/agent-zero

# Make sure Python environment is activated
source venv/bin/activate  # If using venv

# Start the web UI
python run_ui.py

# You should see output like:
# INFO: Uvicorn running on http://0.0.0.0:5000
```

## Step 5: Access Agent Zero

Open your browser and go to:

```
http://localhost:5000
```

You should see the Agent Zero web interface.

## Step 6: Configure API Keys & Settings in UI

1. **Click Settings (bottom-left)**
2. **Go to "Model & API" section**
3. **Verify Ollama is selected:**
   - Provider: `ollama`
   - Base URL: `http://localhost:11434`
   - Model: (your selected model)

4. **Go to "Advanced" section:**
   - Enable: Code Execution
   - Enable: Memory
   - Enable: Search
   - Context Window: 4096 (or higher for longer conversations)

5. **Click Save**

## Step 7: Test Agent Zero

1. In the chat window, type a simple test:

```
Hello! Please confirm you're working by introducing yourself.
```

2. Agent should respond with an introduction.

3. Try a code execution task:

```
Write a Python function that returns the current date and time, then execute it.
```

4. Agent should write code and execute it successfully.

## Step 8: Check Logs for Issues

If something doesn't work, check logs:

```bash
# View logs in terminal (while Agent Zero is running)
# Errors will appear in the same terminal window

# Or check the logs folder
ls -la /Volumes/SSD320/agent-zero/logs/
```

## Common Issues & Fixes

| Issue                  | Solution                                                              |
| ---------------------- | --------------------------------------------------------------------- |
| "Connection refused"   | Ensure Ollama is running: `ollama serve` in another terminal          |
| "Model not found"      | Run `ollama list` and update OLLAMA_MODEL in `.env` to a listed model |
| "Port 5000 in use"     | Change WEB_UI_PORT in `.env` to another port (e.g., 5001)             |
| "Memory errors"        | Reduce CONTEXT_WINDOW in `.env` or close other apps                   |
| "Code execution fails" | Enable ENABLE_CODE_EXECUTION=true in `.env` and restart               |

## What You Should See

✅ **Web UI loads** at http://localhost:5000
✅ **Chat works** - Agent responds to text
✅ **Code execution works** - Agent can write and run Python/Node/Shell
✅ **Memory works** - Agent remembers previous conversations
✅ **Search works** - Agent can search for information

## Next Steps After Verification

Once Agent Zero is running and you've confirmed it works:

1. **Try the Developer Agent Profile**: Change `AGENT_SUBDIR=developer` in `.env` and restart
2. **Import Knowledge**: Click "Import Knowledge" → add PDFs, docs, datasets
3. **Create a Project**: Use the Projects feature to isolate specific workflows
4. **Explore Tools**: Try different agent capabilities (search, memory, code execution)

---

**Once you confirm Agent Zero is running successfully, we'll create the Perfect Enhancement Plan based on what's actually working and what you want to optimize.**

Good luck! Let me know when you have Agent Zero running.
