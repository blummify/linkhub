-- CreateTable
CREATE TABLE "ClickDaily" (
    "id" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClickDaily_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClickDaily_userId_day_idx" ON "ClickDaily"("userId", "day");

-- CreateIndex
CREATE UNIQUE INDEX "ClickDaily_linkId_day_key" ON "ClickDaily"("linkId", "day");

-- AddForeignKey
ALTER TABLE "ClickDaily" ADD CONSTRAINT "ClickDaily_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "Link"("id") ON DELETE CASCADE ON UPDATE CASCADE;
