# PopUp Lane - Merchant Authentication Flow

## 🔐 Complete Merchant Sign-Up & Sign-In Logic Flow

### Overview
Merchants must create an account and get admin approval before they can submit deals to PopUp Lane.

---

## 📋 User Flows

### **Flow 1: New Merchant Registration**

```
1. Merchant clicks "List Your Deal" 
   ↓
2. Redirected to Merchant Sign In page
   ↓
3. Clicks "Create Account" 
   ↓
4. Fills Merchant Registration Form:
   - Business Name *
   - Contact Person Name *
   - Email *
   - Password *
   - Confirm Password *
   - Phone Number
   - Business Website
   - Business Description
   ↓
5. Submits form
   ↓
6. Account created with status: "pending_approval"
   ↓
7. See message: "Your account is pending approval. We'll notify you within 24 hours."
   ↓
8. Admin receives notification (in admin dashboard)
   ↓
9. Admin reviews and approves/rejects account
   ↓
10a. If APPROVED:
     - Merchant status → "active"
     - Merchant receives email notification
     - Merchant can now sign in
   ↓
10b. If REJECTED:
     - Merchant status → "rejected"
     - Merchant receives email with reason
     - Cannot sign in
```

### **Flow 2: Approved Merchant Sign-In & Deal Submission**

```
1. Merchant goes to Sign In page
   ↓
2. Enters email & password
   ↓
3. System checks:
   - Credentials valid? 
   - Account status = "active"?
   ↓
4a. If account pending approval:
     → Show: "Your account is still pending approval"
   ↓
4b. If account rejected:
     → Show: "Your account was not approved. Contact support."
   ↓
4c. If account active:
     → Generate JWT token
     → Redirect to Merchant Dashboard
   ↓
5. In Merchant Dashboard, can:
   - View profile
   - Submit new deal
   - View submitted deals
   - Edit profile
   - Upload images
   ↓
6. Submit Deal:
   - Brand Name
   - Tagline
   - Description
   - Discount
   - Category
   - Upload Images (main + 4 additional)
   - External Store URL
   - Brand Story
   ↓
7. Deal submitted → Status: "pending"
   ↓
8. Admin reviews deal in admin dashboard
   ↓
9. Admin approves/rejects deal
   ↓
10a. If deal approved:
      → Appears on public discovery grid
      → Merchant notified
   ↓
10b. If deal rejected:
      → Merchant can edit and resubmit
```

---

## 🗄️ Database Schema Updates

### New Collection: **merchant_accounts**
```javascript
{
  id: "uuid",
  businessName: "Luna Ceramics",
  contactName: "Jane Smith",
  email: "jane@lunaceramics.com",
  passwordHash: "bcrypt_hash",
  phone: "+1234567890",
  website: "https://lunaceramics.com",
  description: "We create handmade pottery...",
  accountStatus: "pending_approval" | "active" | "rejected",
  rejectionReason: "string (optional)",
  createdAt: "timestamp",
  updatedAt: "timestamp",
  approvedAt: "timestamp",
  approvedBy: "admin_id"
}
```

### Updated Collection: **merchants (deals)**
```javascript
{
  id: "uuid",
  merchantAccountId: "uuid (FK to merchant_accounts)",
  brandName: "Luna Ceramics",
  tagline: "Handcrafted pottery for mindful living",
  description: "...",
  discount: "30% OFF",
  category: "Home",
  imageUrl: "/uploads/merchants/uuid/main.jpg",
  additionalImages: ["/uploads/merchants/uuid/img1.jpg"],
  externalUrl: "https://...",
  story: "...",
  badges: ["Emerging"],
  saves: 0,
  clicks: 0,
  status: "pending" | "approved" | "rejected",
  createdAt: "timestamp",
  updatedAt: "timestamp"
}
```

### New Collection: **uploads**
```javascript
{
  id: "uuid",
  merchantAccountId: "uuid",
  dealId: "uuid (optional)",
  filename: "original_name.jpg",
  storedPath: "/uploads/merchants/uuid/filename.jpg",
  fileSize: 1024000,
  mimeType: "image/jpeg",
  uploadedAt: "timestamp"
}
```

---

## 🔑 API Endpoints

### **Merchant Account Management**

```
POST /api/merchant/register
- Create new merchant account
- Body: { businessName, contactName, email, password, phone, website, description }
- Response: { id, message: "Account created. Pending approval." }

POST /api/merchant/login
- Authenticate merchant
- Body: { email, password }
- Response: { token, merchantAccount: {...}, expiresIn }

GET /api/merchant/profile
- Get current merchant's profile
- Headers: Authorization: Bearer <token>
- Response: { merchantAccount: {...} }

PATCH /api/merchant/profile
- Update merchant profile
- Headers: Authorization: Bearer <token>
- Body: { phone, website, description }
```

### **Merchant Deal Management**

