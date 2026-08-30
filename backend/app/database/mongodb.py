import logging

import certifi
from pymongo import MongoClient
from motor.motor_asyncio import AsyncIOMotorClient

from app.config import settings


logger = logging.getLogger(__name__)


# ============================================================
# SYNCHRONOUS MONGODB CLIENT
# Used for background syncing and scripts
# ============================================================

try:
    mongo_client = MongoClient(
        settings.MONGODB_URL,
        serverSelectionTimeoutMS=2000,
        connectTimeoutMS=2000,
        tlsCAFile=certifi.where(),
        tlsAllowInvalidCertificates=True
    )

    mongo_db = mongo_client[settings.MONGODB_DB_NAME]

except Exception as e:
    logger.warning(
        f"MongoDB Sync Client connection deferred: {e}"
    )

    mongo_client = None
    mongo_db = None


# ============================================================
# ASYNCHRONOUS MONGODB CLIENT
# Used by FastAPI async endpoints
# ============================================================

try:
    async_mongo_client = AsyncIOMotorClient(
        settings.MONGODB_URL,
        serverSelectionTimeoutMS=2000,
        connectTimeoutMS=2000,
        tlsCAFile=certifi.where(),
        tlsAllowInvalidCertificates=True
    )

    async_mongo_db = async_mongo_client[
        settings.MONGODB_DB_NAME
    ]

except Exception as e:
    logger.warning(
        f"MongoDB Async Client connection deferred: {e}"
    )

    async_mongo_client = None
    async_mongo_db = None


# ============================================================
# GET MONGODB DATABASE
# ============================================================

def get_database():
    """
    Return the synchronous MongoDB database instance.
    Used with FastAPI Depends().
    """

    if mongo_db is None:
        raise RuntimeError(
            "MongoDB database is not initialized."
        )

    return mongo_db


# ============================================================
# CHECK MONGODB CONNECTION
# ============================================================

def check_mongodb_connection() -> dict:
    """
    Check active connection status to MongoDB
    cluster or local MongoDB instance.
    """

    try:
        if mongo_client:
            mongo_client.admin.command("ping")

            return {
                "status": "connected",
                "mongodb_url": settings.MONGODB_URL,
                "database": settings.MONGODB_DB_NAME,
                "collections": (
                    mongo_db.list_collection_names()
                    if mongo_db is not None
                    else []
                ),
            }

    except Exception as err:
        return {
            "status": "configured_offline",
            "mongodb_url": settings.MONGODB_URL,
            "database": settings.MONGODB_DB_NAME,
            "error": str(err),
            "info": (
                "MongoDB connection configured. "
                "Set MONGODB_URL to MongoDB Atlas cloud "
                "connection URI."
            ),
        }

    return {
        "status": "not_initialized",
        "mongodb_url": settings.MONGODB_URL,
        "database": settings.MONGODB_DB_NAME,
    }


# ============================================================
# SAVE SUBMISSION TO MONGODB
# ============================================================

def save_submission_to_mongodb(
    submission_data: dict,
):
    """
    Real-time push of a single vendor compliance
    evaluation record to MongoDB.
    """

    if mongo_db is None:
        return False

    try:
        sub_id = submission_data.get("id")

        if not sub_id:
            return False

        mongo_db.vendor_submissions.replace_one(
            {"id": sub_id},
            submission_data,
            upsert=True,
        )

        logger.info(
            f"Synced submission {sub_id} to MongoDB Atlas"
        )

        return True

    except Exception as err:
        logger.error(
            f"Failed to push submission to MongoDB: {err}"
        )

        return False


# ============================================================
# SAVE USER TO MONGODB
# ============================================================

def save_user_to_mongodb(
    user_data: dict,
):
    """
    Real-time push of a user profile and
    authentication event to MongoDB.
    """

    if mongo_db is None:
        return False

    try:
        user_id = user_data.get("id")

        if not user_id:
            return False

        mongo_db.users.replace_one(
            {"id": user_id},
            user_data,
            upsert=True,
        )

        logger.info(
            f"Synced user profile {user_id} to MongoDB Atlas"
        )

        return True

    except Exception as err:
        logger.error(
            f"Failed to push user to MongoDB: {err}"
        )

        return False


# ============================================================
# SAVE BID TO MONGODB
# ============================================================

def save_bid_to_mongodb(
    bid_data: dict,
):
    """
    Real-time push of a single procurement
    bid record to MongoDB.
    """

    if mongo_db is None:
        return False

    try:
        bid_id = bid_data.get("id")

        if not bid_id:
            return False

        mongo_db.bids.replace_one(
            {"id": bid_id},
            bid_data,
            upsert=True,
        )

        logger.info(
            f"Synced bid {bid_id} to MongoDB Atlas"
        )

        return True

    except Exception as err:
        logger.error(
            f"Failed to push bid to MongoDB: {err}"
        )

        return False


