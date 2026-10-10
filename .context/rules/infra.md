# Reglas de infraestructura

## Docker

- `Dockerfile` multi-stage: `deps` (instala con `pnpm install --frozen-lockfile` y cache de store), `build` (`prisma generate`, `pnpm build`, `pnpm prune --prod`) y `prod` (solo `node_modules`, `dist`, `package.json`, `prisma`). No agregar pasos de build al stage `prod`.
- Base `node:22-alpine` con tag fijo (nunca `latest`); `pnpm` fijado por `corepack`.
- `patches/` se copia antes del install si existe: pnpm lee los `.patch` de `pnpm.patchedDependencies` antes de instalar y falla con ENOENT si faltan.
- El contenedor corre como usuario no root (`USER` antes de `CMD`), con `HEALTHCHECK` contra el endpoint de salud. `openssl` es necesario para Prisma.
- `TZ` del contenedor es configurable (`ARG`/`ENV TZ`, default `UTC`); el código no depende de ella (ver [`datetime.md`](datetime.md)).
- `.dockerignore` excluye `.env*`, `.git`, `node_modules`, `dist`, tests y docs: ningún secreto entra a la imagen.
- Puerto `3000`, `CMD ["node", "dist/main"]`.

## Docker Compose (solo desarrollo)

`docker-compose.yml` provee postgres, redis, mongo, mailpit y seq con volúmenes y healthchecks, alineados con los valores de `.env.template`. Cada servicio de apoyo es opcional y se levanta por nombre (`docker compose up -d redis`). No se usa como mecanismo de despliegue.

## Salud

`GET /node-starter-backend/api/v1/healthcheck` (sin autenticación, es el único endpoint público de infra). Todas las probes de Kubernetes apuntan ahí. Moverlo exige migrar antes las probes de todos los ambientes y la config de health check de la plataforma: un health check en 404 impide que el pod llegue a Ready y el deploy hace rollback inmediato.

## Kubernetes (`ci/k8s`, Kustomize)

- Estructura `base/` + `overlays/{develop,qa,production}`. La imagen y la versión se fijan por overlay (`images:` de Kustomize) y las actualiza el release.
- Todo Deployment declara `resources.requests` y `limits`, `readinessProbe`, `livenessProbe` y `startupProbe`, y `securityContext` (no root, sin escalado de privilegios, FS raíz de solo lectura con `emptyDir` para `/tmp`, capabilities `drop: ALL`).
- Autoscaling con HPA (CPU y memoria), no réplicas manuales; `PodDisruptionBudget` para mantener disponibilidad durante drenajes.
- Secrets: nunca en `ConfigMap`; siempre en `Secret` (o vault / external-secrets). El repo solo contiene placeholders.
- Todo Ingress declara `nginx.ingress.kubernetes.io/proxy-body-size` mayor al límite máximo de subida de la app (el default de nginx es 1 MB y una subida falla en el ingress antes de llegar a la app).
- Sin namespaces ni dominios reales en el repo: son valores del overlay del equipo que despliega.

## Pipelines

- Etapas: lint, typecheck, test con cobertura, build, scan, deploy. Falla rápido (lint antes que build), cache de dependencias y de capas, `concurrency` para cancelar corridas obsoletas.
- CI de GitHub (`.github/workflows/ci.yml` y `release.yml`) y plantilla alternativa de GitLab (`.gitlab-ci.yml`).
- Los pipelines funcionan al subir el repo sin configurar nada: registro derivado del entorno (`scripts/registry-env.sh`: ghcr.io con `GITHUB_TOKEN` en GitHub, `CI_REGISTRY*` en GitLab, `localhost:5000` local; todo sobreescribible por env). Lo que requiere infraestructura propia (release en GitLab con `GITLAB_TOKEN`, despliegue con `KUBE_CONFIG_B64`) se salta con un aviso y nunca falla el pipeline. Los tests de CI son unitarios, sin base.
- En ramas la imagen se construye sin publicar; en `master`, `qa` y `develop` se publica.
- Los secretos del pipeline van en variables protegidas del proveedor de CI; nunca impresos en logs.
- El `scan` de seguridad (`pnpm audit`, escaneo de imagen) arranca permisivo (reporta, no bloquea) y se vuelve bloqueante cuando se triagean los hallazgos heredados.
- `prisma migrate deploy` se corre como paso explícito y controlado de despliegue, no dentro del arranque de la app; sin migración aplicada los endpoints responden 503 por `P2021`.

## Release (semantic-release)

- Ramas: `main` o `master` (estable, equivalentes: se usa la que exista, y si hay ambas se tratan idénticas), `qa` y `develop` (prerelease). `release.config.cjs` filtra las ramas candidatas por las que existen, porque semantic-release exige que existan. Config en `release.config.cjs`: analiza commits convencionales, genera `CHANGELOG.md`, actualiza `package.json`/lockfile/versión de imagen en los overlays y publica el release en GitHub.
- Crash conocido de `git-log-parser`: reconstruye cada commit con `split()` sobre dos literales de texto legible. Si el mensaje de cualquier commit del rango contiene esos literales, los campos del registro se desincronizan (fecha inválida, hash corrupto, commits perdidos) y falla `release-notes-generator` o el plugin de GitHub. Es determinístico y depende solo del contenido del mensaje. Cierre real: el patch de pnpm `patches/git-log-parser@1.2.1.patch` (declarado en `pnpm.patchedDependencies`) cambia los literales por caracteres de control ASCII; `safeCommitTransform` en `release.config.cjs` queda como respaldo.
- Regla para no repetirlo: nunca citar textualmente los delimitadores de `git-log-parser` en un mensaje de commit o descripción de PR (en comentarios de código es inocuo). Si el log del release reporta menos commits que `git rev-list <ultimoTag>..HEAD | wc -l`, verificar primero que el patch sigue aplicando (un bump de `git-log-parser` puede dejarlo sin efecto).
