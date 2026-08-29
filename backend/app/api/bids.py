import os
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from app.config import settings
from app.database.session import get_db
from app.models.models import Bid, Requirement, Document, DocumentChunk, User, AuditLog
from app.schemas.schemas import BidCreate, BidOut, BidDetail, RequirementCreate, RequirementOut
from app.auth.security import get_current_user
from app.document_processing.extractor import process_document_file
from app.ai.requirement_extractor import extract_requirements_from_text

router = APIRouter(prefix="/bids", tags=["Bids"])

@router.post("", response_model=BidOut, status_code=status.HTTP_201_CREATED)
def create_bid(bid_in: BidCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    existing = db.query(Bid).filter(Bid.bid_number == bid_in.bid_number).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Bid with number '{bid_in.bid_number}' already exists.")

    new_bid = Bid(
        bid_number=bid_in.bid_number,
        title=bid_in.title,
        department=bid_in.department,
        description=bid_in.description,
        deadline=bid_in.deadline,
        created_by=current_user.id,
        status="Open"
    )
    db.add(new_bid)
    db.commit()
    db.refresh(new_bid)

    audit = AuditLog(
        user_id=current_user.id,
        action="BID_CREATED",
        entity_type="Bid",
        entity_id=new_bid.id,
        details=f"Bid '{new_bid.bid_number}' created by {current_user.email}."
    )
    db.add(audit)
    db.commit()

    try:
        from app.database.mongodb import sync_all_data_to_mongodb
        sync_all_data_to_mongodb(db)
    except Exception:
        pass

    return new_bid


@router.get("", response_model=List[BidOut])
def list_bids(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    bids = db.query(Bid).all()
    results = []
    for b in bids:
        b_out = BidOut.model_validate(b)
        b_out.requirements_count = db.query(Requirement).filter(Requirement.bid_id == b.id).count()
        results.append(b_out)
    return results


@router.get("/{bid_id}", response_model=BidDetail)
def get_bid_detail(bid_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    bid = db.query(Bid).filter(
        (Bid.id == bid_id) | (Bid.bid_number == bid_id) | (Bid.bid_number.contains(bid_id))
    ).first()
    if not bid:
        raise HTTPException(status_code=404, detail="Bid tender document not found.")
    return bid


@router.post("/{bid_id}/documents")
async def upload_bid_document(
    bid_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    bid = db.query(Bid).filter(Bid.id == bid_id).first()
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found.")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".pdf", ".docx", ".doc"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF and DOCX files are allowed.")

    file_id = str(uuid.uuid4())
    saved_filename = f"{file_id}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, saved_filename)

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    doc_obj = Document(
        id=file_id,
        bid_id=bid.id,
        file_name=file.filename,
        file_path=file_path,
        file_size=len(content),
        document_type="Tender Document"
    )
    db.add(doc_obj)
    bid.bid_document_path = file_path
    db.commit()

    # Extract text chunks preserving page numbers
    chunks_data = process_document_file(file_path, doc_obj.id, file.filename)
    chunk_objs = []
    for c in chunks_data:
        chunk_objs.append(DocumentChunk(
            document_id=doc_obj.id,
            page_number=c["page_number"],
            section=c.get("section", f"Page {c['page_number']}"),
            chunk_text=c["chunk_text"]
        ))
    db.add_all(chunk_objs)
    db.commit()

    return {
        "message": "Bid tender document uploaded and processed successfully.",
        "file_name": file.filename,
        "file_size": len(content),
        "chunks_extracted": len(chunks_data)
    }


@router.post("/{bid_id}/extract-requirements", response_model=List[RequirementOut])
def extract_requirements(bid_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    bid = db.query(Bid).filter(Bid.id == bid_id).first()
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found.")

    # Retrieve all document chunks for this bid
    chunks = db.query(DocumentChunk).join(Document).filter(Document.bid_id == bid_id).all()
    chunk_dicts = [
        {
            "chunk_text": c.chunk_text,
            "page_number": c.page_number,
            "section": c.section,
            "file_name": c.document.file_name if c.document else "tender.pdf"
        }
        for c in chunks
    ]

    extracted_list = extract_requirements_from_text(chunk_dicts)

    # Save requirements into DB
    req_objs = []
    for item in extracted_list:
        req_objs.append(Requirement(
            bid_id=bid.id,
            requirement_id=item["requirement_id"],
            category=item["category"],
            requirement=item["requirement"],
            operator=item.get("operator", "=="),
            value=str(item.get("value", "")),
            unit=item.get("unit", ""),
            mandatory=item.get("mandatory", True),
            evidence_required=item.get("evidence_required", "Supporting Document"),
            source_page=item.get("source_page", 1),
            confidence=item.get("confidence", 0.95)
        ))

    db.add_all(req_objs)
    db.commit()

    # Log audit event
    audit = AuditLog(
        user_id=current_user.id,
        action="REQUIREMENTS_EXTRACTED",
        entity_type="Bid",
        entity_id=bid.id,
        details=f"Extracted {len(req_objs)} compliance requirements for Bid {bid.bid_number}."
    )
    db.add(audit)
    db.commit()

    return req_objs


@router.get("/{bid_id}/requirements", response_model=List[RequirementOut])
def list_requirements(bid_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    bid = db.query(Bid).filter(
        (Bid.id == bid_id) | (Bid.bid_number == bid_id) | (Bid.bid_number.contains(bid_id))
    ).first()
    target_id = bid.id if bid else bid_id
    return db.query(Requirement).filter(Requirement.bid_id == target_id).all()


@router.post("/{bid_id}/requirements", response_model=RequirementOut)
def add_requirement(
    bid_id: str,
    req_in: RequirementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    bid = db.query(Bid).filter(Bid.id == bid_id).first()
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found.")

    req = Requirement(
        bid_id=bid.id,
        requirement_id=req_in.requirement_id,
        category=req_in.category,
        requirement=req_in.requirement,
        operator=req_in.operator,
        value=req_in.value,
        unit=req_in.unit,
        mandatory=req_in.mandatory,
        evidence_required=req_in.evidence_required,
        source_page=req_in.source_page,
        confidence=req_in.confidence
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return req


@router.put("/{bid_id}/requirements/{req_id}", response_model=RequirementOut)
def update_requirement(
    bid_id: str,
    req_id: str,
    req_in: RequirementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    req = db.query(Requirement).filter(Requirement.id == req_id, Requirement.bid_id == bid_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Requirement not found.")

    req.category = req_in.category
    req.requirement = req_in.requirement
    req.operator = req_in.operator
    req.value = req_in.value
    req.unit = req_in.unit
    req.mandatory = req_in.mandatory
    req.evidence_required = req_in.evidence_required
    req.source_page = req_in.source_page
    db.commit()
    db.refresh(req)
    return req


@router.delete("/{bid_id}/requirements/{req_id}")
def delete_requirement(
    bid_id: str,
    req_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    req = db.query(Requirement).filter(Requirement.id == req_id, Requirement.bid_id == bid_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Requirement not found.")
    db.delete(req)
    db.commit()
    return {"message": "Requirement deleted successfully."}
