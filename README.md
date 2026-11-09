# Episoden-Glücksrad – Spark v4: gemeinsamer Check-in-Link und dauerhafte Episodenanzeige

**Stand: 09.11.2026.** Für das **neue** Repository `Gamd25/episoden-gluecksrad` und das **separate** Firebase-Projekt `episoden-gluecksrad`. Das ursprüngliche `Gamd25/gefuehle-rad` wird weder verändert noch überschrieben.

## Neues Verhalten

1. Lehrperson meldet sich mit Google an und erstellt eine Runde mit einem Titel und 1–30 frei benannten Episoden. Es ist **keine vorab importierte Namensliste** nötig.
2. Die Lehrperson kopiert den **einen gemeinsamen Klassenlink** aus den Rundendetails und verteilt ihn beispielsweise über Moodle.
3. Schülerinnen und Schüler öffnen denselben Link, geben ihren eigenen Namen ein und klicken einmal auf **Ich bin dabei!**. Nach erfolgreicher Registrierung sehen sie die live aktualisierte Liste aller eingecheckten Namen. Besucher ohne erfolgreichen Check-in sehen diese Liste nicht.
4. Firestore legt in **einer Transaktion** eine belegte normalisierte Namenskennung, die Sitzungsberechtigung und den angezeigten Check-in an. Ein Name kann in derselben Runde nicht zweimal belegt werden (Groß-/Kleinschreibung und mehrfache Leerzeichen werden angeglichen). Ein zweiter Klick derselben Sitzung führt nicht zu einem zweiten Eintrag.
5. Die Lehrperson prüft die angezeigten Namen **gegen die tatsächlich Anwesenden**, entfernt gegebenenfalls falsche Einträge und beendet dann den Check-in ausdrücklich. Erst danach werden alle tatsächlich Eingecheckten zufällig und möglichst gleichmäßig verteilt.
6. Die Auslosung ist im Lehrpersonen-Browser berechnet und wird **erst nach einem Firestore-Zustandsabschluss gemeinsam mit den Ergebnissen veröffentlicht**. Teilnehmende sehen nur ihre eigene Episode, die Lehrperson alle Gruppen. **Die Episode steht nach der Freigabe dauerhaft deutlich unter dem Glücksrad und wird beim späteren Öffnen im selben Browser mit noch vorhandener anonymer Firebase-Anmeldung aus dem gespeicherten Ergebnis wiederhergestellt.**
7. Die Lehrperson kann eine Runde inklusive ihrer zugehörigen Daten löschen.

### Wichtige Sicherheitsgrenze

**Namenseingabe ist kein Identitätsnachweis.** Wer den Klassenlink besitzt, kann einen fremden Namen zuerst belegen oder weitere anonyme Browseridentitäten verwenden. Dies lässt sich allein mit GitHub Pages, Firebase Anonymous Auth und einer frei eingegebenen Namensangabe **nicht sicher ausschließen**. Die Lösung reduziert versehentliche Mehrfach-Check-ins und verhindert konkurrierende Belegungen derselben Namenskennung; sie beweist nicht eine Person = ein Konto. Für verifizierte Schüleridentität wäre eine von der Schule verwaltete Anmeldung (z. B. Moodle LTI/OIDC) oder ein individueller Zugang erforderlich.

**Vor dem Einsatz mit echten Schülerdaten:** fachliche Datenschutzfreigabe (sichtbare Namensliste!), Berechtigungs-/Missbrauchsprüfung und ein echter Mehrgeräte-Test. Der Code wurde lokal syntaktisch und über Unit-Tests überprüft. Ein echter Firebase-Sicherheitsregel-Emulatortest und ein Live-Test wurden **nicht** durchgeführt.

## Aktualisierung der bestehenden GitHub-Pages-Installation – OHNE Node.js

