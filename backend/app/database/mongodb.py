import logging
from pymongo import MongoClient
from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

logger = logging.getLogger(__name__)

# Synchronous PyMongo Client for background syncing & scripts
try:
    mongo_client = MongoClient(settings.MONGODB_URL, serverSelectionTimeoutMS=2000)
    mongo_db = mongo_client[settings.MONGODB_DB_NAME]
except Exception as e:
    logger.warning(f"MongoDB Sync Client connection deferred: {e}")
    mongo_client = None
    mongo_db = None

# Asynchronous Motor Client for FastAPI async endpoints
try:
    async_mongo_client = AsyncIOMotorClient(settings.MONGODB_URL, serverSelectionTimeoutMS=2000)
    async_mongo_db = async_mongo_client[settings.MONGODB_DB_NAME]
except Exception as e:
    logger.warning(f"MongoDB Async Client connection deferred: {e}")
    async_mongo_client = None
    async_mongo_db = None


def check_mongodb_connection() -> dict:
    """
    Check active connection status to MongoDB cluster/instance.
    """
    try:
        if mongo_client:
            mongo_client.admin.command('ping')
            return {
                "status": "connected",
                "mongodb_url": settings.MONGODB_URL,
                "database": settings.MONGODB_DB_NAME,
                "collections": mongo_db.list_collection_names() if mongo_db is not None else []
            }
    except Exception as err:
        return {
            "status": "configured_offline",
            "mongodb_url": settings.MONGODB_URL,
            "database": settings.MONGODB_DB_NAME,
            "error": str(err),
            "info": "MongoDB connection configured. Start local mongod or set MONGODB_URL to MongoDB Atlas cloud connection URI."
        }
    return {
        "status": "not_initialized",
        "mongodb_url": settings.MONGODB_URL,
        "database": settings.MONGODB_DB_NAME
    }


def sync_all_data_to_mongodb(db_session=None):
    """
    Sync all relational database records (Bids, Requirements, Submissions, Audit Logs) directly into MongoDB collections.
    """
    if mongo_db is None:
        return {"status": "error", "message": "MongoDB client is not available"}

    try:
        from app.models.models import User, Bid, Requirement, Vendor, Submission, ComplianceResult, AuditLog
        from app.database.session import SessionLocal

        db = db_session if db_session else SessionLocal()

        # 1. Sync Users
        users = db.query(User).all()
        user_docs = [{
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "organization": u.organization,
            "role": u.role,
            "created_at": str(u.created_at) if u.created_at else None
        } for u in users]
        if user_docs:
            mongo_db.users.delete_many({})
            mongo_db.users.insert_many(user_docs)

        # 2. Sync Bids & Requirements
        bids = db.query(Bid).all()
        bid_docs = []
        for b in bids:
            req_list = [{
                "id": r.id,
                "requirement_id": r.requirement_id,
                "category": r.category,
                "requirement": r.requirement,
                "mandatory": r.mandatory,
                "evidence_required": r.evidence_required
            } for r in b.requirements]

            bid_docs.append({
                "id": b.id,
                "bid_number": b.bid_number,
                "title": b.title,
                "department": b.department,
                "description": b.description,
                "requirements": req_list,
                "created_at": str(b.created_at) if b.created_at else None
            })

        if bid_docs:
            mongo_db.bids.delete_many({})
            mongo_db.bids.insert_many(bid_docs)

        # 3. Sync Submissions & Compliance Results
        submissions = db.query(Submission).all()
        sub_docs = []
        for s in submissions:
            results = [{
                "id": cr.id,
                "requirement_id": cr.requirement_id,
                "status": cr.status,
                "reasoning": cr.reasoning,
                "evidence_text": cr.evidence_text,
                "source_doc_name": cr.source_doc_name,
                "source_page": cr.source_page,
                "confidence": cr.confidence
            } for cr in s.compliance_results]

            sub_docs.append({
                "id": s.id,
                "bid_id": s.bid_id,
                "vendor_id": s.vendor_id,
                "compliance_score": s.compliance_score,
                "status": s.status,
                "compliance_results": results,
                "submitted_at": str(s.submitted_at) if s.submitted_at else None
            })

        if sub_docs:
            mongo_db.vendor_submissions.delete_many({})
            mongo_db.vendor_submissions.insert_many(sub_docs)

        # 4. Sync Audit Logs
        logs = db.query(AuditLog).all()
        log_docs = [{
            "id": l.id,
            "user_id": l.user_id,
            "action": l.action,
            "entity_type": l.entity_type,
            "entity_id": l.entity_id,
            "details": l.details,
            "timestamp": str(l.timestamp) if l.timestamp else None
        } for l in logs]

        if log_docs:
            mongo_db.audit_logs.delete_many({})
            mongo_db.audit_logs.insert_many(log_docs)

        if not db_session:
            db.close()

        return {
            "status": "success",
            "message": "All database records synced to MongoDB successfully",
            "synced_counts": {
                "users": len(user_docs),
                "bids": len(bid_docs),
                "submissions": len(sub_docs),
                "audit_logs": len(log_docs)
            }
        }
    except Exception as ex:
        logger.error(f"Error syncing data to MongoDB: {ex}")
        return {"status": "error", "error": str(ex)}
