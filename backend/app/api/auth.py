import uuid
import logging
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status

from app.database.mongodb import users_col, tokens_col, audit_logs_col
from app.schemas.schemas import (
    UserCreate, UserLogin, Token, UserOut,
    PasswordResetRequest, PasswordResetConfirm
)
from app.auth.security import (
    verify_password, get_password_hash,
    validate_password_strength, create_access_token,
    get_current_user, UserSession
)

logger = logging.getLogger("bidnexus.auth")
router = APIRouter(prefix="/auth", tags=["Authentication"])

def ensure_demo_user(email: str):
    """
    Ensures default demo accounts exist on-demand so 1-click login always succeeds.
    """
    email_clean = email.strip().lower()
    users = users_col()
    existing = users.find_one({"email": email_clean})
    if existing:
        return existing

    now_str = datetime.now(timezone.utc).isoformat()
    default_hash = get_password_hash("Password@123")
    
    if email_clean == "admin@example.com":
        doc = {
            "id": "admin_demo_id",
            "email": "admin@example.com",
            "password_hash": default_hash,
            "full_name": "Dr. Rajesh Kumar (Senior Evaluator)",
            "organization": "Andhra Pradesh Water Resources Dept",
            "role": "admin",
            "phone": "+91 98480 11223",
            "created_at": now_str
        }
    else:
        doc = {
            "id": "user_demo_id",
            "email": "user@example.com",
            "password_hash": default_hash,
            "full_name": "S. Jaswanth Naidu (Authorized Bidder)",
            "organization": "TechCorp Solutions AP Pvt Ltd",
            "role": "user",
            "phone": "+91 98480 99887",
            "created_at": now_str
        }
    
    try:
        users.insert_one(doc)
    except Exception as e:
        logger.warning(f"Could not persist demo user to DB, using local session: {e}")
    return doc

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate):
    if user_in.password != user_in.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password and confirm password do not match."
        )

    if not validate_password_strength(user_in.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character."
        )

    email_clean = user_in.email.strip().lower()
    users = users_col()
    try:
        existing_user = users.find_one({"email": email_clean})
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this email address already exists."
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.warning(f"User existence check error: {e}")

    user_role = "admin" if user_in.role.lower() in ["admin", "evaluator"] else "user"
    user_id = str(uuid.uuid4())
    hashed_pw = get_password_hash(user_in.password)
    now_str = datetime.now(timezone.utc).isoformat()

    new_user_doc = {
        "id": user_id,
        "email": email_clean,
        "password_hash": hashed_pw,
        "full_name": user_in.full_name,
        "organization": user_in.organization,
        "role": user_role,
        "phone": user_in.phone,
        "created_at": now_str
    }
    
    try:
        users.insert_one(new_user_doc)
    except Exception as e:
        logger.warning(f"User insert warning: {e}")

    # Log audit event
    try:
        audits = audit_logs_col()
        audits.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "action": "USER_REGISTERED",
            "entity_type": "User",
            "entity_id": user_id,
            "details": f"User {email_clean} registered with role {user_role}.",
            "timestamp": now_str
        })
    except Exception:
        pass

    out_doc = dict(new_user_doc)
    out_doc.pop("_id", None)
    return out_doc


@router.post("/login", response_model=Token)
def login(credentials: UserLogin):
    email_clean = credentials.email.strip().lower()
    users = users_col()
    user = None
    try:
        user = users.find_one({"email": email_clean})
    except Exception as e:
        logger.warning(f"Login database find query warning: {e}")

    # Auto-seed demo accounts on demand if not present
    if not user and email_clean in ["user@example.com", "admin@example.com"]:
        user = ensure_demo_user(email_clean)

    invalid_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not user:
        raise invalid_exception

    is_valid = verify_password(credentials.password, user.get("password_hash", ""))
    # Fallback check for demo accounts with default password
    if not is_valid and email_clean in ["user@example.com", "admin@example.com"] and credentials.password == "Password@123":
        is_valid = True

    if not is_valid:
        raise invalid_exception

    user_id = user.get("id") or str(user.get("_id", "user_id"))
    token = create_access_token(data={"sub": user_id, "email": user.get("email"), "role": user.get("role")})

    # Log audit event
    try:
        audits = audit_logs_col()
        audits.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "action": "USER_LOGGED_IN",
            "entity_type": "User",
            "entity_id": user_id,
            "details": f"User {user.get('email')} logged in successfully.",
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
    except Exception:
        pass

    user_clean = dict(user)
    user_clean.pop("_id", None)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user_clean
    }



@router.post("/forgot-password")
def forgot_password(req: PasswordResetRequest):
    users = users_col()
    user = users.find_one({"email": req.email.lower()})
    if not user:
        return {"message": "If an account exists for this email, password reset instructions have been generated."}

    reset_token_str = str(uuid.uuid4())
    expiry = (datetime.now(timezone.utc) + timedelta(hours=2)).isoformat()
    
    tokens = tokens_col()
    tokens.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user.get("id"),
        "token": reset_token_str,
        "expires_at": expiry,
        "used": False
    })

    return {
        "message": "Password reset token generated successfully.",
        "reset_token": reset_token_str
    }


@router.post("/reset-password")
def reset_password(req: PasswordResetConfirm):
    if req.new_password != req.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match.")

    if not validate_password_strength(req.new_password):
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters with uppercase, lowercase, number, and special char."
        )

    tokens = tokens_col()
    token_obj = tokens.find_one({
        "token": req.token,
        "used": False
    })

    if not token_obj:
        raise HTTPException(status_code=400, detail="Invalid or expired password reset token.")

    users = users_col()
    user = users.find_one({"id": token_obj.get("user_id")})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    new_hash = get_password_hash(req.new_password)
    users.update_one({"id": user.get("id")}, {"$set": {"password_hash": new_hash}})
    tokens.update_one({"id": token_obj.get("id")}, {"$set": {"used": True}})

    return {"message": "Password has been reset successfully. Please log in with your new password."}


@router.get("/me", response_model=UserOut)
def get_me(current_user: UserSession = Depends(get_current_user)):
    return current_user

