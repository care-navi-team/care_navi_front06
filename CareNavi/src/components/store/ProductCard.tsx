import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Product, ProductCategory } from '../../types';

interface ProductCardProps {
  product: Product;
  onPress: (product: Product) => void;
  testID?: string;
}

const CATEGORY_EMOJI: Record<ProductCategory, string> = {
  supplements: '\ud83d\udc8a',
  wellness: '\ud83e\uddd8',
  food: '\ud83c\udf4e',
  accessories: '\ud83c\udf81',
};

const CATEGORY_LABEL: Record<ProductCategory, string> = {
  supplements: '\uc601\uc591\uc81c',
  wellness: '\uc6f0\ub2c8\uc2a4',
  food: '\uc74c\uc2dd',
  accessories: '\uc561\uc138\uc11c\ub9ac',
};

export default function ProductCard({
  product,
  onPress,
  testID,
}: ProductCardProps) {
  const formatPrice = (price: number): string => {
    return price.toLocaleString('ko-KR') + '\uc6d0';
  };

  return (
    <TouchableOpacity
      testID={testID}
      style={styles.container}
      onPress={() => onPress(product)}
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
            <Text style={styles.placeholderEmoji}>
              {CATEGORY_EMOJI[product.category]}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>
            {CATEGORY_LABEL[product.category]}
          </Text>
        </View>

        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>

        {product.description && (
          <Text style={styles.description} numberOfLines={2}>
            {product.description}
          </Text>
        )}

        <Text style={styles.price}>{formatPrice(product.price)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
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
    fontSize: 48,
  },
  content: {
    padding: 12,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E8F4FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 6,
  },
  categoryText: {
    fontSize: 10,
    color: '#4A90D9',
    fontWeight: '500',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    lineHeight: 20,
  },
  description: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    lineHeight: 16,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
});
