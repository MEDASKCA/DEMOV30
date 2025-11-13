# Database Seed Scripts

## Overview

This directory contains scripts to populate the Firebase database with procedures and surgeons based on your configured specialties.

## Prerequisites

1. Configure specialties in the admin panel first:
   - Go to `http://localhost:3000/admin/theatre-management?tab=configurations`
   - Add your specialties and subspecialties
   - Save your configurations

2. Ensure Firebase is properly configured in `lib/firebase.ts`

## Running the Seed Script

To populate the database with procedures and surgeons:

```bash
cd "C:\Users\forda\theatre-operations-manager"
npx ts-node scripts/seedProceduresAndSurgeons.ts
```

## What the Seed Script Does

1. **Loads Specialties** from Firebase
2. **Clears Existing Data** in `procedures` and `surgeons` collections
3. **For Each Specialty/Subspecialty:**
   - Creates 30 procedures with OPCS-4 codes
   - Creates 3 unique surgeon profiles
4. **Reports Progress** showing total procedures and surgeons created

## Data Structure

### Procedures Collection
```typescript
{
  name: string;
  opcs4: string[];  // Array of OPCS-4 codes
  commonVariations?: string[];  // Alternative procedure names
  specialtyId: string;
  specialtyName: string;
  subspecialtyName?: string;
  createdAt: Date;
}
```

### Surgeons Collection
```typescript
{
  firstName: string;
  lastName: string;
  title: "Mr" | "Ms" | "Dr" | "Prof";
  specialtyId: string;
  specialtyName: string;
  subspecialtyName?: string;
  createdAt: Date;
}
```

## Future Integration

These collections are designed to support:
- **Preference Cards**: Surgeon-specific procedure setups
- **Inventory Linking**: Equipment and consumables per procedure
- **Case Scheduling**: Pre-populated procedure and surgeon data

## Troubleshooting

**Error: "No specialties found"**
- Configure specialties in the admin panel first

**Error: "Permission denied"**
- Check Firebase security rules
- Ensure you're running from the project directory

**Error: "Module not found"**
- Run `npm install` to install dependencies
