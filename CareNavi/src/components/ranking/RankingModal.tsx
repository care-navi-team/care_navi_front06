import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import {RankingData, RankingUser} from '../../types/ranking';

interface RankingModalProps {
  visible: boolean;
  onClose: () => void;
  data: RankingData | null;
}

const RankBadge = ({rank}: {rank: number}) => {
  if (rank === 1) {
    return <Text style={styles.rankBadgeGold}>👑</Text>;
  }
  if (rank === 2) {
    return <Text style={styles.rankBadgeSilver}>👑</Text>;
  }
  if (rank === 3) {
    return <Text style={styles.rankBadgeBronze}>👑</Text>;
  }
  return <Text style={styles.rankNumber}>{rank}</Text>;
};

// 1등 전용 큰 카드
const FirstPlaceCard = ({
  user,
  unit,
}: {
  user: RankingUser;
  unit: string;
}) => {
  const formatScore = (score: number, unitType: string): string => {
    if (unitType === '보') {
      return `${score.toLocaleString()}${unitType}`;
    }
    return `${score}${unitType}`;
  };

  return (
    <View style={styles.firstPlaceCard}>
      {/* 상품 이미지 (트로피 자리) */}
      <View style={styles.firstPrizeContainer}>
        {user.prize && (
          <Image source={user.prize.image} style={styles.firstPrizeImage} />
        )}
        <Text style={styles.firstPrizeTrophy}>🏆</Text>
      </View>

      {/* 1등 정보 */}
      <View style={styles.firstPlaceInfo}>
        <View style={styles.firstPlaceHeader}>
          <Text style={styles.firstPlaceRank}>👑 1위</Text>
        </View>
        <View style={styles.firstPlaceUser}>
          <View style={styles.firstAvatarContainer}>
            <Text style={styles.firstAvatar}>{user.avatar}</Text>
          </View>
          <Text style={styles.firstNickname}>{user.nickname}</Text>
        </View>
        <Text style={styles.firstScore}>{formatScore(user.score, unit)}</Text>
      </View>

      {/* 상품 정보 */}
      {user.prize && (
        <View style={styles.firstPrizeInfo}>
          <Text style={styles.prizeLabel}>🎁 경품</Text>
          <Text style={styles.firstPrizeName}>{user.prize.name}</Text>
          {user.prize.sponsor && (
            <Text style={styles.sponsorText}>협찬: {user.prize.sponsor}</Text>
          )}
        </View>
      )}
    </View>
  );
};

// 2~5등 일반 카드
const RankingItem = ({
  user,
  unit,
}: {
  user: RankingUser;
  unit: string;
}) => {
  const formatScore = (score: number, unitType: string): string => {
    if (unitType === '보') {
      return `${score.toLocaleString()}${unitType}`;
    }
    return `${score}${unitType}`;
  };

  return (
    <View style={styles.rankingItem}>
      {/* 순위 행 */}
      <View style={styles.rankingRow}>
        <View style={styles.rankBadgeContainer}>
          <RankBadge rank={user.rank} />
        </View>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>{user.avatar}</Text>
        </View>
        <Text style={styles.nickname}>{user.nickname}</Text>
        <Text style={styles.score}>{formatScore(user.score, unit)}</Text>
      </View>

      {/* 상품 행 */}
      {user.prize && (
        <View style={styles.prizeRow}>
          <Image source={user.prize.image} style={styles.prizeImage} />
          <View style={styles.prizeTextContainer}>
            <Text style={styles.prizeName}>🎁 {user.prize.name}</Text>
            {user.prize.sponsor && (
              <Text style={styles.prizeSponsor}>협찬: {user.prize.sponsor}</Text>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

export default function RankingModal({
  visible,
  onClose,
  data,
}: RankingModalProps) {
  if (!data) return null;

  const firstPlace = data.users.find(u => u.rank === 1);
  const otherPlaces = data.users.filter(u => u.rank > 1);

  console.log('[RankingModal] data:', JSON.stringify(data, null, 2));
  console.log('[RankingModal] firstPlace:', firstPlace);
  console.log('[RankingModal] otherPlaces:', otherPlaces.length);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{data.title}</Text>
            <Text style={styles.subtitle}>{data.subtitle}</Text>
          </View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}>
            {/* 1등 카드 */}
            {firstPlace && (
              <FirstPlaceCard user={firstPlace} unit={data.unit} />
            )}

            {/* 2~5등 리스트 */}
            <View style={styles.listContainer}>
              <Text style={styles.listTitle}>랭킹 리스트</Text>
              {otherPlaces.map(user => (
                <RankingItem key={user.rank} user={user} unit={data.unit} />
              ))}
            </View>
          </ScrollView>

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>닫기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxHeight: '85%',
    backgroundColor: '#FFF',
    borderRadius: 24,
    padding: 20,
    flex: 0,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
  },
  scrollView: {
    flexGrow: 1,
    flexShrink: 1,
  },

  // 1등 카드 스타일
  firstPlaceCard: {
    backgroundColor: '#FFF9E6',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FFD700',
    alignItems: 'center',
  },
  firstPrizeContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  firstPrizeImage: {
    width: 100,
    height: 100,
    borderRadius: 16,
    backgroundColor: '#F0F0F0',
  },
  firstPrizeTrophy: {
    position: 'absolute',
    bottom: -8,
    right: -8,
    fontSize: 32,
  },
  firstPlaceInfo: {
    alignItems: 'center',
    marginBottom: 12,
  },
  firstPlaceHeader: {
    marginBottom: 8,
  },
  firstPlaceRank: {
    fontSize: 18,
    fontWeight: '700',
    color: '#DAA520',
  },
  firstPlaceUser: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  firstAvatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFE4B5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  firstAvatar: {
    fontSize: 32,
  },
  firstNickname: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
  },
  firstScore: {
    fontSize: 24,
    fontWeight: '700',
    color: '#DAA520',
  },
  firstPrizeInfo: {
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#FFE4B5',
    width: '100%',
  },
  prizeLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  firstPrizeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  sponsorText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },

  // 리스트 스타일
  listContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },

  // 2~5등 아이템 스타일
  rankingItem: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  rankingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  rankBadgeContainer: {
    width: 36,
    alignItems: 'center',
  },
  rankBadgeGold: {
    fontSize: 24,
  },
  rankBadgeSilver: {
    fontSize: 20,
    opacity: 0.7,
  },
  rankBadgeBronze: {
    fontSize: 20,
    opacity: 0.5,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: '700',
    color: '#666',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatar: {
    fontSize: 22,
  },
  nickname: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  score: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5B9BD5',
  },

  // 상품 행 스타일
  prizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 10,
    paddingLeft: 48,
  },
  prizeImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    marginRight: 12,
  },
  prizeTextContainer: {
    flex: 1,
  },
  prizeName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#555',
  },
  prizeSponsor: {
    fontSize: 11,
    color: '#888',
    marginTop: 2,
  },

  // 닫기 버튼
  closeButton: {
    marginTop: 16,
    paddingVertical: 14,
    backgroundColor: '#5B9BD5',
    borderRadius: 25,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
