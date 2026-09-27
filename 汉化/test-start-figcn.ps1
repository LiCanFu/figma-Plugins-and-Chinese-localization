$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$startScript = Join-Path $root 'start-figcn.ps1'
$shortcutPath = Join-Path ([Environment]::GetFolderPath('Desktop')) 'Figma 中文版.lnk'
$shell = New-Object -ComObject WScript.Shell
$launcher = $shell.CreateShortcut($shortcutPath).TargetPath
$before = @(Get-Process Figma -ErrorAction Stop).Id

$process = Start-Process -FilePath $launcher -ArgumentList @(
    '-NoProfile',
    '-ExecutionPolicy', 'Bypass',
    '-File', $startScript
) -Wait -PassThru

if ($process.ExitCode -ne 0) {
    throw "Repeated launch exited with code $($process.ExitCode)."
}

$after = @(Get-Process Figma -ErrorAction Stop).Id
if (-not ($before | Where-Object { $_ -in $after })) {
    throw 'Repeated launch replaced or stopped the running Figma instance.'
}

Write-Output 'PASS: repeated launch keeps the running Figma instance.'
