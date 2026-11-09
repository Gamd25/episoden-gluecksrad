# Episoden-Glücksrad – Spark-Version v2 (09.11.2026)

**Ohne Cloud Functions und ohne Blaze-Abo.** Eigenständige Webanwendung für das bereits erstellte Firebase-Projekt `episoden-gluecksrad` (Spark). Das ursprüngliche GitHub-Projekt `Gamd25/gefuehle-rad` wurde nicht verändert. Die ZIP enthält bereits die mitgeteilte Firebase-Webkonfiguration.

## Sofort-Anleitung (Windows)

1. ZIP in einen neuen Ordner entpacken. Firebase-Projekt, Google-/Anonymous-Authentifizierung und Firestore sind bereits in der Firebase Console eingerichtet.
2. Falls nicht installiert: **Node.js 22 oder neuer** von https://nodejs.org/ installieren.
3. `JETZT-VEROEFFENTLICHEN.cmd` im entpackten Ordner doppelklicken. Die Datei verwendet `npx firebase-tools`, öffnet bei Bedarf die Firebase-Anmeldung und veröffentlicht **nur Firestore-Sicherheitsregeln und Firebase Hosting** in `episoden-gluecksrad`.
4. Nach erfolgreicher Veröffentlichung https://episoden-gluecksrad.web.app im Browser öffnen. Bei Google-Login-Problemen in Firebase Authentication → Settings → Authorized domains prüfen, ob `episoden-gluecksrad.web.app` eingetragen ist.
5. Mit **erfundenen Testnamen** eine Runde erstellen, 2–3 Links auf getrennten Geräten oder privaten Browserfenstern anklicken und die Auslosung prüfen. Erst nach einem echten Test mit mehreren Geräten und Datenschutzfreigabe Schülerdaten eingeben.

**Alternativ im Terminal:**

```bash
npx --yes firebase-tools login
npx --yes firebase-tools deploy --project episoden-gluecksrad --only firestore:rules,hosting
```

Der verwendete Firebase-Account benötigt Berechtigung zur Veröffentlichung dieses Projekts. Prüfe den Projektnamen vor dem Einsatz. Keine Cloud-Functions-Installation, kein Firebase-Blaze-Upgrade, keine Konto-/Service-Account-Schlüssel in diesem Paket.

## Ablauf

1. Lehrperson meldet sich via Google an, erstellt eine Runde und gibt 1–160 unterschiedliche Personennamen sowie 1–30 frei benannte Episoden ein.
2. Die Anwendung gibt einmalige, zufällige **persönliche Einladungslinks** als UTF-8-CSV aus. Sie müssen **individuell** übermittelt werden (nicht die ganze CSV an die Klasse geben).
3. Jede Person öffnet ihren persönlichen Link, klickt **„Ich bin dabei!“** und wird per Firestore-Transaktion genau einmal gezählt. Reine Besucher ohne Check-in können die Liste der eingecheckten Namen nicht abrufen.
4. Eingecheckte Personen sehen Namen und Anzahl der schon Eingecheckten. Episoden und Ergebnisse werden noch nicht ausgegeben.
5. Die Lehrperson kontrolliert die Liste, kann einen Eintrag aufheben (dadurch wird ein neuer Link erzeugt) und vor dem Abschluss Episoden bearbeiten.
6. Erst wenn die Lehrperson **„Check-in abschließen und auslosen“** auswählt, berechnet **ihr Browser** die Zuteilung per Web Crypto. In **einer Firestore-Transaktion** werden die gültigen Check-ins geprüft, die Episode je Person gespeichert und die Runde freigegeben. Bei einem konkurrierenden Check-in wird die Transaktion erneut ausgeführt; es gibt keine teilweise Veröffentlichung.
7. Alle freigegebenen Teilnehmenden sehen nur ihre eigene Episode, animiert durch ein Rad. Die Lehrperson kann alle Gruppen als CSV exportieren und die Runde löschen.

## Technische und Sicherheitsgrenzen

