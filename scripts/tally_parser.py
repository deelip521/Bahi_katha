#!/usr/bin/env python3
"""
BahiKhata Tally & GST Reconciliation CLI Engine
Processes TallyPrime XML exports, performs GST audit validation,
and generates ledger summaries for Indian MSMEs & SMEs.
"""

import sys
import os
import json
import xml.etree.ElementTree as ET
from decimal import Decimal
from typing import Dict, List, Any, Optional
from datetime import datetime

class TallyXmlParser:
    """Enterprise XML Parser for TallyPrime and Tally ERP 9 accounting data."""

    def __init__(self, xml_content: Optional[str] = None):
        self.xml_content = xml_content
        self.vouchers: List[Dict[str, Any]] = []
        self.ledgers: Dict[str, Dict[str, Any]] = {}

    def load_from_file(self, filepath: str) -> None:
        """Load and parse Tally XML file from filesystem."""
        if not os.path.exists(filepath):
            raise FileNotFoundError(f"Tally XML file not found: {filepath}")
        with open(filepath, 'r', encoding='utf-8') as f:
            self.xml_content = f.read()
        self.parse()

    def parse(self) -> List[Dict[str, Any]]:
        """Parse Tally XML vouchers into structured ledger records."""
        if not self.xml_content:
            return []

        try:
            root = ET.fromstring(self.xml_content)
        except ET.ParseError as err:
            sys.stderr.write(f"XML Parsing failed: {err}\n")
            return []

        self.vouchers = []
        # Support both standard Tally REQUESTDESC / TALLYMESSAGE envelopes
        voucher_nodes = root.findall(".//VOUCHER")
        for v in voucher_nodes:
            date_str = v.findtext("DATE", "")
            vch_type = v.findtext("VOUCHERTYPENAME", "Journal")
            vch_num = v.findtext("VOUCHERNUMBER", "")
            narration = v.findtext("NARRATION", "")
            party_name = v.findtext("PARTYLEDGERNAME", "")
            guid = v.findtext("GUID", "")

            ledger_entries = []
            for entry in v.findall(".//ALLLEDGERENTRIES.LIST"):
                led_name = entry.findtext("LEDGERNAME", "")
                amt_str = entry.findtext("AMOUNT", "0")
                is_deemed_positive = entry.findtext("ISDEEMEDPOSITIVE", "No").lower() == "yes"

                try:
                    amount = Decimal(amt_str)
                except Exception:
                    amount = Decimal(0)

                ledger_entries.append({
                    "ledger_name": led_name,
                    "amount": float(abs(amount)),
                    "type": "DEBIT" if amount < 0 or is_deemed_positive else "CREDIT"
                })

            self.vouchers.append({
                "guid": guid,
                "voucher_type": vch_type,
                "voucher_number": vch_num,
                "date": date_str,
                "party_name": party_name,
                "narration": narration,
                "entries": ledger_entries,
                "total_debit": sum(e["amount"] for e in ledger_entries if e["type"] == "DEBIT"),
                "total_credit": sum(e["amount"] for e in ledger_entries if e["type"] == "CREDIT"),
            })

        return self.vouchers

    def validate_double_entry(self) -> Dict[str, Any]:
        """Verify that total debits equal total credits across all parsed vouchers."""
        imbalanced = []
        for v in self.vouchers:
            diff = abs(v["total_debit"] - v["total_credit"])
            if diff > 0.01:
                imbalanced.append({
                    "voucher_number": v["voucher_number"],
                    "party_name": v["party_name"],
                    "debit": v["total_debit"],
                    "credit": v["total_credit"],
                    "discrepancy": round(diff, 2)
                })

        return {
            "status": "PASS" if len(imbalanced) == 0 else "FAIL",
            "total_vouchers": len(self.vouchers),
            "balanced_count": len(self.vouchers) - len(imbalanced),
            "imbalanced_vouchers": imbalanced
        }

    def generate_gstr1_summary(self) -> Dict[str, Any]:
        """Generate GSTR-1 Outward Supplies Summary from Sales vouchers."""
        b2b_sales = []
        total_taxable = 0.0
        total_cgst = 0.0
        total_sgst = 0.0
        total_igst = 0.0

        for v in self.vouchers:
            if v["voucher_type"].upper() in ["SALES", "CREDIT NOTE"]:
                taxable = 0.0
                cgst = 0.0
                sgst = 0.0
                igst = 0.0
                for e in v["entries"]:
                    name = e["ledger_name"].upper()
                    amt = e["amount"]
                    if "CGST" in name:
                        cgst += amt
                    elif "SGST" in name:
                        sgst += amt
                    elif "IGST" in name:
                        igst += amt
                    elif "SALES" in name:
                        taxable += amt

                total_taxable += taxable
                total_cgst += cgst
                total_sgst += sgst
                total_igst += igst

                b2b_sales.append({
                    "invoice_no": v["voucher_number"],
                    "date": v["date"],
                    "party": v["party_name"],
                    "taxable_value": taxable,
                    "cgst": cgst,
                    "sgst": sgst,
                    "igst": igst,
                    "total_invoice_value": taxable + cgst + sgst + igst
                })

        return {
            "financial_period": datetime.now().strftime("%Y-%m"),
            "total_taxable_value": round(total_taxable, 2),
            "total_cgst": round(total_cgst, 2),
            "total_sgst": round(total_sgst, 2),
            "total_igst": round(total_igst, 2),
            "total_tax": round(total_cgst + total_sgst + total_igst, 2),
            "invoices_count": len(b2b_sales),
            "invoices": b2b_sales
        }


