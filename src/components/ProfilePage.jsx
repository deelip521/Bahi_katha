/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  User,
  Building,
  Mail,
  Phone,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Edit2,
  Save,
  LogOut,
  Calendar,
  Sparkles,
  Database,
  ArrowRight
} from 'lucide-react';

export const ProfilePage = ({ user, onUpdateUser, onLogout }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Edit form state
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [businessName, setBusinessName] = useState(user?.businessName || '');
  const [gstin, setGstin] = useState(user?.gstin || '');
  const [address, setAddress] = useState(user?.address || '');
  const [upiVpa, setUpiVpa] = useState(user?.upiVpa || '');
  const [bankName, setBankName] = useState(user?.bankName || '');
  const [accountNumber, setAccountNumber] = useState(user?.accountNumber || '');
  const [ifscCode, setIfscCode] = useState(user?.ifscCode || '');

  const handleSave = (e) => {
    e.preventDefault();
    if (onUpdateUser) {
      onUpdateUser({
        ...user,
        name,
        email,
        phone,
        businessName,
        gstin,
        address,
        upiVpa,
        bankName,
        accountNumber,
        ifscCode
      });
    }
    setIsEditing(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <span>Business Profile & Settings</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-normal">
              {user?.role}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Manage your firm identity, GSTIN registration, bank details for UPI reminders, and Tally subscription.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all"
            >
              <Edit2 className="w-4 h-4 text-amber-400" />
              <span>Edit Details</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-white"
            >
              Cancel
            </button>
          )}

          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/60 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-700 text-emerald-200 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Profile changes saved successfully!</span>
        </div>
      )}

      {/* Main Form & Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Plan Card & Account Snapshot */}
        <div className="space-y-6">
          {/* User Snapshot Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center relative overflow-hidden">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg shadow-amber-500/20 border border-amber-400/30 mb-3">
              {user?.name ? user.name.charAt(0) : 'B'}
            </div>
            <h3 className="text-lg font-bold text-white">{user?.name}</h3>
            <p className="text-xs text-amber-400 font-medium">{user?.businessName}</p>
            <p className="text-xs text-slate-400 mt-1">{user?.role}</p>

            <div className="mt-4 pt-4 border-t border-slate-800 text-left space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span className="truncate">{user?.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>{user?.phone}</span>
              </div>
            </div>
          </div>

          {/* Subscription Tier Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-amber-600/30 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-400">
                Active Subscription
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                Active
              </span>
            </div>
            <h4 className="text-base font-extrabold text-white">{user?.planName}</h4>
            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Next Renewal: <strong>{user?.renewalDate}</strong></span>
            </p>

            <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Automated Recurring Subscriptions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Unlimited TallyPrime XML Export</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Multimodal Invoice & Mandi OCR</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>SME Gemini 3.8 RAG Financial Assistant</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Business & Financial Data */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Firm & GST Information */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <Building className="w-4 h-4 text-amber-400" />
                <span>Firm Registration & Tax Credentials</span>
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                These credentials appear on your Tally XML vouchers and official invoices.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Firm Legal Trade Name
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 disabled:opacity-75 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    GSTIN (Goods & Services Tax)
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value.toUpperCase())}
                    className="w-full bg-slate-800 border border-slate-700 disabled:opacity-75 rounded-xl px-3 py-2 text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Registered Business Address
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 disabled:opacity-75 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Banking & UPI Payment Setup */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>Banking & UPI Payment Setup</span>
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Used to generate direct WhatsApp UPI payment links when reminding customers of Udhar dues.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Primary Merchant UPI VPA
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={upiVpa}
                    onChange={(e) => setUpiVpa(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 disabled:opacity-75 rounded-xl px-3 py-2 text-emerald-400 font-mono font-semibold focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Bank Name & Branch
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 disabled:opacity-75 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Current Account Number
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 disabled:opacity-75 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Bank IFSC Code
                  </label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                    className="w-full bg-slate-800 border border-slate-700 disabled:opacity-75 rounded-xl px-3 py-2 text-white font-mono uppercase focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-amber-600/20"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Profile Changes</span>
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
