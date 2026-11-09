# Episoden-Glücksrad – Spark v3: gemeinsamer Check-in-Link

**Stand: 09.11.2026.** Für das **neue** Repository `Gamd25/episoden-gluecksrad` und das **separate** Firebase-Projekt `episoden-gluecksrad`. Das ursprüngliche `Gamd25/gefuehle-rad` wird weder verändert noch überschrieben.

## Neues Verhalten

1. Lehrperson meldet sich mit Google an und erstellt eine Runde mit einem Titel und 1–30 frei benannten Episoden. Es ist **keine vorab importierte Namensliste** nötig.
2. Die Lehrperson kopiert den **einen gemeinsamen Klassenlink** aus den Rundendetails und verteilt ihn beispielsweise über Moodle.
3. Schülerinnen und Schüler öffnen denselben Link, geben ihren eigenen Namen ein und klicken einmal auf **Ich bin dabei!**. Nach erfolgreicher Registrierung sehen sie die live aktualisierte Liste aller eingecheckten Namen. Besucher ohne erfolgreichen Check-in sehen diese Liste nicht.
4. Firestore legt in **einer Transaktion** eine belegte normalisierte Namenskennung, die Sitzungsberechtigung und den angezeigten Check-in an. Ein Name kann in derselben Runde nicht zweimal belegt werden (Groß-/Kleinschreibung und mehrfache Leerzeichen werden angeglichen). Ein zweiter Klick derselben Sitzung führt nicht zu einem zweiten Eintrag.
5. Die Lehrperson prüft die angezeigten Namen **gegen die tatsächlich Anwesenden**, entfernt gegebenenfalls falsche Einträge und beendet dann den Check-in ausdrücklich. Erst danach werden alle tatsächlich Eingecheckten zufällig und möglichst gleichmäßig verteilt.
6. Die Auslosung ist im Lehrpersonen-Browser berechnet und wird **erst nach einem Firestore-Zustandsabschluss gemeinsam mit den Ergebnissen veröffentlicht**. Teilnehmende sehen nur ihre eigene Episode, die Lehrperson alle Gruppen.
7. Die Lehrperson kann eine Runde inklusive ihrer zugehörigen Daten löschen.

### Wichtige Sicherheitsgrenze

**Namenseingabe ist kein Identitätsnachweis.** Wer den Klassenlink besitzt, kann einen fremden Namen zuerst belegen oder weitere anonyme Browseridentitäten verwenden. Dies lässt sich allein mit GitHub Pages, Firebase Anonymous Auth und einer frei eingegebenen Namensangabe **nicht sicher ausschließen**. Die Lösung reduziert versehentliche Mehrfach-Check-ins und verhindert konkurrierende Belegungen derselben Namenskennung; sie beweist nicht eine Person = ein Konto. Für verifizierte Schüleridentität wäre eine von der Schule verwaltete Anmeldung (z. B. Moodle LTI/OIDC) oder ein individueller Zugang erforderlich.

**Vor dem Einsatz mit echten Schülerdaten:** fachliche Datenschutzfreigabe (sichtbare Namensliste!), Berechtigungs-/Missbrauchsprüfung und ein echter Mehrgeräte-Test. Der Code wurde lokal syntaktisch und über Unit-Tests überprüft. Ein echter Firebase-Sicherheitsregel-Emulatortest und ein Live-Test wurden **nicht** durchgeführt.

## Aktualisierung der bereits eingerichteten GitHub-Pages-Installation – OHNE Node.js

**A. Zuerst Firestore-Regeln (notwendig):** Firebase Console → Projekt `episoden-gluecksrad` → Cloud Firestore → **Regeln**. **Den gesamten** Inhalt der neuen Datei `firestore.rules` anstelle des bisherigen Regeleditor-Inhalts einfügen und **Veröffentlichen** klicken. Die Datei behält die bisherigen Regeln für `/rounds` bei und ergänzt ausschließlich das getrennte Datenmodell `/sharedRounds`.

**B. Dann GitHub aktualisieren:** Nur im Repository `Gamd25/episoden-gluecksrad` die Dateien im Ordner `web/` auf diese neue Version aktualisieren (bevorzugt GitHub Desktop oder Git; bei Browser-Upload auf korrekte Pfade und Ersetzen vorhandener Dateien achten). Der existierende `.github/workflows/pages.yml`-Workflow bleibt unverändert. Nach dem GitHub-Commit unter **Actions** den erfolgreichen Pages-Deploy prüfen.

**C. Mit erfundenen Namen testen:** https://gamd25.github.io/episoden-gluecksrad/ → Lehrerbereich → Test-Runde anlegen → Klassenlink kopieren → mit zwei privaten Browsern/Endgeräten jeweils einen erfundenen Namen eingeben → gleichzeitig denselben Namen versuchen → Lehrperson Teilnehmerliste prüfen → Check-in schließen → individuelle Ergebnisse und Gruppenliste kontrollieren. Die Regeln müssen auch im Rules Playground oder vorzugsweise Emulator gegen unerlaubte Reads/Writes geprüft werden.

### Aktualisierte Web-Dateien

- `web/index.html` – Namenseingabe und gemeinsamer Klassenlink
- `web/app.js` – neue Abläufe und Kopierfunktion
- `web/shared-backend.js` – Transaktionen, Schließen, Auslosung, Entfernen, Löschen
- `web/shared-logic.js` – Namens- und Episodenvalidierung
- `web/style.css` – Felder und Layout
- `firestore.rules` – ergänzte Zugriffsregeln für `/sharedRounds`

**Nicht verändert:** Firebase-Webkonfiguration `web/config.js`, alte Daten in `/rounds`, vorhandener GitHub-Pages-Workflow und das Repository des ursprünglichen Gefühls-Rads. Die alte Datei `web/spark-backend.js` bleibt aus Gründen der Rückverfolgbarkeit im Archiv, wird aber von v3 nicht mehr eingebunden.

## Betrieb und Grenzen

- Spark: Keine Cloud Functions, keine Zahlungsinformationen für diese Architektur erforderlich, aber Firestore-/Auth-Kontingente sind beschränkt.
- Browser der Lehrperson ist der Auslosungsoperator, keine unabhängig verifizierbare Server-Auslosung.
- Maximal 30 Episoden, maximal 160 eingecheckte Personen zur Auslosung. Ein hartes serverseitiges Check-in-Kontingent oder umfassender Missbrauchs-/Rate-Schutz ist **nicht** umgesetzt. Bei mehr als 160 Einträgen verweigert die Anwendung die Auslosung.
- Bereits begonnene alte persönliche-Link-Runden bleiben in `/rounds` gespeichert, werden aber im neuen Lehrerbereich (der `/sharedRounds` nutzt) nicht angezeigt. Keines dieser Dokumente wird durch das Update automatisch verändert oder gelöscht.
- Bei Verlust der anonymen Firebase-Identität (Browserdaten löschen, anderes Gerät) ist die frühere Teilnahme nicht automatisch wiederherstellbar. Die Lehrperson kann den Eintrag vor der Auslosung entfernen, um eine erneute Registrierung zu erlauben.
- Wenn die Verbindung während des zweiphasigen Abschlusses abbricht, erscheint die Runde gegebenenfalls als `closing` und die Lehrperson kann die Veröffentlichung erneut starten. Vor der Veröffentlichung erscheinen keine Episodenergebnisse.
