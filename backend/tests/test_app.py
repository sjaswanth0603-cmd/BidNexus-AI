import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.database.session import SessionLocal, engine, Base
from app.database.seed import seed_database

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_database(db)
    db.close()

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "Online"

def test_auth_flow():
    # Login Seed User
    user_res = client.post("/api/v1/auth/login", json={
        "email": "user@example.com",
        "password": "Password@123"
    })
    assert user_res.status_code == 200
    token_data = user_res.json()
    assert "access_token" in token_data
    assert token_data["user"]["role"] == "user"

    # Login Seed Admin
    admin_res = client.post("/api/v1/auth/login", json={
        "email": "admin@example.com",
        "password": "Password@123"
    })
    assert admin_res.status_code == 200
    assert admin_res.json()["user"]["role"] == "admin"

def test_bids_listing():
    login_res = client.post("/api/v1/auth/login", json={
        "email": "user@example.com",
        "password": "Password@123"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    bids_res = client.get("/api/v1/bids", headers=headers)
    assert bids_res.status_code == 200
    bids = bids_res.json()
    assert len(bids) > 0
    assert "bid_number" in bids[0]

def test_vendor_comparison():
    login_res = client.post("/api/v1/auth/login", json={
        "email": "admin@example.com",
        "password": "Password@123"
    })
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    bids_res = client.get("/api/v1/bids", headers=headers)
    bid_id = bids_res.json()[0]["id"]

    comp_res = client.get(f"/api/v1/compliance/{bid_id}/compare", headers=headers)
    assert comp_res.status_code == 200
    data = comp_res.json()
    assert len(data["vendors"]) >= 3
