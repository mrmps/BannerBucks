# 🎯 Monetize Banner - Complete Platform Plan

## Platform Overview
A marketplace connecting Twitter creators with sponsors who want to advertise on profile banners.

**Phase 1 (Current):** Directory of creators willing to be sponsored  
**Phase 2 (2 weeks):** Payment processing via Stripe

---

## 🗺️ SIMPLIFIED SITE MAP

### **Public Pages (No Login Required)**

1. **`/` - Homepage/Directory** - Browse all creators
2. **`/creator/[username]` - Creator Profile** - View details & contact info
3. **`/how-it-works` - Explainer** - Simple guide
4. **`/login` - Twitter OAuth** - Sign in

### **Creator Pages (Login Required)**

5. **`/dashboard` - Creator Dashboard** - Stats & profile preview
6. **`/dashboard/settings` - Sponsorship Settings** - Set price, categories, contact info

---

## 📄 DETAILED PAGE BREAKDOWN

### 1️⃣ **Homepage `/` - Public Directory**

**Purpose:** Browse all creators available for sponsorship

**Banner (Top):**
```
⚠️ Payments launching in 2 weeks! Join now to be first in line.
[Join as Creator] [Browse as Sponsor]
```

**Header:**
- Logo: "Monetize Banner"
- Tagline: "Turn your Twitter profile into revenue"
- CTA: "Sign in with Twitter / X"

**Filters Section:**
```
┌─────────────────────────────────┐
│ Search: [_______________] 🔍    │
│                                 │
│ Followers:                      │
│ ○ All  ○ 1K+  ○ 10K+  ○ 100K+  │
│                                 │
│ Price Range:                    │
│ ○ All  ○ $100-500  ○ $500-1K    │
│ ○ $1K-5K  ○ $5K+                │
│                                 │
│ Categories:                     │
│ □ Tech  □ Finance  □ Gaming     │
│ □ Lifestyle  □ Business         │
│ □ Education  □ Other            │
│                                 │
│ Sort by:                        │
│ ○ Most Followers  ○ Best Value  │
│ ○ Recently Joined  ○ Lowest Price│
└─────────────────────────────────┘
```

**Creator Grid:**
- User cards (4 columns on desktop)
- Each card shows:
  - Banner image
  - Profile pic
  - Name @username
  - Bio (2 lines)
  - Est. Profile Visits/Month
  - **Price Range: $500-1,000/month**
  - **Looking for: Tech, SaaS sponsors**
  - **Status badge: "Available" (green)**
  - [View Profile] button

**Stats Bar (Bottom):**
```
[1,234 Creators] [45M+ Monthly Impressions] [67 Active Campaigns]
```

---

### 2️⃣ **Creator Profile `/creator/[username]`**

**Purpose:** Detailed creator page with contact form

**Layout:**

**Hero Section:**
- Large banner preview (actual banner)
- Profile pic (large)
- Name, @username, verified badge
- Bio (full, not truncated)
- Location
- Website link
- [Message Creator] button (for sponsors)

**Stats Grid:**
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Followers    │ Est. Visits  │ Engagement   │ Verified     │
│ 3.9K         │ 6.5K/mo      │ 2.7%         │ 1.6K         │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

**Sponsorship Details:**
```
┌─────────────────────────────────────────────┐
│ 💰 Sponsorship Pricing                      │
│ $500 - $1,000 per month                     │
│                                             │
│ 🎯 Looking For                               │
│ • Tech companies                            │
│ • SaaS products                             │
│ • Developer tools                           │
│                                             │
│ 📊 Estimated Value                          │
│ CPM: $77-154 (Cost per 1,000 impressions)  │
│                                             │
│ ✅ Status: Available                        │
└─────────────────────────────────────────────┘
```

**Contact Creator:**
```
Interested in sponsoring @username?

Reach out via:
• Twitter DM: @username
• Email: creator@example.com

Or visit their links:
• Website: https://example.com
```

**Note:** Messaging system coming in Phase 2!

---

### 3️⃣ **How It Works `/how-it-works`**

**For Creators:**
```
1. Sign in with Twitter
   ↓
2. Set your sponsorship preferences
   • Price range
   • Sponsor categories
   • Availability
   ↓
3. Appear in directory
   ↓
4. Receive sponsor inquiries
   ↓
5. Review and accept offers
   ↓
6. Get paid (coming in 2 weeks!)
```

