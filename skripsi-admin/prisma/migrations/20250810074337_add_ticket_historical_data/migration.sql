-- AlterTable
ALTER TABLE "Tiket" ADD COLUMN     "containerName" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "userEmail" TEXT,
ADD COLUMN     "userName" TEXT,
ADD COLUMN     "userPhone" TEXT;

-- Make containerId nullable
ALTER TABLE "Tiket" ALTER COLUMN "containerId" DROP NOT NULL;
