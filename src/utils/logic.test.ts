/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { generateTallyXml, validateVoucherBalance, formatTallyDate, escapeXml } from './tallyXml';
import { formatIndianCurrency, calculatePartyBalance, generateWhatsAppReminder } from './ledgerCalculations';
import { getStateFromGSTIN, isInterStateSupply, calculateItemTaxes, calculateInvoiceTotals } from './gstCalculations';
import { Party, LedgerEntry, TallyVoucher, DocumentItem } from '../types';

test('escapeXml correctly escapes special characters', () => {
  assert.equal(escapeXml('M/S Ram & Sons <Traders> "Delhi"'), 'M/S Ram &amp; Sons &lt;Traders&gt; &quot;Delhi&quot;');
});

test('formatTallyDate formats valid dates to YYYYMMDD', () => {
  assert.equal(formatTallyDate('2026-10-30'), '20261030');
});

test('validateVoucherBalance passes when debits equal credits', () => {
  const balancedVoucher: TallyVoucher = {
    id: 'V1',
    voucherNumber: 'SALES-001',
    voucherType: 'Sales',
    date: '2026-10-30',
    partyLedgerName: 'Sharma General Store',
    contraLedgerName: 'Sales Account',
    amount: 5000,
    narration: 'Sold goods on credit',
    ledgerEntries: [
      { ledgerName: 'Sharma General Store', isDeemedPositive: true, amount: 5000 },
      { ledgerName: 'Sales Account', isDeemedPositive: false, amount: 5000 }
    ]
  };

  const validation = validateVoucherBalance(balancedVoucher);
  assert.equal(validation.isValid, true);
  assert.equal(validation.difference, 0);

  const unbalancedVoucher: TallyVoucher = {
    ...balancedVoucher,
    ledgerEntries: [
      { ledgerName: 'Sharma General Store', isDeemedPositive: true, amount: 5000 },
      { ledgerName: 'Sales Account', isDeemedPositive: false, amount: 4500 }
    ]
  };
  const unbalValidation = validateVoucherBalance(unbalancedVoucher);
  assert.equal(unbalValidation.isValid, false);
  assert.equal(unbalValidation.difference, 500);
});

test('generateTallyXml outputs standard Tally envelope with valid XML tags', () => {
  const sampleVouchers: TallyVoucher[] = [
    {
      id: 'V1',
      voucherNumber: 'RCPT-101',
      voucherType: 'Receipt',
      date: '2026-10-30',
      partyLedgerName: 'Sharma General Store',
      contraLedgerName: 'Cash',
      amount: 2500,
      narration: 'Cash received from Sharma Ji',
      ledgerEntries: [
        { ledgerName: 'Cash', isDeemedPositive: true, amount: 2500 },
        { ledgerName: 'Sharma General Store', isDeemedPositive: false, amount: 2500 }
      ]
    }
  ];

  const xml = generateTallyXml(sampleVouchers, 'Radhey Shyam Kirana');
  assert.ok(xml.includes('<ENVELOPE>'));
  assert.ok(xml.includes('<TALLYREQUEST>Import Data</TALLYREQUEST>'));
  assert.ok(xml.includes('<SVCURRENTCOMPANY>Radhey Shyam Kirana</SVCURRENTCOMPANY>'));
  assert.ok(xml.includes('VCHTYPE="Receipt"'));
  assert.ok(xml.includes('<VOUCHERNUMBER>RCPT-101</VOUCHERNUMBER>'));
  assert.ok(xml.includes('<AMOUNT>-2500.00</AMOUNT>')); // Tally negative for deemed positive
  assert.ok(xml.includes('</ENVELOPE>'));
});

test('formatIndianCurrency formats numbers in Indian numbering system', () => {
  assert.equal(formatIndianCurrency(1000), '₹1,000.00');
  assert.equal(formatIndianCurrency(125000), '₹1,25,000.00');
  assert.equal(formatIndianCurrency(10000000), '₹1,00,00,000.00');
  assert.equal(formatIndianCurrency(-4500), '-₹4,500.00');
});

