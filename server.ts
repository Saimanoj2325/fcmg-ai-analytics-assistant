import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type, FunctionDeclaration, GenerateContentResponse } from '@google/genai';

// Load environmental variables
dotenv.config();

import {
  PRODUCTS,
  STORES,
  CONVERSATIONS,
  SALES_PROMOTIONS,
  INVENTORY,
  createConversation,
  deleteConversation,
  addMessageToConversation,
  getDashboardSummary,
  query_sales_promotions,
  query_inventory,
  query_regional_summary,
  query_product_performance,
  query_promo_impact
} from './src/data/syntheticData.js';
import { generateDatasetReportPDF } from './src/utils/pdfGenerator.js';

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini Client config
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function generateContentWithFallback(ai: GoogleGenAI, params: any): Promise<GenerateContentResponse> {
  const modelsToTry = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-2.5-pro',
    'gemini-1.5-pro',
    'gemini-3.5-flash',
    'gemini-flash-latest',
    'gemini-3.1-flash-lite'
  ];
  let lastError: any = null;
  
  for (const model of modelsToTry) {
    try {
      console.log(`[Google SDK] Attempting generateContent with model: ${model}`);
      const response = await ai.models.generateContent({
        ...params,
        model
      });
      return response;
    } catch (err: any) {
      console.warn(`[Google SDK] Model ${model} failed with error:`, err.message || err);
      lastError = err;
    }
  }
  throw lastError;
}

async function generateContentStreamWithFallback(ai: GoogleGenAI, params: any): Promise<any> {
  const modelsToTry = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-2.5-pro',
    'gemini-1.5-pro',
    'gemini-3.5-flash',
    'gemini-flash-latest',
    'gemini-3.1-flash-lite'
  ];
  let lastError: any = null;
  
  for (const model of modelsToTry) {
    try {
      console.log(`[Google SDK] Attempting generateContentStream with model: ${model}`);
      const stream = await ai.models.generateContentStream({
        ...params,
        model
      });
      return stream;
    } catch (err: any) {
      console.warn(`[Google SDK] Model stream ${model} failed with error:`, err.message || err);
      lastError = err;
    }
  }
  throw lastError;
}

// REST APIs

