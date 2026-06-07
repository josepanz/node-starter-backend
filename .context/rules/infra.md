# Infrastructure rules

- Dockerfiles: node:22-alpine base, USER node before CMD
- Kubernetes: readiness and liveness probes in every deployment
- Secrets: never in ConfigMap, always in Secret or vault
- Pipelines: stages = lint → test → build → scan → deploy
