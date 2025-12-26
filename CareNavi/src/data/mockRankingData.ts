import {RankingData, RankingType} from '../types/ranking';

const MOCK_USERS = [
  {avatar: '🐶', nickname: '헬띠'},
  {avatar: '🐱', nickname: '야옹이'},
  {avatar: '🐻', nickname: '곰돌이'},
  {avatar: '🐰', nickname: '토끼'},
  {avatar: '🦊', nickname: '여우'},
];

// 상품 이미지 (목업용 - 하나의 이미지 사용)
const PRIZE_IMAGE = require('../assets/images/prizes/prize.png');

export const mockRankingData: Record<RankingType, RankingData> = {
  medication: {
    title: '약 복용 인증',
    subtitle: '이번 주 연속 달성',
    unit: '일 연속',
    users: [
      {rank: 1, ...MOCK_USERS[0], score: 7, prize: {name: '종합비타민 3개월분', image: PRIZE_IMAGE, sponsor: '헬스팜'}},
      {rank: 2, ...MOCK_USERS[1], score: 6, prize: {name: '오메가3 2개월분', image: PRIZE_IMAGE, sponsor: '헬스팜'}},
      {rank: 3, ...MOCK_USERS[2], score: 5, prize: {name: '유산균 1개월분', image: PRIZE_IMAGE, sponsor: '헬스팜'}},
      {rank: 4, ...MOCK_USERS[3], score: 4, prize: {name: '비타민C 세트', image: PRIZE_IMAGE, sponsor: '헬스팜'}},
      {rank: 5, ...MOCK_USERS[4], score: 3, prize: {name: '건강음료 5팩', image: PRIZE_IMAGE, sponsor: '헬스팜'}},
    ],
  },
  sleep: {
    title: '수면 시간',
    subtitle: '이번 주 총 수면',
    unit: '시간',
    users: [
      {rank: 1, ...MOCK_USERS[0], score: 56, prize: {name: '수면 영양제 3개월분', image: PRIZE_IMAGE, sponsor: '슬립웰'}},
      {rank: 2, ...MOCK_USERS[1], score: 52, prize: {name: '마그네슘 2개월분', image: PRIZE_IMAGE, sponsor: '슬립웰'}},
      {rank: 3, ...MOCK_USERS[2], score: 49, prize: {name: '라벤더 아로마 세트', image: PRIZE_IMAGE, sponsor: '슬립웰'}},
      {rank: 4, ...MOCK_USERS[3], score: 45, prize: {name: '수면안대', image: PRIZE_IMAGE, sponsor: '슬립웰'}},
      {rank: 5, ...MOCK_USERS[4], score: 42, prize: {name: '허브티 세트', image: PRIZE_IMAGE, sponsor: '슬립웰'}},
    ],
  },
  steps: {
    title: '걸음 수',
    subtitle: '이번 주 총 걸음',
    unit: '보',
    users: [
      {rank: 1, ...MOCK_USERS[0], score: 500000, prize: {name: '스마트워치', image: PRIZE_IMAGE, sponsor: '핏라이프'}},
      {rank: 2, ...MOCK_USERS[1], score: 450000, prize: {name: '운동화 상품권', image: PRIZE_IMAGE, sponsor: '핏라이프'}},
      {rank: 3, ...MOCK_USERS[2], score: 400000, prize: {name: '스포츠 물병', image: PRIZE_IMAGE, sponsor: '핏라이프'}},
      {rank: 4, ...MOCK_USERS[3], score: 350000, prize: {name: '운동양말 세트', image: PRIZE_IMAGE, sponsor: '핏라이프'}},
      {rank: 5, ...MOCK_USERS[4], score: 300000, prize: {name: '에너지바 세트', image: PRIZE_IMAGE, sponsor: '핏라이프'}},
    ],
  },
  diet: {
    title: '식단 기록 인증',
    subtitle: '이번 주 연속 달성',
    unit: '일 연속',
    users: [
      {rank: 1, ...MOCK_USERS[0], score: 7, prize: {name: '다이어트 식품 3개월분', image: PRIZE_IMAGE, sponsor: '뉴트리션'}},
      {rank: 2, ...MOCK_USERS[1], score: 6, prize: {name: '단백질 쉐이크 2개월분', image: PRIZE_IMAGE, sponsor: '뉴트리션'}},
      {rank: 3, ...MOCK_USERS[2], score: 5, prize: {name: '식이섬유 1개월분', image: PRIZE_IMAGE, sponsor: '뉴트리션'}},
      {rank: 4, ...MOCK_USERS[3], score: 4, prize: {name: '건강 스낵 세트', image: PRIZE_IMAGE, sponsor: '뉴트리션'}},
      {rank: 5, ...MOCK_USERS[4], score: 3, prize: {name: '그래놀라 세트', image: PRIZE_IMAGE, sponsor: '뉴트리션'}},
    ],
  },
};

export const getRankingData = (type: RankingType): RankingData => {
  return mockRankingData[type];
};
