/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const DEFAULT_USER_PROFILE = {
  id: 'usr-1',
  name: 'Deepak Sharma',
  email: 'deelipchatter3@gmail.com',
  businessName: 'Bharat Trading Co.',
  gstin: '07AABCB9001A1Z2',
  phone: '+91 98112 23344',
  panNumber: 'AABCB9001A',
  address: 'Shop 42, Khari Baoli Spice Market, Chandni Chowk, Delhi - 110006',
  upiVpa: 'bharattrading@okhdfcbank',
  bankName: 'HDFC Bank - Chandni Chowk Branch',
  accountNumber: '50200019283741',
  ifscCode: 'HDFC0000034',
  role: 'Managing Partner / Admin',
  planName: 'Tally Enterprise Pro Plan',
  renewalDate: '2027-10-31'
};

export const SAMPLE_RECURRING_ENTRIES = [
  {
    id: 'rec-1',
    title: 'Market Godown & Shop Rent',
    partyName: 'Khari Baoli Properties',
    amount: 35000,
    type: 'UDHAR',
    paymentMode: 'NEFT_RTGS',
    frequency: 'MONTHLY',
    dayOfMonth: 1,
    startDate: '2026-01-01',
    nextDueDate: '2026-11-01',
    status: 'ACTIVE',
    category: 'RENT',
    autoPost: true,
    notes: 'Shop #42 and Back Godown monthly lease payment'
  },
  {
    id: 'rec-2',
    title: 'Tally Prime Cloud Multi-User License',
    partyName: 'Tally Solutions India',
    amount: 1800,
    type: 'UDHAR',
    paymentMode: 'UPI',
    frequency: 'MONTHLY',
    dayOfMonth: 5,
    startDate: '2026-02-05',
    nextDueDate: '2026-11-05',
    status: 'ACTIVE',
    category: 'SUBSCRIPTION',
    autoPost: true,
    notes: 'Subscription for 3 accountant terminals & remote access'
  },
  {
    id: 'rec-3',
    title: 'Munimji & Gaddi Counter Honorarium',
    partyName: 'Staff & Munimji Accounts',
    amount: 45000,
    type: 'UDHAR',
    paymentMode: 'NEFT_RTGS',
    frequency: 'MONTHLY',
    dayOfMonth: 7,
    startDate: '2026-01-07',
    nextDueDate: '2026-11-07',
    status: 'ACTIVE',
    category: 'SALARY',
    autoPost: false,
    notes: 'Monthly bookkeeping salary and store assistant wages'
  },
  {
    id: 'rec-4',
    title: 'Airtel Broadband & Cloud Backup',
    partyName: 'Airtel Business Services',
    amount: 1499,
    type: 'UDHAR',
    paymentMode: 'UPI',
    frequency: 'MONTHLY',
    dayOfMonth: 12,
    startDate: '2026-03-12',
    nextDueDate: '2026-11-12',
    status: 'ACTIVE',
    category: 'UTILITY',
    autoPost: true,
    notes: '300 Mbps Fiber connection for real-time Tally sync'
  },
  {
    id: 'rec-5',
    title: 'Monthly Retailer Subscription Retainer',
    partyId: 'p-1',
    partyName: 'Sharma General Store',
    amount: 5000,
    type: 'JAMA',
    paymentMode: 'UPI',
    frequency: 'MONTHLY',
    dayOfMonth: 10,
    startDate: '2026-04-10',
    nextDueDate: '2026-11-10',
    status: 'ACTIVE',
    category: 'SUPPLIER_RETAINER',
    autoPost: false,
    notes: 'Fixed monthly wholesale advance deposit for pulses supply'
  }
];

