/**
 * ClearSense - Decision Engine & Calculations Unit Verification
 * Tests the core algorithmic rules specified in AtomQUEST Track 2 brief.
 */

import { calculateIncrementalVolume, determineMaintenanceStatus, validateSettings } from './engine.ts';

function runTests() {
  console.log('--- Running ClearSense Engine Tests ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, desc: string) {
    if (condition) {
      console.log(`✓ PASS: ${desc}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${desc}`);
      failed++;
    }
  }

  // 1. Incremental Volume Tests
  // Formula: Incremental Water Volume (L) = Flow Rate (L/min) * Elapsed Time (seconds) / 60
  const vol1 = calculateIncrementalVolume(2.0, 30);
  assert(Math.abs(vol1 - 1.0) < 0.0001, '2 L/min for 30s calculates exactly 1.0 L');

  const vol2 = calculateIncrementalVolume(0, 30);
  assert(vol2 === 0, '0 L/min produces 0 incremental volume');

  const vol3 = calculateIncrementalVolume(3.0, 60);
  assert(Math.abs(vol3 - 3.0) < 0.0001, '3 L/min for 60s calculates 3.0 L');

  // 2. Maintenance Status: NORMAL
  // Config: 1000L limit, 80% warning (800L), 180 days interval
  const statusNormal = determineMaintenanceStatus(
    400, // 400 L
    1000,
    80,
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    180
  );
  assert(statusNormal.level === 'NORMAL', '400L / 1000L at 30 days is NORMAL');
  assert(statusNormal.usageRemainingPercent === 60, '60% usage remaining');
  assert(statusNormal.usageRemainingLiters === 600, '600L remaining volume');

  // 3. Maintenance Status: CHECK_SOON (Volume Trigger)
  const statusCheckSoon = determineMaintenanceStatus(
    820, // 820 L >= 800 L
    1000,
    80,
    new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    180
  );
  assert(statusCheckSoon.level === 'CHECK_SOON', '820L (>= 80%) triggers CHECK_SOON');
  assert(statusCheckSoon.isUsageTriggered === true, 'Usage trigger flag is true');

  // 4. Maintenance Status: SERVICE_REQUIRED (Volume Trigger)
  const statusServiceRequired = determineMaintenanceStatus(
    1020, // 1020 L >= 1000 L
    1000,
    80,
    new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    180
  );
  assert(statusServiceRequired.level === 'SERVICE_REQUIRED', '1020L (>= 1000L limit) triggers SERVICE_REQUIRED');
  assert(statusServiceRequired.usageRemainingLiters === 0, 'Remaining liters clamped to 0');
  assert(statusServiceRequired.usageRemainingPercent === 0, 'Remaining percentage clamped to 0');

  // 5. Maintenance Status: SERVICE_REQUIRED Priority over Warning
  const statusPriority = determineMaintenanceStatus(
    1000,
    1000,
    80,
    new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    180
  );
  assert(statusPriority.level === 'SERVICE_REQUIRED', 'SERVICE_REQUIRED takes precedence over warning threshold');

  // 6. Maintenance Status: TIME-BASED SERVICE_REQUIRED (Low Usage, Elapsed Days Exceeded)
  const statusTimeBased = determineMaintenanceStatus(
    250, // low usage
    1000,
    80,
    new Date(Date.now() - 185 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 185 days > 180
    180
  );
  assert(statusTimeBased.level === 'SERVICE_REQUIRED', 'Elapsed time > 180 days triggers SERVICE_REQUIRED even with low volume');
  assert(statusTimeBased.isTimeTriggered === true, 'Time trigger flag is true');

  // 7. Settings Validation
  const valValid = validateSettings({ filterLimitLiters: 1500, warningThresholdPercent: 85, maxServiceIntervalDays: 180 });
  assert(valValid.isValid === true, 'Standard settings are validated as true');

  const valInvalid = validateSettings({ filterLimitLiters: -10, warningThresholdPercent: 120 });
  assert(valInvalid.isValid === false, 'Invalid negative limits and >100% warning rejected');

  console.log(`\nSummary: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
