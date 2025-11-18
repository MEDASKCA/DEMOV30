'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, Box, Warehouse, ShoppingCart, ClipboardList, FileText, Lock, Eye, EyeOff, ChevronDown, User, Settings, HelpCircle, LogOut } from 'lucide-react';
import InventoryView from '@/components/views/InventoryView';
import HospitalSelector from '@/components/HospitalSelector';
import AdminBottomNav from '@/components/AdminBottomNav';
import AdminDrawer from '@/components/AdminDrawer';

type SidebarTab = 'stock' | 'storage' | 'reorder' | 'requests' | 'audit';

export default function InventoryPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState<'ai' | 'home' | 'ops' | 'theatres' | 'alerts' | 'menu' | 'workforce' | 'inventory'>('theatres');
  const [activeTab, setActiveTab] = useState<SidebarTab>('stock');
  const [costUnlocked, setCostUnlocked] = useState(false);
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
    } else if (viewId === 'profile') {
      router.push('/profile');
    } else if (viewId === 'settings' || viewId === 'help' || viewId === 'critical-alerts' || viewId === 'pending-tasks' || viewId === 'incidents') {
      // Redirect to admin page for these views
      router.push('/admin');
    } else if (viewId === 'signout') {
      router.push('/');
    }
  };

  const sidebarItems = [
    { id: 'stock' as SidebarTab, label: 'Stock', icon: Box, description: 'Current inventory levels' },
    { id: 'storage' as SidebarTab, label: 'Storage', icon: Warehouse, description: 'Storage locations & organization' },
    { id: 'reorder' as SidebarTab, label: 'Reorder', icon: ShoppingCart, description: 'Reorder points & purchasing' },
    { id: 'requests' as SidebarTab, label: 'Requests', icon: ClipboardList, description: 'Staff supply requests' },
    { id: 'audit' as SidebarTab, label: 'Audit', icon: FileText, description: 'Stock audits & tracking' },
  ];

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
              className="px-4 py-4 font-semibold transition-colors border-b-2 whitespace-nowrap focus:outline-none"
              style={{color: '#06B6D4', borderBottom: '2px solid #06B6D4'}}
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
      <div className="hidden md:block px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Supplies Management</h1>
            <p className="text-sm text-gray-600 mt-1">
              Theatre equipment, consumables, and supplies catalog
            </p>
          </div>
          {/* Cost Button */}
          <div className="relative ml-4">
            {!costUnlocked ? (
              <button
                onClick={() => setCostUnlocked(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <Lock className="w-4 h-4" />
                <span>Unlock Cost</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm font-medium flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  <span>Cost Visible</span>
                </div>
                <button
                  onClick={() => setCostUnlocked(false)}
                  className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
                  title="Lock Cost"
                >
                  <EyeOff className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Page Header - Mobile Only */}
      <div className="md:hidden text-white sticky top-0 z-50 shadow-lg" style={{background: 'linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)'}}>
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold">
                Supplies
              </h1>
              <p className="text-sm text-white/90 mt-0.5">
                Supplies management & planning
              </p>
            </div>
            <HospitalSelector />
          </div>
        </div>
      </div>

      {/* Mobile Tabs */}
      <div className="md:hidden bg-white border-b border-gray-200 sticky top-[76px] z-40 overflow-x-auto scrollbar-hide">
        <div className="flex gap-1 px-2 py-2 min-w-max">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Desktop */}
        <div className="hidden md:block w-64 bg-white border-r border-gray-200">
          <div className="p-4 space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-start gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-teal-50 border-l-4 border-teal-600'
                      : 'hover:bg-gray-50 border-l-4 border-transparent'
                  }`}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    isActive ? 'text-teal-600' : 'text-gray-400'
                  }`} />
                  <div className="flex-1 text-left">
                    <div className={`font-semibold text-sm ${
                      isActive ? 'text-teal-900' : 'text-gray-700'
                    }`}>
                      {item.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {item.description}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-gray-50">
          <InventoryView isAdmin={true} fixedTab={activeTab} costUnlocked={costUnlocked} onCostUnlockedChange={setCostUnlocked} />
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
