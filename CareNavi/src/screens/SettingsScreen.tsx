// SettingsScreen: 설정 화면
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { Icon, Header } from '../components/common';
import { useAuthStore } from '../stores/useAuthStore';

interface SettingItem {
  id: string;
  icon: string;
  title: string;
  subtitle?: string;
  type: 'navigate' | 'toggle' | 'action';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

interface SettingSection {
  title: string;
  items: SettingItem[];
}

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { signOut } = useAuthStore();

  const [notifications, setNotifications] = useState(true);
  const [healthSync, setHealthSync] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃 하시겠어요?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      '계정 삭제',
      '계정을 삭제하면 모든 데이터가 영구적으로 삭제됩니다. 정말 삭제하시겠어요?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: () => {
            Alert.alert('안내', '계정 삭제 요청이 접수되었습니다. 처리까지 최대 7일이 소요될 수 있습니다.');
          },
        },
      ]
    );
  };

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://carenavi.app/privacy');
  };

  const handleTerms = () => {
    Linking.openURL('https://carenavi.app/terms');
  };

  const handleContact = () => {
    Linking.openURL('mailto:support@carenavi.app');
  };

  const sections: SettingSection[] = [
    {
      title: '알림',
      items: [
        {
          id: 'notifications',
          icon: 'notifications',
          title: '푸시 알림',
          subtitle: '미션, 건강 리마인더 알림 받기',
          type: 'toggle',
          value: notifications,
          onToggle: setNotifications,
        },
      ],
    },
    {
      title: '건강 데이터',
      items: [
        {
          id: 'healthSync',
          icon: 'favorite',
          title: '건강 데이터 동기화',
          subtitle: 'Apple Health / Google Fit 연동',
          type: 'toggle',
          value: healthSync,
          onToggle: setHealthSync,
        },
      ],
    },
    {
      title: '디스플레이',
      items: [
        {
          id: 'darkMode',
          icon: 'darkMode',
          title: '다크 모드',
          subtitle: '어두운 테마 사용 (준비 중)',
          type: 'toggle',
          value: darkMode,
          onToggle: (value) => {
            setDarkMode(value);
            if (value) {
              Alert.alert('준비 중', '다크 모드는 곧 지원될 예정이에요!');
              setDarkMode(false);
            }
          },
        },
      ],
    },
    {
      title: '정보',
      items: [
        {
          id: 'version',
          icon: 'info',
          title: '앱 버전',
          subtitle: '1.0.0',
          type: 'navigate',
          onPress: () => {},
        },
        {
          id: 'privacy',
          icon: 'shield',
          title: '개인정보 처리방침',
          type: 'navigate',
          onPress: handlePrivacyPolicy,
        },
        {
          id: 'terms',
          icon: 'description',
          title: '이용약관',
          type: 'navigate',
          onPress: handleTerms,
        },
        {
          id: 'contact',
          icon: 'mail',
          title: '문의하기',
          subtitle: 'support@carenavi.app',
          type: 'navigate',
          onPress: handleContact,
        },
      ],
    },
    {
      title: '계정',
      items: [
        {
          id: 'logout',
          icon: 'logout',
          title: '로그아웃',
          type: 'action',
          onPress: handleLogout,
        },
        {
          id: 'deleteAccount',
          icon: 'delete',
          title: '계정 삭제',
          type: 'action',
          onPress: handleDeleteAccount,
        },
      ],
    },
  ];

  const renderSettingItem = (item: SettingItem) => {
    const isDestructive = item.id === 'deleteAccount';

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.settingItem}
        onPress={item.type === 'toggle' ? undefined : item.onPress}
        activeOpacity={item.type === 'toggle' ? 1 : 0.7}
        disabled={item.type === 'toggle'}
      >
        <View style={styles.settingItemLeft}>
          <View
            style={[
              styles.iconContainer,
              isDestructive && styles.iconContainerDestructive,
            ]}
          >
            <Icon
              name={item.icon as any}
              size="sm"
              color={isDestructive ? colors.error : colors.primary}
            />
          </View>
          <View style={styles.settingItemContent}>
            <Text
              style={[
                styles.settingItemTitle,
                isDestructive && styles.destructiveText,
              ]}
            >
              {item.title}
            </Text>
            {item.subtitle && (
              <Text style={styles.settingItemSubtitle}>{item.subtitle}</Text>
            )}
          </View>
        </View>
        {item.type === 'toggle' && (
          <Switch
            value={item.value}
            onValueChange={item.onToggle}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={colors.surface}
          />
        )}
        {item.type === 'navigate' && (
          <Icon name="chevronRight" size="sm" color={colors.text.muted} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Header
        title="설정"
        leftAction={{ icon: 'arrowBack', onPress: handleBack }}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {sections.map((section, index) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map(renderSettingItem)}
            </View>
          </View>
        ))}
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
    paddingBottom: spacing['4xl'],
  },
  section: {
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text.secondary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  sectionContent: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  iconContainerDestructive: {
    backgroundColor: '#FFEBEE',
  },
  settingItemContent: {
    flex: 1,
  },
  settingItemTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  settingItemSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  destructiveText: {
    color: colors.error,
  },
});
