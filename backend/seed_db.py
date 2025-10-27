import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from models import Merchant, MerchantStatus
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# Sample merchants data
SAMPLE_MERCHANTS = [
    {
        "brandName": "Luna Ceramics",
        "tagline": "Handcrafted pottery for mindful living",
        "description": "Sustainable handmade ceramic pieces crafted with love",
        "discount": "30% OFF",
        "category": "Home",
        "imageUrl": "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&q=80",
        "additionalImages": [
            "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&q=80",
            "https://images.unsplash.com/photo-1610701596061-2ecf227e85b2?w=400&q=80",
            "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&q=80",
            "https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=400&q=80"
        ],
        "externalUrl": "https://example.com/luna-ceramics",
        "email": "hello@lunaceramics.com",
        "badges": ["Emerging", "Sustainable", "Boutique"],
        "status": MerchantStatus.APPROVED
    },
    {
        "brandName": "Bloom & Thread",
        "tagline": "Organic cotton apparel",
        "description": "Ethically made clothing from organic materials",
        "discount": "25% OFF",
        "category": "Style",
        "imageUrl": "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80",
        "additionalImages": [
            "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&q=80",
            "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80",
            "https://images.unsplash.com/photo-1496217590455-aa63a8350eea?w=400&q=80",
            "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80"
        ],
        "externalUrl": "https://example.com/bloom-thread",
        "email": "info@bloomthread.com",
        "badges": ["Sustainable", "Boutique"],
        "status": MerchantStatus.APPROVED
    },
    {
        "brandName": "Artisan Coffee Co",
        "tagline": "Small-batch roasted perfection",
        "description": "Ethically sourced coffee beans roasted in small batches",
        "discount": "20% OFF",
        "category": "Food",
        "imageUrl": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80",
        "additionalImages": [
            "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&q=80",
            "https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?w=400&q=80",
            "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400&q=80",
            "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&q=80"
        ],
        "externalUrl": "https://example.com/artisan-coffee",
        "email": "hello@artisancoffee.com",
        "badges": ["Emerging", "Limited"],
        "status": MerchantStatus.APPROVED
    },
    {
        "brandName": "Echo Electronics",
        "tagline": "Minimalist tech accessories",
        "description": "Premium cables and accessories designed for longevity",
        "discount": "35% OFF",
        "category": "Tech",
        "imageUrl": "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=800&q=80",
        "additionalImages": [
            "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400&q=80",
            "https://images.unsplash.com/photo-1583394293214-28ded15ee548?w=400&q=80",
            "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&q=80",
            "https://images.unsplash.com/photo-1585792180666-f7347c490ee2?w=400&q=80"
        ],
        "externalUrl": "https://example.com/echo-electronics",
        "email": "support@echoelectronics.com",
        "badges": ["Tech", "Trending"],
        "status": MerchantStatus.APPROVED
    },
    {
        "brandName": "Wild Botanics",
        "tagline": "Plant-based skincare essentials",
        "description": "Clean beauty products made from botanical ingredients",
        "discount": "40% OFF",
        "category": "Beauty",
        "imageUrl": "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80",
        "additionalImages": [
            "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&q=80",
            "https://images.unsplash.com/photo-1571875257727-256c39da42af?w=400&q=80",
            "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400&q=80",
            "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&q=80"
        ],
        "externalUrl": "https://example.com/wild-botanics",
        "email": "hello@wildbotanics.com",
        "badges": ["Beauty", "Sustainable"],
        "status": MerchantStatus.APPROVED
    },
    {
        "brandName": "Studio Light",
        "tagline": "Handmade candles & home scents",
        "description": "Soy wax candles with essential oils",
        "discount": "25% OFF",
        "category": "Home",
        "imageUrl": "https://images.unsplash.com/photo-1602874801006-94c6e414b7ae?w=800&q=80",
        "additionalImages": [
            "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=400&q=80",
            "https://images.unsplash.com/photo-1602874801006-94c6e414b7ae?w=400&q=80",
            "https://images.unsplash.com/photo-1615876234886-fd9a39fda97f?w=400&q=80",
            "https://images.unsplash.com/photo-1603006904319-e24a1ab47e7c?w=400&q=80"
        ],
        "externalUrl": "https://example.com/studio-light",
        "email": "info@studiolight.com",
        "badges": ["Emerging", "Boutique"],
        "status": MerchantStatus.APPROVED
    },
    {
        "brandName": "Leather & Stitch",
        "tagline": "Handcrafted leather goods",
        "description": "Timeless leather bags and wallets made to last",
        "discount": "30% OFF",
        "category": "Accessories",
        "imageUrl": "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80",
        "additionalImages": [
            "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80",
            "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80",
            "https://images.unsplash.com/photo-1491637639811-60e2756cc1c7?w=400&q=80",
            "https://images.unsplash.com/photo-1564422167509-4f3763ff3e00?w=400&q=80"
        ],
        "externalUrl": "https://example.com/leather-stitch",
        "email": "hello@leatherstitch.com",
        "badges": ["Boutique", "Trending"],
        "status": MerchantStatus.APPROVED
    },
    {
        "brandName": "Peak Nutrition",
        "tagline": "Organic wellness supplements",
        "description": "Plant-based supplements for active lifestyles",
        "discount": "20% OFF",
        "category": "Health",
        "imageUrl": "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=800&q=80",
        "additionalImages": [
            "https://images.unsplash.com/photo-1550572017-4129e89e5b3f?w=400&q=80",
            "https://images.unsplash.com/photo-1556228852-80a43e6e4292?w=400&q=80",
            "https://images.unsplash.com/photo-1556228720-da4e85f25e15?w=400&q=80",
            "https://images.unsplash.com/photo-1556228578-dd339a4d3b2c?w=400&q=80"
        ],
        "externalUrl": "https://example.com/peak-nutrition",
        "email": "info@peaknutrition.com",
        "badges": ["Health", "Sustainable"],
        "status": MerchantStatus.APPROVED
    }
]


async def seed_database():
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client.get_database('popup_lane')
    
    print("Seeding database with sample merchants...")
    
    # Clear existing merchants
    await db.merchants.delete_many({})
    print("Cleared existing merchants")
    
    # Insert sample merchants
    for merchant_data in SAMPLE_MERCHANTS:
        merchant = Merchant(**merchant_data)
        await db.merchants.insert_one(merchant.dict())
        print(f"✓ Added {merchant.brandName}")
    
    print(f"\n✓ Successfully seeded {len(SAMPLE_MERCHANTS)} merchants!")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(seed_database())
