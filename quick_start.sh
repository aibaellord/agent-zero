#!/bin/bash

# Agent Zero - Quick Start Script
# Uses pyenv Python 3.11.13 directly

PROJECT_DIR="/Volumes/SSD320/agent-zero"
PYTHON_311="$HOME/.pyenv/versions/3.11.13/bin/python"

cd "$PROJECT_DIR"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 AGENT ZERO - ULTIMATE SYSTEM"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check Python
if [ ! -f "$PYTHON_311" ]; then
    echo "⚠️  Python 3.11.13 not found!"
    echo "Install via: pyenv install 3.11.13"
    exit 1
fi
echo "✅ Python 3.11.13 found"

# Check Ollama
echo ""
echo "Checking Ollama..."
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "⚠️  Ollama not running!"
    echo "Start Ollama first: ollama serve"
    exit 1
fi
echo "✅ Ollama running"

# Use pyenv Python directly with PYTHONPATH
export PYTHONPATH="$PROJECT_DIR"

echo ""
echo "🌐 Starting Agent Zero at http://localhost:5000"
echo ""
echo "Extensions: Neural Pathway, Cross-Dimensional, Quantum Resolver"
echo "Tools: loop_breaker, knowledge_network, strategic_engine"
echo ""

# Open browser
sleep 1
open "http://localhost:5000" 2>/dev/null &

# Install deps into user site-packages if needed
$PYTHON_311 -c "import flask" 2>/dev/null || {
    echo "Installing dependencies..."
    $PYTHON_311 -m pip install -r requirements.txt --user
}

# Run Agent Zero
$PYTHON_311 run_ui.py
