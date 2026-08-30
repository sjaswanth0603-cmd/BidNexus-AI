import logging
import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List

import certifi
from pymongo import MongoClient
from motor.motor_asyncio import AsyncIOMotorClient

from app.config import settings

logger = logging.getLogger("bidnexus.db")

# ============================================================
# IN-MEMORY RESILIENT DATA STORE FALLBACK
# Ensures zero-crash operation if Atlas network connection is deferred
# ============================================================
class InMemoryCollection:
    def __init__(self, name: str):
        self.name = name
        self.data: Dict[str, Dict[str, Any]] = {}

    def find_one(self, query: Optional[Dict[str, Any]] = None, projection: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
        q = query or {}
        for doc in self.data.values():
            if self._matches(doc, q):
                return self._project(doc.copy(), projection)
        return None


    def find(self, query: Optional[Dict[str, Any]] = None, projection: Optional[Dict[str, Any]] = None):
        results = []
        q = query or {}
        for doc in self.data.values():
            if self._matches(doc, q):
                results.append(self._project(doc.copy(), projection))
        return results

    def insert_one(self, doc: Dict[str, Any]):
        doc_id = doc.get("id") or str(uuid.uuid4())
        doc["id"] = doc_id
        if "_id" not in doc:
            doc["_id"] = doc_id
        self.data[doc_id] = doc.copy()
        return doc

    def insert_many(self, docs: List[Dict[str, Any]]):
        for doc in docs:
            self.insert_one(doc)

    def replace_one(self, query: Dict[str, Any], doc: Dict[str, Any], upsert: bool = False):
        existing = self.find_one(query)
        if existing:
            doc_id = existing.get("id")
            doc["id"] = doc_id
            doc["_id"] = doc_id
            self.data[doc_id] = doc.copy()
        elif upsert:
            self.insert_one(doc)

    def update_one(self, query: Dict[str, Any], update: Dict[str, Any], upsert: bool = False):
        existing = self.find_one(query)
        if existing:
            doc_id = existing.get("id")
            if "$set" in update:
                self.data[doc_id].update(update["$set"])
            else:
                self.data[doc_id].update(update)
        elif upsert and "$set" in update:
            self.insert_one(update["$set"])

    def delete_one(self, query: Dict[str, Any]):
        existing = self.find_one(query)
        if existing:
            doc_id = existing.get("id")
            if doc_id in self.data:
                del self.data[doc_id]

    def delete_many(self, query: Dict[str, Any]):
        to_del = []
        for doc_id, doc in self.data.items():
            if self._matches(doc, query):
                to_del.append(doc_id)
        for doc_id in to_del:
            del self.data[doc_id]

    def count_documents(self, query: Optional[Dict[str, Any]] = None) -> int:
        return len(self.find(query))

    def _matches(self, doc: Dict[str, Any], query: Dict[str, Any]) -> bool:
        if not query:
            return True
        for k, v in query.items():
            if k == "$or" and isinstance(v, list):
                if not any(self._matches(doc, cond) for cond in v):
                    return False
            elif isinstance(v, dict):
                val = doc.get(k)
                if "$in" in v and isinstance(v["$in"], (list, set, tuple)):
                    if val not in v["$in"]:
                        return False
                elif "$regex" in v:
                    import re
                    pattern = str(v["$regex"])
                    flags = re.IGNORECASE if v.get("$options") == "i" else 0
                    try:
                        if not (val and re.search(pattern, str(val), flags)):
                            return False
                    except Exception:
                        if str(val).lower() not in pattern.lower() and pattern.lower() not in str(val).lower():
                            return False
                elif "$gt" in v and not (val is not None and val > v["$gt"]):
                    return False
                elif "$gte" in v and not (val is not None and val >= v["$gte"]):
                    return False
            else:
                if doc.get(k) != v:
                    return False
        return True


    def _project(self, doc: Dict[str, Any], projection: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        if not projection:
            return doc
        if projection.get("_id") == 0:
            doc.pop("_id", None)
        return doc


class InMemoryDatabase:
    def __init__(self):
        self.collections: Dict[str, InMemoryCollection] = {}

    def __getitem__(self, name: str) -> InMemoryCollection:
        if name not in self.collections:
            self.collections[name] = InMemoryCollection(name)
        return self.collections[name]

    def __getattr__(self, name: str) -> InMemoryCollection:
        return self[name]

    def list_collection_names(self) -> List[str]:
        return list(self.collections.keys())


# ============================================================
# MONGODB ATLAS CLIENT INITIALIZATION
# ============================================================

mongo_client: Optional[MongoClient] = None
mongo_db: Optional[Any] = None
in_memory_db = InMemoryDatabase()

def init_mongodb():
    global mongo_client, mongo_db
    if not settings.MONGODB_URL:
        logger.info("MONGODB_URL not configured. Using local in-memory store.")
        mongo_db = in_memory_db
        return

    try:
        mongo_client = MongoClient(
            settings.MONGODB_URL,
            serverSelectionTimeoutMS=3000,
            connectTimeoutMS=3000,
            tlsCAFile=certifi.where(),
            tlsAllowInvalidCertificates=True
        )
        mongo_db = mongo_client[settings.MONGODB_DB_NAME]
        logger.info(f"Connected to MongoDB Atlas: {settings.MONGODB_DB_NAME}")
    except Exception as e:
        logger.warning(f"MongoDB connection deferred ({e}). Operating in resilient mode.")
        mongo_db = in_memory_db

init_mongodb()


# ============================================================
# DATABASE ACCESSORS
# ============================================================

def get_database():
    """
    Returns the active MongoDB database instance (or fallback).
    """
    global mongo_db
    if mongo_db is None:
        init_mongodb()
    return mongo_db if mongo_db is not None else in_memory_db


def get_collection(name: str):
    db = get_database()
    return db[name]


# Typed Collection Helpers
def users_col(): return get_collection("users")
def bids_col(): return get_collection("bids")
def requirements_col(): return get_collection("requirements")
def vendors_col(): return get_collection("vendors")
def blacklist_col(): return get_collection("blacklist_records")
def submissions_col(): return get_collection("submissions")
def documents_col(): return get_collection("documents")
def chunks_col(): return get_collection("document_chunks")
def results_col(): return get_collection("compliance_results")
def reviews_col(): return get_collection("human_reviews")
def audit_logs_col(): return get_collection("audit_logs")
def tokens_col(): return get_collection("password_reset_tokens")


# ============================================================
# CHECK CONNECTION STATUS
# ============================================================

def check_mongodb_connection() -> dict:
    try:
        if mongo_client:
            mongo_client.admin.command("ping")
            return {
                "status": "connected",
                "database": settings.MONGODB_DB_NAME,
                "collections": mongo_db.list_collection_names() if mongo_db is not None else [],
                "provider": "MongoDB Atlas"
            }
    except Exception as err:
        return {
            "status": "configured_offline",
            "database": settings.MONGODB_DB_NAME,
            "error": str(err),
            "info": "MongoDB Atlas connection configured."
        }

    return {
        "status": "in_memory_mode",
        "database": settings.MONGODB_DB_NAME,
        "collections": in_memory_db.list_collection_names(),
        "provider": "In-Memory Resilient Store"
    }


# ============================================================
# SYNC ALL DATA HELPER
# ============================================================

def sync_all_data_to_mongodb(db_session=None):
    from app.database.seed import seed_database
    return seed_database()

