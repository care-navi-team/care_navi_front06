import { create } from 'zustand';
import { Mission, MissionType } from '../types';
import {
  generateMissions,
  getTodayMissions,
  completeMission,
} from '../services/missionService';
import { ConditionAnalysis } from '../types';
import { SurveyData } from '../types/survey';

interface MissionState {
  missions: Mission[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setMissions: (missions: Mission[]) => void;
  fetchTodayMissions: (userId: string) => Promise<void>;
  generateMissions: (
    userId: string,
    conditionRecordId: string,
    analysis: ConditionAnalysis,
    surveyData?: SurveyData | null
  ) => Promise<boolean>;
  completeMission: (missionId: string, userId: string) => Promise<Mission | null>;
  getMissionByType: (type: MissionType) => Mission | undefined;
  getCompletedCount: () => number;
  getTotalXP: () => number;
  areAllCompleted: () => boolean;
  reset: () => void;
}

export const useMissionStore = create<MissionState>((set, get) => ({
  missions: [],
  isLoading: false,
  error: null,

  setMissions: (missions) => set({ missions }),

  fetchTodayMissions: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const missions = await getTodayMissions(userId);
      set({ missions, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch missions',
        isLoading: false,
      });
    }
  },

  generateMissions: async (userId, conditionRecordId, analysis, surveyData) => {
    set({ isLoading: true, error: null });
    try {
      const { missions } = await generateMissions({
        userId,
        conditionRecordId,
        analysis,
        surveyData,
      });
      set({ missions, isLoading: false });
      return true;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to generate missions',
        isLoading: false,
      });
      return false;
    }
  },

  completeMission: async (missionId, userId) => {
    try {
      const completedMission = await completeMission(missionId, userId);
      const { missions } = get();
      const updatedMissions = missions.map((m) =>
        m.id === missionId ? completedMission : m
      );
      set({ missions: updatedMissions });
      return completedMission;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to complete mission',
      });
      return null;
    }
  },

  getMissionByType: (type) => {
    const { missions } = get();
    return missions.find((m) => m.type === type);
  },

  getCompletedCount: () => {
    const { missions } = get();
    return missions.filter((m) => m.is_completed).length;
  },

  getTotalXP: () => {
    const { missions } = get();
    return missions
      .filter((m) => m.is_completed)
      .reduce((sum, m) => sum + m.xp_reward, 0);
  },

  areAllCompleted: () => {
    const { missions } = get();
    return missions.length > 0 && missions.every((m) => m.is_completed);
  },

  reset: () => set({ missions: [], isLoading: false, error: null }),
}));
