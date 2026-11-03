/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RecurringEntry, LedgerEntry } from '../types';

export function calculateNextDueDate(currentDateStr: string, frequency: RecurringEntry['frequency']): string {
  const d = new Date(currentDateStr);
  if (isNaN(d.getTime())) {
    const today = new Date();
    today.setMonth(today.getMonth() + 1);
    return today.toISOString().split('T')[0];
  }

  const next = new Date(d);
  switch (frequency) {
    case 'DAILY':
      next.setDate(next.getDate() + 1);
      break;
    case 'WEEKLY':
      next.setDate(next.getDate() + 7);
      break;
    case 'MONTHLY':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'QUARTERLY':
      next.setMonth(next.getMonth() + 3);
      break;
    case 'ANNUALLY':
      next.setFullYear(next.getFullYear() + 1);
      break;
    default:
      next.setMonth(next.getMonth() + 1);
  }

  return next.toISOString().split('T')[0];
}

export function isEntryDue(nextDueDateStr: string, referenceDate: Date = new Date()): boolean {
  const due = new Date(nextDueDateStr);
  if (isNaN(due.getTime())) return false;
  // Due if date is on or before today
  const ref = new Date(referenceDate);
  ref.setHours(23, 59, 59, 999);
  return due.getTime() <= ref.getTime();
}

export function createLedgerEntryFromRecurring(
  rec: RecurringEntry,
  postDate: string = new Date().toISOString().split('T')[0]
): Omit<LedgerEntry, 'id' | 'createdAt'> {
  return {
    partyId: rec.partyId || 'general-expense',
    partyName: rec.partyName,
    date: postDate,
    type: rec.type,
    amount: rec.amount,
    paymentMode: rec.paymentMode,
    billNumber: `REC-${Date.now().toString().slice(-4)}`,
    description: `[Recurring - ${rec.frequency}] ${rec.title}`,
    notes: `Automated recurring payment under ${rec.category}. Schedule ID: ${rec.id}`
  };
}

export function calculateUpcomingRecurringCommitments(
  recurringList: RecurringEntry[],
  daysAhead: number = 30,
  referenceDate: Date = new Date()
): { totalPayable: number; totalReceivable: number; dueItems: RecurringEntry[] } {
  const refLimit = new Date(referenceDate);
  refLimit.setDate(refLimit.getDate() + daysAhead);

  let totalPayable = 0;
  let totalReceivable = 0;
  const dueItems: RecurringEntry[] = [];

  for (const rec of recurringList) {
    if (rec.status !== 'ACTIVE') continue;
    const due = new Date(rec.nextDueDate);
    if (!isNaN(due.getTime()) && due.getTime() <= refLimit.getTime()) {
      dueItems.push(rec);
      if (rec.type === 'UDHAR') {
        // UDHAR for an expense/payable commitment
        totalPayable += rec.amount;
      } else {
        // JAMA for a recurring incoming collection/subscription
        totalReceivable += rec.amount;
      }
    }
  }

  return { totalPayable, totalReceivable, dueItems };
}
