# Specialty Food Market Review Platform - Backend

A Flask-based REST API for the Specialty Food Market Review Platform.

## Quick Start

If everything is already set up, simply run:

```bash
./quick_start.sh
```

Or manually:

```bash
source .venv/bin/activate
export FLASK_APP=app.py
export FLASK_ENV=development
flask run
```

## First Time Setup

Run the comprehensive setup script:

```bash
./run_backend.sh
```

This script will:
1. Create and activate a virtual environment
2. Install all dependencies
3. Check PostgreSQL and Redis connections
4. Run database migrations
5. Start the Flask development server

## Manual Setup

### 1. Prerequisites

Make sure you have the following installed:
- Python 3.8+
- PostgreSQL
- Redis

### 2. Create Virtual Environment

```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Set Up PostgreSQL

Create the database:

```bash
createdb -U postgres gourmet_market_review_platform
```

Or using psql:

```bash
psql -U postgres -c "CREATE DATABASE gourmet_market_review_platform;"
```

### 5. Start Redis

```bash
sudo systemctl start redis-server
```

Or if not using systemd:

```bash
redis-server
```

### 6. Configure Environment Variables

The `.env` file is already configured with:

- Database connection (PostgreSQL)
- Redis configuration
- JWT secret keys
- Mail server settings
- Security salts

**Important**: The `.env` file contains your database password. Make sure it's in `.gitignore`.

### 7. Run Database Migrations

Initialize migrations (if not already done):

```bash
flask db init
```

Create initial migration:

```bash
flask db migrate -m "Initial migration"
```

Apply migrations:

```bash
flask db upgrade
```

### 8. Run the Application

**Option 1: Using Flask CLI (recommended)**
```bash
export FLASK_APP=app.py
export FLASK_ENV=development
flask run
```

**Option 2: Using Python directly**
```bash
python app.py
```

The server will start on `http://127.0.0.1:5000`

## API Endpoints

The backend provides the following API endpoints:

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh JWT token

### Markets (`/api/markets`)
- `GET /api/markets` - List all markets
- `GET /api/markets/<id>` - Get market details
- `POST /api/markets` - Create new market (authenticated)
- `PUT /api/markets/<id>` - Update market (authenticated)
- `DELETE /api/markets/<id>` - Delete market (authenticated)

### Reviews (`/api/reviews`)
- `GET /api/reviews` - List reviews
- `POST /api/reviews` - Create review (authenticated)
- `PUT /api/reviews/<id>` - Update review (authenticated)
- `DELETE /api/reviews/<id>` - Delete review (authenticated)

### Profiles (`/api/profiles`)
- `GET /api/profiles/<username>` - Get user profile
- `PUT /api/profiles/<username>` - Update profile (authenticated)
- `POST /api/profiles/<username>/follow` - Follow user (authenticated)
- `DELETE /api/profiles/<username>/follow` - Unfollow user (authenticated)

## Development

### Running Tests

```bash
pytest tests/
```

### Database Migrations

After making changes to models:

```bash
flask db migrate -m "Description of changes"
flask db upgrade
```

### Check Configuration

The configuration is loaded from `app/config.py` and uses environment variables from `.env`.

To verify your configuration:

```bash
python -c "from app.config import DevelopmentConfig; c = DevelopmentConfig(); c.validate(); print('Configuration valid!')"
```

## Troubleshooting

### PostgreSQL Connection Issues

1. Check if PostgreSQL is running:
   ```bash
   sudo systemctl status postgresql
   ```

2. Verify database exists:
   ```bash
   psql -U postgres -l | grep gourmet_market_review_platform
   ```

3. Check connection string in `.env` file

### Redis Connection Issues

1. Check if Redis is running:
   ```bash
   redis-cli ping
   ```
   Should return `PONG`

2. Start Redis if not running:
   ```bash
   sudo systemctl start redis-server
   ```

### Import Errors

Make sure your virtual environment is activated:
```bash
source .venv/bin/activate
```

And all dependencies are installed:
```bash
pip install -r requirements.txt
```

### Migration Issues

If you encounter migration conflicts:

1. Drop all tables (⚠️ WARNING: This deletes all data):
   ```bash
   flask db downgrade base
   ```

2. Remove migrations folder:
   ```bash
   rm -rf migrations/
   ```

3. Reinitialize:
   ```bash
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   ```

## Configuration Files

- `.env` - Environment variables (not in git)
- `app/config.py` - Configuration classes
- `dev_keys.json` - Development keys (not in production)
- `requirements.txt` - Python dependencies

## Project Structure

```
specialty-foodmarket-review-platform/
├── app/                      # Application package
│   ├── __init__.py          # App factory
│   ├── config.py            # Configuration classes
│   ├── database.py          # Database setup
│   ├── models/              # Data models
│   ├── routes/              # API endpoints
│   ├── services/            # Business logic
│   └── utils/               # Helper functions
├── migrations/              # Database migrations
├── tests/                   # Test files
├── .env                     # Environment variables
├── app.py                   # Application entry point
├── requirements.txt         # Python dependencies
├── run_backend.sh          # Full setup script
└── quick_start.sh          # Quick start script
```

## Environment Variables

Key environment variables in `.env`:

- `FLASK_ENV` - Set to 'development' or 'production'
- `DATABASE_URI` - PostgreSQL connection string
- `REDIS_HOST`, `REDIS_PORT`, `REDIS_DB` - Redis configuration
- `JWT_SECRET_KEY` - Secret key for JWT tokens
- `SECRET_KEY`, `SECURITY_PASSWORD_SALT` - Flask secret keys
- `MAIL_*` - Email configuration

## Security Notes

1. **Never commit `.env` file** - It contains sensitive credentials
2. **Change JWT_SECRET_KEY in production** - Use a strong random key
3. **Use HTTPS in production** - Enable SSL/TLS
4. **Keep dependencies updated** - Run `pip list --outdated` regularly

## License

[Your License Here]

## Contact

[Your Contact Information]
