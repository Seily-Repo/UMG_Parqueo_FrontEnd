# Comandos basicos
## DEV
### Primera vez
docker-compose -f docker-compose.dev.yml up --build
### Dia a dia
docker-compose -f docker-compose.dev.yml up

## PROD
### Linux / macOS
DOCKER_BUILDKIT=1 docker-compose -f docker-compose.prod.yml up --build -d
### Windows PowerShell
$env:DOCKER_BUILDKIT=1; docker-compose -f docker-compose.prod.yml up --build -d