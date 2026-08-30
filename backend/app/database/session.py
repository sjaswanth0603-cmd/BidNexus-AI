from app.database.mongodb import get_database

def get_db():
    """
    Yields the active MongoDB database client for FastAPI route dependencies.
    """
    db = get_database()
    yield db

