/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type TransactionType = 'UDHAR' | 'JAMA'; // Udhar = Debit (Lene Hain), Jama = Credit (Dene Hain)
export type PaymentMode = 'CASH' | 'UPI' | 'NEFT_RTGS' | 'CHEQUE' | 'CREDIT';
export type PartyCategory = 'CUSTOMER' | 'SUPPLIER' | 'RETAILER' | 'DISTRIBUTOR';

export interface LedgerEntry {
  id: string;
  partyId: string;
  partyName: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  amount: number;
  paymentMode: PaymentMode;
  billNumber?: string;
  description: string;
  notes?: string;
  tallyVoucherId?: string;
  documentId?: string;
  createdAt: string;
}

export interface Party {
  id: string;
  name: string;
  phone: string;
  email?: string;
  gstin?: string;
  state: string;
  stateCode: string;
  address: string;
  category: PartyCategory;
  creditLimit?: number;
  openingBalance: number; // positive = to receive (Lene), negative = to pay (Dene)
  interestRatePerMonth?: number; // e.g. 1.5%
}

export interface DocumentItem {
  id: string;
  description: string;
  hsn: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  discountPercent?: number;
  gstRate: number; // e.g. 5, 12, 18, 28
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  total: number;
}

export type DocumentType = 
  | 'GST_TAX_INVOICE' 
  | 'KACHA_PARCHI' 
  | 'PURCHASE_BILL' 
  | 'TRANSPORT_BILTY' 
  | 'PAYMENT_RECEIPT' 
  | 'BANK_STATEMENT';

export interface DocumentRecord {
  id: string;
  title: string;
  docType: DocumentType;
  invoiceNumber: string;
  date: string;
  partyName: string;
  partyGSTIN?: string;
  supplierGSTIN?: string;
  items: DocumentItem[];
  subtotal: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  roundOff: number;
  grandTotal: number;
  status: 'EXTRACTED' | 'SYNCED_TO_BAHI' | 'EXPORTED_TO_TALLY';
  confidenceScore: number;
  rawText?: string;
  thumbnailUrl?: string;
  notes?: string;
}

export type TallyVoucherType = 'Sales' | 'Purchase' | 'Receipt' | 'Payment' | 'Journal' | 'Contra';

export interface TallyVoucher {
  id: string;
  voucherNumber: string;
  voucherType: TallyVoucherType;
  date: string; // YYYYMMDD or YYYY-MM-DD
  partyLedgerName: string;
  contraLedgerName: string;
  amount: number;
  narration: string;
  referenceNumber?: string;
  gstRegistrationType?: 'Regular' | 'Composition' | 'Unregistered';
  ledgerEntries: {
    ledgerName: string;
    isDeemedPositive: boolean; // true for Debit, false for Credit
    amount: number;
  }[];
}

export type RecurringFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ANNUALLY';
export type RecurringCategory = 'RENT' | 'SALARY' | 'SUBSCRIPTION' | 'UTILITY' | 'SUPPLIER_RETAINER' | 'LOAN_EMI' | 'OTHER';

export interface RecurringEntry {
  id: string;
  title: string;
  partyId?: string;
  partyName: string;
  amount: number;
  type: TransactionType; // UDHAR = Debit (Payment/Expense), JAMA = Credit (Receipt)
  paymentMode: PaymentMode;
  frequency: RecurringFrequency;
  dayOfMonth: number;
  startDate: string;
  endDate?: string;
  nextDueDate: string;
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED';
  category: RecurringCategory;
  autoPost: boolean;
  lastPostedDate?: string;
  notes?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  businessName: string;
  gstin: string;
  phone: string;
  panNumber: string;
  address: string;
  upiVpa: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  role: string;
  planName: string;
  renewalDate: string;
}

export interface RAGMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  citations?: {
    type: 'INVOICE' | 'LEDGER_ENTRY' | 'PARTY';
    title: string;
    detail: string;
    id: string;
  }[];
  suggestedActions?: {
    label: string;
    actionType: 'VIEW_PARTY' | 'WHATSAPP_REMINDER' | 'VIEW_TALLY' | 'VIEW_DOC';
    payload: string;
  }[];
}

export type ActiveTab =
  | 'dashboard'
  | 'bahi-khata'
  | 'tally-bridge'
  | 'document-intel'
  | 'rag-assistant'
  | 'reports'
  | 'profile';
