# PopUp Lane - Backend Implementation Contract

## Overview
This document outlines the API contracts, data models, and integration plan for PopUp Lane backend development.

---

## A. API Contracts

### 1. Merchant Management

#### POST /api/merchants
**Purpose:** Submit a new merchant deal
**Request Body:**
```json
{
  "brandName": "string (required)",
  "tagline": "string (required)",
  "description": "string (required)",
  "discount": "string (required)",
  "category": "string (required)",
  "imageUrl": "string (required)",
  "additionalImages": ["string"] (optional, max 4),
  "externalUrl": "string (required)",
  "email": "string (required)",
  "story": "string (optional)"
}
```
**Response:** `201 Created`
```json
{
  "id": "string",
  "status": "pending",
  "message": "Submission received! We'll review and notify you via email."
}
```

#### GET /api/merchants
**Purpose:** Get all approved merchants (public)
**Query Params:**
- `category` (optional): Filter by category
- `status` (optional): Filter by status (admin only)
**Response:** `200 OK`
```json
[
  {
    "id": "string",
    "brandName": "string",
    "tagline": "string",
    "description": "string",
    "discount": "string",
    "category": "string",
    "imageUrl": "string",
    "additionalImages": ["string"],
    "externalUrl": "string",
    "badges": ["string"],
    "saves": number,
    "clicks": number,
    "status": "approved",
    "createdAt": "datetime"
  }
]
```

#### PATCH /api/merchants/{id}/status
**Purpose:** Approve/reject merchant (admin only)
**Request Body:**
```json
{
  "status": "approved" | "rejected" | "pending"
}
```
**Response:** `200 OK`

#### POST /api/merchants/{id}/click
**Purpose:** Track merchant click
**Response:** `200 OK`

#### POST /api/merchants/{id}/save
**Purpose:** Track merchant save
**Response:** `200 OK`

---

### 2. Shopper/Newsletter Management

#### POST /api/shoppers
**Purpose:** Newsletter signup
**Request Body:**
```json
{
  "email": "string (required)",
  "source": "string (optional)"
}
```
**Response:** `201 Created`
```json
{
  "message": "Successfully subscribed!"
}
```

#### GET /api/shoppers
**Purpose:** Get all newsletter subscribers (admin only)
**Response:** `200 OK`
```json
[
  {
    "id": "string",
    "email": "string",
    "signedUpAt": "datetime",
    "source": "string"
  }
]
```

---

### 3. Admin Management

#### POST /api/admin/login
**Purpose:** Admin authentication (simple password)
**Request Body:**
```json
{
  "password": "string"
}
```
**Response:** `200 OK`
```json
{
  "token": "string",
  "expiresIn": number
}
```

#### GET /api/admin/dashboard
**Purpose:** Get dashboard stats
**Headers:** `Authorization: Bearer {token}`
**Response:** `200 OK`
```json
{
  "merchants": {
    "total": number,
    "pending": number,
    "approved": number,
    "rejected": number
  },
  "shoppers": {
    "total": number
  },
  "laneStatus": "coming_soon" | "open" | "closed"
}
```

---

### 4. Lane Settings

#### GET /api/settings
**Purpose:** Get lane configuration (public)
**Response:** `200 OK`
```json
{
  "openDate": "datetime",
  "closeDate": "datetime",
  "status": "coming_soon" | "open" | "closed",
  "seasonName": "string",
  "merchantSpotLimit": number
}
```

#### PATCH /api/settings
**Purpose:** Update lane settings (admin only)
**Request Body:**
```json
{
  "openDate": "datetime (optional)",
  "closeDate": "datetime (optional)",
  "status": "string (optional)",
  "seasonName": "string (optional)",
  "merchantSpotLimit": "number (optional)"
}
```

---

## B. Mock Data to Replace

### From mock.js:
1. **MOCK_MERCHANTS** → Database: `merchants` collection
2. **MOCK_SHOPPERS** → Database: `shoppers` collection
3. **LANE_CONFIG** → Database: `settings` collection (single document)

---

## C. Backend Implementation Plan

### Phase 1: Database Models
- Merchant model (with validation)
- Shopper model
- Settings model
- Admin credentials (env variable)

### Phase 2: Core Endpoints
- Merchant CRUD operations
- Shopper newsletter signup
- Settings management
- Click/save tracking

### Phase 3: Admin Features
- Simple password auth with JWT
- Dashboard statistics
- Merchant approval workflow

### Phase 4: Integration
- Replace frontend mock data with API calls
- Add error handling and loading states
- Add toast notifications for user feedback

---

## D. Frontend Integration Changes

### Files to Update:

#### 1. `/app/frontend/src/components/DiscoveryGrid.jsx`
**Changes:**
- Replace `MOCK_MERCHANTS` import with API call to `/api/merchants`
- Add loading state
- Add error handling

#### 2. `/app/frontend/src/components/MerchantCard.jsx`
**Changes:**
- Update `handleVisit` to call `/api/merchants/{id}/click`
- Update `handleSave` to call `/api/merchants/{id}/save`

#### 3. `/app/frontend/src/components/NewsletterSection.jsx`
**Changes:**
- Replace mock submission with API call to `/api/shoppers`
- Add proper error handling

#### 4. `/app/frontend/src/components/Hero.jsx`
**Changes:**
- Fetch lane settings from `/api/settings` for countdown
- Update countdown based on live data

#### 5. Create new files:
- `/app/frontend/src/api/client.js` - Axios client setup
- `/app/frontend/src/pages/MerchantSubmission.jsx` - Merchant form page
- `/app/frontend/src/pages/AdminDashboard.jsx` - Admin interface
- `/app/frontend/src/pages/AdminLogin.jsx` - Admin auth

---

## E. Database Schema

### Collection: merchants
```javascript
{
  _id: ObjectId,
  brandName: String,
  tagline: String,
  description: String,
  discount: String,
  category: String,
  imageUrl: String,
  additionalImages: [String],
  externalUrl: String,
  email: String,
  story: String (optional),
  badges: [String],
  saves: Number (default: 0),
  clicks: Number (default: 0),
  status: String (enum: ['pending', 'approved', 'rejected'], default: 'pending'),
  createdAt: Date,
  updatedAt: Date
}
```

### Collection: shoppers
```javascript
{
  _id: ObjectId,
  email: String (unique),
  source: String,
  signedUpAt: Date
}
```

### Collection: settings
```javascript
{
  _id: ObjectId,
  openDate: Date,
  closeDate: Date,
  status: String (enum: ['coming_soon', 'open', 'closed']),
  seasonName: String,
  merchantSpotLimit: Number
}
```

---

## F. Environment Variables

### Backend (.env)
```
MONGO_URL=<existing>
DB_NAME=popup_lane
ADMIN_PASSWORD=<secure_password>
JWT_SECRET=<random_secret>
```

---

## G. Testing Checklist

- [ ] Merchant submission works
- [ ] Merchants appear in discovery grid
- [ ] Admin can approve/reject merchants
- [ ] Newsletter signup works
- [ ] Click tracking works
- [ ] Save tracking works
- [ ] Admin dashboard shows correct stats
- [ ] Settings update correctly
- [ ] Countdown syncs with database settings
