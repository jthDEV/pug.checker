# pug.checker

Lokaler PlantUML-Live-Editor: links tippen, rechts sofort gerendert sehen,
mit Zeilennummer und Originalmeldung bei Syntaxfehlern.

## Voraussetzungen

- Docker Desktop (oder Docker Engine) mit Docker Compose v2

Sonst nichts — Node und Java werden in Containern mitgeliefert.

## Installation & Start

```sh
git clone <repo-url> pug.checker
cd pug.checker
npm run docker:up      # baut mit Versions-Stempel (Git-SHA + Zeit)
# oder ohne npm:
docker compose up -d --build
```

Beim ersten Start wird das offizielle PlantUML-Image heruntergeladen
(~250 MB) und das App-Image gebaut. Danach im Browser öffnen:

<http://localhost:3000>

## Stoppen / Neustart

```sh
docker compose down       # Container stoppen und entfernen
docker compose up -d      # wieder starten (ohne Neubau)
docker compose up -d --build   # nach Code-Änderungen neu bauen
```

## Port ändern

Standard ist `3000`. Falls belegt, in der `docker-compose.yml`
unter `app.ports` anpassen, z. B. `"4000:3000"`.

## Versionierung

Das Projekt folgt [Semantic Versioning](https://semver.org/lang/de/).
Änderungen sind in [CHANGELOG.md](CHANGELOG.md) dokumentiert.

Beim Release-Vorgehen:

1. Version in `package.json` bumpen (`major.minor.patch`)
2. Eintrag in `CHANGELOG.md` aus `[Unreleased]` in eine neue Versionssektion verschieben
3. Commit + Tag: `git tag v$(node -p "require('./package.json').version") && git push --tags`
4. Image neu bauen (`npm run docker:up`) — Build-SHA und Build-Zeit werden ins Image geschrieben

Die aktuelle Version ist im Header der UI sichtbar (Hover für Details) und unter
`GET /version` als JSON abrufbar.

## Deinstallation

```sh
docker compose down --rmi all --volumes
```

Entfernt Container, Images und Volumes dieses Projekts.
