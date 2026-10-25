import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Activity,
  BarChart3,
  Wrench,
  History,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Cpu,
} from 'lucide-react';

export type NavTab = 'overview' | 'monitoring' | 'analytics' | 'maintenance' | 'history' | 'settings';

interface Props {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  onSelectTab,
  isMobileOpen,
  onCloseMobile,
}) => {
  const { maintenanceStatus, cumulativeLiters, settings } = useApp();

  const navItems: { id: NavTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'monitoring', label: 'Live Monitoring', icon: Activity, badge: 'Live' },
    { id: 'analytics', label: 'Usage Analytics', icon: BarChart3 },
    { id: 'maintenance', label: 'Filter Maintenance', icon: Wrench },
    { id: 'history', label: 'Service History', icon: History },
    { id: 'settings', label: 'Device & Settings', icon: Sliders },
  ];

  const handleNavClick = (id: NavTab) => {
    onSelectTab(id);
    onCloseMobile();
  };

  // Status visual badge
  const getStatusBadge = () => {
    switch (maintenanceStatus.level) {
      case 'NORMAL':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          icon: CheckCircle2,
          text: 'NORMAL',
        };
      case 'CHECK_SOON':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
          icon: AlertTriangle,
          text: 'CHECK SOON',
        };
      case 'SERVICE_REQUIRED':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
          icon: AlertCircle,
          text: 'SERVICE REQUIRED',
        };
    }
  };

  const statusBadge = getStatusBadge();
  const StatusIcon = statusBadge.icon;
  const usagePct = Math.min(100, Math.round((cumulativeLiters / settings.filterLimitLiters) * 100));

  return (
    <>
      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-35 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-36 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Navigation list */}
        <div className="p-3.5 space-y-1 overflow-y-auto">
          <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            System Navigation
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-xs shadow-teal-600/25 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-teal-50 text-teal-700 border border-teal-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Filter Health Card */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/70">
          <div className="bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Filter Health
              </span>
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge.bg}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot}`} />
                {statusBadge.text}
              </span>
            </div>

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-600">
                <span>{cumulativeLiters.toFixed(1)} L</span>
                <span className="font-semibold text-slate-900">{settings.filterLimitLiters} L limit</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    usagePct >= 100
                      ? 'bg-rose-500'
                      : usagePct >= settings.warningThresholdPercent
                      ? 'bg-amber-500'
                      : 'bg-teal-500'
                  }`}
                  style={{ width: `${Math.min(100, usagePct)}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400">
                <span>{maintenanceStatus.usageRemainingPercent}% remaining</span>
                <span>{maintenanceStatus.daysRemaining} days left</span>
              </div>
            </div>

            <button
              onClick={() => handleNavClick('maintenance')}
              className="mt-2.5 w-full py-1 text-center text-xs font-semibold text-teal-700 hover:text-teal-800 bg-teal-50/70 hover:bg-teal-100/70 rounded-lg transition-colors border border-teal-200/50"
            >
              Manage Filter
            </button>
          </div>

          <div className="mt-2.5 px-2 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <Cpu className="w-3 h-3 text-slate-400" />
              ESP32 Architecture Ready
            </span>
            <span>v1.0-atom</span>
          </div>
        </div>
      </aside>
    </>
  );
};
