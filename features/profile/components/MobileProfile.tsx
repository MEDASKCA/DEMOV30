'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  MapPin,
  Star,
  Award,
  Shield,
  ChevronRight,
  ChevronDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Briefcase,
  Calendar,
  TrendingUp,
  GraduationCap,
  Users,
  Globe,
  Heart,
  BookOpen,
  Target,
  MessageCircle,
  Phone,
  Mail,
  CalendarCheck,
  X,
  ArrowLeft,
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

// Mock profile data - will connect to Firebase later
const mockProfile = {
  id: 'TOM-NHS-2024-4782',
  firstName: 'Alexander',
  lastName: 'Monterubio',
  postNominals: ['EMBA', 'CMgr', 'MIOEE', 'LSSBB', 'RN'], // Professional designations
  professionalQualification: 'Registered Nurse (RN)',
  roles: ['Senior Scrub Team Leader', 'Lead Nurse'],
  band: 'Band 7',
  rating: 4.9,
  totalShifts: 0,
  completedShifts: 0,

  // Contact Details
  contactDetails: {
    email: 'alexander.monterubio@nhs.net',
    phone: '+44 7700 900456',
    preferredContact: 'email'
  },

  // Location & Availability
  location: {
    currentTrust: 'Barts Health NHS Trust',
    currentHospital: 'Royal London Hospital',
    postcode: 'E1 1BB',
    area: 'East London',
    willingToTravel: 15, // miles
  },

  // Experience & Specialties
  yearsExperience: 18, // 2007-2025
  connections: 3000, // Professional connections/network

  competencyStats: {
    mandatory: 10,
    clinical: 42,
    technical: 28,
    professional: 15,
  },

  // Hierarchical specialty tree - Theatre Operations Areas
  specialtyTree: [
    {
      name: 'Orthopaedics Theatre',
      subcategories: [
        {
          name: 'Trauma Theatre',
          procedures: ['Emergency Fracture Cases', 'Polytrauma Coordination', 'Night Emergency Coverage', 'Staff Deployment']
        },
        {
          name: 'Elective Theatre',
          procedures: ['Joint Replacement Lists', 'Spinal Surgery Days', 'Hand Surgery Clinics', 'Equipment Management']
        }
      ]
    },
    {
      name: 'General Surgery Theatre',
      subcategories: [
        {
          name: 'Upper GI Theatre',
          procedures: ['Laparoscopic Lists', 'Complex Resections', 'Bariatric Surgery', 'Team Coordination']
        },
        {
          name: 'Colorectal Theatre',
          procedures: ['Enhanced Recovery Programmes', 'Stoma Care Coordination', 'MDT Integration']
        },
        {
          name: 'Emergency Theatre',
          procedures: ['24/7 Emergency Coverage', 'Trauma Call Management', 'Resource Allocation', 'Priority Assessment']
        }
      ]
    },
    {
      name: 'Cardiac Theatre',
      subcategories: [
        {
          name: 'Cardiac Surgery',
          procedures: ['CABG Programme Management', 'Valve Surgery Coordination', 'ECMO Support', 'Perfusion Team Liaison']
        },
        {
          name: 'Hybrid Theatre',
          procedures: ['TAVI Procedures', 'Complex Interventions', 'Equipment Procurement']
        }
      ]
    },
    {
      name: 'Neurosurgery Theatre',
      procedures: ['Cranial Surgery Management', 'Spinal Lists', 'Awake Craniotomy Coordination', 'Specialist Equipment']
    },
    {
      name: 'Day Surgery Unit',
      procedures: ['High-Volume Lists', 'Patient Throughput', 'Discharge Efficiency', 'Staff Rotation']
    },
    {
      name: 'Vascular Theatre',
      procedures: ['Emergency AAA Management', 'EVAR Programme', 'Hybrid Procedures', 'On-Call Coordination']
    },
    {
      name: 'Plastics & Maxillofacial',
      procedures: ['Reconstructive Cases', 'Trauma Management', 'Free Flap Coordination', 'Microsurgery Support']
    },
    {
      name: 'Gynaecology Theatre',
      procedures: ['Laparoscopic Surgery', 'Oncology Lists', 'Emergency Management', 'Urogynaecology']
    }
  ],

  // Surgical Competencies - Specific procedures with OPCS-4 codes
  surgicalCompetencies: [
    {
      specialty: 'Orthopaedics & Trauma',
      subcategories: [
        {
          name: 'Hip Trauma',
          procedures: [
            { name: 'Dynamic Hip Screw (DHS)', opcs4: ['W241'], level: 'expert', yearsExperience: 5, frequency: 'weekly', lastPerformed: 'Jan 2025' },
            { name: 'Cephalomedullary Nailing (Gamma Nail)', opcs4: ['W244'], level: 'advanced', yearsExperience: 4, frequency: 'weekly', lastPerformed: 'Dec 2024' },
            { name: 'Hemiarthroplasty - Cemented', opcs4: ['W461'], level: 'expert', yearsExperience: 8, frequency: 'weekly', lastPerformed: 'Jan 2025' },
            { name: 'Hemiarthroplasty - Uncemented', opcs4: ['W471'], level: 'expert', yearsExperience: 7, frequency: 'weekly', lastPerformed: 'Jan 2025' }
          ]
        },
        {
          name: 'Elective Hip',
          procedures: [
            { name: 'Total Hip Replacement - Cemented', opcs4: ['W371'], level: 'expert', yearsExperience: 10, frequency: 'weekly', lastPerformed: 'Jan 2025' },
            { name: 'Total Hip Replacement - Uncemented', opcs4: ['W381'], level: 'expert', yearsExperience: 10, frequency: 'weekly', lastPerformed: 'Jan 2025' },
            { name: 'Hip Resurfacing', opcs4: ['W401'], level: 'advanced', yearsExperience: 3, frequency: 'monthly', lastPerformed: 'Nov 2024' },
            { name: 'Revision Hip Replacement', opcs4: ['W382'], level: 'advanced', yearsExperience: 6, frequency: 'monthly', lastPerformed: 'Dec 2024' }
          ]
        },
        {
          name: 'Knee Surgery',
          procedures: [
            { name: 'Total Knee Replacement', opcs4: ['W401'], level: 'expert', yearsExperience: 12, frequency: 'weekly', lastPerformed: 'Jan 2025' },
            { name: 'Unicompartmental Knee Replacement', opcs4: ['W411'], level: 'advanced', yearsExperience: 5, frequency: 'fortnightly', lastPerformed: 'Dec 2024' },
            { name: 'Revision Knee Replacement', opcs4: ['W402'], level: 'advanced', yearsExperience: 4, frequency: 'monthly', lastPerformed: 'Nov 2024' },
            { name: 'Knee Arthroscopy', opcs4: ['W821'], level: 'expert', yearsExperience: 9, frequency: 'weekly', lastPerformed: 'Jan 2025' }
          ]
        }
      ]
    },
    {
      specialty: 'General Surgery',
      subcategories: [
        {
          name: 'Upper GI',
          procedures: [
            { name: 'Laparoscopic Cholecystectomy', opcs4: ['J181'], level: 'expert', yearsExperience: 11, frequency: 'weekly', lastPerformed: 'Jan 2025' },
            { name: 'Laparoscopic Fundoplication', opcs4: ['G281'], level: 'advanced', yearsExperience: 6, frequency: 'monthly', lastPerformed: 'Dec 2024' },
            { name: 'Laparoscopic Gastric Bypass', opcs4: ['G281'], level: 'advanced', yearsExperience: 4, frequency: 'monthly', lastPerformed: 'Nov 2024' }
          ]
        },
        {
          name: 'Colorectal',
          procedures: [
            { name: 'Laparoscopic Right Hemicolectomy', opcs4: ['H071'], level: 'advanced', yearsExperience: 7, frequency: 'fortnightly', lastPerformed: 'Dec 2024' },
            { name: 'Laparoscopic Anterior Resection', opcs4: ['H331'], level: 'advanced', yearsExperience: 5, frequency: 'monthly', lastPerformed: 'Nov 2024' },
            { name: 'Laparoscopic Abdominoperineal Resection', opcs4: ['H331'], level: 'competent', yearsExperience: 3, frequency: 'quarterly', lastPerformed: 'Oct 2024' }
          ]
        },
        {
          name: 'Hernias',
          procedures: [
            { name: 'Laparoscopic Inguinal Hernia Repair', opcs4: ['T201'], level: 'expert', yearsExperience: 10, frequency: 'weekly', lastPerformed: 'Jan 2025' },
            { name: 'Laparoscopic Ventral Hernia Repair', opcs4: ['T273'], level: 'advanced', yearsExperience: 6, frequency: 'fortnightly', lastPerformed: 'Dec 2024' }
          ]
        }
      ]
    }
  ],

  // Competency Tree - Theatre Operations Management Skills
  competencyTree: [
    {
      name: 'Mandatory Training',
      icon: 'shield',
      subcategories: [
        {
          name: 'Statutory & Mandatory',
          items: [
            { name: 'Basic Life Support', level: 'certified', expiry: '2026-03-15', provider: 'Resuscitation Council UK' },
            { name: 'Immediate Life Support', level: 'certified', expiry: '2026-03-15', provider: 'Resuscitation Council UK' },
            { name: 'Safeguarding Adults Level 3', level: 'certified', expiry: '2026-01-20', provider: 'Trust Training' },
            { name: 'Fire Safety', level: 'certified', expiry: '2025-11-30', provider: 'Trust Training' },
            { name: 'Health & Safety', level: 'certified', expiry: '2025-11-30', provider: 'Trust Training' },
            { name: 'Infection Prevention & Control', level: 'certified', expiry: '2026-04-10', provider: 'Trust Training' }
          ]
        },
        {
          name: 'Management Mandatory',
          items: [
            { name: 'Financial Management', level: 'certified', expiry: '2026-02-20', provider: 'Trust Training' },
            { name: 'HR Management Essentials', level: 'certified', expiry: '2026-03-10', provider: 'Trust Training' },
            { name: 'Risk Management', level: 'certified', expiry: '2025-12-15', provider: 'Trust Training' },
            { name: 'COSHH', level: 'certified', expiry: '2026-01-05', provider: 'Trust Training' }
          ]
        }
      ]
    },
    {
      name: 'Theatre Operations Management',
      icon: 'briefcase',
      subcategories: [
        {
          name: 'List Management',
          items: [
            { name: 'Theatre Scheduling', level: 'expert', description: 'Optimizing theatre utilization across 12 theatres with 95%+ efficiency' },
            { name: 'Emergency Prioritization', level: 'expert', description: 'Trauma and emergency case triage and resource allocation' },
            { name: 'List Coordination', level: 'expert', description: 'Multi-specialty coordination and conflict resolution' },
            { name: 'Overrun Management', level: 'expert', description: 'Managing delays, additional cases, and staff overtime' }
          ]
        },
        {
          name: 'Staff Management',
          subcategories: [
            {
              name: 'Workforce Planning',
              items: [
                { name: 'Rota Management', level: 'expert', description: '70+ theatre staff across multiple specialties' },
                { name: 'Skills Mix Optimization', level: 'expert', description: 'Matching staff competencies to surgical requirements' },
                { name: 'Bank & Locum Management', level: 'advanced', description: 'Supplementary staffing and cost control' },
                { name: 'Holiday & Leave Planning', level: 'expert', description: 'Maintaining minimum staffing levels year-round' }
              ]
            },
            {
              name: 'Performance Management',
              items: [
                { name: 'Appraisals & Objectives', level: 'expert', description: 'Annual reviews for 70+ staff members' },
                { name: 'Competency Assessment', level: 'expert', description: 'Validating clinical and technical competencies' },
                { name: 'Capability Management', level: 'advanced', description: 'Supporting underperforming staff' },
                { name: 'Disciplinary Processes', level: 'competent', description: 'Formal HR processes and investigations' }
              ]
            },
            {
              name: 'Staff Development',
              items: [
                { name: 'Training Needs Analysis', level: 'expert', description: 'Identifying development requirements' },
                { name: 'Succession Planning', level: 'advanced', description: 'Developing future leaders' },
                { name: 'Mentorship Programme', level: 'expert', description: 'Structured mentoring for Band 6/7 staff' },
                { name: 'Student Placement Coordination', level: 'advanced', description: 'Nursing and ODP students' }
              ]
            }
          ]
        },
        {
          name: 'Resource Management',
          items: [
            { name: 'Equipment Procurement', level: 'expert', description: 'Capital planning and business cases for major equipment' },
            { name: 'Stock Control', level: 'advanced', description: 'Inventory management and cost reduction' },
            { name: 'Budget Management', level: 'expert', description: '£4.2M annual theatre budget responsibility' },
            { name: 'Waste Reduction', level: 'advanced', description: 'Sustainability and cost-saving initiatives' }
          ]
        }
      ]
    },
    {
      name: 'Quality & Safety',
      icon: 'shield',
      subcategories: [
        {
          name: 'Clinical Governance',
          items: [
            { name: 'Incident Investigation', level: 'expert', description: 'Root cause analysis and serious incident investigations' },
            { name: 'Clinical Audit', level: 'expert', description: 'Leading theatre audits and quality improvement projects' },
            { name: 'Mortality & Morbidity Reviews', level: 'advanced', description: 'Theatre representation at M&M meetings' },
            { name: 'Policy Development', level: 'expert', description: 'Creating and updating theatre SOPs and guidelines' }
          ]
        },
        {
          name: 'Patient Safety',
          items: [
            { name: 'WHO Checklist Compliance', level: 'expert', description: '100% compliance monitoring and auditing' },
            { name: 'Never Events Prevention', level: 'expert', description: 'Systems to prevent surgical never events' },
            { name: 'Infection Control', level: 'advanced', description: 'Theatre environmental monitoring and SSI reduction' },
            { name: 'Patient Experience', level: 'advanced', description: 'Patient feedback and service improvement' }
          ]
        },
        {
          name: 'Regulatory Compliance',
          items: [
            { name: 'CQC Standards', level: 'expert', description: 'Maintaining CQC compliance and inspection readiness' },
            { name: 'MHRA Compliance', level: 'advanced', description: 'Medical device regulation and reporting' },
            { name: 'Data Protection', level: 'competent', description: 'GDPR compliance in theatre operations' },
            { name: 'Health & Safety Regulations', level: 'expert', description: 'H&S risk assessments and compliance' }
          ]
        }
      ]
    },
    {
      name: 'Leadership & Strategic',
      icon: 'briefcase',
      items: [
        { name: 'Strategic Planning', level: 'expert', description: 'Theatre service development and 5-year planning' },
        { name: 'Change Management', level: 'expert', description: 'Implementing service changes and new ways of working' },
        { name: 'Stakeholder Management', level: 'expert', description: 'Liaison with surgeons, anaesthetists, trust board' },
        { name: 'Business Case Development', level: 'expert', description: 'Capital bids and service expansion proposals' },
        { name: 'Contract Management', level: 'advanced', description: 'External contracts and SLAs' },
        { name: 'Project Management', level: 'expert', description: 'Theatre refurbishments and service redesign' },
        { name: 'Performance Analytics', level: 'expert', description: 'KPI tracking, dashboards, and reporting' },
        { name: 'Crisis Management', level: 'expert', description: 'Managing major incidents and business continuity' }
      ]
    }
  ],

  // Employment History
  employmentHistory: [
    {
      employer: 'Barts Health NHS Trust',
      hospital: 'Royal London Hospital',
      department: 'Trauma and Orthopaedics',
      position: 'Senior Team Leader/Clinical Manager',
      band: 'Band 7',
      type: 'Permanent',
      startDate: '2025-03-01',
      endDate: '2025-08-31',
      specialties: ['Trauma Theatre', 'Orthopaedics', 'Team Leadership'],
      responsibilities: [
        'Lead and deliver high-quality, evidence-based patient care with compassion and respect',
        'Line manage multidisciplinary team overseeing staffing, performance, recruitment, and development',
        'Act as lead change agent driving quality improvement initiatives',
        'Maintain operational oversight including budget control, resource allocation, and risk management',
        'Champion culture of safety, learning, and safeguarding with WHO Safety Checklist compliance',
        'Promote learning environment through mentoring, coaching, and structured training',
        'Lead on incident investigation, complaint resolution, and shared learning'
      ],
      verifiedBy: 'Dr. Sarah Williams',
      verifiedByRole: 'Clinical Director Surgery',
      verifiedDate: '2025-10-01',
      verified: true
    },
    {
      employer: 'Various NHS & Private Hospitals (Locum)',
      hospital: 'Multiple Sites',
      department: 'Theatres',
      position: 'Locum Nurse/Nurse in Charge',
      band: 'Band 6-7',
      type: 'Locum',
      startDate: '2021-12-01',
      endDate: null, // Current
      specialties: ['Surgical Insourcing', 'Multi-site Coverage', 'Lead Nurse'],
      responsibilities: [
        'Surgical insourcing projects (18 Week Support, KPI Health, Medinet, Xyla, HBSUK, Novello, Sirona)',
        'Working across major teaching hospitals and specialist centres',
        'Sites include: RNOH, UCLH, Guy\'s & St Thomas\', Imperial, Royal Free, and many more',
        'Demonstrating broad perioperative experience in diverse settings'
      ]
    },
    {
      employer: 'Barts Health NHS Trust',
      hospital: 'Whipps Cross Hospital',
      department: 'Theatres',
      position: 'Sister/Charge Nurse',
      band: 'Band 6',
      type: 'Permanent',
      startDate: '2019-04-01',
      endDate: '2021-11-30',
      specialties: ['Theatre Management', 'Team Leadership', 'Quality Improvement'],
      responsibilities: [
        'Leading theatre teams in general surgery and orthopaedics',
        'Staff supervision and mentoring',
        'Coordinating daily theatre operations',
        'Quality improvement initiatives'
      ]
    },
    {
      employer: 'Barts Health NHS Trust',
      hospital: 'Royal London Hospital',
      department: 'Main Theatres',
      position: 'Senior Sister/Charge Nurse - Theatre Coordinator',
      band: 'Band 7',
      type: 'Permanent',
      startDate: '2016-09-01',
      endDate: '2019-03-31',
      specialties: ['Theatre Coordination', 'Staff Management', 'Quality Improvement'],
      responsibilities: [
        'Daily theatre coordination across all specialties',
        'Supervising Band 5 and Band 6 theatre staff',
        'Emergency case prioritization and resource allocation',
        'Leading theatre efficiency projects'
      ]
    },
    {
      employer: "Guy's and St Thomas' NHS Foundation Trust",
      hospital: "St Thomas' Hospital",
      department: 'Cardiac Theatres',
      position: 'Senior Theatre Nurse',
      band: 'Band 6',
      type: 'Permanent',
      startDate: '2013-03-01',
      endDate: '2016-08-31',
      specialties: ['Cardiac Surgery', 'Cardiothoracic'],
      responsibilities: [
        'Senior scrub nurse for complex cardiac surgery',
        'Mentoring junior theatre staff',
        'Equipment management and stock control',
        'Participation in cardiac surgery quality meetings'
      ]
    },
    {
      employer: 'NHS Trusts (Various)',
      hospital: 'Multiple Sites',
      department: 'Theatres',
      position: 'Theatre Nurse',
      band: 'Band 5',
      type: 'Permanent',
      startDate: '2009-07-01',
      endDate: '2013-02-28',
      specialties: ['General Surgery', 'Orthopaedics', 'Scrub Practice'],
      responsibilities: [
        'Scrub and circulating nurse duties',
        'Supporting surgical teams across specialties',
        'Building perioperative competencies',
        'Patient care and safety'
      ]
    },
    {
      employer: 'Various Healthcare Facilities',
      hospital: 'Philippines',
      department: 'Medical-Surgical Units',
      position: 'Staff Nurse',
      band: 'N/A',
      type: 'Permanent',
      startDate: '2007-05-01',
      endDate: '2009-06-30',
      specialties: ['Medical-Surgical Nursing', 'Patient Care'],
      responsibilities: [
        'Direct patient care in medical-surgical units',
        'Medication administration and treatment delivery',
        'Patient assessment and monitoring',
        'Collaboration with multidisciplinary teams'
      ]
    }
  ],

  // Education & Qualifications
  education: [
    {
      institution: 'Nottingham Business School, Nottingham Trent University',
      degree: 'Executive Master of Business Administration (EMBA)',
      field: 'Business Administration',
      grade: 'Pass',
      startDate: '2021-10-01',
      endDate: '2023-10-01',
      description: 'Executive MBA program focused on strategic management, leadership, and organizational excellence.',
      verified: false,
      verificationLink: '',
      certificateNumber: ''
    },
    {
      institution: 'University of the Philippines',
      degree: 'Bachelor of Science in Nursing',
      field: 'Nursing',
      grade: 'Completed',
      startDate: '2003-06-01',
      endDate: '2007-04-01',
      description: 'Four-year undergraduate nursing program.',
      verified: false
    }
  ],

  // Certifications & Licenses
  certifications: [
    { name: 'Nursing and Midwifery Council (NMC) Registration', issuer: 'Nursing and Midwifery Council', number: '09D0567E', issueDate: '2009-07-01', expiryDate: null, status: 'Active' },
    { name: 'ILM Level 7 Certificate in Executive Coaching and Leadership Mentoring', issuer: 'Institute of Leadership & Management', number: '', issueDate: '2020-01-01', expiryDate: null, status: 'Current' },
    { name: 'Chartered Manager (CMgr)', issuer: 'Chartered Management Institute', number: '', issueDate: '2021-01-01', expiryDate: null, status: 'Current' },
    { name: 'Member of the Institute of Occupational Safety and Health (MIOSH)', issuer: 'IOSH', number: '', issueDate: '2019-01-01', expiryDate: null, status: 'Current' },
    { name: 'Lean Six Sigma Black Belt (LSSBB)', issuer: 'International Association for Six Sigma Certification', number: '', issueDate: '2020-06-01', expiryDate: null, status: 'Current' },
    { name: 'Immediate Life Support (ILS)', issuer: 'Resuscitation Council UK', number: '', issueDate: '2024-03-01', expiryDate: '2027-03-01', status: 'Current' },
    { name: 'Manual Handling Trainer', issuer: 'NHS Trust', number: '', issueDate: '2018-01-01', expiryDate: null, status: 'Current' },
    { name: 'Infection Prevention and Control Lead', issuer: 'NHS Trust', number: '', issueDate: '2017-01-01', expiryDate: null, status: 'Current' }
  ],

  // Professional Memberships
  memberships: [
    {
      organization: 'Association for Perioperative Practice (AfPP)',
      role: 'Member',
      startDate: '2013-07-01',
      current: true,
      description: 'Professional membership with access to clinical guidelines, CPD resources, and conferences.'
    },
    {
      organization: 'Chartered Management Institute (CMI)',
      role: 'Chartered Manager (CMgr)',
      startDate: '2020-01-01',
      current: true,
      description: 'Chartered status recognizing excellence in professional management practice.'
    },
    {
      organization: 'NHS Confederation',
      role: 'Member',
      startDate: '2019-04-01',
      current: true,
      description: 'Network of NHS leaders supporting health service improvement.'
    }
  ],

  // Recommendations
  recommendations: [
    {
      author: 'Dr. Sarah Williams',
      authorRole: 'Clinical Director of Surgery',
      authorOrganization: 'Royal London Hospital',
      relationship: 'Senior Clinical Manager',
      date: '2025-09-15',
      text: 'Alexander is an outstanding theatre manager who has transformed our theatre services over the past 6 years. Under his leadership, we have achieved consistently high theatre utilization rates (92%+), reduced cancellation rates, and improved staff morale significantly. His data-driven approach to decision making, combined with excellent interpersonal skills, makes him highly effective at managing the complex demands of a busy trauma theatre environment. I have absolute confidence in Alexander\'s ability to lead at executive level.'
    },
    {
      author: 'Emma Thompson',
      authorRole: 'Chief Operating Officer',
      authorOrganization: 'Barts Health NHS Trust',
      relationship: 'Senior Executive',
      date: '2025-08-22',
      text: "Alexander has consistently demonstrated exceptional leadership and operational management skills. His handling of our major theatre refurbishment project was exemplary - delivered on time, within budget, with minimal disruption to services. He is a strategic thinker who balances financial constraints with quality and safety imperatives. Alexander would be an asset to any senior leadership team."
    },
    {
      author: 'Mr. James Patterson',
      authorRole: 'Consultant Orthopaedic Surgeon',
      authorOrganization: 'Royal London Hospital',
      relationship: 'Clinical Colleague',
      date: '2025-07-10',
      text: "As a surgeon who has worked across multiple NHS trusts, I can say without hesitation that Alexander is one of the best theatre managers I have encountered. He understands clinical priorities, manages resources brilliantly, and maintains excellent relationships with surgical teams. His improvements to our trauma theatre provision have directly improved patient outcomes."
    }
  ],

  // Awards & Honors
  awards: [
    {
      title: 'NHS Operational Manager of the Year',
      issuer: 'Health Service Journal Awards',
      date: '2024-11-15',
      description: 'National recognition for outstanding contribution to NHS operational excellence and theatre service transformation.'
    },
    {
      title: 'Trust Excellence Award - Service Improvement',
      issuer: 'Barts Health NHS Trust',
      date: '2024-06-20',
      description: 'Awarded for leading theatre efficiency programme resulting in £680K annual savings and 8% improvement in utilization.'
    },
    {
      title: 'Quality Improvement Project Award',
      issuer: 'Royal College of Surgeons',
      date: '2023-10-05',
      description: 'Recognition for "Reducing Theatre Delays Through Data Analytics" project presented at national conference.'
    },
    {
      title: 'Leadership Excellence Award',
      issuer: 'NHS Leadership Academy',
      date: '2023-03-12',
      description: 'Awarded during Aspiring Directors Programme for exceptional leadership potential and project work.'
    }
  ],

  // Volunteer Experience
  volunteerWork: [
    {
      organization: 'NHS Sustainability Network',
      role: 'Theatre Green Lead',
      location: 'National',
      startDate: '2022-01-01',
      endDate: null,
      description: 'Leading theatre sustainability initiatives including waste reduction and environmental impact minimization.',
      activities: [
        'Developing best practice guidance for sustainable theatre operations',
        'National working group on single-use plastics reduction',
        'Presenting at conferences on theatre sustainability'
      ]
    },
    {
      organization: 'Future NHS Leaders Programme',
      role: 'Mentor',
      location: 'East London',
      startDate: '2021-09-01',
      endDate: null,
      description: 'Mentoring aspiring healthcare managers from BAME backgrounds.',
      activities: [
        'One-to-one mentoring sessions',
        'Career guidance and interview preparation',
        'Supporting leadership development journeys'
      ]
    }
  ],

  // Publications & Projects
  publications: [
    {
      title: 'Data-Driven Theatre Management: A Case Study in Efficiency Optimization',
      type: 'Journal Article',
      publisher: 'Journal of Perioperative Practice',
      date: '2024-05-01',
      description: 'Peer-reviewed article describing implementation of real-time data analytics to improve theatre utilization, reduce delays, and optimize resource allocation at a major trauma center.',
      coAuthors: ['Dr. Sarah Williams', 'Prof. Michael Foster']
    },
    {
      title: 'Leading Theatre Services Through COVID-19: Lessons Learned',
      type: 'Book Chapter',
      publisher: 'NHS Confederation',
      date: '2023-09-01',
      description: 'Contributed chapter on operational management of theatre services during pandemic, including staff redeployment, PPE management, and service recovery.',
      coAuthors: []
    }
  ],

  // Languages
  languages: [
    { language: 'English', proficiency: 'Native' },
    { language: 'Spanish', proficiency: 'Fluent' },
    { language: 'Tagalog', proficiency: 'Conversational' }
  ],

  // Interests & Activities
  interests: [
    {
      category: 'Professional Development',
      items: ['Healthcare leadership', 'Operational excellence', 'Data analytics', 'Change management', 'Lean methodologies']
    },
    {
      category: 'Theatre Management',
      items: ['Theatre efficiency', 'Staff wellbeing', 'Quality improvement', 'Patient safety', 'Sustainability']
    },
    {
      category: 'Personal',
      items: ['Running & fitness', 'Healthcare podcasts', 'Travel', 'Photography', 'Cooking']
    }
  ],

  // Compliance
  compliance: {
    dbs: {
      status: 'valid',
      expiryDate: '2025-12-31',
      updateService: true,
      certificateNumber: 'DBS001234567890'
    },
    hcpc: {
      status: 'active',
      number: 'ODP12345',
      expiryDate: '2027-07-01',
      revalidationDue: '2026-07-01'
    },
    occupationalHealth: {
      status: 'fit',
      lastAssessment: '2025-09-15',
      nextDue: '2026-09-15',
      restrictions: []
    },
    mandatoryTraining: [
      { name: 'Basic Life Support', status: 'valid', expiry: '2026-03-15' },
      { name: 'Immediate Life Support', status: 'valid', expiry: '2026-03-15' },
      { name: 'Safeguarding Adults L3', status: 'valid', expiry: '2026-01-20' },
      { name: 'Fire Safety', status: 'expiring', expiry: '2025-11-30' },
      { name: 'Health & Safety', status: 'expiring', expiry: '2025-11-30' },
      { name: 'Infection Prevention & Control', status: 'valid', expiry: '2026-04-10' },
      { name: 'Financial Management', status: 'valid', expiry: '2026-02-20' },
      { name: 'HR Management Essentials', status: 'valid', expiry: '2026-03-10' },
      { name: 'Risk Management', status: 'valid', expiry: '2025-12-15' },
      { name: 'COSHH', status: 'valid', expiry: '2026-01-05' }
    ],
    immunisations: [
      { name: 'Hepatitis B', status: 'current', lastDose: '2013-05-10', boosterDue: null },
      { name: 'MMR', status: 'current', lastDose: '2013-06-15', boosterDue: null },
      { name: 'Varicella (Chickenpox)', status: 'current', lastDose: '2013-06-15', boosterDue: null },
      { name: 'Tuberculosis (BCG)', status: 'current', lastDose: '1998-09-01', boosterDue: null },
      { name: 'Tetanus/Diphtheria/Polio', status: 'current', lastDose: '2020-03-10', boosterDue: '2030-03-10' },
      { name: 'COVID-19', status: 'current', lastDose: '2024-10-05', boosterDue: '2025-10-05' },
      { name: 'Influenza', status: 'current', lastDose: '2024-10-12', boosterDue: '2025-10-12' }
    ],
    indemnityInsurance: {
      provider: 'Association for Perioperative Practice',
      policyNumber: 'AfPP-IND-2024-891234',
      coverage: '£10,000,000',
      expiryDate: '2025-06-30'
    }
  },

  // Preferences
  preferences: {
    shifts: [],
    travel: { max: 15, unit: 'miles' },
    minRate: 0,
    maxHoursPerWeek: 48
  },

  // Track Record
  trackRecord: {
    reliability: 100,
    endorsements: 47,
    shiftsCancelled: 0,
    shiftsCompleted: 0
  },

  // Willing to work at
  willingToWorkAt: [
    'Royal London Hospital',
    "St Bartholomew's Hospital",
    'Whipps Cross University Hospital',
    'Newham University Hospital'
  ]
};

