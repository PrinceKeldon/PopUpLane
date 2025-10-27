# PopUp Lane - Platform Access Guide

## 🎯 Complete Platform Overview

PopUp Lane is a fully functional Black Friday marketplace platform for small brands, launching **November 19, 2025 at 00:00:00 UTC**.

---

## 📍 How to Access Each Part of the Platform

### 1. **Public Landing Page (Shoppers)**
**URL:** `http://localhost:3000/` or your deployed URL

**Features:**
- View countdown timer to lane opening
- Browse approved merchant deals
- Filter by category (Home, Style, Tech, Beauty, Food, Accessories, Health)
- Save favorite merchants
- Subscribe to newsletter
- Click through to merchant stores (with UTM tracking)

**Navigation:**
- Click "Explore the Lane" to scroll to discovery grid
- Click "Get Notified" to scroll to newsletter signup
- Footer has links to all sections

---

### 2. **Merchant Submission Form**
**URL:** `http://localhost:3000/merchant/submit`

**How to Access:**
- From homepage: Click "List Your Deal on PopUp Lane" button in hero section
- From "How It Works" section: Click "List Your Deal Now" button
- From footer: Click "Submit a Deal" link
- Direct URL navigation

**What Merchants Can Do:**
- Submit their brand information
- Upload product images (main + up to 4 additional)
- Set Black Friday discount
- Choose category
- Add brand story (optional)
- Provide store URL and contact email

**Submission Flow:**
1. Fill out form with required fields
2. Click "Submit for Review"
3. See success message
4. Receive email confirmation (when email integration is added)
5. Status: "pending" (waiting for admin approval)

---

### 3. **Admin Login**
**URL:** `http://localhost:3000/admin/login`

**Credentials:**
- **Password:** `admin123` (default - change in production via env variable)

**How to Access:**
- From footer: Click "Admin" link
- Direct URL navigation

**Security:**
- JWT-based authentication
- Token stored in localStorage
- Token expires after 24 hours
- Protected routes redirect to login if not authenticated

---

### 4. **Admin Dashboard**
**URL:** `http://localhost:3000/admin/dashboard`

**Requirements:**
- Must be logged in as admin
- Will redirect to `/admin/login` if not authenticated

**Features:**

#### **Dashboard Stats Cards:**
1. **Total Merchants**
   - Shows total, approved, and pending counts
   - Real-time data from database

2. **Subscribers**
   - Shows newsletter sign-up count
   - Tracks all shopper emails

3. **Lane Status**
   - Shows current status: COMING SOON / OPEN / CLOSED
   - Synced with lane settings

#### **Merchant Management:**

**Filter Tabs:**
- **Pending (0)** - New submissions awaiting review
- **Approved (8)** - Live on the platform
- **Rejected (0)** - Declined submissions
- **All** - View everything

**For Each Merchant:**
- View product image, brand name, tagline, description
- See category, discount, clicks, saves
- View contact email
- **Actions (for pending merchants):**
  - ✅ **Approve** - Makes merchant visible on public site
  - ❌ **Reject** - Declines the submission

**Workflow:**
1. Merchant submits via form → Status: "pending"
2. Admin reviews in dashboard → Click "Approve" or "Reject"
3. If approved → Merchant appears in discovery grid
4. If rejected → Merchant notified (when email integration added)

---

## 🔧 Backend API Endpoints

All API endpoints are prefixed with `/api`

### **Public Endpoints:**
- `GET /api/merchants` - Get approved merchants (with optional category filter)
- `POST /api/merchants` - Submit new merchant
- `POST /api/merchants/{id}/click` - Track click
- `POST /api/merchants/{id}/save` - Track save
- `POST /api/shoppers` - Newsletter signup
- `GET /api/settings` - Get lane configuration

