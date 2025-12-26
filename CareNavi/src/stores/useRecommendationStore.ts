import { create } from 'zustand';
import { ProductRecommendation, ConditionAnalysis } from '../types';
import {
  getRecommendationsForCondition,
  trackRecommendationClick,
  getTodayRecommendations,
} from '../services/recommendationService';

interface RecommendationState {
  recommendations: ProductRecommendation[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setRecommendations: (recommendations: ProductRecommendation[]) => void;
  clearRecommendations: () => void;

  // Async actions
  fetchRecommendations: (
    userId: string,
    conditionRecordId: string,
    analysis: ConditionAnalysis
  ) => Promise<void>;
  fetchTodayRecommendations: (userId: string) => Promise<void>;
  trackClick: (recommendationId: string) => Promise<void>;
}

export const useRecommendationStore = create<RecommendationState>((set, get) => ({
  recommendations: [],
  isLoading: false,
  error: null,

  setRecommendations: (recommendations) => set({ recommendations }),

  clearRecommendations: () => set({ recommendations: [] }),

  fetchRecommendations: async (userId, conditionRecordId, analysis) => {
    // Only fetch if should recommend products
    if (!analysis.shouldRecommendProducts) {
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const recommendations = await getRecommendationsForCondition({
        userId,
        conditionRecordId,
        analysis,
      });
      set({ recommendations, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch recommendations',
        isLoading: false,
      });
    }
  },

  fetchTodayRecommendations: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const recommendations = await getTodayRecommendations(userId);
      set({ recommendations, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch recommendations',
        isLoading: false,
      });
    }
  },

  trackClick: async (recommendationId) => {
    try {
      const updated = await trackRecommendationClick(recommendationId);
      if (updated) {
        const { recommendations } = get();
        const updatedRecommendations = recommendations.map((r) =>
          r.id === recommendationId ? updated : r
        );
        set({ recommendations: updatedRecommendations });
      }
    } catch (error) {
      console.warn('Failed to track recommendation click:', error);
    }
  },
}));
