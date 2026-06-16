Write-Host "Starting Intern Management System Development Servers..." -ForegroundColor Green
Write-Host ""

Write-Host "Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; venv\Scripts\activate; python manage.py runserver 0.0.0.0:8000" -WindowStyle Normal

Write-Host "Waiting for backend to start..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

Write-Host "Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "Both servers are starting..." -ForegroundColor Green
Write-Host "Backend:  http://localhost:8000  (also http://172.16.2.158:8000 on LAN)" -ForegroundColor White
Write-Host "Frontend: http://localhost:5174  (also http://172.16.2.158:5174 on LAN)" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop this script" -ForegroundColor Gray