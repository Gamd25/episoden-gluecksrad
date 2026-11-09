# Episoden-Glücksrad v9 – GitHub Pages aktualisieren

1. Das **kleine GitHub-Update v9** entpacken.
2. Im vorhandenen Repository `Gamd25/episoden-gluecksrad` die beiden Dateien `web/app.js` und `web/index.html` ersetzen und `web/wheel-motion.js` und `web/wheel-audio.js` neu hinzufügen. Alle vier Dateien müssen im Unterordner `web` liegen; keine ZIP-Datei als einzelne Datei hochladen.
3. Über GitHub → Actions einen erfolgreichen GitHub-Pages-Lauf abwarten und die Seite `https://gamd25.github.io/episoden-gluecksrad/?release=v9-20261109` aufrufen. Oben muss `v9 · JS geladen` stehen.
4. Wenn die Original-Geräusche lokal unabhängig vom alten Repository gespeichert werden sollen, im **neuen** Repository zusätzlich `web/assets/holz_ratsche.wav` und `web/assets/ding.wav` hochladen. Die WAV-Dateien stammen unverändert aus `Gamd25/gefuehle-rad/assets/` und liegen **nicht** im v9-ZIP; ohne die Kopien verwendet die Anwendung die entsprechenden öffentlichen Audiodateien der alten GitHub-Pages-Seite, sofern erreichbar.
5. Vor der Auslosung darf niemand drehen. Danach testweise drehen und noch einmal drehen: das Rad soll 4,3 Sekunden lang 6–10 Umdrehungen vollführen, zur *bereits gespeicherten* Episode stoppen und dabei nur die Originalgeräusche verwenden. Die Ergebnisse dürfen sich nicht ändern.

**Nicht notwendig:** neue Firebase-Regeln, Node.js, Blaze-Tarif oder eine weitere Auslosung. Das bisherige `Gamd25/gefuehle-rad` bleibt unverändert. Vor dem Unterricht mit echten Namen ist ein Mehrgeräte-/Berechtigungstest erforderlich.

## GitHub-Update v10

Nur `web/app.js` und `web/index.html` aus dem Update-ZIP in den gleichnamigen Pfaden des bestehenden Repositories ersetzen. Auf GitHub Actions den Erfolg prüfen und die Website mit `?release=v10-20261109` neu laden. Die Kennung `v10 · JS geladen` muss erscheinen. Firestore-Regeln müssen nicht erneut veröffentlicht werden.

## GitHub-Update v11

Für das v11-Update die Dateien `web/app.js` und `web/index.html` aus dem separaten Update-ZIP an denselben Pfaden im Repository `Gamd25/episoden-gluecksrad` ersetzen. Erfolgreiche Veröffentlichung unter GitHub Actions abwarten, Seite neu laden und auf „v11 · JS geladen“ prüfen. Keine Firestore-Regeländerungen erforderlich.

## GitHub-Update v12 – Ergebnis erst nach dem Drehen

Im GitHub-Repository `Gamd25/episoden-gluecksrad` nur die zwei Dateien `web/app.js` und `web/index.html` aus dem v12-Update-ZIP an gleicher Stelle ersetzen. Nach GitHub-Actions-Deploy die Seite mit Strg+F5 öffnen und die sichtbare Kennung `v12 · JS geladen` prüfen. Die Ergebnisbox bleibt nach Freigabe zunächst unsichtbar und erscheint erst nach Abschluss des aktiv gestarteten Glücksrad-Drehs. Beim Wiederöffnen der Seite wird die Zuordnung unverändert geladen, aber zum Anzeigen muss erneut gedreht werden. Firestore-Regeln müssen nicht verändert werden.
