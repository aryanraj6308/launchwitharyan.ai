$frontendDir = "G:\launchwitharyan\frontend"
$backendDir = "G:\launchwitharyan\backend"

Write-Host "=== Starting Astro dev server ==="
$astroJob = Start-Job -ScriptBlock {
  param($d)
  cd $d
  npm run dev 2>&1 | Out-File "$d\astro-output.txt"
} -ArgumentList $frontendDir

Write-Host "=== Starting FastAPI backend ==="
$fastapiJob = Start-Job -ScriptBlock {
  param($d)
  cd $d
  python -m uvicorn app.main:app --reload --port 8000 2>&1 | Out-File "$d\fastapi-output.txt"
} -ArgumentList $backendDir

Write-Host "=== Waiting 15 seconds for both servers to start ==="
Start-Sleep 15

Write-Host "=== Testing Frontend (http://localhost:4321) ==="
try {
  $r = Invoke-WebRequest -Uri 'http://localhost:4321' -TimeoutSec 10 -UseBasicParsing
  Write-Host "Frontend Status: $($r.StatusCode) - OK"
} catch {
  Write-Host "Frontend Error: $($_.Exception.Message)"
}

Write-Host "=== Testing Backend /api/health (http://localhost:8000/api/health) ==="
try {
  $r = Invoke-WebRequest -Uri 'http://localhost:8000/api/health' -TimeoutSec 10 -UseBasicParsing
  Write-Host "Backend Status: $($r.StatusCode) - OK"
  $content = $r.Content | ConvertFrom-Json
  Write-Host "Backend Response: $($content | ConvertTo-Json)"
} catch {
  Write-Host "Backend Error: $($_.Exception.Message)"
}

Write-Host "=== Checking Astro output ==="
if (Test-Path "$frontendDir\astro-output.txt") {
  Get-Content "$frontendDir\astro-output.txt" | Select-Object -Last 5
}

Write-Host "=== Checking FastAPI output ==="
if (Test-Path "$backendDir\fastapi-output.txt") {
  Get-Content "$backendDir\fastapi-output.txt" | Select-Object -Last 5
}

Write-Host "=== Cleaning up ==="
Stop-Job $astroJob
Remove-Job $astroJob -Force
Stop-Job $fastapiJob
Remove-Job $fastapiJob -Force

Write-Host "=== DONE ==="
