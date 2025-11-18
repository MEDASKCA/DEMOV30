'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Database, ChevronDown, ChevronUp, Upload, CheckCircle, AlertCircle, User, Settings, HelpCircle, LogOut, Unlock, Lock } from 'lucide-react';
import ProceduresView from '@/components/views/ProceduresView';
import HospitalSelector from '@/components/HospitalSelector';
import AdminBottomNav from '@/components/AdminBottomNav';
import AdminDrawer from '@/components/AdminDrawer';
import { db } from '@/lib/firebase'; // Main Firebase (for other data)
import { proceduresDb } from '@/lib/firebase/proceduresFirebase'; // Procedures Firebase (for OPCS-4.11)
import { collection, writeBatch, doc, getDocs } from 'firebase/firestore';

// Map OPCS chapters to NHS specialties (matched to your surgeon database)
const CHAPTER_TO_SPECIALTY: Record<string, string> = {
  'A': 'NEUROLOGY',              // Nervous System
  'B': 'PLASTICS',                // Endocrine System and Breast
  'C': 'GENERAL SURGERY',         // Eye (no ophthalmology specialty)
  'D': 'ENT',                     // Ear
  'E': 'GENERAL SURGERY',         // Respiratory Tract
  'F': 'ORAL AND MAXILLOFACIAL',  // Mouth
  'G': 'GENERAL SURGERY',         // Upper Digestive System
  'H': 'GENERAL SURGERY',         // Lower Digestive System
  'J': 'GENERAL SURGERY',         // Other Abdominal Organs
  'K': 'GENERAL SURGERY',         // Heart (no cardiac surgery specialty)
  'L': 'GENERAL SURGERY',         // Arteries and Veins (no vascular specialty)
  'M': 'RENAL',                   // Urinary
  'N': 'UROLOGY',                 // Male Genital Organs
  'P': 'GYNAECOLOGY',             // Lower Female Genital Tract
  'Q': 'GYNAECOLOGY',             // Upper Female Genital Tract
  'R': 'GYNAECOLOGY',             // Female Genital Tract Associated with Pregnancy
  'S': 'PLASTICS',                // Skin
  'T': 'ORTHOPAEDICS',            // Soft Tissue
  'U': 'PLASTICS',                // Breast
  'V': 'NEUROLOGY',               // Bones and Joints of Skull and Spine
  'W': 'ORTHOPAEDICS',            // Other Bones and Joints
  'X': 'GENERAL SURGERY'          // Miscellaneous Operations
};

const CHAPTER_NAMES: Record<string, string> = {
  'A': 'Nervous System',
  'B': 'Endocrine System and Breast',
  'C': 'Eye',
  'D': 'Ear',
  'E': 'Respiratory Tract',
  'F': 'Mouth',
  'G': 'Upper Digestive System',
  'H': 'Lower Digestive System',
  'J': 'Other Abdominal Organs',
  'K': 'Heart',
  'L': 'Arteries and Veins',
  'M': 'Urinary',
  'N': 'Male Genital Organs',
  'P': 'Lower Female Genital Tract',
  'Q': 'Upper Female Genital Tract',
  'R': 'Female Genital Tract Associated with Pregnancy',
  'S': 'Skin',
  'T': 'Soft Tissue',
  'U': 'Breast',
  'V': 'Bones and Joints of Skull and Spine',
  'W': 'Other Bones and Joints',
  'X': 'Miscellaneous Operations'
};

