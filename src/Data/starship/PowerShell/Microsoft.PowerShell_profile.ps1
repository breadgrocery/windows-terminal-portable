try {
	$MinimumPSReadLineVersion = [version]'2.3.4'
    $PSReadLineModule = Get-Module -ListAvailable PSReadLine | Sort-Object Version -Descending | Select-Object -First 1

    if (-not $PSReadLineModule -or $PSReadLineModule.Version -lt $MinimumPSReadLineVersion) {
        Install-Module PSReadLine -Scope CurrentUser -MinimumVersion $MinimumPSReadLineVersion -Force -AllowClobber
    }

    Import-Module PSReadLine -MinimumVersion $MinimumPSReadLineVersion -ErrorAction Stop

    $Options = Get-PSReadLineOption

    if ($Options.PredictionSource -ne 'History') { Set-PSReadLineOption -PredictionSource History }

    if ($Options.PredictionViewStyle -ne 'InlineView') { Set-PSReadLineOption -PredictionViewStyle InlineView }

    if (-not $Options.ShowToolTips) { Set-PSReadLineOption -ShowToolTips }

    $TabHandler = Get-PSReadLineKeyHandler | Where-Object { $_.Key -eq 'Tab' } | Select-Object -First 1
    if ($TabHandler.Function -ne 'MenuComplete') { Set-PSReadLineKeyHandler -Chord Tab -Function MenuComplete }
}
finally {
    if (Get-Command starship -ErrorAction SilentlyContinue) { Invoke-Expression (& starship init powershell) }
}