export const SAMPLE_PARTIES = [
  {
    id: 'p-1',
    name: 'Sharma General Store',
    phone: '9811223344',
    email: 'sharma.store.delhi@gmail.com',
    gstin: '07AABCS1429B1Z4',
    state: 'Delhi',
    stateCode: '07',
    address: 'Shop No. 14, Main Market, Karol Bagh, New Delhi - 110005',
    category: 'CUSTOMER',
    creditLimit: 50000,
    openingBalance: 12500,
    interestRatePerMonth: 1.5
  },
  {
    id: 'p-2',
    name: 'Gupta Traders & Wholesalers',
    phone: '9822334455',
    email: 'orders@guptatraders.in',
    gstin: '07BBBPG4412K1Z9',
    state: 'Delhi',
    stateCode: '07',
    address: '42 Khari Baoli, Chandni Chowk, Old Delhi - 110006',
    category: 'SUPPLIER',
    creditLimit: 200000,
    openingBalance: -35000,
    interestRatePerMonth: 1.0
  },
  {
    id: 'p-3',
    name: 'Shri Ganesh Steels & Hardware',
    phone: '9833445566',
    email: 'ganeshsteel.up@gmail.com',
    gstin: '09AABCG8921N1Z1',
    state: 'Uttar Pradesh',
    stateCode: '09',
    address: 'Plot 88, Loha Mandi, Bulandshahr Road, Ghaziabad, UP - 201001',
    category: 'SUPPLIER',
    creditLimit: 300000,
    openingBalance: -48000,
    interestRatePerMonth: 1.5
  },
  {
    id: 'p-4',
    name: 'Ramesh Kirana Mandir',
    phone: '9844556677',
    state: 'Delhi',
    stateCode: '07',
    address: 'Block 4, Gali No. 2, Tilak Nagar, New Delhi - 110018',
    category: 'CUSTOMER',
    creditLimit: 25000,
    openingBalance: 4200,
    interestRatePerMonth: 2.0
  },
  {
    id: 'p-5',
    name: 'Laxmi Handloom & Textiles',
    phone: '9855667788',
    email: 'accounts@laxmitexsurat.com',
    gstin: '24AAGCL3320M1ZT',
    state: 'Gujarat',
    stateCode: '24',
    address: 'Millenium Textile Market, Ring Road, Surat, Gujarat - 395002',
    category: 'SUPPLIER',
    creditLimit: 250000,
    openingBalance: -72000,
    interestRatePerMonth: 1.25
  },
  {
    id: 'p-6',
    name: 'Patel Provisions',
    phone: '9866778899',
    gstin: '07AAPCP9901F1Z8',
    state: 'Delhi',
    stateCode: '07',
    address: 'C-12, Sector 7, Rohini, New Delhi - 110085',
    category: 'CUSTOMER',
    creditLimit: 40000,
    openingBalance: 8900,
    interestRatePerMonth: 1.5
  }
];

export const SAMPLE_LEDGER_ENTRIES = [
  {
    id: 'le-1',
    partyId: 'p-1',
    partyName: 'Sharma General Store',
    date: '2026-10-18',
    type: 'UDHAR',
    amount: 14500,
    paymentMode: 'CREDIT',
    billNumber: 'INV/2026/089',
    description: 'Sale of Pulses & Basmati Rice 10 bags',
    notes: 'Agreed 15 days credit period',
    createdAt: '2026-10-18T10:30:00Z'
  },
  {
    id: 'le-2',
    partyId: 'p-1',
    partyName: 'Sharma General Store',
    date: '2026-10-25',
    type: 'JAMA',
    amount: 8500,
    paymentMode: 'UPI',
    billNumber: 'UPI/6299102488',
    description: 'Received partial payment via PhonePe UPI',
    notes: 'Reference ID: UPI-99882211',
    createdAt: '2026-10-25T14:15:00Z'
  },
  {
    id: 'le-3',
    partyId: 'p-2',
    partyName: 'Gupta Traders & Wholesalers',
    date: '2026-10-15',
    type: 'JAMA',
    amount: 25000,
    paymentMode: 'NEFT_RTGS',
    billNumber: 'HDFC-RTGS-7811',
    description: 'Paid against invoice GT/26-27/449',
    createdAt: '2026-10-15T11:00:00Z'
  },
  {
    id: 'le-4',
    partyId: 'p-2',
    partyName: 'Gupta Traders & Wholesalers',
    date: '2026-10-22',
    type: 'UDHAR',
    amount: 42000,
    paymentMode: 'CREDIT',
    billNumber: 'GT/26-27/512',
    description: 'Fresh stock purchase: Refined Oil & Spices',
    createdAt: '2026-10-22T16:20:00Z'
  },
  {
    id: 'le-5',
    partyId: 'p-4',
    partyName: 'Ramesh Kirana Mandir',
    date: '2026-10-24',
    type: 'UDHAR',
    amount: 5600,
    paymentMode: 'CREDIT',
    billNumber: 'PARCHI-104',
    description: 'Daily Kirana stock: Mustard oil, Sugar, Tea bags',
    notes: 'Handwritten parchi entry',
    createdAt: '2026-10-24T09:40:00Z'
  },
  {
    id: 'le-6',
    partyId: 'p-4',
    partyName: 'Ramesh Kirana Mandir',
    date: '2026-10-29',
    type: 'JAMA',
    amount: 3000,
    paymentMode: 'CASH',
    description: 'Cash received at gaddi (counter)',
    createdAt: '2026-10-29T19:00:00Z'
  },
  {
    id: 'le-7',
    partyId: 'p-6',
    partyName: 'Patel Provisions',
    date: '2026-10-20',
    type: 'UDHAR',
    amount: 11200,
    paymentMode: 'CREDIT',
    billNumber: 'INV/2026/094',
    description: 'Wheat Flour (Atta) 40 bags & Poha',
    createdAt: '2026-10-20T11:10:00Z'
  }
];

