import os
import uuid
from pathlib import Path
from fastapi import UploadFile, HTTPException
import shutil
from typing import Tuple

UPLOAD_DIR = Path("/app/uploads")
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

# Create upload directory if it doesn't exist
UPLOAD_DIR.mkdir(exist_ok=True, parents=True)


def validate_image_file(file: UploadFile) -> None:
    """Validate uploaded image file"""
    # Check file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Check MIME type
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")


async def save_upload_file(file: UploadFile, merchant_id: str, deal_id: str = None) -> Tuple[str, int]:
    """Save uploaded file and return stored path and file size"""
    # Validate file
    validate_image_file(file)
    
    # Create merchant-specific directory
    merchant_dir = UPLOAD_DIR / "merchants" / merchant_id
    if deal_id:
        merchant_dir = merchant_dir / deal_id
    merchant_dir.mkdir(exist_ok=True, parents=True)
    
    # Generate unique filename
    file_ext = Path(file.filename).suffix.lower()
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = merchant_dir / unique_filename
    
    # Save file
    file_size = 0
    try:
        with open(file_path, "wb") as buffer:
            content = await file.read()
            file_size = len(content)
            
            # Check file size
            if file_size > MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=400,
                    detail=f"File size exceeds maximum allowed size of {MAX_FILE_SIZE / 1024 / 1024}MB"
                )
            
            buffer.write(content)
    except Exception as e:
        # Clean up if save fails
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Return relative path from upload directory
    relative_path = f"/uploads/merchants/{merchant_id}"
    if deal_id:
        relative_path += f"/{deal_id}"
    relative_path += f"/{unique_filename}"
    
    return relative_path, file_size


def delete_upload_file(file_path: str) -> bool:
    """Delete an uploaded file"""
    try:
        full_path = Path("/app") / file_path.lstrip('/')
        if full_path.exists():
            full_path.unlink()
            return True
        return False
    except Exception:
        return False
