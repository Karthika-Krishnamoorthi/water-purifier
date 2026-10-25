import React from 'react';
import { useApp } from '../../context/AppContext';
import { PlayCircle, AlertTriangle, AlertCircle, Clock, WifiOff, RotateCcw, Sparkles } from 'lucide-react';

export const DemoScenarioBar: React.FC = () => {
  const { triggerJudgeScenario, resetDemoSession, activeScenarioName } = useApp();

  return (
    <div className="bg-white border-b border-slate-200/80 px-4 py-2.5 shadow-xs sticky top-16 z-20">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200/60">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            Judge Scenarios
          </span>
          {activeScenarioName ? (
            <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 animate-pulse">
              Active: {activeScenarioName}
            </span>
          ) : (
            <span className="text-xs text-slate-500 hidden sm:inline">
              Instant test cases for AtomQUEST evaluation
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => triggerJudgeScenario('NORMAL')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
            title="Set usage to 360 L (< 800 L warning limit)"
          >
            <PlayCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>A: Normal</span>
          </button>

          <button
            onClick={() => triggerJudgeScenario('CHECK_SOON')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition-colors"
            title="Set usage to 825 L (>= 80% warning threshold)"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span>B: Check Soon</span>
          </button>

          <button
            onClick={() => triggerJudgeScenario('SERVICE_REQUIRED')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors"
            title="Set usage to 1024 L (>= 1000 L configured service limit)"
          >
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>C: Service Required</span>
          </button>

          <button
            onClick={() => triggerJudgeScenario('TIME_BASED')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors"
            title="Simulate service interval elapsed > 180 days with low water volume"
          >
            <Clock className="w-3.5 h-3.5 text-indigo-600" />
            <span>D: Time-Based</span>
          </button>

          <button
            onClick={() => triggerJudgeScenario('SENSOR_FAILURE')}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300 transition-colors"
            title="Simulate ESP32 link loss or pulse sensor disconnection"
          >
            <WifiOff className="w-3.5 h-3.5 text-slate-600" />
            <span>E: Sensor Fault</span>
          </button>

          <button
            onClick={resetDemoSession}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors ml-1"
            title="Restore default demo flow and counters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
