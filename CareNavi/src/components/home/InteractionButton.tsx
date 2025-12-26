// Character interaction button for home screen footer
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Icon, IconName } from '../common';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

interface InteractionButtonProps {
  icon: IconName;
  label: string;
  onPress: () => void;
  isMain?: boolean;
}

export const InteractionButton: React.FC<InteractionButtonProps> = ({
  icon,
  label,
  onPress,
  isMain = false,
}) => {
  if (isMain) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={styles.mainContainer}
      >
        <View style={styles.mainButton}>
          <Icon name={icon} size="xl" color={colors.text.primary} />
        </View>
        <Text style={styles.mainLabel}>{label}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.container}
    >
      <View style={styles.button}>
        <Icon name={icon} size="lg" color={colors.primary} />
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
  },
  button: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  // Main button styles
  mainContainer: {
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    marginTop: -spacing.lg,
  },
  mainButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.glow,
  },
  mainLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
});

export default InteractionButton;
