import os
import jwt
from datetime import datetime, timedelta
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional

security = HTTPBearer()

JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin123')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24


def verify_admin_password(password: str) -> bool:
    """Verify admin password"""
    return password == ADMIN_PASSWORD


def create_admin_token() -> dict:
    """Create JWT token for admin"""
    expiration = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    token_data = {
        'sub': 'admin',
        'exp': expiration
    }
    token = jwt.encode(token_data, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return {
        'token': token,
        'expiresIn': JWT_EXPIRATION_HOURS * 3600
    }


def verify_admin_token(credentials: HTTPAuthorizationCredentials = Security(security)) -> bool:
    """Verify JWT token for admin access"""
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get('sub') != 'admin':
            raise HTTPException(status_code=403, detail="Invalid authentication credentials")
        return True
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=403, detail="Could not validate credentials")
