from fastapi import APIRouter
from app.database.mongodb import check_mongodb_connection, get_database, bids_col, submissions_col
from app.database.seed import seed_database

router = APIRouter(prefix="/mongodb", tags=["MongoDB Integration"])

@router.get("/status")
def get_mongodb_status():
    """
    Check live connection status, latency, and active collections in MongoDB Atlas.
    """
    return check_mongodb_connection()

@router.post("/sync")
@router.post("/seed")
def sync_to_mongodb():
    """
    Triggers database seeding and verification into MongoDB Atlas.
    """
    return seed_database()

@router.get("/bids")
def get_bids_from_mongodb():
    """
    Fetch bids documents stored in MongoDB Atlas collections.
    """
    try:
        bids = list(bids_col().find({}, {"_id": 0}))
        return {"status": "success", "count": len(bids), "data": bids}
    except Exception as e:
        return {"status": "error", "message": str(e), "data": []}

@router.get("/submissions")
def get_submissions_from_mongodb():
    """
    Fetch vendor compliance evaluation records stored in MongoDB Atlas.
    """
    try:
        subs = list(submissions_col().find({}, {"_id": 0}))
        return {"status": "success", "count": len(subs), "data": subs}
    except Exception as e:
        return {"status": "error", "message": str(e), "data": []}

