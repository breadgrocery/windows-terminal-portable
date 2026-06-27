if ([Console]::IsOutputRedirected -or [Console]::IsInputRedirected) {
  return
}

try {
  $Module = Get-Module -ListAvailable PSReadLine | Sort-Object Version -Descending | Select-Object -First 1

  $MinimumPSReadLineVersion = [version]'2.3.4'
  if (-not $Module -or $Module.Version -lt $MinimumPSReadLineVersion) {
    Install-Module PSReadLine -Scope CurrentUser -MinimumVersion $MinimumPSReadLineVersion -Force -AllowClobber
  }

  Import-Module PSReadLine -MinimumVersion $MinimumPSReadLineVersion -ErrorAction Stop

  Set-PSReadLineOption -PredictionSource History
  Set-PSReadLineOption -PredictionViewStyle InlineView
  Set-PSReadLineOption -ShowToolTips

  if ((Get-PSReadLineKeyHandler Tab).Function -ne 'MenuComplete') {
    Set-PSReadLineKeyHandler -Chord Tab -Function MenuComplete
  }
}
finally {
  if (Get-Command starship -ErrorAction SilentlyContinue) {
    Invoke-Expression (& starship init powershell)
  }
}
