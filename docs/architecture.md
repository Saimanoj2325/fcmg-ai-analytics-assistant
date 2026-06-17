# FMCG AI Analytics Assistant — System Architecture

This document outlines the full system architecture, directory layout, component responsibilities, API surface, and real-time AI communication pipeline of the FMCG AI Analytics Assistant.

---

## 1. High-Level System Overview

The application is a single-repository full-stack project. A **React SPA** handles all user interaction on the frontend. An **Express.js server** powers the REST API, serves the built frontend in production, and runs the Gemini AI agent pipeline on the backend.

![System Architecture Diagram](./architecture_diagram.png)

**Three-tier breakdown:**

| Tier | Technology | Responsibility |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite, Recharts, Motion | UI rendering, SSE stream decoding, state management |
| **Backend** | Express.js, Node.js, TypeScript | REST API, Gemini orchestration, in-memory data engine |
| **External Services** | Google Gemini Cloud API, PDFKit | AI inference, document generation |

---

## 2. Directory Structure

```
fmcg-ai-analytics-assistant/
├── server.ts                  # Express server entry point + Gemini agent logic
├── index.html                 # Vite SPA root HTML template
├── vite.config.ts             # Vite build configuration
├── tsconfig.json              # TypeScript compiler options
├── package.json               # Scripts and dependencies
├── .env.example               # Environment variable template
├── docs/
│   ├── architecture.md        # This file — system architecture
│   ├── architecture_diagram.png  # System architecture visual
│   ├── design.md              # Data simulation design and UI/UX spec
│   └── aitoolsusage.md        # Gemini function calling guide
└── src/
    ├── main.tsx               # React bootstrapping entry
    ├── App.tsx                # Root layout, navigation, SSE coordinator
    ├── types.ts               # Shared TypeScript interfaces
    ├── index.css              # Global styles
    ├── components/
    │   ├── Sidebar.tsx        # Navigation rail and conversation list
    │   ├── Dashboard.tsx      # KPI cards and Recharts visualisations
    │   ├── ChatInterface.tsx  # Streaming AI chat terminal
    │   ├── ProductExplorer.tsx  # SKU and store data grid
    │   └── PromoSimulator.tsx   # Promotion scenario builder
    ├── data/
    │   └── syntheticData.ts   # Deterministic in-memory dataset engine
    └── utils/
        └── pdfGenerator.ts    # Server-side PDF report builder
```

---

## 3. Frontend Architecture

### Navigation and State

All page routing is managed in [`App.tsx`](../src/App.tsx) through a single `currentTab` string state — `'dashboard'`, `'chat'`, `'products'`, or `'simulator'`. On mount, `App.tsx` performs a parallel fetch of products, stores, dashboard KPIs, and conversation history, storing them in local React state.

### Component Responsibilities

| Component | Responsibility |
| :--- | :--- |
| `Sidebar.tsx` | Tab navigation, conversation list, create/delete conversation actions |
| `Dashboard.tsx` | KPI metric cards, 12-week revenue trend chart, regional bar chart, top-5 products list |
| `ChatInterface.tsx` | Message thread rendering, streaming text display, tool-call status indicator |
| `ProductExplorer.tsx` | Filterable SKU grid, store directory, one-click AI prompt shortcuts |
| `PromoSimulator.tsx` | Discount slider controls, real-time elasticity calculation, AI scenario dispatch |

### Real-Time SSE Decoding

Responses from the AI pipeline use **Server-Sent Events (SSE)** rather than standard JSON responses. The flow inside `App.tsx`:

1. Frontend sends `POST /api/conversations/:id/messages` with the user message body.
2. The response body is consumed as a `ReadableStream` using a `TextDecoder` loop.
3. Each SSE frame is split on `\n\n` and parsed for the `data:` prefix.
4. Four event types are handled:

| Event Type | Frontend Action |
| :--- | :--- |
| `user_message` | Confirms the server persisted the user turn |
| `tool_call` | Shows a spinner with the tool name being executed |
| `chunk` | Appends token text to the streaming message bubble |
| `done` | Ends the stream, refreshes the full conversation list |

---

## 4. Backend Architecture

### Technology

