from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.models import ComplianceResult, HumanReview, Submission, AuditLog, User
from app.schemas.schemas import HumanReviewCreate, HumanReviewOut
from app.auth.security import get_current_user, get_current_admin

router = APIRouter(prefix="/reviews", tags=["Human-in-the-Loop Reviews"])

@router.post("", response_model=HumanReviewOut)
def override_compliance_result(
    review_in: HumanReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin)
):
    result = db.query(ComplianceResult).filter(ComplianceResult.id == review_in.result_id).first()
    if not result:
        raise HTTPException(status_code=404, detail="Compliance result record not found.")

    prev_status = result.status

    # Preserve original AI status; set new status on result
    result.status = review_in.final_status

    review_obj = HumanReview(
        result_id=result.id,
        previous_status=prev_status,
        final_status=review_in.final_status,
        reviewer_id=current_user.id,
        reason=review_in.reason
    )
    db.add(review_obj)

    # Recalculate submission score
    submission = db.query(Submission).filter(Submission.id == result.submission_id).first()
    if submission:
        all_results = db.query(ComplianceResult).filter(ComplianceResult.submission_id == submission.id).all()
        compliant_count = sum(1 for r in all_results if r.status in ["COMPLIANT", "APPROVED"])
        total_count = len(all_results)
        if total_count > 0:
            submission.compliance_score = round((compliant_count / total_count * 100), 1)

    db.commit()
    db.refresh(review_obj)

    audit = AuditLog(
        user_id=current_user.id,
        action="HUMAN_REVIEW_OVERRIDE",
        entity_type="ComplianceResult",
        entity_id=result.id,
        details=f"Status changed from {prev_status} to {review_in.final_status} by Evaluator {current_user.email}. Reason: {review_in.reason}"
    )
    db.add(audit)
    db.commit()

    return review_obj
