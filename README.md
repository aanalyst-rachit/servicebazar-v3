# 🛠️ ServiceBazar V3

> Hyperlocal multi-service marketplace for Tier-2 and Tier-3 Indian cities.

ServiceBazar is a general-purpose local services marketplace connecting customers with local service providers across multiple categories.

It is **not limited to salons**. Providers can offer services such as:

- Salon & Barber
- Electrician
- Plumber
- Mechanic
- Lawyer
- Tutor
- CA / Consultant
- Insurance Advisor
- Photographer
- Repair Services
- Home Services
- And other local professional services

---

## 📌 Project Status

**Status:** Active Development  
**Current Branch:** `main`  
**Stable Checkpoint:** `7792d84`

### Current Checkpoint

```text
7792d84 checkpoint: fix UID-based user profile isolation
This checkpoint represents the current stable baseline after fixing the major user-profile isolation issue.

🧠 Core Architecture
ServiceBazar V3 uses Firebase Authentication UID as the authoritative identity of a user.
The fundamental identity flow is:
Firebase Authentication
        │
        ▼
   Firebase UID
        │
        ▼
Firestore: users/{uid}
        │
        ▼
 Master User Profile

🔐 UID-Based Profile Isolation
This is one of the most important architectural rules of the project.
Rule
users/{firebaseUid}
is the master profile location for the currently authenticated user.
A user's profile must never be identified using:
email
phone number
shop name
owner name
legacy users/{email}
Why?
Previously, profile information could be incorrectly reused between users because identity was partially based on phone/email/local state.
The current architecture prevents this by tying the active profile to the Firebase Authentication UID.

👤 New User Principle
When Firebase authenticates a user:
Firebase Auth
     │
     ▼
firebaseUid
     │
     ▼
users/{firebaseUid}
If the document does not exist:
users/{firebaseUid} ❌
        │
        ▼
Clean onboarding state
The application must not automatically inherit another user's provider/business profile.
This prevents:
Previous user's shop name appearing for a new user
Previous user's address appearing
Previous user's category appearing
Previous user's images appearing
Previous user's owner information appearing

🔑 Authentication
ServiceBazar currently supports Firebase-based authentication flows including:
Google Sign-In
Firebase Authentication credential conversion
Anonymous Firebase authentication for the existing phone-based flow
Firebase UID based profile management
Google authentication follows:
Google Sign-In
      │
      ▼
Google ID Token
      │
      ▼
Firebase Credential
      │
      ▼
Firebase Authentication
      │
      ▼
Firebase UID
      │
      ▼
users/{uid}
New Google users are not blindly assigned an existing profile.
They enter the appropriate onboarding flow.

💾 Local Session
The application uses React Native AsyncStorage for local session persistence.
Key:
STORAGE_KEYS.USER_SESSION
AsyncStorage is treated as a local cache/session helper, not as the source of truth.
The important rule is:
Firebase Auth UID > AsyncStorage session
A locally stored session belonging to a different Firebase UID must never be restored.

🏪 Provider Profile
Provider business information is maintained in the UID master profile.
Example:
users/{uid}
may contain:
uid
name
email
phone
role
authProvider

businessName
shopName
category
subcategory
address
location

bannerUri
profileUri
frontImageUri
insideImageUri

avgRating
totalReviews

updatedAt
The provider profile UI reads from the authenticated user's UID-based master profile.

🌐 Public Provider Discovery
ServiceBazar also maintains provider discovery data under:
profile/{phone}
This data exists for compatibility/public discovery purposes.
Important
profile/{phone} is not the authoritative identity source for the logged-in user.
The application must never use:
profile/{phone}
to determine who the currently authenticated Firebase user is.
The authoritative identity remains:
users/{uid}

☁️ Media Storage
ServiceBazar uses Cloudinary for persistent image/media hosting.
Local images may initially have URIs such as:
file://...
content://...
Before permanent profile/media data is saved, the application converts local media into Cloudinary HTTPS URLs.
Typical flow:
Local Image
     │
     ▼
Image Picker
     │
     ▼
Cloudinary Upload
     │
     ▼
HTTPS URL
     │
     ▼
Firestore
This prevents Firestore from storing temporary local device paths.

📍 Location & Maps
Location-related functionality uses:
Expo Location
OpenStreetMap
Overpass API
Reverse geocoding
The application can use location information to support local provider discovery.

🤖 Quote Studio
ServiceBazar includes an AI-assisted Quote Studio module.
Quote Studio is intended to help service providers create professional service quotations and estimate pricing.
The Quote Studio UI has already passed its current development checkpoint.

🧱 Project Structure
servicebazar-v3/
│
├── app/
│   └── index.tsx
│
├── context/
│   └── AppContext.tsx
│
├── screens/
│   ├── AuthScreen
│   ├── CustomerScreen
│   ├── ProviderScreen
│   └── AdminScreen
│
├── components/
│   ├── SocialFeed
│   └── AutoProviderBanner
│
├── modals/
│   ├── BookingModal
│   ├── RatingModal
│   ├── AdminEditModal
│   ├── CatalogPickerModal
│   └── ShopImagesModal
│
├── services/
│   ├── firebase.ts
│   ├── cloudinary.ts
│   ├── storage.ts
│   ├── geocoding.ts
│   └── overpass.ts
│
├── utils/
│   ├── slots
│   ├── time
│   ├── distance
│   ├── serviceCategories
│   ├── storageKeys
│   └── appStyles
│
├── assets/
│   └── images/
│
├── app.json
├── package.json
├── tsconfig.json
└── eas.json

🛠️ Technology Stack
Area
Technology
Framework
Expo / React Native
Routing
Expo Router
Language
TypeScript
Authentication
Firebase Authentication
Database
Cloud Firestore
Local Storage
AsyncStorage
Media
Cloudinary
Location
Expo Location
Map Data
OpenStreetMap / Overpass
State Management
React Context
AI
Quote Studio / AI integrations
Platform
Android / iOS


🚀 Development Setup
Requirements
Recommended environment:
Node.js 18+
npm
Expo CLI / npx expo
Android development environment or Expo development client
Firebase project configuration
Cloudinary configuration

📦 Installation
Clone the repository:
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd servicebazar-v3
Install dependencies:
npm install

▶️ Start Development
Start Expo:
npx expo start
Start with cache cleared:
npx expo start -c
Start development client:
npx expo start --dev-client

🧪 TypeScript Validation
Before committing changes:
npx tsc --noEmit
The current checkpoint has been verified with TypeScript compilation successfully passing.

🔍 Recommended Debugging Workflow
Before modifying important code:
git status
Then inspect the relevant implementation.
For example:
grep -nE "pattern" context/AppContext.tsx
and:
sed -n 'START,ENDp' context/AppContext.tsx
After modifications:
npx tsc --noEmit
Then test the actual application flow.

🔒 Development Rules
1. UID Is the Identity
Never replace:
users/{uid}
with:
users/{email}
users/{phone}
for current-user identity.

2. No Cross-User Data Leakage
A new Firebase UID must start with a clean profile state when no master document exists.
Never allow previous provider state to remain in React state when the authenticated user changes.

3. Firebase Is the Authority
The authentication state comes from:
onAuthStateChanged()
The master profile comes from:
users/{firebaseUid}
AsyncStorage must not override Firebase identity.

4. Make Targeted Changes
Avoid unnecessary rewrites of working modules.
Prefer:
Find root cause
      ↓
Make smallest safe change
      ↓
TypeScript check
      ↓
Runtime test
      ↓
Git checkpoint

5. Always Create a Checkpoint Before Major Changes
Recommended:
git status
git add .
git commit -m "checkpoint: <description>"
This allows safe rollback if a later change introduces a regression.

📦 Current Stable Baseline
Current stable checkpoint:
7792d84
Commit:
checkpoint: fix UID-based user profile isolation
Previous important checkpoints:
6e87aa0  feat: add Google user profile onboarding
e861e99  checkpoint: Google Sign-In working
9dfdfdb  checkpoint: before Google Auth migration
37ef90e  checkpoint: quote studio ai ui working
928e3a3  feat: upgrade AI quote studio UI

✅ Verified at Current Checkpoint
The current baseline includes:
✅ Firebase UID based user isolation
✅ Google Sign-In
✅ Firebase credential authentication
✅ New Google user onboarding
✅ Provider onboarding
✅ Customer onboarding
✅ UID master profile
✅ Protection against stale local sessions
✅ Provider profile saving
✅ Cloudinary media pipeline
✅ Firestore integration
✅ Location functionality
✅ Service discovery
✅ Booking functionality
✅ Rating functionality
✅ Quote Studio UI
✅ TypeScript compilation passing

⚠️ Known Development Note
There may still be unrelated runtime warnings or bugs elsewhere in the application.
The current UID/profile-isolation work should be considered a completed checkpoint.
Do not mix unrelated fixes into the UID authentication architecture unless the issue directly affects:
User identity
Authentication
Profile loading
Profile persistence
Profile isolation

🧭 Next Development Principle
Future development should preserve this architecture:
               Firebase Auth
                     │
                     ▼
                 Firebase UID
                     │
                     ▼
              users/{uid}
                     │
          ┌──────────┴──────────┐
          ▼                     ▼
     Customer Profile     Provider Profile
                                │
                                ▼
                         Public Discovery
                         profile/{phone}
The most important invariant is:
One authenticated Firebase UID must never accidentally receive another user's profile data.

📄 License
ServiceBazar V3 is proprietary software.
All rights reserved.
Unauthorized copying, distribution, modification, or commercial use of this software is prohibited.

