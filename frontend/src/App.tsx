import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Edit3,
  FolderPlus,
  History,
  LogOut,
  MinusCircle,
  Plus,
  PlusCircle,
  Repeat,
  Sparkles,
  Tag,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  WalletCards,
  X,
} from 'lucide-react'
import {
  api,
  Category,
  ExpenseByCategory,
  FinancialGoal,
  FinancialGoalTransaction,
  FinancialSummary,
  MonthlySummary,
  RecurringExpense,
  Transaction,
  TransactionType,
  finance,
} from './api'

const money = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const date = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
const labels: Record<TransactionType, string> = {
  INCOME: 'Receita',
  EXPENSE: 'Despesa',
  DEPOSIT: 'Depósito',
}

function formatMonth(monthStr: string) {
  const [year, month] = monthStr.split('-')
  if (!year || !month) return monthStr
  const dateObj = new Date(Number(year), Number(month) - 1, 1)
  const monthName = dateObj.toLocaleDateString('pt-BR', { month: 'short' })
  return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`
}

// ── PWA install hook ──────────────────────────────────────────────────────────
type DeferredPrompt = Event & { prompt: () => Promise<void> }

function usePWAInstall() {
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true

  const [deferredPrompt, setDeferredPrompt] = useState<DeferredPrompt | null>(null)
  const [installed, setInstalled] = useState(isStandalone)

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as DeferredPrompt)
    }
    const onInstalled = () => {
      setInstalled(true)
      setDeferredPrompt(null)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  const triggerInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    setDeferredPrompt(null)
  }

  const showBanner = !!deferredPrompt && !installed
  return { showBanner, triggerInstall }
}

function InstallBanner({ onInstall, onDismiss }: { onInstall: () => void; onDismiss: () => void }) {
  return (
    <div className="pwa-banner">
      <span className="pwa-banner-icon">
        <WalletCards size={18} />
      </span>
      <div className="pwa-banner-text">
        <strong>Instale o gFinance</strong>
        <small>Acesse rápido, sem o navegador</small>
      </div>
      <div className="pwa-banner-actions">
        <button className="button primary pwa-banner-btn" onClick={onInstall}>
          <Download size={14} /> Instalar
        </button>
        <button className="icon-button pwa-banner-close" onClick={onDismiss} title="Fechar">
          <X size={15} />
        </button>
      </div>
    </div>
  )
}
// ─────────────────────────────────────────────────────────────────────────────

function App() {
  const [token, setToken] = useState(() => localStorage.getItem('gFinance_token'))
  const { showBanner, triggerInstall } = usePWAInstall()
  const [bannerDismissed, setBannerDismissed] = useState(false)

  return (
    <>
      {showBanner && !bannerDismissed && (
        <InstallBanner onInstall={triggerInstall} onDismiss={() => setBannerDismissed(true)} />
      )}
      {token ? (
        <Dashboard
          onLogout={() => {
            localStorage.removeItem('gFinance_token')
            setToken(null)
          }}
        />
      ) : (
        <Auth
          onSuccess={(value) => {
            localStorage.setItem('gFinance_token', value)
            setToken(value)
          }}
        />
      )}
    </>
  )
}

function Auth({ onSuccess }: { onSuccess: (token: string) => void }) {
  const [register, setRegister] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const result = register ? await api.register(email, password) : await api.login(email, password)
      onSuccess(result.access_token)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verifique seus dados.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-art">
        <div className="brand">
          <span className="brand-mark">
            <WalletCards size={20} />
          </span>
          <span>gFinance</span>
        </div>
        <div className="art-copy">
          <p className="eyebrow">FINANÇAS, DO SEU JEITO</p>
          <h1>
            Seu dinheiro,
            <br />
            <em>mais leve.</em>
          </h1>
          <p>Um sistema de gestão de financas para te ajudar no dia a dia.</p>
        </div>
        <div className="art-glow" />
      </section>
      <section className="auth-form-wrap">
        <div className="auth-form">
          <div className="mobile-brand brand">
            <span className="brand-mark">
              <WalletCards size={20} />
            </span>
            <span>gFinance</span>
          </div>
          <p className="eyebrow">{register ? 'COMECE AGORA' : 'BEM-VINDO DE VOLTA'}</p>
          <h2>{register ? 'Crie sua conta' : 'Acesse sua Conta'}</h2>
          <p className="muted">{register ? 'É rápido, seguro e gratuito.' : 'Entre para acompanhar suas finanças.'}</p>
          <form onSubmit={submit}>
            <label>
              E-mail
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                required
              />
            </label>
            <label>
              Senha
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                required
              />
            </label>
            {error && <div className="error">{error}</div>}
            <button className="button primary full" disabled={loading}>
              {loading ? 'Aguarde...' : register ? 'Criar conta' : 'Entrar'} <ArrowUpRight size={17} />
            </button>
          </form>
          <p className="switch">
            {register ? 'Já possui uma conta?' : 'Ainda não tem uma conta?'}{' '}
            <button
              onClick={() => {
                setRegister(!register)
                setError('')
              }}
            >
              {register ? 'Entrar' : 'Criar agora'}
            </button>
          </p>
        </div>
      </section>
    </main>
  )
}

type ModalState = TransactionType | 'CATEGORIES' | 'MONTHLY_INCOME' | 'RECURRING_EXPENSES' | 'FINANCIAL_GOALS' | null

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [finance, setfinance] = useState<finance | null>(null)
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null)
  const [expensesByCategory, setExpensesByCategory] = useState<ExpenseByCategory[]>([])
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpense[]>([])
  const [financialGoals, setFinancialGoals] = useState<FinancialGoal[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const [modal, setModal] = useState<ModalState>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    setLoading(true)
    setError('')
    try {
      let currentfinance = await api.finance()
      if (!currentfinance) {
        await api.createfinance()
        currentfinance = await api.finance()
      }
      setfinance(currentfinance)

      const [summaryRes, expCatRes, monthSumRes, catRes, txRes, recExpRes, goalsRes] = await Promise.all([
        api.financialSummary().catch(() => null),
        api.expensesByCategory().catch(() => []),
        api.monthlySummary().catch(() => []),
        api.categories().catch(() => []),
        api.transactions(page).catch(() => ({ data: [], page: 1, limit: 20, total: 0, totalPages: 1 })),
        api.recurringExpenses().catch(() => []),
        api.financialGoals().catch(() => []),
      ])

      setFinancialSummary(summaryRes)
      setExpensesByCategory(expCatRes)
      setMonthlySummary(monthSumRes)
      setCategories(catRes)
      setTransactions(txRes.data)
      setTotalPages(txRes.totalPages || 1)
      setRecurringExpenses(recExpRes)
      setFinancialGoals(goalsRes)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar os dados da sua Conta.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [page])

  const availableBalance = Number(financialSummary?.available ?? 0)
  const totalIncome = Number(financialSummary?.income ?? 0)
  const totalExpenses = Number(financialSummary?.expenses ?? 0)
  const totalDeposits = Number(financialSummary?.deposits ?? 0)
  const monthlyIncome = Number(finance?.monthlyIncome ?? 0)

  const categoryMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const cat of categories) {
      map.set(cat.id, cat.name)
    }
    return map
  }, [categories])

  const copyfinance = () => {
    if (finance) {
      navigator.clipboard?.writeText(finance.id)
      setMessage('ID da Conta copiado!')
      setTimeout(() => setMessage(''), 2400)
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">
            <WalletCards size={20} />
          </span>
          <span>gFinance</span>
        </div>
        <div className="top-actions">
          <span className="status">
            <i /> Conta protegida
          </span>
          <button className="icon-button" onClick={onLogout} title="Sair">
            <LogOut size={18} />
          </button>
        </div>
      </header>
      <div className="content">
        <div className="welcome">
          <div>
            <p className="eyebrow">VISÃO GERAL</p>
            <h1>
              Olá, <span> vamos controlar seu dinheiro?
              </span>
            </h1>
            <p className="muted">Aqui está o resumo atualizado da sua Conta.</p>
          </div>
        </div>

        {error && <div className="error page-error">{error}</div>}
        {message && (
          <div className="toast">
            <Check size={16} /> {message}
          </div>
        )}

        <section className="balance-grid">
          <div className="balance-card">
            <div className="card-heading">
              <span>Saldo disponível</span>
              <span className="balance-icon">
                <Sparkles size={17} />
              </span>
            </div>
            <strong className="balance">{money.format(availableBalance)}</strong>
            <div className="balance-foot">
              <span>Balanço total acumulado</span>
              <span className="positive">+{money.format(totalIncome + totalDeposits + monthlyIncome)} total bruto</span>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon green">
              <TrendingUp size={18} />
            </span>
            <div>
              <span>Receitas</span>
              <strong>{money.format(totalIncome + totalDeposits + monthlyIncome)}</strong>
              <small>Total de ganhos</small>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon red">
              <TrendingDown size={18} />
            </span>
            <div>
              <span>Despesas</span>
              <strong className="negative">{money.format(totalExpenses)}</strong>
              <small>Total gasto</small>
            </div>
          </div>

          <div className="stat-card clickable" onClick={() => setModal('MONTHLY_INCOME')}>
            <span className="stat-icon purple">
              <Sparkles size={18} />
            </span>
            <div>
              <span>Renda Mensal</span>
              <strong>{money.format(monthlyIncome)}</strong>
              <span className="edit-link">
                Editar <Edit3 size={12} />
              </span>
            </div>
          </div>
        </section>

        <section className="quick-actions">
          <h3>Ações rápidas</h3>
          <div className="actions">
            <button onClick={() => setModal('INCOME')}>
              <span className="action-icon income">
                <ArrowDownLeft />
              </span>
              <span>
                <strong>Receita</strong>
                <small>Registrar ganho</small>
              </span>
              <ArrowUpRight className="action-arrow" size={17} />
            </button>
            <button onClick={() => setModal('EXPENSE')}>
              <span className="action-icon expense">
                <ArrowUpRight />
              </span>
              <span>
                <strong>Despesa</strong>
                <small>Registrar gasto</small>
              </span>
              <ArrowUpRight className="action-arrow" size={17} />
            </button>
            <button onClick={() => setModal('DEPOSIT')}>
              <span className="action-icon deposit">
                <Plus />
              </span>
              <span>
                <strong>Depositar</strong>
                <small>Adicionar saldo</small>
              </span>
              <ArrowUpRight className="action-arrow" size={17} />
            </button>
            <button onClick={() => setModal('CATEGORIES')}>
              <span className="action-icon category-action">
                <FolderPlus />
              </span>
              <span>
                <strong>Categorias</strong>
                <small>Gerenciar lista</small>
              </span>
              <ArrowUpRight className="action-arrow" size={17} />
            </button>
            <button onClick={() => setModal('RECURRING_EXPENSES')}>
              <span className="action-icon category-action" style={{ background: '#fef3c7', color: '#d97706' }}>
                <Repeat />
              </span>
              <span>
                <strong>Recorrentes</strong>
                <small>Despesas fixas</small>
              </span>
              <ArrowUpRight className="action-arrow" size={17} />
            </button>
            <button onClick={() => setModal('FINANCIAL_GOALS')}>
              <span className="action-icon category-action" style={{ background: '#e0e7ff', color: '#4338ca' }}>
                <Target />
              </span>
              <span>
                <strong>Metas</strong>
                <small>Economia & Objetivos</small>
              </span>
              <ArrowUpRight className="action-arrow" size={17} />
            </button>
          </div>
        </section>

        <section className="goals-overview" style={{ marginBottom: 34 }}>
          <div className="section-heading">
            <div>
              <h3>Metas Financeiras</h3>
              <p className="muted">Acompanhe seus objetivos e conquistas de economia</p>
            </div>
            <button className="button secondary" onClick={() => setModal('FINANCIAL_GOALS')}>
              <Target size={16} /> Gerenciar Metas
            </button>
          </div>
          {financialGoals.length === 0 ? (
            <div className="analytics-card" style={{ textAlign: 'center', padding: '28px' }}>
              <p className="muted" style={{ margin: '0 0 12px' }}>Você ainda não cadastrou nenhuma meta financeira.</p>
              <button className="button primary" style={{ margin: '0 auto' }} onClick={() => setModal('FINANCIAL_GOALS')}>
                <Plus size={16} /> Criar minha primeira meta
              </button>
            </div>
          ) : (
            <div className="goals-grid">
              {financialGoals.map((goal) => {
                const current = Number(goal.currentAmount)
                const target = Number(goal.targetAmount)
                const statusLabel =
                  goal.status === 'COMPLETED'
                    ? 'Concluída'
                    : goal.status === 'OVERDUE'
                    ? 'Atrasada'
                    : 'Em andamento'
                const statusClass =
                  goal.status === 'COMPLETED'
                    ? 'completed'
                    : goal.status === 'OVERDUE'
                    ? 'failed'
                    : 'pending'

                return (
                  <div key={goal.id} className="goal-card" onClick={() => setModal('FINANCIAL_GOALS')}>
                    <div className="goal-card-header">
                      <div>
                        <strong>{goal.name}</strong>
                        {goal.deadline && (
                          <small className="goal-deadline">
                            <Calendar size={12} /> Prazo: {date.format(new Date(goal.deadline))}
                          </small>
                        )}
                      </div>
                      <span className={`tx-status ${statusClass}`}>{statusLabel}</span>
                    </div>

                    <div className="goal-card-body">
                      <div className="goal-amounts">
                        <span className="current">{money.format(current)}</span>
                        <span className="target">de {money.format(target)}</span>
                      </div>
                      <div className="progress-track" style={{ height: 10, margin: '8px 0 6px' }}>
                        <div
                          className="progress-fill"
                          style={{
                            width: `${Math.min(goal.progress, 100)}%`,
                            background: goal.status === 'COMPLETED' ? '#2fac77' : goal.status === 'OVERDUE' ? '#e04f5f' : '#6366f1',
                          }}
                        />
                      </div>
                      <div className="goal-card-foot">
                        <span>{goal.progress}% concluído</span>
                        {goal.remainingAmount > 0 && (
                          <span>Falta {money.format(Number(goal.remainingAmount))}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {(expensesByCategory.length > 0 || monthlySummary.length > 0) && (
          <section className="dashboard-analytics">
            <div className="analytics-card">
              <h4>
                <span>Despesas por Categoria</span>
                <Tag size={16} />
              </h4>
              {expensesByCategory.length === 0 ? (
                <div className="empty">Nenhuma despesa categorizada até o momento.</div>
              ) : (
                <div className="expense-category-list">
                  {expensesByCategory.map((cat) => {
                    const catTotal = Number(cat.total)
                    const percentage = totalExpenses > 0 ? Math.round((catTotal / totalExpenses) * 100) : 0
                    return (
                      <div key={cat.categoryId} className="category-bar-item">
                        <div className="category-bar-info">
                          <strong>{cat.categoryName}</strong>
                          <span>
                            {money.format(catTotal)} ({percentage}%)
                          </span>
                        </div>
                        <div className="progress-track">
                          <div className="progress-fill" style={{ width: `${Math.min(percentage, 100)}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="analytics-card">
              <h4>
                <span>Resumo Mensal</span>
                <Sparkles size={16} />
              </h4>
              {monthlySummary.length === 0 ? (
                <div className="empty">Nenhum dado mensal registrado.</div>
              ) : (
                <div className="monthly-summary-list">
                  {monthlySummary.slice(0, 5).map((m) => (
                    <div key={m.month} className="monthly-summary-row">
                      <span className="month-name">{formatMonth(m.month)}</span>
                      <span className="positive">+{money.format(Number(m.income) + Number(m.deposits) + monthlyIncome)}</span>
                      <span className="negative">-{money.format(Number(m.expenses))}</span>
                      <strong>{money.format(Number(m.available))}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        <section className="transactions">
          <div className="section-heading">
            <div>
              <h3>Atividade recente</h3>
              <p className="muted">Acompanhe suas últimas movimentações</p>
            </div>
            <span className="transaction-count">{transactions.length} registros nesta página</span>
          </div>
          <div className="table">
            {loading ? (
              <div className="empty">Carregando transações...</div>
            ) : transactions.length === 0 ? (
              <div className="empty">Você ainda não possui movimentações.</div>
            ) : (
              transactions.map((transaction) => (
                <TransactionRow
                  key={transaction.id}
                  transaction={transaction}
                  categoryName={
                    transaction.category?.name ?? (transaction.categoryId ? categoryMap.get(transaction.categoryId) : undefined)
                  }
                />
              ))
            )}
          </div>
          {totalPages > 1 && (
            <div className="pagination">
              <button disabled={page === 1} onClick={() => setPage(page - 1)}>
                <ChevronLeft size={16} />
              </button>
              <span>
                Página {page} de {totalPages}
              </span>
              <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </section>
      </div>

      {modal === 'INCOME' || modal === 'EXPENSE' || modal === 'DEPOSIT' ? (
        <TransactionModal
          type={modal}
          categories={categories}
          onClose={() => setModal(null)}
          onCreated={() => {
            setModal(null)
            refresh()
          }}
          onOpenCategories={() => setModal('CATEGORIES')}
        />
      ) : null}

      {modal === 'CATEGORIES' && (
        <CategoriesModal
          categories={categories}
          onClose={() => setModal(null)}
          onChanged={() => {
            refresh()
          }}
        />
      )}

      {modal === 'MONTHLY_INCOME' && (
        <MonthlyIncomeModal
          currentIncome={monthlyIncome}
          onClose={() => setModal(null)}
          onSaved={() => {
            setModal(null)
            refresh()
          }}
        />
      )}

      {modal === 'RECURRING_EXPENSES' && (
        <RecurringExpensesModal
          categories={categories}
          recurringExpenses={recurringExpenses}
          onClose={() => setModal(null)}
          onChanged={() => {
            refresh()
          }}
          onOpenCategories={() => setModal('CATEGORIES')}
        />
      )}

      {modal === 'FINANCIAL_GOALS' && (
        <FinancialGoalsModal
          goals={financialGoals}
          onClose={() => setModal(null)}
          onChanged={() => {
            refresh()
          }}
        />
      )}
    </main>
  )
}

function TransactionRow({ transaction, categoryName }: { transaction: Transaction; categoryName?: string }) {
  const isIncome = transaction.type === 'INCOME' || transaction.type === 'DEPOSIT'
  const iconClass = transaction.type.toLowerCase()

  return (
    <div className="transaction-row">
      <span className={`tx-icon ${iconClass}`}>
        {transaction.type === 'INCOME' ? (
          <ArrowDownLeft size={17} />
        ) : transaction.type === 'EXPENSE' ? (
          <ArrowUpRight size={17} />
        ) : (
          <Sparkles size={17} />
        )}
      </span>
      <div className="tx-description">
        <strong>
          {transaction.description || labels[transaction.type]}
          {categoryName && <span className="category-tag">{categoryName}</span>}
        </strong>
        <small>{date.format(new Date(transaction.createdAt))}</small>
      </div>
      <span className={`tx-status ${transaction.status.toLowerCase()}`}>
        {transaction.status === 'COMPLETED'
          ? 'Concluído'
          : transaction.status === 'PENDING'
          ? 'Pendente'
          : 'Falhou'}
      </span>
      <strong className={isIncome ? 'tx-value positive' : 'tx-value negative'}>
        {isIncome ? '+' : '-'}
        {money.format(Number(transaction.amount))}
      </strong>
    </div>
  )
}

function TransactionModal({
  type,
  categories,
  onClose,
  onCreated,
  onOpenCategories,
}: {
  type: TransactionType
  categories: Category[]
  onClose: () => void
  onCreated: () => void
  onOpenCategories: () => void
}) {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setError('')

    if (type === 'EXPENSE' && !categoryId) {
      setError('Por favor, selecione uma categoria para a despesa.')
      return
    }

    setLoading(true)
    try {
      await api.createTransaction({
        amount: Number(amount),
        transactionType: type,
        description: description || undefined,
        categoryId: categoryId || undefined,
      })
      onCreated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível registrar a transação.')
    } finally {
      setLoading(false)
    }
  }

  const title =
    type === 'INCOME' ? 'Registrar receita' : type === 'EXPENSE' ? 'Registrar despesa' : 'Adicionar depósito'

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <p className="eyebrow">{labels[type].toUpperCase()}</p>
        <h2>{title}</h2>
        <p className="muted">Informe os dados para continuar.</p>
        <form onSubmit={submit}>
          <label>
            Valor (R$)
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              required
            />
          </label>

          <label>
            Descrição (opcional)
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Aluguel, Supermercado, Salário..."
            />
          </label>

          <label>
            Categoria {type === 'EXPENSE' ? <span className="negative">*</span> : '(opcional)'}
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required={type === 'EXPENSE'}>
              <option value="">Selecione uma categoria...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          {categories.length === 0 && (
            <div style={{ marginBottom: 16 }}>
              <button type="button" className="button secondary full" onClick={onOpenCategories}>
                <FolderPlus size={16} /> Criar nova categoria
              </button>
            </div>
          )}

          {error && <div className="error">{error}</div>}
          <button className="button primary full" disabled={loading}>
            {loading ? 'Processando...' : 'Confirmar operação'} <Check size={17} />
          </button>
        </form>
      </div>
    </div>
  )
}

function CategoriesModal({
  categories,
  onClose,
  onChanged,
}: {
  categories: Category[]
  onClose: () => void
  onChanged: () => void
}) {
  const [newCatName, setNewCatName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    if (!newCatName.trim()) return
    setError('')
    setLoading(true)
    try {
      await api.createCategory(newCatName.trim())
      setNewCatName('')
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar a categoria.')
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdate(id: string) {
    if (!editName.trim()) return
    setError('')
    setLoading(true)
    try {
      await api.updateCategory(id, editName.trim())
      setEditingId(null)
      setEditName('')
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível atualizar a categoria.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    setError('')
    setLoading(true)
    try {
      await api.deleteCategory(id)
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível excluir a categoria.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <p className="eyebrow">CONFIGURAÇÕES</p>
        <h2>Gerenciar Categorias</h2>
        <p className="muted">Crie e edite as categorias das suas finanças.</p>

        <form onSubmit={handleCreate} className="add-category-form">
          <input
            type="text"
            placeholder="Nome da nova categoria..."
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            required
          />
          <button className="button primary" disabled={loading}>
            <Plus size={16} /> Criar
          </button>
        </form>

        {error && <div className="error">{error}</div>}

        <div className="categories-list">
          {categories.length === 0 ? (
            <div className="empty">Nenhuma categoria cadastrada.</div>
          ) : (
            categories.map((c) => (
              <div key={c.id} className="category-item">
                {editingId === c.id ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    style={{ padding: '6px 10px', fontSize: 13 }}
                  />
                ) : (
                  <span>{c.name}</span>
                )}

                <div className="category-actions">
                  {editingId === c.id ? (
                    <>
                      <button
                        className="button primary"
                        style={{ padding: '6px 10px', fontSize: 12 }}
                        onClick={() => handleUpdate(c.id)}
                        disabled={loading}
                      >
                        Salvar
                      </button>
                      <button
                        className="button secondary"
                        style={{ padding: '6px 10px', fontSize: 12 }}
                        onClick={() => setEditingId(null)}
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="icon-button"
                        style={{ color: '#636b7e' }}
                        title="Editar"
                        onClick={() => {
                          setEditingId(c.id)
                          setEditName(c.name)
                        }}
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        className="icon-button"
                        style={{ color: '#e04f5f' }}
                        title="Excluir"
                        onClick={() => handleDelete(c.id)}
                        disabled={loading}
                      >
                        <Trash2 size={15} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function MonthlyIncomeModal({
  currentIncome,
  onClose,
  onSaved,
}: {
  currentIncome: number
  onClose: () => void
  onSaved: () => void
}) {
  const [monthlyIncome, setMonthlyIncome] = useState(String(currentIncome || ''))
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.updateMonthlyIncome(Number(monthlyIncome))
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível atualizar a renda mensal.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <p className="eyebrow">PERFIL FINANCEIRO</p>
        <h2>Renda Mensal</h2>
        <p className="muted">Atualize sua receita mensal estimada.</p>
        <form onSubmit={submit}>
          <label>
            Valor mensal (R$)
            <input
              type="number"
              min="0"
              step="0.01"
              value={monthlyIncome}
              onChange={(e) => setMonthlyIncome(e.target.value)}
              placeholder="0,00"
              required
            />
          </label>
          {error && <div className="error">{error}</div>}
          <button className="button primary full" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar renda mensal'} <Check size={17} />
          </button>
        </form>
      </div>
    </div>
  )
}

function RecurringExpensesModal({
  categories,
  recurringExpenses,
  onClose,
  onChanged,
  onOpenCategories,
}: {
  categories: Category[]
  recurringExpenses: RecurringExpense[]
  onClose: () => void
  onChanged: () => void
  onOpenCategories: () => void
}) {
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [dayOfMonth, setDayOfMonth] = useState('1')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editAmount, setEditAmount] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editDayOfMonth, setEditDayOfMonth] = useState('1')
  const [editCategoryId, setEditCategoryId] = useState('')

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setError('')
    const day = Number(dayOfMonth)
    if (day < 1 || day > 31) {
      setError('O dia do mês deve ser entre 1 e 31.')
      return
    }

    setLoading(true)
    try {
      await api.createRecurringExpense({
        amount: Number(amount),
        dayOfMonth: day,
        description: description || undefined,
        categoryId: categoryId || undefined,
      })
      setAmount('')
      setDescription('')
      setCategoryId('')
      setDayOfMonth('1')
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar a despesa recorrente.')
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdate(id: string) {
    setError('')
    const day = Number(editDayOfMonth)
    if (day < 1 || day > 31) {
      setError('O dia do mês deve ser entre 1 e 31.')
      return
    }
    setLoading(true)
    try {
      await api.updateRecurringExpense(id, {
        amount: Number(editAmount),
        dayOfMonth: day,
        description: editDescription || undefined,
        categoryId: editCategoryId || undefined,
      })
      setEditingId(null)
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível atualizar a despesa recorrente.')
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleActive(re: RecurringExpense) {
    setError('')
    setLoading(true)
    try {
      await api.updateRecurringExpense(re.id, { active: !re.active })
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível atualizar a despesa recorrente.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    setError('')
    setLoading(true)
    try {
      await api.deleteRecurringExpense(id)
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível excluir a despesa recorrente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <p className="eyebrow">AUTOMAÇÃO FINANCEIRA</p>
        <h2>Despesas Recorrentes</h2>
        <p className="muted">Cadastre cobranças fixas mensais para processamento automático.</p>

        <form onSubmit={handleCreate} style={{ marginTop: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label>
              Valor (R$)
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                required
              />
            </label>
            <label>
              Dia do mês (1-31)
              <input
                type="number"
                min="1"
                max="31"
                value={dayOfMonth}
                onChange={(e) => setDayOfMonth(e.target.value)}
                placeholder="1"
                required
              />
            </label>
          </div>

          <label>
            Descrição (opcional)
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Netflix, Internet, Aluguel..."
            />
          </label>

          <label>
            Categoria (opcional)
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Selecione uma categoria...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          {categories.length === 0 && (
            <div style={{ marginBottom: 16 }}>
              <button type="button" className="button secondary full" onClick={onOpenCategories}>
                <FolderPlus size={16} /> Criar nova categoria
              </button>
            </div>
          )}

          {error && <div className="error">{error}</div>}

          <button className="button primary full" disabled={loading}>
            {loading ? 'Cadastrando...' : 'Adicionar despesa recorrente'} <Plus size={17} />
          </button>
        </form>

        <div className="categories-list" style={{ marginTop: 24 }}>
          <h4 style={{ margin: '0 0 12px', fontSize: 14 }}>Despesas cadastradas</h4>
          {recurringExpenses.length === 0 ? (
            <div className="empty">Nenhuma despesa recorrente cadastrada.</div>
          ) : (
            recurringExpenses.map((re) => (
              <div key={re.id} className="category-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
                {editingId === re.id ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        placeholder="Valor"
                        style={{ padding: '6px 10px', fontSize: 13 }}
                      />
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={editDayOfMonth}
                        onChange={(e) => setEditDayOfMonth(e.target.value)}
                        placeholder="Dia (1-31)"
                        style={{ padding: '6px 10px', fontSize: 13 }}
                      />
                    </div>
                    <input
                      type="text"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Descrição"
                      style={{ padding: '6px 10px', fontSize: 13 }}
                    />
                    <select
                      value={editCategoryId}
                      onChange={(e) => setEditCategoryId(e.target.value)}
                      style={{ padding: '6px 10px', fontSize: 13 }}
                    >
                      <option value="">Sem categoria</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button
                        className="button primary"
                        style={{ padding: '6px 12px', fontSize: 12 }}
                        onClick={() => handleUpdate(re.id)}
                        disabled={loading}
                      >
                        Salvar
                      </button>
                      <button
                        className="button secondary"
                        style={{ padding: '6px 12px', fontSize: 12 }}
                        onClick={() => setEditingId(null)}
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>{re.description || re.category?.name || 'Despesa recorrente'}</strong>
                        {re.category && <span className="category-tag" style={{ marginLeft: 8 }}>{re.category.name}</span>}
                      </div>
                      <strong>{money.format(Number(re.amount))}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#636b7e' }}>
                      <span>Cobrança todo dia {re.dayOfMonth} {re.nextExecution ? `(Próx: ${date.format(new Date(re.nextExecution))})` : ''}</span>
                      <div className="category-actions" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span className={`tx-status ${re.active ? 'completed' : 'failed'}`}>
                          {re.active ? 'Ativa' : 'Inativa'}
                        </span>
                        <button
                          className="button secondary"
                          style={{ padding: '4px 8px', fontSize: 11 }}
                          onClick={() => handleToggleActive(re)}
                          disabled={loading}
                        >
                          {re.active ? 'Pausar' : 'Ativar'}
                        </button>
                        <button
                          className="icon-button"
                          style={{ color: '#636b7e' }}
                          title="Editar"
                          onClick={() => {
                            setEditingId(re.id)
                            setEditAmount(String(re.amount))
                            setEditDescription(re.description || '')
                            setEditDayOfMonth(String(re.dayOfMonth))
                            setEditCategoryId(re.categoryId || '')
                          }}
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          className="icon-button"
                          style={{ color: '#e04f5f' }}
                          title="Excluir"
                          onClick={() => handleDelete(re.id)}
                          disabled={loading}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

function FinancialGoalsModal({
  goals,
  onClose,
  onChanged,
}: {
  goals: FinancialGoal[]
  onClose: () => void
  onChanged: () => void
}) {
  const [name, setName] = useState('')
  const [targetAmount, setTargetAmount] = useState('')
  const [deadline, setDeadline] = useState('')

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [editTargetAmount, setEditTargetAmount] = useState('')
  const [editDeadline, setEditDeadline] = useState('')

  const [actionGoalId, setActionGoalId] = useState<string | null>(null)
  const [actionType, setActionType] = useState<'DEPOSIT' | 'WITHDRAW'>('DEPOSIT')
  const [actionAmount, setActionAmount] = useState('')

  const [historyGoalId, setHistoryGoalId] = useState<string | null>(null)
  const [historyTransactions, setHistoryTransactions] = useState<FinancialGoalTransaction[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim()) {
      setError('Informe o nome da meta.')
      return
    }
    const target = Number(targetAmount)
    if (isNaN(target) || target <= 0) {
      setError('Informe um valor alvo válido maior que zero.')
      return
    }
    setLoading(true)
    try {
      await api.createFinancialGoal({
        name: name.trim(),
        targetAmount: target,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
      })
      setName('')
      setTargetAmount('')
      setDeadline('')
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar a meta.')
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdate(id: string) {
    setError('')
    const target = Number(editTargetAmount)
    if (isNaN(target) || target <= 0) {
      setError('Informe um valor alvo válido maior que zero.')
      return
    }
    setLoading(true)
    try {
      await api.updateFinancialGoal(id, {
        name: editName.trim(),
        targetAmount: target,
        deadline: editDeadline ? new Date(editDeadline).toISOString() : undefined,
      })
      setEditingId(null)
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível atualizar a meta.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    setError('')
    setLoading(true)
    try {
      await api.deleteFinancialGoal(id)
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível excluir a meta.')
    } finally {
      setLoading(false)
    }
  }

  async function handleProgressSubmit(e: FormEvent) {
    e.preventDefault()
    if (!actionGoalId) return
    setError('')
    const amt = Number(actionAmount)
    if (isNaN(amt) || amt <= 0) {
      setError('Informe um valor válido maior que zero.')
      return
    }
    setLoading(true)
    try {
      if (actionType === 'DEPOSIT') {
        await api.addGoalProgress(actionGoalId, amt)
      } else {
        await api.removeGoalProgress(actionGoalId, amt)
      }
      setActionGoalId(null)
      setActionAmount('')
      onChanged()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível atualizar o progresso da meta.')
    } finally {
      setLoading(false)
    }
  }

  async function handleToggleHistory(goalId: string) {
    if (historyGoalId === goalId) {
      setHistoryGoalId(null)
      return
    }
    setHistoryGoalId(goalId)
    setLoadingHistory(true)
    try {
      const txs = await api.getGoalTransactions(goalId)
      setHistoryTransactions(txs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível carregar o histórico.')
    } finally {
      setLoadingHistory(false)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="modal" onMouseDown={(e) => e.stopPropagation()} style={{ width: 'min(100%, 540px)' }}>
        <button className="modal-close" onClick={onClose}>
          ×
        </button>
        <p className="eyebrow">OBJETIVOS FINANCEIROS</p>
        <h2>Metas Financeiras</h2>
        <p className="muted">Crie metas para guardar dinheiro e acompanhe seu progresso.</p>

        <form onSubmit={handleCreate} style={{ marginTop: 20 }}>
          <label>
            Nome da meta
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Viagem de Férias, Reserva de Emergência..."
              required
            />
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <label>
              Valor Alvo (R$)
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                placeholder="0,00"
                required
              />
            </label>

            <label>
              Data Limite (opcional)
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </label>
          </div>

          {error && <div className="error">{error}</div>}

          <button className="button primary full" disabled={loading}>
            {loading ? 'Criando...' : 'Criar nova meta'} <Target size={17} />
          </button>
        </form>

        <div className="categories-list" style={{ marginTop: 24, maxHeight: 380 }}>
          <h4 style={{ margin: '0 0 12px', fontSize: 14 }}>Metas em andamento</h4>
          {goals.length === 0 ? (
            <div className="empty">Nenhuma meta cadastrada até o momento.</div>
          ) : (
            goals.map((g) => {
              const current = Number(g.currentAmount)
              const target = Number(g.targetAmount)
              const statusLabel =
                g.status === 'COMPLETED'
                  ? 'Concluída'
                  : g.status === 'OVERDUE'
                  ? 'Atrasada'
                  : 'Em andamento'
              const statusClass =
                g.status === 'COMPLETED'
                  ? 'completed'
                  : g.status === 'OVERDUE'
                  ? 'failed'
                  : 'pending'

              return (
                <div key={g.id} className="category-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}>
                  {editingId === g.id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Nome da Meta"
                        style={{ padding: '6px 10px', fontSize: 13 }}
                      />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          value={editTargetAmount}
                          onChange={(e) => setEditTargetAmount(e.target.value)}
                          placeholder="Valor Alvo"
                          style={{ padding: '6px 10px', fontSize: 13 }}
                        />
                        <input
                          type="date"
                          value={editDeadline}
                          onChange={(e) => setEditDeadline(e.target.value)}
                          style={{ padding: '6px 10px', fontSize: 13 }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <button
                          className="button primary"
                          style={{ padding: '6px 12px', fontSize: 12 }}
                          onClick={() => handleUpdate(g.id)}
                          disabled={loading}
                        >
                          Salvar
                        </button>
                        <button
                          className="button secondary"
                          style={{ padding: '6px 12px', fontSize: 12 }}
                          onClick={() => setEditingId(null)}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <strong style={{ fontSize: 14 }}>{g.name}</strong>
                          {g.deadline && (
                            <div style={{ fontSize: 11, color: '#636b7e', marginTop: 2 }}>
                              Prazo: {date.format(new Date(g.deadline))}
                            </div>
                          )}
                        </div>
                        <span className={`tx-status ${statusClass}`}>{statusLabel}</span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span>Acumulado: <strong>{money.format(current)}</strong></span>
                        <span style={{ color: '#636b7e' }}>Alvo: {money.format(target)}</span>
                      </div>

                      <div className="progress-track" style={{ height: 8 }}>
                        <div
                          className="progress-fill"
                          style={{
                            width: `${Math.min(g.progress, 100)}%`,
                            background: g.status === 'COMPLETED' ? '#2fac77' : g.status === 'OVERDUE' ? '#e04f5f' : '#6366f1',
                          }}
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#636b7e' }}>
                        <span>{g.progress}% concluído</span>
                        <div className="category-actions" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <button
                            className="button secondary"
                            style={{ padding: '4px 8px', fontSize: 11, background: '#e7f8f0', color: '#2fac77' }}
                            title="Aportar valor"
                            onClick={() => {
                              setActionGoalId(g.id)
                              setActionType('DEPOSIT')
                              setActionAmount('')
                            }}
                          >
                            <PlusCircle size={13} /> Aportar
                          </button>
                          <button
                            className="button secondary"
                            style={{ padding: '4px 8px', fontSize: 11, background: '#fff0f0', color: '#e04f5f' }}
                            title="Resgatar valor"
                            onClick={() => {
                              setActionGoalId(g.id)
                              setActionType('WITHDRAW')
                              setActionAmount('')
                            }}
                          >
                            <MinusCircle size={13} /> Resgatar
                          </button>
                          <button
                            className="icon-button"
                            style={{ color: '#636b7e' }}
                            title="Histórico"
                            onClick={() => handleToggleHistory(g.id)}
                          >
                            <History size={15} />
                          </button>
                          <button
                            className="icon-button"
                            style={{ color: '#636b7e' }}
                            title="Editar"
                            onClick={() => {
                              setEditingId(g.id)
                              setEditName(g.name)
                              setEditTargetAmount(String(g.targetAmount))
                              setEditDeadline(g.deadline ? new Date(g.deadline).toISOString().split('T')[0] : '')
                            }}
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            className="icon-button"
                            style={{ color: '#e04f5f' }}
                            title="Excluir"
                            onClick={() => handleDelete(g.id)}
                            disabled={loading}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      {actionGoalId === g.id && (
                        <form onSubmit={handleProgressSubmit} style={{ marginTop: 8, padding: '10px', background: '#f0f2f8', borderRadius: 8 }}>
                          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>
                            {actionType === 'DEPOSIT' ? 'Adicionar Aporte (Depósito)' : 'Resgatar Valor (Retirada)'}
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <input
                              type="number"
                              min="0.01"
                              step="0.01"
                              value={actionAmount}
                              onChange={(e) => setActionAmount(e.target.value)}
                              placeholder="Valor (R$)"
                              style={{ padding: '6px 10px', fontSize: 12 }}
                              required
                            />
                            <button className="button primary" style={{ padding: '6px 12px', fontSize: 12 }} disabled={loading}>
                              {actionType === 'DEPOSIT' ? 'Confirmar Aporte' : 'Confirmar Resgate'}
                            </button>
                            <button
                              type="button"
                              className="button secondary"
                              style={{ padding: '6px 12px', fontSize: 12 }}
                              onClick={() => setActionGoalId(null)}
                            >
                              Cancelar
                            </button>
                          </div>
                        </form>
                      )}

                      {historyGoalId === g.id && (
                        <div style={{ marginTop: 8, padding: '10px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                            <span>Histórico de Movimentações</span>
                            <button
                              type="button"
                              style={{ background: 'none', border: 0, fontSize: 11, color: '#636b7e', cursor: 'pointer' }}
                              onClick={() => setHistoryGoalId(null)}
                            >
                              Fechar
                            </button>
                          </div>
                          {loadingHistory ? (
                            <div style={{ fontSize: 12, color: '#636b7e' }}>Carregando histórico...</div>
                          ) : historyTransactions.length === 0 ? (
                            <div style={{ fontSize: 12, color: '#636b7e' }}>Nenhuma movimentação registrada nesta meta.</div>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 150, overflowY: 'auto' }}>
                              {historyTransactions.map((tx) => (
                                <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0', borderBottom: '1px dashed #e2e8f0' }}>
                                  <span>
                                    {tx.type === 'DEPOSIT' ? (
                                      <span style={{ color: '#2fac77', fontWeight: 600 }}>+ Aporte</span>
                                    ) : (
                                      <span style={{ color: '#e04f5f', fontWeight: 600 }}>- Resgate</span>
                                    )}{' '}
                                    <small style={{ color: '#94a3b8' }}>({date.format(new Date(tx.createdAt))})</small>
                                  </span>
                                  <strong>{money.format(Number(tx.amount))}</strong>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export default App
