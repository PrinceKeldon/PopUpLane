import os
import jwt
from datetime import datetime, timedelta
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext

security = HTTPBearer()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

JWT_SECRET_SHOPPER = os.environ.get('JWT_SECRET_SHOPPER', 'shopper-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_DAYS = 30


def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)


def create_shopper_token(shopper_id: str, email: str) -> dict:
    """Create JWT token for shopper"""
    expiration = datetime.utcnow() + timedelta(days=JWT_EXPIRATION_DAYS)
    token_data = {
        'sub': shopper_id,
        'email': email,
        'type': 'shopper',
        'exp': expiration
    }
    token = jwt.encode(token_data, JWT_SECRET_SHOPPER, algorithm=JWT_ALGORITHM)
    return {
        'token': token,
        'expiresIn': JWT_EXPIRATION_DAYS * 24 * 3600
    }


def verify_shopper_token(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
    """Verify JWT token for shopper access"""
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET_SHOPPER, algorithms=[JWT_ALGORITHM])
        
        if payload.get('type') != 'shopper':
            raise HTTPException(status_code=403, detail="Invalid token type")
        
        return {
            'shopper_id': payload.get('sub'),
            'email': payload.get('email')
        }
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=403, detail="Could not validate credentials")


def verify_shopper_token_optional(credentials: Optional[HTTPAuthorizationCredentials] = Security(security)) -> Optional[dict]:
    """Verify JWT token but allow unauthenticated access"""
    if not credentials:
        return None
    
    try:
        return verify_shopper_token(credentials)
    except:
        return None
