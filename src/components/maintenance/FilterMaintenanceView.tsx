import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NavTab } from '../layout/Sidebar';
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import {
  Wrench,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  RotateCcw,
  Calendar,
  Clock,
  ShieldCheck,
  Droplets,
  Layers,
  ArrowRight,
  Info,
  Sliders,
} from 'lucide-react';

interface Props {
  onNavigate: (tab: NavTab) => void;
}

export const FilterMaintenanceView: React.FC<Props> = ({ onNavigate }) => {
  const {
    maintenanceStatus,
    cumulativeLiters,
    settings,
    recordFilterReplacement,
    updateSettings,
  } = useApp();

  // Modals state
  const [showReplacementModal, setShowReplacementModal] = useState(false);
  const [techName, setTechName] = useState('');
  const [serviceNotes, setServiceNotes] = useState('');
  const [filterType, setFilterType] = useState<'Filter Replacement' | 'Sediment Flush' | 'RO Membrane Swap' | 'Carbon Post-Filter'>('Filter Replacement');
  
  // Date update modal
  const [showDateModal, setShowDateModal] = useState(false);
  const [newDateInput, setNewDateInput] = useState(settings.lastServiceDate);

  // Quick limits config modal
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [newLimit, setNewLimit] = useState(settings.filterLimitLiters.toString());
  const [newWarning, setNewWarning] = useState(settings.warningThresholdPercent.toString());
  const [newDays, setNewDays] = useState(settings.maxServiceIntervalDays.toString());
  const [configError, setConfigError] = useState<string | null>(null);

  const usagePercent = Math.min(100, Math.round((cumulativeLiters / settings.filterLimitLiters) * 100));

  const handleReplacementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    recordFilterReplacement(
      serviceNotes || `Routine ${filterType} performed. Cumulative volume zeroed.`,
      techName || 'Homeowner',
      filterType
    );
    setShowReplacementModal(false);
    setTechName('');
    setServiceNotes('');
  };

  const handleDateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({ lastServiceDate: newDateInput });
    setShowDateModal(false);
  };

  const handleConfigSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConfigError(null);
    const limit = parseFloat(newLimit);
    const warning = parseFloat(newWarning);
    const days = parseInt(newDays, 10);

    const res = updateSettings({
      filterLimitLiters: limit,
      warningThresholdPercent: warning,
      maxServiceIntervalDays: days,
    });

    if (!res.success && res.errors) {
      setConfigError(Object.values(res.errors)[0]);
      return;
    }
    setShowConfigModal(false);
  };

  const getStatusVisuals = () => {
    switch (maintenanceStatus.level) {
      case 'SERVICE_REQUIRED':
        return {
          badge: 'SERVICE REQUIRED',
          badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
          icon: AlertCircle,
          headerBg: 'bg-rose-50 border-rose-200',
        };
      case 'CHECK_SOON':
        return {
          badge: 'CHECK SOON',
          badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
          icon: AlertTriangle,
          headerBg: 'bg-amber-50 border-amber-200',
        };
      default:
        return {
          badge: 'NORMAL',
          badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: CheckCircle2,
          headerBg: 'bg-emerald-50 border-emerald-200',
        };
    }
  };

  const visual = getStatusVisuals();
  const StatusIcon = visual.icon;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className={`p-6 rounded-2xl border ${visual.headerBg} shadow-xs`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white rounded-xl shadow-2xs shrink-0">
              <StatusIcon className="w-8 h-8 text-slate-800" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${visual.badgeClass}`}>
                  {visual.badge}
                </span>
                <span className="text-xs text-slate-500">
                  {maintenanceStatus.usageRemainingPercent}% Life Remaining (Usage Estimation)
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Filter Stage Maintenance Manager
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                {maintenanceStatus.recommendedAction}
              </p>
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowReplacementModal(true)}
              className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Record Filter Replacement</span>
            </button>
            <button
              onClick={() => setShowConfigModal(true)}
              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Sliders className="w-4 h-4 text-slate-500" />
              <span>Edit Service Limits</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Gauge & Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Big Wear Progress Card */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Usage-Based Wear Tracking</h3>
              <p className="text-xs text-slate-500">
                Rule-based algorithmic estimator comparing cumulative water volume against service thresholds.
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-600">
              {cumulativeLiters.toFixed(1)} / {settings.filterLimitLiters} L
            </span>
          </div>

          {/* Visual Progress Bar with Threshold Markers */}
          <div className="space-y-3">
            <div className="flex justify-between items-baseline text-xs">
              <span className="font-semibold text-slate-700">Cumulative Monitored Volume</span>
              <span className="font-bold font-mono text-base text-slate-900">
                {usagePercent}% <span className="text-xs font-normal text-slate-500 font-sans">used</span>
              </span>
            </div>

            {/* Progress Track */}
            <div className="h-6 w-full bg-slate-100 rounded-xl overflow-hidden relative border border-slate-200/60 p-0.5">
              {/* Warning Threshold vertical dash */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-amber-500 z-10"
                style={{ left: `${settings.warningThresholdPercent}%` }}
                title={`Warning Limit (${settings.warningThresholdPercent}%)`}
              />
              <div
                className={`h-full rounded-lg transition-all duration-700 ${
                  usagePercent >= 100
                    ? 'bg-rose-500'
                    : usagePercent >= settings.warningThresholdPercent
                    ? 'bg-amber-500'
                    : 'bg-teal-500'
                }`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>

            {/* Threshold labels below track */}
            <div className="flex justify-between text-xs text-slate-500 pt-1">
              <span>0 L (New Filter)</span>
              <span className="text-amber-700 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Warning: {((settings.filterLimitLiters * settings.warningThresholdPercent) / 100).toFixed(0)} L ({settings.warningThresholdPercent}%)
              </span>
              <span className="text-rose-700 font-semibold">
                Limit: {settings.filterLimitLiters} L (100%)
              </span>
            </div>
          </div>

          {/* Detailed Status Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70">
              <span className="text-xs text-slate-500 block mb-1">Estimated Remaining Volume</span>
              <span className="text-xl font-bold font-mono text-slate-900">
                {maintenanceStatus.usageRemainingLiters.toFixed(1)} L
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">
                Before reaching configured limit
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70">
              <span className="text-xs text-slate-500 block mb-1">Service Age Interval</span>
              <span className="text-xl font-bold font-mono text-slate-900">
                {maintenanceStatus.daysElapsed} days
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">
                Max interval: {settings.maxServiceIntervalDays} days
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70">
              <span className="text-xs text-slate-500 block mb-1">Time Remaining</span>
              <span className="text-xl font-bold font-mono text-slate-900">
                {maintenanceStatus.daysRemaining} days
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">
                Calendar deadline
              </span>
            </div>
          </div>

          {/* Trigger Explanation Notice */}
          <div className="p-4 bg-sky-50/70 rounded-xl border border-sky-200/70 text-xs text-slate-700 space-y-1">
            <h4 className="font-semibold text-slate-900 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-sky-600" />
              Engine Decision Rationale:
            </h4>
            <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
              {maintenanceStatus.reasons.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Cartridge & Stage Info + Actions */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h4 className="font-bold text-slate-900 text-sm">Service Actions</h4>

            <div className="space-y-2">
              <button
                onClick={() => setShowReplacementModal(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors flex items-center justify-between"
              >
                <span>Record Filter Replacement</span>
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowDateModal(true)}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors flex items-center justify-between"
              >
                <span>Update Last Service Date</span>
                <Calendar className="w-4 h-4 text-slate-500" />
              </button>

              <button
                onClick={() => onNavigate('history')}
                className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold transition-colors flex items-center justify-between"
              >
                <span>View Full Service History</span>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>

          {/* Filtration Stage Overview */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-teal-600" />
              Complementary System Model
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              ClearSense acts as an external volumetric observer. It monitors cumulative water usage across typical domestic multi-stage RO/UV setups:
            </p>

            <div className="space-y-2 text-xs">
              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800">1. Spun PP Sediment</span>
                  <p className="text-[11px] text-slate-500">Traps suspended silt &amp; rust</p>
                </div>
                <span className="text-[10px] font-mono text-slate-600">5 Micron</span>
              </div>

              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800">2. Carbon Block (CTO)</span>
                  <p className="text-[11px] text-slate-500">Adsorbs chlorine &amp; odors</p>
                </div>
                <span className="text-[10px] font-mono text-slate-600">Active Adsorption</span>
              </div>

              <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-semibold text-slate-800">3. RO / Post UV Stage</span>
                  <p className="text-[11px] text-slate-500">Microbial disinfection</p>
                </div>
                <span className="text-[10px] font-mono text-slate-600">Certified Core</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2">
              <strong>Note:</strong> Estimates reflect volumetric throughput and elapsed days. Follow manufacturer schedule for certified stage replacements.
            </div>
          </div>
        </div>
      </div>

      {/* Safety Disclaimer */}
      <DisclaimerBanner />

      {/* 1. Record Filter Replacement Modal */}
      {showReplacementModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-100 text-teal-800 rounded-xl">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Record Filter Replacement</h3>
                  <p className="text-xs text-slate-500">Zero cumulative counter &amp; log service event</p>
                </div>
              </div>
              <button
                onClick={() => setShowReplacementModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReplacementSubmit} className="mt-4 space-y-4 text-xs">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                <span className="font-bold block mb-1">Confirmation Notice:</span>
                This will reset cumulative water usage from <strong className="font-mono">{cumulativeLiters.toFixed(1)} L</strong> to <strong className="font-mono">0.0 L</strong> and update the last service date to today. Historical records will be retained.
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Service Type:</label>
                <select
                  value={filterType}
                  onChange={(e: any) => setFilterType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-teal-600"
                >
                  <option value="Filter Replacement">Complete Filter Replacement</option>
                  <option value="Sediment Flush">Sediment Pre-Filter Flush</option>
                  <option value="Carbon Post-Filter">Carbon Post-Filter Swap</option>
                  <option value="RO Membrane Swap">RO Membrane Replacement</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Technician / Serviced By:</label>
                <input
                  type="text"
                  placeholder="e.g. Homeowner / Certified Technician"
                  value={techName}
                  onChange={(e) => setTechName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-teal-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Service Notes / Cartridge Serial:</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Installed 5-micron PP sediment cartridge. Flushed initial 10L."
                  value={serviceNotes}
                  onChange={(e) => setServiceNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-teal-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowReplacementModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold"
                >
                  Confirm &amp; Reset Counter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Update Date Modal */}
      {showDateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 border border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm mb-2">Update Last Service Date</h3>
            <p className="text-xs text-slate-500 mb-4">
              Recalculates elapsed service duration and time-based maintenance triggers.
            </p>
            <form onSubmit={handleDateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Last Service Date (YYYY-MM-DD):</label>
                <input
                  type="date"
                  value={newDateInput}
                  onChange={(e) => setNewDateInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-teal-600"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDateModal(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-lg font-semibold"
                >
                  Save Date
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Configure Service Limits Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Configure Service Limits</h3>
              <button onClick={() => setShowConfigModal(false)} className="text-slate-400">✕</button>
            </div>
            <form onSubmit={handleConfigSubmit} className="mt-4 space-y-3.5 text-xs">
              {configError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
                  {configError}
                </div>
              )}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Filter Service Limit (Liters):
                </label>
                <input
                  type="number"
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-teal-600 font-mono"
                />
                <span className="text-[10px] text-slate-400">Default demo: 1000 L</span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Warning Threshold (% of limit):
                </label>
                <input
                  type="number"
                  value={newWarning}
                  onChange={(e) => setNewWarning(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-teal-600 font-mono"
                />
                <span className="text-[10px] text-slate-400">Default demo: 80%</span>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Maximum Service Interval (Days):
                </label>
                <input
                  type="number"
                  value={newDays}
                  onChange={(e) => setNewDays(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-teal-600 font-mono"
                />
                <span className="text-[10px] text-slate-400">Default demo: 180 days</span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700"
                >
                  Apply &amp; Recalculate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
