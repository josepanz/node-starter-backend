# 📋 Software Design Document (SDD)
**Nombre del proyecto / feature:** _[Escribí el nombre acá]_
**Versión:** 1.0
**Fecha:** _[DD/MM/AAAA]_
**Product Owner:** _[Nombre]_
**Estado:** 🟡 Borrador / 🟢 Aprobado / 🔴 En revisión

---

> **¿Cómo usar este documento?**
> Completá cada sección en orden. Las preguntas en _cursiva_ son guías para ayudarte a pensar — no hace falta responderlas literalmente, son para orientarte. Si una sección no aplica a lo que estás describiendo, escribí `No aplica` y explicá brevemente por qué. Mientras más detalle pongas, mejor podremos construirlo.

---

## 1. Resumen ejecutivo

> **¿Qué es esto en pocas palabras?**
> Describí el feature o sistema como si se lo explicaras a alguien que no sabe nada del proyecto. Máximo 5 oraciones. Esto es lo primero que va a leer el equipo.

_Ejemplo: "Este feature permite a los vendedores generar una cotización automática desde el CRM sin necesidad de pasar por el área de finanzas para aprobaciones menores a $5.000."_

**Descripción:**

```
[Escribí acá]
```

---

## 2. Problema que resuelve

> **¿Qué está pasando hoy que queremos mejorar o resolver?**
> _¿Cuál es el dolor actual? ¿Qué hace la gente hoy para resolver esto? ¿Qué tan frecuente es este problema? ¿A quién le afecta?_

**Situación actual:**

```
[Describí cómo se hace hoy, aunque sea manual o ineficiente]
```

**Impacto del problema:**

```
[¿Cuánto tiempo pierde la gente? ¿Cuántos usuarios se ven afectados? ¿Hay pérdida de dinero o riesgo?]
```

---

## 3. Objetivo

> **¿Qué queremos lograr con esto?**
> _¿Cómo sabemos que tuvimos éxito? Tratá de que los objetivos sean medibles. Evitá objetivos vagos como "mejorar la experiencia"._

**Objetivos principales** (qué debe lograr este desarrollo):

- [ ] _Ejemplo: Reducir el tiempo de generación de cotizaciones de 2 días a 5 minutos_
- [ ] 
- [ ] 

**Métricas de éxito** (cómo vamos a medir que funcionó):

| Métrica | Valor actual | Valor esperado |
|---------|-------------|----------------|
| _Ejemplo: Tiempo promedio de aprobación_ | _2 días_ | _< 1 hora_ |
| | | |
| | | |

---

## 4. Usuarios y roles

> **¿Quién va a usar esto?**
> _¿Hay diferentes tipos de usuarios que hacen cosas distintas? ¿Qué puede hacer cada uno? ¿Hay usuarios que solo pueden ver y no modificar?_

Para cada tipo de usuario, completá:

### 4.1 Usuario: [Nombre del rol — Ej: Vendedor]

**¿Quién es?** _Describí brevemente este tipo de usuario_

```
[Ej: Es la persona del equipo comercial que trata directamente con el cliente]
```

**¿Qué puede hacer?**

- [ ] _Ej: Crear una nueva cotización_
- [ ] _Ej: Ver sus propias cotizaciones_
- [ ] _Ej: Descargar el PDF de la cotización_

**¿Qué NO puede hacer?** (igual de importante)

- [ ] _Ej: Ver cotizaciones de otros vendedores_
- [ ] _Ej: Modificar precios base_

---

### 4.2 Usuario: [Nombre del rol — Ej: Supervisor / Admin]

**¿Quién es?**

```
[Describí]
```

**¿Qué puede hacer?**

- [ ] 
- [ ] 

**¿Qué NO puede hacer?**

- [ ] 
- [ ] 

> 📌 **Repetí esta sección (4.x) por cada tipo de usuario diferente que exista.**

---

## 5. Flujos principales (cómo funciona paso a paso)

