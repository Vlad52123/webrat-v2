param(
  [string]$HostName = $env:VPS_HOST,
  [string]$User = $(if ($env:VPS_USER) { $env:VPS_USER } else { "deploy" }),
  [string]$CommitMessage = $(if ($env:DEPLOY_COMMIT_MESSAGE) { $env:DEPLOY_COMMIT_MESSAGE } else { "upd" })
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($HostName)) {
  throw "Set VPS_HOST env var or pass -HostName"
}

git add .

try {
  git diff --cached --quiet
  $hasChanges = $false
} catch {
  $hasChanges = $true
}

if ($hasChanges) {
  git commit -m $CommitMessage
}

git push

$remote = "$User@$HostName"

$scriptPath = Join-Path $PSScriptRoot "deploy-remote.sh"
if (-not (Test-Path -LiteralPath $scriptPath)) {
  throw "Missing deploy-remote.sh рядом с deploy.ps1"
}

$sshArgs = @($remote, "bash -s")

$scriptRaw = Get-Content -LiteralPath $scriptPath -Raw
# Ensure LF line endings; CRLF may break bash/systemctl args on the remote.
$scriptLf = $scriptRaw -replace "`r`n", "`n"
$scriptLf | ssh @sshArgs