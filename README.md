# gWallet

API backend para gerenciamento de finanças pessoais, desenvolvida com **NestJS, TypeScript, PostgreSQL e Prisma**.

O gWallet faz parte de uma aplicação full stack para gerenciamento financeiro, com frontend desenvolvido em **Vite**, permitindo que usuários registrem suas movimentações, organizem despesas por categorias, acompanhem despesas recorrentes, definam metas financeiras e gerem relatórios financeiros em PDF.

O backend fornece uma API REST autenticada utilizando JWT e integra serviços como **Redis, BullMQ, Resend e PDFKit** para processamento assíncrono, notificações e geração de relatórios.

---

## 🚀 Funcionalidades

### 🔐 Autenticação

- Cadastro de usuários
- Login
- Autenticação utilizando JWT
- Proteção das rotas com Guards
- Isolamento dos dados por usuário

### 💰 Controle financeiro

- Criação e gerenciamento de contas financeiras
- Definição de renda mensal
- Registro de receitas
- Registro de despesas
- Registro de depósitos
- Consulta de transações
- Paginação de transações
- Resumo financeiro

### 🏷️ Categorias

- Criação de categorias
- Listagem de categorias
- Atualização de categorias
- Exclusão de categorias
- Associação de categorias às transações e despesas recorrentes

### 🔄 Despesas recorrentes

- Criação de despesas recorrentes
- Definição do dia de vencimento
- Atualização de despesas
- Ativação e desativação
- Exclusão
- Processamento automático de lembretes

O sistema verifica diariamente as despesas próximas do vencimento e agenda o envio de lembretes por e-mail.

### 🎯 Metas financeiras

- Criação de metas
- Definição de valor alvo
- Definição de prazo
- Acompanhamento do progresso
- Adição de valores à meta
- Remoção de valores
- Histórico de movimentações
- Cálculo de progresso e valor restante
- Identificação do status da meta

### 📊 Relatórios financeiros

- Geração de relatório financeiro em PDF
- Resumo de receitas e despesas
- Saldo do período
- Depósitos realizados
- Despesas agrupadas por categoria
- Percentual de participação das categorias
- Análise financeira
- Progresso das metas
- Filtro por período

Exemplo:

```http
GET /financial-reports/pdf?startDate=2026-09-01&endDate=2026-09-30
```

### 📧 Notificações

O sistema utiliza **Resend** para envio de e-mails.

Atualmente são utilizados para notificações de despesas recorrentes próximas do vencimento.

### ⚙️ Processamento assíncrono

O processamento de tarefas em background utiliza:

- Redis
- BullMQ
- NestJS Schedule

Fluxo simplificado:

```text
Scheduler
    ↓
Identifica despesas próximas do vencimento
    ↓
BullMQ
    ↓
Redis
    ↓
Worker / Processor
    ↓
EmailService
    ↓
Resend
    ↓
E-mail do usuário
```

---

## 🛠️ Tecnologias

### Frontend

- Vite
- React

### Backend

