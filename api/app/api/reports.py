import io
import csv
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse, Response

from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

from app.database.mongodb import (
    bids_col, vendors_col, submissions_col, results_col, requirements_col
)
from app.auth.security import get_current_user, get_optional_current_user

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/pdf/{submission_id}")
def generate_pdf_report(
    submission_id: str,
    current_user = Depends(get_optional_current_user)
):
    sub_col = submissions_col()
    submission = sub_col.find_one({
        "$or": [
            {"id": submission_id},
            {"vendor_id": submission_id},
            {"bid_id": submission_id}
        ]
    })
    if not submission:
        submission = sub_col.find_one()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission evaluation record not found.")

    bids = bids_col()
    bid = bids.find_one({"id": submission.get("bid_id")})

    vendors = vendors_col()
    vendor = vendors.find_one({"id": submission.get("vendor_id")})

    res_col = results_col()
    results = list(res_col.find({"submission_id": submission["id"]}))

    req_col = requirements_col()
    req_map = {r["id"]: r for r in req_col.find({"bid_id": submission.get("bid_id")})}
    for r in req_col.find({"bid_id": submission.get("bid_id")}):
        if "requirement_id" in r:
            req_map[r["requirement_id"]] = r

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
    elements.append(Paragraph("<b>Audit-Ready Compliance Verification & Evidence Mapping</b>", normal_style))
    elements.append(Spacer(1, 10))

    # Meta Table
    meta_data = [
        ["Bid Number:", bid.get("bid_number", "N/A") if bid else "N/A", "Vendor Name:", vendor.get("company_name", "N/A") if vendor else "N/A"],
        ["Department:", bid.get("department", "N/A") if bid else "N/A", "Reg Number:", vendor.get("reg_number", "N/A") if vendor else "N/A"],
        ["Compliance Score:", f"{submission.get('compliance_score', 0.0)}%", "Evaluation Status:", submission.get("status", "Pending")]
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
        req_item = req_map.get(r.get("requirement_id"), {})
        req_id = req_item.get("requirement_id", r.get("requirement_id", "N/A"))
        cat = req_item.get("category", "General")
        req_desc = req_item.get("requirement", "")
        if len(req_desc) > 50:
            req_desc = req_desc[:50] + "..."
        status_text = r.get("status", "Pending")
        doc_name = r.get("source_doc_name") or "N/A"
        page_num = str(r.get("source_page") or "-")

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
        req_item = req_map.get(r.get("requirement_id"), {})
        req_title = req_item.get("requirement", "Requirement")
        elements.append(Paragraph(f"<b>[{r.get('status')}] {req_item.get('requirement_id', '')}: {req_title}</b>", normal_style))
        elements.append(Paragraph(f"<i>Reason:</i> {r.get('reasoning')}", normal_style))
        elements.append(Paragraph(f"<i>Evidence:</i> {r.get('evidence_text') or 'N/A'} (Doc: {r.get('source_doc_name') or 'N/A'}, Page {r.get('source_page') or '-'})", normal_style))
        elements.append(Spacer(1, 6))

    doc.build(elements)
    buffer.seek(0)

    v_name = vendor.get("company_name", "Vendor").replace(" ", "_") if vendor else "Vendor"
    b_num = bid.get("bid_number", "Bid").replace("/", "_") if bid else "Bid"
    filename = f"Compliance_Report_{v_name}_{b_num}.pdf"
    return Response(
        content=buffer.getvalue(),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.get("/csv/{submission_id}")
def generate_csv_report(
    submission_id: str,
    current_user = Depends(get_optional_current_user)
):
    sub_col = submissions_col()
    submission = sub_col.find_one({
        "$or": [
            {"id": submission_id},
            {"vendor_id": submission_id},
            {"bid_id": submission_id}
        ]
    })
    if not submission:
        submission = sub_col.find_one()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found.")

    res_col = results_col()
    results = list(res_col.find({"submission_id": submission["id"]}))

    req_col = requirements_col()
    req_map = {r["id"]: r for r in req_col.find({"bid_id": submission.get("bid_id")})}
    for r in req_col.find({"bid_id": submission.get("bid_id")}):
        if "requirement_id" in r:
            req_map[r["requirement_id"]] = r

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Requirement ID", "Category", "Requirement Text", "Mandatory",
        "Compliance Status", "Confidence", "Reasoning Summary",
        "Evidence Document", "Source Page", "Verification Method"
    ])

    for r in results:
        req_item = req_map.get(r.get("requirement_id"), {})
        writer.writerow([
            req_item.get("requirement_id", r.get("requirement_id", "")),
            req_item.get("category", ""),
            req_item.get("requirement", ""),
            "Yes" if req_item.get("mandatory", True) else "No",
            r.get("status", ""),
            r.get("confidence", 1.0),
            r.get("reasoning", ""),
            r.get("source_doc_name") or "",
            r.get("source_page") or "",
            r.get("verification_method", "Hybrid Engine")
        ])

    output.seek(0)
    filename = f"Compliance_Matrix_{submission_id[:8]}.csv"
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

