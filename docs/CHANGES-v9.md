# Episoden-Glücksrad v9 – Drehverhalten und Ton des Gefühls-Rads

- Nur Schüler-Radanimation aktualisiert: 4.300 ms, je Drehung 6–10 visuelle volle Umdrehungen, kubisches Abbremsen (`easeOutCubic`). Bei Nutzerpräferenz `prefers-reduced-motion` erfolgt keine Animation.
- Holzratschen-Ton beim Drehen (`holz_ratsche.wav`, Loop) und einmaliges `ding.wav` beim Stoppen, Lautstärke 0,85. Quellen zuerst `web/assets/`, andernfalls die öffentlich bereitgestellten Originaldateien unter `https://gamd25.github.io/gefuehle-rad/assets/`. Ist beides nicht erreichbar oder blockiert Browser Ton, bleibt das Rad funktionsfähig, aber stumm. Da der GitHub-Code hier nicht direkt abrufbar war, beruhen diese Originalwerte auf dem zuvor dokumentierten Vergleich; die Audiobytes liegen diesem Paket nicht bei.
- Die visuelle Drehzahl darf zufällig sein. Die Landeposition ergibt sich ausschließlich aus dem zuvor serverseitig freigegebenen Ergebnis (index/episodeId) und einer positiven Winkelrest-Berechnung. Es wird **keine neue Episode gezogen oder gespeichert**.
- Erneutes Drehen bleibt möglich. Ein Wechsel der Runde oder Abmeldung beendet laufenden Ton. Die dauerhafte Episodenanzeige bleibt unverändert.
- Web-App-Kennung `v9 · JS geladen`, neues URL-Cache-Argument für das Hauptmodul.
- Firestore-Regeln, Daten, Backends, die Lehreransicht, GitHub-Workflow und das bestehende Projekt `Gamd25/gefuehle-rad` unverändert.
- Für garantiert exakt dieselben WAV-Dateien diese aus dem Originalrepository nach `web/assets/holz_ratsche.wav` und `web/assets/ding.wav` kopieren und auf GitHub hochladen. Bitte keine ähnlich benannten Fremddateien verwenden.
