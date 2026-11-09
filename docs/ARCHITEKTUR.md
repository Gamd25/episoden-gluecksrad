# Spark-Architektur v2

Browser (Google-Lehrperson) ↔ Firebase Authentication ↔ Cloud Firestore; Browser (Anonymous-Teilnehmende) ↔ dieselbe Firestore-Datenbank. Keine Functions, kein eigener Server.

- `/rounds/{id}`: ausschließlich Lehrperson lesbar, enthält private Einladungs-IDs und Episoden.
- `/rounds/{id}/checkinGate/status`: offen oder veröffentlicht; für authentifizierte Geräte lesbar. Kein personenbezogenes Feld.
- `/rounds/{id}/roster/{64-stelliges-Zufallstoken}`: unbenutzter Einladungsdatensatz. Einzelget nur mit zufälligem Dokumentschlüssel, keine Teilnehmer-Listenrechte.
- `/rounds/{id}/authorized/{anonymousUid}`: serverseitig durch Rules überprüfte Teilnahmebindung, nur eigene Leserechte.
- `/rounds/{id}/presence/{anonymousUid}`: eingecheckte Namen, nur nach erfolgreicher eigener Teilnahme lesbar.
- `/rounds/{id}/view/state`: öffentlicher Rundentitel für Eingecheckte, Episodennamen erst nach Freigabe.
- `/rounds/{id}/results/{anonymousUid}`: nach `published` nur eigenes Ergebnis lesbar; volle Liste für Lehrperson.

Check-in: Eine Firestore-Transaktion liest das Gate, den Einmal-Link und die eigene Teilnahme und erzeugt atomar Roster-Claim, `authorized` und `presence`. Firestore-Rules fordern über `getAfter()` die konsistenten gemeinsamen Änderungen. Re-Login mit bestehender Teilnahme erfolgt ohne erneuten Zählerzuwachs. Ein fremder oder bereits beanspruchter Link wird abgelehnt.

Auslosung: Die Lehrperson liest **in einer einzigen Firestore-Transaktion** ihre Runde und sämtliche zur Runde gehörigen Roster-Dokumente, verteilt ausschließlich die aktuell beanspruchten Einträge gleichmäßig mit `crypto.getRandomValues` und schreibt Ergebnisse, Gate, Viewer-Status und Rundenzustand im selben Commit. Ein intervenierender Check-in verändert ein gelesenes Dokument und erzwingt Transaktionswiederholung. Keine Veröffentlichung in Teilschritten.

Vertrauen: Der Browser der Lehrperson kontrolliert den Zufallsalgorithmus. Das ist keine unabhängig serverattestierte Randomness; manipulierter Client könnte die Verteilung bewusst ändern. Firestore-Rules allein können echte Zufälligkeit nicht nachweisen. Zugangstokens ermöglichen keine prüfbare Moodle-Identität. Für verbindliche Identitäts- oder Manipulationssicherheit ist eine gesonderte Backend-/LTI-Lösung notwendig.
