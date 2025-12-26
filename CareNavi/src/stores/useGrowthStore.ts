import { create } from 'zustand';
import { CharacterStage, GrowthProfile } from '../types';
import {
  getGrowthProfile,
  updateGrowth,
  initializeGrowthProfile,
} from '../services/growthService';
import { xpForLevel, calculateLevel, calculateStage } from '../utils/helpers';

interface GrowthState {
  totalXP: number;
  level: number;
  stage: CharacterStage;
  currentLevelXP: number;
  nextLevelXP: number;
  isLoading: boolean;
  error: string | null;

  // Local actions
  addXP: (xp: number) => void;
  setLevel: (level: number) => void;
  setStage: (stage: CharacterStage) => void;
  reset: () => void;

  // Async actions
  fetchProfile: (userId: string) => Promise<void>;
  addXPAndSync: (userId: string, xp: number) => Promise<{
    leveledUp: boolean;
    stageEvolved: boolean;
  }>;
}

export const useGrowthStore = create<GrowthState>((set, get) => ({
  totalXP: 0,
  level: 1,
  stage: 'egg',
  currentLevelXP: 0,
  nextLevelXP: xpForLevel(2),
  isLoading: false,
  error: null,

  addXP: (xp) => {
    const { totalXP } = get();
    const newTotalXP = totalXP + xp;
    const newLevel = calculateLevel(newTotalXP);
    const newStage = calculateStage(newTotalXP);
    const currentLevelXP = newTotalXP - xpForLevel(newLevel);
    const nextLevelXP = xpForLevel(newLevel + 1) - xpForLevel(newLevel);

    set({
      totalXP: newTotalXP,
      level: newLevel,
      stage: newStage,
      currentLevelXP,
      nextLevelXP,
    });
  },

  setLevel: (level) => set({ level }),
  setStage: (stage) => set({ stage }),

  reset: () =>
    set({
      totalXP: 0,
      level: 1,
      stage: 'egg',
      currentLevelXP: 0,
      nextLevelXP: xpForLevel(2),
      isLoading: false,
      error: null,
    }),

  fetchProfile: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      let profile = await getGrowthProfile(userId);

      // Initialize if not exists
      if (!profile) {
        profile = await initializeGrowthProfile(userId);
      }

      set({
        totalXP: profile.total_xp,
        level: profile.level,
        stage: profile.stage,
        currentLevelXP: profile.current_level_xp,
        nextLevelXP: profile.next_level_xp,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch profile',
        isLoading: false,
      });
    }
  },

  addXPAndSync: async (userId, xp) => {
    const { level: prevLevel, stage: prevStage } = get();

    try {
      const result = await updateGrowth({ userId, xpToAdd: xp });

      set({
        totalXP: result.profile.total_xp,
        level: result.profile.level,
        stage: result.profile.stage,
        currentLevelXP: result.profile.current_level_xp,
        nextLevelXP: result.profile.next_level_xp,
      });

      return {
        leveledUp: result.leveledUp,
        stageEvolved: result.stageEvolved,
      };
    } catch (error) {
      // Fallback to local update
      get().addXP(xp);
      const { level: newLevel, stage: newStage } = get();

      return {
        leveledUp: newLevel > prevLevel,
        stageEvolved: newStage !== prevStage,
      };
    }
  },
}));
