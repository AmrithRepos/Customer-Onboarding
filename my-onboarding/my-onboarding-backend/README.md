# Backend Application: Flask Onboarding API

---

---

## 1. Overview

This is the Flask backend API for the **Dynamic Onboarding Wizard**. It acts as the central data and logic hub, providing **RESTful endpoints** for:

* **User registration** and management.
* **Storing and retrieving user onboarding data** as users progress.
* **Managing dynamic page configurations** that dictate which input fields appear on the frontend's onboarding steps.
* **Providing administrative functionalities** like viewing and deleting user records.

It interacts with a **PostgreSQL database** for all persistent data storage, ensuring data integrity and scalability.

---

## 2. Key Features

* **RESTful API**: Offers a clear and consistent interface for communication with the frontend.
* **User Authentication (Basic)**: Handles user registration with secure password hashing using Werkzeug.
* **Dynamic Configuration Management**: Stores and serves a flexible configuration, allowing administrators to define the structure and content of specific onboarding pages without code changes.
* **User Data Persistence**: Securely saves user-submitted data and tracks their progress through the onboarding flow.
* **Admin Tools**: Provides dedicated API endpoints for listing and managing user accounts, facilitating administrative oversight.
* **Database Integration**: Leverages Flask-SQLAlchemy for efficient and robust interaction with the PostgreSQL database.
* **CORS Enabled**: Configured to allow cross-origin requests from your frontend application, ensuring seamless integration.

---

## 3. Technology Stack

* **Python 3.8+**: The core programming language for the backend.
* **Flask**: A lightweight and extensible micro-framework used to build the web API.
* **Flask-SQLAlchemy**: An Object Relational Mapper (ORM) that simplifies database interactions with PostgreSQL.
* **Flask-CORS**: A Flask extension that handles Cross-Origin Resource Sharing, preventing browser security issues during frontend-backend communication.
* **Psycopg2-binary**: The PostgreSQL adapter that enables Python to connect to and interact with PostgreSQL databases.
* **Werkzeug Security**: Utilized for securely hashing user passwords (using PBKDF2) before storing them, enhancing security.
* **`python-dotenv`**: A library for loading environment variables from a `.env` file, keeping sensitive data out of source control.
* **PostgreSQL**: The robust and open-source relational database management system used for persistent data storage.

---

## 4. Backend Files:

* **app.py**: This is the main Flask application file. Its purpose is to set up the Flask app, define all the API routes (endpoints), and implement the core business logic for handling requests and interacting with the database.
* **models.py**: The purpose of this file is to define the SQLAlchemy ORM models, which serve as Python representations of database tables
* **config.py**:This file's purpose is to centralize all the configuration settings for the Flask application.
* **.env**:The This file's purpose is to securely store and manage sensitive connection credentials and configurations for the AWS RDS endpoint, username, and password)


----

