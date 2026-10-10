#!/bin/sh
# Resuelve el registro de imagenes segun el entorno. Se carga con `. scripts/registry-env.sh`.
# Toda variable puede sobreescribirse por entorno: REGISTRY, IMAGE_REPOSITORY, REGISTRY_USER, REGISTRY_PASSWORD.
#   GitHub Actions: ghcr.io con GITHUB_TOKEN
#   GitLab CI:      registro del proyecto (variables CI_REGISTRY* predefinidas)
#   Local:          localhost:5000 (sin credenciales)

to_lower() {
  printf '%s' "$1" | tr '[:upper:]' '[:lower:]'
}

if [ -n "$GITHUB_ACTIONS" ]; then
  REGISTRY=${REGISTRY:-ghcr.io}
  IMAGE_REPOSITORY=${IMAGE_REPOSITORY:-ghcr.io/$(to_lower "${GITHUB_REPOSITORY:-owner/node-starter-backend}")}
  REGISTRY_USER=${REGISTRY_USER:-$GITHUB_ACTOR}
  REGISTRY_PASSWORD=${REGISTRY_PASSWORD:-$GITHUB_TOKEN}
elif [ -n "$GITLAB_CI" ]; then
  REGISTRY=${REGISTRY:-$CI_REGISTRY}
  IMAGE_REPOSITORY=${IMAGE_REPOSITORY:-$CI_REGISTRY_IMAGE}
  REGISTRY_USER=${REGISTRY_USER:-$CI_REGISTRY_USER}
  REGISTRY_PASSWORD=${REGISTRY_PASSWORD:-$CI_REGISTRY_PASSWORD}
else
  REGISTRY=${REGISTRY:-localhost:5000}
  IMAGE_REPOSITORY=${IMAGE_REPOSITORY:-localhost:5000/node-starter-backend}
  REGISTRY_USER=${REGISTRY_USER:-}
  REGISTRY_PASSWORD=${REGISTRY_PASSWORD:-}
fi

export REGISTRY IMAGE_REPOSITORY REGISTRY_USER REGISTRY_PASSWORD
