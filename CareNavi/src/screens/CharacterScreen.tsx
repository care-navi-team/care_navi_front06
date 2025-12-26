import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import CharacterAvatar from '../components/character/CharacterAvatar';
import LevelBadge from '../components/character/LevelBadge';
import XPBar from '../components/character/XPBar';
import { useAuthStore } from '../stores/useAuthStore';
import { useGrowthStore } from '../stores/useGrowthStore';
import { useMissionStore } from '../stores/useMissionStore';
import { CHARACTER_NAME } from '../utils/constants';

export default function CharacterScreen() {
  const { session } = useAuthStore();
  const {
    level,
    stage,
    currentLevelXP,
    nextLevelXP,
    totalXP,
    isLoading,
    fetchProfile,
  } = useGrowthStore();
  const { getCompletedCount, getTotalXP } = useMissionStore();

  // Fetch growth profile on mount
  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile(session.user.id);
    }
  }, [session?.user?.id, fetchProfile]);

  const todayCompletedMissions = getCompletedCount();
  const todayEarnedXP = getTotalXP();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{CHARACTER_NAME}</Text>
        </View>

        <View style={styles.avatarSection}>
          <CharacterAvatar stage={stage} size={150} />
          <View style={styles.levelBadgeContainer}>
            <LevelBadge level={level} />
          </View>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.xpContainer}>
            <Text style={styles.xpLabel}>다음 레벨까지</Text>
            <XPBar currentXP={currentLevelXP} maxXP={nextLevelXP} />
          </View>

          <View style={styles.totalXPContainer}>
            <Text style={styles.totalXPLabel}>총 경험치</Text>
            <Text style={styles.totalXPValue}>{totalXP} XP</Text>
          </View>
        </View>

        <View style={styles.todaySection}>
          <Text style={styles.sectionTitle}>오늘의 성과</Text>
          <View style={styles.todayStats}>
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>✅</Text>
              <Text style={styles.statValue}>{todayCompletedMissions}</Text>
              <Text style={styles.statLabel}>완료 미션</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>⭐</Text>
              <Text style={styles.statValue}>+{todayEarnedXP}</Text>
              <Text style={styles.statLabel}>획득 XP</Text>
            </View>
          </View>
        </View>

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <Text style={styles.loadingText}>로딩 중...</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F4FD',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  levelBadgeContainer: {
    marginTop: 16,
  },
  statsSection: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  xpContainer: {
    marginBottom: 20,
  },
  xpLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  totalXPContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  totalXPLabel: {
    fontSize: 14,
    color: '#666',
  },
  totalXPValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  todaySection: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  todayStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
});
