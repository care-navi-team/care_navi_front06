
import { supabase } from './supabase';
import { GrowthProfile, CharacterStage } from '../types';
import { calculateLevel, calculateStage, xpForLevel } from '../utils/helpers';

interface UpdateGrowthRequest {
  userId: string;
  xpToAdd: number;
}

interface UpdateGrowthResponse {
  profile: GrowthProfile;
  leveledUp: boolean;
  stageEvolved: boolean;
  previousLevel: number;
  previousStage: CharacterStage;
}

/**
 * Get user's growth profile
 */
export async function getGrowthProfile(userId: string): Promise<GrowthProfile | null> {
  const { data, error } = await supabase
    .from('growth_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;
  return data as GrowthProfile;
}

/**
 * Update growth by adding XP
 */
export async function updateGrowth(
  request: UpdateGrowthRequest
): Promise<UpdateGrowthResponse> {
  // Get current profile or create new one
  let profile = await getGrowthProfile(request.userId);

  const previousLevel = profile?.level || 1;
  const previousStage = (profile?.stage || 'egg') as CharacterStage;
  const currentXP = profile?.total_xp || 0;

  // Calculate new values
  const newTotalXP = currentXP + request.xpToAdd;
  const newLevel = calculateLevel(newTotalXP);
  const newStage = calculateStage(newTotalXP);
  const newCurrentLevelXP = newTotalXP - xpForLevel(newLevel);
  const newNextLevelXP = xpForLevel(newLevel + 1) - xpForLevel(newLevel);

  // Upsert profile
  const { data, error } = await supabase
    .from('growth_profiles')
    .upsert({
      user_id: request.userId,
      total_xp: newTotalXP,
      level: newLevel,
      stage: newStage,
      current_level_xp: newCurrentLevelXP,
      next_level_xp: newNextLevelXP,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    })
    .select()
    .single();

  if (error) throw error;

  return {
    profile: data as GrowthProfile,
    leveledUp: newLevel > previousLevel,
    stageEvolved: newStage !== previousStage,
    previousLevel,
    previousStage,
  };
}

/**
 * Initialize growth profile for new user
 */
export async function initializeGrowthProfile(userId: string): Promise<GrowthProfile> {
  const { data, error } = await supabase
    .from('growth_profiles')
    .upsert({
      user_id: userId,
      total_xp: 0,
      level: 1,
      stage: 'egg',
      current_level_xp: 0,
      next_level_xp: xpForLevel(2),
    }, {
      onConflict: 'user_id',
    })
    .select()
    .single();

  if (error) throw error;
  return data as GrowthProfile;
}
