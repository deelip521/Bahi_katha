/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Database,
  Download,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Copy,
  Check,
  Eye,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { generateTallyXml, validateVoucherBalance } from '../utils/tallyXml';
import { formatIndianCurrency } from '../utils/ledgerCalculations';

export const TallyBridgeTab = ({
  vouchers = [],
  onAddVoucher,
  companyName = 'BahiKhata Enterprise'
}) => {
  const [selectedType, setSelectedType] = useState('ALL');
  const [activeXmlPreview, setActiveXmlPreview] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isAddVoucherModalOpen, setIsAddVoucherModalOpen] = useState(false);

  // New Voucher Form
  const [vType, setVType] = useState('Sales');
  const [vNumber, setVNumber] = useState(`SALES/26-27/${String(vouchers.length + 1).padStart(3, '0')}`);
  const [vDate, setVDate] = useState(new Date().toISOString().split('T')[0]);
  const [vParty, setVParty] = useState('Sharma General Store');
  const [vContra, setVContra] = useState('Sales GST 5%');
  const [vAmount, setVAmount] = useState('10000');
  const [vNarration, setVNarration] = useState('Being sales goods on credit');

  const filteredVouchers = vouchers.filter((v) => {
    if (selectedType === 'ALL') return true;
    return v.voucherType === selectedType;
  });

  const fullXml = generateTallyXml(filteredVouchers, companyName);

  const handleDownloadXml = () => {
    const blob = new Blob([fullXml], { type: 'application/xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Tally_Daybook_${companyName.replace(/\s+/g, '_')}_Import.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCreateVoucher = (e) => {
    e.preventDefault();
    const amt = Number(vAmount);
    if (!vNumber || !amt) return;

    let entries = [];
    if (vType === 'Sales') {
      entries = [
        { ledgerName: vParty, isDeemedPositive: true, amount: amt },
        { ledgerName: vContra, isDeemedPositive: false, amount: amt }
      ];
    } else if (vType === 'Purchase') {
      entries = [
        { ledgerName: vContra, isDeemedPositive: true, amount: amt },
        { ledgerName: vParty, isDeemedPositive: false, amount: amt }
      ];
    } else if (vType === 'Receipt') {
      entries = [
        { ledgerName: vContra, isDeemedPositive: true, amount: amt },
        { ledgerName: vParty, isDeemedPositive: false, amount: amt }
      ];
    } else if (vType === 'Payment') {
      entries = [
        { ledgerName: vParty, isDeemedPositive: true, amount: amt },
        { ledgerName: vContra, isDeemedPositive: false, amount: amt }
      ];
    } else {
      entries = [
        { ledgerName: vParty, isDeemedPositive: true, amount: amt },
        { ledgerName: vContra, isDeemedPositive: false, amount: amt }
      ];
    }

    const newV = {
      id: `tv-${Date.now()}`,
      voucherNumber: vNumber,
      voucherType: vType,
      date: vDate,
      partyLedgerName: vParty,
      contraLedgerName: vContra,
      amount: amt,
      narration: vNarration,
      ledgerEntries: entries
    };

    if (onAddVoucher) onAddVoucher(newV);
    setIsAddVoucherModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <span>टैली प्राइम इंटीग्रेशन (Tally ERP 9 / Prime Bridge)</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-normal">
              XML Schema Ready
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Export compliant Daybook & Accounting Vouchers directly to Tally without manual entry.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddVoucherModalOpen(true)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>नया वाउचर (New Voucher)</span>
          </button>
          <button
            onClick={handleDownloadXml}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Tally XML डाउनलोड करें</span>
          </button>
        </div>
      </div>

      {/* Instructions for Accountant Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-blue-950/60 rounded-xl text-blue-400 border border-blue-800/60 shrink-0">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              मुनीम / एकाउंटेंट के लिए आसान निर्देश (How to import in Tally):
            </h4>
            <div className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>1. Download the XML file above</span>
              <span>&rarr;</span>
              <span>2. Open TallyPrime / Tally.ERP 9</span>
              <span>&rarr;</span>
              <span>3. Go to <strong>Alt+O (Import) &gt; Transactions</strong></span>
              <span>&rarr;</span>
              <span>4. Select file and press Enter</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setActiveXmlPreview(fullXml)}
          className="text-xs px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-semibold flex items-center gap-1.5 self-start md:self-auto shrink-0"
        >
          <FileCode className="w-4 h-4" />
          <span>XML कोड देखें (Inspect XML)</span>
        </button>
      </div>

      {/* Vouchers Filter & Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex flex-wrap gap-1.5">
            {['ALL', 'Sales', 'Purchase', 'Receipt', 'Payment', 'Journal'].map((vt) => (
              <button
                key={vt}
                onClick={() => setSelectedType(vt)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                  selectedType === vt
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {vt === 'ALL' ? 'सभी वाउचर (All)' : vt}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-400">
            Showing <strong className="text-white">{filteredVouchers.length}</strong> vouchers
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/90 text-slate-300 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3 rounded-l-lg">वाउचर नं. (Voucher #)</th>
                <th className="py-2.5 px-3">प्रकार (Type)</th>
                <th className="py-2.5 px-3">दिनांक (Date)</th>
                <th className="py-2.5 px-3">पार्टी लेजर (Party Ledger)</th>
                <th className="py-2.5 px-3">कॉन्ट्रा लेजर (Account)</th>
                <th className="py-2.5 px-3">बैलेंस स्टेटस (Balance)</th>
                <th className="py-2.5 px-3 text-right">रकम (Amount)</th>
                <th className="py-2.5 px-3 text-right rounded-r-lg">XML</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {filteredVouchers.map((v) => {
                const validation = validateVoucherBalance(v);
                return (
                  <tr key={v.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-amber-300">
                      {v.voucherNumber}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-slate-800 text-white border border-slate-700">
                        {v.voucherType}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap">{v.date}</td>
                    <td className="py-3 px-3 font-medium text-white">{v.partyLedgerName}</td>
                    <td className="py-3 px-3 text-slate-400">{v.contraLedgerName}</td>
                    <td className="py-3 px-3">
                      {validation.isValid ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Reconciled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-400">
                          <AlertTriangle className="w-3.5 h-3.5" /> Diff: ₹{validation.difference}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-extrabold text-white text-sm whitespace-nowrap">
                      {formatIndianCurrency(v.amount)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setActiveXmlPreview(generateTallyXml([v], companyName))}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition-colors"
                        title="Preview Voucher XML"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chart of Accounts / Tally Standard Ledgers Mapping */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
          <Layers className="w-4 h-4 text-amber-400" />
          <span>Tally Chart of Accounts (खाता समूह मैपिंग)</span>
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          All vouchers automatically map to standard Tally Prime groups:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Sundry Debtors</span>
            <div className="text-xs font-bold text-white mt-0.5">Sharma General Store</div>
            <div className="text-[10px] text-emerald-400 mt-1">Under: Current Assets</div>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Sundry Creditors</span>
            <div className="text-xs font-bold text-white mt-0.5">Gupta Traders & Wholesalers</div>
            <div className="text-[10px] text-rose-400 mt-1">Under: Current Liabilities</div>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Bank Accounts</span>
            <div className="text-xs font-bold text-white mt-0.5">HDFC Bank Current A/c</div>
            <div className="text-[10px] text-blue-400 mt-1">Under: Bank Accounts</div>
          </div>
          <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Duties & Taxes</span>
            <div className="text-xs font-bold text-white mt-0.5">CGST, SGST & IGST (Input/Output)</div>
            <div className="text-[10px] text-amber-400 mt-1">Under: Duties & Taxes</div>
          </div>
        </div>
      </div>

      {/* XML Code Preview Modal */}
      {activeXmlPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl p-6 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  Tally Prime XML Preview
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(activeXmlPreview);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy XML'}</span>
                </button>
                <button
                  onClick={() => setActiveXmlPreview(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto mt-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <pre className="text-xs font-mono text-emerald-300 whitespace-pre leading-relaxed">
                {activeXmlPreview}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Add Voucher Modal */}
      {isAddVoucherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white mb-1">
              नया टैली वाउचर बनाएं (Create Accounting Voucher)
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Construct a double-entry voucher compliant with TallyPrime XML specifications.
            </p>

            <form onSubmit={handleCreateVoucher} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Voucher Type</label>
                  <select
                    value={vType}
                    onChange={(e) => setVType(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                  >
                    <option value="Sales">Sales (बिक्री)</option>
                    <option value="Purchase">Purchase (खरीद)</option>
                    <option value="Receipt">Receipt (जमा)</option>
                    <option value="Payment">Payment (भुगतान)</option>
                    <option value="Journal">Journal (समायोजन)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Voucher #</label>
                  <input
                    type="text"
                    required
                    value={vNumber}
                    onChange={(e) => setVNumber(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Party Ledger Name</label>
                  <input
                    type="text"
                    required
                    value={vParty}
                    onChange={(e) => setVParty(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Contra Account</label>
                  <input
                    type="text"
                    required
                    value={vContra}
                    onChange={(e) => setVContra(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={vDate}
                    onChange={(e) => setVDate(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={vAmount}
                    onChange={(e) => setVAmount(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Narration</label>
                <input
                  type="text"
                  value={vNarration}
                  onChange={(e) => setVNarration(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddVoucherModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md"
                >
                  Save Tally Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
