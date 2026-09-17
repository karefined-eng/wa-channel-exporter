$ErrorActionPreference = 'Stop'

$version = (Get-Content manifest.json | ConvertFrom-Json).version
$zipName = "wa-channel-exporter-v$version.zip"
$tempDir = "build_temp"

Write-Host "Building WA Channel Exporter v$version..."

# Clean up any previous build
if (Test-Path $tempDir) { Remove-Item -Recurse -Force $tempDir }
if (Test-Path $zipName) { Remove-Item -Force $zipName }

New-Item -ItemType Directory -Path $tempDir | Out-Null

# Copy necessary files
Copy-Item "manifest.json" -Destination $tempDir
Copy-Item "LICENSE" -Destination $tempDir -ErrorAction SilentlyContinue
Copy-Item "README.md" -Destination $tempDir -ErrorAction SilentlyContinue
Copy-Item "src" -Destination "$tempDir\src" -Recurse

# Compress to ZIP
Compress-Archive -Path "$tempDir\*" -DestinationPath $zipName

# Clean up temp folder
Remove-Item -Recurse -Force $tempDir

Write-Host "Success! Created release package: $zipName"
Write-Host "This zip file is ready to be uploaded to the Chrome Web Store and Microsoft Edge Add-ons."
