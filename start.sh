#!/usr/bin/env bash

# Dragon Tank India AI Simulator Launcher
# Starts FastAPI backend (port 8000) and Next.js frontend (port 3000)

echo "=========================================================="
echo "      DRAGON TANK INDIA - LIVE AI VOICE SIMULATOR         "
echo "=========================================================="

cleanup() {
    echo ""
    echo "Shutting down Dragon Tank servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "1. Starting FastAPI LangGraph backend on http://localhost:8000 ..."
python3 -m uvicorn backend.server:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

sleep 2

echo "2. Starting Next.js App Router frontend on http://localhost:3000 ..."
cd frontend && npm run dev &
FRONTEND_PID=$!

echo ""
echo ">> The Tank is live!"
echo ">> Open http://localhost:3000 in your browser to start pitching."
echo ">> Press Ctrl+C anytime to stop."
echo "=========================================================="

wait
