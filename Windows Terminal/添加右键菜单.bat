@echo off
setlocal

:: 检查管理员权限
>nul 2>&1 reg query "HKU\S-1-5-19\Environment" || (
    echo 请以管理员身份运行！
    pause & exit /b 1
)

:: 设置路径变量
set "scriptDir=%~dp0"
set "binaryPath=%scriptDir%Windows Terminal.exe"

:: 添加注册表项
reg add "HKCU\Software\Classes\Directory\Background\shell\WindowsTerminal" /v "ShowBasedOnVelocityId" /t REG_DWORD /d "6527944" /f
reg add "HKCU\Software\Classes\Directory\Background\shell\WindowsTerminal" /v "icon" /t REG_SZ /d "%binaryPath%" /f
reg add "HKCU\Software\Classes\Directory\Background\shell\WindowsTerminal" /ve /t REG_SZ /d "在终端中打开" /f
reg add "HKCU\Software\Classes\Directory\Background\shell\WindowsTerminal\command" /ve /t REG_SZ /d "\"%binaryPath%\" -d \"%%V\"" /f

cls & color 0A & echo 添加右键菜单成功！
pause
