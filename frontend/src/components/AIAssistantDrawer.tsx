import React, { useState, useEffect } from 'react';
import { X, Bot, Send, Sparkles, Key, Check } from 'lucide-react';
import { assistantService } from '../services/api';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bidId: string;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  bidId,
}) => {
  if (!isOpen) return null;

  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string; sources?: any[] }>>([
    {
      sender: 'assistant',
      text: 'Hello! I am your Procurement Compliance AI Copilot powered by OpenAI ChatGPT & Hybrid RAG. You can ask me about non-compliant vendors, missing documents, cross-document contradictions, or side-by-side vendor comparisons grounded strictly in submitted tender evidence.',
    },
  ]);
  const [loading, setLoading] = useState(false);

  // OpenAI Integration State
  const [aiStatus, setAiStatus] = useState<any | null>(null);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [inputKey, setInputKey] = useState('');
  const [keySuccess, setKeySuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchAiStatus();
  }, []);

  const fetchAiStatus = async () => {
    try {
      const status = await assistantService.getAiStatus();
      setAiStatus(status);
    } catch (err) {
      console.error('Failed to fetch AI status:', err);
    }
  };

  const handleSaveKey = async () => {
    try {
      const res = await assistantService.configureApiKey(inputKey);
      setKeySuccess(res.message);
      fetchAiStatus();
      setTimeout(() => {
        setShowKeyModal(false);
        setKeySuccess(null);
      }, 1500);
    } catch (err: any) {
      console.error('Failed to save API key:', err);
    }
  };

  const quickPrompts = [
    'Why is Vendor B non-compliant?',
    'Which documents are missing?',
    'Show all technical failures.',
    'Which requirements require human review?',
  ];

  const handleSend = async (textToSend?: string) => {
    const queryText = textToSend || question;
    if (!queryText.trim() || loading) return;

    const userMsg = { sender: 'user' as const, text: queryText };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setQuestion('');
    setLoading(true);

    try {
      const res = await assistantService.queryAssistant({
        bid_id: bidId,
        question: queryText,
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: res.answer,
          sources: res.sources,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Sorry, I encountered an error querying the RAG evidence database. Please ensure the backend is active.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white border-l border-slate-200 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      
      {/* Header Bar */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
              <span>Procurement AI Copilot</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            </h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-[9px] font-extrabold font-mono px-2 py-0.5 rounded-md border ${
                aiStatus?.openai_configured
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                {aiStatus?.active_provider || 'Hybrid RAG Engine'} ({aiStatus?.active_model || 'gpt-4o-mini'})
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowKeyModal(true)}
            title="Configure OpenAI Key"
            className="p-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold flex items-center gap-1 transition-colors"
          >
            <Key className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden sm:inline">OpenAI Key</span>
          </button>

          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* OpenAI Key Configuration Modal */}
      {showKeyModal && (
        <div className="p-4 bg-indigo-50 border-b border-indigo-200 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-indigo-900 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-indigo-600" />
              Integrate OpenAI ChatGPT API Key
            </span>
            <button onClick={() => setShowKeyModal(false)} className="text-indigo-400 hover:text-indigo-700">
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-indigo-700 font-semibold leading-relaxed">
            Paste your OpenAI secret API key (<code className="font-mono text-xs">sk-...</code>) to connect directly to ChatGPT models for live RAG copilot responses.
          </p>

          <div className="flex items-center gap-2">
            <input
              type="password"
              placeholder="sk-..."
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl bg-white border border-indigo-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-indigo-600"
            />
            <button
              onClick={handleSaveKey}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition-colors shrink-0"
            >
              Connect Key
            </button>
          </div>

          {keySuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{keySuccess}</span>
            </div>
          )}
        </div>
      )}

      {/* Quick Prompts Bar */}
      <div className="p-3 bg-slate-100/60 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[10px]">
        {quickPrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(p)}
            className="px-2.5 py-1 rounded-full bg-white hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 text-slate-700 font-medium whitespace-nowrap transition-colors shadow-xs"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs font-medium">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col space-y-1 ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-xs'
                  : 'bg-slate-100 text-slate-900 border border-slate-200 rounded-bl-xs'
              }`}
            >
              {msg.text}
            </div>

            {msg.sources && msg.sources.length > 0 && (
              <div className="space-y-1 mt-1 max-w-[85%]">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                  Grounding Sources ({msg.sources.length}):
                </span>
                <div className="space-y-1">
                  {msg.sources.map((s: any, sIdx: number) => (
                    <div
                      key={sIdx}
                      className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[10px] flex items-center justify-between"
                    >
                      <span className="font-extrabold text-slate-800">{s.vendor} ({s.requirement})</span>
                      <span className="font-mono text-indigo-600 font-bold">{s.doc} p.{s.page}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-indigo-600 font-bold p-2 bg-indigo-50 rounded-xl w-fit border border-indigo-200">
            <Sparkles className="w-4 h-4 animate-spin text-indigo-600" />
            <span>Querying ChatGPT & RAG Vector Evidence...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-3 bg-slate-50 border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask about compliance rules, vendor failures..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-indigo-600"
          />
          <button
            type="submit"
            disabled={!question.trim() || loading}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
};
