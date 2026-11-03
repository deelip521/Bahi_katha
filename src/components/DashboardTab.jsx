/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  ArrowUpRight,
  ArrowDownLeft,
  Share2,
  FileText,
  Database,
  Bot,
  PlusCircle,
  Clock,
  ShieldAlert,
  Building2,
  CheckCircle2
} from 'lucide-react';
import { formatIndianCurrency } from '../utils/ledgerCalculations';

export const DashboardTab = ({
  parties = [],
  ledgerEntries = [],
  documents = [],
  partyBalances = [],
  onOpenAddEntry,
  onOpenWhatsApp,
  setActiveTab,
  onSelectDocument,
}) => {
  // Aggregate calculations
  const totalReceivable = partyBalances
    .filter((b) => b.netBalance > 0)
    .reduce((sum, b) => sum + b.netBalance, 0);

  const receivablePartiesCount = partyBalances.filter((b) => b.netBalance > 0).length;

  const totalPayable = partyBalances
    .filter((b) => b.netBalance < 0)
    .reduce((sum, b) => sum + Math.abs(b.netBalance), 0);

  const payablePartiesCount = partyBalances.filter((b) => b.netBalance < 0).length;

  const netBalance = totalReceivable - totalPayable;

  // Overdue parties (> 15 days or high balance)
  const overdueParties = partyBalances
    .filter((b) => b.netBalance > 5000 && (b.daysSinceLastTx || 0) >= 10)
    .slice(0, 3);

  // Recent transactions sorted by date desc
  const recentEntries = [...ledgerEntries]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions */}
      <div className="bg-gradient-to-r from-amber-900/40 via-slate-900 to-slate-900 border border-amber-600/30 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-6 -mr-6 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Bahi Khata + Tally Prime RAG</span>
            </div>
            <h1 className="text-2xl font-bold text-white mt-1">
              Comprehensive SME Business & Ledger Overview
            </h1>
            <p className="text-sm text-slate-300 mt-0.5">
              Daily Roznamcha, Recurring Subscriptions, GST E-Invoices, and Instant Tally XML Export.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onOpenAddEntry && onOpenAddEntry()}
              className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white px-4 py-2.5 rounded-xl font-medium text-sm shadow-md transition-all shadow-amber-600/20 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Transaction</span>
            </button>
            <button
              onClick={() => setActiveTab && setActiveTab('document-intel')}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Scan Document</span>
            </button>
            <button
              onClick={() => setActiveTab && setActiveTab('tally-bridge')}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all"
            >
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Tally Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Financial Health Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Receivables Card */}
        <div className="bg-slate-900 border border-emerald-900/40 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-emerald-600/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" /> कुल लेना है (Receivables)
            </span>
            <span className="text-[11px] bg-emerald-950 text-emerald-300 font-medium px-2 py-0.5 rounded-full border border-emerald-800">
              {receivablePartiesCount} Parties
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              {formatIndianCurrency(totalReceivable)}
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <span>बाज़ार में फंसा उधारी (Market Udhar)</span>
            </p>
          </div>
        </div>

        {/* Payables Card */}
        <div className="bg-slate-900 border border-rose-900/40 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-rose-600/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4" /> कुल देना है (Payables)
            </span>
            <span className="text-[11px] bg-rose-950 text-rose-300 font-medium px-2 py-0.5 rounded-full border border-rose-800">
              {payablePartiesCount} Suppliers
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              {formatIndianCurrency(totalPayable)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              सप्लायर को देय राशि (Due to Distributors)
            </p>
          </div>
        </div>

        {/* Net Business Balance */}
        <div className="bg-slate-900 border border-amber-900/40 rounded-2xl p-5 shadow-sm relative overflow-hidden group hover:border-amber-600/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-4 h-4" /> शुद्ध व्यापार संतुलन (Net Balance)
            </span>
            <span className="text-[11px] bg-amber-950 text-amber-300 font-medium px-2 py-0.5 rounded-full border border-amber-800">
              Net Position
            </span>
          </div>
          <div className="mt-3">
            <div className={`text-2xl sm:text-3xl font-extrabold ${netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatIndianCurrency(netBalance)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {netBalance >= 0 ? 'सकारात्मक रोकड़ प्रवाह (Positive)' : 'सप्लायर देयता अधिक है'}
            </p>
          </div>
        </div>

        {/* AI & Documents Processed Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
              <Bot className="w-4 h-4" /> दस्तावेज़ AI (Doc Intelligence)
            </span>
            <span className="text-[11px] bg-blue-950 text-blue-300 font-medium px-2 py-0.5 rounded-full border border-blue-800">
              {documents.length} Records
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-white">
              {documents.length} Invoices
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>100% OCR & GST Extraction Ready</span>
            </p>
          </div>
        </div>
      </div>

      {/* Overdue Payment Alert Banner */}
      {overdueParties.length > 0 && (
        <div className="bg-amber-950/40 border border-amber-800/60 rounded-2xl p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-900/60 rounded-lg text-amber-400 border border-amber-700/50">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-amber-200">
                  उधारी तकादा अलर्ट (High-Priority Payment Follow-ups)
                </h2>
                <p className="text-xs text-amber-400/80">
                  Following parties have pending balances over 10+ days. Send quick WhatsApp reminder with UPI link.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab && setActiveTab('bahi-khata')}
              className="text-xs text-amber-300 hover:text-white font-medium underline underline-offset-2 self-start sm:self-auto"
            >
              सभी खाते देखें (View All) &rarr;
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {overdueParties.map((bal) => {
              const party = parties.find((p) => p.id === bal.partyId);
              if (!party) return null;
              return (
                <div
                  key={bal.partyId}
                  className="bg-slate-900/90 border border-amber-700/40 rounded-xl p-3.5 flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-sm text-white">{bal.partyName}</div>
                    <div className="text-xs text-emerald-400 font-bold mt-0.5">
                      {formatIndianCurrency(bal.netBalance)} बाकी
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{bal.daysSinceLastTx} दिन पहले लेन-देन</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onOpenWhatsApp && onOpenWhatsApp(party, bal)}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all"
                    title="Send WhatsApp payment reminder"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Split Section: Roznamcha (Cashbook) & Extracted Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Roznamcha / Daily Transactions Table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>रोज़नामचा (Daily Cashbook & Daybook)</span>
              </h2>
              <p className="text-xs text-slate-400">Latest credit & payment entries across all customer/supplier khatas</p>
            </div>
            <button
              onClick={() => setActiveTab && setActiveTab('bahi-khata')}
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
            >
              पूरा खाता बही &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-300 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-lg">दिनांक (Date)</th>
                  <th className="py-2.5 px-3">पार्टी नाम (Party)</th>
                  <th className="py-2.5 px-3">प्रकार (Type)</th>
                  <th className="py-2.5 px-3">विवरण (Description)</th>
                  <th className="py-2.5 px-3">भुगतान साधन (Mode)</th>
                  <th className="py-2.5 px-3 text-right rounded-r-lg">रकम (Amount)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-200">
                {recentEntries.map((entry) => {
                  const isUdhar = entry.type === 'UDHAR';
                  return (
                    <tr key={entry.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 text-slate-400 whitespace-nowrap">{entry.date}</td>
                      <td className="py-3 px-3 font-medium text-white">{entry.partyName}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold ${
                            isUdhar
                              ? 'bg-rose-950 text-rose-300 border border-rose-800/60'
                              : 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                          }`}
                        >
                          {isUdhar ? (
                            <>
                              <ArrowDownLeft className="w-3 h-3 text-rose-400" />
                              <span>उधार (Udhar)</span>
                            </>
                          ) : (
                            <>
                              <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                              <span>जमा (Jama)</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-300 max-w-xs truncate">{entry.description}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-semibold">
                          {entry.paymentMode}
                        </span>
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-bold text-sm whitespace-nowrap ${
                          isUdhar ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {isUdhar ? '-' : '+'}
                        {formatIndianCurrency(entry.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Document Ingestion & Tally Feed */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <span>हालिया दस्तावेज़ (Recent Invoices)</span>
              </h2>
              <button
                onClick={() => setActiveTab && setActiveTab('document-intel')}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
              >
                स्कैन करें &rarr;
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              AI extracted invoices & raw slips ready to push to Bahi Khata or Tally.
            </p>

            <div className="space-y-3">
              {documents.slice(0, 3).map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => {
                    onSelectDocument && onSelectDocument(doc.id);
                    setActiveTab && setActiveTab('document-intel');
                  }}
                  className="p-3 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-xl cursor-pointer transition-all group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                        {doc.docType.replace(/_/g, ' ')}
                      </span>
                      <h4 className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors">
                        {doc.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {doc.partyName} • {doc.date}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-white">
                        {formatIndianCurrency(doc.grandTotal)}
                      </div>
                      <span className="inline-block mt-1 text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {Math.round(doc.confidenceScore * 100)}% Match
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 p-3.5 bg-gradient-to-r from-amber-950/40 to-slate-900 border border-amber-800/40 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Bot className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-xs font-bold text-white">Ask Bahi Khata AI</div>
                <div className="text-[11px] text-slate-400">Query ledgers in Hindi/Hinglish</div>
              </div>
            </div>
            <button
              onClick={() => setActiveTab && setActiveTab('rag-assistant')}
              className="bg-amber-600 hover:bg-amber-500 text-white text-xs px-3 py-1.5 rounded-lg font-semibold shadow-sm transition-all"
            >
              Start Chat &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
