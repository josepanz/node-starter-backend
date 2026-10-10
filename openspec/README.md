# OpenSpec: desarrollo guiado por specs

Estructura mínima para acordar el alcance de un cambio antes de codear. El flujo operativo (explorar, proponer, implementar, actualizar, sincronizar, archivar) está en [`.context/skills/openspec-workflow/SKILL.md`](../.context/skills/openspec-workflow/SKILL.md).

```
openspec/
├── config.yaml                  contexto del proyecto y reglas por artefacto
├── templates/                   plantillas: proposal, design, tasks y spec
├── specs/<capability>/spec.md   specs vigentes (fuente de verdad; vacío al inicio)
└── changes/
    ├── <change>/                proposal.md, design.md, tasks.md, specs/ (deltas)
    └── archive/                 changes completados: YYYY-MM-DD-<change>/
```

## Cómo empezar un change

1. Copiar `templates/proposal.md`, `design.md` y `tasks.md` a `openspec/changes/<nombre-en-kebab-case>/`; los deltas de spec van en `changes/<nombre>/specs/<capability>/spec.md` (plantilla `templates/spec.md`).
2. Para cambios medianos o grandes, completar antes [`.context/documentation/SDD_template.md`](../.context/documentation/SDD_template.md) y usarlo de insumo.
3. Implementar tarea por tarea marcando `- [x]` en `tasks.md`, con TDD (`.context/rules/test.md`).
4. Al cerrar y mergear, sincronizar los deltas a `specs/` y mover el change a `changes/archive/`.

## Reglas por artefacto

Viven en `config.yaml` (`rules.proposal`, `specs`, `design`, `tasks`). El schema solo acepta esas cuatro claves. Las convenciones de implementación y verificación ya están en `.context/rules/typescript.md` y `test.md`.

## Checklist de archivado

- [ ] El CHANGELOG va a reflejar la feature (semantic-release, conventional commits).
- [ ] No quedan `TODO` ni `console.log` de depuración.
- [ ] `.env.template` está actualizado si el change agregó variables.
- [ ] Las migraciones de Prisma están generadas y documentadas como paso de implementación.

## Qué no va acá

Specs de negocio de un producto concreto, PRDs ni datos de clientes: este directorio es la estructura y las plantillas del starter. Cada proyecto derivado llena `specs/` y `changes/` con lo suyo.
