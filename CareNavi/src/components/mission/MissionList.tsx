import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import MissionCard from './MissionCard';
import { Mission } from '../../types';

interface MissionListProps {
  missions: Mission[];
  onCompleteMission?: (missionId: string) => void;
  testID?: string;
}

export default function MissionList({
  missions,
  onCompleteMission,
  testID,
}: MissionListProps) {
  const completedCount = missions.filter((m) => m.is_completed).length;
  const totalCount = missions.length;
  const earnedXP = missions
    .filter((m) => m.is_completed)
    .reduce((sum, m) => sum + m.xp_reward, 0);

  if (missions.length === 0) {
    return (
      <View style={styles.emptyContainer} testID={testID}>
        <Text style={styles.emptyEmoji}>🎯</Text>
        <Text style={styles.emptyText}>아직 미션이 없어요</Text>
        <Text style={styles.emptySubtext}>
          컨디션을 입력하면 맞춤 미션을 드릴게요!
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} testID={testID}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>오늘의 미션</Text>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {completedCount}/{totalCount} 완료
          </Text>
          {earnedXP > 0 && (
            <Text style={styles.xpEarned}>+{earnedXP} XP 획득!</Text>
          )}
        </View>
      </View>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${(completedCount / totalCount) * 100}%` },
          ]}
        />
      </View>

      {missions.map((mission) => (
        <MissionCard
          key={mission.id}
          mission={mission}
          onComplete={onCompleteMission}
          testID={`mission-card-${mission.type}`}
        />
      ))}

      {completedCount === totalCount && totalCount > 0 && (
        <View style={styles.allCompletedContainer}>
          <Text style={styles.allCompletedEmoji}>🎉</Text>
          <Text style={styles.allCompletedText}>모든 미션 완료!</Text>
          <Text style={styles.allCompletedSubtext}>
            오늘도 건강한 하루 보냈어요!
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
  xpEarned: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginHorizontal: 16,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  allCompletedContainer: {
    alignItems: 'center',
    padding: 24,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 32,
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
  },
  allCompletedEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  allCompletedText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  allCompletedSubtext: {
    fontSize: 14,
    color: '#666',
  },
});
