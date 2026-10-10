---
name: feature-delivery
description: Orquesta el ciclo completo de entrega de una feature o fix mediano/grande: SDD con OpenSpec, TDD por slice, checkpoint de code review, checkpoint de testing, iteración hasta verde, lint/build, E2E, documentación, commit y PR. No usar para un fix de una línea.
---

# /feature-delivery

Encadena las piezas de proceso del repo (skill `openspec-workflow`, agentes `code-reviewer` y `testing-agent`, `rules/test.md`, `rules/e2e-local-testing.md`, `/commit`) en un flujo con checkpoints, en vez de aplicarlas de memoria.

## Uso

```
/feature-delivery <descripción del cambio completo, con sus slices/endpoints>
```

## Cuándo usarlo

- El cambio toca más de un método/endpoint relacionado o varios slices relacionados (una historia completa).
- Va a terminar en commit + PR (no es un experimento descartable).

Para un fix de una línea alcanza con `/code-review` o `/testing-agent` directo sobre el archivo.

## Slice

Un slice es un grupo cohesivo de métodos/endpoints que se implementan y revisan juntos (ej. "detalle", "liquidación", "reporte"). Los pasos 1-5 se repiten por slice; los pasos 6-11 corren una sola vez al cerrar el último slice.

## Flujo

### Antes del primer slice

0. SDD: si ya existe un change de OpenSpec para este trabajo, actualizarlo con los slices nuevos (`openspec-workflow`, operación "actualizar"); nunca crear un change nuevo para lo que extiende el mismo. Si es un cambio distinto, operación "proponer", completando antes `.context/documentation/SDD_template.md` si es mediano/grande.

### Por cada slice (pasos 1-5)

1. Revisar `tasks.md` del change para ubicar las tasks del slice.
2. TDD rojo a verde: `.spec.ts` primero, confirmar que falla, implementar lo mínimo, refactorizar en verde. JSDoc obligatorio en todo método nuevo.
3. Checkpoint de review: flujo de `agents/code-reviewer.md` sobre cada archivo tocado. Corregir sin pedir confirmación todo hallazgo CRITICAL (seguridad, guard faltante, transacción faltante).
4. Checkpoint de testing: flujo de `agents/testing-agent.md`: ¿cubre comportamiento y no solo líneas?, ¿faltan casos de error y borde (403 de guard, 404, fallo del upstream)?
5. Iterar 3-4 hasta verde. Marcar las tasks `[x]` recién cuando el slice está realmente verde.

### Al cerrar el cambio completo (pasos 6-11)

6. `pnpm prisma generate`, `pnpm build`, `pnpm lint`, `pnpm test` (con `--maxWorkers=2`). Todo verde antes de seguir.
7. E2E real contra servicios locales según `rules/e2e-local-testing.md`. Los bugs encontrados se corrigen en el momento y se anotan en `design.md` (hallazgos post-implementación).
8. Documentación: `tasks.md` completo, `.env.template` y README si hay env vars o comandos nuevos, operación "sincronizar" de `openspec-workflow` si el change está completo.
9. Commit: seguir `.context/commands/commit.md`. Push a la rama activa solo si se pidió.
10. PR con la plantilla de `.gitlab/merge_request_templates/default.md`, hacia la rama puente que corresponda (ver `rules/git-workflow.md`).
11. Devolver el enlace del PR/MR y el estado del checklist.

## Reglas duras

- Nunca saltar el checkpoint de review o de testing "para ir más rápido".
- Nunca marcar un slice como cerrado con tests en rojo.
- Nunca correr los pasos 6-11 antes de terminar todos los slices.
- Si se pidieron varios slices en la misma rama y el mismo PR, no crear ramas ni PRs nuevos por slice.
- Nunca archivar el change de OpenSpec hasta que el PR esté mergeado.
