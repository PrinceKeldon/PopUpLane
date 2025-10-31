from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
import uuid


class PodcastType(str):
    FOUNDER_STORY = "founder_story"
    DROP_EPISODE = "drop_episode"


class PodcastGenerateRequest(BaseModel):
    merchantId: str
    dealId: Optional[str] = None
    episodeType: Literal["founder_story", "drop_episode"]
    
    # For founder story
    brandName: Optional[str] = None
    founderName: Optional[str] = None
    brandStory: Optional[str] = None
    mission: Optional[str] = None
    
    # For drop episode
    productName: Optional[str] = None
    productDescription: Optional[str] = None
    productFeatures: Optional[str] = None
    productPrice: Optional[str] = None
    discount: Optional[str] = None


class Podcast(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    merchantId: str
    merchantAccountId: Optional[str] = None
    dealId: Optional[str] = None
    episodeType: str
    
    title: str
    script: str
    transcript: str
    audioUrl: str
    duration: int  # in seconds
    
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    status: str = Field(default="active")  # active, archived


class PodcastResponse(BaseModel):
    id: str
    title: str
    audioUrl: str
    transcript: str
    duration: int
    episodeType: str
    createdAt: datetime
