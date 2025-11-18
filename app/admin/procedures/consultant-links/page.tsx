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
  const [currentPage, setCurrentPage] = useState<'ai' | 'home' | 'ops' | 'theatres' | 'alerts' | 'menu' | 'workforce' | 'inventory'>('theatres');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerType, setDrawerType] = useState<'theatres' | 'menu' | 'workforce' | 'inventory' | 'ops' | 'alerts' | null>(null);

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
