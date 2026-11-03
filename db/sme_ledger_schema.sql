-- =====================================================================
-- BahiKhata SME Double-Entry Accounting Database Schema (PostgreSQL/SQLite)
-- Supports Parties, Vouchers, Ledger Line Items, Invoices, Recurring Schedules,
-- Audit Logs, and Real-Time Financial Views (Daybook, Trial Balance, GST Summary)
-- =====================================================================

-- 1. Parties Master (Customers, Suppliers, Transporters, Employees)
CREATE TABLE IF NOT EXISTS parties (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('CUSTOMER', 'SUPPLIER', 'RETAILER', 'DISTRIBUTOR', 'TRANSPORTER', 'EMPLOYEE')),
    state VARCHAR(100) NOT NULL,
    state_code VARCHAR(2) NOT NULL,
    address TEXT,
    gstin VARCHAR(15),
    pan_number VARCHAR(10),
    opening_balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    credit_limit DECIMAL(15, 2) DEFAULT 100000.00,
    credit_days INTEGER DEFAULT 30,
    interest_rate_per_month DECIMAL(5, 2) DEFAULT 1.50,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'BLOCKED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_parties_phone ON parties(phone);
CREATE INDEX IF NOT EXISTS idx_parties_gstin ON parties(gstin);
CREATE INDEX IF NOT EXISTS idx_parties_category ON parties(category);

