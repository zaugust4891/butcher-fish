# Create app/celery_app.py
from celery import Celery

def make_celery(app):
    """
    Create a Celery instance that works with Flask's application context.
    Think of this as hiring a crew of workers who know how to work with your app.
    """
    celery = Celery(
        app.import_name,
        backend=f"redis://{app.config['REDIS_HOST']}:{app.config['REDIS_PORT']}/1",
        broker=f"redis://{app.config['REDIS_HOST']}:{app.config['REDIS_PORT']}/0"
    )
    
    class ContextTask(celery.Task):
        """Make celery tasks work inside Flask's context"""
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)
    
    celery.Task = ContextTask
    return celery

# In __init__.py, add:
from app.celery_app import make_celery

celery = None  # Global celery instance

def create_app():
    # ... existing code ...
    
    global celery
    celery = make_celery(app)
    app.celery = celery
    
    # ... rest of function