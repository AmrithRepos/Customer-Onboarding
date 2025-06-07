import os
from dotenv import load_dotenv

# Load environment variables from .env file, if present
load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'your_super_secret_key_here_please_change_this_in_prod')

    SQLALCHEMY_DATABASE_URI = os.environ.get(
        'DATABASE_URL',
        'postgresql://onboarding:onboarding1234@localhost:5432/onboarding_db'  # fallback local
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CORS_HEADERS = 'Content-Type'
