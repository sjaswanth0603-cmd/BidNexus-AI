from typing import Optional, List, Any, Dict
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from datetime import datetime

# --- Auth & User Schemas ---
class UserCreate(BaseModel):
    full_name: str
    organization: str
    email: EmailStr
    password: str
    confirm_password: str
    role: str = "user"  # "user" or "admin"
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str
    confirm_password: str

class UserOut(BaseModel):
    id: str
    email: str
    full_name: str
    organization: str
    role: str
    phone: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Requirement Schemas ---
class RequirementBase(BaseModel):
    requirement_id: str
    category: str
    requirement: str
    operator: str = "=="
    value: Optional[str] = None
    unit: Optional[str] = None
    mandatory: bool = True
    evidence_required: Optional[str] = None
    source_page: int = 1
    confidence: float = 1.0

class RequirementCreate(RequirementBase):
    pass

class RequirementOut(RequirementBase):
    id: str
    bid_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Document & Chunk Schemas ---
class DocumentOut(BaseModel):
    id: str
    file_name: str
    file_size: int
    document_type: str
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Bid Schemas ---
class BidCreate(BaseModel):
    bid_number: str
    title: str
    department: str
    description: Optional[str] = None
    deadline: Optional[str] = None

class BidOut(BaseModel):
    id: str
    bid_number: str
    title: str
    department: str
    description: Optional[str] = None
    deadline: Optional[str] = None
    status: str
    bid_document_path: Optional[str] = None
    created_at: datetime
    requirements_count: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)

class BidDetail(BidOut):
    requirements: List[RequirementOut] = []

# --- Vendor & Submission Schemas ---
class VendorCreate(BaseModel):
    company_name: str
    reg_number: str
    contact_email: EmailStr
    phone: Optional[str] = None

class VendorOut(BaseModel):
    id: str
    company_name: str
    reg_number: str
    contact_email: str
    phone: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

# --- Compliance Result & Human Review Schemas ---
class HumanReviewCreate(BaseModel):
    result_id: str
    final_status: str # COMPLIANT, REJECTED, APPROVED
    reason: str

class HumanReviewOut(BaseModel):
    id: str
    result_id: str
    previous_status: str
    final_status: str
    reviewer_id: str
    reason: str
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)

class ComplianceResultOut(BaseModel):
    id: str
    submission_id: str
    requirement_id: str
    status: str # COMPLIANT, REVIEW_REQUIRED, NON_COMPLIANT
    confidence: float
    reasoning: str
    evidence_text: Optional[str] = None
    source_doc_name: Optional[str] = None
    source_page: Optional[int] = None
    verification_method: str
    evaluated_at: datetime
    requirement: Optional[RequirementOut] = None
    human_reviews: List[HumanReviewOut] = []

    model_config = ConfigDict(from_attributes=True)

class SubmissionOut(BaseModel):
    id: str
    bid_id: str
    vendor_id: str
    submitted_at: datetime
    compliance_score: float
    status: str
    vendor: VendorOut
    documents: List[DocumentOut] = []
    compliance_results: List[ComplianceResultOut] = []

    model_config = ConfigDict(from_attributes=True)

# --- Audit & Assistant Schemas ---
class AuditLogOut(BaseModel):
    id: str
    user_id: Optional[str] = None
    action: str
    entity_type: str
    entity_id: Optional[str] = None
    details: Optional[str] = None
    timestamp: datetime
    user: Optional[UserOut] = None

    model_config = ConfigDict(from_attributes=True)

class AssistantQuery(BaseModel):
    bid_id: str
    vendor_id: Optional[str] = None
    question: str

class AssistantResponse(BaseModel):
    question: str
    answer: str
    sources: List[Dict[str, Any]] = []
