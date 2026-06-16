try {
    if ((Get-Module PSReadLine).Version -lt '2.3.4') {
        Install-Module PSReadLine -RequiredVersion 2.3.4 -Force
    }
    Set-PSReadLineOption `
        -PredictionSource History `
        -PredictionViewStyle InlineView `
        -ShowToolTips
    Set-PSReadLineKeyHandler -Chord Tab -Function MenuComplete
}
finally {
    Invoke-Expression (&starship init powershell)
}