- **Spark statt Blaze:** Firebase Authentication, Cloud Firestore und Firebase Hosting im Rahmen der jeweils gültigen kostenlosen Kontingente; **keine Cloud Functions**. Die Anwendung benötigt Internet. Bei Quotenüberschreitung kann sie nicht weiterarbeiten.
- **Vertrauensmodell:** Die Lehrperson ist die vertrauenswürdige Instanz für die Auslosung. Firestore verhindert konkurrierende Check-ins und legt Ergebnisse atomar offen, beweist aber **nicht**, dass eine manipulierte Lehrer-Webanwendung tatsächlich fair ausgelost hat. Diese Variante ist hinsichtlich manipulationssicherer zentraler Zufallsauslosung nicht gleichwertig mit einer unabhängig serverseitigen Auslosung.
- Der persönliche Einladungslink ist ein **Bearer-Token**. Wer ihn vor der vorgesehenen Person benutzt, kann ihn beanspruchen; Moodle-Login-Verifikation (LTI/OIDC) ist nicht enthalten. Auch bei anonymen Firebase-Konten ist keine Identitätskontrolle garantiert.
- Bei verlorener Browser-Sitzung nach dem Check-in muss die Lehrperson den Check-in ggf. aufheben und einen neuen Link ausgeben. Der alte Link wird dabei ungültig.
- Öffne Einladungslinks in einem eigenen Tab, möglichst nicht in Moodle-iFrames. Falls du dich als Lehrperson auf demselben Gerät schon per Google angemeldet hast, nutze ein privates Browserfenster für einen Schüler-Test.
- Firestore-Regeln erteilen nur der jeweiligen Lehrperson Verwaltungsrechte, nur eingecheckten Personen Zugriff auf die Check-in-Namensliste und nur authentifizierten Teilnehmern Zugriff auf ihr eigenes Ergebnis **nach** Veröffentlichung. Vorherige Episodenlisten und ungenutzte Links dürfen Schüler nicht abrufen.
- **Datenschutz:** Die Anzeige der Namen gegenüber anderen eingecheckten Personen und die Nutzung von Google/Firebase muss vor dem Einsatz mit tatsächlichen Schülerdaten im Schulkontext freigegeben sein. Kein Versand kompletter Einladungs-CSV in einen Klassenkanal.
- Ein `firebase deploy` überschreibt die Firestore-Regeln im **neuen** Projekt `episoden-gluecksrad`, niemals die Regeln im älteren `gefuehle-rad`-Projekt. Der Projektname wird bei der Bereitstellung ausdrücklich übergeben.
- Keine von uns bestätigte Firebase-Veröffentlichung oder realer Sicherheits-/Mehrgeräte-Emulatortest. Details: `docs/PRUEFSTATUS.md`.

## Dateien

- `web/index.html`, `web/style.css`, `web/app.js`: Oberflächen und Lehrer-/Schüleransichten.
- `web/config.js`: bereits eingetragene öffentliche Firebase-Webkonfiguration.
- `web/spark-backend.js`: Firestore-Transaktionen, Check-in, Rotation, Freigabe, Löschung.
- `web/draw-logic.js`: Web-Crypto-Mischung und möglichst gleichmäßige Verteilung.
- `firestore.rules`: restriktive Schutzregeln für alle Daten.
- `firebase.json`: ausschließlich Firestore-Regeln und Hosting, keine Functions.
- `.github/workflows/pages.yml`: optionale Bereitstellung nur der Weboberfläche via GitHub Pages (separates Repository; neue Domain in Firebase Authentication freigeben).
- `tests/draw.test.mjs`: Verteilungstests, `npm test`.
- `JETZT-VEROEFFENTLICHEN.cmd`: Windows-Veröffentlichung.

## Tests

```bash
npm test
npm run check
python tools/verify.py
```

Die Tests sind lokale Syntax-, Verteilungs- und statische Konformitätsprüfungen. Ein Firestore-Emulator-Sicherheitsregellauf, echte Google-/Anonymous-Authentifizierung, Runden mit gleichzeitigen Klicks und Hosting-Veröffentlichung **müssen noch real geprüft werden**.