test('calculatePartyBalance computes net balance, status and interest correctly', () => {
  const party: Party = {
    id: 'p1',
    name: 'Gupta Traders',
    phone: '9876543210',
    state: 'Delhi',
    stateCode: '07',
    address: 'Chandni Chowk, Delhi',
    category: 'CUSTOMER',
    openingBalance: 10000, // 10,000 receivable
    interestRatePerMonth: 2
  };

  const entries: LedgerEntry[] = [
    {
      id: 'e1',
      partyId: 'p1',
      partyName: 'Gupta Traders',
      date: '2026-09-01',
      type: 'UDHAR', // +5,000 credit given
      amount: 5000,
      paymentMode: 'CREDIT',
      description: 'Invoice #101 Goods sold',
      createdAt: '2026-09-01T10:00:00Z'
    },
    {
      id: 'e2',
      partyId: 'p1',
      partyName: 'Gupta Traders',
      date: '2026-09-15',
      type: 'JAMA', // -3,000 payment received
      amount: 3000,
      paymentMode: 'UPI',
      description: 'UPI Payment',
      createdAt: '2026-09-15T12:00:00Z'
    }
  ];

  // Net balance = 10,000 + 5,000 - 3,000 = 12,000 (Lene Hain)
  const asOf = new Date('2026-10-30');
  const summary = calculatePartyBalance(party, entries, asOf);
  assert.equal(summary.netBalance, 12000);
  assert.equal(summary.status, 'LENE_HAIN');
  assert.equal(summary.totalUdhar, 15000);
  assert.equal(summary.totalJama, 3000);
  assert.ok(summary.daysSinceLastTx! > 30);
  assert.ok(summary.calculatedInterest! > 0);
});

test('generateWhatsAppReminder produces valid WhatsApp message and UPI URI', () => {
  const party: Party = {
    id: 'p1',
    name: 'Sharma Ji',
    phone: '9812345678',
    state: 'Delhi',
    stateCode: '07',
    address: 'Karol Bagh, Delhi',
    category: 'CUSTOMER',
    openingBalance: 0
  };

  const balance = {
    partyId: 'p1',
    partyName: 'Sharma Ji',
    totalUdhar: 8500,
    totalJama: 0,
    netBalance: 8500,
    status: 'LENE_HAIN' as const
  };

  const reminder = generateWhatsAppReminder(party, balance, 'Agarwal Kirana Store', 'agarwal@upi', 'hinglish');
  assert.ok(reminder.text.includes('Namaste Sharma Ji ji'));
  assert.ok(reminder.text.includes('₹8,500.00'));
  assert.ok(reminder.upiLink.startsWith('upi://pay?pa=agarwal@upi'));
  assert.ok(reminder.whatsappUrl.startsWith('https://wa.me/919812345678'));
});

test('GST logic detects state codes and handles intra vs inter-state tax distribution', () => {
  const delhiState = getStateFromGSTIN('07AAAAA0000A1Z5');
  assert.equal(delhiState?.code, '07');
  assert.equal(delhiState?.name, 'Delhi');

  const maharashtraState = getStateFromGSTIN('27BBBBB1111B2Z6');
  assert.equal(maharashtraState?.code, '27');
  assert.equal(maharashtraState?.name, 'Maharashtra');

  // Intra-state (Delhi to Delhi)
  assert.equal(isInterStateSupply('07AAAAA0000A1Z5', '07CCCC2222C1Z8'), false);
  const intraTax = calculateItemTaxes(1000, 18, false);
  assert.equal(intraTax.cgst, 90);
  assert.equal(intraTax.sgst, 90);
  assert.equal(intraTax.igst, 0);
  assert.equal(intraTax.totalTax, 180);

  // Inter-state (Delhi to Maharashtra)
  assert.equal(isInterStateSupply('07AAAAA0000A1Z5', '27BBBBB1111B2Z6'), true);
  const interTax = calculateItemTaxes(1000, 18, true);
  assert.equal(interTax.cgst, 0);
  assert.equal(interTax.sgst, 0);
  assert.equal(interTax.igst, 180);
  assert.equal(interTax.totalTax, 180);
});

