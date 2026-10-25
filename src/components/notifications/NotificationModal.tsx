import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, CheckCheck, Trash2, X, AlertTriangle, AlertCircle, Info, CheckCircle2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,
  } = useApp();

  if (!isOpen) return null;

  const getIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-sky-500 shrink-0" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/30 backdrop-blur-xs flex justify-end">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-right"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-sky-100 text-sky-700 rounded-lg">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">System Notifications</h3>
              <p className="text-xs text-slate-500">Events, threshold alerts, and service logs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
            aria-label="Close notifications"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action toolbar */}
        {notifications.length > 0 && (
          <div className="px-4 py-2 border-b border-slate-100 bg-white flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">
              {notifications.length} message{notifications.length > 1 ? 's' : ''}
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={markAllNotificationsRead}
                className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-700 font-medium"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
              <span className="text-slate-200">|</span>
              <button
                onClick={clearNotifications}
                className="inline-flex items-center gap-1 text-slate-500 hover:text-rose-600 font-medium"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Bell className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
              <p className="text-sm font-medium text-slate-600">No Notifications</p>
              <p className="text-xs text-slate-400 mt-1">
                Threshold triggers and telemetry warnings will appear here.
              </p>
            </div>
          ) : (
            notifications.map(notif => (
              <div
                key={notif.id}
                onClick={() => markNotificationRead(notif.id)}
                className={`p-3.5 rounded-xl border text-xs transition-all cursor-pointer ${
                  notif.isRead
                    ? 'bg-white border-slate-200/80 opacity-80'
                    : 'bg-sky-50/40 border-sky-200 shadow-xs ring-1 ring-sky-300/30'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {getIcon(notif.severity)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-slate-900 truncate">{notif.title}</h4>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">
                        {notif.timestamp}
                      </span>
                    </div>
                    <p className="text-slate-600 leading-relaxed mb-1.5">{notif.message}</p>
                    {notif.recommendedAction && (
                      <div className="p-2 bg-slate-100/80 rounded-md border border-slate-200/50 text-[11px] text-slate-700">
                        <span className="font-semibold text-teal-800">Action: </span>
                        {notif.recommendedAction}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
