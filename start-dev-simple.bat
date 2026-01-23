@echo off
echo Starting both servers...

:: Start backend in background
start /B cmd /c "cd backend && venv\Scripts\activate && python manage.py runserver"

:: Wait a moment
timeout /t 2 /nobreak >nul

:: Start frontend
start /B cmd /c "npm run dev"

echo Servers started!
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo Press Ctrl+C to stop all servers

:: Keep script running
:loop
timeout /t 1 /nobreak >nul
goto loop
