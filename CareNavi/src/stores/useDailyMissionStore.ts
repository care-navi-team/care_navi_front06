import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DailyMission,
  DailyMissionState,
  DAILY_MISSIONS_TEMPLATE,
} from '../types/dailyMission';

const STORAGE_KEY = 'daily_missions';

const getTodayDate = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const createTodayMissions = (): DailyMission[] => {
  return DAILY_MISSIONS_TEMPLATE.map(template => ({
    ...template,
    completed: false,
    photoUri: undefined,
    completedAt: undefined,
  }));
};

interface DailyMissionStoreState {
  date: string;
  missions: DailyMission[];
  isLoading: boolean;

  // Actions
  loadMissions: () => Promise<void>;
  completeMission: (missionId: string, photoUri?: string) => Promise<void>;
  getMissionById: (missionId: string) => DailyMission | undefined;
  getCompletedCount: () => number;
  getTotalCount: () => number;
  getMedicationMissions: () => DailyMission[];
  getMealMissions: () => DailyMission[];
}

export const useDailyMissionStore = create<DailyMissionStoreState>(
  (set, get) => ({
    date: getTodayDate(),
    missions: [],
    isLoading: true,

    loadMissions: async () => {
      try {
        const today = getTodayDate();
        const stored = await AsyncStorage.getItem(STORAGE_KEY);

        if (stored) {
          const state: DailyMissionState = JSON.parse(stored);

          // Check if stored data is for today
          if (state.date === today) {
            set({date: today, missions: state.missions, isLoading: false});
            return;
          }
        }

        // Create new missions for today
        const newMissions = createTodayMissions();
        const newState: DailyMissionState = {
          date: today,
          missions: newMissions,
        };

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
        set({date: today, missions: newMissions, isLoading: false});
      } catch (error) {
        console.error('Failed to load daily missions:', error);
        // Fallback to new missions
        const newMissions = createTodayMissions();
        set({date: getTodayDate(), missions: newMissions, isLoading: false});
      }
    },

    completeMission: async (missionId: string, photoUri?: string) => {
      const {missions, date} = get();

      const updatedMissions = missions.map(mission => {
        if (mission.id === missionId) {
          return {
            ...mission,
            completed: true,
            photoUri: photoUri,
            completedAt: new Date().toISOString(),
          };
        }
        return mission;
      });

      const newState: DailyMissionState = {
        date,
        missions: updatedMissions,
      };

      try {
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
        set({missions: updatedMissions});
      } catch (error) {
        console.error('Failed to save mission completion:', error);
      }
    },

    getMissionById: (missionId: string) => {
      return get().missions.find(m => m.id === missionId);
    },

    getCompletedCount: () => {
      return get().missions.filter(m => m.completed).length;
    },

    getTotalCount: () => {
      return get().missions.length;
    },

    getMedicationMissions: () => {
      return get().missions.filter(m => m.type === 'medication');
    },

    getMealMissions: () => {
      return get().missions.filter(m => m.type === 'meal');
    },
  }),
);
