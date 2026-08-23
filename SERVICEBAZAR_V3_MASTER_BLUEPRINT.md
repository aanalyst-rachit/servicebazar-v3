Bilkul bhai. **Ye bahut sahi idea hai.** 👍

Actually tumhare jaise long-running project ke liye README ko sirf documentation nahi, balki **"Project Continuation Blueprint"** banana chahiye.

Agar chat limit khatam ho jaye, next chat me:

> **README paste/upload → "Hum yahan tak complete kar chuke hain, ab next step se continue karo."**

Aur context immediately restore ho jayega.

Main is README ko aise structure karunga ki usme **business + UI + architecture + dependencies + development workflow + migration plan + current progress + next task** sab rahe.

---

# 📘 SERVICEBAZAR V3 — MASTER PROJECT BLUEPRINT

### Document purpose

```text
This README is the single source of truth for ServiceBazar V3.

If development continues in a new ChatGPT conversation,
read this document first and continue from the
CURRENT STATUS / NEXT ACTION section.

DO NOT restart completed work.
DO NOT replace working architecture without reason.
DO NOT blindly copy the old ServiceBazar V2 project.
```

---

# 1. PROJECT IDENTITY

**Product:** ServiceBazar

**Version:** V3

**Platform:**

```text
Android
React Native
Expo SDK 57
TypeScript
```

**Primary development target:**

```text
Android Development Build
```

**Final distribution:**

```text
Android APK / AAB
```

---

# 2. PRODUCT VISION

ServiceBazar is a **hyperlocal multi-service marketplace for Tier-2/Tier-3 India**.

It is NOT salon-only.

Providers can offer:

```text
Salon / Barber
Electrician
Plumber
Mechanic
Lawyer
CA
Tutor
Photographer
Insurance Advisor
Consultant
Repair Services
Home Services
Professional Services
etc.
```

Basic ecosystem:

```text
CUSTOMER
   ↓
DISCOVER SERVICE
   ↓
SERVICE PROVIDER
   ↓
BOOK / CONTACT / REQUEST SERVICE
```

---

# 3. V3 PRIMARY GOAL

V3 ka primary objective:

> **Clean SDK 57 foundation + fast development workflow + stable native environment.**

Old V2 ki problems ko blindly carry forward nahi karna.

---

# 4. V2 → V3 MIGRATION STRATEGY

Current project:

```text
bookmyslot-app-v2
```

V3:

```text
servicebazar-v3
```

V2 remains as:

```text
REFERENCE / BACKUP
```

V3 becomes:

```text
ACTIVE DEVELOPMENT PROJECT
```

### Copy carefully:

```text
assets/
components/
context/
constants/
services/
utils/
screens/routes
business logic
UI designs
Firebase logic
Cloudinary logic
```

### DO NOT blindly copy:

```text
node_modules/
android/
ios/
package-lock.json
package.json
native configuration
```

Fresh SDK 57 dependencies must be installed using Expo-compatible versions.

---

# 5. TECHNOLOGY STACK

## Core

```text
React Native
Expo SDK 57
TypeScript
```

## Development

```text
expo-dev-client
Metro
EAS
```

## Backend / Services

```text
Firebase
Firestore
Firebase Authentication
Cloudinary
```

## Storage

```text
Firestore → HTTPS media URLs
Cloudinary → Image/Video
```

## Local persistence

```text
AsyncStorage
```

## Location

```text
expo-location
```

## Media

```text
expo-image-picker
expo-file-system
```

Exact package versions must be SDK-57 compatible.

---

# 6. DEVELOPMENT ARCHITECTURE

Target workflow:

```text
Cursor / VS Code
       ↓
TypeScript / React Native
       ↓
Metro Bundler
       ↓
Development Build
       ↓
Android Phone
```

### Daily development command

```bash
npx expo start --dev-client
```

### IMPORTANT

Normal code changes should NOT require APK rebuild.

```text
Code change
    ↓
Save
    ↓
Metro
    ↓
Phone update
```

---

# 7. BUILD TYPES

## A. Development

Used for daily development.

```bash
eas build --profile development -p android
```

Build once initially.

Then:

```bash
npx expo start --dev-client
```

---

## B. Preview

Used for APK testing outside development workflow.

```bash
eas build -p android --profile preview
```

---

## C. Production

Final release build.

```bash
eas build -p android --profile production
```

---

# 8. DEVELOPMENT BUILD PRINCIPLE

