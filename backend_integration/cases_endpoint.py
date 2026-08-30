"""
FastAPI Cases Endpoint for MongoDB Atlas
"""

from fastapi import APIRouter, Query, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Any
import datetime
from app.database.mongodb import get_db

router = APIRouter(tags=["Cases"])

class CaseCreateModel(BaseModel):
    caseNumber: str
    title: str
    summary: Optional[str] = ""
    status: Optional[str] = "Active"
    priority: Optional[str] = "Normal"
    assignedTo: Optional[str] = "Investigating Officer"
    createdDate: Optional[str] = None
    lastUpdated: Optional[str] = None

@router.get("/cases")
def get_cases(
    page: int = Query(1, ge=1),
    limit: int = Query(24, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[str] = "All",
    priority: Optional[str] = "All",
):
    try:
        db = get_db()
        cases_collection = db["cases"]

        query = {}
        if status and status != "All":
            query["status"] = status
        if priority and priority != "All":
            query["priority"] = priority
        if search and search.strip():
            query["$or"] = [
                {"firNumber": {"$regex": search.strip(), "$options": "i"}},
                {"title": {"$regex": search.strip(), "$options": "i"}},
                {"summary": {"$regex": search.strip(), "$options": "i"}},
            ]

        total = cases_collection.count_documents(query)
        skip = (page - 1) * limit
        cursor = cases_collection.find(query).sort("registeredDate", -1).skip(skip).limit(limit)

        data = []
        for doc in cursor:
            data.append({
                "id": str(doc.get("_id", "")),
                "caseNumber": doc.get("firNumber", f"FIR/{doc.get('crimeNo', '')}"),
                "title": doc.get("title", f"Case #{doc.get('caseMasterId', '')}"),
                "summary": doc.get("summary", ""),
                "status": doc.get("status", "Active"),
                "assignedTo": doc.get("assignedTo", "Investigating Officer"),
                "priority": doc.get("priority", "Normal"),
                "createdDate": str(doc.get("registeredDate", doc.get("createdAt", ""))),
                "lastUpdated": str(doc.get("updatedAt", "")),
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

@router.post("/cases")
def create_case(case_in: CaseCreateModel):
    try:
        db = get_db()
        cases_collection = db["cases"]

        doc = {
            "firNumber": case_in.caseNumber,
            "title": case_in.title,
            "summary": case_in.summary,
            "status": case_in.status,
            "priority": case_in.priority,
            "assignedTo": case_in.assignedTo,
            "registeredDate": datetime.datetime.utcnow(),
            "createdAt": datetime.datetime.utcnow(),
            "updatedAt": datetime.datetime.utcnow(),
        }
        res = cases_collection.insert_one(doc)
        return {"success": True, "id": str(res.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
