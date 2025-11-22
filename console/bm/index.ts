#!/usr/bin/env ts-node

import { main as moduleGeneratorMain } from './module-generator/run';

// Función principal que maneja las acciones
async function main() {
  const args = process.argv.slice(2);

  // Verificar que se proporcionó una acción
  if (args.length === 0) {
    console.error('❌ Error: Debes proporcionar una acción');
    console.log('Uso: pnpm bm <acción> [...parámetros]');
    console.log('\nAcciones disponibles:');
    console.log('  new <nombre-del-modulo>  - Crear un nuevo módulo');
    process.exit(1);
  }

  const action = args[0];

  switch (action) {
    case 'new':
      // Ejecutar el generador de módulos
      await moduleGeneratorMain();
      break;

    default:
      console.error(`❌ Error: Acción "${action}" no reconocida`);
      console.log('\nAcciones disponibles:');
      console.log('  new <nombre-del-modulo>  - Crear un nuevo módulo');
      process.exit(1);
  }
}

// Ejecutar
main().catch((error) => {
  console.error('❌ Error inesperado:', error);
  process.exit(1);
});