> **¿Cómo usa el sistema un usuario de principio a fin?**
> Esta es la sección más importante. Describí el recorrido completo del usuario, como si estuvieras contando una historia. Cada flujo es un camino distinto que puede tomar el usuario.
>
> _¿Por dónde entra el usuario? ¿Qué ve primero? ¿Qué decisiones toma? ¿Qué pasa cuando todo sale bien? ¿Qué pasa cuando algo falla?_

---

### Flujo 1: [Nombre del flujo — Ej: Crear una cotización]

**¿Cuándo ocurre este flujo?**
_Ej: Cuando un vendedor quiere generar una nueva cotización para un cliente_

```
[Describí el contexto]
```

**Pasos del flujo:**

| Paso | ¿Quién actúa? | ¿Qué hace / qué ve? | ¿Qué pasa después? |
|------|--------------|---------------------|-------------------|
| 1 | _Ej: Vendedor_ | _Entra al sistema y hace clic en "Nueva cotización"_ | _Aparece un formulario_ |
| 2 | | | |
| 3 | | | |
| 4 | | | |
| 5 | | | |

**¿Qué pasa si algo sale mal?** (casos de error o excepción)

_Ej: Si el cliente no existe en el sistema → ¿se crea? ¿se bloquea? ¿se avisa a alguien?_

```
[Describí qué debería pasar en los casos que no son el camino feliz]
```

---

### Flujo 2: [Nombre del flujo]

**¿Cuándo ocurre este flujo?**

```
[Describí el contexto]
```

**Pasos del flujo:**

| Paso | ¿Quién actúa? | ¿Qué hace / qué ve? | ¿Qué pasa después? |
|------|--------------|---------------------|-------------------|
| 1 | | | |
| 2 | | | |
| 3 | | | |

**¿Qué pasa si algo sale mal?**

```
[Describí]
```

> 📌 **Agregá tantos flujos como sean necesarios. Un flujo = un camino de uso del sistema.**

---

## 6. Reglas de negocio

> **¿Cuáles son las reglas que el sistema debe respetar siempre?**
> _¿Hay límites de montos, fechas, cantidades? ¿Hay condiciones para que algo se apruebe o se rechace? ¿Hay validaciones obligatorias? ¿Hay lógica de cálculo específica?_
>
> Pensá en esto como "las leyes del sistema". Si el sistema las rompe, algo está mal.

| # | Regla | Ejemplo |
|---|-------|---------|
| RN-01 | _Ej: Una cotización solo puede aprobarse si el monto es menor a $5.000_ | _Si monto > $5.000 → requiere aprobación de gerencia_ |
| RN-02 | | |
| RN-03 | | |
| RN-04 | | |
| RN-05 | | |

---

## 7. Datos que maneja el sistema

> **¿Qué información necesita guardar, procesar o mostrar el sistema?**
> _¿Qué datos ingresa el usuario? ¿Qué datos calcula el sistema automáticamente? ¿Qué datos vienen de otro sistema o fuente externa? ¿Cuáles son obligatorios y cuáles opcionales?_

### 7.1 Datos que ingresa el usuario

| Campo | ¿Qué es? | ¿Obligatorio? | Ejemplo |
|-------|----------|--------------|---------|
| _Ej: Nombre del cliente_ | _Nombre completo o razón social_ | ✅ Sí | _"Empresa XYZ S.A."_ |
| _Ej: Fecha de entrega_ | _Fecha estimada de entrega_ | ❌ No | _15/08/2025_ |
| | | | |
| | | | |

### 7.2 Datos que el sistema genera o calcula solo

| Dato | ¿Cómo se calcula o de dónde viene? |
|------|-----------------------------------|
| _Ej: Número de cotización_ | _Se genera automáticamente, correlativo_ |
| _Ej: Total con IVA_ | _Subtotal × 1.21_ |
| | |

### 7.3 Datos que vienen de otros sistemas (integraciones)

| Dato | Sistema origen | ¿Cómo llega? |
|------|---------------|--------------|
| _Ej: Precio del producto_ | _ERP / catálogo_ | _Consulta en tiempo real_ |
| | | |

---

## 8. Notificaciones y comunicaciones

> **¿El sistema avisa a alguien cuando pasa algo?**
> _¿Hay emails, mensajes, alertas o notificaciones que deben enviarse? ¿A quién? ¿Cuándo? ¿Qué dice el mensaje?_

