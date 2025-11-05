#!/usr/bin/env python3
"""
Debug script to check MongoDB merchant_accounts collection
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent / 'backend'
load_dotenv(ROOT_DIR / '.env')

async def debug_merchant_accounts():
    # MongoDB connection
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client.get_database('popup_lane')
    
    print("Checking merchant_accounts collection...")
    
    # Get all merchant accounts
    accounts = await db.merchant_accounts.find().to_list(1000)
    
    print(f"Found {len(accounts)} merchant accounts")
    
    for i, account in enumerate(accounts):
        print(f"\nAccount {i+1}:")
        for key, value in account.items():
            print(f"  {key}: {value} (type: {type(value)})")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(debug_merchant_accounts())