@echo off
cd /d "%~dp0"
where node >nul 2>nul || (echo Install Node.js 22 or newer first. & pause & exit /b 1)
if not exist .env.local copy .env.example .env.local
if not exist node_modules call npm ci
call npm run dev
pause
