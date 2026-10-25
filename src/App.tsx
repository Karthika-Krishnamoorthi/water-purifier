/**
 * ClearSense - Smart Monitoring and Predictive Maintenance System for Domestic Water Purifiers
 * Track 2: Water Purifier | AtomQUEST 2026
 */

import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { DemoScenarioBar } from './components/common/DemoScenarioBar';
import { OverviewView } from './components/dashboard/OverviewView';
import { LiveMonitoringView } from './components/monitoring/LiveMonitoringView';
import { UsageAnalyticsView } from './components/analytics/UsageAnalyticsView';
import { FilterMaintenanceView } from './components/maintenance/FilterMaintenanceView';
import { ServiceHistoryView } from './components/history/ServiceHistoryView';
import { SettingsView } from './components/settings/SettingsView';

function ClearSenseApp() {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* 1. Header */}
      <Header
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuToggle={() => setIsMobileMenuOpen(prev => !prev)}
      />

      {/* 2. Sticky Judge Scenarios Toolbar for Instant Demo Testing */}
      <DemoScenarioBar />

      <div className="flex-1 flex">
        {/* 3. Persistent Sidebar (Desktop) / Slide-over (Mobile) */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />

        {/* 4. Main Page View Content */}
        <main className="flex-1 lg:pl-64 min-w-0 flex flex-col">
          <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
            {activeTab === 'overview' && <OverviewView onNavigate={setActiveTab} />}
            {activeTab === 'monitoring' && <LiveMonitoringView />}
            {activeTab === 'analytics' && <UsageAnalyticsView />}
            {activeTab === 'maintenance' && <FilterMaintenanceView onNavigate={setActiveTab} />}
            {activeTab === 'history' && <ServiceHistoryView />}
            {activeTab === 'settings' && <SettingsView />}
          </div>

          {/* Footer note */}
          <footer className="border-t border-slate-200/80 bg-white/50 py-4 px-6 text-center text-xs text-slate-500">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
              <span>
                <strong>ClearSense</strong> — Track 2: Water Purifier • AtomQUEST 2026 Student Innovation Project
              </span>
              <span className="text-[11px] text-slate-400">
                Rule-Based Predictive Maintenance Engine • Hardware-Ready ESP32 Architecture
              </span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ClearSenseApp />
    </AppProvider>
  );
}
