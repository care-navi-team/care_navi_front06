import {create} from 'zustand';
import {
  WeeklyHealthData,
  DailyHealthSummary,
  HealthPermissions,
  StepData,
  SleepData,
} from '../types/health';
import {healthService} from '../services/healthService';

interface HealthStoreState {
  // Data
  weeklyData: WeeklyHealthData | null;
  todaySummary: DailyHealthSummary | null;
  permissions: HealthPermissions | null;

  // State
  isLoading: boolean;
  isAvailable: boolean;
  error: string | null;
  lastFetched: Date | null;

  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Async Actions
  checkAvailability: () => Promise<boolean>;
  requestPermissions: () => Promise<boolean>;
  fetchWeeklyData: () => Promise<void>;
  fetchTodaySummary: () => Promise<void>;
  refreshData: () => Promise<void>;

  // Selectors
  getTodaySteps: () => number;
  getTodaySleepHours: () => number;
  getWeeklySteps: () => StepData[];
  getWeeklySleep: () => SleepData[];
  getTotalWeeklySteps: () => number;
  getAverageSleepHours: () => number;
  hasPermissions: () => boolean;
}

export const useHealthStore = create<HealthStoreState>((set, get) => ({
  // Initial State
  weeklyData: null,
  todaySummary: null,
  permissions: null,
  isLoading: false,
  isAvailable: false,
  error: null,
  lastFetched: null,

  // Actions
  setLoading: isLoading => set({isLoading}),
  setError: error => set({error}),
  clearError: () => set({error: null}),

  // Async Actions
  checkAvailability: async () => {
    try {
      const available = await healthService.isAvailable();
      set({isAvailable: available});
      return available;
    } catch {
      set({isAvailable: false});
      return false;
    }
  },

  requestPermissions: async () => {
    set({isLoading: true, error: null});
    try {
      const result = await healthService.requestPermissions();
      if (result.success && result.data) {
        set({permissions: result.data, isLoading: false});
        return true;
      }
      set({error: result.error, isLoading: false});
      return false;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '권한 요청 실패';
      set({error: message, isLoading: false});
      return false;
    }
  },

  fetchWeeklyData: async () => {
    set({isLoading: true, error: null});
    try {
      const result = await healthService.getWeeklyHealthData();
      if (result.success && result.data) {
        set({
          weeklyData: result.data,
          lastFetched: new Date(),
          isLoading: false,
        });
      } else {
        set({error: result.error, isLoading: false});
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '건강 데이터 가져오기 실패';
      set({error: message, isLoading: false});
    }
  },

  fetchTodaySummary: async () => {
    set({isLoading: true, error: null});
    try {
      const result = await healthService.getDailyHealthSummary();
      if (result.success && result.data) {
        set({todaySummary: result.data, isLoading: false});
      } else {
        set({error: result.error, isLoading: false});
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '오늘 요약 가져오기 실패';
      set({error: message, isLoading: false});
    }
  },

  refreshData: async () => {
    const state = get();
    if (!state.hasPermissions()) {
      return;
    }
    await Promise.all([state.fetchWeeklyData(), state.fetchTodaySummary()]);
  },

  // Selectors
  getTodaySteps: () => get().todaySummary?.steps ?? 0,
  getTodaySleepHours: () => get().todaySummary?.sleepHours ?? 0,
  getWeeklySteps: () => get().weeklyData?.steps ?? [],
  getWeeklySleep: () => get().weeklyData?.sleep ?? [],
  getTotalWeeklySteps: () => get().weeklyData?.totalSteps ?? 0,
  getAverageSleepHours: () => get().weeklyData?.averageSleep ?? 0,
  hasPermissions: () => {
    const perms = get().permissions;
    return perms?.steps === 'granted' || perms?.sleep === 'granted';
  },
}));
