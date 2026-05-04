# Changelog

Alle nennenswerten Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.1.0/),
und das Projekt folgt [Semantic Versioning](https://semver.org/lang/de/).

## [Unreleased]

## [0.5.0] - 2026-05-04

### Added
- Zeilennummern im Editor mit synchronem Scroll
- Hervorhebung der fehlerhaften Zeile in der Zeilennummern-Spalte (rot)

## [0.4.0] - 2026-05-04

### Added
- Typeahead-Filter im Tabellenkopf der Gantt-Syntax-Referenz
- Expliziter Scroll für den Editor-Bereich (vertikal + horizontal)

### Fixed
- Scroll in der Referenz-Tabelle funktionierte wegen `<details>`-Flex-Quirks nicht zuverlässig

## [0.3.0] - 2026-05-04

### Changed
- Fehlerpanel sitzt jetzt in der rechten Spalte direkt unter dem Diagramm
  (vorher volle Breite am unteren Rand)

## [0.2.0] - 2026-05-04

### Added
- Gantt-Syntax-Referenz unter dem Editor (alphabetisch sortiert, Konstrukt + Beispiel)
- Aufklappbar via `<details>`-Element

## [0.1.0] - 2026-05-04

### Added
- Split-View-Editor: Quelltext links, gerendertes Diagramm rechts
- Live-Render mit 300 ms Debounce
- Fehleranzeige mit Zeilennummer und Originalmeldung des PlantUML-Servers
  (extrahiert aus den `X-PlantUML-Diagram-Error*`-Headern)
- Speichern als `.puml`-Datei
- Öffnen-Dialog für `.puml`/`.txt`/`.plantuml`-Dateien
- Auto-Save des aktuellen Standes in `localStorage`
- Tab-Taste fügt zwei Leerzeichen ein
- Docker-Setup mit zwei Containern (PlantUML-Server + Node-24-App)

[Unreleased]: https://github.com/<user>/pug.checker/compare/v0.5.0...HEAD
[0.5.0]: https://github.com/<user>/pug.checker/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/<user>/pug.checker/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/<user>/pug.checker/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/<user>/pug.checker/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/<user>/pug.checker/releases/tag/v0.1.0
