// Speech bubble component for character messages
import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Animated } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../theme';

interface SpeechBubbleProps {
  message: string;
  subMessage?: string;
  animated?: boolean;
  style?: ViewStyle;
  arrowPosition?: 'top' | 'bottom';
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  message,
  subMessage,
  animated = false,
  style,
  arrowPosition = 'top',
}) => {
  const bounceAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (animated) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -4,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [animated, bounceAnim]);

  const content = (
    <View style={[styles.container, style]}>
      {arrowPosition === 'top' && <View style={styles.arrowTop} />}
      <View style={styles.bubble}>
        <Text style={styles.message}>{message}</Text>
        {subMessage && (
          <Text style={styles.subMessage}>{subMessage}</Text>
        )}
      </View>
      {arrowPosition === 'bottom' && <View style={styles.arrowBottom} />}
    </View>
  );

  if (animated) {
    return (
      <Animated.View
        style={{
          transform: [{ translateY: bounceAnim }],
        }}
      >
        {content}
      </Animated.View>
    );
  }

  return content;
};

// Compact speech bubble variant for inline use
interface CompactSpeechBubbleProps {
  message: string;
  userName?: string;
  style?: ViewStyle;
}

export const CompactSpeechBubble: React.FC<CompactSpeechBubbleProps> = ({
  message,
  userName,
  style,
}) => {
  return (
    <View style={[styles.compactContainer, style]}>
      <View style={styles.compactBubble}>
        <Text style={styles.compactMessage}>
          {userName && (
            <Text style={styles.userName}>{userName}</Text>
          )}
          {userName && ' '}
          {message}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    maxWidth: '90%',
  },
  bubble: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  message: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    textAlign: 'center',
    lineHeight: 22,
  },
  subMessage: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  arrowTop: {
    width: 16,
    height: 16,
    backgroundColor: colors.surface,
    transform: [{ rotate: '45deg' }],
    marginBottom: -8,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: colors.border,
    zIndex: 1,
  },
  arrowBottom: {
    width: 16,
    height: 16,
    backgroundColor: colors.surface,
    transform: [{ rotate: '45deg' }],
    marginTop: -8,
    borderBottomWidth: 1,
    borderRightWidth: 1,
    borderColor: colors.border,
    zIndex: 1,
  },
  // Compact variant
  compactContainer: {
    flex: 1,
  },
  compactBubble: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderBottomLeftRadius: 0,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  compactMessage: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    lineHeight: 22,
  },
  userName: {
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
});

export default SpeechBubble;
