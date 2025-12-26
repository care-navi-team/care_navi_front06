import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { BackHeader, Card, Icon } from '../components/common';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { supabase } from '../services/supabase';

interface Ingredient {
  id: string;
  name: string;
  is_highlighted: boolean;
}

interface HealthKeyword {
  id: string;
  name: string;
  icon: string;
  description: string;
  status_label?: string;
  status_message?: string;
  ingredients: Ingredient[];
}

// Hardcoded fallback data
const fallbackKeywords: HealthKeyword[] = [
  {
    id: '1',
    name: '수면 건강',
    icon: '💤',
    description: '깊은 잠을 못 자고 자주 깨셨네요. 수면의 질을 높이는 데 도움을 줄 수 있는 성분입니다.',
    status_label: '수면 부족 3일째',
    status_message: '최근 기록 연동',
    ingredients: [
      { id: '1', name: '마그네슘', is_highlighted: true },
      { id: '2', name: 'L-테아닌', is_highlighted: false },
      { id: '3', name: '타트체리', is_highlighted: false },
    ],
  },
  {
    id: '2',
    name: '피로 회복',
    icon: '🔋',
    description: '신체 활동이 많았던 하루네요. 에너지 대사를 돕고 활력을 충전해주는 성분이 필요해요.',
    status_label: '어제보다 150% 더 걸었어요',
    status_message: '활동량 급증',
    ingredients: [
      { id: '4', name: '비타민 B군', is_highlighted: true },
      { id: '5', name: '홍삼', is_highlighted: false },
    ],
  },
  {
    id: '3',
    name: '눈 건강',
    icon: '👀',
    description: '스크린 타임이 평균보다 높아요.',
    ingredients: [
      { id: '6', name: '루테인', is_highlighted: false },
      { id: '7', name: '아스타잔틴', is_highlighted: false },
    ],
  },
];

const HealthKeywordsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [keywords, setKeywords] = useState<HealthKeyword[]>(fallbackKeywords);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKeywords();
  }, []);

  const loadKeywords = async () => {
    try {
      // Try to fetch from Supabase
      const { data, error } = await supabase
        .from('health_keywords')
        .select(`
          id,
          name,
          icon,
          description,
          status_label,
          status_message,
          ingredients (
            id,
            name,
            is_highlighted
          )
        `)
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (data && data.length > 0) {
        setKeywords(data);
      }
    } catch (error) {
      // Use fallback data on error
      console.log('Using fallback keywords data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <BackHeader
        title="성분 · 건강 카테고리"
        onBack={() => navigation.goBack()}
      />
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Character Message */}
        <View style={styles.characterSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>🐾</Text>
            </View>
            <View style={styles.boltBadge}>
              <Icon name="bolt" size="xs" color={colors.text.primary} />
            </View>
          </View>
          <View style={styles.speechBubble}>
            <Text style={styles.characterName}>헬띠</Text>
            <Text style={styles.speechText}>
              <Text style={styles.userName}>지민</Text>님, 요즘 잠을 잘 못 주무셨네요.{'\n'}
              부족한 휴식을 채워줄 성분들을 모아봤어요! 🌙
            </Text>
          </View>
        </View>

        {/* Disclaimer */}
        <Card variant="outlined" style={styles.disclaimerCard}>
          <View style={styles.disclaimerContent}>
            <Icon name="info" size="md" color={colors.primary} />
            <View style={styles.disclaimerText}>
              <Text style={styles.disclaimerTitle}>헬띠는 제품을 추천하지 않아요</Text>
              <Text style={styles.disclaimerBody}>
                특정 제품을 판매하거나 홍보하지 않습니다. 오직 객관적인 성분 정보와 건강 카테고리만 제공해요.
              </Text>
            </View>
          </View>
        </Card>

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>나를 위한 건강 키워드</Text>
          <Text style={styles.sectionSubtitle}>최근 기록을 바탕으로 분석했어요</Text>
        </View>

        {/* Keyword Cards */}
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        ) : (
          keywords.map((keyword, index) => (
            <KeywordCard
              key={keyword.id}
              keyword={keyword}
              isCompact={index >= 2}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

interface KeywordCardProps {
  keyword: HealthKeyword;
  isCompact?: boolean;
}

const KeywordCard: React.FC<KeywordCardProps> = ({ keyword, isCompact }) => {
  if (isCompact) {
    return (
      <Card variant="default" style={styles.compactCard}>
        <View style={styles.compactHeader}>
          <Text style={styles.keywordTitle}>{keyword.name}</Text>
          <View style={styles.compactIcon}>
            <Text style={styles.iconEmoji}>{keyword.icon}</Text>
          </View>
        </View>
        <Text style={styles.compactDescription}>{keyword.description}</Text>
        <View style={styles.ingredientsRow}>
          {keyword.ingredients.map((ing) => (
            <View key={ing.id} style={styles.ingredientPill}>
              <Text style={styles.ingredientText}>{ing.name}</Text>
            </View>
          ))}
        </View>
      </Card>
    );
  }

  return (
    <Card variant="elevated" style={styles.keywordCard}>
      {/* Header Image Area */}
      <View style={styles.cardImageArea}>
        {keyword.status_message && (
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>{keyword.status_message}</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View>
            {keyword.status_label && (
              <Text style={styles.statusLabel}>{keyword.status_label}</Text>
            )}
            <Text style={styles.keywordTitle}>{keyword.name}</Text>
          </View>
          <View style={styles.keywordIcon}>
            <Text style={styles.iconEmoji}>{keyword.icon}</Text>
          </View>
        </View>
        <Text style={styles.keywordDescription}>{keyword.description}</Text>
        <View style={styles.ingredientsRow}>
          {keyword.ingredients.map((ing) => (
            <View
              key={ing.id}
              style={[
                styles.ingredientPill,
                ing.is_highlighted && styles.highlightedPill,
              ]}
            >
              {ing.is_highlighted && (
                <View style={styles.highlightDot} />
              )}
              <Text
                style={[
                  styles.ingredientText,
                  ing.is_highlighted && styles.highlightedText,
                ]}
              >
                {ing.name}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Card>
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
  characterSection: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.md,
    marginBottom: spacing['2xl'],
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 24,
  },
  boltBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  speechBubble: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderBottomLeftRadius: 0,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  characterName: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  speechText: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    lineHeight: 22,
  },
  userName: {
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
  disclaimerCard: {
    backgroundColor: colors.primaryLight,
    borderColor: `${colors.primary}30`,
    marginBottom: spacing['2xl'],
  },
  disclaimerContent: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  disclaimerText: {
    flex: 1,
  },
  disclaimerTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  disclaimerBody: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  sectionHeader: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  loader: {
    marginTop: spacing['2xl'],
  },
  keywordCard: {
    marginBottom: spacing.xl,
    padding: 0,
    overflow: 'hidden',
  },
  cardImageArea: {
    height: 128,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: spacing.md,
  },
  statusBadge: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.inverse,
  },
  cardContent: {
    padding: spacing.xl,
    marginTop: -spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: spacing.sm,
  },
  statusLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  keywordTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  keywordIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  iconEmoji: {
    fontSize: 20,
  },
  keywordDescription: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  ingredientsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  ingredientPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  highlightedPill: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: `${colors.primary}30`,
  },
  highlightDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  ingredientText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  highlightedText: {
    color: colors.primaryDark,
    fontWeight: typography.fontWeight.bold,
  },
  compactCard: {
    marginBottom: spacing.md,
    opacity: 0.9,
  },
  compactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  compactIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
});

export default HealthKeywordsScreen;
