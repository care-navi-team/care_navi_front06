import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { BackHeader, Card, Button, Icon } from '../components/common';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { useHealthStore } from '../stores/useHealthStore';

// TODO: Integrate with AI analysis from geminiService
const HealthSummaryScreen: React.FC = () => {
  const navigation = useNavigation();
  const getTodaySleepHours = useHealthStore(state => state.getTodaySleepHours);
  const getTodaySteps = useHealthStore(state => state.getTodaySteps);
  const sleepHours = getTodaySleepHours();
  const steps = getTodaySteps();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <BackHeader
        title="나의 건강 요약"
        onBack={() => navigation.goBack()}
        rightActions={[
          { icon: 'settings', onPress: () => {} },
        ]}
      />
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>
            오늘의 <Text style={styles.highlight}>헬띠</Text> 리포트
          </Text>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('ko-KR', {
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })} 업데이트
          </Text>
        </View>

        {/* Main Report Card */}
        <Card variant="elevated" style={styles.reportCard}>
          <View style={styles.characterContainer}>
            <View style={styles.characterCircle}>
              <Text style={styles.characterEmoji}>🐾</Text>
            </View>
          </View>
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>
              "최근 2주간 <Text style={styles.highlight}>'피로'</Text> 관련 기록이{'\n'}자주 보여요."
            </Text>
          </View>
          <Text style={styles.adviceText}>
            조금만 더 쉬어도 괜찮을 것 같아요.{'\n'}오늘은 무리하지 말고 충전이 필요해요!
          </Text>
        </Card>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>
            최근 기록 요약
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {/* Sleep */}
          <Card variant="default" style={styles.statCard}>
            <View style={styles.statHeader}>
              <View style={[styles.statIconContainer, { backgroundColor: '#E0E7FF' }]}>
                <Icon name="sleep" size="md" color="#6366F1" />
              </View>
              <View style={[styles.statusBadge, { backgroundColor: colors.tags.insufficient.bg }]}>
                <Text style={[styles.statusText, { color: colors.tags.insufficient.text }]}>
                  부족함
                </Text>
              </View>
            </View>
            <Text style={styles.statLabel}>수면 시간</Text>
            <Text style={styles.statValue}>
              평균 {sleepHours?.toFixed(0) || 5}시간
            </Text>
          </Card>

          {/* Stress */}
          <Card variant="default" style={styles.statCard}>
            <View style={styles.statHeader}>
              <View style={[styles.statIconContainer, { backgroundColor: '#FEE2E2' }]}>
                <Icon name="heart" size="md" color="#EF4444" />
              </View>
              <View style={[styles.statusBadge, { backgroundColor: colors.tags.warning.bg }]}>
                <Text style={[styles.statusText, { color: colors.tags.warning.text }]}>
                  주의
                </Text>
              </View>
            </View>
            <Text style={styles.statLabel}>스트레스 지수</Text>
            <Text style={styles.statValue}>상승 추세</Text>
          </Card>
        </View>

        {/* Activity Card */}
        <Card variant="default" style={styles.activityCard}>
          <View style={styles.statHeader}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.primaryLight }]}>
              <Icon name="walk" size="md" color={colors.primary} />
            </View>
            <View style={[styles.statusBadge, { backgroundColor: colors.tags.good.bg }]}>
              <Text style={[styles.statusText, { color: colors.tags.good.text }]}>
                적절함
              </Text>
            </View>
          </View>
          <View style={styles.activityContent}>
            <View>
              <Text style={styles.statLabel}>활동량</Text>
              <Text style={styles.statValue}>꾸준히 걷고 있어요</Text>
            </View>
            <View style={styles.miniChart}>
              {[40, 60, 50, 80, 70].map((height, index) => (
                <View
                  key={index}
                  style={[
                    styles.chartBar,
                    {
                      height: `${height}%`,
                      backgroundColor: index === 3 ? colors.primary : `${colors.primary}60`,
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        </Card>

        {/* CTA */}
        <View style={styles.ctaSection}>
          <Button
            title="휴식 모드 시작하기"
            icon="selfImprovement"
            onPress={() => {}}
            size="xl"
            fullWidth
          />
        </View>
      </ScrollView>
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
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['4xl'],
  },
  titleSection: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  highlight: {
    color: colors.primaryDark,
  },
  dateText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
  reportCard: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  characterContainer: {
    marginBottom: spacing.lg,
  },
  characterCircle: {
    width: 128,
    height: 128,
    borderRadius: 64,
    backgroundColor: colors.surface,
    borderWidth: 4,
    borderColor: `${colors.primary}30`,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.glow,
  },
  characterEmoji: {
    fontSize: 56,
  },
  messageBox: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    width: '100%',
  },
  messageText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: 28,
  },
  adviceText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  statsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  activityCard: {
    marginBottom: spacing['2xl'],
  },
  activityContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  miniChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 32,
    width: 96,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.sm,
    padding: spacing.xs,
    gap: 4,
  },
  chartBar: {
    flex: 1,
    borderRadius: 2,
  },
  ctaSection: {
    marginTop: spacing.lg,
  },
});

export default HealthSummaryScreen;