-- 2. Ledger Accounts Master (Assets, Liabilities, Incomes, Expenses, Equities)
CREATE TABLE IF NOT EXISTS ledger_accounts (
    id VARCHAR(64) PRIMARY KEY,
    party_id VARCHAR(64) REFERENCES parties(id) ON DELETE SET NULL,
    account_code VARCHAR(50) UNIQUE NOT NULL,
    account_name VARCHAR(255) NOT NULL,
    group_type VARCHAR(50) NOT NULL CHECK (group_type IN ('SUNDRY_DEBTORS', 'SUNDRY_CREDITORS', 'SALES', 'PURCHASE', 'BANK', 'CASH', 'DIRECT_EXPENSES', 'INDIRECT_EXPENSES', 'DUTIES_AND_TAXES')),
    currency VARCHAR(3) DEFAULT 'INR',
    opening_balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    is_tally_synced BOOLEAN DEFAULT FALSE,
    tally_guid VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Vouchers Header (Journal, Sales, Purchase, Receipt, Payment, Contra, Credit Note, Debit Note)
CREATE TABLE IF NOT EXISTS vouchers (
    id VARCHAR(64) PRIMARY KEY,
    voucher_number VARCHAR(100) NOT NULL,
    voucher_type VARCHAR(50) NOT NULL CHECK (voucher_type IN ('SALES', 'PURCHASE', 'RECEIPT', 'PAYMENT', 'JOURNAL', 'CONTRA', 'CREDIT_NOTE', 'DEBIT_NOTE')),
    voucher_date DATE NOT NULL,
    party_id VARCHAR(64) REFERENCES parties(id),
    total_amount DECIMAL(15, 2) NOT NULL,
    payment_mode VARCHAR(50) DEFAULT 'NEFT_RTGS' CHECK (payment_mode IN ('CASH', 'UPI', 'NEFT_RTGS', 'CHEQUE', 'CREDIT')),
    reference_number VARCHAR(100),
    narration TEXT,
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_id VARCHAR(64),
    tally_sync_status VARCHAR(20) DEFAULT 'PENDING' CHECK (tally_sync_status IN ('PENDING', 'SYNCED', 'FAILED', 'MANUAL')),
    tally_synced_at TIMESTAMP WITH TIME ZONE,
    created_by VARCHAR(100) DEFAULT 'admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vouchers_date ON vouchers(voucher_date);
CREATE INDEX IF NOT EXISTS idx_vouchers_party ON vouchers(party_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_type ON vouchers(voucher_type);

-- 4. Ledger Line Items (Double-Entry Balanced Transactions)
CREATE TABLE IF NOT EXISTS ledger_entries (
    id VARCHAR(64) PRIMARY KEY,
    voucher_id VARCHAR(64) NOT NULL REFERENCES vouchers(id) ON DELETE CASCADE,
    party_id VARCHAR(64) REFERENCES parties(id),
    account_id VARCHAR(64) REFERENCES ledger_accounts(id),
    entry_date DATE NOT NULL,
    entry_type VARCHAR(10) NOT NULL CHECK (entry_type IN ('DEBIT', 'CREDIT')),
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    description TEXT,
    bill_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_entries_party_date ON ledger_entries(party_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_entries_voucher ON ledger_entries(voucher_id);

-- 5. Recurring Entries & Fixed Subscriptions Master
CREATE TABLE IF NOT EXISTS recurring_schedules (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    party_id VARCHAR(64) REFERENCES parties(id) ON DELETE SET NULL,
    party_name VARCHAR(255) NOT NULL,
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0),
    type VARCHAR(10) NOT NULL CHECK (type IN ('UDHAR', 'JAMA')),
    payment_mode VARCHAR(50) NOT NULL DEFAULT 'NEFT_RTGS',
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('MONTHLY', 'QUARTERLY', 'YEARLY', 'WEEKLY')),
    category VARCHAR(50) NOT NULL CHECK (category IN ('RENT', 'SOFTWARE', 'SALARY', 'UTILITY', 'MAINTENANCE', 'INTEREST', 'INSURANCE', 'OTHER')),
    day_of_month INTEGER NOT NULL CHECK (day_of_month BETWEEN 1 AND 31),
    start_date DATE NOT NULL,
    end_date DATE,
    last_posted_date DATE,
    next_due_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'COMPLETED')),
    auto_post BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_recurring_due_date ON recurring_schedules(next_due_date, status);

-- 6. GST Invoices and Tax Line Details
CREATE TABLE IF NOT EXISTS gst_invoices (
    id VARCHAR(64) PRIMARY KEY,
    voucher_id VARCHAR(64) REFERENCES vouchers(id) ON DELETE SET NULL,
    party_id VARCHAR(64) REFERENCES parties(id),
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    invoice_date DATE NOT NULL,
    place_of_supply VARCHAR(100) NOT NULL,
    is_interstate BOOLEAN NOT NULL DEFAULT FALSE,
    taxable_value DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    cgst_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    sgst_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    igst_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    cess_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    total_tax DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    grand_total DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    hsn_summary JSONB,
    einvoice_irn VARCHAR(100),
    eway_bill_number VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Audit Trail and System Event Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    entity_name VARCHAR(50) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    previous_state JSONB,
    new_state JSONB,
    performed_by VARCHAR(100) NOT NULL DEFAULT 'system',
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================================
-- VIEWS: Real-time Ledger Balances, Daybook, and Passbook
-- =====================================================================

-- Party Passbook Summary View
CREATE OR REPLACE VIEW view_party_passbook_summary AS
SELECT
    p.id AS party_id,
    p.name AS party_name,
    p.phone AS party_phone,
    p.category,
    p.opening_balance,
    COALESCE(SUM(CASE WHEN le.entry_type = 'DEBIT' THEN le.amount ELSE 0 END), 0) AS total_udhar,
    COALESCE(SUM(CASE WHEN le.entry_type = 'CREDIT' THEN le.amount ELSE 0 END), 0) AS total_jama,
    (
        p.opening_balance +
        COALESCE(SUM(CASE WHEN le.entry_type = 'DEBIT' THEN le.amount ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN le.entry_type = 'CREDIT' THEN le.amount ELSE 0 END), 0)
    ) AS net_outstanding_balance,
    COUNT(le.id) AS total_entries_count,
    MAX(le.entry_date) AS last_transaction_date
FROM parties p
LEFT JOIN ledger_entries le ON p.id = le.party_id
GROUP BY p.id, p.name, p.phone, p.category, p.opening_balance;

-- Daily Daybook View
CREATE OR REPLACE VIEW view_sme_daybook AS
SELECT
    v.voucher_date,
    v.voucher_number,
    v.voucher_type,
    p.name AS party_name,
    v.total_amount,
    v.payment_mode,
    v.narration,
    v.tally_sync_status
FROM vouchers v
LEFT JOIN parties p ON v.party_id = p.id
ORDER BY v.voucher_date DESC, v.voucher_number DESC;
