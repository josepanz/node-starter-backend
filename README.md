# node-started-backend

[![npm](https://badge.fury.io/js/node-started-backend.svg)](https://www.npmjs.com/package/node-started-backend)

Proyecto inicial para backend con NestJS y TypeScript

Última actualización: <!-- LAST_UPDATE --> 04 de noviembre de 2025, 05:16 p. m.

## 🗎 Documentación disponible en
<!-- START:documentation -->

El proyecto expone dos tipos principales de documentación:

1.  **Swagger (API):** Documentación interactiva de todos los *endpoints*.
    * **Ruta de acceso:** `/node-starter-backend/api/swagger`
    * **Ejemplo Local:** `http://localhost:3000/node-starter-backend/api/swagger`

2.  **Compodoc (Código):** Documentación estática de módulos, controladores, *providers*, etc.
    * **Ruta de acceso:** `/node-starter-backend/api/docs`
    * **Ejemplo Local:** `http://localhost:3000/node-starter-backend/api/docs`

> Reemplaza `http://localhost:3000` con el dominio y puerto de tu entorno (DEV, QA, PROD) para acceder a la documentación remota.

<!-- END:documentation -->

<!-- anything below this line will be safe from template removal -->

<!-- START:initial-setup -->

## 🛠️ Instalación y Dependencias

Esta aplicación utiliza **pnpm** como gestor de paquetes para una gestión eficiente de dependencias.

1.  **Instalar pnpm globalmente (si aún no lo tienes):**

    ```bash
    npm install -g pnpm
    ```

2.  **Instalar todas las dependencias del proyecto:**

    ```bash
    pnpm install
    ```

3.  **Configuración del Entorno:**
    Crea un archivo `.env` en la raíz del proyecto y define las variables de entorno necesarias (ej: `DATABASE_URL`, `JWT_SECRET`, etc.).

4. **Opcionales:**
    - Si se quiere generar documentación de compodocs (docs/documentation.json) y actualizar archivo readme en base a este `pnpm docs:update-readme`
    - Si se quiere generar documentación de compodocs con htmls (docs/*) `pnpm docs:generate`

5. **Compilar y ejecutar:**
    - Desarrollo (watch):

    ```bash
    pnpm run start:dev
    ```

    - Producción:

    ```bash
    pnpm run build
    ```

    ```bash
    pnpm run start:prod
    ```

<!-- END:initial-setup -->
## 📦 Prisma
<!-- START:prisma-setup -->

### 💾 Configuración de Prisma (Base de Datos)

Para interactuar con la base de datos a través de **Prisma**, sigue estos pasos:

1.  **Instalar dependencias de desarrollo y el cliente (ya incluido en `pnpm install`, pero listado para referencia):**

    ```bash
    pnpm install prisma @prisma/client
    ```

2.  **Inicializar Prisma (crea `prisma/schema.prisma` y `.env`):**

    ```bash
    pnpm prisma init
    ```

3.  **Configurar tu base de datos en `.env`** (con `DATABASE_URL`) **y definir tus modelos en `prisma/schema.prisma`**.

4.  **Generar el Cliente de Prisma:**
    Siempre que modifiques el esquema, debes regenerar el cliente:

    ```bash
    pnpm prisma generate
    ```

5.  **Crear y Aplicar una Migración:**
    Para sincronizar el esquema con la base de datos:

    ```bash
    pnpm prisma migrate dev --name <nombre-descriptivo-de-la-migracion>
    ```

<!-- END:prisma-setup -->

## 📦 Dependencias
<!-- START:dependencies -->
- **@autotelic/pino-seq-transport** `^0.1.0`
- **@nestjs/axios** `^4.0.0`
- **@nestjs/common** `^11.0.1`
- **@nestjs/config** `^4.0.1`
- **@nestjs/core** `^11.0.1`
- **@nestjs/jwt** `^11.0.0`
- **@nestjs/mapped-types** `^2.1.0`
- **@nestjs/passport** `^11.0.5`
- **@nestjs/platform-express** `^11.0.1`
- **@nestjs/swagger** `^11.0.7`
- **@nestjs/terminus** `^11.0.0`
- **@prisma/client** `6.18.0`
- **axios** `^1.9.0`
- **bcrypt** `^6.0.0`
- **class-transformer** `^0.5.1`
- **class-validator** `^0.14.1`
- **cookie-parser** `^1.4.7`
- **date-fns** `^4.1.0`
- **date-fns-tz** `^3.2.0`
- **express** `^5.1.0`
- **joi** `^17.13.3`
- **jsonwebtoken** `^9.0.2`
- **jwks-rsa** `^3.2.0`
- **multer** `^2.0.0`
- **nanoid** `^5.1.5`
- **nestjs-pino** `^4.4.0`
- **nodemailer** `^7.0.6`
- **passport** `^0.7.0`
- **passport-jwt** `^4.0.1`
- **pino-pretty** `^13.0.0`
- **read-pkg-up** `^11.0.0`
- **reflect-metadata** `^0.2.2`
- **rxjs** `^7.8.1`
- **uuid** `^11.1.0`
- **write-file-atomic** `^7.0.0`
<!-- END:dependencies -->

## ⚙️ Scripts disponibles
<!-- START:scripts -->
- **build** → `nest build`
- **format** → `prettier --write "src/**/*.ts" "test/**/*.ts"`
- **start** → `nest start`
- **start:dev** → `nest start --watch`
- **start:debug** → `nest start --debug --watch`
- **start:prod** → `node dist/main`
- **lint** → `eslint "{src,apps,libs,test}/**/*.ts" --quiet`
- **check:types** → `tsc --noEmit -p tsconfig.build.json`
- **test** → `jest`
- **test:watch** → `jest --watch`
- **test:cov** → `jest --coverage`
- **test:debug** → `node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand`
- **test:e2e** → `jest --config ./test/jest-e2e.json`
- **prepare** → `husky || true`
- **seed** → `ts-node prisma/seed.ts`
- **docs:generate** → `npx compodoc -p tsconfig.json -d docs`
- **docs:json** → `npx compodoc -p tsconfig.json -d docs -e json`
- **update:readme** → `node scripts/update-readme.js`
- **docs:serve** → `npx compodoc -s -d docs`
- **docs:rebuild** → `pnpm run docs:generate && pnpm run docs:serve`
- **docs:update-readme** → `pnpm run docs:json && pnpm run update:readme`
<!-- END:scripts -->

## 🏗️ Arquitectura
<!-- START:architecture -->

```plaintext
src/
├── api/                # Puntos de entrada (rutas, controladores, dtos, validaciones)
│   ├── auth/           # Autenticación, login, refresh, guards, etc.
│   ├── users/          # Gestión de usuarios
│   ├── onboarding/     # Registro o flujo de alta
│   └── permissions/    # Roles y permisos del sistema
│   └── ...             # Otras funcionalidades
│
├── modules/            # Casos de uso genéricos y reutilizables
│   ├── email/          # Envío de correos (mailer)
│   ├── auth/           # Módulo de autenticación compartido
│   ├── db/             # Conexiones o repositorios a base de datos
│   └── ...             # Otros módulos reutilizables
│
├── common/             # Decoradores, pipes, filtros, interceptores, utilidades
├── core/               # Configuración principal, constantes globales
├── prisma/             # Client de base de datos, migraciones
└── main.ts             # Archivo main que define setup global del proyecto
└── ...                 # Otros archivos de configuracion de typescript, nest, git, docker, etc
```

**Arquitectura general**
- @api: expone las rutas y orquesta los módulos.
- @modules: contiene la lógica de negocio y recursos compartidos.
- @common: utilidades, validadores y middlewares genéricos.
- @core: punto central de configuración e inicialización.
- Enfoque **Clean Architecture**: separación clara entre capas, alta cohesión, bajo acoplamiento, facilidad de testing y escalabilidad.

<!-- END:architecture -->

## 🧩 Funcionalidades documentadas
<!-- START:functionalities -->
### 🧩 Módulo **ApiModule**

#### - Controller: **AuthApiController**

#### - Controller: **EmailApiController**

#### - Controller: **ExampleApiController**

#### - Controller: **OnboardingController**

#### - Controller: **PermissionsAssignmentController**

#### - Controller: **PermissionsController**

#### - Controller: **RolesController**

#### - Controller: **UsersController**


### 🧩 Módulo **AppModule**

#### - Controller: **AuthApiController**

#### - Controller: **EmailApiController**

#### - Controller: **ExampleApiController**

#### - Controller: **OnboardingController**

#### - Controller: **PermissionsAssignmentController**

#### - Controller: **PermissionsController**

#### - Controller: **RolesController**

#### - Controller: **UsersController**

#### - Controller: **HealthController**


### 🧩 Módulo **AuthApiModule**

#### - Controller: **AuthApiController**


### 🧩 Módulo **AuthModule**

_Sin controllers documentados para este módulo._


### 🧩 Módulo **DatabaseModule**

_Sin controllers documentados para este módulo._


### 🧩 Módulo **EmailApiModule**

#### - Controller: **EmailApiController**


### 🧩 Módulo **EmailModule**

_Sin controllers documentados para este módulo._


### 🧩 Módulo **ExampleApiModule**

#### - Controller: **ExampleApiController**


### 🧩 Módulo **ExampleModule**

_Sin controllers documentados para este módulo._


### 🧩 Módulo **HealthModule**

#### - Controller: **HealthController**


### 🧩 Módulo **ObservabilityModule**

_Sin controllers documentados para este módulo._


### 🧩 Módulo **OnboardingModule**

#### - Controller: **OnboardingController**


### 🧩 Módulo **PermissionsModule**

#### - Controller: **PermissionsAssignmentController**

#### - Controller: **PermissionsController**


### 🧩 Módulo **RolesModule**

#### - Controller: **RolesController**


### 🧩 Módulo **TemplatePlaygroundModule**

_Sin controllers documentados para este módulo._


### 🧩 Módulo **UsersModule**

#### - Controller: **UsersController**


### 🧩 Módulo **UsersModule**

_Sin controllers documentados para este módulo._


<!-- END:functionalities -->

## 📦 Api Controllers
<!-- START:api-controllers -->
- **auth-api.controller**
- **email-api.controller**
- **example-api.controller**
- **onboarding.controller**
- **permissions-assignment.controller**
- **permissions.controller**
- **roles.controller**
- **users.controller**
<!-- END:api-controllers -->