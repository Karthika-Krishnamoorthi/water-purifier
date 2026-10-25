import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { ServiceRecord, MaintenanceLevel } from '../../types';
import { downloadCsv } from '../../utils/engine';
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import {
  History,
  Plus,
  Download,
  Trash2,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Calendar,
  FileSpreadsheet,
  Info,
} from 'lucide-react';

export const ServiceHistoryView: React.FC = () => {
  const { serviceHistory, addServiceRecord, deleteServiceRecord, cumulativeLiters, maintenanceStatus } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form states for manual add
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newType, setNewType] = useState<ServiceRecord['serviceType']>('Inspection & Sanitization');
  const [newTech, setNewTech] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newPreUsage, setNewPreUsage] = useState(cumulativeLiters.toFixed(1));
  const [newPreStatus, setNewPreStatus] = useState<MaintenanceLevel>(maintenanceStatus.level);

  // Filtered list
  const filteredRecords = useMemo(() => {
    return serviceHistory.filter(record => {
      const matchesSearch =
        record.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.technicianOrUser.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.serviceType.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = filterType === 'all' || record.serviceType === filterType;

      return matchesSearch && matchesType;
    });
  }, [serviceHistory, searchQuery, filterType]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addServiceRecord({
      date: newDate,
      serviceType: newType,
      cumulativeUsageBeforeServiceLiters: parseFloat(newPreUsage) || 0,
      statusBeforeService: newPreStatus,
      technicianOrUser: newTech.trim() || 'Homeowner',
      notes: newNotes.trim() || 'Routine inspection logged.',
      isSystemGenerated: false,
    });
    setIsAddModalOpen(false);
    setNewTech('');
    setNewNotes('');
  };

  const handleExportCsv = () => {
    const headers = [
      'Record ID',
      'Service Date',
      'Service Type',
      'Cumulative Volume Before Service (L)',
      'Status Before Service',
      'Technician / Serviced By',
      'Service Notes',
    ];

    const rows = serviceHistory.map(r => [
      r.id,
      r.date,
      r.serviceType,
      r.cumulativeUsageBeforeServiceLiters,
      r.statusBeforeService,
      r.technicianOrUser,
      r.notes,
    ]);

    downloadCsv(`clearsense_service_history_${new Date().toISOString().split('T')[0]}.csv`, headers, rows);
  };

  const getStatusBadge = (status: MaintenanceLevel) => {
    switch (status) {
      case 'SERVICE_REQUIRED':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-500" />
            SERVICE REQUIRED
          </span>
        );
      case 'CHECK_SOON':
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-500" />
            CHECK SOON
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            NORMAL
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Maintenance &amp; Service Ledger</h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {serviceHistory.length} Recorded
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit trail of filter replacements, housing sanitizations, and component overhauls.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            disabled={serviceHistory.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Service Log</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search notes, technician, or service type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-teal-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-500 font-medium">Filter Type:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-teal-600"
          >
            <option value="all">All Service Types</option>
            <option value="Filter Replacement">Filter Replacement</option>
            <option value="Sediment Flush">Sediment Flush</option>
            <option value="Carbon Post-Filter">Carbon Post-Filter</option>
            <option value="RO Membrane Swap">RO Membrane Swap</option>
            <option value="Annual Overhaul">Annual Overhaul</option>
            <option value="Inspection & Sanitization">Inspection &amp; Sanitization</option>
          </select>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Service Type</th>
                <th className="py-3 px-4">Pre-Service Usage</th>
                <th className="py-3 px-4">Status at Service</th>
                <th className="py-3 px-4">Technician / Owner</th>
                <th className="py-3 px-4">Notes &amp; Observations</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <History className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
                    <p className="font-medium text-slate-600">No service records found</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {searchQuery || filterType !== 'all'
                        ? 'Try clearing your search filters.'
                        : 'Log your first maintenance event or record a filter replacement.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-800 whitespace-nowrap">
                      {record.date}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      {record.serviceType}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-teal-800 whitespace-nowrap">
                      {record.cumulativeUsageBeforeServiceLiters.toFixed(1)} L
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(record.statusBeforeService)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                      {record.technicianOrUser}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs leading-relaxed">
                      {record.notes}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setDeleteTargetId(record.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Delete service log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Safety Disclaimer */}
      <DisclaimerBanner />

      {/* Add Service Record Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-100 text-teal-800 rounded-xl">
                  <Plus className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-base">Log Maintenance Record</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Service Date:</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-teal-600"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Pre-Service Volume (L):</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newPreUsage}
                    onChange={(e) => setNewPreUsage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-teal-600 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Service Category:</label>
                <select
                  value={newType}
                  onChange={(e: any) => setNewType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-teal-600"
                >
                  <option value="Filter Replacement">Filter Replacement</option>
                  <option value="Sediment Flush">Sediment Pre-Filter Flush</option>
                  <option value="Carbon Post-Filter">Carbon Post-Filter Swap</option>
                  <option value="RO Membrane Swap">RO Membrane Replacement</option>
                  <option value="Annual Overhaul">Annual Overhaul</option>
                  <option value="Inspection & Sanitization">Inspection &amp; Sanitization</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Status at Service:</label>
                  <select
                    value={newPreStatus}
                    onChange={(e: any) => setNewPreStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-teal-600"
                  >
                    <option value="NORMAL">NORMAL</option>
                    <option value="CHECK_SOON">CHECK SOON</option>
                    <option value="SERVICE_REQUIRED">SERVICE REQUIRED</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Serviced By:</label>
                  <input
                    type="text"
                    placeholder="e.g. Technician / Self"
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Notes &amp; Cartridge Remarks:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Record observations, replaced component brands, flush duration, etc."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-teal-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 shadow-xs"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <Trash2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-1">Delete Service Log?</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Are you sure you want to delete this maintenance record? This action will remove the record from your localStorage audit trail.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="px-3.5 py-2 bg-slate-100 text-slate-700 rounded-xl font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteServiceRecord(deleteTargetId);
                  setDeleteTargetId(null);
                }}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold text-xs hover:bg-rose-700"
              >
                Delete Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
