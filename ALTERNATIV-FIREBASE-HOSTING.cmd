@echo off
setlocal
cd /d "%~dp0"
echo.
echo Episoden-Gluecksrad - Firebase Spark / OHNE Cloud Functions
 echo Zielprojekt: episoden-gluecksrad
 echo Es werden NUR Firestore-Regeln und Firebase Hosting veroeffentlicht.
echo.
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js fehlt. Bitte zuerst Node.js von https://nodejs.org installieren.
  pause
  exit /b 1
)
where npx >nul 2>nul
if errorlevel 1 (
  echo npx fehlt. Bitte Node.js einschliesslich npm installieren.
  pause
  exit /b 1
)
echo.
echo Firebase-Anmeldung - im Browser mit dem Firebase-Projektkonto anmelden.
call npx --yes firebase-tools login
if errorlevel 1 goto :failed
echo.
echo Bereitstellen von Hosting und Firestore-Regeln in episoden-gluecksrad ...
call npx --yes firebase-tools deploy --project episoden-gluecksrad --only firestore:rules,hosting
if errorlevel 1 goto :failed
echo.
echo FERTIG - Jetzt https://episoden-gluecksrad.web.app aufrufen.
pause
exit /b 0
:failed
echo.
echo FEHLER: Die Bereitstellung wurde nicht erfolgreich abgeschlossen.
echo Bitte die Fehlermeldung oben lesen oder hierher kopieren.
pause
exit /b 1
