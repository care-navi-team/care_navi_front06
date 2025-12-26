
import { z } from 'zod';
import { supabase } from './supabase';
import { analyzeConditionWithAI } from './geminiService';
import { ConditionRecord, ConditionAnalysis } from '../types';
import { getTodayDate } from '../utils/helpers';
import {
  CONDITION_INPUT_MIN_LENGTH,
  CONDITION_INPUT_MAX_LENGTH,
  DEFAULT_CONDITION_ANALYSIS,
} from '../utils/constants';


const conditionInputSchema = z.object({
  rawInput: z
    .string()
    .min(CONDITION_INPUT_MIN_LENGTH, '컨디션을 더 자세히 알려주세요')
    .max(CONDITION_INPUT_MAX_LENGTH, '입력이 너무 깁니다'),
});

interface AnalyzeConditionRequest {
  userId: string;
  rawInput: string;
}

interface AnalyzeConditionResponse {
  record: ConditionRecord;
  analysis: ConditionAnalysis;
  usedFallback: boolean;
  errorMessage?: string;
}

/**
 * Analyze condition and save to database
 */
export async function analyzeCondition(
  request: AnalyzeConditionRequest
): Promise<AnalyzeConditionResponse> {
  // Validate input
  const validation = conditionInputSchema.safeParse({ rawInput: request.rawInput });
  if (!validation.success) {
    throw new Error(validation.error.issues[0].message);
  }

  const today = getTodayDate();

  // Analyze with AI (with improved error handling)
  const analysisResult = await analyzeConditionWithAI(request.rawInput);
  const { analysis, usedFallback, errorMessage } = analysisResult;

  // Check for existing record today (upsert)
  const { data: existingRecord } = await supabase
    .from('condition_records')
    .select('id')
    .eq('user_id', request.userId)
    .eq('date', today)
    .single();

  let record: ConditionRecord;

  if (existingRecord) {
    // Update existing
    const { data, error } = await supabase
      .from('condition_records')
      .update({
        raw_input: request.rawInput,
        mood: analysis.mood,
        physical: analysis.physical,
        main_issue: analysis.mainIssue,
        ai_analysis: analysis,
        recorded_at: new Date().toISOString(),
      })
      .eq('id', existingRecord.id)
      .select()
      .single();

    if (error) throw error;
    record = data as ConditionRecord;
  } else {
    // Create new
    const { data, error } = await supabase
      .from('condition_records')
      .insert({
        user_id: request.userId,
        date: today,
        raw_input: request.rawInput,
        mood: analysis.mood,
        physical: analysis.physical,
        main_issue: analysis.mainIssue,
        ai_analysis: analysis,
      })
      .select()
      .single();

    if (error) throw error;
    record = data as ConditionRecord;
  }

  return { record, analysis, usedFallback, errorMessage };
}

/**
 * Get today's condition record
 */
export async function getTodayCondition(userId: string): Promise<ConditionRecord | null> {
  const today = getTodayDate();

  const { data, error } = await supabase
    .from('condition_records')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single();

  if (error || !data) return null;
  return data as ConditionRecord;
}
