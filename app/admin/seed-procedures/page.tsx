'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function SeedProceduresPage() {
  const router = useRouter();
  const [seeding, setSeeding] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    count?: number;
  } | null>(null);

  const handleSeed = async () => {
    setSeeding(true);
    setResult(null);

    try {
      const response = await fetch('/api/seed-procedures', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          count: data.count,
        });
      } else {
        setResult({
          success: false,
          message: data.error || 'Failed to seed procedures',
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div
        className="text-white sticky top-0 z-50 shadow-xl"
        style={{
          background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)',
        }}
      >
        <div className="px-3 md:px-4 py-2 md:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 md:gap-3">
              <button
                onClick={() => router.push('/admin')}
                className="flex items-center gap-1 md:gap-2 hover:bg-white/20 px-2 py-1 md:px-3 md:py-2 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-xs md:text-sm font-medium">Back</span>
              </button>
              <div>
                <h1 className="text-base md:text-xl font-bold flex items-center gap-2">
                  <Plus className="w-4 h-4 md:w-5 md:h-5" />
                  Seed Procedures
                </h1>
                <p className="text-[10px] md:text-xs text-white/90 hidden sm:block">
                  Populate Firebase with comprehensive surgical procedures
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full px-3 md:px-8 py-4 md:py-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-sky-300">
            <div
              className="px-4 md:px-6 py-3 md:py-4 border-b-2 border-sky-300"
              style={{
                background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)',
              }}
            >
              <h2 className="text-sm md:text-base font-bold flex items-center gap-2 text-white">
                <Plus className="w-4 h-4 md:w-5 md:h-5 text-white" />
                Seed Procedure Database
              </h2>
              <p className="text-[10px] md:text-xs mt-1 text-white/90">
                Add 274+ surgical procedures with OPCS-4 codes to your database
              </p>
            </div>

            <div className="p-4 md:p-6">
              {/* Info Section */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">
                  What will be seeded:
                </h3>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>• <strong>Trauma & Orthopaedics:</strong> 120 procedures (Upper Limb, Hip & Knee, Foot & Ankle, Spine)</li>
                  <li>• <strong>General Surgery:</strong> 150 procedures (Upper GI, Colorectal, Breast, Vascular, Emergency)</li>
                  <li>• <strong>ENT:</strong> 30 procedures (Otology)</li>
                  <li>• All procedures include accurate OPCS-4 codes and common variations</li>
                  <li>• At least 30 procedures per specialty/subspecialty combination</li>
                </ul>
              </div>

              {/* Seed Button */}
              <div className="flex flex-col items-center justify-center py-8">
                <button
                  onClick={handleSeed}
                  disabled={seeding}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all font-semibold text-base flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {seeding ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Seeding Procedures...
                    </>
                  ) : (
                    <>
                      <Plus className="w-5 h-5" />
                      Seed Procedures
                    </>
                  )}
                </button>

                {seeding && (
                  <p className="text-xs text-gray-600 mt-3">
                    This may take a minute...
                  </p>
                )}
              </div>

              {/* Result Section */}
              {result && (
                <div
                  className={`rounded-lg p-4 mt-6 ${
                    result.success
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h4
                        className={`text-sm font-semibold mb-1 ${
                          result.success ? 'text-green-900' : 'text-red-900'
                        }`}
                      >
                        {result.success ? 'Success!' : 'Error'}
                      </h4>
                      <p
                        className={`text-xs ${
                          result.success ? 'text-green-800' : 'text-red-800'
                        }`}
                      >
                        {result.message}
                      </p>
                      {result.count && (
                        <p className="text-xs text-green-700 mt-2">
                          <strong>{result.count} procedures</strong> successfully added to the database.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Warning Section */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-amber-900 mb-1">
                      Note
                    </h4>
                    <p className="text-xs text-amber-800">
                      This will add procedures to your Firebase database. Existing procedures with
                      the same ID will be overwritten. This is safe to run multiple times.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
