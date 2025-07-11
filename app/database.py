"""
Database initialization module.

This module contains the SQLAlchemy database instance to avoid circular imports.
"""

from flask_sqlalchemy import SQLAlchemy

# Create the database instance
db = SQLAlchemy()
