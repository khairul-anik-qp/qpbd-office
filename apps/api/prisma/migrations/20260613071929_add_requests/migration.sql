-- CreateEnum
CREATE TYPE "RequestType" AS ENUM ('tea', 'snack', 'supply', 'printer', 'help', 'other');

-- CreateEnum
CREATE TYPE "Urgency" AS ENUM ('normal', 'urgent');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('new', 'progress', 'done');

-- CreateTable
CREATE TABLE "Request" (
    "id" TEXT NOT NULL,
    "type" "RequestType" NOT NULL,
    "requester" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "urg" "Urgency" NOT NULL DEFAULT 'normal',
    "loc" TEXT NOT NULL,
    "assigneeId" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'new',
    "forwardedById" TEXT,
    "acceptedById" TEXT,
    "acceptedAt" TIMESTAMP(3),
    "doneById" TEXT,
    "doneAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Request_requesterId_idx" ON "Request"("requesterId");

-- CreateIndex
CREATE INDEX "Request_status_idx" ON "Request"("status");

-- CreateIndex
CREATE INDEX "Request_assigneeId_idx" ON "Request"("assigneeId");

-- CreateIndex
CREATE INDEX "Request_acceptedById_idx" ON "Request"("acceptedById");

-- CreateIndex
CREATE INDEX "Request_doneById_idx" ON "Request"("doneById");

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_forwardedById_fkey" FOREIGN KEY ("forwardedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_acceptedById_fkey" FOREIGN KEY ("acceptedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_doneById_fkey" FOREIGN KEY ("doneById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
