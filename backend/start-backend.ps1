# Start-backend PowerShell helper
# Usage: Open PowerShell in this folder and run: .\start-backend.ps1

# Check for python or py launcher
$pythonCmd = (Get-Command python -ErrorAction SilentlyContinue) -or (Get-Command py -ErrorAction SilentlyContinue)
if (-not $pythonCmd) {
    Write-Host "Python não encontrado no PATH. Instale Python 3.11+ (https://www.python.org/downloads/) e marque 'Add to PATH'." -ForegroundColor Yellow
    Write-Host "Alternativamente, instale via Microsoft Store ou use WSL2." -ForegroundColor Yellow
    exit 1
}

# Resolve python executable path
$pythonExe = $pythonCmd.Path
Write-Host "Usando Python: $pythonExe"

# Create venv
if (-not (Test-Path -Path .\.venv)) {
    & $pythonExe -m venv .venv
}

# Allow running activation script in this process
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force | Out-Null

# Activate venv for the script
. .\.venv\Scripts\Activate.ps1

# Upgrade pip and install requirements
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

# Run DB seed (safe to run repeatedly)
python seed.py

# Start the FastAPI app with uvicorn
Write-Host "Iniciando servidor em http://0.0.0.0:8000 (Ctrl+C para parar)" -ForegroundColor Green
python -m uvicorn app:app --host 0.0.0.0 --port 8000
