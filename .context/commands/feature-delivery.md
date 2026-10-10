---
description: Ciclo completo de entrega (SDD con OpenSpec, TDD por slice, review, testing, lint/build, E2E, docs, commit/PR). Uso -> /feature-delivery <descripción del cambio>
---

Ejecutá el flujo definido en `.context/skills/feature-delivery/SKILL.md` sobre el cambio indicado: $ARGUMENTS

Seguí los pasos y el orden del skill: SDD con el flujo de `openspec-workflow` (explorar, proponer o actualizar el change); por slice, TDD, checkpoint de `agents/code-reviewer.md` y de `agents/testing-agent.md`, iterando hasta verde; al cerrar el cambio completo, lint/build, E2E según `rules/e2e-local-testing.md`, documentación, commit y PR.

Respuesta: reportar solo los checkpoints relevantes (hallazgos corregidos, tests agregados, bugs de E2E) y el resumen final. Preguntar solo si hace falta una decisión fuera del alcance acordado.
