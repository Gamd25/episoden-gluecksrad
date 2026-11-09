# Architektur v3 – gemeinsamer Link

Alte Datenstruktur `/rounds` und deren Zugriffsregeln bleiben unverändert erhalten. Neue Runden liegen ausschließlich unter `/sharedRounds/{rid}` (zufällige UUID im Klassenlink).

- `/sharedRounds/{rid}`: Eigentümer UID, Titel, private Episoden, Status.
- `/sharedRounds/{rid}/gate/status`: lesbarer Check-in-Zustand (`checkin`, `closing`, `published`); wird von jeder Studententransaktion gelesen.
- `/sharedRounds/{rid}/names/{canonicalName}`: einmalig erzeugte Namenskennung; **nicht** von Teilnehmenden gelistet oder gelesen. Eine zweite Belegung derselben Kennung darf nicht als Update erfolgen.
- `/sharedRounds/{rid}/authorized/{anonymousUid}`: anonyme Sitzung und Namenskennung; nur eigene Dokumente und Eigentümer lesbar.
- `/sharedRounds/{rid}/presence/{anonymousUid}`: sichtbar für Lehrperson und erfolgreich eingecheckte Personen, nicht für bloße Besucher.
- `/sharedRounds/{rid}/view/state`: sichtbarer Teilnehmerstatus ohne Episoden, bis die Veröffentlichung erfolgt.
- `/sharedRounds/{rid}/results/{anonymousUid}`: eigene Episode erst nach Veröffentlichung; vollständige Ergebnisliste nur für Eigentümer.

Der studentische Check-in schreibt per Firestore-Transaktion `names`, `authorized`, `presence`; Regeln verifizieren die gemeinsame Änderung mittels `getAfter()`. Die Identität wird nur über eine anonyme UID und einen selbst eingegebenen Namen gebunden. Ein manipulierender Gast kann sich als anderer Name ausgeben – das bleibt ein **bewusster Sicherheitshinweis, keine gelöste Authentifizierung**.

Die Lehrperson schließt die Runde in Phase 1 durch eine atomare Änderung des Gate-Dokuments auf `closing`. Eine konkurrierende Check-in-Transaktion, die das Gate als offen gelesen hat, wird wiederholt und danach abgelehnt. Erst dann wird die nun stabile Anwesenheitsliste abgefragt. In Phase 2 werden alle Ergebnisse und der Status gemeinsam in einer Transaktion veröffentlicht. Bei Verbindungsabbruch bleibt der `closing`-Zustand reproduzierbar; eine erneute manuelle Finalisierung ist vorgesehen.

Keine Cloud Functions, keine SMS, kein App-Check-/Rate-Limit-Schutz, keine Moodle-Konto-Kopplung. Das ist nicht identisch mit einer serverseitig verifizierten Ziehung.
