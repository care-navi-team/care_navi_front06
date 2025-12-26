
import { supabase } from './supabase';
import { Mission, MissionType, ConditionAnalysis } from '../types';
import { SurveyData } from '../types/survey';
import { getTodayDate } from '../utils/helpers';
import { XP_REWARDS, MISSION_DURATIONS } from '../utils/constants';
import { generateMissionsWithAI } from './geminiService';

interface GenerateMissionsRequest {
  userId: string;
  conditionRecordId: string;
  analysis: ConditionAnalysis;
  surveyData?: SurveyData | null;
}

interface GenerateMissionsResponse {
  missions: Mission[];
}


const FALLBACK_MISSIONS: Omit<Mission, 'id' | 'user_id' | 'condition_record_id' | 'date' | 'created_at'>[] = [
  {
    type: 'easy',
    title: '물 한 잔 마시기',
    description: '수분 보충은 건강의 기본이에요',
    estimated_duration: MISSION_DURATIONS.easy,
    xp_reward: XP_REWARDS.easy,
    is_completed: false,
    completed_at: null,
  },
  {
    type: 'normal',
    title: '10분 스트레칭',
    description: '몸을 부드럽게 풀어줘요',
    estimated_duration: MISSION_DURATIONS.normal,
    xp_reward: XP_REWARDS.normal,
    is_completed: false,
    completed_at: null,
  },
  {
    type: 'challenge',
    title: '5분 명상',
    description: '마음을 평온하게 가라앉혀요',
    estimated_duration: MISSION_DURATIONS.challenge,
    xp_reward: XP_REWARDS.challenge,
    is_completed: false,
    completed_at: null,
  },
];

/**
 * Generate personalized missions based on condition
 */
export async function generateMissions(
  request: GenerateMissionsRequest
): Promise<GenerateMissionsResponse> {
  const today = getTodayDate();

  // Try AI generation first (with survey data for personalization)
  let generatedMissions: Partial<Mission>[];
  try {
    generatedMissions = await generateMissionsWithAI(request.analysis, request.surveyData);
  } catch (error) {
    console.warn('AI mission generation failed, using fallback:', error);
    generatedMissions = FALLBACK_MISSIONS;
  }

  // Insert missions to database
  const missionsToInsert = generatedMissions.map((m) => ({
    user_id: request.userId,
    condition_record_id: request.conditionRecordId,
    date: today,
    type: m.type,
    title: m.title,
    description: m.description,
    estimated_duration: m.estimated_duration,
    xp_reward: m.xp_reward || XP_REWARDS[m.type as MissionType],
    is_completed: false,
  }));

  const { data, error } = await supabase
    .from('missions')
    .insert(missionsToInsert)
    .select();

  if (error) throw error;

  return { missions: data as Mission[] };
}

/**
 * Get today's missions for user
 */
export async function getTodayMissions(userId: string): Promise<Mission[]> {
  const today = getTodayDate();

  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .order('type', { ascending: true }); // easy, normal, challenge order

  if (error) throw error;
  return (data || []) as Mission[];
}

/**
 * Complete a mission
 */
