from fastapi import FastAPI, APIRouter, HTTPException, Depends, Query
from fastapi.security import HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional
from datetime import datetime
import uuid

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
from shopper_models import ShopperAccount, ShopperAccountCreate, ShopperAccountLogin, FindSave, ShareRequest
from shopper_auth import hash_password as hash_shopper_password, verify_password as verify_shopper_password, create_shopper_token, verify_shopper_token
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


# ========== SHOPPER ACCOUNT ENDPOINTS ==========

@api_router.post("/shopper/register", status_code=201)
async def register_shopper(account_data: ShopperAccountCreate):
    """Register new shopper account"""
    try:
        # Check if email already exists
        existing = await db.shopper_accounts.find_one({"email": account_data.email})
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Hash password
        password_hash = hash_shopper_password(account_data.password)
        
        # Create account
        account_dict = account_data.dict(exclude={'password'})
        account_dict['passwordHash'] = password_hash
        account = ShopperAccount(**account_dict)
        
        await db.shopper_accounts.insert_one(account.dict())
        
        return {
            "id": account.id,
            "message": "Account created successfully!"
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error registering shopper: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to register")


@api_router.post("/shopper/login")
async def shopper_login(credentials: ShopperAccountLogin):
    """Shopper authentication"""
    try:
        # Find shopper account
        account = await db.shopper_accounts.find_one({"email": credentials.email})
        if not account:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Verify password
        if not verify_shopper_password(credentials.password, account['passwordHash']):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Create token
        token_data = create_shopper_token(account['id'], account['email'])
        
        # Return account info (without password hash)
        account_obj = ShopperAccount(**account)
        account_dict = account_obj.dict(exclude={'passwordHash'})
        
        return {
            **token_data,
            "shopperAccount": account_dict
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error during shopper login: {str(e)}")
        raise HTTPException(status_code=500, detail="Login failed")


@api_router.get("/shopper/profile")
async def get_shopper_profile(shopper_data: dict = Depends(verify_shopper_token)):
    """Get current shopper's profile"""
    try:
        account = await db.shopper_accounts.find_one({"id": shopper_data['shopper_id']})
        if not account:
            raise HTTPException(status_code=404, detail="Shopper account not found")
        
        account_obj = ShopperAccount(**account)
        return account_obj.dict(exclude={'passwordHash'})
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching shopper profile: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch profile")


# ========== FINDS (SAVE) ENDPOINTS ==========

@api_router.post("/shopper/finds/{merchant_id}")
async def save_find(merchant_id: str, shopper_data: dict = Depends(verify_shopper_token)):
    """Save a merchant to shopper's finds"""
    try:
        shopper_id = shopper_data['shopper_id']
        
        # Check if already saved
        existing = await db.finds.find_one({
            "shopperId": shopper_id,
            "merchantId": merchant_id
        })
        
        if existing:
            return {"message": "Already in your finds", "saved": True}
        
        # Create find
        find = FindSave(shopperId=shopper_id, merchantId=merchant_id)
        await db.finds.insert_one(find.dict())
        
        # Increment merchant saves count
        await db.merchants.update_one(
            {"id": merchant_id},
            {"$inc": {"saves": 1}}
        )
        
        return {"message": "Added to finds", "saved": True}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error saving find: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to save find")


@api_router.delete("/shopper/finds/{merchant_id}")
async def remove_find(merchant_id: str, shopper_data: dict = Depends(verify_shopper_token)):
    """Remove a merchant from shopper's finds"""
    try:
        shopper_id = shopper_data['shopper_id']
        
        result = await db.finds.delete_one({
            "shopperId": shopper_id,
            "merchantId": merchant_id
        })
        
        if result.deleted_count > 0:
            # Decrement merchant saves count
            await db.merchants.update_one(
                {"id": merchant_id},
                {"$inc": {"saves": -1}}
            )
        
        return {"message": "Removed from finds", "saved": False}
    except Exception as e:
        logging.error(f"Error removing find: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to remove find")


@api_router.get("/shopper/finds")
async def get_finds(shopper_data: dict = Depends(verify_shopper_token)):
    """Get all saved finds for shopper"""
    try:
        shopper_id = shopper_data['shopper_id']
        
        # Get all finds
        finds = await db.finds.find({"shopperId": shopper_id}).to_list(1000)
        merchant_ids = [f['merchantId'] for f in finds]
        
        if not merchant_ids:
            return []
        
        # Get merchant details
        merchants = await db.merchants.find({
            "id": {"$in": merchant_ids},
            "status": "approved"
        }).to_list(1000)
        
        return [Merchant(**m) for m in merchants]
    except Exception as e:
        logging.error(f"Error fetching finds: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch finds")


@api_router.get("/shopper/finds/check/{merchant_id}")
async def check_if_saved(merchant_id: str, shopper_data: dict = Depends(verify_shopper_token)):
    """Check if merchant is in shopper's finds"""
    try:
        existing = await db.finds.find_one({
            "shopperId": shopper_data['shopper_id'],
            "merchantId": merchant_id
        })
        
        return {"saved": existing is not None}
    except Exception as e:
        logging.error(f"Error checking find: {str(e)}")
        return {"saved": False}


# ========== TRENDING & DISCOVERY ENDPOINTS ==========

@api_router.get("/merchants/trending")
async def get_trending_merchants():
    """Get trending merchants based on clicks and saves"""
    try:
        # Get approved merchants sorted by engagement
        merchants = await db.merchants.find(
            {"status": "approved"}
        ).sort([("clicks", -1), ("saves", -1)]).limit(6).to_list(6)
        
        return [Merchant(**m) for m in merchants]
    except Exception as e:
        logging.error(f"Error fetching trending merchants: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch trending merchants")


@api_router.get("/merchants/recent")
async def get_recent_merchants():
    """Get recently added merchants"""
    try:
        merchants = await db.merchants.find(
            {"status": "approved"}
        ).sort("createdAt", -1).limit(6).to_list(6)
        
        return [Merchant(**m) for m in merchants]
    except Exception as e:
        logging.error(f"Error fetching recent merchants: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch recent merchants")


# ========== MERCHANT ACCOUNT ENDPOINTS ==========

@api_router.post("/merchant/register", status_code=201)
async def register_merchant(account_data: MerchantAccountCreate):
    """Register new merchant account"""
    try:
        # Check if email already exists
        existing = await db.merchant_accounts.find_one({"email": account_data.email})
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Hash password
        password_hash = hash_password(account_data.password)
        
        # Create account
        account_dict = account_data.dict(exclude={'password'})
        account_dict['passwordHash'] = password_hash
        account = MerchantAccount(**account_dict)
        
        await db.merchant_accounts.insert_one(account.dict())
        
        return {
            "id": account.id,
            "message": "Account created successfully. Pending admin approval."
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error registering merchant: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to register merchant")


@api_router.post("/merchant/login")
async def merchant_login(credentials: MerchantAccountLogin):
    """Merchant authentication"""
    try:
        # Find merchant account
        account = await db.merchant_accounts.find_one({"email": credentials.email})
        if not account:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Verify password
        if not verify_password(credentials.password, account['passwordHash']):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Check account status
        if account['accountStatus'] == MerchantAccountStatus.PENDING_APPROVAL:
            raise HTTPException(
                status_code=403,
                detail="Your account is pending approval. We'll notify you once approved."
            )
        
        if account['accountStatus'] == MerchantAccountStatus.REJECTED:
            reason = account.get('rejectionReason', 'No reason provided')
            raise HTTPException(
                status_code=403,
                detail=f"Your account was not approved. Reason: {reason}"
            )
        
        # Create token
        token_data = create_merchant_token(account['id'], account['email'])
        
        # Return account info (without password hash)
        account_obj = MerchantAccount(**account)
        account_dict = account_obj.dict(exclude={'passwordHash'})
        
        return {
            **token_data,
            "merchantAccount": account_dict
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error during merchant login: {str(e)}")
        raise HTTPException(status_code=500, detail="Login failed")


@api_router.get("/merchant/profile")
async def get_merchant_profile(merchant_data: dict = Depends(verify_merchant_token)):
    """Get current merchant's profile"""
    try:
        account = await db.merchant_accounts.find_one({"id": merchant_data['merchant_id']})
        if not account:
            raise HTTPException(status_code=404, detail="Merchant account not found")
        
        account_obj = MerchantAccount(**account)
        return account_obj.dict(exclude={'passwordHash'})
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching merchant profile: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch profile")


@api_router.patch("/merchant/profile")
async def update_merchant_profile(
    updates: MerchantAccountUpdate,
    merchant_data: dict = Depends(verify_merchant_token)
):
    """Update merchant profile"""
    try:
        update_data = {k: v for k, v in updates.dict().items() if v is not None}
        update_data['updatedAt'] = datetime.utcnow()
        
        result = await db.merchant_accounts.update_one(
            {"id": merchant_data['merchant_id']},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Merchant account not found")
        
        return {"message": "Profile updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error updating merchant profile: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update profile")


# ========== MERCHANT DEAL ENDPOINTS ==========

@api_router.post("/merchant/deals", status_code=201)
async def create_merchant_deal(
    brandName: str = Form(...),
    tagline: str = Form(...),
    description: str = Form(...),
    discount: str = Form(...),
    category: str = Form(...),
    externalUrl: str = Form(...),
    story: str = Form(None),
    mainImage: UploadFile = File(...),
    additionalImages: List[UploadFile] = File(None),
    merchant_data: dict = Depends(verify_merchant_token)
):
    """Submit new deal with image uploads"""
    try:
        merchant_id = merchant_data['merchant_id']
        deal_id = str(uuid.uuid4())
        
        # Save main image
        main_image_path, main_image_size = await save_upload_file(mainImage, merchant_id, deal_id)
        
        # Record main image upload
        main_upload = FileUpload(
            merchantAccountId=merchant_id,
            dealId=deal_id,
            filename=mainImage.filename,
            storedPath=main_image_path,
            fileSize=main_image_size,
            mimeType=mainImage.content_type
        )
        await db.uploads.insert_one(main_upload.dict())
        
        # Save additional images
        additional_image_paths = []
        if additionalImages:
            for img in additionalImages[:4]:  # Max 4 additional images
                if img.filename:
                    img_path, img_size = await save_upload_file(img, merchant_id, deal_id)
                    additional_image_paths.append(img_path)
                    
                    # Record upload
                    upload = FileUpload(
                        merchantAccountId=merchant_id,
                        dealId=deal_id,
                        filename=img.filename,
                        storedPath=img_path,
                        fileSize=img_size,
                        mimeType=img.content_type
                    )
                    await db.uploads.insert_one(upload.dict())
        
        # Get merchant account for email
        account = await db.merchant_accounts.find_one({"id": merchant_id})
        
        # Create deal
        deal_data = {
            'id': deal_id,
            'merchantAccountId': merchant_id,
            'brandName': brandName,
            'tagline': tagline,
            'description': description,
            'discount': discount,
            'category': category,
            'imageUrl': main_image_path,
            'additionalImages': additional_image_paths,
            'externalUrl': externalUrl,
            'email': account['email'],
            'story': story,
            'badges': assign_badges({'description': description, 'story': story, 'category': category})
        }
        
        deal = Merchant(**deal_data)
        await db.merchants.insert_one(deal.dict())
        
        return {
            "id": deal.id,
            "status": deal.status,
            "message": "Deal submitted successfully. Awaiting approval."
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error creating merchant deal: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to submit deal")


@api_router.get("/merchant/deals")
async def get_merchant_deals(merchant_data: dict = Depends(verify_merchant_token)):
    """Get all deals for current merchant"""
    try:
        deals = await db.merchants.find({"merchantAccountId": merchant_data['merchant_id']}).to_list(1000)
        return [Merchant(**deal) for deal in deals]
    except Exception as e:
        logging.error(f"Error fetching merchant deals: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch deals")


# ========== FILE UPLOAD ENDPOINTS ==========

@api_router.post("/merchant/upload")
async def upload_file(
    file: UploadFile = File(...),
    merchant_data: dict = Depends(verify_merchant_token)
):
    """Upload a single image file"""
    try:
        merchant_id = merchant_data['merchant_id']
        file_path, file_size = await save_upload_file(file, merchant_id)
        
        # Record upload
        upload = FileUpload(
            merchantAccountId=merchant_id,
            filename=file.filename,
            storedPath=file_path,
            fileSize=file_size,
            mimeType=file.content_type
        )
        await db.uploads.insert_one(upload.dict())
        
        return {
            "url": file_path,
            "fileId": upload.id,
            "message": "File uploaded successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error uploading file: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to upload file")


@api_router.delete("/merchant/upload/{file_id}")
async def delete_file(
    file_id: str,
    merchant_data: dict = Depends(verify_merchant_token)
):
    """Delete an uploaded file"""
    try:
        # Find upload record
        upload = await db.uploads.find_one({
            "id": file_id,
            "merchantAccountId": merchant_data['merchant_id']
        })
        
        if not upload:
            raise HTTPException(status_code=404, detail="File not found")
        
        # Delete physical file
        delete_upload_file(upload['storedPath'])
        
        # Delete database record
        await db.uploads.delete_one({"id": file_id})
        
        return {"message": "File deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error deleting file: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to delete file")


# ========== ADMIN ENDPOINTS ==========

@api_router.post("/admin/login", response_model=AdminToken)
async def admin_login(credentials: AdminLogin):
    """Admin authentication"""
    if not verify_admin_password(credentials.password):
        raise HTTPException(status_code=401, detail="Invalid password")
    
    return create_admin_token()


@api_router.get("/admin/merchant-accounts")
async def get_merchant_accounts(
    status: Optional[str] = Query(None),
    authorized: bool = Depends(verify_admin_token)
):
    """Get all merchant accounts (admin only)"""
    try:
        query = {}
        if status:
            query['accountStatus'] = status
        
        accounts = await db.merchant_accounts.find(query).to_list(1000)
        # Remove password hashes
        for account in accounts:
            account.pop('passwordHash', None)
        return accounts
    except Exception as e:
        logging.error(f"Error fetching merchant accounts: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch merchant accounts")


@api_router.patch("/admin/merchant-accounts/{account_id}/status")
async def update_merchant_account_status(
    account_id: str,
    status_update: MerchantAccountStatusUpdate,
    authorized: bool = Depends(verify_admin_token)
):
    """Approve/reject merchant account (admin only)"""
    try:
        update_data = {
            "accountStatus": status_update.status,
            "updatedAt": datetime.utcnow()
        }
        
        if status_update.status == MerchantAccountStatus.ACTIVE:
            update_data["approvedAt"] = datetime.utcnow()
        
        if status_update.rejectionReason:
            update_data["rejectionReason"] = status_update.rejectionReason
        
        result = await db.merchant_accounts.update_one(
            {"id": account_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Merchant account not found")
        
        return {"message": "Merchant account status updated successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error updating merchant account status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update status")


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
        
        # Count merchant accounts
        total_accounts = await db.merchant_accounts.count_documents({})
        pending_accounts = await db.merchant_accounts.count_documents({"accountStatus": "pending_approval"})
        active_accounts = await db.merchant_accounts.count_documents({"accountStatus": "active"})
        rejected_accounts = await db.merchant_accounts.count_documents({"accountStatus": "rejected"})
        
        # Get lane status
        settings = await db.settings.find_one({"id": "main_settings"})
        lane_status = settings.get('status', 'coming_soon') if settings else 'coming_soon'
        
        return {
            "merchants": {
                "total": total_merchants,
                "pending": pending_merchants,
                "approved": approved_merchants,
                "rejected": rejected_merchants
            },
            "merchantAccounts": {
                "total": total_accounts,
                "pending": pending_accounts,
                "active": active_accounts,
                "rejected": rejected_accounts
            },
            "shoppers": {
                "total": total_shoppers
            },
            "laneStatus": lane_status
        }
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

# Serve uploaded files
app.mount("/uploads", StaticFiles(directory="/app/uploads"), name="uploads")

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