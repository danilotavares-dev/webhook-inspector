# Webhook Inspector & Event Processor

[🌍 Read in English](./README.md) | [🇧🇷 Leia em Português](./README-pt.md)

This is a **Full-Stack (Monorepo)** project managed by **pnpm** with workspaces, designed to receive, inspect, and process webhook events.

The project consists of two main parts:
1.  **API (`api`):** Backend that receives, validates, and processes webhooks.
2.  **Web (`web`):** Inspection frontend to view webhook payloads in real-time.

## Highlights & Features

* **Monorepo Architecture:** Efficient code management via **pnpm workspaces**.
* **Smart Webhook Service:** Uses the Google AI SDK for the `generate-handler.ts` function, allowing the **dynamic generation of handlers** for different webhook events.
* **High-Performance Backend:** Built with **Fastify** for speed and robustness.
* **Validation and Typing:** Schema validation with **Zod** and route typing with `fastify-type-provider-zod`.
* **Visual Inspection:** Inspection interface (`web`) built with **React** and **TanStack Router**.
* **Database:** Uses **Drizzle ORM** to interact with PostgreSQL.

---

## Technologies Used

This Full-Stack project relies on the following technologies:

### Backend (`api` Workspace)

| Category | Technology | Main Use |
| :--- | :--- | :--- |
| **Web Framework** | **Fastify** | High-performance server. |
| **ORM** | **Drizzle ORM** | Database Mapping and Migrations. |
| **Validation** | **Zod** | Payload validation and route typing. |
| **AI/Generation** | **@ai-sdk/google** | Webhook handler code generation. |

### Frontend (`web` Workspace)

| Category | Technology | Main Use |
| :--- | :--- | :--- |
| **UI Framework** | **React** | Building the inspection interface. |
| **Routing** | **TanStack Router** | Client-side routing. |
| **State/Caching** | **TanStack Query** | Asynchronous state management. |
| **Styling** | **Tailwind CSS** | Fast and utility-first styling. |

---

## Getting Started

### Prerequisites

* **Node.js** (v18+)
* **pnpm** (Package manager)
* **Docker** (To run PostgreSQL)

### 1. Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone [YOUR_REPOSITORY_URL]
    cd webhook_projeto
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

3.  **Environment Configuration:**
    Create a `.env` file in the `api` folder and configure the `DATABASE_URL` and your Gemini/Google API key.

4.  **Initialize the Database with Docker:**
    ```bash
    docker-compose up -d postgres
    ```

5.  **Apply Database Migrations:**
    ```bash
    pnpm --filter api db:migrate
    # Optional: Populate the database with initial data (seed)
    # pnpm --filter api db:seed
    ```

### 2. Running the Project

You can start the Backend and Frontend simultaneously or separately:

* **Backend (API):**
    ```bash
    pnpm --filter api dev
    # Will run the Fastify server in development (monitored by tsx)
    ```

* **Frontend (Web):**
    ```bash
    pnpm --filter web dev
    # Will run the inspection interface (Vite)
    ```

---

## 🌐 Endpoints and Access

| Service | Default URL | Description |
| :--- | :--- | :--- |
| **Webhooks API (POST)** | `http://localhost:5333/api/webhooks` | Main endpoint for sending webhook payloads. |
| **Web Inspector (GET)** | `http://localhost:5173/` | Visual interface to inspect received webhooks. |
