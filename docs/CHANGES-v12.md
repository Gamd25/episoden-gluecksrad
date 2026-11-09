# Änderungen v12 – 09.11.2026

Ausgangsbasis: vollständiges unverändertes v11-Original-ZIP; sämtliche Originaldateien vor der Änderung aus dem ZIP entpackt.

- In der Schüleransicht wird die gesamte Ergebniskarte (`#myEpisode`) erst nach dem Abschluss einer aktiv vom Schüler gestarteten Radanimation angezeigt. Vor dem ersten Dreh und während jedes Drehens bleibt sie ausgeblendet.
- Beim erneuten Laden der Seite wird die Episodenzuordnung weiter aus Firebase geladen, aber die Ergebniskarte erscheint erst nach einem erneuten aktiven Dreh. Die gespeicherte Zuteilung wird nicht erneut ausgelost.
- Animationsergebnis wird nur für die aktuell authentifizierte Teilnehmer- und Rundenkombination aufgedeckt. Ungültige/fehlende Zuteilungen, neu beginnende Sitzung und nicht veröffentlichte Runden halten die Karte unsichtbar.
- Der veraltete Satz zur automatischen Ergebnisanzeige beim erneuten Öffnen wurde auf „Diese Zuteilung bleibt gespeichert.“ gekürzt; kein Hinweis vor dem Dreh hinzugefügt.
- Sichtbare JS-Versionskennung und Cache-Busting auf v12 aktualisiert.
- Firestore-Regeln, Lehrerfunktionen, Namenseingabe, Drehparameter, Audio und die eigentliche Zuteilungslogik bleiben unverändert.
- Tests sind offline; keine GitHub- oder Firebase-Live-Bereitstellung behauptet.
