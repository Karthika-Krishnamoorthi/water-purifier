/**
 * ClearSense - Water Usage & Predictive Maintenance Decision Engine
 * Pure, testable logic for flow calculation, maintenance rule evaluation, and data exports.
 */

import { MaintenanceStatusResult, MaintenanceLevel, DeviceSettings } from '../types';

/**
 * Calculates incremental water volume in Liters based on instantaneous flow rate and elapsed time.
 * Formula: Incremental Volume (L) = Flow Rate (L/min) * Elapsed Time (seconds) / 60
 */
export function calculateIncrementalVolume(flowRateLpm: number, elapsedSeconds: number): number {
  if (flowRateLpm <= 0 || elapsedSeconds <= 0) return 0;
  return (flowRateLpm * elapsedSeconds) / 60;
}

/**
 * Determines maintenance status and recommendations according to configured rules.
 * 
 * Hierarchy:
 * 1. SERVICE REQUIRED: usage >= limit OR elapsed days >= max interval (HIGHEST PRIORITY)
 * 2. CHECK SOON: usage >= warning threshold OR elapsed days >= warning interval
 * 3. NORMAL: all limits within safe boundaries
 */
export function determineMaintenanceStatus(
  cumulativeLiters: number,
  filterLimitLiters: number,
  warningThresholdPercent: number,
  lastServiceDateStr: string,
  maxServiceIntervalDays: number,
  currentDate: Date = new Date()
): MaintenanceStatusResult {
  // Ensure valid numerical bounds
  const limit = Math.max(1, filterLimitLiters);
  const warningPct = Math.min(99, Math.max(1, warningThresholdPercent));
  const warningThresholdLiters = (limit * warningPct) / 100;
  const currentUsage = Math.max(0, cumulativeLiters);

  // Remaining usage clamp >= 0
  const usageRemainingLiters = Math.max(0, limit - currentUsage);
  // Remaining percentage clamp between 0% and 100%
  const usageRemainingPercent = Math.min(100, Math.max(0, Math.round((usageRemainingLiters / limit) * 100)));

  // Date interval calculation
  let daysElapsed = 0;
  try {
    const lastService = new Date(lastServiceDateStr);
    if (!isNaN(lastService.getTime())) {
      const diffMs = currentDate.getTime() - lastService.getTime();
      daysElapsed = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    }
  } catch {
    daysElapsed = 0;
  }

  const daysRemaining = Math.max(0, maxServiceIntervalDays - daysElapsed);
  const timeWarningDays = Math.floor(maxServiceIntervalDays * (warningPct / 100));

  const isUsageLimitExceeded = currentUsage >= limit;
  const isUsageWarningExceeded = currentUsage >= warningThresholdLiters;
  const isTimeLimitExceeded = daysElapsed >= maxServiceIntervalDays;
  const isTimeWarningExceeded = daysElapsed >= timeWarningDays;

  const reasons: string[] = [];
  let level: MaintenanceLevel = 'NORMAL';
  let recommendedAction = 'Your monitored usage is within the configured maintenance limits. Continue monitoring and follow the purifier manufacturer’s service guidance.';

  // SERVICE REQUIRED CHECK (Priority 1)
  if (isUsageLimitExceeded || isTimeLimitExceeded) {
    level = 'SERVICE_REQUIRED';
    if (isUsageLimitExceeded) {
      reasons.push(
        `Cumulative water volume (${currentUsage.toFixed(1)} L) has reached or exceeded configured filter capacity (${limit} L).`
      );
    }
    if (isTimeLimitExceeded) {
      reasons.push(
        `Elapsed service time (${daysElapsed} days) has exceeded maximum interval (${maxServiceIntervalDays} days).`
      );
    }
    recommendedAction =
      'The configured maintenance limit has been reached. Arrange the recommended service or replace the filter cartridge before continued operation.';
  }
  // CHECK SOON CHECK (Priority 2)
  else if (isUsageWarningExceeded || isTimeWarningExceeded) {
    level = 'CHECK_SOON';
    if (isUsageWarningExceeded) {
      reasons.push(
        `Cumulative volume (${currentUsage.toFixed(1)} L) reached the ${warningPct}% warning threshold (${warningThresholdLiters.toFixed(0)} L).`
      );
    }
    if (isTimeWarningExceeded) {
      reasons.push(
        `Elapsed service duration (${daysElapsed} days) approached the time warning threshold (${timeWarningDays} days).`
      );
    }
    recommendedAction =
      'Water usage or service interval has reached the configured warning threshold. Plan filter maintenance according to the manufacturer’s recommendations.';
  } else {
    // NORMAL
    reasons.push(
      `Usage (${currentUsage.toFixed(1)} L) is ${(100 - (currentUsage / limit) * 100).toFixed(0)}% within service limit.`
    );
    reasons.push(
      `Service age (${daysElapsed} days) is healthy (${daysRemaining} days remaining).`
    );
  }

  return {
    level,
    reasons,
    recommendedAction,
    usageRemainingLiters: Math.round(usageRemainingLiters * 10) / 10,
    usageRemainingPercent,
    daysRemaining,
    daysElapsed,
    isUsageTriggered: isUsageLimitExceeded || isUsageWarningExceeded,
    isTimeTriggered: isTimeLimitExceeded || isTimeWarningExceeded,
  };
}

/**
 * Validate settings input
 */
export function validateSettings(settings: Partial<DeviceSettings>): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (settings.filterLimitLiters !== undefined) {
    if (isNaN(settings.filterLimitLiters) || settings.filterLimitLiters < 100 || settings.filterLimitLiters > 50000) {
      errors.filterLimitLiters = 'Filter limit must be between 100 L and 50,000 L.';
    }
  }

  if (settings.warningThresholdPercent !== undefined) {
    if (isNaN(settings.warningThresholdPercent) || settings.warningThresholdPercent < 50 || settings.warningThresholdPercent > 98) {
      errors.warningThresholdPercent = 'Warning threshold must be between 50% and 98%.';
    }
  }

  if (settings.maxServiceIntervalDays !== undefined) {
    if (isNaN(settings.maxServiceIntervalDays) || settings.maxServiceIntervalDays < 30 || settings.maxServiceIntervalDays > 730) {
      errors.maxServiceIntervalDays = 'Service interval must be between 30 and 730 days.';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Browser CSV export utility
 */
export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]): void {
  const escapeCell = (val: string | number) => {
    const stringVal = String(val ?? '');
    if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
      return `"${stringVal.replace(/"/g, '""')}"`;
    }
    return stringVal;
  };

  const csvContent = [
    headers.map(escapeCell).join(','),
    ...rows.map(row => row.map(escapeCell).join(','))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates human readable relative date string
 */
export function formatTimeAgo(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } catch {
    return dateStr;
  }
}
