import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, Float, Integer, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.database.session import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    organization = Column(String, nullable=False)
    role = Column(String, default="user", nullable=False) # "user" or "admin"
    phone = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    bids = relationship("Bid", back_populates="creator")
    audit_logs = relationship("AuditLog", back_populates="user")
    reviews = relationship("HumanReview", back_populates="reviewer")


class Bid(Base):
    __tablename__ = "bids"

    id = Column(String, primary_key=True, default=generate_uuid)
    bid_number = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    department = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    deadline = Column(String, nullable=True)
    status = Column(String, default="Open", nullable=False) # Draft, Open, Under Evaluation, Closed, Archived
    created_by = Column(String, ForeignKey("users.id"), nullable=False)
    bid_document_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    creator = relationship("User", back_populates="bids")
    requirements = relationship("Requirement", back_populates="bid", cascade="all, delete-orphan")
    submissions = relationship("Submission", back_populates="bid", cascade="all, delete-orphan")


class Requirement(Base):
    __tablename__ = "requirements"

    id = Column(String, primary_key=True, default=generate_uuid)
    bid_id = Column(String, ForeignKey("bids.id"), nullable=False)
    requirement_id = Column(String, nullable=False) # e.g. REQ-001
    category = Column(String, nullable=False) # Technical, Financial, Eligibility, Legal, Experience, Certification, Delivery, Warranty, Documentation, Commercial, Other
    requirement = Column(Text, nullable=False)
    operator = Column(String, default="==") # >=, <=, ==, !=, yes/no, required, text_match
    value = Column(Text, nullable=True)
    unit = Column(String, nullable=True)
    mandatory = Column(Boolean, default=True)
    evidence_required = Column(Text, nullable=True)
    source_page = Column(Integer, default=1)
    confidence = Column(Float, default=1.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    bid = relationship("Bid", back_populates="requirements")
    compliance_results = relationship("ComplianceResult", back_populates="requirement", cascade="all, delete-orphan")


class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(String, primary_key=True, default=generate_uuid)
    company_name = Column(String, nullable=False)
    reg_number = Column(String, nullable=False)
    contact_email = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_blacklisted = Column(Boolean, default=False, nullable=False)
    blacklist_reason = Column(Text, nullable=True)
    blacklisted_by = Column(String, nullable=True) # e.g. CVC, GeM Portal, Ministry of Finance, AP Govt
    blacklisted_at = Column(DateTime, nullable=True)

    submissions = relationship("Submission", back_populates="vendor", cascade="all, delete-orphan")


class BlacklistRecord(Base):
    __tablename__ = "blacklist_records"

    id = Column(String, primary_key=True, default=generate_uuid)
    company_name = Column(String, nullable=False)
    reg_number = Column(String, nullable=False)
    gstin = Column(String, nullable=True)
    reason = Column(Text, nullable=False)
    debarment_agency = Column(String, default="Government of India / GeM Portal")
    debarred_until = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(String, primary_key=True, default=generate_uuid)
    bid_id = Column(String, ForeignKey("bids.id"), nullable=False)
    vendor_id = Column(String, ForeignKey("vendors.id"), nullable=False)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    compliance_score = Column(Float, default=0.0)
    status = Column(String, default="Pending") # Pending, Processing, Evaluated

    bid = relationship("Bid", back_populates="submissions")
    vendor = relationship("Vendor", back_populates="submissions")
    documents = relationship("Document", back_populates="submission", cascade="all, delete-orphan")
    compliance_results = relationship("ComplianceResult", back_populates="submission", cascade="all, delete-orphan")


class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, default=generate_uuid)
    submission_id = Column(String, ForeignKey("submissions.id"), nullable=True)
    bid_id = Column(String, ForeignKey("bids.id"), nullable=True)
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer, nullable=False)
    document_type = Column(String, default="Other") # GST, PAN, OEM, ISO, Financial, Experience, Datasheet, Warranty, Brochure, Tender
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    submission = relationship("Submission", back_populates="documents")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")


class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(String, primary_key=True, default=generate_uuid)
    document_id = Column(String, ForeignKey("documents.id"), nullable=False)
    page_number = Column(Integer, nullable=False)
    section = Column(String, nullable=True)
    chunk_text = Column(Text, nullable=False)
    embedding_json = Column(Text, nullable=True) # JSON stored array for universal vector compatibility

    document = relationship("Document", back_populates="chunks")


class ComplianceResult(Base):
    __tablename__ = "compliance_results"

    id = Column(String, primary_key=True, default=generate_uuid)
    submission_id = Column(String, ForeignKey("submissions.id"), nullable=False)
    requirement_id = Column(String, ForeignKey("requirements.id"), nullable=False)
    status = Column(String, nullable=False) # COMPLIANT, REVIEW_REQUIRED, NON_COMPLIANT
    confidence = Column(Float, default=0.9)
    reasoning = Column(Text, nullable=False)
    evidence_text = Column(Text, nullable=True)
    source_doc_name = Column(String, nullable=True)
    source_page = Column(Integer, nullable=True)
    verification_method = Column(String, default="Hybrid Engine") # Rule-Based, Vector-RAG, LLM Reasoning, Manual
    evaluated_at = Column(DateTime, default=datetime.utcnow)

    submission = relationship("Submission", back_populates="compliance_results")
    requirement = relationship("Requirement", back_populates="compliance_results")
    human_reviews = relationship("HumanReview", back_populates="result", cascade="all, delete-orphan")


class HumanReview(Base):
    __tablename__ = "human_reviews"

    id = Column(String, primary_key=True, default=generate_uuid)
    result_id = Column(String, ForeignKey("compliance_results.id"), nullable=False)
    previous_status = Column(String, nullable=False)
    final_status = Column(String, nullable=False)
    reviewer_id = Column(String, ForeignKey("users.id"), nullable=False)
    reason = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

    result = relationship("ComplianceResult", back_populates="human_reviews")
    reviewer = relationship("User", back_populates="reviews")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False)
    entity_type = Column(String, nullable=False)
    entity_id = Column(String, nullable=True)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="audit_logs")


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    token = Column(String, unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)
