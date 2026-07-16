Add-Type -AssemblyName System.Drawing
$imgPath = "$pwd\og-image.png"
if (Test-Path $imgPath) {
    $img = [System.Drawing.Image]::FromFile($imgPath)
    $bmp = New-Object System.Drawing.Bitmap(1200, 630)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $srcRect = New-Object System.Drawing.Rectangle(75, 1, 1200, 630)
    $destRect = New-Object System.Drawing.Rectangle(0, 0, 1200, 630)
    $g.DrawImage($img, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()
    $img.Dispose()
    $bmp.Save("$pwd\og-image-cropped.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Move-Item -Path "$pwd\og-image-cropped.png" -Destination $imgPath -Force
    Write-Host "Cropped successfully"
} else {
    Write-Host "File not found"
}
