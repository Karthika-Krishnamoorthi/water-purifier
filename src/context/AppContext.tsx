/**
 * ClearSense - Application State Context
 * Single source of truth with real delta volume calculation, localStorage persistence,
 * state change notification dispatcher, and judge scenario triggers.
 */

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  DeviceSettings,
  MaintenanceStatusResult,
  MaintenanceLevel,
  ConnectionState,
  FlowSimulationPreset,
  TelemetryReading,
  ServiceRecord,
  AppNotification,
  DailyUsageData,
} from '../types';
import {
  DEFAULT_SETTINGS,
  INITIAL_CUMULATIVE_LITERS,
  INITIAL_TODAY_LITERS,
  INITIAL_SERVICE_HISTORY,
  INITIAL_NOTIFICATIONS,
  generatePast30DaysUsage,
} from '../utils/mockData';
import {
  calculateIncrementalVolume,
  determineMaintenanceStatus,
  validateSettings,
} from '../utils/engine';

interface AppContextType {
  // Settings & Configuration
  settings: DeviceSettings;
  updateSettings: (newSettings: Partial<DeviceSettings>) => { success: boolean; errors?: Record<string, string> };
  restoreDefaultSettings: () => void;
  clearAllDemoData: () => void;

  // Real-time telemetry & simulation
  currentFlowRate: number;
  cumulativeLiters: number;
  todayLiters: number;
  connectionState: ConnectionState;
  isSimulating: boolean;
  simulationPreset: FlowSimulationPreset;
  recentReadings: TelemetryReading[];
  setFlowPreset: (preset: FlowSimulationPreset) => void;
  setCustomFlowRate: (rate: number) => void;
  toggleSimulation: () => void;
  resetDemoSession: () => void;

  // Maintenance Engine status
  maintenanceStatus: MaintenanceStatusResult;

  // Service History
  serviceHistory: ServiceRecord[];
  recordFilterReplacement: (notes: string, technician: string, serviceType?: ServiceRecord['serviceType']) => void;
  addServiceRecord: (record: Omit<ServiceRecord, 'id'>) => void;
  deleteServiceRecord: (id: string) => void;

  // Analytics data
  dailyUsageHistory: DailyUsageData[];

  // Notifications
  notifications: AppNotification[];
  unreadNotificationCount: number;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;

  // Judge demonstration presets
  triggerJudgeScenario: (scenario: 'NORMAL' | 'CHECK_SOON' | 'SERVICE_REQUIRED' | 'TIME_BASED' | 'SENSOR_FAILURE') => void;
  activeScenarioName: string | null;