def format_inr(val: float) -> str:
    """Format floating point numbers to Indian Rupee currency string."""
    return f"₹{val:,.2f}"


def main():
    """CLI runner and demo validation test for Tally XML parser."""
    sample_xml = """<ENVELOPE>
      <HEADER>
        <TALLYREQUEST>Export Data</TALLYREQUEST>
      </HEADER>
      <BODY>
        <IMPORTDATA>
          <REQUESTDESC>
            <REPORTNAME>Vouchers</REPORTNAME>
          </REQUESTDESC>
          <REQUESTDATA>
            <TALLYMESSAGE xmlns:UDF="TallyUDF">
              <VOUCHER VCHTYPE="Sales" ACTION="Create">
                <DATE>20260315</DATE>
                <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
                <VOUCHERNUMBER>INV-2026-089</VOUCHERNUMBER>
                <PARTYLEDGERNAME>Gupta Kirana Store</PARTYLEDGERNAME>
                <NARRATION>Supply of 50 bags premium basmati rice</NARRATION>
                <ALLLEDGERENTRIES.LIST>
                  <LEDGERNAME>Gupta Kirana Store</LEDGERNAME>
                  <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
                  <AMOUNT>-42000.00</AMOUNT>
                </ALLLEDGERENTRIES.LIST>
                <ALLLEDGERENTRIES.LIST>
                  <LEDGERNAME>Sales - GST 5%</LEDGERNAME>
                  <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
                  <AMOUNT>40000.00</AMOUNT>
                </ALLLEDGERENTRIES.LIST>
                <ALLLEDGERENTRIES.LIST>
                  <LEDGERNAME>Output CGST 2.5%</LEDGERNAME>
                  <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
                  <AMOUNT>1000.00</AMOUNT>
                </ALLLEDGERENTRIES.LIST>
                <ALLLEDGERENTRIES.LIST>
                  <LEDGERNAME>Output SGST 2.5%</LEDGERNAME>
                  <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
                  <AMOUNT>1000.00</AMOUNT>
                </ALLLEDGERENTRIES.LIST>
              </VOUCHER>
            </TALLYMESSAGE>
          </REQUESTDATA>
        </IMPORTDATA>
      </BODY>
    </ENVELOPE>"""

    parser = TallyXmlParser(sample_xml)
    vouchers = parser.parse()
    audit = parser.validate_double_entry()
    gst_summary = parser.generate_gstr1_summary()

    print("==================================================")
    print("  BAHI KHATA - TALLY ENTERPRISE CLI ENGINE (PYTHON) ")
    print("==================================================")
    print(f"Parsed Vouchers: {len(vouchers)}")
    print(f"Double-entry Balance Check: {audit['status']}")
    print(f"GSTR-1 Taxable Value: {format_inr(gst_summary['total_taxable_value'])}")
    print(f"GSTR-1 Output GST: {format_inr(gst_summary['total_tax'])}")
    print("==================================================")

if __name__ == "__main__":
    main()