export const SAMPLE_DOCUMENTS = [
  {
    id: 'doc-1',
    title: 'Delhi Mandi GST Tax Invoice #DL-INV-8821',
    docType: 'GST_TAX_INVOICE',
    invoiceNumber: 'DL-INV-8821',
    date: '2026-10-26',
    partyName: 'Gupta Traders & Wholesalers',
    partyGSTIN: '07BBBPG4412K1Z9',
    supplierGSTIN: '07AABCB9001A1Z2',
    subtotal: 48000,
    cgstTotal: 1200,
    sgstTotal: 1200,
    igstTotal: 0,
    roundOff: 0,
    grandTotal: 50400,
    confidenceScore: 0.98,
    status: 'EXTRACTED',
    notes: 'B2B GST Tax invoice from Khari Baoli. Eligible for 100% ITC (Input Tax Credit).',
    items: [
      {
        id: 'di-1',
        description: 'Super Royal Basmati Rice (25kg Bag)',
        hsn: '1006',
        quantity: 20,
        unit: 'Bags',
        rate: 1600,
        amount: 32000,
        gstRate: 5,
        cgstAmount: 800,
        sgstAmount: 800,
        igstAmount: 0,
        total: 33600
      },
      {
        id: 'di-2',
        description: 'Desi Toor Dal Unpolished (30kg Bag)',
        hsn: '0713',
        quantity: 5,
        unit: 'Bags',
        rate: 3200,
        amount: 16000,
        gstRate: 5,
        cgstAmount: 400,
        sgstAmount: 400,
        igstAmount: 0,
        total: 16800
      }
    ]
  },
  {
    id: 'doc-2',
    title: 'Kacha Parchi (कच्ची पर्ची) #KP-042 - Mandi Counter',
    docType: 'KACHA_PARCHI',
    invoiceNumber: 'KP-042',
    date: '2026-10-28',
    partyName: 'Sharma General Store',
    subtotal: 12850,
    cgstTotal: 0,
    sgstTotal: 0,
    igstTotal: 0,
    roundOff: 0,
    grandTotal: 12850,
    confidenceScore: 0.92,
    status: 'SYNCED_TO_BAHI',
    notes: 'Traditional handwritten counter slip in Hindi/Hinglish. Udhar marked with red stamp.',
    items: [
      {
        id: 'di-3',
        description: 'Fortune Mustard Oil 15L Tin',
        hsn: '1514',
        quantity: 3,
        unit: 'Tins',
        rate: 2150,
        amount: 6450,
        gstRate: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,
        total: 6450
      },
      {
        id: 'di-4',
        description: 'Madhur Sugar M-30 (50kg Bag)',
        hsn: '1701',
        quantity: 2,
        unit: 'Bags',
        rate: 2200,
        amount: 4400,
        gstRate: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,
        total: 4400
      },
      {
        id: 'di-5',
        description: 'Tata Tea Gold (1kg x 4 Pkts)',
        hsn: '0902',
        quantity: 4,
        unit: 'Pkts',
        rate: 500,
        amount: 2000,
        gstRate: 0,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 0,
        total: 2000
      }
    ]
  },
  {
    id: 'doc-3',
    title: 'Interstate Tax Invoice #GS/26/902 - Steel & Wire',
    docType: 'GST_TAX_INVOICE',
    invoiceNumber: 'GS/26/902',
    date: '2026-10-22',
    partyName: 'Shri Ganesh Steels & Hardware',
    partyGSTIN: '09AABCG8921N1Z1',
    supplierGSTIN: '07AABCB9001A1Z2',
    subtotal: 65000,
    cgstTotal: 0,
    sgstTotal: 0,
    igstTotal: 11700,
    roundOff: 0,
    grandTotal: 76700,
    confidenceScore: 0.99,
    status: 'EXPORTED_TO_TALLY',
    notes: 'Interstate supply from Ghaziabad UP to Delhi. 18% IGST charged. E-way bill #381029481944 generated.',
    items: [
      {
        id: 'di-6',
        description: 'Fe550D TMT Steel Bars 12mm (1 Metric Ton)',
        hsn: '7214',
        quantity: 1,
        unit: 'MT',
        rate: 52000,
        amount: 52000,
        gstRate: 18,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 9360,
        total: 61360
      },
      {
        id: 'di-7',
        description: 'Galvanized GI Binding Wire (20 Bundles)',
        hsn: '7217',
        quantity: 20,
        unit: 'Bundles',
        rate: 650,
        amount: 13000,
        gstRate: 18,
        cgstAmount: 0,
        sgstAmount: 0,
        igstAmount: 2340,
        total: 15340
      }
    ]
  },
  {
    id: 'doc-4',
    title: 'Agarwal Transport Logistics Bilty (LR) #LR-7719',
    docType: 'TRANSPORT_BILTY',
    invoiceNumber: 'LR-7719',
    date: '2026-10-24',
    partyName: 'Patel Provisions',
    partyGSTIN: '07AAPCP9901F1Z8',
    subtotal: 3500,
    cgstTotal: 87.5,
    sgstTotal: 87.5,
    igstTotal: 0,
    roundOff: 0,
    grandTotal: 3675,
    confidenceScore: 0.94,
    status: 'EXTRACTED',
    notes: 'Consignment lorry receipt. 40 bags Atta dispatched from Narela Godown to Rohini outlet.',
    items: [
      {
        id: 'di-8',
        description: 'Freight Charges - 40 Bags Atta (Truck DL-1L-8822)',
        hsn: '9965',
        quantity: 40,
        unit: 'Bags',
        rate: 87.5,
        amount: 3500,
        gstRate: 5,
        cgstAmount: 87.5,
        sgstAmount: 87.5,
        igstAmount: 0,
        total: 3675
      }
    ]
  }
];

