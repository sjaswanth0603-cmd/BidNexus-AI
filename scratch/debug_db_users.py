import sys
import os
sys.path.insert(0, os.path.abspath("backend"))

from app.database.session import SessionLocal
from app.models.models import User
from app.auth.security import verify_password, get_password_hash

db = SessionLocal()
users = db.query(User).all()
print("Total users found:", len(users))
for u in users:
    print(f"Email: '{u.email}', Role: '{u.role}'")
    print(f"Password hash in DB: '{u.password_hash}'")
    valid = verify_password("Password@123", u.password_hash)
    print(f"verify_password('Password@123') -> {valid}")
    print("---")
db.close()