test('calculateInvoiceTotals calculates multi-item tax summaries correctly', () => {
  const items: DocumentItem[] = [
    {
      id: 'i1',
      description: 'Basmati Rice 25kg bag',
      hsn: '1006',
      quantity: 10,
      unit: 'Bags',
      rate: 1500,
      amount: 15000,
      gstRate: 5,
      cgstAmount: 375,
      sgstAmount: 375,
      igstAmount: 0,
      total: 15750
    },
    {
      id: 'i2',
      description: 'Refined Mustard Oil 15L tin',
      hsn: '1514',
      quantity: 5,
      unit: 'Tins',
      rate: 2000,
      amount: 10000,
      gstRate: 5,
      cgstAmount: 250,
      sgstAmount: 250,
      igstAmount: 0,
      total: 10500
    }
  ];

  const totals = calculateInvoiceTotals(items, false);
  assert.equal(totals.taxableTotal, 25000);
  assert.equal(totals.cgstTotal, 625);
  assert.equal(totals.sgstTotal, 625);
  assert.equal(totals.igstTotal, 0);
  assert.equal(totals.totalTax, 1250);
  assert.equal(totals.grandTotal, 26250);
  assert.equal(totals.rateWiseBreakdown.length, 1);
  assert.equal(totals.rateWiseBreakdown[0].rate, 5);
});

import { calculateNextDueDate, isEntryDue, createLedgerEntryFromRecurring, calculateUpcomingRecurringCommitments } from './recurringCalculations';
import { RecurringEntry } from '../types';

test('calculateNextDueDate correctly increments dates for monthly and quarterly frequencies', () => {
  assert.equal(calculateNextDueDate('2026-10-01', 'MONTHLY'), '2026-11-01');
  assert.equal(calculateNextDueDate('2026-10-01', 'QUARTERLY'), '2027-01-01');
  assert.equal(calculateNextDueDate('2026-10-01', 'WEEKLY'), '2026-10-08');
});

test('isEntryDue identifies past or current due dates correctly', () => {
  const today = new Date('2026-10-30T10:00:00Z');
  assert.equal(isEntryDue('2026-10-25', today), true);
  assert.equal(isEntryDue('2026-10-30', today), true);
  assert.equal(isEntryDue('2026-11-05', today), false);
});

test('createLedgerEntryFromRecurring converts recurring schedule to balanced ledger entry', () => {
  const recurring: RecurringEntry = {
    id: 'rec-1',
    title: 'Shop Rent - Chandni Chowk',
    partyName: 'Khari Baoli Properties',
    amount: 15000,
    type: 'UDHAR',
    paymentMode: 'NEFT_RTGS',
    frequency: 'MONTHLY',
    dayOfMonth: 1,
    startDate: '2026-01-01',
    nextDueDate: '2026-11-01',
    status: 'ACTIVE',
    category: 'RENT',
    autoPost: true
  };

  const entry = createLedgerEntryFromRecurring(recurring, '2026-11-01');
  assert.equal(entry.partyName, 'Khari Baoli Properties');
  assert.equal(entry.amount, 15000);
  assert.equal(entry.type, 'UDHAR');
  assert.ok(entry.description.includes('Shop Rent'));
});

