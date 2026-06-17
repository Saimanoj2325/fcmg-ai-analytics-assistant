import React from 'react';
import { LayoutDashboard, MessageSquare, ShoppingBag, Plus, Trash2, Sparkles, Loader2, Sliders } from 'lucide-react';
import { Conversation } from '../types';

interface SidebarProps {
  currentTab: 'dashboard' | 'chat' | 'products' | 'simulator';
  setCurrentTab: (tab: 'dashboard' | 'chat' | 'products' | 'simulator') => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onCreateConversation: () => void;
  onDeleteConversation: (id: string, e: React.MouseEvent) => void;
  isCreatingChat: boolean;
}

export default function Sidebar({
  currentTab,
  setCurrentTab,
  conversations,
  activeConversationId,
  onSelectConversation,
  onCreateConversation,
  onDeleteConversation,
  isCreatingChat
}: SidebarProps) {
  return (
    <aside 
      className="w-68 bg-[#1e1b4b] text-slate-100 flex flex-col h-screen shrink-0 border-r border-[#2d2870] select-none"
      id="app-sidebar"
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-[#2d2870] flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/35">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-semibold text-sm leading-tight tracking-wide">FMCG Assistant</h1>
          <span className="text-xs text-indigo-300 font-medium">Beverages · Data & AI</span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="p-4 space-y-1.5">
        <button
          id="nav-tab-dashboard"
          onClick={() => setCurrentTab('dashboard')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'dashboard'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15'
              : 'text-indigo-200 hover:bg-white/5 hover:text-white'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 shrink-0" />
          Dashboard
        </button>

        <button
          id="nav-tab-chat"
          onClick={() => {
            setCurrentTab('chat');
            if (conversations.length > 0 && !activeConversationId) {
              onSelectConversation(conversations[0].id);
            } else if (conversations.length === 0) {
              onCreateConversation();
            }
          }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'chat'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15'
              : 'text-indigo-200 hover:bg-white/5 hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4 shrink-0" />
          AI Chat
        </button>

        <button
          id="nav-tab-products"
          onClick={() => setCurrentTab('products')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'products'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15'
              : 'text-indigo-200 hover:bg-white/5 hover:text-white'
          }`}
        >
          <ShoppingBag className="w-4 h-4 shrink-0" />
          Master Directories
        </button>

        <button
          id="nav-tab-simulator"
          onClick={() => setCurrentTab('simulator')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
            currentTab === 'simulator'
              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15'
              : 'text-indigo-200 hover:bg-white/5 hover:text-white'
          }`}
        >
          <Sliders className="w-4 h-4 shrink-0" />
          Promo Simulator
        </button>
      </div>

      {/* Chat History Section */}
      <div className="flex-1 flex flex-col min-h-0 pt-2 border-t border-[#292461]">
        <div className="px-5 py-2 flex items-center justify-between text-[11px] font-semibold text-indigo-300 uppercase tracking-wider">
          <span>Recent Chats</span>
          <button
            id="btn-new-chat-sidebar"
            onClick={onCreateConversation}
            disabled={isCreatingChat}
            className="p-1 rounded-md hover:bg-indigo-400/20 text-indigo-300 hover:text-white transition-colors disabled:opacity-50 cursor-pointer"
            title="Start New Chat"
          >
            {isCreatingChat ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Scrollable Conversation List */}
        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1.5 scrollbar-thin scrollbar-thumb-indigo-950">
          {conversations.length === 0 ? (
            <div className="text-center py-8 px-4">
              <p className="text-xs text-indigo-300/60 leading-relaxed italic">No past conversations</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const isActive = activeConversationId === conv.id;
              return (
                <div
                  key={conv.id}
                  id={`chat-item-${conv.id}`}
                  onClick={() => {
                    onSelectConversation(conv.id);
                    setCurrentTab('chat');
                  }}
                  className={`group relative flex items-center justify-between w-full px-3 py-2.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                    isActive 
                      ? 'bg-indigo-505 bg-indigo-500/15 text-white border-l-2 border-indigo-500'
                      : 'text-indigo-200 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-6">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-indigo-400' : 'text-indigo-300/75'}`} />
                    <span className="truncate text-left leading-snug">{conv.title}</span>
                  </div>

                  <button
                    id={`btn-delete-chat-${conv.id}`}
                    onClick={(e) => onDeleteConversation(conv.id, e)}
                    className="absolute right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-red-500/20 text-indigo-300 hover:text-red-400 transition-all duration-150 shrink-0 cursor-pointer"
                    title="Delete Conversation"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Workspace Context Footer */}
      <div className="p-4 border-t border-[#2d2870] bg-[#16143b] text-[10px] text-indigo-300/85 space-y-1">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
          <span>Workspace Environment Connected</span>
        </div>
        <p className="text-[9px] text-indigo-400 font-mono">AIS: Live API Sandbox</p>
      </div>
    </aside>
  );
}
