# flask_backend/models.py
from app import db # Import the SQLAlchemy instance from your app
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.types import TypeDecorator, String
import json
from datetime import datetime
import uuid

# Custom type for JSON data to handle SQLite's lack of native JSON type well
class JSONEncodedDict(TypeDecorator):
    """Enables JSON storage for SQLAlchemy."""
    impl = String # Use String type for underlying storage

    def process_bind_param(self, value, dialect):
        if value is not None:
            return json.dumps(value) # This correctly stringifies the Python list/dict
        return value

    def process_result_value(self, value, dialect):
        if value is not None:
            return json.loads(value) # This correctly parses the JSON string back
        return value

class User(db.Model):
    id = db.Column(db.String(80), primary_key=True, default=lambda: f"backend-user-{str(uuid.uuid4())[:8]}")
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False) # Increased length to 255 for scrypt hash
    age = db.Column(db.Integer, nullable=False)
    onboarding_data = db.Column(JSONEncodedDict, default={})
    current_step = db.Column(db.Integer, default=1)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'age': self.age,
            'onboardingData': self.onboarding_data,
            'currentStep': self.current_step,
            'created_at': self.created_at.isoformat() + 'Z' if self.created_at else None
        }

class AdminConfig(db.Model):
    # There should ideally be only one entry for 'default' config_name
    id = db.Column(db.Integer, primary_key=True)
    config_name = db.Column(db.String(80), unique=True, nullable=False, default='default')
    # --- CRITICAL CHANGE HERE: Remove json.dumps from defaults ---
    page1_components = db.Column(JSONEncodedDict, default=[]) # Pass empty list directly
    page2_components = db.Column(JSONEncodedDict, default=[]) # Pass empty list directly
    page3_components = db.Column(JSONEncodedDict, default=[]) # Pass empty list directly

    def to_dict(self):
        # The JSONEncodedDict type automatically converts back from string to Python list/dict
        return {
            'page1': self.page1_components,
            'page2': self.page2_components,
            'page3': self.page3_components,
        }