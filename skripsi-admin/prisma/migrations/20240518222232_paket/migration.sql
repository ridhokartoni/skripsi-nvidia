-- AlterTable
CREATE SEQUENCE paket_id_seq;
ALTER TABLE "Paket" ALTER COLUMN "id" SET DEFAULT nextval('paket_id_seq');
ALTER SEQUENCE paket_id_seq OWNED BY "Paket"."id";

-- AlterTable
CREATE SEQUENCE payment_id_seq;
ALTER TABLE "Payment" ALTER COLUMN "id" SET DEFAULT nextval('payment_id_seq');
ALTER SEQUENCE payment_id_seq OWNED BY "Payment"."id";

-- CreateTable
CREATE TABLE "Tiket" (
    "id" SERIAL NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "containerId" INTEGER NOT NULL,

    CONSTRAINT "Tiket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Tiket_id_key" ON "Tiket"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Tiket_containerId_key" ON "Tiket"("containerId");

-- AddForeignKey
ALTER TABLE "Tiket" ADD CONSTRAINT "Tiket_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "Container"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
