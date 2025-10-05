# PowerShell script to start Readdy Agent
Write-Host "Starting Readdy Agent Setup..." -ForegroundColor Green
Write-Host ""

# Check if n8n is installed
Write-Host "1. Checking n8n installation..." -ForegroundColor Yellow
try {
    $null = Get-Command n8n -ErrorAction Stop
    Write-Host "n8n is already installed." -ForegroundColor Green
} catch {
    Write-Host "n8n not found. Installing n8n globally..." -ForegroundColor Yellow
    npm install -g n8n --force
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to install n8n. Please check Node.js installation." -ForegroundColor Red
        Read-Host "Press Enter to exit"
        exit 1
    }
    Write-Host "n8n installed successfully." -ForegroundColor Green
}

Write-Host ""
Write-Host "2. Starting BusNotify Backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; python main_mongodb.py"

Write-Host ""
Write-Host "3. Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "4. Starting n8n..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; n8n start"

Write-Host ""
Write-Host "5. Waiting for n8n to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "6. Frontend is already running on port 3002..." -ForegroundColor Yellow
Write-Host "If not running, start with: npm run dev" -ForegroundColor Cyan

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "🤖 Readdy Agent Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Services started:" -ForegroundColor White
Write-Host "- Backend: http://localhost:8000" -ForegroundColor Cyan
Write-Host "- n8n: http://localhost:5678" -ForegroundColor Cyan  
Write-Host "- Frontend: http://localhost:3002" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "1. Open n8n at http://localhost:5678" -ForegroundColor Cyan
Write-Host "2. Import the workflow from n8n-chatbot-workflow.json" -ForegroundColor Cyan
Write-Host "3. Configure your API keys (OpenAI, ElevenLabs)" -ForegroundColor Cyan
Write-Host "4. Activate the workflow" -ForegroundColor Cyan
Write-Host "5. Test Readdy at http://localhost:3002" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to open the services..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Open services in browser
Start-Process "http://localhost:5678"
Start-Sleep -Seconds 3
Start-Process "http://localhost:3002"

Write-Host ""
Write-Host "All services are running! Check the individual PowerShell windows for logs." -ForegroundColor Green
Write-Host "To stop all services, close the PowerShell windows or press Ctrl+C in each terminal." -ForegroundColor Yellow
Read-Host "Press Enter to exit this script"