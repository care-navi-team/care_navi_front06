// Daily Fixed Mission Types

export type DailyMissionType = 'medication' | 'meal';

export interface DailyMission {
  id: string;
  type: DailyMissionType;
  title: string;
  description: string;
  icon: string;
  completed: boolean;
  photoUri?: string; // For meal missions
  completedAt?: string;
}

export interface DailyMissionState {
  date: string; // YYYY-MM-DD
  missions: DailyMission[];
}

// Fixed daily missions template
export const DAILY_MISSIONS_TEMPLATE: Omit<DailyMission, 'completed' | 'photoUri' | 'completedAt'>[] = [
  // Medication missions (3)
  {
    id: 'med_morning',
    type: 'medication',
    title: '아침 약 복용',
    description: '아침 식후 약을 복용하세요',
    icon: '💊',
  },
  {
    id: 'med_lunch',
    type: 'medication',
    title: '점심 약 복용',
    description: '점심 식후 약을 복용하세요',
    icon: '💊',
  },
  {
    id: 'med_dinner',
    type: 'medication',
    title: '저녁 약 복용',
    description: '저녁 식후 약을 복용하세요',
    icon: '💊',
  },
  // Meal missions (3)
  {
    id: 'meal_breakfast',
    type: 'meal',
    title: '아침 식단 기록',
    description: '아침 식사 사진을 찍어주세요',
    icon: '🍳',
  },
  {
    id: 'meal_lunch',
    type: 'meal',
    title: '점심 식단 기록',
    description: '점심 식사 사진을 찍어주세요',
    icon: '🍱',
  },
  {
    id: 'meal_dinner',
    type: 'meal',
    title: '저녁 식단 기록',
    description: '저녁 식사 사진을 찍어주세요',
    icon: '🍽️',
  },
];
