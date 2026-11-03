/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Building,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Database,
  BookOpen
} from 'lucide-react';

export const LoginPage = ({ onLoginSuccess, defaultProfile }) => {
  const [email, setEmail] = useState(defaultProfile?.email || 'ramesh.gupta@bharattraders.in');
  const [password, setPassword] = useState('bahi-khata-2026');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess({
        ...defaultProfile,
        email
      });
    }, 400);
  };

  const handleQuickDemoLogin = (role) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (role === 'OWNER') {
        onLoginSuccess(defaultProfile);
      } else {
        onLoginSuccess({
          ...defaultProfile,
          name: 'Rajesh Singhal, CA',
          email: 'rajesh.ca.audit@gmail.com',
          role: 'Chartered Accountant / Tax Auditor'
        });
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-amber-500 selection:text-white">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Brand Icon */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-red-600 shadow-xl shadow-amber-500/20 text-white font-extrabold text-2xl border border-amber-400/40 mb-4">
          ब
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          Bahi Khata & Tally RAG
        </h1>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-400">
          SME Ledger Management, Recurring Subscriptions & Tally Prime Integration
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 sm:px-10 shadow-2xl rounded-2xl">
          {error && (
            <div className="mb-4 p-3 bg-rose-950/80 border border-rose-800 text-rose-200 text-xs rounded-xl">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Business Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="merchant@example.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 placeholder-slate-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 placeholder-slate-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 text-amber-600 focus:ring-0 bg-slate-800"
                />
                <span>Remember this device</span>
              </label>
              <button
                type="button"
                onClick={() => alert('Demo Credentials: Use any email and password or 1-Click Demo buttons below.')}
                className="text-amber-400 hover:text-amber-300 text-xs font-medium"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm shadow-lg shadow-amber-600/20 transition-all flex items-center justify-center gap-2"
            >
              <span>{isLoading ? 'Signing In...' : 'Sign In to Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Logins */}
          <div className="mt-6 pt-5 border-t border-slate-800">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
              Instant 1-Click Demo Login
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('OWNER')}
                className="p-2.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-left transition-all group"
              >
                <div className="text-xs font-bold text-white group-hover:text-amber-300 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-amber-400" />
                  <span>Store Owner</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                  Bharat Trading Co.
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('ACCOUNTANT')}
                className="p-2.5 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-left transition-all group"
              >
                <div className="text-xs font-bold text-white group-hover:text-emerald-300 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Accountant / CA</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                  Tally Auditor Mode
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Feature Badges */}
        <div className="mt-6 grid grid-cols-3 gap-2 text-center text-[11px] text-slate-400">
          <div className="flex flex-col items-center gap-1">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Digital Bahi Khata</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>TallyPrime XML Ready</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Recurring Auto-Post</span>
          </div>
        </div>
      </div>
    </div>
  );
};
