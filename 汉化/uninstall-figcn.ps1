param([int]$Port = 8080)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
& (Join-Path $root 'stop-figcn.ps1') -Port $Port
Write-Output 'FigCN stopped. No trusted root certificate was installed.'
