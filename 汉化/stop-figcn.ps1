param([int]$Port = 8080)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$expectedEntry = (Resolve-Path -LiteralPath (Join-Path $root 'venv\Scripts\mitmdump.exe')).Path
$listeners = Get-NetTCPConnection -LocalAddress '127.0.0.1' -LocalPort $Port -State Listen -ErrorAction SilentlyContinue

foreach ($listener in $listeners) {
    $process = Get-CimInstance Win32_Process -Filter "ProcessId = $($listener.OwningProcess)"
    if (-not $process -or $process.CommandLine -notlike "*$expectedEntry*") {
        throw "Port $Port belongs to another process: $($process.CommandLine)"
    }
    Stop-Process -Id $process.ProcessId
}

Write-Output 'FigCN proxy stopped. No trusted root certificate was installed.'
