/*
  Warnings:

  - Added the required column `imageName` to the `Container` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Container" ADD COLUMN     "imageName" TEXT NOT NULL;
