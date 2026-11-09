# Episoden-Glücksrad v9 – GitHub Pages aktualisieren

1. Das **kleine GitHub-Update v9** entpacken.
2. Im vorhandenen Repository `Gamd25/episoden-gluecksrad` die beiden Dateien `web/app.js` und `web/index.html` ersetzen und `web/wheel-motion.js` und `web/wheel-audio.js` neu hinzufügen. Alle vier Dateien müssen im Unterordner `web` liegen; keine ZIP-Datei als einzelne Datei hochladen.
3. Über GitHub → Actions einen erfolgreichen GitHub-Pages-Lauf abwarten und die Seite `https://gamd25.github.io/episoden-gluecksrad/?release=v9-20261109` aufrufen. Oben muss `v9 · JS geladen` stehen.
4. Wenn die Original-Geräusche lokal unabhängig vom alten Repository gespeichert werden sollen, im **neuen** Repository zusätzlich `web/assets/holz_ratsche.wav` und `web/assets/ding.wav` hochladen. Die WAV-Dateien stammen unverändert aus `Gamd25/gefuehle-rad/assets/` und liegen **nicht** im v9-ZIP; ohne die Kopien verwendet die Anwendung die entsprechenden öffentlichen Audiodateien der alten GitHub-Pages-Seite, sofern erreichbar.
5. Vor der Auslosung darf niemand drehen. Danach testweise drehen und noch einmal drehen: das Rad soll 4,3 Sekunden lang 6–10 Umdrehungen vollführen, zur *bereits gespeicherten* Episode stoppen und dabei nur die Originalgeräusche verwenden. Die Ergebnisse dürfen sich nicht ändern.

**Nicht notwendig:** neue Firebase-Regeln, Node.js, Blaze-Tarif oder eine weitere Auslosung. Das bisherige `Gamd25/gefuehle-rad` bleibt unverändert. Vor dem Unterricht mit echten Namen ist ein Mehrgeräte-/Berechtigungstest erforderlich.
