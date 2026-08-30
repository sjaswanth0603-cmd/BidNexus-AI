import uuid
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

router = APIRouter(prefix="/auth", tags=["Authentication"])

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
    existing_user = users.find_one({"email": email_clean})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    user_role = "user"
    if user_in.role.lower() in ["admin", "evaluator"]:
        user_role = "admin"
    else:
        user_role = "user"

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
    users.insert_one(new_user_doc)

    # Log audit event
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

    return new_user_doc


@router.post("/login", response_model=Token)
def login(credentials: UserLogin):
    email_clean = credentials.email.strip().lower()
    users = users_col()
    user = users.find_one({"email": email_clean})
    
    invalid_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not user or not verify_password(credentials.password, user.get("password_hash", "")):
        raise invalid_exception

    user_id = user.get("id") or str(user.get("_id"))
    token = create_access_token(data={"sub": user_id, "email": user.get("email"), "role": user.get("role")})

    # Log audit event
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

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
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

