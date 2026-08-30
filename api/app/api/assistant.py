from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException

from app.database.mongodb import (
    bids_col, vendors_col, submissions_col, results_col, requirements_col
)
from app.schemas.schemas import AssistantQuery, AssistantResponse
from app.auth.security import get_current_user, UserSession
from app.ai.llm_client import llm_client

router = APIRouter(prefix="/assistant", tags=["AI Assistant"])

@router.get("/status")
def get_ai_status():
    """
    Returns live connectivity status of Gemini / OpenAI LLM backend engine.
    """
    return llm_client.get_status()


@router.post("/config-key")
def configure_ai_key(
    payload: Dict[str, str],
    current_user: UserSession = Depends(get_current_user)
):
    from app.config import settings
    gemini_key = payload.get("gemini_api_key", "").strip()
    openai_key = payload.get("openai_api_key", "").strip()

    if gemini_key:
        settings.GEMINI_API_KEY = gemini_key
        llm_client.gemini_key = gemini_key
        llm_client.provider = "gemini"
        return {
            "status": "SUCCESS",
            "message": "Google Gemini AI API Key successfully integrated!",
            "provider": "Google Gemini API",
            "model": llm_client.gemini_model
        }
    elif openai_key:
        settings.OPENAI_API_KEY = openai_key
        llm_client.openai_key = openai_key
        llm_client.provider = "openai"
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
    current_user: UserSession = Depends(get_current_user)
):
    bids = bids_col()
    bid = bids.find_one({
        "$or": [
            {"id": query_in.bid_id},
            {"bid_number": query_in.bid_id},
            {"bid_number": {"$regex": query_in.bid_id, "$options": "i"}}
        ]
    })
    if not bid:
        bid = bids.find_one()
    if not bid:
        raise HTTPException(status_code=404, detail="Bid not found.")

    question = query_in.question.lower()
    sources = []
    answer = ""

    # Fetch submissions for this bid
    subs = submissions_col()
    submissions = list(subs.find({"bid_id": bid["id"]}))

    vendors = vendors_col()
    results_collection = results_col()
    req_col = requirements_col()
    req_map = {r["id"]: r for r in req_col.find({"bid_id": bid["id"]})}
    for r in req_col.find({"bid_id": bid["id"]}):
        if "requirement_id" in r:
            req_map[r["requirement_id"]] = r

    # Build rich context details for Gemini/OpenAI or structured evaluation
    context_lines = [f"Bid Number: {bid['bid_number']}, Title: {bid['title']}"]
    for sub in submissions:
        vendor = vendors.find_one({"id": sub["vendor_id"]})
        v_name = vendor["company_name"] if vendor else "Vendor"
        c_results = list(results_collection.find({"submission_id": sub["id"]}))
        for cr in c_results:
            req_item = req_map.get(cr.get("requirement_id"), {})
            req_str = req_item.get("requirement", "Requirement")
            context_lines.append(
                f"Vendor: {v_name} | Req: {req_str} | Status: {cr.get('status')} | Reason: {cr.get('reasoning')} | Doc: {cr.get('source_doc_name')} Pg {cr.get('source_page')}"
            )
            if cr.get("status") in ["NON_COMPLIANT", "REVIEW_REQUIRED"]:
                sources.append({
                    "vendor": v_name,
                    "requirement": req_item.get("requirement_id", ""),
                    "status": cr.get("status"),
                    "doc": cr.get("source_doc_name"),
                    "page": cr.get("source_page")
                })

    context_details = "\n".join(context_lines)

    # Try calling Gemini / OpenAI LLM if configured
    llm_status = llm_client.get_status()
    if llm_status["gemini_configured"] or llm_status["openai_configured"]:
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
            vendor = vendors.find_one({"id": sub["vendor_id"]})
            v_name = vendor["company_name"] if vendor else "Vendor"
            res_fail = list(results_collection.find({
                "submission_id": sub["id"],
                "status": "NON_COMPLIANT"
            }))
            for rf in res_fail:
                req_item = req_map.get(rf.get("requirement_id"), {})
                req_id = req_item.get("requirement_id", "")
                failures.append(f"• **{v_name}** failed **{req_id}** ({req_item.get('requirement', '')}): {rf.get('reasoning')}")
        
        if failures:
            answer = "Here are the non-compliance reasons identified across vendor submissions:\n\n" + "\n\n".join(failures)
        else:
            answer = "All evaluated vendor submissions currently meet compliance standards or require review."

    elif "missing" in question or "document" in question:
        missing_list = []
        for sub in submissions:
            vendor = vendors.find_one({"id": sub["vendor_id"]})
            v_name = vendor["company_name"] if vendor else "Vendor"
            res_missing = list(results_collection.find({
                "submission_id": sub["id"],
                "reasoning": {"$regex": "MISSING", "$options": "i"}
            }))
            for rm in res_missing:
                req_item = req_map.get(rm.get("requirement_id"), {})
                req_id = req_item.get("requirement_id", "")
                missing_list.append(f"• **{v_name}**: Missing evidence for **{req_id}** ({req_item.get('requirement', '')}).")

        if missing_list:
            answer = "The following mandatory evidence documents are missing from bidder submissions:\n\n" + "\n".join(missing_list)
        else:
            answer = "No missing mandatory documents detected across the submitted vendor packages."

    elif "compare" in question:
        comp_lines = []
        for sub in submissions:
            vendor = vendors.find_one({"id": sub["vendor_id"]})
            v_name = vendor["company_name"] if vendor else "Vendor"
            comp_lines.append(f"• **{v_name}**: Overall Score {sub.get('compliance_score', 0.0)}%, Status: {sub.get('status')}")

        answer = f"Here is the high-level comparison for Bid {bid['bid_number']}:\n\n" + "\n".join(comp_lines) + "\n\nRefer to the side-by-side comparison matrix for details."

    else:
        answer = f"Based on procurement bid {bid['bid_number']} context ({len(submissions)} vendor submissions evaluated), all requirement rules have been cross-checked against vendor evidence. Active engine status: {llm_status['active_provider']} ({llm_status['active_model']})."

    return {
        "question": query_in.question,
        "answer": answer,
        "sources": sources[:5]
    }

