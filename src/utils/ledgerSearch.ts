/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LedgerEntry, TransactionType, PaymentMode } from '../types';

export interface LedgerFilterOptions {
  searchQuery?: string;
  query?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number | null;
  maxAmount?: number | null;
  exactAmount?: number | null;
  type?: 'ALL' | TransactionType;
  paymentMode?: 'ALL' | PaymentMode;
}

export function filterLedgerEntries(
  entries: LedgerEntry[],
  options: LedgerFilterOptions
): LedgerEntry[] {
  const rawQuery = options.searchQuery ?? options.query;
  return entries.filter((entry) => {
    // 1. Text Search (description, billNumber, notes, partyName)
    if (rawQuery && rawQuery.trim() !== '') {
      const q = rawQuery.trim().toLowerCase();
      const matchDesc = entry.description?.toLowerCase().includes(q);
      const matchBill = entry.billNumber?.toLowerCase().includes(q);
      const matchNotes = entry.notes?.toLowerCase().includes(q);
      const matchParty = entry.partyName?.toLowerCase().includes(q);
      if (!matchDesc && !matchBill && !matchNotes && !matchParty) {
        return false;
      }
    }

    // 2. Date Range Filter
    if (options.startDate && options.startDate.trim() !== '') {
      if (entry.date < options.startDate.trim()) {
        return false;
      }
    }
    if (options.endDate && options.endDate.trim() !== '') {
      if (entry.date > options.endDate.trim()) {
        return false;
      }
    }

    // 3. Amount Filters
    if (options.exactAmount !== undefined && options.exactAmount !== null && !isNaN(options.exactAmount)) {
      if (Math.abs(entry.amount - options.exactAmount) > 0.01) {
        return false;
      }
    } else {
      if (options.minAmount !== undefined && options.minAmount !== null && !isNaN(options.minAmount)) {
        if (entry.amount < options.minAmount) {
          return false;
        }
      }
      if (options.maxAmount !== undefined && options.maxAmount !== null && !isNaN(options.maxAmount)) {
        if (entry.amount > options.maxAmount) {
          return false;
        }
      }
    }

    // 4. Transaction Type Filter (UDHAR vs JAMA)
    if (options.type && options.type !== 'ALL') {
      if (entry.type !== options.type) {
        return false;
      }
    }

    // 5. Payment Mode Filter
    if (options.paymentMode && options.paymentMode !== 'ALL') {
      if (entry.paymentMode !== options.paymentMode) {
        return false;
      }
    }

    return true;
  });
}
