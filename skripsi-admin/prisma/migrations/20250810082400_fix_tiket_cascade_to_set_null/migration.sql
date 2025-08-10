-- DropForeignKey
ALTER TABLE "Tiket" DROP CONSTRAINT "Tiket_containerId_fkey";

-- AddForeignKey
ALTER TABLE "Tiket" ADD CONSTRAINT "Tiket_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "Container"("id") ON DELETE SET NULL ON UPDATE CASCADE;
