# check-env.ps1 -- ssjmuk3d environment check
# Usage: powershell -ExecutionPolicy Bypass -File C:\SOD\tools\check-env.ps1

$ok   = 0
$warn = 0
$fail = 0

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  ssjmuk3d -- Environment Check" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Docker Engine
$dockerVer = (docker --version 2>&1) -join ""
if ($LASTEXITCODE -eq 0) {
    $ver = $dockerVer -replace "WARNING.*denied\.", "" -replace "^\s+",""
    Write-Host "  [OK]  Docker Engine   : $ver" -ForegroundColor Green
    $ok++
} else {
    Write-Host "  [!!]  Docker Engine   : not found -- install Docker Desktop" -ForegroundColor Red
    $fail++
}

# 2. Docker Compose
$composeVer = (docker compose version 2>&1) -join ""
if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK]  Docker Compose  : $composeVer" -ForegroundColor Green
    $ok++
} else {
    Write-Host "  [!!]  Docker Compose  : not found -- open Docker Desktop then retry" -ForegroundColor Red
    $fail++
}

# 3. Docker Daemon running?
$null = docker info 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK]  Docker Daemon   : running" -ForegroundColor Green
    $ok++
} else {
    Write-Host "  [!]   Docker Daemon   : not running -- open Docker Desktop first" -ForegroundColor Yellow
    $warn++
}

# 4. Node.js
$nodeVer = (node --version 2>&1) -join ""
if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK]  Node.js         : $nodeVer" -ForegroundColor Green
    $ok++
} else {
    Write-Host "  [!!]  Node.js         : not found -- download from https://nodejs.org/" -ForegroundColor Red
    $fail++
}

# 5. npm
$npmVer = (npm --version 2>&1) -join ""
if ($LASTEXITCODE -eq 0) {
    Write-Host "  [OK]  npm             : v$npmVer" -ForegroundColor Green
    $ok++
} else {
    Write-Host "  [!]   npm             : blocked (ExecutionPolicy)" -ForegroundColor Yellow
    Write-Host "         Fix: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser" -ForegroundColor DarkYellow
    $warn++
}

# 6. .env file
$envFile = "C:\SOD\.env"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
    if ($envContent -match "change-me") {
        Write-Host "  [!]   .env            : exists but still has default passwords -- please change DB_PASS and MYSQL_ROOT_PASSWORD" -ForegroundColor Yellow
        $warn++
    } else {
        Write-Host "  [OK]  .env            : exists and configured" -ForegroundColor Green
        $ok++
    }
} else {
    Write-Host "  [!]   .env            : missing -- run: Copy-Item C:\SOD\.env.example C:\SOD\.env" -ForegroundColor Yellow
    $warn++
}

# 7. node_modules
if (Test-Path "C:\SOD\node_modules") {
    Write-Host "  [OK]  node_modules    : installed" -ForegroundColor Green
    $ok++
} else {
    Write-Host "  [!]   node_modules    : missing -- run: cd C:\SOD; npm ci" -ForegroundColor Yellow
    $warn++
}

# 8. public/vendor (built assets)
if (Test-Path "C:\SOD\public\vendor\app.css") {
    Write-Host "  [OK]  public/vendor   : built" -ForegroundColor Green
    $ok++
} else {
    Write-Host "  [!]   public/vendor   : not built -- run: cd C:\SOD; npm run build" -ForegroundColor Yellow
    $warn++
}

# 9. Docker containers
$psOut = (docker compose -f "C:\SOD\docker-compose.yml" ps --format json 2>&1) -join ""
if ($LASTEXITCODE -eq 0 -and $psOut -ne "") {
    try {
        $containers = $psOut | ConvertFrom-Json -ErrorAction Stop
        if ($containers -is [array]) { $count = $containers.Count } else { $count = 1 }
        $runningCount = @($containers | Where-Object { $_.State -eq "running" }).Count
        if ($runningCount -gt 0) {
            Write-Host "  [OK]  Containers      : $runningCount running" -ForegroundColor Green
            $ok++
            # Show URL
            Write-Host ""
            Write-Host "  --> App: http://localhost:8090   Admin: http://localhost:8090/admin/" -ForegroundColor Green
        } else {
            Write-Host "  [!]   Containers      : stopped -- run: cd C:\SOD; docker compose up -d --build" -ForegroundColor Yellow
            $warn++
        }
    } catch {
        Write-Host "  [!]   Containers      : could not parse status" -ForegroundColor Yellow
        $warn++
    }
} else {
    Write-Host "  [!]   Containers      : not running -- run: cd C:\SOD; docker compose up -d --build" -ForegroundColor Yellow
    $warn++
}

# Summary
Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ("  Result:  OK={0}  Warn={1}  Fail={2}" -f $ok, $warn, $fail) -ForegroundColor Cyan

if ($fail -gt 0) {
    Write-Host "  [X] Missing required tools -- fix [!!] items then re-run" -ForegroundColor Red
} elseif ($warn -gt 0) {
    Write-Host "  [~] Almost ready -- follow the [!] hints then re-run" -ForegroundColor Yellow
} else {
    Write-Host "  [v] All good! Open http://localhost:8090" -ForegroundColor Green
}
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