**For Sponsors:**
```
1. Sign in with Twitter
   ↓
2. Browse creator directory
   • Filter by followers
   • Filter by price
   • Filter by category
   ↓
3. View detailed creator profiles
   ↓
4. Send inquiry
   ↓
5. Negotiate directly
   ↓
6. Pay via platform (coming in 2 weeks!)
```

**FAQ Section:**
- How are profile visits calculated?
- Can I update my price?
- What kind of banners are allowed?
- How do payments work?

---

### 4️⃣ **Login `/login`**

**Simple login page:**
- "Welcome to Monetize Banner"
- [Sign in with Twitter / X] button
- "Join as Creator or Sponsor"
- Links to How It Works, Pricing

---

### 5️⃣ **Creator Dashboard `/dashboard`**

**Banner (if not set up):**
```
⚠️ Complete your profile to appear in directory!
[Complete Setup →]
```

**Quick Stats:**
```
┌──────────────┬──────────────┬──────────────┐
│ Profile      │ Inquiries    │ Earnings     │
│ Views/Month  │ This Week    │ (Coming Soon)│
│ 6.5K         │ 3            │ $0           │
└──────────────┴──────────────┴──────────────┘
```

**Your Profile Preview:**
- Your UserCard component
- [Edit Settings] button
- [Manage Banner] button

**Your Listing:**
```
Current Status: ✅ Available for Sponsorship

[Edit Settings] [Preview Public Profile]
```

**Quick Actions:**
- [Refresh Twitter Data]
- [Update Status]
- [Share Profile Link]

---

### 6️⃣ **Creator Settings `/dashboard/settings`**

**Sponsorship Preferences:**

**Price Range:**
```
Minimum: $[____] per month
Maximum: $[____] per month

Suggested based on your stats: $500-1,000/month
```

**Categories (Select all that apply):**
```
□ Technology        □ Finance
□ SaaS              □ E-commerce
□ Gaming            □ Education
□ Lifestyle         □ Business Tools
□ Marketing         □ Crypto/Web3
□ Health & Fitness  □ Other: [____]
```

**Sponsor Requirements:**
```
Looking for sponsors who are:
[Multi-line text area for requirements]

Example: "Looking for tech companies, SaaS products, or developer
tools. Must align with my audience of software engineers."
```

**Profile Visibility:**
```
○ Public - Show in directory
○ Private - Only show to sponsors I approve
○ Hidden - Don't show in directory
```

**Contact Info:**
```
How should sponsors reach you?
○ Twitter DM (@username)
○ Email: [_______________]
○ Other: [_______________]
```

[Save Settings]

---

## 🎨 DATABASE SCHEMA

```typescript
// User table (extend existing Better Auth + Twitter fields)
interface User {
  // ... existing Better Auth fields (id, email, name, image, etc.)
  // ... existing Twitter fields (twitterId, followers, etc.)
  
  // NEW: Creator settings (add these columns)
  creatorStatus: "available" | "unavailable" | "hidden" | null;
  creatorPriceMin: number | null;
  creatorPriceMax: number | null;
  creatorCategories: string | null; // JSON string: ["tech", "saas"]
  creatorLookingFor: string | null; // Message to sponsors
  creatorContactMethod: "twitter" | "email" | "other" | null;
  creatorContactValue: string | null; // @username, email, or custom
}
```

**That's it!** No additional tables needed for MVP. Keep it simple.

---

## 🔄 USER FLOWS

### **Flow 1: Creator Onboarding**

```
1. Visit homepage
   ↓
2. Click "Sign in with Twitter / X"
   ↓
3. Authorize on Twitter
   ↓
4. Redirect to /dashboard
   ↓
5. See banner: "Complete your profile to appear in directory!"
   ↓
6. Click "Complete Setup" → /dashboard/settings
   ↓
7. Fill out:
   • Price range ($500-1,000)
   • Categories (Tech, SaaS)
   • Looking for (description)
   • Status → Available
   ↓
8. Click "Save & Go Live"
   ↓
9. Now appears in public directory!
   ↓
10. Can share profile link: /creator/username
```

