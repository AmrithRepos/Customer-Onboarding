# flask_backend/app.py
import os
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import uuid # For generating unique user IDs
import json # For handling JSON data for SQLAlchemy JSON type
from datetime import datetime # Import datetime here for updated_at fields if needed (though SQLAlchemy handles 'onupdate')
import traceback # Import traceback for detailed error logging

# Initialize SQLAlchemy globally, but without directly passing the app yet.
# This allows models.py to import 'db' directly without circular dependencies.
db = SQLAlchemy()

# --- Application Factory Function ---
def create_app():
    app = Flask(__name__)

    # Load configuration from config.py
    app.config.from_object('config.Config')

    # Initialize SQLAlchemy with the Flask app here, inside the factory.
    db.init_app(app)

    # Initialize Flask-CORS
    CORS(app) # This enables CORS for all routes and all origins, useful for development

    # Import models *after* `db` has been initialized with the app.
    # This is crucial for models to correctly link to the 'db' instance.
    from models import User, AdminConfig

    # --- Flask CLI Command for Database Initialization / Setup ---
    @app.cli.command('init-db')
    def init_db_command():
        """Clear existing data and create new tables, then seed default admin config."""
        print("Initializing the database...")
        with app.app_context(): # Ensure we are in application context for DB operations
            try:
                print("Attempting to drop all tables (if they exist)...")
                db.drop_all() # Optional: Drops all existing tables. Use with caution in production!
                print("Tables dropped.")
                print("Attempting to create all tables...")
                db.create_all() # Create all tables defined in models.py
                print("Tables created.")

                # --- DEBUGGING: Verify table accessibility ---
                try:
                    _ = AdminConfig.query.limit(0).all()
                    print("AdminConfig table appears accessible after creation.")
                except Exception as test_e:
                    print(f"WARNING: AdminConfig table access test failed after creation: {test_e}")
                    print("This might indicate the table was not properly created or accessible.")
                # --- END DEBUGGING ---

                # Seed default AdminConfig if it doesn't exist (or after drop_all)
                default_config_entry = AdminConfig.query.filter_by(config_name='default').first()
                if not default_config_entry:
                    print("Seeding default admin config...")
                    default_config = AdminConfig(
                        config_name='default',
                        page1_components=['email', 'age'],
                        page2_components=['aboutMe', 'address'],
                        page3_components=['birthdate']
                    )
                    db.session.add(default_config)
                    db.session.commit()
                    print("Default admin config seeded.")
                else:
                    print("Default admin config already exists (or re-seeded).")
                print("Database initialized successfully.")
            except Exception as e:
                db.session.rollback()
                print(f"ERROR: Database initialization failed during init-db command: {e}")
                traceback.print_exc() # Print full traceback for debugging
                print("Please check for file permissions or conflicts with the database file.")

    # --- API Endpoints: MOVED INSIDE create_app() FUNCTION ---
    @app.route('/')
    def home():
        """Simple health check endpoint."""
        return jsonify({"message": "Flask Onboarding Backend is running!"}), 200

    @app.route('/register', methods=['POST'])
    def register_user():
        """Registers a new user and returns their ID and initial data."""
        data = request.get_json()
        username = data.get('username') # ADDED: Get username from request data
        email = data.get('email')
        password = data.get('password')
        age = data.get('age')

        if not all([username, email, password, age]): # MODIFIED: Add username to required fields check
            return jsonify({"error": "Username, email, password, and age are required."}), 400

        try:
            age = int(age)
            if age < 1:
                return jsonify({"error": "Invalid age provided."}), 400
            if age < 18:
                return jsonify({"error": "Cannot Onboard You, Please have an adult to register your details."}), 403
        except ValueError:
            return jsonify({"error": "Age must be a valid number."}), 400

        if User.query.filter_by(email=email).first():
            return jsonify({"error": "User with this email already exists."}), 409
        
        if User.query.filter_by(username=username).first(): # ADDED: Check for existing username
            return jsonify({"error": "User with this username already exists."}), 409

        hashed_password = generate_password_hash(password)
        user_id = f"backend-user-{str(uuid.uuid4())[:8]}"
        initial_onboarding_data = {'email': email, 'age': age} # Consider adding username here if needed in onboardingData, but it's now a top-level field

        new_user = User(
            id=user_id,
            username=username, # ADDED: Pass username to the User constructor
            email=email,
            password_hash=hashed_password,
            age=age,
            onboarding_data=initial_onboarding_data,
            current_step=1
        )

        try:
            db.session.add(new_user)
            db.session.commit()
            return jsonify({
                "message": "User registered successfully.",
                "userId": new_user.id,
                "onboardingData": new_user.onboarding_data,
                "currentStep": new_user.current_step,
                "username": new_user.username # ADDED: Return username in registration response
            }), 201
        except Exception as e:
            db.session.rollback()
            print(f"Error during registration: {e}")
            traceback.print_exc()
            return jsonify({"error": "Internal server error during registration."}), 500

    @app.route('/user/<string:user_id>/progress', methods=['GET'])
    def get_user_progress(user_id):
        """Fetches a user's current onboarding progress and data."""
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found."}), 404
        return jsonify(user.to_dict()), 200

    @app.route('/user/<string:user_id>/update_data', methods=['PUT'])
    def update_user_data(user_id):
        """Updates a user's onboarding data and current step."""
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found."}), 404

        data = request.get_json()
        new_onboarding_data = data.get('onboardingData')
        new_current_step = data.get('currentStep')

        if new_onboarding_data is not None:
            current_data = user.onboarding_data
            if isinstance(current_data, str):
                try:
                    current_data = json.loads(current_data)
                except json.JSONDecodeError:
                    current_data = {}
            user.onboarding_data = {**current_data, **new_onboarding_data}
        
        # Consider if you want to allow updating username here as well
        # username = data.get('username')
        # if username is not None:
        #     user.username = username

        if new_current_step is not None:
            user.current_step = max(user.current_step, new_current_step)

        try:
            db.session.commit()
            return jsonify(user.to_dict()), 200
        except Exception as e:
            db.session.rollback()
            print(f"Error during user data update: {e}")
            traceback.print_exc()
            return jsonify({"error": "Internal server error during update."}), 500

    @app.route('/user/<string:user_id>/complete', methods=['POST'])
    def complete_onboarding(user_id):
        """Marks a user's onboarding as complete."""
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found."}), 404

        user.current_step = 4

        try:
            db.session.commit()
            return jsonify({"message": "Onboarding completed successfully!"}), 200
        except Exception as e:
            db.session.rollback()
            print(f"Error completing onboarding for user {user_id}: {e}")
            traceback.print_exc()
            return jsonify({"error": "Internal server error during completion."}), 500

    @app.route('/admin/config', methods=['GET', 'PUT'])
    def admin_config_endpoint():
        """Retrieves or updates the global admin configuration for dynamic pages.
        Resets all users' onboarding progress to step 1 after a successful update."""
        config_entry = AdminConfig.query.filter_by(config_name='default').first()

        if not config_entry:
            return jsonify({"error": "Admin configuration not found. Please initialize the database using 'flask init-db'."}), 500

        if request.method == 'GET':
            return jsonify(config_entry.to_dict()), 200

        elif request.method == 'PUT':
            data = request.get_json()

            page1_components_from_request = data.get('page1')
            page2_components_from_request = data.get('page2')
            page3_components_from_request = data.get('page3')

            if page1_components_from_request is not None:
                config_entry.page1_components = page1_components_from_request
            if page2_components_from_request is not None:
                config_entry.page2_components = page2_components_from_request
            if page3_components_from_request is not None:
                config_entry.page3_components = page3_components_from_request

            try:
                db.session.commit()
                print("Admin configuration updated successfully.")

                all_users = User.query.all()
                for user in all_users:
                    user.current_step = 1
                db.session.commit()
                print("All users' onboarding progress reset to step 1.")

                return jsonify(config_entry.to_dict()), 200
            except Exception as e:
                db.session.rollback()
                print(f"Error updating admin config or resetting user progress: {e}")
                traceback.print_exc()
                return jsonify({"error": "Internal server error updating admin config or resetting user progress."}), 500

    @app.route('/admin/users', methods=['GET'])
    def get_all_users():
        """Retrieves a list of all registered users."""
        users = User.query.all()
        return jsonify([user.to_dict() for user in users]), 200

    @app.route('/admin/users/<string:user_id>', methods=['DELETE'])
    def delete_user(user_id):
        """Deletes a user by their ID."""
        user = User.query.get(user_id)
        if not user:
            return jsonify({"message": "User not found."}), 404

        try:
            db.session.delete(user)
            db.session.commit()
            return jsonify({"message": f"User {user_id} deleted successfully."}), 200
        except Exception as e:
            db.session.rollback()
            print(f"Error deleting user {user_id}: {e}")
            traceback.print_exc()
            return jsonify({"error": "Internal server error deleting user."}), 500

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5001)