# Image optimization script (requires ImageMagick 'magick' on PATH)
# Usage: .\optimize-images.ps1 -Input images\p2.jpg
param(
  [string]$Input = "images\p2.jpg"
)
if (-not (Test-Path $Input)) {
  Write-Error "Input file not found: $Input"
  exit 1
}
$base = [System.IO.Path]::GetFileNameWithoutExtension($Input)
$dir = [System.IO.Path]::GetDirectoryName($Input)
$outputs = @(
  @{w=480; name="$base-480.jpg"},
  @{w=768; name="$base-768.jpg"},
  @{w=1200; name="$base-1200.jpg"}
)
foreach ($o in $outputs) {
  $out = Join-Path $dir $o.name
  magick "$Input" -resize "${($o.w)}x" -strip -quality 85 "$out"
  Write-Output "Created $out"
}
Write-Output "Optimization complete."
