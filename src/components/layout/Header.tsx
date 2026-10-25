import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Droplets, Bell, Wifi, WifiOff, AlertTriangle, Menu, X, Cpu } from 'lucide-react';
import { NotificationModal } from '../notifications/NotificationModal';

interface Props {
  onMobileMenuToggle: () => void;
  isMobileMenuOpen: boolean;
}

export const Header: React.FC<Props> = ({ onMobileMenuToggle, isMobileMenuOpen }) => {
  const { connectionState, settings, unreadNotificationCount } = useApp();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
      );
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200/90 sticky top-0 z-30 px-4 lg:px-6 flex items-center justify-between shadow-2xs">
        {/* Left: Mobile hamburger + Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuToggle}
            className="p-2 -ml-1 text-slate-600 hover:text-slate-900 lg:hidden rounded-lg hover:bg-slate-100"
            aria-label="Toggle Navigation"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-600 via-cyan-600 to-sky-500 flex items-center justify-center text-white shadow-xs shadow-teal-500/20">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">ClearSense</span>
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-sky-100 text-sky-800">
                  AtomQUEST '26
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden md:block">
                Predictive Maintenance Assistant • Track 2
              </p>
            </div>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2 sm:gap-3.5">
          {/* Prominent Demo Mode Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/70 text-amber-900 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span className="hidden sm:inline">DEMO MODE:</span>
            <span>Simulated Telemetry</span>
          </div>

          {/* Device Connection Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium bg-slate-50 border-slate-200">
            {connectionState === 'connected' && (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-slate-700">{settings.deviceId}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </>
            )}
            {connectionState === 'disconnected' && (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-500" />
                <span className="text-rose-700">Offline / No Signal</span>
              </>
            )}
            {connectionState === 'sensor_error' && (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span className="text-amber-800">Sensor Fault</span>
              </>
            )}
          </div>

          {/* Clock */}
          <div className="hidden xl:flex flex-col text-right text-xs text-slate-500 border-l border-slate-200 pl-3">
            <span className="font-mono font-medium text-slate-700">{currentTime}</span>
            <span className="text-[10px] text-slate-400">{currentDate}</span>
          </div>

          {/* Notification Icon */}
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="relative p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-teal-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white">
                {unreadNotificationCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Notification Drawer Modal */}
      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </>
  );
};
