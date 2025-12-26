
import { supabase } from './supabase';
import { DailyState, DailyStateValue } from '../types';
import { getTodayDate } from '../utils/helpers';

interface GetTodayStateResponse {
  state: DailyState;
  isNewDay: boolean;
}

/**
 * Get today's daily state for user. Creates new if doesn't exist.
 */
export async function getTodayState(userId: string): Promise<GetTodayStateResponse> {
  const today = getTodayDate();

  // Try to get existing state for today
  const { data: existingState, error: fetchError } = await supabase
    .from('daily_states')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single();

  if (existingState && !fetchError) {
    return {
      state: existingState as DailyState,
      isNewDay: false,
    };
  }

  // Check if there's a state from yesterday (for reset detection)
  const { data: previousState } = await supabase
    .from('daily_states')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(1)
    .single();

  const isNewDay = previousState ? previousState.date !== today : true;

  // Create new state for today
  const { data: newState, error: createError } = await supabase
    .from('daily_states')
    .insert({
      user_id: userId,
      date: today,
      state: 'before_check',
      reset_at: isNewDay ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (createError) throw createError;

  return {
    state: newState as DailyState,
    isNewDay,
  };
}

/**
 * Update daily state
 */
export async function updateState(
  userId: string,
  newState: DailyStateValue
): Promise<DailyState> {
  const today = getTodayDate();

  const { data, error } = await supabase
    .from('daily_states')
    .update({
      state: newState,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('date', today)
    .select()
    .single();

  if (error) throw error;
  return data as DailyState;
}

/**
 * Transition state with validation
 */
export async function transitionState(
  userId: string,
  from: DailyStateValue,
  to: DailyStateValue
): Promise<DailyState> {
  // Validate transition
  const validTransitions: Record<DailyStateValue, DailyStateValue[]> = {
    before_check: ['in_progress'],
    in_progress: ['daily_completed'],
    daily_completed: [], // No transitions from completed (reset only)
  };

  if (!validTransitions[from].includes(to)) {
    throw new Error(`Invalid state transition: ${from} -> ${to}`);
  }

  return updateState(userId, to);
}