1. **Nur** das Repository `Gamd25/episoden-gluecksrad` aktualisieren. Die Änderungen betreffen `web/app.js`, `web/index.html`, `web/style.css` sowie die neue Datei `web/episode-result.js`.
2. Diese Dateien an den vorhandenen Pfaden im GitHub-Repository ersetzen bzw. ergänzen. Das Archiv „GitHub-Update v4“ enthält nur diese vier Dateien. Bei bestehendem Repository bietet sich GitHub Desktop an; über die Weboberfläche können vorhandene Dateien auch einzeln bearbeitet und die neue Datei angelegt werden. **Keine ZIP-Datei als einzige Datei hochladen.**
3. GitHub → **Actions**: erfolgreiche GitHub-Pages-Veröffentlichung mit grünem Häkchen prüfen.
4. https://gamd25.github.io/episoden-gluecksrad/ mit Strg+F5 neu laden.
5. Mit **erfundenen Namen** testen: Einchecken → Lehrerabschluss → Episode deutlich unter dem Rad → Seite schließen und im gleichen Browser mit denselben Browserdaten erneut öffnen → dieselbe Episode erscheint wieder. Ebenso mit zwei Schüler-Browsersitzungen und einem Versuch, denselben Namen doppelt einzutragen, prüfen.

**Für dieses v4-Update müssen die bereits aktiven v3-Firestore-Regeln nicht erneut veröffentlicht werden**, weil die Datenbankzugriffe, Datenstrukturen und Sicherheitsregeln unverändert bleiben. Die bestehenden Runden und Ergebnisse werden nicht migriert oder verändert.

**Grenze:** Nach Löschen von Browserdaten, im privaten Fenster nach dessen Schließen oder auf einem anderen Gerät kann Firebase Anonymous Auth eine neue Identität vergeben. Aus dem gemeinsamen Link und dem frei eingegebenen Namen darf keine alte Zuteilung an eine neue Identität ausgegeben werden. Für die verlässliche geräteübergreifende Wiederherstellung wäre eine authentifizierte Schulidentität erforderlich.

## Betrieb und Grenzen

- Spark: Keine Cloud Functions, keine Zahlungsinformationen für diese Architektur erforderlich, aber Firestore-/Auth-Kontingente sind beschränkt.
- Browser der Lehrperson ist der Auslosungsoperator, keine unabhängig verifizierbare Server-Auslosung.
- Maximal 30 Episoden, maximal 160 eingecheckte Personen zur Auslosung. Ein hartes serverseitiges Check-in-Kontingent oder umfassender Missbrauchs-/Rate-Schutz ist **nicht** umgesetzt. Bei mehr als 160 Einträgen verweigert die Anwendung die Auslosung.
- Bereits begonnene alte persönliche-Link-Runden bleiben in `/rounds` gespeichert, werden aber im neuen Lehrerbereich (der `/sharedRounds` nutzt) nicht angezeigt. Keines dieser Dokumente wird durch das Update automatisch verändert oder gelöscht.
- Bei Verlust der anonymen Firebase-Identität (Browserdaten löschen, anderes Gerät) ist die frühere Teilnahme nicht automatisch wiederherstellbar. Die Lehrperson kann den Eintrag vor der Auslosung entfernen, um eine erneute Registrierung zu erlauben.
- Wenn die Verbindung während des zweiphasigen Abschlusses abbricht, erscheint die Runde gegebenenfalls als `closing` und die Lehrperson kann die Veröffentlichung erneut starten. Vor der Veröffentlichung erscheinen keine Episodenergebnisse.

## Aktueller Teststand v5 (09.11.2026)

Der Status-Listener vermeidet falsche Entfernungsmeldungen nach einem neuen Check-in.
Im Kopfbereich erscheint **v5**; fehlt es auf der Website, wurde das GitHub-Update noch nicht wirksam veröffentlicht.
Die geänderten Frontend-Dateien erfordern **keine neuen Firestore-Regeln**. Siehe `docs/CHANGES-v5.md`.


## v6 Update (09.11.2026)
GitHub-Pages-Auslieferung mit `v6 · JS geladen` pruefen; direkter Loeschknopf je Runde in der Lehrer-Uebersicht. Details siehe START-HIER-GITHUB.md und docs/CHANGES-v6.md.
