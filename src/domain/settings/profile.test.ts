import test from 'node:test';
import assert from 'node:assert/strict';
import { isHelmSettingsProfile, SETTINGS_PROFILE_VERSION } from './profile.ts';

test('isHelmSettingsProfile accepts a v1 profile', () => {
  assert.equal(
    isHelmSettingsProfile({
      version: SETTINGS_PROFILE_VERSION,
      exportedAt: '2026-09-24T00:00:00.000Z',
      settings: {
        brightness: 78,
        theme: 'night',
        depthWarningFt: 6,
        depthOffsetFt: -1,
        autoLaunch: true,
        touchLock: false,
      },
      anchorRadiusMeters: 24,
    }),
    true,
  );
});

test('isHelmSettingsProfile rejects incomplete JSON', () => {
  assert.equal(isHelmSettingsProfile({ version: 1, settings: {} }), false);
  assert.equal(isHelmSettingsProfile(null), false);
});
