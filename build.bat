@echo off
echo.
echo ========================================
echo   Chronos — Build Desktop + Mobile App
echo ========================================
echo.

SET choice=%1

IF "%choice%"=="win" GOTO :windows
IF "%choice%"=="android" GOTO :android
IF "%choice%"=="all" GOTO :all

echo Что собрать?
echo   build.bat win      — Windows .exe установщик
echo   build.bat android  — Android APK
echo   build.bat all      — Оба
echo.
GOTO :eof

:windows
echo [1/3] Устанавливаем зависимости клиента...
cd client
call npm install
echo.
echo [2/3] Собираем React приложение для Electron...
set ELECTRON=true
call npm run build
set ELECTRON=
cd ..
echo.
echo [3/3] Собираем Windows установщик...
cd electron
call npm install
call npm run build:win
cd ..
echo.
echo ✅ Готово! Найди файл в папке dist-electron\
echo    Скопируй chronos-setup.exe в client\public\downloads\
echo.
GOTO :eof

:android
echo [1/4] Устанавливаем зависимости...
cd client
call npm install
call npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/local-notifications
echo.
echo [2/4] Собираем React приложение...
set ELECTRON=
call npm run build
echo.
echo [3/4] Инициализируем Capacitor Android...
call npx cap add android 2>nul || echo (android уже добавлен)
call npx cap sync android
echo.
echo [4/4] Открываем Android Studio...
call npx cap open android
cd ..
echo.
echo ✅ В Android Studio: Build → Generate Signed APK
echo    Скопируй APK в client\public\downloads\chronos.apk
echo.
GOTO :eof

:all
call %0 win
call %0 android
GOTO :eof
