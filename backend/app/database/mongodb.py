import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

# This reads the exact MONGOURL value you saved in your Render Environment tab
MONGO_URL = os.getenv("MONGOURL")
DB_NAME = os.getenv("MONGODB_DB_NAME", "BillCount")

# Creating the MongoDB client connection
client = MongoClient(MONGO_URL)
db = client[DB_NAME]
