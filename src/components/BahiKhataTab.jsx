/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState } from "react";
import {
  Search,
  Plus,
  Share2,
  ArrowUpRight,
  ArrowDownLeft,
  Phone,
  Building,
  User,
  CheckCircle2,
  Copy,
  ExternalLink,
  X,
  Repeat,
  Play,
  Pause,
  Trash2,
  RotateCcw,
  SlidersHorizontal
} from "lucide-react";
import {
  formatIndianCurrency,
  generateWhatsAppReminder
} from "../utils/ledgerCalculations";
import { calculateUpcomingRecurringCommitments } from "../utils/recurringCalculations";
import { filterLedgerEntries } from "../utils/ledgerSearch";
export const BahiKhataTab = ({
  parties,
  ledgerEntries,
  partyBalances,
  selectedPartyId,
  setSelectedPartyId,
  onAddLedgerEntry,
  onAddParty,
  recurringEntries,
  onAddRecurringEntry,
  onUpdateRecurringEntry,
  onDeleteRecurringEntry,
  onPostRecurringEntry
}) => {
  const [bahiSubView, setBahiSubView] = useState("passbook");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [isAddEntryOpen, setIsAddEntryOpen] = useState(false);
  const [isAddPartyOpen, setIsAddPartyOpen] = useState(false);
  const [isAddRecurringOpen, setIsAddRecurringOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [waLanguage, setWaLanguage] = useState("english");
  const [copiedLink, setCopiedLink] = useState(false);
  const [postFeedback, setPostFeedback] = useState(null);
  const [entryType, setEntryType] = useState("UDHAR");
  const [entryAmount, setEntryAmount] = useState("");
  const [entryDate, setEntryDate] = useState((/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
  const [entryMode, setEntryMode] = useState("CASH");
  const [entryBillNo, setEntryBillNo] = useState("");
  const [entryDescription, setEntryDescription] = useState("");
  const [entryNotes, setEntryNotes] = useState("");
  const [newPartyName, setNewPartyName] = useState("");
  const [newPartyPhone, setNewPartyPhone] = useState("");
  const [newPartyCategory, setNewPartyCategory] = useState("CUSTOMER");
  const [newPartyState, setNewPartyState] = useState("Delhi");
  const [newPartyGSTIN, setNewPartyGSTIN] = useState("");
  const [newPartyOpeningBal, setNewPartyOpeningBal] = useState("0");
  const [newPartyAddress, setNewPartyAddress] = useState("");
  const [recTitle, setRecTitle] = useState("");
  const [recPartyName, setRecPartyName] = useState(parties[0]?.name || "Khari Baoli Properties");
  const [recAmount, setRecAmount] = useState("");
  const [recType, setRecType] = useState("UDHAR");
  const [recMode, setRecMode] = useState("NEFT_RTGS");
  const [recFrequency, setRecFrequency] = useState("MONTHLY");
  const [recCategory, setRecCategory] = useState("RENT");
  const [recDayOfMonth, setRecDayOfMonth] = useState(1);
  const [recStartDate, setRecStartDate] = useState((/* @__PURE__ */ new Date()).toISOString().split("T")[0]);
  const [recAutoPost, setRecAutoPost] = useState(true);
  const [recNotes, setRecNotes] = useState("");
  const [entrySearchQuery, setEntrySearchQuery] = useState("");
  const [entryStartDate, setEntryStartDate] = useState("");
  const [entryEndDate, setEntryEndDate] = useState("");
  const [entryDatePreset, setEntryDatePreset] = useState("ALL");
  const [entryMinAmount, setEntryMinAmount] = useState("");
  const [entryMaxAmount, setEntryMaxAmount] = useState("");
  const [entryExactAmount, setEntryExactAmount] = useState("");
  const [entryTypeFilter, setEntryTypeFilter] = useState("ALL");
  const [entryModeFilter, setEntryModeFilter] = useState("ALL");
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const activeParty = parties.find((p) => p.id === selectedPartyId) || parties[0];
  const activeBalance = activeParty ? partyBalances.find((b) => b.partyId === activeParty.id) : void 0;
  const filteredParties = parties.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.phone.includes(searchTerm) || p.gstin && p.gstin.toLowerCase().includes(searchTerm.toLowerCase());
    const bal = partyBalances.find((b) => b.partyId === p.id);
    if (!matchesSearch) return false;
    if (filterType === "CUSTOMER") return p.category === "CUSTOMER" || p.category === "RETAILER";
    if (filterType === "SUPPLIER") return p.category === "SUPPLIER" || p.category === "DISTRIBUTOR";
    if (filterType === "LENE") return (bal?.netBalance || 0) > 0;
    if (filterType === "DENE") return (bal?.netBalance || 0) < 0;
    return true;
  });
  const activeEntries = ledgerEntries.filter((e) => e.partyId === activeParty?.id).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let runningBal = activeParty?.openingBalance || 0;
  const entriesWithRunningBal = activeEntries.map((entry) => {
    if (entry.type === "UDHAR") {
      runningBal += entry.amount;
    } else {
      runningBal -= entry.amount;
    }
    return {
      ...entry,
      calculatedBalance: runningBal
    };
  });
  const filteredLedgerEntries = filterLedgerEntries(entriesWithRunningBal, {
    searchQuery: entrySearchQuery,
    query: entrySearchQuery,
    startDate: entryStartDate || void 0,
    endDate: entryEndDate || void 0,
    minAmount: entryMinAmount ? Number(entryMinAmount) : void 0,
    maxAmount: entryMaxAmount ? Number(entryMaxAmount) : void 0,
    exactAmount: entryExactAmount ? Number(entryExactAmount) : void 0,
    type: entryTypeFilter !== "ALL" ? entryTypeFilter : void 0,
    paymentMode: entryModeFilter !== "ALL" ? entryModeFilter : void 0
  });
  const totalFilteredUdhar = filteredLedgerEntries.filter((e) => e.type === "UDHAR").reduce((sum, e) => sum + e.amount, 0);
  const totalFilteredJama = filteredLedgerEntries.filter((e) => e.type === "JAMA").reduce((sum, e) => sum + e.amount, 0);
  const isEntryFilterActive = Boolean(
    entrySearchQuery.trim() || entryStartDate || entryEndDate || entryMinAmount || entryMaxAmount || entryExactAmount || entryTypeFilter !== "ALL" || entryModeFilter !== "ALL"
  );
  const handleResetFilters = () => {
    setEntrySearchQuery("");
    setEntryStartDate("");
    setEntryEndDate("");
    setEntryMinAmount("");
    setEntryMaxAmount("");
    setEntryExactAmount("");
    setEntryTypeFilter("ALL");
    setEntryModeFilter("ALL");
    setEntryDatePreset("ALL");
  };
  const handleApplyDatePreset = (preset) => {
    setEntryDatePreset(preset);
    const today = /* @__PURE__ */ new Date();
    const toISO = (d) => d.toISOString().split("T")[0];
    if (preset === "ALL") {
      setEntryStartDate("");
      setEntryEndDate("");
    } else if (preset === "THIS_MONTH") {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setEntryStartDate(toISO(firstDay));
      setEntryEndDate(toISO(today));
    } else if (preset === "LAST_30_DAYS") {
      const past30 = new Date(today);
      past30.setDate(today.getDate() - 30);
      setEntryStartDate(toISO(past30));
      setEntryEndDate(toISO(today));
    } else if (preset === "LAST_7_DAYS") {
      const past7 = new Date(today);
      past7.setDate(today.getDate() - 7);
      setEntryStartDate(toISO(past7));
      setEntryEndDate(toISO(today));
    }
  };
  const recurringStats = calculateUpcomingRecurringCommitments(recurringEntries, 30);
  const totalMonthlyCommitment = recurringEntries.filter((r) => r.status === "ACTIVE" && r.frequency === "MONTHLY" && r.type === "UDHAR").reduce((sum, r) => sum + r.amount, 0);
  const handleCreateEntrySubmit = (e) => {
    e.preventDefault();
    if (!activeParty || !entryAmount || Number(entryAmount) <= 0) return;
    onAddLedgerEntry({
      partyId: activeParty.id,
      partyName: activeParty.name,
      date: entryDate,
      type: entryType,
      amount: Number(entryAmount),
      paymentMode: entryMode,
      billNumber: entryBillNo || void 0,
      description: entryDescription || (entryType === "UDHAR" ? "Credit Sale / Given on Udhar" : "Payment Received / Jama"),
      notes: entryNotes || void 0
    });
    setEntryAmount("");
    setEntryBillNo("");
    setEntryDescription("");
    setEntryNotes("");
    setIsAddEntryOpen(false);
  };
  const handleCreatePartySubmit = (e) => {
    e.preventDefault();
    if (!newPartyName || !newPartyPhone) return;
    const opBal = Number(newPartyOpeningBal) || 0;
    onAddParty({
      name: newPartyName,
      phone: newPartyPhone,
      category: newPartyCategory,
      state: newPartyState,
      stateCode: newPartyState === "Delhi" ? "07" : "09",
      address: newPartyAddress,
      gstin: newPartyGSTIN || void 0,
      openingBalance: opBal,
      interestRatePerMonth: 1.5
    });
    setNewPartyName("");
    setNewPartyPhone("");
    setNewPartyAddress("");
    setNewPartyGSTIN("");
    setNewPartyOpeningBal("0");
    setIsAddPartyOpen(false);
  };
  const handleCreateRecurringSubmit = (e) => {
    e.preventDefault();
    const amt = Number(recAmount);
    if (!recTitle || !amt || amt <= 0) return;
    const matchedParty = parties.find((p) => p.name.toLowerCase() === recPartyName.toLowerCase());
    const newRec = {
      id: `rec-${Date.now()}`,
      title: recTitle,
      partyId: matchedParty?.id,
      partyName: recPartyName,
      amount: amt,
      type: recType,
      paymentMode: recMode,
      frequency: recFrequency,
      category: recCategory,
      dayOfMonth: recDayOfMonth,
      startDate: recStartDate,
      nextDueDate: recStartDate,
      status: "ACTIVE",
      autoPost: recAutoPost,
      notes: recNotes
    };
    onAddRecurringEntry(newRec);
    setRecTitle("");
    setRecAmount("");
    setRecNotes("");
    setIsAddRecurringOpen(false);
    setPostFeedback(`Recurring schedule "${newRec.title}" created successfully!`);
    setTimeout(() => setPostFeedback(null), 3e3);
  };
  const handlePostNow = (rec) => {
    onPostRecurringEntry(rec);
    setPostFeedback(`Posted \u20B9${rec.amount.toLocaleString("en-IN")} for "${rec.title}" to ${rec.partyName} ledger!`);
    setTimeout(() => setPostFeedback(null), 3500);
  };
  const waData = activeParty && activeBalance ? generateWhatsAppReminder(activeParty, activeBalance, "Bharat Trading Co.", "bharattrading@okhdfcbank", waLanguage) : null;
  return <div className="space-y-6">
      {
    /* Top Banner & Sub-View Switcher */
  }
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <span>Bahi Khata & Ledger Management</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-normal">
              Rokad & Roznamcha
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Real-time Party Passbooks, Scheduled Recurring Subscriptions, and Instant WhatsApp UPI Reminders.
          </p>
        </div>

        {
    /* Action Buttons */
  }
        <div className="flex items-center gap-2.5">
          {bahiSubView === "passbook" ? <>
              <button
    onClick={() => setIsAddPartyOpen(true)}
    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all"
  >
                <User className="w-4 h-4 text-amber-400" />
                <span>New Party</span>
              </button>
              <button
    onClick={() => setIsAddEntryOpen(true)}
    className="flex items-center gap-1.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-amber-600/20 transition-all"
  >
                <Plus className="w-4 h-4" />
                <span>Add Entry</span>
              </button>
            </> : <button
    onClick={() => setIsAddRecurringOpen(true)}
    className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-95"
  >
              <Plus className="w-4 h-4" />
              <span>Schedule Recurring Payment</span>
            </button>}
        </div>
      </div>

      {
    /* Sub-view Navigation Tabs */
  }
      <div className="flex border-b border-slate-800 space-x-4">
        <button
    onClick={() => setBahiSubView("passbook")}
    className={`pb-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${bahiSubView === "passbook" ? "border-amber-500 text-amber-400" : "border-transparent text-slate-400 hover:text-white"}`}
  >
          <Building className="w-4 h-4" />
          <span>Party Ledgers & Passbook</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
            {parties.length} Parties
          </span>
        </button>

        <button
    onClick={() => setBahiSubView("recurring")}
    className={`pb-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition-all ${bahiSubView === "recurring" ? "border-amber-500 text-amber-400" : "border-transparent text-slate-400 hover:text-white"}`}
  >
          <Repeat className="w-4 h-4 text-emerald-400" />
          <span>Recurring Payments & Subscriptions</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
            {recurringEntries.length} Active
          </span>
        </button>
      </div>

      {postFeedback && <div className="p-3 bg-emerald-950/80 border border-emerald-700 text-emerald-200 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{postFeedback}</span>
        </div>}

      {
    /* VIEW 1: PASSBOOK VIEW */
  }
      {bahiSubView === "passbook" && <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {
    /* Left Column: Party Directory */
  }
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col h-[700px]">
            {
    /* Search & Filter */
  }
            <div className="space-y-3 pb-3 border-b border-slate-800">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
    type="text"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    placeholder="Search party name, phone, or GSTIN..."
    className="w-full bg-slate-800 text-white pl-9 pr-3 py-2 rounded-xl text-xs border border-slate-700 focus:outline-none focus:border-amber-500 placeholder-slate-500"
  />
              </div>

              <div className="flex flex-wrap gap-1">
                {[
    { id: "ALL", label: "All" },
    { id: "LENE", label: "To Collect" },
    { id: "DENE", label: "To Pay" },
    { id: "CUSTOMER", label: "Customers" },
    { id: "SUPPLIER", label: "Suppliers" }
  ].map((btn) => <button
    key={btn.id}
    onClick={() => setFilterType(btn.id)}
    className={`text-[11px] font-medium px-2.5 py-1 rounded-lg transition-all ${filterType === btn.id ? "bg-amber-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}
  >
                    {btn.label}
                  </button>)}
              </div>
            </div>

            {
    /* Party List */
  }
            <div className="flex-1 overflow-y-auto space-y-2 pt-3 pr-1">
              {filteredParties.map((party) => {
    const bal = partyBalances.find((b) => b.partyId === party.id);
    const isSelected = party.id === activeParty?.id;
    const net = bal?.netBalance || 0;
    const isLene = net > 0;
    const isDene = net < 0;
    return <div
      key={party.id}
      onClick={() => setSelectedPartyId(party.id)}
      className={`p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? "bg-amber-950/30 border-amber-600/70 shadow-sm" : "bg-slate-800/50 hover:bg-slate-800 border-slate-800"}`}
    >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-semibold text-xs sm:text-sm text-white flex items-center gap-1.5">
                          <span>{party.name}</span>
                          {party.gstin && <span className="text-[9px] px-1 py-0.2 rounded bg-slate-700 text-slate-300 font-mono">
                              GST
                            </span>}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-500" /> {party.phone}
                          </span>
                          <span>•</span>
                          <span>{party.state}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div
      className={`text-xs sm:text-sm font-extrabold ${isLene ? "text-emerald-400" : isDene ? "text-rose-400" : "text-slate-400"}`}
    >
                          {formatIndianCurrency(Math.abs(net))}
                        </div>
                        <div className="text-[10px] font-semibold text-slate-400">
                          {isLene ? "To Collect" : isDene ? "To Pay" : "Settled"}
                        </div>
                      </div>
                    </div>
                  </div>;
  })}
            </div>
          </div>

          {
    /* Right Column: Active Party Passbook */
  }
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col h-[700px]">
            {activeParty ? <>
                {
    /* Party Header Bar */
  }
                <div className="p-4 bg-slate-800/80 rounded-xl border border-slate-700/80 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white">{activeParty.name}</h3>
                      <span className="text-[11px] px-2 py-0.5 rounded font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        {activeParty.category}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span>Phone: <strong className="text-white">{activeParty.phone}</strong></span>
                      {activeParty.gstin && <span>GSTIN: <strong className="text-amber-300 font-mono">{activeParty.gstin}</strong></span>}
                      <span>Address: {activeParty.address}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {activeBalance && activeBalance.netBalance > 0 && <button
    onClick={() => setIsWhatsAppModalOpen(true)}
    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all"
  >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>WhatsApp Reminder</span>
                      </button>}
                    <button
    onClick={() => setIsAddEntryOpen(true)}
    className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all"
  >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Transaction</span>
                    </button>
                  </div>
                </div>

                {
    /* Balance Summary Header */
  }
                <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                  <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-800">
                    <div className="text-[11px] text-slate-400 uppercase font-semibold">Total Credit Given (Udhar/Dr)</div>
                    <div className="text-sm sm:text-base font-bold text-rose-400 mt-0.5">
                      {formatIndianCurrency(activeBalance?.totalUdhar || 0)}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-800">
                    <div className="text-[11px] text-slate-400 uppercase font-semibold">Total Payments Received (Jama/Cr)</div>
                    <div className="text-sm sm:text-base font-bold text-emerald-400 mt-0.5">
                      {formatIndianCurrency(activeBalance?.totalJama || 0)}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-800">
                    <div className="text-[11px] text-slate-400 uppercase font-semibold">Net Outstanding Balance</div>
                    <div
    className={`text-sm sm:text-base font-extrabold mt-0.5 ${(activeBalance?.netBalance || 0) > 0 ? "text-emerald-400" : (activeBalance?.netBalance || 0) < 0 ? "text-rose-400" : "text-slate-300"}`}
  >
                      {formatIndianCurrency(Math.abs(activeBalance?.netBalance || 0))}
                      <span className="text-[10px] ml-1 font-medium">
                        {(activeBalance?.netBalance || 0) > 0 ? "(To Collect)" : "(To Pay)"}
                      </span>
                    </div>
                  </div>
                </div>

                {
    /* Search & Filter Bar */
  }
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-3">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    {
    /* Search Input */
  }
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
    type="text"
    value={entrySearchQuery}
    onChange={(e) => setEntrySearchQuery(e.target.value)}
    placeholder="Search passbook by description, bill #, or notes..."
    aria-label="Search passbook entries"
    className="w-full pl-9 pr-8 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
  />
                      {entrySearchQuery && <button
    type="button"
    onClick={() => setEntrySearchQuery("")}
    aria-label="Clear search"
    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
  >
                          ✕
                        </button>}
                    </div>

                    {
    /* Type Filter Pills */
  }
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                      <button
    type="button"
    onClick={() => setEntryTypeFilter("ALL")}
    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${entryTypeFilter === "ALL" ? "bg-slate-800 text-white" : "text-slate-400 hover:text-slate-200"}`}
  >
                        All
                      </button>
                      <button
    type="button"
    onClick={() => setEntryTypeFilter("UDHAR")}
    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${entryTypeFilter === "UDHAR" ? "bg-rose-950/80 text-rose-300 border border-rose-800/60" : "text-slate-400 hover:text-rose-300"}`}
  >
                        Debit (Udhar)
                      </button>
                      <button
    type="button"
    onClick={() => setEntryTypeFilter("JAMA")}
    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${entryTypeFilter === "JAMA" ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/60" : "text-slate-400 hover:text-emerald-300"}`}
  >
                        Credit (Jama)
                      </button>
                    </div>

                    {
    /* Filter Toggle Button */
  }
                    <button
    type="button"
    onClick={() => setIsFilterExpanded(!isFilterExpanded)}
    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${isFilterExpanded || isEntryFilterActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"}`}
    aria-label="Toggle advanced filters"
  >
                      <SlidersHorizontal className="w-3.5 h-3.5" />
                      <span>Filters</span>
                      {isEntryFilterActive && <span className="w-2 h-2 rounded-full bg-emerald-400" />}
                    </button>

                    {
    /* Reset Button */
  }
                    {isEntryFilterActive && <button
    type="button"
    onClick={handleResetFilters}
    aria-label="Reset all filters"
    className="flex items-center justify-center gap-1 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-300 hover:bg-slate-800/60 transition-colors"
    title="Reset all filters"
  >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Reset</span>
                      </button>}
                  </div>

                  {
    /* Expanded Filter Panel */
  }
                  {isFilterExpanded && <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      {
    /* Date Presets & Range */
  }
                      <div className="sm:col-span-2 space-y-2">
                        <label className="text-[11px] font-medium text-slate-400 block">
                          Date Range Filter
                        </label>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {["ALL", "THIS_MONTH", "LAST_30_DAYS", "LAST_7_DAYS"].map((preset) => <button
    key={preset}
    type="button"
    onClick={() => handleApplyDatePreset(preset)}
    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${entryDatePreset === preset ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40" : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"}`}
  >
                              {preset === "ALL" ? "All Dates" : preset === "THIS_MONTH" ? "This Month" : preset === "LAST_30_DAYS" ? "Last 30 Days" : "Last 7 Days"}
                            </button>)}
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div>
                            <span className="text-[10px] text-slate-500 block mb-0.5">Start Date</span>
                            <input
    type="date"
    value={entryStartDate}
    onChange={(e) => {
      setEntryStartDate(e.target.value);
      setEntryDatePreset("ALL");
    }}
    aria-label="Filter start date"
    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
  />
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-500 block mb-0.5">End Date</span>
                            <input
    type="date"
    value={entryEndDate}
    onChange={(e) => {
      setEntryEndDate(e.target.value);
      setEntryDatePreset("ALL");
    }}
    aria-label="Filter end date"
    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
  />
                          </div>
                        </div>
                      </div>

                      {
    /* Amount Range Filter */
  }
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-slate-400 block">
                          Amount Range (₹)
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <input
    type="number"
    min="0"
    placeholder="Min ₹"
    value={entryMinAmount}
    onChange={(e) => setEntryMinAmount(e.target.value)}
    aria-label="Filter minimum amount"
    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
  />
                          <input
    type="number"
    min="0"
    placeholder="Max ₹"
    value={entryMaxAmount}
    onChange={(e) => setEntryMaxAmount(e.target.value)}
    aria-label="Filter maximum amount"
    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
  />
                        </div>
                        <input
    type="number"
    min="0"
    placeholder="Or exact amount (e.g. 4500)"
    value={entryExactAmount}
    onChange={(e) => setEntryExactAmount(e.target.value)}
    aria-label="Filter exact amount"
    className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 mt-1"
  />
                      </div>

                      {
    /* Payment Mode Filter */
  }
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-slate-400 block">
                          Payment Mode
                        </label>
                        <select
    value={entryModeFilter}
    onChange={(e) => setEntryModeFilter(e.target.value)}
    aria-label="Filter by payment mode"
    className="w-full px-2.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
  >
                          <option value="ALL">All Payment Modes</option>
                          <option value="CASH">Cash</option>
                          <option value="UPI">UPI</option>
                          <option value="NEFT_RTGS">NEFT / RTGS</option>
                          <option value="CHEQUE">Cheque</option>
                        </select>
                      </div>
                    </div>}

                  {
    /* Summary Bar */
  }
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-300">
                        Showing {filteredLedgerEntries.length} of {entriesWithRunningBal.length} entries
                      </span>
                      {isEntryFilterActive && <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20 text-[10px]">
                          Filtered
                        </span>}
                    </div>
                    <div className="flex items-center gap-3">
                      <span>
                        Debit: <strong className="text-rose-400">{formatIndianCurrency(totalFilteredUdhar)}</strong>
                      </span>
                      <span>
                        Credit: <strong className="text-emerald-400">{formatIndianCurrency(totalFilteredJama)}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {
    /* Ledger Table */
  }
                <div className="flex-1 overflow-y-auto border border-slate-800 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-800 text-slate-300 font-semibold uppercase tracking-wider sticky top-0 z-10">
                      <tr>
                        <th className="py-2.5 px-3">Date</th>
                        <th className="py-2.5 px-3">Description</th>
                        <th className="py-2.5 px-3">Mode</th>
                        <th className="py-2.5 px-3 text-right text-rose-300">Debit (Udhar)</th>
                        <th className="py-2.5 px-3 text-right text-emerald-300">Credit (Jama)</th>
                        <th className="py-2.5 px-3 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-200">
                      {!isEntryFilterActive && <tr className="bg-slate-800/30 text-slate-400 italic">
                          <td className="py-2.5 px-3">Opening</td>
                          <td className="py-2.5 px-3 font-medium">Opening Balance</td>
                          <td className="py-2.5 px-3">-</td>
                          <td className="py-2.5 px-3 text-right">
                            {activeParty.openingBalance > 0 ? formatIndianCurrency(activeParty.openingBalance) : "-"}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {activeParty.openingBalance < 0 ? formatIndianCurrency(Math.abs(activeParty.openingBalance)) : "-"}
                          </td>
                          <td className="py-2.5 px-3 text-right font-semibold text-slate-300">
                            {formatIndianCurrency(activeParty.openingBalance)}
                          </td>
                        </tr>}

                      {filteredLedgerEntries.length === 0 ? <tr>
                          <td colSpan={6} className="py-10 text-center">
                            <div className="max-w-xs mx-auto space-y-2">
                              <Search className="w-8 h-8 text-slate-600 mx-auto" />
                              <p className="text-slate-400 text-sm font-medium">No ledger entries found</p>
                              <p className="text-slate-500 text-xs">
                                Try adjusting your search keywords, date range, or amount filters.
                              </p>
                              {isEntryFilterActive && <button
    type="button"
    onClick={handleResetFilters}
    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-white font-medium transition-colors"
  >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Clear all filters</span>
                                </button>}
                            </div>
                          </td>
                        </tr> : filteredLedgerEntries.map((entry) => {
    const isUdhar = entry.type === "UDHAR";
    return <tr key={entry.id} className="hover:bg-slate-800/40 transition-colors">
                              <td className="py-3 px-3 text-slate-400 whitespace-nowrap">{entry.date}</td>
                              <td className="py-3 px-3">
                                <div className="font-medium text-white">{entry.description}</div>
                                {entry.billNumber && <div className="text-[10px] text-amber-400 font-mono">
                                    Bill #{entry.billNumber}
                                  </div>}
                                {entry.notes && <div className="text-[10px] text-slate-400">{entry.notes}</div>}
                              </td>
                              <td className="py-3 px-3">
                                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-semibold">
                                  {entry.paymentMode}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right text-rose-400 font-bold whitespace-nowrap">
                                {isUdhar ? formatIndianCurrency(entry.amount) : "-"}
                              </td>
                              <td className="py-3 px-3 text-right text-emerald-400 font-bold whitespace-nowrap">
                                {!isUdhar ? formatIndianCurrency(entry.amount) : "-"}
                              </td>
                              <td className="py-3 px-3 text-right font-extrabold whitespace-nowrap text-white">
                                {formatIndianCurrency(entry.calculatedBalance)}
                              </td>
                            </tr>;
  })}
                    </tbody>
                  </table>
                </div>
              </> : <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <Building className="w-12 h-12 text-slate-600 mb-2" />
                <p>Please select a party account from the left directory.</p>
              </div>}
          </div>
        </div>}

      {
    /* VIEW 2: RECURRING PAYMENTS & SUBSCRIPTIONS */
  }
      {bahiSubView === "recurring" && <div className="space-y-6">
          {
    /* Top Aggregates */
  }
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Total Monthly Recurring Outflow
              </span>
              <div className="text-2xl font-extrabold text-white mt-1">
                {formatIndianCurrency(totalMonthlyCommitment)}
                <span className="text-xs font-normal text-slate-400 ml-1">/ month</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Rent, software subscriptions, salaries & utilities
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Upcoming Due in Next 30 Days
              </span>
              <div className="text-2xl font-extrabold text-amber-400 mt-1">
                {formatIndianCurrency(recurringStats.totalPayable)}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {recurringStats.dueItems.length} schedules queued for execution
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Active Schedules
              </span>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1">
                {recurringEntries.filter((r) => r.status === "ACTIVE").length} / {recurringEntries.length} Active
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Automatic ledger posting enabled for eligible items
              </p>
            </div>
          </div>

          {
    /* Recurring Entries Table */
  }
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-emerald-400" />
                  <span>Scheduled Payments & Fixed Subscriptions</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Fixed monthly expenses, landlord rent, Tally cloud licenses, and retainer advances.
                </p>
              </div>

              <button
    onClick={() => setIsAddRecurringOpen(true)}
    className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all"
  >
                <Plus className="w-4 h-4" />
                <span>New Schedule</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-800/90 text-slate-300 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3 rounded-l-lg">Title & Category</th>
                    <th className="py-2.5 px-3">Party / Beneficiary</th>
                    <th className="py-2.5 px-3">Frequency</th>
                    <th className="py-2.5 px-3">Next Due Date</th>
                    <th className="py-2.5 px-3">Auto-Post</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    <th className="py-2.5 px-3 text-right rounded-r-lg">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 text-slate-200">
                  {recurringEntries.map((rec) => {
    const isPayment = rec.type === "UDHAR";
    return <tr key={rec.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-bold text-white text-xs sm:text-sm">{rec.title}</div>
                          <span className="inline-block mt-0.5 text-[10px] px-2 py-0.5 rounded font-semibold bg-slate-800 text-amber-300 border border-slate-700">
                            {rec.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-200">
                          {rec.partyName}
                        </td>
                        <td className="py-3 px-3 text-slate-300 whitespace-nowrap">
                          {rec.frequency} (Day {rec.dayOfMonth})
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <span className="font-mono text-emerald-400 font-semibold">{rec.nextDueDate}</span>
                        </td>
                        <td className="py-3 px-3">
                          {rec.autoPost ? <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Auto-enabled
                            </span> : <span className="text-[10px] font-semibold text-slate-400">
                              Manual Approval
                            </span>}
                        </td>
                        <td className="py-3 px-3">
                          <span
      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${rec.status === "ACTIVE" ? "bg-emerald-950 text-emerald-300 border border-emerald-800" : "bg-slate-800 text-slate-400 border border-slate-700"}`}
    >
                            {rec.status}
                          </span>
                        </td>
                        <td
      className={`py-3 px-3 text-right font-extrabold text-sm whitespace-nowrap ${isPayment ? "text-rose-400" : "text-emerald-400"}`}
    >
                          {formatIndianCurrency(rec.amount)}
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
      onClick={() => handlePostNow(rec)}
      className="px-2.5 py-1 rounded-lg bg-amber-600/20 hover:bg-amber-600 hover:text-white text-amber-300 border border-amber-500/40 text-[11px] font-bold transition-all"
      title="Post to ledger as a completed payment now"
    >
                              Post Now
                            </button>

                            <button
      onClick={() => {
        onUpdateRecurringEntry({
          ...rec,
          status: rec.status === "ACTIVE" ? "PAUSED" : "ACTIVE"
        });
      }}
      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
      title={rec.status === "ACTIVE" ? "Pause Schedule" : "Resume Schedule"}
    >
                              {rec.status === "ACTIVE" ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                            </button>

                            <button
      onClick={() => onDeleteRecurringEntry(rec.id)}
      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-500 hover:text-rose-300 transition-all"
      title="Delete Recurring Entry"
    >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>;
  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>}

      {
    /* MODAL: ADD RECURRING ENTRY */
  }
      {isAddRecurringOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Repeat className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">
                  Schedule Recurring Payment or Subscription
                </h3>
              </div>
              <button
    onClick={() => setIsAddRecurringOpen(false)}
    className="text-slate-400 hover:text-white"
  >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRecurringSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Schedule Title / Purpose *
                </label>
                <input
    type="text"
    required
    value={recTitle}
    onChange={(e) => setRecTitle(e.target.value)}
    placeholder="e.g. Shop Rent, Tally Cloud License, Staff Salary"
    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
  />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Expense Category
                  </label>
                  <select
    value={recCategory}
    onChange={(e) => setRecCategory(e.target.value)}
    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
  >
                    <option value="RENT">Rent (Shop / Godown)</option>
                    <option value="SUBSCRIPTION">Software & Subscriptions</option>
                    <option value="SALARY">Salaries & Wages</option>
                    <option value="UTILITY">Electricity & Internet</option>
                    <option value="SUPPLIER_RETAINER">Supplier Retainer / Advance</option>
                    <option value="LOAN_EMI">Loan EMI / Finance</option>
                    <option value="OTHER">Other Recurring</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Party / Beneficiary Name
                  </label>
                  <input
    type="text"
    required
    value={recPartyName}
    onChange={(e) => setRecPartyName(e.target.value)}
    placeholder="e.g. Landlord, Tally Solutions"
    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Recurring Amount (₹) *
                  </label>
                  <input
    type="number"
    step="0.01"
    required
    value={recAmount}
    onChange={(e) => setRecAmount(e.target.value)}
    placeholder="e.g. 15000"
    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-sm focus:outline-none focus:border-amber-500"
  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Payment Type
                  </label>
                  <select
    value={recType}
    onChange={(e) => setRecType(e.target.value)}
    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
  >
                    <option value="UDHAR">Payment Outflow (Expense)</option>
                    <option value="JAMA">Recurring Inflow (Collection)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Frequency
                  </label>
                  <select
    value={recFrequency}
    onChange={(e) => setRecFrequency(e.target.value)}
    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="QUARTERLY">Quarterly</option>
                    <option value="ANNUALLY">Annually</option>
                    <option value="DAILY">Daily</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Day of Month (1-31)
                  </label>
                  <input
    type="number"
    min="1"
    max="31"
    value={recDayOfMonth}
    onChange={(e) => setRecDayOfMonth(Number(e.target.value))}
    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Start / Next Due
                  </label>
                  <input
    type="date"
    value={recStartDate}
    onChange={(e) => setRecStartDate(e.target.value)}
    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300 py-1">
                  <input
    type="checkbox"
    checked={recAutoPost}
    onChange={(e) => setRecAutoPost(e.target.checked)}
    className="rounded border-slate-700 text-emerald-600 focus:ring-0 bg-slate-800"
  />
                  <span>Automatically post to ledger passbook on the scheduled due date</span>
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
    type="button"
    onClick={() => setIsAddRecurringOpen(false)}
    className="px-4 py-2 rounded-xl font-semibold text-slate-400 hover:text-white"
  >
                  Cancel
                </button>
                <button
    type="submit"
    className="px-5 py-2 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 shadow-md"
  >
                  Save Recurring Schedule
                </button>
              </div>
            </form>
          </div>
        </div>}

      {
    /* MODAL: ADD TRANSACTION */
  }
      {isAddEntryOpen && activeParty && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
    onClick={() => setIsAddEntryOpen(false)}
    className="absolute right-4 top-4 text-slate-400 hover:text-white"
  >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-1">
              Add New Transaction ({activeParty.name})
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Record credit sale (Udhar) or payment receipt (Jama) in this party ledger.
            </p>

            <form onSubmit={handleCreateEntrySubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <button
    type="button"
    onClick={() => setEntryType("UDHAR")}
    className={`py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all ${entryType === "UDHAR" ? "bg-rose-950 text-rose-200 border-rose-600 shadow-md" : "bg-slate-800 text-slate-400 border-slate-700"}`}
  >
                  <ArrowDownLeft className="w-4 h-4 text-rose-400" />
                  <span>Debit / Udhar (Gave Credit)</span>
                </button>
                <button
    type="button"
    onClick={() => setEntryType("JAMA")}
    className={`py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all ${entryType === "JAMA" ? "bg-emerald-950 text-emerald-200 border-emerald-600 shadow-md" : "bg-slate-800 text-slate-400 border-slate-700"}`}
  >
                  <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                  <span>Credit / Jama (Received)</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Amount (₹) *
                  </label>
                  <input
    type="number"
    step="0.01"
    required
    value={entryAmount}
    onChange={(e) => setEntryAmount(e.target.value)}
    placeholder="e.g. 5000"
    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-bold text-base focus:outline-none focus:border-amber-500"
  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Date *
                  </label>
                  <input
    type="date"
    required
    value={entryDate}
    onChange={(e) => setEntryDate(e.target.value)}
    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Payment Mode
                  </label>
                  <select
    value={entryMode}
    onChange={(e) => setEntryMode(e.target.value)}
    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
  >
                    <option value="CASH">Cash (Rokad)</option>
                    <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                    <option value="NEFT_RTGS">Bank Transfer (NEFT/RTGS)</option>
                    <option value="CHEQUE">Cheque</option>
                    <option value="CREDIT">Credit (Udhar)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Bill / Voucher #
                  </label>
                  <input
    type="text"
    value={entryBillNo}
    onChange={(e) => setEntryBillNo(e.target.value)}
    placeholder="e.g. INV-1092"
    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description / Line Items
                </label>
                <input
    type="text"
    value={entryDescription}
    onChange={(e) => setEntryDescription(e.target.value)}
    placeholder="e.g. 5 Bags Basmati Rice, 2 Tins Mustard Oil"
    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
  />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Internal Notes
                </label>
                <input
    type="text"
    value={entryNotes}
    onChange={(e) => setEntryNotes(e.target.value)}
    placeholder="e.g. 15 days payment terms agreed"
    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
  />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
    type="button"
    onClick={() => setIsAddEntryOpen(false)}
    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
  >
                  Cancel
                </button>
                <button
    type="submit"
    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 shadow-md"
  >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>}

      {
    /* MODAL: ADD PARTY */
  }
      {isAddPartyOpen && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
    onClick={() => setIsAddPartyOpen(false)}
    className="absolute right-4 top-4 text-slate-400 hover:text-white"
  >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-1">Create New Party Ledger</h3>
            <p className="text-xs text-slate-400 mb-4">Add a new Customer, Retailer, or Supplier account.</p>

            <form onSubmit={handleCreatePartySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Party Name / Trade Name *
                </label>
                <input
    type="text"
    required
    value={newPartyName}
    onChange={(e) => setNewPartyName(e.target.value)}
    placeholder="e.g. Agarwal Kirana Store"
    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
  />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mobile Number *
                  </label>
                  <input
    type="tel"
    required
    value={newPartyPhone}
    onChange={(e) => setNewPartyPhone(e.target.value)}
    placeholder="e.g. 9811223344"
    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Category
                  </label>
                  <select
    value={newPartyCategory}
    onChange={(e) => setNewPartyCategory(e.target.value)}
    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
  >
                    <option value="CUSTOMER">Customer / Retailer</option>
                    <option value="SUPPLIER">Supplier / Distributor</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    GSTIN (Optional)
                  </label>
                  <input
    type="text"
    value={newPartyGSTIN}
    onChange={(e) => setNewPartyGSTIN(e.target.value.toUpperCase())}
    placeholder="e.g. 07AAAAA0000A1Z5"
    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-mono uppercase focus:outline-none focus:border-amber-500"
  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    State
                  </label>
                  <input
    type="text"
    value={newPartyState}
    onChange={(e) => setNewPartyState(e.target.value)}
    placeholder="Delhi"
    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Opening Balance (₹)
                </label>
                <input
    type="number"
    value={newPartyOpeningBal}
    onChange={(e) => setNewPartyOpeningBal(e.target.value)}
    placeholder="0 (Positive for receivable, negative for payable)"
    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
  />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Billing Address
                </label>
                <input
    type="text"
    value={newPartyAddress}
    onChange={(e) => setNewPartyAddress(e.target.value)}
    placeholder="Market, City, PIN"
    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-amber-500"
  />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
    type="button"
    onClick={() => setIsAddPartyOpen(false)}
    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
  >
                  Cancel
                </button>
                <button
    type="submit"
    className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 shadow-md"
  >
                  Save Party Ledger
                </button>
              </div>
            </form>
          </div>
        </div>}

      {
    /* MODAL: WHATSAPP REMINDER */
  }
      {isWhatsAppModalOpen && activeParty && waData && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <button
    onClick={() => setIsWhatsAppModalOpen(false)}
    className="absolute right-4 top-4 text-slate-400 hover:text-white"
  >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-emerald-950 text-emerald-400 rounded-xl border border-emerald-800">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  WhatsApp Payment Reminder
                </h3>
                <p className="text-xs text-slate-400">
                  Send a polite, branded message with direct UPI payment link to {activeParty.name}.
                </p>
              </div>
            </div>

            <div className="my-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Message Language
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
    { id: "english", label: "English" },
    { id: "hinglish", label: "Hinglish" },
    { id: "hindi", label: "Hindi" }
  ].map((l) => <button
    key={l.id}
    type="button"
    onClick={() => setWaLanguage(l.id)}
    className={`py-2 text-xs font-medium rounded-xl border transition-all ${waLanguage === l.id ? "bg-amber-600 text-white border-amber-500 shadow-sm" : "bg-slate-800 text-slate-400 border-slate-700"}`}
  >
                    {l.label}
                  </button>)}
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 mb-4 font-sans text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
              {waData.text}
            </div>

            <div className="p-3 bg-slate-800/80 border border-slate-700 rounded-xl mb-4 flex items-center justify-between text-xs">
              <div className="truncate mr-2">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">UPI Payment Link:</span>
                <span className="font-mono text-emerald-400 truncate">{waData.upiLink}</span>
              </div>
              <button
    onClick={() => {
      navigator.clipboard.writeText(waData.upiLink);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2e3);
    }}
    className="text-xs px-2.5 py-1 rounded bg-slate-700 text-slate-200 hover:text-white flex items-center gap-1 shrink-0"
  >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedLink ? "Copied!" : "Copy"}</span>
              </button>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
    type="button"
    onClick={() => setIsWhatsAppModalOpen(false)}
    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800"
  >
                Close
              </button>
              <a
    href={waData.whatsappUrl}
    target="_blank"
    rel="noreferrer"
    className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/30 transition-all"
  >
                <ExternalLink className="w-4 h-4" />
                <span>Open WhatsApp</span>
              </a>
            </div>
          </div>
        </div>}
    </div>;
};
