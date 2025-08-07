/*
  Warnings:

  - Added the required column `noHp` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isMahasiswa" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "noHp" TEXT NOT NULL,
ADD COLUMN     "pj" TEXT;

-- CreateTable
CREATE TABLE "Container" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "sshPort" INTEGER NOT NULL,
    "jupyterPort" INTEGER NOT NULL,
    "password" TEXT NOT NULL,
    "CPU" INTEGER NOT NULL,
    "RAM" INTEGER NOT NULL,
    "GPU" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Container_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" INTEGER NOT NULL,
    "paketId" INTEGER NOT NULL,
    "status" INTEGER NOT NULL,
    "harga" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "tujuanPenelitian" TEXT NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paket" (
    "id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "CPU" INTEGER NOT NULL,
    "RAM" INTEGER NOT NULL,
    "GPU" INTEGER NOT NULL,
    "harga" INTEGER NOT NULL,
    "durasi" INTEGER NOT NULL,

    CONSTRAINT "Paket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Container_id_key" ON "Container"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Container_name_key" ON "Container"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Container_sshPort_key" ON "Container"("sshPort");

-- CreateIndex
CREATE UNIQUE INDEX "Container_jupyterPort_key" ON "Container"("jupyterPort");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_id_key" ON "Payment"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Paket_id_key" ON "Paket"("id");

-- AddForeignKey
ALTER TABLE "Container" ADD CONSTRAINT "Container_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_paketId_fkey" FOREIGN KEY ("paketId") REFERENCES "Paket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
