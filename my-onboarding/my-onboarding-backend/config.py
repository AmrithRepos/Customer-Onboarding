import os
from dotenv import load_dotenv

# Load environment variables from .env file, if present.
# This makes environment variables defined in .env accessible via os.environ.
load_dotenv()

class Config:
    """
    Configuration class for the Flask application.

    This class defines various configuration parameters for the Flask app,
    such as secret keys, database URI, and SQLAlchemy settings.
    It prioritizes environment variables for production readiness but
    provides sensible fallbacks for local development.
    """

    # Secret key for session management and other security-related functions.
    # It's crucial to change this in production and keep it secure.
    SECRET_KEY = os.environ.get('SECRET_KEY', 'your_super_secret_key_here_please_change_this_in_prod')

    # SQLAlchemy Database URI.
    # It first attempts to get the DATABASE_URL from environment variables (e.g., for production).
    # If not found, it falls back to a local PostgreSQL connection string.
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        'postgresql://onboarding:onboarding1234@localhost:5432/onboarding_db'  # Fallback for local development.
    )

    # Disables SQLAlchemy event system tracking, which consumes extra memory.
    # It's recommended to set this to False unless you specifically need it.
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Defines the CORS headers that will be allowed.
    # In this case, it explicitly allows 'Content-Type' header.
    CORS_HEADERS = 'Content-Type'