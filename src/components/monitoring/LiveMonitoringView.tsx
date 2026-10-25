import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FlowSimulationPreset } from '../../types';
import { DisclaimerBanner } from '../common/DisclaimerBanner';
import {
  Play,
  Pause,
  RotateCcw,
  Gauge,
  Activity,
  Wifi,
  WifiOff,
  AlertTriangle,
  Droplets,
  Cpu,
  Info,
  Layers,
  Terminal,
  Code,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const LiveMonitoringView: React.FC = () => {
  const {
    currentFlowRate,
    cumulativeLiters,
    todayLiters,
    connectionState,
    isSimulating,
    simulationPreset,
    recentReadings,
    setFlowPreset,
    setCustomFlowRate,
    toggleSimulation,
    resetDemoSession,
    maintenanceStatus,
    settings,
    indicativeTempC,
    indicativeTdsPpm,
  } = useApp();

  const [showHardwareModal, setShowHardwareModal] = useState(false);
  const [customInput, setCustomInput] = useState<string>(currentFlowRate.toFixed(1));

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(customInput);
    if (!isNaN(parsed) && parsed >= 0) {
      setCustomFlowRate(parsed);
    }
  };

  const getStatusBadge = () => {
    switch (maintenanceStatus.level) {
      case 'SERVICE_REQUIRED':
        return { text: 'SERVICE REQUIRED', color: 'bg-rose-100 text-rose-800 border-rose-300' };
      case 'CHECK_SOON':
        return { text: 'CHECK SOON', color: 'bg-amber-100 text-amber-900 border-amber-300' };
      default:
        return { text: 'NORMAL', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-start gap-3 text-xs text-amber-900">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Hardware-Decoupled Simulation Mode:</span> Flow rates and volume increments shown in this panel are simulated demonstration streams. They demonstrate the client-side delta accumulator (`Incremental Volume = Flow Rate × Δt / 60`) and maintenance decision engine before connecting a physical ESP32.
        </div>
      </div>

      {/* Top telemetry card & live flow gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Flow Meter & Interactive Simulation Controls */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-lg">Real-Time Flow Telemetry</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${statusBadge.color}`}>
                  {statusBadge.text}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Sampling interval: 1.5s • Direct pulse accumulator simulation
              </p>
            </div>

            {/* Sim state toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleSimulation}
                className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-colors shadow-2xs ${
                  isSimulating
                    ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {isSimulating ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Pause Stream</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Start Stream</span>
                  </>
                )}
              </button>

              <button
                onClick={resetDemoSession}
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
                title="Reset simulation session"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Flow visualizer */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Instant Flow Rate Gauge */}
            <div className="p-5 bg-gradient-to-br from-slate-50 to-sky-50/40 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-cyan-600" />
                Current Flow Rate
              </span>
              <div className="my-3 text-center">
                <div className="text-4xl font-extrabold font-mono text-slate-900">
                  {connectionState === 'connected' ? currentFlowRate.toFixed(2) : '--'}
                </div>
                <div className="text-xs font-medium text-slate-500 mt-1">
                  Liters per minute (L/min)
                </div>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-400 border-t border-slate-200/60 pt-2">
                <span>0 L/min</span>
                <span className="font-semibold text-teal-600">
                  {currentFlowRate > 0 ? 'Water Passing' : 'Tap Closed'}
                </span>
                <span>6.0 L/min</span>
              </div>
            </div>

            {/* Total Volume Monitored */}
            <div className="p-5 bg-gradient-to-br from-slate-50 to-teal-50/40 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-teal-600" />
                Cumulative Usage
              </span>
              <div className="my-3 text-center">
                <div className="text-4xl font-extrabold font-mono text-slate-900">
                  {cumulativeLiters.toFixed(2)}
                </div>
                <div className="text-xs font-medium text-slate-500 mt-1">
                  Liters since filter reset
                </div>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-400 border-t border-slate-200/60 pt-2">
                <span>Config Limit: {settings.filterLimitLiters} L</span>
                <span className="font-semibold text-slate-700">
                  {Math.round((cumulativeLiters / settings.filterLimitLiters) * 100)}%
                </span>
              </div>
            </div>

            {/* Hardware Status */}
            <div className="p-5 bg-gradient-to-br from-slate-50 to-indigo-50/40 rounded-2xl border border-slate-200/80 flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-indigo-600" />
                Device Link State
              </span>
              <div className="my-3 text-center">
                <div className="flex items-center justify-center gap-2">
                  {connectionState === 'connected' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <Wifi className="w-3.5 h-3.5" />
                      SIM CONNECTED
                    </span>
                  )}
                  {connectionState === 'disconnected' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                      <WifiOff className="w-3.5 h-3.5" />
                      DISCONNECTED
                    </span>
                  )}
                  {connectionState === 'sensor_error' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      SENSOR FAULT
                    </span>
                  )}
                </div>
                <div className="text-xs font-medium text-slate-500 mt-2 font-mono">
                  {settings.deviceId}
                </div>
              </div>
              <div className="text-[11px] text-slate-400 text-center border-t border-slate-200/60 pt-2">
                Today's Output: <strong className="text-slate-700">{todayLiters.toFixed(1)} L</strong>
              </div>
            </div>
          </div>

          {/* Interactive Flow Rate Presets Bar */}
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-2">
              Simulate Water Flow Presets:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              <button
                onClick={() => setFlowPreset('off')}
                className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  simulationPreset === 'off' && connectionState === 'connected'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                No Flow (0.0 L)
              </button>
              <button
                onClick={() => setFlowPreset('low')}
                className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  simulationPreset === 'low' && connectionState === 'connected'
                    ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                Low (~1.0 L/min)
              </button>
              <button
                onClick={() => setFlowPreset('moderate')}
                className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  simulationPreset === 'moderate' && connectionState === 'connected'
                    ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                Moderate (~2.2 L/min)
              </button>
              <button
                onClick={() => setFlowPreset('high')}
                className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  simulationPreset === 'high' && connectionState === 'connected'
                    ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                High (~4.0 L/min)
              </button>
              <button
                onClick={() => setFlowPreset('disconnected')}
                className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  connectionState === 'disconnected'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200'
                }`}
              >
                Disconnect
              </button>
              <button
                onClick={() => setFlowPreset('error')}
                className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  connectionState === 'sensor_error'
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-200'
                }`}
              >
                Sensor Erratic
              </button>
            </div>
          </div>

          {/* Custom Flow Rate Slider & Direct Input */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1">
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Fine Flow Control Slider (0 - 6 L/min):
              </label>
              <input
                type="range"
                min="0"
                max="6"
                step="0.1"
                value={currentFlowRate}
                disabled={connectionState !== 'connected'}
                onChange={(e) => setCustomFlowRate(parseFloat(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />
            </div>
            <form onSubmit={handleCustomSubmit} className="flex items-center gap-2 self-start sm:self-auto">
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="2.0"
                className="w-20 px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-teal-600"
              />
              <button
                type="submit"
                className="px-3 py-1.5 text-xs font-semibold bg-slate-800 text-white hover:bg-slate-900 rounded-lg transition-colors"
              >
                Set L/min
              </button>
            </form>
          </div>
        </div>

        {/* Right Col: Indicative Environmental Sensors & Hardware Architecture Spec */}
        <div className="space-y-6">
          {/* Indicative Sensors Demo Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-teal-600" />
                Auxiliary Demonstrations
              </h4>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                Indicative Only
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Auxiliary physical indicators demonstrated for system completeness. Not certified drinking water safety tests.
            </p>

            <div className="space-y-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block">Water Temperature</span>
                  <span className="text-lg font-bold text-slate-900 font-mono">
                    {indicativeTempC.toFixed(1)} °C
                  </span>
                </div>
                <span className="text-[10px] px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 font-medium">
                  Normal Range (15-28°C)
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 block">Indicative Conductivity / TDS</span>
                  <span className="text-lg font-bold text-slate-900 font-mono">
                    {indicativeTdsPpm} ppm
                  </span>
                </div>
                <span className="text-[10px] px-2 py-1 rounded-md bg-sky-50 text-sky-700 font-medium">
                  Illustrative Telemetry
                </span>
              </div>
            </div>

            <div className="mt-4 p-2.5 rounded-lg bg-amber-50/60 border border-amber-200/60 text-[11px] text-amber-900 leading-snug">
              <strong>Mandatory Protocol:</strong> ClearSense never uses TDS or temperature to declare water safe or unsafe. It only estimates filter usage volume.
            </div>
          </div>

          {/* ESP32 Hardware Integration Spec Trigger */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-2xl shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-teal-500/20 text-teal-400 rounded-lg">
                <Code className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-sm">ESP32 Hardware Readiness</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              ClearSense features a clean architectural boundary. The simulated provider can be replaced with an ESP32 publishing over MQTT or HTTP REST.
            </p>
            <button
              onClick={() => setShowHardwareModal(true)}
              className="w-full py-2 px-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-900 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>View Hardware Interface Specs</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Telemetry Streaming Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Live Telemetry Buffer</h3>
            <p className="text-xs text-slate-500">
              Showing rolling 20 latest simulated telemetry ticks with incremental volume calculations.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {recentReadings.length} records in memory
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Flow Rate</th>
                <th className="py-2.5 px-3">Δ Volume (Incremental)</th>
                <th className="py-2.5 px-3">Cumulative (Post-Reset)</th>
                <th className="py-2.5 px-3">Today's Vol.</th>
                <th className="py-2.5 px-3">Indicative Temp</th>
                <th className="py-2.5 px-3">Indicative TDS</th>
                <th className="py-2.5 px-3">Link State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentReadings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No readings generated yet. Start the stream or select a flow preset above.
                  </td>
                </tr>
              ) : (
                recentReadings.map((reading) => (
                  <tr key={reading.id} className="hover:bg-slate-50/60 font-mono transition-colors">
                    <td className="py-2.5 px-3 text-slate-700 font-medium">{reading.timestamp}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                        reading.flowRateLpm > 0 ? 'bg-cyan-50 text-cyan-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {reading.flowRateLpm.toFixed(2)} L/min
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-teal-700 font-semibold">
                      +{reading.incrementalLiters.toFixed(3)} L
                    </td>
                    <td className="py-2.5 px-3 text-slate-900 font-bold">
                      {reading.cumulativeLiters.toFixed(2)} L
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">
                      {reading.todayLiters.toFixed(2)} L
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {reading.waterTemperatureC} °C
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">
                      {reading.indicativeTdsPpm} ppm
                    </td>
                    <td className="py-2.5 px-3 font-sans">
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
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

      {/* ESP32 Hardware Integration Spec Modal */}
      {showHardwareModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-slate-900 text-white rounded-xl">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">ESP32 Hardware Specification</h3>
                  <p className="text-xs text-slate-500">AtomQUEST Track 2 Physical Benchmark Interface</p>
                </div>
              </div>
              <button
                onClick={() => setShowHardwareModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-xs text-slate-600 leading-relaxed">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-1">1. Flow Meter Sensor (YF-S201 Hall-Effect)</h4>
                <p>Pin Interrupt: GPIO 4 on ESP32. Calibration Formula:</p>
                <code className="block my-1.5 p-2 bg-slate-900 text-teal-300 rounded font-mono text-[11px]">
                  FlowRate_Lpm = PulseFrequency_Hz / 7.5;
                  Volume_L = TotalPulses / 450.0;
                </code>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-1">2. Telemetry Payload Schema (JSON via MQTT / REST)</h4>
                <pre className="p-2.5 bg-slate-900 text-sky-300 rounded font-mono text-[11px] overflow-x-auto">
{`{
  "device_id": "CS-ESP32-WTR01",
  "firmware": "v1.4.2-atom",
  "timestamp": 1729841850,
  "flow_lpm": 2.14,
  "incremental_liters": 0.053,
  "pulse_count": 24,
  "aux_temp_c": 23.4,
  "aux_tds_ppm": 142
}`}
                </pre>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <h4 className="font-semibold text-slate-900 mb-1">3. Clear Architectural Boundary</h4>
                <p>
                  The front-end state architecture decouples the sensor data source from the maintenance decision rules. In production, an MQTT broker (`clearsense/wtr01/telemetry`) or WebSocket server can replace the simulation loop without touching the calculation engine.
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowHardwareModal(false)}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors"
              >
                Close Specification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
