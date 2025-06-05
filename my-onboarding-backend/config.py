# flask_backend/config.py
import os

class Config:
    # Flask Secret Key for session management and security.
    # IMPORTANT: Change this to a strong, random key in production.
    # Replace 'your_super_secret_key_here_please_change_this_in_prod' with a truly random, strong key.
    SECRET_KEY = os.environ.get('SECRET_KEY', 'your_super_secret_key_here_please_change_this_in_prod')

    # SQLAlchemy Database Configuration for PostgreSQL
    # Using the provided username, password, default host (localhost), port (5432), and database name (onboarding_db).
    # Format: postgresql://username:password@host:port/database_name
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        'postgresql://onboarding:onboarding1234@localhost:5432/onboarding_db'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False # Suppresses a warning

    # Flask-CORS configuration
    # This allows your React frontend (running on a different port/origin) to make requests to Flask.
    # In production, you'd typically restrict origins to your frontend's domain.
    CORS_HEADERS = 'Content-Type'