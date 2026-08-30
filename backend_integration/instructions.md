# KSP Sherlock - Backend Integration for KSP-SHERLOCK-ASSISTANT

To enable the live MongoDB endpoints on your Render backend (`ksp-sherlock-ai.onrender.com`):

### 1. In `KSP-SHERLOCK-ASSISTANT/requirements.txt`:
Add these two lines:
```text
pymongo>=4.6.0
dnspython>=2.6.0
```

### 2. Copy the Files into `KSP-SHERLOCK-ASSISTANT`:
* Copy `backend_integration/database.py` ➔ to `KSP-SHERLOCK-ASSISTANT/app/database/mongodb.py`
* Copy `backend_integration/cases_endpoint.py` ➔ to `KSP-SHERLOCK-ASSISTANT/app/api/endpoints/cases.py`
* Copy `backend_integration/offenders_endpoint.py` ➔ to `KSP-SHERLOCK-ASSISTANT/app/api/endpoints/offenders.py`

### 3. In `KSP-SHERLOCK-ASSISTANT/app/api/router.py`:
Add the two new routers:
```python
from fastapi import APIRouter
from app.api.endpoints import health, chat, data, retrieval, conversation, cases, offenders

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(chat.router, tags=["Chat"])
api_router.include_router(data.router, tags=["Data"])
api_router.include_router(retrieval.router, tags=["Retrieval"])
api_router.include_router(conversation.router, tags=["Conversation"])
api_router.include_router(cases.router, tags=["Cases"])
api_router.include_router(offenders.router, tags=["Offenders"])
```

### 4. Push to GitHub:
Commit and push to your `KSP-SHERLOCK-ASSISTANT` GitHub repo. Render will automatically deploy!
