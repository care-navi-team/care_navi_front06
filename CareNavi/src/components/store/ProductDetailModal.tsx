import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Image,
  ScrollView,
  Linking,
} from 'react-native';
import { Product, ProductCategory } from '../../types';

interface ProductDetailModalProps {
  product: Product | null;
  visible: boolean;
  onClose: () => void;
  testID?: string;
}

const CATEGORY_LABEL: Record<ProductCategory, string> = {
  supplements: '영양제',
  wellness: '웰니스',
  food: '음식',
  accessories: '액세서리',
};

const CATEGORY_EMOJI: Record<ProductCategory, string> = {
  supplements: '💊',
  wellness: '🧘',
  food: '🍎',
  accessories: '🎁',
};

export default function ProductDetailModal({
  product,
  visible,
  onClose,
  testID,
}: ProductDetailModalProps) {
  if (!product) return null;

  const formatPrice = (price: number): string => {
    return price.toLocaleString('ko-KR') + '원';
  };

  const handlePurchase = () => {
    // In a real app, this would navigate to a purchase flow or external link
    // For now, we'll just close the modal
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container} testID={testID}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>상품 상세</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.imageContainer}>
            {product.image_url ? (
              <Image
                source={{ uri: product.image_url }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderEmoji}>
                  {CATEGORY_EMOJI[product.category]}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.detailSection}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {CATEGORY_EMOJI[product.category]} {CATEGORY_LABEL[product.category]}
              </Text>
            </View>

            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productPrice}>{formatPrice(product.price)}</Text>

            {product.description && (
              <View style={styles.descriptionSection}>
                <Text style={styles.sectionTitle}>상품 설명</Text>
                <Text style={styles.descriptionText}>{product.description}</Text>
              </View>
            )}

            {product.condition_keywords && product.condition_keywords.length > 0 && (
              <View style={styles.keywordsSection}>
                <Text style={styles.sectionTitle}>관련 컨디션</Text>
                <View style={styles.keywordsContainer}>
                  {product.condition_keywords.map((keyword, index) => (
                    <View key={index} style={styles.keywordTag}>
                      <Text style={styles.keywordText}>#{keyword}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.purchaseButton}
            onPress={handlePurchase}
            activeOpacity={0.8}
          >
            <Text style={styles.purchaseButtonText}>구매하기</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontSize: 20,
    color: '#333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F5F5F5',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F4F8',
  },
  placeholderEmoji: {
    fontSize: 80,
  },
  detailSection: {
    padding: 20,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F4FD',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 14,
    color: '#4A90D9',
    fontWeight: '500',
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FF6B35',
    marginBottom: 24,
  },
  descriptionSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  keywordsSection: {
    marginBottom: 24,
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  keywordTag: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  keywordText: {
    fontSize: 14,
    color: '#666',
  },
  footer: {
    padding: 16,
    paddingBottom: 34,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  purchaseButton: {
    backgroundColor: '#FF6B35',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  purchaseButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
