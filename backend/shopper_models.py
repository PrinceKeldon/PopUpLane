from pydantic import BaseModel, Field, EmailStr, validator
from typing import List, Optional
from datetime import datetime
import uuid
import re


class ShopperAccountCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)

    @validator('password')
    def validate_password(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters')
        return v


class ShopperAccount(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: str
    passwordHash: str
    savedFinds: List[str] = Field(default_factory=list)  # List of merchant IDs
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)


class ShopperAccountLogin(BaseModel):
    email: EmailStr
    password: str


class FindSave(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    shopperId: str
    merchantId: str
    savedAt: datetime = Field(default_factory=datetime.utcnow)


class ShareRequest(BaseModel):
    merchantIds: List[str]
    email: Optional[str] = None
    message: Optional[str] = None
