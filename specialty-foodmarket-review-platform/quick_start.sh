#!/bin/bash

# quick_start.sh - Quick start script (assumes everything is already set up)

cd "$(dirname "$0")"

echo "🚀 Starting backend server..."

# Set Flask environment variables and run using venv python
export FLASK_APP=app.py
export FLASK_ENV=development

# Run Flask
.venv/bin/python app.py
