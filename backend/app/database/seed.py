import logging
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.models import User, Bid, Requirement, Vendor, Submission, ComplianceResult, HumanReview, AuditLog, BlacklistRecord
from app.auth.security import get_password_hash

logger = logging.getLogger("seed")

def seed_database(db: Session):
    # Seed Blacklist records if not present
    existing_blacklist = db.query(BlacklistRecord).first()
    if not existing_blacklist:
        b1 = BlacklistRecord(
            company_name="InfraSys Technologies Pvt Ltd",
            reg_number="REG-INFRASYS-9921",
            gstin="37AAACI9921K1Z5",
            reason="Submitted forged bank solvency & fake experience certificates in GeM procurement bid.",
            debarment_agency="Central Vigilance Commission (CVC) / GeM Portal",
            debarred_until="2028-12-31"
        )
        b2 = BlacklistRecord(
            company_name="FakeVendor Corp / Non-Compliant Bidder",
            reg_number="REG-[#0c2356]-0042".replace("[#0c2356]", "FAKE"),
            gstin="37AAACF0042K1Z9",
            reason="Failure to supply OEM MAF authorization letter and invalid GST registration.",
            debarment_agency="Department of Expenditure, Ministry of Finance",
            debarred_until="2027-06-30"
        )
        b3 = BlacklistRecord(
            company_name="Blacklisted Infra Projects Pvt Ltd",
            reg_number="REG-BLK-8812",
            gstin="37AAACB8812K1Z1",
            reason="Defaulted on government civil contract execution & blacklisted by AP Water Resources Dept.",
            debarment_agency="Government of Andhra Pradesh (AP eGP Authority)",
            debarred_until="2029-03-31"
        )
        db.add_all([b1, b2, b3])
        db.commit()

    # Check if seed users already exist
    existing_user = db.query(User).filter(User.email == "user@example.com").first()
    if existing_user:
        logger.info("Seed data already present. Skipping initialization.")
        return

    logger.info("Seeding initial AP e-Procurement database...")

    # 1. Create Users
    bidder_user = User(
        email="user@example.com",
        password_hash=get_password_hash("Password@123"),
        full_name="K. Satyanarayana Raju",
        organization="TechCorp Solutions AP Pvt Ltd",
        role="user",
        phone="+91 98480 12345"
    )

    evaluator_user = User(
        email="admin@example.com",
        password_hash=get_password_hash("Password@123"),
        full_name="Dr. V. Chandrasekhar, IAS",
        organization="AP e-Procurement Evaluation Authority",
        role="admin",
        phone="+91 866 2468123"
    )

    db.add(bidder_user)
    db.add(evaluator_user)
    db.flush()

    # 2. Create AP e-Procurement Tender Bid & GeM Bids
    ap_tender = Bid(
        bid_number="APEP/2026/WRD/894120",
        title="Water Resources Department (WRD) — Supply, Installation & Commissioning of High-Capacity Pump Sets, SCADA & Data Center Automation",
        department="Water Resources Department (WRD), Govt of Andhra Pradesh",
        description="Official AP e-Procurement Tender for turnkey execution of Polavaram & Vijayawada Pump House Automation, SCADA telemetry, enterprise servers, and 3-year AMC.",
        deadline="2026-10-31",
        status="ACTIVE",
        created_by=evaluator_user.id,
        bid_document_path="samples/AP_Tender_894120.pdf"
    )

    gem_tender_1 = Bid(
        bid_number="GEM/2026/B/983373",
        title="Supply, Installation & Maintenance of High-Performance Enterprise Compute Nodes & Storage Arrays",
        department="Nellore Municipal Corporation",
        description="GeM Custom Bid for procurement of 32-core Enterprise Servers, SAN storage, high availability switches, and 3-Year On-site OEM Warranty Support.",
        deadline="2026-09-03",
        status="ACTIVE",
        created_by=evaluator_user.id,
        bid_document_path="samples/GeM_Bid_983373.pdf"
    )

    gem_tender_2 = Bid(
        bid_number="GEM/2026/B/980990",
        title="Smart Street Lighting Infrastructure & Telemetry Gateway Controller Units",
        department="Vijayawada Municipal Corporation",
        description="GeM Product Bid for Smart LED controllers, IoT gateways, central control software, and GST/ISO compliance verification.",
        deadline="2026-09-08",
        status="ACTIVE",
        created_by=evaluator_user.id,
        bid_document_path="samples/GeM_Bid_980990.pdf"
    )

    db.add_all([ap_tender, gem_tender_1, gem_tender_2])
    db.flush()

    # 3. Create Requirements for AP Tender & GeM Tenders
    reqs_data = [
        # AP Tender Requirements
        ("REQ-001", ap_tender.id, "Eligibility", "AP GSTIN & PAN Registration Certificate must be submitted", "required", "AP GSTIN", "", True, "AP GST Certificate", 1),
        ("REQ-002", ap_tender.id, "Eligibility", "Earnest Money Deposit (EMD) / Bid Security of ₹5,00,000 or Bank Guarantee from Scheduled Bank", ">=", "500000", "INR", True, "EMD Receipt / Bank Guarantee", 2),
        ("REQ-003", ap_tender.id, "Certification", "Class-I AP Government Registered Contractor / System Integrator License", "required", "Class-I", "", True, "AP Govt Registration License", 2),
        ("REQ-004", ap_tender.id, "Financial", "Minimum Average Annual Financial Turnover during last 3 financial years must be >= ₹10 Crore", ">=", "10", "Crore INR", True, "Audited Financial Balance Sheets / CA Certificate", 3),
        ("REQ-005", ap_tender.id, "Legal", "Non-Blacklisting Affidavit on ₹100 Non-Judicial Stamp Paper attested by Notary Public", "required", "Affidavit", "", True, "Notarized Stamp Paper Affidavit", 4),
        ("REQ-006", ap_tender.id, "Technical", "Enterprise Server Processor: Minimum 32 Core Dual Intel Xeon Gold / AMD EPYC Processor", ">=", "32", "Cores", True, "OEM Technical Datasheet", 5),
        ("REQ-007", ap_tender.id, "Technical", "System Memory (RAM): Minimum 32 GB DDR5 Installed RAM per Node", ">=", "32", "GB", True, "OEM Datasheet", 5),
        ("REQ-008", ap_tender.id, "Certification", "Manufacturer Authorization Form (MAF) directly from OEM for Servers & Pump SCADA Software", "required", "OEM MAF", "", True, "OEM Authorization Letter", 6),
        ("REQ-009", ap_tender.id, "Certification", "ISO 9001:2015 & ISO 27001 Quality & Information Security Certification (Currently Valid)", "date_validity", "2026-08-01", "", True, "ISO Certificates", 7),
        ("REQ-010", ap_tender.id, "Warranty", "Comprehensive On-Site OEM Warranty & AMC for a minimum period of 3 Years", ">=", "3", "Years", True, "Warranty Undertaking Letter", 8),

        # GeM Tender 983373 Requirements
        ("REQ-101", gem_tender_1.id, "Financial", "Minimum Average Annual Financial Turnover of bidder during last 3 FY must be >= ₹5.0 Crore", ">=", "5.0", "Crore", True, "CA Turnover Certificate with UDIN", 1),
        ("REQ-102", gem_tender_1.id, "Technical", "Minimum 32 GB Installed DDR5 System Memory per server node", ">=", "32", "GB", True, "OEM Technical Datasheet", 2),
        ("REQ-103", gem_tender_1.id, "Certification", "Valid ISO 9001:2015 Quality Management System Certification", "date_validity", "2026-08-01", "", True, "ISO 9001 Certificate", 3),
        ("REQ-104", gem_tender_1.id, "Certification", "Manufacturer Authorization Form (MAF) from Server OEM", "required", "OEM MAF", "", True, "OEM Authorization Letter", 4),
        ("REQ-105", gem_tender_1.id, "Warranty", "Minimum 3 Years Comprehensive OEM On-Site Warranty Support", ">=", "3", "Years", True, "OEM Warranty Undertaking", 5),
        ("REQ-106", gem_tender_1.id, "Legal", "Active GSTIN Registration Certificate & PAN Copy", "required", "GSTIN", "", True, "GSTIN & PAN Certificate", 6),

        # GeM Tender 980990 Requirements
        ("REQ-201", gem_tender_2.id, "Financial", "Minimum Average Annual Financial Turnover during last 3 years >= ₹2.0 Crore", ">=", "2.0", "Crore", True, "Audited Financial Statements", 1),
        ("REQ-202", gem_tender_2.id, "Technical", "Smart IoT Telemetry Gateway with IP65 weather-proof rating", "required", "IP65 Rating", "", True, "Technical Compliance Datasheet", 2),
        ("REQ-203", gem_tender_2.id, "Certification", "ISO 14001 Environmental Management System Certificate", "date_validity", "2026-08-01", "", True, "ISO 14001 Certificate", 3),
        ("REQ-204", gem_tender_2.id, "Warranty", "Minimum 2 Years Replacement Warranty on LED Drivers and IoT Gateways", ">=", "2", "Years", True, "Warranty Undertaking", 4)
    ]

    requirements = []
    for code, target_bid_id, cat, text, op, val, unit, mand, ev, page in reqs_data:
        r = Requirement(
            bid_id=target_bid_id,
            requirement_id=code,
            category=cat,
            requirement=text,
            operator=op,
            value=val,
            unit=unit,
            mandatory=mand,
            evidence_required=ev,
            source_page=page,
            confidence=0.98
        )
        db.add(r)
        requirements.append(r)
    
    db.flush()
    req_dict = {r.requirement_id: r for r in requirements}

    # 4. Create Vendors
    v_a = Vendor(
        company_name="TechCorp Solutions AP Pvt Ltd",
        reg_number="GST37AAACT9876F1Z8",
        contact_email="rajesh@techcorp.com",
        phone="+91 98480 12345"
    )
    v_b = Vendor(
        company_name="InfraSys Global Engineering Ltd",
        reg_number="GST37BBBIS5432F1Z2",
        contact_email="bids@infrasys.com",
        phone="+91 866 2554321"
    )
    v_c = Vendor(
        company_name="Apex Network Labs Vizag",
        reg_number="GST37CCCAN1122F1Z5",
        contact_email="tenders@apexnet.in",
        phone="+91 891 2789012"
    )

    db.add_all([v_a, v_b, v_c])
    db.flush()

    # 5. Create Vendor Submissions & Results
    
    # --- Vendor A (100% Compliant - L1 Bidder ₹4.85 Crore) ---
    sub_a = Submission(
        bid_id=ap_tender.id,
        vendor_id=v_a.id,
        status="COMPLIANT",
        compliance_score=100.0,
        submitted_at=datetime.fromisoformat("2026-08-25")
    )
    db.add(sub_a)
    db.flush()

    results_a = [
        ComplianceResult(submission_id=sub_a.id, requirement_id=req_dict["REQ-001"].id, status="COMPLIANT", confidence=1.0, reasoning="Valid AP GSTIN (GST37AAACT9876F1Z8) and PAN verified.", evidence_text="AP GST Reg: 37AAACT9876F1Z8, Active Status", source_doc_name="TechCorp_AP_GST_PAN.pdf", source_page=1, verification_method="Deterministic Rule"),
        ComplianceResult(submission_id=sub_a.id, requirement_id=req_dict["REQ-002"].id, status="COMPLIANT", confidence=1.0, reasoning="EMD Bank Guarantee of ₹5,00,000 submitted from SBI Vijayawada.", evidence_text="EMD BG No: SBI/VJA/2026/987 Value: ₹5,00,000", source_doc_name="TechCorp_EMD_BG.pdf", source_page=1, verification_method="Deterministic Rule"),
        ComplianceResult(submission_id=sub_a.id, requirement_id=req_dict["REQ-003"].id, status="COMPLIANT", confidence=1.0, reasoning="AP Govt Class-I Special Category License valid till 2029.", evidence_text="AP Govt Reg License No: AP/WRD/CLASS-I/2024/451", source_doc_name="TechCorp_ClassI_License.pdf", source_page=1, verification_method="Deterministic Rule"),
        ComplianceResult(submission_id=sub_a.id, requirement_id=req_dict["REQ-004"].id, status="COMPLIANT", confidence=1.0, reasoning="Average turnover ₹14.5 Crore > ₹10 Crore required.", evidence_text="FY 2023-24: ₹14.5 Cr, FY 2024-25: ₹16.2 Cr", source_doc_name="TechCorp_CA_Turnover.pdf", source_page=2, verification_method="Deterministic Rule"),
        ComplianceResult(submission_id=sub_a.id, requirement_id=req_dict["REQ-005"].id, status="COMPLIANT", confidence=1.0, reasoning="Notarized ₹100 Stamp Paper Non-Blacklisting Affidavit provided.", evidence_text="Affidavit on ₹100 AP Stamp Paper No: AP-ST-998822", source_doc_name="TechCorp_Affidavit.pdf", source_page=1, verification_method="Deterministic Rule"),
        ComplianceResult(submission_id=sub_a.id, requirement_id=req_dict["REQ-006"].id, status="COMPLIANT", confidence=1.0, reasoning="32 Core Dual Intel Xeon Gold Processors offered.", evidence_text="Processor: Dual Intel Xeon Gold 6430 32-Cores", source_doc_name="TechCorp_Server_Datasheet.pdf", source_page=3, verification_method="Vector RAG Search"),
        ComplianceResult(submission_id=sub_a.id, requirement_id=req_dict["REQ-007"].id, status="COMPLIANT", confidence=1.0, reasoning="32 GB DDR5 RAM installed per node.", evidence_text="Memory: 32 GB DDR5-4800 ECC Registered RAM", source_doc_name="TechCorp_Server_Datasheet.pdf", source_page=3, verification_method="Vector RAG Search"),
        ComplianceResult(submission_id=sub_a.id, requirement_id=req_dict["REQ-008"].id, status="COMPLIANT", confidence=1.0, reasoning="OEM MAF letter directly addressed to AP WRD attached.", evidence_text="OEM Authorization Letter Ref: OEM/AP/WRD/2026/104", source_doc_name="TechCorp_OEM_MAF.pdf", source_page=1, verification_method="Vector RAG Search"),
        ComplianceResult(submission_id=sub_a.id, requirement_id=req_dict["REQ-009"].id, status="COMPLIANT", confidence=1.0, reasoning="ISO 9001:2015 & ISO 27001 valid till December 2028.", evidence_text="Certificate No: ISO-AP-8841 Valid: 2028-12-31", source_doc_name="TechCorp_ISO.pdf", source_page=1, verification_method="Deterministic Rule"),
        ComplianceResult(submission_id=sub_a.id, requirement_id=req_dict["REQ-010"].id, status="COMPLIANT", confidence=1.0, reasoning="3 Years comprehensive on-site warranty undertaking attached.", evidence_text="3 Years Onsite OEM Warranty & SCADA Support", source_doc_name="TechCorp_Warranty.pdf", source_page=1, verification_method="Vector RAG Search"),
    ]
    db.add_all(results_a)

    # --- Vendor B (40% Non-Compliant - Missing EMD & MAF, Turnover Shortfall) ---
    sub_b = Submission(
        bid_id=ap_tender.id,
        vendor_id=v_b.id,
        status="NON_COMPLIANT",
        compliance_score=40.0,
        submitted_at=datetime.fromisoformat("2026-08-26")
    )
    db.add(sub_b)
    db.flush()

    results_b = [
        ComplianceResult(submission_id=sub_b.id, requirement_id=req_dict["REQ-001"].id, status="COMPLIANT", confidence=1.0, reasoning="AP GSTIN (GST37BBBIS5432F1Z2) verified.", evidence_text="AP GST: 37BBBIS5432F1Z2", source_doc_name="InfraSys_GST.pdf", source_page=1, verification_method="Deterministic Rule"),
        ComplianceResult(submission_id=sub_b.id, requirement_id=req_dict["REQ-002"].id, status="NON_COMPLIANT", confidence=1.0, reasoning="🔴 MANDATORY EVIDENCE MISSING: Earnest Money Deposit (EMD) of ₹5,00,000 not found in submission package.", evidence_text="", source_doc_name="", source_page=0, verification_method="Missing Document Detector"),
        ComplianceResult(submission_id=sub_b.id, requirement_id=req_dict["REQ-003"].id, status="COMPLIANT", confidence=1.0, reasoning="AP Class-II License attached (Allowed with joint venture).", evidence_text="AP Reg: CLASS-II/2023/102", source_doc_name="InfraSys_License.pdf", source_page=1, verification_method="Deterministic Rule"),
        ComplianceResult(submission_id=sub_b.id, requirement_id=req_dict["REQ-004"].id, status="NON_COMPLIANT", confidence=1.0, reasoning="🔴 TURNOVER SHORTFALL: Average turnover is ₹7.5 Crore < ₹10 Crore required.", evidence_text="Average Turnover: ₹7.5 Crore", source_doc_name="InfraSys_Financials.pdf", source_page=1, verification_method="Deterministic Rule"),
        ComplianceResult(submission_id=sub_b.id, requirement_id=req_dict["REQ-005"].id, status="COMPLIANT", confidence=1.0, reasoning="Non-blacklisting declaration submitted.", evidence_text="Affidavit Declaration Attached", source_doc_name="InfraSys_Affidavit.pdf", source_page=1, verification_method="Deterministic Rule"),
        ComplianceResult(submission_id=sub_b.id, requirement_id=req_dict["REQ-006"].id, status="COMPLIANT", confidence=1.0, reasoning="32 Core processor datasheet provided.", evidence_text="32 Cores Server", source_doc_name="InfraSys_Datasheet.pdf", source_page=2, verification_method="Vector RAG Search"),
        ComplianceResult(submission_id=sub_b.id, requirement_id=req_dict["REQ-007"].id, status="COMPLIANT", confidence=1.0, reasoning="32 GB RAM offered.", evidence_text="32 GB RAM", source_doc_name="InfraSys_Datasheet.pdf", source_page=2, verification_method="Vector RAG Search"),
        ComplianceResult(submission_id=sub_b.id, requirement_id=req_dict["REQ-008"].id, status="NON_COMPLIANT", confidence=1.0, reasoning="🔴 MANDATORY EVIDENCE MISSING: Manufacturer Authorization Form (MAF) from OEM not submitted.", evidence_text="", source_doc_name="", source_page=0, verification_method="Missing Document Detector"),
        ComplianceResult(submission_id=sub_b.id, requirement_id=req_dict["REQ-009"].id, status="NON_COMPLIANT", confidence=1.0, reasoning="🔴 EXPIRED CERTIFICATE: ISO 9001 certificate expired on 2023-12-31.", evidence_text="Validity: 2023-12-31 (EXPIRED)", source_doc_name="InfraSys_ISO.pdf", source_page=1, verification_method="Certificate Expiry Check"),
        ComplianceResult(submission_id=sub_b.id, requirement_id=req_dict["REQ-010"].id, status="COMPLIANT", confidence=1.0, reasoning="3 Years warranty promised.", evidence_text="3 Years Warranty", source_doc_name="InfraSys_Offer.pdf", source_page=1, verification_method="Vector RAG Search"),
    ]
    db.add_all(results_b)

    # --- Vendor C (80% Review Required - Tech Spec Mismatch & Warranty Contradiction) ---
    sub_c = Submission(
        bid_id=ap_tender.id,
        vendor_id=v_c.id,
        status="REVIEW_REQUIRED",
        compliance_score=80.0,
        submitted_at=datetime.fromisoformat("2026-08-26")
    )
    db.add(sub_c)
    db.flush()

    results_c = [
        ComplianceResult(submission_id=sub_c.id, requirement_id=req_dict["REQ-001"].id, status="COMPLIANT", confidence=1.0, reasoning="AP GSTIN (GST37CCCAN1122F1Z5) verified.", evidence_text="AP GST: 37CCCAN1122F1Z5", source_doc_name="Apex_GST.pdf", source_page=1, verification_method="Deterministic Rule"),
        ComplianceResult(submission_id=sub_c.id, requirement_id=req_dict["REQ-002"].id, status="COMPLIANT", confidence=1.0, reasoning="EMD of ₹5,00,000 paid via AP Online e-Procurement Portal Gateway.", evidence_text="AP Online EMD Ref: APEPROC/EMD/2026/4451", source_doc_name="Apex_EMD_Receipt.pdf", source_page=1, verification_method="Deterministic Rule"),
        ComplianceResult(submission_id=sub_c.id, requirement_id=req_dict["REQ-003"].id, status="COMPLIANT", confidence=1.0, reasoning="AP Class-I License valid.", evidence_text="AP Reg: CLASS-I/2025/892", source_doc_name="Apex_License.pdf", source_page=1, verification_method="Deterministic Rule"),
        ComplianceResult(submission_id=sub_c.id, requirement_id=req_dict["REQ-004"].id, status="COMPLIANT", confidence=1.0, reasoning="Average turnover ₹12.8 Crore > ₹10 Crore required.", evidence_text="Average Turnover: ₹12.8 Crore", source_doc_name="Apex_CA_Turnover.pdf", source_page=1, verification_method="Deterministic Rule"),
        ComplianceResult(submission_id=sub_c.id, requirement_id=req_dict["REQ-005"].id, status="COMPLIANT", confidence=1.0, reasoning="Notarized ₹100 Stamp Paper affidavit attached.", evidence_text="Stamp Paper AP-ST-114422", source_doc_name="Apex_Affidavit.pdf", source_page=1, verification_method="Deterministic Rule"),
        ComplianceResult(submission_id=sub_c.id, requirement_id=req_dict["REQ-006"].id, status="COMPLIANT", confidence=1.0, reasoning="32 Core server offered.", evidence_text="32 Cores Processor", source_doc_name="Apex_Datasheet.pdf", source_page=2, verification_method="Vector RAG Search"),
        ComplianceResult(submission_id=sub_c.id, requirement_id=req_dict["REQ-007"].id, status="REVIEW_REQUIRED", confidence=0.85, reasoning="🟡 TECHNICAL SPEC MISMATCH: Offered base memory is 16 GB RAM (expandable to 32 GB) vs 32 GB installed RAM required.", evidence_text="Base RAM: 16 GB DDR5 (Expandable up to 64 GB)", source_doc_name="Apex_Datasheet.pdf", source_page=3, verification_method="Technical Spec Comparator"),
        ComplianceResult(submission_id=sub_c.id, requirement_id=req_dict["REQ-008"].id, status="COMPLIANT", confidence=1.0, reasoning="OEM MAF submitted.", evidence_text="OEM MAF Attached", source_doc_name="Apex_MAF.pdf", source_page=1, verification_method="Vector RAG Search"),
        ComplianceResult(submission_id=sub_c.id, requirement_id=req_dict["REQ-009"].id, status="COMPLIANT", confidence=1.0, reasoning="ISO 9001 valid till 2027.", evidence_text="Validity: 2027-06-30", source_doc_name="Apex_ISO.pdf", source_page=1, verification_method="Deterministic Rule"),
        ComplianceResult(submission_id=sub_c.id, requirement_id=req_dict["REQ-010"].id, status="REVIEW_REQUIRED", confidence=0.82, reasoning="⚠️ CROSS-DOCUMENT CONTRADICTION: Technical Datasheet specifies 3 Years Warranty, whereas Commercial Offer states 1 Year Standard Warranty.", evidence_text="Datasheet p.4: 3 Yrs Warranty | Commercial Bid p.2: 1 Year Warranty Included", source_doc_name="Apex_Commercial_Offer.pdf", source_page=2, verification_method="Contradiction Detector"),
    ]
    db.add_all(results_c)

    # --- Seed GeM Tender 983373 Submissions ---
    sub_gem_a = Submission(bid_id=gem_tender_1.id, vendor_id=v_a.id, status="COMPLIANT", compliance_score=100.0, submitted_at=datetime.fromisoformat("2026-08-27"))
    sub_gem_b = Submission(bid_id=gem_tender_1.id, vendor_id=v_b.id, status="NON_COMPLIANT", compliance_score=50.0, submitted_at=datetime.fromisoformat("2026-08-27"))
    sub_gem_c = Submission(bid_id=gem_tender_1.id, vendor_id=v_c.id, status="REVIEW_REQUIRED", compliance_score=83.3, submitted_at=datetime.fromisoformat("2026-08-27"))
    db.add_all([sub_gem_a, sub_gem_b, sub_gem_c])
    db.flush()

    res_gem_a = [
        ComplianceResult(submission_id=sub_gem_a.id, requirement_id=req_dict["REQ-101"].id, status="COMPLIANT", confidence=1.0, reasoning="Turnover ₹14.5 Crore > ₹5.0 Crore requirement.", evidence_text="FY 24-25 Turnover: ₹14.5 Cr", source_doc_name="TechCorp_CA_Turnover.pdf", source_page=1, verification_method="Deterministic Rule"),
        ComplianceResult(submission_id=sub_gem_a.id, requirement_id=req_dict["REQ-102"].id, status="COMPLIANT", confidence=1.0, reasoning="32 GB DDR5 RAM verified in datasheet.", evidence_text="Memory: 32 GB DDR5 RAM", source_doc_name="TechCorp_Server_Datasheet.pdf", source_page=2, verification_method="Vector RAG Search"),
        ComplianceResult(submission_id=sub_gem_a.id, requirement_id=req_dict["REQ-103"].id, status="COMPLIANT", confidence=1.0, reasoning="ISO 9001:2015 valid till 2028.", evidence_text="Validity: 2028-12-31", source_doc_name="TechCorp_ISO.pdf", source_page=1, verification_method="Deterministic Rule"),
        ComplianceResult(submission_id=sub_gem_a.id, requirement_id=req_dict["REQ-104"].id, status="COMPLIANT", confidence=1.0, reasoning="Server OEM MAF attached.", evidence_text="OEM MAF Attached", source_doc_name="TechCorp_OEM_MAF.pdf", source_page=1, verification_method="Vector RAG Search"),
        ComplianceResult(submission_id=sub_gem_a.id, requirement_id=req_dict["REQ-105"].id, status="COMPLIANT", confidence=1.0, reasoning="3 Years OEM On-site warranty confirmed.", evidence_text="3 Years Onsite Warranty", source_doc_name="TechCorp_Warranty.pdf", source_page=1, verification_method="Deterministic Rule"),
        ComplianceResult(submission_id=sub_gem_a.id, requirement_id=req_dict["REQ-106"].id, status="COMPLIANT", confidence=1.0, reasoning="Active GSTIN 37AAACT9876F1Z8.", evidence_text="Active GSTIN", source_doc_name="TechCorp_GST.pdf", source_page=1, verification_method="Deterministic Rule"),
    ]
    db.add_all(res_gem_a)


    # 6. Audit Logs
    log1 = AuditLog(
        action="TENDER_CREATED",
        entity_type="Bid",
        entity_id=ap_tender.id,
        user_id=evaluator_user.id,
        details="Tender APEP/2026/WRD/894120 created on AP e-Procurement Portal."
    )
    log2 = AuditLog(
        action="AUTOMATED_VERIFICATION",
        entity_type="Submission",
        entity_id=sub_a.id,
        user_id=evaluator_user.id,
        details="Hybrid RAG compliance check completed for TechCorp Solutions AP Pvt Ltd (Score: 100%)."
    )

    db.add_all([log1, log2])
    db.commit()
    logger.info("AP e-Procurement database successfully seeded!")
