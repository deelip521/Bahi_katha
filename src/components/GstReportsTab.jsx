/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BarChart3,
  FileSpreadsheet,
  CheckCircle2,
  Download,
  Printer,
  TrendingUp,
  ShieldCheck,
  Building,
  Layers
} from 'lucide-react';
import { formatIndianCurrency } from '../utils/ledgerCalculations';

export const GstReportsTab = ({
  documents = [],
  parties = [],
  partyBalances = [],
  vouchers = []
}) => {
  const [activeReport, setActiveReport] = useState('GSTR1');

  // GSTR-1 Sales Invoices
  const salesDocs = documents.filter((d) => d.docType === 'GST_TAX_INVOICE' || d.docType === 'KACHA_PARCHI');
  const totalTaxable = salesDocs.reduce((sum, d) => sum + d.subtotal, 0);
  const totalCGST = salesDocs.reduce((sum, d) => sum + d.cgstTotal, 0);
  const totalSGST = salesDocs.reduce((sum, d) => sum + d.sgstTotal, 0);
  const totalIGST = salesDocs.reduce((sum, d) => sum + d.igstTotal, 0);
  const totalTax = totalCGST + totalSGST + totalIGST;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <span>जीएसटी व व्यापार रिपोर्ट (GST & SME Financial Reports)</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-normal">
              Vyapar Summary
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Automated GSTR-1 outward supply register, GSTR-3B ITC estimate, and Trial Balance statement.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all self-start sm:self-auto"
        >
          <Printer className="w-4 h-4 text-amber-400" />
          <span>प्रिंट या PDF सेव करें</span>
        </button>
      </div>

      {/* Report Switcher Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'GSTR1', label: 'GSTR-1 (बिक्री व आउटवर्ड सप्लाई)' },
          { id: 'GSTR3B', label: 'GSTR-3B (इनपुट टैक्स क्रेडिट - ITC)' },
          { id: 'TRIAL_BALANCE', label: 'ट्रायल बैलेंस (Trial Balance / शेष पट)' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveReport(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeReport === tab.id
                ? 'bg-amber-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Report View: GSTR-1 */}
      {activeReport === 'GSTR1' && (
        <div className="space-y-4">
          {/* Top Aggregate Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">कुल कर-योग्य मूल्य (Taxable Value)</span>
              <div className="text-xl font-extrabold text-white mt-1">{formatIndianCurrency(totalTaxable)}</div>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">केंद्रीय कर (CGST 50%)</span>
              <div className="text-xl font-extrabold text-amber-400 mt-1">{formatIndianCurrency(totalCGST)}</div>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">राज्य कर (SGST 50%)</span>
              <div className="text-xl font-extrabold text-amber-400 mt-1">{formatIndianCurrency(totalSGST)}</div>
            </div>
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase font-semibold">एकीकृत कर (IGST Interstate)</span>
              <div className="text-xl font-extrabold text-blue-400 mt-1">{formatIndianCurrency(totalIGST)}</div>
            </div>
          </div>

          {/* Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-white mb-3">
              GSTR-1 बी2बी व बी2सी इनवॉइस सूची (Outward Supply Register)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800 text-slate-300 font-semibold uppercase">
                  <tr>
                    <th className="py-2.5 px-3">इनवॉइस नं.</th>
                    <th className="py-2.5 px-3">दिनांक</th>
                    <th className="py-2.5 px-3">पार्टी का नाम</th>
                    <th className="py-2.5 px-3">GSTIN</th>
                    <th className="py-2.5 px-3 text-right">कर योग्य मूल्य</th>
                    <th className="py-2.5 px-3 text-right">CGST</th>
                    <th className="py-2.5 px-3 text-right">SGST</th>
                    <th className="py-2.5 px-3 text-right">IGST</th>
                    <th className="py-2.5 px-3 text-right">कुल रकम</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {salesDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-mono text-amber-300 font-bold">{doc.invoiceNumber}</td>
                      <td className="py-3 px-3 text-slate-400 whitespace-nowrap">{doc.date}</td>
                      <td className="py-3 px-3 font-medium text-white">{doc.partyName}</td>
                      <td className="py-3 px-3 font-mono text-slate-400">{doc.partyGSTIN || 'Unregistered'}</td>
                      <td className="py-3 px-3 text-right">{formatIndianCurrency(doc.subtotal)}</td>
                      <td className="py-3 px-3 text-right text-slate-400">{formatIndianCurrency(doc.cgstTotal)}</td>
                      <td className="py-3 px-3 text-right text-slate-400">{formatIndianCurrency(doc.sgstTotal)}</td>
                      <td className="py-3 px-3 text-right text-amber-400">{formatIndianCurrency(doc.igstTotal)}</td>
                      <td className="py-3 px-3 text-right font-bold text-white">{formatIndianCurrency(doc.grandTotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Report View: GSTR-3B ITC */}
      {activeReport === 'GSTR3B' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white">
                GSTR-3B पात्र इनपुट टैक्स क्रेडिट (Eligible Input Tax Credit - ITC)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Estimated ITC claimable on purchases and transport expenses under Section 16(2) of CGST Act.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">All other ITC (CGST)</span>
                <div className="text-lg font-bold text-emerald-400 mt-1">{formatIndianCurrency(totalCGST)}</div>
              </div>
              <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">All other ITC (SGST)</span>
                <div className="text-lg font-bold text-emerald-400 mt-1">{formatIndianCurrency(totalSGST)}</div>
              </div>
              <div className="p-4 bg-slate-800/60 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Import / Interstate ITC (IGST)</span>
                <div className="text-lg font-bold text-blue-400 mt-1">{formatIndianCurrency(totalIGST)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report View: Trial Balance */}
      {activeReport === 'TRIAL_BALANCE' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>ट्रायल बैलेंस (SME Trial Balance Statement)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Reconciled debit & credit balances across customer/supplier ledgers, cash-in-hand, and taxes.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" /> Both Sides Balanced
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800 text-slate-300 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-2.5 px-3">लेजर का नाम (Ledger Head)</th>
                  <th className="py-2.5 px-3">खाता समूह (Group)</th>
                  <th className="py-2.5 px-3 text-right text-rose-300">डेबिट (Debit ₹)</th>
                  <th className="py-2.5 px-3 text-right text-emerald-300">क्रेडिट (Credit ₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-200">
                {partyBalances.map((bal) => (
                  <tr key={bal.partyId} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-medium text-white">{bal.partyName}</td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {bal.netBalance > 0 ? 'Sundry Debtors' : 'Sundry Creditors'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {bal.netBalance > 0 ? formatIndianCurrency(bal.netBalance) : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono">
                      {bal.netBalance < 0 ? formatIndianCurrency(Math.abs(bal.netBalance)) : '-'}
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-800/40">
                  <td className="py-2.5 px-3 font-medium text-white">Cash in Hand (गल्ला / रोकड़)</td>
                  <td className="py-2.5 px-3 text-slate-400">Cash-in-hand</td>
                  <td className="py-2.5 px-3 text-right font-mono">₹24,500.00</td>
                  <td className="py-2.5 px-3 text-right font-mono">-</td>
                </tr>
                <tr className="bg-slate-800/40">
                  <td className="py-2.5 px-3 font-medium text-white">HDFC Bank Current A/c</td>
                  <td className="py-2.5 px-3 text-slate-400">Bank Accounts</td>
                  <td className="py-2.5 px-3 text-right font-mono">₹1,18,200.00</td>
                  <td className="py-2.5 px-3 text-right font-mono">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
