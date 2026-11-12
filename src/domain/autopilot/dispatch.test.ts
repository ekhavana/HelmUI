import test from 'node:test';
import assert from 'node:assert/strict';
import { toBridgeCommand, toSignalKPut } from './dispatch.ts';

test('setState maps to the autopilot state path on Signal K and the state topic on the bridge', () => {
  assert.deepEqual(toSignalKPut({ kind: 'setState', state: 'auto' }), {
    path: 'steering.autopilot.state',
    value: 'auto',
  });
  assert.deepEqual(toBridgeCommand({ kind: 'setState', state: 'standby' }), { type: 'state', value: 'standby' });
});

test('setHeading converts degrees to radians for Signal K and keeps whole degrees for the bridge', () => {
  const put = toSignalKPut({ kind: 'setHeading', headingDegrees: 180 });
  assert.equal(put.path, 'steering.autopilot.target.headingTrue');
  assert.ok(Math.abs((put.value as number) - Math.PI) < 1e-9);
  assert.deepEqual(toBridgeCommand({ kind: 'setHeading', headingDegrees: 370 }), { type: 'heading', value: '10' });
});

test('adjustHeading uses the relative action path', () => {
  assert.deepEqual(toSignalKPut({ kind: 'adjustHeading', deltaDegrees: -10 }), {
    path: 'steering.autopilot.actions.adjustHeading',
    value: -10,
  });
  assert.deepEqual(toBridgeCommand({ kind: 'adjustHeading', deltaDegrees: 1 }), { type: 'adjust', value: '1' });
});

test('tack and advanceWaypoint map to their action paths', () => {
  assert.deepEqual(toSignalKPut({ kind: 'tack', direction: 'port' }), {
    path: 'steering.autopilot.actions.tack',
    value: 'port',
  });
  assert.deepEqual(toSignalKPut({ kind: 'advanceWaypoint' }), {
    path: 'steering.autopilot.actions.advanceWaypoint',
    value: 1,
  });
  assert.deepEqual(toBridgeCommand({ kind: 'advanceWaypoint' }), { type: 'advance', value: '1' });
});