### **Flow 2: Sponsor Finding Creator**

```
1. Visit homepage
   ↓
2. Browse directory of creators
   ↓
3. Filter by:
   • Follower count
   • Price range
   • Category
   ↓
4. Click on creator card
   ↓
5. See creator profile with:
   • Full stats
   • Price range
   • What they're looking for
   • Contact info (Twitter/Email)
   ↓
6. Contact creator directly via Twitter DM or email
   ↓
7. Negotiate deal off-platform
   ↓
8. (Phase 2) Return to platform for payment
```

---

## 🎯 FEATURES BREAKDOWN

### **Phase 1 Features (Current - Directory Mode)**

#### ✅ **Already Built:**
1. Twitter OAuth login
2. Fetch all Twitter user data
3. User cards with stats
4. Profile visit estimation
5. Homepage directory

#### 🔨 **To Build:**

**Database Schema:**
- [ ] Add creator preferences fields to User table (price, categories, contact info, status)

**Creator Features:**
- [ ] Settings page (/dashboard/settings)
- [ ] Status toggle (available/unavailable/hidden)
- [ ] Profile preview in dashboard

**Public Features:**
- [ ] Homepage filters (followers, price, category)
- [ ] Creator profile pages (/creator/[username])
- [ ] Search functionality
- [ ] How It Works page
- [ ] Platform banner ("Payments in 2 weeks")

**UI Components:**
- [ ] Filter sidebar
- [ ] Status badge component
- [ ] Platform banner component
- [ ] Enhanced creator card (with price/status)

---

## 💎 KEY DIFFERENTIATORS

**Why Creators Join:**
1. **Free listing** - No upfront costs
2. **Control** - Set your own prices
3. **Safety** - Review sponsors before accepting
4. **Transparency** - See real visitor estimates
5. **Easy** - One-click Twitter login

**Why Sponsors Join:**
1. **Targeted** - Filter by exact audience size
2. **Transparent** - See real stats upfront
3. **Direct** - Message creators directly
4. **Value** - Compare CPM across creators
5. **Easy** - No complex ad platforms

---

## 📊 MVP PAGES PRIORITY

### **Week 1: Core Directory**
1. ✅ Homepage with filters
2. ✅ Creator cards
3. ⬜ Creator profile pages
4. ⬜ Creator settings page

### **Week 2: Messaging**
5. ⬜ Inquiry system
6. ⬜ Message inbox
7. ⬜ Email notifications
8. ⬜ Platform banner component

### **Week 3: Polish**
9. ⬜ How It Works page
10. ⬜ Pricing page
11. ⬜ Search & filters
12. ⬜ Mobile responsive

---

## 🎨 UI/UX DETAILS

### **Platform Banner (All Pages)**
```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️ Payments launching in 2 weeks! Join now to be first.    │
│ [Learn More] [x]                                            │
└─────────────────────────────────────────────────────────────┘
```

### **Creator Status Badges**
- 🟢 **Available** - Green
- 🔵 **In Campaign** - Blue  
- 🟡 **Unavailable** - Yellow
- ⚫ **Not Listed** - Gray

### **Verification Badges**
- ✓ **Verified** - Blue checkmark
- 👔 **Business** - Business icon
- 🏛️ **Government** - Government icon

---

## 🔐 PERMISSIONS & API CAPABILITIES

### **✅ What We CAN Do (API v2):**
- ✅ Fetch ALL user profile data (20+ fields)
- ✅ Get profile banner URL (added June 2024)
- ✅ Get verified followers count
- ✅ Get verified type (blue/business/government)
- ✅ Get account creation date
- ✅ Get listed count
- ✅ Subscribe to banner update events (Activity API)
- ✅ Calculate estimated profile visits (1.7x algorithm)

### **❌ What We CANNOT Do:**
- ❌ Get actual profile view analytics (private data)
- ❌ Get impression metrics beyond owned tweets (30 days only)

### **✅ BANNER UPDATE API - FOUND IT!**

**Endpoint:** `POST account/update_profile_banner` (v1.1)
- **URL:** `https://api.twitter.com/1.1/account/update_profile_banner.json`
- **Method:** POST
- **Auth:** OAuth 1.0a User Context (NOT OAuth 2.0!)
- **Parameter:** `banner` - Base64-encoded image data
- **Response:** 200/201/202 on success

