@echo off
setlocal
cd /d "%~dp0"
echo.
echo Episoden-Gluecksrad: NUR Firestore-Sicherheitsregeln bereitstellen
echo Firebase-Projekt: episoden-gluecksrad (Spark, keine Cloud Functions)
where node >nul 2>nul
if errorlevel 1 (
  echo Bitte zuerst Node.js von https://nodejs.org installieren.
  pause
  exit /b 1
)
call npx --yes firebase-tools login
if errorlevel 1 goto :fehler
call npx --yes firebase-tools deploy --project episoden-gluecksrad --only firestore:rules
if errorlevel 1 goto :fehler
echo Firestore-Regeln wurden bereitgestellt. GitHub Pages separat einschalten.
pause
exit /b 0
:fehler
echo FEHLER: Bitte die Meldung oben pruefen.
pause
exit /b 1