```
POST /api/merchant/deals
- Submit new deal
- Headers: Authorization: Bearer <token>
- Body: FormData with images + deal data
- Response: { id, status: "pending", message }

GET /api/merchant/deals
- Get all deals for current merchant
- Headers: Authorization: Bearer <token>
- Response: [{ deal1 }, { deal2 }]

PATCH /api/merchant/deals/{id}
- Update existing deal
- Headers: Authorization: Bearer <token>
- Body: Updated deal data
```

### **File Upload**

```
POST /api/merchant/upload
- Upload image file
- Headers: Authorization: Bearer <token>
- Body: FormData with file
- Response: { url: "/uploads/merchants/uuid/file.jpg", fileId }

DELETE /api/merchant/upload/{fileId}
- Delete uploaded image
- Headers: Authorization: Bearer <token>
```

### **Admin - Merchant Account Approval**

```
GET /api/admin/merchant-accounts
- Get all merchant accounts
- Headers: Authorization: Bearer <admin_token>
- Response: [{ account1 }, { account2 }]

PATCH /api/admin/merchant-accounts/{id}/status
- Approve/reject merchant account
- Headers: Authorization: Bearer <admin_token>
- Body: { status: "active" | "rejected", rejectionReason }
```

---

## 🎨 UI Pages Required

### **1. Merchant Sign In Page** `/merchant/signin`
- Email input
- Password input
- "Sign In" button
- "Don't have an account? Register here" link
- "Forgot password?" link (future)

### **2. Merchant Registration Page** `/merchant/register`
- Business Name
- Contact Person Name
- Email
- Password
- Confirm Password
- Phone Number
- Business Website
- Business Description
- "Create Account" button
- "Already have an account? Sign in" link

### **3. Merchant Dashboard** `/merchant/dashboard`
- Welcome message with business name
- Navigation: Profile | My Deals | Submit Deal | Logout
- Stats: Total Deals, Approved, Pending, Total Clicks, Total Saves

### **4. Merchant Profile Page** `/merchant/profile`
- View/Edit profile information
- Change password option

### **5. Submit Deal Page** `/merchant/deals/submit`
- All deal fields
- Image upload with drag-and-drop
- Preview before submit

### **6. My Deals Page** `/merchant/deals`
- List of all submitted deals
- Filter by status (pending/approved/rejected)
- Edit/Delete options

---

## 🔒 Security Considerations

1. **Password Security:**
   - Hash passwords with bcrypt (min 10 rounds)
   - Enforce password strength (min 8 chars, 1 uppercase, 1 number)
   - Never store plain text passwords

2. **JWT Tokens:**
   - Separate JWT secrets for merchants and admins
   - Token expiry: 7 days for merchants
   - Refresh token mechanism (future)

3. **File Upload Security:**
   - Validate file types (only jpg, jpeg, png, webp)
   - Limit file size (max 5MB per image)
   - Scan for malware
   - Generate unique filenames (prevent overwrite)
   - Store in isolated directory per merchant

4. **Account Status Checks:**
   - Every API call checks if merchant account is "active"
   - Pending/rejected accounts cannot access merchant routes

---

## 🎯 Admin Dashboard Updates

### **New Tab: Merchant Accounts**
- List of all merchant accounts
- Filter: Pending | Active | Rejected | All
- For each account:
  - Business name, contact name, email
  - Registration date
  - Current status
  - Actions: Approve | Reject | View Details

### **Enhanced Deal Management**
- Show which merchant account submitted each deal
- Filter deals by merchant
- View merchant profile when reviewing deals

---

## 📧 Email Notifications (Future)

1. **Merchant Registration:** "Thank you for registering!"
2. **Account Approved:** "Your account has been approved! You can now sign in."
3. **Account Rejected:** "Your account was not approved. Reason: ..."
4. **Deal Submitted:** "Your deal has been submitted for review."
5. **Deal Approved:** "Your deal is now live on PopUp Lane!"
6. **Deal Rejected:** "Your deal needs revision. Feedback: ..."

---

## 🚀 Implementation Priority

**Phase 1: Core Authentication**
1. Merchant registration page
2. Merchant sign-in page
3. Backend authentication endpoints
4. JWT token generation and verification
5. Protected merchant routes

**Phase 2: Account Approval**
1. Admin dashboard merchant account tab
2. Approve/reject merchant accounts
3. Status checking on login

**Phase 3: File Upload**
1. Backend file upload handling
2. Image storage setup
3. Frontend drag-and-drop upload
4. Image preview

**Phase 4: Merchant Dashboard**
1. Dashboard home page
2. Submit deal page (with uploads)
3. My deals page
4. Profile management

---

## ✅ Success Criteria

- ✅ Merchant can register and create account
- ✅ Admin can approve/reject merchant accounts
- ✅ Approved merchants can sign in
- ✅ Merchants can upload images directly
- ✅ Merchants can submit deals
- ✅ Merchants can view their submitted deals
- ✅ Proper separation between merchant accounts and deals
- ✅ Secure file handling
- ✅ All routes properly protected with JWT

---

**This flow provides complete merchant authentication with admin approval workflow!**
