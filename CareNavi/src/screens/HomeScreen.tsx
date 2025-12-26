// T042: Home Screen - Combined character + missions view with AI chat
import React, {useEffect, useState, useCallback, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import CharacterAvatar from '../components/character/CharacterAvatar';
import RewardPopup from '../components/reward/RewardPopup';
import {useAuthStore} from '../stores/useAuthStore';
import {useDailyStore} from '../stores/useDailyStore';
import {useMissionStore} from '../stores/useMissionStore';
import {useGrowthStore} from '../stores/useGrowthStore';
import {useSurveyStore} from '../stores/useSurveyStore';
import {useDailyMissionStore} from '../stores/useDailyMissionStore';
import {useRewardStore} from '../stores/useRewardStore';
import {Mission} from '../types';
import {DailyMission} from '../types/dailyMission';
import {CHARACTER_NAME, CHARACTER_GREETINGS} from '../utils/constants';
import {getRandomItem} from '../utils/helpers';
import {chatWithAI} from '../services/geminiService';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

// Daily Mission Item Component
function DailyMissionItem({
  mission,
  onPress,
}: {
  mission: DailyMission;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.dailyMissionItem, mission.completed && styles.dailyMissionCompleted]}
      onPress={onPress}
      disabled={mission.completed}
      activeOpacity={0.7}>
      <View style={styles.dailyMissionIconContainer}>
        <Text style={styles.dailyMissionIcon}>{mission.icon}</Text>
      </View>
      <View style={styles.dailyMissionContent}>
        <Text style={[styles.dailyMissionTitle, mission.completed && styles.completedText]}>
          {mission.title}
        </Text>
        <Text style={styles.dailyMissionDesc}>{mission.description}</Text>
      </View>
      {mission.completed ? (
        <View style={styles.dailyMissionCheck}>
          <Text style={styles.dailyMissionCheckText}>✓</Text>
        </View>
      ) : (
        <View style={styles.dailyMissionAction}>
          <Text style={styles.dailyMissionActionText}>
            {mission.type === 'meal' ? '📷' : '탭'}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// Mission item component for home screen (compact version)
function HomeMissionItem({
  mission,
  onComplete,
}: {
  mission: Mission;
  onComplete?: (id: string) => void;
}) {
  const isCompleted = mission.is_completed;

  const getTypeIcon = () => {
    switch (mission.type) {
      case 'easy':
        return '💬';
      case 'normal':
        return '🏃';
      case 'challenge':
        return '📸';
      default:
        return '📋';
    }
  };

  return (
    <TouchableOpacity
      style={styles.missionItem}
      onPress={() => !isCompleted && onComplete?.(mission.id)}
      disabled={isCompleted}
      activeOpacity={0.7}>
      <View style={styles.missionIconContainer}>
        <Text style={styles.missionIcon}>{getTypeIcon()}</Text>
      </View>
      <View style={styles.missionContent}>
        <View style={styles.missionTitleRow}>
          <Text style={[styles.missionTitle, isCompleted && styles.completedText]}>
            {mission.title}
          </Text>
          <View style={styles.xpBadge}>
            <Text style={styles.xpBadgeText}>+{mission.xp_reward}XP</Text>
          </View>
        </View>
        {mission.description && (
          <Text style={styles.missionSubtitle} numberOfLines={1}>
            {mission.description}
          </Text>
        )}
      </View>
      {isCompleted && (
        <View style={styles.completedCheck}>
          <Text style={styles.completedCheckText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// AI Chat Modal
function ChatModal({
  visible,
  onClose,
  surveyData,
}: {
  visible: boolean;
  onClose: () => void;
  surveyData: any;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visible && messages.length === 0) {
      setMessages([
        {
          id: '1',
          role: 'assistant',
          content: `안녕! 나는 ${CHARACTER_NAME}야 🐕\n건강에 대해 궁금한 거 있으면 뭐든 물어봐!`,
        },
      ]);
    }
  }, [visible]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await chatWithAI(inputText.trim(), surveyData);
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '미안, 지금 대답하기 어려워. 나중에 다시 물어봐줘! 🙏',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setMessages([]);
    setInputText('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={styles.chatModalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.chatModalContent}>
          <View style={styles.chatModalHeader}>
            <View style={styles.chatHeaderLeft}>
              <Text style={styles.chatHeaderEmoji}>🐕</Text>
              <Text style={styles.chatHeaderTitle}>{CHARACTER_NAME}와 대화</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.chatCloseButton}>
              <Text style={styles.chatCloseText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={scrollViewRef}
            style={styles.chatMessages}
            contentContainerStyle={styles.chatMessagesContent}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}>
            {messages.map(msg => (
              <View
                key={msg.id}
                style={[
                  styles.chatBubble,
                  msg.role === 'user' ? styles.chatBubbleUser : styles.chatBubbleAssistant,
                ]}>
                <Text
                  style={[
                    styles.chatBubbleText,
                    msg.role === 'user' && styles.chatBubbleTextUser,
                  ]}>
                  {msg.content}
                </Text>
              </View>
            ))}
            {isLoading && (
              <View style={[styles.chatBubble, styles.chatBubbleAssistant]}>
                <ActivityIndicator size="small" color="#4A90D9" />
              </View>
            )}
          </ScrollView>

          <View style={styles.chatInputContainer}>
            <TextInput
              style={styles.chatInput}
              placeholder="건강에 대해 물어보세요..."
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.chatSendButton, !inputText.trim() && styles.chatSendButtonDisabled]}
              onPress={handleSend}
              disabled={!inputText.trim() || isLoading}>
              <Text style={styles.chatSendButtonText}>전송</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function HomeScreen() {
  const {session} = useAuthStore();
  const {
    dailyState,
    isLoading: dailyLoading,
    fetchTodayState,
    transitionToCompleted,
    isInProgress,
    isCompleted,
  } = useDailyStore();
  const {
    missions,
    isLoading: missionsLoading,
    fetchTodayMissions,
    completeMission: completeMissionAction,
    areAllCompleted,
  } = useMissionStore();
  const {level, stage, totalXP, fetchProfile, addXPAndSync} = useGrowthStore();
  const {surveyData} = useSurveyStore();

  // Daily fixed missions
  const {
    missions: dailyMissions,
    isLoading: dailyMissionsLoading,
    loadMissions,
    completeMission: completeDailyMission,
    getMedicationMissions,
    getMealMissions,
    getCompletedCount,
    getTotalCount,
  } = useDailyMissionStore();

  // Reward store
  const {
    pendingReward,
    loadRewardState,
    checkAndTriggerReward,
    claimReward,
  } = useRewardStore();

  const [showChatModal, setShowChatModal] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const [selectedMealMission, setSelectedMealMission] = useState<DailyMission | null>(null);
  const [showRewardPopup, setShowRewardPopup] = useState(false);

  // Load daily missions and reward state on mount
  useEffect(() => {
    loadMissions();
    loadRewardState();
  }, []);

  // Check for rewards when XP changes
  useEffect(() => {
    if (totalXP > 0) {
      const reward = checkAndTriggerReward(totalXP);
      if (reward) {
        setShowRewardPopup(true);
      }
    }
  }, [totalXP]);

  // Handle reward claim
  const handleClaimReward = useCallback(async () => {
    if (pendingReward) {
      await claimReward(pendingReward.milestone);
      setShowRewardPopup(false);
      // Check for next unclaimed reward
      setTimeout(() => {
        const nextReward = checkAndTriggerReward(totalXP);
        if (nextReward) {
          setShowRewardPopup(true);
        }
      }, 500);
    }
  }, [pendingReward, claimReward, checkAndTriggerReward, totalXP]);

  // Fetch data on mount
  useEffect(() => {
    if (session?.user?.id) {
      fetchTodayState(session.user.id);
      fetchProfile(session.user.id);
    }
  }, [session?.user?.id, fetchTodayState, fetchProfile]);

  // Fetch missions when in_progress
  useEffect(() => {
    if (session?.user?.id && isInProgress()) {
      fetchTodayMissions(session.user.id);
    }
  }, [session?.user?.id, dailyState, isInProgress, fetchTodayMissions]);

  // Set greeting
  useEffect(() => {
    const greet = getRandomItem(CHARACTER_GREETINGS);
    setGreeting(greet);
  }, []);

  // Handle daily mission press
  const handleDailyMissionPress = useCallback(
    async (mission: DailyMission) => {
      if (mission.completed) return;

      if (mission.type === 'medication') {
        // Medication: just tap to complete
        await completeDailyMission(mission.id);
        // Add XP for medication
        if (session?.user?.id) {
          await addXPAndSync(session.user.id, 10);
        }
      } else if (mission.type === 'meal') {
        // Meal: open camera
        setSelectedMealMission(mission);
        showImagePicker(mission);
      }
    },
    [completeDailyMission, session?.user?.id, addXPAndSync],
  );

  // Show image picker for meal missions
  const showImagePicker = (mission: DailyMission) => {
    Alert.alert('식단 기록', '사진을 어떻게 추가할까요?', [
      {
        text: '카메라로 촬영',
        onPress: () => openCamera(mission),
      },
      {
        text: '앨범에서 선택',
        onPress: () => openGallery(mission),
      },
      {
        text: '취소',
        style: 'cancel',
      },
    ]);
  };

  const openCamera = async (mission: DailyMission) => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.8,
        saveToPhotos: true,
      });

      if (result.assets && result.assets[0]?.uri) {
        await completeDailyMission(mission.id, result.assets[0].uri);
        if (session?.user?.id) {
          await addXPAndSync(session.user.id, 15);
        }
        Alert.alert('완료!', `${mission.title}이(가) 완료되었습니다! 🎉`);
      }
    } catch (error) {
      console.error('Camera error:', error);
    }
  };

  const openGallery = async (mission: DailyMission) => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
      });

      if (result.assets && result.assets[0]?.uri) {
        await completeDailyMission(mission.id, result.assets[0].uri);
        if (session?.user?.id) {
          await addXPAndSync(session.user.id, 15);
        }
        Alert.alert('완료!', `${mission.title}이(가) 완료되었습니다! 🎉`);
      }
    } catch (error) {
      console.error('Gallery error:', error);
    }
  };

  const handleCompleteMission = useCallback(
    async (missionId: string) => {
      if (!session?.user?.id) return;

      const mission = missions.find(m => m.id === missionId);
      if (!mission) return;

      const completedMission = await completeMissionAction(missionId, session.user.id);
      if (!completedMission) return;

      await addXPAndSync(session.user.id, completedMission.xp_reward);

      setTimeout(async () => {
        if (areAllCompleted()) {
          setShowCelebration(true);
          setTimeout(async () => {
            await transitionToCompleted(session.user.id);
            setShowCelebration(false);
          }, 2000);
        }
      }, 100);
    },
    [
      session?.user?.id,
      missions,
      completeMissionAction,
      addXPAndSync,
      areAllCompleted,
      transitionToCompleted,
    ],
  );

  // Format today's date
  const formatDate = () => {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    return `${month}월 ${String(day).padStart(2, '0')}일`;
  };

  const medicationMissions = getMedicationMissions();
  const mealMissions = getMealMissions();
  const dailyCompletedCount = getCompletedCount();
  const dailyTotalCount = getTotalCount();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Top Stats Bar */}
        <View style={styles.topBar}>
          <View style={styles.statBadge}>
            <Text style={styles.statBadgeIcon}>🥚</Text>
            <Text style={styles.statBadgeText}>{totalXP}</Text>
          </View>
          <View style={styles.statBadge}>
            <Text style={styles.statBadgeIcon}>⭐</Text>
            <Text style={styles.statBadgeText}>Lv.{level}</Text>
          </View>
        </View>

        {/* Character Section */}
        <View style={styles.characterSection}>
          <TouchableOpacity
            style={styles.speechBubble}
            onPress={() => setShowChatModal(true)}
            activeOpacity={0.8}>
            <Text style={styles.speechText}>{greeting}</Text>
            <Text style={styles.speechHint}>탭하여 대화하기 💬</Text>
            <View style={styles.speechTail} />
          </TouchableOpacity>

          <View style={styles.avatarContainer}>
            <CharacterAvatar stage={stage} size={140} />
          </View>

          <Text style={styles.characterName}>{CHARACTER_NAME}</Text>
        </View>

        {/* Daily Fixed Missions Section */}
        <View style={styles.dailyMissionSection}>
          <View style={styles.dailyMissionHeader}>
            <Text style={styles.dailyMissionHeaderTitle}>📋 오늘의 루틴</Text>
            <Text style={styles.dailyMissionProgress}>
              {dailyCompletedCount}/{dailyTotalCount}
            </Text>
          </View>

          {/* Medication Missions */}
          <View style={styles.dailyMissionGroup}>
            <Text style={styles.dailyMissionGroupTitle}>💊 약 복용</Text>
            {medicationMissions.map(mission => (
              <DailyMissionItem
                key={mission.id}
                mission={mission}
                onPress={() => handleDailyMissionPress(mission)}
              />
            ))}
          </View>

          {/* Meal Missions */}
          <View style={styles.dailyMissionGroup}>
            <Text style={styles.dailyMissionGroupTitle}>🍽️ 식단 기록</Text>
            {mealMissions.map(mission => (
              <DailyMissionItem
                key={mission.id}
                mission={mission}
                onPress={() => handleDailyMissionPress(mission)}
              />
            ))}
          </View>

          {dailyCompletedCount === dailyTotalCount && dailyTotalCount > 0 && (
            <View style={styles.allCompletedBanner}>
              <Text style={styles.allCompletedEmoji}>🎉</Text>
              <Text style={styles.allCompletedText}>오늘의 루틴 완료!</Text>
            </View>
          )}
        </View>

        {/* AI Mission Section (existing) */}
        {missions.length > 0 && (
          <View style={styles.missionSection}>
            <View style={styles.missionHeader}>
              <Text style={styles.dateText}>🤖 AI 맞춤 미션</Text>
            </View>

            {dailyLoading || missionsLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>로딩 중...</Text>
              </View>
            ) : (
              <>
                {missions.slice(0, 3).map(mission => (
                  <HomeMissionItem
                    key={mission.id}
                    mission={mission}
                    onComplete={handleCompleteMission}
                  />
                ))}

                {isCompleted() && (
                  <View style={styles.allCompletedBanner}>
                    <Text style={styles.allCompletedEmoji}>🎉</Text>
                    <Text style={styles.allCompletedText}>AI 미션 완료!</Text>
                  </View>
                )}
              </>
            )}
          </View>
        )}
      </ScrollView>

      {/* AI Chat Modal */}
      <ChatModal
        visible={showChatModal}
        onClose={() => setShowChatModal(false)}
        surveyData={surveyData}
      />

      {/* Celebration Overlay */}
      {showCelebration && (
        <View style={styles.celebrationOverlay}>
          <Text style={styles.celebrationEmoji}>🎉</Text>
          <Text style={styles.celebrationTitle}>모든 미션 완료!</Text>
          <Text style={styles.celebrationSubtitle}>오늘도 건강한 하루였어요!</Text>
        </View>
      )}

      {/* Reward Popup */}
      <RewardPopup
        visible={showRewardPopup}
        reward={pendingReward}
        onClaim={handleClaimReward}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F4FD',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statBadgeIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  statBadgeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  characterSection: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  speechBubble: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
    alignItems: 'center',
  },
  speechText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  speechHint: {
    fontSize: 12,
    color: '#4A90D9',
    marginTop: 4,
  },
  speechTail: {
    position: 'absolute',
    bottom: -8,
    left: '50%',
    marginLeft: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FFF',
  },
  avatarContainer: {
    marginBottom: 8,
  },
  characterName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  // Daily Mission Styles
  dailyMissionSection: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  dailyMissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dailyMissionHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  dailyMissionProgress: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  dailyMissionGroup: {
    marginBottom: 16,
  },
  dailyMissionGroupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  dailyMissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  dailyMissionCompleted: {
    backgroundColor: '#E8F5E9',
  },
  dailyMissionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dailyMissionIcon: {
    fontSize: 20,
  },
  dailyMissionContent: {
    flex: 1,
  },
  dailyMissionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  dailyMissionDesc: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  dailyMissionCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dailyMissionCheckText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dailyMissionAction: {
    width: 40,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dailyMissionActionText: {
    fontSize: 16,
    color: '#4A90D9',
    fontWeight: '600',
  },
  // Existing mission section styles
  missionSection: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  viewAllText: {
    fontSize: 14,
    color: '#4A90D9',
  },
  missionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  missionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  missionIcon: {
    fontSize: 22,
  },
  missionContent: {
    flex: 1,
  },
  missionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  missionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  xpBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  xpBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  missionSubtitle: {
    fontSize: 13,
    color: '#999',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  completedCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  completedCheckText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyMissions: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
  },
  allCompletedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
  },
  allCompletedEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  allCompletedText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  // Chat Modal styles
  chatModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  chatModalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '85%',
  },
  chatModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  chatHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatHeaderEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  chatHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  chatCloseButton: {
    padding: 4,
  },
  chatCloseText: {
    fontSize: 24,
    color: '#999',
  },
  chatMessages: {
    flex: 1,
  },
  chatMessagesContent: {
    padding: 16,
  },
  chatBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  chatBubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: '#4A90D9',
  },
  chatBubbleAssistant: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F0F0',
  },
  chatBubbleText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  chatBubbleTextUser: {
    color: '#FFF',
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFF',
  },
  chatInput: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    marginRight: 8,
  },
  chatSendButton: {
    backgroundColor: '#4A90D9',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  chatSendButtonDisabled: {
    backgroundColor: '#CCC',
  },
  chatSendButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  celebrationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  celebrationEmoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  celebrationTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  celebrationSubtitle: {
    fontSize: 18,
    color: '#E0E0E0',
  },
});
