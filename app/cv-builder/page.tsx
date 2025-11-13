'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Eye, ArrowLeft, Upload, CheckCircle } from 'lucide-react';
import {
  NHS_TRUSTS,
  POSTCODE_AREAS,
  TRAVEL_DISTANCES,
  THEATRE_DEPARTMENTS,
  PROFESSIONAL_QUALIFICATIONS,
  THEATRE_ROLES,
} from '@/lib/profileData';
import LocumHospitalsSelector from '@/components/LocumHospitalsSelector';

export default function CVBuilderPage() {
  const router = useRouter();
  const [isPreview, setIsPreview] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);

  const [cvData, setCvData] = useState({
    // Personal Details
    firstName: '',
    lastName: '',
    postNominals: '', // e.g., "EMBA, CMgr, MIOEE, LSSBB, RN"
    department: '',
    professionalQualificationBand: '', // Combined: "RN Band 7" or "ODP Band 6"
    roles: [] as string[],

    // Contact Details
    email: '',
    phone: '',
    preferredContact: 'email',

    // Location & Availability
    currentTrust: '',
    currentHospital: '',
    postcode: '',
    area: '',
    willingToTravel: '15',

    // Experience
    yearsExperience: '',
    locumHospitals: [] as Array<{ trust: string; hospital: string; region: string }>,

    // Bio/Summary
    professionalSummary: '',
  });

  // Check if profile already exists on component mount
  useEffect(() => {
    const existingProfile = localStorage.getItem('cvData');
    if (existingProfile) {
      const confirmReset = window.confirm(
        'You already have a profile. Would you like to remove your data and start again?'
      );
      if (confirmReset) {
        localStorage.removeItem('cvData');
        setHasExistingProfile(false);
      } else {
        // Load existing data
        setCvData(JSON.parse(existingProfile));
        setHasExistingProfile(true);
      }
    }
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setIsUploading(true);

    // TODO: Implement CV parsing logic here
    setTimeout(() => {
      setIsUploading(false);
      alert(`CV "${file.name}" uploaded successfully! Auto-fill feature coming soon.`);
    }, 1000);
  };

  const handleSave = () => {
    // Save to localStorage or Firebase
    localStorage.setItem('cvData', JSON.stringify(cvData));
    setHasExistingProfile(true);

    // Only ask about completing profile if this is a new profile
    if (!hasExistingProfile) {
      const completeProfile = window.confirm(
        'CV saved successfully! Would you like to complete your professional profile by adding competencies and skills?'
      );

      if (completeProfile) {
        router.push('/profile/edit');
      }
    } else {
      alert('CV updated successfully!');
    }
  };

  const handlePreview = () => {
    setIsPreview(true);
  };

  if (isPreview) {
    // Preview mode - show profile-style display
    return (
      <div className="min-h-screen" style={{backgroundColor: '#F0F9FF'}}>
        <div className="w-full px-4 md:px-6 py-6">
          <button
            onClick={() => setIsPreview(false)}
            className="flex items-center gap-2 mb-6 hover:opacity-80"
            style={{color: '#06B6D4'}}
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Edit</span>
          </button>

          {/* Preview Display */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {/* Header */}
            <div className="flex items-start gap-6 mb-8 pb-8 border-b">
              <div className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-bold" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}>
                {cvData.firstName.charAt(0)}{cvData.lastName.charAt(0)}
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {cvData.firstName} {cvData.lastName}
                  {cvData.postNominals && (
                    <span className="text-gray-600 font-normal text-2xl">, {cvData.postNominals}</span>
                  )}
                </h1>
                <p className="text-xl text-gray-600 mb-2">{cvData.roles.join(', ')}</p>
                <p className="text-lg mb-4" style={{color: '#06B6D4'}}>{cvData.professionalQualificationBand}</p>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div>{cvData.email}</div>
                  <div>{cvData.phone}</div>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Location</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Trust:</span> {cvData.currentTrust}</p>
                <p><span className="font-medium">Hospital:</span> {cvData.currentHospital}</p>
                <p><span className="font-medium">Area:</span> {cvData.area}, {cvData.postcode}</p>
                <p><span className="font-medium">Willing to travel:</span> {cvData.willingToTravel} miles</p>
              </div>
            </div>

            {/* Experience */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Experience</h2>
              <p className="text-lg"><span className="font-medium">{cvData.yearsExperience}</span> years in theatre operations</p>
            </div>

            {/* Professional Summary */}
            {cvData.professionalSummary && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Professional Summary</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{cvData.professionalSummary}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Edit mode - show form with compact design matching Edit Profile
  return (
    <div className="min-h-screen" style={{backgroundColor: '#F0F9FF'}}>
      <div className="w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6">
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">CV Builder</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Create your professional theatre operations CV</p>
        </div>

        {/* CV Upload Section */}
        <div className="rounded-lg border-2 border-dashed p-4 sm:p-6 mb-6" style={{background: 'linear-gradient(135deg, #E0F2FE 0%, #F0F9FF 50%, #F3E8FF 100%)', borderColor: '#7DD3FC'}}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">Upload Your CV</h3>
              <p className="text-xs sm:text-sm text-gray-600">Upload your existing CV to auto-fill the form (PDF or DOCX)</p>
            </div>
            <label className="flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 text-white rounded-lg hover:shadow-lg transition-all cursor-pointer text-sm sm:text-base whitespace-nowrap" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}>
              <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>{isUploading ? 'Uploading...' : 'Upload CV'}</span>
              <input
                type="file"
                accept=".pdf,.docx,.doc"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
            </label>
          </div>
          {uploadedFile && (
            <div className="mt-4 flex items-center gap-2 text-xs sm:text-sm text-green-700">
              <CheckCircle className="w-4 h-4" />
              <span>Uploaded: {uploadedFile.name}</span>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 md:p-8">
          <form className="space-y-6 sm:space-y-8">
            {/* Personal Details */}
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Personal Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={cvData.firstName}
                    onChange={(e) => setCvData({ ...cvData, firstName: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Alexander"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={cvData.lastName}
                    onChange={(e) => setCvData({ ...cvData, lastName: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Monterubio"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Post-Nominals (Professional Designations)
                  </label>
                  <input
                    type="text"
                    value={cvData.postNominals}
                    onChange={(e) => setCvData({ ...cvData, postNominals: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="e.g., EMBA, CMgr, MIOEE, LSSBB, RN"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter your professional qualifications and certifications (e.g., EMBA, RN, PhD)
                  </p>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Department *</label>
                  <select
                    value={cvData.department}
                    onChange={(e) => setCvData({ ...cvData, department: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="">Select Department</option>
                    {THEATRE_DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Professional Qualification & Band *</label>
                  <select
                    value={cvData.professionalQualificationBand}
                    onChange={(e) => setCvData({ ...cvData, professionalQualificationBand: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="">Select Qualification & Band</option>
                    <optgroup label="Registered Nurse (RN)">
                      {['Band 5', 'Band 6', 'Band 7', 'Band 8a', 'Band 8b', 'Band 8c', 'Band 8d', 'Band 9'].map(band => (
                        <option key={`RN ${band}`} value={`RN ${band}`}>RN {band}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Operating Department Practitioner (ODP)">
                      {['Band 5', 'Band 6', 'Band 7', 'Band 8a', 'Band 8b', 'Band 8c', 'Band 8d', 'Band 9'].map(band => (
                        <option key={`ODP ${band}`} value={`ODP ${band}`}>ODP {band}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Healthcare Assistant">
                      {['Band 2', 'Band 3', 'Band 4'].map(band => (
                        <option key={`HCA ${band}`} value={`HCA ${band}`}>HCA {band}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Other">
                      <option value="Other">Other/None</option>
                    </optgroup>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Role(s) *</label>
                  <p className="text-xs text-gray-500 mb-2">
                    Select all roles that apply
                  </p>
                  <div className="space-y-2 p-3 border border-gray-300 rounded-lg bg-gray-50 max-h-60 overflow-y-auto">
                    {Object.keys(THEATRE_ROLES).map(role => {
                      const isHCA = role === 'Healthcare Assistant (HCA)';
                      const hasHCA = cvData.roles.includes('Healthcare Assistant (HCA)');
                      const hasOtherRoles = cvData.roles.some(r => r !== 'Healthcare Assistant (HCA)');
                      const isDisabled = (isHCA && hasOtherRoles) || (!isHCA && hasHCA);

                      return (
                        <label
                          key={role}
                          className={`flex items-start space-x-2 p-2 rounded transition-colors ${
                            isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-white'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={cvData.roles.includes(role)}
                            disabled={isDisabled}
                            onChange={(e) => {
                              if (e.target.checked) {
                                if (isHCA) {
                                  setCvData({ ...cvData, roles: [role] });
                                } else {
                                  setCvData({ ...cvData, roles: [...cvData.roles, role] });
                                }
                              } else {
                                setCvData({ ...cvData, roles: cvData.roles.filter(r => r !== role) });
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
              </div>
            </div>

            {/* Contact Details */}
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Contact Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={cvData.email}
                    onChange={(e) => setCvData({ ...cvData, email: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="alexander.monterubio@nhs.net"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={cvData.phone}
                    onChange={(e) => setCvData({ ...cvData, phone: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="+44 7700 900456"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">Preferred Contact</label>
                  <select
                    value={cvData.preferredContact}
                    onChange={(e) => setCvData({ ...cvData, preferredContact: e.target.value })}
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
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Current Trust *
                  </label>
                  <select
                    value={cvData.currentTrust}
                    onChange={(e) => setCvData({ ...cvData, currentTrust: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="">Select Trust</option>
                    {Object.keys(NHS_TRUSTS).map(trust => (
                      <option key={trust} value={trust}>{trust}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Current Hospital
                  </label>
                  <input
                    type="text"
                    value={cvData.currentHospital}
                    onChange={(e) => setCvData({ ...cvData, currentHospital: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Royal London Hospital"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Postcode Area *
                  </label>
                  <select
                    value={cvData.postcode}
                    onChange={(e) => setCvData({ ...cvData, postcode: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    <option value="">Select Postcode</option>
                    {Object.keys(POSTCODE_AREAS).map(pc => (
                      <option key={pc} value={pc}>{pc}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Area
                  </label>
                  <input
                    type="text"
                    value={cvData.area}
                    onChange={(e) => setCvData({ ...cvData, area: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="East London"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                    Willing to Travel
                  </label>
                  <select
                    value={cvData.willingToTravel}
                    onChange={(e) => setCvData({ ...cvData, willingToTravel: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    {TRAVEL_DISTANCES.map(dist => (
                      <option key={dist.value} value={dist.value}>{dist.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Experience */}
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Experience</h2>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  Years of Experience
                </label>
                <input
                  type="number"
                  value={cvData.yearsExperience}
                  onChange={(e) => setCvData({ ...cvData, yearsExperience: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="12"
                  min="0"
                />
              </div>
            </div>

            {/* Locum Hospitals */}
            <div>
              <LocumHospitalsSelector
                selectedHospitals={cvData.locumHospitals}
                onUpdate={(hospitals) => setCvData({ ...cvData, locumHospitals: hospitals })}
              />
            </div>

            {/* Professional Summary */}
            <div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">Professional Summary</h2>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2">
                  About You
                </label>
                <textarea
                  value={cvData.professionalSummary}
                  onChange={(e) => setCvData({ ...cvData, professionalSummary: e.target.value })}
                  rows={6}
                  className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Experienced Theatre Manager with 12 years in NHS theatre operations..."
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={handleSave}
                className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 text-white rounded-lg hover:shadow-lg transition-all text-sm sm:text-base"
                style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}
              >
                <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                Save CV
              </button>
              <button
                type="button"
                onClick={handlePreview}
                className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 text-white rounded-lg hover:shadow-lg transition-all text-sm sm:text-base"
                style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}
              >
                <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                Preview
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
