#!/bin/bash

# run_backend.sh - Comprehensive script to run the Specialty Food Market Review Platform backend

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Change to the script's directory
cd "$(dirname "$0")"
SCRIPT_DIR="$(pwd)"

print_info "Starting Specialty Food Market Review Platform Backend Setup"
echo "=============================================================="

# Step 1: Check if virtual environment exists
if [ ! -d ".venv" ]; then
    print_warning "Virtual environment not found. Creating one..."
    python3 -m venv .venv
    print_success "Virtual environment created"
fi

# Step 2: Activate virtual environment
print_info "Activating virtual environment..."
source .venv/bin/activate
print_success "Virtual environment activated"

# Step 3: Check if dependencies are installed
print_info "Checking dependencies..."
if ! pip show Flask > /dev/null 2>&1; then
    print_warning "Dependencies not installed. Installing from requirements.txt..."
    pip install -r requirements.txt
    print_success "Dependencies installed"
else
    print_success "Dependencies already installed"
fi

# Step 4: Check PostgreSQL
print_info "Checking PostgreSQL connection..."
if psql -h localhost -U postgres -d gourmet_market_review_platform -c "SELECT 1;" > /dev/null 2>&1; then
    print_success "PostgreSQL is running and database exists"
else
    print_warning "Cannot connect to PostgreSQL database"
    print_info "Attempting to create database..."
    
    # Try to create the database
    if psql -h localhost -U postgres -c "CREATE DATABASE gourmet_market_review_platform;" 2>&1 | grep -q "already exists"; then
        print_success "Database already exists"
    elif psql -h localhost -U postgres -c "CREATE DATABASE gourmet_market_review_platform;" > /dev/null 2>&1; then
        print_success "Database created successfully"
    else
        print_error "Could not create database. Please create it manually:"
        print_info "Run: createdb -U postgres gourmet_market_review_platform"
        print_info "Or: psql -U postgres -c 'CREATE DATABASE gourmet_market_review_platform;'"
        exit 1
    fi
fi

# Step 5: Check Redis
print_info "Checking Redis connection..."
if redis-cli ping > /dev/null 2>&1; then
    print_success "Redis is running"
else
    print_warning "Redis is not running. Attempting to start..."
    sudo systemctl start redis-server
    sleep 2
    if redis-cli ping > /dev/null 2>&1; then
        print_success "Redis started successfully"
    else
        print_error "Could not start Redis. Please start it manually:"
        print_info "Run: sudo systemctl start redis-server"
        exit 1
    fi
fi

# Step 6: Check if .env file exists
if [ ! -f ".env" ]; then
    print_error ".env file not found!"
    exit 1
else
    print_success ".env file found"
fi

# Step 7: Run database migrations
print_info "Running database migrations..."
FLASK_APP=app.py .venv/bin/python -m flask db upgrade 2>/dev/null || {
    print_warning "Migrations may need to be initialized"
    if [ ! -d "migrations" ]; then
        print_info "Initializing Flask-Migrate..."
        FLASK_APP=app.py .venv/bin/python -m flask db init
        print_info "Creating initial migration..."
        FLASK_APP=app.py .venv/bin/python -m flask db migrate -m "Initial migration"
        print_info "Applying migrations..."
        FLASK_APP=app.py .venv/bin/python -m flask db upgrade
    fi
}
print_success "Database migrations complete"

# Step 8: Start the Flask application
print_success "All prerequisites met! Starting Flask application..."
echo "=============================================================="
echo ""
print_info "Starting Flask development server on http://127.0.0.1:5000"
print_info "Press Ctrl+C to stop the server"
echo ""

# Run Flask using venv python
export FLASK_APP=app.py
export FLASK_ENV=development
.venv/bin/python app.py
