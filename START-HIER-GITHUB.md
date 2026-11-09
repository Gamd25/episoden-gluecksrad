# v6 – Schnellupdate ohne Node.js und ohne Blaze

1. Entpacke `EpisodenGluecksrad_GitHub_Update_v6_2026-11-09.zip`.
2. Im Repository `Gamd25/episoden-gluecksrad` **genau die enthaltenen vier Dateien** im Ordner `web/` aktualisieren: `app.js`, `index.html`, `style.css`, `shared-backend.js`. Die anderen Dateien, das alte `gefuehle-rad` und die Firestore-Regeln bleiben unverändert.
3. GitHub → **Actions**: neuer grüner erfolgreicher Deploy **nach** dem Commit.
4. Diese Adresse im Privatfenster öffnen: https://gamd25.github.io/episoden-gluecksrad/?release=v6-20261109
5. OBEN muss **v6 · JS geladen** stehen. Fehlt dieser Schriftzug, wird keine v6-Datei ausgeführt und die vorherige Fehleranzeige kann aus altem Code stammen.
6. Eine Testperson einchecken. In **Meine Auslosungen** den neuen Löschknopf **nur an einer eigens erzeugten Testrunde** ausprobieren. Exakt `LÖSCHEN` eingeben.

Hinweise: Keine Firebase-Regeländerung für diese Version. Die Oberfläche ist nicht live geprüft, sondern offline getestet. Vor Verwendung echter Namen Datenschutz/Identitätsprüfung berücksichtigen.
