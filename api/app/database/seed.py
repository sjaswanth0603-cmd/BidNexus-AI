import logging
from datetime import datetime, timezone
import uuid

from app.database.mongodb import (
    users_col, bids_col, requirements_col, vendors_col,
    blacklist_col, submissions_col, results_col, audit_logs_col
)
from app.auth.security import get_password_hash

logger = logging.getLogger("bidnexus.seed")

def seed_database(db=None):
    """
    Seeds initial procurement demo data (users, tenders, requirements, vendors, blacklist, submissions, results, audit logs)
    into MongoDB Atlas if empty.
    """
    try:
        users = users_col()
        bids = bids_col()
        reqs = requirements_col()
        vendors = vendors_col()
        bl = blacklist_col()
        submissions = submissions_col()
        results = results_col()
        audits = audit_logs_col()

        # Check if already seeded with bids
        if bids.count_documents() > 0:
            logger.info("Database already contains seed tender data. Skipping initialization.")
            return {"status": "already_seeded"}

        logger.info("Seeding initial AP e-Procurement and GeM data into Database...")

        # 1. Seed Blacklist Records
        bl_records = [
            {
                "id": str(uuid.uuid4()),
                "company_name": "InfraSys Technologies Pvt Ltd",
                "reg_number": "REG-INFRASYS-9921",
                "gstin": "37AAACI9921K1Z5",
                "reason": "Submitted forged bank solvency & fake experience certificates in GeM procurement bid.",
                "debarment_agency": "Central Vigilance Commission (CVC) / GeM Portal",
                "debarred_until": "2028-12-31",
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "company_name": "FakeVendor Corp / Non-Compliant Bidder",
                "reg_number": "REG-FAKE-0042",
                "gstin": "37AAACF0042K1Z9",
                "reason": "Failure to supply OEM MAF authorization letter and invalid GST registration.",
                "debarment_agency": "Department of Expenditure, Ministry of Finance",
                "debarred_until": "2027-06-30",
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "company_name": "Blacklisted Infra Projects Pvt Ltd",
                "reg_number": "REG-BLK-8812",
                "gstin": "37AAACB8812K1Z1",
                "reason": "Defaulted on government civil contract execution & blacklisted by AP Water Resources Dept.",
                "debarment_agency": "Government of Andhra Pradesh (AP eGP Authority)",
                "debarred_until": "2029-03-31",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        bl.insert_many(bl_records)

        # 2. Seed Users
        hashed_pw = get_password_hash("Password@123")
        u_bidder_id = str(uuid.uuid4())
        u_evaluator_id = str(uuid.uuid4())
        u_evaluator_alt_id = str(uuid.uuid4())

        user_docs = [
            {
                "id": u_bidder_id,
                "email": "user@example.com",
                "password_hash": hashed_pw,
                "full_name": "K. Satyanarayana Raju",
                "organization": "TechCorp Solutions AP Pvt Ltd",
                "role": "user",
                "phone": "+91 98480 12345",
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": u_evaluator_id,
                "email": "admin@example.com",
                "password_hash": hashed_pw,
                "full_name": "Dr. V. Chandrasekhar, IAS",
                "organization": "AP e-Procurement Evaluation Authority",
                "role": "admin",
                "phone": "+91 866 2468123",
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": u_evaluator_alt_id,
                "email": "evaluator@example.com",
                "password_hash": hashed_pw,
                "full_name": "Smt. M. Anuradha, KAS",
                "organization": "GeM Statutory Compliance Verification Cell",
                "role": "admin",
                "phone": "+91 866 2468456",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        users.insert_many(user_docs)

        # 3. Seed Bids & Tenders
        bid_ap_id = str(uuid.uuid4())
        bid_gem1_id = str(uuid.uuid4())
        bid_gem2_id = str(uuid.uuid4())

        bid_docs = [
            {
                "id": bid_ap_id,
                "bid_number": "APEP/2026/WRD/894120",
                "title": "Water Resources Department (WRD) — Supply, Installation & Commissioning of High-Capacity Pump Sets, SCADA & Data Center Automation",
                "department": "Water Resources Department (WRD), Govt of Andhra Pradesh",
                "description": "Official AP e-Procurement Tender for turnkey execution of Polavaram & Vijayawada Pump House Automation, SCADA telemetry, enterprise servers, and 3-year AMC.",
                "deadline": "2026-10-31",
                "status": "Open",
                "created_by": u_evaluator_id,
                "bid_document_path": "samples/AP_Tender_894120.pdf",
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": bid_gem1_id,
                "bid_number": "GEM/2026/B/983373",
                "title": "Supply, Installation & Maintenance of High-Performance Enterprise Compute Nodes & Storage Arrays",
                "department": "Nellore Municipal Corporation",
                "description": "GeM Custom Bid for procurement of 32-core Enterprise Servers, SAN storage, high availability switches, and 3-Year On-site OEM Warranty Support.",
                "deadline": "2026-09-03",
                "status": "Open",
                "created_by": u_evaluator_id,
                "bid_document_path": "samples/GeM_Bid_983373.pdf",
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": bid_gem2_id,
                "bid_number": "GEM/2026/B/980990",
                "title": "Smart Street Lighting Infrastructure & Telemetry Gateway Controller Units",
                "department": "Vijayawada Municipal Corporation",
                "description": "GeM Product Bid for Smart LED controllers, IoT gateways, central control software, and GST/ISO compliance verification.",
                "deadline": "2026-09-08",
                "status": "Open",
                "created_by": u_evaluator_id,
                "bid_document_path": "samples/GeM_Bid_980990.pdf",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        bids.insert_many(bid_docs)

        # 4. Seed Requirements
        raw_reqs = [
            # AP Tender
            ("REQ-001", bid_ap_id, "Eligibility", "AP GSTIN & PAN Registration Certificate must be submitted", "required", "AP GSTIN", "", True, "AP GST Certificate", 1),
            ("REQ-002", bid_ap_id, "Eligibility", "Earnest Money Deposit (EMD) / Bid Security of ₹5,00,000 or Bank Guarantee from Scheduled Bank", ">=", "500000", "INR", True, "EMD Receipt / Bank Guarantee", 2),
            ("REQ-003", bid_ap_id, "Certification", "Class-I AP Government Registered Contractor / System Integrator License", "required", "Class-I", "", True, "AP Govt Registration License", 2),
            ("REQ-004", bid_ap_id, "Financial", "Minimum Average Annual Financial Turnover during last 3 financial years must be >= ₹10 Crore", ">=", "10", "Crore INR", True, "Audited Financial Balance Sheets / CA Certificate", 3),
            ("REQ-005", bid_ap_id, "Legal", "Non-Blacklisting Affidavit on ₹100 Non-Judicial Stamp Paper attested by Notary Public", "required", "Affidavit", "", True, "Notarized Stamp Paper Affidavit", 4),
            ("REQ-006", bid_ap_id, "Technical", "Enterprise Server Processor: Minimum 32 Core Dual Intel Xeon Gold / AMD EPYC Processor", ">=", "32", "Cores", True, "OEM Technical Datasheet", 5),
            ("REQ-007", bid_ap_id, "Technical", "System Memory (RAM): Minimum 32 GB DDR5 Installed RAM per Node", ">=", "32", "GB", True, "OEM Datasheet", 5),
            ("REQ-008", bid_ap_id, "Certification", "Manufacturer Authorization Form (MAF) directly from OEM for Servers & Pump SCADA Software", "required", "OEM MAF", "", True, "OEM Authorization Letter", 6),
            ("REQ-009", bid_ap_id, "Certification", "ISO 9001:2015 & ISO 27001 Quality & Information Security Certification (Currently Valid)", "date_validity", "2026-08-01", "", True, "ISO Certificates", 7),
            ("REQ-010", bid_ap_id, "Warranty", "Comprehensive On-Site OEM Warranty & AMC for a minimum period of 3 Years", ">=", "3", "Years", True, "Warranty Undertaking Letter", 8),

            # GeM Tender 1
            ("REQ-101", bid_gem1_id, "Financial", "Minimum Average Annual Financial Turnover of bidder during last 3 FY must be >= ₹5.0 Crore", ">=", "5.0", "Crore", True, "CA Turnover Certificate with UDIN", 1),
            ("REQ-102", bid_gem1_id, "Technical", "Minimum 32 GB Installed DDR5 System Memory per server node", ">=", "32", "GB", True, "OEM Technical Datasheet", 2),
            ("REQ-103", bid_gem1_id, "Certification", "Valid ISO 9001:2015 Quality Management System Certification", "date_validity", "2026-08-01", "", True, "ISO 9001 Certificate", 3),
            ("REQ-104", bid_gem1_id, "Certification", "Manufacturer Authorization Form (MAF) from Server OEM", "required", "OEM MAF", "", True, "OEM Authorization Letter", 4),
            ("REQ-105", bid_gem1_id, "Warranty", "Minimum 3 Years Comprehensive OEM On-Site Warranty Support", ">=", "3", "Years", True, "OEM Warranty Undertaking", 5),
            ("REQ-106", bid_gem1_id, "Legal", "Active GSTIN Registration Certificate & PAN Copy", "required", "GSTIN", "", True, "GSTIN & PAN Certificate", 6),

            # GeM Tender 2
            ("REQ-201", bid_gem2_id, "Financial", "Minimum Average Annual Financial Turnover during last 3 years >= ₹2.0 Crore", ">=", "2.0", "Crore", True, "Audited Financial Statements", 1),
            ("REQ-202", bid_gem2_id, "Technical", "Smart IoT Telemetry Gateway with IP65 weather-proof rating", "required", "IP65 Rating", "", True, "Technical Compliance Datasheet", 2),
            ("REQ-203", bid_gem2_id, "Certification", "ISO 14001 Environmental Management System Certificate", "date_validity", "2026-08-01", "", True, "ISO 14001 Certificate", 3),
            ("REQ-204", bid_gem2_id, "Warranty", "Minimum 2 Years Replacement Warranty on LED Drivers and IoT Gateways", ">=", "2", "Years", True, "Warranty Undertaking", 4)
        ]

        req_map = {}
        req_docs = []
        for code, b_id, cat, text, op, val, unit, mand, ev, page in raw_reqs:
            r_id = str(uuid.uuid4())
            doc = {
                "id": r_id,
                "bid_id": b_id,
                "requirement_id": code,
                "category": cat,
                "requirement": text,
                "operator": op,
                "value": val,
                "unit": unit,
                "mandatory": mand,
                "evidence_required": ev,
                "source_page": page,
                "confidence": 0.98,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            req_docs.append(doc)
            req_map[code] = r_id

        reqs.insert_many(req_docs)

        # 5. Seed Vendors
        v_a_id = str(uuid.uuid4())
        v_b_id = str(uuid.uuid4())
        v_c_id = str(uuid.uuid4())

        vendor_docs = [
            {
                "id": v_a_id,
                "company_name": "TechCorp Solutions AP Pvt Ltd",
                "reg_number": "GST37AAACT9876F1Z8",
                "contact_email": "rajesh@techcorp.com",
                "phone": "+91 98480 12345",
                "is_blacklisted": False,
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": v_b_id,
                "company_name": "InfraSys Global Engineering Ltd",
                "reg_number": "GST37BBBIS5432F1Z2",
                "contact_email": "bids@infrasys.com",
                "phone": "+91 866 2554321",
                "is_blacklisted": True,
                "blacklist_reason": "Deburred by CVC & GeM Portal for fraudulent solvency certificate submission",
                "blacklisted_by": "Central Vigilance Commission (CVC)",
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": v_c_id,
                "company_name": "Apex Network Labs Vizag",
                "reg_number": "GST37CCCAN1122F1Z5",
                "contact_email": "tenders@apexnet.in",
                "phone": "+91 891 2789012",
                "is_blacklisted": False,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        vendors.insert_many(vendor_docs)

        # 6. Seed Submissions & Results
        sub_a_id = str(uuid.uuid4())
        sub_b_id = str(uuid.uuid4())
        sub_c_id = str(uuid.uuid4())

        sub_docs = [
            {
                "id": sub_a_id,
                "bid_id": bid_ap_id,
                "vendor_id": v_a_id,
                "status": "COMPLIANT",
                "compliance_score": 100.0,
                "submitted_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": sub_b_id,
                "bid_id": bid_ap_id,
                "vendor_id": v_b_id,
                "status": "NON_COMPLIANT",
                "compliance_score": 40.0,
                "submitted_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": sub_c_id,
                "bid_id": bid_ap_id,
                "vendor_id": v_c_id,
                "status": "REVIEW_REQUIRED",
                "compliance_score": 80.0,
                "submitted_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        submissions.insert_many(sub_docs)

        # Seed Results for Vendor A
        res_a = [
            {"id": str(uuid.uuid4()), "submission_id": sub_a_id, "requirement_id": req_map["REQ-001"], "status": "COMPLIANT", "confidence": 1.0, "reasoning": "Valid AP GSTIN (GST37AAACT9876F1Z8) and PAN verified.", "evidence_text": "AP GST Reg: 37AAACT9876F1Z8, Active Status", "source_doc_name": "TechCorp_AP_GST_PAN.pdf", "source_page": 1, "verification_method": "Deterministic Rule", "evaluated_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "submission_id": sub_a_id, "requirement_id": req_map["REQ-002"], "status": "COMPLIANT", "confidence": 1.0, "reasoning": "EMD Bank Guarantee of ₹5,00,000 submitted from SBI Vijayawada.", "evidence_text": "EMD BG No: SBI/VJA/2026/987 Value: ₹5,00,000", "source_doc_name": "TechCorp_EMD_BG.pdf", "source_page": 1, "verification_method": "Deterministic Rule", "evaluated_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "submission_id": sub_a_id, "requirement_id": req_map["REQ-003"], "status": "COMPLIANT", "confidence": 1.0, "reasoning": "AP Govt Class-I Special Category License valid till 2029.", "evidence_text": "AP Govt Reg License No: AP/WRD/CLASS-I/2024/451", "source_doc_name": "TechCorp_ClassI_License.pdf", "source_page": 1, "verification_method": "Deterministic Rule", "evaluated_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "submission_id": sub_a_id, "requirement_id": req_map["REQ-004"], "status": "COMPLIANT", "confidence": 1.0, "reasoning": "Average turnover ₹14.5 Crore > ₹10 Crore required.", "evidence_text": "FY 2023-24: ₹14.5 Cr, FY 2024-25: ₹16.2 Cr", "source_doc_name": "TechCorp_CA_Turnover.pdf", "source_page": 2, "verification_method": "Deterministic Rule", "evaluated_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "submission_id": sub_a_id, "requirement_id": req_map["REQ-005"], "status": "COMPLIANT", "confidence": 1.0, "reasoning": "Notarized ₹100 Stamp Paper Non-Blacklisting Affidavit provided.", "evidence_text": "Affidavit on ₹100 AP Stamp Paper No: AP-ST-998822", "source_doc_name": "TechCorp_Affidavit.pdf", "source_page": 1, "verification_method": "Deterministic Rule", "evaluated_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "submission_id": sub_a_id, "requirement_id": req_map["REQ-006"], "status": "COMPLIANT", "confidence": 1.0, "reasoning": "32 Core Dual Intel Xeon Gold Processors offered.", "evidence_text": "Processor: Dual Intel Xeon Gold 6430 32-Cores", "source_doc_name": "TechCorp_Server_Datasheet.pdf", "source_page": 3, "verification_method": "Vector RAG Search", "evaluated_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "submission_id": sub_a_id, "requirement_id": req_map["REQ-007"], "status": "COMPLIANT", "confidence": 1.0, "reasoning": "32 GB DDR5 RAM installed per node.", "evidence_text": "Memory: 32 GB DDR5-4800 ECC Registered RAM", "source_doc_name": "TechCorp_Server_Datasheet.pdf", "source_page": 3, "verification_method": "Vector RAG Search", "evaluated_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "submission_id": sub_a_id, "requirement_id": req_map["REQ-008"], "status": "COMPLIANT", "confidence": 1.0, "reasoning": "OEM MAF letter directly addressed to AP WRD attached.", "evidence_text": "OEM Authorization Letter Ref: OEM/AP/WRD/2026/104", "source_doc_name": "TechCorp_OEM_MAF.pdf", "source_page": 1, "verification_method": "Vector RAG Search", "evaluated_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "submission_id": sub_a_id, "requirement_id": req_map["REQ-009"], "status": "COMPLIANT", "confidence": 1.0, "reasoning": "ISO 9001:2015 & ISO 27001 valid till December 2028.", "evidence_text": "Certificate No: ISO-AP-8841 Valid: 2028-12-31", "source_doc_name": "TechCorp_ISO.pdf", "source_page": 1, "verification_method": "Deterministic Rule", "evaluated_at": datetime.now(timezone.utc).isoformat()},
            {"id": str(uuid.uuid4()), "submission_id": sub_a_id, "requirement_id": req_map["REQ-010"], "status": "COMPLIANT", "confidence": 1.0, "reasoning": "3 Years comprehensive on-site warranty undertaking attached.", "evidence_text": "3 Years Onsite OEM Warranty & SCADA Support", "source_doc_name": "TechCorp_Warranty.pdf", "source_page": 1, "verification_method": "Vector RAG Search", "evaluated_at": datetime.now(timezone.utc).isoformat()},
        ]
        results.insert_many(res_a)

        # 7. Seed Audit Logs
        audit_docs = [
            {
                "id": str(uuid.uuid4()),
                "action": "TENDER_CREATED",
                "entity_type": "Bid",
                "entity_id": bid_ap_id,
                "user_id": u_evaluator_id,
                "details": "Tender APEP/2026/WRD/894120 created on AP e-Procurement Portal.",
                "timestamp": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "action": "AUTOMATED_VERIFICATION",
                "entity_type": "Submission",
                "entity_id": sub_a_id,
                "user_id": u_evaluator_id,
                "details": "Hybrid RAG compliance check completed for TechCorp Solutions AP Pvt Ltd (Score: 100%).",
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
        ]
        audits.insert_many(audit_docs)

        logger.info("MongoDB Atlas successfully initialized and seeded!")
        return {
            "status": "success",
            "message": "MongoDB Atlas initialized with seed records.",
            "synced_counts": {
                "users": len(user_docs),
                "bids": len(bid_docs),
                "requirements": len(req_docs),
                "vendors": len(vendor_docs),
                "submissions": len(sub_docs),
                "compliance_results": len(res_a)
            }
        }
    except Exception as e:
        logger.error(f"Error seeding MongoDB Atlas: {e}")
        return {"status": "error", "message": str(e)}