// 1. Health Endpoint
app.get('/api/healthz', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// 2. Products Endpoint
app.get('/api/products', (req, res) => {
  const { category, brand } = req.query;
  let list = PRODUCTS;
  if (category) {
    list = list.filter(p => p.category.toLowerCase() === (category as string).toLowerCase());
  }
  if (brand) {
    list = list.filter(p => p.brand.toLowerCase() === (brand as string).toLowerCase());
  }
  res.json(list);
});

// 3. Stores Endpoint
app.get('/api/stores', (req, res) => {
  const { region } = req.query;
  let list = STORES;
  if (region) {
    list = list.filter(s => s.region.toLowerCase() === (region as string).toLowerCase());
  }
  res.json(list);
});

// CSV Download Helper and Endpoints
function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) return '';
  const headers = Object.keys(data[0]);
  const rows = data.map(row => 
    headers.map(header => {
      let cell = row[header];
      if (cell === null || cell === undefined) cell = '';
      cell = cell.toString().replace(/"/g, '""');
      if (cell.includes(',') || cell.includes('\n') || cell.includes('"')) {
        cell = `"${cell}"`;
      }
      return cell;
    }).join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

app.get('/api/download/csv/products', (req, res) => {
  const csv = convertToCSV(PRODUCTS);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=products.csv');
  res.send(csv);
});

app.get('/api/download/csv/stores', (req, res) => {
  const csv = convertToCSV(STORES);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=stores.csv');
  res.send(csv);
});

app.get('/api/download/csv/sales_promotions', (req, res) => {
  const csv = convertToCSV(SALES_PROMOTIONS);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=sales_promotions.csv');
  res.send(csv);
});

app.get('/api/download/csv/inventory', (req, res) => {
  const csv = convertToCSV(INVENTORY);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=inventory.csv');
  res.send(csv);
});

app.get('/api/download/pdf', (req, res) => {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=fmcg_dataset_generation_report.pdf');
  generateDatasetReportPDF(res);
});

// 4. Dashboard Summary Endpoint
app.get('/api/dashboard/summary', (req, res) => {
  try {
    const summary = getDashboardSummary();
    res.json(summary);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Conversations List
app.get('/api/conversations', (req, res) => {
  res.json(CONVERSATIONS);
});

// 6. Create Conversation
app.post('/api/conversations', (req, res) => {
  const { title } = req.body;
  const newConv = createConversation(title || 'New Chat');
  res.status(201).json(newConv);
});

// 7. Get Conversation
app.get('/api/conversations/:id', (req, res) => {
  const conv = CONVERSATIONS.find(c => c.id === req.params.id);
  if (!conv) {
    return res.status(404).json({ error: 'Conversation not found' });
  }
  res.json(conv);
});

// 8. Delete Conversation
app.delete('/api/conversations/:id', (req, res) => {
  const success = deleteConversation(req.params.id);
  if (success) {
    res.json({ message: 'Conversation deleted successfully' });
  } else {
    res.status(404).json({ error: 'Conversation not found' });
  }
});

// Gemini Tool Definitions
const querySalesPromotionsDeclaration: FunctionDeclaration = {
  name: 'query_sales_promotions',
  description: 'Analyze weekly sales volume, revenues, promotion flags & types for any product, format, region or dates. Always call this if asked for sales numbers, revenues, prices, or promotion types.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      region: { type: Type.STRING, enum: ['North', 'South', 'East', 'West'], description: 'Filter by geographical region (North, South, East, West).' },
      product_id: { type: Type.STRING, description: 'Filter by specific product code (e.g., BEV-001 through BEV-015).' },
      week_start: { type: Type.STRING, description: 'ISO date string (YYYY-MM-DD) for start of promotion interval.' },
      week_end: { type: Type.STRING, description: 'ISO date string (YYYY-MM-DD) for end of interval.' },
      promo_type: { type: Type.STRING, enum: ['Price Cut', 'BOGO', 'Display Feature', 'Bundle'], description: 'Type of promotion to filter.' }
    }
  }
};

const queryInventoryDeclaration: FunctionDeclaration = {
  name: 'query_inventory',
  description: 'Analyze stock levels, received inventory, units sold, remaining stock, or check for stockouts. Always call this when asked about stock counts, stockouts, remaining products, or delays.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      region: { type: Type.STRING, enum: ['North', 'South', 'East', 'West'], description: 'Region filter.' },
      product_id: { type: Type.STRING, description: 'Product ID (BEV-001 to BEV-015).' },
      week_start: { type: Type.STRING, description: 'ISO date (YYYY-MM-DD) to start search.' },
      week_end: { type: Type.STRING, description: 'ISO date (YYYY-MM-DD) to end search.' },
      stockout_only: { type: Type.BOOLEAN, description: 'Set to true to return only weeks where closing stock was 0 or warning flags was true.' }
    }
  }
};

const queryRegionalSummaryDeclaration: FunctionDeclaration = {
  name: 'query_regional_summary',
  description: 'Get an aggregate comparison across regions for total revenue, promotional vs non-promotional metrics. Always use this if comparing North, South, East, and West directly.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      week_start: { type: Type.STRING, description: 'ISO date YYYY-MM-DD.' },
      week_end: { type: Type.STRING, description: 'ISO date YYYY-MM-DD.' }
    }
  }
};

const queryProductPerformanceDeclaration: FunctionDeclaration = {
  name: 'query_product_performance',
  description: 'Retrieve top or bottom performing product SKUs ranked by revenue or units. Supports filtering by beverage category.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      category: { type: Type.STRING, enum: ['Carbonated', 'Juice', 'Water', 'Energy', 'Dairy'], description: 'The beverage category.' },
      top_n: { type: Type.INTEGER, description: 'Amount of SKUs to fetch. Defaults to 5.' },
      week_start: { type: Type.STRING, description: 'ISO start date YYYY-MM-DD.' },
      week_end: { type: Type.STRING, description: 'ISO end date YYYY-MM-DD.' },
      promo_flag: { type: Type.BOOLEAN, description: 'True to filter by promotional weeks, false for baseline.' }
    }
  }
};

