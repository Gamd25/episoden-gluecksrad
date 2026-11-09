# Änderungen v10 – 09.11.2026

Ausgangsbasis: unverändertes, vollständig neu entpacktes v9-Quellpaket.

- Die zwei Nutzertexte „Deine Episode steht fest. Drücke „Rad drehen“ für die Animation.“ und „Das Rad zeigt wieder deine gespeicherte Episode.“ werden nicht mehr angezeigt.
- Das Live-Statusfeld ist beim Aufrufen und nach dem Drehen verborgen; während der Animation erscheint nur „Das Glücksrad dreht …“.
- Der Löschvorgang verlangt keine Eingabe des Bestätigungsworts `LÖSCHEN` mehr, sondern nur einen einfachen Ja/Nein-Bestätigungsdialog mit Warnung vor endgültiger Löschung. Die Lehrperson muss weiterhin per Google angemeldet und Eigentümerin der Runde sein.
- Die v10-Kennung und ein neues Cache-Busting der Startdatei machen die bereitgestellte Version erkennbar.
- Firestore-Regeln, Auslosungs-/Verteilungscode, WAV-Abspiellogik, Audio-Assets und Backend unverändert.
- Keine echten Firebase-Livetests; nur lokale Syntax-, Vertrags- und Logiktests.
