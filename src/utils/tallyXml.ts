/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TallyVoucher } from '../types';

export function escapeXml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function formatTallyDate(dateStr: string): string {
  // Format as YYYYMMDD (Tally standard)
  const cleaned = dateStr.replace(/[^0-9]/g, '');
  if (cleaned.length === 8) return cleaned;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}${mm}${dd}`;
  }
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}${mm}${dd}`;
}

/**
 * Generate official Tally XML Daybook / Voucher export format
 * Compatible with Tally 9, Tally.ERP 9, and TallyPrime
 */
export function generateTallyXml(vouchers: TallyVoucher[], companyName = 'My SME Enterprises'): string {
  let xml = `<?xml version="1.0" encoding="utf-8"?>\n`;
  xml += `<ENVELOPE>\n`;
  xml += `  <HEADER>\n`;
  xml += `    <TALLYREQUEST>Import Data</TALLYREQUEST>\n`;
  xml += `  </HEADER>\n`;
  xml += `  <BODY>\n`;
  xml += `    <IMPORTDATA>\n`;
  xml += `      <REQUESTDESC>\n`;
  xml += `        <REPORTNAME>Vouchers</REPORTNAME>\n`;
  xml += `        <STATICVARIABLES>\n`;
  xml += `          <SVCURRENTCOMPANY>${escapeXml(companyName)}</SVCURRENTCOMPANY>\n`;
  xml += `        </STATICVARIABLES>\n`;
  xml += `      </REQUESTDESC>\n`;
  xml += `      <REQUESTDATA>\n`;

  for (const v of vouchers) {
    const tallyDate = formatTallyDate(v.date);
    xml += `        <TALLYMESSAGE xmlns:UDF="TallyUDF">\n`;
    xml += `          <VOUCHER VCHTYPE="${escapeXml(v.voucherType)}" ACTION="Create" OBJVIEW="Accounting Voucher View">\n`;
    xml += `            <DATE>${tallyDate}</DATE>\n`;
    xml += `            <EFFECTIVEDATE>${tallyDate}</EFFECTIVEDATE>\n`;
    xml += `            <VOUCHERTYPENAME>${escapeXml(v.voucherType)}</VOUCHERTYPENAME>\n`;
    xml += `            <VOUCHERNUMBER>${escapeXml(v.voucherNumber)}</VOUCHERNUMBER>\n`;
    xml += `            <PARTYLEDGERNAME>${escapeXml(v.partyLedgerName)}</PARTYLEDGERNAME>\n`;
    xml += `            <NARRATION>${escapeXml(v.narration || '')}</NARRATION>\n`;
    if (v.referenceNumber) {
      xml += `            <REFERENCE>${escapeXml(v.referenceNumber)}</REFERENCE>\n`;
    }

    for (const entry of v.ledgerEntries) {
      xml += `            <ALLLEDGERENTRIES.LIST>\n`;
      xml += `              <LEDGERNAME>${escapeXml(entry.ledgerName)}</LEDGERNAME>\n`;
      xml += `              <ISDEEMEDPOSITIVE>${entry.isDeemedPositive ? 'Yes' : 'No'}</ISDEEMEDPOSITIVE>\n`;
      // In Tally XML, negative amount represents Credit if isDeemedPositive is No
      const signedAmount = entry.isDeemedPositive ? -Math.abs(entry.amount) : Math.abs(entry.amount);
      xml += `              <AMOUNT>${signedAmount.toFixed(2)}</AMOUNT>\n`;
      xml += `            </ALLLEDGERENTRIES.LIST>\n`;
    }

    xml += `          </VOUCHER>\n`;
    xml += `        </TALLYMESSAGE>\n`;
  }

  xml += `      </REQUESTDATA>\n`;
  xml += `    </IMPORTDATA>\n`;
  xml += `  </BODY>\n`;
  xml += `</ENVELOPE>`;

  return xml;
}

/**
 * Validates whether a voucher's debits equal credits
 */
export function validateVoucherBalance(voucher: TallyVoucher): { isValid: boolean; difference: number } {
  let debitSum = 0;
  let creditSum = 0;

  for (const e of voucher.ledgerEntries) {
    if (e.isDeemedPositive) {
      debitSum += Math.abs(e.amount);
    } else {
      creditSum += Math.abs(e.amount);
    }
  }

  const diff = Math.abs(debitSum - creditSum);
  return {
    isValid: diff < 0.05,
    difference: diff
  };
}
