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
# RESILIENT SAFE COLLECTION PROXY
# ============================================================
class SafeCollection:
    def __init__(self, name: str, memory_col: InMemoryCollection):
        self.name = name
        self.memory_col = memory_col

    def _get_atlas_col(self):
        global mongo_db
        if mongo_db is not None and mongo_db is not in_memory_db:
            try:
                return mongo_db[self.name]
            except Exception:
                pass
        return None

    def find_one(self, query: Optional[Dict[str, Any]] = None, projection: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
        q = query or {}
        col = self._get_atlas_col()
        if col is not None:
            try:
                doc = col.find_one(q, projection)
                if doc:
                    doc_clean = dict(doc)
                    self.memory_col.replace_one({"id": doc_clean.get("id") or str(doc_clean.get("_id"))}, doc_clean, upsert=True)
                    return doc_clean
            except Exception as e:
                logger.debug(f"Atlas find_one failed ({e}), falling back to memory.")
        return self.memory_col.find_one(q, projection)

    def find(self, query: Optional[Dict[str, Any]] = None, projection: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        q = query or {}
        col = self._get_atlas_col()
        if col is not None:
            try:
                cursor = col.find(q, projection)
                docs = [dict(d) for d in cursor]
                for d in docs:
                    self.memory_col.replace_one({"id": d.get("id") or str(d.get("_id"))}, d, upsert=True)
                return docs
            except Exception as e:
                logger.debug(f"Atlas find failed ({e}), falling back to memory.")
        return self.memory_col.find(q, projection)

    def insert_one(self, doc: Dict[str, Any]):
        d = dict(doc)
        if "id" not in d:
            d["id"] = str(uuid.uuid4())
        self.memory_col.insert_one(d)
        col = self._get_atlas_col()
        if col is not None:
            try:
                atlas_doc = d.copy()
                atlas_doc.pop("_id", None)
                col.insert_one(atlas_doc)
            except Exception as e:
                logger.debug(f"Atlas insert_one warning ({e})")
        return d

    def insert_many(self, docs: List[Dict[str, Any]]):
        for doc in docs:
            self.insert_one(doc)

    def update_one(self, query: Dict[str, Any], update: Dict[str, Any], upsert: bool = False):
        self.memory_col.update_one(query, update, upsert)
        col = self._get_atlas_col()
        if col is not None:
            try:
                col.update_one(query, update, upsert=upsert)
            except Exception as e:
                logger.debug(f"Atlas update_one warning ({e})")

    def replace_one(self, query: Dict[str, Any], doc: Dict[str, Any], upsert: bool = False):
        self.memory_col.replace_one(query, doc, upsert)
        col = self._get_atlas_col()
        if col is not None:
            try:
                col.replace_one(query, doc, upsert=upsert)
            except Exception as e:
                logger.debug(f"Atlas replace_one warning ({e})")

    def delete_one(self, query: Dict[str, Any]):
        self.memory_col.delete_one(query)
        col = self._get_atlas_col()
        if col is not None:
            try:
                col.delete_one(query)
            except Exception as e:
                logger.debug(f"Atlas delete_one warning ({e})")

    def delete_many(self, query: Dict[str, Any]):
        self.memory_col.delete_many(query)
        col = self._get_atlas_col()
        if col is not None:
            try:
                col.delete_many(query)
            except Exception as e:
                logger.debug(f"Atlas delete_many warning ({e})")

    def count_documents(self, query: Optional[Dict[str, Any]] = None) -> int:
        q = query or {}
        col = self._get_atlas_col()
        if col is not None:
            try:
                return col.count_documents(q)
            except Exception as e:
                logger.debug(f"Atlas count_documents failed ({e}), falling back to memory.")
        return self.memory_col.count_documents(q)


# ============================================================
# MONGODB ATLAS CLIENT INITIALIZATION
# ============================================================

mongo_client: Optional[MongoClient] = None
mongo_db: Optional[Any] = None
in_memory_db = InMemoryDatabase()

def init_mongodb():
    global mongo_client, mongo_db
    mongo_url = settings.MONGODB_URL.strip() if settings.MONGODB_URL else ""
    if not mongo_url or "admin:admin@cluster0" in mongo_url:
        logger.info("MONGODB_URL not configured. Operating with resilient in-memory database.")
        mongo_db = in_memory_db
        return

    try:
        mongo_client = MongoClient(
            mongo_url,
            serverSelectionTimeoutMS=2500,
            connectTimeoutMS=2500,
            tlsCAFile=certifi.where(),
            tlsAllowInvalidCertificates=True
        )
        mongo_db = mongo_client[settings.MONGODB_DB_NAME]
        logger.info(f"Connected to MongoDB Atlas: {settings.MONGODB_DB_NAME}")
    except Exception as e:
        logger.warning(f"MongoDB connection deferred ({e}). Operating in resilient fallback mode.")
        mongo_db = in_memory_db

init_mongodb()


# ============================================================
# INSTANT IN-MEMORY SEEDING
# ============================================================
def seed_in_memory_defaults():
    users = in_memory_db["users"]
    if users.count_documents({"email": "user@example.com"}) == 0:
        import bcrypt
        default_hash = bcrypt.hashpw("Password@123".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
        now_str = datetime.now(timezone.utc).isoformat()
        
        users.insert_many([
            {
                "id": "user_demo_id",
                "email": "user@example.com",
                "password_hash": default_hash,
                "full_name": "S. Jaswanth Naidu (Authorized Bidder)",
                "organization": "TechCorp Solutions AP Pvt Ltd",
                "role": "user",
                "phone": "+91 98480 12345",
                "created_at": now_str
            },
            {
                "id": "admin_demo_id",
                "email": "admin@example.com",
                "password_hash": default_hash,
                "full_name": "Dr. V. Chandrasekhar, IAS (Evaluator)",
                "organization": "AP e-Procurement Evaluation Authority",
                "role": "admin",
                "phone": "+91 866 2468123",
                "created_at": now_str
            },
            {
                "id": "evaluator_alt_id",
                "email": "evaluator@example.com",
                "password_hash": default_hash,
                "full_name": "Smt. M. Anuradha, KAS",
                "organization": "GeM Statutory Compliance Verification Cell",
                "role": "admin",
                "phone": "+91 866 2468456",
                "created_at": now_str
            }
        ])

seed_in_memory_defaults()


# ============================================================
# DATABASE ACCESSORS
# ============================================================

_safe_collections: Dict[str, SafeCollection] = {}

def get_database():
    return mongo_db if mongo_db is not None else in_memory_db

def get_collection(name: str) -> SafeCollection:
    if name not in _safe_collections:
        _safe_collections[name] = SafeCollection(name, in_memory_db[name])
    return _safe_collections[name]


# Typed Collection Helpers
def users_col() -> SafeCollection: return get_collection("users")
def bids_col() -> SafeCollection: return get_collection("bids")
def requirements_col() -> SafeCollection: return get_collection("requirements")
def vendors_col() -> SafeCollection: return get_collection("vendors")
def blacklist_col() -> SafeCollection: return get_collection("blacklist_records")
def submissions_col() -> SafeCollection: return get_collection("submissions")
def documents_col() -> SafeCollection: return get_collection("documents")
def chunks_col() -> SafeCollection: return get_collection("document_chunks")
def results_col() -> SafeCollection: return get_collection("compliance_results")
def reviews_col() -> SafeCollection: return get_collection("human_reviews")
def audit_logs_col() -> SafeCollection: return get_collection("audit_logs")
def tokens_col() -> SafeCollection: return get_collection("password_reset_tokens")


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


def sync_all_data_to_mongodb(db_session=None):
    try:
        from app.database.seed import seed_database
        return seed_database()
    except Exception as e:
        logger.warning(f"Sync error: {e}")
        return {"status": "error", "message": str(e)}


