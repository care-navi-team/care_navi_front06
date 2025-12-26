// Reward types for milestone rewards

export interface Reward {
  id: string;
  type: 'coffee' | 'gift';
  title: string;
  description: string;
  imageType: 'coffee';
  milestone: number; // XP milestone (100, 200, 300, ...)
  claimedAt?: string;
}

export interface RewardState {
  claimedMilestones: number[]; // Already claimed milestones
  pendingReward: Reward | null; // Reward waiting to be shown
}

// Reward templates
export const REWARD_TEMPLATES: Record<number, Omit<Reward, 'id' | 'milestone' | 'claimedAt'>> = {
  100: {
    type: 'coffee',
    title: '첫 번째 리워드!',
    description: '축하해요! 100 XP 달성 기념\n커피 기프티콘을 받았어요!',
    imageType: 'coffee',
  },
  200: {
    type: 'coffee',
    title: '두 번째 리워드!',
    description: '대단해요! 200 XP 달성!\n커피 한 잔 더 받아가세요!',
    imageType: 'coffee',
  },
  300: {
    type: 'coffee',
    title: '세 번째 리워드!',
    description: '꾸준함이 빛나요! 300 XP!\n오늘도 커피 한 잔!',
    imageType: 'coffee',
  },
  400: {
    type: 'coffee',
    title: '네 번째 리워드!',
    description: '최고예요! 400 XP 돌파!\n커피로 응원해요!',
    imageType: 'coffee',
  },
  500: {
    type: 'coffee',
    title: '다섯 번째 리워드!',
    description: '반쯤 왔어요! 500 XP!\n특별한 커피 선물!',
    imageType: 'coffee',
  },
};

// Default reward for milestones not in template
export const DEFAULT_REWARD_TEMPLATE: Omit<Reward, 'id' | 'milestone' | 'claimedAt'> = {
  type: 'coffee',
  title: '마일스톤 달성!',
  description: '축하해요! 목표 달성 기념\n커피 기프티콘을 받았어요!',
  imageType: 'coffee',
};
