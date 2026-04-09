@echo off
setlocal enabledelayedexpansion

set SDK_ROOT=C:\Users\Chaklesh Yadav\AppData\Local\Android\Sdk
set SDKMANAGER=%SDK_ROOT%\cmdline-tools\latest\bin\sdkmanager.bat

echo Accepting Android SDK licenses...
(
    echo y
    echo y
    echo y
    echo y
    echo y
    echo y
    echo y
    echo y
) | "%SDKMANAGER%" --licenses

echo License acceptance completed
pause