| Evento que lo dispara | ¿A quién se notifica? | Canal (email / push / SMS) | Mensaje aproximado |
|----------------------|----------------------|---------------------------|-------------------|
| _Ej: Cotización aprobada_ | _Vendedor que la creó_ | _Email_ | _"Tu cotización #123 fue aprobada"_ |
| | | | |
| | | | |

---

## 9. Pantallas e interfaz (descripción visual)

> **¿Qué debe ver el usuario?**
> No hace falta que sea un diseño, solo describí con palabras qué información debe aparecer en cada pantalla y qué puede hacer el usuario desde ahí.
> _¿Hay listas, formularios, botones, filtros, reportes? ¿Cómo se navega entre pantallas?_

### Pantalla: [Nombre — Ej: Lista de cotizaciones]

**¿Para qué sirve esta pantalla?**

```
[Describí]
```

**¿Qué información muestra?**

- _Ej: Lista de cotizaciones del vendedor logueado_
- _Ej: Columnas: número, cliente, fecha, monto total, estado_
- 

**¿Qué puede hacer el usuario desde acá?**

- _Ej: Filtrar por estado (pendiente / aprobada / rechazada)_
- _Ej: Hacer clic en una cotización para verla en detalle_
- 

---

### Pantalla: [Nombre]

**¿Para qué sirve esta pantalla?**

```
[Describí]
```

**¿Qué información muestra?**

- 
- 

**¿Qué puede hacer el usuario desde acá?**

- 
- 

> 📌 **Agregá una subsección por cada pantalla importante del sistema.**

---

## 10. Integraciones con otros sistemas

> **¿Este desarrollo necesita conectarse con otros sistemas, APIs o herramientas?**
> _¿Hay que leer o escribir datos en otro sistema? ¿Con qué frecuencia? ¿Qué pasa si esa conexión falla?_

| Sistema externo | ¿Para qué se usa? | ¿Lee, escribe o ambos? | ¿Qué pasa si falla? |
|----------------|------------------|----------------------|---------------------|
| _Ej: Salesforce_ | _Traer datos del cliente_ | _Lee_ | _Mostrar error y no continuar_ |
| | | | |
| | | | |

---

## 11. Casos de borde y excepciones

> **¿Qué puede salir mal o qué situaciones raras debería manejar el sistema?**
> _Pensá en los casos límite: ¿qué pasa si el usuario ingresa datos incorrectos? ¿Si hay un corte de internet? ¿Si dos personas editan lo mismo al mismo tiempo? ¿Si alguien intenta hacer algo que no debería?_

| Situación excepcional | ¿Qué debería hacer el sistema? |
|----------------------|-------------------------------|
| _Ej: El usuario deja el formulario a la mitad_ | _Guardar borrador automáticamente_ |
| _Ej: Se ingresa un monto negativo_ | _Mostrar error y no permitir continuar_ |
| | |
| | |

---

## 12. Criterios de aceptación

> **¿Cómo sabemos que esto está bien hecho?**
> Completá esta sección al final, cuando ya tengas clara toda la funcionalidad. Son las condiciones que deben cumplirse para considerar que el desarrollo está listo.
> Formato: "Dado [contexto], cuando [acción], entonces [resultado esperado]"

| # | Criterio | Estado |
|---|----------|--------|
| CA-01 | _Ej: Dado que soy un vendedor logueado, cuando creo una cotización con todos los campos requeridos, entonces se guarda y aparece en mi lista con estado "Pendiente"_ | ⬜ Pendiente |
| CA-02 | | ⬜ Pendiente |
| CA-03 | | ⬜ Pendiente |
| CA-04 | | ⬜ Pendiente |

---

## 13. Preguntas abiertas y dependencias

> **¿Qué todavía no está definido o necesita respuesta antes de empezar?**
> Anotá acá todo lo que quedó sin resolver para no perderlo de vista.

| # | Pregunta / Dependencia | Responsable de responder | Fecha límite | Estado |
|---|----------------------|--------------------------|--------------|--------|
| Q-01 | _Ej: ¿El precio del producto incluye o excluye impuestos en el cálculo?_ | _Finanzas_ | _30/06_ | ⬜ Abierta |
| Q-02 | | | | ⬜ Abierta |
| Q-03 | | | | ⬜ Abierta |

