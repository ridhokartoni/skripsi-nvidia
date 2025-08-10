-- AlterTable
ALTER TABLE "GPU" ADD COLUMN "deviceId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "GPU_deviceId_key" ON "GPU"("deviceId");
