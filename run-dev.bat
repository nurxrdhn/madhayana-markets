@echo off
cd /d %~dp0
echo Installing dependencies...
npm install
echo Starting Madhayana Market v5...
npm run dev
pause
