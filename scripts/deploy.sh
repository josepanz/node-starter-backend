#!/bin/sh

set -e  # Detener la ejecución si algún comando falla

echo "Init build node-starter-backend"

# Set Variables
VERSION=$1
BRANCH=$2
LAST_VERSION=$3
IMAGE_NAME=${IMAGE_NAME}
REGISTRY_DOMAIN=${REGISTRY_DOMAIN}
REGISTRY=${REGISTRY}
REGISTRY_USER=${REGISTRY_USER}
REGISTRY_PASSWORD=${REGISTRY_PASSWORD}


echo "Last Release is: $LAST_VERSION"
echo "Building version ${VERSION} from branch ${BRANCH}"

TAG=${VERSION}


IMAGE_TAG=${REGISTRY_DOMAIN}/ruta/${IMAGE_NAME}:${TAG}

echo "Start deployment of ${IMAGE_TAG}"

# Login to registry
echo "Logging in to custom registry ${REGISTRY}..."
echo "${REGISTRY_PASSWORD}" | docker login ${REGISTRY} -u ${REGISTRY_USER} --password-stdin || { echo "Docker login failed"; exit 1; }

# Build the Docker image
echo "Building Docker image..."
docker build -t ${IMAGE_TAG} . --platform linux/amd64 || { echo "Docker build failed"; exit 1; }

# Push the Docker image to the custom registry
echo "Pushing Docker image to ${REGISTRY}..."
docker push ${IMAGE_TAG} || { echo "Docker push failed"; exit 1; }

echo "Update argo deployment"

case "$BRANCH" in
  develop)
    echo "Deploying to development environment"
    # Add your argo deployment commands for the development environment here
    ;;
  qa)
    echo "Deploying to QA environment"
    # Add your argo deployment commands for the QA environment here
    ;;
  master)
    echo "Deploying to production environment"
    # Add your argo deployment commands for the production environment here
    ;;
  *)
    echo "Branch does not trigger a deployment"
    ;;
esac


if [ $? -ne 0 ]; then
    echo "Deployment failed"
    exit 1
fi

echo "Deployment successful"