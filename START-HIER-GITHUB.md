# START HIER – Gemeinsamer Klassenlink (GitHub Pages + Firebase Spark)

**Keine Installation von Node.js nötig.** Das vorhandene `episoden-gluecksrad`-Repository und das vorhandene Firebase-Projekt weiterverwenden. Das ursprüngliche `gefuehle-rad` bleibt unverändert.

1. Firebase Console → `episoden-gluecksrad` → **Cloud Firestore → Regeln**: `firestore.rules` vollständig in den Regeleditor kopieren und auf **Veröffentlichen** klicken. Die bisherigen `/rounds`-Regeln sind in dieser neuen Datei enthalten.
2. In GitHub `Gamd25/episoden-gluecksrad` die fünf Dateien `web/index.html`, `web/app.js`, `web/style.css`, `web/shared-backend.js` und `web/shared-logic.js` aktualisieren/hinzufügen. Bei Bedarf GitHub Desktop nutzen, um Änderungen in einem Commit hochzuladen. `web/config.js` und `.github/workflows/pages.yml` unverändert lassen.
3. GitHub → **Actions** prüfen: der Pages-Workflow muss ein grünes Häkchen haben.
4. `https://gamd25.github.io/episoden-gluecksrad/` aufrufen, als Lehrperson anmelden, Test-Runde erstellen und einen **gemeinsamen Klassenlink** kopieren.
5. Mit **erfundenen** Namen auf zwei anderen Browsern testen. Ein Name soll nur einmal funktionieren, die Teilnehmendenliste soll erst nach Check-in erscheinen, Ergebnisse erst nach ausdrücklichem Abschluss.

**Unbedingt beachten:** Der gemeinsame Link + freie Namenseingabe identifiziert keine realen Schülerinnen und Schüler verlässlich. Ein unbefugter Mensch mit dem Link kann sich als jemand anders ausgeben. Die Lehrperson muss vor dem Abschluss die anwesenden Personen gegen die Check-in-Liste prüfen. Für produktiven Einsatz mit echten Schülernamen sind Datenschutzfreigabe, Regeltests und Identitätskonzept erforderlich.
