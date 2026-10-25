import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { generateTodayHourlyUsage } from '../../utils/mockData';
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Clock,
  Calendar,
  Zap,
  Info,
  Droplets,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

export const UsageAnalyticsView: React.FC = () => {
  const { dailyUsageHistory, todayLiters, settings, recentReadings } = useApp();
  const [range, setRange] = useState<'7' | '14' | '30'>('14');
  const [activeTab, setActiveTab] = useState<'daily' | 'hourly' | 'cumulative'>('daily');

  // Filter daily data based on range
  const filteredDailyData = useMemo(() => {
    const days = parseInt(range, 10);
    return dailyUsageHistory.slice(-days);
  }, [dailyUsageHistory, range]);

  // Hourly data for today
  const hourlyData = useMemo(() => {
    return generateTodayHourlyUsage(todayLiters);
  }, [todayLiters]);

  // Computed summary metrics
  const totalPeriodLiters = useMemo(() => {
    return filteredDailyData.reduce((acc, cur) => acc + cur.liters, 0);
  }, [filteredDailyData]);

  const avgDailyLiters = useMemo(() => {
    if (filteredDailyData.length === 0) return 0;
    return totalPeriodLiters / filteredDailyData.length;
  }, [totalPeriodLiters, filteredDailyData]);

  const peakDay = useMemo(() => {
    if (filteredDailyData.length === 0) return { displayDate: 'N/A', liters: 0 };
    return [...filteredDailyData].sort((a, b) => b.liters - a.liters)[0];
  }, [filteredDailyData]);

  return (
    <div className="space-y-6">
      {/* Top Header & Range Filter */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Purified Water Analytics</h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              DEMONSTRATION DATASET
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Volumetric consumption trends, peak load analysis, and wear projection models.
          </p>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold self-start md:self-auto">
          <button
            onClick={() => setRange('7')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              range === '7' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setRange('14')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              range === '14' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Last 14 Days
          </button>
          <button
            onClick={() => setRange('30')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              range === '30' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Analytics KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase text-slate-500">Total Filtered Output</span>
            <Droplets className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {totalPeriodLiters.toFixed(1)} <span className="text-xs font-sans text-slate-500 font-normal">Liters</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Across selected {range}-day period
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase text-slate-500">Average Daily Demand</span>
            <TrendingUp className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {avgDailyLiters.toFixed(1)} <span className="text-xs font-sans text-slate-500 font-normal">L/day</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Household typical benchmark (15-20 L)
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase text-slate-500">Peak Consumption Day</span>
            <Zap className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {peakDay.liters.toFixed(1)} <span className="text-xs font-sans text-slate-500 font-normal">L</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Recorded on {peakDay.displayDate}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold uppercase text-slate-500">Wear Run-Rate</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {avgDailyLiters > 0 ? Math.round((settings.filterLimitLiters - filteredDailyData[filteredDailyData.length - 1]?.cumulativeEndLiters || 400) / avgDailyLiters) : 0}{' '}
            <span className="text-xs font-sans text-slate-500 font-normal">days left</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Projected at current {avgDailyLiters.toFixed(1)} L/day rate
          </span>
        </div>
      </div>

      {/* Main Interactive Chart Container */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('daily')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'daily'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Daily Consumption
            </button>
            <button
              onClick={() => setActiveTab('hourly')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'hourly'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Today's Hourly Profile
            </button>
            <button
              onClick={() => setActiveTab('cumulative')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'cumulative'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Cumulative Growth Curve
            </button>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Interactive Tooltips • Liters (L) Unit</span>
          </div>
        </div>

        {/* Tab 1: Daily Bars */}
        {activeTab === 'daily' && (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredDailyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="displayDate"
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  unit=" L"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '0.75rem',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [`${value} Liters`, 'Purified Output']}
                  labelFormatter={(lbl) => `Date: ${lbl}`}
                />
                <Bar dataKey="liters" fill="#0d9488" radius={[4, 4, 0, 0]} name="Volume (L)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Tab 2: Hourly Profile */}
        {activeTab === 'hourly' && (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="hourGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="hour"
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  unit=" L"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '0.75rem',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val} Liters`, 'Water Drawn']}
                />
                <Area
                  type="monotone"
                  dataKey="liters"
                  stroke="#0891b2"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#hourGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Tab 3: Cumulative Growth Curve */}
        {activeTab === 'cumulative' && (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredDailyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="displayDate"
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  unit=" L"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '0.75rem',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                  formatter={(val: any) => [`${val} Liters`, 'Cumulative Volume Since Reset']}
                />
                <Line
                  type="monotone"
                  dataKey="cumulativeEndLiters"
                  stroke="#2563eb"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#2563eb' }}
                  name="Cumulative Output (L)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
          <span>Demonstration Data Notice: All points reflect synthetic household demand model.</span>
          <span className="font-semibold text-slate-700">AtomQUEST Track 2 Evaluation Model</span>
        </div>
      </div>

      {/* Safety Disclaimer */}
      <DisclaimerBanner />
    </div>
  );
};
