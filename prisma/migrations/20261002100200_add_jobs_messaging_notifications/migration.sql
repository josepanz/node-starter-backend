-- CreateEnum
CREATE TYPE "BackgroundJobStatus" AS ENUM ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "MessageChannel" AS ENUM ('SMS', 'EMAIL', 'PUSH');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DELIVERED', 'UNDELIVERED', 'EXPIRED', 'REJECTED', 'UNAVAILABLE');

-- CreateEnum
CREATE TYPE "MessageContentPolicy" AS ENUM ('NONE', 'AUDIT');

-- CreateEnum
CREATE TYPE "PushChannel" AS ENUM ('FCM', 'WEBPUSH');

-- CreateTable
CREATE TABLE "background_jobs" (
    "id" SERIAL NOT NULL,
    "reference_id" TEXT NOT NULL,
    "type" VARCHAR(100) NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "BackgroundJobStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 3,
    "next_run_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_error" TEXT,
    "result" JSONB,
    "created_by" INTEGER,
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "background_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" SERIAL NOT NULL,
    "reference_id" TEXT NOT NULL,
    "channel" "MessageChannel" NOT NULL,
    "provider" VARCHAR(50) NOT NULL,
    "recipient" VARCHAR(255) NOT NULL,
    "status" "MessageStatus" NOT NULL DEFAULT 'PENDING',
    "provider_message_id" VARCHAR(128),
    "provider_status" VARCHAR(64),
    "provider_error_code" VARCHAR(128),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "next_attempt_at" TIMESTAMP(3),
    "resent_from_id" INTEGER,
    "trace_id" VARCHAR(64),
    "caller_ip" VARCHAR(64),
    "caller_user_agent" VARCHAR(256),
    "source_service" VARCHAR(128),
    "created_by" INTEGER,
    "content_encrypted" TEXT,
    "content_hmac" VARCHAR(64),
    "content_policy" "MessageContentPolicy" NOT NULL DEFAULT 'NONE',
    "content_expires_at" TIMESTAMP(3),
    "idempotency_key" VARCHAR(128),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "channel" "PushChannel" NOT NULL,
    "token" VARCHAR(512) NOT NULL,
    "p256dh" VARCHAR(255),
    "auth" VARCHAR(255),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "reference_id" TEXT NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB,
    "requires_action" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "background_jobs_reference_id_key" ON "background_jobs"("reference_id");

-- CreateIndex
CREATE INDEX "background_jobs_status_next_run_at_idx" ON "background_jobs"("status", "next_run_at");

-- CreateIndex
CREATE INDEX "background_jobs_type_idx" ON "background_jobs"("type");

-- CreateIndex
CREATE UNIQUE INDEX "messages_reference_id_key" ON "messages"("reference_id");

-- CreateIndex
CREATE INDEX "messages_channel_status_idx" ON "messages"("channel", "status");

-- CreateIndex
CREATE INDEX "messages_provider_message_id_idx" ON "messages"("provider_message_id");

-- CreateIndex
CREATE INDEX "messages_content_policy_content_expires_at_idx" ON "messages"("content_policy", "content_expires_at");

-- CreateIndex
CREATE INDEX "messages_created_at_idx" ON "messages"("created_at");

-- CreateIndex
CREATE INDEX "push_subscriptions_user_id_active_idx" ON "push_subscriptions"("user_id", "active");

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_channel_token_key" ON "push_subscriptions"("channel", "token");

-- CreateIndex
CREATE UNIQUE INDEX "notifications_reference_id_key" ON "notifications"("reference_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_read_at_idx" ON "notifications"("user_id", "read_at");

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_resent_from_id_fkey" FOREIGN KEY ("resent_from_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

