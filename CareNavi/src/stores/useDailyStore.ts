import { create } from 'zustand';
import { DailyState, DailyStateValue } from '../types';
import * as dailyStateService from '../services/dailyStateService';

interface DailyStoreState {
  dailyState: DailyState | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setDailyState: (state: DailyState | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Async actions
  fetchTodayState: (userId: string) => Promise<void>;
  transitionToInProgress: (userId: string) => Promise<void>;
  transitionToCompleted: (userId: string) => Promise<void>;

  // Selectors
  isBeforeCheck: () => boolean;
  isInProgress: () => boolean;
  isCompleted: () => boolean;
  getCurrentState: () => DailyStateValue | null;
}

export const useDailyStore = create<DailyStoreState>((set, get) => ({
  dailyState: null,
  isLoading: false,
  error: null,

  setDailyState: (dailyState) => set({ dailyState }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  fetchTodayState: async (userId: string) => {
    set({ isLoading: true, error: null });
    try {
      const { state, isNewDay } = await dailyStateService.getTodayState(userId);
      set({ dailyState: state, isLoading: false });

      if (isNewDay) {
        console.log('New day detected, state reset to before_check');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch daily state';
      set({ error: message, isLoading: false });
    }
  },

  transitionToInProgress: async (userId: string) => {
    const currentState = get().dailyState?.state;
    if (currentState !== 'before_check') {
      console.warn('Cannot transition to in_progress from:', currentState);
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const newState = await dailyStateService.transitionState(
        userId,
        'before_check',
        'in_progress'
      );
      set({ dailyState: newState, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to transition state';
      set({ error: message, isLoading: false });
    }
  },

  transitionToCompleted: async (userId: string) => {
    const currentState = get().dailyState?.state;
    if (currentState !== 'in_progress') {
      console.warn('Cannot transition to completed from:', currentState);
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const newState = await dailyStateService.transitionState(
        userId,
        'in_progress',
        'daily_completed'
      );
      set({ dailyState: newState, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to transition state';
      set({ error: message, isLoading: false });
    }
  },

  isBeforeCheck: () => get().dailyState?.state === 'before_check',
  isInProgress: () => get().dailyState?.state === 'in_progress',
  isCompleted: () => get().dailyState?.state === 'daily_completed',
  getCurrentState: () => get().dailyState?.state ?? null,
}));
