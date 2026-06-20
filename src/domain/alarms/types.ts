export type AlarmSeverity = 'warning' | 'danger';

export interface AlarmItem {
  id: string;
  severity: AlarmSeverity;
  message: string;
}
