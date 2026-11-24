CREATE TABLE "StorageCleanup" (
    "reference" TEXT NOT NULL,
    "retryAfter" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StorageCleanup_pkey" PRIMARY KEY ("reference")
);

CREATE INDEX "StorageCleanup_retryAfter_idx" ON "StorageCleanup"("retryAfter");