  // Indicative Sensor Readings (Demo)
  indicativeTempC: number;
  indicativeTdsPpm: number;
}

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY_SETTINGS = 'clearsense_v1_settings';
const STORAGE_KEY_CUMULATIVE = 'clearsense_v1_cumulative';
const STORAGE_KEY_TODAY = 'clearsense_v1_today';
const STORAGE_KEY_HISTORY = 'clearsense_v1_service_history';
const STORAGE_KEY_DAILY = 'clearsense_v1_daily_usage';
const STORAGE_KEY_NOTIFS = 'clearsense_v1_notifications';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Settings state
  const [settings, setSettings] = useState<DeviceSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // 2. Water volumes
  const [cumulativeLiters, setCumulativeLiters] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CUMULATIVE);
      return saved !== null ? Number(saved) : INITIAL_CUMULATIVE_LITERS;
    } catch {
      return INITIAL_CUMULATIVE_LITERS;
    }
  });

  const [todayLiters, setTodayLiters] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TODAY);
      return saved !== null ? Number(saved) : INITIAL_TODAY_LITERS;
    } catch {
      return INITIAL_TODAY_LITERS;
    }
  });

  // 3. Simulation & flow state
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [simulationPreset, setSimulationPreset] = useState<FlowSimulationPreset>('moderate');
  const [currentFlowRate, setCurrentFlowRate] = useState<number>(2.1);
  const [connectionState, setConnectionState] = useState<ConnectionState>('connected');
  const [activeScenarioName, setActiveScenarioName] = useState<string | null>(null);

  // Indicative sensor demonstration values
  const [indicativeTempC, setIndicativeTempC] = useState<number>(23.2);
  const [indicativeTdsPpm, setIndicativeTdsPpm] = useState<number>(142);

  // 4. Telemetry logs (scrolling buffer)
  const [recentReadings, setRecentReadings] = useState<TelemetryReading[]>([]);

  // 5. Service history
  const [serviceHistory, setServiceHistory] = useState<ServiceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      return saved ? JSON.parse(saved) : INITIAL_SERVICE_HISTORY;
    } catch {
      return INITIAL_SERVICE_HISTORY;
    }
  });

  // 6. Analytics dataset
  const [dailyUsageHistory, setDailyUsageHistory] = useState<DailyUsageData[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DAILY);
      return saved ? JSON.parse(saved) : generatePast30DaysUsage();
    } catch {
      return generatePast30DaysUsage();
    }
  });

  // 7. Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_NOTIFS);
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  // 8. Maintenance calculation (derived automatically)
  const maintenanceStatus = determineMaintenanceStatus(
    cumulativeLiters,
    settings.filterLimitLiters,
    settings.warningThresholdPercent,
    settings.lastServiceDate,
    settings.maxServiceIntervalDays
  );

  // Keep track of previous maintenance status to prevent duplicate alert spamming
  const previousStatusLevelRef = useRef<MaintenanceLevel>(maintenanceStatus.level);
  const previousConnectionStateRef = useRef<ConnectionState>(connectionState);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CUMULATIVE, cumulativeLiters.toString());
      localStorage.setItem(STORAGE_KEY_TODAY, todayLiters.toString());
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [cumulativeLiters, todayLiters]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(serviceHistory));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [serviceHistory]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DAILY, JSON.stringify(dailyUsageHistory));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [dailyUsageHistory]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(notifications));
    } catch (e) {
      console.warn('Storage sync error', e);
    }
  }, [notifications]);

  // Dispatch notification helper
  const addNotification = useCallback((notification: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotif: AppNotification = {
      ...notification,
      id: 'notif_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      isRead: false,
    };
    setNotifications(prev => [newNotif, ...prev.slice(0, 39)]); // keep max 40
  }, []);

  // Monitor maintenance status changes and emit alerts once per transition
  useEffect(() => {
    if (previousStatusLevelRef.current !== maintenanceStatus.level) {
      const prev = previousStatusLevelRef.current;
      const curr = maintenanceStatus.level;
      previousStatusLevelRef.current = curr;

      if (curr === 'SERVICE_REQUIRED') {
        addNotification({
          type: 'SERVICE_LIMIT',
          severity: 'critical',
          title: 'Service Required Alert',
          message: maintenanceStatus.reasons[0] || 'Configured filter service threshold reached.',
          recommendedAction: maintenanceStatus.recommendedAction,
        });
      } else if (curr === 'CHECK_SOON') {
        addNotification({
          type: 'THRESHOLD_WARNING',
          severity: 'warning',
          title: 'Filter Warning Threshold Reached',
          message: maintenanceStatus.reasons[0] || 'Water usage has entered warning range.',
          recommendedAction: maintenanceStatus.recommendedAction,
        });
      } else if (curr === 'NORMAL' && prev !== 'NORMAL') {
        addNotification({
          type: 'MAINTENANCE_CHANGE',
          severity: 'success',
          title: 'System Returned to Normal Status',
          message: 'Cumulative water counters and service interval are within acceptable operational limits.',
          recommendedAction: 'Continue routine usage monitoring.',
        });
      }
    }
  }, [maintenanceStatus.level, maintenanceStatus.reasons, maintenanceStatus.recommendedAction, addNotification]);

  // Monitor connection state transitions
  useEffect(() => {
    if (previousConnectionStateRef.current !== connectionState) {
      const prev = previousConnectionStateRef.current;
      previousConnectionStateRef.current = connectionState;

      if (connectionState === 'disconnected') {
        addNotification({
          type: 'HARDWARE_STATUS',
          severity: 'warning',
          title: 'Simulated ESP32 Disconnected',
          message: 'No new simulated telemetry readings are being received. Check the monitoring connection.',
          recommendedAction: 'Reconnect simulator in the Live Monitoring panel or inspect hardware bridge.',
        });
      } else if (connectionState === 'sensor_error') {
        addNotification({
          type: 'HARDWARE_STATUS',
          severity: 'critical',
          title: 'Sensor Hardware Erratic / Fault',
          message: 'Telemetry readings missing or pulse frequency outside calibrated bounds.',
          recommendedAction: 'Inspect flow meter wiring and power supply line.',
        });
      } else if (connectionState === 'connected' && prev !== 'connected') {
        addNotification({
          type: 'HARDWARE_STATUS',
          severity: 'info',
          title: 'Telemetry Connection Restored',
          message: 'Sensor stream established. Flow measurement active.',
        });
      }
    }
  }, [connectionState, addNotification]);

  // Simulation timer loop
  const lastTickTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (!isSimulating || connectionState !== 'connected') {
      lastTickTimeRef.current = Date.now();
      return;
    }

    const intervalMs = 1500; // 1.5 seconds tick

    const intervalId = setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = Math.max(0.1, (now - lastTickTimeRef.current) / 1000);
      lastTickTimeRef.current = now;

      // Determine instantaneous flow rate with slight natural hydrodynamic jitter
      let currentFlow = 0;
      if (simulationPreset === 'low') {
        currentFlow = 0.95 + (Math.random() * 0.2 - 0.1); // ~0.85 - 1.15 L/min
      } else if (simulationPreset === 'moderate') {
        currentFlow = 2.15 + (Math.random() * 0.3 - 0.15); // ~2.0 - 2.3 L/min
      } else if (simulationPreset === 'high') {
        currentFlow = 3.9 + (Math.random() * 0.4 - 0.2); // ~3.7 - 4.1 L/min
      } else if (simulationPreset === 'off') {
        currentFlow = 0;
      }
      currentFlow = Math.max(0, Number(currentFlow.toFixed(2)));
      setCurrentFlowRate(currentFlow);

      // Incremental volume calculation
      const incrementalLiters = calculateIncrementalVolume(currentFlow, elapsedSeconds);

      if (incrementalLiters > 0) {
        setCumulativeLiters(prev => Number((prev + incrementalLiters).toFixed(3)));
        setTodayLiters(prev => Number((prev + incrementalLiters).toFixed(3)));

        // Update current day's total in dailyUsageHistory
        setDailyUsageHistory(prev => {
          if (prev.length === 0) return prev;
          const copy = [...prev];
          const lastIdx = copy.length - 1;
          copy[lastIdx] = {
            ...copy[lastIdx],
            liters: Number((copy[lastIdx].liters + incrementalLiters).toFixed(2)),
            cumulativeEndLiters: Number((copy[lastIdx].cumulativeEndLiters + incrementalLiters).toFixed(2)),
            peakFlowLpm: Math.max(copy[lastIdx].peakFlowLpm, currentFlow),
          };
          return copy;
        });
      }

      // Slightly fluctuate indicative water temp and TDS for realistic demo
      if (currentFlow > 0) {
        setIndicativeTempC(Number((23.0 + Math.sin(now / 10000) * 0.6).toFixed(1)));
        setIndicativeTdsPpm(Math.round(140 + Math.cos(now / 8000) * 4));
      }

      // Append to recent readings log
      const reading: TelemetryReading = {
        id: 'rd_' + now,
        timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
        flowRateLpm: currentFlow,
        incrementalLiters: Number(incrementalLiters.toFixed(3)),
        cumulativeLiters: Number((cumulativeLiters + incrementalLiters).toFixed(2)),
        todayLiters: Number((todayLiters + incrementalLiters).toFixed(2)),
        waterTemperatureC: Number((23.0 + Math.sin(now / 10000) * 0.6).toFixed(1)),
        indicativeTdsPpm: Math.round(140 + Math.cos(now / 8000) * 4),
        connectionState: 'connected',
      };

      setRecentReadings(prev => [reading, ...prev.slice(0, 19)]);
    }, intervalMs);

    return () => clearInterval(intervalId);
  }, [isSimulating, connectionState, simulationPreset, cumulativeLiters, todayLiters]);

  // Control handlers
  const setFlowPreset = useCallback((preset: FlowSimulationPreset) => {
    setSimulationPreset(preset);
    setActiveScenarioName(null);
    if (preset === 'disconnected') {
      setConnectionState('disconnected');
      setCurrentFlowRate(0);
    } else if (preset === 'error') {
      setConnectionState('sensor_error');
      setCurrentFlowRate(0);
    } else {
      setConnectionState('connected');
      if (preset === 'off') setCurrentFlowRate(0);
      else if (preset === 'low') setCurrentFlowRate(1.0);
      else if (preset === 'moderate') setCurrentFlowRate(2.2);
      else if (preset === 'high') setCurrentFlowRate(4.0);
    }
  }, []);

  const setCustomFlowRate = useCallback((rate: number) => {
    const clamped = Math.max(0, Math.min(10, rate));
    setCurrentFlowRate(clamped);
    if (clamped === 0) setSimulationPreset('off');
    else if (clamped <= 1.4) setSimulationPreset('low');
    else if (clamped <= 3.0) setSimulationPreset('moderate');
    else setSimulationPreset('high');
    setConnectionState('connected');
  }, []);

  const toggleSimulation = useCallback(() => {
    setIsSimulating(prev => !prev);
    lastTickTimeRef.current = Date.now();
  }, []);

  const resetDemoSession = useCallback(() => {
    setRecentReadings([]);
    setCumulativeLiters(INITIAL_CUMULATIVE_LITERS);
    setTodayLiters(INITIAL_TODAY_LITERS);
    setConnectionState('connected');
    setSimulationPreset('moderate');
    setCurrentFlowRate(2.1);
    setIsSimulating(true);
    setActiveScenarioName(null);
    addNotification({
      type: 'SYSTEM',
      severity: 'info',
      title: 'Demo Session Reset',
      message: 'Telemetry session counters reset to default demonstration baseline.',
    });
  }, [addNotification]);

  // Record Filter Replacement Workflow
  const recordFilterReplacement = useCallback((
    notes: string,
    technician: string,
    serviceType: ServiceRecord['serviceType'] = 'Filter Replacement'
  ) => {
    const newRecord: ServiceRecord = {
      id: 'srv_' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      serviceType,
      cumulativeUsageBeforeServiceLiters: Number(cumulativeLiters.toFixed(1)),
      statusBeforeService: maintenanceStatus.level,
      technicianOrUser: technician.trim() || 'User Recorded',
      notes: notes.trim() || 'Periodic filter replacement executed. Counter zeroed.',
      isSystemGenerated: false,
    };

    setServiceHistory(prev => [newRecord, ...prev]);

    // Reset cumulative counter
    setCumulativeLiters(0);

    // Update last service date in settings to today
    const todayStr = new Date().toISOString().split('T')[0];
    setSettings(prev => ({
      ...prev,
      lastServiceDate: todayStr,
    }));

    addNotification({
      type: 'MAINTENANCE_CHANGE',
      severity: 'success',
      title: 'Filter Replacement Recorded',
      message: `Cumulative counter reset from ${newRecord.cumulativeUsageBeforeServiceLiters} L to 0.0 L. Service record preserved.`,
      recommendedAction: 'Flush initial 5 liters prior to regular drinking use.',
    });
  }, [cumulativeLiters, maintenanceStatus.level, addNotification]);

  // Service History CRUD
  const addServiceRecord = useCallback((record: Omit<ServiceRecord, 'id'>) => {
    const newRecord: ServiceRecord = {
      ...record,
      id: 'srv_' + Date.now(),
    };
    setServiceHistory(prev => [newRecord, ...prev]);
    addNotification({
      type: 'SYSTEM',
      severity: 'info',
      title: 'Service Record Added',
      message: `${newRecord.serviceType} logged for ${newRecord.date}.`,
    });
  }, [addNotification]);

  const deleteServiceRecord = useCallback((id: string) => {
    setServiceHistory(prev => prev.filter(r => r.id !== id));
    addNotification({
      type: 'SYSTEM',
      severity: 'info',
      title: 'Service Record Deleted',
      message: 'The selected maintenance history entry was removed.',
    });
  }, [addNotification]);

  // Settings update
  const updateSettings = useCallback((newSettings: Partial<DeviceSettings>) => {
    const validation = validateSettings(newSettings);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }
    setSettings(prev => ({ ...prev, ...newSettings }));
    addNotification({
      type: 'SYSTEM',
      severity: 'success',
      title: 'Settings Saved',
      message: 'Device and maintenance thresholds have been updated.',
    });
    return { success: true };
  }, [addNotification]);

  const restoreDefaultSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    addNotification({
      type: 'SYSTEM',
      severity: 'info',
      title: 'Defaults Restored',
      message: 'System settings restored to demonstration defaults (1000L limit, 80% warning, 180 days interval).',
    });
  }, [addNotification]);

  const clearAllDemoData = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY_SETTINGS);
    localStorage.removeItem(STORAGE_KEY_CUMULATIVE);
    localStorage.removeItem(STORAGE_KEY_TODAY);
    localStorage.removeItem(STORAGE_KEY_HISTORY);
    localStorage.removeItem(STORAGE_KEY_DAILY);
    localStorage.removeItem(STORAGE_KEY_NOTIFS);

    setSettings(DEFAULT_SETTINGS);
    setCumulativeLiters(0);
    setTodayLiters(0);
    setServiceHistory([]);
    setDailyUsageHistory(generatePast30DaysUsage());
    setRecentReadings([]);
    setNotifications([
      {
        id: 'notif_clean',
        timestamp: new Date().toLocaleTimeString(),
        type: 'SYSTEM',
        severity: 'info',
        title: 'Data Cleared',
        message: 'Storage cleared. Unit initialized with fresh counters.',
        isRead: false,
      },
    ]);
  }, []);

  // Dedicated Judge Demonstration Scenarios
  const triggerJudgeScenario = useCallback((scenario: 'NORMAL' | 'CHECK_SOON' | 'SERVICE_REQUIRED' | 'TIME_BASED' | 'SENSOR_FAILURE') => {
    setIsSimulating(true);

    switch (scenario) {
      case 'NORMAL':
        setActiveScenarioName('Scenario A: Normal State (< 80%)');
        setConnectionState('connected');
        setCumulativeLiters(360.0);
        // last service 40 days ago
        {
          const d = new Date();
          d.setDate(d.getDate() - 40);
          setSettings(prev => ({ ...prev, lastServiceDate: d.toISOString().split('T')[0] }));
        }
        setSimulationPreset('moderate');
        setCurrentFlowRate(2.1);
        break;

      case 'CHECK_SOON':
        setActiveScenarioName('Scenario B: Check Soon (>= 80% Warning)');
        setConnectionState('connected');
        // 82% of 1000L = 820L
        setCumulativeLiters(825.0);
        {
          const d = new Date();
          d.setDate(d.getDate() - 60);
          setSettings(prev => ({ ...prev, lastServiceDate: d.toISOString().split('T')[0] }));
        }
        setSimulationPreset('moderate');
        setCurrentFlowRate(2.2);
        break;

      case 'SERVICE_REQUIRED':
        setActiveScenarioName('Scenario C: Service Required (>= 1000L Limit)');
        setConnectionState('connected');
        // 102% of 1000L = 1024L
        setCumulativeLiters(1024.5);
        setSimulationPreset('low');
        setCurrentFlowRate(1.2);
        break;

      case 'TIME_BASED':
        setActiveScenarioName('Scenario D: Time-Based Limit (> 180 Days)');
        setConnectionState('connected');
        // Even with low water volume (e.g. 290L), 195 days elapsed triggers Service Required!
        setCumulativeLiters(290.0);
        {
          const d = new Date();
          d.setDate(d.getDate() - 195);
          setSettings(prev => ({ ...prev, lastServiceDate: d.toISOString().split('T')[0] }));
        }
        setSimulationPreset('moderate');
        setCurrentFlowRate(2.0);
        break;

      case 'SENSOR_FAILURE':
        setActiveScenarioName('Scenario E: Sensor Disconnection / Error');
        setConnectionState('disconnected');
        setSimulationPreset('disconnected');
        setCurrentFlowRate(0);
        break;
    }
  }, []);

  // Notification helpers
  const unreadNotificationCount = notifications.filter(n => !n.isRead).length;

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const value: AppContextType = {
    settings,
    updateSettings,
    restoreDefaultSettings,
    clearAllDemoData,

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

    serviceHistory,
    recordFilterReplacement,
    addServiceRecord,
    deleteServiceRecord,

    dailyUsageHistory,

    notifications,
    unreadNotificationCount,
    markNotificationRead,
    markAllNotificationsRead,
    clearNotifications,

    triggerJudgeScenario,
    activeScenarioName,

    indicativeTempC,
    indicativeTdsPpm,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
