#!/usr/bin/env python3
"""
Main application entry point for the Specialty Food Market Review Platform.

This file creates the Flask application instance and serves as the entry point
for Flask CLI commands like 'flask db init', 'flask run', etc.
"""

from app import create_app

# Create the Flask application instance
app = create_app()

if __name__ == '__main__':
    # This allows running the app directly with 'python app.py'
    # For development only - use 'flask run' for proper development server
    app.run(debug=True)
