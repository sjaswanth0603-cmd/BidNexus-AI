import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status

from app.database.mongodb import (
    results_col, reviews_col, submissions_col, audit_logs_col
)
from app.schemas.schemas import HumanReviewCreate, HumanReviewOut
from app.auth.security import get_current_user, get_current_admin, UserSession

router = APIRouter(prefix="/reviews", tags=["Human-in-the-Loop Reviews"])

@router.post("", response_model=HumanReviewOut)
def override_compliance_result(
    review_in: HumanReviewCreate,
    current_user: UserSession = Depends(get_current_admin)
):
    res_col = results_col()
    result = res_col.find_one({"id": review_in.result_id})
    if not result:
        raise HTTPException(status_code=404, detail="Compliance result record not found.")

    prev_status = result.get("status", "REVIEW_REQUIRED")
    now_str = datetime.now(timezone.utc).isoformat()

    # Update status on result
    res_col.update_one(
        {"id": review_in.result_id},
        {"$set": {
            "status": review_in.final_status,
            "evaluated_at": now_str
        }}
    )

    review_id = str(uuid.uuid4())
    rev_col = reviews_col()
    review_obj = {
        "id": review_id,
        "result_id": result["id"],
        "previous_status": prev_status,
        "final_status": review_in.final_status,
        "reviewer_id": current_user.get("id"),
        "reason": review_in.reason,
        "created_at": now_str
    }
    rev_col.insert_one(review_obj)

    # Recalculate submission score
    sub_col = submissions_col()
    submission_id = result.get("submission_id")
    if submission_id:
        all_results = list(res_col.find({"submission_id": submission_id}))
        compliant_count = sum(1 for r in all_results if r.get("status") in ["COMPLIANT", "APPROVED"])
        total_count = len(all_results)
        if total_count > 0:
            new_score = round((compliant_count / total_count * 100), 1)
            sub_col.update_one(
                {"id": submission_id},
                {"$set": {"compliance_score": new_score}}
            )

    audits = audit_logs_col()
    audits.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": current_user.get("id"),
        "action": "HUMAN_REVIEW_OVERRIDE",
        "entity_type": "ComplianceResult",
        "entity_id": result["id"],
        "details": f"Status changed from {prev_status} to {review_in.final_status} by Evaluator {current_user.get('email')}. Reason: {review_in.reason}",
        "timestamp": now_str
    })

    return review_obj

