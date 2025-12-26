import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { ProductRecommendation } from '../../types';

interface RecommendationCardProps {
  recommendation: ProductRecommendation;
  onPress: (recommendation: ProductRecommendation) => void;
  testID?: string;
}

export default function RecommendationCard({
  recommendation,
  onPress,
  testID,
}: RecommendationCardProps) {
  const product = recommendation.product;

  if (!product) return null;

  const formatPrice = (price: number): string => {
    return price.toLocaleString('ko-KR') + '원';
  };

  return (
    <TouchableOpacity
      testID={testID}
      style={styles.container}
      onPress={() => onPress(recommendation)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        {product.image_url ? (
          <Image
            source={{ uri: product.image_url }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderEmoji}>✨</Text>
          </View>
        )}
        <View style={styles.aiTag}>
          <Text style={styles.aiTagText}>AI 추천</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.productName} numberOfLines={1}>
          {product.name}
        </Text>

        {recommendation.match_reason && (
          <Text style={styles.matchReason} numberOfLines={2}>
            {recommendation.match_reason}
          </Text>
        )}

        <View style={styles.footer}>
          <Text style={styles.price}>{formatPrice(product.price)}</Text>
          {recommendation.is_clicked && (
            <Text style={styles.clickedBadge}>조회함</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 160,
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: 120,
    backgroundColor: '#F5F5F5',
    position: 'relative',
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
    backgroundColor: '#FFF3E0',
  },
  placeholderEmoji: {
    fontSize: 32,
  },
  aiTag: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  aiTagText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
  },
  content: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  matchReason: {
    fontSize: 12,
    color: '#FF6B35',
    marginBottom: 8,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  clickedBadge: {
    fontSize: 10,
    color: '#999',
  },
});
