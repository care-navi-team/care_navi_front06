import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';
import Icon, { IconName } from './Icon';

interface HeaderAction {
  icon: IconName;
  onPress: () => void;
  badge?: boolean;
}

interface HeaderProps {
  title?: string;
  leftAction?: HeaderAction;
  rightActions?: HeaderAction[];
  transparent?: boolean;
  style?: ViewStyle;
}

const HeaderButton: React.FC<HeaderAction> = ({ icon, onPress, badge }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    style={styles.headerButton}
  >
    <Icon name={icon} size="md" color={colors.text.primary} />
    {badge && <View style={styles.badge} />}
  </TouchableOpacity>
);

export const Header: React.FC<HeaderProps> = ({
  title,
  leftAction,
  rightActions = [],
  transparent = false,
  style,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top + spacing.md,
            backgroundColor: transparent ? 'transparent' : colors.background,
          },
          style,
        ]}
      >
        <View style={styles.content}>
          {/* Left Action */}
          <View style={styles.leftSection}>
            {leftAction ? (
              <HeaderButton {...leftAction} />
            ) : (
              <View style={styles.placeholder} />
            )}
          </View>

          {/* Title */}
          {title && (
            <View style={styles.titleSection}>
              <Text style={styles.title} numberOfLines={1}>
                {title}
              </Text>
            </View>
          )}

          {/* Right Actions */}
          <View style={styles.rightSection}>
            {rightActions.map((action, index) => (
              <HeaderButton key={index} {...action} />
            ))}
          </View>
        </View>
      </View>
    </>
  );
};

// Simple back header variant
interface BackHeaderProps {
  title: string;
  onBack: () => void;
  rightActions?: HeaderAction[];
}

export const BackHeader: React.FC<BackHeaderProps> = ({
  title,
  onBack,
  rightActions,
}) => (
  <Header
    title={title}
    leftAction={{ icon: 'back', onPress: onBack }}
    rightActions={rightActions}
  />
);

// Close header variant
interface CloseHeaderProps {
  title: string;
  onClose: () => void;
}

export const CloseHeader: React.FC<CloseHeaderProps> = ({ title, onClose }) => (
  <Header
    title={title}
    leftAction={{ icon: 'close', onPress: onClose }}
  />
);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  titleSection: {
    flex: 2,
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.sm,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  headerButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  badge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.background,
  },
  placeholder: {
    width: 48,
    height: 48,
  },
});

export default Header;