- [NestJS](https://nestjs.com/)
- TypeScript
- Node.js

### Banco de dados

- PostgreSQL
- Prisma ORM

### Autenticação

- JWT
- Passport
- Guards do NestJS

### Processamento assíncrono

- Redis
- BullMQ
- `@nestjs/schedule`

### E-mail

- Resend

### Relatórios

- PDFKit

### Documentação

- Swagger / OpenAPI
- `@nestjs/swagger`

### Deploy

- Railway

---

## 📁 Estrutura do projeto

A estrutura é organizada por módulos de domínio:

```text
src/
├── auth/
├── categories/
├── financial-goals/
├── financial-reports/
├── finances/
├── recurring-expenses/
├── transactions/
├── email/
├── queue/
├── prisma/
└── app.module.ts
```

Cada módulo concentra suas próprias responsabilidades, como:

- Controllers
- Services
- DTOs
- Regras de negócio

Essa organização facilita a manutenção e a evolução da aplicação.

---

## 📚 Documentação da API

A API possui documentação interativa através do Swagger.

### Produção

👉 [Acessar Swagger](https://gfinance-production-d5a6.up.railway.app/swagger)

### Execução local

Com a aplicação rodando localmente:

👉 [Swagger local](http://localhost:3000/swagger)

A documentação permite visualizar os endpoints, parâmetros, DTOs e autenticar requisições protegidas utilizando JWT.

A interface permite:

- Visualizar todos os endpoints
- Consultar parâmetros
- Visualizar os DTOs
- Testar requisições
- Autenticar utilizando JWT
- Consultar os diferentes módulos da API

### Autenticação no Swagger

1. Realize o login através de:

```http
POST /auth/login
```

2. Copie o `access_token`.

3. Clique em **Authorize 🔒** no Swagger.

4. Informe o token JWT.

5. As rotas protegidas poderão ser executadas diretamente pela interface.

---

## 🔧 Configuração

### Requisitos

Antes de executar o projeto, certifique-se de possuir:

- Node.js
- PostgreSQL
- Redis
- npm

### Instalação

Clone o projeto:

```bash
git clone <URL_DO_REPOSITORIO>
```

Entre na pasta:

```bash
cd gwallet
```

Instale as dependências:

```bash
npm install
```

---

## 🔐 Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto.

Exemplo:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

JWT_SECRET="your-secret"

REDIS_URL="redis://localhost:6379"

RESEND_API_KEY="your-resend-api-key"
```

> Nunca versione o arquivo `.env` contendo credenciais reais.

Recomenda-se disponibilizar um `.env.example` no repositório.

---

## 🗄️ Banco de dados

O projeto utiliza Prisma para gerenciamento do banco de dados.

Após configurar o `DATABASE_URL`, execute:

```bash
npx prisma generate
```

Para aplicar as migrations:

```bash
npx prisma migrate deploy
```

Durante o desenvolvimento, novas migrations podem ser criadas com:

```bash
npx prisma migrate dev
```

---

## ▶️ Executando o projeto

### Desenvolvimento

```bash
npm run start:dev
```

### Build

```bash
npm run build
```

### Produção

```bash
npm run start:prod
```

Após iniciar a aplicação, a API estará disponível na porta configurada pelo ambiente.

A documentação Swagger estará disponível em:

```text
/swagger
```

---

## 🔄 Exemplo de fluxo

Um exemplo do fluxo de uma despesa recorrente:

```text
Usuário
   │
   ▼
Cria despesa recorrente
   │
   ▼
PostgreSQL
   │
   ▼
Scheduler verifica vencimentos
   │
   ▼
Despesa vence em 2 dias?
   │
   ├── Não ──► Aguarda próxima execução
   │
   └── Sim
        │
        ▼
      BullMQ
        │
        ▼
      Redis
        │
        ▼
    Processor
        │
        ▼
    EmailService
        │
        ▼
      Resend
        │
        ▼
    E-mail enviado
```

---

## 🔒 Segurança

A API utiliza:

- Autenticação baseada em JWT
- Guards para proteção de endpoints
- Validação de dados com `class-validator`
- Prisma para acesso ao banco
- Isolamento dos recursos por usuário
- Variáveis de ambiente para informações sensíveis

As operações financeiras são associadas ao usuário autenticado, evitando que um usuário acesse diretamente os dados financeiros de outro.

---

## 📌 Principais endpoints

### Auth

```http
POST /auth/register
POST /auth/login
```

### Finances

```http
POST /finances
POST /finances/income
POST /finances/transactions
POST /finances/delete
PATCH /finances/income
POST /finances/get
```

### Transactions

```http
POST /transactions
GET /transactions
GET /transactions/summary
GET /transactions/expenses-by-category
GET /transactions/monthly-summary
GET /transactions/:id
```

### Categories

```http
POST /categories
GET /categories
PATCH /categories/:id
DELETE /categories/:id
```

### Recurring Expenses

```http
POST /recurring-expenses
GET /recurring-expenses
PATCH /recurring-expenses/:id
DELETE /recurring-expenses/:id
```

### Financial Goals

```http
POST /financial-goals
GET /financial-goals
GET /financial-goals/:id
PATCH /financial-goals/:id
PATCH /financial-goals/:id/progress
PATCH /financial-goals/:id/progress/remove
GET /financial-goals/:id/transactions
DELETE /financial-goals/:id
```

### Financial Reports

```http
GET /financial-reports/pdf
```

Filtros disponíveis:

```text
startDate
endDate
```

---

## 🏗️ Arquitetura

O projeto utiliza uma arquitetura modular baseada no NestJS.

```mermaid
flowchart TB

    Client["👤 Client / Frontend"]

    API["🚀 NestJS API<br/>REST • JWT • Swagger"]

    subgraph Modules["Módulos da aplicação"]
        Auth["Auth"]
        Finance["Finances"]
        Transactions["Transactions"]
        Categories["Categories"]
        Recurring["Recurring Expenses"]
        Goals["Financial Goals"]
        Reports["Financial Reports"]
    end

    Prisma["Prisma ORM"]
    PostgreSQL[("PostgreSQL")]

    Redis[("Redis")]
    BullMQ["BullMQ"]
    Jobs["Background Jobs"]

    Resend["Resend<br/>Email Notifications"]
    PDFKit["PDFKit<br/>Financial PDF Reports"]

    subgraph Railway["☁️ Railway"]
        API
        Redis
        PostgreSQL
        BullMQ
        Jobs
    end

    Client --> API

    API --> Auth
    API --> Finance
    API --> Transactions
    API --> Categories
    API --> Recurring
    API --> Goals
    API --> Reports

    API --> Prisma
    Prisma --> PostgreSQL

    API --> Redis
    Redis --> BullMQ
    BullMQ --> Jobs

    API --> Resend
    API --> PDFKit

    Swagger["📚 Swagger<br/>/swagger"]
    API --> Swagger

    classDef api fill:#1e293b,stroke:#38bdf8,color:#fff,stroke-width:2px
    classDef database fill:#172554,stroke:#60a5fa,color:#fff
    classDef service fill:#1e293b,stroke:#94a3b8,color:#fff
    classDef module fill:#0f172a,stroke:#64748b,color:#fff
    classDef external fill:#111827,stroke:#22d3ee,color:#fff

    class API api
    class PostgreSQL,Redis database
    class Prisma,BullMQ,Jobs,Resend,PDFKit,Swagger service
    class Auth,Finance,Transactions,Categories,Recurring,Goals,Reports module
    class Client external
```

### Fluxo principal

```text
Cliente
   │
   ▼
NestJS API
   │
   ├── JWT / Autenticação
   │
   ├── Regras de negócio
   │
   ├── Prisma ──────────► PostgreSQL
   │
   ├── Redis ───────────► BullMQ ─────► Jobs
   │
   ├── Resend ──────────► E-mails
   │
   └── PDFKit ──────────► Relatórios PDF
```

### Infraestrutura

```text
                         ┌──────────────────────┐
                         │       Railway        │
                         │                      │
                         │  ┌────────────────┐  │
                         │  │   NestJS API   │  │
                         │  └───────┬────────┘  │
                         │          │           │
                         │     ┌────┴────┐      │
                         │     ▼         ▼      │
                         │ PostgreSQL   Redis   │
                         │               │      │
                         │               ▼      │
                         │            BullMQ    │
                         └──────────────────────┘
```

## 📈 Objetivo do projeto

O gWallet foi desenvolvido como um projeto prático para aplicar conceitos de desenvolvimento backend, arquitetura de APIs e engenharia de software.

O projeto aborda conceitos como:

- Desenvolvimento de APIs REST
- Arquitetura modular
- Autenticação e autorização
- ORM e modelagem de banco de dados
- Processamento assíncrono
- Filas e jobs
- Cache e infraestrutura com Redis
- Geração de documentos
- Agendamento de tarefas
- Integração com serviços externos
- Documentação de APIs com OpenAPI
- Deploy de aplicações backend

---

## 🚀 Próximos passos

O MVP atual está estruturado e funcional, com backend e frontend integrados.

Possíveis evoluções futuras incluem:

- Evolução da infraestrutura e observabilidade
- Implementação de testes automatizados mais abrangentes
- Expansão dos relatórios financeiros
- Melhorias no processamento assíncrono
- Monitoramento e métricas da aplicação
- Otimizações de performance e escalabilidade
- Evolução da experiência do usuário

---

## 👨‍💻 Sobre

Projeto desenvolvido com foco em **backend development, arquitetura de software e construção de APIs escaláveis** utilizando Node.js, TypeScript e NestJS.

---

## 📄 Licença

Este projeto está disponível para fins de estudo e desenvolvimento pessoal.