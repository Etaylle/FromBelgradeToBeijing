@echo off


set SUBDOMAIN=stripe200


tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I "localtunnel.js" >NUL
if "%ERRORLEVEL%"=="0" (
    echo Localtunnel is already running.
    exit /b
)


start cmd /k "lt --port 8080 --subdomain %SUBDOMAIN% --persist"

echo Localtunnel started successfully.