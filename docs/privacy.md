# Datenschutz & Datenspeicherung

## Was wird gespeichert?

Wenn die **Gesichtserkennung aktiviert** wird (opt-in), speichert das Backend:

| Daten | Format | Ort |
|---|---|---|
| Name der Person | Text | `backend/data/identities.json` |
| Gesichts-Embedding (512-dim Vektor) | JSON | `backend/data/identities.json` |

Ein *Embedding* ist eine mathematische Darstellung des Gesichts – kein Foto.
Es kann nicht direkt zur Rekonstruktion des Gesichts verwendet werden.

## Was wird NICHT gespeichert?

- Kein Video oder Einzelbild
- Keine Übertragung an externe Server oder Cloud-Dienste
- Keine Speicherung ohne explizite Bestätigung ("Ja, das bin ich")

## Opt-in-Prozess

1. Nutzer aktiviert den Toggle **"Erkennung: AN"** in der UI
2. Bei Wiedererkennung erscheint der Banner: *"Erkannt: [Name]? Ja / Nein"*
3. Nur bei Klick auf **"Ja, das bin ich"** wird das Embedding gespeichert

## Daten löschen

- **Einzeln**: Im Panel "Gespeicherte Identitäten" → Button "Löschen"
- **Alle**: Datei `backend/data/identities.json` löschen

## Modell

- InsightFace **buffalo_s** (ArcFace w600k_r50)
- Wird beim ersten Start automatisch heruntergeladen (~150 MB)
- Läuft lokal via ONNX Runtime – keine Cloud-Inferenz
