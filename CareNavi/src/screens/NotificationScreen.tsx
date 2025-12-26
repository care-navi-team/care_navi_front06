// NotificationScreen: 알림 목록 화면
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { Icon, Header } from '../components/common';

interface Notification {
  id: string;
  type: 'mission' | 'health' | 'reward' | 'system';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
}

const NOTIFICATION_ICONS: Record<string, { icon: string; color: string; bgColor: string }> = {
  mission: { icon: 'flag', color: colors.primary, bgColor: colors.primaryLight },
  health: { icon: 'favorite', color: colors.error, bgColor: '#FFEBEE' },
  reward: { icon: 'star', color: colors.warning, bgColor: '#FFF8E1' },
  system: { icon: 'notifications', color: colors.text.secondary, bgColor: colors.surfaceSecondary },
};

// Mock notifications data
const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'mission',
    title: '오늘의 미션이 도착했어요!',
    message: '점심 후 5분 산책하기 미션을 완료해보세요.',
    timestamp: new Date(),
    isRead: false,
  },
  {
    id: '2',
    type: 'health',
    title: '수면 분석 완료',
    message: '어제 7시간 30분 수면하셨어요. 충분한 휴식이에요!',
    timestamp: new Date(Date.now() - 3600000),
    isRead: false,
  },
  {
    id: '3',
    type: 'reward',
    title: '레벨 업!',
    message: '축하해요! 레벨 5에 도달했어요. 새로운 보상을 확인하세요.',
    timestamp: new Date(Date.now() - 86400000),
    isRead: true,
  },
  {
    id: '4',
    type: 'system',
    title: '앱 업데이트 안내',
    message: '새로운 기능이 추가되었어요. 업데이트 후 확인해보세요!',
    timestamp: new Date(Date.now() - 172800000),
    isRead: true,
  },
];

const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;
  return date.toLocaleDateString('ko-KR');
};

export default function NotificationScreen() {
  const navigation = useNavigation();
  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS);
  const [refreshing, setRefreshing] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleNotificationPress = (notification: Notification) => {
    // Mark as read
    setNotifications(prev =>
      prev.map(n => (n.id === notification.id ? { ...n, isRead: true } : n))
    );

    // Navigate based on type
    switch (notification.type) {
      case 'mission':
        (navigation as any).navigate('Mission');
        break;
      case 'health':
        (navigation as any).navigate('HealthSummary');
        break;
      case 'reward':
        (navigation as any).navigate('Profile');
        break;
      default:
        break;
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="알림"
        leftAction={{ icon: 'arrowBack', onPress: handleBack }}
        rightActions={
          unreadCount > 0
            ? [{ icon: 'check', onPress: markAllAsRead }]
            : undefined
        }
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="notifications" size="xl" color={colors.text.muted} />
            <Text style={styles.emptyText}>알림이 없습니다</Text>
          </View>
        ) : (
          notifications.map(notification => {
            const config = NOTIFICATION_ICONS[notification.type];
            return (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationItem,
                  !notification.isRead && styles.unreadItem,
                ]}
                onPress={() => handleNotificationPress(notification)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.iconContainer,
                    { backgroundColor: config.bgColor },
                  ]}
                >
                  <Icon name={config.icon as any} size="md" color={config.color} />
                </View>
                <View style={styles.notificationContent}>
                  <View style={styles.notificationHeader}>
                    <Text
                      style={[
                        styles.notificationTitle,
                        !notification.isRead && styles.unreadTitle,
                      ]}
                    >
                      {notification.title}
                    </Text>
                    {!notification.isRead && <View style={styles.unreadDot} />}
                  </View>
                  <Text style={styles.notificationMessage} numberOfLines={2}>
                    {notification.message}
                  </Text>
                  <Text style={styles.notificationTime}>
                    {formatTimestamp(notification.timestamp)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
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
    paddingVertical: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['4xl'],
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    color: colors.text.muted,
    marginTop: spacing.md,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  unreadItem: {
    backgroundColor: colors.primaryLight,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  notificationTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    flex: 1,
  },
  unreadTitle: {
    fontWeight: typography.fontWeight.bold,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: spacing.sm,
  },
  notificationMessage: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  notificationTime: {
    fontSize: typography.fontSize.xs,
    color: colors.text.muted,
  },
});
