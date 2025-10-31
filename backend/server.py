from fastapi import FastAPI, APIRouter, HTTPException, Depends, Query
from fastapi.security import HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional
from datetime import datetime

from models import (
    Merchant, MerchantCreate, MerchantStatus, MerchantStatusUpdate,
    Shopper, ShopperCreate,
    Settings, SettingsUpdate, LaneStatus,
    AdminLogin, AdminToken, DashboardStats
)
from merchant_models import (
    MerchantAccount, MerchantAccountCreate, MerchantAccountLogin,
    MerchantAccountStatus, MerchantAccountStatusUpdate, MerchantAccountUpdate,
    FileUpload
)
from auth import verify_admin_password, create_admin_token, verify_admin_token
from merchant_auth import hash_password, verify_password, create_merchant_token, verify_merchant_token
from file_handler import save_upload_file, delete_upload_file
from utils import assign_badges
from fastapi import UploadFile, File, Form

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client.get_database('popup_lane')

# Create the main app without a prefix
app = FastAPI(title="PopUp Lane API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# ========== MERCHANT ENDPOINTS ==========

@api_router.post("/merchants", status_code=201)
async def create_merchant(merchant_data: MerchantCreate):
    """Submit a new merchant deal"""
    try:
        merchant_dict = merchant_data.dict()
        
        # Auto-assign badges
        merchant_dict['badges'] = assign_badges(merchant_dict)
        
        # Create merchant object
        merchant = Merchant(**merchant_dict)
        
        # Insert into database
        await db.merchants.insert_one(merchant.dict())
        
        return {
            "id": merchant.id,
            "status": merchant.status,
            "message": "Submission received! We'll review and notify you via email."
        }
    except Exception as e:
        logging.error(f"Error creating merchant: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to submit merchant")


@api_router.get("/merchants", response_model=List[Merchant])
async def get_merchants(
    category: Optional[str] = Query(None),
    status: Optional[str] = Query(None)
):
    """Get merchants (public sees only approved, admin can filter by status)"""
    try:
        query = {}
        
        # If no status specified, default to approved for public
        if status:
            query['status'] = status
        else:
            query['status'] = MerchantStatus.APPROVED
        
        if category:
            query['category'] = category
        
        merchants = await db.merchants.find(query).to_list(1000)
        return [Merchant(**merchant) for merchant in merchants]
    except Exception as e:
        logging.error(f"Error fetching merchants: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch merchants")


@api_router.patch("/merchants/{merchant_id}/status")
async def update_merchant_status(
    merchant_id: str,
    status_update: MerchantStatusUpdate,
    authorized: bool = Depends(verify_admin_token)
):
    """Update merchant status (admin only)"""
    try:
        result = await db.merchants.update_one(
            {"id": merchant_id},
            {"$set": {"status": status_update.status, "updatedAt": datetime.utcnow()}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Merchant not found")
        
        return {"message": "Status updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error updating merchant status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update status")


@api_router.post("/merchants/{merchant_id}/click")
async def track_merchant_click(merchant_id: str):
    """Track merchant click"""
    try:
        await db.merchants.update_one(
            {"id": merchant_id},
            {"$inc": {"clicks": 1}}
        )
        return {"message": "Click tracked"}
    except Exception as e:
        logging.error(f"Error tracking click: {str(e)}")
        return {"message": "Click tracking failed"}


@api_router.post("/merchants/{merchant_id}/save")
async def track_merchant_save(merchant_id: str):
    """Track merchant save"""
    try:
        await db.merchants.update_one(
            {"id": merchant_id},
            {"$inc": {"saves": 1}}
        )
        return {"message": "Save tracked"}
    except Exception as e:
        logging.error(f"Error tracking save: {str(e)}")
        return {"message": "Save tracking failed"}


# ========== SHOPPER ENDPOINTS ==========

@api_router.post("/shoppers", status_code=201)
async def create_shopper(shopper_data: ShopperCreate):
    """Newsletter signup"""
    try:
        # Check if email already exists
        existing = await db.shoppers.find_one({"email": shopper_data.email})
        if existing:
            return {"message": "You're already subscribed!"}
        
        shopper = Shopper(**shopper_data.dict())
        await db.shoppers.insert_one(shopper.dict())
        
        return {"message": "Successfully subscribed!"}
    except Exception as e:
        logging.error(f"Error creating shopper: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to subscribe")


@api_router.get("/shoppers", response_model=List[Shopper])
async def get_shoppers(authorized: bool = Depends(verify_admin_token)):
    """Get all newsletter subscribers (admin only)"""
    try:
        shoppers = await db.shoppers.find().to_list(1000)
        return [Shopper(**shopper) for shopper in shoppers]
    except Exception as e:
        logging.error(f"Error fetching shoppers: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch shoppers")


# ========== SETTINGS ENDPOINTS ==========

@api_router.get("/settings", response_model=Settings)
async def get_settings():
    """Get lane configuration (public)"""
    try:
        settings = await db.settings.find_one({"id": "main_settings"})
        
        if not settings:
            # Create default settings
            default_settings = Settings(
                openDate=datetime(2025, 11, 19, 0, 0, 0),
                closeDate=datetime(2025, 11, 30, 23, 59, 59),
                status=LaneStatus.COMING_SOON,
                seasonName="Black Friday 2025",
                merchantSpotLimit=50
            )
            await db.settings.insert_one(default_settings.dict())
            return default_settings
        
        return Settings(**settings)
    except Exception as e:
        logging.error(f"Error fetching settings: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch settings")


@api_router.patch("/settings")
async def update_settings(
    settings_update: SettingsUpdate,
    authorized: bool = Depends(verify_admin_token)
):
    """Update lane settings (admin only)"""
    try:
        update_data = {k: v for k, v in settings_update.dict().items() if v is not None}
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        result = await db.settings.update_one(
            {"id": "main_settings"},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Settings not found")
        
        return {"message": "Settings updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error updating settings: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update settings")


# ========== ADMIN ENDPOINTS ==========

@api_router.post("/admin/login", response_model=AdminToken)
async def admin_login(credentials: AdminLogin):
    """Admin authentication"""
    if not verify_admin_password(credentials.password):
        raise HTTPException(status_code=401, detail="Invalid password")
    
    return create_admin_token()


@api_router.get("/admin/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(authorized: bool = Depends(verify_admin_token)):
    """Get dashboard statistics (admin only)"""
    try:
        # Count merchants by status
        total_merchants = await db.merchants.count_documents({})
        pending_merchants = await db.merchants.count_documents({"status": MerchantStatus.PENDING})
        approved_merchants = await db.merchants.count_documents({"status": MerchantStatus.APPROVED})
        rejected_merchants = await db.merchants.count_documents({"status": MerchantStatus.REJECTED})
        
        # Count shoppers
        total_shoppers = await db.shoppers.count_documents({})
        
        # Get lane status
        settings = await db.settings.find_one({"id": "main_settings"})
        lane_status = settings.get('status', 'coming_soon') if settings else 'coming_soon'
        
        return DashboardStats(
            merchants={
                "total": total_merchants,
                "pending": pending_merchants,
                "approved": approved_merchants,
                "rejected": rejected_merchants
            },
            shoppers={
                "total": total_shoppers
            },
            laneStatus=lane_status
        )
    except Exception as e:
        logging.error(f"Error fetching dashboard stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch dashboard stats")


# ========== ROOT ENDPOINT ==========

@api_router.get("/")
async def root():
    return {
        "message": "Welcome to PopUp Lane API",
        "version": "1.0.0",
        "status": "active"
    }


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()