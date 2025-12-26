import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { ProductCategory } from '../../types';

interface CategoryFilterProps {
  selectedCategory: ProductCategory | null;
  onSelectCategory: (category: ProductCategory | null) => void;
  testID?: string;
}

const CATEGORIES: Array<{
  key: ProductCategory | null;
  label: string;
  emoji: string;
}> = [
  { key: null, label: '전체', emoji: '🏪' },
  { key: 'supplements', label: '영양제', emoji: '💊' },
  { key: 'wellness', label: '웰니스', emoji: '🧘' },
  { key: 'food', label: '음식', emoji: '🍎' },
  { key: 'accessories', label: '액세서리', emoji: '🎁' },
];

export default function CategoryFilter({
  selectedCategory,
  onSelectCategory,
  testID,
}: CategoryFilterProps) {
  return (
    <View style={styles.container} testID={testID}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CATEGORIES.map((category) => {
          const isSelected = selectedCategory === category.key;
          return (
            <TouchableOpacity
              key={category.key ?? 'all'}
              style={[
                styles.categoryButton,
                isSelected && styles.categoryButtonSelected,
              ]}
              onPress={() => onSelectCategory(category.key)}
              activeOpacity={0.7}
            >
              <Text style={styles.categoryEmoji}>{category.emoji}</Text>
              <Text
                style={[
                  styles.categoryLabel,
                  isSelected && styles.categoryLabelSelected,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  categoryButtonSelected: {
    backgroundColor: '#4A90D9',
  },
  categoryEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  categoryLabelSelected: {
    color: '#FFF',
  },
});
