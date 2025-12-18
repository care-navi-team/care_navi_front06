// Health Data Types

export interface StepData {
  count: number;
  date: string; // YYYY-MM-DD
  source?: string;
}

export interface SleepData {
  hours: number;
  date: string; // YYYY-MM-DD
  quality?: 'poor' | 'fair' | 'good' | 'excellent';
  sleepStart?: string;
  sleepEnd?: string;
}

export interface WeeklyHealthData {
  steps: StepData[];
  sleep: SleepData[];
  totalSteps: number;
  averageSleep: number;
  startDate: string;
  endDate: string;
}

export interface DailyHealthSummary {
  steps: number;
  sleepHours: number;
  date: string;
}

export type HealthPermissionStatus =
  | 'granted'
  | 'denied'
  | 'not_determined'
  | 'unavailable';

export interface HealthPermissions {
  steps: HealthPermissionStatus;
  sleep: HealthPermissionStatus;
}

export interface HealthServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface IHealthService {
  // Availability
  isAvailable(): Promise<boolean>;

  // Permissions
  requestPermissions(): Promise<HealthServiceResult<HealthPermissions>>;
  checkPermissions(): Promise<HealthPermissions>;

  // Step Data
  getTodaySteps(): Promise<HealthServiceResult<number>>;
  getStepsForDate(date: Date): Promise<HealthServiceResult<StepData>>;
  getWeeklySteps(endDate?: Date): Promise<HealthServiceResult<StepData[]>>;

  // Sleep Data
  getTodaySleep(): Promise<HealthServiceResult<number>>;
  getSleepForDate(date: Date): Promise<HealthServiceResult<SleepData>>;
  getWeeklySleep(endDate?: Date): Promise<HealthServiceResult<SleepData[]>>;

  // Combined
  getWeeklyHealthData(endDate?: Date): Promise<HealthServiceResult<WeeklyHealthData>>;
  getDailyHealthSummary(date?: Date): Promise<HealthServiceResult<DailyHealthSummary>>;
}
