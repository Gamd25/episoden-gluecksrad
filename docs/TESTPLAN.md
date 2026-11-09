# Testplan v3

## Lokal erfolgreich durchführbar (ohne Firebase)

- Node-JavaScript-Syntax von App, Backend und Normalisierung.
- Namen: Normalisierung, Unicode-Namen, ungültige Namen, Eindeutigkeit bei Groß-/Kleinschreibung.
- Episodenanzahl von 1 bis 30; zufällige Verteilung für 1 bis 160 Personen mit maximal einer Person Unterschied je Gruppe.

## Unbedingt mit Emulator und mehreren Browsern nachholen (nicht als bestanden behaupten)

1. Regeldatei kompilieren. `sharedRounds` erstellen; Zugriffe auf alte `/rounds` weiterhin prüfen.
2. Zwei Schüler mit unterschiedlichen Testnamen melden sich gleichzeitig an. Beide dürfen sich in derselben Runde nur einmal anmelden.
3. Zwei Browser verwenden denselben Namen mit unterschiedlicher Groß-/Kleinschreibung. Genau einer darf erfolgreich sein.
4. Anonymer Browser ohne Check-in versucht `presence`-Liste, `view` mit Episoden, `results` zu lesen. Muss verweigert werden.
5. Eingecheckter Browser sieht live die beiden Namen, aber vor Abschluss keine Episoden.
6. Browser versucht fremden `authorized`- und `results`-Datensatz zu lesen oder Gruppenliste abzufragen. Muss verweigert werden.
7. Browser versucht fremde Einträge, abgeschlossene Runden oder Ergebnisse zu verändern. Muss verweigert werden.
8. Lehrperson entfernt einen fehlerhaften Check-in; derselbe Name soll anschließend wieder anmeldbar sein.
9. Start eines Check-ins gleichzeitig mit dem abschließenden Klick: Es darf nur ganz vor dem Gate-Abschluss oder gar nicht eingecheckt werden. Keine Teil-Zuteilung.
10. Mehrere Browser mit offenen Ergebnissen erhalten nach `published` ihre eigene Episode, kein fremdes Ergebnis; Gruppen maximal 1 Person Differenz.
11. Browser/Netz während `closing` unterbrechen. Abschluss nach erneutem Lehrperson-Klick durchführen, ohne Doppelverteilung.
12. Alte `/rounds` prüfen; keine Änderung der bestehenden Daten.
13. Testnamen und Testdaten nach Abschluss löschen.

**Status:** Diese Firestore-/Web-Live- und Emulatorprüfungen sind noch NICHT durchgeführt. Bis dahin keine realen Schülerdaten eintragen.