const queryPromoImpactDeclaration: FunctionDeclaration = {
  name: 'query_promo_impact',
  description: 'Compare weekly averages between active promotion weeks versus standard baseline weeks. Generates the exact volume and revenue percentage uplift. Always use this when asked for uplift, lift, or promotional impact.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      product_id: { type: Type.STRING, description: 'Product ID e.g. BEV-001.' },
      promo_type: { type: Type.STRING, enum: ['Price Cut', 'BOGO', 'Display Feature', 'Bundle'], description: 'Promo format' },
      region: { type: Type.STRING, enum: ['North', 'South', 'East', 'West'], description: 'Region filter' }
    }
  }
};

// 9. Send Chat & Invoke AI with Streaming SSE
app.post('/api/conversations/:id/messages', async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  
  if (!content) {
    return res.status(400).json({ error: 'Message content is required' });
  }

  const conversation = CONVERSATIONS.find(c => c.id === id);
  if (!conversation) {
    return res.status(404).json({ error: 'Conversation not found' });
  }

  // 1. Create a User Message and persist it
  const userMsg = addMessageToConversation(id, 'user', content);

  // Set up SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Let client know user message was successfully recorded
  res.write(`data: ${JSON.stringify({ type: 'user_message', message: userMsg })}\n\n`);

  // Try to load Gemini Client
  const ai = getGeminiClient();
  if (!ai) {
    const errorText = `**Notice**: Gemini API Key is missing. Please configure your API key in the secrets panel of Google AI Studio. 

Until your API key is configured, you can browse preloaded records in the **Dashboard** and use **Product Explorer**, or browse pre-loaded demo chat screens!`;
    const assistantMsg = addMessageToConversation(id, 'assistant', errorText);
    res.write(`data: ${JSON.stringify({ type: 'chunk', text: errorText })}\n\n`);
    res.write(`data: ${JSON.stringify({ type: 'done', message: assistantMsg })}\n\n`);
    return res.end();
  }

  try {
    // 2. Gather conversation history to form Gemini prompt context
    // Limit to latest 10 messages for token hygiene
    const history = (conversation.messages || []).slice(0, -1); // exclude the newly added user message
    const geminiMessages: any[] = [];
    
    history.forEach(m => {
      geminiMessages.push({
        role: m.role,
        parts: [{ text: m.content }]
      });
    });
    
    // Append current user message
    geminiMessages.push({
      role: 'user',
      parts: [{ text: content }]
    });

    const systemInstruction = `You are an AI analytics assistant for the Beverages category at a Consumer Goods (FMCG) organisation. You help business users — Sales Leads, Category Managers, Promo Managers, and Supply Chain Analysts — answer questions about sales performance, promotional impact, inventory health, and regional trends.

Data details:
- Date starts on 2024-01-01 (Week 1) and ends on 2024-12-23 (Week 52) of 2024. All weeks are Monday dates.
- Major categories: Carbonated, Juice, Water, Energy, Dairy.
- Stores exist in regions: North, South, East, West.
- SKU identifiers range BEV-001 to BEV-015.

Rules:
1. ALWAYS call or check a tool first before answering analytical, statistical, or quantitative questions. Do not invent numbers.
2. When a question is ambiguous, make a reasonable assumption and state it.
3. Present numbers clearly: use £ for revenue, round to 1 decimal place. Always format cash amounts appropriately.
4. If asked something outside FMCG analytics (like general hobbies, jokes that are completely irrelevant, coding, or unrelated tasks), politely redirect.
5. Keep final responses concise, professional, yet insightful — typically 2-4 key paragraphs. Render markdown comparison tables beautifully.`;

    // 3. Initiate first turn to let Gemini decide if it needs to query standard tools
    const firstResponse = await generateContentWithFallback(ai, {
      model: 'gemini-3.5-flash',
      contents: geminiMessages,
      config: {
        systemInstruction,
        tools: [{
          functionDeclarations: [
            querySalesPromotionsDeclaration,
            queryInventoryDeclaration,
            queryRegionalSummaryDeclaration,
            queryProductPerformanceDeclaration,
            queryPromoImpactDeclaration
          ]
        }]
      }
    });

    const functionCalls = firstResponse.functionCalls;
    let toolUsedList: string[] = [];
    let toolResultsPayload = [];

    // 4. If Gemini calls structured data tools, execute them on our simulation database
    if (functionCalls && functionCalls.length > 0) {
      const functionResponses = [];
      for (const call of functionCalls) {
        toolUsedList.push(call.name);
        let output: any = null;
        try {
          // Parse and execute
          const args = call.args as any;
          if (call.name === 'query_sales_promotions') {
            output = query_sales_promotions(args);
          } else if (call.name === 'query_inventory') {
            output = query_inventory(args);
          } else if (call.name === 'query_regional_summary') {
            output = query_regional_summary(args);
          } else if (call.name === 'query_product_performance') {
            output = query_product_performance(args);
          } else if (call.name === 'query_promo_impact') {
            output = query_promo_impact(args);
          }
        } catch (dbErr: any) {
          output = { error: dbErr.message };
        }

        functionResponses.push({
          name: call.name,
          response: { output }
        });
      }

      // Notify the frontend right away that functions were triggered
      res.write(`data: ${JSON.stringify({ type: 'tool_call', tools: toolUsedList.join(', ') })}\n\n`);

      // Combine user input, model's tool calls, and the database response payload
      const subContent = firstResponse.candidates?.[0]?.content;
      const finalContents = [
        ...geminiMessages,
        subContent, // response with functionCalls
        {
          parts: functionResponses.map(fr => ({
            functionResponse: {
              name: fr.name,
              response: fr.response
            }
          }))
        }
      ];

      // 5. Query Gemini again to synthesize final formatted response and stream it!
      const finalStream = await generateContentStreamWithFallback(ai, {
        model: 'gemini-3.5-flash',
        contents: finalContents,
        config: {
          systemInstruction: 'Synthesise these structured data query results into a highly readable and professional business insight using bold formatting, clean bullet points, or markdown comparison tables. Mention what specific tools and data you analyzed in your reply brief.'
        }
      });

      let fullText = '';
      for await (const chunk of finalStream) {
        const textChunk = (chunk as GenerateContentResponse).text || '';
        fullText += textChunk;
        res.write(`data: ${JSON.stringify({ type: 'chunk', text: textChunk })}\n\n`);
      }

      // Record final response in memory
      const assistantMsg = addMessageToConversation(id, 'assistant', fullText, toolUsedList.join(', '));
      res.write(`data: ${JSON.stringify({ type: 'done', message: assistantMsg })}\n\n`);

    } else {
      // No tool call needed, stream the direct text reply back as a single burst or mini stream
      const directText = firstResponse.text || 'Understood. Let me know what data or analytics you would like to run.';
      res.write(`data: ${JSON.stringify({ type: 'chunk', text: directText })}\n\n`);
      const assistantMsg = addMessageToConversation(id, 'assistant', directText);
      res.write(`data: ${JSON.stringify({ type: 'done', message: assistantMsg })}\n\n`);
    }

  } catch (apiErr: any) {
    console.error('Gemini Stream Error:', apiErr);
    const errText = `\n\n**Error Processing Query**: _${apiErr.message || 'The AI assistant was unable to finalize your analysis.'}_`;
    res.write(`data: ${JSON.stringify({ type: 'chunk', text: errText })}\n\n`);
    res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`);
  } finally {
    res.end();
  }
});


// Serve Front-End
async function startServer() {
  // Vite integration
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // production mode
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FMCG AI Analytics Server booting on http://0.0.0.0:${PORT}`);
  });
}

startServer();
