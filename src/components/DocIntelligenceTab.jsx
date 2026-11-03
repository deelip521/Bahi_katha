/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Upload,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Database,
  BookOpen,
  RefreshCw,
  Eye,
  FileCheck,
  ShieldCheck,
  Layers,
  FileSignature
} from 'lucide-react';
import { formatIndianCurrency } from '../utils/ledgerCalculations';
import { getStateFromGSTIN } from '../utils/gstCalculations';

export const DocIntelligenceTab = ({
  documents = [],
  selectedDocId,
  setSelectedDocId,
  onSyncToBahiKhata,
  onConvertToTallyVoucher,
  onDocumentExtracted
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [customFileText, setCustomFileText] = useState('');

  const activeDoc = documents.find((d) => d.id === selectedDocId) || documents[0];

  const partyState = getStateFromGSTIN(activeDoc?.partyGSTIN);
  const supplierState = getStateFromGSTIN(activeDoc?.supplierGSTIN);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result;
      try {
        const res = await fetch('/api/extract-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Data,
            mimeType: file.type || 'image/jpeg',
            docHint: file.name
          })
        });

        const json = await res.json();
        if (json.success && json.data) {
          const d = json.data;
          const newDoc = {
            id: `doc-${Date.now()}`,
            title: `${d.docType?.replace(/_/g, ' ') || 'Uploaded Document'} #${d.invoiceNumber || 'NEW'}`,
            docType: d.docType || 'GST_TAX_INVOICE',
            invoiceNumber: d.invoiceNumber || `BILL-${Date.now().toString().slice(-4)}`,
            date: d.date || new Date().toISOString().split('T')[0],
            partyName: d.partyName || 'Unknown Party',
            partyGSTIN: d.partyGSTIN,
            supplierGSTIN: d.supplierGSTIN,
            subtotal: d.subtotal || d.grandTotal || 0,
            cgstTotal: d.cgstTotal || 0,
            sgstTotal: d.sgstTotal || 0,
            igstTotal: d.igstTotal || 0,
            roundOff: d.roundOff || 0,
            grandTotal: d.grandTotal || d.subtotal || 0,
            confidenceScore: d.confidenceScore || 0.94,
            status: 'EXTRACTED',
            notes: d.notes || 'AI Extracted via Gemini 3.8 Flash',
            items: (d.items || []).map((it, idx) => ({
              id: `item-${Date.now()}-${idx}`,
              description: it.description || 'Item',
              hsn: it.hsn || '9999',
              quantity: it.quantity || 1,
              unit: it.unit || 'Nos',
              rate: it.rate || it.amount || 0,
              amount: it.amount || 0,
              gstRate: it.gstRate || 0,
              cgstAmount: it.cgstAmount || 0,
              sgstAmount: it.sgstAmount || 0,
              igstAmount: it.igstAmount || 0,
              total: it.total || it.amount || 0
            }))
          };

          if (onDocumentExtracted) onDocumentExtracted(newDoc);
          if (setSelectedDocId) setSelectedDocId(newDoc.id);
          setSyncStatus('दस्तावेज़ सफलतापूर्वक एक्सट्रैक्ट हो गया!');
          setTimeout(() => setSyncStatus(null), 3000);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCustomTextExtract = async () => {
    if (!customFileText.trim()) return;
    setIsProcessing(true);
    try {
      const res = await fetch('/api/extract-document', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentText: customFileText,
          docHint: 'Raw Text / Parchi Entry'
        })
      });
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        const newDoc = {
          id: `doc-${Date.now()}`,
          title: `Raw Text Note #${d.invoiceNumber || 'NEW'}`,
          docType: d.docType || 'KACHA_PARCHI',
          invoiceNumber: d.invoiceNumber || `KP-${Date.now().toString().slice(-4)}`,
          date: d.date || new Date().toISOString().split('T')[0],
          partyName: d.partyName || 'Counter Cash Party',
          subtotal: d.subtotal || d.grandTotal || 0,
          cgstTotal: d.cgstTotal || 0,
          sgstTotal: d.sgstTotal || 0,
          igstTotal: d.igstTotal || 0,
          roundOff: 0,
          grandTotal: d.grandTotal || d.subtotal || 0,
          confidenceScore: d.confidenceScore || 0.95,
          status: 'EXTRACTED',
          notes: d.notes || customFileText,
          items: (d.items || []).map((it, idx) => ({
            id: `item-${Date.now()}-${idx}`,
            description: it.description || 'Kirana Item',
            hsn: it.hsn || '1905',
            quantity: it.quantity || 1,
            unit: it.unit || 'Unit',
            rate: it.rate || 100,
            amount: it.amount || 100,
            gstRate: it.gstRate || 0,
            cgstAmount: 0,
            sgstAmount: 0,
            igstAmount: 0,
            total: it.total || it.amount || 100
          }))
        };
        if (onDocumentExtracted) onDocumentExtracted(newDoc);
        if (setSelectedDocId) setSelectedDocId(newDoc.id);
        setCustomFileText('');
        setSyncStatus('पर्ची एक्सट्रैक्ट हो गई!');
        setTimeout(() => setSyncStatus(null), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <span>दस्तावेज़ इंटेलिजेंस (SME Document Intelligence & OCR)</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-normal">
              Gemini Multimodal
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Convert GST tax invoices, handwritten kacha parchi slips & bilty into digital Bahi Khata entries and Tally vouchers.
          </p>
        </div>

        {/* Upload Button */}
        <label className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-600/20 cursor-pointer transition-all active:scale-95">
          <Upload className="w-4 h-4" />
          <span>बिल या पर्ची अपलोड करें</span>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {syncStatus && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-700 text-emerald-200 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{syncStatus}</span>
        </div>
      )}

      {/* Selector: Sample Documents */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-amber-400" />
            <span>नमूना दस्तावेज़ चुनें (Select Sample Invoices & Slips):</span>
          </span>
          <span className="text-[11px] text-slate-500">Instant test without file upload</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {documents.map((doc) => {
            const isSelected = doc.id === activeDoc?.id;
            return (
              <button
                key={doc.id}
                onClick={() => setSelectedDocId && setSelectedDocId(doc.id)}
                className={`text-left p-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-blue-950/40 border-blue-500 shadow-md ring-1 ring-blue-500'
                    : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-amber-400">
                    {doc.docType.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-300 font-mono">
                    {doc.invoiceNumber}
                  </span>
                </div>
                <div className="text-xs font-semibold text-white mt-1 truncate">
                  {doc.title}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                  {doc.partyName}
                </div>
                <div className="text-xs font-bold text-emerald-400 mt-2">
                  {formatIndianCurrency(doc.grandTotal)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Document Details */}
      {activeDoc ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Visual Document Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                    {activeDoc.docType}
                  </span>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {activeDoc.title}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                    {Math.round(activeDoc.confidenceScore * 100)}% AI Accuracy
                  </span>
                </div>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-2 gap-3 py-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">बिल नं. (Invoice #)</span>
                  <strong className="text-white font-mono">{activeDoc.invoiceNumber}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">दिनांक (Date)</span>
                  <strong className="text-white">{activeDoc.date}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">पार्टी (Party / Buyer)</span>
                  <strong className="text-white truncate block">{activeDoc.partyName}</strong>
                  {activeDoc.partyGSTIN && (
                    <span className="text-[10px] text-amber-300 font-mono">
                      {activeDoc.partyGSTIN} ({partyState?.name})
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">सप्लायर (Supplier)</span>
                  <strong className="text-white truncate block">Bharat Trading Co.</strong>
                  {activeDoc.supplierGSTIN && (
                    <span className="text-[10px] text-slate-300 font-mono">
                      {activeDoc.supplierGSTIN} ({supplierState?.name})
                    </span>
                  )}
                </div>
              </div>

              {/* Remarks / Handwritten Parchi Notes */}
              {activeDoc.notes && (
                <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-xl text-xs text-amber-200">
                  <span className="font-bold text-[10px] text-amber-400 uppercase block mb-0.5">
                    पर्ची नोट / AI Observations:
                  </span>
                  {activeDoc.notes}
                </div>
              )}

              {/* 1-Click Sync CTAs */}
              <div className="mt-5 space-y-2.5 pt-3 border-t border-slate-800">
                <button
                  onClick={() => {
                    if (onSyncToBahiKhata) onSyncToBahiKhata(activeDoc);
                    setSyncStatus(`'${activeDoc.title}' को बही खाते में जोड़ दिया गया!`);
                    setTimeout(() => setSyncStatus(null), 3000);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white py-2.5 rounded-xl font-bold text-xs shadow-md shadow-amber-600/20 transition-all active:scale-95"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>1-Click: बही खाते में दर्ज करें (Push to Bahi Khata)</span>
                </button>

                <button
                  onClick={() => {
                    if (onConvertToTallyVoucher) onConvertToTallyVoucher(activeDoc);
                    setSyncStatus(`'${activeDoc.title}' के लिए Tally Voucher तैयार हो गया!`);
                    setTimeout(() => setSyncStatus(null), 3000);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95"
                >
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>1-Click: टैली वाउचर बनाएं (Create Tally Voucher)</span>
                </button>
              </div>
            </div>

            {/* Quick Text / Parchi Input Box */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5 mb-2">
                <FileSignature className="w-4 h-4 text-amber-400" />
                <span>कच्ची पर्ची या व्हाट्सएप बिल टेक्स्ट पेस्ट करें:</span>
              </h4>
              <textarea
                value={customFileText}
                onChange={(e) => setCustomFileText(e.target.value)}
                placeholder="उदा. 20 बोरी चावल @ 1600, 5 टीन सरसों तेल @ 2150, शर्मा जी को उधार दिया..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500 h-20 placeholder-slate-500"
              />
              <button
                disabled={isProcessing || !customFileText.trim()}
                onClick={handleCustomTextExtract}
                className="mt-2 text-xs bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-amber-300 font-semibold px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isProcessing ? 'Extracting...' : 'AI से पर्ची समझें'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Line Items & Tax Calculation */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  <span>वस्तुवार विवरण व जीएसटी गणना (Extracted Line Items)</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Item descriptions, HSN codes, quantity, rate, and GST breakdown.
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-x-auto border border-slate-800 rounded-xl mb-4">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800 text-slate-300 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">वस्तु (Item)</th>
                    <th className="py-2.5 px-3">HSN</th>
                    <th className="py-2.5 px-3 text-right">मात्रा (Qty)</th>
                    <th className="py-2.5 px-3 text-right">दर (Rate)</th>
                    <th className="py-2.5 px-3 text-right">मूल्य (Amount)</th>
                    <th className="py-2.5 px-3 text-right">GST %</th>
                    <th className="py-2.5 px-3 text-right">कुल (Total)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {activeDoc.items.map((it) => (
                    <tr key={it.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-medium text-white max-w-xs truncate">
                        {it.description}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">{it.hsn || '-'}</td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        {it.quantity} {it.unit}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        {formatIndianCurrency(it.rate)}
                      </td>
                      <td className="py-2.5 px-3 text-right whitespace-nowrap text-slate-300">
                        {formatIndianCurrency(it.amount)}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono text-[10px]">
                          {it.gstRate}%
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-white whitespace-nowrap">
                        {formatIndianCurrency(it.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Summary Card */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>कर योग्य मूल्य (Subtotal / Taxable Value):</span>
                <span className="font-semibold text-white">{formatIndianCurrency(activeDoc.subtotal)}</span>
              </div>
              {activeDoc.cgstTotal > 0 && (
                <div className="flex justify-between text-slate-400">
                  <span>CGST (Central Tax):</span>
                  <span>{formatIndianCurrency(activeDoc.cgstTotal)}</span>
                </div>
              )}
              {activeDoc.sgstTotal > 0 && (
                <div className="flex justify-between text-slate-400">
                  <span>SGST (State Tax):</span>
                  <span>{formatIndianCurrency(activeDoc.sgstTotal)}</span>
                </div>
              )}
              {activeDoc.igstTotal > 0 && (
                <div className="flex justify-between text-amber-300">
                  <span>IGST (Integrated Interstate Tax):</span>
                  <span>{formatIndianCurrency(activeDoc.igstTotal)}</span>
                </div>
              )}
              <div className="pt-2 border-t border-slate-700 flex justify-between text-sm font-bold text-white">
                <span className="text-amber-400">कुल देय राशि (Grand Total):</span>
                <span className="text-base text-emerald-400">{formatIndianCurrency(activeDoc.grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-2xl">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p>कोई दस्तावेज़ उपलब्ध नहीं है। कृपया ऊपर से एक बिल चुनें या अपलोड करें।</p>
        </div>
      )}
    </div>
  );
};
