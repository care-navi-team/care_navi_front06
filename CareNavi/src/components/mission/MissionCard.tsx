import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Mission, MissionType } from '../../types';

interface MissionCardProps {
  mission: Mission;
  onComplete?: (missionId: string) => void;
  testID?: string;
}

const TYPE_CONFIG: Record<
  MissionType,
  { emoji: string; label: string; color: string; bgColor: string }
> = {
  easy: {
    emoji: '🌱',
    label: '쉬움',
    color: '#4CAF50',
    bgColor: '#E8F5E9',
  },
  normal: {
    emoji: '🌿',
    label: '보통',
    color: '#FF9800',
    bgColor: '#FFF3E0',
  },
  challenge: {
    emoji: '🌳',
    label: '도전',
    color: '#F44336',
    bgColor: '#FFEBEE',
  },
};

export default function MissionCard({
  mission,
  onComplete,
  testID,
}: MissionCardProps) {
  const config = TYPE_CONFIG[mission.type];
  const isCompleted = mission.is_completed;

  const handleComplete = () => {
    if (!isCompleted && onComplete) {
      onComplete(mission.id);
    }
  };

  return (
    <TouchableOpacity
      testID={testID}
      style={[
        styles.container,
        { backgroundColor: config.bgColor },
        isCompleted && styles.completedContainer,
      ]}
      onPress={handleComplete}
      disabled={isCompleted}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.typeContainer}>
          <Text style={styles.typeEmoji}>{config.emoji}</Text>
          <Text style={[styles.typeLabel, { color: config.color }]}>
            {config.label}
          </Text>
        </View>
        <View style={styles.xpContainer}>
          <Text style={styles.xpText}>+{mission.xp_reward} XP</Text>
        </View>
      </View>

      <Text
        style={[styles.title, isCompleted && styles.completedText]}
        numberOfLines={1}
      >
        {mission.title}
      </Text>

      <Text
        style={[styles.description, isCompleted && styles.completedText]}
        numberOfLines={2}
      >
        {mission.description}
      </Text>

      <View style={styles.footer}>
        <Text style={styles.duration}>
          {mission.estimated_duration}분 예상
        </Text>
        {isCompleted ? (
          <View style={styles.completedBadge}>
            <Text style={styles.completedBadgeText}>완료!</Text>
          </View>
        ) : (
          <Text style={[styles.tapHint, { color: config.color }]}>
            탭하여 완료
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completedContainer: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeEmoji: {
    fontSize: 20,
    marginRight: 6,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  xpContainer: {
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  xpText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  duration: {
    fontSize: 12,
    color: '#888',
  },
  tapHint: {
    fontSize: 12,
    fontWeight: '600',
  },
  completedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
