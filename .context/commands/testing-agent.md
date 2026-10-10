---
description: Genera o revisa los tests unitarios de un archivo TypeScript aplicando las reglas de testing. Uso -> /testing-agent <ruta/al/archivo.ts>
---

Ejecutá el flujo completo del agente `.context/agents/testing-agent.md` sobre el archivo indicado: $ARGUMENTS

Respetá `.context/rules/test.md` (AAA, mocks `const` a nivel de módulo, nombres en español, `jest.clearAllMocks()`), con SOLID, KISS, DRY y clean code. Corré jest con `--maxWorkers=2`.

Respuesta: sin comentarios innecesarios; hacé solo las preguntas imprescindibles para entender el comportamiento a probar.
