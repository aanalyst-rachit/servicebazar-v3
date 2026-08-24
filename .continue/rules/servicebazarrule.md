This is the ServiceBazar V3 project.

Project root:
~/Desktop/curser project/servicebazar-v3

Tech stack:
- Expo
- React Native
- TypeScript
- Firebase
- Firestore
- Firebase Auth
- Cloudinary

Rules:
1. Do not modify files blindly.
2. First inspect the relevant file and surrounding code.
3. Before changing dependencies, inspect package.json.
4. Do not rewrite unrelated code.
5. Preserve existing architecture.
6. After every code change run:
   npx tsc --noEmit
7. For runtime problems, inspect the actual error stack and relevant source file.
8. Prefer the smallest safe fix.
9. Never create duplicate Firebase initialization.
10. Before changing Firebase Auth, inspect services/firebase.ts and all imports of it.

servicebazar-v3/
├── app/
├── components/
├── context/
├── screens/
├── services/
├── utils/
├── assets/
├── .continue/
├── package.json
└── tsconfig.json


Analyze this runtime error in the current ServiceBazar V3 project.

Do NOT modify any files.

First inspect:
- services/firebase.ts
- context/AppContext.tsx
- services/storage.ts
- package.json

Trace Firebase Auth initialization and imports.

Find the exact root cause of the error.
Also check whether multiple Firebase Auth initialization paths exist.

Return:
1. Root cause
2. Exact files involved
3. Exact lines/functions involved
4. Smallest safe fix
5. Validation command

Do not guess.