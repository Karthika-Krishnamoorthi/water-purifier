import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { downloadCsv } from '../../utils/engine';
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import {
  Sliders,
  Cpu,
  Wrench,
  Download,
  RotateCcw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Save,
  HelpCircle,
  FileSpreadsheet,
  Shield,
  Layers,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    restoreDefaultSettings,
    clearAllDemoData,
    dailyUsageHistory,
    serviceHistory,
  } = useApp();

  // Local form state
  const [formData, setFormData] = useState({
    deviceName: settings.deviceName,
    deviceId: settings.deviceId,
    filterLimitLiters: settings.filterLimitLiters.toString(),
    warningThresholdPercent: settings.warningThresholdPercent.toString(),
    maxServiceIntervalDays: settings.maxServiceIntervalDays.toString(),
    lastServiceDate: settings.lastServiceDate,
    dailyUsageTargetLiters: settings.dailyUsageTargetLiters.toString(),
    flowSensorCalibrationFactor: settings.flowSensorCalibrationFactor.toString(),
    hardwareMqttTopic: settings.hardwareMqttTopic,
    operatingMode: settings.operatingMode,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaveSuccess(false);
    if (formErrors[field]) {
      setFormErrors(prev => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    const limit = parseFloat(formData.filterLimitLiters);
    const warning = parseFloat(formData.warningThresholdPercent);
    const maxDays = parseInt(formData.maxServiceIntervalDays, 10);
    const target = parseFloat(formData.dailyUsageTargetLiters);
    const cal = parseFloat(formData.flowSensorCalibrationFactor);

    const result = updateSettings({
      deviceName: formData.deviceName.trim() || 'ClearSense Monitor',
      deviceId: formData.deviceId.trim() || 'CS-ESP32',
      filterLimitLiters: limit,
      warningThresholdPercent: warning,
      maxServiceIntervalDays: maxDays,
      lastServiceDate: formData.lastServiceDate,
      dailyUsageTargetLiters: target,
      flowSensorCalibrationFactor: cal,
      hardwareMqttTopic: formData.hardwareMqttTopic.trim(),
      operatingMode: formData.operatingMode as any,
    });

    if (!result.success && result.errors) {
      setFormErrors(result.errors);
      setSaveSuccess(false);
    } else {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleExportUsageCsv = () => {
    const headers = ['Date', 'Display Date', 'Purified Volume (L)', 'Cumulative End (L)', 'Peak Flow (L/min)'];
    const rows = dailyUsageHistory.map(d => [
      d.date,
      d.displayDate,
      d.liters,
      d.cumulativeEndLiters,
      d.peakFlowLpm,
    ]);
    downloadCsv(`clearsense_daily_usage_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  const handleExportServiceCsv = () => {
    const headers = ['ID', 'Date', 'Service Type', 'Pre-Service Usage (L)', 'Status at Service', 'Technician', 'Notes'];
    const rows = serviceHistory.map(s => [
      s.id,
      s.date,
      s.serviceType,
      s.cumulativeUsageBeforeServiceLiters,
      s.statusBeforeService,
      s.technicianOrUser,
      s.notes,
    ]);
    downloadCsv(`clearsense_service_history_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">System Configuration &amp; Parameters</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Hardware interface options, algorithmic service thresholds, and local storage administration.
          </p>
        </div>

        {saveSuccess && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
            <CheckCircle2 className="w-4 h-4" />
            Configuration Saved &amp; Applied
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section A: Maintenance Thresholds */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="p-2 bg-teal-100 text-teal-800 rounded-xl">
              <Wrench className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Algorithmic Maintenance Engine Thresholds</h3>
              <p className="text-xs text-slate-500">
                Rule-based thresholds for NORMAL, CHECK SOON, and SERVICE REQUIRED status evaluation.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Filter Capacity Limit (Liters):
              </label>
              <input
                type="number"
                value={formData.filterLimitLiters}
                onChange={(e) => handleChange('filterLimitLiters', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-teal-600 font-mono text-slate-900"
              />
              {formErrors.filterLimitLiters ? (
                <span className="text-rose-600 text-[11px] mt-1 block">{formErrors.filterLimitLiters}</span>
              ) : (
                <span className="text-slate-400 text-[11px] mt-1 block">Default: 1000 L</span>
              )}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Warning Threshold (% of limit):
              </label>
              <input
                type="number"
                value={formData.warningThresholdPercent}
                onChange={(e) => handleChange('warningThresholdPercent', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-teal-600 font-mono text-slate-900"
              />
              {formErrors.warningThresholdPercent ? (
                <span className="text-rose-600 text-[11px] mt-1 block">{formErrors.warningThresholdPercent}</span>
              ) : (
                <span className="text-slate-400 text-[11px] mt-1 block">
                  Triggers CHECK SOON at {((parseFloat(formData.filterLimitLiters) || 1000) * (parseFloat(formData.warningThresholdPercent) || 80) / 100).toFixed(0)} L
                </span>
              )}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Maximum Service Interval (Days):
              </label>
              <input
                type="number"
                value={formData.maxServiceIntervalDays}
                onChange={(e) => handleChange('maxServiceIntervalDays', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-teal-600 font-mono text-slate-900"
              />
              {formErrors.maxServiceIntervalDays ? (
                <span className="text-rose-600 text-[11px] mt-1 block">{formErrors.maxServiceIntervalDays}</span>
              ) : (
                <span className="text-slate-400 text-[11px] mt-1 block">Calendar limit (default: 180 days)</span>
              )}
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Last Filter Service Date:
              </label>
              <input
                type="date"
                value={formData.lastServiceDate}
                onChange={(e) => handleChange('lastServiceDate', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-teal-600 text-slate-900"
              />
              <span className="text-slate-400 text-[11px] mt-1 block">Determines days elapsed</span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Daily Household Target (Liters):
              </label>
              <input
                type="number"
                step="0.5"
                value={formData.dailyUsageTargetLiters}
                onChange={(e) => handleChange('dailyUsageTargetLiters', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-teal-600 font-mono text-slate-900"
              />
              <span className="text-slate-400 text-[11px] mt-1 block">Target reference for Overview cards</span>
            </div>
          </div>
        </div>

        {/* Section B: Device Profile & ESP32 Integration Specs */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <div className="p-2 bg-sky-100 text-sky-800 rounded-xl">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Hardware Bridge &amp; ESP32 Profile</h3>
              <p className="text-xs text-slate-500">
                Operating mode parameters for physical microcontroller or synthetic telemetry.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Device Label:</label>
              <input
                type="text"
                value={formData.deviceName}
                onChange={(e) => handleChange('deviceName', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-teal-600 text-slate-900"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Hardware ID:</label>
              <input
                type="text"
                value={formData.deviceId}
                onChange={(e) => handleChange('deviceId', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-teal-600 font-mono text-slate-900"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Operating Mode:</label>
              <select
                value={formData.operatingMode}
                onChange={(e: any) => handleChange('operatingMode', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-teal-600 text-slate-900 font-medium"
              >
                <option value="demo">Demo Mode (Client Synthetic Stream)</option>
                <option value="hardware_ready">Hardware-Ready (External ESP32 Bridge)</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Flow Calibration Factor (Pulses / Liter):
              </label>
              <input
                type="number"
                value={formData.flowSensorCalibrationFactor}
                onChange={(e) => handleChange('flowSensorCalibrationFactor', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-teal-600 font-mono text-slate-900"
              />
              <span className="text-slate-400 text-[11px] mt-1 block">YF-S201 standard: 450 pulses/L</span>
            </div>

            <div className="md:col-span-2">
              <label className="font-semibold text-slate-700 block mb-1">MQTT Telemetry Topic:</label>
              <input
                type="text"
                value={formData.hardwareMqttTopic}
                onChange={(e) => handleChange('hardwareMqttTopic', e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-teal-600 font-mono text-slate-900"
              />
              <span className="text-slate-400 text-[11px] mt-1 block">Published by ESP32 firmware</span>
            </div>
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
          <span className="text-xs text-slate-500">
            Changes persist to your browser's localStorage immediately.
          </span>
          <button
            type="submit"
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>

      {/* Section C: Data Management & Exports */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <div className="p-2 bg-indigo-100 text-indigo-800 rounded-xl">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Data Management &amp; Persistence</h3>
            <p className="text-xs text-slate-500">
              Export data sheets for jury presentation or restore default baseline state.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <button
            type="button"
            onClick={handleExportUsageCsv}
            className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-3 transition-colors text-left"
          >
            <Download className="w-5 h-5 text-teal-600 shrink-0" />
            <div>
              <span className="font-bold text-slate-800 block">Export Usage History</span>
              <span className="text-[11px] text-slate-500">Download CSV dataset</span>
            </div>
          </button>

          <button
            type="button"
            onClick={handleExportServiceCsv}
            className="p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-3 transition-colors text-left"
          >
            <Download className="w-5 h-5 text-sky-600 shrink-0" />
            <div>
              <span className="font-bold text-slate-800 block">Export Service Ledger</span>
              <span className="text-[11px] text-slate-500">Maintenance events CSV</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setShowRestoreConfirm(true)}
            className="p-3.5 bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200 rounded-xl flex items-center gap-3 transition-colors text-left"
          >
            <RotateCcw className="w-5 h-5 text-amber-700 shrink-0" />
            <div>
              <span className="font-bold text-amber-900 block">Restore Defaults</span>
              <span className="text-[11px] text-amber-700">Reset 1000L &amp; 80% limits</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="p-3.5 bg-rose-50/70 hover:bg-rose-100/70 border border-rose-200 rounded-xl flex items-center gap-3 transition-colors text-left"
          >
            <Trash2 className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <span className="font-bold text-rose-900 block">Clear All Local Data</span>
              <span className="text-[11px] text-rose-700">Wipe storage counters</span>
            </div>
          </button>
        </div>
      </div>

      {/* Safety Disclaimer */}
      <DisclaimerBanner />

      {/* Restore Defaults Confirmation */}
      {showRestoreConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base mb-1">Restore Factory Settings?</h3>
            <p className="text-xs text-slate-600 mb-4">
              This will restore standard demonstration limits (1000 L capacity, 80% warning threshold, 180-day cycle). Your usage history will be retained.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowRestoreConfirm(false)}
                className="px-3.5 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  restoreDefaultSettings();
                  setShowRestoreConfirm(false);
                }}
                className="px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700"
              >
                Restore Defaults
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Data Confirmation */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-200">
            <h3 className="font-bold text-slate-900 text-base mb-1">Wipe All Demonstration Data?</h3>
            <p className="text-xs text-slate-600 mb-4">
              This will clear all localStorage keys for ClearSense, resetting cumulative counters, service records, and simulated telemetry logs.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3.5 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearAllDemoData();
                  setShowClearConfirm(false);
                }}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700"
              >
                Clear Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
