-- CreateTable
CREATE TABLE "WriterApplication" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "reviewed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WriterApplication_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WriterApplication_reviewed_createdAt_idx" ON "WriterApplication"("reviewed", "createdAt");
