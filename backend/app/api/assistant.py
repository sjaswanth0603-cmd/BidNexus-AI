from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.models import Bid, Vendor, Submission, ComplianceResult, DocumentChunk, User
from app.schemas.schemas import AssistantQuery, AssistantResponse
from app.auth.security import get_current_user
from app.ai.llm_client import llm_client

router = APIRouter(prefix="/assistant", tags=["AI Assistant"])

@router.get("/status")
def get_ai_status():
    """
    Returns live connectivity status of OpenAI / Gemini LLM backend engine.
    """
    return llm_client.get_status()


@router.post("/config-key")
def configure_openai_key(
    payload: Dict[str, str],
    current_user: User = Depends(get_current_user)
):
    key = payload.get("openai_api_key", "").strip()
    from app.config import settings
    if key:
        settings.OPENAI_API_KEY = key
        llm_client.openai_key = key
        return {
            "status": "SUCCESS",
            "message": "OpenAI ChatGPT API Key successfully integrated!",
            "provider": "OpenAI API",
            "model": llm_client.openai_model
        }
    else:
        return {
            "status": "SUCCESS",
            "message": "Switched to Local Hybrid RAG Engine",
            "provider": "Local Hybrid Engine"
        }


@router.post("/query", response_model=AssistantResponse)
def ask_ai_assistant(
    query_in: AssistantQuery,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    bid = db.query(Bid).filter(
        (Bid.id == query_in.bid_id) | (Bid.bid_number == query_in.bid_id) | (Bid.bid_number.contains(query_in.bid_id))
    ).first()
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found.")

    question = query_in.question.lower()
    sources = []
    answer = ""

    # Fetch submissions for this bid
    submissions = db.query(Submission).filter(Submission.bid_id == bid.id).all()

    # Build rich context details for LLM or structured evaluation
    context_lines = [f"Bid Number: {bid.bid_number}, Title: {bid.title}"]
    for sub in submissions:
        v_name = sub.vendor.company_name if sub.vendor else "Vendor"
        c_results = db.query(ComplianceResult).filter(ComplianceResult.submission_id == sub.id).all()
        for cr in c_results:
            req_str = cr.requirement.requirement if cr.requirement else "Requirement"
            context_lines.append(
                f"Vendor: {v_name} | Req: {req_str} | Status: {cr.status} | Reason: {cr.reasoning} | Doc: {cr.source_doc_name} Pg {cr.source_page}"
            )
            if cr.status in ["NON_COMPLIANT", "REVIEW_REQUIRED"]:
                sources.append({
                    "vendor": v_name,
                    "requirement": cr.requirement.requirement_id if cr.requirement else "",
                    "status": cr.status,
                    "doc": cr.source_doc_name,
                    "page": cr.source_page
                })

    context_details = "\n".join(context_lines)

    # Try calling OpenAI / Gemini LLM if configured
    llm_status = llm_client.get_status()
    if llm_status["openai_configured"] or llm_status["gemini_configured"]:
        llm_answer = llm_client.query_copilot(query_in.question, context_details)
        if llm_answer:
            return {
                "question": query_in.question,
                "answer": llm_answer,
                "sources": sources[:5]
            }

    # Structured RAG Fallback
    if "why" in question and ("non-compliant" in question or "fail" in question):
        failures = []
        for sub in submissions:
            v_name = sub.vendor.company_name if sub.vendor else "Vendor"
            res_fail = db.query(ComplianceResult).filter(
                ComplianceResult.submission_id == sub.id,
                ComplianceResult.status == "NON_COMPLIANT"
            ).all()
            for rf in res_fail:
                req_id = rf.requirement.requirement_id if rf.requirement else ""
                failures.append(f"• **{v_name}** failed **{req_id}** ({rf.requirement.requirement if rf.requirement else ''}): {rf.reasoning}")
        
        if failures:
            answer = f"Here are the non-compliance reasons identified across vendor submissions:\n\n" + "\n\n".join(failures)
        else:
            answer = "All evaluated vendor submissions currently meet compliance standards or require review."

    elif "missing" in question or "document" in question:
        missing_list = []
        for sub in submissions:
            v_name = sub.vendor.company_name if sub.vendor else "Vendor"
            res_missing = db.query(ComplianceResult).filter(
                ComplianceResult.submission_id == sub.id,
                ComplianceResult.reasoning.like("%MISSING%")
            ).all()
            for rm in res_missing:
                req_id = rm.requirement.requirement_id if rm.requirement else ""
                missing_list.append(f"• **{v_name}**: Missing evidence for **{req_id}** ({rm.requirement.requirement if rm.requirement else ''}).")

        if missing_list:
            answer = f"The following mandatory evidence documents are missing from bidder submissions:\n\n" + "\n".join(missing_list)
        else:
            answer = "No missing mandatory documents detected across the submitted vendor packages."

    elif "compare" in question:
        comp_lines = []
        for sub in submissions:
            v_name = sub.vendor.company_name if sub.vendor else "Vendor"
            comp_lines.append(f"• **{v_name}**: Overall Score {sub.compliance_score}%, Status: {sub.status}")

        answer = f"Here is the high-level comparison for Bid {bid.bid_number}:\n\n" + "\n".join(comp_lines) + "\n\nRefer to the side-by-side comparison matrix for details."

    else:
        answer = f"Based on procurement bid {bid.bid_number} context ({len(submissions)} vendor submissions evaluated), all requirement rules have been cross-checked against vendor evidence. Active engine status: {llm_status['active_provider']} ({llm_status['active_model']})."

    return {
        "question": query_in.question,
        "answer": answer,
        "sources": sources[:5]
    }
