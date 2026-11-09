# Episoden-Glücksrad v8 (2026-11-09)

- Schüleransicht: Nach dem **manuellen Abschluss des Check-ins durch die Lehrperson** und bestätigter Firestore-Zuteilung erscheint der Button **„Rad drehen“**.
- Der Button kann nach jedem vollständigen Dreh erneut gedrückt werden („Noch einmal drehen“); während der Animation ist er gesperrt.
- Jeder Dreh ist ausschließlich eine visuelle Wiederholung und endet bei der bereits in Firestore gespeicherten Episode. Keine neue Auslosung, keine Änderung von Gruppen, keine Firestore-Schreibaktion.
- Vor Veröffentlichung, ohne gültige Zuordnung, bei anderer Benutzerkennung/Runde und beim nächsten Check-in ist der Button verborgen bzw. gesperrt.
- Die dauerhafte Textanzeige der zugeteilten Episode unter dem Rad bleibt erhalten, auch während des Drehens und nach erneutem Öffnen mit derselben Browseranmeldung.
- Version in HTML und JS auf **v8 · JS geladen** gesetzt; Cache-Parameter `v=8-20261109` verhindert veraltetes Hauptskript beim Seitenaufruf.
- `web/wheel-spin-guard.js` und `tests/replay-wheel-v8.test.mjs` ergänzen die unabhängige Prüfung der Spin-Freigabe.
- Bestehende Firestore-Regeln, Daten, veröffentlichte Runden, UI-Löschfunktion und `Gamd25/gefuehle-rad` bleiben unverändert.
- Keine Live-Behauptung: Node-Tests sind lokal, Firebase-/Mehrgeräte-Test steht aus.
