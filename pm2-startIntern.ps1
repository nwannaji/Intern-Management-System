<#
.SYNOPSIS
    Starts the Intern Management System using PM2 process manager.
.DESCRIPTION
    This script launches both the Django backend and Vite frontend
    as PM2 managed processes. PM2 handles auto-restart, logging, and
    monitoring out of the box.
.USAGE
    .\pm2-startIntern.ps1              # Start both servers
    .\pm2-startIntern.ps1 -Stop        # Stop both servers
    .\pm2-startIntern.ps1 -Restart     # Restart both servers
    .\pm2-startIntern.ps1 -Status      # Show process status
    .\pm2-startIntern.ps1 -Logs        # Tail combined logs
    .\pm2-startIntern.ps1 -Clean       # Stop & delete PM2 processes
#>

param(
    [switch]$Stop,
    [switch]$Restart,
    [switch]$Status,
    [switch]$Logs,
    [switch]$Clean
)

$ErrorActionPreference = 'Stop'
$ProjectRoot = $PSScriptRoot

# ── Check PM2 availability ──────────────────────────────────────────────
if (-not (Get-Command pm2 -ErrorAction SilentlyContinue)) {
    Write-Host "PM2 is not installed." -ForegroundColor Red
    Write-Host "Install it with:  npm install -g pm2" -ForegroundColor Yellow
    exit 1
}

# ── Helper: activate the Python virtual environment ─────────────────────
function Activate-Venv {
    $venvActivate = Join-Path $ProjectRoot 'backend\venv\Scripts\Activate.ps1'
    if (Test-Path $venvActivate) {
        . $venvActivate
        Write-Host "  Python venv activated." -ForegroundColor DarkGray
    } else {
        Write-Host "  WARNING: Virtual environment not found at $venvActivate" -ForegroundColor Yellow
        Write-Host "  Run backend\setup.bat first or create a venv manually." -ForegroundColor Yellow
    }
}

# ── Actions ──────────────────────────────────────────────────────────────

if ($Clean) {
    Write-Host "Stopping and deleting PM2 processes..." -ForegroundColor Yellow
    pm2 delete ecosystem.config.cjs 2>$null
    pm2 save --force 2>$null
    Write-Host "Cleaned up." -ForegroundColor Green
    exit 0
}

if ($Stop) {
    Write-Host "Stopping Intern Management System..." -ForegroundColor Yellow
    pm2 stop ecosystem.config.cjs 2>$null
    Write-Host "Stopped." -ForegroundColor Green
    exit 0
}

if ($Restart) {
    Write-Host "Restarting Intern Management System..." -ForegroundColor Yellow
    pm2 restart ecosystem.config.cjs
    exit 0
}

if ($Status) {
    pm2 list
    exit 0
}

if ($Logs) {
    pm2 logs
    exit 0
}

# ── Default: Start both services ─────────────────────────────────────────
Write-Host ""
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  Intern Management System - PM2 Launcher" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Activate venv so the python path resolves correctly for PM2
Activate-Venv

# Start PM2 with the ecosystem file
Write-Host "Starting backend & frontend via PM2..." -ForegroundColor Green
pm2 start ecosystem.config.cjs

# Save the process list so pm2 resurrects them after a reboot
pm2 save

Write-Host ""
Write-Host "---------------------------------------------" -ForegroundColor DarkGray
Write-Host "  Backend:  http://localhost:8000" -ForegroundColor White
Write-Host "  Frontend: http://localhost:5174" -ForegroundColor White
Write-Host "---------------------------------------------" -ForegroundColor DarkGray
Write-Host ""
Write-Host "Useful commands:" -ForegroundColor Cyan
Write-Host "  .\pm2-startIntern.ps1 -Status   Show process status" -ForegroundColor White
Write-Host "  .\pm2-startIntern.ps1 -Logs     Tail live logs" -ForegroundColor White
Write-Host "  .\pm2-startIntern.ps1 -Restart  Restart both" -ForegroundColor White
Write-Host "  .\pm2-startIntern.ps1 -Stop     Stop both" -ForegroundColor White
Write-Host "  .\pm2-startIntern.ps1 -Clean    Remove from PM2" -ForegroundColor White
Write-Host ""