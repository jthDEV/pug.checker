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

## Deinstallation

```sh
docker compose down --rmi all --volumes
```

Entfernt Container, Images und Volumes dieses Projekts.
