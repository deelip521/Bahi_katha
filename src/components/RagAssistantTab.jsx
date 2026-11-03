/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Share2,
  FileText,
  Database,
  ArrowRight,
  BookOpen,
  User,
  HelpCircle,
  CornerDownLeft
} from 'lucide-react';

export const RagAssistantTab = ({
  parties = [],
  ledgerEntries = [],
  documents = [],
  partyBalances = [],
  setActiveTab,
  onSelectParty,
  onOpenWhatsApp
}) => {
  const [messages, setMessages] = useState([
    {
      id: 'msg-init',
      sender: 'assistant',
      text: `नमस्ते! मैं आपका **बही खाता AI सलाहकार (SME Ledger Assistant)** हूँ।\n\nआप मुझसे अपनी दुकान के बही खाते, उधारी/जमा, टैली वाउचर, जीएसटी इनवॉइस, या किसी भी कच्ची पर्ची के बारे में हिंदी, हिंग्लिश या इंग्लिश में पूछ सकते हैं।`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations: [
        { type: 'PARTY', title: '6 Active Parties', detail: 'Total 6 Customer/Supplier khatas loaded', id: 'all' },
        { type: 'INVOICE', title: `${documents.length} Extracted Documents`, detail: 'GST Invoices & Mandi Parchi', id: 'all' }
      ]
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const suggestedQueries = [
    'Sharma General Store ka kul kitna hisab baki hai aur pichla payment kab hua?',
    'Kaun si parties ka udhar 10 din se zyada purana ho gaya hai?',
    'Basmati Rice ka wholesale rate alag alag bills mein kya mila?',
    'Laxmi Handloom Surat ko kitna payment dena baki hai?',
    'Is mahine ke sabhi bills ka GST ITC summary batao'
  ];

  const handleSend = async (queryText) => {
    const q = queryText || inputQuery;
    if (!q.trim() || isLoading) return;

    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/rag-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          ledgerContext: {
            parties,
            balances: partyBalances,
            recentEntries: ledgerEntries.slice(-10)
          },
          documentContext: documents.map((d) => ({
            id: d.id,
            title: d.title,
            docType: d.docType,
            invoiceNumber: d.invoiceNumber,
            date: d.date,
            partyName: d.partyName,
            grandTotal: d.grandTotal,
            notes: d.notes,
            items: d.items.map((i) => ({
              description: i.description,
              rate: i.rate,
              quantity: i.quantity,
              total: i.total
            }))
          }))
        })
      });

      const data = await res.json();
      if (data.success) {
        const assistantMsg = {
          id: `msg-resp-${Date.now()}`,
          sender: 'assistant',
          text: data.answer || 'मैं समझ नहीं सका। कृपया पुनः प्रयास करें।',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          citations: data.citations,
          suggestedActions: data.suggestedActions
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error(data.error);
      }
    } catch (e) {
      console.error(e);
      const errorMsg = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        text: `माफ़ कीजिए, AI सेवा से संपर्क नहीं हो सका। कृपया जांचें कि GEMINI_API_KEY सेट है या नहीं।`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (action) => {
    if (action.actionType === 'VIEW_PARTY') {
      if (onSelectParty) onSelectParty(action.payload);
      if (setActiveTab) setActiveTab('bahi-khata');
    } else if (action.actionType === 'WHATSAPP_REMINDER') {
      const party = parties.find((p) => p.id === action.payload) || parties[0];
      const bal = partyBalances.find((b) => b.partyId === party.id);
      if (bal && onOpenWhatsApp) onOpenWhatsApp(party, bal);
    } else if (action.actionType === 'VIEW_TALLY') {
      if (setActiveTab) setActiveTab('tally-bridge');
    } else if (action.actionType === 'VIEW_DOC') {
      if (setActiveTab) setActiveTab('document-intel');
    }
  };

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <span>बही खाता AI सलाहकार (SME RAG Intelligence)</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-normal">
              Gemini 3.8 Flash
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Ask any question about your ledgers, pending payments, invoice rates, or Tally vouchers in Hindi, English, or Hinglish.
          </p>
        </div>
      </div>

      {/* Suggested Questions Carousel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>सुझाए गए प्रश्न (Click to Ask):</span>
        </span>
        <div className="flex flex-wrap gap-2">
          {suggestedQueries.map((sq, i) => (
            <button
              key={i}
              onClick={() => handleSend(sq)}
              className="text-xs bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl border border-slate-700/60 transition-all text-left"
            >
              {sq}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[600px] overflow-hidden shadow-sm">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-white shrink-0 shadow-md">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-sm ${
                    isUser
                      ? 'bg-amber-600 text-white rounded-br-none'
                      : 'bg-slate-800 border border-slate-700/80 text-slate-100 rounded-bl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  {/* Citations */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-700/60 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase text-amber-300 tracking-wider block">
                        Citations & Sources:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.citations.map((c, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded bg-slate-900/80 text-slate-300 border border-slate-700"
                          >
                            <FileText className="w-3 h-3 text-amber-400" />
                            <strong>{c.title}</strong>: {c.detail}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested Actions */}
                  {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex flex-wrap gap-2">
                      {msg.suggestedActions.map((act, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleActionClick(act)}
                          className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-600/20 text-amber-300 hover:bg-amber-600 hover:text-white border border-amber-500/40 transition-all"
                        >
                          <span>{act.label}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="text-[10px] text-right mt-1 opacity-60">
                    {msg.timestamp}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-700 flex items-center justify-center text-slate-200 shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-white shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl rounded-bl-none text-xs text-amber-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                <span>बही खाता और इनवॉइस का विश्लेषण जारी है...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Query Input Box */}
        <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="बही खाते या इनवॉइस के बारे में पूछें (हिंदी या English)..."
              className="flex-1 bg-slate-800 text-white px-4 py-3 rounded-xl text-xs sm:text-sm border border-slate-700 focus:outline-none focus:border-amber-500 placeholder-slate-500"
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 text-white px-5 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5 shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">पूछें</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
