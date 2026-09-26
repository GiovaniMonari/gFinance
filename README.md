# 💰 gFinance

API backend para gerenciamento financeiro pessoal, desenvolvida com **NestJS, TypeScript, Prisma e PostgreSQL**.

O gFinance permite que usuários controlem receitas, despesas, categorias, despesas recorrentes e metas financeiras, além de gerar relatórios financeiros em PDF e receber lembretes automáticos sobre contas próximas do vencimento.

O projeto foi desenvolvido com foco em **arquitetura modular, processamento assíncrono, organização de código e escalabilidade**.

---

## 🚀 Funcionalidades

### 🔐 Autenticação
- Cadastro de usuários
- Login com JWT
- Proteção de rotas
- Isolamento dos dados financeiros por usuário

### 💰 Gestão financeira
- Registro de receitas
- Registro de despesas
- Registro de depósitos
- Categorias personalizadas
- Controle de saldo
- Status de transações

### 🔄 Despesas recorrentes
- Cadastro de despesas recorrentes
- Definição do dia de execução
- Ativação/desativação
- Controle da próxima execução
- Lembretes automáticos por e-mail

### 🎯 Metas financeiras
- Criação de metas
- Definição de valor objetivo
- Controle do valor acumulado
- Depósitos e retiradas
- Percentual de progresso
- Valor restante
- Prazo da meta
- Identificação de metas concluídas e atrasadas

### 📊 Relatórios financeiros
- Geração de relatórios em PDF
- Filtro por período
- Resumo de receitas e despesas
- Saldo do período
- Despesas agrupadas por categoria
- Gráficos
- Análise financeira
- Informações sobre metas

### 📧 Notificações
O sistema possui processamento assíncrono para envio de lembretes de despesas recorrentes.

Quando uma despesa recorrente está próxima do vencimento, o sistema identifica a conta e agenda o envio de um e-mail de lembrete.

---

## 🏗️ Arquitetura

O projeto utiliza uma arquitetura modular baseada no NestJS.

```text
┌──────────────────────┐
│       Client         │
└──────────┬───────────┘
           │ HTTP
           ▼
┌──────────────────────┐
│      NestJS API      │
├──────────────────────┤
│ Auth                 │
│ Finance              │
│ Transactions         │
│ Categories           │
│ Recurring Expenses   │
│ Financial Goals      │
│ Financial Reports    │
└──────────┬───────────┘
           │
     ┌─────┴─────┐
     ▼           ▼
 PostgreSQL    Redis
     │           │
   Prisma      BullMQ
                 │
                 ▼
            Background Jobs
                 │
                 ▼
              Resend
```

### Processamento assíncrono

O **BullMQ + Redis** é utilizado para executar tarefas em background, evitando que operações como envio de e-mails dependam diretamente do ciclo da requisição HTTP.

Exemplo:

```text
Scheduler
    ↓
Identifica contas próximas do vencimento
    ↓
BullMQ
    ↓
Worker
    ↓
Email Service
    ↓
Resend
```

---

## 🛠️ Tecnologias

### Backend

- **Node.js**
- **TypeScript**
- **NestJS**
- **Prisma**
- **PostgreSQL**
- **JWT**
- **class-validator**

### Processamento assíncrono

- **Redis**
- **BullMQ**
- **@nestjs/schedule**

### Relatórios e comunicação

- **PDFKit**
- **Resend**

### Infraestrutura

- **Railway**
- **Docker** *(quando utilizado no ambiente de desenvolvimento/produção)*

---

## 📁 Estrutura do projeto

```text
src/
├── auth/
├── categories/
├── financial-goals/
├── financial-reports/
├── prisma/
├── recurring-expenses/
├── transactions/
├── email/
├── queue/
├── finances/
└── main.ts
```

A estrutura pode variar conforme a evolução do projeto, mas os módulos são organizados por domínio para facilitar manutenção e evolução da aplicação.

---

## ⚙️ Requisitos

Antes de executar o projeto, tenha instalado:

- Node.js
- npm
- PostgreSQL
- Redis

---

## 🔧 Configuração

Clone o repositório:

```bash
git clone <URL_DO_REPOSITORIO>
```

Entre na pasta:

```bash
cd gFinance/backend
```

Instale as dependências:

```bash
npm install
```

Crie um arquivo `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

JWT_SECRET="sua-chave-secreta"

REDIS_URL="redis://localhost:6379"

RESEND_API_KEY="sua-api-key"
```

---

## 🗄️ Banco de dados

Execute as migrations:

```bash
npx prisma migrate deploy
```

Para desenvolvimento, quando necessário:

```bash
npx prisma migrate dev
```

Gere o Prisma Client:

```bash
npx prisma generate
```

---

## ▶️ Executando

### Desenvolvimento

```bash
npm run start:dev
```

### Produção

```bash
npm run build
npm run start:prod
```

---

## 🧪 Testes

Executar os testes:

```bash
npm test
```

Modo watch:

```bash
npm run test:watch
```

Cobertura:

```bash
npm run test:cov
```

---

## 📄 Relatórios

O sistema disponibiliza um endpoint para geração de relatório financeiro em PDF:

```http
GET /financial-reports/pdf
```

Também é possível filtrar por período:

```http
GET /financial-reports/pdf?startDate=2026-09-01&endDate=2026-09-30
```

O endpoint exige autenticação JWT.

---

## 📧 Lembretes de despesas recorrentes

O sistema verifica diariamente as despesas recorrentes próximas do vencimento.

O fluxo utiliza:

```text
Cron Scheduler
      ↓
Prisma
      ↓
BullMQ
      ↓
Processor
      ↓
EmailService
      ↓
Resend
```

O `jobId` é construído utilizando o identificador da despesa e a data de execução, evitando o processamento duplicado do mesmo lembrete.

---

## 🔒 Segurança

O gFinance utiliza:

- Autenticação baseada em JWT
- Guards do NestJS
- Validação de DTOs
- Isolamento dos dados financeiros por usuário
- Variáveis de ambiente para informações sensíveis

Segredos e credenciais não devem ser versionados no repositório.

---

## 📌 Próximos passos

Possíveis evoluções do projeto:

- Dashboard web
- Comparação financeira entre períodos
- Mais notificações e alertas
- Testes automatizados de integração
- Observabilidade e monitoramento
- Melhorias de performance
- Integração com serviços financeiros externos

---

## 👨‍💻 Sobre o projeto

O gFinance foi desenvolvido como um projeto autoral com o objetivo de aplicar conceitos de desenvolvimento backend, arquitetura de software, processamento assíncrono e integração entre diferentes serviços.

O projeto também serve como laboratório para práticas relacionadas a:

- APIs REST
- Arquitetura modular
- ORM
- Filas e processamento assíncrono
- Cache e mensageria
- Autenticação
- Geração de documentos
- Integração com serviços externos
- Deploy em cloud

---

## 📜 Licença

Este projeto está sob a licença definida no repositório.