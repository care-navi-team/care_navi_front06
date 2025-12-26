import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import SearchBar from '../components/store/SearchBar';
import CategoryFilter from '../components/store/CategoryFilter';
import ProductGrid from '../components/store/ProductGrid';
import ProductDetailModal from '../components/store/ProductDetailModal';
import RecommendationSection from '../components/store/RecommendationSection';
import { useProductStore } from '../stores/useProductStore';
import { useRecommendationStore } from '../stores/useRecommendationStore';
import { useAuthStore } from '../stores/useAuthStore';
import { Product, ProductRecommendation } from '../types';

export default function StoreScreen() {
  const { session } = useAuthStore();
  const {
    products,
    selectedCategory,
    searchQuery,
    isLoading,
    selectedProduct,
    setSelectedCategory,
    setSearchQuery,
    fetchProducts,
    setSelectedProduct,
    getFilteredProducts,
  } = useProductStore();

  const {
    recommendations,
    isLoading: recLoading,
    fetchTodayRecommendations,
    trackClick,
  } = useRecommendationStore();

  const [showDetail, setShowDetail] = useState(false);

  // Fetch products on mount and when category changes
  useEffect(() => {
    fetchProducts({ category: selectedCategory ?? undefined });
  }, [selectedCategory, fetchProducts]);

  // Fetch today's recommendations
  useEffect(() => {
    if (session?.user?.id) {
      fetchTodayRecommendations(session.user.id);
    }
  }, [session?.user?.id, fetchTodayRecommendations]);

  const handleProductPress = useCallback(
    (product: Product) => {
      setSelectedProduct(product);
      setShowDetail(true);
    },
    [setSelectedProduct]
  );

  const handleRecommendationPress = useCallback(
    async (recommendation: ProductRecommendation) => {
      // Track click
      await trackClick(recommendation.id);

      if (recommendation.product) {
        setSelectedProduct(recommendation.product);
        setShowDetail(true);
      }
    },
    [trackClick, setSelectedProduct]
  );

  const handleCloseDetail = useCallback(() => {
    setShowDetail(false);
    setSelectedProduct(null);
  }, [setSelectedProduct]);

  const filteredProducts = getFilteredProducts();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>스토어</Text>
        <Text style={styles.headerSubtitle}>건강 상품 둘러보기</Text>
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="상품 검색"
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* AI Recommendations */}
        <RecommendationSection
          recommendations={recommendations}
          onRecommendationPress={handleRecommendationPress}
          loading={recLoading}
        />

        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <ProductGrid
          products={filteredProducts}
          onProductPress={handleProductPress}
          loading={isLoading}
        />
      </ScrollView>

      <ProductDetailModal
        product={selectedProduct}
        visible={showDetail}
        onClose={handleCloseDetail}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
});
