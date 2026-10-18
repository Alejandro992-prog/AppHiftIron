Add-Type -AssemblyName System.Drawing

$logoPath = "$PWD\public\logo.png"
if (-not (Test-Path $logoPath)) {
    Write-Error "Logo file not found at $logoPath"
    exit 1
}

$logo = [System.Drawing.Image]::FromFile($logoPath)
$resDir = "$PWD\android\app\src\main\res"

$densities = @(
    @{ Folder = "mipmap-mdpi";    Icon = 48;  Fg = 108 },
    @{ Folder = "mipmap-hdpi";    Icon = 72;  Fg = 162 },
    @{ Folder = "mipmap-xhdpi";   Icon = 96;  Fg = 216 },
    @{ Folder = "mipmap-xxhdpi";  Icon = 144; Fg = 324 },
    @{ Folder = "mipmap-xxxhdpi"; Icon = 192; Fg = 432 }
)

$bgColor = [System.Drawing.ColorTranslator]::FromHtml("#0d0d12")

foreach ($d in $densities) {
    $folderPath = Join-Path $resDir $d.Folder
    if (-not (Test-Path $folderPath)) {
        New-Item -ItemType Directory -Path $folderPath -Force | Out-Null
    }

    # 1. ic_launcher.png (Legacy square icon with dark background)
    $iconSize = $d.Icon
    $bmpIcon = New-Object System.Drawing.Bitmap $iconSize, $iconSize
    $g = [System.Drawing.Graphics]::FromImage($bmpIcon)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.Clear($bgColor)

    # Draw logo centered with 12% padding
    $pad = [int]($iconSize * 0.12)
    $drawW = $iconSize - ($pad * 2)
    $drawH = [int]($drawW * ($logo.Height / $logo.Width))
    $drawY = [int](($iconSize - $drawH) / 2)
    $g.DrawImage($logo, $pad, $drawY, $drawW, $drawH)
    $g.Dispose()

    $bmpIcon.Save((Join-Path $folderPath "ic_launcher.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $bmpIcon.Save((Join-Path $folderPath "ic_launcher_round.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $bmpIcon.Dispose()

    # 2. ic_launcher_foreground.png (Adaptive icon foreground with transparency)
    $fgSize = $d.Fg
    $bmpFg = New-Object System.Drawing.Bitmap $fgSize, $fgSize
    $gFg = [System.Drawing.Graphics]::FromImage($bmpFg)
    $gFg.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $gFg.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $gFg.Clear([System.Drawing.Color]::Transparent)

    # Safe zone for adaptive icons is center 66%
    $fgPad = [int]($fgSize * 0.18)
    $fgDrawW = $fgSize - ($fgPad * 2)
    $fgDrawH = [int]($fgDrawW * ($logo.Height / $logo.Width))
    $fgDrawY = [int](($fgSize - $fgDrawH) / 2)
    $gFg.DrawImage($logo, $fgPad, $fgDrawY, $fgDrawW, $fgDrawH)
    $gFg.Dispose()

    $bmpFg.Save((Join-Path $folderPath "ic_launcher_foreground.png"), [System.Drawing.Imaging.ImageFormat]::Png)
    $bmpFg.Dispose()

    Write-Host "Generated icons for $($d.Folder)"
}

# Update Splash screens with the logo and dark background
$splashDrawables = Get-ChildItem -Path $resDir -Recurse -Filter "splash.png"
foreach ($s in $splashDrawables) {
    try {
        $oldSplash = [System.Drawing.Image]::FromFile($s.FullName)
        $w = $oldSplash.Width
        $h = $oldSplash.Height
        $oldSplash.Dispose()

        $bmpSplash = New-Object System.Drawing.Bitmap $w, $h
        $gS = [System.Drawing.Graphics]::FromImage($bmpSplash)
        $gS.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $gS.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $gS.Clear($bgColor)

        # Scale logo to ~35% of min(w, h)
        $minDim = [Math]::Min($w, $h)
        $scaleW = [int]($minDim * 0.40)
        $scaleH = [int]($scaleW * ($logo.Height / $logo.Width))
        $x = [int](($w - $scaleW) / 2)
        $y = [int](($h - $scaleH) / 2)
        $gS.DrawImage($logo, $x, $y, $scaleW, $scaleH)
        $gS.Dispose()

        $bmpSplash.Save($s.FullName, [System.Drawing.Imaging.ImageFormat]::Png)
        $bmpSplash.Dispose()
        Write-Host "Updated splash: $($s.FullName)"
    } catch {
        Write-Warning "Could not update splash $($s.FullName): $_"
    }
}

$logo.Dispose()
Write-Host "All Android icons and splash screens successfully generated!"
