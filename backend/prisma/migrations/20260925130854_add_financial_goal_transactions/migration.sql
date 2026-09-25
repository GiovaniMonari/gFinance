-- CreateEnum
CREATE TYPE "FinancialGoalTransactionType" AS ENUM ('DEPOSIT', 'WITHDRAW');

-- CreateTable
CREATE TABLE "FinancialGoalTransaction" (
    "id" TEXT NOT NULL,
    "goalId" TEXT NOT NULL,
    "type" "FinancialGoalTransactionType" NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FinancialGoalTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FinancialGoalTransaction_goalId_idx" ON "FinancialGoalTransaction"("goalId");

-- AddForeignKey
ALTER TABLE "FinancialGoalTransaction" ADD CONSTRAINT "FinancialGoalTransaction_goalId_fkey" FOREIGN KEY ("goalId") REFERENCES "FinancialGoal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
