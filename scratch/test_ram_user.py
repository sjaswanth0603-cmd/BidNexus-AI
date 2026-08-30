import sys
import os
sys.path.insert(0, os.path.abspath("backend"))

from app.main import app
from fastapi.testclient import TestClient

client = TestClient(app)

def test_reg_login():
    print("1. Registering ram1@gmail.com...")
    reg_res = client.post("/api/v1/auth/register", json={
        "full_name": "Ram Kumar",
        "organization": "Ram Enterprises",
        "email": "ram1@gmail.com",
        "password": "Password@123",
        "confirm_password": "Password@123",
        "role": "user"
    })
    print("Register Status:", reg_res.status_code)
    print("Register Response:", reg_res.json() if reg_res.status_code in [200, 201] else reg_res.text)

    print("\n2. Logging in with ram1@gmail.com / Password@123...")
    login_res = client.post("/api/v1/auth/login", json={
        "email": "ram1@gmail.com",
        "password": "Password@123"
    })
    print("Login Status:", login_res.status_code)
    print("Login Response:", login_res.json() if login_res.status_code == 200 else login_res.text)

if __name__ == "__main__":
    test_reg_login()
