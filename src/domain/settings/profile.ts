export const SETTINGS_PROFILE_VERSION = 1;

export interface HelmSettingsProfile {
  version: number;
  exportedAt: string;
  settings: {
    brightness: number;
    theme: 'day' | 'night' | 'auto';
    depthWarningFt: number;
    depthOffsetFt: number;
    autoLaunch: boolean;
    touchLock: boolean;
  };
  anchorRadiusMeters: number;
}

export function isHelmSettingsProfile(value: unknown): value is HelmSettingsProfile {
  if (!value || typeof value !== 'object') return false;
  const profile = value as Partial<HelmSettingsProfile>;
  const settings = profile.settings;
  return (
    profile.version === SETTINGS_PROFILE_VERSION &&
    typeof profile.exportedAt === 'string' &&
    typeof profile.anchorRadiusMeters === 'number' &&
    Number.isFinite(profile.anchorRadiusMeters) &&
    !!settings &&
    typeof settings.brightness === 'number' &&
    (settings.theme === 'day' || settings.theme === 'night' || settings.theme === 'auto') &&
    typeof settings.depthWarningFt === 'number' &&
    typeof settings.depthOffsetFt === 'number' &&
    typeof settings.autoLaunch === 'boolean' &&
    typeof settings.touchLock === 'boolean'
  );
}
