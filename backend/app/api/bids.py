import os
import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status

from app.database.mongodb import bids_col, requirements_col, documents_col, chunks_col, audit_logs_col
from app.schemas.schemas import BidCreate, BidOut, BidDetail, RequirementCreate, RequirementOut
from app.auth.security import get_current_user, UserSession
from app.document_processing.extractor import process_document_bytes, upload_file_to_cloudinary
from app.ai.requirement_extractor import extract_requirements_from_text

router = APIRouter(prefix="/bids", tags=["Bids"])

@router.post("", response_model=BidOut, status_code=status.HTTP_201_CREATED)
def create_bid(bid_in: BidCreate, current_user: UserSession = Depends(get_current_user)):
    bids = bids_col()
    existing = bids.find_one({"bid_number": bid_in.bid_number})
    if existing:
        raise HTTPException(status_code=400, detail=f"Bid with number '{bid_in.bid_number}' already exists.")

    new_bid_id = str(uuid.uuid4())
    now_str = datetime.now(timezone.utc).isoformat()

    new_bid = {
        "id": new_bid_id,
        "bid_number": bid_in.bid_number,
        "title": bid_in.title,
        "department": bid_in.department,
        "description": bid_in.description,
        "deadline": bid_in.deadline,
        "created_by": current_user.get("id"),
        "status": "Open",
        "bid_document_path": None,
        "created_at": now_str
    }
    bids.insert_one(new_bid)

    audits = audit_logs_col()
    audits.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user.get("id"),
        "action": "BID_CREATED",
        "entity_type": "Bid",
        "entity_id": new_bid_id,
        "details": f"Bid '{new_bid['bid_number']}' created by {current_user.get('email')}.",
        "timestamp": now_str
    })

    return new_bid


@router.get("", response_model=List[BidOut])
def list_bids(current_user: UserSession = Depends(get_current_user)):
    bids = bids_col()
    reqs = requirements_col()
    all_bids = bids.find()
    results = []
    for b in all_bids:
        b_dict = dict(b)
        b_dict["requirements_count"] = reqs.count_documents({"bid_id": b["id"]})
        results.append(b_dict)
    return results


@router.get("/{bid_id}", response_model=BidDetail)
def get_bid_detail(bid_id: str, current_user: UserSession = Depends(get_current_user)):
    bids = bids_col()
    reqs = requirements_col()
    bid = bids.find_one({
        "$or": [
            {"id": bid_id},
            {"bid_number": bid_id},
            {"bid_number": {"$regex": bid_id, "$options": "i"}}
        ]
    })
    if not bid:
        raise HTTPException(status_code=404, detail="Bid tender document not found.")

    bid_dict = dict(bid)
    bid_dict["requirements"] = reqs.find({"bid_id": bid["id"]})
    return bid_dict


@router.api_route("/{bid_id}/documents", methods=["GET", "POST"])
async def upload_bid_document(
    bid_id: str,
    file: UploadFile = File(None),
    current_user: UserSession = Depends(get_current_user)
):
    bids = bids_col()
    bid = bids.find_one({
        "$or": [
            {"id": bid_id},
            {"bid_number": bid_id},
            {"bid_number": {"$regex": bid_id, "$options": "i"}}
        ]
    })
    if not bid:
        bid = bids.find_one()
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found.")

    if not file:
        return {"message": "No file uploaded, bid detail active.", "bid_id": bid["id"]}

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".pdf", ".docx", ".doc"]:
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF and DOCX files are allowed.")

    file_id = str(uuid.uuid4())
    content = await file.read()

    # Upload to Cloudinary
    cloud_url = upload_file_to_cloudinary(content, file.filename)

    docs = documents_col()
    doc_obj = {
        "id": file_id,
        "bid_id": bid["id"],
        "file_name": file.filename,
        "file_path": cloud_url,
        "file_size": len(content),
        "document_type": "Tender Document",
        "uploaded_at": datetime.now(timezone.utc).isoformat()
    }
    docs.insert_one(doc_obj)
    bids.update_one({"id": bid["id"]}, {"$set": {"bid_document_path": cloud_url}})

    # Extract text chunks directly from in-memory bytes
    chunks_data = process_document_bytes(content, file_id, file.filename)
    chunks = chunks_col()
    chunk_objs = []
    for c in chunks_data:
        chunk_objs.append({
            "id": str(uuid.uuid4()),
            "document_id": file_id,
            "page_number": c["page_number"],
            "section": c.get("section", f"Page {c['page_number']}"),
            "chunk_text": c["chunk_text"]
        })
    if chunk_objs:
        chunks.insert_many(chunk_objs)

    return {
        "message": "Bid tender document uploaded to Cloudinary and processed successfully.",
        "file_name": file.filename,
        "file_size": len(content),
        "file_url": cloud_url,
        "chunks_extracted": len(chunks_data)
    }


