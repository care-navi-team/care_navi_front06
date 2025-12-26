// ReportScreen - Combined Health Summary + Record Screen
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, Icon } from '../components/common';
import CharacterAvatar from '../components/character/CharacterAvatar';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { useHealthStore } from '../stores/useHealthStore';
import { useGrowthStore } from '../stores/useGrowthStore';
import { useSurveyStore } from '../stores/useSurveyStore';
import { useMedicationStore } from '../stores/useMedicationStore';
import { generateHealthAnalysis } from '../services/geminiService';
import RankingModal from '../components/ranking/RankingModal';
import { getRankingData } from '../data/mockRankingData';
import { RankingType } from '../types/ranking';

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];

const FALLBACK_DATA = {
  diet: {
    status: '균형 잡힘',
    rating: '양호',
  },
  weeklyActivityMinutes: 320,
  healthTip: '물을 더 자주 마셔요!',
};

export default function ReportScreen() {
  const { stage } = useGrowthStore();
  const { surveyData } = useSurveyStore();

  // Health Summary states
  const getTodaySleepHours = useHealthStore(state => state.getTodaySleepHours);
  const getTodaySteps = useHealthStore(state => state.getTodaySteps);
  const sleepHours = getTodaySleepHours();
  const steps = getTodaySteps();
  const [restModeActive, setRestModeActive] = useState(false);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(true);
  const [aiMessage, setAiMessage] = useState<string>('');
  const [aiAdvice, setAiAdvice] = useState<string>('');

  // Record states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [rankingModalVisible, setRankingModalVisible] = useState(false);
  const [selectedRankingType, setSelectedRankingType] = useState<RankingType | null>(null);

  // Medication store
  const {
    getTodayMedication,
    getWeeklyMedication,
    takeMedication,
    getTodayCompletedCount,
  } = useMedicationStore();

  // Health store
  const {
    weeklyData,
    todaySummary,
    isLoading,
    isAvailable,
    error,
    requestPermissions,
    fetchWeeklyData,
    fetchTodaySummary,
    hasPermissions,
    refreshData,
  } = useHealthStore();

  // Load AI analysis
  useEffect(() => {
    loadHealthAnalysis();
  }, [sleepHours, steps]);

  // Initialize health data
  useEffect(() => {
    initializeHealthData();
  }, []);

  const loadHealthAnalysis = async () => {
    setIsLoadingAnalysis(true);
    try {
      const result = await generateHealthAnalysis(
        { sleepHours, steps },
        surveyData
      );
      setAiMessage(result.message);
      setAiAdvice(result.advice);
    } catch (error) {
      setAiMessage('건강 데이터를 분석하고 있어요.');
      setAiAdvice('오늘도 건강한 하루 보내세요!');
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const initializeHealthData = async () => {
    const granted = await requestPermissions();
    if (granted) {
      await Promise.all([fetchWeeklyData(), fetchTodaySummary()]);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (hasPermissions()) {
      await refreshData();
    } else {
      await initializeHealthData();
    }
    await loadHealthAnalysis();
    setRefreshing(false);
  }, [hasPermissions, refreshData]);

  // Status helpers
  const getSleepStatus = () => {
    if (!sleepHours || sleepHours < 6) return { label: '부족함', tag: 'insufficient' as const };
    if (sleepHours < 7) return { label: '보통', tag: 'warning' as const };
    return { label: '충분함', tag: 'good' as const };
  };

  const getActivityStatus = () => {
    if (!steps || steps < 3000) return { label: '부족함', tag: 'insufficient' as const };
    if (steps < 7000) return { label: '보통', tag: 'warning' as const };
    return { label: '적절함', tag: 'good' as const };
  };

  const getSleepStatusText = (hours: number): string => {
    if (hours >= 7) return '좋음';
    if (hours >= 6) return '보통';
    if (hours > 0) return '부족';
    return '데이터 없음';
  };

  const getStepsStatusText = (stepsCount: number): string => {
    if (stepsCount >= 10000) return '훌륭해요!';
    if (stepsCount >= 7000) return '목표 달성';
    if (stepsCount >= 5000) return '잘하고 있어요';
    if (stepsCount > 0) return '조금 더 걸어요';
    return '데이터 없음';
  };

  const calculateHealthScore = (): number => {
    let score = 70;
    const stepsCount = todaySummary?.steps ?? 0;
    if (stepsCount >= 10000) score += 15;
    else if (stepsCount >= 7000) score += 12;
    else if (stepsCount >= 5000) score += 8;
    else if (stepsCount > 0) score += 4;

    const sleepHoursVal = todaySummary?.sleepHours ?? 0;
    if (sleepHoursVal >= 7 && sleepHoursVal <= 9) score += 15;
    else if (sleepHoursVal >= 6) score += 10;
    else if (sleepHoursVal > 0) score += 5;

    return Math.min(score, 100);
  };

  const sleepStatus = getSleepStatus();
  const activityStatus = getActivityStatus();

  // Build display data
  const todaySteps = todaySummary?.steps ?? 0;
  const todaySleepHours = todaySummary?.sleepHours ?? 0;
  const weeklySleepData = weeklyData?.sleep.map(s => s.hours) ?? [0, 0, 0, 0, 0, 0, 0];
  const totalWeeklySteps = weeklyData?.totalSteps ?? 0;
  const averageSleep = weeklyData?.averageSleep ?? 0;

  const weeklyMedicationData = getWeeklyMedication();
  const medicationCompletedToday = getTodayCompletedCount();

  const getMedicationStatus = (): string => {
    if (medicationCompletedToday >= 2) return '완료!';
    if (medicationCompletedToday === 1) return '진행 중';
    return '복용 필요';
  };

  const data = {
    totalScore: calculateHealthScore(),
    medication: {
      completed: medicationCompletedToday,
      total: 2,
      status: getMedicationStatus(),
    },
    sleep: {
      hours: todaySleepHours,
      status: getSleepStatusText(todaySleepHours),
      weeklyData: weeklySleepData,
    },
    steps: {
      count: todaySteps,
      status: getStepsStatusText(todaySteps),
    },
    diet: FALLBACK_DATA.diet,
    weeklyMedication: weeklyMedicationData,
    weeklySteps: totalWeeklySteps,
    weeklyActivityMinutes: FALLBACK_DATA.weeklyActivityMinutes,
    healthTip: FALLBACK_DATA.healthTip,
    averageSleep: averageSleep,
  };

  const handleRestMode = () => {
    if (restModeActive) {
      setRestModeActive(false);
      Alert.alert('휴식 모드 종료', '휴식 모드가 종료되었습니다. 개운하셨나요?');
    } else {
      Alert.alert(
        '휴식 모드',
        '5분간 휴식 타이머를 시작할까요?\n눈을 감고 깊은 호흡을 해보세요.',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '시작',
            onPress: () => {
              setRestModeActive(true);
              Alert.alert('휴식 시작', '5분 휴식을 시작합니다. 편안히 쉬세요 🧘');
            },
          },
        ]
      );
    }
  };

  const openRankingModal = (type: RankingType) => {
    setSelectedRankingType(type);
    setRankingModalVisible(true);
  };

  const closeRankingModal = () => {
    setRankingModalVisible(false);
    setSelectedRankingType(null);
  };

  const getWeekRange = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const format = (d: Date) => `${d.getMonth() + 1}월 ${d.getDate()}일`;
    return `${format(monday)} - ${format(sunday)}`;
  };

  const getBarColor = (index: number) => {
    const barColors = [
      colors.primary,
      colors.chart.green,
      colors.chart.blue,
      colors.primaryDark,
      colors.chart.teal,
      colors.chart.orange,
      colors.chart.brown,
    ];
    return barColors[index % barColors.length];
  };

  // Render circular progress
  const renderCircularProgress = (score: number) => (
    <View style={styles.circularProgressContainer}>
      <View style={styles.circularProgress}>
        <View style={styles.circularBg} />
        <View style={styles.circularFill}>
          <Text style={styles.scoreText}>{score}점</Text>
        </View>
      </View>
      <Text style={styles.scoreLabel}>종합 점수</Text>
    </View>
  );

  // Render mini bar chart
  const renderMiniBarChart = () => {
    const maxHours = Math.max(...data.sleep.weeklyData, 1);
    return (
      <View style={styles.miniBarChart}>
        {data.sleep.weeklyData.map((hours, index) => (
          <View
            key={index}
            style={[
              styles.miniBar,
              {
                height: Math.max((hours / maxHours) * 24, 2),
                backgroundColor: getBarColor(index),
              },
            ]}
          />
        ))}
      </View>
    );
  };

  // Summary card component
  const SummaryCard = ({
    icon,
    title,
    value,
    status,
    statusColor = '#4CAF50',
    extra,
    onRankingPress,
  }: {
    icon: string;
    title: string;
    value: string;
    status: string;
    statusColor?: string;
    extra?: React.ReactNode;
    onRankingPress?: () => void;
  }) => (
    <View style={styles.summaryCard}>
      <Text style={styles.cardIcon}>{icon}</Text>
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardValue}>
          {value} - <Text style={[styles.cardStatus, { color: statusColor }]}>{status}</Text>
        </Text>
      </View>
      {extra}
      {onRankingPress && (
        <TouchableOpacity style={styles.rankingButton} onPress={onRankingPress}>
          <Text style={styles.rankingButtonText}>랭킹</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  // Permission prompt
  const PermissionPrompt = () => (
    <TouchableOpacity
      style={styles.permissionPrompt}
      onPress={initializeHealthData}
    >
      <Text style={styles.permissionIcon}>
        {Platform.OS === 'ios' ? '❤️' : '💚'}
      </Text>
      <View style={styles.permissionTextContainer}>
        <Text style={styles.permissionTitle}>건강 데이터 연동하기</Text>
        <Text style={styles.permissionDesc}>
          {Platform.OS === 'ios'
            ? 'Apple Health에서 걸음 수와 수면 데이터를 가져옵니다'
            : 'Health Connect에서 걸음 수와 수면 데이터를 가져옵니다'}
        </Text>
      </View>
      <Text style={styles.permissionArrow}>→</Text>
    </TouchableOpacity>
  );

  // Detail Report Modal
  const DetailReportModal = () => (
    <Modal
      visible={showDetailModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowDetailModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.modalHeader}>
            <View style={styles.modalHeaderContent}>
              <CharacterAvatar stage={stage} size={56} />
              <View style={styles.modalHeaderTextContainer}>
                <Text style={styles.modalTitle}>주간 전체 리포트</Text>
                <Text style={styles.modalSubtitle}>{getWeekRange()}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowDetailModal(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Weekly Medication */}
          <View style={styles.detailSection}>
            <View style={styles.detailSectionHeader}>
              <Text style={styles.detailSectionTitle}>주간 약 복용 순응도</Text>
              <Text style={styles.complianceText}>
                이번 주 순응도{' '}
                <Text style={styles.complianceValue}>{data.weeklyMedication.compliance}%</Text>
              </Text>
            </View>
            <View style={styles.medicationTable}>
              <View style={styles.medicationRow}>
                {DAYS.map(day => (
                  <View key={day} style={styles.medicationCell}>
                    <Text style={styles.dayLabel}>{day}</Text>
                  </View>
                ))}
              </View>
              {[0, 1].map(row => (
                <View key={row} style={styles.medicationRow}>
                  {data.weeklyMedication.data.map((dayData, dayIndex) => (
                    <View key={dayIndex} style={styles.medicationCell}>
                      <View
                        style={[
                          styles.checkCircle,
                          dayData[row] ? styles.checkCircleCompleted : styles.checkCircleMissed,
                        ]}
                      >
                        <Text style={styles.checkMark}>{dayData[row] ? '✓' : ''}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          </View>

          {/* Weekly Sleep */}
          <View style={styles.detailSection}>
            <View style={styles.detailSectionHeader}>
              <Text style={styles.detailSectionTitle}>주간 수면량 그래프</Text>
              <Text style={styles.averageText}>평균 {data.averageSleep.toFixed(1)}시간</Text>
            </View>
            <View style={styles.sleepChart}>
              <View style={styles.yAxis}>
                <Text style={styles.yAxisLabel}>10</Text>
                <Text style={styles.yAxisLabel}>7.5</Text>
                <Text style={styles.yAxisLabel}>5</Text>
                <Text style={styles.yAxisLabel}>2.5</Text>
              </View>
              <View style={styles.chartBars}>
                {data.sleep.weeklyData.map((hours, index) => (
                  <View key={index} style={styles.barContainer}>
                    <View style={[styles.chartBar, { height: Math.max((hours / 10) * 120, 4) }]} />
                    <Text style={styles.barLabel}>
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Weekly Activity */}
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>주간 활동량 요약</Text>
            <View style={styles.activitySummary}>
              <View style={styles.activityCard}>
                <Text style={styles.activityIcon}>👣</Text>
                <Text style={styles.activityLabel}>총 걸음</Text>
                <Text style={styles.activityValue}>{data.weeklySteps.toLocaleString()}보</Text>
              </View>
              <View style={styles.activityCard}>
                <Text style={styles.activityIcon}>⏱️</Text>
                <Text style={styles.activityLabel}>활동 시간</Text>
                <Text style={styles.activityValue}>{data.weeklyActivityMinutes}분</Text>
              </View>
            </View>
          </View>

          {/* Health Tip */}
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>맞춤 건강 조언</Text>
            <View style={styles.healthTipCard}>
              <CharacterAvatar stage={stage} size={56} />
              <View style={styles.tipBubble}>
                <Text style={styles.tipText}>{data.healthTip}</Text>
              </View>
            </View>
          </View>

          <View style={styles.modalFooter} />
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* === HEALTH SUMMARY SECTION === */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>
            오늘의 <Text style={styles.highlight}>헬띠</Text> 리포트
          </Text>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('ko-KR', {
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}{' '}
            업데이트
          </Text>
        </View>

        {/* Main Report Card */}
        <Card variant="elevated" style={styles.reportCard}>
          <View style={styles.characterContainer}>
            <CharacterAvatar stage={stage} size={120} hasGlow />
          </View>
          <View style={styles.messageBox}>
            {isLoadingAnalysis ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={styles.messageText}>
                "{aiMessage || '건강 데이터를 분석하고 있어요.'}"
              </Text>
            )}
          </View>
          <Text style={styles.adviceText}>{aiAdvice || '오늘도 건강한 하루 보내세요!'}</Text>
        </Card>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>최근 기록 요약</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <Card variant="default" style={styles.statCard}>
            <View style={styles.statHeader}>
              <View style={[styles.statIconContainer, { backgroundColor: colors.primaryLight }]}>
                <Icon name="sleep" size="md" color={colors.primary} />
              </View>
              <View style={[styles.statusBadge, { backgroundColor: colors.tags[sleepStatus.tag].bg }]}>
                <Text style={[styles.statusText, { color: colors.tags[sleepStatus.tag].text }]}>
                  {sleepStatus.label}
                </Text>
              </View>
            </View>
            <Text style={styles.statLabel}>수면 시간</Text>
            <Text style={styles.statValue}>평균 {sleepHours?.toFixed(0) || '-'}시간</Text>
          </Card>

          <Card variant="default" style={styles.statCard}>
            <View style={styles.statHeader}>
              <View style={[styles.statIconContainer, { backgroundColor: colors.mission.normal }]}>
                <Icon name="walk" size="md" color={colors.warning} />
              </View>
              <View style={[styles.statusBadge, { backgroundColor: colors.tags[activityStatus.tag].bg }]}>
                <Text style={[styles.statusText, { color: colors.tags[activityStatus.tag].text }]}>
                  {activityStatus.label}
                </Text>
              </View>
            </View>
            <Text style={styles.statLabel}>오늘 걸음 수</Text>
            <Text style={styles.statValue}>{steps?.toLocaleString() || '-'}보</Text>
          </Card>
        </View>

        {/* Activity Card */}
        <Card variant="default" style={styles.activityCardTop}>
          <View style={styles.statHeader}>
            <View style={[styles.statIconContainer, { backgroundColor: colors.primaryLight }]}>
              <Icon name="walk" size="md" color={colors.primary} />
            </View>
            <View style={[styles.statusBadge, { backgroundColor: colors.tags.good.bg }]}>
              <Text style={[styles.statusText, { color: colors.tags.good.text }]}>적절함</Text>
            </View>
          </View>
          <View style={styles.activityContentTop}>
            <View>
              <Text style={styles.statLabel}>활동량</Text>
              <Text style={styles.statValue}>꾸준히 걷고 있어요</Text>
            </View>
            <View style={styles.miniChart}>
              {[40, 60, 50, 80, 70].map((height, index) => (
                <View
                  key={index}
                  style={[
                    styles.chartBarMini,
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

        {/* CTA - Rest Mode */}
        <View style={styles.ctaSection}>
          <Button
            title={restModeActive ? '휴식 모드 종료하기' : '휴식 모드 시작하기'}
            icon="selfImprovement"
            onPress={handleRestMode}
            size="xl"
            fullWidth
          />
        </View>

        {/* === RECORD SECTION (Scrolled down) === */}
        <View style={styles.recordSectionDivider}>
          <Text style={styles.recordSectionTitle}>주간 건강 기록</Text>
        </View>

        {/* Permission prompt */}
        {!hasPermissions() && !isLoading && <PermissionPrompt />}

        {/* Loading */}
        {isLoading && !weeklyData && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>건강 데이터 로딩 중...</Text>
          </View>
        )}

        {/* Total Score Card */}
        <View style={styles.scoreCard}>
          {renderCircularProgress(data.totalScore)}
        </View>

        {/* Summary Cards */}
        <View style={styles.summarySection}>
          <TouchableOpacity
            onPress={() => {
              const today = getTodayMedication();
              if (!today.morning) {
                Alert.alert('아침 약 복용', '아침 약을 복용하셨나요?', [
                  { text: '취소', style: 'cancel' },
                  {
                    text: '복용 완료',
                    onPress: () => {
                      takeMedication('morning');
                      Alert.alert('완료', '아침 약 복용이 기록되었습니다! 💊');
                    },
                  },
                ]);
              } else if (!today.evening) {
                Alert.alert('저녁 약 복용', '저녁 약을 복용하셨나요?', [
                  { text: '취소', style: 'cancel' },
                  {
                    text: '복용 완료',
                    onPress: () => {
                      takeMedication('evening');
                      Alert.alert('완료', '저녁 약 복용이 기록되었습니다! 💊');
                    },
                  },
                ]);
              } else {
                Alert.alert('완료', '오늘 약 복용을 모두 완료했어요! 👏');
              }
            }}
            activeOpacity={0.7}
          >
            <SummaryCard
              icon="💊"
              title="약 복용"
              value={`오늘 ${data.medication.completed}/${data.medication.total} 복용 완료`}
              status={data.medication.status}
              onRankingPress={() => openRankingModal('medication')}
            />
          </TouchableOpacity>
          <SummaryCard
            icon="🌙"
            title="수면"
            value={data.sleep.hours > 0 ? `${data.sleep.hours.toFixed(1)}시간` : '-'}
            status={data.sleep.status}
            statusColor={data.sleep.hours >= 7 ? '#4CAF50' : data.sleep.hours >= 6 ? '#FF9800' : '#F44336'}
            extra={renderMiniBarChart()}
            onRankingPress={() => openRankingModal('sleep')}
          />
          <SummaryCard
            icon="👟"
            title="걸음"
            value={data.steps.count > 0 ? `${data.steps.count.toLocaleString()}보` : '-'}
            status={data.steps.status}
            statusColor={data.steps.count >= 7000 ? '#4CAF50' : data.steps.count >= 5000 ? '#FF9800' : '#F44336'}
            onRankingPress={() => openRankingModal('steps')}
          />
          <SummaryCard
            icon="🥕"
            title="식단"
            value={data.diet.status}
            status={data.diet.rating}
            onRankingPress={() => openRankingModal('diet')}
          />
        </View>

        {/* View Full Report Button */}
        <TouchableOpacity style={styles.fullReportButton} onPress={() => setShowDetailModal(true)}>
          <Text style={styles.fullReportButtonText}>전체 리포트 보기</Text>
        </TouchableOpacity>
      </ScrollView>

      <DetailReportModal />
      <RankingModal
        visible={rankingModalVisible}
        onClose={closeRankingModal}
        data={selectedRankingType ? getRankingData(selectedRankingType) : null}
      />
    </SafeAreaView>
  );
}

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
  // Health Summary styles
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
  activityCardTop: {
    marginBottom: spacing['2xl'],
  },
  activityContentTop: {
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
  chartBarMini: {
    flex: 1,
    borderRadius: 2,
  },
  ctaSection: {
    marginTop: spacing.lg,
    marginBottom: spacing['2xl'],
  },
  // Record section styles
  recordSectionDivider: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
    paddingTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  recordSectionTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  loadingContainer: {
    padding: spacing['3xl'],
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  permissionPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    ...shadows.sm,
  },
  permissionIcon: {
    fontSize: 32,
  },
  permissionTextContainer: {
    flex: 1,
    marginLeft: spacing.md,
  },
  permissionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text.primary,
  },
  permissionDesc: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  permissionArrow: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: 'bold',
  },
  scoreCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  circularProgressContainer: {
    alignItems: 'center',
  },
  circularProgress: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circularBg: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 10,
    borderColor: colors.border,
  },
  circularFill: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 10,
    borderColor: colors.primary,
    borderLeftColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ rotate: '45deg' }],
  },
  scoreText: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    transform: [{ rotate: '-45deg' }],
  },
  scoreLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.sm,
  },
  summarySection: {
    marginTop: spacing.lg,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cardIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  cardValue: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  cardStatus: {
    fontWeight: typography.fontWeight.semiBold,
  },
  miniBarChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 24,
    gap: 3,
  },
  miniBar: {
    width: 6,
    borderRadius: 3,
  },
  rankingButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginLeft: spacing.sm,
  },
  rankingButtonText: {
    color: colors.surface,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
  },
  fullReportButton: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
    marginTop: spacing.lg,
    ...shadows.sm,
  },
  fullReportButtonText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.primary,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalScroll: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    backgroundColor: colors.primary,
    borderBottomLeftRadius: borderRadius['2xl'],
    borderBottomRightRadius: borderRadius['2xl'],
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalHeaderTextContainer: {
    marginLeft: spacing.md,
  },
  modalTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.surface,
  },
  modalSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.primaryLight,
    marginTop: spacing.xs,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: colors.surface,
    fontWeight: 'bold',
  },
  detailSection: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    ...shadows.sm,
  },
  detailSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  detailSectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text.primary,
  },
  complianceText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  complianceValue: {
    fontWeight: 'bold',
    color: colors.success,
  },
  medicationTable: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  medicationRow: {
    flexDirection: 'row',
  },
  medicationCell: {
    flex: 1,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  dayLabel: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text.secondary,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircleCompleted: {
    backgroundColor: colors.primary,
  },
  checkCircleMissed: {
    backgroundColor: colors.border,
  },
  checkMark: {
    color: colors.surface,
    fontSize: typography.fontSize.sm,
    fontWeight: 'bold',
  },
  averageText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  sleepChart: {
    flexDirection: 'row',
    height: 160,
  },
  yAxis: {
    width: 30,
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  yAxisLabel: {
    fontSize: 10,
    color: colors.text.muted,
    textAlign: 'right',
  },
  chartBars: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    paddingBottom: 20,
  },
  barContainer: {
    alignItems: 'center',
  },
  chartBar: {
    width: 28,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  barLabel: {
    fontSize: 10,
    color: colors.text.secondary,
  },
  activitySummary: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.md,
  },
  activityCard: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
  },
  activityIcon: {
    fontSize: 24,
    marginBottom: spacing.sm,
  },
  activityLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  activityValue: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  healthTipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  tipBubble: {
    marginLeft: spacing.md,
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  tipText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.surface,
  },
  modalFooter: {
    height: 40,
  },
});
