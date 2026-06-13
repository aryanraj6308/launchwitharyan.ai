$frontendDir = "G:\launchwitharyan\frontend"
$backendDir = "G:\launchwitharyan\backend"

# Clean dist
if (Test-Path "$frontendDir\dist") { Remove-Item -Recurse -Force "$frontendDir\dist" }

# Start Astro
$astroJob = Start-Job -ScriptBlock { param($d) cd $d; npm run dev 2>&1 | Out-File "$d\astro2-output.txt" } -ArgumentList $frontendDir

# Start FastAPI
$fastapiJob = Start-Job -ScriptBlock { param($d) cd $d; python -m uvicorn app.main:app --reload --port 8000 2>&1 | Out-File "$d\fastapi2-output.txt" } -ArgumentList $backendDir

Start-Sleep 20

Write-Host ">>> Testing Astro frontend..."
try {
  $r = Invoke-WebRequest -Uri 'http://localhost:4321/' -TimeoutSec 15 -UseBasicParsing
  Write-Host "Frontend: $($r.StatusCode) OK"
} catch {
  Write-Host "Frontend: FAIL - $($_.Exception.Message)"
}

Write-Host ">>> Testing FastAPI backend health..."
try {
  $r = Invoke-WebRequest -Uri 'http://localhost:8000/api/health' -TimeoutSec 10 -UseBasicParsing
  $json = $r.Content | ConvertFrom-Json
  Write-Host "Backend: $($r.StatusCode) OK"
  Write-Host "Response: $($json | ConvertTo-Json)"
} catch {
  Write-Host "Backend: FAIL - $($_.Exception.Message)"
}

Write-Host ">>> Astro log tail:"
if (Test-Path "$frontendDir\astro2-output.txt") {
  Get-Content "$frontendDir\astro2-output.txt" | Select-String "ready|Error|error|200|500" -SimpleMatch
}

Write-Host ">>> FastAPI log tail:"
if (Test-Path "$backendDir\fastapi2-output.txt") {
  Get-Content "$backendDir\fastapi2-output.txt" | Select-String "Uvicorn|Application|Error|error" -SimpleMatch
}

Stop-Job $astroJob -ErrorAction SilentlyContinue
Remove-Job $astroJob -Force -ErrorAction SilentlyContinue
Stop-Job $fastapiJob -ErrorAction SilentlyContinue
Remove-Job $fastapiJob -Force -ErrorAction SilentlyContinue
