param(
  [string]$OutputDirectory = "site"
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$resolvedOutput = [System.IO.Path]::GetFullPath($OutputDirectory)
[System.IO.Directory]::CreateDirectory($resolvedOutput) | Out-Null

function New-AcessaBrIcon {
  param(
    [int]$Size,
    [string]$Path
  )

  $bitmap = [System.Drawing.Bitmap]::new($Size, $Size)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)

  try {
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $graphics.TextRenderingHint =
      [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    $graphics.Clear([System.Drawing.ColorTranslator]::FromHtml("#111713"))

    $borderWidth = [Math]::Max(1, [Math]::Round($Size * 0.035))
    $borderPen = [System.Drawing.Pen]::new(
      [System.Drawing.ColorTranslator]::FromHtml("#f2eee6"),
      $borderWidth
    )
    $greenBrush = [System.Drawing.SolidBrush]::new(
      [System.Drawing.ColorTranslator]::FromHtml("#63a66f")
    )
    $paperBrush = [System.Drawing.SolidBrush]::new(
      [System.Drawing.ColorTranslator]::FromHtml("#fffefa")
    )

    try {
      $inset = [Math]::Max(1, [Math]::Round($Size * 0.055))
      $graphics.DrawRectangle(
        $borderPen,
        $inset,
        $inset,
        $Size - (2 * $inset) - 1,
        $Size - (2 * $inset) - 1
      )

      $fontStyle = [System.Drawing.FontStyle]::Bold
      $letterFont = [System.Drawing.Font]::new(
        "Arial",
        [Math]::Max(8, $Size * 0.54),
        $fontStyle,
        [System.Drawing.GraphicsUnit]::Pixel
      )
      $slashFont = [System.Drawing.Font]::new(
        "Arial",
        [Math]::Max(7, $Size * 0.42),
        $fontStyle,
        [System.Drawing.GraphicsUnit]::Pixel
      )

      try {
        $graphics.DrawString(
          "a",
          $letterFont,
          $paperBrush,
          [single]($Size * 0.13),
          [single]($Size * 0.17)
        )
        $graphics.DrawString(
          "/",
          $slashFont,
          $greenBrush,
          [single]($Size * 0.56),
          [single]($Size * 0.25)
        )
      } finally {
        $letterFont.Dispose()
        $slashFont.Dispose()
      }
    } finally {
      $borderPen.Dispose()
      $greenBrush.Dispose()
      $paperBrush.Dispose()
    }

    $bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
  } finally {
    $graphics.Dispose()
    $bitmap.Dispose()
  }
}

$icons = @(
  @{ Size = 16; Name = "favicon-16x16.png" },
  @{ Size = 32; Name = "favicon-32x32.png" },
  @{ Size = 180; Name = "apple-touch-icon.png" },
  @{ Size = 192; Name = "favicon-192x192.png" },
  @{ Size = 512; Name = "favicon-512x512.png" }
)

foreach ($icon in $icons) {
  New-AcessaBrIcon `
    -Size $icon.Size `
    -Path ([System.IO.Path]::Combine($resolvedOutput, $icon.Name))
}

$pngPath = [System.IO.Path]::Combine($resolvedOutput, "favicon-32x32.png")
$icoPath = [System.IO.Path]::Combine($resolvedOutput, "favicon.ico")
$pngBytes = [System.IO.File]::ReadAllBytes($pngPath)
$stream = [System.IO.MemoryStream]::new()
$writer = [System.IO.BinaryWriter]::new($stream)

try {
  $writer.Write([uint16]0)
  $writer.Write([uint16]1)
  $writer.Write([uint16]1)
  $writer.Write([byte]32)
  $writer.Write([byte]32)
  $writer.Write([byte]0)
  $writer.Write([byte]0)
  $writer.Write([uint16]1)
  $writer.Write([uint16]32)
  $writer.Write([uint32]$pngBytes.Length)
  $writer.Write([uint32]22)
  $writer.Write($pngBytes)
  $writer.Flush()
  [System.IO.File]::WriteAllBytes($icoPath, $stream.ToArray())
} finally {
  $writer.Dispose()
  $stream.Dispose()
}

Write-Output "Favicons do AcessaBR gerados em $resolvedOutput"
