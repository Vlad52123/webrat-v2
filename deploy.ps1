param(
  [string]$HostName = $env:VPS_HOST,
  [string]$User = $(if ($env:VPS_USER) { $env:VPS_USER } else { "deploy" }),
  [string]$CommitMessage = $(if ($env:DEPLOY_COMMIT_MESSAGE) { $env:DEPLOY_COMMIT_MESSAGE } else { "" })
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($HostName)) {
  throw "Set VPS_HOST env var or pass -HostName"
}

git add -A

$hasChanges = $false
git diff --cached --quiet
$hasChanges = ($LASTEXITCODE -ne 0)

if ($hasChanges) {
  if ([string]::IsNullOrWhiteSpace($CommitMessage)) {
    $CommitMessage = "deploy: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
  }
  git commit -m "$CommitMessage"
  git push
} else {
  git push
}

$remote = "$User@$HostName"

$scriptPath = Join-Path $PSScriptRoot "deploy-remote.sh"
if (-not (Test-Path -LiteralPath $scriptPath)) {
  throw "Missing deploy-remote.sh рядом с deploy.ps1"
}

$sshArgs = @($remote, "bash -s")

$scriptRaw = Get-Content -LiteralPath $scriptPath -Raw
$scriptLf = $scriptRaw -replace "`r`n", "`n"

$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = "ssh"
$psi.UseShellExecute = $false
$psi.RedirectStandardInput = $true
$psi.Arguments = "$remote `"bash -s`""

$p = New-Object System.Diagnostics.Process
$p.StartInfo = $psi
[void]$p.Start()

$bytes = [System.Text.Encoding]::UTF8.GetBytes($scriptLf)
$stdinStream = $p.StandardInput.BaseStream
$stdinStream.Write($bytes, 0, $bytes.Length)
$stdinStream.Flush()
$p.StandardInput.Close()

$p.WaitForExit()
if ($p.ExitCode -ne 0) {
  throw "Remote deploy failed (ssh exit code: $($p.ExitCode))"
}