Development build is the **primary development environment**.

Expo Go should NOT be treated as the final native environment.

Reason:

```text
Expo Go
    ≠
Custom Development Build
    ≈
Actual App Native Environment
```

This is particularly important for:

```text
File handling
Native modules
Permissions
Firebase native behavior
Image Picker
Camera
Notifications
etc.
```

---

# 9. PROJECT STRUCTURE TARGET

Target structure:

```text
servicebazar-v3/
│
├── app/
│   ├── _layout.tsx
│   ├── index.tsx
│   │
│   ├── auth/
│   ├── customer/
│   ├── provider/
│   ├── booking/
│   ├── profile/
│   └── ...
│
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── components/
│
├── context/
│
├── constants/
│
├── services/
│   ├── firebase.ts
│   ├── cloudinary.ts
│   ├── storage.ts
│   ├── geocoding.ts
│   └── ...
│
├── utils/
│
├── hooks/
│
├── types/
│
├── package.json
├── app.json / app.config.ts
├── eas.json
├── tsconfig.json
└── README.md
```

Actual structure may be adjusted after inspecting the fresh SDK 57 template.

---

# 10. CORE APP MODULES

V3 will eventually contain:

### Authentication

```text
Login
OTP
User authentication
Session
Logout
```

### Customer

```text
Home
Search
Categories
Provider discovery
Provider profile
Service details
Booking
Bookings
Profile
Reviews
```

### Provider

```text
Provider dashboard
Profile
Services
Pricing
Availability
Bookings
Customers
Reviews
Business information
Media
```

### Marketplace

```text
Service categories
Provider discovery
Location-based discovery
Search
Filtering
Provider profiles
```

---

# 11. MEDIA ARCHITECTURE

Important rule:

**Firestore should never store temporary local file URIs.**

Bad:

```text
file://...
content://...
```

Correct:

```text
ImagePicker
    ↓
Local URI
    ↓
Upload
    ↓
Cloudinary
    ↓
secure_url
    ↓
Firestore
```

Example:

```text
https://res.cloudinary.com/...
```

---

# 12. IMAGE UPLOAD DESIGN

Target flow:

```text
ImagePicker
     ↓
Validate URI
     ↓
Ensure readable local file
     ↓
Cloudinary upload
     ↓
secure_url
     ↓
React state
     ↓
Firestore
```

Must support:

```text
Profile image
Provider front image
Provider inside image
Banner
Customer profile
Feed images
Videos
```

---

# 13. CURRENT V2 CLOUDINARY ISSUE

V2 currently showed:

```text
FileNotFoundException
ENOENT
```

with Expo cache URI:

```text
/data/user/0/host.exp.exponent/cache/ImagePicker/...
```

This indicates that the temporary URI could not be opened when the upload request attempted to read it.

V3 must test media upload **inside the development build**, not only Expo Go.

---

# 14. FIREBASE ARCHITECTURE

Firebase services:

```text
Firebase Authentication
        ↓
User identity

Firestore
        ↓
Application data

Cloudinary
        ↓
Media storage
```

Firestore should primarily store:

```text
User data
Provider data
Service data
Booking data
Reviews
Media HTTPS URLs
```

---

# 15. DATA PRINCIPLES

Never store:

```text
temporary local URI
device filesystem path
Expo cache path
```

Store:

```text
Cloudinary HTTPS URL
```

---

# 16. LOCATION ARCHITECTURE

Target:

```text
expo-location
      ↓
Latitude
Longitude
      ↓
Address
      ↓
Provider/service discovery
```

Later:

```text
Customer location
      ↓
Nearby providers
      ↓
Distance/filtering
```

---

# 17. DEVELOPMENT RULES

### Rule 1

Do not blindly install random npm versions.

Use:

```bash
npx expo install package-name
```

for Expo-compatible packages.

---

### Rule 2

Before adding a dependency:

```text
Check SDK 57 compatibility.
```

---

### Rule 3

Do not modify native folders unnecessarily.

Prefer Expo configuration / EAS / config plugins where appropriate.

---

### Rule 4

Every major feature must be tested in:

```text
Development Build
```

---

### Rule 5

Final APK testing happens with:

```text
Preview Build
```

---

# 18. TESTING LEVELS

## Level 1 — UI

```text
Screen
Navigation
Styles
Animations
```

Development Build.

---

## Level 2 — Logic

```text
Forms
Validation
Firebase
API
State
```

Development Build.

