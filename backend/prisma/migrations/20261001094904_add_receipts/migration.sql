/*
  Warnings:

  - A unique constraint covering the columns `[receiptId]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "TransactionSource" AS ENUM ('MANUAL', 'OPEN_FINANCE', 'RECEIPT', 'RECURRING');

-- CreateEnum
CREATE TYPE "ReceiptStatus" AS ENUM ('PROCESSING', 'PROCESSED', 'PENDING_CONFIRMATION', 'CONFIRMED', 'FAILED');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "receiptId" TEXT,
ADD COLUMN     "source" "TransactionSource" NOT NULL DEFAULT 'MANUAL';

-- CreateTable
CREATE TABLE "Receipt" (
    "id" TEXT NOT NULL,
    "financeId" TEXT NOT NULL,
    "merchant" TEXT,
    "total" DECIMAL(65,30),
    "date" TIMESTAMP(3),
    "status" "ReceiptStatus" NOT NULL DEFAULT 'PROCESSING',
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReceiptItem" (
    "id" TEXT NOT NULL,
    "receiptId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" DECIMAL(65,30),
    "unitPrice" DECIMAL(65,30),
    "totalPrice" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReceiptItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Receipt_financeId_idx" ON "Receipt"("financeId");

-- CreateIndex
CREATE INDEX "ReceiptItem_receiptId_idx" ON "ReceiptItem"("receiptId");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_receiptId_key" ON "Transaction"("receiptId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "Receipt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_financeId_fkey" FOREIGN KEY ("financeId") REFERENCES "Finance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReceiptItem" ADD CONSTRAINT "ReceiptItem_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "Receipt"("id") ON DELETE CASCADE ON UPDATE CASCADE;
