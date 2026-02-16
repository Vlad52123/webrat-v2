param(
  [string]$HostName = $env:VPS_HOST,
  [string]$User = $(if ($env:VPS_USER) { $env:VPS_USER } else { "deploy" }),
  [int]$Port = $(if ($env:VPS_PORT) { [int]$env:VPS_PORT } else { 2222 }),
  [string]$IdentityFile = $env:VPS_IDENTITY_FILE,
  [string]$CommitMessage = $(if ($env:DEPLOY_COMMIT_MESSAGE) { $env:DEPLOY_COMMIT_MESSAGE } else { "" })
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($HostName)) {
  throw "Set VPS_HOST env var or pass -HostName"
}

git add -A

git diff --cached --quiet
$hasChanges = ($LASTEXITCODE -ne 0)

if ($hasChanges) {
  if ([string]::IsNullOrWhiteSpace($CommitMessage)) {
    $CommitMessage = "deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
  }
  git commit -m "$CommitMessage"
}

git push

$remote = "$User@$HostName"

$scriptPath = Join-Path $PSScriptRoot "deploy-remote.sh"
if (-not (Test-Path -LiteralPath $scriptPath)) {
  throw "Missing deploy-remote.sh рядом с deploy.ps1"
}

$scriptRaw = Get-Content -LiteralPath $scriptPath -Raw
$scriptLf = $scriptRaw -replace "`r`n", "`n"

$sshArgs = @("-p", "$Port")

if (-not [string]::IsNullOrWhiteSpace($IdentityFile)) {
  $sshArgs += @("-i", $IdentityFile)
}

$sshArgs += @(
  "-o", "BatchMode=yes",
  "-o", "StrictHostKeyChecking=accept-new",
  "-o", "ServerAliveInterval=20",
  "-o", "ServerAliveCountMax=3",
  $remote,
  "bash -s"
)

$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = "ssh"
$psi.UseShellExecute = $false
$psi.RedirectStandardInput = $true
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError = $true
$psi.Arguments = ($sshArgs | ForEach-Object {
  if ($_ -match '\s') { '"' + ($_ -replace '"','\"') + '"' } else { $_ }
}) -join " "

$p = New-Object System.Diagnostics.Process
$p.StartInfo = $psi
[void]$p.Start()

$bytes = [System.Text.Encoding]::UTF8.GetBytes($scriptLf)
$stdinStream = $p.StandardInput.BaseStream
$stdinStream.Write($bytes, 0, $bytes.Length)
$stdinStream.Flush()
$p.StandardInput.Close()

$stdout = $p.StandardOutput.ReadToEnd()
$stderr = $p.StandardError.ReadToEnd()

$p.WaitForExit()

if ($stdout) { Write-Host $stdout }
if ($stderr) { Write-Host $stderr }

if ($p.ExitCode -ne 0) {
  throw "Remote deploy failed (ssh exit code: $($p.ExitCode))"
}
