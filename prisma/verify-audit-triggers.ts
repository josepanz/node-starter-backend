/**
 * Verifica que toda tabla con columna `change_signature` (auditable) tenga su trigger
 * `trg_audit_<tabla>`. Pensado para CI justo después de `prisma migrate deploy`: falla el
 * pipeline (exit 1) si una tabla nueva quedó sin trigger de auditoría.
 * Uso: `pnpm db:verify-audit-triggers`
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TableRow {
  table_name: string;
}

async function main(): Promise<void> {
  const auditableTables = await prisma.$queryRaw<TableRow[]>`
    SELECT DISTINCT table_name FROM information_schema.columns
    WHERE table_schema = 'public' AND column_name = 'change_signature' AND table_name <> 'audit_logs'
    ORDER BY table_name`;

  const triggeredTables = await prisma.$queryRaw<TableRow[]>`
    SELECT DISTINCT event_object_table AS table_name FROM information_schema.triggers
    WHERE trigger_schema = 'public' AND trigger_name LIKE 'trg_audit_%'`;

  const triggered = new Set(triggeredTables.map((t) => t.table_name));
  const missing = auditableTables
    .map((t) => t.table_name)
    .filter((name) => !triggered.has(name));

  if (missing.length > 0) {
    console.error(
      `Faltan triggers de auditoría en: ${missing.join(', ')}. ` +
        'Agregar CREATE TRIGGER trg_audit_<tabla> BEFORE INSERT OR UPDATE OR DELETE ... ' +
        'EXECUTE FUNCTION fn_audit_generic_trigger(); en la migración que crea la tabla.',
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    `Cobertura de auditoría OK: ${auditableTables.length} tablas auditables, todas con trigger.`,
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
