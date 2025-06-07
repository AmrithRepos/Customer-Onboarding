from app import db
from sqlalchemy.types import TypeDecorator, String
import json
from datetime import datetime
import uuid

class JSONEncodedDict(TypeDecorator):
    impl = String

    def process_bind_param(self, value, dialect):
        if value is not None:
            return json.dumps(value)
        return value

    def process_result_value(self, value, dialect):
        if value is not None:
            return json.loads(value)
        return value

class User(db.Model):
    id = db.Column(db.String(80), primary_key=True, default=lambda: f"backend-user-{str(uuid.uuid4())[:8]}")
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    onboarding_data = db.Column(JSONEncodedDict, default={})
    current_step = db.Column(db.Integer, default=1)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'age': self.age,
            'onboardingData': self.onboarding_data,
            'currentStep': self.current_step,
            'created_at': self.created_at.isoformat() + 'Z' if self.created_at else None
        }

class AdminConfig(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    config_name = db.Column(db.String(80), unique=True, nullable=False, default='default')
    page1_components = db.Column(JSONEncodedDict, default=[])
    page2_components = db.Column(JSONEncodedDict, default=[])
    page3_components = db.Column(JSONEncodedDict, default=[])

    def to_dict(self):
        return {
            'page1': self.page1_components,
            'page2': self.page2_components,
            'page3': self.page3_components,
        }
