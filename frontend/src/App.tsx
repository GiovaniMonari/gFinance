import {
  ArrowRight,
  Bot,
  Brain,
  CheckCircle2,
  Github,
  Receipt,
  ShieldCheck,
  Smartphone,
  Target,
  Wallet,
  Zap,
} from 'lucide-react'
import './App.css'

const features = [
  {
    icon: Receipt,
    title: 'Scanner de recibos',
    description:
      'Capture seus recibos e transforme informações de compras em dados financeiros organizados.',
  },
  {
    icon: Brain,
    title: 'Inteligência financeira',
    description:
      'Análises inteligentes ajudam a entender seus gastos e encontrar oportunidades para melhorar suas decisões.',
  },
  {
    icon: Target,
    title: 'Metas financeiras',
    description:
      'Defina objetivos, acompanhe seu progresso e tenha uma visão clara da sua evolução financeira.',
  },
  {
    icon: Wallet,
    title: 'Open Finance',
    description:
      'Uma visão mais completa das suas finanças através da integração com instituições financeiras.',
  },
  {
    icon: Zap,
    title: 'Tempo real',
    description:
      'Atualizações rápidas para acompanhar suas informações financeiras sem depender de atualizações manuais.',
  },
  {
    icon: ShieldCheck,
    title: 'Privacidade',
    description:
      'Arquitetura pensada para manter os dados financeiros separados e protegidos.',
  },
]

const technologies = [
  'React Native',
  'NestJS',
  'TypeScript',
  'PostgreSQL',
  'Redis',
  'GraphQL',
  'WebSocket',
  'Open Finance',
]

function App() {
  return (
    <main>
      <nav className="navbar">
        <div className="container nav-content">
          <a href="#" className="logo">
            <div className="logo-icon">
              <Wallet size={21} />
            </div>
            <span>gFinance</span>
          </a>

          <a
            className="github-link"
            href="https://github.com/GiovaniMonari/gFinance"
            target="_blank"
            rel="noreferrer"
          >
            <Github size={18} />
            GitHub
          </a>
        </div>
      </nav>

      <section className="hero">
        <div className="container hero-grid">
          <div className="hero-content">
            <span className="eyebrow">
              <Smartphone size={15} />
              gFinance V2
            </span>

            <h1>
              Seu dinheiro.
              <br />
              <span>Decisões mais inteligentes.</span>
            </h1>

            <p className="hero-description">
              Uma nova geração de gestão financeira que combina dados,
              automação e inteligência para ajudar você a entender melhor
              suas finanças.
            </p>

            <div className="hero-actions">
              <a className="primary-button" href="#download">
                Baixar aplicativo
                <ArrowRight size={18} />
              </a>

              <a className="secondary-button" href="#features">
                Conhecer o gFinance
              </a>
            </div>

            <div className="hero-checks">
              <span>
                <CheckCircle2 size={16} />
                Android
              </span>
              <span>
                <CheckCircle2 size={16} />
                Inteligência financeira
              </span>
              <span>
                <CheckCircle2 size={16} />
                Open Finance
              </span>
            </div>
          </div>

          <div className="phone-wrapper">
            <div className="phone">
              <div className="phone-camera" />
              <div className="phone-screen">
                <div className="mock-header">
                  <span>Olá!</span>
                  <span className="mock-avatar">
                    <Wallet size={14} />
                  </span>
                </div>

                <div className="mock-balance">
                  <small>Saldo disponível</small>
                  <strong>R$ 4.280,00</strong>
                </div>

                <div className="mock-card">
                  <div>
                    <small>Economizado este mês</small>
                    <strong>R$ 1.240,00</strong>
                  </div>
                  <Target size={25} />
                </div>

                <div className="mock-section-title">Resumo financeiro</div>

                <div className="mock-bars">
                  <div className="mock-bar">
                    <span>Moradia</span>
                    <i style={{ width: '72%' }} />
                  </div>
                  <div className="mock-bar">
                    <span>Alimentação</span>
                    <i style={{ width: '54%' }} />
                  </div>
                  <div className="mock-bar">
                    <span>Transporte</span>
                    <i style={{ width: '31%' }} />
                  </div>
                </div>

                <div className="mock-ai">
                  <Brain size={19} />
                  <div>
                    <strong>Análise inteligente</strong>
                    <span>Seus gastos estão dentro do planejado.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="features">
        <div className="container">
          <div className="section-heading">
            <span className="section-label">FUNCIONALIDADES</span>
            <h2>Mais do que controlar gastos.</h2>
            <p>
              O gFinance V2 foi pensado para transformar dados financeiros
              em informações que realmente ajudam nas suas decisões.
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature) => {
              const Icon = feature.icon

              return (
                <article className="feature-card" key={feature.title}>
                  <div className="feature-icon">
                    <Icon size={22} />
                  </div>
                  <h3>{feature.title}</h3>
                  <p>{feature.description}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="intelligence-section">
        <div className="container intelligence-grid">
          <div>
            <span className="section-label">INTELIGÊNCIA</span>
            <h2>Seus dados começam a trabalhar para você.</h2>
            <p>
              O gFinance V2 combina análise financeira, automação e recursos
              de inteligência para transformar informações em contexto.
            </p>

            <div className="intelligence-list">
              <div>
                <Brain size={20} />
                <span>Análise dos seus padrões financeiros</span>
              </div>
              <div>
                <Receipt size={20} />
                <span>Extração de informações de recibos</span>
              </div>
              <div>
                <Target size={20} />
                <span>Acompanhamento das suas metas</span>
              </div>
            </div>
          </div>

          <div className="analysis-card">
            <div className="analysis-header">
              <div className="analysis-icon">
                <Brain size={20} />
              </div>
              <div>
                <strong>Análise financeira</strong>
                <span>gFinance Intelligence</span>
              </div>
            </div>

            <div className="analysis-message">
              <span>Seu mês está indo bem.</span>
              <strong>40% da sua renda foi preservada.</strong>
            </div>

            <div className="analysis-progress">
              <div>
                <span>Meta de reserva</span>
                <strong>30%</strong>
              </div>
              <div className="progress-track">
                <div />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-heading center">
            <span className="section-label">TECNOLOGIA</span>
            <h2>Construído para evoluir.</h2>
            <p>
              Uma arquitetura moderna preparada para crescer junto com o
              produto.
            </p>
          </div>

          <div className="tech-grid">
            {technologies.map((technology) => (
              <div className="tech-item" key={technology}>
                <CheckCircle2 size={17} />
                {technology}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="download-section" id="download">
        <div className="container download-content">
          <Smartphone size={42} />
          <span className="section-label">EXPERIMENTE</span>
          <h2>Leve o gFinance com você.</h2>
          <p>
            Baixe o aplicativo Android e experimente a nova geração do
            gFinance.
          </p>

          <a className="download-button" href="/gfinance-v2.apk">
            Baixar APK
            <ArrowRight size={19} />
          </a>

          <small>Versão de demonstração para Android</small>
        </div>
      </section>

      <footer>
        <div className="container footer-content">
          <div className="logo">
            <div className="logo-icon">
              <Wallet size={19} />
            </div>
            <span>gFinance V2</span>
          </div>

          <span>Projeto desenvolvido por Giovani Monari</span>

          <a
            href="https://github.com/GiovaniMonari/gFinance"
            target="_blank"
            rel="noreferrer"
          >
            <Github size={18} />
          </a>
        </div>
      </footer>
    </main>
  )
}

export default App
