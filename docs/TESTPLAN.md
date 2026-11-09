# Testplan Spark v2

**Vor realen Schülerdaten** prüfen: In Firebase Console Google + Anonymous eingeschaltet, Firestore in gewünschter Region; mit `firebase deploy --project episoden-gluecksrad --only firestore:rules,hosting` neue Regeln und Hosting installiert.

1. Lehrperson meldet sich per Google an. Eine Testrunde mit drei erfundenen Namen und zwei Episoden anlegen. CSV enthält drei verschiedene persönliche Links.
2. Schülerlink in privatem Browser öffnen: vor Klick keine Check-in-Liste und keine Episode. Einmal klicken: Person erscheint in Live-Liste; wiederholter Klick zählt nicht erneut.
3. Zweiten Link in zweitem privaten Browser prüfen: Beide sehen zwei Eingecheckte, nicht den dritten, ausstehenden Namen.
4. Gleichen Link auf anderem Gerät erneut beanspruchen: abweisen; bereits eingecheckter Originalbrowser bleibt bestehen.
5. Vor Auslosung weder durch direktes Firestore-Abfragen noch in der Oberfläche ein Ergebnis oder Episodenliste für Schüler sichtbar. Gast ohne Mitgliedschaft kann die Presence-Liste nicht lesen.
6. Lehrperson bearbeitet Episoden; setzt falschen Check-in zurück; erhält einen **neuen** Link und der alte ist ungültig.
7. Einen parallelen Check-in unmittelbar vor Abschluss ausprobieren. Entweder er wird vollständig berücksichtigt oder sauber wegen geschlossenem Check-in abgelehnt; **niemals** ausgezählt und anschließend ohne Episode.
8. Lehrperson schließt Check-in. Alle berechtigten Personen erhalten eine unveränderliche individuelle Episode. Gruppengrößen unterscheiden sich höchstens um eins.
9. Die Lehrperson sieht alle Gruppen und kann die Ergebnis-CSV herunterladen. Schüler A kann das Ergebnis von Schüler B nicht lesen.
10. Rundendaten löschen; prüfen, dass die alte Runde und alle Unterkollektionen entfernt sind.
11. Datenzugriffe auf eine zweite, fremde Runde müssen verweigert werden. Firebase Emulator Rules Unit Tests mit parallel ausgeführten Check-ins als zusätzliche sicherheitskritische Freigabeprüfung empfehlen.

*Es wurde hier kein tatsächlicher Firestore-Emulator-/Livetest durchgeführt.*
