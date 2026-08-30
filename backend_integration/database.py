"""
MongoDB Atlas Connection Pool for KSP Sherlock Backend
"""

import os
from pymongo import MongoClient
from app.config.settings import settings

# Get URI from environment variable or settings
MONGODB_URI = os.getenv("MONGODB_URI", getattr(settings, "MONGODB_URI", "mongodb://localhost:27017/ksp_sherlock"))
DB_NAME = os.getenv("MONGODB_DB_NAME", getattr(settings, "MONGODB_DB_NAME", "ksp_sherlock"))

client = None
db = None

def get_db():
    global client, db
    if db is None:
        try:
            client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
            db = client[DB_NAME]
        except Exception as e:
            print(f"[MongoDB] Connection error: {e}")
            raise e
    return db
