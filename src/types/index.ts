/**
 * ClearSense - Type Definitions
 * Track 2: Water Purifier (AtomQUEST 2026)
 */

export type MaintenanceLevel = 'NORMAL' | 'CHECK_SOON' | 'SERVICE_REQUIRED';

export type ConnectionState = 'connected' | 'disconnected' | 'sensor_error';

export type OperatingMode = 'demo' | 'hardware_ready';

export type FlowSimulationPreset = 'off' | 'low' | 'moderate' | 'high' | 'disconnected' | 'error';

export interface MaintenanceStatusResult {
  level: MaintenanceLevel;
  reasons: string[];
  recommendedAction: string;
  usageRemainingLiters: number;
  usageRemainingPercent: number;
  daysRemaining: number;
  daysElapsed: number;
  isUsageTriggered: boolean;
  isTimeTriggered: boolean;
}

export interface TelemetryReading {
  id: string;
  timestamp: string;
  flowRateLpm: number;
  incrementalLiters: number;
  cumulativeLiters: number;
  todayLiters: number;
  waterTemperatureC?: number; // Indicative demonstration only
  indicativeTdsPpm?: number;  // Indicative demonstration only
  connectionState: ConnectionState;
}

export interface DeviceSettings {
  deviceName: string;
  deviceId: string;
  filterLimitLiters: number;
  warningThresholdPercent: number;
  maxServiceIntervalDays: number;
  lastServiceDate: string; // ISO date string YYYY-MM-DD
  operatingMode: OperatingMode;
  flowSensorCalibrationFactor: number; // pulses per liter, e.g. 450 for YF-S201
  hardwareMqttTopic: string;
  dailyUsageTargetLiters: number;
}

export interface ServiceRecord {
  id: string;
  date: string;
  serviceType: 'Filter Replacement' | 'Sediment Flush' | 'Carbon Post-Filter' | 'RO Membrane Swap' | 'Annual Overhaul' | 'Inspection & Sanitization';
  cumulativeUsageBeforeServiceLiters: number;
  statusBeforeService: MaintenanceLevel;
  technicianOrUser: string;
  notes: string;
  isSystemGenerated?: boolean;
}

export interface AppNotification {
  id: string;
  timestamp: string;
  type: 'MAINTENANCE_CHANGE' | 'THRESHOLD_WARNING' | 'SERVICE_LIMIT' | 'HARDWARE_STATUS' | 'SYSTEM';
  severity: 'info' | 'warning' | 'critical' | 'success';
  title: string;
  message: string;
  recommendedAction?: string;
  isRead: boolean;
}

export interface DailyUsageData {
  date: string; // YYYY-MM-DD
  displayDate: string; // e.g. Oct 20
  liters: number;
  cumulativeEndLiters: number;
  peakFlowLpm: number;
}

export interface HourlyUsageData {
  hour: string; // e.g. "08:00"
  liters: number;
  averageFlowLpm: number;
}
