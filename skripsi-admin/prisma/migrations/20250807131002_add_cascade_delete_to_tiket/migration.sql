-- DropForeignKey
ALTER TABLE "Tiket" DROP CONSTRAINT "Tiket_containerId_fkey";

-- AlterTable
ALTER TABLE "Payment" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "Tiket" ADD CONSTRAINT "Tiket_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "Container"("id") ON DELETE CASCADE ON UPDATE CASCADE;
