import os
import jwt
from datetime import datetime, timedelta
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext

security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

JWT_SECRET_MERCHANT = os.environ.get('JWT_SECRET_MERCHANT', 'merchant-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_DAYS = 7


def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)


def create_merchant_token(merchant_id: str, email: str) -> dict:
    """Create JWT token for merchant"""
    expiration = datetime.utcnow() + timedelta(days=JWT_EXPIRATION_DAYS)
    token_data = {
        'sub': merchant_id,
        'email': email,
        'type': 'merchant',
        'exp': expiration
    }
    token = jwt.encode(token_data, JWT_SECRET_MERCHANT, algorithm=JWT_ALGORITHM)
    return {
        'token': token,
        'expiresIn': JWT_EXPIRATION_DAYS * 24 * 3600
    }


def verify_merchant_token(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
    """Verify JWT token for merchant access"""
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET_MERCHANT, algorithms=[JWT_ALGORITHM])
        
        if payload.get('type') != 'merchant':
            raise HTTPException(status_code=403, detail="Invalid token type")
        
        return {
            'merchant_id': payload.get('sub'),
            'email': payload.get('email')
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=403, detail="Could not validate credentials")
