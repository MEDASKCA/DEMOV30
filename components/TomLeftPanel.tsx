'use client';

import React, { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { X, ChevronLeft, ChevronRight, Calendar, Users, Search, FileText, Package, Menu } from 'lucide-react';
import TomAIChatPanel from './views/TomAIView';
import MedaskLogo from './MedaskLogo';

interface TomLeftPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen?: () => void;
  onCollapseChange?: (collapsed: boolean) => void;
  isMobile?: boolean;
}

export default function TomLeftPanel({ isOpen, onClose, onOpen, onCollapseChange, isMobile = false }: TomLeftPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleCollapse = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    onCollapseChange?.(collapsed);
  };
  const router = useRouter();
  const pathname = usePathname();

  // Get current page context
  const getCurrentPageContext = () => {
    if (pathname.includes('/dashboard')) return 'Dashboard';
    if (pathname.includes('/schedule')) return 'Schedule';
    if (pathname.includes('/workforce')) return 'Workforce';
    if (pathname.includes('/inventory')) return 'Supplies';
    if (pathname.includes('/procedures')) return 'Procedures';
    if (pathname.includes('/equipment')) return 'Equipment';
    if (pathname.includes('/admin')) return 'Admin';
    return 'TOM';
  };

  // Desktop: Fixed left panel
  if (!isMobile) {
    return (
      <div
        className={`absolute left-0 top-0 bottom-0 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transition-all duration-300 z-[100] flex flex-col ${
          isCollapsed ? 'w-16' : 'w-80'
        }`}
      >
        {/* TOM AI Header with Menu & Collapse Button */}
        {!isCollapsed ? (
          <div className="flex-shrink-0 bg-purple-400 text-white px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if ((window as any).openTomMenu) {
                    (window as any).openTomMenu();
                  }
                }}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                title="Menu"
              >
                <Menu className="w-4 h-4" />
              </button>
              <div>
                <h2 className="text-sm font-bold">TOM by MEDASKCA™</h2>
                <p className="text-xs text-white/80">{getCurrentPageContext()}</p>
              </div>
            </div>
            <button
              onClick={() => handleCollapse(true)}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              title="Collapse panel"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex-shrink-0 bg-purple-400 text-white px-2 py-3 flex items-center justify-center">
            <button
              onClick={() => handleCollapse(false)}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              title="Expand panel"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Panel Content */}
        {!isCollapsed ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* TOM Chat - Full Width */}
            <div className="flex-1 overflow-hidden">
              <TomAIChatPanel showHeader={false} onMenuOpen={() => {}} />
            </div>
          </div>
        ) : (
          // Collapsed state - Shortcut sidebar with icons
          <div className="flex-1 flex flex-col items-center pt-6 gap-3 overflow-y-auto">
            <img
              src="/medaskca-logo.png"
              alt="MEDASKCA Logo"
              className="w-9 h-9 object-contain"
            />

            {/* Shortcuts */}
            <div className="flex flex-col gap-2 w-full px-2">
              {/* Schedule Requirements/Allocation */}
              <button
                onClick={() => router.push('/admin/schedule')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors group relative"
                title="Schedule Requirements"
              >
                <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  Schedule
                </div>
              </button>

              {/* Shifts Teams */}
              <button
                onClick={() => router.push('/admin/workforce')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors group relative"
                title="Shifts Teams"
              >
                <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  Shifts/Teams
                </div>
              </button>

              {/* Shifts Finder */}
              <button
                onClick={() => router.push('/admin/workforce')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors group relative"
                title="Shifts Finder"
              >
                <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  Shifts Finder
                </div>
              </button>

              {/* OPCS4 Database */}
              <button
                onClick={() => router.push('/admin/procedures/opcs4-database')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors group relative"
                title="OPCS4 Database"
              >
                <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  OPCS4 Database
                </div>
              </button>

              {/* Supplies Stock */}
              <button
                onClick={() => router.push('/admin/inventory/stock')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors group relative"
                title="Supplies Stock"
              >
                <Package className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  Supplies/Stock
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Mobile: Collapsible drawer with tab
  return (
    <>
      {/* Backdrop - only show when fully open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90]"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 left-0 bg-white dark:bg-slate-900 shadow-2xl transform transition-all duration-300 z-[95] flex flex-col ${
          isOpen ? 'w-full sm:w-96 translate-x-0' : 'w-12 translate-x-0'
        }`}
      >
        {/* Collapsed Tab - Shows when drawer is minimized */}
        {!isOpen && (
          <div className="h-full relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpen?.();
              }}
              className="absolute top-1/2 -translate-y-1/2 left-0 w-12 h-24 bg-gradient-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center rounded-r-xl shadow-lg hover:shadow-2xl transition-all active:scale-95"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {!isOpen && (
          <div className="h-full flex items-center justify-center pt-20">
            <div className="transform -rotate-90">
              <MedaskLogo size={32} variant="icon-only" animate={false} />
            </div>
          </div>
        )}

        {/* Full Drawer Content - Shows when open */}
        {isOpen && (
          <>
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MedaskLogo size={40} variant="icon-only" animate={true} />
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                TOM AI
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {getCurrentPageContext()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* TOM Chat */}
        <div className="flex-1 overflow-hidden">
          <TomAIChatPanel showHeader={false} />
        </div>
        </>
        )}
      </div>
    </>
  );
}
