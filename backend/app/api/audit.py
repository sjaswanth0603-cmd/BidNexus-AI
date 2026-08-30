from typing import List
from fastapi import APIRouter, Depends

from app.database.mongodb import audit_logs_col
from app.schemas.schemas import AuditLogOut
from app.auth.security import get_current_user, get_current_admin, UserSession

router = APIRouter(prefix="/audit-logs", tags=["Audit Logs"])

@router.get("", response_model=List[AuditLogOut])
def get_audit_logs(
    current_user: UserSession = Depends(get_current_user)
):
    audits = audit_logs_col()
    raw_logs = list(audits.find())
    raw_logs.sort(key=lambda x: str(x.get("timestamp", "")), reverse=True)
    logs = raw_logs[:100]
    for log in logs:
        log.pop("_id", None)
    return logs

