/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DocumentItem } from '../types';

export const INDIAN_STATE_CODES: Record<string, string> = {
  '01': 'Jammu & Kashmir',
  '02': 'Himachal Pradesh',
  '03': 'Punjab',
  '04': 'Chandigarh',
  '05': 'Uttarakhand',
  '06': 'Haryana',
  '07': 'Delhi',
  '08': 'Rajasthan',
  '09': 'Uttar Pradesh',
  '10': 'Bihar',
  '11': 'Sikkim',
  '12': 'Arunachal Pradesh',
  '18': 'Assam',
  '19': 'West Bengal',
  '20': 'Jharkhand',
  '21': 'Odisha',
  '22': 'Chhattisgarh',
  '23': 'Madhya Pradesh',
  '24': 'Gujarat',
  '27': 'Maharashtra',
  '29': 'Karnataka',
  '30': 'Goa',
  '32': 'Kerala',
  '33': 'Tamil Nadu',
  '36': 'Telangana',
  '37': 'Andhra Pradesh'
};

export function getStateFromGSTIN(gstin?: string): { code: string; name: string } | null {
  if (!gstin || gstin.trim().length < 2) return null;
  const code = gstin.trim().substring(0, 2);
  const name = INDIAN_STATE_CODES[code] || 'Other State / UT';
  return { code, name };
}

export function isInterStateSupply(supplierGSTIN?: string, buyerGSTIN?: string): boolean {
  if (!supplierGSTIN || !buyerGSTIN) return false;
  const sCode = supplierGSTIN.trim().substring(0, 2);
  const bCode = buyerGSTIN.trim().substring(0, 2);
  return sCode !== bCode;
}

export function calculateItemTaxes(
  amount: number,
  gstRate: number,
  isInterState: boolean
): { cgst: number; sgst: number; igst: number; totalTax: number } {
  const totalTax = Math.round((amount * (gstRate / 100)) * 100) / 100;

  if (isInterState) {
    return {
      cgst: 0,
      sgst: 0,
      igst: totalTax,
      totalTax
    };
  } else {
    const halfTax = Math.round((totalTax / 2) * 100) / 100;
    return {
      cgst: halfTax,
      sgst: totalTax - halfTax,
      igst: 0,
      totalTax
    };
  }
}

export interface GSTBreakdownSummary {
  taxableTotal: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  totalTax: number;
  grandTotal: number;
  rateWiseBreakdown: {
    rate: number;
    taxable: number;
    cgst: number;
    sgst: number;
    igst: number;
  }[];
}

export function calculateInvoiceTotals(items: DocumentItem[], isInterState: boolean): GSTBreakdownSummary {
  let taxableTotal = 0;
  let cgstTotal = 0;
  let sgstTotal = 0;
  let igstTotal = 0;

  const rateMap = new Map<number, { taxable: number; cgst: number; sgst: number; igst: number }>();

  for (const item of items) {
    const taxes = calculateItemTaxes(item.amount, item.gstRate, isInterState);
    taxableTotal += item.amount;
    cgstTotal += taxes.cgst;
    sgstTotal += taxes.sgst;
    igstTotal += taxes.igst;

    const existing = rateMap.get(item.gstRate) || { taxable: 0, cgst: 0, sgst: 0, igst: 0 };
    existing.taxable += item.amount;
    existing.cgst += taxes.cgst;
    existing.sgst += taxes.sgst;
    existing.igst += taxes.igst;
    rateMap.set(item.gstRate, existing);
  }

  const rateWiseBreakdown = Array.from(rateMap.entries())
    .map(([rate, data]) => ({
      rate,
      taxable: Math.round(data.taxable * 100) / 100,
      cgst: Math.round(data.cgst * 100) / 100,
      sgst: Math.round(data.sgst * 100) / 100,
      igst: Math.round(data.igst * 100) / 100
    }))
    .sort((a, b) => a.rate - b.rate);

  const totalTax = cgstTotal + sgstTotal + igstTotal;
  const grandTotal = Math.round((taxableTotal + totalTax) * 100) / 100;

  return {
    taxableTotal: Math.round(taxableTotal * 100) / 100,
    cgstTotal: Math.round(cgstTotal * 100) / 100,
    sgstTotal: Math.round(sgstTotal * 100) / 100,
    igstTotal: Math.round(igstTotal * 100) / 100,
    totalTax: Math.round(totalTax * 100) / 100,
    grandTotal,
    rateWiseBreakdown
  };
}
