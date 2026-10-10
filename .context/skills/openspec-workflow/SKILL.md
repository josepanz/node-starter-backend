---
name: openspec-workflow
description: Flujo de desarrollo guiado por specs (OpenSpec) para trabajo mediano/grande: explorar, proponer, implementar, actualizar, sincronizar y archivar un change. Usar cuando el alcance conviene acordarse antes de codear.
---

# OpenSpec: desarrollo guiado por specs

Estructura (ver `openspec/README.md` y `openspec/config.yaml`):

```
openspec/
├── config.yaml                  contexto del proyecto y reglas por artefacto
├── templates/                   plantillas de proposal, design, tasks y spec
├── specs/<capability>/spec.md   specs vigentes (fuente de verdad)
└── changes/
    ├── <change>/                proposal.md, design.md, tasks.md, specs/ (deltas)
    └── archive/YYYY-MM-DD-<change>/
```

Si el CLI `@fission-ai/openspec` está disponible se puede usar (`npx @fission-ai/openspec ...`); este skill describe el flujo igual sin depender de él.

## Operaciones

1. Explorar: pensar el problema, leer código y comparar opciones antes de comprometer un change. No implementa ni escribe artefactos salvo pedido explícito.
2. Proponer: crea `openspec/changes/<nombre>/` y genera en orden `proposal.md` (por qué y qué cambia), `specs/**` (deltas por capability con escenarios Given/When/Then y RFC 2119), `design.md` (decisiones con su fundamento, mapeo a capas `api/` y `modules/`, guards por endpoint) y `tasks.md` (checklist jerárquico, TDD primero). Para cambios medianos/grandes, usar de insumo `.context/documentation/SDD_template.md` completo.
3. Implementar: recorrer `tasks.md` una tarea a la vez, marcando `- [ ]` a `- [x]`, respetando `.context/rules/*`. Pausar si aparece una decisión no cubierta por el diseño.
4. Actualizar: reconciliar los artefactos de un change ya creado cuando algo cambió. Nunca toca código.
5. Sincronizar: mergear los deltas de `specs/` del change a `openspec/specs/<capability>/spec.md` sin archivar.
6. Archivar: validar completitud (tasks todas `[x]`), ofrecer sincronizar specs si falta y mover el change a `changes/archive/YYYY-MM-DD-<nombre>/`. Solo cuando el PR está mergeado.

## Checklist de archivado

- [ ] El CHANGELOG va a reflejar la feature (semantic-release, conventional commits).
- [ ] No quedan `TODO` ni `console.log` de depuración.
- [ ] `.env.template` está actualizado si el change agregó variables.
- [ ] Migraciones de Prisma generadas y documentadas como paso de implementación.

## Reglas de config.yaml

Solo se aceptan `rules` para los artefactos reales (`proposal`, `specs`, `design`, `tasks`). Si un bullet contiene "texto: más texto" va entre comillas, o YAML lo interpreta como mapa y descarta toda la regla del artefacto. Para tunear el estándar se edita `config.yaml`, no los artefactos ya generados.
