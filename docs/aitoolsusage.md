# FMCG AI Analytics Assistant - AI Tool Calling & Integration Guide

This guide explains how the AI Tool Calling (Function Calling) paradigm is designed, configured, and executed in the FMCG AI Analytics Assistant. It covers the technical flow and provides a humanized step-by-step walk-through of the process.

---

## 1. Why AI Tool Calling?

Large Language Models (LLMs) are exceptionally good at natural language processing and translation, but they struggle with quantitative analytics. If you ask an LLM to look at 30,000 transaction rows and compute the average revenue uplift, it will either hallucinate numbers or run out of context space.

**AI Tool Calling** solves this problem by splitting the cognitive workload:
- **Gemini is the Brain**: It understands what the user wants, parses the business intent, determines which analytical tools to invoke, and writes the exact database queries.
- **The Server is the Hands**: It runs the queries locally, handles mathematical operations, aggregates records, and returns the exact answers back to the model.
- **Synthesized Delivery**: Gemini receives the database facts, translates them into natural language business insights, and formats them into clean markdown tables or bullet points.

---

## 2. Declared Analytical Tools

In [server.ts](file:///c:/Users/Sai/Downloads/fmcg-ai-analytics-assistant/server.ts), we expose five function declarations to Gemini using the `@google/genai` SDK:

### A. `query_sales_promotions`
Used to retrieve weekly sales volume, revenue, and active promotions.
* **Parameters**:
  - `region`: (Optional) North, South, East, or West.
  - `product_id`: (Optional) SKU identifier (e.g., `BEV-001`).
  - `week_start` / `week_end`: (Optional) ISO dates.
  - `promo_type`: (Optional) Price Cut, BOGO, Display Feature, or Bundle.

### B. `query_inventory`
Used to inspect stock levels, replenishment volumes, and stockout statuses.
* **Parameters**:
  - `region`, `product_id`, `week_start`, `week_end`
  - `stockout_only`: (Optional Boolean) Filter strictly to weeks where closing stock is 0 or stockout warning flags are active.

### C. `query_regional_summary`
Provides high-level aggregates comparing performance across North, South, East, and West directly.
* **Parameters**: `week_start`, `week_end`

### D. `query_product_performance`
Ranks and retrieves the top/bottom performing product SKUs by revenue or unit volume.
* **Parameters**:
  - `category`: Carbonated, Juice, Water, Energy, or Dairy.
  - `top_n`: Number of SKUs to fetch (Defaults to 5).
  - `week_start`, `week_end`
  - `promo_flag`: Filter specifically by promotional vs non-promotional weeks.

### E. `query_promo_impact`
Compares active promotion weeks against baseline standard weeks to compute volume and revenue uplift percentages.
* **Parameters**: `product_id`, `promo_type`, `region`

---

## 3. The Execution Pipeline (Step-by-Step)

The conversational loop runs asynchronously across a multi-turn pipeline using Server-Sent Events (SSE):

```
[User Prompt] 
     │
     ▼
1. Appends latest history and triggers first-turn call to Gemini
     │
     ▼
2. Gemini responds with tool calls (e.g., query_inventory)
     │
     ├─────────────────────────────────┐
     ▼                                 ▼
[SSE event: 'tool_call']      3. Server runs TS queries
     │                                 │
     │                                 ▼
     │                        4. Server returns JSON data to Gemini
     │                                 │
     ▼                                 ▼
[Frontend spinner spins]      5. Gemini synthesizes final response
     │                                 │
     │                                 ▼
     │                        6. Server streams tokens to client
     │                                 │
     ├─────────────────────────────────┘
     ▼
[SSE event: 'chunk'] -> Stream rendered incrementally
     │
     ▼
[SSE event: 'done'] -> Connection ends
```

1. **Prompt Delivery**: The user sends a prompt (e.g., *"How did BOGO promotions perform in the North region?"*).
2. **First-Turn Decision**: The server formats the last 10 messages of conversation history and calls Gemini. The model analyzes the request and realizes it needs specific sales figures. Instead of generating a textual answer, it returns a structured JSON tool instruction:
   ```json
   {
     "functionCalls": [
       {
         "name": "query_promo_impact",
         "args": {
           "promo_type": "BOGO",
           "region": "North"
         }
       }
     ]
   }
   ```
3. **Execution**: The Express server catches this block, routes it to the TypeScript simulation DB engine, runs the aggregate calculations, and obtains the JSON response:
   ```json
   {
     "product_id": "ALL_PRODUCTS",
     "promo_type": "BOGO",
     "region": "North",
     "promo_period": { "total_units": 4500, "weekly_average_units": 150.0 },
     "baseline_period": { "total_units": 12000, "weekly_average_units": 120.4 },
     "uplift_percentage": 24.6
   }
   ```
4. **Client Notification**: The server fires an SSE notification (`type: 'tool_call', tools: 'query_promo_impact'`) to let the React client know which tool is running.
5. **Synthesis & Stream**: The server submits the conversation history, the tool call, and the database query results back to Gemini. The model synthesizes the raw JSON into professional business analysis and streams the text back to the client token-by-token.
6. **Completion**: When the stream ends, the server sends a `done` event, closing the connection.

---

## 4. Humanized Walkthrough Example

Let’s look at a trace of a complex request.

### The Question
> **User**: *"Which regions had stockouts during Price Cut promotions in March?"*

### The AI's Logic Trace
1. **Parsing Intent**: Gemini recognizes two constraints: "March 2024" (Weeks 9 through 13) and "Price Cut promotions".
2. **Identifying Needs**:
   - To find "Price Cut promotions", it needs to query sales and promotions records.
   - To find "stockouts", it needs to cross-reference inventory levels.
3. **Issuing Tool Calls**: Gemini issues two concurrent calls to the server:
   - Tool 1: `query_sales_promotions` with parameters `week_start: "2024-03-01"`, `week_end: "2024-03-31"`, `promo_type: "Price Cut"`.
   - Tool 2: `query_inventory` with parameters `week_start: "2024-03-01"`, `week_end: "2024-03-31"`, `stockout_only: true`.
4. **Server Operations**: The server queries the mock databases, filters the records, limits the response to the top 100 rows to save token bandwidth, and returns the lists to Gemini.
5. **Synthesis**: Gemini correlates the lists. It observes that in March, Week 10 had a Price Cut on product `BEV-001` in the North region, and the inventory table shows that 8 stores in the North had closing stock of 0 for `BEV-001` during that same week.
6. **Delivering the Answer**: Gemini streams the response:
   > "Based on our promotions and inventory records for March 2024, stockouts occurred primarily in the **North** region during Price Cut campaigns..."
   It formats the store counts and SKU codes in a bulleted list, giving the user a clean, actionable answer.