test('calculateUpcomingRecurringCommitments aggregates commitments due within specified window', () => {
  const items: RecurringEntry[] = [
    {
      id: 'r1',
      title: 'Tally Cloud License',
      partyName: 'Tally Solutions',
      amount: 2500,
      type: 'UDHAR',
      paymentMode: 'UPI',
      frequency: 'MONTHLY',
      dayOfMonth: 5,
      startDate: '2026-01-01',
      nextDueDate: '2026-11-05',
      status: 'ACTIVE',
      category: 'SUBSCRIPTION',
      autoPost: true
    },
    {
      id: 'r2',
      title: 'Monthly Wholesaler Retainer',
      partyName: 'Gupta Wholesalers',
      amount: 10000,
      type: 'UDHAR',
      paymentMode: 'NEFT_RTGS',
      frequency: 'MONTHLY',
      dayOfMonth: 10,
      startDate: '2026-01-01',
      nextDueDate: '2026-11-10',
      status: 'ACTIVE',
      category: 'SUPPLIER_RETAINER',
      autoPost: false
    },
    {
      id: 'r3',
      title: 'Annual Fire Insurance',
      partyName: 'ICICI Lombard',
      amount: 18000,
      type: 'UDHAR',
      paymentMode: 'NEFT_RTGS',
      frequency: 'ANNUALLY',
      dayOfMonth: 1,
      startDate: '2026-01-01',
      nextDueDate: '2027-04-01', // Out of 30-day window
      status: 'ACTIVE',
      category: 'OTHER',
      autoPost: false
    }
  ];

  const ref = new Date('2026-10-30');
  const summary = calculateUpcomingRecurringCommitments(items, 30, ref);
  assert.equal(summary.dueItems.length, 2);
  assert.equal(summary.totalPayable, 12500);
});

import { filterLedgerEntries } from './ledgerSearch';

test('filterLedgerEntries correctly filters by description, amount, date range and mode', () => {
  const sampleEntries: LedgerEntry[] = [
    {
      id: 'e1',
      partyId: 'p1',
      partyName: 'Sharma General Store',
      date: '2026-10-18',
      type: 'UDHAR',
      amount: 14500,
      paymentMode: 'CREDIT',
      billNumber: 'INV/2026/089',
      description: 'Sale of Pulses & Basmati Rice 10 bags',
      createdAt: '2026-10-18T10:00:00Z'
    },
    {
      id: 'e2',
      partyId: 'p1',
      partyName: 'Sharma General Store',
      date: '2026-10-25',
      type: 'JAMA',
      amount: 8500,
      paymentMode: 'UPI',
      billNumber: 'UPI/6299102488',
      description: 'Received partial payment via PhonePe UPI',
      createdAt: '2026-10-25T14:00:00Z'
    },
    {
      id: 'e3',
      partyId: 'p1',
      partyName: 'Sharma General Store',
      date: '2026-10-29',
      type: 'UDHAR',
      amount: 4500,
      paymentMode: 'CASH',
      billNumber: 'BILL-441',
      description: '5 Bags Wheat Atta',
      createdAt: '2026-10-29T16:00:00Z'
    }
  ];

  // 1. Text Search (description)
  const descResults = filterLedgerEntries(sampleEntries, { searchQuery: 'basmati' });
  assert.equal(descResults.length, 1);
  assert.equal(descResults[0].id, 'e1');

  // 2. Bill number search
  const billResults = filterLedgerEntries(sampleEntries, { searchQuery: 'UPI/6299' });
  assert.equal(billResults.length, 1);
  assert.equal(billResults[0].id, 'e2');

  // 3. Amount filtering (min/max)
  const amountRangeResults = filterLedgerEntries(sampleEntries, { minAmount: 5000, maxAmount: 10000 });
  assert.equal(amountRangeResults.length, 1);
  assert.equal(amountRangeResults[0].amount, 8500);

  // 4. Exact amount filter
  const exactResults = filterLedgerEntries(sampleEntries, { exactAmount: 4500 });
  assert.equal(exactResults.length, 1);
  assert.equal(exactResults[0].id, 'e3');

  // 5. Date range filter
  const dateRangeResults = filterLedgerEntries(sampleEntries, { startDate: '2026-10-20', endDate: '2026-10-28' });
  assert.equal(dateRangeResults.length, 1);
  assert.equal(dateRangeResults[0].id, 'e2');

  // 6. Type filter (JAMA only)
  const jamaResults = filterLedgerEntries(sampleEntries, { type: 'JAMA' });
  assert.equal(jamaResults.length, 1);
  assert.equal(jamaResults[0].type, 'JAMA');
});
