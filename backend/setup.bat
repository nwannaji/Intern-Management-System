@echo off
echo Setting up Intern Management System Backend...

REM Create virtual environment
echo Creating virtual environment...
python -m venv venv

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate

REM Install dependencies
echo Installing dependencies...
pip install -r requirements.txt

REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating .env file...
    copy .env.example .env
    echo Please update the .env file with your database and email configuration.
)

REM Run migrations
echo Running database migrations...
python manage.py makemigrations
python manage.py migrate

REM Create initial data
echo Creating initial data...
python manage.py create_initial_data

REM Create superuser (optional)
echo Creating superuser (optional)...
python manage.py createsuperuser

echo Setup complete!
echo To start the development server, run:
echo call venv\Scripts\activate
echo python manage.py runserver

pause
