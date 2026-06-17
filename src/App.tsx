import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import ProductExplorer from './components/ProductExplorer';
import PromoSimulator from './components/PromoSimulator';
import { Product, Store, Conversation, DashboardSummary } from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'chat' | 'products' | 'simulator'>('dashboard');
  
  // Database States
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  
  // Loading & Error States
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);
  const [metadataError, setMetadataError] = useState<string | null>(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  
  // Streaming AI States
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [streamingTools, setStreamingTools] = useState<string | null>(null);

  // Initialize and load essential data on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoadingMetadata(true);
    setMetadataError(null);
    try {
      const [productsRes, storesRes, summaryRes, convsRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/stores'),
        fetch('/api/dashboard/summary'),
        fetch('/api/conversations')
      ]);

      if (!productsRes.ok || !storesRes.ok || !summaryRes.ok || !convsRes.ok) {
        throw new Error('Failure fetching FMCG database metrics from Express server');
      }

      const productsData = await productsRes.json();
      const storesData = await storesRes.json();
      const summaryData = await summaryRes.json();
      const convsData = await convsRes.json();

      setProducts(productsData);
      setStores(storesData);
      setDashboardSummary(summaryData);
      setConversations(convsData);
      
      if (convsData.length > 0) {
        setActiveConversationId(convsData[0].id);
      }
    } catch (err: any) {
      console.error('Initialization error:', err);
      setMetadataError(err.message || 'An unexpected error occurred during database loading.');
    } finally {
      setIsLoadingMetadata(false);
    }
  };

  // Create a new conversation channel
  const handleCreateConversation = async (title?: string) => {
    setIsCreatingChat(true);
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title || 'New Chat' })
      });
      if (!res.ok) throw new Error('Unabled to create past session on server');
      const newConv = await res.json();
      
      setConversations(prev => [newConv, ...prev]);
      setActiveConversationId(newConv.id);
      setCurrentTab('chat');
    } catch (err: any) {
      console.error('Create conversation failed:', err);
    } finally {
      setIsCreatingChat(false);
    }
  };

  // Delete an existing conversation
  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this conversation thread? This action is irreversible.')) {
      return;
    }
    
    try {
      const res = await fetch(`/api/conversations/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete chat row');
      
      setConversations(prev => prev.filter(c => c.id !== id));
      if (activeConversationId === id) {
        const remaining = conversations.filter(c => c.id !== id);
        if (remaining.length > 0) {
          setActiveConversationId(remaining[0].id);
        } else {
          setActiveConversationId(null);
        }
      }
    } catch (err: any) {
      console.error('Delete conversation failed:', err);
    }
  };

  // Submit and stream a message using standard Fetch + SSE
  const handleSendMessage = async (text: string) => {
    let targetConvId = activeConversationId;
    
    // Auto-create conversation if none is active
    if (!targetConvId) {
      setIsCreatingChat(true);
      try {
        const res = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: 'New Chat' })
        });
        if (!res.ok) throw new Error('Failed to start chat session');
        const newConv = await res.json();
        setConversations(prev => [newConv, ...prev]);
        setActiveConversationId(newConv.id);
        targetConvId = newConv.id;
      } catch (err: any) {
        console.error('Auto create failed:', err);
        setIsCreatingChat(false);
        return;
      } finally {
        setIsCreatingChat(false);
      }
    }

    // Set streaming parameters
    setIsStreaming(true);
    setStreamingText('');
    setStreamingTools(null);

    // Update optimistic local user state instantly before stream output lands
    setConversations(prev => prev.map(c => {
      if (c.id === targetConvId) {
        return {
          ...c,
          messages: [
            ...(c.messages || []),
            {
              id: `user-opt-${Date.now()}`,
              conversation_id: targetConvId!,
              role: 'user',
              content: text,
              created_at: new Date().toISOString()
            }
          ]
        };
      }
      return c;
    }));

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      const localKey = localStorage.getItem('gemini_api_key') || '';
      if (localKey.trim() !== '') {
        headers['X-Gemini-Key'] = localKey;
      }

      const response = await fetch(`/api/conversations/${targetConvId}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ content: text })
      });

      if (!response.ok) {
        throw new Error('Response returned a non-200 state representing server error.');
      }

      // Check if response stream reader is supported
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Server returned unreadable content stream');
      }

      const decoder = new TextDecoder();
      let streamDone = false;
      let accumulatedText = '';

      while (!streamDone) {
        const { value, done } = await reader.read();
        streamDone = done;
        if (value) {
          const chunkString = decoder.decode(value, { stream: !streamDone });
          const parts = chunkString.split('\n\n');
          
          for (const part of parts) {
            if (part.startsWith('data: ')) {
              try {
                const payload = JSON.parse(part.substring(6));
                if (payload.type === 'chunk') {
                  accumulatedText += payload.text;
                  setStreamingText(accumulatedText);
                } else if (payload.type === 'tool_call') {
                  setStreamingTools(payload.tools);
                } else if (payload.type === 'done') {
                  // Finalized AI response saved successfully
                  // Re-fetch all conversations from the server to refresh historical database models
                  const convsRes = await fetch('/api/conversations');
                  if (convsRes.ok) {
                    const latestConvs = await convsRes.json();
                    setConversations(latestConvs);
                  }
                  setIsStreaming(false);
                  setStreamingText('');
                  setStreamingTools(null);
                }
              } catch (parseError) {
                // Ignore incomplete split parses as chunks land
              }
            }
          }
        }
      }

    } catch (err: any) {
      console.error('Submit message streaming failed:', err);
      // Append error message to history
      setConversations(prev => prev.map(c => {
        if (c.id === targetConvId) {
          return {
            ...c,
            messages: [
              ...(c.messages || []),
              {
                id: `err-${Date.now()}`,
                conversation_id: targetConvId!,
                role: 'assistant',
                content: `**System Connection Failure**: _${err.message || 'Unable to establish streaming connection.'}_ 
Please make sure process.env.GEMINI_API_KEY is configured under settings secrets.`,
                created_at: new Date().toISOString()
              }
            ]
          };
        }
        return c;
      }));
      setIsStreaming(false);
      setStreamingText('');
      setStreamingTools(null);
    }
  };

  // Ask AI triggered by dashboard metrics or product catalog rows
  const handleAskAI = (prompt: string) => {
    setCurrentTab('chat');
    handleSendMessage(prompt);
  };

  // Ask AI triggered with product catalog context
  const handleAskProductAI = (product: Product) => {
    setCurrentTab('chat');
    handleSendMessage(`Analyze sales, promotions, and inventory health for product ${product.product_name} (${product.product_id}). Did it trigger any stockout warnings?`);
  };

  const handleAskAllProductsAI = () => {
    setCurrentTab('chat');
    handleSendMessage("Analyze the entire current product portfolio category-wise. Which beverage category performed best or struggled with stockout trends?");
  };

  const handleAskStoreAI = (store: Store) => {
    setCurrentTab('chat');
    handleSendMessage(`Provide a comprehensive business summary for store ${store.store_name} in city ${store.city} (${store.region} region). What is its average basket contribution and active stockout risk?`);
  };

  const handleAskAllStoresAI = () => {
    setCurrentTab('chat');
    handleSendMessage("Analyze performance across all 40 retail stores. Which regions and store formats are driving the highest revenue and stockout challenges?");
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId) || null;

  if (isLoadingMetadata && products.length === 0) {
    return (
      <div className="flex items-center justify-center bg-[#f8f7ff] w-screen h-screen" id="app-loading">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-800">FMCG AI Analytics Assistant</h3>
          <p className="text-xs text-slate-400 mt-1 font-medium">Bootstrapping synthetic beverage database & indexing sales records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#f1f2f6]" id="app-container">
      {/* Shared Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={setActiveConversationId}
        onCreateConversation={() => handleCreateConversation('New Chat')}
        onDeleteConversation={handleDeleteConversation}
        isCreatingChat={isCreatingChat}
      />

      {/* Main Context Stage */}
      {currentTab === 'dashboard' && (
        <Dashboard
          summary={dashboardSummary}
          isLoading={isLoadingMetadata}
          error={metadataError}
          onRefresh={loadInitialData}
          onAskAI={handleAskAI}
        />
      )}

      {currentTab === 'chat' && (
        <ChatInterface
          conversation={activeConversation}
          onSendMessage={handleSendMessage}
          isStreaming={isStreaming}
          streamingText={streamingText}
          streamingTools={streamingTools}
          onDeleteConversation={handleDeleteConversation}
          onAskAI={handleAskAI}
        />
      )}

      {currentTab === 'products' && (
        <ProductExplorer
          products={products}
          stores={stores}
          onAskProductAI={handleAskProductAI}
          onAskAllProductsAI={handleAskAllProductsAI}
          onAskStoreAI={handleAskStoreAI}
          onAskAllStoresAI={handleAskAllStoresAI}
        />
      )}

      {currentTab === 'simulator' && (
        <PromoSimulator
          onAskAI={(prompt) => {
            setCurrentTab('chat');
            handleSendMessage(prompt);
          }}
        />
      )}
    </div>
  );
}
