#!/bin/bash

# Simple script to start a local HTTP server for testing
# Usage: ./start-local.sh [port]
# Default port: 8000

PORT=${1:-8000}

echo "🚀 Starting NFL Playoff Picks App on http://localhost:$PORT"
echo ""
echo "Make sure you have:"
echo "  ✅ Set up Supabase project"
echo "  ✅ Run schema.sql in Supabase"
echo "  ✅ Updated js/config.js with your Supabase credentials"
echo "  ✅ (Optional) Run test-data.sql for sample data"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Try Python 3 first, then Python 2, then suggest alternatives
if command -v python3 &> /dev/null; then
    python3 -m http.server $PORT
elif command -v python &> /dev/null; then
    python -m SimpleHTTPServer $PORT
else
    echo "❌ Python not found!"
    echo ""
    echo "Alternative options:"
    echo "  - Install Python 3"
    echo "  - Use Node.js: npx http-server -p $PORT"
    echo "  - Use PHP: php -S localhost:$PORT"
    exit 1
fi

