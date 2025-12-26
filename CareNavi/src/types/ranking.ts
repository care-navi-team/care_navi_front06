import {ImageSourcePropType} from 'react-native';

export interface Prize {
  name: string;
  image: ImageSourcePropType;
  sponsor?: string; // 협찬사
}

export interface RankingUser {
  rank: number;
  avatar: string; // 이모지 아바타
  nickname: string;
  score: number;
  prize?: Prize; // 상품 정보
}

export interface RankingData {
  title: string;
  subtitle: string;
  unit: string; // "일 연속", "시간", "보"
  users: RankingUser[];
}

export type RankingType = 'medication' | 'sleep' | 'steps' | 'diet';
