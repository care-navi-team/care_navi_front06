// Reward store for milestone rewards
import {create} from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Reward,
  RewardState,
  REWARD_TEMPLATES,
  DEFAULT_REWARD_TEMPLATE,
} from '../types/reward';

const STORAGE_KEY = 'reward_state';

interface RewardStoreState extends RewardState {
  isLoading: boolean;

  // Actions
  loadRewardState: () => Promise<void>;
  checkAndTriggerReward: (totalXP: number) => Reward | null;
  claimReward: (milestone: number) => Promise<void>;
  clearPendingReward: () => void;
  getUnclaimedMilestones: (totalXP: number) => number[];
}

const generateRewardId = (): string => {
  return `reward_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const createRewardForMilestone = (milestone: number): Reward => {
  const template = REWARD_TEMPLATES[milestone] || DEFAULT_REWARD_TEMPLATE;
  return {
    ...template,
    id: generateRewardId(),
    milestone,
  };
};

export const useRewardStore = create<RewardStoreState>((set, get) => ({
  claimedMilestones: [],
  pendingReward: null,
  isLoading: true,

  loadRewardState: async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const state: RewardState = JSON.parse(stored);
        set({
          claimedMilestones: state.claimedMilestones || [],
          pendingReward: state.pendingReward || null,
          isLoading: false,
        });
      } else {
        set({isLoading: false});
      }
    } catch (error) {
      console.error('Failed to load reward state:', error);
      set({isLoading: false});
    }
  },

  checkAndTriggerReward: (totalXP: number) => {
    const {claimedMilestones} = get();

    // Find all milestones that should have been reached
    const milestones: number[] = [];
    for (let m = 100; m <= totalXP; m += 100) {
      milestones.push(m);
    }

    // Find unclaimed milestones
    const unclaimed = milestones.filter(m => !claimedMilestones.includes(m));

    if (unclaimed.length > 0) {
      // Trigger the first unclaimed reward
      const milestone = unclaimed[0];
      const reward = createRewardForMilestone(milestone);
      set({pendingReward: reward});
      return reward;
    }

    return null;
  },

  claimReward: async (milestone: number) => {
    const {claimedMilestones} = get();

    if (claimedMilestones.includes(milestone)) {
      return;
    }

    const newClaimedMilestones = [...claimedMilestones, milestone];

    const newState: RewardState = {
      claimedMilestones: newClaimedMilestones,
      pendingReward: null,
    };

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      set({
        claimedMilestones: newClaimedMilestones,
        pendingReward: null,
      });
    } catch (error) {
      console.error('Failed to save reward state:', error);
    }
  },

  clearPendingReward: () => {
    set({pendingReward: null});
  },

  getUnclaimedMilestones: (totalXP: number) => {
    const {claimedMilestones} = get();
    const milestones: number[] = [];
    for (let m = 100; m <= totalXP; m += 100) {
      milestones.push(m);
    }
    return milestones.filter(m => !claimedMilestones.includes(m));
  },
}));