---

## 14. Fuera de alcance

> **¿Qué explícitamente NO vamos a hacer en esta versión?**
> Esto es tan importante como lo que sí vamos a hacer. Ayuda a evitar malentendidos y scope creep.

- _Ej: No se incluye integración con el sistema contable en esta versión_
- _Ej: No se contempla acceso mobile por ahora_
- 
- 

---

---

# ⚙️ Sección técnica (Equipo de desarrollo)

> **Esta sección es para completar por el equipo técnico.**
> El equipo de producto no necesita llenarla, pero si tiene restricciones técnicas conocidas (ej: "debe funcionar con el ERP actual", "no podemos tocar la base de datos de clientes") puede anotarlas en T1.
> Esta sección está diseñada para soportar **desarrollo guiado por spec con agentes de IA**: cada fase tiene su checklist, sus agentes responsables y sus puntos de parada explícitos antes de continuar.

---

## T1. Arquitectura y componentes

> _¿Qué servicios, módulos o componentes se ven involucrados? ¿Es un nuevo servicio o se extiende uno existente? ¿Hay restricciones de stack o infraestructura?_

```
[Diagrama o descripción de arquitectura]
```

**Componentes involucrados:**

| Componente | Rol | ¿Nuevo o existente? | Notas / restricciones |
|-----------|-----|---------------------|-----------------------|
| | | | |
| | | | |

---

## T2. Modelo de datos

> _¿Qué tablas / colecciones / entidades se crean o modifican? ¿Cuáles son los campos clave y sus tipos?_

```sql
-- Ej:
-- tabla: quotations
-- id            UUID         PK
-- seller_id     UUID         FK → users.id
-- client_id     UUID         FK → clients.id
-- amount        DECIMAL(10,2)
-- status        ENUM('draft','pending','approved','rejected')
-- created_at    TIMESTAMP
```

---

## T3. APIs y contratos

> _¿Qué endpoints se crean o modifican? ¿Cuál es el contrato de entrada/salida?_

**Endpoint:** `[METHOD] /api/v1/[recurso]`

```json
// Request:
{
  
}

// Response 200:
{
  
}

// Response error:
{
  "error": "",
  "code": ""
}
```

---

## T4. Consideraciones de seguridad

- [ ] Autenticación requerida: ✅ / ❌
- [ ] Roles y permisos: _[Describí]_
- [ ] Auditoría de cambios: ✅ / ❌
- [ ] Datos sensibles que requieren encriptación: _[Listá]_

---

## T5. Consideraciones de performance y escalabilidad

```
[Usuarios concurrentes esperados, procesos pesados, límites conocidos]
```

---

## T6. Plan de migración / rollout

> _¿Hay datos que migrar? ¿Se usa feature flag? ¿Hay rollback plan?_

```
[Describí]
```

---

## T7. Decisiones técnicas tomadas

| Decisión | Alternativas evaluadas | Justificación |
|----------|----------------------|---------------|
| | | |

---

---

# Siguiente paso: OpenSpec

Con las secciones de producto (1-14) y técnica (T1-T7) completas, este documento es el insumo para arrancar un change:

1. Pasar el documento completo como contexto a la operación "proponer" del skill `openspec-workflow` (`.context/skills/openspec-workflow/SKILL.md`). Genera en orden `proposal.md`, `specs/**/*.md` (una por capability), `design.md` y `tasks.md` dentro de `openspec/changes/<nombre>/`.
2. Revisar los cuatro artefactos: son el equivalente formal de las secciones de arriba.
3. Si algo no cuadra con lo completado acá, usar la operación "actualizar" (nunca edita código).
4. Implementar con la operación "implementar", que recorre `tasks.md` una tarea a la vez respetando `.context/rules/*`.
5. Al terminar, "sincronizar" specs (opcional) y "archivar" el change cuando el PR esté mergeado.

Flujo completo y reglas por artefacto: [`openspec/README.md`](../../openspec/README.md).
