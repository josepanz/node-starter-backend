#!/usr/bin/env node
/**
 * Actualiza automáticamente el README.md
 * - Inserta dependencias, scripts y funcionalidades documentadas por Compodoc
 * - Inserta estructura de carpetas y arquitectura
 * - Actualiza la fecha de última modificación
 * - Muestra controllers y endpoints en tabla Markdown
 * - Muestra módulos, providers, imports y exports
 * - Lista controllers dentro de @api
 * - Añade sección miscellaneous
 */

const fs = require('fs');
const path = require('path');
const { readPackageUpSync } = require('read-pkg-up');

const rootDir = process.cwd();
const readmePath = path.resolve(rootDir, 'README.md');
const compodocJson = path.resolve(rootDir, 'docs', 'documentation.json');
const apiDir = path.resolve(rootDir, 'src', 'api');

// --- Leemos package.json ---
const pkg = readPackageUpSync({ cwd: rootDir })?.packageJson;
if (!pkg) throw new Error('❌ No se encontró package.json');

// --- Leemos README.md ---
if (!fs.existsSync(readmePath)) throw new Error('❌ No se encontró README.md');
let readme = fs.readFileSync(readmePath, 'utf8');

// --- Fecha ---
const formattedDate = new Date().toLocaleString('es-PY', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

// --- Dependencias ---
const deps =
  Object.entries(pkg.dependencies || {})
    .map(([name, version]) => `- **${name}** \`${version}\``)
    .join('\n') || '_Sin dependencias._';

// --- Scripts ---
const scripts =
  Object.entries(pkg.scripts || {})
    .map(([name, cmd]) => `- **${name}** → \`${cmd}\``)
    .join('\n') || '_Sin scripts definidos._';

// --- Funcionalidades documentadas por Compodoc ---
let functionalities = '_Sin funcionalidades documentadas._';
if (fs.existsSync(compodocJson)) {
  try {
    const data = JSON.parse(fs.readFileSync(compodocJson, 'utf8'));
    const modules = data.modules || [];
    const coverage = data.coverage || [];
    const lines = [];

    const renderControllerTable = (ctrlCov) => {
      lines.push(`#### - Controller: **${ctrlCov.name}**`);
      lines.push('');
    };

    const renderModuleDetails = (mod, moduleCov) => {
      lines.push(`### 🧩 Módulo **${mod.name}**\n`);

      if (mod.imports && mod.imports.length > 0) {
        lines.push(`**Imports:** ${mod.imports.map((i) => i.name).join(', ')}`);
      }
      if (mod.exports && mod.exports.length > 0) {
        lines.push(`**Exports:** ${mod.exports.map((e) => e.name).join(', ')}`);
      }
      if (mod.providers && mod.providers.length > 0) {
        lines.push(
          `**Providers:** ${mod.providers.map((p) => p.name).join(', ')}`,
        );
      }

      // --- Controllers desde coverage.files ---
      if (moduleCov && moduleCov.length > 0) {
        moduleCov.forEach(renderControllerTable);
      } else {
        lines.push('_Sin controllers documentados para este módulo._\n');
      }

      lines.push('');
    };

    if (modules.length) {
      modules.forEach((mod) => {
        // carpeta base del módulo
        const moduleDir = path.dirname(mod.file); // ejemplo: 'src/api/auth'
        // filtrar coverage para este módulo
        let moduleCov = [];
        if (coverage) {
          const ff = coverage.files.filter(
            (f) => f.type === 'controller' && f.filePath.startsWith(moduleDir),
          );
          moduleCov.push(...ff);
        }

        const moduleMarkdown = renderModuleDetails(mod, moduleCov);
        functionalities += '\n' + moduleMarkdown;
      });
    }

    if (lines.length > 0) functionalities = lines.join('\n');
  } catch (err) {
    console.error('⚠️ No se pudo leer documentation.json:', err.message);
  }
}

// --- Documentación de API controllers en src/api ---
let apiControllersSection = '_Sin controllers en @api detectados._';
if (fs.existsSync(apiDir)) {
  const walkControllers = (dir) => {
    let entries = [];
    fs.readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        entries = entries.concat(walkControllers(fullPath));
      } else if (entry.isFile() && entry.name.endsWith('.controller.ts')) {
        const controllerName = path.basename(entry.name, '.ts');
        entries.push(controllerName);
      }
    });
    return entries;
  };

  const controllers = walkControllers(apiDir);
  if (controllers.length > 0) {
    apiControllersSection = controllers.map((c) => `- **${c}**`).join('\n');
  }
}

