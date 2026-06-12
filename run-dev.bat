@echo off
cd /d %~dp0
echo Installing dependencies if needed...
npm install
echo Starting Madhayana Markets...
npm run dev
pause
