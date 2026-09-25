const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export type TransactionType = 'INCOME' | 'EXPENSE' | 'DEPOSIT'
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED'

export type Category = {
  id: string
  financeId: string
  name: string
  createdAt: string
  updatedAt: string
}

export type Transaction = {
  id: string
  financeId: string
  categoryId?: string | null
  category?: Category | null
  amount: string | number
  type: TransactionType
  status: TransactionStatus
  description?: string | null
  createdAt: string
  updatedAt: string
}

export type finance = {
  id: string
  userId: string
  monthlyIncome: string | number
  createdAt: string
  updatedAt: string
}

export type FinancialSummary = {
  income: string | number
  expenses: string | number
  deposits: string | number
  monthlyIncome?: string | number
  available: string | number
}

export type ExpenseByCategory = {
  categoryId: string
  categoryName: string
  total: string | number
}

export type MonthlySummary = {
  month: string
  income: string | number
  expenses: string | number
  deposits: string | number
  available: string | number
}

export type RecurringExpense = {
  id: string
  financeId: string
  categoryId?: string | null
  category?: { id: string; name: string } | null
  description?: string | null
  amount: string | number
  dayOfMonth: number
  nextExecution: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export type FinancialGoalStatus = 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE'

export type FinancialGoal = {
  id: string
  name: string
  targetAmount: string | number
  currentAmount: string | number
  deadline?: string | null
  active: boolean
  createdAt: string
  updatedAt: string
  progress: number
  remainingAmount: number
  status: FinancialGoalStatus
  transactionsCount?: number
}

export type FinancialGoalTransactionType = 'DEPOSIT' | 'WITHDRAW'

export type FinancialGoalTransaction = {
  id: string
  goalId: string
  type: FinancialGoalTransactionType
  amount: string | number
  createdAt: string
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('gFinance_token')
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  if (!response.ok) {
    const body = await response.text()
    let message = 'Não foi possível concluir a operação.'
    if (body) {
      try {
        const parsed = JSON.parse(body) as { message?: string | string[] }
        if (Array.isArray(parsed.message)) {
          message = parsed.message.join(', ')
        } else if (parsed.message) {
          message = parsed.message
        }
      } catch {
        message = body
      }
    }
    throw new Error(message)
  }
  const body = await response.text()
  return (body.trim() ? JSON.parse(body) : null) as T
}

export const api = {
  login: (email: string, password: string) =>
    request<{ access_token: string }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  register: (email: string, password: string) =>
    request<{ access_token: string }>('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) }),

  finance: () => request<finance | null>('/finances/get', { method: 'POST' }),

  createfinance: () => request<finance>('/finances', { method: 'POST' }),

  updateMonthlyIncome: (monthlyIncome: number) =>
    request<finance>('/finances/income', { method: 'PATCH', body: JSON.stringify({ monthlyIncome }) }),

  transactions: (page = 1, limit = 20) =>
    request<{ data: Transaction[]; page: number; limit: number; total: number; totalPages: number }>(
      `/transactions?page=${page}&limit=${limit}`
    ),

  getTransactionById: (id: string) => request<Transaction>(`/transactions/${id}`),

  createTransaction: (data: {
    amount: number
    transactionType: TransactionType
    description?: string
    categoryId?: string
  }) =>
    request<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  financialSummary: () => request<FinancialSummary>('/transactions/summary'),

  expensesByCategory: () => request<ExpenseByCategory[]>('/transactions/expenses-by-category'),

  monthlySummary: () => request<MonthlySummary[]>('/transactions/monthly-summary'),

  categories: () => request<Category[]>('/categories'),

  createCategory: (name: string) =>
    request<Category>('/categories', { method: 'POST', body: JSON.stringify({ name }) }),

  updateCategory: (id: string, name: string) =>
    request<Category>(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify({ name }) }),

  deleteCategory: (id: string) =>
    request<{ id: string }>(`/categories/${id}`, { method: 'DELETE' }),

  recurringExpenses: () => request<RecurringExpense[]>('/recurring-expenses'),

  createRecurringExpense: (data: {
    amount: number
    dayOfMonth: number
    description?: string
    categoryId?: string
  }) =>
    request<RecurringExpense>('/recurring-expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateRecurringExpense: (
    id: string,
    data: {
      amount?: number
      dayOfMonth?: number
      description?: string
      categoryId?: string
      active?: boolean
    }
  ) =>
    request<RecurringExpense>(`/recurring-expenses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteRecurringExpense: (id: string) =>
    request<RecurringExpense>(`/recurring-expenses/${id}`, { method: 'DELETE' }),

  financialGoals: () => request<FinancialGoal[]>('/financial-goals'),

  getFinancialGoal: (id: string) => request<FinancialGoal>(`/financial-goals/${id}`),

  createFinancialGoal: (data: { name: string; targetAmount: number; deadline?: string }) =>
    request<FinancialGoal>('/financial-goals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateFinancialGoal: (id: string, data: { name?: string; targetAmount?: number; deadline?: string }) =>
    request<FinancialGoal>(`/financial-goals/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  deleteFinancialGoal: (id: string) =>
    request<FinancialGoal>(`/financial-goals/${id}`, { method: 'DELETE' }),

  addGoalProgress: (id: string, amount: number) =>
    request<FinancialGoal>(`/financial-goals/${id}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ amount }),
    }),

  removeGoalProgress: (id: string, amount: number) =>
    request<FinancialGoal>(`/financial-goals/${id}/progress/remove`, {
      method: 'PATCH',
      body: JSON.stringify({ amount }),
    }),

  getGoalTransactions: (id: string) =>
    request<FinancialGoalTransaction[]>(`/financial-goals/${id}/transactions`),
}
