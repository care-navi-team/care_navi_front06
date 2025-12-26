
import { supabase } from './supabase';
import { getTodayDate } from '../utils/helpers';
import { DailyState } from '../types';

/**
 * Check if daily state should be reset (new day detected)
 */
export function shouldResetDaily(storedDate: string | null | undefined, currentDate: string): boolean {
  if (!storedDate) return true;
  return storedDate !== currentDate;
}

/**
 * Reset daily state to 'before_check' for new day
 */
export async function resetDailyState(userId: string): Promise<DailyState | null> {
  const today = getTodayDate();

  // Update existing record or create new one for today
  const { data, error } = await supabase
    .from('daily_states')
    .upsert({
      user_id: userId,
      date: today,
      state: 'before_check',
      reset_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,date',
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to reset daily state:', error);
    return null;
  }

  return data as DailyState;
}

/**
 * Check and reset daily state if it's a new day
 */
export async function checkAndResetIfNewDay(
  userId: string,
  lastKnownDate?: string
): Promise<{
  wasReset: boolean;
  state: DailyState | null;
}> {
  const today = getTodayDate();

  // If we have a last known date and it's different from today
  if (lastKnownDate && shouldResetDaily(lastKnownDate, today)) {
    const state = await resetDailyState(userId);
    return { wasReset: true, state };
  }

  // Fetch current state to check
  const { data, error } = await supabase
    .from('daily_states')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single();

  if (error || !data) {
    // No state for today, create new one
    const state = await resetDailyState(userId);
    return { wasReset: true, state };
  }

  // State exists for today, check if date is correct
  if (shouldResetDaily(data.date, today)) {
    const state = await resetDailyState(userId);
    return { wasReset: true, state };
  }

  return { wasReset: false, state: data as DailyState };
}

/**
 * Get time until next midnight reset (in ms)
 */
export function getTimeUntilMidnight(): number {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.getTime() - now.getTime();
}