# ============================================================
# SYNC ALL DATA TO MONGODB
# ============================================================

def sync_all_data_to_mongodb(
    db_session=None,
):
    """
    Sync all database records from the existing
    SQL database into MongoDB Atlas.

    Collections:
        - users
        - bids
        - vendor_submissions
        - audit_logs
    """

    if mongo_db is None:
        return {
            "status": "error",
            "message": "MongoDB client is not available",
        }

    try:

        # Import SQLAlchemy models only for synchronization
        from app.models.models import (
            User,
            Bid,
            Requirement,
            Submission,
            ComplianceResult,
            AuditLog,
        )

        from app.database.session import SessionLocal

        # Use existing session if supplied.
        # Otherwise create a temporary session.
        db = (
            db_session
            if db_session
            else SessionLocal()
        )

        # ====================================================
        # 1. SYNC USERS
        # ====================================================

        users = db.query(User).all()

        user_docs = [
            {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
                "organization": user.organization,
                "role": user.role,
                "created_at": (
                    str(user.created_at)
                    if user.created_at
                    else None
                ),
            }
            for user in users
        ]

        if user_docs:
            mongo_db.users.delete_many({})
            mongo_db.users.insert_many(user_docs)

        # ====================================================
        # 2. SYNC BIDS AND REQUIREMENTS
        # ====================================================

        bids = db.query(Bid).all()

        bid_docs = []

        for bid in bids:

            req_list = [
                {
                    "id": requirement.id,
                    "requirement_id": (
                        requirement.requirement_id
                    ),
                    "category": requirement.category,
                    "requirement": requirement.requirement,
                    "mandatory": requirement.mandatory,
                    "evidence_required": (
                        requirement.evidence_required
                    ),
                }
                for requirement in bid.requirements
            ]

            bid_docs.append(
                {
                    "id": bid.id,
                    "bid_number": bid.bid_number,
                    "title": bid.title,
                    "department": bid.department,
                    "description": bid.description,
                    "requirements": req_list,
                    "created_at": (
                        str(bid.created_at)
                        if bid.created_at
                        else None
                    ),
                }
            )

        if bid_docs:
            mongo_db.bids.delete_many({})
            mongo_db.bids.insert_many(bid_docs)

        # ====================================================
        # 3. SYNC SUBMISSIONS AND COMPLIANCE RESULTS
        # ====================================================

        submissions = db.query(Submission).all()

        submission_docs = []

        for submission in submissions:

            results = [
                {
                    "id": result.id,
                    "requirement_id": (
                        result.requirement_id
                    ),
                    "status": result.status,
                    "reasoning": result.reasoning,
                    "evidence_text": result.evidence_text,
                    "source_doc_name": (
                        result.source_doc_name
                    ),
                    "source_page": result.source_page,
                    "confidence": result.confidence,
                }
                for result in submission.compliance_results
            ]

            submission_docs.append(
                {
                    "id": submission.id,
                    "bid_id": submission.bid_id,
                    "vendor_id": submission.vendor_id,
                    "compliance_score": (
                        submission.compliance_score
                    ),
                    "status": submission.status,
                    "compliance_results": results,
                    "submitted_at": (
                        str(submission.submitted_at)
                        if submission.submitted_at
                        else None
                    ),
                }
            )

        if submission_docs:
            mongo_db.vendor_submissions.delete_many({})
            mongo_db.vendor_submissions.insert_many(
                submission_docs
            )

        # ====================================================
        # 4. SYNC AUDIT LOGS
        # ====================================================

        logs = db.query(AuditLog).all()

        log_docs = [
            {
                "id": log.id,
                "user_id": log.user_id,
                "action": log.action,
                "entity_type": log.entity_type,
                "entity_id": log.entity_id,
                "details": log.details,
                "timestamp": (
                    str(log.timestamp)
                    if log.timestamp
                    else None
                ),
            }
            for log in logs
        ]

        if log_docs:
            mongo_db.audit_logs.delete_many({})
            mongo_db.audit_logs.insert_many(log_docs)

        # ====================================================
        # CLOSE TEMPORARY SQL SESSION
        # ====================================================

        if not db_session:
            db.close()

        # ====================================================
        # SUCCESS RESPONSE
        # ====================================================

        return {
            "status": "success",
            "message": (
                "All database records synced to "
                "MongoDB Atlas successfully"
            ),
            "synced_counts": {
                "users": len(user_docs),
                "bids": len(bid_docs),
                "submissions": len(submission_docs),
                "audit_logs": len(log_docs),
            },
        }

    except Exception as ex:

        logger.error(
            f"Error syncing data to MongoDB: {ex}"
        )

        return {
            "status": "error",
            "error": str(ex),
        }
