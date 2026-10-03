-- Credencial M2M completa: estado, scopes, settings, HMAC y trazabilidad de uso/rotación.
-- ATENCIÓN: secret_key (texto plano) pasa a secret_hash (bcrypt). Los secrets existentes
-- quedan inválidos y deben regenerarse con POST /api-clients/:referenceId/regenerate-secret.

-- CreateEnum
CREATE TYPE "ApiClientStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- DropIndex
DROP INDEX "api_client_credential_secret_key_key";

-- AlterTable
ALTER TABLE "api_client_credential" RENAME COLUMN "secret_key" TO "secret_hash";

ALTER TABLE "api_client_credential"
  ADD COLUMN "reference_id" TEXT,
  ADD COLUMN "status" "ApiClientStatus" NOT NULL DEFAULT 'ACTIVE',
  ADD COLUMN "scopes" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "rate_limit_per_minute" INTEGER,
  ADD COLUMN "allowed_ips" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "hmac_enabled" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "signing_secret_enc" TEXT,
  ADD COLUMN "last_used_at" TIMESTAMP(3),
  ADD COLUMN "secret_rotated_at" TIMESTAMP(3);

-- Backfill
UPDATE "api_client_credential" SET "reference_id" = gen_random_uuid()::text WHERE "reference_id" IS NULL;
UPDATE "api_client_credential" SET "status" = CASE WHEN "is_active" THEN 'ACTIVE'::"ApiClientStatus" ELSE 'INACTIVE'::"ApiClientStatus" END;

ALTER TABLE "api_client_credential" ALTER COLUMN "reference_id" SET NOT NULL;
ALTER TABLE "api_client_credential" DROP COLUMN "is_active";

-- CreateIndex
CREATE UNIQUE INDEX "api_client_credential_reference_id_key" ON "api_client_credential"("reference_id");
CREATE INDEX "api_client_credential_status_idx" ON "api_client_credential"("status");
