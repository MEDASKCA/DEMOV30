# Firebase Configuration Summary

Your system uses **2 separate Firebase projects** under the same Google account:

---

## 1. MEDASKCA Firebase (Operational Data)
**Project ID:** `medaskca-93d48`
**Purpose:** Main operational database

### Used For:
- ✅ Theatre lists and schedules
- ✅ Consultants and staff
- ✅ Theatre units and configurations
- ✅ Specialty-theatre mappings
- ✅ Bookings and allocations
- ✅ Hospital configurations
- ✅ User authentication

### Configuration:
```javascript
{
  apiKey: "AIzaSyAWzAZiMVlGU1h7CLZRR1Qc-0BxKkIDNW4",
  authDomain: "medaskca-93d48.firebaseapp.com",
  projectId: "medaskca-93d48",
  storageBucket: "medaskca-93d48.firebasestorage.app",
  messagingSenderId: "830746933399",
  appId: "1:830746933399:web:b94a042718d64989f7d1d2",
  measurementId: "G-ETHE315F6E"
}
```

### Capacity (Free Tier):
- 50,000 reads/day
- 20,000 writes/day
- 1 GB storage

---

## 2. Procedures Firebase (Reference Data)
**Project ID:** `procedures-55ef9`
**Purpose:** Procedures database (14,000+ procedures)

### Used For:
- ✅ Surgical procedures (14,000+)
- ✅ OPCS-4 codes
- ✅ Procedure reference data
- ✅ Specialty procedures
- ✅ Common variations

### Configuration:
```javascript
{
  apiKey: "AIzaSyC_glyIkwey_tYzflcgxIOGi3QI58EyAsI",
  authDomain: "procedures-55ef9.firebaseapp.com",
  projectId: "procedures-55ef9",
  storageBucket: "procedures-55ef9.firebasestorage.app",
  messagingSenderId: "12862405731",
  appId: "1:12862405731:web:aab14aabe2d46af967cc56",
  measurementId: "G-7Y4VEYEPP7"
}
```

### Capacity (Free Tier):
- 50,000 reads/day
- 20,000 writes/day
- 1 GB storage

---

## Total System Capacity

With 2 Firebase projects:
- **100,000 reads/day** (50k + 50k)
- **40,000 writes/day** (20k + 20k)
- **2 GB storage** (1 GB + 1 GB)

---

## File Structure

### MEDASKCA Firebase
```
lib/
  firebase.ts              ← MEDASKCA Firebase config
```

### Procedures Firebase
```
lib/
  firebase/
    proceduresFirebase.ts  ← Procedures Firebase config
    services/
      proceduresService.ts ← Service to fetch procedures
```

---

## Console Logs

When the app starts, you'll see:
```
✅ MEDASKCA Firebase initialized (medaskca-93d48)
✅ Procedures Firebase initialized (procedures-55ef9)
```

---

## Collections Structure

### MEDASKCA Firebase Collections:
- `theatres` - Theatre data
- `theatreUnits` - Theatre units
- `theatreList` - Scheduled theatre lists
- `consultants` - Consultant/surgeon data
- `specialties` - Surgical specialties
- `specialtyTheatreMappings` - Theatre priorities
- `hospitals` - Hospital configurations

### Procedures Firebase Collections:
- `procedures` - 14,000+ procedure records
  - name
  - opcs4 (array of codes)
  - commonVariations
  - specialty
  - subspecialty
  - category
  - complexity
  - isActive

---

## Next Steps

1. ✅ MEDASKCA Firebase - Already configured
2. ✅ Procedures Firebase - Already configured
3. ⏳ Run migration script to upload 429 procedures:
   ```bash
   npx ts-node scripts/migrateProceduresToSeparateDB.ts
   ```
4. ⏳ Set up Firestore indexes in Procedures Firebase
5. ⏳ Test procedures API endpoint

---

## Benefits of This Setup

### Performance
- Procedures don't slow down operational queries
- Can cache procedures aggressively (they rarely change)

### Scalability
- Can share Procedures Firebase across multiple hospitals
- Easy to upgrade just one database if needed

### Security
- Procedures are read-only from client
- Operational data has full read/write access

### Cost
- Free tier sufficient for both
- Each project scales independently
