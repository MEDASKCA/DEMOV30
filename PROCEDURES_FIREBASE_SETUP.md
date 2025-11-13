# Procedures Firebase Setup Guide

## Overview
This system uses **2 separate Firebase projects** under the same Google account:

1. **Main Firebase** - Operational data (theatres, schedules, consultants)
2. **Procedures Firebase** - 14,000+ procedures (reference data only)

## Why Separate?
- ✅ **Performance**: Procedures don't compete with operational data
- ✅ **Capacity**: Each project gets separate 50k reads/day
- ✅ **Security**: Procedures can be read-only
- ✅ **Scalability**: Can share procedures across multiple hospitals

---

## Step 1: Create Second Firebase Project

1. Go to https://console.firebase.google.com
2. Click "Add project"
3. Name: `nhs-procedures-database` (or your choice)
4. **Use same Google account** (capacity is per-project, not per-account)
5. Create project
6. Enable Firestore Database

---

## Step 2: Get Firebase Credentials

### Main Firebase (Already have this):
```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### Procedures Firebase (New):
1. Go to Project Settings → General
2. Scroll to "Your apps" → Web app
3. Copy config values
4. Add to `.env.local`:

```env
# PROCEDURES FIREBASE (Separate database for 14,000+ procedures)
NEXT_PUBLIC_PROCEDURES_FIREBASE_API_KEY=your_procedures_key
NEXT_PUBLIC_PROCEDURES_FIREBASE_AUTH_DOMAIN=procedures-db.firebaseapp.com
NEXT_PUBLIC_PROCEDURES_FIREBASE_PROJECT_ID=procedures-db-id
NEXT_PUBLIC_PROCEDURES_FIREBASE_STORAGE_BUCKET=procedures-db.appspot.com
NEXT_PUBLIC_PROCEDURES_FIREBASE_MESSAGING_SENDER_ID=987654321
NEXT_PUBLIC_PROCEDURES_FIREBASE_APP_ID=1:987654321:web:xyz123
```

---

## Step 3: Update .env.local

Your `.env.local` should look like this:

```env
# =============================================================================
# PRIMARY FIREBASE (Operational Data)
# =============================================================================
NEXT_PUBLIC_FIREBASE_API_KEY=your_main_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=main-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=main-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=main-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# =============================================================================
# PROCEDURES FIREBASE (14,000+ Procedures)
# =============================================================================
NEXT_PUBLIC_PROCEDURES_FIREBASE_API_KEY=procedures_key
NEXT_PUBLIC_PROCEDURES_FIREBASE_AUTH_DOMAIN=procedures-db.firebaseapp.com
NEXT_PUBLIC_PROCEDURES_FIREBASE_PROJECT_ID=procedures-db-id
NEXT_PUBLIC_PROCEDURES_FIREBASE_STORAGE_BUCKET=procedures-db.appspot.com
NEXT_PUBLIC_PROCEDURES_FIREBASE_MESSAGING_SENDER_ID=987654321
NEXT_PUBLIC_PROCEDURES_FIREBASE_APP_ID=1:987654321:web:xyz123

# =============================================================================
# HOSPITAL CONFIG
# =============================================================================
ROYAL_LONDON_HOSPITAL_ID=hospital_royal_london_001
```

---

## Step 4: Migrate Existing 429 Procedures

Run the migration script:

```bash
cd C:\Users\forda\theatre-operations-manager
npx ts-node scripts/migrateProceduresToSeparateDB.ts
```

This will upload all 429 existing procedures to the new procedures database.

---

## Step 5: Set Up Firestore Indexes (Important!)

For 14,000 procedures, you MUST create indexes:

1. Go to procedures Firebase → Firestore Database → Indexes
2. Create **composite indexes**:

### Index 1: Specialty + Active + Name
```
Collection: procedures
Fields:
  - specialty (Ascending)
  - isActive (Ascending)
  - name (Ascending)
```

### Index 2: Subspecialty + Active + Name
```
Collection: procedures
Fields:
  - subspecialty (Ascending)
  - isActive (Ascending)
  - name (Ascending)
```

### Index 3: OPCS Search
```
Collection: procedures
Fields:
  - opcs4 (Array)
  - isActive (Ascending)
```

---

## Firestore Rules for Procedures Database

Set these rules in procedures Firebase:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Procedures are READ-ONLY for all users
    match /procedures/{procedureId} {
      allow read: if true;  // Anyone can read
      allow write: if false; // No one can write (use admin SDK)
    }

    // Specialties list
    match /specialties/{specialtyId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

---

## Data Structure

### procedures collection:
```json
{
  "name": "Total Hip Replacement - Cemented",
  "opcs4": ["W381", "W931"],
  "commonVariations": ["THR", "Total Hip Arthroplasty"],
  "specialty": "ORTHOPAEDICS",
  "subspecialty": "ELECTIVE ORTHOPAEDIC JOINTS",
  "category": "Hip Arthroplasty",
  "complexity": "major",
  "isActive": true,
  "createdAt": "2025-01-15T10:00:00.000Z",
  "lastUpdated": "2025-01-15T10:00:00.000Z"
}
```

---

## Capacity Planning

### Free Tier (Spark Plan) - PER PROJECT:
- **50,000 reads/day** per project
- **20,000 writes/day** per project
- **1 GB storage** per project

### With 2 Projects:
- **Total: 100,000 reads/day**
- **Total: 40,000 writes/day**
- **Total: 2 GB storage**

### For 14,000 Procedures:
- **Storage**: ~7 MB (well within 1 GB limit)
- **Reads**: With pagination (500 procedures/page) = 28 pages
  - 100 users × 28 pages = 2,800 reads/day ✅
- **Writes**: Procedures rarely change (~100/month) ✅

---

## Benefits

1. **Performance**
   - Procedures don't slow down operational queries
   - Can cache procedures aggressively

2. **Scalability**
   - Can share procedures across multiple hospitals
   - Easy to upgrade just procedures DB if needed

3. **Security**
   - Procedures are read-only
   - Operational data has write access

4. **Cost**
   - Free tier sufficient for most use
   - Only upgrade what you need

---

## Testing

After setup, test:

```bash
# Start dev server
npm run dev

# Test procedures API
# Should return procedures from separate database
curl http://localhost:3000/api/procedures?specialtyName=ORTHOPAEDICS
```

---

## Questions?

- **Q: Do I need a new Google account?**
  - A: No! Use same account. Capacity is per-project.

- **Q: Can I still use local data as fallback?**
  - A: Yes! The system falls back to local data if procedures DB is unavailable.

- **Q: How do I add more procedures?**
  - A: Use Firebase Admin SDK or import scripts (procedures DB is read-only from client).
