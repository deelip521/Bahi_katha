/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LedgerEntry, Party } from '../types';

export function formatIndianCurrency(num: number): string {
  const isNegative = num < 0;
  const absNum = Math.abs(num);
  const parts = absNum.toFixed(2).split('.');
  let intPart = parts[0];
  const decPart = parts[1];

  // Indian numbering: last 3 digits, then groups of 2
  if (intPart.length > 3) {
    const lastThree = intPart.substring(intPart.length - 3);
    const otherNumbers = intPart.substring(0, intPart.length - 3);
    intPart = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  }

  return `${isNegative ? '-' : ''}₹${intPart}.${decPart}`;
}

export interface PartyBalanceSummary {
  partyId: string;
  partyName: string;
  totalUdhar: number; // Total given on credit (Lene)
  totalJama: number;  // Total received (Jama)
  netBalance: number; // positive = Lene Hain, negative = Dene Hain
  status: 'LENE_HAIN' | 'DENE_HAIN' | 'CHUKTA';
  lastTransactionDate?: string;
  daysSinceLastTx?: number;
  calculatedInterest?: number;
}

export function calculatePartyBalance(
  party: Party,
  entries: LedgerEntry[],
  asOfDate: Date = new Date()
): PartyBalanceSummary {
  const partyEntries = entries.filter((e) => e.partyId === party.id);
  
  let totalUdhar = party.openingBalance > 0 ? party.openingBalance : 0;
  let totalJama = party.openingBalance < 0 ? Math.abs(party.openingBalance) : 0;
  
  let lastDate: Date | null = null;

  for (const entry of partyEntries) {
    if (entry.type === 'UDHAR') {
      totalUdhar += entry.amount;
    } else {
      totalJama += entry.amount;
    }

    const d = new Date(entry.date);
    if (!lastDate || d > lastDate) {
      lastDate = d;
    }
  }

  const netBalance = totalUdhar - totalJama;
  let status: 'LENE_HAIN' | 'DENE_HAIN' | 'CHUKTA' = 'CHUKTA';
  if (netBalance > 0.5) {
    status = 'LENE_HAIN';
  } else if (netBalance < -0.5) {
    status = 'DENE_HAIN';
  }

  let daysSinceLastTx = 0;
  if (lastDate) {
    const diffMs = asOfDate.getTime() - lastDate.getTime();
    daysSinceLastTx = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  }

  // Interest calculation if configured and overdue > 30 days
  let calculatedInterest = 0;
  if (netBalance > 0 && party.interestRatePerMonth && daysSinceLastTx > 30) {
    const monthsOverdue = (daysSinceLastTx - 30) / 30;
    calculatedInterest = (netBalance * (party.interestRatePerMonth / 100)) * monthsOverdue;
  }

  return {
    partyId: party.id,
    partyName: party.name,
    totalUdhar,
    totalJama,
    netBalance,
    status,
    lastTransactionDate: lastDate ? lastDate.toISOString().split('T')[0] : undefined,
    daysSinceLastTx,
    calculatedInterest: Math.round(calculatedInterest * 100) / 100
  };
}

export function generateWhatsAppReminder(
  party: Party,
  balance: PartyBalanceSummary,
  merchantName: string = 'Bharat Trading Co.',
  upiVpa: string = 'bharattrading@okhdfcbank',
  language: 'hinglish' | 'hindi' | 'english' = 'hinglish'
): { text: string; whatsappUrl: string; upiLink: string } {
  const amountStr = formatIndianCurrency(Math.abs(balance.netBalance));
  const encodedPn = encodeURIComponent(merchantName);
  const upiLink = `upi://pay?pa=${upiVpa}&pn=${encodedPn}&am=${Math.abs(balance.netBalance).toFixed(2)}&cu=INR`;

  let message = '';
  if (language === 'hinglish') {
    message = `Namaste ${party.name} ji, aapke khate mein ${merchantName} ka kul baki hisab ${amountStr} hai. Kripya samay par bhuqtan karein.\n\nUPI dwara turant payment karne ke liye click karein:\n${upiLink}\n\nDhanyawad,\n${merchantName}`;
  } else if (language === 'hindi') {
    message = `नमस्ते ${party.name} जी, आपके खाते में ${merchantName} का कुल बाकी हिसाब ${amountStr} है। कृपया समय पर भुगतान करने का कष्ट करें।\n\nUPI द्वारा तुरंत भुगतान करें:\n${upiLink}\n\nधन्यवाद,\n${merchantName}`;
  } else {
    message = `Dear ${party.name}, gentle reminder that an outstanding balance of ${amountStr} is due towards ${merchantName}. Kindly clear the dues.\n\nPay immediately via UPI:\n${upiLink}\n\nThank you,\n${merchantName}`;
  }

  const cleanPhone = party.phone.replace(/[^0-9]/g, '');
  const internationalPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;
  const whatsappUrl = `https://wa.me/${internationalPhone}?text=${encodeURIComponent(message)}`;

  return {
    text: message,
    whatsappUrl,
    upiLink
  };
}
