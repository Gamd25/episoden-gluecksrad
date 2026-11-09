# Episoden-Glücksrad v6 – GitHub Pages + Firebase Spark

## Änderungen
- In „Meine Auslosungen“ steht jetzt neben jeder einzelnen Runde ein eigener Knopf **Löschen** bzw. **Fortsetzen** bei unterbrochener Löschung. Die bisherige Löschfunktion in den Rundendetails bleibt bestehen.
- Es gibt eine zweistufige Bestätigung: den konkreten Rundentitel und die exakte Eingabe `LÖSCHEN`.
- Das serverseitig quittierte Löschen entfernt die sechs verwendeten Unterkollektionen und zuletzt das Hauptdokument. Eine unterbrochene Löschung bleibt als `deleting` markiert und kann für dieselbe Runde erneut versucht werden. Für die Löschung werden Unterkollektionen ausdrücklich vom Server abgerufen, nicht aus einem möglicherweise veralteten Offline-Cache.
- Im Kopf erscheint `v6 · JS geladen`, direkt aus dem **ausgeführten** `web/app.js` gesetzt. Diese Anzeige erlaubt die Unterscheidung gegenüber alten HTML-/JS-Kombinationen.
- Die alte Meldung „Dein Check-in wurde von der Lehrperson entfernt“ ist auch in v6 nicht im produktiven JavaScript enthalten. v5 enthielt sie ebenfalls nicht; ohne Zugriff auf die tatsächlich geladene Seite und ihren Cache lässt sich ihre erneute Anzeige **nicht** als neue v6-Codeursache beweisen.
- Check-in-Transaktion, gemeinsame Auslosung, Eltern-Firestore-Regeln, Authentication, vorhandene Ergebnisse und das separate Projekt `Gamd25/gefuehle-rad` sind unverändert.

## Abnahme
1. Alle vier Dateien aus dem v6-GitHub-Update an den **richtigen Pfaden** im neuen Repository aktualisieren. Die ZIP-Datei selbst nicht als Webdatei hochladen.
2. GitHub Actions muss einen erfolgreichen neuen Lauf für diese Änderung ausweisen.
3. Seite direkt mit `https://gamd25.github.io/episoden-gluecksrad/?release=v6-20261109` laden und oben die Kennung **`v6 · JS geladen`** kontrollieren.
4. Wenn die Kennung fehlt, **nicht** weiter an Firestore-Regeln ändern: zuerst Repository-Pfade, Deployment-Zeitpunkt und Browser-Cache prüfen.
5. Mit erfundenen Namen Check-in; danach im Lehrerbereich eine **Test**runde über den Listenknopf löschen und überprüfen, dass nur diese verschwindet. Keine echten Schülerdaten vor realem Sicherheits- und Mehrgerätetest.

## Grenzen
- Keine Live-Verbindung zu Nutzer-GitHub oder Firebase im Erstellungsprozess. Automatische Tests, statische Regeln und Syntaxprüfungen sind keine Firebase-Feldtests.
- Das Löschen mehrerer Dokumente ist auch in v6 **nicht atomar**. Beim Fehler die markierte Runde erneut löschen, nicht behaupten, alle Unterdokumente seien bereits gelöscht.
- Ein gemeinsamer Klassenlink plus freie Namenseingabe ist kein verlässlicher Identitätsnachweis.
