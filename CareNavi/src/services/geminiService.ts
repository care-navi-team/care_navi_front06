
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ENV } from '../config/env';
import { ConditionAnalysis, Mission, MissionType } from '../types';
import { SurveyData, HEALTH_CONCERN_OPTIONS, EXERCISE_TIME_OPTIONS, SLEEP_HOURS_OPTIONS, HEALTH_GOAL_OPTIONS } from '../types/survey';
import { DEFAULT_CONDITION_ANALYSIS, GEMINI_MODEL, XP_REWARDS, MISSION_DURATIONS, AI_RETRY_COUNT, AI_TIMEOUT_MS } from '../utils/constants';

let genAI: GoogleGenerativeAI | null = null;

// Custom error types for better error handling
export class AITimeoutError extends Error {
  constructor() {
    super('AI 응답 시간이 초과되었어요. 다시 시도해주세요.');
    this.name = 'AITimeoutError';
  }
}

export class AIResponseError extends Error {
  constructor(message: string = 'AI 응답 형식이 올바르지 않아요.') {
    super(message);
    this.name = 'AIResponseError';
  }
}

/**
 * Initialize Gemini AI client
 */
export function initializeGemini(): GoogleGenerativeAI {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);
  }
  return genAI;
}

/**
 * Retry wrapper for AI calls with exponential backoff
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  retries: number = AI_RETRY_COUNT
): Promise<T> {
  let lastError: Error | null = null;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`AI call attempt ${i + 1} failed:`, lastError.message);
      if (i < retries) {
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
  throw lastError;
}

/**
 * Execute AI call with timeout
 */
async function withTimeout<T>(promise: Promise<T>, ms: number = AI_TIMEOUT_MS): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new AITimeoutError()), ms);
  });
  return Promise.race([promise, timeoutPromise]);
}

/**
 * Analyze condition input using Gemini AI
 * Returns { analysis, usedFallback } to indicate if fallback was used
 */
export interface AnalysisResult {
  analysis: ConditionAnalysis;
  usedFallback: boolean;
  errorMessage?: string;
}

