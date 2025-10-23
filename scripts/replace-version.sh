#!/bin/sh

set -e  # Detener la ejecución si algún comando falla

echo "prepare update argo image version"

# Set Variables
VERSION=$1
BRANCH=$2

SCRIPT_DIR=$(dirname "$0")  # Directorio donde se encuentra el script
BASE_DIR=$(realpath "$SCRIPT_DIR")  # Ruta absoluta del directorio
FILE_PATH=$(realpath "$BASE_DIR/../ci/$BRANCH/$3") 

TAG=${VERSION}

echo "Updating version of node-starter-backend in $BRANCH environment path: $FILE_PATH"
sed -i.bak -E "s|(registry-local\.dominio\.com\.py:port/ruta/node-starter-backend):[0-9]+\.[0-9]+\.[0-9]+(-[a-z0-9.]+)?|\1:$TAG|" "$FILE_PATH"


# Confirmar el cambio
if [ $? -eq 0 ]; then
  echo "Image 'ruta/node-starter-backend' version updated to $TAG in $BRANCH"
else
  echo "Error updating image version."
  exit 1
fi