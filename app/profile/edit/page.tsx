'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, X, User, Award, Shield, Trash2, Eye, EyeOff } from 'lucide-react';
import {
  NHS_TRUSTS,
  POSTCODE_AREAS,
  TRAVEL_DISTANCES,
  LANGUAGES,
  PROFICIENCY_LEVELS,
  INTEREST_CATEGORIES,
  THEATRE_DEPARTMENTS,
  PROFESSIONAL_QUALIFICATIONS,
  THEATRE_ROLES,
  SURGICAL_SPECIALTIES,
  MANAGEMENT_COMPETENCIES,
  QUALIFICATION_TYPES,
  PROFESSIONAL_BODIES,
  COMPETENCY_RATINGS,
  SURGICAL_SPECIALTIES_DETAILED,
  ANAESTHETIC_COMPETENCIES,
  RECOVERY_COMPETENCIES,
  CELL_SALVAGE_COMPETENCIES,
  HCA_COMPETENCIES
} from '@/lib/profileData';
import CompetencyManagement from '@/components/CompetencyManagement';

export default function ProfileEditPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'skills' | 'compliance'>('overview');

  // Basic Profile Data
  const [profileData, setProfileData] = useState({
    firstName: 'Alexander',
    lastName: 'Monterubio',
    department: 'Main Theatres',
    professionalQualification: 'Registered Nurse (RN)',
    roles: ['Theatre Manager', 'Scrub N/P'], // Changed to array for multiple roles
    band: 'Band 8a',
    email: 'alexander.monterubio@nhs.net',
    phone: '+44 7700 900456',
    preferredContact: 'email',
    currentTrust: 'Barts Health NHS Trust',
    currentHospital: 'Royal London Hospital',
    postcode: 'E1',
    area: 'Whitechapel, East London',
    willingToTravel: '15',
    professionalSummary: 'Experienced Theatre Manager with 12 years in NHS theatre operations.'
  });

  // Employment History
  const [employmentHistory, setEmploymentHistory] = useState([
    {
      employer: 'Barts Health NHS Trust',
      hospital: 'Royal London Hospital',
      department: 'Theatres & Anaesthetics',
      position: 'Theatre Manager',
      band: 'Band 8a',
      startDate: '2019-04',
      endDate: '',
      current: true
    }
  ]);

  // Education
  const [education, setEducation] = useState([
    {
      institution: 'Imperial College Business School',
      degree: 'MSc Healthcare Leadership',
      field: 'Healthcare Management',
      qualificationType: "Master's Degree",
      grade: 'Distinction',
      startDate: '2020-09',
      endDate: '2022-09',
      verificationBody: 'Other',
      verificationLink: ''
    }
  ]);

  // Certifications
  const [certifications, setCertifications] = useState([
    {
      name: 'HCPC Registration (ODP)',
      issuer: 'Health & Care Professions Council (HCPC)',
      number: 'ODP12345',
      issueDate: '2013-07',
      expiryDate: '2027-07'
    }
  ]);

  // Awards
  const [awards, setAwards] = useState([
    {
      title: 'NHS Operational Manager of the Year',
      issuer: 'Health Service Journal Awards',
      date: '2024-11',
      description: 'National recognition for outstanding contribution to NHS operational excellence',
      verifiedBy: '',
      verifiedByRole: ''
    }
  ]);

  // Volunteer Experience
  const [volunteerWork, setVolunteerWork] = useState([
    {
      organization: 'NHS Sustainability Network',
      role: 'Theatre Green Lead',
      startDate: '2022-01',
      endDate: '',
      current: true,
      description: 'Leading theatre sustainability initiatives'
    }
  ]);

  // Languages
  const [selectedLanguages, setSelectedLanguages] = useState([
    { language: 'English', proficiency: 'Native' },
    { language: 'Spanish', proficiency: 'Fluent' }
  ]);

  // Interests (tags)
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Healthcare leadership',
    'Theatre efficiency',
    'Data analytics',
    'Staff wellbeing'
  ]);

  // Skills/Competencies based on role
  const [selectedCompetencies, setSelectedCompetencies] = useState<any>({});

  // Skills tab state
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({});
  const [skillRatings, setSkillRatings] = useState<{[key: string]: number}>({});

  // Compliance filter state
  const [complianceFilter, setComplianceFilter] = useState<'all' | 'compliant' | 'expiring' | 'expired'>('all');

  // Privacy settings - control visibility of profile sections
  const [privacySettings, setPrivacySettings] = useState({
    employmentHistory: true,
    education: true,
    certifications: true,
    awards: true,
    volunteerWork: true,
    languages: true,
    interests: true
  });

  // Auto-populate area from postcode
  useEffect(() => {
    const postcodePrefix = profileData.postcode.split(' ')[0].toUpperCase();
    if (POSTCODE_AREAS[postcodePrefix]) {
      setProfileData(prev => ({
        ...prev,
        area: POSTCODE_AREAS[postcodePrefix]
      }));
    }
  }, [profileData.postcode]);

  // Auto-calculate years of experience
  useEffect(() => {
    if (employmentHistory.length > 0) {
      const totalMonths = employmentHistory.reduce((total, job) => {
        const start = new Date(job.startDate + '-01');
        const end = job.endDate ? new Date(job.endDate + '-01') : new Date();
        const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
        return total + months;
      }, 0);
      const years = Math.floor(totalMonths / 12);
      // This would update a calculated field
    }
  }, [employmentHistory]);

  const handleSave = () => {
    const fullProfile = {
      ...profileData,
      employmentHistory,
      education,
      certifications,
      awards,
      volunteerWork,
      languages: selectedLanguages,
      interests: selectedInterests,
      competencies: selectedCompetencies
    };
    localStorage.setItem('profileData', JSON.stringify(fullProfile));
    alert('Profile updated successfully!');
    router.push('/profile');
  };

  const addEmployment = () => {
    setEmploymentHistory([...employmentHistory, {
      employer: '',
      hospital: '',
      department: '',
      position: '',
      band: '',
      startDate: '',
      endDate: '',
      current: false
    }]);
  };

  const removeEmployment = (index: number) => {
    setEmploymentHistory(employmentHistory.filter((_, i) => i !== index));
  };

  const addEducation = () => {
    setEducation([...education, {
      institution: '',
      degree: '',
      field: '',
      qualificationType: '',
      grade: '',
      startDate: '',
      endDate: '',
      verificationBody: '',
      verificationLink: ''
    }]);
  };

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const addCertification = () => {
    setCertifications([...certifications, {
      name: '',
      issuer: '',
      number: '',
      issueDate: '',
      expiryDate: ''
    }]);
  };

  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const addAward = () => {
    setAwards([...awards, {
      title: '',
      issuer: '',
      date: '',
      description: '',
      verifiedBy: '',
      verifiedByRole: ''
    }]);
  };

  const removeAward = (index: number) => {
    setAwards(awards.filter((_, i) => i !== index));
  };

  const addVolunteer = () => {
    setVolunteerWork([...volunteerWork, {
      organization: '',
      role: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    }]);
  };

  const removeVolunteer = (index: number) => {
    setVolunteerWork(volunteerWork.filter((_, i) => i !== index));
  };

  const addLanguage = () => {
    setSelectedLanguages([...selectedLanguages, { language: '', proficiency: '' }]);
  };

  const removeLanguage = (index: number) => {
    setSelectedLanguages(selectedLanguages.filter((_, i) => i !== index));
  };

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  // Skills tab helper functions
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const updateSkillRating = (skillId: string, rating: number) => {
    setSkillRatings(prev => ({
      ...prev,
      [skillId]: rating
    }));
  };

  const getRatingColor = (rating: number) => {
    // Return static Tailwind class names for JIT compilation
    if (rating === 0) return 'gray';
    if (rating === 1) return 'red';
    if (rating === 2) return 'orange';
    if (rating === 3) return 'yellow';
    if (rating === 4) return 'blue';
    if (rating === 5) return 'green';
    return 'gray';
  };

  const getRatingButtonClass = (currentRating: number, buttonValue: number) => {
    if (currentRating === buttonValue) {
      // Active state - use static classes
      if (buttonValue === 0) return 'bg-gray-500 text-white scale-110';
      if (buttonValue === 1) return 'bg-red-500 text-white scale-110';
      if (buttonValue === 2) return 'bg-orange-500 text-white scale-110';
      if (buttonValue === 3) return 'bg-yellow-500 text-white scale-110';
      if (buttonValue === 4) return 'bg-blue-500 text-white scale-110';
      if (buttonValue === 5) return 'bg-green-500 text-white scale-110';
    }
    return 'bg-gray-100 text-gray-400 hover:bg-gray-200';
  };

  const getRatingLabel = (rating: number) => {
    const ratingConfig = COMPETENCY_RATINGS.find(r => r.value === rating);
    return ratingConfig ? ratingConfig.label : 'Not rated';
  };

  return (
    <div className="min-h-screen overflow-x-hidden" style={{backgroundColor: '#F0F9FF'}}>
      <div className="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6 overflow-x-hidden">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 mb-3 sm:mb-4 hover:opacity-80"
            style={{color: '#06B6D4'}}
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Back to Profile</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Edit Profile</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Update your professional information</p>
        </div>

        {/* Save Button - Fixed at top */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={handleSave}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-white rounded-lg hover:shadow-lg transition-all text-sm sm:text-base"
            style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}
          >
            <Save className="w-4 h-4 sm:w-5 sm:h-5" />
            Save All Changes
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200 rounded-t-lg">
          <div className="flex">
            {[
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'skills', label: 'Skills', icon: Award },
              { id: 'compliance', label: 'Compliance', icon: Shield },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 py-3 sm:py-4 px-2 sm:px-4 text-xs sm:text-sm font-medium transition-all flex items-center justify-center space-x-1 sm:space-x-2 border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-teal-600 text-teal-600 bg-teal-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-b-lg shadow-sm border border-gray-200 border-t-0 p-3 sm:p-4 md:p-6">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6 sm:space-y-8">
              {/* Personal Details */}
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Personal Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">First Name *</label>
                    <input
                      type="text"
                      required
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Last Name *</label>
                    <input
                      type="text"
                      required
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Department *</label>
                    <select
                      value={profileData.department}
                      onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="">Select Department</option>
                      {THEATRE_DEPARTMENTS.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Professional Qualification *</label>
                    <select
                      value={profileData.professionalQualification}
                      onChange={(e) => setProfileData({ ...profileData, professionalQualification: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="">Select Qualification</option>
                      {PROFESSIONAL_QUALIFICATIONS.map(qual => (
                        <option key={qual} value={qual}>{qual}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Role(s) *</label>
                    <p className="text-xs text-gray-500 mb-2 break-words">
                      Select all roles that apply. Skills will be updated based on your selections.
                      <br />
                      <span className="font-medium text-amber-600 break-words">Note: Healthcare Assistant (HCA) cannot be combined with other roles and must be selected alone.</span>
                    </p>
                    <div className="space-y-2 p-3 border border-gray-300 rounded-lg bg-gray-50 max-h-60 overflow-y-auto">
                      {Object.keys(THEATRE_ROLES).map(role => {
                        const isHCA = role === 'Healthcare Assistant (HCA)';
                        const hasHCA = profileData.roles.includes('Healthcare Assistant (HCA)');
                        const hasOtherRoles = profileData.roles.some(r => r !== 'Healthcare Assistant (HCA)');

                        // Disable HCA if other roles are selected
                        // Disable other roles if HCA is selected
                        const isDisabled = (isHCA && hasOtherRoles) || (!isHCA && hasHCA);

                        return (
                          <label
                            key={role}
                            className={`flex items-start space-x-2 p-2 rounded transition-colors ${
                              isDisabled
                                ? 'cursor-not-allowed opacity-50'
                                : 'cursor-pointer hover:bg-white'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={profileData.roles.includes(role)}
                              disabled={isDisabled}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  // If selecting HCA, clear all other roles
                                  if (isHCA) {
                                    setProfileData({ ...profileData, roles: [role] });
                                  } else {
                                    setProfileData({ ...profileData, roles: [...profileData.roles, role] });
                                  }
                                } else {
                                  setProfileData({ ...profileData, roles: profileData.roles.filter(r => r !== role) });
                                }
                              }}
                              className="mt-0.5 w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 disabled:cursor-not-allowed"
                            />
                            <span className="text-xs sm:text-sm text-gray-700">{role}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Band *</label>
                    <select
                      value={profileData.band}
                      onChange={(e) => setProfileData({ ...profileData, band: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="">Select Band</option>
                      {['Band 2', 'Band 3', 'Band 4', 'Band 5', 'Band 6', 'Band 7', 'Band 8a', 'Band 8b', 'Band 8c', 'Band 8d', 'Band 9'].map(band => (
                        <option key={band} value={band}>{band}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Details */}
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Contact Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Email *</label>
                    <input
                      type="email"
                      required
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Phone</label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Preferred Contact</label>
                    <select
                      value={profileData.preferredContact}
                      onChange={(e) => setProfileData({ ...profileData, preferredContact: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Location & Availability */}
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Location & Availability</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Current Trust</label>
                    <select
                      value={profileData.currentTrust}
                      onChange={(e) => setProfileData({ ...profileData, currentTrust: e.target.value, currentHospital: '' })}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="">Select Trust</option>
                      {Object.keys(NHS_TRUSTS).map(trust => (
                        <option key={trust} value={trust}>{trust}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Current Hospital</label>
                    <select
                      value={profileData.currentHospital}
                      onChange={(e) => setProfileData({ ...profileData, currentHospital: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      disabled={!profileData.currentTrust}
                    >
                      <option value="">Select Hospital</option>
                      {profileData.currentTrust && NHS_TRUSTS[profileData.currentTrust]?.map(hospital => (
                        <option key={hospital} value={hospital}>{hospital}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Postcode (e.g. E1, SW1)</label>
                    <input
                      type="text"
                      value={profileData.postcode}
                      onChange={(e) => setProfileData({ ...profileData, postcode: e.target.value.toUpperCase() })}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="E1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Area (auto-populated)</label>
                    <input
                      type="text"
                      value={profileData.area}
                      readOnly
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Willing to Travel</label>
                    <select
                      value={profileData.willingToTravel}
                      onChange={(e) => setProfileData({ ...profileData, willingToTravel: e.target.value })}
                      className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      {TRAVEL_DISTANCES.map(distance => (
                        <option key={distance.value} value={distance.value}>{distance.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Professional Summary */}
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Professional Summary</h2>
                <textarea
                  value={profileData.professionalSummary}
                  onChange={(e) => setProfileData({ ...profileData, professionalSummary: e.target.value })}
                  rows={4}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Brief overview of your professional background and expertise..."
                />
              </div>

              {/* Employment History */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Employment History</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPrivacySettings(prev => ({ ...prev, employmentHistory: !prev.employmentHistory }))}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm ${
                        privacySettings.employmentHistory
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={privacySettings.employmentHistory ? 'Visible to public' : 'Hidden from public'}
                    >
                      {privacySettings.employmentHistory ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      <span className="hidden sm:inline">{privacySettings.employmentHistory ? 'Public' : 'Private'}</span>
                    </button>
                    <button
                      onClick={addEmployment}
                      className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:shadow-lg transition-all text-sm"
                      style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}
                    >
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline">Add Employment</span>
                      <span className="sm:hidden">Add</span>
                    </button>
                  </div>
                </div>
                <div className="space-y-6">
                  {employmentHistory.map((job, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
                      <button
                        onClick={() => removeEmployment(index)}
                        className="absolute top-4 right-4 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-10">
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Trust/Employer</label>
                          <select
                            value={job.employer}
                            onChange={(e) => {
                              const newHistory = [...employmentHistory];
                              newHistory[index].employer = e.target.value;
                              newHistory[index].hospital = '';
                              setEmploymentHistory(newHistory);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          >
                            <option value="">Select Trust</option>
                            {Object.keys(NHS_TRUSTS).map(trust => (
                              <option key={trust} value={trust}>{trust}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Hospital</label>
                          <select
                            value={job.hospital}
                            onChange={(e) => {
                              const newHistory = [...employmentHistory];
                              newHistory[index].hospital = e.target.value;
                              setEmploymentHistory(newHistory);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            disabled={!job.employer}
                          >
                            <option value="">Select Hospital</option>
                            {job.employer && NHS_TRUSTS[job.employer]?.map(hospital => (
                              <option key={hospital} value={hospital}>{hospital}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Department</label>
                          <select
                            value={job.department}
                            onChange={(e) => {
                              const newHistory = [...employmentHistory];
                              newHistory[index].department = e.target.value;
                              setEmploymentHistory(newHistory);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          >
                            <option value="">Select Department</option>
                            {THEATRE_DEPARTMENTS.map(dept => (
                              <option key={dept} value={dept}>{dept}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Position</label>
                          <select
                            value={job.position}
                            onChange={(e) => {
                              const newHistory = [...employmentHistory];
                              newHistory[index].position = e.target.value;
                              setEmploymentHistory(newHistory);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          >
                            <option value="">Select Role</option>
                            {Object.keys(THEATRE_ROLES).map(role => (
                              <option key={role} value={role}>{role}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Band</label>
                          <select
                            value={job.band}
                            onChange={(e) => {
                              const newHistory = [...employmentHistory];
                              newHistory[index].band = e.target.value;
                              setEmploymentHistory(newHistory);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          >
                            <option value="">Select Band</option>
                            {['Band 2', 'Band 3', 'Band 4', 'Band 5', 'Band 6', 'Band 7', 'Band 8a', 'Band 8b', 'Band 8c', 'Band 8d', 'Band 9'].map(band => (
                              <option key={band} value={band}>{band}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Start Date (YYYY-MM)</label>
                          <input
                            type="month"
                            value={job.startDate}
                            onChange={(e) => {
                              const newHistory = [...employmentHistory];
                              newHistory[index].startDate = e.target.value;
                              setEmploymentHistory(newHistory);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">End Date (leave blank if current)</label>
                          <input
                            type="month"
                            value={job.endDate}
                            onChange={(e) => {
                              const newHistory = [...employmentHistory];
                              newHistory[index].endDate = e.target.value;
                              newHistory[index].current = !e.target.value;
                              setEmploymentHistory(newHistory);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            disabled={job.current}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={job.current}
                              onChange={(e) => {
                                const newHistory = [...employmentHistory];
                                newHistory[index].current = e.target.checked;
                                if (e.target.checked) newHistory[index].endDate = '';
                                setEmploymentHistory(newHistory);
                              }}
                              className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Current Position</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">Years of experience will be automatically calculated from employment history.</p>
              </div>

              {/* Education */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Education & Qualifications</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPrivacySettings(prev => ({ ...prev, education: !prev.education }))}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm ${
                        privacySettings.education
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={privacySettings.education ? 'Visible to public' : 'Hidden from public'}
                    >
                      {privacySettings.education ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      <span className="hidden sm:inline">{privacySettings.education ? 'Public' : 'Private'}</span>
                    </button>
                    <button
                      onClick={addEducation}
                      className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:shadow-lg transition-all text-sm"
                      style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}
                    >
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline">Add Education</span>
                      <span className="sm:hidden">Add</span>
                    </button>
                  </div>
                </div>
                <div className="space-y-6">
                  {education.map((edu, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
                      <button
                        onClick={() => removeEducation(index)}
                        className="absolute top-4 right-4 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-10">
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Institution</label>
                          <input
                            type="text"
                            value={edu.institution}
                            onChange={(e) => {
                              const newEdu = [...education];
                              newEdu[index].institution = e.target.value;
                              setEducation(newEdu);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Qualification Type</label>
                          <select
                            value={edu.qualificationType}
                            onChange={(e) => {
                              const newEdu = [...education];
                              newEdu[index].qualificationType = e.target.value;
                              setEducation(newEdu);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          >
                            <option value="">Select Type</option>
                            {QUALIFICATION_TYPES.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Degree/Certificate Name</label>
                          <input
                            type="text"
                            value={edu.degree}
                            onChange={(e) => {
                              const newEdu = [...education];
                              newEdu[index].degree = e.target.value;
                              setEducation(newEdu);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Field of Study</label>
                          <input
                            type="text"
                            value={edu.field}
                            onChange={(e) => {
                              const newEdu = [...education];
                              newEdu[index].field = e.target.value;
                              setEducation(newEdu);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Grade</label>
                          <input
                            type="text"
                            value={edu.grade}
                            onChange={(e) => {
                              const newEdu = [...education];
                              newEdu[index].grade = e.target.value;
                              setEducation(newEdu);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            placeholder="e.g. Distinction, First Class"
                          />
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Start Date (YYYY-MM)</label>
                          <input
                            type="month"
                            value={edu.startDate}
                            onChange={(e) => {
                              const newEdu = [...education];
                              newEdu[index].startDate = e.target.value;
                              setEducation(newEdu);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">End Date (YYYY-MM)</label>
                          <input
                            type="month"
                            value={edu.endDate}
                            onChange={(e) => {
                              const newEdu = [...education];
                              newEdu[index].endDate = e.target.value;
                              setEducation(newEdu);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Awarding/Verification Body</label>
                          <select
                            value={edu.verificationBody}
                            onChange={(e) => {
                              const newEdu = [...education];
                              newEdu[index].verificationBody = e.target.value;
                              setEducation(newEdu);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          >
                            <option value="">Select Body</option>
                            {PROFESSIONAL_BODIES.map(body => (
                              <option key={body} value={body}>{body}</option>
                            ))}
                          </select>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Verification Link (optional)</label>
                          <input
                            type="url"
                            value={edu.verificationLink}
                            onChange={(e) => {
                              const newEdu = [...education];
                              newEdu[index].verificationLink = e.target.value;
                              setEducation(newEdu);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Professional Certifications</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPrivacySettings(prev => ({ ...prev, certifications: !prev.certifications }))}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm ${
                        privacySettings.certifications
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={privacySettings.certifications ? 'Visible to public' : 'Hidden from public'}
                    >
                      {privacySettings.certifications ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      <span className="hidden sm:inline">{privacySettings.certifications ? 'Public' : 'Private'}</span>
                    </button>
                    <button
                      onClick={addCertification}
                      className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:shadow-lg transition-all text-sm"
                      style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}
                    >
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline">Add Certification</span>
                      <span className="sm:hidden">Add</span>
                    </button>
                  </div>
                </div>
                <div className="space-y-6">
                  {certifications.map((cert, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
                      <button
                        onClick={() => removeCertification(index)}
                        className="absolute top-4 right-4 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-10">
                        <div className="md:col-span-2">
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Certification Name</label>
                          <input
                            type="text"
                            value={cert.name}
                            onChange={(e) => {
                              const newCerts = [...certifications];
                              newCerts[index].name = e.target.value;
                              setCertifications(newCerts);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Issuing Body</label>
                          <select
                            value={cert.issuer}
                            onChange={(e) => {
                              const newCerts = [...certifications];
                              newCerts[index].issuer = e.target.value;
                              setCertifications(newCerts);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          >
                            <option value="">Select Body</option>
                            {PROFESSIONAL_BODIES.map(body => (
                              <option key={body} value={body}>{body}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Certificate Number</label>
                          <input
                            type="text"
                            value={cert.number}
                            onChange={(e) => {
                              const newCerts = [...certifications];
                              newCerts[index].number = e.target.value;
                              setCertifications(newCerts);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Issue Date (YYYY-MM)</label>
                          <input
                            type="month"
                            value={cert.issueDate}
                            onChange={(e) => {
                              const newCerts = [...certifications];
                              newCerts[index].issueDate = e.target.value;
                              setCertifications(newCerts);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Expiry Date (YYYY-MM)</label>
                          <input
                            type="month"
                            value={cert.expiryDate}
                            onChange={(e) => {
                              const newCerts = [...certifications];
                              newCerts[index].expiryDate = e.target.value;
                              setCertifications(newCerts);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Awards */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Awards & Honors</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPrivacySettings(prev => ({ ...prev, awards: !prev.awards }))}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm ${
                        privacySettings.awards
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={privacySettings.awards ? 'Visible to public' : 'Hidden from public'}
                    >
                      {privacySettings.awards ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      <span className="hidden sm:inline">{privacySettings.awards ? 'Public' : 'Private'}</span>
                    </button>
                    <button
                      onClick={addAward}
                      className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:shadow-lg transition-all text-sm"
                      style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}
                    >
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline">Add Award</span>
                      <span className="sm:hidden">Add</span>
                    </button>
                  </div>
                </div>
                <div className="space-y-6">
                  {awards.map((award, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
                      <button
                        onClick={() => removeAward(index)}
                        className="absolute top-4 right-4 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-10">
                        <div className="md:col-span-2">
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Award Title</label>
                          <input
                            type="text"
                            value={award.title}
                            onChange={(e) => {
                              const newAwards = [...awards];
                              newAwards[index].title = e.target.value;
                              setAwards(newAwards);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Awarding Body</label>
                          <input
                            type="text"
                            value={award.issuer}
                            onChange={(e) => {
                              const newAwards = [...awards];
                              newAwards[index].issuer = e.target.value;
                              setAwards(newAwards);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Date (YYYY-MM)</label>
                          <input
                            type="month"
                            value={award.date}
                            onChange={(e) => {
                              const newAwards = [...awards];
                              newAwards[index].date = e.target.value;
                              setAwards(newAwards);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Description</label>
                          <textarea
                            value={award.description}
                            onChange={(e) => {
                              const newAwards = [...awards];
                              newAwards[index].description = e.target.value;
                              setAwards(newAwards);
                            }}
                            rows={2}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Verified By (Name)</label>
                          <input
                            type="text"
                            value={award.verifiedBy}
                            onChange={(e) => {
                              const newAwards = [...awards];
                              newAwards[index].verifiedBy = e.target.value;
                              setAwards(newAwards);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            placeholder="e.g. Dr. Sarah Williams"
                          />
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Verifier Role</label>
                          <input
                            type="text"
                            value={award.verifiedByRole}
                            onChange={(e) => {
                              const newAwards = [...awards];
                              newAwards[index].verifiedByRole = e.target.value;
                              setAwards(newAwards);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            placeholder="e.g. Clinical Director"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Volunteer Experience */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Volunteer Experience</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPrivacySettings(prev => ({ ...prev, volunteerWork: !prev.volunteerWork }))}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm ${
                        privacySettings.volunteerWork
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={privacySettings.volunteerWork ? 'Visible to public' : 'Hidden from public'}
                    >
                      {privacySettings.volunteerWork ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      <span className="hidden sm:inline">{privacySettings.volunteerWork ? 'Public' : 'Private'}</span>
                    </button>
                    <button
                      onClick={addVolunteer}
                      className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:shadow-lg transition-all text-sm"
                      style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}
                    >
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline">Add Volunteer Work</span>
                      <span className="sm:hidden">Add</span>
                    </button>
                  </div>
                </div>
                <div className="space-y-6">
                  {volunteerWork.map((vol, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 relative">
                      <button
                        onClick={() => removeVolunteer(index)}
                        className="absolute top-4 right-4 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-10">
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Organization</label>
                          <input
                            type="text"
                            value={vol.organization}
                            onChange={(e) => {
                              const newVol = [...volunteerWork];
                              newVol[index].organization = e.target.value;
                              setVolunteerWork(newVol);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Role</label>
                          <input
                            type="text"
                            value={vol.role}
                            onChange={(e) => {
                              const newVol = [...volunteerWork];
                              newVol[index].role = e.target.value;
                              setVolunteerWork(newVol);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Start Date (YYYY-MM)</label>
                          <input
                            type="month"
                            value={vol.startDate}
                            onChange={(e) => {
                              const newVol = [...volunteerWork];
                              newVol[index].startDate = e.target.value;
                              setVolunteerWork(newVol);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">End Date (leave blank if ongoing)</label>
                          <input
                            type="month"
                            value={vol.endDate}
                            onChange={(e) => {
                              const newVol = [...volunteerWork];
                              newVol[index].endDate = e.target.value;
                              newVol[index].current = !e.target.value;
                              setVolunteerWork(newVol);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                            disabled={vol.current}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="flex items-center mb-2">
                            <input
                              type="checkbox"
                              checked={vol.current}
                              onChange={(e) => {
                                const newVol = [...volunteerWork];
                                newVol[index].current = e.target.checked;
                                if (e.target.checked) newVol[index].endDate = '';
                                setVolunteerWork(newVol);
                              }}
                              className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">Currently Active</span>
                          </label>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Description</label>
                          <textarea
                            value={vol.description}
                            onChange={(e) => {
                              const newVol = [...volunteerWork];
                              newVol[index].description = e.target.value;
                              setVolunteerWork(newVol);
                            }}
                            rows={2}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Languages</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPrivacySettings(prev => ({ ...prev, languages: !prev.languages }))}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm ${
                        privacySettings.languages
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                      title={privacySettings.languages ? 'Visible to public' : 'Hidden from public'}
                    >
                      {privacySettings.languages ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      <span className="hidden sm:inline">{privacySettings.languages ? 'Public' : 'Private'}</span>
                    </button>
                    <button
                      onClick={addLanguage}
                      className="flex items-center gap-2 px-4 py-2 text-white rounded-lg hover:shadow-lg transition-all text-sm"
                      style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}
                    >
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline">Add Language</span>
                      <span className="sm:hidden">Add</span>
                    </button>
                  </div>
                </div>
                <div className="space-y-4">
                  {selectedLanguages.map((lang, index) => (
                    <div key={index} className="flex gap-4 items-center">
                      <select
                        value={lang.language}
                        onChange={(e) => {
                          const newLangs = [...selectedLanguages];
                          newLangs[index].language = e.target.value;
                          setSelectedLanguages(newLangs);
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="">Select Language</option>
                        {LANGUAGES.map(language => (
                          <option key={language} value={language}>{language}</option>
                        ))}
                      </select>
                      <select
                        value={lang.proficiency}
                        onChange={(e) => {
                          const newLangs = [...selectedLanguages];
                          newLangs[index].proficiency = e.target.value;
                          setSelectedLanguages(newLangs);
                        }}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="">Select Proficiency</option>
                        {PROFICIENCY_LEVELS.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                      <button
                        onClick={() => removeLanguage(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div>
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Interests & Activities</h2>
                  <button
                    onClick={() => setPrivacySettings(prev => ({ ...prev, interests: !prev.interests }))}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm ${
                      privacySettings.interests
                        ? 'bg-green-50 text-green-700 hover:bg-green-100'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={privacySettings.interests ? 'Visible to public' : 'Hidden from public'}
                  >
                    {privacySettings.interests ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    <span className="hidden sm:inline">{privacySettings.interests ? 'Public' : 'Private'}</span>
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-4">Select interests that apply to you:</p>
                {Object.entries(INTEREST_CATEGORIES).map(([category, interests]) => (
                  <div key={category} className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">{category}</h3>
                    <div className="flex flex-wrap gap-2">
                      {interests.map(interest => (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            selectedInterests.includes(interest)
                              ? 'bg-teal-100 text-teal-700 border-2 border-teal-500'
                              : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                          }`}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SKILLS TAB */}
          {activeTab === 'skills' && (
            <div className="space-y-4">
              {/* Header Info */}
              <div className="bg-gradient-to-r from-blue-50 to-teal-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-blue-800">
                  <strong>Your Roles:</strong> {profileData.roles.join(', ')}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Rate your competency level for each skill (0-5). Click sections to expand/collapse.
                </p>
              </div>

              {/* Rating Legend */}
              <div className="bg-white border border-gray-200 rounded-lg p-3 overflow-x-auto">
                <div className="flex flex-wrap gap-2 text-xs min-w-max">
                  {COMPETENCY_RATINGS.map(rating => {
                    const bgColorClass = rating.value === 0 ? 'bg-gray-500' :
                                         rating.value === 1 ? 'bg-red-500' :
                                         rating.value === 2 ? 'bg-orange-500' :
                                         rating.value === 3 ? 'bg-yellow-500' :
                                         rating.value === 4 ? 'bg-blue-500' :
                                         'bg-green-500';
                    return (
                      <div key={rating.value} className="flex items-center gap-1">
                        <div className={`w-3 h-3 rounded-full ${bgColorClass}`}></div>
                        <span className="text-gray-700 whitespace-nowrap">{rating.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Render based on role */}
              {profileData.roles.includes('Healthcare Assistant (HCA)') && (
                <div className="space-y-3">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 sticky top-0 bg-gray-50 py-2 z-10">HCA Competencies</h2>

                  {Object.entries(HCA_COMPETENCIES).map(([category, data]: [string, any]) => (
                    <div key={category} className="mb-3 border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleSection(`hca-${category}`)}
                        className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-white hover:from-amber-100 hover:to-amber-50 transition-colors"
                      >
                        <span className="font-semibold text-sm sm:text-base text-gray-900">{category}</span>
                        <span className="text-gray-500">{expandedSections[`hca-${category}`] ? '▼' : '▶'}</span>
                      </button>

                      {expandedSections[`hca-${category}`] && (
                        <div className="p-3 bg-white space-y-3">
                          {/* Handle different data structures */}
                          {Array.isArray(data) ? (
                            <div className="space-y-2">
                              {data.map((item: string) => {
                                const skillId = `hca-${category}-${item}`;
                                const rating = skillRatings[skillId] || 0;
                                return (
                                  <div key={item} className="flex items-center justify-between gap-2 p-2 bg-amber-50 rounded-lg">
                                    <span className="text-xs text-amber-900 flex-1">{item}</span>
                                    <div className="flex gap-0.5">
                                      {[0, 1, 2, 3, 4, 5].map(r => (
                                        <button
                                          key={r}
                                          onClick={() => updateSkillRating(skillId, r)}
                                          className={`w-6 h-6 rounded-full text-xs font-semibold transition-all ${
                                            rating === r
                                              ? `bg-${getRatingColor(r)}-500 text-white scale-110`
                                              : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                          }`}
                                          title={getRatingLabel(r)}
                                        >
                                          {r}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : typeof data === 'object' ? (
                            Object.entries(data).map(([key, value]: [string, any]) => (
                              <div key={key} className="border-l-2 border-amber-300 pl-3">
                                <h4 className="font-medium text-sm text-amber-900 mb-2 capitalize">{key}</h4>
                                {Array.isArray(value) ? (
                                  <div className="space-y-2">
                                    {value.map((item: string) => {
                                      const skillId = `hca-${category}-${key}-${item}`;
                                      const rating = skillRatings[skillId] || 0;
                                      return (
                                        <div key={item} className="flex items-center justify-between gap-2 p-2 bg-amber-50 rounded-lg">
                                          <span className="text-xs text-amber-900 flex-1">{item}</span>
                                          <div className="flex gap-0.5">
                                            {[0, 1, 2, 3, 4, 5].map(r => (
                                              <button
                                                key={r}
                                                onClick={() => updateSkillRating(skillId, r)}
                                                className={`w-6 h-6 rounded-full text-xs font-semibold transition-all ${
                                                  rating === r
                                                    ? `bg-${getRatingColor(r)}-500 text-white scale-110`
                                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                }`}
                                                title={getRatingLabel(r)}
                                              >
                                                {r}
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : typeof value === 'object' ? (
                                  <div className="space-y-2 ml-2">
                                    {Object.entries(value).map(([subkey, subvalue]: [string, any]) => (
                                      <div key={subkey}>
                                        <p className="text-xs font-semibold text-gray-700 mb-1 capitalize">{subkey}:</p>
                                        {Array.isArray(subvalue) ? (
                                          <div className="space-y-2">
                                            {subvalue.map((item: string) => {
                                              const skillId = `hca-${category}-${key}-${subkey}-${item}`;
                                              const rating = skillRatings[skillId] || 0;
                                              return (
                                                <div key={item} className="flex items-center justify-between gap-2 p-2 bg-amber-50 rounded-lg">
                                                  <span className="text-xs text-amber-900 flex-1">{item}</span>
                                                  <div className="flex gap-0.5">
                                                    {[0, 1, 2, 3, 4, 5].map(r => (
                                                      <button
                                                        key={r}
                                                        onClick={() => updateSkillRating(skillId, r)}
                                                        className={`w-6 h-6 rounded-full text-xs font-semibold transition-all ${
                                                          rating === r
                                                            ? `bg-${getRatingColor(r)}-500 text-white scale-110`
                                                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                        }`}
                                                        title={getRatingLabel(r)}
                                                      >
                                                        {r}
                                                      </button>
                                                    ))}
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        ) : typeof subvalue === 'object' ? (
                                          <div className="ml-2 space-y-1">
                                            {Object.entries(subvalue).map(([deepkey, deepvalue]: [string, any]) => (
                                              <div key={deepkey}>
                                                <p className="text-xs font-medium text-gray-600 capitalize">{deepkey}:</p>
                                                {Array.isArray(deepvalue) && (
                                                  <div className="space-y-2 mt-1">
                                                    {deepvalue.map((item: string) => {
                                                      const skillId = `hca-${category}-${key}-${subkey}-${deepkey}-${item}`;
                                                      const rating = skillRatings[skillId] || 0;
                                                      return (
                                                        <div key={item} className="flex items-center justify-between gap-2 p-2 bg-amber-50 rounded-lg">
                                                          <span className="text-xs text-amber-900 flex-1">{item}</span>
                                                          <div className="flex gap-0.5">
                                                            {[0, 1, 2, 3, 4, 5].map(r => (
                                                              <button
                                                                key={r}
                                                                onClick={() => updateSkillRating(skillId, r)}
                                                                className={`w-6 h-6 rounded-full text-xs font-semibold transition-all ${
                                                                  rating === r
                                                                    ? `bg-${getRatingColor(r)}-500 text-white scale-110`
                                                                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                                }`}
                                                                title={getRatingLabel(r)}
                                                              >
                                                                {r}
                                                              </button>
                                                            ))}
                                                          </div>
                                                        </div>
                                                      );
                                                    })}
                                                  </div>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        ) : null}
                                      </div>
                                    ))}
                                  </div>
                                ) : null}
                              </div>
                            ))
                          ) : null}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* For Scrub N/P, Anaes N/P, and other clinical roles */}
              {(profileData.roles.some(role => role.includes('Scrub') || role.includes('Anaes') || role.includes('Recovery') || role === 'Theatre Manager')) && !profileData.roles.includes('Healthcare Assistant (HCA)') && (
                <div className="space-y-4">
                  {/* Surgical Competency Management System */}
                  {profileData.roles.some(role => role.includes('Scrub')) && (
                    <CompetencyManagement
                      staffId={profileData.id}
                      staffName={`${profileData.firstName} ${profileData.lastName}`}
                      staffRole={profileData.roles[0]}
                      primarySpecialty="All"
                    />
                  )}

                  {/* Anaesthetic Competencies */}
                  {profileData.roles.some(role => role.includes('Anaes')) && (
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3">Anaesthetic Competencies</h2>
                      {Object.entries(ANAESTHETIC_COMPETENCIES).map(([category, data]: [string, any]) => (
                        <div key={category} className="mb-3 border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() => toggleSection(`anaes-${category}`)}
                            className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-white hover:from-purple-100 hover:to-purple-50 transition-colors"
                          >
                            <span className="font-semibold text-sm sm:text-base text-gray-900">{category}</span>
                            <span className="text-gray-500">{expandedSections[`anaes-${category}`] ? '▼' : '▶'}</span>
                          </button>

                          {expandedSections[`anaes-${category}`] && (
                            <div className="p-3 bg-white">
                              {/* Render different structures */}
                              {Array.isArray(data) ? (
                                <div className="space-y-2">
                                  {data.map((item: string) => {
                                    const skillId = `anaes-${category}-${item}`;
                                    const rating = skillRatings[skillId] || 0;
                                    return (
                                      <div key={item} className="flex items-center justify-between gap-2 p-2 bg-purple-50 rounded-lg">
                                        <span className="text-xs text-purple-900 flex-1">{item}</span>
                                        <div className="flex gap-0.5">
                                          {[0, 1, 2, 3, 4, 5].map(r => (
                                            <button
                                              key={r}
                                              onClick={() => updateSkillRating(skillId, r)}
                                              className={`w-6 h-6 rounded-full text-xs font-semibold transition-all ${getRatingButtonClass(rating, r)}`}
                                              title={getRatingLabel(r)}
                                            >
                                              {r}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : typeof data === 'object' ? (
                                <div className="space-y-2">
                                  {Object.entries(data).map(([key, value]: [string, any]) => (
                                    <div key={key}>
                                      <p className="text-xs font-semibold text-gray-700 mb-1 capitalize">{key}:</p>
                                      {Array.isArray(value) ? (
                                        <div className="space-y-2">
                                          {value.map((item: string) => {
                                            const skillId = `anaes-${category}-${key}-${item}`;
                                            const rating = skillRatings[skillId] || 0;
                                            return (
                                              <div key={item} className="flex items-center justify-between gap-2 p-2 bg-purple-50 rounded-lg">
                                                <span className="text-xs text-purple-900 flex-1">{item}</span>
                                                <div className="flex gap-0.5">
                                                  {[0, 1, 2, 3, 4, 5].map(r => (
                                                    <button
                                                      key={r}
                                                      onClick={() => updateSkillRating(skillId, r)}
                                                      className={`w-6 h-6 rounded-full text-xs font-semibold transition-all ${
                                                        rating === r
                                                          ? `bg-${getRatingColor(r)}-500 text-white scale-110`
                                                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                      }`}
                                                      title={getRatingLabel(r)}
                                                    >
                                                      {r}
                                                    </button>
                                                  ))}
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      ) : typeof value === 'object' ? (
                                        <div className="ml-2 space-y-2">
                                          {Object.entries(value).map(([subkey, subvalue]: [string, any]) => (
                                            <div key={subkey}>
                                              <p className="text-xs font-medium text-gray-600 capitalize">{subkey}:</p>
                                              {Array.isArray(subvalue) && (
                                                <div className="space-y-2 mt-1">
                                                  {subvalue.map((item: string) => {
                                                    const skillId = `anaes-${category}-${key}-${subkey}-${item}`;
                                                    const rating = skillRatings[skillId] || 0;
                                                    return (
                                                      <div key={item} className="flex items-center justify-between gap-2 p-2 bg-purple-50 rounded-lg">
                                                        <span className="text-xs text-purple-900 flex-1">{item}</span>
                                                        <div className="flex gap-0.5">
                                                          {[0, 1, 2, 3, 4, 5].map(r => (
                                                            <button
                                                              key={r}
                                                              onClick={() => updateSkillRating(skillId, r)}
                                                              className={`w-6 h-6 rounded-full text-xs font-semibold transition-all ${
                                                                rating === r
                                                                  ? `bg-${getRatingColor(r)}-500 text-white scale-110`
                                                                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                              }`}
                                                              title={getRatingLabel(r)}
                                                            >
                                                              {r}
                                                            </button>
                                                          ))}
                                                        </div>
                                                      </div>
                                                    );
                                                  })}
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      ) : (
                                        <span className="text-xs text-gray-600">{value}</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recovery Competencies */}
                  {profileData.roles.some(role => role.includes('Recovery')) && (
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3">Recovery/PACU Competencies</h2>
                      {Object.entries(RECOVERY_COMPETENCIES).map(([category, data]: [string, any]) => (
                        <div key={category} className="mb-3 border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() => toggleSection(`recovery-${category}`)}
                            className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-white hover:from-green-100 hover:to-green-50 transition-colors"
                          >
                            <span className="font-semibold text-sm sm:text-base text-gray-900">{category}</span>
                            <span className="text-gray-500">{expandedSections[`recovery-${category}`] ? '▼' : '▶'}</span>
                          </button>

                          {expandedSections[`recovery-${category}`] && (
                            <div className="p-3 bg-white">
                              {Array.isArray(data) ? (
                                <div className="space-y-2">
                                  {data.map((item: string) => {
                                    const skillId = `recovery-${category}-${item}`;
                                    const rating = skillRatings[skillId] || 0;
                                    return (
                                      <div key={item} className="flex items-center justify-between gap-2 p-2 bg-green-50 rounded-lg">
                                        <span className="text-xs text-green-900 flex-1">{item}</span>
                                        <div className="flex gap-0.5">
                                          {[0, 1, 2, 3, 4, 5].map(r => (
                                            <button
                                              key={r}
                                              onClick={() => updateSkillRating(skillId, r)}
                                              className={`w-6 h-6 rounded-full text-xs font-semibold transition-all ${getRatingButtonClass(rating, r)}`}
                                              title={getRatingLabel(r)}
                                            >
                                              {r}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : typeof data === 'object' ? (
                                <div className="space-y-2">
                                  {Object.entries(data).map(([key, value]: [string, any]) => (
                                    <div key={key}>
                                      <p className="text-xs font-semibold text-gray-700 mb-1 capitalize">{key}:</p>
                                      {Array.isArray(value) && (
                                        <div className="space-y-2">
                                          {value.map((item: string) => {
                                            const skillId = `recovery-${category}-${key}-${item}`;
                                            const rating = skillRatings[skillId] || 0;
                                            return (
                                              <div key={item} className="flex items-center justify-between gap-2 p-2 bg-green-50 rounded-lg">
                                                <span className="text-xs text-green-900 flex-1">{item}</span>
                                                <div className="flex gap-0.5">
                                                  {[0, 1, 2, 3, 4, 5].map(r => (
                                                    <button
                                                      key={r}
                                                      onClick={() => updateSkillRating(skillId, r)}
                                                      className={`w-6 h-6 rounded-full text-xs font-semibold transition-all ${
                                                        rating === r
                                                          ? `bg-${getRatingColor(r)}-500 text-white scale-110`
                                                          : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                      }`}
                                                      title={getRatingLabel(r)}
                                                    >
                                                      {r}
                                                    </button>
                                                  ))}
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : null}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Cell Salvage for N/P roles */}
                  {profileData.roles.some(role => role.includes('N/P') || role.includes('Practitioner')) && (
                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3">Cell Salvage Competencies</h2>
                      {Object.entries(CELL_SALVAGE_COMPETENCIES).map(([category, data]: [string, any]) => (
                        <div key={category} className="mb-3 border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() => toggleSection(`cell-${category}`)}
                            className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-red-50 to-white hover:from-red-100 hover:to-red-50 transition-colors"
                          >
                            <span className="font-semibold text-sm sm:text-base text-gray-900">{category}</span>
                            <span className="text-gray-500">{expandedSections[`cell-${category}`] ? '▼' : '▶'}</span>
                          </button>

                          {expandedSections[`cell-${category}`] && (
                            <div className="p-3 bg-white space-y-2">
                              {Array.isArray(data) ? (
                                <div className="space-y-2">
                                  {data.map((item: string) => {
                                    const skillId = `cell-${category}-${item}`;
                                    const rating = skillRatings[skillId] || 0;
                                    return (
                                      <div key={item} className="flex items-center justify-between gap-2 p-2 bg-red-50 rounded-lg">
                                        <span className="text-xs text-red-900 flex-1">{item}</span>
                                        <div className="flex gap-0.5">
                                          {[0, 1, 2, 3, 4, 5].map(r => (
                                            <button
                                              key={r}
                                              onClick={() => updateSkillRating(skillId, r)}
                                              className={`w-6 h-6 rounded-full text-xs font-semibold transition-all ${getRatingButtonClass(rating, r)}`}
                                              title={getRatingLabel(r)}
                                            >
                                              {r}
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : typeof data === 'object' ? (
                                Object.entries(data).map(([key, value]: [string, any]) => (
                                  <div key={key}>
                                    <p className="text-xs font-semibold text-gray-700 mb-1 capitalize">{key}:</p>
                                    {Array.isArray(value) && (
                                      <div className="space-y-2">
                                        {value.map((item: string) => {
                                          const skillId = `cell-${category}-${key}-${item}`;
                                          const rating = skillRatings[skillId] || 0;
                                          return (
                                            <div key={item} className="flex items-center justify-between gap-2 p-2 bg-red-50 rounded-lg">
                                              <span className="text-xs text-red-900 flex-1">{item}</span>
                                              <div className="flex gap-0.5">
                                                {[0, 1, 2, 3, 4, 5].map(r => (
                                                  <button
                                                    key={r}
                                                    onClick={() => updateSkillRating(skillId, r)}
                                                    className={`w-6 h-6 rounded-full text-xs font-semibold transition-all ${
                                                      rating === r
                                                        ? `bg-${getRatingColor(r)}-500 text-white scale-110`
                                                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                    }`}
                                                    title={getRatingLabel(r)}
                                                  >
                                                    {r}
                                                  </button>
                                                ))}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                ))
                              ) : null}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Success message */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <p className="text-xs sm:text-sm text-green-800">
                  ✓ Comprehensive competency framework loaded. Continue scrolling to explore all areas relevant to your roles.
                </p>
              </div>
            </div>
          )}

          {/* COMPLIANCE TAB */}
          {activeTab === 'compliance' && (
            <div className="space-y-4">
              {/* Compliance Overview Summary - Clickable Filters */}
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => setComplianceFilter('all')}
                  className={`rounded-lg p-3 text-center transition-all flex flex-col items-center justify-center ${
                    complianceFilter === 'all'
                      ? 'bg-blue-100 border-2 border-blue-500'
                      : 'bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl font-bold text-gray-700">22</div>
                  <div className="text-xs text-gray-600 font-medium">All Items</div>
                </button>
                <button
                  onClick={() => setComplianceFilter('compliant')}
                  className={`rounded-lg p-3 text-center transition-all flex flex-col items-center justify-center ${
                    complianceFilter === 'compliant'
                      ? 'bg-green-100 border-2 border-green-500'
                      : 'bg-green-50 border-2 border-green-200 hover:border-green-300'
                  }`}
                >
                  <div className="text-2xl font-bold text-green-700">18</div>
                  <div className="text-xs text-green-600 font-medium">Compliant</div>
                </button>
                <button
                  onClick={() => setComplianceFilter('expiring')}
                  className={`rounded-lg p-3 text-center transition-all flex flex-col items-center justify-center ${
                    complianceFilter === 'expiring'
                      ? 'bg-amber-100 border-2 border-amber-500'
                      : 'bg-amber-50 border-2 border-amber-200 hover:border-amber-300'
                  }`}
                >
                  <div className="text-2xl font-bold text-amber-700">3</div>
                  <div className="text-xs text-amber-600 font-medium">Expiring</div>
                </button>
                <button
                  onClick={() => setComplianceFilter('expired')}
                  className={`rounded-lg p-3 text-center transition-all flex flex-col items-center justify-center ${
                    complianceFilter === 'expired'
                      ? 'bg-red-100 border-2 border-red-500'
                      : 'bg-red-50 border-2 border-red-200 hover:border-red-300'
                  }`}
                >
                  <div className="text-2xl font-bold text-red-700">1</div>
                  <div className="text-xs text-red-600 font-medium">Expired</div>
                </button>
              </div>

              {/* Professional Registration */}
              {(complianceFilter === 'all' || complianceFilter === 'compliant' || complianceFilter === 'expiring') && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Professional Registration</h2>
                  <div className="space-y-2">
                    {/* HCPC - Compliant */}
                    {(complianceFilter === 'all' || complianceFilter === 'compliant') && (
                      <div className="border border-gray-200 rounded-lg p-2.5">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900">HCPC Registration (ODP)</h3>
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">✓</span>
                        </div>
                        <div className="mt-0.5 text-xs text-gray-600">ODP12345 • Expires 31 Jul 2027</div>
                      </div>
                    )}

                    {/* NMC - Expiring Soon */}
                    {(complianceFilter === 'all' || complianceFilter === 'expiring') && (
                      <div className="border border-amber-300 bg-amber-50 rounded-lg p-2.5">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900">NMC Revalidation</h3>
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">⚠ 47d</span>
                        </div>
                        <div className="mt-0.5 text-xs text-amber-700 font-medium">Due 15 Dec 2025</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* DBS & Right to Work */}
              {(complianceFilter === 'all' || complianceFilter === 'compliant') && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">DBS & Right to Work</h2>
                  <div className="space-y-2">
                    {/* DBS - Compliant */}
                    <div className="border border-gray-200 rounded-lg p-2.5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900">DBS Check (Enhanced)</h3>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">✓</span>
                      </div>
                      <div className="mt-0.5 text-xs text-gray-600">001234567890 • Issued 12 Mar 2024 • Clear</div>
                    </div>

                    {/* Right to Work - Compliant */}
                    <div className="border border-gray-200 rounded-lg p-2.5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900">Right to Work in UK</h3>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">✓</span>
                      </div>
                      <div className="mt-0.5 text-xs text-gray-600">British Passport • Verified 5 Jan 2023</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Mandatory Training */}
              {(complianceFilter === 'all' || complianceFilter === 'compliant' || complianceFilter === 'expiring' || complianceFilter === 'expired') && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Mandatory Training</h2>
                  <div className="space-y-2">
                  {/* BLS - Expired */}
                  {(complianceFilter === 'all' || complianceFilter === 'expired') && (
                    <div className="border-2 border-red-300 bg-red-50 rounded-lg p-2.5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900">Basic Life Support (BLS)</h3>
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">✕ EXPIRED</span>
                      </div>
                      <div className="mt-0.5 text-xs text-red-700 font-bold">Expired 14 days ago • Book immediately</div>
                    </div>
                  )}

                  {/* ILS - Expiring Soon */}
                  {(complianceFilter === 'all' || complianceFilter === 'expiring') && (
                    <div className="border border-amber-300 bg-amber-50 rounded-lg p-2.5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900">Immediate Life Support (ILS)</h3>
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">⚠ 36d</span>
                      </div>
                      <div className="mt-0.5 text-xs text-amber-700">Expires 3 Jan 2026</div>
                    </div>
                  )}

                  {/* Safeguarding Level 3 - Compliant */}
                  {(complianceFilter === 'all' || complianceFilter === 'compliant') && (
                    <div className="border border-gray-200 rounded-lg p-2.5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900">Safeguarding Level 3</h3>
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">✓</span>
                      </div>
                      <div className="mt-0.5 text-xs text-gray-600">Valid until 12 Jun 2027</div>
                    </div>
                  )}

                  {/* Fire Safety - Expiring Soon */}
                  {(complianceFilter === 'all' || complianceFilter === 'expiring') && (
                    <div className="border border-amber-300 bg-amber-50 rounded-lg p-2.5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900">Fire Safety</h3>
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">⚠ 7d</span>
                      </div>
                      <div className="mt-0.5 text-xs text-amber-700">Expires 5 Dec 2025</div>
                    </div>
                  )}

                  {/* Manual Handling, IPC, Info Governance - Compliant */}
                  {(complianceFilter === 'all' || complianceFilter === 'compliant') && (
                    <>
                      <div className="border border-gray-200 rounded-lg p-2.5">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900">Manual Handling</h3>
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">✓</span>
                        </div>
                        <div className="mt-0.5 text-xs text-gray-600">Valid until 20 Aug 2027</div>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-2.5">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900">Infection Prevention & Control</h3>
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">✓</span>
                        </div>
                        <div className="mt-0.5 text-xs text-gray-600">Valid until 15 Sep 2025</div>
                      </div>
                      <div className="border border-gray-200 rounded-lg p-2.5">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-medium text-gray-900">Information Governance</h3>
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">✓</span>
                        </div>
                        <div className="mt-0.5 text-xs text-gray-600">Valid until 1 Nov 2025</div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              )}

              {/* Occupational Health */}
              {(complianceFilter === 'all' || complianceFilter === 'compliant') && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Occupational Health</h2>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="border border-gray-200 rounded-lg p-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-medium text-gray-900">Hep B</h3>
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">✓</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5">Immune</div>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-medium text-gray-900">MMR</h3>
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">✓</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5">Complete</div>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-medium text-gray-900">TB Screen</h3>
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">✓</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5">Negative</div>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-medium text-gray-900">COVID-19</h3>
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">✓</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5">+ Booster</div>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-2 col-span-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-medium text-gray-900">Annual Health Assessment</h3>
                        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">✓</span>
                      </div>
                      <div className="text-xs text-gray-600 mt-0.5">Fit for All Duties • Due 22 Apr 2025</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Indemnity Insurance */}
              {(complianceFilter === 'all' || complianceFilter === 'compliant') && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Indemnity Insurance</h2>
                  <div className="border border-gray-200 rounded-lg p-2.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">Professional Indemnity</h3>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">✓</span>
                    </div>
                    <div className="mt-0.5 text-xs text-gray-600">MDU • £10M • Valid until 31 Mar 2026</div>
                  </div>
                </div>
              )}

              {/* ESR Integration Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                <p className="text-xs text-blue-800">
                  <strong>ESR Integration:</strong> All compliance data will sync automatically from ESR via NHS Digital API
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Save Button */}
        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={handleSave}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-white rounded-lg hover:shadow-lg transition-all text-sm sm:text-base"
            style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}
          >
            <Save className="w-4 h-4 sm:w-5 sm:h-5" />
            Save All Changes
          </button>
          <button
            onClick={() => router.back()}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm sm:text-base"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
