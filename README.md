# Episoden-Glücksrad – Spark v9: gemeinsamer Check-in-Link, dauerhaftes Ergebnis und Original-Radverhalten

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

1. Die kleine **GitHub-Update-v9-ZIP** entpacken.
2. **Nur** das Repository `Gamd25/episoden-gluecksrad` aktualisieren. Im Ordner `web/` `app.js` und `index.html` ersetzen sowie `wheel-motion.js` und `wheel-audio.js` ergänzen. Die ZIP nicht unverändert als einzelne Datei hochladen.
3. Optional für selbstständige Tondateien aus `Gamd25/gefuehle-rad/assets/` die unveränderten Original-Dateien `holz_ratsche.wav` und `ding.wav` ins Verzeichnis `web/assets/` kopieren. Ohne diese Kopien versucht die Anwendung die entsprechenden öffentlichen GitHub-Pages-Dateien des Gefühls-Rads abzuspielen. Ob diese URLs noch erreichbar sind, konnte hier nicht live geprüft werden.
4. Unter GitHub → Actions den erfolgreichen Pages-Deploy prüfen. `https://gamd25.github.io/episoden-gluecksrad/?release=v9-20261109` öffnen; die Kennung `v9 · JS geladen` muss erscheinen.
5. Mit fiktiven Namen prüfen, dass das Rad vor Freigabe verborgen bleibt, nach der Freigabe 4,3 Sekunden dreht und bei wiederholtem Drehen immer bei derselben Episode hält.

Keine Änderungen an `firestore.rules`, Firestore-Daten, Firebase-Projekt, altem Repository oder GitHub-Workflow nötig.

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


## v7 Update (09.11.2026)
GitHub-Pages-Auslieferung mit `v7 · JS geladen` pruefen; direkter Loeschknopf je Runde in der Lehrer-Uebersicht. Details siehe START-HIER-GITHUB.md und docs/CHANGES-v7.md.


Version v7: Korrektur der Firestore-Löschung und Cache-Busting für die echte JS-Version. Siehe START-HIER-GITHUB.md.

## Neu in v8

Nach der Freigabe durch die Lehrperson startet jede eingecheckte Person ihr Glücksrad selbst mit „Rad drehen“ und kann das Drehen beliebig oft wiederholen. Die unveränderliche Firestore-Zuteilung bleibt bestehen; vor Freigabe gibt es keinen Dreh zur Episodenzuteilung.

## v9: Originaldrehung und Ton

Das Schüler-Rad dreht 4,3 Sekunden, mit 6–10 zufälligen *visuellen* Umdrehungen und kubischem Abbremsen. Ziel bleibt die zuvor freigegebene Episode. Währenddessen wird die Holzratsche wiederholt abgespielt, beim Stopp einmal der Ding-Klang (jeweils Lautstärke 0,85). Original-WAV-Dateien bitte vorzugsweise aus `Gamd25/gefuehle-rad/assets/` nach `web/assets/` kopieren; andernfalls verweist die Anwendung auf die entsprechenden GitHub-Pages-Dateien des Gefühls-Rads. Die Original-WAV-Dateien sind nicht Bestandteil dieses ZIP.
