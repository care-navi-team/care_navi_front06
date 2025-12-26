// T042: Home Screen - Redesigned based on Stitch wireframe
import React, { useEffect, useState, useCallback, useRef } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';

// Theme & Components
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { Header, Icon, Card } from '../components/common';
import CharacterAvatar from '../components/character/CharacterAvatar';
import { SpeechBubble } from '../components/character/SpeechBubble';
import { QuickActionButton, InteractionButton, TodayMissionCard } from '../components/home';
import RewardPopup from '../components/reward/RewardPopup';

// Stores
import { useAuthStore } from '../stores/useAuthStore';
import { useDailyStore } from '../stores/useDailyStore';
import { useMissionStore } from '../stores/useMissionStore';
import { useGrowthStore } from '../stores/useGrowthStore';
import { useSurveyStore } from '../stores/useSurveyStore';
import { useDailyMissionStore } from '../stores/useDailyMissionStore';
import { useRewardStore } from '../stores/useRewardStore';
import { useHealthStore } from '../stores/useHealthStore';

// Types & Utils
import { DailyMission } from '../types/dailyMission';
import { CHARACTER_NAME, CHARACTER_GREETINGS } from '../utils/constants';
import { getRandomItem } from '../utils/helpers';
import { chatWithAI } from '../services/geminiService';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
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
          content: `안녕! 나는 ${CHARACTER_NAME}야 🐾\n건강에 대해 궁금한 거 있으면 뭐든 물어봐!`,
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.chatModalContent}>
          <View style={styles.chatModalHeader}>
            <View style={styles.chatHeaderLeft}>
              <Icon name="pets" size="md" color={colors.primary} />
              <Text style={styles.chatHeaderTitle}>{CHARACTER_NAME}와 대화</Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.chatCloseButton}>
              <Icon name="close" size="md" color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            ref={scrollViewRef}
            style={styles.chatMessages}
            contentContainerStyle={styles.chatMessagesContent}
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd()}
          >
            {messages.map(msg => (
              <View
                key={msg.id}
                style={[
                  styles.chatBubble,
                  msg.role === 'user' ? styles.chatBubbleUser : styles.chatBubbleAssistant,
                ]}
              >
                <Text
                  style={[
                    styles.chatBubbleText,
                    msg.role === 'user' && styles.chatBubbleTextUser,
                  ]}
                >
                  {msg.content}
                </Text>
              </View>
            ))}
            {isLoading && (
              <View style={[styles.chatBubble, styles.chatBubbleAssistant]}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            )}
          </ScrollView>

          <View style={styles.chatInputContainer}>
            <TextInput
              style={styles.chatInput}
              placeholder="건강에 대해 물어보세요..."
              placeholderTextColor={colors.text.muted}
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.chatSendButton,
                !inputText.trim() && styles.chatSendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={!inputText.trim() || isLoading}
            >
              <Icon name="forward" size="sm" color={colors.text.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const { session } = useAuthStore();
  const { dailyState, fetchTodayState, transitionToCompleted, isInProgress, isCompleted } =
    useDailyStore();
  const {
    missions,
    fetchTodayMissions,
    completeMission: completeMissionAction,
    areAllCompleted,
  } = useMissionStore();
  const { level, stage, totalXP, fetchProfile, addXPAndSync } = useGrowthStore();
  const { surveyData } = useSurveyStore();
  const getTodaySleepHours = useHealthStore(state => state.getTodaySleepHours);
  const sleepHours = getTodaySleepHours();
  const {
    missions: dailyMissions,
    loadMissions,
    completeMission: completeDailyMission,
    getCompletedCount,
    getTotalCount,
  } = useDailyMissionStore();
  const { pendingReward, loadRewardState, checkAndTriggerReward, claimReward } =
    useRewardStore();

  const [showChatModal, setShowChatModal] = useState(false);
  const [greeting, setGreeting] = useState('');
  const [showRewardPopup, setShowRewardPopup] = useState(false);
  const [todayMissionCompleted, setTodayMissionCompleted] = useState(false);

  // Load data on mount
  useEffect(() => {
    loadMissions();
    loadRewardState();
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      fetchTodayState(session.user.id);
      fetchProfile(session.user.id);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (session?.user?.id && isInProgress()) {
      fetchTodayMissions(session.user.id);
    }
  }, [session?.user?.id, dailyState]);

  useEffect(() => {
    const greet = getRandomItem(CHARACTER_GREETINGS);
    setGreeting(greet);
  }, []);

  useEffect(() => {
    if (totalXP > 0) {
      const reward = checkAndTriggerReward(totalXP);
      if (reward) {
        setShowRewardPopup(true);
      }
    }
  }, [totalXP]);

  const handleClaimReward = useCallback(async () => {
    if (pendingReward) {
      await claimReward(pendingReward.milestone);
      setShowRewardPopup(false);
    }
  }, [pendingReward, claimReward]);

  // Generate dynamic message based on health data
  const getCharacterMessage = () => {
    if (sleepHours && sleepHours < 6) {
      return `요즘 조금 피곤해 보여요 😴`;
    }
    return greeting;
  };

  const getSubMessage = () => {
    if (sleepHours && sleepHours < 6) {
      return `어제 수면 시간: ${sleepHours.toFixed(1)}시간`;
    }
    return undefined;
  };

  // Handle today's easy mission completion
  const handleTodayMissionComplete = async () => {
    if (todayMissionCompleted) return;
    setTodayMissionCompleted(true);
    if (session?.user?.id) {
      await addXPAndSync(session.user.id, 5);
    }
    Alert.alert('완료!', '물 한 잔 마시기 완료! 💧');
  };

  // Handle daily mission
  const handleDailyMissionPress = useCallback(
    async (mission: DailyMission) => {
      if (mission.completed) return;

      if (mission.type === 'medication') {
        await completeDailyMission(mission.id);
        if (session?.user?.id) {
          await addXPAndSync(session.user.id, 10);
        }
      } else if (mission.type === 'meal') {
        showImagePicker(mission);
      }
    },
    [completeDailyMission, session?.user?.id, addXPAndSync]
  );

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
      { text: '취소', style: 'cancel' },
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
      }
    } catch (error) {
      console.error('Gallery error:', error);
    }
  };

  // Navigation handlers
  const handleProfilePress = () => {
    (navigation as any).navigate('Profile');
  };

  const handleNotificationsPress = () => {
    Alert.alert('알림', '새로운 알림이 없습니다.');
  };

  const handleSettingsPress = () => {
    (navigation as any).navigate('Profile');
  };

  const handleMissionPress = () => {
    (navigation as any).navigate('Mission');
  };

  const handleRecordPress = () => {
    (navigation as any).navigate('Record');
  };

  const handleKeywordsPress = () => {
    // Navigate to HealthKeywordsScreen - need to add to navigation
    Alert.alert('건강 키워드', '곧 출시 예정입니다!');
  };

  // Interaction handlers (UI only for now)
  const handlePlayPress = () => {
    Alert.alert('놀아주기', `${CHARACTER_NAME}와 놀아주기 기능이 곧 출시됩니다! 🎮`);
  };

  const handlePetPress = () => {
    Alert.alert('쓰다듬기', `${CHARACTER_NAME}를 쓰다듬었습니다! 💕`);
  };

  const handleFeedPress = () => {
    Alert.alert('밥주기', `${CHARACTER_NAME}에게 밥을 줬습니다! 🍖`);
  };

  const dailyCompletedCount = getCompletedCount();
  const dailyTotalCount = getTotalCount();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <Header
        leftAction={{ icon: 'person', onPress: handleProfilePress }}
        rightActions={[
          { icon: 'notifications', onPress: handleNotificationsPress, badge: true },
          { icon: 'settings', onPress: handleSettingsPress },
        ]}
        transparent
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Action Buttons */}
        <View style={styles.quickActionsRow}>
          <QuickActionButton
            icon="flag"
            label="건강미션"
            onPress={handleMissionPress}
          />
          <QuickActionButton
            icon="editNote"
            label="기록"
            onPress={handleRecordPress}
          />
          <QuickActionButton
            icon="tag"
            label="건강 키워드"
            onPress={handleKeywordsPress}
          />
        </View>

        {/* Character Section */}
        <TouchableOpacity
          style={styles.characterSection}
          onPress={() => setShowChatModal(true)}
          activeOpacity={0.9}
        >
          <CharacterAvatar stage={stage} size={200} hasGlow animated />
        </TouchableOpacity>

        {/* Speech Bubble */}
        <View style={styles.speechBubbleContainer}>
          <SpeechBubble
            message={getCharacterMessage()}
            subMessage={getSubMessage()}
            animated
          />
        </View>

        {/* Today's Easy Health Action */}
        <View style={styles.todayMissionContainer}>
          <TodayMissionCard
            icon="water"
            title="물 한 잔 마시기"
            emoji="💧"
            isCompleted={todayMissionCompleted}
            onComplete={handleTodayMissionComplete}
          />
        </View>
      </ScrollView>

      {/* Footer - Character Interaction Buttons */}
      <View style={styles.footer}>
        <View style={styles.interactionRow}>
          <InteractionButton
            icon="toys"
            label="놀아주기"
            onPress={handlePlayPress}
          />
          <InteractionButton
            icon="pets"
            label="쓰다듬기"
            onPress={handlePetPress}
            isMain
          />
          <InteractionButton
            icon="restaurant"
            label="밥주기"
            onPress={handleFeedPress}
          />
        </View>
      </View>

      {/* AI Chat Modal */}
      <ChatModal
        visible={showChatModal}
        onClose={() => setShowChatModal(false)}
        surveyData={surveyData}
      />

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
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 160,
  },
  // Quick Actions
  quickActionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  // Character Section
  characterSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  speechBubbleContainer: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  // Today's Mission
  todayMissionContainer: {
    marginTop: 'auto',
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
    paddingTop: spacing.lg,
    backgroundColor: colors.background,
  },
  interactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
  },
  // Chat Modal
  chatModalContainer: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  chatModalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius['2xl'],
    borderTopRightRadius: borderRadius['2xl'],
    height: '85%',
  },
  chatModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  chatHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  chatHeaderTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  chatCloseButton: {
    padding: spacing.xs,
  },
  chatMessages: {
    flex: 1,
  },
  chatMessagesContent: {
    padding: spacing.lg,
  },
  chatBubble: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
  },
  chatBubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
  },
  chatBubbleAssistant: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceSecondary,
  },
  chatBubbleText: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    lineHeight: 22,
  },
  chatBubbleTextUser: {
    color: colors.text.primary,
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.md,
    paddingBottom: spacing['2xl'],
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  chatInput: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.md,
    maxHeight: 100,
    color: colors.text.primary,
  },
  chatSendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatSendButtonDisabled: {
    backgroundColor: colors.border,
  },
});
