import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { BackHeader, Card, Button } from '../components/common';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';

// TODO: Implement full MissionScreen based on Stitch wireframe
const MissionScreen: React.FC = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <BackHeader
        title="오늘의 성장 미션"
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Character Area */}
        <View style={styles.characterSection}>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>Lv. 3 헬띠</Text>
          </View>
          <View style={styles.characterPlaceholder}>
            <Text style={styles.placeholderEmoji}>🐾</Text>
          </View>
          <View style={styles.speechBubble}>
            <Text style={styles.speechText}>
              "이 미션을 하면 제가 더 <Text style={styles.highlight}>활발</Text>해져요! 같이 가요!"
            </Text>
          </View>
        </View>

        {/* Mission Card */}
        <Card variant="elevated" style={styles.missionCard}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '33%' }]} />
          </View>
          <View style={styles.missionContent}>
            <View style={styles.missionHeader}>
              <View style={styles.missionInfo}>
                <Text style={styles.missionLabel}>Today's Mission</Text>
                <Text style={styles.missionTitle}>점심 후 5분 산책하기</Text>
                <Text style={styles.missionDescription}>
                  소화를 돕고 오후 에너지를 충전해요.
                </Text>
              </View>
              <View style={styles.missionIcon}>
                <Text style={styles.iconEmoji}>🚶</Text>
              </View>
            </View>
            <View style={styles.rewardsRow}>
              <View style={styles.rewardBadge}>
                <Text style={styles.rewardText}>Energy +10</Text>
              </View>
              <View style={styles.rewardBadge}>
                <Text style={styles.rewardText}>EXP +50</Text>
              </View>
              <View style={[styles.rewardBadge, styles.moodBadge]}>
                <Text style={styles.moodText}>기분 UP</Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <Card variant="default" style={styles.statCard}>
            <Text style={styles.statLabel}>현재 성장도</Text>
            <Text style={styles.statValue}>Lv.3</Text>
            <Text style={styles.statChange}>+ 0.5% today</Text>
            <View style={styles.miniProgressBar}>
              <View style={[styles.miniProgressFill, { width: '45%' }]} />
            </View>
          </Card>
          <Card variant="default" style={styles.statCard}>
            <Text style={styles.statLabel}>다음 진화 미리보기</Text>
            <Text style={styles.statValue}>Active{'\n'}Heltty</Text>
          </Card>
        </View>
      </ScrollView>

      {/* CTA Button */}
      <View style={styles.ctaContainer}>
        <Button
          title="미션 시작하기"
          icon="play"
          onPress={() => {}}
          size="xl"
          fullWidth
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: 100,
  },
  characterSection: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius['2xl'],
    padding: spacing['2xl'],
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  levelBadge: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  levelText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  characterPlaceholder: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  placeholderEmoji: {
    fontSize: 64,
  },
  speechBubble: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
    ...shadows.sm,
  },
  speechText: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: 22,
  },
  highlight: {
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
  missionCard: {
    marginBottom: spacing.lg,
    padding: 0,
    overflow: 'hidden',
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.surfaceSecondary,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  missionContent: {
    padding: spacing.xl,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  missionInfo: {
    flex: 1,
  },
  missionLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  missionTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  missionDescription: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
  missionIcon: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 28,
  },
  rewardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  rewardBadge: {
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  rewardText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  moodBadge: {
    backgroundColor: colors.primaryLight,
  },
  moodText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  statChange: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  miniProgressBar: {
    height: 6,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 3,
    marginTop: spacing.md,
  },
  miniProgressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
    backgroundColor: colors.background,
  },
});

export default MissionScreen;
