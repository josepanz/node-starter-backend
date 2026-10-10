---
description: Refactoriza un archivo TypeScript aplicando TDD, SOLID, KISS y DRY sin romper el contrato HTTP. Uso -> /tdd-refactor <ruta/al/archivo.ts>
---

Ejecutá el flujo completo del agente `.context/agents/tdd-refactor.md` sobre el archivo indicado: $ARGUMENTS

Respetá todas las fases en orden:

- Fase 0: orientar (leer el archivo, sus dependencias, módulo y spec existente)
- Fase 1: diagnóstico SOLID, KISS y DRY
- Fase 2: characterization test (crear el spec si no existe y ponerlo en verde sobre el código sin tocar)
- Fase 3: plan de refactor (presentarlo antes de ejecutar)
- Fase 4: ejecutar paso a paso, corriendo los tests entre cada paso
- Fase 5: actualizar el spec final y resumir

Sin cambiar entradas ni salidas: solo mejorar el código interno.

Respuesta: sin comentarios innecesarios; preguntas solo si hacen falta para entender el comportamiento a preservar.