export default function OPCS4DatabasePage() {
  const router = useRouter();
  const [showDatabaseMgmt, setShowDatabaseMgmt] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<'ai' | 'home' | 'ops' | 'theatres' | 'alerts' | 'menu' | 'workforce' | 'inventory'>('theatres');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerType, setDrawerType] = useState<'theatres' | 'menu' | 'workforce' | 'inventory' | 'ops' | 'alerts' | null>(null);
  const [socUnlocked, setSocUnlocked] = useState(false);
  const [procedureCount, setProcedureCount] = useState<number | null>(null);
  const [isLoadingCount, setIsLoadingCount] = useState(true);

  // Load procedure count on mount
  useEffect(() => {
    const loadProcedureCount = async () => {
      try {
        setIsLoadingCount(true);
        const snapshot = await getDocs(collection(proceduresDb, 'procedures'));
        setProcedureCount(snapshot.size);
        console.log(`📊 Loaded ${snapshot.size} procedures from Firebase`);
      } catch (error) {
        console.error('Error loading procedure count:', error);
        setProcedureCount(0);
      } finally {
        setIsLoadingCount(false);
      }
    };

    loadProcedureCount();
  }, []);

  const handleBottomNavClick = (page: 'ai' | 'home' | 'ops' | 'theatres' | 'alerts' | 'menu' | 'workforce' | 'inventory') => {
    setCurrentPage(page);

    if (page === 'home') {
      router.push('/admin');
    } else if (page === 'ai') {
      router.push('/admin');
    } else if (page === 'ops') {
      setDrawerType('ops');
      setShowDrawer(true);
    } else if (page === 'theatres') {
      setDrawerType('theatres');
      setShowDrawer(true);
    } else if (page === 'alerts') {
      setDrawerType('alerts');
      setShowDrawer(true);
    } else if (page === 'menu') {
      setDrawerType('menu');
      setShowDrawer(true);
    }
  };

  const handleDrawerNavigate = (viewId: string) => {
    setShowDrawer(false);

    if (viewId === 'dashboard') {
      router.push('/admin');
    } else if (viewId === 'configurations') {
      router.push('/admin/theatre-management?tab=configurations');
    } else if (viewId === 'sessions' || viewId === 'schedule') {
      router.push('/admin/schedule');
    } else if (viewId === 'list') {
      router.push('/admin/theatre-management?tab=list');
    } else if (viewId === 'requirements') {
      router.push('/admin/staff-allocation');
    } else if (viewId === 'workforce') {
      router.push('/admin/workforce');
    } else if (viewId === 'inventory') {
      router.push('/admin/inventory');
    } else if (viewId === 'opcs4-database') {
      router.push('/admin/procedures/opcs4-database');
    } else if (viewId === 'preference-cards') {
      router.push('/admin/procedures/preference-cards');
    }
  };

  const clearExistingProcedures = async () => {
    setUploadProgress('Clearing existing procedures...');
    const proceduresSnap = await getDocs(collection(proceduresDb, 'procedures'));

    let deleteCount = 0;
    let batch = writeBatch(proceduresDb);

    for (const docSnap of proceduresSnap.docs) {
      batch.delete(docSnap.ref);
      deleteCount++;

      if (deleteCount % 500 === 0) {
        await batch.commit();
        setUploadProgress(`Deleted ${deleteCount} procedures...`);
        batch = writeBatch(proceduresDb);
      }
    }

    if (deleteCount % 500 !== 0) {
      await batch.commit();
    }

    setUploadProgress(`Cleared ${deleteCount} existing procedures`);
    return deleteCount;
  };

  const handleOPCSTxtUpload = async (file: File) => {
    try {
      setUploadStatus('uploading');
      setUploadProgress('Reading file...');

      // Read file
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());

      console.log(`📖 Read ${lines.length} lines from file`);
      console.log('First line:', lines[0]);
      console.log('Second line:', lines[1]);

      setUploadProgress(`Found ${lines.length} lines`);

      // Clear existing procedures
      await clearExistingProcedures();

      // Parse procedures
      const procedures: any[] = [];
      let skipped = 0;

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Try tab-separated first
        let parts = line.split('\t');
        let code = '';
        let name = '';

        if (parts.length === 2) {
          // Tab-separated format: "A01	Major excision of tissue of brain"
          code = parts[0].trim();
          name = parts[1].trim();
        } else {
          // Fixed-width format: "1           A011        MAJOR EXCISION OF TISSUE OF BRAIN                           HEMISPHERECTOMY                                                                                              01"
          // Columns: [classification, code, category, specific_name, classification2]
          const spaceParts = line.split(/\s{2,}/).filter(p => p.trim());

          if (spaceParts.length >= 4) {
            // Column 2: Code (e.g., "A011")
            code = spaceParts[1]?.trim() || '';

            // Column 4: Specific procedure name (e.g., "HEMISPHERECTOMY")
            // This is the detailed name we want, not the category
            name = spaceParts[3]?.trim() || '';

            // Validate code format (should start with letter + digit)
            if (!/^[A-Z]\d/.test(code)) {
              code = '';
            }
          }
        }

        if (!code || !name || code.length < 2) {
          skipped++;
          if (i < 5) {
            console.log(`⚠️ Skipping line ${i}:`, line.substring(0, 100));
          }
          continue;
        }

        // Get chapter (first letter of code)
        const chapter = code.charAt(0).toUpperCase();
        const specialty = CHAPTER_TO_SPECIALTY[chapter] || 'GENERAL SURGERY';
        const chapterName = CHAPTER_NAMES[chapter] || 'Other';

        procedures.push({
          code,
          name,
          description: name,
          specialtyName: specialty,
          chapter,
          chapterName,
          version: 'OPCS-4.11',
          source: 'TRUD',
          importedAt: new Date().toISOString()
        });

        if (procedures.length <= 5) {
          console.log(`✅ Parsed #${procedures.length}: ${code} - ${name} (${specialty})`);
        }

        if (procedures.length === 100) {
          console.log(`   ... continuing (${procedures.length} parsed so far) ...`);
        }
      }

      console.log(`📊 Parsed ${procedures.length} procedures, skipped ${skipped} lines`);
      setUploadProgress(`Parsed ${procedures.length} procedures (skipped ${skipped})`);

      // Save to Firebase in batches
      console.log(`💾 Starting Firebase upload of ${procedures.length} procedures...`);

      if (procedures.length === 0) {
        throw new Error('No procedures to upload! Check parsing logic.');
      }

      let batch = writeBatch(proceduresDb);
      let batchCount = 0;
      let totalSaved = 0;

      for (const procedure of procedures) {
        try {
          const docRef = doc(collection(proceduresDb, 'procedures'));
          batch.set(docRef, procedure);
          batchCount++;
          totalSaved++;

          if (batchCount === 500) {
            console.log(`   Committing batch at ${totalSaved}...`);
            try {
              await batch.commit();
              console.log(`   ✅ Batch committed successfully`);
            } catch (batchError) {
              console.error(`   ❌ Batch commit failed:`, batchError);
              throw batchError;
            }
            setUploadProgress(`Saved ${totalSaved}/${procedures.length} procedures...`);
            batch = writeBatch(proceduresDb);
            batchCount = 0;
          }
        } catch (procError) {
          console.error(`   ❌ Error adding procedure to batch:`, procedure, procError);
          throw procError;
        }
      }

      // Commit remaining
      if (batchCount > 0) {
        console.log(`   Committing final batch of ${batchCount}...`);
        try {
          await batch.commit();
          console.log(`   ✅ Final batch committed successfully`);
        } catch (finalError) {
          console.error(`   ❌ Final batch commit failed:`, finalError);
          throw finalError;
        }
      }

      console.log(`🎉 Successfully uploaded ${totalSaved} procedures to Firebase!`);
      setUploadProgress(`Successfully imported ${totalSaved} procedures!`);
      setUploadStatus('success');

      // Refresh procedure count
      setProcedureCount(totalSaved);

      // Show success for 5 seconds
      setTimeout(() => {
        setUploadStatus('idle');
        setUploadProgress('');
      }, 5000);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setUploadStatus('error');

      setTimeout(() => {
        setUploadStatus('idle');
        setUploadProgress('');
      }, 5000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Desktop Navigation Bar */}
      <div className="hidden md:block bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap text-gray-600 border-transparent hover:text-gray-900 focus:outline-none"
            >
              Home
            </button>
            <button
              onClick={() => router.push('/admin/dashboard')}
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap text-gray-600 border-transparent hover:text-gray-900 focus:outline-none"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push('/admin/schedule')}
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap text-gray-600 border-transparent hover:text-gray-900 focus:outline-none"
            >
              Schedule
            </button>
            <button
              onClick={() => router.push('/admin/workforce')}
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap text-gray-600 border-transparent hover:text-gray-900 focus:outline-none"
            >
              Shifts
            </button>
            <button
              onClick={() => router.push('/admin/procedures/opcs4-database')}
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap focus:outline-none"
              style={{color: '#06B6D4', borderBottom: '2px solid #06B6D4'}}
            >
              Procedures & Preferences
            </button>
            <button
              onClick={() => router.push('/admin/inventory')}
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap text-gray-600 border-transparent hover:text-gray-900 focus:outline-none"
            >
              Supplies
            </button>
            <button
              onClick={() => router.push('/admin/equipment')}
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap text-gray-600 border-transparent hover:text-gray-900 focus:outline-none"
            >
              Equipment
            </button>
            <button
              onClick={() => router.push('/admin/readiness')}
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap text-gray-600 border-transparent hover:text-gray-900 focus:outline-none"
            >
              Readiness
            </button>
            <button
              onClick={() => router.push('/admin/operations')}
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap text-gray-600 border-transparent hover:text-gray-900 focus:outline-none"
            >
              Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Page Title & Description - Desktop Only */}
      <div className="hidden md:block px-6 py-4 bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Procedures & Preferences</h1>
            <p className="text-sm text-gray-600 mt-1">
              Surgical procedures, preference cards, clinical codes, and cost data
            </p>
          </div>
          {/* SOC Toggle - Desktop */}
          <button
            onClick={() => setSocUnlocked(!socUnlocked)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              socUnlocked
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {socUnlocked ? (
              <>
                <Unlock className="w-4 h-4" />
                <span>SOC Active</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Show SOC</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Page Header - Mobile Only */}
      <div className="md:hidden text-white sticky top-0 z-30 shadow-lg" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold flex items-center gap-2">
                <Database className="w-5 h-5" />
                Procedures & Preferences
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {/* SOC Toggle */}
              <button
                onClick={() => setSocUnlocked(!socUnlocked)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  socUnlocked
                    ? 'bg-green-500/20 text-green-100 border border-green-400/30'
                    : 'bg-white/10 text-white/90 border border-white/20'
                }`}
              >
                {socUnlocked ? (
                  <>
                    <Unlock className="w-3.5 h-3.5" />
                    <span>SOC</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>SOC</span>
                  </>
                )}
              </button>
              <HospitalSelector />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-4">
          {/* Collapsible Database Management Section */}
          <div className="bg-white rounded-xl shadow-lg border border-orange-200">
            <button
              onClick={() => setShowDatabaseMgmt(!showDatabaseMgmt)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors rounded-t-xl"
            >
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-orange-600" />
                <h2 className="text-base font-bold text-gray-900">OPCS-4 Database</h2>
              </div>
              {showDatabaseMgmt ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {showDatabaseMgmt && (
              <div className="px-4 pb-4 border-t border-gray-200">
                {/* Current Status */}
                <div className="mb-4 mt-4">
                  <p className="text-sm text-gray-600 mb-3">
                    NHS surgical procedures with codes & cost data
                  </p>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
                      <div className="text-sm text-green-700 font-medium">Version</div>
                      <div className="text-xl font-bold text-green-900">OPCS-4.11</div>
                      <div className="text-sm text-green-600 mt-1">Firebase (Live)</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
                      <div className="text-sm text-green-700 font-medium">Database</div>
                      <div className="text-xl font-bold text-green-900">opsc-4</div>
                      <div className="text-sm text-green-600 mt-1">Real-time</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
                      <div className="text-sm text-green-700 font-medium">Procedures</div>
                      <div className="text-xl font-bold text-green-900">
                        {isLoadingCount ? (
                          <span className="animate-pulse">...</span>
                        ) : procedureCount !== null ? (
                          procedureCount.toLocaleString()
                        ) : (
                          '0'
                        )}
                      </div>
                      <div className="text-sm text-green-600 mt-1">
                        {procedureCount === 0 ? 'No data yet' : '22 chapters'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Upload Section */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Update Database</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Upload JSON or OPCS TXT file, or sync from NHS Digital for updates.
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    <label className="flex items-center justify-center gap-2 px-4 py-2 text-sm bg-cyan-500 text-white font-semibold rounded hover:shadow-lg transition-all cursor-pointer">
                      <Upload className="w-4 h-4" />
                      <span className="font-medium">Upload File</span>
                      <input
                        type="file"
                        accept=".json,.txt"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          console.log('File selected:', file.name);

                          try {
                            if (file.name.endsWith('.txt')) {
                              // Handle OPCS TXT format
                              await handleOPCSTxtUpload(file);
                            } else {
                              // Handle JSON format
                              setUploadStatus('uploading');
                              const text = await file.text();
                              const data = JSON.parse(text);
                              console.log('JSON data:', data);
                              setUploadProgress('JSON upload not yet implemented');
                              setUploadStatus('error');
                              setTimeout(() => {
                                setUploadStatus('idle');
                                setUploadProgress('');
                              }, 3000);
                            }
                          } catch (error) {
                            console.error('Upload error:', error);
                            setUploadProgress(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
                            setUploadStatus('error');
                            setTimeout(() => {
                              setUploadStatus('idle');
                              setUploadProgress('');
                            }, 3000);
                          }

                          // Reset file input
                          e.target.value = '';
                        }}
                      />
                    </label>

                    <button className="px-4 py-2 text-sm font-medium bg-cyan-500 text-white rounded hover:bg-cyan-600 transition-colors">
                      Check NHS Digital
                    </button>
                  </div>

                  {/* Upload Status */}
                  {uploadStatus === 'uploading' && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                        <span className="text-sm font-semibold text-blue-900">Uploading...</span>
                      </div>
                      {uploadProgress && (
                        <p className="text-sm text-blue-700 ml-7">{uploadProgress}</p>
                      )}
                    </div>
                  )}

                  {uploadStatus === 'success' && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span className="text-sm font-semibold text-green-900">Success!</span>
                      </div>
                      {uploadProgress && (
                        <p className="text-sm text-green-700 ml-7">{uploadProgress}</p>
                      )}
                    </div>
                  )}

                  {uploadStatus === 'error' && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                        <span className="text-sm font-semibold text-red-900">Error</span>
                      </div>
                      {uploadProgress && (
                        <p className="text-sm text-red-700 ml-7">{uploadProgress}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Procedures View */}
          <div className="bg-white rounded-xl shadow-lg border border-orange-200 overflow-hidden">
            <ProceduresView isAdmin={true} socUnlocked={socUnlocked} />
          </div>
        </div>
      </div>

      {/* Bottom Navigation - Mobile */}
      <div className="md:hidden">
        <AdminBottomNav
          currentPage={currentPage}
          onNavigate={handleBottomNavClick}
        />
      </div>

      {/* Admin Drawer */}
      <AdminDrawer
        isOpen={showDrawer}
        onClose={() => setShowDrawer(false)}
        drawerType={drawerType}
        onNavigate={handleDrawerNavigate}
      />
    </div>
  );
}