export const SAMPLE_TALLY_VOUCHERS = [
  {
    id: 'tv-1',
    voucherNumber: 'SALES/26-27/001',
    voucherType: 'Sales',
    date: '2026-10-18',
    partyLedgerName: 'Sharma General Store',
    contraLedgerName: 'Sales GST 5%',
    amount: 14500,
    narration: 'Being goods sold to Sharma General Store as per Bill INV/2026/089',
    referenceNumber: 'INV/2026/089',
    ledgerEntries: [
      { ledgerName: 'Sharma General Store', isDeemedPositive: true, amount: 14500 },
      { ledgerName: 'Sales GST 5%', isDeemedPositive: false, amount: 13809.52 },
      { ledgerName: 'Output CGST 2.5%', isDeemedPositive: false, amount: 345.24 },
      { ledgerName: 'Output SGST 2.5%', isDeemedPositive: false, amount: 345.24 }
    ]
  },
  {
    id: 'tv-2',
    voucherNumber: 'RCPT/26-27/001',
    voucherType: 'Receipt',
    date: '2026-10-25',
    partyLedgerName: 'Sharma General Store',
    contraLedgerName: 'HDFC Bank Current A/c',
    amount: 8500,
    narration: 'Being UPI payment received from Sharma General Store (PhonePe Ref #6299102488)',
    referenceNumber: 'UPI/6299102488',
    ledgerEntries: [
      { ledgerName: 'HDFC Bank Current A/c', isDeemedPositive: true, amount: 8500 },
      { ledgerName: 'Sharma General Store', isDeemedPositive: false, amount: 8500 }
    ]
  },
  {
    id: 'tv-3',
    voucherNumber: 'PUR/26-27/002',
    voucherType: 'Purchase',
    date: '2026-10-22',
    partyLedgerName: 'Shri Ganesh Steels & Hardware',
    contraLedgerName: 'Purchase GST 18%',
    amount: 76700,
    narration: 'Being TMT steel bars & wire purchased vide inv GS/26/902 with 18% IGST',
    referenceNumber: 'GS/26/902',
    ledgerEntries: [
      { ledgerName: 'Purchase GST 18%', isDeemedPositive: true, amount: 65000 },
      { ledgerName: 'Input IGST 18%', isDeemedPositive: true, amount: 11700 },
      { ledgerName: 'Shri Ganesh Steels & Hardware', isDeemedPositive: false, amount: 76700 }
    ]
  },
  {
    id: 'tv-4',
    voucherNumber: 'PMT/26-27/001',
    voucherType: 'Payment',
    date: '2026-10-15',
    partyLedgerName: 'Gupta Traders & Wholesalers',
    contraLedgerName: 'HDFC Bank Current A/c',
    amount: 25000,
    narration: 'Being RTGS payment made to Gupta Traders against old balance',
    referenceNumber: 'HDFC-RTGS-7811',
    ledgerEntries: [
      { ledgerName: 'Gupta Traders & Wholesalers', isDeemedPositive: true, amount: 25000 },
      { ledgerName: 'HDFC Bank Current A/c', isDeemedPositive: false, amount: 25000 }
    ]
  }
];
