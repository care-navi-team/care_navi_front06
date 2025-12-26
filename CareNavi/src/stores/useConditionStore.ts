import { create } from 'zustand';
import { ConditionRecord, ConditionAnalysis } from '../types';
import * as conditionService from '../services/conditionService';

interface AnalyzeResult {
  success: boolean;
  analysis?: ConditionAnalysis;
  conditionRecordId?: string;
  usedFallback?: boolean;
  errorMessage?: string;
}

interface ConditionStoreState {
  conditionRecord: ConditionRecord | null;
  conditionRecordId: string | null;
  analysis: ConditionAnalysis | null;
  isAnalyzing: boolean;
  error: string | null;

  // Actions
  setConditionRecord: (record: ConditionRecord | null) => void;
  setAnalysis: (analysis: ConditionAnalysis | null) => void;
  setAnalyzing: (analyzing: boolean) => void;
  setError: (error: string | null) => void;
  clearCondition: () => void;

  // Async actions
  analyzeAndSave: (userId: string, rawInput: string) => Promise<AnalyzeResult>;
  fetchTodayCondition: (userId: string) => Promise<void>;
}

export const useConditionStore = create<ConditionStoreState>((set) => ({
  conditionRecord: null,
  conditionRecordId: null,
  analysis: null,
  isAnalyzing: false,
  error: null,

  setConditionRecord: (conditionRecord) => set({ conditionRecord }),
  setAnalysis: (analysis) => set({ analysis }),
  setAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setError: (error) => set({ error }),

  clearCondition: () =>
    set({
      conditionRecord: null,
      conditionRecordId: null,
      analysis: null,
      error: null,
    }),

  analyzeAndSave: async (userId: string, rawInput: string): Promise<AnalyzeResult> => {
    set({ isAnalyzing: true, error: null });
    try {
      const { record, analysis, usedFallback, errorMessage } = await conditionService.analyzeCondition({
        userId,
        rawInput,
      });
      set({
        conditionRecord: record,
        conditionRecordId: record.id,
        analysis,
        isAnalyzing: false,
      });
      return {
        success: true,
        analysis,
        conditionRecordId: record.id,
        usedFallback,
        errorMessage,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to analyze condition';
      set({ error: message, isAnalyzing: false });
      return { success: false, errorMessage: message };
    }
  },

  fetchTodayCondition: async (userId: string) => {
    try {
      const record = await conditionService.getTodayCondition(userId);
      if (record) {
        set({
          conditionRecord: record,
          conditionRecordId: record.id,
          analysis: record.ai_analysis as unknown as ConditionAnalysis,
        });
      }
    } catch (error) {
      console.warn('Failed to fetch today condition:', error);
    }
  },
}));
