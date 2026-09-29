from fastapi import APIRouter

from app.api.v1 import admin, auth, donors, hospitals

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(auth.router)
api_router.include_router(donors.router)
api_router.include_router(hospitals.router)
api_router.include_router(admin.router)
