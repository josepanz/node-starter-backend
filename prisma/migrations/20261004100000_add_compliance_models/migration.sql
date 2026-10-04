-- CreateEnum
CREATE TYPE "LegalDocumentType" AS ENUM ('TERMS', 'PRIVACY', 'COOKIES', 'MARKETING');

-- CreateEnum
CREATE TYPE "RetentionAction" AS ENUM ('ANONYMIZE', 'DELETE');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "anonymized_at" TIMESTAMP(3),
ADD COLUMN     "deletion_requested_at" TIMESTAMP(3),
ADD COLUMN     "deletion_scheduled_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "legal_document_versions" (
    "id" SERIAL NOT NULL,
    "reference_id" TEXT NOT NULL,
    "type" "LegalDocumentType" NOT NULL,
    "version" VARCHAR(32) NOT NULL,
    "title" VARCHAR(255),
    "content" TEXT,
    "content_url" VARCHAR(1024),
    "published_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "last_changed_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "last_changed_by" TEXT,
    "changed_reason" TEXT,
    "checksum" TEXT,
    "change_signature" TEXT,

    CONSTRAINT "legal_document_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_consents" (
    "id" SERIAL NOT NULL,
    "reference_id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "document_version_id" INTEGER NOT NULL,
    "accepted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" VARCHAR(64),
    "user_agent" VARCHAR(256),
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "last_changed_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "last_changed_by" TEXT,
    "changed_reason" TEXT,
    "checksum" TEXT,
    "change_signature" TEXT,

    CONSTRAINT "user_consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_retention_policies" (
    "id" SERIAL NOT NULL,
    "entity" VARCHAR(100) NOT NULL,
    "retention_days" INTEGER NOT NULL,
    "action" "RetentionAction" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT,
    "last_changed_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "last_changed_by" TEXT,
    "changed_reason" TEXT,
    "checksum" TEXT,
    "change_signature" TEXT,

    CONSTRAINT "data_retention_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_content_disclosures" (
    "id" SERIAL NOT NULL,
    "reference_id" TEXT NOT NULL,
    "entity_type" VARCHAR(100) NOT NULL,
    "entity_id" VARCHAR(128) NOT NULL,
    "model" VARCHAR(100) NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_by" INTEGER,
    "reviewed_at" TIMESTAMP(3),
    "notes" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_content_disclosures_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "legal_document_versions_reference_id_key" ON "legal_document_versions"("reference_id");

-- CreateIndex
CREATE INDEX "legal_document_versions_type_is_active_idx" ON "legal_document_versions"("type", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "legal_document_versions_type_version_key" ON "legal_document_versions"("type", "version");

-- CreateIndex
CREATE UNIQUE INDEX "user_consents_reference_id_key" ON "user_consents"("reference_id");

-- CreateIndex
CREATE INDEX "user_consents_user_id_revoked_at_idx" ON "user_consents"("user_id", "revoked_at");

-- CreateIndex
CREATE UNIQUE INDEX "user_consents_user_id_document_version_id_key" ON "user_consents"("user_id", "document_version_id");

-- CreateIndex
CREATE UNIQUE INDEX "data_retention_policies_entity_key" ON "data_retention_policies"("entity");

-- CreateIndex
CREATE UNIQUE INDEX "ai_content_disclosures_reference_id_key" ON "ai_content_disclosures"("reference_id");

-- CreateIndex
CREATE UNIQUE INDEX "ai_content_disclosures_entity_type_entity_id_key" ON "ai_content_disclosures"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "users_deletion_scheduled_at_idx" ON "users"("deletion_scheduled_at");

-- AddForeignKey
ALTER TABLE "user_consents" ADD CONSTRAINT "user_consents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_consents" ADD CONSTRAINT "user_consents_document_version_id_fkey" FOREIGN KEY ("document_version_id") REFERENCES "legal_document_versions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Una sola versión activa por tipo de documento (índice único parcial; Prisma no lo modela).
CREATE UNIQUE INDEX "uq_legal_document_one_active_per_type" ON "legal_document_versions"("type") WHERE "is_active" = true;

-- Auditoría: las tablas nuevas con columnas de auditoría reciben el trigger genérico
-- (fn_audit_generic_trigger se creó en 20260607002428_add_audit_triggers).
DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY['legal_document_versions', 'user_consents', 'data_retention_policies']
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trg_audit_%I ON %I', t, t);
        EXECUTE format('CREATE TRIGGER trg_audit_%I
                        BEFORE INSERT OR UPDATE OR DELETE ON %I
                        FOR EACH ROW EXECUTE FUNCTION fn_audit_generic_trigger()', t, t);
    END LOOP;
END;
$$;
