import io
import csv
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse, Response
from sqlalchemy.orm import Session

from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

from app.database.session import get_db
from app.models.models import Bid, Vendor, Submission, ComplianceResult, AuditLog, User
from app.auth.security import get_current_user, get_optional_current_user

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/pdf/{submission_id}")
def generate_pdf_report(
    submission_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_optional_current_user)
):
    submission = db.query(Submission).filter(
        (Submission.id == submission_id) | (Submission.vendor_id == submission_id) | (Submission.bid_id == submission_id)
    ).first()
    if not submission:
        submission = db.query(Submission).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission evaluation record not found.")

    bid = db.query(Bid).filter(Bid.id == submission.bid_id).first()
    vendor = db.query(Vendor).filter(Vendor.id == submission.vendor_id).first()
    results = db.query(ComplianceResult).filter(ComplianceResult.submission_id == submission.id).all()

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor('#0F172A'),
        spaceAfter=10
    )
    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Heading2'],
        fontSize=12,
        textColor=colors.HexColor('#1E293B'),
        spaceBefore=12,
        spaceAfter=6
    )
    normal_style = styles['Normal']

    elements = []

    # Title
    elements.append(Paragraph("GeM Official Bid Compliance Verification Report", title_style))
    elements.append(Paragraph(f"<b>Audit-Ready Compliance Verification & Evidence Mapping</b>", normal_style))
    elements.append(Spacer(1, 10))

    # Meta Table
    meta_data = [
        ["Bid Number:", bid.bid_number if bid else "N/A", "Vendor Name:", vendor.company_name if vendor else "N/A"],
        ["Department:", bid.department if bid else "N/A", "Reg Number:", vendor.reg_number if vendor else "N/A"],
        ["Compliance Score:", f"{submission.compliance_score}%", "Evaluation Status:", submission.status]
    ]
    t_meta = Table(meta_data, colWidths=[110, 160, 110, 160])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#F8FAFC')),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#CBD5E1')),
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,0), (-1,-1), 9),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    elements.append(t_meta)
    elements.append(Spacer(1, 15))

    # Compliance Results Summary
    elements.append(Paragraph("Detailed Requirement Verification Matrix", h2_style))
    
    table_data = [["Req ID", "Category", "Requirement", "Status", "Evidence Source", "Page"]]
    
    for r in results:
        req_id = r.requirement.requirement_id if r.requirement else "N/A"
        cat = r.requirement.category if r.requirement else "General"
        req_desc = r.requirement.requirement[:50] + "..." if r.requirement and len(r.requirement.requirement) > 50 else (r.requirement.requirement if r.requirement else "")
        status_text = r.status
        doc_name = r.source_doc_name or "N/A"
        page_num = str(r.source_page) if r.source_page else "-"

        table_data.append([
            req_id,
            cat,
            Paragraph(req_desc, normal_style),
            status_text,
            doc_name[:20],
            page_num
        ])

    t_results = Table(table_data, colWidths=[55, 75, 180, 85, 100, 45])
    t_results.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0F172A')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#E2E8F0')),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('FONTSIZE', (0,0), (-1,-1), 8),
        ('PADDING', (0,0), (-1,-1), 5),
    ]))
    elements.append(t_results)
    elements.append(Spacer(1, 15))

    # Detailed AI Reasoning section
    elements.append(Paragraph("AI & Human Audit Decision Reasoning", h2_style))
    for r in results[:10]:
        req_title = r.requirement.requirement if r.requirement else "Requirement"
        elements.append(Paragraph(f"<b>[{r.status}] {r.requirement.requirement_id if r.requirement else ''}: {req_title}</b>", normal_style))
        elements.append(Paragraph(f"<i>Reason:</i> {r.reasoning}", normal_style))
        elements.append(Paragraph(f"<i>Evidence:</i> {r.evidence_text or 'N/A'} (Doc: {r.source_doc_name or 'N/A'}, Page {r.source_page or '-'})", normal_style))
        elements.append(Spacer(1, 6))

    doc.build(elements)
    buffer.seek(0)

    filename = f"Compliance_Report_{vendor.company_name.replace(' ', '_') if vendor else 'Vendor'}_{bid.bid_number.replace('/', '_') if bid else 'Bid'}.pdf"
    return Response(
        content=buffer.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/csv/{submission_id}")
def generate_csv_report(
    submission_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_optional_current_user)
):
    submission = db.query(Submission).filter(
        (Submission.id == submission_id) | (Submission.vendor_id == submission_id) | (Submission.bid_id == submission_id)
    ).first()
    if not submission:
        submission = db.query(Submission).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found.")

    results = db.query(ComplianceResult).filter(ComplianceResult.submission_id == submission.id).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Requirement ID", "Category", "Requirement Text", "Mandatory",
        "Compliance Status", "Confidence", "Reasoning Summary",
        "Evidence Document", "Source Page", "Verification Method"
    ])

    for r in results:
        writer.writerow([
            r.requirement.requirement_id if r.requirement else "",
            r.requirement.category if r.requirement else "",
            r.requirement.requirement if r.requirement else "",
            "Yes" if (r.requirement and r.requirement.mandatory) else "No",
            r.status,
            r.confidence,
            r.reasoning,
            r.source_doc_name or "",
            r.source_page or "",
            r.verification_method
        ])

    output.seek(0)
    filename = f"Compliance_Matrix_{submission_id[:8]}.csv"
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
