# Episoden-Glücksrad mit GitHub Pages + Firebase Spark

Diese Variante ist für das **neue** GitHub-Repository `Gamd25/episoden-gluecksrad` vorgesehen. Das alte Repository `Gamd25/gefuehle-rad` bleibt unverändert. Firebase-Projekt: **episoden-gluecksrad** (bereits in `web/config.js` eingetragen).

## Die fünf Schritte

1. Unter https://github.com/new ein **neues öffentliches Repository** `episoden-gluecksrad` anlegen (GitHub-Free-Pages verwendet öffentliche Repositories). Nicht das bestehende Gefühls-Rad-Repository verwenden. Am besten zunächst ohne README, .gitignore oder Lizenz anlegen.
2. ZIP auf dem eigenen Rechner **entpacken** und die Dateien/Ordner einschließlich des versteckten Ordners `.github` ins neue Repository bringen. Am einfachsten mit **GitHub Desktop**: `File > Add local repository` bzw. ein Git-Repository aus dem entpackten Ordner initialisieren, neues Repository über Desktop veröffentlichen. Alternativ über Git im Terminal: `git init -b main`, `git add .`, `git commit -m "Episoden-Glücksrad Spark + GitHub Pages"`, `git remote add origin https://github.com/Gamd25/episoden-gluecksrad.git`, `git push -u origin main` (dafür braucht man Git, eingerichtete Benutzeridentität und GitHub-Zugang). **Die ZIP selbst nicht als einzelne Datei hochladen.**
3. Neues Repository > **Settings > Pages > Build and deployment > Source: GitHub Actions**. Der mitgelieferte Workflow `.github/workflows/pages.yml` veröffentlicht **nur** den Inhalt von `web/` als GitHub Pages. Falls der Workflow schon ausgeführt wurde, unter Actions den Deploy-Status prüfen.
4. Firebase Console > Projekt `episoden-gluecksrad` > **Authentication > Settings > Authorized domains**: `gamd25.github.io` hinzufügen, **ohne `https://` und ohne Pfad**. Die Firebase-Webkonfiguration in `web/config.js` ist bereits richtig eingetragen. Bei einem anderen Repository-Besitzer dessen GitHub-Pages-Domain verwenden.
5. **Node.js installieren** und `FIRESTORE-REGELN-AKTIVIEREN.cmd` ausführen, damit die Sicherheitsregeln in **deinem neuen Firebase-Projekt** installiert werden. Das ist ein einmaliger Backend-Schritt und erfordert Firebase-Login. Kein Blaze-Tarif und keine Cloud Functions nötig. Anschließend Test mit erfundenen Namen und mehreren Geräten.

Wenn GitHub-Nutzer und Repository so lauten wie oben, ist die **voraussichtliche** Seitenadresse:

`https://gamd25.github.io/episoden-gluecksrad/`

Sie existiert erst nach erfolgreichem Pages-Deployment. Bei GitHub-Änderungen an `main` wird die Seite automatisch neu bereitgestellt.

## Wichtige Hinweise

- **GitHub Pages veröffentlicht keine Firestore-Regeln.** Diese müssen separat mit `FIRESTORE-REGELN-AKTIVIEREN.cmd` bereitgestellt werden.
- `ALTERNATIV-FIREBASE-HOSTING.cmd` ist nur für den alternativen Weg über Firebase Hosting, **nicht** für den geplanten GitHub-Pages-Betrieb.
- GitHub ist bei öffentlichen Repositorys öffentlich einsehbar. **Keine Schülerlisten, Zugangstokens, geheimen Schlüssel oder personenbezogenen Daten einchecken.** Die Firebase-Webkonfiguration `web/config.js` ist öffentlich und kein Admin-Schlüssel.
- Persönliche Links werden erst im Lehrer-Browser erzeugt, nicht im GitHub-Repository gespeichert. Wer einen Link besitzt, kann ihn unter Umständen vor der richtigen Person einlösen; es gibt **keine** Moodle-Konto-Verifizierung.
- Es gibt bisher **keinen** durchgeführten realen Firebase-/GitHub-Deployment- und Mehrgeräte-Sicherheitstest. Vor der Verwendung mit echten Schülernamen sind Test und Datenschutzprüfung zwingend.

Originaldetails: `README.md`, `docs/TESTPLAN.md`, `docs/PRUEFSTATUS.md`.
