import React, { useState, useRef, useEffect } from 'react';
import { Send, ArrowRight, Loader2, Sparkles, Trash2, Database, Download } from 'lucide-react';
import { Conversation, Message } from '../types';

interface ChatInterfaceProps {
  conversation: Conversation | null;
  onSendMessage: (text: string) => void;
  isStreaming: boolean;
  streamingText: string;
  streamingTools: string | null;
  onDeleteConversation: (id: string, e: React.MouseEvent) => void;
  onAskAI: (prompt: string) => void;
}

const STARTER_QUESTIONS = [
  "Which promotions drove the highest revenue lift in Q1?",
  "Show me stockouts during Price Cut weeks in March",
  "How did the North region compare to South in total units?",
  "What is the average uplift of BOGO deals vs Price Cuts?"
];

// Helper to render markdown-like structures: bold, bullets, and grid tables
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  if (!content) return null;

  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];

  let inList = false;
  let listItems: React.ReactNode[] = [];
  let inTable = false;
  let tableHeaders: string[] = [];
  let tableRows: string[][] = [];

  // Simple formatter for inline bold (**text**)
  const formatText = (text: string) => {
    const parts = text.split(/\*\*([^*]+)\*\*/g);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-extrabold text-slate-900 bg-indigo-50/50 px-1 rounded">{part}</strong>;
      }
      return part;
    });
  };

  const flushList = (key: string | number) => {
    if (listItems.length > 0) {
      renderedElements.push(
        <ul key={`list-${key}`} className="list-disc pl-5 my-3.5 space-y-1.5 text-slate-700 leading-relaxed">
          {listItems}
        </ul>
      );
      listItems = [];
    }
  };

  const flushTable = (key: string | number) => {
    if (inTable && (tableHeaders.length > 0 || tableRows.length > 0)) {
      renderedElements.push(
        <div key={`table-wrapper-${key}`} className="my-4 overflow-x-auto border border-slate-100 rounded-xl shadow-sm bg-white">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {tableHeaders.map((header, idx) => (
                  <th key={`th-${idx}`} className="py-2.5 px-3.5 font-bold">
                    {header.trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {tableRows.map((row, rIdx) => (
                <tr key={`tr-${rIdx}`} className="hover:bg-slate-50/50">
                  {row.map((cell, cIdx) => (
                    <td key={`td-${cIdx}`} className="py-2.5 px-3.5">
                      {formatText(cell.trim())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableHeaders = [];
      tableRows = [];
      inTable = false;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Table Row detection (e.g., | Product | Revenue |)
    if (line.startsWith('|') && line.endsWith('|')) {
      flushList(i);
      
      const cells = line.split('|').map(s => s.trim()).filter((s, idx, arr) => idx > 0 && idx < arr.length - 1);
      
      // Check if it's separator line (e.g., |---|---|)
      const isSeparator = cells.every(c => c.startsWith(':') || c.startsWith('-') || c.endsWith('-'));
      
      if (isSeparator) {
        continue;
      }

      if (!inTable) {
        inTable = true;
        tableHeaders = cells;
      } else {
        tableRows.push(cells);
      }
      continue;
    } else if (inTable) {
      flushTable(i);
    }

    // Bullet List Item detection
    if (line.startsWith('* ') || line.startsWith('- ')) {
      inList = true;
      listItems.push(
        <li key={i} className="text-xs">
          {formatText(line.substring(2))}
        </li>
      );
      continue;
    } else {
      flushList(i);
    }

    // Header detection (e.g. ## Header or ### Header)
    if (line.startsWith('### ')) {
      renderedElements.push(
        <h4 key={i} className="text-xs font-bold text-slate-900 tracking-tight mt-4 mb-2">
          {formatText(line.substring(4))}
        </h4>
      );
    } else if (line.startsWith('## ')) {
      renderedElements.push(
        <h3 key={i} className="text-sm font-bold text-slate-950 tracking-tight mt-5 mb-2.5 border-b border-slate-50 pb-1">
          {formatText(line.substring(3))}
        </h3>
      );
    } else if (line.startsWith('# ')) {
      renderedElements.push(
        <h2 key={i} className="text-base font-black text-slate-950 tracking-tight mt-6 mb-3">
          {formatText(line.substring(2))}
        </h2>
      );
    } else if (line === '') {
      renderedElements.push(<div key={i} className="h-2" />);
    } else {
      renderedElements.push(
        <p key={i} className="text-xs text-slate-700 leading-relaxed font-medium align-middle">
          {formatText(line)}
        </p>
      );
    }
  }

  // Final flush checks
  flushList('final');
  flushTable('final');

  return <div className="space-y-2">{renderedElements}</div>;
};

export default function ChatInterface({
  conversation,
  onSendMessage,
  isStreaming,
  streamingText,
  streamingTools,
  onDeleteConversation,
  onAskAI
}: ChatInterfaceProps) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages, streamingText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleExport = () => {
    if (!conversation) return;
    const historyText = (conversation.messages || [])
      .map(m => `[${m.role.toUpperCase()} - ${m.created_at}]\n${m.content}\n${m.tool_used ? `Tools Used: ${m.tool_used}` : ''}\n`)
      .join('\n---\n\n');
    
    const blob = new Blob([historyText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FMCG-Insight-${conversation.title.replace(/\s+/g, '-')}.txt`;
    link.click();
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#f8f7ff] h-screen text-slate-500" id="chat-empty-panel">
        <Sparkles className="w-12 h-12 text-indigo-400 mb-4 animate-bounce" />
        <h3 className="text-base font-semibold text-slate-800">Start a new analytics insight chat</h3>
        <p className="text-xs text-slate-400 max-w-sm text-center mt-2 leading-relaxed">
          Select an existing conversation from the sidebar or click "New Chat" to query beverage store data.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#f8f7ff] h-screen overflow-hidden" id={`chat-panel-${conversation.id}`}>
      {/* Top Bar Header */}
      <header className="px-8 py-5 bg-white border-b border-slate-100 flex items-center justify-between shadow-sm shrink-0">
        <div className="min-w-0 pr-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-md shadow-indigo-500/20 shrink-0"></span>
            <h2 className="text-base font-bold text-slate-900 truncate tracking-tight">{conversation.title}</h2>
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            Conversation UUID: {conversation.id} · Created: {new Date(conversation.created_at).toLocaleTimeString()}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-100 transition-colors cursor-pointer"
            title="Export chat history as .txt"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
          
          <button
            onClick={(e) => onDeleteConversation(conversation.id, e)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100/70 border border-rose-100 transition-colors cursor-pointer"
            title="Delete chat thread"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </header>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
        {conversation.messages?.length === 0 && !isStreaming && (
          <div className="max-w-2xl mx-auto py-12 text-center" id="chat-welcome">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-5 shadow-inner">
              <Sparkles className="w-7 h-7 text-indigo-600" />
            </div>
            <h3 className="text-base font-xl font-black text-slate-900 tracking-tight">Ask FMCG Data Assistant</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed max-w-md mx-auto">
              You can query the beverage catalogue, stores, regional sales, promotions impact, or stockouts.
              I will automatically call parameterized database queries to compile real numbers.
            </p>
            
            {/* Suggested Shortcuts on empty conversation */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3.5 max-w-xl mx-auto">
              {STARTER_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => onAskAI(q)}
                  className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm text-left text-xs font-semibold text-slate-700 hover:border-indigo-400 hover:shadow hover:text-indigo-600 transition-all cursor-pointer leading-relaxed"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Render History Messages */}
        <div className="max-w-3xl mx-auto space-y-6">
          {conversation.messages?.map((msg) => {
            const isAI = msg.role === 'assistant';
            return (
              <div 
                key={msg.id} 
                className={`flex gap-4 ${isAI ? 'justify-start' : 'justify-end'}`}
                id={`chat-msg-${msg.id}`}
              >
                {isAI && (
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 font-bold text-xs shadow shadow-indigo-600/30">
                    AI
                  </div>
                )}
                
                <div className={`max-w-[82%] rounded-2xl p-4.5 ${
                  isAI 
                    ? 'bg-white border border-slate-100 shadow-sm text-slate-800' 
                    : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15'
                }`}>
                  {/* Tool used badge panel */}
                  {isAI && msg.tool_used && (
                    <div className="mb-3.5 flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg w-max border border-emerald-100 animate-pulse">
                      <Database className="w-3.5 h-3.5" />
                      <span>Used: {msg.tool_used}</span>
                    </div>
                  )}

                  <div className="text-xs">
                    {isAI ? (
                      <MarkdownRenderer content={msg.content} />
                    ) : (
                      <p className="whitespace-pre-wrap leading-relaxed font-semibold">{msg.content}</p>
                    )}
                  </div>

                  <span className={`block text-[9px] mt-2.5 text-right font-mono ${isAI ? 'text-slate-300' : 'text-indigo-300'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {!isAI && (
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 select-none">
                    U
                  </div>
                )}
              </div>
            );
          })}

          {/* Render Streaming Chunk response */}
          {isStreaming && (
            <div className="flex gap-4 justify-start" id="chat-msg-streaming">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 font-bold text-xs">
                AI
              </div>

              <div className="max-w-[82%] rounded-2xl p-4.5 bg-white border border-slate-100 shadow-sm text-slate-800">
                {/* Active Tool used pulse badge */}
                {streamingTools && (
                  <div className="mb-3.5 flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg w-max border border-emerald-100 animate-pulse">
                    <Database className="w-3.5 h-3.5 animate-spin" />
                    <span>Used: {streamingTools}</span>
                  </div>
                )}

                <div className="text-xs">
                  {streamingText ? (
                    <MarkdownRenderer content={streamingText} />
                  ) : (
                    <div className="flex items-center gap-2 text-slate-400 font-medium">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Fired database query tools...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested chips above input */}
      {conversation.messages && conversation.messages.length > 0 && (
        <div className="px-8 py-2 overflow-x-auto whitespace-nowrap scrollbar-none max-w-3xl mx-auto w-full shrink-0 flex gap-2" id="contextual-chips">
          {STARTER_QUESTIONS.slice(0, 3).map((q, idx) => (
            <button
              key={idx}
              onClick={() => onAskAI(q)}
              className="inline-block px-3.5 py-1.5 rounded-full border border-slate-200 bg-white hover:border-indigo-400 hover:text-indigo-600 text-[10px] font-bold text-slate-600 transition-colors shadow-sm cursor-pointer shrink-0"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input Form Box */}
      <footer className="p-6 bg-white border-t border-slate-100 shrink-0">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto" id="chat-input-form">
          <div className="relative flex items-center">
            <input
              type="text"
              id="chat-input-field"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isStreaming}
              placeholder={isStreaming ? "AI is processing metrics..." : "Ask about products, promotions uplifts, stockouts in March..."}
              className="w-full pl-5 pr-14 py-3.5 text-xs font-semibold bg-slate-50 border border-slate-250 border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-slate-800 disabled:opacity-75"
            />
            
            <button
              type="submit"
              id="chat-submit-btn"
              disabled={isStreaming || !inputText.trim()}
              className={`absolute right-2 px-3.5 py-2.5 rounded-xl text-white font-semibold flex items-center justify-center transition-colors shadow-md ${
                !inputText.trim() || isStreaming 
                  ? 'bg-slate-350 bg-slate-300 text-slate-100 shadow-none cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/15 cursor-pointer'
              }`}
            >
              {isStreaming ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
}
