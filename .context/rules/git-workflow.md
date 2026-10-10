# Flujo de Git

> Es el flujo por defecto, no un gate técnico. Se sigue salvo que el caso tenga una razón real para desviarse (ver Excepciones).

## Por qué existe

Con varias personas trabajando en paralelo, fusionar cada `feature/...` directo contra `develop`/`qa`/`master` genera conflictos recurrentes en archivos compartidos (`package.json` y lockfile por el bump de versión, `CHANGELOG.md` generado por el release automático, migraciones de Prisma con timestamps cercanos) y mezcla en un mismo PR el ruido de integración de ambiente con el código de la tarea. Este flujo aísla ese ruido en ramas puente y deja a `feature/<slug>` como única fuente de la verdad del código.

## Ramas

| Rama | Rol |
|---|---|
| `main` / `master` | Producción. Son equivalentes: el repo funciona igual con cualquiera de las dos (basta con tener una; si existen ambas se tratan idénticas en CI, release y despliegue). En este documento `master` significa "la rama de producción". Solo recibe merges desde `release` o `hotfix/...`. Rama estable de semantic-release. |
| `release` | Integración final del sprint. Se crea al inicio y vive solo durante el sprint. |
| `qa` | Ambiente QA (prerelease). Recibe merges de ramas puente `feature/<slug>-qa`. |
| `develop` | Ambiente DEV (prerelease). Recibe merges de ramas puente `feature/<slug>-dev`. |
| `feature/<slug>` | Única fuente de la tarea. Nace de `master`. Todo commit real de código va acá. |
| `feature/<slug>-dev` | Puente hacia `develop`. Nace de `develop` y recibe el merge de `feature/<slug>`. |
| `feature/<slug>-qa` | Puente hacia `qa`. Nace de `qa` y recibe el merge de `feature/<slug>`. |
| `hotfix/<slug>` | Urgencia de producción. Nace de `master`. |
| `backporting/hotfix-<slug>-to-<destino>` | Puente para replicar un hotfix a `develop`, `qa` o `release`. |

`<slug>` es el identificador de la tarea (ticket o descripción corta en kebab-case). Prefijos válidos además de `feature/`: `bugfix/`, `chore/`, `docs/`, `refactor/`.

## Flujo

1. Inicio de sprint: se crea `release` desde `master`.
2. Desarrollo: cada tarea en su `feature/<slug>` nacida de `master`.
3. DEV: crear `feature/<slug>-dev` desde `develop`, fusionar `feature/<slug>` adentro, resolver conflictos ahí (no en la rama original) y abrir PR hacia `develop`.
4. QA: crear `feature/<slug>-qa` desde `qa`, fusionar `feature/<slug>` (la original, no la `-dev`), resolver conflictos ahí y abrir PR hacia `qa`. Los bugs de QA se corrigen siempre en `feature/<slug>` y se replican a la puente; nunca se parchea directo en `-dev`/`-qa`.
5. Cierre: las tareas aprobadas fusionan `feature/<slug>` (limpia, sin el ruido de las puentes) en `release`; ahí se resuelven los conflictos entre features del sprint y se abre el PR `release` -> `master`.

## Reglas de fusión

- El merge va siempre `feature/<slug>` hacia puente/`release`, nunca al revés.
- `feature/<slug>` no se pushea directo a `develop`/`qa`/`release`/`master`.
- Nada de `--squash` ni rebase sobre ramas ya pusheadas: reescribe historia compartida.
- Un fix de QA es un commit en `feature/<slug>`, replicado después a la puente.

## Excepciones

- Hotfix: `hotfix/<slug>` desde `master`, merge directo a `master`. El backport a `develop`, `qa` y `release` (si existe) es obligatorio, con su propia rama `backporting/...` y PR; si no, la próxima release lo pisa. Un hotfix no está cerrado hasta abrir los backports.
- Cambio trivial de un solo archivo sin riesgo de conflicto (typo, config, doc): se puede saltar la puente.
- Pedido explícito del responsable para una tarea puntual.

## Guardrails para el asistente de IA

- Nunca commitear ni pushear sobre `develop`, `qa`, `release`, `master` o `main`.
- Sin indicación contraria, partir de `feature/<slug>` desde `master`.
- Confirmar antes de crear la rama `release` o abrir el PR final `release` -> `master`: afectan a todo el equipo.
- No pushear sin pedido explícito; el trabajo queda local.

## Commits y hooks

Conventional commits en español (ver [`conventions.md`](conventions.md)). Husky corre `lint-staged` en pre-commit, `commitlint` en commit-msg y `pnpm build` en pre-push. No saltearlos (`--no-verify`): se arregla la causa.

## Merge Request / Pull Request

- Un PR por rama puente; el título sigue el formato de commit convencional (`tipo(alcance): descripción`) porque en merges por squash o fast-forward el título pasa a ser el commit que lee semantic-release.
- Usar la plantilla `.gitlab/merge_request_templates/default.md` (o la de GitHub): descripción, tipo de cambio, checklist (pruebas ejecutadas, documentación actualizada, revisores etiquetados) y contexto adicional.
- Antes de abrirlo: `pnpm prisma generate`, `pnpm build`, `pnpm lint`, `pnpm test` en verde y sin cambios ajenos al dominio de la tarea (`git diff origin/<base>...HEAD --stat`).
- Un PR de integración de ambiente (`-dev`/`-qa`) no lleva código nuevo: solo el merge de `feature/<slug>` y la resolución de conflictos.
- Aprobación de al menos un revisor (`CODEOWNERS`) y pipeline verde para mergear. No mergear con el pipeline en rojo ni saltear el review.
- Si la tarea agrega migraciones o variables de entorno, se listan en la descripción como pasos de implementación (migración a aplicar, env vars nuevas, rollback).

## Release

- semantic-release corre en `develop` y `qa` (prerelease: `1.2.0-develop.1`, `1.2.0-qa.1`) y en `master` (estable). Calcula la versión con el tipo de commit más alto del lote: `feat` y `refactor` = minor, `fix`, `perf`, `docs` y `ci` = patch, `BREAKING CHANGE` (o `!`) = major; `chore`, `test` y `style` no liberan.
- El release commitea `CHANGELOG.md`, `package.json`, lockfile y la versión de imagen de los overlays con el mensaje `chore(release): <versión> [skip ci]`. Nunca editar esos archivos a mano en una puente: son la fuente de los conflictos que este flujo evita.
- Promoción de versión: `develop` -> `qa` -> `master` mediante las ramas puente y `release`, no por merges directos entre ambientes.
- Hotfix: el release de `master` sale del merge del `hotfix/<slug>`; los backports a `develop`/`qa` generan sus propios prerelease.
- Ver los detalles de configuración y el crash conocido de `git-log-parser` en [`infra.md`](infra.md).
