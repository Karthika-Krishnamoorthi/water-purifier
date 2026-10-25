import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NavTab } from '../layout/Sidebar';
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Droplets,
  Gauge,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
  ComposedChart,
} from 'recharts';

interface Props {
  onNavigate: (tab: NavTab) => void;
}

export const OverviewView: React.FC<Props> = ({ onNavigate }) => {
  const {
    maintenanceStatus,
    cumulativeLiters,
    todayLiters,
    currentFlowRate,
    settings,
    dailyUsageHistory,
    indicativeTempC,
    indicativeTdsPpm,
  } = useApp();

  const [chartView, setChartView] = useState<'recent_7' | 'past_30'>('recent_7');

  // Prepare chart data slice
  const chartData = chartView === 'recent_7'
    ? dailyUsageHistory.slice(-7)
    : dailyUsageHistory;

  // Status visual attributes
  const getStatusDisplay = () => {
    switch (maintenanceStatus.level) {
      case 'SERVICE_REQUIRED':
        return {
          title: 'SERVICE REQUIRED',
          badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
          bannerBg: 'bg-gradient-to-r from-rose-50 via-white to-rose-50/50 border-rose-200',
          iconClass: 'text-rose-600 bg-rose-100',
          icon: AlertCircle,
          accentBorder: 'border-l-4 border-l-rose-500',
        };
      case 'CHECK_SOON':
        return {
          title: 'CHECK SOON',
          badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
          bannerBg: 'bg-gradient-to-r from-amber-50 via-white to-amber-50/50 border-amber-200',
          iconClass: 'text-amber-600 bg-amber-100',
          icon: AlertTriangle,
          accentBorder: 'border-l-4 border-l-amber-500',
        };
      case 'NORMAL':
      default:
        return {
          title: 'NORMAL',
          badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          bannerBg: 'bg-gradient-to-r from-emerald-50 via-white to-teal-50/40 border-emerald-200',
          iconClass: 'text-emerald-600 bg-emerald-100',
          icon: CheckCircle2,
          accentBorder: 'border-l-4 border-l-emerald-500',
        };
    }
  };

  const statusDisplay = getStatusDisplay();
  const StatusIcon = statusDisplay.icon;
  const usagePercent = Math.min(100, Math.round((cumulativeLiters / settings.filterLimitLiters) * 100));

  return (
    <div className="space-y-6">
      {/* 1. Maintenance Status Master Banner */}
      <div className={`p-5 rounded-2xl border ${statusDisplay.bannerBg} ${statusDisplay.accentBorder} shadow-xs`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${statusDisplay.iconClass} shrink-0`}>
              <StatusIcon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusDisplay.badgeClass}`}>
                  {statusDisplay.title}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Rule-based decision evaluated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">
                {maintenanceStatus.level === 'NORMAL' && 'System Healthy & Within Operating Bounds'}
                {maintenanceStatus.level === 'CHECK_SOON' && 'Approaching Maintenance Threshold'}
                {maintenanceStatus.level === 'SERVICE_REQUIRED' && 'Filter Replacement or Service Required'}
              </h2>
              <ul className="text-xs sm:text-sm text-slate-600 space-y-0.5 mb-2">
                {maintenanceStatus.reasons.map((r, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
              <div className="bg-white/80 p-2.5 rounded-lg border border-slate-200/60 inline-flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs text-slate-700">
                <span className="font-semibold text-slate-900">Recommended Next Action:</span>
                <span>{maintenanceStatus.recommendedAction}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 self-start md:self-center shrink-0">
            <button
              onClick={() => onNavigate('maintenance')}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
            >
              <span>View Filter Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('monitoring')}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
            >
              Live Telemetry
            </button>
          </div>
        </div>
      </div>

      {/* 2. Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* Metric 1: Current Flow Rate */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase text-slate-500">Flow Rate</span>
            <Gauge className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {currentFlowRate.toFixed(2)}
            </span>
            <span className="text-xs text-slate-500">L/min</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span className="px-1.5 py-0.5 rounded bg-slate-100 font-medium">
              {currentFlowRate > 0 ? 'Water Flowing' : 'Idle / No Flow'}
            </span>
            <span className="text-[10px] text-amber-600 font-medium">Simulated</span>
          </div>
        </div>

        {/* Metric 2: Today's Usage */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase text-slate-500">Today's Usage</span>
            <Droplets className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {todayLiters.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500">Liters</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Target: {settings.dailyUsageTargetLiters} L</span>
            <span className="font-medium text-teal-600">
              {Math.round((todayLiters / settings.dailyUsageTargetLiters) * 100)}%
            </span>
          </div>
        </div>

        {/* Metric 3: Cumulative Water Usage */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase text-slate-500">Cumulative Vol.</span>
            <TrendingUp className="w-4 h-4 text-sky-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {cumulativeLiters.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500">/ {settings.filterLimitLiters} L</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            <span>Since filter reset</span>
          </div>
        </div>

        {/* Metric 4: Filter Life Remaining */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase text-slate-500">Filter Life</span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold font-mono ${
              maintenanceStatus.usageRemainingPercent <= 20
                ? 'text-rose-600'
                : maintenanceStatus.usageRemainingPercent <= 40
                ? 'text-amber-600'
                : 'text-emerald-600'
            }`}>
              {maintenanceStatus.usageRemainingPercent}%
            </span>
            <span className="text-xs text-slate-500">est. remaining</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            <span>{maintenanceStatus.usageRemainingLiters.toFixed(0)} L headroom</span>
          </div>
        </div>

        {/* Metric 5: Last Service Date */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase text-slate-500">Last Service</span>
            <Calendar className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-lg font-bold text-slate-900 truncate">
            {settings.lastServiceDate}
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            <span>{maintenanceStatus.daysElapsed} days elapsed</span>
          </div>
        </div>

        {/* Metric 6: Next Service Estimate */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase text-slate-500">Next Service</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {maintenanceStatus.daysRemaining}
            </span>
            <span className="text-xs text-slate-500">days max</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            <span>Based on 180-day cycle</span>
          </div>
        </div>
      </div>

      {/* 3. Main Dashboard Body: Chart + Maintenance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Interactive Consumption Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">Water Consumption Profile</h3>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  DEMONSTRATION DATA
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Daily purified water output in liters. Tracked via simulated flow accumulator.
              </p>
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium self-start sm:self-auto">
              <button
                onClick={() => setChartView('recent_7')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  chartView === 'recent_7'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Last 7 Days
              </button>
              <button
                onClick={() => setChartView('past_30')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  chartView === 'past_30'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Last 30 Days
              </button>
            </div>
          </div>

          {/* Chart Graphic */}
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="displayDate"
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  unit=" L"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '0.75rem',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [`${value} Liters`, 'Water Consumption']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Bar
                  dataKey="liters"
                  fill="#0d9488"
                  radius={[4, 4, 0, 0]}
                  name="Consumption (L)"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-teal-600" />
                Purified Output (L)
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                Avg: {(chartData.reduce((a, b) => a + b.liters, 0) / chartData.length).toFixed(1)} L/day
              </span>
            </div>
            <button
              onClick={() => onNavigate('analytics')}
              className="inline-flex items-center gap-1 text-teal-700 font-semibold hover:text-teal-800"
            >
              <span>Detailed analytics breakdown</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Maintenance Summary Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-base">Maintenance Summary</h3>
              <button
                onClick={() => onNavigate('settings')}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Configure Limits
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              Configured service parameters compared to tracked cumulative usage.
            </p>

            {/* Threshold bars breakdown */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-700">Cumulative Usage</span>
                  <span className="font-mono font-bold text-slate-900">
                    {cumulativeLiters.toFixed(1)} L / {settings.filterLimitLiters} L
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden relative">
                  {/* Warning line marker at 80% */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-amber-500 z-10"
                    style={{ left: `${settings.warningThresholdPercent}%` }}
                    title={`Warning Threshold (${settings.warningThresholdPercent}%)`}
                  />
                  <div
                    className={`h-full transition-all duration-500 ${
                      usagePercent >= 100
                        ? 'bg-rose-500'
                        : usagePercent >= settings.warningThresholdPercent
                        ? 'bg-amber-500'
                        : 'bg-teal-500'
                    }`}
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                  <span>0 L</span>
                  <span className="text-amber-600 font-medium">
                    Warning at {((settings.filterLimitLiters * settings.warningThresholdPercent) / 100).toFixed(0)} L ({settings.warningThresholdPercent}%)
                  </span>
                  <span>{settings.filterLimitLiters} L</span>
                </div>
              </div>

              {/* Status metrics grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-400 block mb-0.5">Remaining Volume</span>
                  <span className="text-sm font-bold text-slate-900 font-mono">
                    {maintenanceStatus.usageRemainingLiters.toFixed(1)} L
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[11px] text-slate-400 block mb-0.5">Elapsed Time</span>
                  <span className="text-sm font-bold text-slate-900 font-mono">
                    {maintenanceStatus.daysElapsed} / {settings.maxServiceIntervalDays} days
                  </span>
                </div>
              </div>

              {/* Indicative Demonstrations note */}
              <div className="p-2.5 bg-sky-50/60 rounded-xl border border-sky-100 text-[11px] text-slate-600 space-y-1">
                <div className="flex items-center justify-between text-slate-700">
                  <span className="font-semibold flex items-center gap-1">
                    <Info className="w-3 h-3 text-sky-600" />
                    Indicative Demonstration Sensors
                  </span>
                  <span className="text-[10px] text-sky-800 font-semibold bg-sky-100 px-1.5 py-0.2 rounded">
                    Demo Only
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span>Simulated Temp: <strong>{indicativeTempC}°C</strong></span>
                  <span>Simulated TDS: <strong>{indicativeTdsPpm} ppm</strong></span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <button
              onClick={() => onNavigate('maintenance')}
              className="w-full py-2.5 px-3 rounded-xl bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <span>Record Filter Replacement / Reset</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Safety & Water-Quality Disclaimer */}
      <DisclaimerBanner />
    </div>
  );
};
