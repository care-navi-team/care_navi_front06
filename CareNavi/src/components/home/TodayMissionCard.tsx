// Today's easy health action card
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Icon, IconName } from '../common';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

interface TodayMissionCardProps {
  icon: IconName;
  title: string;
  emoji?: string;
  isCompleted?: boolean;
  onComplete: () => void;
}

export const TodayMissionCard: React.FC<TodayMissionCardProps> = ({
  icon,
  title,
  emoji,
  isCompleted = false,
  onComplete,
}) => {
  return (
    <TouchableOpacity
      onPress={onComplete}
      activeOpacity={0.9}
      style={styles.container}
    >
      {/* Left accent */}
      <View style={styles.leftAccent} />

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Icon name={icon} size="md" color={colors.primary} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.label}>오늘의 쉬운 건강 행동</Text>
          <Text style={styles.title}>
            {title} {emoji}
          </Text>
        </View>
        <TouchableOpacity
          onPress={onComplete}
          activeOpacity={0.8}
          style={[
            styles.checkButton,
            isCompleted && styles.checkButtonCompleted,
          ]}
        >
          <Icon
            name="check"
            size="md"
            color={isCompleted ? colors.surface : colors.text.primary}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius['2xl'],
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.lg,
  },
  leftAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '33%',
    backgroundColor: colors.primaryLight,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xl,
    gap: spacing.lg,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    gap: spacing.xs,
  },
  label: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  checkButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.glowLight,
  },
  checkButtonCompleted: {
    backgroundColor: colors.success,
  },
});

export default TodayMissionCard;
