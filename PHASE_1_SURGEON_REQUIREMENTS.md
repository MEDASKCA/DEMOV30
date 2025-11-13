# PHASE 1: Surgeon Profiles - Requirements Document

## Overview
All hardcoded surgeon and anaesthetist names have been removed from the codebase. This document outlines what needs to be created in Phase 1 to replace them.

---

## Removed Hardcoded Data

### 1. scripts/seedProceduresAndSurgeons.ts
- **Removed**: 56 surgeons across 12 specialties
- **Purpose**: Generated surgeons and linked them to procedures
- **Status**: Disabled until Phase 1

### 2. scripts/generateProcedurePool.ts
- **Removed**: 56 surgeons for waiting list generation
- **Purpose**: Assigns surgeons to procedures in waiting list pool
- **Status**: Empty array - needs Firebase integration

### 3. scripts/generateYearSchedulePool.ts
- **Removed**: 50 surgeons + 10 anaesthetists
- **Purpose**: Generates year-long theatre schedules with realistic rotations
- **Key Features**:
  - Annual leave schedules (25-30 days per consultant)
  - Workload constraints (maxListsPerWeek: 2-5)
  - Specialty/subspecialty assignments
- **Status**: Empty arrays - needs Firebase integration

---

## Required Data Structures

### Surgeon Profile
```typescript
interface Surgeon {
  // Basic Information
  firstName: string;
  lastName: string;
  title: 'Mr' | 'Ms' | 'Miss' | 'Dr' | 'Prof';
  initials: string;

  // Specialty Assignment
  specialtyId: string;         // Reference to specialties collection
  specialtyName: string;
  subspecialtyName?: string;   // Optional subspecialty

  // Workload & Scheduling
  annualLeaveDays: number;     // Typically 25-30 days
  maxListsPerWeek: number;     // Typically 2-5 lists
  preferredOperatingDays?: string[]; // e.g., ['Monday', 'Wednesday', 'Friday']

  // Competency (Future - Phase 2)
  procedureCompetencies?: {    // PCS scores per procedure
    procedureId: string;
    pcsScore: number;          // 1-5 scale
    caseComplexity: 'Simple' | 'Intermediate' | 'Complex';
  }[];

  // Performance Metrics (Future - Phase 3)
  historicalPerformance?: {
    averageOperatingTime: number;
    complicationRate: number;
    patientSatisfactionScore: number;
  };
}
```

### Anaesthetist Profile
```typescript
interface Anaesthetist {
  // Basic Information
  firstName: string;
  lastName: string;
  title: 'Dr';
  initials: string;

  // Specialty (always 'Anaesthetics')
  specialty: 'Anaesthetics';

  // Workload & Scheduling
  annualLeaveDays: number;     // Typically 25-30 days
  maxListsPerWeek: number;     // Typically 5 lists

  // Subspecialty interests (optional)
  specialtyInterests?: string[]; // e.g., ['Cardiac', 'Neuro', 'Paediatric']
}
```

---

## Firebase Collections

### surgeons Collection
```
surgeons/
  {surgeonId}/
    firstName: string
    lastName: string
    title: string
    initials: string
    specialtyId: string
    specialtyName: string
    subspecialtyName?: string
    annualLeaveDays: number
    maxListsPerWeek: number
    createdAt: timestamp
    updatedAt: timestamp
```

### anaesthetists Collection
```
anaesthetists/
  {anaesthetistId}/
    firstName: string
    lastName: string
    title: string
    initials: string
    specialty: 'Anaesthetics'
    annualLeaveDays: number
    maxListsPerWeek: number
    createdAt: timestamp
    updatedAt: timestamp
```

---

## Coverage Requirements (Based on Removed Data)

### Surgeons by Specialty
- **EMERGENCY**: 6 surgeons (maxListsPerWeek: 5)
- **ENT**: 4 surgeons (2 ENT ROBOTIC, 2 ENT LASER)
- **GENERAL SURGERY**: 8 surgeons (COLORECTAL, UPPER GI, HEPATOBILIARY, HIPEC)
- **GYNAECOLOGY**: 3-4 surgeons (GYNAE ROBOTIC, GYNAE FERTILITY)
- **NEUROLOGY**: 3 surgeons (NEURO-ONCOLOGY)
- **OPHTHALMOLOGY**: 3 surgeons
- **ORAL AND MAXILLOFACIAL**: 4-6 surgeons (OMFS TRAUMA, OMFS MANDIBLE, ORTHOGNATIC, DENTAL)
- **ORTHOPAEDICS**: 6 surgeons (ELECTIVE JOINTS, SPINE, TRAUMA)
- **PLASTICS**: 3-4 surgeons (BURNS & BREAST, DIEP)
- **RENAL**: 3 surgeons (RENAL TRANSPLANT)
- **UROLOGY**: 4 surgeons (UROLOGY ROBOTIC, UROLOGY LASER)
- **VASCULAR**: 3 surgeons

