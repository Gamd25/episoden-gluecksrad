# Episoden-Glücksrad v7 (2026-11-09)

- Korrigiert die Löschroutine für Firestore: nur `results`, `presence`, `authorized`, `names` werden aufgelistet.
- Die von den Regeln nicht auflistbaren Dokumente `view/state` und `gate/status` werden einzeln mit `getDocFromServer` geprüft und bei Existenz gelöscht.
- Elternrunde wird zuletzt gelöscht; eine unterbrochene Löschung kann erneut ausgeführt werden.
- Neuer, sichtbarer Versionsstand `v7 · JS geladen`; HTML und `shared-backend.js` tragen versionsgebundene URLs.
- Der Text „Dein Check-in wurde von der Lehrperson entfernt“ ist bereits seit v5 nicht mehr in der Anwendung enthalten. V7 lädt neue JS-Dateien; eine alte Anzeige weist auf einen älteren Browser-/GitHub-Stand hin.
- Keine Änderungen an den Firestore-Regeln, Teilnehmerdaten, Auslosungsalgorithmus oder dem Repository `gefuehle-rad`.
- Sicherheitsgrenze: echte Firebase-/Mehrgeräte-Tests stehen aus. Keine echten Schülerdaten verwenden.
