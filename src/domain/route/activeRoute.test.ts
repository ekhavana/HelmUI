import test from 'node:test';
import assert from 'node:assert/strict';
import { buildActiveRoute } from './activeRoute.ts';

const vessel = { latitude: 37.8, longitude: -122.4 };
const next = { latitude: 37.9, longitude: -122.5 };
const previous = { latitude: 37.7, longitude: -122.3 };

test('returns null when there is no next waypoint', () => {
  assert.equal(buildActiveRoute({ vessel, nextWaypoint: null, previousWaypoint: previous }), null);
});

test('builds the active leg and course-to-steer when all points are present', () => {
  const geometry = buildActiveRoute({ vessel, nextWaypoint: next, previousWaypoint: previous });
  assert.ok(geometry);
  assert.deepEqual(geometry?.legs, [[previous, next]]);
  assert.deepEqual(geometry?.courseToSteer, [vessel, next]);
  assert.deepEqual(geometry?.nextWaypoint, next);
});

test('omits the leg when there is no previous waypoint (single go-to mark)', () => {
  const geometry = buildActiveRoute({ vessel, nextWaypoint: next, previousWaypoint: null });
  assert.deepEqual(geometry?.legs, []);
  assert.deepEqual(geometry?.courseToSteer, [vessel, next]);
});

test('omits the course-to-steer when the vessel position is unknown', () => {
  const geometry = buildActiveRoute({ vessel: null, nextWaypoint: next, previousWaypoint: previous });
  assert.equal(geometry?.courseToSteer, null);
  assert.deepEqual(geometry?.legs, [[previous, next]]);
});

test('ignores non-finite coordinates', () => {
  const geometry = buildActiveRoute({
    vessel: { latitude: Number.NaN, longitude: -122.4 },
    nextWaypoint: next,
    previousWaypoint: { latitude: Number.POSITIVE_INFINITY, longitude: -122.3 },
  });
  assert.equal(geometry?.courseToSteer, null);
  assert.deepEqual(geometry?.legs, []);
});
