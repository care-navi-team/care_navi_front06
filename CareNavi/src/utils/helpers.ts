import { CharacterStage } from '../types';
import {
  BASE_XP_FOR_LEVEL,
  XP_INCREMENT_PER_LEVEL,
  STAGE_THRESHOLDS,
} from './constants';

/**
 * Calculate XP required to advance from given level to next level
 * Formula: 100 + (level - 1) * 50
 */
export function xpForLevel(level: number): number {
  return BASE_XP_FOR_LEVEL + (level - 1) * XP_INCREMENT_PER_LEVEL;
}

/**
 * Calculate current level from total XP
 */
export function calculateLevel(totalXp: number): number {
  let level = 1;
  let xpNeeded = BASE_XP_FOR_LEVEL; // 100
  let remaining = totalXp;

  while (remaining >= xpNeeded) {
    remaining -= xpNeeded;
    level++;
    xpNeeded = BASE_XP_FOR_LEVEL + (level - 1) * XP_INCREMENT_PER_LEVEL;
  }

  return level;
}

/**
 * Calculate character stage from total XP
 */
export function calculateStage(totalXp: number): CharacterStage {
  const level = calculateLevel(totalXp);
  if (level < STAGE_THRESHOLDS.chick) return 'egg';
  if (level < STAGE_THRESHOLDS.chicken) return 'chick';
  if (level < STAGE_THRESHOLDS.phoenix) return 'chicken';
  return 'phoenix';
}

/**
 * Get today's date in YYYY-MM-DD format (local timezone)
 */
export function getTodayDate(): string {
  const now = new Date();
  return now.toISOString().split('T')[0];
}

/**
 * Check if two dates are different (for midnight reset)
 */
export function isNewDay(storedDate: string, currentDate: string): boolean {
  return storedDate !== currentDate;
}

/**
 * Get current XP progress within current level
 */
export function getCurrentLevelProgress(totalXp: number): {
  currentXp: number;
  xpNeeded: number;
  percentage: number;
} {
  let level = 1;
  let xpNeeded = BASE_XP_FOR_LEVEL;
  let remaining = totalXp;

  while (remaining >= xpNeeded) {
    remaining -= xpNeeded;
    level++;
    xpNeeded = BASE_XP_FOR_LEVEL + (level - 1) * XP_INCREMENT_PER_LEVEL;
  }

  return {
    currentXp: remaining,
    xpNeeded,
    percentage: (remaining / xpNeeded) * 100,
  };
}

/**
 * Get random item from array
 */
export function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}