export async function analyzeConditionWithAI(rawInput: string): Promise<AnalysisResult> {
  const executeAnalysis = async (): Promise<AnalysisResult> => {
    const ai = initializeGemini();
    const model = ai.getGenerativeModel({ model: GEMINI_MODEL });

    const prompt = `당신은 건강 컨디션 분석 AI입니다.
사용자의 자연어 입력을 분석하여 다음 정보를 추출하세요:

1. mood: 기분 상태 (피로, 우울, 활기, 불안, 평온, 스트레스, 행복, 무기력 등)
2. physical: 신체 상태 (두통, 어깨결림, 소화불량, 근육통, 좋음, 피곤함 등)
3. mainIssue: 가장 중요한 이슈 요약 (한 문장)
4. confidence: 분석 확신도 (0-1 사이 숫자)
5. shouldRecommendProducts: 영양/건강 제품 추천이 필요한지 (true/false)
6. productKeywords: 관련 제품 검색 키워드 배열

사용자 입력: "${rawInput}"

반드시 아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "mood": "string",
  "physical": "string",
  "mainIssue": "string",
  "confidence": number,
  "shouldRecommendProducts": boolean,
  "productKeywords": ["string"]
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new AIResponseError('AI 응답을 파싱할 수 없어요.');
    }

    const analysis = JSON.parse(jsonMatch[0]) as ConditionAnalysis;
    return { analysis, usedFallback: false };
  };

  try {
    // Execute with timeout and retry
    return await withRetry(() => withTimeout(executeAnalysis()));
  } catch (error) {
    console.error('Gemini AI analysis failed after retries:', error);
    const errorMessage = error instanceof Error ? error.message : 'AI 분석에 실패했어요.';
    return {
      analysis: DEFAULT_CONDITION_ANALYSIS,
      usedFallback: true,
      errorMessage,
    };
  }
}

/**
 * Test Gemini connection
 */
export async function testGemini(): Promise<boolean> {
  try {
    const ai = initializeGemini();
    const model = ai.getGenerativeModel({ model: GEMINI_MODEL });
    const result = await model.generateContent('Say hello in Korean');
    console.log('Gemini connection: OK');
    console.log('Response:', result.response.text());
    return true;
  } catch (error) {
    console.log('Gemini connection: FAILED', error);
    return false;
  }
}

/**
 * Helper function to convert survey data to human-readable strings
 */
function formatSurveyDataForPrompt(survey: SurveyData): string {
  const healthConcern = HEALTH_CONCERN_OPTIONS.find(o => o.value === survey.healthConcern)?.label || survey.healthConcern;
  const exerciseTime = EXERCISE_TIME_OPTIONS.find(o => o.value === survey.exerciseTime)?.label || survey.exerciseTime;
  const sleepHours = SLEEP_HOURS_OPTIONS.find(o => o.value === survey.sleepHours)?.label || survey.sleepHours;
  const healthGoals = survey.healthGoals.map(g => HEALTH_GOAL_OPTIONS.find(o => o.value === g)?.label || g).join(', ');

  return `
사용자 프로필 (설문조사 결과):
- 주요 건강 고민: ${healthConcern}
- 하루 운동 시간: ${exerciseTime}
- 하루 수면 시간: ${sleepHours}
- 스트레스 수준: ${survey.stressLevel}/5
- 건강 목표: ${healthGoals}`;
}

/**
 * T055: Generate personalized missions based on condition analysis and survey data
 */
export async function generateMissionsWithAI(
  analysis: ConditionAnalysis,
  surveyData?: SurveyData | null
): Promise<Partial<Mission>[]> {
  try {
    const ai = initializeGemini();
    const model = ai.getGenerativeModel({ model: GEMINI_MODEL });

    const surveyContext = surveyData ? formatSurveyDataForPrompt(surveyData) : '';

    const prompt = `당신은 건강 미션 생성 AI입니다.
사용자의 컨디션 분석 결과${surveyData ? '와 설문조사 프로필' : ''}을 바탕으로 맞춤형 미션 3개를 생성하세요.

오늘 컨디션:
- 기분: ${analysis.mood}
- 신체: ${analysis.physical}
- 주요 이슈: ${analysis.mainIssue}
${surveyContext}

미션 타입별 요구사항:
1. easy: 5분 이내 완료 가능한 간단한 미션 (예: 물 마시기, 스트레칭)
2. normal: 10-15분 소요되는 중간 난이도 미션 (예: 짧은 산책, 명상)
3. challenge: 20-30분 소요되는 도전 미션 (예: 운동, 취미 활동)

${surveyData ? `미션 생성 시 사용자의 건강 목표(${formatSurveyDataForPrompt(surveyData).split('건강 목표: ')[1]?.split('\n')[0] || ''})에 맞춰 미션을 제안하세요.` : ''}

반드시 아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
[
  {
    "type": "easy",
    "title": "미션 제목 (10자 이내)",
    "description": "미션 설명 (20자 이내)"
  },
  {
    "type": "normal",
    "title": "미션 제목",
    "description": "미션 설명"
  },
  {
    "type": "challenge",
    "title": "미션 제목",
    "description": "미션 설명"
  }
]`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse JSON response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.warn('AI mission response not in expected JSON format');
      throw new Error('Invalid AI response format');
    }

    const rawMissions = JSON.parse(jsonMatch[0]) as Array<{
      type: MissionType;
      title: string;
      description: string;
    }>;

    // Add duration and XP rewards
    const missions: Partial<Mission>[] = rawMissions.map((m) => ({
      type: m.type,
      title: m.title,
      description: m.description,
      estimated_duration: MISSION_DURATIONS[m.type],
      xp_reward: XP_REWARDS[m.type],
      is_completed: false,
      completed_at: null,
    }));

    return missions;
  } catch (error) {
    console.error('Gemini AI mission generation failed:', error);
    throw error;
  }
}

/**
 * Chat with AI for health-related questions
 */
export async function chatWithAI(
  userMessage: string,
  surveyData?: SurveyData | null
): Promise<string> {
  try {
    const ai = initializeGemini();
    const model = ai.getGenerativeModel({ model: GEMINI_MODEL });

    const surveyContext = surveyData ? formatSurveyDataForPrompt(surveyData) : '';

    const prompt = `당신은 '랩피'라는 이름의 친근한 건강 도우미 강아지 캐릭터입니다.
사용자의 건강 관련 질문에 친근하고 도움이 되는 방식으로 답변해주세요.

규칙:
1. 반말로 친근하게 대화해요 (예: "~해!", "~야", "~지?")
2. 간결하게 답변해요 (3-4문장 이내)
3. 이모지를 적절히 사용해요
4. 건강 관련 질문에만 답변해요
5. 의학적 진단이나 처방은 하지 않고, 일반적인 건강 팁만 제공해요
6. 심각한 증상은 병원 방문을 권유해요

${surveyContext}

사용자 질문: "${userMessage}"

랩피로서 친근하게 답변해주세요:`;

    const result = await withTimeout(model.generateContent(prompt), AI_TIMEOUT_MS);
    const responseText = result.response.text();

    return responseText.trim();
  } catch (error) {
    console.error('AI chat failed:', error);
    throw error;
  }
}
