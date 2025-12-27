$ErrorActionPreference = "Stop"

function Get-DevvitToken {
    $homeDir = [Environment]::GetFolderPath("UserProfile")
    
    # Check both with and without .json extension
    $paths = @(
        Join-Path $homeDir ".devvit\token",
        Join-Path $homeDir ".devvit\token.json"
    )

    $tokenFound = $false

    foreach ($tokenPath in $paths) {
        Write-Host "Checking at: $tokenPath" -ForegroundColor Cyan
        
        if (Test-Path $tokenPath) {
            # Read file as single string
            $tokenContent = Get-Content $tokenPath -Raw
            if (-not $tokenContent) { continue }
            
            # Trim whitespace
            $tokenClean = $tokenContent.Trim()
            
            # Escape single quotes
            $tokenSafe = $tokenClean.Replace("'", "''")
            
            Write-Host "`nToken found at $tokenPath!`n" -ForegroundColor Green
            Write-Host "Add this to your .env.local file:`n" -ForegroundColor Cyan
            Write-Host "DEVVIT_TOKEN='$tokenSafe'" -ForegroundColor Yellow
            Write-Host "`n(Include the single quotes!)"
            $tokenFound = $true
            return
        }
    }

    if (-not $tokenFound) {
        Write-Host "Token file not found in standard locations." -ForegroundColor Red
        Write-Host "Please ensure you ran npx devvit login successfully."
    }
}

try {
    Get-DevvitToken
}
catch {
    Write-Host "Unexpected Error: $_" -ForegroundColor Red
}
