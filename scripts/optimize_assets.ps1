Add-Type -AssemblyName System.Drawing

function Optimize-JpegFile {
    param (
        [string]$Path,
        [int]$MaxDimension = 1600,
        [long]$Quality = 84
    )

    $fullPath = Resolve-Path $Path
    $fileInfo = Get-Item $fullPath
    $originalSize = $fileInfo.Length

    # Skip 3D texture maps if specifically preserved
    $fileName = Split-Path $Path -Leaf
    if ($fileName -in @('satellite-4f.jpg', 'royal_memorial_banner.jpg')) {
        return [PSCustomObject]@{
            File = $fileName
            Before = $originalSize
            After = $originalSize
            SavedPercent = 0
            Action = "Preserved 3D Texture Map"
        }
    }

    # Load image from memory stream to avoid locking
    $bytes = [System.IO.File]::ReadAllBytes($fullPath)
    $ms = [System.IO.MemoryStream]::new($bytes)
    $img = [System.Drawing.Image]::FromStream($ms)

    $w = $img.Width
    $h = $img.Height

    # Downscale if larger than MaxDimension
    $newW = $w
    $newH = $h
    if ($w -gt $MaxDimension -or $h -gt $MaxDimension) {
        if ($w -ge $h) {
            $newW = $MaxDimension
            $newH = [int][Math]::Round(($h * $MaxDimension) / $w)
        } else {
            $newH = $MaxDimension
            $newW = [int][Math]::Round(($w * $MaxDimension) / $h)
        }
    }

    # If already small and no resize needed, skip
    if ($originalSize -lt 250000 -and $newW -eq $w -and $newH -eq $h) {
        $img.Dispose()
        $ms.Dispose()
        return [PSCustomObject]@{
            File = $fileName
            Before = $originalSize
            After = $originalSize
            SavedPercent = 0
            Action = "Skipped (Already lightweight)"
        }
    }

    $destBitmap = [System.Drawing.Bitmap]::new($newW, $newH, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
    $graphics = [System.Drawing.Graphics]::FromImage($destBitmap)
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $graphics.DrawImage($img, 0, 0, $newW, $newH)

    $codecs = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders()
    $jpegCodec = $codecs | Where-Object { $_.MimeType -eq 'image/jpeg' } | Select-Object -First 1

    $encoderParams = [System.Drawing.Imaging.EncoderParameters]::new(1)
    $encoderParams.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new(
        [System.Drawing.Imaging.Encoder]::Quality,
        $Quality
    )

    $outMs = [System.IO.MemoryStream]::new()
    $destBitmap.Save($outMs, $jpegCodec, $encoderParams)
    $newBytes = $outMs.ToArray()

    $graphics.Dispose()
    $destBitmap.Dispose()
    $img.Dispose()
    $ms.Dispose()
    $outMs.Dispose()

    if ($newBytes.Length -lt $originalSize) {
        [System.IO.File]::WriteAllBytes($fullPath, $newBytes)
        $saved = $originalSize - $newBytes.Length
        return [PSCustomObject]@{
            File = $fileName
            Before = $originalSize
            After = $newBytes.Length
            SavedPercent = [Math]::Round(($saved / $originalSize) * 100, 1)
            Action = "Optimized ($w x $h -> $newW x $newH)"
        }
    } else {
        return [PSCustomObject]@{
            File = $fileName
            Before = $originalSize
            After = $originalSize
            SavedPercent = 0
            Action = "Kept original"
        }
    }
}

# 1. Remove duplicate - Copy.jpg files
$copies = Get-ChildItem -Path "public/assets" -Filter "* - Copy.jpg"
foreach ($c in $copies) {
    Write-Output "Removing duplicate copy: $($c.Name)"
    Remove-Item -Force $c.FullName
}

# 2. Optimize all JPG files
$jpgFiles = Get-ChildItem -Path "public/assets" -Filter "*.jpg" | Sort-Object Length -Descending
$results = @()
$totalBefore = 0
$totalAfter = 0

foreach ($f in $jpgFiles) {
    $r = Optimize-JpegFile -Path $f.FullName -MaxDimension 1600 -Quality 84
    $results += $r
    $totalBefore += $r.Before
    $totalAfter += $r.After
}

$results | Format-Table File, @{Label="Before (KB)"; Expression={[Math]::Round($_.Before/1KB, 1)}}, @{Label="After (KB)"; Expression={[Math]::Round($_.After/1KB, 1)}}, SavedPercent, Action -AutoSize

$savedTotal = $totalBefore - $totalAfter
$savedPct = [Math]::Round(($savedTotal / $totalBefore) * 100, 1)
Write-Output "============================================================"
Write-Output ("Total Before: " + [Math]::Round($totalBefore / 1MB, 2) + " MB")
Write-Output ("Total After:  " + [Math]::Round($totalAfter / 1MB, 2) + " MB")
Write-Output ("Total Saved:  " + [Math]::Round($savedTotal / 1MB, 2) + " MB (" + $savedPct + "%)")
Write-Output "============================================================"
