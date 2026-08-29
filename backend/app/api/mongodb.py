from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.mongodb import check_mongodb_connection, sync_all_data_to_mongodb, mongo_db

router = APIRouter(prefix="/mongodb", tags=["MongoDB Integration"])

@router.get("/status")
def get_mongodb_status():
    """
    Check connection status and active collections in MongoDB.
    """
    return check_mongodb_connection()

@router.post("/sync")
def sync_to_mongodb(db: Session = Depends(get_db)):
    """
    Manually trigger full database synchronization from relational models into MongoDB collections.
    """
    return sync_all_data_to_mongodb(db)

@router.get("/bids")
def get_bids_from_mongodb():
    """
    Fetch bids documents stored in MongoDB collections.
    """
    if mongo_db is None:
        return {"status": "offline", "data": []}
    try:
        bids = list(mongo_db.bids.find({}, {"_id": 0}))
        return {"status": "success", "count": len(bids), "data": bids}
    except Exception as e:
        return {"status": "error", "message": str(e), "data": []}

@router.get("/submissions")
def get_submissions_from_mongodb():
    """
    Fetch vendor compliance evaluation records stored in MongoDB collections.
    """
    if mongo_db is None:
        return {"status": "offline", "data": []}
    try:
        subs = list(mongo_db.vendor_submissions.find({}, {"_id": 0}))
        return {"status": "success", "count": len(subs), "data": subs}
    except Exception as e:
        return {"status": "error", "message": str(e), "data": []}
