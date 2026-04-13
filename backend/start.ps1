# HackArena Backend Startup Script
# Run this entire script to start everything

param(
    [string]$GitRemote = "hackarena"
)

$ErrorActionPreference = "Continue"
$BackendDir = $PSScriptRoot
$RootDir = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "HackArena Backend Startup" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Step 1: Kill existing processes on port 5000
Write-Host "`n[1/4] Checking port 5000..." -ForegroundColor Yellow
$Process = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($Process) {
    Stop-Process -Id $Process[0].OwningProcess -Force -ErrorAction SilentlyContinue
    Write-Host "  Killed existing process" -ForegroundColor Gray
}

# Step 2: Start backend
Write-Host "[2/4] Starting backend server..." -ForegroundColor Yellow
$BackendJob = Start-Job -ScriptBlock {
    param($dir)
    Set-Location $dir
    node src/index.js
} -ArgumentList $BackendDir

# Wait for backend to start
Start-Sleep -Seconds 3

# Step 3: Start localtunnel
Write-Host "[3/4] Starting localtunnel..." -ForegroundColor Yellow
$TunnelJob = Start-Job -ScriptBlock {
    param($dir)
    Set-Location $dir
    npx localtunnel --port 5000
} -ArgumentList $BackendDir

# Monitor tunnel output for URL
$UrlFound = $false
$Timeout = 30  # seconds
$StartTime = Get-Date

Write-Host "  Waiting for tunnel URL..." -ForegroundColor Gray

while (-not $UrlFound -and ((Get-Date) - $StartTime).TotalSeconds -lt $Timeout) {
    $Output = Receive-Job -Job $TunnelJob -ErrorAction SilentlyContinue
    if ($Output -match "your url is: (https://[^\s]+)") {
        $Url = $Matches[1]
        $UrlFound = $true
        Write-Host "  URL: $Url" -ForegroundColor Green
    }
    Start-Sleep -Seconds 1
}

if ($UrlFound) {
    # Step 4: Update frontend API
    Write-Host "[4/4] Updating frontend..." -ForegroundColor Yellow
    
    $ApiFile = Join-Path $RootDir "frontend\src\utils\api.js"
    $Content = Get-Content $ApiFile -Raw
    $NewContent = $Content -replace "const API_BASE = 'https://[^']+'", "const API_BASE = '$Url'"
    Set-Content -Path $ApiFile -Value $NewContent
    
    # Commit and push
    Set-Location $RootDir
    git add frontend/src/utils/api.js
    git commit -m "Update API URL: $Url"
    git push $GitRemote master
    
    Write-Host "`n==================================================" -ForegroundColor Cyan
    Write-Host "READY!" -ForegroundColor Green
    Write-Host "Frontend will deploy in ~30 seconds" -ForegroundColor Cyan
    Write-Host "==================================================" -ForegroundColor Cyan
} else {
    Write-Host "  Timeout waiting for URL" -ForegroundColor Red
}

Write-Host "`nBackend running. Keep this window open." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop everything." -ForegroundColor Yellow

# Wait for ctrl+c
try {
    while ($true) { Start-Sleep -Seconds 1 }
} finally {
    Write-Host "`nStopping services..." -ForegroundColor Yellow
    Stop-Job -Job $BackendJob -ErrorAction SilentlyContinue
    Stop-Job -Job $TunnelJob -ErrorAction SilentlyContinue
    Remove-Job -Job $BackendJob, $TunnelJob -ErrorAction SilentlyContinue
}