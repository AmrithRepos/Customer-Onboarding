from app import db
from sqlalchemy.types import TypeDecorator, String
import json
from datetime import datetime
import uuid

class JSONEncodedDict(TypeDecorator):
    """
    A custom SQLAlchemy type for storing Python dictionaries as JSON strings in the database.

    This allows you to store and retrieve dictionary-like data directly from a database column
    that is internally represented as a VARCHAR or TEXT type.
    """
    impl = String  # Specifies that the underlying database type is a string.

    def process_bind_param(self, value, dialect):
        """
        Converts a Python dictionary to a JSON string before storing it in the database.

        :param value: The Python dictionary to be stored.
        :param dialect: The SQLAlchemy dialect in use (e.g., SQLite, PostgreSQL).
        :return: A JSON string representation of the dictionary, or None if the input value is None.
        """
        if value is not None:
            return json.dumps(value)
        return value

    def process_result_value(self, value, dialect):
        """
        Converts a JSON string from the database back into a Python dictionary.

        :param value: The JSON string retrieved from the database.
        :param dialect: The SQLAlchemy dialect in use.
        :return: A Python dictionary, or None if the input value is None.
        """
        if value is not None:
            return json.loads(value)
        return value

class User(db.Model):
    """
    SQLAlchemy model representing a user in the application.

    Each user has a unique ID, username, email, hashed password, age,
    onboarding-specific data, current onboarding step, and creation timestamp.
    """
    id = db.Column(db.String(80), primary_key=True, default=lambda: f"backend-user-{str(uuid.uuid4())[:8]}")
    username = db.Column(db.String(80), unique=False, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    onboarding_data = db.Column(JSONEncodedDict, default={})  # Stores dynamic onboarding data as JSON.
    current_step = db.Column(db.Integer, default=1)  # Tracks the user's current step in the onboarding process.
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False) # Timestamp for user creation.

    def to_dict(self):
        """
        Converts the User object to a dictionary, suitable for JSON serialization.

        :return: A dictionary representation of the user.
        """
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'age': self.age,
            'onboardingData': self.onboarding_data,
            'currentStep': self.current_step,
            'created_at': self.created_at.isoformat() + 'Z' if self.created_at else None # ISO 8601 format with 'Z' for UTC.
        }

class AdminConfig(db.Model):
    """
    SQLAlchemy model for storing global administrative configuration for dynamic onboarding pages.

    This model allows administrators to configure which components appear on specific
    onboarding pages without changing frontend code directly.
    """
    id = db.Column(db.Integer, primary_key=True)
    config_name = db.Column(db.String(80), unique=True, nullable=False, default='default') # A name for the configuration (e.g., 'default').
    page1_components = db.Column(JSONEncodedDict, default=[]) # List of component IDs for page 1.
    page2_components = db.Column(JSONEncodedDict, default=[]) # List of component IDs for page 2.
    page3_components = db.Column(JSONEncodedDict, default=[]) # List of component IDs for page 3.

    def to_dict(self):
        """
        Converts the AdminConfig object to a dictionary, suitable for JSON serialization.

        :return: A dictionary representation of the admin configuration.
        """
        return {
            'page1': self.page1_components,
            'page2': self.page2_components,
            'page3': self.page3_components,
        }