@router.api_route("/{bid_id}/extract-requirements", methods=["GET", "POST"])
def extract_requirements(bid_id: str, current_user: UserSession = Depends(get_current_user)):
    bids = bids_col()
    bid = bids.find_one({
        "$or": [
            {"id": bid_id},
            {"bid_number": bid_id},
            {"bid_number": {"$regex": bid_id, "$options": "i"}}
        ]
    })
    if not bid:
        bid = bids.find_one()
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found.")

    docs = documents_col()
    bid_docs = docs.find({"bid_id": bid["id"]})
    doc_ids = [d["id"] for d in bid_docs]

    chunks = chunks_col()
    matching_chunks = chunks.find({"document_id": {"$in": doc_ids}}) if doc_ids else []
    
    chunk_dicts = [
        {
            "chunk_text": c["chunk_text"],
            "page_number": c["page_number"],
            "section": c.get("section", f"Page {c['page_number']}"),
            "file_name": "tender.pdf"
        }
        for c in matching_chunks
    ]

    extracted_list = extract_requirements_from_text(chunk_dicts)

    reqs = requirements_col()
    req_objs = []
    for item in extracted_list:
        r_doc = {
            "id": str(uuid.uuid4()),
            "bid_id": bid["id"],
            "requirement_id": item["requirement_id"],
            "category": item["category"],
            "requirement": item["requirement"],
            "operator": item.get("operator", "=="),
            "value": str(item.get("value", "")),
            "unit": item.get("unit", ""),
            "mandatory": item.get("mandatory", True),
            "evidence_required": item.get("evidence_required", "Supporting Document"),
            "source_page": item.get("source_page", 1),
            "confidence": item.get("confidence", 0.95),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        req_objs.append(r_doc)

    if req_objs:
        reqs.insert_many(req_objs)

    audits = audit_logs_col()
    audits.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user.get("id"),
        "action": "REQUIREMENTS_EXTRACTED",
        "entity_type": "Bid",
        "entity_id": bid["id"],
        "details": f"Extracted {len(req_objs)} compliance requirements for Bid {bid['bid_number']}.",
        "timestamp": datetime.now(timezone.utc).isoformat()
    })

    return req_objs


@router.get("/{bid_id}/requirements", response_model=List[RequirementOut])
def list_requirements(bid_id: str, current_user: UserSession = Depends(get_current_user)):
    bids = bids_col()
    bid = bids.find_one({
        "$or": [
            {"id": bid_id},
            {"bid_number": bid_id},
            {"bid_number": {"$regex": bid_id, "$options": "i"}}
        ]
    })
    target_id = bid["id"] if bid else bid_id
    reqs = requirements_col()
    return reqs.find({"bid_id": target_id})


@router.post("/{bid_id}/requirements", response_model=RequirementOut)
def add_requirement(
    bid_id: str,
    req_in: RequirementCreate,
    current_user: UserSession = Depends(get_current_user)
):
    bids = bids_col()
    bid = bids.find_one({"id": bid_id})
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found.")

    reqs = requirements_col()
    r_doc = {
        "id": str(uuid.uuid4()),
        "bid_id": bid["id"],
        "requirement_id": req_in.requirement_id,
        "category": req_in.category,
        "requirement": req_in.requirement,
        "operator": req_in.operator,
        "value": req_in.value,
        "unit": req_in.unit,
        "mandatory": req_in.mandatory,
        "evidence_required": req_in.evidence_required,
        "source_page": req_in.source_page,
        "confidence": req_in.confidence,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    reqs.insert_one(r_doc)
    return r_doc


@router.put("/{bid_id}/requirements/{req_id}", response_model=RequirementOut)
def update_requirement(
    bid_id: str,
    req_id: str,
    req_in: RequirementCreate,
    current_user: UserSession = Depends(get_current_user)
):
    reqs = requirements_col()
    req = reqs.find_one({"id": req_id, "bid_id": bid_id})
    if not req:
        raise HTTPException(status_code=404, detail="Requirement not found.")

    update_fields = {
        "category": req_in.category,
        "requirement": req_in.requirement,
        "operator": req_in.operator,
        "value": req_in.value,
        "unit": req_in.unit,
        "mandatory": req_in.mandatory,
        "evidence_required": req_in.evidence_required,
        "source_page": req_in.source_page
    }
    reqs.update_one({"id": req_id}, {"$set": update_fields})
    req.update(update_fields)
    return req


@router.delete("/{bid_id}/requirements/{req_id}")
def delete_requirement(
    bid_id: str,
    req_id: str,
    current_user: UserSession = Depends(get_current_user)
):
    reqs = requirements_col()
    req = reqs.find_one({"id": req_id, "bid_id": bid_id})
    if not req:
        raise HTTPException(status_code=404, detail="Requirement not found.")
    reqs.delete_one({"id": req_id})
    return {"message": "Requirement deleted successfully."}

