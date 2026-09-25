-- CreateTable
CREATE TABLE "RecurringExpense" (
    "id" TEXT NOT NULL,
    "financeId" TEXT NOT NULL,
    "categoryId" TEXT,
    "description" TEXT,
    "amount" DECIMAL(65,30) NOT NULL,
    "dayOfMonth" INTEGER NOT NULL,
    "nextExecution" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecurringExpense_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RecurringExpense_financeId_active_idx" ON "RecurringExpense"("financeId", "active");

-- CreateIndex
CREATE INDEX "RecurringExpense_nextExecution_idx" ON "RecurringExpense"("nextExecution");

-- AddForeignKey
ALTER TABLE "RecurringExpense" ADD CONSTRAINT "RecurringExpense_financeId_fkey" FOREIGN KEY ("financeId") REFERENCES "Finance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecurringExpense" ADD CONSTRAINT "RecurringExpense_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
