/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardTab } from './components/DashboardTab';
import { BahiKhataTab } from './components/BahiKhataTab';
import { TallyBridgeTab } from './components/TallyBridgeTab';
import { DocIntelligenceTab } from './components/DocIntelligenceTab';
import { RagAssistantTab } from './components/RagAssistantTab';
import { GstReportsTab } from './components/GstReportsTab';
import { LoginPage } from './components/LoginPage';
import { ProfilePage } from './components/ProfilePage';
import {
  SAMPLE_PARTIES,
  SAMPLE_LEDGER_ENTRIES,
  SAMPLE_DOCUMENTS,
  SAMPLE_TALLY_VOUCHERS,
  SAMPLE_RECURRING_ENTRIES,
  DEFAULT_USER_PROFILE
} from './utils/sampleData';
import { Party, LedgerEntry, DocumentRecord, TallyVoucher, RecurringEntry, UserProfile, ActiveTab } from './types';
import {
  calculatePartyBalance,
  formatIndianCurrency,
  PartyBalanceSummary,
  generateWhatsAppReminder
} from './utils/ledgerCalculations';
import { calculateNextDueDate, createLedgerEntryFromRecurring } from './utils/recurringCalculations';

export default function App() {
  // Check if URL has ?login=1 to test login screen directly
  const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const startAtLogin = urlParams.get('login') === '1';

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!startAtLogin);
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER_PROFILE);

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [parties, setParties] = useState<Party[]>(SAMPLE_PARTIES);
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>(SAMPLE_LEDGER_ENTRIES);
  const [documents, setDocuments] = useState<DocumentRecord[]>(SAMPLE_DOCUMENTS);
  const [vouchers, setVouchers] = useState<TallyVoucher[]>(SAMPLE_TALLY_VOUCHERS);
  const [recurringEntries, setRecurringEntries] = useState<RecurringEntry[]>(SAMPLE_RECURRING_ENTRIES);

  const [selectedPartyId, setSelectedPartyId] = useState<string>(SAMPLE_PARTIES[0].id);
  const [selectedDocId, setSelectedDocId] = useState<string>(SAMPLE_DOCUMENTS[0].id);

  // Global Quick WhatsApp Modal
  const [quickWaParty, setQuickWaParty] = useState<{ party: Party; balance: PartyBalanceSummary } | null>(null);

  // Recalculate all party balances whenever parties or ledgerEntries change
  const partyBalances: PartyBalanceSummary[] = useMemo(() => {
    return parties.map((p) => calculatePartyBalance(p, ledgerEntries));
  }, [parties, ledgerEntries]);

  // Aggregate receivables
  const totalReceivableStr = useMemo(() => {
    const total = partyBalances
      .filter((b) => b.netBalance > 0)
      .reduce((sum, b) => sum + b.netBalance, 0);
    return formatIndianCurrency(total);
  }, [partyBalances]);

  // Handlers
  const handleAddLedgerEntry = (newEntry: Omit<LedgerEntry, 'id' | 'createdAt'>) => {
    const entry: LedgerEntry = {
      ...newEntry,
      id: `le-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setLedgerEntries((prev) => [entry, ...prev]);
  };

  const handleAddParty = (newParty: Omit<Party, 'id'>) => {
    const party: Party = {
      ...newParty,
      id: `p-${Date.now()}`
    };
    setParties((prev) => [...prev, party]);
    setSelectedPartyId(party.id);
  };

  const handleAddVoucher = (newVoucher: TallyVoucher) => {
    setVouchers((prev) => [newVoucher, ...prev]);
  };

  const handleDocumentExtracted = (newDoc: DocumentRecord) => {
    setDocuments((prev) => [newDoc, ...prev]);
  };

  // Recurring entries handlers
  const handleAddRecurringEntry = (newRec: RecurringEntry) => {
    setRecurringEntries((prev) => [newRec, ...prev]);
  };

  const handleUpdateRecurringEntry = (updated: RecurringEntry) => {
    setRecurringEntries((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const handleDeleteRecurringEntry = (id: string) => {
    setRecurringEntries((prev) => prev.filter((r) => r.id !== id));
  };

  const handlePostRecurringEntry = (rec: RecurringEntry) => {
    // 1. Post to party ledger
    const entryToPost = createLedgerEntryFromRecurring(rec);
    handleAddLedgerEntry(entryToPost);

    // 2. Increment nextDueDate
    const nextDate = calculateNextDueDate(rec.nextDueDate, rec.frequency);
    handleUpdateRecurringEntry({
      ...rec,
      lastPostedDate: new Date().toISOString().split('T')[0],
      nextDueDate: nextDate
    });
  };

  // 1-Click Sync: Doc -> Bahi Khata Ledger
  const handleSyncToBahiKhata = (doc: DocumentRecord) => {
    let matchedParty = parties.find(
      (p) => p.name.toLowerCase() === doc.partyName.toLowerCase()
    );

    if (!matchedParty) {
      matchedParty = {
        id: `p-${Date.now()}`,
        name: doc.partyName,
        phone: '9800000000',
        state: 'Delhi',
        stateCode: '07',
        address: 'Delhi Mandi',
        category: doc.docType === 'PURCHASE_BILL' ? 'SUPPLIER' : 'CUSTOMER',
        openingBalance: 0
      };
      setParties((prev) => [...prev, matchedParty!]);
    }

    const isCustomerDoc = doc.docType !== 'PURCHASE_BILL' && doc.docType !== 'TRANSPORT_BILTY';
    const entry: LedgerEntry = {
      id: `le-${Date.now()}`,
      partyId: matchedParty.id,
      partyName: matchedParty.name,
      date: doc.date,
      type: isCustomerDoc ? 'UDHAR' : 'JAMA',
      amount: doc.grandTotal,
      paymentMode: 'CREDIT',
      billNumber: doc.invoiceNumber,
      description: `${doc.title} (${doc.items.length} items)`,
      notes: `Auto-synced from Document OCR. Taxable: ₹${doc.subtotal}, Tax: ₹${doc.cgstTotal + doc.sgstTotal + doc.igstTotal}`,
      documentId: doc.id,
      createdAt: new Date().toISOString()
    };

    setLedgerEntries((prev) => [entry, ...prev]);
    setSelectedPartyId(matchedParty.id);
  };

  // 1-Click Sync: Doc -> Tally Voucher
  const handleConvertToTallyVoucher = (doc: DocumentRecord) => {
    const isPurchase = doc.docType === 'PURCHASE_BILL' || doc.docType === 'TRANSPORT_BILTY';
    const vType = isPurchase ? 'Purchase' : 'Sales';
    const prefix = isPurchase ? 'PUR' : 'SALES';

    const voucher: TallyVoucher = {
      id: `tv-${Date.now()}`,
      voucherNumber: `${prefix}/26-27/${String(vouchers.length + 1).padStart(3, '0')}`,
      voucherType: vType,
      date: doc.date,
      partyLedgerName: doc.partyName,
      contraLedgerName: isPurchase ? 'Purchase GST' : 'Sales GST',
      amount: doc.grandTotal,
      narration: `Being ${vType.toLowerCase()} of goods vide Bill #${doc.invoiceNumber}. ${doc.items.map(i => i.description).slice(0, 2).join(', ')}`,
      referenceNumber: doc.invoiceNumber,
      ledgerEntries: [
        {
          ledgerName: doc.partyName,
          isDeemedPositive: !isPurchase,
          amount: doc.grandTotal
        },
        {
          ledgerName: isPurchase ? 'Purchase GST' : 'Sales GST',
          isDeemedPositive: isPurchase,
          amount: doc.subtotal
        },
        ...(doc.cgstTotal > 0
          ? [
              {
                ledgerName: isPurchase ? 'Input CGST' : 'Output CGST',
                isDeemedPositive: isPurchase,
                amount: doc.cgstTotal
              }
            ]
          : []),
        ...(doc.sgstTotal > 0
          ? [
              {
                ledgerName: isPurchase ? 'Input SGST' : 'Output SGST',
                isDeemedPositive: isPurchase,
                amount: doc.sgstTotal
              }
            ]
          : []),
        ...(doc.igstTotal > 0
          ? [
              {
                ledgerName: isPurchase ? 'Input IGST' : 'Output IGST',
                isDeemedPositive: isPurchase,
                amount: doc.igstTotal
              }
            ]
          : [])
      ]
    };

    setVouchers((prev) => [voucher, ...prev]);
  };

  // Render Login Page if not logged in
  if (!isLoggedIn) {
    return (
      <LoginPage
        defaultProfile={user}
        onLoginSuccess={(loggedInUser) => {
          setUser(loggedInUser);
          setIsLoggedIn(true);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingDocCount={documents.filter((d) => d.status === 'EXTRACTED').length}
        totalReceivables={totalReceivableStr}
        user={user}
        onLogout={() => setIsLoggedIn(false)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardTab
            parties={parties}
            ledgerEntries={ledgerEntries}
            documents={documents}
            partyBalances={partyBalances}
            onOpenAddEntry={(partyId) => {
              if (partyId) setSelectedPartyId(partyId);
              setActiveTab('bahi-khata');
            }}
            onOpenWhatsApp={(party, balance) => setQuickWaParty({ party, balance })}
            setActiveTab={setActiveTab}
            onSelectDocument={(id) => setSelectedDocId(id)}
          />
        )}

        {activeTab === 'bahi-khata' && (
          <BahiKhataTab
            parties={parties}
            ledgerEntries={ledgerEntries}
            partyBalances={partyBalances}
            selectedPartyId={selectedPartyId}
            setSelectedPartyId={setSelectedPartyId}
            onAddLedgerEntry={handleAddLedgerEntry}
            onAddParty={handleAddParty}
            recurringEntries={recurringEntries}
            onAddRecurringEntry={handleAddRecurringEntry}
            onUpdateRecurringEntry={handleUpdateRecurringEntry}
            onDeleteRecurringEntry={handleDeleteRecurringEntry}
            onPostRecurringEntry={handlePostRecurringEntry}
          />
        )}

        {activeTab === 'tally-bridge' && (
          <TallyBridgeTab
            vouchers={vouchers}
            onAddVoucher={handleAddVoucher}
            companyName={user.businessName}
          />
        )}

        {activeTab === 'document-intel' && (
          <DocIntelligenceTab
            documents={documents}
            selectedDocId={selectedDocId}
            setSelectedDocId={setSelectedDocId}
            onSyncToBahiKhata={handleSyncToBahiKhata}
            onConvertToTallyVoucher={handleConvertToTallyVoucher}
            onDocumentExtracted={handleDocumentExtracted}
          />
        )}

        {activeTab === 'rag-assistant' && (
          <RagAssistantTab
            parties={parties}
            ledgerEntries={ledgerEntries}
            documents={documents}
            partyBalances={partyBalances}
            setActiveTab={setActiveTab}
            onSelectParty={(id) => setSelectedPartyId(id)}
            onOpenWhatsApp={(party, balance) => setQuickWaParty({ party, balance })}
          />
        )}

        {activeTab === 'reports' && (
          <GstReportsTab
            documents={documents}
            parties={parties}
            partyBalances={partyBalances}
            vouchers={vouchers}
          />
        )}

        {activeTab === 'profile' && (
          <ProfilePage
            user={user}
            onUpdateUser={(updated) => setUser(updated)}
            onLogout={() => setIsLoggedIn(false)}
          />
        )}
      </main>

      {/* Global Quick WhatsApp Reminder Modal */}
      {quickWaParty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <h3 className="text-base font-bold text-white mb-2">
              WhatsApp Payment Reminder: {quickWaParty.party.name}
            </h3>
            <p className="text-xs text-slate-300 mb-4 whitespace-pre-wrap bg-slate-950 p-4 rounded-xl border border-slate-800">
              {generateWhatsAppReminder(quickWaParty.party, quickWaParty.balance).text}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setQuickWaParty(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </button>
              <a
                href={generateWhatsAppReminder(quickWaParty.party, quickWaParty.balance).whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md"
              >
                Send on WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Bahi Khata & Tally RAG Platform • Designed for Indian Small & Medium Enterprises
          </span>
          <span className="flex items-center gap-2">
            <span>Tally ERP 9 / Prime XML Compliant</span>
            <span>•</span>
            <span>Recurring Payments & Gemini 3.8 RAG</span>
          </span>
        </div>
      </footer>
    </div>
  );
}
