/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  BookOpen,
  Sparkles,
  FileText,
  Database,
  Bot,
  BarChart3,
  Building,
  User,
  LogOut,
  Repeat
} from 'lucide-react';

export const Navbar = ({
  activeTab,
  setActiveTab,
  pendingDocCount = 0,
  totalReceivables,
  user,
  onLogout
}) => {
  const tabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      subLabel: 'Overview',
      icon: <Building className="w-4 h-4" />
    },
    {
      id: 'bahi-khata',
      label: 'Bahi Khata & Ledgers',
      subLabel: 'Passbook & Recurring',
      icon: <BookOpen className="w-4 h-4" />
    },
    {
      id: 'tally-bridge',
      label: 'Tally Bridge',
      subLabel: 'Prime XML',
      icon: <Database className="w-4 h-4" />
    },
    {
      id: 'document-intel',
      label: 'Document OCR',
      subLabel: 'Invoice Intel',
      icon: <FileText className="w-4 h-4" />,
      badge: pendingDocCount > 0 ? `${pendingDocCount} New` : undefined
    },
    {
      id: 'rag-assistant',
      label: 'AI Assistant',
      subLabel: 'Gemini RAG',
      icon: <Bot className="w-4 h-4" />
    },
    {
      id: 'reports',
      label: 'GST Reports',
      subLabel: 'GSTR-1 & 3B',
      icon: <BarChart3 className="w-4 h-4" />
    }
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
      {/* Top Banner with SME identity & User Profile Pill */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white font-bold text-xl border border-amber-400/30 hover:scale-105 transition-transform"
            >
              ब
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-amber-200 via-orange-100 to-amber-400 bg-clip-text text-transparent">
                  Bahi Khata & Tally RAG
                </span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 hidden sm:inline-block">
                  SME Intelligence
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <strong className="text-slate-300">{user?.businessName}</strong> • GSTIN: {user?.gstin}
              </p>
            </div>
          </div>

          {/* Quick Metrics & User Account Pill */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-3 bg-slate-800/80 rounded-lg px-3.5 py-1.5 border border-slate-700/60">
              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">To Collect (Udhar)</div>
                <div className="text-sm font-bold text-emerald-400">{totalReceivables}</div>
              </div>
              <div className="h-6 w-px bg-slate-700"></div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-medium">Tally Sync</div>
                <div className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" /> XML Ready
                </div>
              </div>
            </div>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
                  activeTab === 'profile'
                    ? 'bg-amber-600/30 border-amber-500 text-white'
                    : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-200'
                }`}
                title="View Business Profile & Settings"
              >
                <div className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs">
                  {user?.name ? user.name.charAt(0) : 'B'}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-bold leading-tight truncate max-w-[110px]">{user?.name}</div>
                  <div className="text-[10px] text-slate-400 leading-tight">Profile</div>
                </div>
              </button>

              <button
                onClick={onLogout}
                className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950/80 text-slate-400 hover:text-rose-300 border border-slate-700 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-900/90 border-t border-slate-800/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-1 scrollbar-none" aria-label="Tabs">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {tab.icon}
                  <span className="font-semibold">{tab.label}</span>
                  <span className={`text-[10px] opacity-75 hidden md:inline ${isActive ? 'text-amber-100' : 'text-slate-400'}`}>
                    ({tab.subLabel})
                  </span>
                  {tab.badge && (
                    <span className="ml-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
