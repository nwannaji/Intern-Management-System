#!/bin/bash

echo "Starting Intern Management System Development Servers..."
echo ""

echo "Starting Backend Server..."
cd backend && source venv/bin/activate && python manage.py runserver &
BACKEND_PID=$!

echo "Waiting for backend to start..."
sleep 3

echo "Starting Frontend Server..."
cd .. && npm run dev &
FRONTEND_PID=$!

echo ""
echo "Both servers are starting..."
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for interrupt
wait
