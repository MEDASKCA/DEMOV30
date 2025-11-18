'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Wrench, ChevronDown, User, Settings, HelpCircle, LogOut } from 'lucide-react';
import EquipmentView from '@/components/views/EquipmentView';
import HospitalSelector from '@/components/HospitalSelector';
import AdminBottomNav from '@/components/AdminBottomNav';
import AdminDrawer from '@/components/AdminDrawer';

export default function EquipmentPage() {
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
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap text-gray-600 border-transparent hover:text-gray-900 focus:outline-none"
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
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap focus:outline-none"
              style={{color: '#06B6D4', borderBottom: '2px solid #06B6D4'}}
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

      {/* Page Header - Mobile Only */}
      <div className="md:hidden text-white sticky top-0 z-50 shadow-lg" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <button
                onClick={() => router.push('/admin')}
                className="flex items-center gap-2 hover:bg-white/20 px-3 py-2 rounded-lg transition-all active:scale-95"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm font-semibold">Back</span>
              </button>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <Wrench className="w-5 h-5" />
                  Equipment
                  <span className="bg-white/20 px-2 py-0.5 rounded text-xs font-bold">Admin</span>
                </h1>
                <p className="text-sm text-white/90 mt-0.5">
                  Equipment management & tracking
                </p>
              </div>
            </div>
            <HospitalSelector />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-gray-50">
        <EquipmentView isAdmin={true} />
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
