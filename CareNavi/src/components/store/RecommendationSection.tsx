import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import RecommendationCard from './RecommendationCard';
import { ProductRecommendation } from '../../types';

interface RecommendationSectionProps {
  recommendations: ProductRecommendation[];
  onRecommendationPress: (recommendation: ProductRecommendation) => void;
  loading?: boolean;
  testID?: string;
}

export default function RecommendationSection({
  recommendations,
  onRecommendationPress,
  loading = false,
  testID,
}: RecommendationSectionProps) {
  if (loading) {
    return (
      <View style={styles.container} testID={testID}>
        <Text style={styles.title}>AI 추천 상품</Text>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>추천 상품 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.header}>
        <Text style={styles.title}>🎯 AI 추천 상품</Text>
        <Text style={styles.subtitle}>오늘 컨디션에 맞는 추천이에요</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {recommendations.map((recommendation) => (
          <RecommendationCard
            key={recommendation.id}
            recommendation={recommendation}
            onPress={onRecommendationPress}
            testID={`rec-${recommendation.id}`}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    paddingVertical: 16,
    marginBottom: 8,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
  },
});
