@echo off
echo Starting Intern Management System Development Servers...
echo.

echo Starting Backend Server...
start "Backend" cmd /k "cd backend && venv\Scripts\activate && python manage.py runserver"

echo Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start "Frontend" cmd /k "npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit...
pause >nul
