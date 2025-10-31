from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional
from datetime import datetime
from enum import Enum
import uuid
import re


class MerchantAccountStatus(str, Enum):
    PENDING_APPROVAL = "pending_approval"
    ACTIVE = "active"
    REJECTED = "rejected"


class MerchantAccountCreate(BaseModel):
    businessName: str = Field(..., min_length=2, max_length=100)
    contactName: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)
    phone: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = Field(None, max_length=1000)

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not re.search(r'[A-Z]', v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not re.search(r'[0-9]', v):
            raise ValueError('Password must contain at least one number')
        return v


class MerchantAccount(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    businessName: str
    contactName: str
    email: str
    passwordHash: str
    phone: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None
    accountStatus: MerchantAccountStatus = Field(default=MerchantAccountStatus.PENDING_APPROVAL)
    rejectionReason: Optional[str] = None
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    approvedAt: Optional[datetime] = None
    approvedBy: Optional[str] = None

    class Config:
        use_enum_values = True


class MerchantAccountLogin(BaseModel):
    email: EmailStr
    password: str


class MerchantAccountStatusUpdate(BaseModel):
    status: MerchantAccountStatus
    rejectionReason: Optional[str] = None


class MerchantAccountUpdate(BaseModel):
    phone: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None


class FileUpload(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    merchantAccountId: str
    dealId: Optional[str] = None
    filename: str
    storedPath: str
    fileSize: int
    mimeType: str
    uploadedAt: datetime = Field(default_factory=datetime.utcnow)
