#!/bin/sh
# Construye la imagen y, si hay registro y credenciales, la publica.
# Uso: deploy.sh <version> [rama]
#
# Funciona sin configurar nada: los defaults salen de scripts/registry-env.sh (ghcr.io en GitHub, registro del
# proyecto en GitLab, localhost:5000 en local). PUSH=0 fuerza solo build; PUSH=1 fuerza el push.
# Nunca falla por falta de infraestructura: sin docker o sin credenciales, avisa y termina con exit 0.
set -e

VERSION=${1:-dev}
BRANCH=${2:-local}

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
# shellcheck source=scripts/registry-env.sh
. "$SCRIPT_DIR/registry-env.sh"

if ! command -v docker >/dev/null 2>&1; then
  echo "[deploy] docker no esta disponible: se omite la construccion de la imagen."
  exit 0
fi

IMAGE_TAG="$IMAGE_REPOSITORY:$VERSION"
PUSH=${PUSH:-auto}
if [ "$PUSH" = "auto" ]; then
  if [ -n "$REGISTRY_PASSWORD" ] && [ -n "$REGISTRY_USER" ]; then PUSH=1; else PUSH=0; fi
fi

echo "[deploy] Construyendo $IMAGE_TAG (rama $BRANCH)"
docker build -t "$IMAGE_TAG" --platform linux/amd64 "$SCRIPT_DIR/.."

if [ "$PUSH" = "1" ]; then
  if [ -n "$REGISTRY_PASSWORD" ]; then
    echo "$REGISTRY_PASSWORD" | docker login "$REGISTRY" -u "$REGISTRY_USER" --password-stdin
  fi
  docker push "$IMAGE_TAG"
  echo "[deploy] Imagen publicada: $IMAGE_TAG"
else
  echo "[deploy] Sin credenciales de registro: imagen construida localmente, sin push ($IMAGE_TAG)."
fi
