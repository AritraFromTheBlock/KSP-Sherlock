"""
FastAPI Offenders Endpoint for MongoDB Atlas
"""

from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Any
import datetime
from app.database.mongodb import get_db

router = APIRouter(tags=["Offenders"])

class OffenderCreateModel(BaseModel):
    name: str
    alias: Optional[str] = "N/A"
    age: Optional[int] = 30
    cases: Optional[int] = 1
    riskLevel: Optional[str] = "Medium"
    knownAssociates: Optional[List[str]] = []
    lastKnownLocation: Optional[str] = "Bengaluru"
    status: Optional[str] = "At Large"
    crimeHistory: Optional[List[str]] = []

@router.get("/offenders")
def get_offenders(
    page: int = Query(1, ge=1),
    limit: int = Query(24, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[str] = "All",
    riskLevel: Optional[str] = "All",
):
    try:
        db = get_db()
        accused_collection = db["accused"]

        query = {}
        if status and status != "All":
            query["status"] = status
        if riskLevel and riskLevel != "All":
            query["riskLevel"] = riskLevel
        if search and search.strip():
            query["$or"] = [
                {"name": {"$regex": search.strip(), "$options": "i"}},
                {"alias": {"$regex": search.strip(), "$options": "i"}},
            ]

        total = accused_collection.count_documents(query)
        skip = (page - 1) * limit
        cursor = accused_collection.find(query).sort("cases", -1).skip(skip).limit(limit)

        data = []
        for doc in cursor:
            data.append({
                "id": str(doc.get("_id", "")),
                "name": doc.get("name", "Unknown"),
                "alias": doc.get("alias", "N/A"),
                "age": doc.get("age", 0),
                "cases": doc.get("cases", 1),
                "riskLevel": doc.get("riskLevel", "Low"),
                "knownAssociates": doc.get("knownAssociates", []),
                "lastKnownLocation": doc.get("lastKnownLocation", "Bengaluru"),
                "status": doc.get("status", "At Large"),
                "crimeHistory": doc.get("crimeHistory", []),
            })

        total_pages = (total + limit - 1) // limit
        return {
            "total": total,
            "page": page,
            "limit": limit,
            "totalPages": total_pages,
            "data": data,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/offenders")
def create_offender(offender_in: OffenderCreateModel):
    try:
        db = get_db()
        accused_collection = db["accused"]

        doc = offender_in.dict()
        doc["_id"] = f"{offender_in.name}_{offender_in.age}_{int(datetime.datetime.utcnow().timestamp())}"
        doc["updatedAt"] = datetime.datetime.utcnow()

        res = accused_collection.insert_one(doc)
        return {"success": True, "id": str(res.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
