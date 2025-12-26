// Record Screen - Weekly Health Report
import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import CharacterAvatar from '../components/character/CharacterAvatar';
import {useGrowthStore} from '../stores/useGrowthStore';
import {useHealthStore} from '../stores/useHealthStore';
import RankingModal from '../components/ranking/RankingModal';
import {getRankingData} from '../data/mockRankingData';
import {RankingType} from '../types/ranking';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];

// Fallback mock data when health data is unavailable
const FALLBACK_DATA = {
  medication: {
    completed: 3,
    total: 3,
    status: '잘했어요!',
  },
  diet: {
    status: '균형 잡힘',
    rating: '양호',
  },
  weeklyMedication: {
    data: [
      [true, true],
      [true, true],
      [true, true],
      [true, true],
      [true, false],
      [true, true],
      [true, true],
    ],
    compliance: 95,
  },
  weeklyActivityMinutes: 320,
  healthTip: '물을 더 자주 마셔요!',
};

export default function RecordScreen() {
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [rankingModalVisible, setRankingModalVisible] = useState(false);
  const [selectedRankingType, setSelectedRankingType] = useState<RankingType | null>(null);
  const {stage} = useGrowthStore();

  const openRankingModal = (type: RankingType) => {
    setSelectedRankingType(type);
    setRankingModalVisible(true);
  };

  const closeRankingModal = () => {
    setRankingModalVisible(false);
    setSelectedRankingType(null);
  };

  // Health store
  const {
    weeklyData,
    todaySummary,
    isLoading,
    isAvailable,
    error,
    checkAvailability,
    requestPermissions,
    fetchWeeklyData,
    fetchTodaySummary,
    hasPermissions,
    refreshData,
  } = useHealthStore();

  // Initialize health data on mount
  useEffect(() => {
    initializeHealthData();
  }, []);

  const initializeHealthData = async () => {
    // Skip availability check and try to request permissions directly
    const granted = await requestPermissions();

    if (!granted) {
      Alert.alert(
        '권한 요청 결과',
        `권한 허용 실패\nisAvailable: ${isAvailable}\nerror: ${error || 'none'}`,
        [{text: '확인'}],
      );
      return;
    }

    // If we get here, permissions were granted
    Alert.alert('성공', '건강 데이터 권한이 허용되었습니다!');
    await Promise.all([fetchWeeklyData(), fetchTodaySummary()]);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (hasPermissions()) {
      await refreshData();
    } else {
      await initializeHealthData();
    }
    setRefreshing(false);
  }, [hasPermissions, refreshData]);

  // Helper functions for status
  const getSleepStatus = (hours: number): string => {
    if (hours >= 7) return '좋음';
    if (hours >= 6) return '보통';
    if (hours > 0) return '부족';
    return '데이터 없음';
  };

  const getStepsStatus = (steps: number): string => {
    if (steps >= 10000) return '훌륭해요!';
    if (steps >= 7000) return '목표 달성';
    if (steps >= 5000) return '잘하고 있어요';
    if (steps > 0) return '조금 더 걸어요';
    return '데이터 없음';
  };

  const calculateHealthScore = (): number => {
    let score = 70; // Base score

    // Steps contribution (up to 15 points)
    const steps = todaySummary?.steps ?? 0;
    if (steps >= 10000) score += 15;
    else if (steps >= 7000) score += 12;
    else if (steps >= 5000) score += 8;
    else if (steps > 0) score += 4;

    // Sleep contribution (up to 15 points)
    const sleepHours = todaySummary?.sleepHours ?? 0;
    if (sleepHours >= 7 && sleepHours <= 9) score += 15;
    else if (sleepHours >= 6) score += 10;
    else if (sleepHours > 0) score += 5;

    return Math.min(score, 100);
  };

  // Build display data
  const todaySteps = todaySummary?.steps ?? 0;
  const todaySleepHours = todaySummary?.sleepHours ?? 0;
  const weeklySleepData = weeklyData?.sleep.map(s => s.hours) ?? [0, 0, 0, 0, 0, 0, 0];
  const totalWeeklySteps = weeklyData?.totalSteps ?? 0;
  const averageSleep = weeklyData?.averageSleep ?? 0;

  const data = {
    totalScore: calculateHealthScore(),
    medication: FALLBACK_DATA.medication,
    sleep: {
      hours: todaySleepHours,
      status: getSleepStatus(todaySleepHours),
      weeklyData: weeklySleepData,
    },
    steps: {
      count: todaySteps,
      status: getStepsStatus(todaySteps),
    },
    diet: FALLBACK_DATA.diet,
    weeklyMedication: FALLBACK_DATA.weeklyMedication,
    weeklySteps: totalWeeklySteps,
    weeklyActivityMinutes: FALLBACK_DATA.weeklyActivityMinutes,
    healthTip: FALLBACK_DATA.healthTip,
    averageSleep: averageSleep,
  };

  // Get current week date range
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

  // Render circular progress
  const renderCircularProgress = (score: number) => {
    return (
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
  };

  // Render mini bar chart for sleep
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

  const getBarColor = (index: number) => {
    const colors = [
      '#FFB74D',
      '#81C784',
      '#64B5F6',
      '#BA68C8',
      '#4DB6AC',
      '#FF8A65',
      '#A1887F',
    ];
    return colors[index % colors.length];
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
          {value} -{' '}
          <Text style={[styles.cardStatus, {color: statusColor}]}>{status}</Text>
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

  // Permission prompt component
  const PermissionPrompt = () => (
    <TouchableOpacity
      style={styles.permissionPrompt}
      onPress={async () => {
        Alert.alert(
          '디버그 정보',
          `isAvailable: ${isAvailable}\nhasPermissions: ${hasPermissions()}\nerror: ${error || 'none'}`,
          [
            {text: '취소', style: 'cancel'},
            {text: '연동하기', onPress: initializeHealthData},
          ],
        );
      }}>
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
      onRequestClose={() => setShowDetailModal(false)}>
      <SafeAreaView style={styles.modalContainer}>
        <ScrollView
          style={styles.modalScroll}
          showsVerticalScrollIndicator={false}>
          {/* Modal Header */}
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
              onPress={() => setShowDetailModal(false)}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Weekly Medication Compliance */}
          <View style={styles.detailSection}>
            <View style={styles.detailSectionHeader}>
              <Text style={styles.detailSectionTitle}>주간 약 복용 순응도</Text>
              <Text style={styles.complianceText}>
                이번 주 순응도{' '}
                <Text style={styles.complianceValue}>
                  {data.weeklyMedication.compliance}%
                </Text>
              </Text>
            </View>
            <View style={styles.medicationTable}>
              {/* Header row */}
              <View style={styles.medicationRow}>
                {DAYS.map(day => (
                  <View key={day} style={styles.medicationCell}>
                    <Text style={styles.dayLabel}>{day}</Text>
                  </View>
                ))}
              </View>
              {/* Data rows */}
              {[0, 1].map(row => (
                <View key={row} style={styles.medicationRow}>
                  {data.weeklyMedication.data.map((dayData, dayIndex) => (
                    <View key={dayIndex} style={styles.medicationCell}>
                      <View
                        style={[
                          styles.checkCircle,
                          dayData[row]
                            ? styles.checkCircleCompleted
                            : styles.checkCircleMissed,
                        ]}>
                        <Text style={styles.checkMark}>
                          {dayData[row] ? '✓' : ''}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              ))}
            </View>
            <Text style={styles.complianceSummary}>
              이번 주 순응도 {data.weeklyMedication.compliance}%
            </Text>
          </View>

          {/* Weekly Sleep Graph */}
          <View style={styles.detailSection}>
            <View style={styles.detailSectionHeader}>
              <Text style={styles.detailSectionTitle}>주간 수면량 그래프</Text>
              <Text style={styles.averageText}>
                평균 {data.averageSleep.toFixed(1)}시간
              </Text>
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
                    <View
                      style={[
                        styles.chartBar,
                        {height: Math.max((hours / 10) * 120, 4)},
                      ]}
                    />
                    <Text style={styles.barLabel}>
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Weekly Activity Summary */}
          <View style={styles.detailSection}>
            <Text style={styles.detailSectionTitle}>주간 활동량 요약</Text>
            <View style={styles.activitySummary}>
              <View style={styles.activityCard}>
                <Text style={styles.activityIcon}>👣</Text>
                <Text style={styles.activityLabel}>총 걸음</Text>
                <Text style={styles.activityValue}>
                  {data.weeklySteps.toLocaleString()}보
                </Text>
              </View>
              <View style={styles.activityCard}>
                <Text style={styles.activityIcon}>⏱️</Text>
                <Text style={styles.activityLabel}>활동 시간</Text>
                <Text style={styles.activityValue}>
                  {data.weeklyActivityMinutes}분
                </Text>
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
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
        {/* Header */}
        <View style={styles.header}>
          <CharacterAvatar stage={stage} size={64} />
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>주간 건강 리포트</Text>
            <Text style={styles.headerSubtitle}>
              {hasPermissions() ? '이번 주 훌륭해요!' : '건강 데이터를 연동해보세요'}
            </Text>
          </View>
        </View>

        {/* Loading indicator */}
        {isLoading && !weeklyData && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7EBDC3" />
            <Text style={styles.loadingText}>건강 데이터 로딩 중...</Text>
          </View>
        )}

        {/* Permission prompt if needed - always show for debugging */}
        {!hasPermissions() && !isLoading && <PermissionPrompt />}

        {/* Total Score Card */}
        <View style={styles.scoreCard}>
          {renderCircularProgress(data.totalScore)}
        </View>

        {/* Summary Cards */}
        <View style={styles.summarySection}>
          <SummaryCard
            icon="💊"
            title="약 복용"
            value={`오늘 ${data.medication.completed}/${data.medication.total} 복용 완료`}
            status={data.medication.status}
            onRankingPress={() => openRankingModal('medication')}
          />
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
        <TouchableOpacity
          style={styles.fullReportButton}
          onPress={() => setShowDetailModal(true)}>
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
    backgroundColor: '#FDF6E9',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#7EBDC3',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTextContainer: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E8F5E9',
    marginTop: 4,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  permissionPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderColor: '#7EBDC3',
    borderStyle: 'dashed',
  },
  permissionIcon: {
    fontSize: 32,
  },
  permissionTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  permissionDesc: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  permissionArrow: {
    fontSize: 20,
    color: '#7EBDC3',
    fontWeight: 'bold',
  },
  scoreCard: {
    backgroundColor: '#B8E0E5',
    marginHorizontal: 20,
    marginTop: -20,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
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
    borderColor: '#E0E0E0',
  },
  circularFill: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 10,
    borderColor: '#7EBDC3',
    borderLeftColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{rotate: '45deg'}],
  },
  scoreText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    transform: [{rotate: '-45deg'}],
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  summarySection: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  cardValue: {
    fontSize: 14,
    color: '#666',
  },
  cardStatus: {
    fontWeight: '600',
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
    backgroundColor: '#5B9BD5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginLeft: 8,
  },
  rankingButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  fullReportButton: {
    marginHorizontal: 20,
    marginVertical: 20,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  fullReportButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FDF6E9',
  },
  modalScroll: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#7EBDC3',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  modalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalHeaderTextContainer: {
    marginLeft: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#E8F5E9',
    marginTop: 4,
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
    color: '#FFF',
    fontWeight: 'bold',
  },
  detailSection: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
  },
  detailSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  complianceText: {
    fontSize: 12,
    color: '#666',
  },
  complianceValue: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  medicationTable: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  medicationRow: {
    flexDirection: 'row',
  },
  medicationCell: {
    flex: 1,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircleCompleted: {
    backgroundColor: '#7EBDC3',
  },
  checkCircleMissed: {
    backgroundColor: '#E0E0E0',
  },
  checkMark: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  complianceSummary: {
    textAlign: 'center',
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  averageText: {
    fontSize: 12,
    color: '#666',
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
    color: '#999',
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
    backgroundColor: '#7EBDC3',
    borderRadius: 4,
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 10,
    color: '#666',
  },
  activitySummary: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 12,
  },
  activityCard: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  activityIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  activityLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  activityValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  healthTipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  tipBubble: {
    marginLeft: 12,
    flex: 1,
    backgroundColor: '#7EBDC3',
    borderRadius: 16,
    padding: 16,
  },
  tipText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  modalFooter: {
    height: 40,
  },
});
