function Ingest-Firmware {
    param (
        [string]$FirmwareRoot = "$PSScriptRoot\assets\firmware"
    )

    $firmwareSources = @(
        @{ url = "http://localhost:8080/mi4cs.zip"; model = "xiaomi\mi4cs" },
        @{ url = "http://localhost:8080/s9.zip"; model = "samsung\s9" }
    )

    foreach ($source in $firmwareSources) {
        $targetPath = Join-Path $FirmwareRoot $source.model
        $zipPath = Join-Path $env:TEMP "$($source.model.Replace('\','_')).zip"

        Invoke-WebRequest -Uri $source.url -OutFile $zipPath

        if (Test-Path $zipPath) {
            Expand-Archive -Path $zipPath -DestinationPath $targetPath -Force
        }

        $bin = Get-ChildItem $targetPath -Filter *.bin -ErrorAction SilentlyContinue
        if ($bin -and $bin.Count -gt 0) {
            foreach ($file in $bin) {
                $hash = Get-FileHash $file.FullName -Algorithm SHA256
                $manifest = @{
                    model     = $source.model
                    filename  = $file.Name
                    version   = "v0.0.1"
                    region    = "global"
                    timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
                    hash      = $hash.Hash
                } | ConvertTo-Json -Depth 2

                $manifestPath = Join-Path $targetPath "manifest.json"
                $manifest | Out-File -FilePath $manifestPath -Encoding UTF8
            }
        }

        Remove-Item $zipPath -Force
    }

    Write-Host "✅ Firmware ingestion complete."
}

Ingest-Firmware