The server runs on **Node.js** with **TypeScript** via `tsx`. In development, Vite middleware is mounted directly on the Express app to enable hot module replacement. In production, Express serves the pre-built `/dist` static folder.

### REST API Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/healthz` | GET | Server health check |
| `/api/products` | GET | Products list — filterable by `category`, `brand` |
| `/api/stores` | GET | Stores list — filterable by `region` |
| `/api/dashboard/summary` | GET | Aggregated KPIs, weekly trend, top products, regional split |
| `/api/conversations` | GET | List all conversation threads |
| `/api/conversations` | POST | Create a new conversation thread |
| `/api/conversations/:id` | GET | Fetch a single conversation with full message history |
| `/api/conversations/:id` | DELETE | Delete a conversation thread |
| `/api/conversations/:id/messages` | POST | Submit a message — initiates SSE AI stream |
| `/api/download/csv/products` | GET | Download products as CSV |
| `/api/download/csv/stores` | GET | Download stores as CSV |
| `/api/download/csv/sales_promotions` | GET | Download sales and promotions as CSV |
| `/api/download/csv/inventory` | GET | Download inventory records as CSV |
| `/api/download/pdf` | GET | Download PDF evaluation report |

---

## 5. Gemini AI Pipeline

When a user sends a message, the backend runs a **two-turn Gemini interaction** before streaming the response:

**Step 1 — History Construction**
The last 10 messages of the conversation are formatted into Gemini's `contents` array, preserving `user` and `model` roles.

**Step 2 — First Turn: Tool Decision**
`generateContent` is called with the conversation history, a detailed FMCG domain system instruction, and five structured function declarations. Gemini decides whether it needs to query the database or can answer directly.

**Step 3 — Tool Execution**
If Gemini returns `functionCalls`, the server routes each call to the matching TypeScript query function and returns aggregated JSON results:

| Function Declaration | What It Queries |
| :--- | :--- |
| `query_sales_promotions` | Weekly sales volume, revenue, and promo records |
| `query_inventory` | Stock levels, replenishment counts, stockout flags |
| `query_regional_summary` | Revenue and units aggregated by region |
| `query_product_performance` | SKUs ranked by revenue or volume |
| `query_promo_impact` | Uplift percentage between promo and baseline weeks |

**Step 4 — Second Turn: Synthesis and Streaming**
The conversation history, the model's tool call block, and all database results are submitted together. `generateContentStream` streams the final natural-language answer token by token back to the client via SSE.

**Step 5 — Direct Reply Path**
If Gemini does not call any tools, the first-turn text response is streamed directly without a second round trip.

**Step 6 — Model Fallback Chain**
Both `generateContent` and `generateContentStream` wrap a retry loop. If the primary model (`gemini-2.5-flash`) fails, the server automatically retries with `gemini-2.0-flash`, `gemini-1.5-flash`, and further fallbacks until a response is received.

---

## 6. Simulated Database Engine

The synthetic dataset lives entirely in memory inside [`syntheticData.ts`](../src/data/syntheticData.ts). It is generated deterministically using a seeded pseudo-random number generator at server startup — no file I/O or external database required.

| Dataset | Size | Description |
| :--- | :--- | :--- |
| `PRODUCTS` | 15 rows | Beverage SKUs across 5 categories |
| `STORES` | 40 rows | Retail stores across 4 regions and 4 formats |
| `SALES_PROMOTIONS` | 31,200 rows | Weekly sales, revenue, and promo facts |
| `INVENTORY` | 31,200 rows | Weekly stock, replenishment, and stockout records |

Data generation completes in under 50 ms on a standard machine and produces consistent results on every server restart.

---

## 7. Build and Deployment

### Development Mode
```bash
npm run dev          # tsx server.ts — Express + Vite middleware on port 3000
```

### Production Build
```bash
npm run build        # Vite builds /dist SPA + esbuild bundles server.ts to dist/server.cjs
npm start            # Runs dist/server.cjs — Express serves /dist as static files
```

### Environment Variables

| Variable | Required | Description |
| :--- | :--- | :--- |
| `GEMINI_API_KEY` | Yes | Google AI Studio or Vertex AI API key |
| `APP_URL` | Optional | Public URL for hosted deployments |
