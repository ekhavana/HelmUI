import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyHeadingDelta,
  describeCommand,
  headingDeviation,
  isEngaged,
  normalizeHeading,
  requiresConfirmation,
} from './commands.ts';

test('normalizeHeading wraps into [0, 360)', () => {
  assert.equal(normalizeHeading(0), 0);
  assert.equal(normalizeHeading(360), 0);
  assert.equal(normalizeHeading(361), 1);
  assert.equal(normalizeHeading(-1), 359);
  assert.equal(normalizeHeading(-370), 350);
});

test('applyHeadingDelta trims and wraps, rounding to whole degrees', () => {
  assert.equal(applyHeadingDelta(90, 10), 100);
  assert.equal(applyHeadingDelta(355, 10), 5);
  assert.equal(applyHeadingDelta(5, -10), 355);
  assert.equal(applyHeadingDelta(12.4, 1), 13);
});

test('applyHeadingDelta returns null when there is no current target', () => {
  assert.equal(applyHeadingDelta(null, 10), null);
});

test('headingDeviation returns shortest signed difference', () => {
  assert.equal(headingDeviation(100, 90), 10);
  assert.equal(headingDeviation(10, 350), 20);
  assert.equal(headingDeviation(350, 10), -20);
  assert.equal(headingDeviation(null, 10), null);
});

test('engagement, tack, and waypoint skip require confirmation; trims do not', () => {
  assert.equal(requiresConfirmation({ kind: 'setState', state: 'auto' }), true);
  assert.equal(requiresConfirmation({ kind: 'setState', state: 'standby' }), true);
  assert.equal(requiresConfirmation({ kind: 'tack', direction: 'port' }), true);
  assert.equal(requiresConfirmation({ kind: 'advanceWaypoint' }), true);
  assert.equal(requiresConfirmation({ kind: 'adjustHeading', deltaDegrees: 10 }), false);
  assert.equal(requiresConfirmation({ kind: 'setHeading', headingDegrees: 120 }), false);
});

test('describeCommand renders human-readable text for confirmations and logs', () => {
  assert.equal(describeCommand({ kind: 'setState', state: 'standby' }), 'Disengage autopilot (Standby)');
  assert.equal(
    describeCommand({ kind: 'setState', state: 'wind' }),
    'Engage autopilot in Wind mode',
  );
  assert.equal(describeCommand({ kind: 'adjustHeading', deltaDegrees: -10 }), 'Adjust target heading 10\u00b0 to port');
  assert.equal(describeCommand({ kind: 'tack', direction: 'starboard' }), 'Tack to starboard');
});

test('isEngaged treats standby/off as disengaged', () => {
  assert.equal(isEngaged('auto'), true);
  assert.equal(isEngaged('WIND'), true);
  assert.equal(isEngaged('standby'), false);
  assert.equal(isEngaged('Off'), false);
  assert.equal(isEngaged(null), false);
});
