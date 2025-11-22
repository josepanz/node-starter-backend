import { promises as fs } from 'fs';
import * as path from 'path';

// Validar el nombre del módulo
function isValidModuleName(name: string): boolean {
  // Debe empezar con letra minúscula, solo puede contener letras minúsculas, números y guiones
  const regex = /^[a-z][a-z0-9-]*$/;
  return regex.test(name);
}

export async function initialValidation(args: string[]) {
  // Verificar que se proporcionó el comando 'new'
  if (args.length === 0 || args[0] !== 'new') {
    console.error('❌ Error: Comando inválido');
    console.log('Uso: pnpm bm new <nombre-del-modulo>');
    process.exit(1);
  }

  // Verificar que se proporcionó un nombre de módulo
  if (args.length < 2) {
    console.error('❌ Error: Debes proporcionar un nombre para el módulo');
    console.log('Uso: pnpm bm new <nombre-del-modulo>');
    process.exit(1);
  }

  const moduleName = args[1];

  // Validar el nombre del módulo
  if (!isValidModuleName(moduleName)) {
    console.error(
      '❌ Error: El nombre del módulo solo puede contener letras minúsculas, números y guiones (-), y debe empezar con una letra',
    );
    process.exit(1);
  }

  // Verificar si el módulo ya existe
  const modulePath = path.join(process.cwd(), 'src', 'modules', moduleName);
  try {
    await fs.access(modulePath);
    console.error(
      `❌ Error: El módulo "${moduleName}" ya existe en ${modulePath}`,
    );
    process.exit(1);
  } catch {
    // El módulo no existe, continuar
  }
}
