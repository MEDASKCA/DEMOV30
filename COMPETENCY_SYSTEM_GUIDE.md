# 🏥 Surgical Competency Management System

## Complete Documentation & Integration Guide

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Data Structures](#data-structures)
4. [Components](#components)
5. [Integration Guide](#integration-guide)
6. [API Routes](#api-routes)
7. [Database Schema](#database-schema)
8. [EPR Integration](#epr-integration)
9. [Usage Examples](#usage-examples)

---

## 🎯 Overview

This system allows theatre staff to:
- Rate their experience with surgical procedures (0-5 scale)
- Rate their proficiency with equipment (3-star system)
- Track learning progress automatically
- Receive auto-suggestions based on EPR scrub episodes
- Add custom procedures/equipment
- Request removal of outdated items

### Key Principles

1. **Staff Experience Focus**: We rate staff experience with procedures, NOT the instruments
2. **OPCS-4 Integration**: All procedures have OPCS-4 codes for EPR matching
3. **Smart Tracking**: Only track usage counts during learning phase
4. **Admin Control**: OPCS-4 codes can only be added by administrators
5. **NHS Equipment**: Comprehensive list based on NHS Supply Chain framework

---

## ✨ Features

### ✅ Implemented

- **Procedure Rating System (0-5)**
  - 0: No knowledge
  - 1: Awareness only
  - 2: Novice (learning) - *Tracks times performed*
  - 3: Competent (with supervision)
  - 4: Proficient (independent)
  - 5: Expert (can mentor)

- **Equipment Rating System (3-star)**
  - 0: No experience
  - 1: Learning - *Tracks times used*
  - 2: Can use with supervision
  - 3: Can use independently

- **OPCS-4 Integration**
  - Every procedure has OPCS-4 codes
  - Ready for EPR episode matching
  - Auto-suggestions after scrubbing

- **Custom Additions**
  - Staff can add procedures/equipment
  - Admins can add OPCS-4 codes
  - Usage tracking across trust

- **Removal Requests**
  - Request removal with reason
  - Admin approval required
  - Tracked for audit

- **EPR Episode Matching**
  - Auto-detect scrub episodes
  - Suggest experience updates
  - Track progression

---

## 📊 Data Structures

### Procedure Experience

```typescript
interface StaffProcedureExperience {
  procedureName: string;
  opcs4Codes: string[];
  experienceLevel: 0 | 1 | 2 | 3 | 4 | 5;
  lastPerformed?: Date; // Only when level = 2
  timesPerformed?: number; // Only when level = 2
  notes?: string;
  specialty: string;
  subcategory: string;
}
```

### Equipment Experience

```typescript
interface StaffEquipmentExperience {
  equipmentName: string;
  manufacturer: string;
  productLine: string;
  category: string;
  experienceLevel: 0 | 1 | 2 | 3;
  lastUsed?: Date; // Only when level = 1
  timesUsed?: number; // Only when level = 1
  notes?: string;
}
```

---

## 🧩 Components

### 1. `ProcedureExperienceSelector`

Select specialty → subcategory → rate procedures

```tsx
<ProcedureExperienceSelector
  selectedProcedures={procedures}
  onUpdate={setProcedures}
  userRole="Scrub Nurse"
/>
```

**Features:**
- Search by procedure name or OPCS-4 code
- 0-5 rating buttons with visual feedback
- Learning progress tracking (times performed)
- Add custom procedures
- Experience summary dashboard

### 2. `EquipmentExperienceSelector`

Select category → manufacturer → checkbox equipment → rate

```tsx
<EquipmentExperienceSelector
  selectedEquipment={equipment}
  onUpdate={setEquipment}
  specialty="Orthopaedics" // or "General Surgery" or "All"
/>
```

**Features:**
- Checkbox to select equipment
- 3-star rating after selection
- Learning progress tracking (times used)
- Add custom equipment
- Equipment summary dashboard

### 3. `EPRExperienceSuggestions`

Auto-suggestions based on scrub episodes

```tsx
<EPRExperienceSuggestions
  staffId={staffId}
  onAccept={handleAccept}
  onDecline={handleDecline}
/>
```

**Features:**
- Shows procedures recently scrubbed
- Suggests experience level updates
- Accept/decline actions
- Tracks progression

### 4. `RemovalRequestModal`

Request removal of procedures/equipment

```tsx
<RemovalRequestModal
  isOpen={true}
  onClose={() => setOpen(false)}
  itemType="procedure"
  itemName="Total Hip Replacement"
  itemId="hip-thr-001"
  onSubmit={handleRequest}
  userRole="Scrub Nurse"
  userName="Jane Doe"
/>
```

### 5. `CompetencyManagement` (Main Component)

All-in-one component with tabs

```tsx
<CompetencyManagement
  staffId="staff-123"
  staffName="Jane Doe"
  staffRole="Scrub Nurse"
  primarySpecialty="Orthopaedics"
/>
```

---

## 🔌 Integration Guide

### Step 1: Add to Profile Edit Page

```tsx
// app/profile/edit/page.tsx
import CompetencyManagement from '@/components/CompetencyManagement';

export default function ProfileEditPage() {
  const user = getCurrentUser(); // Your auth logic

  return (
    <div>
      {/* Other profile sections */}

      <CompetencyManagement
        staffId={user.id}
        staffName={user.name}
        staffRole={user.role}
        primarySpecialty={user.specialty}
      />
    </div>
  );
}
```

### Step 2: Create API Routes

See [API Routes](#api-routes) section below.

### Step 3: Connect to Database

Update `lib/services/competencyService.ts` with your Firebase/database logic.

---

## 🌐 API Routes

### Procedures

```
POST   /api/competency/procedures
GET    /api/competency/procedures/:staffId
```

### Equipment

```
POST   /api/competency/equipment
GET    /api/competency/equipment/:staffId
```

### Custom Items

```
POST   /api/competency/custom-procedures
GET    /api/competency/custom-procedures
POST   /api/competency/custom-equipment
GET    /api/competency/custom-equipment
```

### Removal Requests

```
POST   /api/competency/removal-requests
GET    /api/competency/removal-requests
PATCH  /api/competency/removal-requests/:id
```

### EPR Integration

```
GET    /api/epr/scrub-episodes?staffId=xxx&dateFrom=xxx&dateTo=xxx
POST   /api/competency/suggestions/:id (accept/decline)
```

### Admin

```
PATCH  /api/admin/custom-procedures/:id/opcs4
PATCH  /api/admin/custom-procedures/:id/approve
PATCH  /api/admin/custom-equipment/:id/approve
```

---

## 💾 Database Schema

### Collections/Tables

#### `staff_procedure_experience`
- staffId (string, indexed)
- procedureName (string)
- opcs4Codes (string[])
- experienceLevel (number 0-5)
- timesPerformed (number, nullable)
- lastPerformed (timestamp, nullable)
- specialty (string)
- subcategory (string)
- notes (string, nullable)
- updatedAt (timestamp)

#### `staff_equipment_experience`
- staffId (string, indexed)
- equipmentName (string)
- manufacturer (string)
- productLine (string)
- category (string)
- experienceLevel (number 0-3)
- timesUsed (number, nullable)
- lastUsed (timestamp, nullable)
- notes (string, nullable)
- updatedAt (timestamp)

#### `custom_procedures`
- id (string)
- name (string)
- opcs4Codes (string[], nullable)
- addedBy (string)
- addedByRole (string)
- addedDate (timestamp)
- approved (boolean)
- approvedBy (string, nullable)
- approvedDate (timestamp, nullable)
- usageCount (number)
- specialty (string)
- subcategory (string)

#### `custom_equipment`
- id (string)
- name (string)
- manufacturer (string, nullable)
- productLine (string, nullable)
- category (string)
- addedBy (string)
- addedByRole (string)
- addedDate (timestamp)
- approved (boolean)
- approvedBy (string, nullable)
- approvedDate (timestamp, nullable)
- usageCount (number)

#### `removal_requests`
- id (string)
- itemId (string)
- itemName (string)
- itemType ('procedure' | 'equipment')
- requestedBy (string)
- requestedByRole (string)
- requestDate (timestamp)
- reason (string)
- detailedReason (string, nullable)
- status ('pending' | 'approved' | 'rejected')
- reviewedBy (string, nullable)
- reviewDate (timestamp, nullable)
- reviewNotes (string, nullable)

#### `scrub_episodes` (from EPR)
- id (string)
- staffId (string, indexed)
- date (timestamp)
- procedureName (string)
- opcs4Code (string)
- role (string)
- surgeon (string)
- specialty (string)
- duration (number)
- complexity (string, nullable)
- matched (boolean)
- experienceUpdated (boolean)

---

## 🔗 EPR Integration

### How It Works

1. **EPR System** records scrub episodes with OPCS-4 codes
2. **Matching Service** queries episodes for staff member
3. **Suggestion Generator** creates experience update suggestions
4. **Staff Reviews** suggestions and accepts/declines
5. **Auto-Update** applies accepted suggestions to experience

### Example Flow

```
1. Staff scrubs "Total Hip Replacement" (OPCS-4: W371)
2. EPR records episode with OPCS-4 code
3. System matches W371 to procedure
4. Suggestion created:
   "You scrubbed Total Hip Replacement on 15/01/2025.
    This is your 6th time. Consider updating to
    'Competent (with supervision)'?"
5. Staff accepts → Experience updated automatically
```

### Integration Points

```typescript
// 1. Fetch scrub episodes from EPR
const episodes = await fetchEPRScrubEpisodes(staffId, dateFrom, dateTo);

// 2. Match OPCS-4 codes to procedures
const matched = matchOPCS4ToProcedures(episodes);

// 3. Generate suggestions
const suggestions = await generateSuggestions(staffId);

// 4. Display to staff
<EPRExperienceSuggestions
  staffId={staffId}
  onAccept={handleAccept}
  onDecline={handleDecline}
/>
```

---

## 📝 Usage Examples

### Example 1: Basic Integration

```tsx
'use client';

import { useState } from 'react';
import CompetencyManagement from '@/components/CompetencyManagement';

export default function ProfilePage({ user }) {
  return (
    <div className="container mx-auto p-6">
      <CompetencyManagement
        staffId={user.id}
        staffName={user.name}
        staffRole={user.role}
        primarySpecialty={user.specialty}
      />
    </div>
  );
}
```

### Example 2: Separate Components

```tsx
'use client';

import { useState } from 'react';
import ProcedureExperienceSelector from '@/components/ProcedureExperienceSelector';
import EquipmentExperienceSelector from '@/components/EquipmentExperienceSelector';

export default function CompetencyPage() {
  const [procedures, setProcedures] = useState([]);
  const [equipment, setEquipment] = useState([]);

  return (
    <div>
      <section>
        <h2>Procedures</h2>
        <ProcedureExperienceSelector
          selectedProcedures={procedures}
          onUpdate={setProcedures}
          userRole="Scrub Nurse"
        />
      </section>

      <section>
        <h2>Equipment</h2>
        <EquipmentExperienceSelector
          selectedEquipment={equipment}
          onUpdate={setEquipment}
          specialty="Orthopaedics"
        />
      </section>
    </div>
  );
}
```

### Example 3: Admin Approval Panel

```tsx
import { competencyService } from '@/lib/services/competencyService';

export default async function AdminPanel() {
  const pendingRequests = await competencyService.getRemovalRequests(
    undefined, // all staff
    'pending'  // only pending
  );

  return (
    <div>
      {pendingRequests.map(request => (
        <div key={request.id}>
          <h3>{request.itemName}</h3>
          <p>Reason: {request.reason}</p>
          <button onClick={() => approveRequest(request.id)}>
            Approve
          </button>
          <button onClick={() => rejectRequest(request.id)}>
            Reject
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

## 🎨 Customization

### Adding New Specialties

Edit `lib/surgicalCompetencyData.ts`:

```typescript
export const SURGICAL_PROCEDURES_BY_SPECIALTY = {
  // ... existing specialties
  'Cardiothoracic': {
    icon: '🫀',
    subcategories: {
      'Cardiac': {
        procedures: [
          { name: 'CABG', opcs4: ['K401'], commonVariations: ['Coronary Bypass'] },
          // ... more procedures
        ]
      }
    }
  }
};
```

### Adding New Equipment Manufacturers

Edit `lib/surgicalCompetencyData.ts`:

```typescript
export const ORTHOPAEDIC_EQUIPMENT = {
  'Hip Arthroplasty': {
    // ... existing manufacturers
    'NewCompany Ltd': {
      products: [
        'Product Line 1',
        'Product Line 2'
      ]
    }
  }
};
```

---

## 🐛 Troubleshooting

### Issue: Changes not saving

**Solution:**
1. Check browser console for errors
2. Verify API routes are created
3. Check database connection
4. Ensure localStorage fallback is working

### Issue: EPR suggestions not appearing

**Solution:**
1. Verify scrub episodes have OPCS-4 codes
2. Check date range in query
3. Ensure `matched` and `experienceUpdated` flags are set correctly

### Issue: Custom procedures not showing

**Solution:**
1. Check if `approved` flag is true
2. Verify custom procedures are loaded in component
3. Check database query includes custom items

---

## 📞 Support

For questions or issues:
1. Check this documentation
2. Review component source code
3. Check browser console for errors
4. Contact system administrator

---

## 🚀 Future Enhancements

- [ ] Mobile app integration
- [ ] Export competency reports (PDF)
- [ ] Team competency dashboard
- [ ] Competency-based rostering
- [ ] Learning pathway recommendations
- [ ] Video tutorials linked to procedures
- [ ] Peer review system
- [ ] Annual competency validation
- [ ] Integration with e-learning platforms

---

**Version:** 1.0.0
**Last Updated:** January 2025
**Author:** Theatre Operations Manager Development Team
