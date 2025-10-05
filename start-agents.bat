@echo off
echo Starting Readdy Agent Setup...
echo.

echo 1. Checking n8n installation...
where n8n >nul 2>&1
if %errorlevel% neq 0 (
    echo n8n not found. Installing n8n globally...
    npm install -g n8n --force
    if %errorlevel% neq 0 (
        echo Failed to install n8n. Please install Node.js first.
        pause
        exit /b 1
    )
) else (
    echo n8n is already installed.
)

echo.
echo 2. Starting BusNotify Backend...
start "Backend" cmd /k "cd /d %~dp0backend && python main_mongodb.py"

echo.
echo 3. Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo.
echo 4. Starting n8n...
start "n8n" cmd /k "cd /d %~dp0 && n8n start"

echo.
echo 5. Waiting for n8n to start...
timeout /t 10 /nobreak >nul

echo.
echo 6. Frontend is already running on port 3002...
echo If not running, start with: npm run dev

echo.
echo ========================================
echo 🤖 Readdy Agent Setup Complete!
echo ========================================
echo.
echo Services started:
echo - Backend: http://localhost:8000
echo - n8n: http://localhost:5678  
echo - Frontend: http://localhost:3002
echo.
echo Next steps:
echo 1. Open n8n at http://localhost:5678
echo 2. Import the workflow from n8n-chatbot-workflow.json
echo 3. Configure your API keys (OpenAI, ElevenLabs)
echo 4. Activate the workflow
echo 5. Test Readdy at http://localhost:3002
echo.
echo Press any key to open the services...
pause >nul

start http://localhost:5678
timeout /t 3 /nobreak >nul
start http://localhost:3002

echo.
echo All services are running! Check the individual terminal windows for logs.
echo To stop all services, close this window or press Ctrl+C in each terminal.
pause
