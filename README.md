# UMG Parqueo Frontend

## Local

```bash
npm install
npm run dev
```

`http://localhost:3000`

## Docker — Dev

```bash
# Primera vez
docker compose -f docker-compose.dev.yml up --build

# Día a día
docker compose -f docker-compose.dev.yml up
```

Los cambios en el código se reflejan en vivo. Si alguien agrega dependencias (`package.json`), volver a correr con `--build`.

## Docker — Prod

```bash
# Linux / macOS
DOCKER_BUILDKIT=1 docker compose -f docker-compose.prod.yml up --build -d

# Windows PowerShell
$env:DOCKER_BUILDKIT=1; docker compose -f docker-compose.prod.yml up --build -d
```
