param([int]$Port = 8080)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$mitmdump = Join-Path $root 'venv\Scripts\mitmdump.exe'
$injector = Join-Path $root 'figcn_injector.py'
$confDir = Join-Path $root 'mitmproxy'
$stdoutLog = Join-Path $root 'mitmdump.stdout.log'
$stderrLog = Join-Path $root 'mitmdump.stderr.log'

if (-not (Test-Path -LiteralPath $mitmdump)) {
    throw "mitmdump is missing: $mitmdump"
}

$listener = Get-NetTCPConnection -LocalAddress '127.0.0.1' -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if (-not $listener) {
    New-Item -ItemType Directory -Path $confDir -Force | Out-Null
    $arguments = @(
        '--listen-host', '127.0.0.1',
        '-p', [string]$Port,
        '--set', "confdir=$confDir",
        '--set', 'keepserving=true',
        '--set', 'termlog_verbosity=info',
        '--set', 'flow_detail=0',
        '--set', 'allow_hosts=^(.+\.)?figma\.com(:443)?$|^kailous\.github\.io(:443)?$',
        '-s', $injector
    )
    $proxy = Start-Process -FilePath $mitmdump -ArgumentList $arguments -WindowStyle Hidden `
        -RedirectStandardOutput $stdoutLog -RedirectStandardError $stderrLog -PassThru

    $deadline = (Get-Date).AddSeconds(20)
    do {
        Start-Sleep -Milliseconds 250
        if ($proxy.HasExited) {
            throw "mitmdump exited early. Check $stderrLog"
        }
        $listener = Get-NetTCPConnection -LocalAddress '127.0.0.1' -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    } until ($listener -or (Get-Date) -ge $deadline)
    if (-not $listener) {
        throw "mitmdump did not listen on 127.0.0.1:$Port"
    }
}

$certPath = Join-Path $confDir 'mitmproxy-ca-cert.cer'
$deadline = (Get-Date).AddSeconds(10)
while (-not (Test-Path -LiteralPath $certPath) -and (Get-Date) -lt $deadline) {
    Start-Sleep -Milliseconds 250
}
if (-not (Test-Path -LiteralPath $certPath)) {
    throw "mitmproxy CA was not generated: $certPath"
}

$cert = [System.Security.Cryptography.X509Certificates.X509Certificate2]::new($certPath)
$rsa = [System.Security.Cryptography.X509Certificates.RSACertificateExtensions]::GetRSAPublicKey($cert)
try {
    $spkiHash = [Convert]::ToBase64String(
        [System.Security.Cryptography.SHA256]::HashData($rsa.ExportSubjectPublicKeyInfo())
    )
} finally {
    $rsa.Dispose()
}

$figmaExe = Get-ChildItem -Path (Join-Path $env:LOCALAPPDATA 'Figma\app-*\Figma.exe') -ErrorAction Stop |
    Sort-Object FullName -Descending |
    Select-Object -First 1 -ExpandProperty FullName

$runningFigma = Get-CimInstance Win32_Process | Where-Object {
    $_.Name -eq 'Figma.exe' -and $_.CommandLine -notmatch '--type='
} | Select-Object -First 1
if ($runningFigma) {
    if ($runningFigma.CommandLine -notlike "*--proxy-server=http://127.0.0.1:$Port*") {
        throw 'Figma is already running without FigCN. Close every Figma window, then try again.'
    }
    Start-Process -FilePath $figmaExe
    Write-Output 'Figma is already running through FigCN.'
    exit 0
}

Start-Process -FilePath $figmaExe -ArgumentList @(
    "--proxy-server=http://127.0.0.1:$Port",
    '--proxy-bypass-list=<-loopback>',
    '--disable-http-cache',
    "--ignore-certificate-errors-spki-list=$spkiHash"
)

Write-Output "FigCN proxy is listening on 127.0.0.1:$Port"
Write-Output "Figma started with the scoped proxy. Log: $stdoutLog"
