import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, borderRadius, shadows, spacing } from '../../theme';

type CardVariant = 'default' | 'elevated' | 'outlined' | 'glass';

interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: keyof typeof spacing | number;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'lg',
  style,
}) => {
  const paddingValue = typeof padding === 'number' ? padding : spacing[padding];

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'elevated':
        return {
          backgroundColor: colors.surface,
          ...shadows.lg,
        };
      case 'outlined':
        return {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        };
      case 'glass':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderWidth: 1,
          borderColor: colors.borderLight,
          ...shadows.sm,
        };
      case 'default':
      default:
        return {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
          ...shadows.sm,
        };
    }
  };

  return (
    <View
      style={[
        styles.card,
        getVariantStyle(),
        { padding: paddingValue },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
});

export default Card;
