# Orbrya Build & Deploy Script
# Builds C# WASM, removes symbols file, copies to docs/

Write-Host "🔨 Building Orbrya C# Engine..." -ForegroundColor Cyan

# Step 1: Publish Release build
Write-Host "📦 Publishing Release build..." -ForegroundColor Yellow
dotnet publish WasmApp/WasmApp.csproj -c Release -o publish

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green

# Step 2: Remove old files
Write-Host "🗑️  Removing old _framework files..." -ForegroundColor Yellow
Remove-Item -Path "docs\_framework\*" -Recurse -Force -ErrorAction SilentlyContinue

# Step 3: Copy new files
Write-Host "📋 Copying new _framework files..." -ForegroundColor Yellow
Copy-Item -Path "WasmApp\bin\Release\net8.0\browser-wasm\AppBundle\_framework\*" -Destination "docs\_framework\" -Recurse

# Step 4: Copy main.js
Write-Host "📋 Copying main.js..." -ForegroundColor Yellow
Copy-Item -Path "WasmApp\wwwroot\main.js" -Destination "docs\main.js" -Force

# Step 5: CRITICAL - Remove symbols file (causes 404 in production)
Write-Host "🔧 Removing symbols file (production optimization)..." -ForegroundColor Yellow
Remove-Item -Path "docs\_framework\dotnet.native.js.symbols" -Force -ErrorAction SilentlyContinue

# Step 6: Update blazor.boot.json to remove wasmSymbols section
Write-Host "🔧 Updating blazor.boot.json..." -ForegroundColor Yellow
$bootJsonPath = "docs\_framework\blazor.boot.json"
$bootJson = Get-Content $bootJsonPath -Raw | ConvertFrom-Json

# Remove wasmSymbols property if it exists
if ($bootJson.resources.PSObject.Properties.Name -contains "wasmSymbols") {
    $bootJson.resources.PSObject.Properties.Remove("wasmSymbols")
    $bootJson | ConvertTo-Json -Depth 10 | Set-Content $bootJsonPath
    Write-Host "✅ Removed wasmSymbols from blazor.boot.json" -ForegroundColor Green
} else {
    Write-Host "ℹ️  wasmSymbols already removed" -ForegroundColor Gray
}

# Step 7: Summary
Write-Host ""
Write-Host "✅ Build complete!" -ForegroundColor Green
Write-Host "📊 Files ready for deployment in docs/_framework/" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Test locally: npx http-server docs -p 8080 -c-1" -ForegroundColor White
Write-Host "   2. Commit: git add docs/" -ForegroundColor White
Write-Host "   3. Push: git commit -m 'Update C# engine' && git push" -ForegroundColor White
Write-Host ""