---

## Level 3 — Native

```text
Camera
ImagePicker
FileSystem
Location
Notifications
Permissions
```

Development Build.

---

## Level 4 — Release

```text
Preview APK
```

---

## Level 5 — Final

```text
Production APK/AAB
```

---

# 19. PERFORMANCE GOAL

Development environment should remain usable on a low-end PC.

Primary strategy:

```text
EAS
 ↓
Cloud native compilation
```

instead of repeatedly doing:

```text
Local Android Gradle build
```

Daily development:

```text
Metro only
```

Therefore CPU/RAM usage stays considerably lower than repeatedly running native builds.

---

# 20. EAS BUILD STRATEGY

### Development

```bash
eas build --profile development -p android
```

### Preview

```bash
eas build --profile preview -p android
```

### Production

```bash
eas build --profile production -p android
```

Development build should be rebuilt only when native dependencies/configuration require a new native binary.

---

# 21. MIGRATION ORDER

**IMPORTANT: Do not copy everything at once.**

Migration sequence:

```text
1. Fresh SDK 57 project
        ↓
2. Development build
        ↓
3. Development workflow test
        ↓
4. Assets
        ↓
5. Constants
        ↓
6. Utils
        ↓
7. Services
        ↓
8. Firebase
        ↓
9. Context
        ↓
10. Components
        ↓
11. Screens
        ↓
12. Navigation
        ↓
13. Media upload
        ↓
14. Customer flow
        ↓
15. Provider flow
        ↓
16. Booking
        ↓
17. Testing
        ↓
18. Preview APK
        ↓
19. Production
```

---

# 22. CHECKPOINT SYSTEM

After every major phase:

```text
✅ Working
❌ Broken
⚠️ Pending
```

README must maintain:

```text
CURRENT STATUS
LAST COMPLETED TASK
CURRENT TASK
NEXT TASK
KNOWN ISSUES
```

---

# 23. CURRENT STATUS

```text
PROJECT: ServiceBazar V3

STATUS: PLANNING

SDK TARGET:
Expo SDK 57

OLD PROJECT:
bookmyslot-app-v2

NEW PROJECT:
servicebazar-v3

CURRENT TASK:
Prepare fresh SDK 57 project.

DEVELOPMENT MODEL:
Expo Development Build + Metro

DAILY COMMAND:
npx expo start --dev-client

FINAL BUILD:
EAS Preview / Production
```

---

# 24. CURRENT NEXT ACTION

After current V2 APK build/test is finished:

```text
Create fresh SDK 57 project
```

Command:

```bash
npx create-expo-app@latest servicebazar-v3 --template default@sdk-57
```

Then:

```bash
cd servicebazar-v3
```

Then inspect fresh project before copying anything.

---

# 25. IMPORTANT — CHAT CONTINUATION PROTOCOL

If a new ChatGPT conversation is started, provide this README and say:

> **"ServiceBazar V3 project continue karna hai. README ke CURRENT STATUS aur NEXT ACTION se continue karo. Jo kaam complete hai usko repeat mat karo."**

Assistant must:

```text
1. Read README
2. Check CURRENT STATUS
3. Check LAST COMPLETED TASK
4. Check NEXT ACTION
5. Continue from there
6. Give only the next required commands/instructions
```

---

# 26. GOLDEN RULE

**ServiceBazar V3 is developed incrementally.**

Never:

```text
"Sab files ek saath copy kar do."
```

Instead:

```text
One module
   ↓
Run
   ↓
Test
   ↓
Confirm
   ↓
Next module
```

This makes debugging much easier.

---

# 27. FINAL DEVELOPMENT PHILOSOPHY

```text
BUILD ONCE
     ↓
DEVELOP FAST
     ↓
TEST CONTINUOUSLY
     ↓
BUILD APK ONLY WHEN REQUIRED
     ↓
FINAL RELEASE
```

---

## ✅ README ka purpose

Ye document future me **hamara checkpoint** hoga.

Agar kal chat continue nahi hoti, koi problem nahi.

Bas README rahega:

```text
ServiceBazar V3
      ↓
CURRENT STATUS
      ↓
NEXT ACTION
```

Aur wahi se development continue hoga.

**Meri recommendation:** is README ko `SERVICEBAZAR_V3_MASTER_BLUEPRINT.md` naam se project ke root me rakho. Har major milestone ke baad **CURRENT STATUS / NEXT ACTION** update karte rahenge.