**TOTAL**: ~50-56 surgeons across 12 specialties

### Anaesthetists
- **10 anaesthetists** (shared pool across all specialties)
- maxListsPerWeek: 5
- annualLeaveDays: 25-30

---

## Key Relationships to Maintain

### 1. Surgeon → Specialty
- Each surgeon must be linked to a specialty via `specialtyId`
- Specialty must exist in `specialties` collection

### 2. Surgeon → Subspecialty
- Optional subspecialty assignment
- Subspecialty must exist within parent specialty

### 3. Surgeon → Procedures (Phase 2)
- Future: Link surgeons to procedures they can perform
- Include PCS (Procedure Competency Score) ratings
- Include case complexity ratings

### 4. Surgeon → Theatre Lists (Current Usage)
- Sessions grid modal uses surgeons for allocation
- Currently pulls from existing theatre lists (SessionsContent.tsx:352-356)
- **ISSUE**: Empty list if no theatre lists exist yet

### 5. Surgeon → Waiting List (Current Usage)
- Procedure pool assigns surgeons to patient procedures
- Year schedule pool assigns surgeons to theatre sessions

### 6. Anaesthetist → All Specialties
- Anaesthetists are shared across all specialties
- No specialty-specific assignment needed

---

## Current Issues (To Fix in Phase 1)

### 1. SessionsContent.tsx - Surgeon Dropdown Empty
**Location**: `components/scheduling/SessionsContent.tsx:352-356`

**Current Code**:
```typescript
const getSurgeons = (): string[] => {
  const surgeons = new Set<string>();
  lists.forEach(list => surgeons.add(list.primarySurgeonName));
  return Array.from(surgeons).sort();
};
```

**Problem**: Extracts surgeons from existing theatre lists. If no lists exist, dropdown is empty.

**Solution**: Load surgeons from Firebase `surgeons` collection instead.

---

## Phase 1 Deliverables

### 1. Surgeon Profiles Manager UI
- Create new configuration page: `app/admin/surgeons/page.tsx`
- Add to Configuration tabs in theatre-management
- CRUD operations:
  - Add surgeon with specialty/subspecialty
  - Edit surgeon details
  - Delete surgeon
  - View all surgeons by specialty

### 2. Anaesthetists Manager UI
- Create new configuration page: `app/admin/anaesthetists/page.tsx`
- Add to Configuration tabs
- CRUD operations similar to surgeons

### 3. Integrate Surgeons into Existing Components
- Update `SessionsContent.tsx` to load from Firebase
- Update seed scripts to load from Firebase instead of hardcoded arrays
- Ensure dropdowns populate correctly

### 4. Data Migration/Seeding
- Create initial surgeon profiles (50-56 surgeons)
- Create initial anaesthetist profiles (10 anaesthetists)
- Based on specialty coverage requirements above

---

## Future Phases

### Phase 2: Competency Matrix
- Link surgeons to procedures with PCS scores
- Case complexity ratings
- Procedure-specific competencies

### Phase 3: Waiting List & Patient Pool
- Patient records with procedure requirements
- Priority levels (P1-P5 RTT)
- Clinic lists and referral pathway

### Phase 4: Matching Algorithm
- Match patients to surgeons based on:
  - Specialty/subspecialty
  - Competency (PCS scores)
  - Case complexity
  - Surgeon availability
  - Workload constraints

### Phase 5: Realistic Schedule Generation
- Year-long theatre schedules
- Annual leave integration
- Workload balancing
- Theatre utilization optimization

---

## Next Steps

1. **Start Phase 1**: Create Surgeon Profiles Manager
2. **Populate Data**: Add 50-56 realistic surgeon profiles
3. **Integrate**: Update existing components to use Firebase data
4. **Test**: Verify sessions grid and dropdowns work correctly

---

## Reminder System

**REMINDER**: You are currently at the beginning of **Phase 1: Surgeon Profiles**.

Next phases in order:
- Phase 2: Competency Matrix (PCS Scores)
- Phase 3: Waiting List & Patient Pool
- Phase 4: Matching Algorithm
- Phase 5: Realistic Schedule Generation

---

*Document Created*: January 2025
*Last Updated*: January 2025
*Status*: All hardcoded data removed, ready for Phase 1 implementation
