from pydantic import BaseModel, Field, EmailStr, validator
from typing import List, Optional
from datetime import datetime
from enum import Enum
import uuid


class MerchantStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class LaneStatus(str, Enum):
    COMING_SOON = "coming_soon"
    OPEN = "open"
    CLOSED = "closed"


class MerchantCreate(BaseModel):
    brandName: str = Field(..., min_length=1, max_length=100)
    tagline: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=500)
    discount: str = Field(..., min_length=1, max_length=50)
    category: str = Field(..., min_length=1, max_length=50)
    imageUrl: str = Field(..., min_length=1)
    additionalImages: Optional[List[str]] = Field(default_factory=list, max_items=4)
    externalUrl: str = Field(..., min_length=1)
    email: EmailStr
    story: Optional[str] = Field(None, max_length=1000)


class Merchant(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    brandName: str
    tagline: str
    description: str
    discount: str
    category: str
    imageUrl: str
    additionalImages: List[str] = Field(default_factory=list)
    externalUrl: str
    email: str
    story: Optional[str] = None
    badges: List[str] = Field(default_factory=list)
    saves: int = Field(default=0)
    clicks: int = Field(default=0)
    status: MerchantStatus = Field(default=MerchantStatus.PENDING)
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        use_enum_values = True


class MerchantStatusUpdate(BaseModel):
    status: MerchantStatus


class ShopperCreate(BaseModel):
    email: EmailStr
    source: Optional[str] = "unknown"


class Shopper(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    source: str = "unknown"
    signedUpAt: datetime = Field(default_factory=datetime.utcnow)


class Settings(BaseModel):
    id: str = Field(default="main_settings")
    openDate: datetime
    closeDate: datetime
    status: LaneStatus = Field(default=LaneStatus.COMING_SOON)
    seasonName: str = "Black Friday 2025"
    merchantSpotLimit: int = 50

    class Config:
        use_enum_values = True


class SettingsUpdate(BaseModel):
    openDate: Optional[datetime] = None
    closeDate: Optional[datetime] = None
    status: Optional[LaneStatus] = None
    seasonName: Optional[str] = None
    merchantSpotLimit: Optional[int] = None


class AdminLogin(BaseModel):
    password: str


class AdminToken(BaseModel):
    token: str
    expiresIn: int


class DashboardStats(BaseModel):
    merchants: dict
    merchantAccounts: dict
    shoppers: dict
    laneStatus: str