**⚠️ Challenge:** Better Auth uses OAuth 2.0, but this endpoint requires OAuth 1.0a

**Solutions:**

**Option A: Dual OAuth (Recommended)**
1. Keep OAuth 2.0 for login (Better Auth)
2. Add OAuth 1.0a for banner updates
3. After login, request OAuth 1.0a tokens separately
4. Store both token types in database
5. Use OAuth 1.0a token for banner updates

**Option B: Switch to OAuth 1.0a Entirely**
1. Change Better Auth to use OAuth 1.0a
2. More complex auth but full API access
3. Requires "Read and Write" permissions

**Option C: Hybrid Manual/Auto**
1. Auto-update for users who grant OAuth 1.0a
2. Manual process for OAuth 2.0 only users
3. Give users choice: "Enable auto-banner updates?"

### **🔄 Banner Update Flow (Option A):**

```
1. Creator logs in with OAuth 2.0 (Better Auth)
   ↓
2. Dashboard prompts: "Enable auto-banner updates?"
   ↓
3. Click "Enable" → Redirect to OAuth 1.0a flow
   ↓
4. Grant "Read and Write" permission
   ↓
5. Store OAuth 1.0a tokens in database
   ↓
6. Now we can:
   - Programmatically update banner
   - Auto-revert after campaign ends
   - No manual uploads needed!
```

### **📊 Profile Visit Estimation:**
- **Formula:** followers × 1.67 per month
- **Validated:** Your 3.9K followers → 6.5K visits ✅
- Adjustments for verified, listed, tweet volume
- Show as "estimate" for transparency

### **🔔 Banner Change Verification:**
- Subscribe to ProfileBannerUpdate events (Activity API)
- Get webhook notification when banner changes
- Verify it matches campaign banner
- Track compliance automatically

---

## 📈 SUCCESS METRICS

**Launch Goals (Month 1):**
- 100 creators signed up
- 500 total impressions available
- 10 sponsor inquiries sent
- 5 conversations started

**Pre-Payment Goals (Weeks 1-2):**
- Build trust with creators
- Validate pricing expectations
- Test messaging system
- Gather feedback

---

---

## 🚀 IMMEDIATE IMPLEMENTATION PLAN

### **Phase 1: MVP Directory (This Week)**

#### **Day 1: Database**
- [ ] Add 7 creator fields to User table
- [ ] Push schema to Neon

#### **Day 2: Creator Settings**
- [ ] Build `/dashboard/settings` page
- [ ] Price range input
- [ ] Category checkboxes
- [ ] "Looking for" textarea
- [ ] Contact method selector
- [ ] Status toggle

#### **Day 3: Homepage Filters**
- [ ] Add filter sidebar to homepage
- [ ] Filter by followers (1K+, 10K+, etc.)
- [ ] Filter by price range
- [ ] Filter by category
- [ ] Sort options
- [ ] Only show creators with status="available"

#### **Day 4: Creator Profiles**
- [ ] Build `/creator/[username]` pages
- [ ] Large banner preview
- [ ] Full stats display
- [ ] Show price range
- [ ] Show "looking for" message
- [ ] Show contact info

#### **Day 5: Polish**
- [ ] Platform banner component
- [ ] How It Works page
- [ ] Mobile responsive
- [ ] Test complete flow

### **Phase 2: Payments (Week 2-3)**

- [ ] Stripe integration
- [ ] Campaign creation
- [ ] OAuth 1.0a for banner updates (optional)
- [ ] Activity API webhooks

---

## 📊 FEATURE PRIORITY MATRIX

### **MVP Features (Week 1):**
1. ✅ Twitter OAuth login
2. ✅ Fetch all user data (20+ fields)
3. ✅ User cards with accurate stats
4. ✅ Profile visit estimation (1.67x formula)
5. ⬜ Creator settings page
6. ⬜ Homepage filters
7. ⬜ Creator profile pages
8. ⬜ Platform banner
9. ⬜ How It Works page

### **Phase 2 (Weeks 2-3):**
10. ⬜ Stripe payments
11. ⬜ Campaign management
12. ⬜ OAuth 1.0a banner updates (optional)
13. ⬜ Activity API webhooks

