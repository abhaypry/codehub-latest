@echo off
title CodeHub Launcher
color 0A

echo ========================================
echo         CODEHUB LAUNCHER
echo ========================================
echo.

:: Start Apache
echo [1/3] Starting Apache...
call C:\xampp\apache_start.bat > nul 2>&1

:: Start MySQL
echo [2/3] Starting MySQL...
call C:\xampp\mysql_start.bat > nul 2>&1

:: Wait for services to initialize
timeout /t 3 /nobreak > nul

:: Start Angular dev server with auto-restart loop
echo [3/3] Starting Angular dev server...
start "Angular - CodeHub [KEEP OPEN]" cmd /k "cd /d "E:\College 8\codehub" && :loop && ng serve --open && goto loop"

echo.
echo ========================================
echo  CodeHub is starting!
echo  Browser opens at http://localhost:4200
echo  Wait ~15 sec for Angular to compile.
echo.
echo  *** IMPORTANT ***
echo  Keep the "Angular - CodeHub" window open!
echo  Closing it = site goes offline.
echo ========================================
echo.
pause
