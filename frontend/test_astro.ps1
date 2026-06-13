$dir = "G:\launchwitharyan\frontend"
$job = Start-Job -ScriptBlock {
  param($d)
  cd $d
  npm run dev 2>&1 | Out-File "$d\astro-output.txt"
} -ArgumentList $dir

Start-Sleep 12

try {
  $r = Invoke-WebRequest -Uri 'http://localhost:4321' -TimeoutSec 10 -UseBasicParsing
  Write-Host "Status: $($r.StatusCode)"
  if ($r.Content.Length -gt 0) {
    $content = $r.Content.Substring(0, [Math]::Min(1000, $r.Content.Length))
    Write-Host $content
  }
} catch {
  Write-Host "Error: $($_.Exception.Message)"
  try {
    if ($_.Exception.Response) {
      $sr = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
      $body = $sr.ReadToEnd()
      Write-Host "Body: $body"
      $sr.Close()
    }
  } catch { }
}

Stop-Job $job
Remove-Job $job -Force