interface MobileProfileProps {
  staffId?: string;
  staffProfile?: any;
  isEditable?: boolean;
  onSave?: (profile: any) => void;
}

export default function MobileProfile({ staffId, staffProfile, isEditable = false, onSave }: MobileProfileProps) {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(staffProfile || null);
  const [loading, setLoading] = useState(!staffProfile);
  const [activeSection, setActiveSection] = useState<'overview' | 'skills' | 'compliance'>('overview');
  const [selectedProcedure, setSelectedProcedure] = useState<any | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedSkillCategory, setSelectedSkillCategory] = useState<'mandatory' | 'clinical' | 'technical' | 'professional' | null>(null);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [selectedEducation, setSelectedEducation] = useState<any | null>(null);
  const [selectedCertification, setSelectedCertification] = useState<any | null>(null);
  const [selectedAward, setSelectedAward] = useState<any | null>(null);
  const [selectedVolunteer, setSelectedVolunteer] = useState<any | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'current' | 'awards' | 'education' | 'volunteer' | 'certified'>('all');

  // Fetch profile from Firebase or use provided staffProfile
  useEffect(() => {
    // If staffProfile is provided directly, use it and skip Firebase fetch
    if (staffProfile) {
      setProfile(staffProfile);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      if (!staffId || !db) {
        console.log('No staffId or db not configured, using mockProfile');
        setProfile(mockProfile);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('Fetching profile for staffId:', staffId);

        // Try to get document directly by ID
        const docRef = doc(db, 'staff', staffId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() };
          console.log('Profile found:', data.firstName, data.lastName);
          setProfile(data);
        } else {
          console.log('No profile found for ID:', staffId);
          setProfile(mockProfile);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setProfile(mockProfile);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [staffId, staffProfile]);

  const toggleNode = (path: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedNodes(newExpanded);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show error if no profile found
  if (!profile) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header with Avatar */}
      <div className="bg-gradient-to-r from-blue-600 via-teal-600 to-purple-600 px-4 py-4">
        <div className="flex items-start space-x-3">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-blue-600 text-xl font-bold shadow-lg">
            {profile.firstName[0]}{profile.lastName[0]}
          </div>
          <div className="flex-1">
            <h1 className="text-white font-bold text-lg">
              {profile.firstName} {profile.lastName}
              {profile.postNominals && profile.postNominals.length > 0 && (
                <span className="text-white/90 font-normal text-sm ml-1">
                  , {profile.postNominals.join(', ')}
                </span>
              )}
            </h1>
            <p className="text-white/90 text-xs">{profile.role} • {profile.band}</p>
            <p className="text-white/80 text-[10px] mt-0.5">{profile.location.currentTrust}</p>
            <p className="text-white/70 text-[10px] font-mono mt-0.5">ID: {profile.id}</p>
            <div className="flex items-center space-x-1 mt-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.floor(profile.rating)
                      ? 'text-yellow-300 fill-yellow-300'
                      : 'text-white/30'
                  }`}
                />
              ))}
              <span className="text-white text-xs ml-1">{profile.rating}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons - Hide when in modal mode */}
        {!onSave && (
          <>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button
                onClick={() => window.location.href = '/profile/edit'}
                className="bg-white text-blue-600 px-4 py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center space-x-2 hover:bg-white/90 transition-colors"
              >
                <User className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
              <button
                onClick={() => window.location.href = '/cv-builder'}
                className="bg-white text-teal-600 px-4 py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center space-x-2 hover:bg-white/90 transition-colors"
              >
                <Briefcase className="w-4 h-4" />
                <span>Build CV</span>
              </button>
            </div>

            {/* Contact Button */}
            <div className="mt-2">
              <button
                onClick={() => setShowContactModal(true)}
                className="w-full bg-white/20 backdrop-blur-sm text-white px-4 py-2.5 rounded-lg font-semibold text-sm flex items-center justify-center space-x-2 hover:bg-white/30 transition-colors border border-white/30"
              >
                <MessageCircle className="w-4 h-4" />
                <span>View Contact Details</span>
              </button>
            </div>
          </>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2.5 text-center">
            <div className="text-white font-bold text-lg">{profile.yearsExperience}</div>
            <div className="text-white/80 text-xs">Years</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2.5 text-center">
            <div className="text-white font-bold text-lg">{profile.competencyStats.mandatory + profile.competencyStats.clinical + profile.competencyStats.technical + profile.competencyStats.professional}</div>
            <div className="text-white/80 text-xs">Skills</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2.5 text-center">
            <div className="text-white font-bold text-lg">{profile.connections ? `${profile.connections}+` : '0'}</div>
            <div className="text-white/80 text-xs">Connections</div>
          </div>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex">
          {[
            { id: 'overview', label: 'Overview', icon: User },
            { id: 'skills', label: 'Skills', icon: Award },
            { id: 'compliance', label: 'Compliance', icon: Shield },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`flex-1 py-3 px-3 text-sm font-medium transition-all flex items-center justify-center space-x-1.5 border-b-2 ${
                activeSection === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Sections */}
      <div className="pb-24">
        {activeSection === 'overview' && (
          <div className="space-y-0">
            {/* About - Instagram Story Style */}
            <div className="bg-white p-4 border-b border-gray-100">
              <p className="text-sm text-gray-900 leading-relaxed">
                <span className="font-semibold">{profile.professionalQualification}</span> • <span className="font-semibold">{profile.band} {profile.roles.join(' & ')}</span> • {profile.yearsExperience} years experience • Leading <span className="text-blue-600">12 main theatres</span> & day surgery units at major trauma center
              </p>
            </div>

            {/* Filter Buttons - Compact for Desktop, Scrollable for Mobile */}
            <div className="bg-white p-3 border-b border-gray-100 overflow-x-auto">
              <div className="flex items-center gap-2 min-w-min">
                <button
                  onClick={() => setActiveFilter('all')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                    activeFilter === 'all'
                      ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Target className="w-3.5 h-3.5" />
                  All
                </button>
                <button
                  onClick={() => setActiveFilter('current')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                    activeFilter === 'current'
                      ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  Current
                </button>
                <button
                  onClick={() => setActiveFilter('awards')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                    activeFilter === 'awards'
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  Awards
                </button>
                <button
                  onClick={() => setActiveFilter('education')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                    activeFilter === 'education'
                      ? 'bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  Education
                </button>
                <button
                  onClick={() => setActiveFilter('volunteer')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                    activeFilter === 'volunteer'
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5" />
                  Volunteer
                </button>
                <button
                  onClick={() => setActiveFilter('certified')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                    activeFilter === 'certified'
                      ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  Certified
                </button>
              </div>
            </div>

            {/* Current Role - Instagram Post Style */}
            {(activeFilter === 'all' || activeFilter === 'current') && (
            <div className="bg-white border-b border-gray-100">
              <div className="px-4 py-3 flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{profile.employmentHistory[0].position}</p>
                    <p className="text-xs text-gray-500">{profile.employmentHistory[0].employer}</p>
                  </div>
                </div>
                <div className="px-4 pb-3">
                  <p className="text-xs text-gray-600 mb-2">{profile.employmentHistory[0].department}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.employmentHistory[0].specialties.map((spec, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-gradient-to-r from-blue-50 to-teal-50 text-blue-700 text-xs rounded-full font-medium">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
            </div>
            )}

            {/* Experience Timeline - Instagram Feed Style */}
            {(activeFilter === 'all' || activeFilter === 'current') && (
            <div className="bg-white border-b border-gray-100">
              <div className="px-4 py-3 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 text-sm">Experience</h3>
                <Calendar className="w-4 h-4 text-gray-400" />
              </div>
              <div className="px-4 pb-4 space-y-3">
                {profile.employmentHistory.slice(0, 3).map((job, index) => {
                  const startDate = new Date(job.startDate);
                  const endDate = job.endDate ? new Date(job.endDate) : new Date();
                  const months = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
                  const years = Math.floor(months / 12);
                  const remainingMonths = months % 12;
                  const duration = years > 0
                    ? `${years}y ${remainingMonths}m`
                    : `${remainingMonths}m`;

                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedJob(job)}
                      className="flex items-start space-x-3 w-full text-left hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors"
                    >
                      <div className={`w-10 h-10 rounded-lg ${!job.endDate ? 'bg-gradient-to-br from-blue-600 to-teal-500' : 'bg-gray-200'} flex items-center justify-center flex-shrink-0`}>
                        <Briefcase className={`w-5 h-5 ${!job.endDate ? 'text-white' : 'text-gray-500'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-semibold text-gray-900">{job.position}</p>
                          {!job.endDate && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                              Current
                            </span>
                          )}
                          {job.verified && (
                            <CheckCircle className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <p className="text-xs text-gray-600">{job.hospital}</p>
                        <p className="text-xs text-gray-500">{duration} • {job.band}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                    </button>
                  );
                })}
              </div>
            </div>
            )}

            {/* Education & Certifications - Grid Style */}
            {(activeFilter === 'all' || activeFilter === 'education' || activeFilter === 'certified') && (
            <div className="bg-white border-b border-gray-100">
              <div className="px-4 py-3">
                <h3 className="font-semibold text-gray-900 text-sm mb-3">Education & Certifications</h3>
                <div className="grid grid-cols-2 gap-2">
                  {profile.education.slice(0, 2).map((edu, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedEducation(edu)}
                      className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-lg p-3 text-left hover:from-blue-100 hover:to-teal-100 transition-all active:scale-95 relative"
                    >
                      <GraduationCap className="w-5 h-5 text-blue-600 mb-2" />
                      {edu.verified && (
                        <CheckCircle className="w-4 h-4 text-blue-600 absolute top-2 right-2" />
                      )}
                      <p className="text-xs font-semibold text-gray-900 line-clamp-2">{edu.degree}</p>
                      <p className="text-xs text-gray-600 mt-1">{new Date(edu.endDate).getFullYear()}</p>
                    </button>
                  ))}
                  {profile.certifications.slice(0, 2).map((cert, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedCertification(cert)}
                      className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 text-left hover:from-green-100 hover:to-emerald-100 transition-all active:scale-95 relative"
                    >
                      <Shield className="w-5 h-5 text-green-600 mb-2" />
                      <CheckCircle className="w-4 h-4 text-green-600 absolute top-2 right-2" />
                      <p className="text-xs font-semibold text-gray-900 line-clamp-2">{cert.name}</p>
                      <p className="text-xs text-gray-600 mt-1">{cert.issuer}</p>
                    </button>
                  ))}
                </div>
                <button className="text-xs text-blue-600 font-medium mt-3">
                  View all certifications ({profile.certifications.length}) →
                </button>
              </div>
            </div>
            )}

            {/* Recommendations - Instagram Comment Style */}
            {(activeFilter === 'all') && (
            <div className="bg-white border-b border-gray-100">
              <div className="px-4 py-3 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 text-sm">Recommendations</h3>
                <Users className="w-4 h-4 text-gray-400" />
              </div>
              <div className="px-4 pb-4 space-y-3">
                {profile.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-teal-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {rec.author.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline space-x-1.5">
                        <p className="text-sm font-semibold text-gray-900">{rec.author.split(' ')[0]}</p>
                        <p className="text-xs text-gray-600 line-clamp-2">"{rec.text.substring(0, 80)}..."</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{rec.authorRole}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            )}

            {/* Awards - Grid with Icons */}
            {(activeFilter === 'all' || activeFilter === 'awards') && (
            <div className="bg-white border-b border-gray-100">
              <div className="px-4 py-3">
                <h3 className="font-semibold text-gray-900 text-sm mb-3">Awards & Honors</h3>
                <div className="space-y-2">
                  {profile.awards.map((award, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedAward(award)}
                      className="flex items-center space-x-3 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-2.5 w-full text-left hover:from-yellow-100 hover:to-amber-100 transition-all active:scale-95"
                    >
                      <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                        <Award className="w-4 h-4 text-yellow-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 line-clamp-1">{award.title}</p>
                        <p className="text-xs text-gray-600">{new Date(award.date).getFullYear()}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
            )}

            {/* Volunteer - Card Style */}
            {(activeFilter === 'all' || activeFilter === 'volunteer') && (
            <div className="bg-white border-b border-gray-100">
              <div className="px-4 py-3">
                <h3 className="font-semibold text-gray-900 text-sm mb-3">Volunteer Experience</h3>
                <div className="space-y-2">
                  {profile.volunteerWork.map((vol, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedVolunteer(vol)}
                      className="bg-gradient-to-br from-red-50 to-pink-50 rounded-lg p-3 w-full text-left hover:from-red-100 hover:to-pink-100 transition-all active:scale-95"
                    >
                      <div className="flex items-start space-x-2">
                        <Heart className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">{vol.role}</p>
                          <p className="text-xs text-gray-600">{vol.organization}</p>
                          <p className="text-xs text-gray-500 mt-1">{vol.location} • {new Date(vol.startDate).getFullYear()}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
            )}

            {/* Interests - Hashtag Style */}
            {(activeFilter === 'all') && (
            <div className="bg-white border-b border-gray-100">
              <div className="px-4 py-3">
                <h3 className="font-semibold text-gray-900 text-sm mb-3">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.flatMap(interest => interest.items).map((item, idx) => (
                    <span key={idx} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded-full font-medium">
                      #{item.toLowerCase().replace(/\s+/g, '')}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            )}
          </div>
        )}

        {activeSection === 'skills' && (
          <div className="space-y-3 p-4">
            {/* Skills Summary */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedSkillCategory('mandatory')}
                className="bg-gradient-to-br from-blue-600 to-teal-500 rounded-lg p-4 text-white text-left hover:from-blue-700 hover:to-teal-600 transition-all active:scale-95"
              >
                <div className="text-2xl font-bold">{profile.competencyStats.mandatory}</div>
                <div className="text-sm opacity-90 mt-1">Mandatory Training</div>
              </button>
              <button
                onClick={() => setSelectedSkillCategory('clinical')}
                className="bg-gradient-to-br from-blue-600 to-teal-500 rounded-lg p-4 text-white text-left hover:from-blue-700 hover:to-teal-600 transition-all active:scale-95"
              >
                <div className="text-2xl font-bold">{profile.competencyStats.clinical}</div>
                <div className="text-sm opacity-90 mt-1">Operations Skills</div>
              </button>
              <button
                onClick={() => setSelectedSkillCategory('technical')}
                className="bg-gradient-to-br from-blue-600 to-teal-500 rounded-lg p-4 text-white text-left hover:from-blue-700 hover:to-teal-600 transition-all active:scale-95"
              >
                <div className="text-2xl font-bold">{profile.competencyStats.technical}</div>
                <div className="text-sm opacity-90 mt-1">Quality & Safety</div>
              </button>
              <button
                onClick={() => setSelectedSkillCategory('professional')}
                className="bg-gradient-to-br from-blue-600 to-teal-500 rounded-lg p-4 text-white text-left hover:from-blue-700 hover:to-teal-600 transition-all active:scale-95"
              >
                <div className="text-2xl font-bold">{profile.competencyStats.professional}</div>
                <div className="text-sm opacity-90 mt-1">Leadership</div>
              </button>
            </div>

            {/* Competency Tree */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Competencies</h3>
              <div className="space-y-1">
                {profile.competencyTree.map((category: any, idx: number) => (
                  <CompetencyNode
                    key={idx}
                    node={category}
                    path={category.name}
                    level={0}
                    expandedNodes={expandedNodes}
                    toggleNode={toggleNode}
                  />
                ))}
              </div>
            </div>

            {/* Surgical Competencies */}
            {profile.surgicalCompetencies && profile.surgicalCompetencies.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Surgical Competencies</h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {profile.surgicalCompetencies.reduce((total: number, spec: any) =>
                      total + spec.subcategories.reduce((subTotal: number, sub: any) =>
                        subTotal + sub.procedures.length, 0), 0)} procedures
                  </span>
                </div>
                <div className="space-y-3">
                  {profile.surgicalCompetencies.map((specialty: any, idx: number) => (
                    <div key={idx} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-50 to-teal-50 px-3 py-2 border-b border-gray-200">
                        <h4 className="font-medium text-gray-900 text-sm">{specialty.specialty}</h4>
                      </div>
                      <div className="p-3 space-y-3">
                        {specialty.subcategories.map((subcat: any, subIdx: number) => (
                          <div key={subIdx}>
                            <div className="text-xs font-medium text-gray-600 mb-2">{subcat.name}</div>
                            <div className="grid grid-cols-1 gap-2">
                              {subcat.procedures.map((proc: any, procIdx: number) => (
                                <div key={procIdx} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <div className="font-medium text-sm text-gray-900">{proc.name}</div>
                                      <div className="text-xs text-gray-500 mt-0.5">OPCS-4: {proc.opcs4.join(', ')}</div>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                      proc.level === 'expert' ? 'bg-green-100 text-green-700' :
                                      proc.level === 'advanced' ? 'bg-blue-100 text-blue-700' :
                                      'bg-gray-100 text-gray-700'
                                    }`}>
                                      {proc.level}
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                                    <div>
                                      <span className="text-gray-500">Exp:</span> {proc.yearsExperience}yr{proc.yearsExperience > 1 ? 's' : ''}
                                    </div>
                                    <div className="capitalize">
                                      <span className="text-gray-500">Freq:</span> {proc.frequency}
                                    </div>
                                    <div className="text-right">
                                      <span className="text-gray-500">Last:</span> {proc.lastPerformed}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Specialties - Theatre Areas */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Theatre Management Areas</h3>
              <div className="space-y-1">
                {profile.specialtyTree.map((specialty: any, idx: number) => (
                  <SpecialtyNode
                    key={idx}
                    node={specialty}
                    path={specialty.name}
                    level={0}
                    expandedNodes={expandedNodes}
                    toggleNode={toggleNode}
                    setSelectedProcedure={setSelectedProcedure}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'compliance' && (
          <div className="space-y-3 p-4">
            {/* Compliance Status */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-gray-900">100%</div>
                <div className="text-xs text-gray-500">Compliance</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                <Shield className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-gray-900">{profile.compliance.mandatoryTraining.length}</div>
                <div className="text-xs text-gray-500">Certifications</div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                <AlertCircle className="w-6 h-6 text-amber-600 mx-auto mb-1" />
                <div className="text-lg font-bold text-gray-900">2</div>
                <div className="text-xs text-gray-500">Expiring Soon</div>
              </div>
            </div>

            {/* Professional Registration */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Shield className="w-4 h-4 mr-2 text-blue-600" />
                Professional Registration
              </h3>
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">HCPC Registration</p>
                    <p className="text-xs text-gray-500">Number: {profile.compliance.hcpc.number}</p>
                    <p className="text-xs text-gray-500">Expires: {new Date(profile.compliance.hcpc.expiryDate).toLocaleDateString()}</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">DBS Check</p>
                    <p className="text-xs text-gray-500">Update Service: Active</p>
                    <p className="text-xs text-gray-500">Expires: {new Date(profile.compliance.dbs.expiryDate).toLocaleDateString()}</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>

            {/* Mandatory Training */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Mandatory Training</h3>
              <div className="space-y-2">
                {profile.compliance.mandatoryTraining.map((training, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{training.name}</p>
                      <p className="text-xs text-gray-500">Expires: {new Date(training.expiry).toLocaleDateString()}</p>
                    </div>
                    {training.status === 'valid' ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Immunisations */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Immunisations</h3>
              <div className="space-y-2">
                {profile.compliance.immunisations.map((imm, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm text-gray-900">{imm.name}</p>
                      <p className="text-xs text-gray-500">Last: {new Date(imm.lastDose).toLocaleDateString()}</p>
                    </div>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                ))}
              </div>
            </div>

            {/* Occupational Health */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Occupational Health</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Status: Fit for Work</p>
                    <p className="text-xs text-gray-500">Last assessment: {new Date(profile.compliance.occupationalHealth.lastAssessment).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500">Next due: {new Date(profile.compliance.occupationalHealth.nextDue).toLocaleDateString()}</p>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>

            {/* Indemnity Insurance */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Indemnity Insurance</h3>
              <div className="space-y-1">
                <p className="text-sm text-gray-900">Provider: {profile.compliance.indemnityInsurance.provider}</p>
                <p className="text-xs text-gray-500">Coverage: {profile.compliance.indemnityInsurance.coverage}</p>
                <p className="text-xs text-gray-500">Expires: {new Date(profile.compliance.indemnityInsurance.expiryDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Procedure/Area Detail Modal */}
      {selectedProcedure && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-teal-500 px-4 py-4 flex items-center justify-between">
              <h3 className="text-white font-bold text-lg">{selectedProcedure.name}</h3>
              <button
                onClick={() => setSelectedProcedure(null)}
                className="text-white hover:bg-white/20 rounded-full p-1"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Theatre Area</p>
                <p className="text-sm text-gray-900">{selectedProcedure.specialty}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Management Area</p>
                <p className="text-sm text-gray-600 leading-relaxed">{selectedProcedure.name}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Skill Category Detail Modal */}
      {selectedSkillCategory && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-teal-500 px-4 py-4 flex items-center justify-between">
              <h3 className="text-white font-bold text-lg">
                {selectedSkillCategory === 'mandatory' && 'Mandatory Training'}
                {selectedSkillCategory === 'clinical' && 'Theatre Operations Management'}
                {selectedSkillCategory === 'technical' && 'Quality & Safety'}
                {selectedSkillCategory === 'professional' && 'Leadership & Strategic Skills'}
              </h3>
              <button
                onClick={() => setSelectedSkillCategory(null)}
                className="text-white hover:bg-white/20 rounded-full p-1"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4">
                {selectedSkillCategory === 'mandatory' && 'All statutory and mandatory training requirements completed and up to date.'}
                {selectedSkillCategory === 'clinical' && 'Comprehensive theatre operations management skills including list management, staff management, and resource management.'}
                {selectedSkillCategory === 'technical' && 'Quality improvement, clinical governance, patient safety, and regulatory compliance expertise.'}
                {selectedSkillCategory === 'professional' && 'Strategic leadership skills essential for senior healthcare management roles.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-teal-500 px-4 py-4 flex items-center justify-between">
              <h3 className="text-white font-bold text-lg">{selectedJob.position}</h3>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-white hover:bg-white/20 rounded-full p-1"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Organization</p>
                <p className="text-sm font-semibold text-gray-900">{selectedJob.employer}</p>
                <p className="text-sm text-gray-600">{selectedJob.hospital}</p>
                <p className="text-xs text-gray-500 mt-1">{selectedJob.department}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Duration</p>
                <p className="text-sm text-gray-900">
                  {new Date(selectedJob.startDate).toLocaleDateString()} - {selectedJob.endDate ? new Date(selectedJob.endDate).toLocaleDateString() : 'Present'}
                </p>
                <p className="text-xs text-gray-500 mt-1">{selectedJob.band} • {selectedJob.type}</p>
              </div>
              {selectedJob.specialties && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Specialties</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJob.specialties.map((spec: string, idx: number) => (
                      <span key={idx} className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {selectedJob.responsibilities && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Responsibilities</p>
                  <ul className="space-y-1.5">
                    {selectedJob.responsibilities.map((resp: string, idx: number) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {selectedJob.verified && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900">Verified Employment</p>
                      <p className="text-xs text-blue-700 mt-1">
                        Verified by {selectedJob.verifiedBy} ({selectedJob.verifiedByRole}) on {new Date(selectedJob.verifiedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Education Detail Modal */}
      {selectedEducation && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-teal-500 px-4 py-4 flex items-center justify-between">
              <h3 className="text-white font-bold text-lg">{selectedEducation.degree}</h3>
              <button
                onClick={() => setSelectedEducation(null)}
                className="text-white hover:bg-white/20 rounded-full p-1"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Institution</p>
                <p className="text-sm font-semibold text-gray-900">{selectedEducation.institution}</p>
                <p className="text-xs text-gray-500 mt-1">{selectedEducation.field}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Duration</p>
                <p className="text-sm text-gray-900">
                  {new Date(selectedEducation.startDate).toLocaleDateString()} - {new Date(selectedEducation.endDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Grade</p>
                <p className="text-sm font-semibold text-gray-900">{selectedEducation.grade}</p>
              </div>
              {selectedEducation.description && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Description</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedEducation.description}</p>
                </div>
              )}
              {selectedEducation.verified && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-green-900">Verified Qualification</p>
                      <p className="text-xs text-green-700 mt-1">
                        Certificate #: {selectedEducation.certificateNumber}
                      </p>
                      {selectedEducation.verificationLink && (
                        <a
                          href={selectedEducation.verificationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 font-medium mt-2 inline-flex items-center hover:underline"
                        >
                          Verify at institution →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Certification Detail Modal */}
      {selectedCertification && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-teal-500 px-4 py-4 flex items-center justify-between">
              <h3 className="text-white font-bold text-lg">{selectedCertification.name}</h3>
              <button
                onClick={() => setSelectedCertification(null)}
                className="text-white hover:bg-white/20 rounded-full p-1"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Issuing Organization</p>
                <p className="text-sm font-semibold text-gray-900">{selectedCertification.issuer}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Credential ID</p>
                <p className="text-sm text-gray-900 font-mono">{selectedCertification.number}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Issue Date</p>
                <p className="text-sm text-gray-900">{new Date(selectedCertification.issueDate).toLocaleDateString()}</p>
              </div>
              {selectedCertification.expiryDate && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Expiry Date</p>
                  <p className="text-sm text-gray-900">{new Date(selectedCertification.expiryDate).toLocaleDateString()}</p>
                </div>
              )}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-green-900">Active Certification</p>
                    <p className="text-xs text-green-700 mt-1">This certification is currently active and verified.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Award Detail Modal */}
      {selectedAward && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-teal-500 px-4 py-4 flex items-center justify-between">
              <h3 className="text-white font-bold text-lg">{selectedAward.title}</h3>
              <button
                onClick={() => setSelectedAward(null)}
                className="text-white hover:bg-white/20 rounded-full p-1"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Awarded By</p>
                <p className="text-sm font-semibold text-gray-900">{selectedAward.issuer}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Date</p>
                <p className="text-sm text-gray-900">{new Date(selectedAward.date).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Description</p>
                <p className="text-sm text-gray-600 leading-relaxed">{selectedAward.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Volunteer Detail Modal */}
      {selectedVolunteer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-teal-500 px-4 py-4 flex items-center justify-between">
              <h3 className="text-white font-bold text-lg">{selectedVolunteer.role}</h3>
              <button
                onClick={() => setSelectedVolunteer(null)}
                className="text-white hover:bg-white/20 rounded-full p-1"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Organization</p>
                <p className="text-sm font-semibold text-gray-900">{selectedVolunteer.organization}</p>
                <p className="text-xs text-gray-500 mt-1">{selectedVolunteer.location}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Duration</p>
                <p className="text-sm text-gray-900">
                  {new Date(selectedVolunteer.startDate).toLocaleDateString()} - {selectedVolunteer.endDate ? new Date(selectedVolunteer.endDate).toLocaleDateString() : 'Ongoing'}
                </p>
              </div>
              {selectedVolunteer.description && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">About</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedVolunteer.description}</p>
                </div>
              )}
              {selectedVolunteer.activities && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Activities</p>
                  <ul className="space-y-1.5">
                    {selectedVolunteer.activities.map((activity: string, idx: number) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start">
                        <span className="text-red-500 mr-2">•</span>
                        <span>{activity}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-teal-500 px-4 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-white font-bold text-lg">Contact {profile.firstName}</h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-white hover:bg-white/20 rounded-full p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-700 mb-2">
                  <strong>Registration ID:</strong> {profile.id}
                </p>
                <p className="text-xs text-blue-600">
                  Use this ID when referencing this staff member in communications.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 text-sm">Contact Methods</h4>

                <a
                  href={`mailto:${profile.contactDetails.email}`}
                  className="flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <p className="text-xs text-gray-600">{profile.contactDetails.email}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </a>

                <a
                  href={`tel:${profile.contactDetails.phone}`}
                  className="flex items-center space-x-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Phone</p>
                    <p className="text-xs text-gray-600">{profile.contactDetails.phone}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </a>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-xs text-amber-800">
                  <strong>Preferred contact:</strong> {profile.contactDetails.preferredContact === 'email' ? 'Email' : 'Phone'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Competency Node Component
interface CompetencyNodeProps {
  node: any;
  path: string;
  level: number;
  expandedNodes: Set<string>;
  toggleNode: (path: string) => void;
}

function CompetencyNode({ node, path, level, expandedNodes, toggleNode }: CompetencyNodeProps) {
  const isExpanded = expandedNodes.has(path);
  const hasChildren = node.subcategories && node.subcategories.length > 0;
  const hasItems = node.items && node.items.length > 0;
  const isTerminal = hasItems;

  const bgClass = level === 0 ? 'bg-gray-50' : level === 1 ? 'bg-white' : 'bg-gray-50';

  return (
    <div>
      <button
        onClick={() => toggleNode(path)}
        className={`w-full px-3 py-2 rounded flex items-center justify-between text-left ${bgClass} hover:bg-gray-100 transition-colors`}
      >
        <div className="flex items-center space-x-2">
          <ChevronDown
            className={`w-4 h-4 text-gray-500 transition-transform ${
              isExpanded ? '' : '-rotate-90'
            }`}
          />
          <span className={`${level === 0 ? 'font-semibold text-gray-900' : 'text-sm text-gray-700'}`}>
            {node.name}
          </span>
        </div>
        {hasItems && (
          <span className="text-xs text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full">
            {node.items.length}
          </span>
        )}
      </button>
      {isExpanded && hasChildren && (
        <div className="ml-4 mt-1 space-y-1">
          {node.subcategories.map((child: any, idx: number) => (
            <CompetencyNode
              key={idx}
              node={child}
              path={`${path}.${child.name}`}
              level={level + 1}
              expandedNodes={expandedNodes}
              toggleNode={toggleNode}
            />
          ))}
        </div>
      )}
      {isExpanded && hasItems && (
        <div className="ml-4 mt-1 space-y-1">
          {node.items.map((item: any, idx: number) => (
            <div key={idx} className="px-3 py-2 bg-white border border-gray-200 rounded text-sm">
              <div className="flex items-start justify-between">
                <span className="text-gray-900">{item.name}</span>
                {item.level && (
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    item.level === 'expert' ? 'bg-blue-100 text-blue-700' :
                    item.level === 'certified' ? 'bg-green-100 text-green-700' :
                    item.level === 'advanced' ? 'bg-teal-100 text-teal-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {item.level}
                  </span>
                )}
              </div>
              {item.expiry && (
                <p className="text-xs text-gray-500 mt-1">Expires: {new Date(item.expiry).toLocaleDateString()}</p>
              )}
              {item.description && (
                <p className="text-xs text-gray-600 mt-1">{item.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Specialty Node Component
interface SpecialtyNodeProps {
  node: any;
  path: string;
  level: number;
  expandedNodes: Set<string>;
  toggleNode: (path: string) => void;
  setSelectedProcedure: (proc: any) => void;
}

function SpecialtyNode({ node, path, level, expandedNodes, toggleNode, setSelectedProcedure }: SpecialtyNodeProps) {
  const isExpanded = expandedNodes.has(path);
  const hasSubcategories = node.subcategories && node.subcategories.length > 0;
  const hasProcedures = node.procedures && node.procedures.length > 0;

  const bgClass = level === 0 ? 'bg-gray-50' : level === 1 ? 'bg-white' : 'bg-gray-50';

  return (
    <div>
      <button
        onClick={() => toggleNode(path)}
        className={`w-full px-3 py-2 rounded flex items-center justify-between text-left ${bgClass} hover:bg-gray-100 transition-colors`}
      >
        <div className="flex items-center space-x-2">
          <ChevronDown
            className={`w-4 h-4 text-gray-500 transition-transform ${
              isExpanded ? '' : '-rotate-90'
            }`}
          />
          <span className={`${level === 0 ? 'font-semibold text-gray-900' : 'text-sm text-gray-700'}`}>
            {node.name}
          </span>
        </div>
      </button>
      {isExpanded && hasSubcategories && (
        <div className="ml-4 mt-1 space-y-1">
          {node.subcategories.map((child: any, idx: number) => (
            <SpecialtyNode
              key={idx}
              node={child}
              path={`${path}.${child.name}`}
              level={level + 1}
              expandedNodes={expandedNodes}
              toggleNode={toggleNode}
              setSelectedProcedure={setSelectedProcedure}
            />
          ))}
        </div>
      )}
      {isExpanded && hasProcedures && (
        <div className="ml-4 mt-1 flex flex-wrap gap-1.5">
          {node.procedures.map((proc: string, idx: number) => (
            <button
              key={idx}
              onClick={() => setSelectedProcedure({ name: proc, specialty: path })}
              className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded hover:bg-blue-100 transition-colors"
            >
              {proc}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
