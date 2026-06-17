# FMCG AI Analytics Assistant

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-blue.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-v19.0.0-blue.svg)](https://react.dev/)
[![Gemini](https://img.shields.io/badge/GenAI-Gemini--3.5--Flash-orange.svg)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

An AI-powered conversational analytics assistant for Consumer Packaged Goods (FMCG) category managers, sales leads, and supply chain analysts. This application integrates a React frontend dashboard and an Express.js backend simulator with Gemini's tool-calling functions to run diagnostic queries over synthetic sales, promotions, and inventory datasets.

---

## 📖 Technical Documentation

For in-depth analysis of the technical implementation, database simulation parameters, and AI configurations, refer to the following guides:

* 🏗️ **[System Architecture](docs/architecture.md)**: Explains the frontend SPA structure, Express API endpoints, and the real-time Server-Sent Events (SSE) data stream coordinator.
* 🎨 **[Design & Data Specification](docs/design.md)**: Details the design system, user experience assets, mathematical simulation equations, and injected business edge cases.
* 🤖 **[AI Tool Calling & Integration](docs/aitoolsusage.md)**: Provides a humanized walkthrough of Gemini's function declarations and how intent-based tool execution works.

---

## ✨ Core Features

* **Conversational AI Analytics**: Ask quantitative business questions in plain English and receive streaming, markdown-formatted diagnostic responses.
* **KPI Dashboard**: Get real-time summaries of critical parameters like revenue, unit volume, active promotion density, and stockout percentages alongside 12-week sales trends.
* **Product Catalog & Explorer**: Search and filter grid displaying 15 beverage SKUs and 40 retail store profiles. Quick hooks allow users to ask the AI to perform targeted analysis on specific rows.
* **Promo Simulator Playground**: A interactive scenario stage allowing category managers to simulate discount levels and predict elastic revenues, units sold, and profit margins.
* **Seeded Transaction Engine**: High-fidelity, deterministic generator generating 31,200 transaction rows simulating real-world anomalies (product cannibalization, regional replenishment delays, and pricing inelasticity).
* **Document Exports**: Dynamic conversion of simulated facts to CSV formats or generated PDF reports.

---

## 🛠️ Tech Stack

* **Frontend**: React 19, Vite, Recharts (visualizations), Motion (micro-animations), Tailwind CSS.
* **Backend**: Node.js, Express, TypeScript (`tsx`), PDFKit (PDF rendering).
* **AI Integration**: `@google/genai` (Google GenAI SDK) invoking `gemini-3.5-flash` with structured tool calling declarations.

---

## 🚀 Quick Start Guide

### Prerequisites
* [Node.js](https://nodejs.org/) (Version >= 20.0.0 is recommended)
* A Gemini API key (Can be obtained via [Google AI Studio](https://aistudio.google.com/))

### 1. Installation
Clone the repository and install all dependencies:
```bash
git clone https://github.com/your-username/fmcg-ai-analytics-assistant.git
cd fmcg-ai-analytics-assistant
npm install
```

### 2. Configure Environment Variables
Create a local `.env` configuration file by duplicating the template:
```bash
cp .env.example .env
```
Open `.env` and configure your Gemini credentials:
```env
GEMINI_API_KEY="your-gemini-api-key-here"
```

### 3. Running Locally (Development Mode)
Start the development environment which boots the Express backend and integrates Vite's hot-module reloading:
```bash
npm run dev
```
Open your browser and navigate to **`http://localhost:3000`**.

### 4. Build and Run in Production Mode
Compile the React SPA and bundle the Express backend into standard CJS bundles:
```bash
npm run build
npm start
```

### 5. Cleaning build files
To clear production builds and temporary bundles:
```bash
npm run clean
```
