from typing import List
from fastapi import APIRouter, Depends

from app.database.mongodb import audit_logs_col
from app.schemas.schemas import AuditLogOut
from app.auth.security import get_current_user, get_current_admin, UserSession

router = APIRouter(prefix="/audit-logs", tags=["Audit Logs"])

@router.get("", response_model=List[AuditLogOut])
def get_audit_logs(
    current_user: UserSession = Depends(get_current_admin)
):
    audits = audit_logs_col()
    logs = list(audits.find().sort("timestamp", -1).limit(100))
    return logs

