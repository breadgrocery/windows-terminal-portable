@echo off
setlocal

:: 检查管理员权限
>nul 2>&1 reg query "HKU\S-1-5-19\Environment" || (
    echo 请以管理员身份运行！
    pause & exit /b 1
)

:: 移除注册表项
reg delete "HKCU\Software\Classes\Directory\Background\shell\WindowsTerminal" /f

cls & color 0A & echo 移除右键菜单成功！
pause
