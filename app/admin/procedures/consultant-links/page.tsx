'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, User, Settings, HelpCircle, LogOut } from 'lucide-react';
import HospitalSelector from '@/components/HospitalSelector';
import ConsultantProcedureLinker from '@/components/procedures/ConsultantProcedureLinker';
import AdminBottomNav from '@/components/AdminBottomNav';
import AdminDrawer from '@/components/AdminDrawer';

export default function ConsultantLinksPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState<'ai' | 'home' | 'ops' | 'theatres' | 'alerts' | 'menu'>('theatres');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerType, setDrawerType] = useState<'theatres' | 'menu' | 'workforce' | 'inventory' | 'ops' | 'alerts' | null>(null);

  const handleBottomNavClick = (page: 'ai' | 'home' | 'ops' | 'theatres' | 'alerts' | 'menu') => {
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
      router.push('/admin/dashboard');
    } else if (viewId === 'schedule' || viewId === 'sessions') {
      router.push('/admin/schedule');
    } else if (viewId === 'list' || viewId === 'waiting-list') {
      router.push('/admin/waiting-list');
    } else if (viewId === 'readiness') {
      router.push('/admin/readiness');
    } else if (viewId === 'analytics') {
      router.push('/admin/operations');
    } else if (viewId === 'requirements') {
      router.push('/admin/staff-requirements');
    } else if (viewId === 'workforce') {
      router.push('/admin/workforce');
    } else if (viewId === 'inventory') {
      router.push('/admin/inventory');
    } else if (viewId === 'opcs4-database') {
      router.push('/admin/procedures/opcs4-database');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Demo Header */}
      <div
        onClick={() => router.push('/')}
        className="w-full bg-purple-600 text-white flex items-center justify-center gap-3 px-4 cursor-pointer hover:bg-purple-700 transition-colors"
        style={{ height: '28px' }}
      >
        <p className="text-sm font-bold whitespace-nowrap">ADMIN DEMO ACCOUNT</p>
        <p className="text-[10px] font-medium whitespace-nowrap opacity-90">Click here to switch</p>
      </div>

      {/* Header - Desktop */}
      <div className="hidden md:block text-white shadow-lg" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}>
        <div className="px-3 md:px-6 py-2 md:py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">TOM by MEDASKCA</h1>
            <p className="text-sm text-white/90">Theatre Operations Manager</p>
            <p className="text-xs italic text-white/80">Demo for NHSCEP Cohort 10</p>
          </div>
          <div className="flex items-center gap-2">
            <HospitalSelector />

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm border-2 border-white/30">
                  AM
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-white">Alexander Monterubio</p>
                  <p className="text-xs text-white/70">Team Leader</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-white/80 transition-transform ${showProfileDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                  <button
                    onClick={() => {
                      router.push('/profile');
                      setShowProfileDropdown(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 text-gray-700 transition-colors"
                  >
                    <User className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">Profile</span>
                  </button>
                  <button className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 text-gray-700 transition-colors">
                    <Settings className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">Settings</span>
                  </button>
                  <button className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 text-gray-700 transition-colors">
                    <HelpCircle className="w-5 h-5 text-gray-500" />
                    <span className="font-medium">Help & Support</span>
                  </button>
                  <div className="border-t border-gray-200 my-2"></div>
                  <button className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 text-red-600 transition-colors">
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:block bg-white border-b border-gray-200">
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center space-x-1 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap text-gray-600 border-transparent hover:text-gray-900"
            >
              Home
            </button>
            <button
              onClick={() => router.push('/admin/procedures/opcs4-database')}
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap text-gray-600 border-transparent hover:text-gray-900"
            >
              OPCS4 Database
            </button>
            <button
              onClick={() => router.push('/admin/procedures/preference-cards')}
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap text-gray-600 border-transparent hover:text-gray-900"
            >
              Preference Cards
            </button>
            <button
              onClick={() => router.push('/admin/procedures/consultant-links')}
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap focus:outline-none"
              style={{color: '#06B6D4', borderBottom: '2px solid #06B6D4'}}
            >
              Consultant Links
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden text-white sticky top-0 z-30 shadow-xl" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}>
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-sm font-bold">Consultant-Procedure Links</h1>
              <p className="text-[10px] text-white/90">Link consultants to procedures</p>
            </div>
            <HospitalSelector />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 pb-20 md:pb-6">
        <ConsultantProcedureLinker />
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
