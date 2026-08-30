import sys
import os
sys.path.insert(0, os.path.abspath("backend"))

from app.main import app
from fastapi.testclient import TestClient

client = TestClient(app)

def test_login():
    print("Testing bidder login (user@example.com / Password@123)...")
    res = client.post("/api/v1/auth/login", json={"email": "user@example.com", "password": "Password@123"})
    print("Status:", res.status_code)
    print("Response:", res.json() if res.status_code == 200 else res.text)

    print("\nTesting admin login (admin@example.com / Password@123)...")
    res_admin = client.post("/api/v1/auth/login", json={"email": "admin@example.com", "password": "Password@123"})
    print("Status:", res_admin.status_code)
    print("Response:", res_admin.json() if res_admin.status_code == 200 else res_admin.text)

if __name__ == "__main__":
    test_login()
