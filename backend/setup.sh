#!/bin/bash

echo "Setting up Intern Management System Backend..."

# Create virtual environment
echo "Creating virtual environment..."
python -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/Scripts/activate  # For Windows
# source venv/bin/activate  # For Linux/Mac

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "Please update the .env file with your database and email configuration."
fi

# Run migrations
echo "Running database migrations..."
python manage.py makemigrations
python manage.py migrate

# Create initial data
echo "Creating initial data..."
python manage.py create_initial_data

# Create superuser (optional)
echo "Creating superuser (optional)..."
python manage.py createsuperuser

echo "Setup complete!"
echo "To start the development server, run:"
echo "source venv/Scripts/activate  # For Windows"
echo "python manage.py runserver"
