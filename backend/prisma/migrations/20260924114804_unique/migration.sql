/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `finance` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "finance_userId_key" ON "finance"("userId");