export async function completeMission(
  missionId: string,
  userId: string
): Promise<Mission> {
  const { data, error } = await supabase
    .from('missions')
    .update({
      is_completed: true,
      completed_at: new Date().toISOString(),
    })
    .eq('id', missionId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as Mission;
}

/**
 * Check if all today's missions are completed
 */
export async function areAllMissionsCompleted(userId: string): Promise<boolean> {
  const missions = await getTodayMissions(userId);
  return missions.length > 0 && missions.every((m) => m.is_completed);
}

/**
 * Generate initial missions based on survey data only (no condition record needed)
 */
export async function generateInitialMissions(
  userId: string,
  surveyData: SurveyData
): Promise<Mission[]> {
  const today = getTodayDate();

  // Check if missions already exist for today
  const existingMissions = await getTodayMissions(userId);
  if (existingMissions.length > 0) {
    return existingMissions;
  }

  // Generate personalized missions based on survey
  const missions = createMissionsFromSurvey(surveyData);

  // Insert missions to database (without condition_record_id)
  const missionsToInsert = missions.map((m) => ({
    user_id: userId,
    condition_record_id: null,
    date: today,
    type: m.type,
    title: m.title,
    description: m.description,
    estimated_duration: m.estimated_duration,
    xp_reward: m.xp_reward,
    is_completed: false,
  }));

  const { data, error } = await supabase
    .from('missions')
    .insert(missionsToInsert)
    .select();

  if (error) throw error;

  return data as Mission[];
}

/**
 * Create missions based on survey data
 */
function createMissionsFromSurvey(
  surveyData: SurveyData
): Omit<Mission, 'id' | 'user_id' | 'condition_record_id' | 'date' | 'created_at'>[] {
  const missions: Omit<Mission, 'id' | 'user_id' | 'condition_record_id' | 'date' | 'created_at'>[] = [];

  // Easy mission based on health concern
  const easyMission = getEasyMission(surveyData.healthConcern);
  missions.push(easyMission);

  // Normal mission based on exercise level
  const normalMission = getNormalMission(surveyData.exerciseTime, surveyData.healthGoals);
  missions.push(normalMission);

  // Challenge mission based on stress and sleep
  const challengeMission = getChallengeMission(surveyData.stressLevel, surveyData.sleepHours);
  missions.push(challengeMission);

  return missions;
}

function getEasyMission(healthConcern: string) {
  const missionsByConcer: Record<string, { title: string; description: string }> = {
    weight: { title: '물 500ml 마시기', description: '신진대사를 활성화해요' },
    sleep: { title: '카페인 줄이기', description: '오늘은 커피 대신 물이나 차를 마셔요' },
    stress: { title: '심호흡 3회', description: '천천히 깊게 숨을 쉬어요' },
    energy: { title: '햇빛 5분 쐬기', description: '창가에서 햇빛을 받으며 기분 전환해요' },
    digestion: { title: '따뜻한 물 마시기', description: '소화를 돕는 따뜻한 물 한 잔' },
  };

  const mission = missionsByConcer[healthConcern] || missionsByConcer.energy;
  return {
    type: 'easy' as MissionType,
    title: mission.title,
    description: mission.description,
    estimated_duration: MISSION_DURATIONS.easy,
    xp_reward: XP_REWARDS.easy,
    is_completed: false,
    completed_at: null,
  };
}

function getNormalMission(exerciseTime: string, healthGoals: string[]) {
  // Less exercise = easier mission
  const missionsByExercise: Record<string, { title: string; description: string }> = {
    none: { title: '5분 가벼운 스트레칭', description: '몸을 부드럽게 풀어줘요' },
    under_30: { title: '10분 산책하기', description: '가볍게 걸으며 기분 전환해요' },
    '30_to_60': { title: '15분 홈트레이닝', description: '집에서 간단한 운동을 해봐요' },
    over_60: { title: '20분 운동 루틴', description: '평소 운동 루틴을 실천해요' },
  };

  const mission = missionsByExercise[exerciseTime] || missionsByExercise.under_30;
  return {
    type: 'normal' as MissionType,
    title: mission.title,
    description: mission.description,
    estimated_duration: MISSION_DURATIONS.normal,
    xp_reward: XP_REWARDS.normal,
    is_completed: false,
    completed_at: null,
  };
}

function getChallengeMission(stressLevel: number, sleepHours: string) {
  // High stress or poor sleep = relaxation mission
  if (stressLevel >= 4 || sleepHours === 'under_5') {
    return {
      type: 'challenge' as MissionType,
      title: '10분 명상하기',
      description: '마음을 편안하게 가라앉혀요',
      estimated_duration: MISSION_DURATIONS.challenge,
      xp_reward: XP_REWARDS.challenge,
      is_completed: false,
      completed_at: null,
    };
  }

  if (sleepHours === '5_to_6') {
    return {
      type: 'challenge' as MissionType,
      title: '오늘 일찍 잠자리 들기',
      description: '평소보다 30분 일찍 자봐요',
      estimated_duration: MISSION_DURATIONS.challenge,
      xp_reward: XP_REWARDS.challenge,
      is_completed: false,
      completed_at: null,
    };
  }

  return {
    type: 'challenge' as MissionType,
    title: '건강 일기 쓰기',
    description: '오늘 느낀 점을 간단히 적어봐요',
    estimated_duration: MISSION_DURATIONS.challenge,
    xp_reward: XP_REWARDS.challenge,
    is_completed: false,
    completed_at: null,
  };
}
