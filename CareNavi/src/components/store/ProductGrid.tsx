import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import ProductCard from './ProductCard';
import { Product } from '../../types';

interface ProductGridProps {
  products: Product[];
  onProductPress: (product: Product) => void;
  loading?: boolean;
  testID?: string;
}

export default function ProductGrid({
  products,
  onProductPress,
  loading = false,
  testID,
}: ProductGridProps) {
  if (loading) {
    return (
      <View style={styles.centerContainer} testID={testID}>
        <Text style={styles.loadingText}>로딩 중...</Text>
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View style={styles.centerContainer} testID={testID}>
        <Text style={styles.emptyEmoji}>🔍</Text>
        <Text style={styles.emptyText}>상품이 없습니다</Text>
        <Text style={styles.emptySubtext}>
          다른 카테고리를 선택하거나 검색어를 변경해보세요
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      testID={testID}
      data={products}
      renderItem={({ item }) => (
        <ProductCard
          product={item}
          onPress={onProductPress}
          testID={`product-${item.id}`}
        />
      )}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
