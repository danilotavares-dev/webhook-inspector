# Webhook Inspector & Event Processor

[🌍 Read in English](./README.md) | [🇧🇷 Leia em Português](./README-pt.md)

Este é um projeto **Full-Stack (Monorepo)** gerenciado pelo **pnpm** com workspaces, projetado para receber, inspecionar e processar eventos de webhook.

O projeto consiste em duas partes principais:
1.  **API (`api`):** Backend que recebe, valida e processa os webhooks.
2.  **Web (`web`):** Frontend de inspeção para visualizar os payloads de webhook em tempo real.

## Destaques & Funcionalidades

* **Arquitetura Monorepo:** Gerenciamento eficiente de código via **pnpm workspaces**.
* **Serviço de Webhook Inteligente:** Utiliza o Google AI SDK para a função `generate-handler.ts`, permitindo a **geração dinâmica de handlers** para diferentes eventos de webhook.
* **Backend de Alta Performance:** Construído com **Fastify** para rapidez e robustez.
* **Validação e Tipagem:** Validação de esquema com **Zod** e tipagem de rotas com `fastify-type-provider-zod`.
* **Inspeção Visual:** Interface de inspeção (`web`) construída com **React** e **TanStack Router**.
* **Banco de Dados:** Utiliza **Drizzle ORM** para interagir com o PostgreSQL.

---

## Tecnologias Utilizadas

Este projeto Full-Stack se apoia nas seguintes tecnologias:

### Backend (Workspace `api`)

| Categoria | Tecnologia | Uso Principal |
| :--- | :--- | :--- |
| **Framework Web** | **Fastify** | Servidor de alta performance. |
| **ORM** | **Drizzle ORM** | Mapeamento e Migrações do Banco de Dados. |
| **Validação** | **Zod** | Validação de payloads e tipagem de rotas. |
| **AI/Geração** | **@ai-sdk/google** | Geração de código do handler de webhook. |

### Frontend (Workspace `web`)

| Categoria | Tecnologia | Uso Principal |
| :--- | :--- | :--- |
| **Framework UI** | **React** | Construção da interface de inspeção. |
| **Roteamento** | **TanStack Router** | Roteamento do lado do cliente. |
| **State/Caching** | **TanStack Query** | Gerenciamento de estado assíncrono. |
| **Estilização** | **Tailwind CSS** | Estilização rápida e utilitária. |

---

## Como Começar

### Pré-requisitos

* **Node.js** (v18+)
* **pnpm** (Gerenciador de pacotes)
* **Docker** (Para rodar o PostgreSQL)

### 1. Instalação & Setup

1.  **Clone o repositório:**
    ```bash
    git clone [URL_DO_SEU_REPOSITORIO]
    cd webhook_projeto
    ```

2.  **Instale as dependências:**
    ```bash
    pnpm install
    ```

3.  **Configuração do Ambiente:**
    Crie o arquivo `.env` na pasta `api` e configure a `DATABASE_URL` e a chave de API do Gemini/Google.

4.  **Inicialize o Banco de Dados com Docker:**
    ```bash
    docker-compose up -d postgres
    ```

5.  **Aplique as Migrações do Banco:**
    ```bash
    pnpm --filter api db:migrate
    # Opcional: Popular o banco com dados iniciais (seed)
    # pnpm --filter api db:seed
    ```

### 2. Executando o Projeto

Você pode iniciar o Backend e o Frontend simultaneamente ou separadamente:

* **Backend (API):**
    ```bash
    pnpm --filter api dev
    # Rodará o servidor Fastify em desenvolvimento (monitorado por tsx)
    ```

* **Frontend (Web):**
    ```bash
    pnpm --filter web dev
    # Rodará a interface de inspeção (Vite)
    ```

---

## 🌐 Endpoints e Acessos

| Serviço | URL Padrão | Descrição |
| :--- | :--- | :--- |
| **API Webhooks (POST)** | `http://localhost:5333/api/webhooks` | Endpoint principal para envio de payloads de webhook. |
| **Web Inspector (GET)** | `http://localhost:5173/` | Interface visual para inspecionar os webhooks recebidos. |