---

## 💡 MONETIZATION STRATEGY

### **Revenue Model:**
- **Platform fee:** 10% on all transactions
- **Stripe fees:** 2.9% + $0.30 (passed to sponsor)
- **Example:** $1,000 campaign = $100 platform fee + $29 Stripe fee

### **Projected Economics:**

**Month 1 (Directory Only):**
- 100 creators × $0 = $0 revenue
- Goal: Build trust, gather data, validate pricing

**Month 2 (Payments Launch):**
- 10 campaigns × $500 avg × 10% = $500 revenue
- 50 creators active
- 20 sponsors

**Month 6:**
- 100 campaigns × $750 avg × 10% = $7,500/month
- 500 creators
- 150 sponsors

**Month 12:**
- 500 campaigns × $1,000 avg × 10% = $50,000/month
- 2,000 creators
- 500 sponsors

---

## 🎯 SUCCESS METRICS

### **Week 1 (Directory Launch):**
- 50 creators signed up
- 20 creators completed profile
- 10 creators set to "Available"
- 500 directory page views
- 100 creator profile views

### **Week 2 (Messaging Launch):**
- 20 sponsors signed up
- 30 inquiries sent
- 10 conversations started
- 5 verbal agreements
- 50% response rate

### **Phase 2 (Payments):**
- 10 paid campaigns
- $5,000 GMV (Gross Merchandise Value)
- $500 platform revenue
- 90% creator satisfaction
- 80% sponsor retention

---

## 🛠️ TECHNICAL IMPLEMENTATION

### **Immediate Database Changes:**

```typescript
// Add to existing User table (6 simple fields)
ALTER TABLE user ADD COLUMNS:
  creator_status TEXT, // "available" | "unavailable" | "hidden" | null
  creator_price_min INTEGER,
  creator_price_max INTEGER,
  creator_categories TEXT, // JSON string: ["tech", "saas"]
  creator_looking_for TEXT, // Message to potential sponsors
  creator_contact_method TEXT, // "twitter" | "email" | "other"
  creator_contact_value TEXT // @username, email, or custom
```

**No additional tables needed for MVP!** Everything in the User table.

---

## 🎨 COMPONENT LIBRARY NEEDED

### **Components Needed:**

1. **`<PlatformBanner />`** - Announcement banner
2. **`<FilterSidebar />`** - Homepage filters
3. **`<StatusBadge />`** - Available/Unavailable badges
4. **`<CategorySelector />`** - Multi-select categories
5. **`<ContactInfo />`** - Display contact method

---

## 🚀 START HERE - FIRST 3 TASKS

### **Task 1: Add 7 Creator Fields to User Table**
```sql
ALTER TABLE user ADD:
- creator_status (text)
- creator_price_min (integer)
- creator_price_max (integer)
- creator_categories (text, JSON)
- creator_looking_for (text)
- creator_contact_method (text)
- creator_contact_value (text)
```

### **Task 2: Build Creator Settings Page**
Form with 5 sections:
1. Price range (min/max)
2. Categories (checkboxes)
3. Looking for (textarea)
4. Contact info (dropdown + input)
5. Status toggle

### **Task 3: Add Filters to Homepage**
Update UserCard to show:
- Price range badge
- "Available" status badge
- Categories tags

Add FilterSidebar:
- Follower slider
- Price range
- Category filters
- Only show creators where status="available"

### **Task 4: Build Creator Profile Pages**
`/creator/[username]` showing:
- Large banner
- Full stats
- Price & what they're looking for
- Contact button (Twitter DM/Email)

---

## 🎯 **SIMPLIFIED MVP:**

**6 Pages Total:**
1. `/` - Directory (with filters)
2. `/creator/[username]` - Profile pages
3. `/how-it-works` - Simple explainer
4. `/login` - OAuth
5. `/dashboard` - Creator dashboard
6. `/dashboard/settings` - Creator preferences

**Database:** Just 7 new columns on User table

**Contact:** Sponsors reach out via Twitter DM or email directly (off-platform for now)

**Payments:** Phase 2 (in 2 weeks)

---

**Ready to implement Task 1?** Add the 7 fields and push to database! 🚀