// --- Estructura y arquitectura ---
const architecture = `
\`\`\`plaintext
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
\`\`\`

**Arquitectura general**
- @api: expone las rutas y orquesta los módulos.
- @modules: contiene la lógica de negocio y recursos compartidos.
- @common: utilidades, validadores y middlewares genéricos.
- @core: punto central de configuración e inicialización.
- Enfoque **Clean Architecture**: separación clara entre capas, alta cohesión, bajo acoplamiento, facilidad de testing y escalabilidad.
`;

// --- [NUEVO] Instalación Inicial (pnpm) ---
const initialSetup = `
## 🛠️ Instalación y Dependencias

Esta aplicación utiliza **pnpm** como gestor de paquetes para una gestión eficiente de dependencias.

1.  **Instalar pnpm globalmente (si aún no lo tienes):**

    \`\`\`bash
    npm install -g pnpm
    \`\`\`

2.  **Instalar todas las dependencias del proyecto:**

    \`\`\`bash
    pnpm install
    \`\`\`

3.  **Configuración del Entorno:**
    Crea un archivo \`.env\` en la raíz del proyecto y define las variables de entorno necesarias (ej: \`DATABASE_URL\`, \`JWT_SECRET\`, etc.).

4. **Opcionales:**
    - Si se quiere generar documentación de compodocs (docs/documentation.json) y actualizar archivo readme en base a este \`pnpm docs:update-readme\`
    - Si se quiere generar documentación de compodocs con htmls (docs/*) \`pnpm docs:generate\`

5. **Compilar y ejecutar:**
    - Desarrollo (watch):

    \`\`\`bash
    pnpm run start:dev
    \`\`\`

    - Producción:

    \`\`\`bash
    pnpm run build
    \`\`\`

    \`\`\`bash
    pnpm run start:prod
    \`\`\`
`;

// --- Configuración e Instalación de Prisma (usando pnpm) ---
const prismaSetup = `
### 💾 Configuración de Prisma (Base de Datos)

Para interactuar con la base de datos a través de **Prisma**, sigue estos pasos:

1.  **Instalar dependencias de desarrollo y el cliente (ya incluido en \`pnpm install\`, pero listado para referencia):**

    \`\`\`bash
    pnpm install prisma @prisma/client
    \`\`\`

2.  **Inicializar Prisma (crea \`prisma/schema.prisma\` y \`.env\`):**

    \`\`\`bash
    pnpm prisma init
    \`\`\`

3.  **Configurar tu base de datos en \`.env\`** (con \`DATABASE_URL\`) **y definir tus modelos en \`prisma/schema.prisma\`**.

4.  **Generar el Cliente de Prisma:**
    Siempre que modifiques el esquema, debes regenerar el cliente:

    \`\`\`bash
    pnpm prisma generate
    \`\`\`

5.  **Crear y Aplicar una Migración:**
    Para sincronizar el esquema con la base de datos:

    \`\`\`bash
    pnpm prisma migrate dev --name <nombre-descriptivo-de-la-migracion>
    \`\`\`
`;

const documentationSection = `
El proyecto expone dos tipos principales de documentación:

1.  **Swagger (API):** Documentación interactiva de todos los *endpoints*.
    * **Ruta de acceso:** \`/node-starter-backend/api/swagger\`
    * **Ejemplo Local:** \`http://localhost:3000/node-starter-backend/api/swagger\`

2.  **Compodoc (Código):** Documentación estática de módulos, controladores, *providers*, etc.
    * **Ruta de acceso:** \`/node-starter-backend/api/docs\`
    * **Ejemplo Local:** \`http://localhost:3000/node-starter-backend/api/docs\`

> Reemplaza \`http://localhost:3000\` con el dominio y puerto de tu entorno (DEV, QA, PROD) para acceder a la documentación remota.
`;

// --- Reemplazo de secciones ---
const replaceSection = (text, tag, content) =>
  text.replace(
    new RegExp(`(<!-- START:${tag} -->)[\\s\\S]*(<!-- END:${tag} -->)`),
    `$1\n${content}\n$2`,
  );

// --- Actualización del README ---
readme = readme
  .replace(/<!-- LAST_UPDATE -->.*/g, `<!-- LAST_UPDATE --> ${formattedDate}`)
  .replace(/<!-- LAST_UPDATE -->$/, `<!-- LAST_UPDATE --> ${formattedDate}`);

readme = replaceSection(readme, 'documentation', documentationSection);
readme = replaceSection(readme, 'initial-setup', initialSetup);
readme = replaceSection(readme, 'dependencies', deps);
readme = replaceSection(readme, 'scripts', scripts);
readme = replaceSection(readme, 'functionalities', functionalities);
readme = replaceSection(readme, 'architecture', architecture);
readme = replaceSection(readme, 'api-controllers', apiControllersSection);
readme = replaceSection(readme, 'prisma-setup', prismaSetup);

fs.writeFileSync(readmePath, readme);
console.log(`✅ README actualizado (${formattedDate})`);