### **Admin-Only Endpoints (require JWT token):**
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/dashboard` - Dashboard statistics
- `PATCH /api/merchants/{id}/status` - Approve/reject merchant
- `GET /api/shoppers` - Get all subscribers
- `PATCH /api/settings` - Update lane settings

---

## 💾 Database Structure

**Collections in MongoDB (`popup_lane` database):**

### 1. **merchants**
```javascript
{
  id: "uuid",
  brandName: "Luna Ceramics",
  tagline: "Handcrafted pottery for mindful living",
  description: "...",
  discount: "30% OFF",
  category: "Home",
  imageUrl: "https://...",
  additionalImages: ["https://...", "https://..."],
  externalUrl: "https://...",
  email: "hello@brand.com",
  story: "...",
  badges: ["Emerging", "Sustainable"],
  saves: 0,
  clicks: 0,
  status: "approved" | "pending" | "rejected",
  createdAt: "2025-11-19T00:00:00Z",
  updatedAt: "2025-11-19T00:00:00Z"
}
```

### 2. **shoppers**
```javascript
{
  id: "uuid",
  email: "shopper@example.com",
  source: "newsletter_section" | "hero_cta",
  signedUpAt: "2025-11-19T00:00:00Z"
}
```

### 3. **settings**
```javascript
{
  id: "main_settings",
  openDate: "2025-11-19T00:00:00Z",
  closeDate: "2025-11-30T23:59:59Z",
  status: "coming_soon" | "open" | "closed",
  seasonName: "Black Friday 2025",
  merchantSpotLimit: 50
}
```

---

## 🚀 Quick Start Guide

### **For Merchants:**
1. Go to homepage
2. Click "List Your Deal on PopUp Lane"
3. Fill out submission form
4. Submit and wait for approval
5. Once approved, your brand appears on the lane!

### **For Admins:**
1. Go to `/admin/login`
2. Enter password: `admin123`
3. Review pending merchants
4. Approve or reject each submission
5. Monitor platform stats

### **For Shoppers:**
1. Visit homepage
2. Browse the discovery grid
3. Click "Visit Store" to shop
4. Save favorites for later
5. Subscribe to get notified of new drops

---

## 🔐 Security Notes

**Current Setup (Development):**
- Admin password: `admin123` (stored in environment variable)
- Simple password authentication with JWT
- Token expiry: 24 hours

**For Production:**
1. Change admin password via `ADMIN_PASSWORD` env variable
2. Update `JWT_SECRET` env variable to a strong random string
3. Consider adding rate limiting
4. Enable HTTPS
5. Add email verification for merchants
6. Implement password reset flow

---

## 📊 Current Platform Status

**Merchants:** 8 approved, 0 pending, 0 rejected
**Subscribers:** 2 newsletter sign-ups
**Lane Status:** COMING_SOON
**Launch Date:** November 19, 2025 00:00:00 UTC

---

## 🎨 Design Features

- Countdown timer with vibrant gradient glow effects
- Merchant cards with scrollable image gallery (up to 5 images)
- Category filtering
- Click & save tracking
- Smooth animations and micro-interactions
- Responsive design (mobile, tablet, desktop)
- Brand colors: #111 (Charcoal), #FAFAFA (Off-White), #3A7BD5 (Blue), #FF4F81 (Pink)

---

## 📝 Notes

1. **No Merchant Portal:** Merchants don't have login accounts. They submit once and get approved/rejected. All management happens in admin dashboard.

2. **Email Integration:** Currently stores emails but doesn't send them. Ready to integrate with Resend, SendGrid, or similar service.

3. **File Uploads:** Currently uses image URLs. Can be upgraded to support file uploads with cloud storage (S3, Cloudinary).

4. **Analytics:** Tracks clicks and saves in database. Ready to integrate with Google Analytics, Plausible, or PostHog for detailed insights.

---

## 🛠️ Development Commands

```bash
# Seed database with sample merchants
cd /app/backend && python seed_db.py

# Restart backend
sudo supervisorctl restart backend

# Restart frontend
sudo supervisorctl restart frontend

# View logs
tail -f /var/log/supervisor/backend.err.log
tail -f /var/log/supervisor/frontend.out.log
```

---

## ✅ All Features Implemented

- ✅ Public landing page with countdown
- ✅ Discovery grid with approved merchants
- ✅ Category filtering
- ✅ Newsletter signup
- ✅ Merchant submission form
- ✅ Admin login with JWT
- ✅ Admin dashboard with stats
- ✅ Merchant approval workflow
- ✅ Click & save tracking
- ✅ Responsive design
- ✅ Database integration
- ✅ API endpoints
- ✅ Auto-badge assignment

---

**Platform is ready for launch! 🚀**
