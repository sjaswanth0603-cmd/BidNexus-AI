import sys
import os
sys.path.insert(0, os.path.abspath("backend"))

from app.database.session import SessionLocal
from app.database.seed import seed_database
from app.models.models import User

db = SessionLocal()
print("Running seed_database(db)...")
try:
    seed_database(db)
    print("seed_database completed successfully!")
except Exception as e:
    print("seed_database FAILED with error:", e)
    import traceback
    traceback.print_exc()

users = db.query(User).all()
print("Users in DB after seed attempt:", len(users))
db.close()
