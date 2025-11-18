'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown, User, Settings, HelpCircle, LogOut, List, Grid3x3 } from 'lucide-react';
import HospitalSelector from '@/components/HospitalSelector';
import WaitingListManager from '@/components/waitingList/WaitingListManager';
import AdminBottomNav from '@/components/AdminBottomNav';
import AdminDrawer from '@/components/AdminDrawer';

function AdminListsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'waiting-list' | 'procedures-pool'>(
    (searchParams.get('tab') as 'waiting-list' | 'procedures-pool') || 'waiting-list'
  );
  const [currentPage, setCurrentPage] = useState<'ai' | 'home' | 'ops' | 'theatres' | 'alerts' | 'menu' | 'workforce' | 'inventory'>('ops');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerType, setDrawerType] = useState<'theatres' | 'menu' | 'workforce' | 'inventory' | 'ops' | 'alerts' | 'lists' | null>(null);

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
      router.push('/admin/sessions');
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
    }
  };

  const handleTabChange = (tab: 'waiting-list' | 'procedures-pool') => {
    setActiveTab(tab);
    router.push(`/admin/lists?tab=${tab}`, { scroll: false });
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
              onClick={() => router.push('/admin/dashboard')}
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap text-gray-600 border-transparent hover:text-gray-900"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push('/admin/sessions')}
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap text-gray-600 border-transparent hover:text-gray-900"
            >
              Sessions
            </button>
            <button
              onClick={() => router.push('/admin/lists')}
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap focus:outline-none"
              style={{color: '#06B6D4', borderBottom: '2px solid #06B6D4'}}
            >
              Lists
            </button>
            <button
              onClick={() => router.push('/admin/workforce')}
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap text-gray-600 border-transparent hover:text-gray-900"
            >
              Workforce
            </button>
            <button
              onClick={() => router.push('/admin/inventory')}
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap text-gray-600 border-transparent hover:text-gray-900"
            >
              Inventory
            </button>
            <button
              onClick={() => router.push('/admin/procedures/opcs4-database')}
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap text-gray-600 border-transparent hover:text-gray-900"
            >
              Procedures & Preferences
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden text-white sticky top-0 z-30 shadow-xl" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}>
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-sm font-bold">Lists</h1>
              <p className="text-[10px] text-white/90">Waiting list & procedures pool</p>
            </div>
            <HospitalSelector />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200 px-3 md:px-6 py-2 md:py-3 sticky top-0 md:top-auto z-20">
        <div className="flex gap-2">
          <button
            onClick={() => handleTabChange('waiting-list')}
            className={`flex items-center gap-2 px-3 md:px-4 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'waiting-list'
                ? 'bg-cyan-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <List className="w-4 h-4" />
            Waiting List
          </button>
          <button
            onClick={() => handleTabChange('procedures-pool')}
            className={`flex items-center gap-2 px-3 md:px-4 py-2 text-xs md:text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'procedures-pool'
                ? 'bg-cyan-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Grid3x3 className="w-4 h-4" />
            Procedures Pool
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 pb-20 md:pb-6">
        {activeTab === 'waiting-list' && <WaitingListManager />}
        {activeTab === 'procedures-pool' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <Grid3x3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Procedures Pool</h2>
            <p className="text-gray-600">
              RTT-tracked procedures & AI allocation coming soon...
            </p>
          </div>
        )}
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

export default function AdminListsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AdminListsPageContent />
    </Suspense>
  );
}
