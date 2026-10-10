#!/bin/sh
# Actualiza imagen y tag del overlay de Kustomize que corresponde a la rama liberada.
# Uso: replace-version.sh <version> <rama>   (develop -> develop, qa -> qa, main o master -> production)
# La imagen sale de scripts/registry-env.sh (IMAGE_REPOSITORY sobreescribible). Sin overlay para la rama: exit 0.
set -e

VERSION=$1
BRANCH=$2

case "$BRANCH" in
  develop) OVERLAY=develop ;;
  qa) OVERLAY=qa ;;
  main | master) OVERLAY=production ;;
  *)
    echo "[replace-version] La rama '$BRANCH' no tiene overlay: nada que actualizar"
    exit 0
    ;;
esac

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
# shellcheck source=scripts/registry-env.sh
. "$SCRIPT_DIR/registry-env.sh"
FILE_PATH="$SCRIPT_DIR/../ci/k8s/overlays/$OVERLAY/kustomization.yaml"

if [ ! -f "$FILE_PATH" ]; then
  echo "[replace-version] No existe $FILE_PATH: nada que actualizar"
  exit 0
fi

echo "[replace-version] $OVERLAY: $IMAGE_REPOSITORY:$VERSION"
sed -i.tmp -E \
  -e "s|^([[:space:]]*newName:).*|\1 $IMAGE_REPOSITORY|" \
  -e "s|^([[:space:]]*newTag:).*|\1 \"$VERSION\"|" \
  "$FILE_PATH"
rm -f "$FILE_PATH.tmp"
