# Prüfstatus Spark v2 – 09.11.2026

Von der vorherigen eigenständigen v1 wurde eine **neue** Variante ohne Cloud Functions erstellt. Original-ZIP und altes Repository bleiben unangetastet.

**Lokal ausgeführt:** `node --test tests/*.test.mjs`: alle 4 Testfälle erfolgreich (über 4.800 Kombinationen von 1–160 Teilnehmenden und 1–30 Episoden, Zufallsindexbereich, Zufallsreihenfolge, Fehlereingaben). `npm run check`: alle 3 produktiven JS-Dateien bestanden. Statische Prüfung über `python tools/verify.py` und Archivintegrität separat durchgeführt.

**Nicht ausgeführt:** Echtes Firebase-Deployment, Firestore-Rules-Emulator-Sicherheitstests, Browser-Ausführung mit Firebase SDK, Mehrgeräte-Check-in- und Race-Tests, Google-/Anonymous-Live-Login, Moodle-Feldtest. Firestore-Regel-/Quota-Limits wurden auf Basis der Firebase-Dokumentation konzipiert, **nicht** am Liveprojekt nachgewiesen. Für Unterricht mit echten Namen ist ein erfolgreicher Test und eine Datenschutzfreigabe erforderlich.

**Semantischer Unterschied:** Zufall wird durch den Browser der Lehrperson statt durch unabhängig ausgeführten Servercode erzeugt. Gleichmäßigkeit und atomare Datenfreigabe sind konzipiert, aber Fairness gegen eine absichtlich manipulierte Lehrer-Clientanwendung ist nicht durch Firestore-Rules erzwingbar.
