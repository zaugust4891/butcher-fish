from app.database import db

class SoftDeleteMixin:
    is_active   = db.Column(db.Boolean, nullable=False, server_default=db.true())
    deleted_at  = db.Column(db.DateTime(timezone=True))
    
    def soft_delete(self):
        """Mark the row as inactive instead of hard-deleting it."""
        from datetime import datetime
        self.is_active  = False
        self.deleted_at = datetime.now(datetime.timezone.utc)
        
