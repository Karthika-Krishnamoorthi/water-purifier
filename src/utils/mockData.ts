/**
 * ClearSense - Initial Demonstration Dataset
 * Realistic data tailored for domestic water purifier monitoring (AtomQUEST 2026).
 */

import { DeviceSettings, ServiceRecord, DailyUsageData, HourlyUsageData, AppNotification } from '../types';

export const DEFAULT_SETTINGS: DeviceSettings = {
  deviceName: 'ClearSense Domestic Unit #1',
  deviceId: 'CS-ESP32-WTR01',
  filterLimitLiters: 1000,
  warningThresholdPercent: 80,
  maxServiceIntervalDays: 180,
  lastServiceDate: '2026-09-10', // ~45 days ago relative to late Oct 2026
  operatingMode: 'demo',
  flowSensorCalibrationFactor: 450, // pulses/L for YF-S201
  hardwareMqttTopic: 'clearsense/wtr01/telemetry',
  dailyUsageTargetLiters: 16.0,
};

export const INITIAL_CUMULATIVE_LITERS = 442.8;
export const INITIAL_TODAY_LITERS = 9.4;

export const INITIAL_SERVICE_HISTORY: ServiceRecord[] = [
  {
    id: 'srv-001',
    date: '2026-09-10',
    serviceType: 'Filter Replacement',
    cumulativeUsageBeforeServiceLiters: 1018.4,
    statusBeforeService: 'SERVICE_REQUIRED',
    technicianOrUser: 'A. Sharma (Certified Tech)',
    notes: 'Replaced PP sediment filter (5-micron) and CTO activated block cartridge. Flushed 10L through new cartridge prior to reconnecting line. System zeroed.',
    isSystemGenerated: false,
  },
  {
    id: 'srv-002',
    date: '2026-03-15',
    serviceType: 'Annual Overhaul',
    cumulativeUsageBeforeServiceLiters: 980.2,
    statusBeforeService: 'CHECK_SOON',
    technicianOrUser: 'ClearSense Care Partner',
    notes: 'Full system descaling, UV chamber sterilizer check, booster pump diaphragm pressure inspection, and pre-filter replacement.',
    isSystemGenerated: false,
  },
  {
    id: 'srv-003',
    date: '2025-09-20',
    serviceType: 'Inspection & Sanitization',
    cumulativeUsageBeforeServiceLiters: 890.0,
    statusBeforeService: 'CHECK_SOON',
    technicianOrUser: 'Homeowner',
    notes: 'Quarterly housing sanitization and sediment pre-filter rinse. Restored flow rate to 2.1 L/min.',
    isSystemGenerated: false,
  },
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    timestamp: '2026-10-25 08:30',
    type: 'SYSTEM',
    severity: 'info',
    title: 'ClearSense Monitor Online',
    message: 'Simulated ESP32 telemetry session initialized. Real-time volume accumulator is active.',
    recommendedAction: 'Verify flow sensor calibration if connecting to physical test bench.',
    isRead: false,
  },
  {
    id: 'notif-2',
    timestamp: '2026-10-24 19:15',
    type: 'MAINTENANCE_CHANGE',
    severity: 'info',
    title: 'Daily Usage Target Reached',
    message: 'Purifier recorded 15.2 L today, meeting normal household drinking & cooking demand.',
    isRead: true,
  },
];

// Helper to generate 30 days of realistic daily usage history leading up to today
export function generatePast30DaysUsage(): DailyUsageData[] {
  const result: DailyUsageData[] = [];
  const baseDate = new Date('2026-10-25');
  
  // Daily amounts that add up realistically
  const pastAmounts = [
    13.2, 14.5, 12.8, 16.2, 18.0, 11.4, 15.6,
    14.1, 13.9, 17.2, 19.5, 10.8, 12.3, 16.8,
    14.7, 15.2, 13.1, 18.4, 21.0, 11.9, 14.3,
    16.1, 13.5, 15.8, 17.6, 12.4, 14.8, 16.5,
    13.9, 9.4 // today
  ];

  let runningCumulative = 442.8 - pastAmounts.slice(0, 29).reduce((a, b) => a + b, 0);
  if (runningCumulative < 0) runningCumulative = 30.0;

  for (let i = 29; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const liters = pastAmounts[29 - i];
    runningCumulative += liters;

    result.push({
      date: dateStr,
      displayDate,
      liters: Math.round(liters * 10) / 10,
      cumulativeEndLiters: Math.round(runningCumulative * 10) / 10,
      peakFlowLpm: Number((1.8 + Math.random() * 0.8).toFixed(1)),
    });
  }

  return result;
}

// Generate realistic hourly breakdown for today
export function generateTodayHourlyUsage(todayTotalLiters: number): HourlyUsageData[] {
  // Typical domestic distribution pattern: peaks at 7-9am, 12-1pm, 6-9pm
  const weights = [
    0.01, 0.0, 0.0, 0.0, 0.01, 0.03, // 00-05
    0.08, 0.14, 0.12, 0.06, 0.05, 0.07, // 06-11
    0.11, 0.06, 0.04, 0.03, 0.05, 0.08, // 12-17
    0.13, 0.10, 0.06, 0.03, 0.02, 0.01  // 18-23
  ];

  const hours = [
    '00:00', '01:00', '02:00', '03:00', '04:00', '05:00',
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
  ];

  const currentHour = 11; // 11am on simulated day
  const relevantWeights = weights.slice(0, currentHour + 1);
  const totalWeight = relevantWeights.reduce((a, b) => a + b, 0) || 1;

  return hours.map((hour, idx) => {
    if (idx > currentHour) {
      return { hour, liters: 0, averageFlowLpm: 0 };
    }
    const portion = (weights[idx] / totalWeight) * todayTotalLiters;
    return {
      hour,
      liters: Math.round(portion * 10) / 10,
      averageFlowLpm: portion > 0 ? Number((1.6 + Math.random() * 0.6).toFixed(1)) : 0,
    };
  });
}
