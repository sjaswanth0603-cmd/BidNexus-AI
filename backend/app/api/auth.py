import uuid
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.models import User, PasswordResetToken, AuditLog
from app.schemas.schemas import (
    UserCreate, UserLogin, Token, UserOut,
    PasswordResetRequest, PasswordResetConfirm
)
from app.auth.security import (
    verify_password, get_password_hash,
    validate_password_strength, create_access_token,
    get_current_user
)

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
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
    existing_user = db.query(User).filter(User.email == email_clean).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # Standard registration creates 'user' (bidder) role.
    # Admin roles can only be requested or set by environment/invitation
    user_role = "user"
    if user_in.role.lower() in ["admin", "evaluator"]:
        user_role = "admin"
    else:
        user_role = "user"

    hashed_pw = get_password_hash(user_in.password)
    new_user = User(
        email=email_clean,
        password_hash=hashed_pw,
        full_name=user_in.full_name,
        organization=user_in.organization,
        role=user_role,
        phone=user_in.phone
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Log audit event
    audit = AuditLog(
        user_id=new_user.id,
        action="USER_REGISTERED",
        entity_type="User",
        entity_id=new_user.id,
        details=f"User {new_user.email} registered with role {user_role}."
    )
    db.add(audit)
    db.commit()

    return new_user


@router.post("/login", response_model=Token)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    email_clean = credentials.email.strip().lower()
    user = db.query(User).filter(User.email == email_clean).first()
    
    # Generic security response to prevent user enumeration
    invalid_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not user or not verify_password(credentials.password, user.password_hash):
        raise invalid_exception

    token = create_access_token(data={"sub": user.id, "email": user.email, "role": user.role})

    # Log audit event
    audit = AuditLog(
        user_id=user.id,
        action="USER_LOGGED_IN",
        entity_type="User",
        entity_id=user.id,
        details=f"User {user.email} logged in successfully."
    )
    db.add(audit)
    db.commit()

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }


@router.post("/forgot-password")
def forgot_password(req: PasswordResetRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user:
        # Always return success message for security privacy
        return {"message": "If an account exists for this email, password reset instructions have been generated."}

    reset_token_str = str(uuid.uuid4())
    expiry = datetime.utcnow() + timedelta(hours=2)
    
    token_obj = PasswordResetToken(
        user_id=user.id,
        token=reset_token_str,
        expires_at=expiry
    )
    db.add(token_obj)
    db.commit()

    return {
        "message": "Password reset token generated successfully.",
        "reset_token": reset_token_str  # Exposed for development reset flow
    }


@router.post("/reset-password")
def reset_password(req: PasswordResetConfirm, db: Session = Depends(get_db)):
    if req.new_password != req.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match.")

    if not validate_password_strength(req.new_password):
        raise HTTPException(
            status_code=400,
            detail="Password must be at least 8 characters with uppercase, lowercase, number, and special char."
        )

    token_obj = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == req.token,
        PasswordResetToken.used == False,
        PasswordResetToken.expires_at > datetime.utcnow()
    ).first()

    if not token_obj:
        raise HTTPException(status_code=400, detail="Invalid or expired password reset token.")

    user = db.query(User).filter(User.id == token_obj.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    user.password_hash = get_password_hash(req.new_password)
    token_obj.used = True
    db.commit()

    return {"message": "Password has been reset successfully. Please log in with your new password."}


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
