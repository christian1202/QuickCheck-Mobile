$fonts = @(
    @{ url = "https://github.com/sharanda/manrope/raw/master/fonts/ttf/Manrope-Regular.ttf"; file = "assets/fonts/Manrope-Regular.ttf" },
    @{ url = "https://github.com/sharanda/manrope/raw/master/fonts/ttf/Manrope-Bold.ttf"; file = "assets/fonts/Manrope-Bold.ttf" },
    @{ url = "https://github.com/sharanda/manrope/raw/master/fonts/ttf/Manrope-ExtraBold.ttf"; file = "assets/fonts/Manrope-ExtraBold.ttf" },
    @{ url = "https://github.com/google/fonts/raw/main/ofl/inter/Inter%5Bopsz%2Cwght%5D.ttf"; file = "assets/fonts/Inter-Variable.ttf" }
)

foreach ($f in $fonts) {
    Write-Host "Downloading $($f.file)..."
    try {
        Invoke-WebRequest -Uri $f.url -OutFile $f.file -UseBasicParsing
        Write-Host "  OK"
    } catch {
        Write-Host "  FAILED: $_"
    }
}
Write-Host "Done."
